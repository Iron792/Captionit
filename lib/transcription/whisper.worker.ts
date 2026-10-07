import {
  pipeline,
} from "@huggingface/transformers";

type WorkerRequest = {
  type: "transcribe";
  audio: ArrayBuffer;
};

type WordChunk = {
  text: string;
  timestamp: [number, number];
};

type WorkerResponse =
  | {
      type: "progress";
      progress: number;
      message: string;
    }
  | {
      type: "result";
      segments: Array<{
        id: string;
        start: number;
        end: number;
        text: string;
        words: Array<{
          text: string;
          start: number;
          end: number;
        }>;
      }>;
    }
  | {
      type: "error";
      message: string;
    };

type WhisperResult = {
  chunks?: WordChunk[];
};

type WhisperTranscriber = (
  audio: Float32Array,
  options: {
    return_timestamps: "word";
    chunk_length_s: number;
    stride_length_s: number;
    task: "transcribe";
  }
) => Promise<WhisperResult>;

let transcriberPromise:
  | Promise<WhisperTranscriber>
  | null = null;

const MODEL =
  "onnx-community/whisper-tiny";

function post(
  message: WorkerResponse
) {
  self.postMessage(message);
}

async function getTranscriber(): Promise<WhisperTranscriber> {
  if (!transcriberPromise) {
    transcriberPromise =
      pipeline(
        "automatic-speech-recognition",
        MODEL,
        {
          dtype: "q4",

          device:
            typeof navigator !==
              "undefined" &&
            "gpu" in navigator
              ? "webgpu"
              : "wasm",

          progress_callback:
            (info) => {
              if (
                info.status ===
                "progress"
              ) {
                post({
                  type: "progress",
                  progress:
                    info.progress ??
                    0,
                  message:
                    "Downloading Whisper model…",
                });
              }

              if (
                info.status ===
                "ready"
              ) {
                post({
                  type: "progress",
                  progress: 100,
                  message:
                    "Whisper model ready",
                });
              }
            },
        }
      ) as unknown as Promise<WhisperTranscriber>;
  }

  return transcriberPromise;
}

function readWav(
  buffer: ArrayBuffer
): Float32Array {
  const view =
    new DataView(buffer);

  const readString = (
    offset: number,
    length: number
  ) => {
    let value = "";

    for (
      let i = 0;
      i < length;
      i++
    ) {
      value += String.fromCharCode(
        view.getUint8(
          offset + i
        )
      );
    }

    return value;
  };

  if (
    readString(0, 4) !== "RIFF" ||
    readString(8, 4) !== "WAVE"
  ) {
    throw new Error(
      "Invalid WAV audio."
    );
  }

  let offset = 12;

  let channels = 1;
  let sampleRate = 16000;
  let bitsPerSample = 16;
  let dataOffset = -1;
  let dataSize = 0;

  while (
    offset + 8 <=
    view.byteLength
  ) {
    const chunkId =
      readString(offset, 4);

    const chunkSize =
      view.getUint32(
        offset + 4,
        true
      );

    if (
      offset + 8 + chunkSize >
      view.byteLength
    ) {
      break;
    }

    if (chunkId === "fmt ") {
      const audioFormat =
        view.getUint16(
          offset + 8,
          true
        );

      channels =
        view.getUint16(
          offset + 10,
          true
        );

      sampleRate =
        view.getUint32(
          offset + 12,
          true
        );

      bitsPerSample =
        view.getUint16(
          offset + 22,
          true
        );

      if (
        audioFormat !== 1 &&
        audioFormat !== 3
      ) {
        throw new Error(
          "Unsupported WAV format."
        );
      }
    }

    if (
      chunkId === "data"
    ) {
      dataOffset =
        offset + 8;

      dataSize =
        Math.min(
          chunkSize,
          view.byteLength -
            dataOffset
        );

      break;
    }

    offset +=
      8 + chunkSize;

    if (
      offset % 2 !== 0
    ) {
      offset++;
    }
  }

  if (
    dataOffset < 0 ||
    dataSize <= 0
  ) {
    throw new Error(
      "WAV audio data not found."
    );
  }

  if (
    sampleRate !== 16000
  ) {
    throw new Error(
      `Expected 16kHz WAV, got ${sampleRate}Hz.`
    );
  }

  const bytesPerSample =
    bitsPerSample / 8;

  const frameCount =
    Math.floor(
      dataSize /
        (bytesPerSample *
          channels)
    );

  const output =
    new Float32Array(
      frameCount
    );

  for (
    let frame = 0;
    frame < frameCount;
    frame++
  ) {
    let sum = 0;

    for (
      let channel = 0;
      channel < channels;
      channel++
    ) {
      const sampleOffset =
        dataOffset +
        (frame * channels +
          channel) *
          bytesPerSample;

      let sample = 0;

      if (
        bitsPerSample === 16
      ) {
        sample =
          view.getInt16(
            sampleOffset,
            true
          ) / 32768;
      } else if (
        bitsPerSample === 32
      ) {
        sample =
          view.getFloat32(
            sampleOffset,
            true
          );
      }

      sum += sample;
    }

    output[frame] =
      sum / channels;
  }

  return output;
}

function makeSegments(
  chunks: WordChunk[]
) {
  const segments: Array<{
    id: string;
    start: number;
    end: number;
    text: string;
    words: Array<{
      text: string;
      start: number;
      end: number;
    }>;
  }> = [];

  let current:
    | {
        start: number;
        end: number;
        words: Array<{
          text: string;
          start: number;
          end: number;
        }>;
      }
    | null = null;

  const MAX_WORDS = 7;
  const MAX_DURATION = 3.4;

  for (const chunk of chunks) {
    const rawText =
      chunk.text?.trim();

    if (!rawText) {
      continue;
    }

    const start =
      Number(
        chunk.timestamp?.[0]
      );

    const end =
      Number(
        chunk.timestamp?.[1]
      );

    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      end <= start
    ) {
      continue;
    }

    const word = {
      text: rawText,
      start,
      end,
    };

    if (!current) {
      current = {
        start,
        end,
        words: [word],
      };

      continue;
    }

    const duration =
      end - current.start;

    const shouldSplit =
      current.words.length >=
        MAX_WORDS ||
      duration >=
        MAX_DURATION;

    if (shouldSplit) {
      const words =
        current.words;

      segments.push({
        id: `caption-${
          segments.length + 1
        }`,
        start:
          current.start,
        end: current.end,
        text: words
          .map(
            (item) =>
              item.text
          )
          .join(" ")
          .replace(
            /\s+([,.!?])/g,
            "$1"
          ),
        words,
      });

      current = {
        start,
        end,
        words: [word],
      };
    } else {
      current.words.push(
        word
      );

      current.end = end;
    }
  }

  if (current) {
    const words =
      current.words;

    segments.push({
      id: `caption-${
        segments.length + 1
      }`,
      start:
        current.start,
      end: current.end,
      text: words
        .map(
          (item) =>
            item.text
        )
        .join(" ")
        .replace(
          /\s+([,.!?])/g,
          "$1"
        ),
      words,
    });
  }

  return segments;
}

self.addEventListener(
  "message",
  async (
    event: MessageEvent<WorkerRequest>
  ) => {
    if (
      event.data.type !==
      "transcribe"
    ) {
      return;
    }

    try {
      post({
        type: "progress",
        progress: 0,
        message:
          "Loading Whisper…",
      });

      const transcriber =
        await getTranscriber();

      post({
        type: "progress",
        progress: 100,
        message:
          "Transcribing audio…",
      });

      const audio =
        readWav(
          event.data.audio
        );

      const result =
        await transcriber(
          audio,
          {
            return_timestamps:
              "word",
            chunk_length_s: 30,
            stride_length_s: 5,
            task: "transcribe",
          }
        );

      const chunks =
        Array.isArray(
          result
        )
          ? []
          : result.chunks ??
            [];

      const segments =
        makeSegments(
          chunks
        );

      post({
        type: "progress",
        progress: 100,
        message:
          "Captions ready",
      });

      post({
        type: "result",
        segments,
      });
    } catch (error) {
      post({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Whisper transcription failed.",
      });
    }
  }
);

export {};