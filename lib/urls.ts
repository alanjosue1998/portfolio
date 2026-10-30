/**
 * `mailto:` and `tel:` have no `//`, so a bare address has to be recognised
 * before it is treated as a web address. Anything without a scheme is assumed
 * to be a site — typing `github.com/me` into the form is the common case.
 *
 * Whatever this returns is rendered into an `href` on the public site, which
 * makes it the one function in the admin where a regression is a security bug.
 * It lives here rather than in `app/(admin)/admin/actions.ts` because a
 * `"use server"` file may only export Server Actions, and the tests in
 * `lib/urls.test.ts` need to reach it.
 */
export function normaliseUrl(raw: string, platform: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  if (platform === "email") {
    const address = value.replace(/^mailto:/i, "");
    // Deliberately loose: the only thing worth rejecting here is a typo that
    // could not possibly be an address.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) ? `mailto:${address}` : null;
  }

  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;

  try {
    const parsed = new URL(withScheme);
    // `https:` only. `javascript:` above all has no business being rendered
    // into an href on the public site, and `http:` either warns in the address
    // bar or gets upgraded — neither reads as credible on a public page.
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}
