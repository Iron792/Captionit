import type {
  SubtitleAnimation,
  SubtitleSegment,
  SubtitleStyle,
} from "@/types/subtitle";

import { toAss } from "@/lib/subtitles/ass";

type ProgressCallback = (
  progress: number
) => void;

let ffmpegInstance:
  | import("@ffmpeg/ffmpeg").FFmpeg
  | null = null;

async function getFFmpeg(
  onProgress?: ProgressCallback
) {
  if (!ffmpegInstance) {
    const {
      FFmpeg,
    } = await import(
      "@ffmpeg/ffmpeg"
    );

    const ffmpeg =
      new FFmpeg();

    await ffmpeg.load({
      coreURL:
        "/ffmpeg-core/ffmpeg-core.js",
      wasmURL:
        "/ffmpeg-core/ffmpeg-core.wasm",
    });

    ffmpegInstance =
      ffmpeg;
  }

  const ffmpeg =
    ffmpegInstance;

  const progressHandler = ({
    progress,
  }: {
    progress: number;
  }) => {
    onProgress?.(
      Math.max(
        0,
        Math.min(
          100,
          progress * 100
        )
      )
    );
  };

  ffmpeg.on(
    "progress",
    progressHandler
  );

  return {
    ffmpeg,

    cleanup() {
      ffmpeg.off(
        "progress",
        progressHandler
      );
    },
  };
}

export async function renderCaptionedVideo(
  file: File,
  segments: SubtitleSegment[],
  style: SubtitleStyle,
  animation: SubtitleAnimation,
  onProgress?: ProgressCallback
) {
  const {
    fetchFile,
  } = await import(
    "@ffmpeg/util"
  );

  const {
    ffmpeg,
    cleanup,
  } = await getFFmpeg(
    onProgress
  );

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ||
    "mp4";

  const inputName =
    `caption-input.${extension}`;

  const subtitleName =
    "captions.ass";

  const outputName =
    "caption-output.mp4";

  try {
    onProgress?.(2);

    await ffmpeg.writeFile(
      inputName,
      await fetchFile(file)
    );

    onProgress?.(5);

    const ass =
      toAss(
        segments,
        style,
        animation
      );

    await ffmpeg.writeFile(
      subtitleName,
      new TextEncoder().encode(
        ass
      )
    );

    onProgress?.(10);

    await ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      `subtitles=${subtitleName}`,
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-crf",
      "23",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      outputName,
    ]);

    onProgress?.(98);

    const output =
      await ffmpeg.readFile(
        outputName
      );

    let bytes: Uint8Array;

    if (
      output instanceof Uint8Array
    ) {
      bytes = output;
    } else if (
      output instanceof ArrayBuffer
    ) {
      bytes =
        new Uint8Array(
          output
        );
    } else {
      throw new Error(
        "FFmpeg returned an unexpected output format."
      );
    }

    onProgress?.(100);

    return new Blob(
      [bytes],
      {
        type: "video/mp4",
      }
    );
  } finally {
    cleanup();

    try {
      await ffmpeg.deleteFile(
        inputName
      );
    } catch {}

    try {
      await ffmpeg.deleteFile(
        subtitleName
      );
    } catch {}

    try {
      await ffmpeg.deleteFile(
        outputName
      );
    } catch {}
  }
}