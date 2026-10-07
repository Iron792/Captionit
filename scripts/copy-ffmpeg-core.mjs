import fs from "node:fs";
import path from "node:path";

const source = path.resolve(
  "node_modules/@ffmpeg/core/dist/umd"
);

const destination = path.resolve(
  "public/ffmpeg-core"
);

fs.mkdirSync(destination, {
  recursive: true,
});

const files = [
  "ffmpeg-core.js",
  "ffmpeg-core.wasm",
  "ffmpeg-core.worker.js",
];

for (const file of files) {
  const sourceFile = path.join(source, file);
  const destinationFile = path.join(destination, file);

  if (!fs.existsSync(sourceFile)) {
    throw new Error(
      `FFmpeg core file not found: ${sourceFile}`
    );
  }

  fs.copyFileSync(
    sourceFile,
    destinationFile
  );

  console.log(`Copied ${file}`);
}

console.log("FFmpeg core copied successfully.");