// The script runs as its own process, so it loads `.env` itself.
import "dotenv/config";

import { stdin, stdout } from "node:process";

import { auth } from "../lib/auth";
import prisma from "../lib/prisma";

const ENTER = ["\r", "\n"];
const BACKSPACE = ["\u007f", "\b"];
const INTERRUPT = "\u0003"; // Ctrl-C

/**
 * A line reader that can stop echoing what is typed, so a password never shows
 * up on screen or in a screen share.
 *
 * `readline` cannot do this: it always echoes, and the usual workaround of
 * replacing its `_writeToOutput` method stopped working when Node made the
 * terminal internals private. Reading the keystrokes here keeps a single
 * listener on stdin — two of them would race over the same buffered input.
 */
function createPrompt() {
  const isTerminal = Boolean(stdin.isTTY);

  stdin.setEncoding("utf8");
  if (isTerminal) stdin.setRawMode(true);
  stdin.resume();

  // Lines that arrived before anything asked for them, oldest first.
  const pending: string[] = [];
  let waiting: ((line: string) => void) | null = null;
  let typed = "";
  let echoing = true;

  function show(text: string) {
    // Without a terminal nothing was echoed in the first place.
    if (isTerminal && echoing) stdout.write(text);
  }

  function finishLine() {
    const line = typed;
    typed = "";

    if (waiting) {
      const resolve = waiting;
      waiting = null;
      resolve(line);
    } else {
      pending.push(line);
    }
  }

  stdin.on("data", (chunk: string) => {
    for (const char of chunk) {
      if (ENTER.includes(char)) {
        if (isTerminal) stdout.write("\n");
        finishLine();
      } else if (char === INTERRUPT) {
        if (isTerminal) stdout.write("\n");
        process.exit(130);
      } else if (BACKSPACE.includes(char)) {
        if (typed) {
          typed = typed.slice(0, -1);
          // Step back, paint over the character, step back again.
          show("\b \b");
        }
      } else if (char >= " ") {
        typed += char;
        show(char);
      }
    }
  });

  return {
    ask(query: string, { hidden = false } = {}) {
      stdout.write(query);
      echoing = !hidden;

      const buffered = pending.shift();
      const answer =
        buffered !== undefined
          ? Promise.resolve(buffered)
          : new Promise<string>((resolve) => {
              waiting = resolve;
            });

      return answer.finally(() => {
        echoing = true;
      });
    },
    close() {
      if (isTerminal) stdin.setRawMode(false);
      stdin.pause();
    },
  };
}

async function main() {
  const prompt = createPrompt();

  try {
    const email = (await prompt.ask("Email: ")).trim().toLowerCase();
    const name = (await prompt.ask("Nombre: ")).trim();

    if (!email.includes("@")) throw new Error("Eso no es un email.");

    const password = await prompt.ask("Contraseña (8 caracteres o más): ", {
      hidden: true,
    });
    if (password.length < 8) throw new Error("La contraseña es muy corta.");

    const confirmation = await prompt.ask("Repite la contraseña: ", {
      hidden: true,
    });
    if (password !== confirmation) {
      throw new Error("Las contraseñas no coinciden.");
    }

    const ctx = await auth.$context;

    if (await ctx.internalAdapter.findUserByEmail(email)) {
      throw new Error(`${email} ya tiene una cuenta.`);
    }

    // Hashed before the user row exists, so a failure here leaves nothing behind.
    const hash = await ctx.password.hash(password);

    const user = await ctx.internalAdapter.createUser({
      email,
      name: name || email.split("@")[0],
      // Nobody emails this account, so there is no verification link to follow.
      emailVerified: true,
    });

    /**
     * The password lives on an account row rather than on the user, which is
     * how Better Auth keeps room for social logins later. `credential` is the
     * provider it looks for when signing in with an email and a password.
     */
    await ctx.internalAdapter.linkAccount({
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: hash,
    });

    console.log(`Listo: ${email}. Entra en /login.`);
  } finally {
    prompt.close();
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
