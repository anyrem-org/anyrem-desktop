import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildDir = path.join(root, "build");
const svg = fs.readFileSync(path.join(buildDir, "icon.svg"));

const sizes = [
  ["icon.png", 1024],
  ["icons/256x256.png", 256],
  ["icons/128x128.png", 128],
  ["icons/64x64.png", 64],
  ["icons/32x32.png", 32],
  ["icons/16x16.png", 16],
];

for (const [name, size] of sizes) {
  const out = path.join(buildDir, name);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp(svg).resize(size, size).png().toFile(out);
}

console.log("Generated icons in build/");
