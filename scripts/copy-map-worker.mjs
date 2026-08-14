// Puts maplibre-gl's worker where the browser can actually fetch it.
//
// maplibre-gl works out its worker URL from its own `import.meta.url`, swapping
// the filename. Bundled by Next, that URL points at a build chunk, so the guess
// lands on a file that was never emitted: the worker fails, the raster relief
// still draws, and no street ever loads. `LocationMap.tsx` points `setWorkerUrl`
// at the copy this script makes instead.
//
// It runs from `postinstall`, so the copy always matches the installed version
// rather than drifting out of date the next time maplibre-gl is upgraded.
import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

// The worker is a module and imports the shared chunk beside it, so the two
// have to land in the same directory.
const files = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];

const source = dirname(require.resolve("maplibre-gl/dist/maplibre-gl.mjs"));
const target = join(process.cwd(), "public", "maplibre");

await mkdir(target, { recursive: true });

for (const file of files) {
  await copyFile(join(source, file), join(target, file));
}

console.log(`Copied ${files.length} maplibre-gl worker files to public/maplibre.`);
