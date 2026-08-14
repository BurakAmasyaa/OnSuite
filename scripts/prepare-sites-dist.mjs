import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = process.cwd();
const openNextDir = resolve(projectRoot, ".open-next");
const distDir = resolve(projectRoot, "dist");
const serverDir = resolve(distDir, "server");

await rm(distDir, { recursive: true, force: true });
await mkdir(serverDir, { recursive: true });
await cp(openNextDir, serverDir, { recursive: true });
await writeFile(
  resolve(serverDir, "index.js"),
  'export { default } from "./worker.js";\n',
  "utf8",
);
