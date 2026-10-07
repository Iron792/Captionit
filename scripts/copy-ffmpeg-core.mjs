import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, "..");
const ffmpegDir = path.join(root, "node_modules", "@ffmpeg", "core");
const destination = path.join(root, "public", "ffmpeg");

fs.mkdirSync(destination, { recursive: true });

const files = [
  "dist/umd/ffmpeg-core.js",
  "dist/umd/ffmpeg-core.wasm",
  "dist/umd/ffmpeg-core.worker.js",
];

for (const file of files) {
  const source = path.join(ffmpegDir, file);
  const target = path.join(destination, path.basename(file));

  if (!fs.existsSync(source)) {
    console.warn(`Skipping missing FFmpeg file: ${file}`);
    continue;
  }

  fs.copyFileSync(source, target);
  console.log(`Copied ${path.basename(file)}`);
}

console.log("FFmpeg core setup completed.");