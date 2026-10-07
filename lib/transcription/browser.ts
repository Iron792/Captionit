import type {
  SubtitleSegment,
} from "@/types/subtitle";

type ProgressCallback = (
  progress: number,
  message: string
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

    ffmpeg.on(
      "progress",
      ({ progress }) => {
        onProgress?.(
          Math.min(
            25,
            progress * 25
          ),
          "Extracting audio…"
        );
      }
    );

    await ffmpeg.load({
      coreURL:
        "/ffmpeg-core/ffmpeg-core.js",
      wasmURL:
        "/ffmpeg-core/ffmpeg-core.wasm",
      workerURL:
        "/ffmpeg-core/ffmpeg-core.worker.js",
    });

    ffmpegInstance =
      ffmpeg;
  }

  return ffmpegInstance;
}

export async function transcribeVideo(
  file: File,
  onProgress?: ProgressCallback
): Promise<SubtitleSegment[]> {
  const ffmpeg =
    await getFFmpeg(
      onProgress
    );

  const {
    fetchFile,
  } = await import(
    "@ffmpeg/util"
  );

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ||
    "mp4";

  const inputName =
    `input.${extension}`;

  try {
    onProgress?.(
      2,
      "Preparing video…"
    );

    await ffmpeg.writeFile(
      inputName,
      await fetchFile(file)
    );

    onProgress?.(
      5,
      "Extracting audio…"
    );

    await ffmpeg.exec([
      "-i",
      inputName,
      "-vn",
      "-ac",
      "1",
      "-ar",
      "16000",
      "-c:a",
      "pcm_s16le",
      "audio.wav",
    ]);

    const audio =
      await ffmpeg.readFile(
        "audio.wav"
      );

    const audioBytes =
      audio instanceof Uint8Array
        ? audio
        : new Uint8Array(
            audio as ArrayBuffer
          );

    const audioBuffer =
      audioBytes.slice().buffer;

    await ffmpeg.deleteFile(
      inputName
    );

    await ffmpeg.deleteFile(
      "audio.wav"
    );

    onProgress?.(
      30,
      "Loading Whisper…"
    );

    return await new Promise(
      (
        resolve,
        reject
      ) => {
        const worker =
          new Worker(
            new URL(
              "./whisper.worker.ts",
              import.meta.url
            ),
            {
              type: "module",
            }
          );

        worker.onmessage =
          (
            event
          ) => {
            const data =
              event.data;

            if (
              data.type ===
              "progress"
            ) {
              onProgress?.(
                30 +
                  data.progress *
                    0.65,
                data.message
              );
            }

            if (
              data.type ===
              "result"
            ) {
              onProgress?.(
                100,
                "Captions ready"
              );

              worker.terminate();

              resolve(
                data.segments as SubtitleSegment[]
              );
            }

            if (
              data.type ===
              "error"
            ) {
              worker.terminate();

              reject(
                new Error(
                  data.message
                )
              );
            }
          };

        worker.onerror =
          (error) => {
            worker.terminate();

            reject(
              new Error(
                error.message ||
                  "Whisper worker failed."
              )
            );
          };

        worker.postMessage(
          {
            type: "transcribe",
            audio:
              audioBuffer,
          },
          [
            audioBuffer,
          ]
        );
      }
    );
  } catch (error) {
    try {
      await ffmpeg.deleteFile(
        inputName
      );
    } catch {}

    try {
      await ffmpeg.deleteFile(
        "audio.wav"
      );
    } catch {}

    throw error;
  }
}