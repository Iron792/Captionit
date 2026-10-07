import type {
  SubtitleSegment,
} from "@/types/subtitle";

export function demoTranscript(
  duration: number
): SubtitleSegment[] {
  const text = [
    "Today we are building something amazing",
    "Turn ordinary videos into scroll stopping stories",
    "Style every word exactly the way you want",
    "Then export a polished final video",
  ];

  const span = Math.max(
    2,
    duration / (text.length + 1)
  );

  return text.map((t, i) => {
    const start = Math.min(
      Math.max(0, duration - 1),
      i * span + 0.5
    );

    const end = Math.min(
      duration,
      start + span * 0.82
    );

    const words = t.split(/\s+/);

    const step =
      (end - start) / words.length;

    return {
      id: `demo-${i}`,
      start,
      end,
      text: t,

      words: words.map(
        (word, j) => ({
          text: word,
          start:
            start + j * step,
          end:
            start + (j + 1) * step,
        })
      ),
    };
  });
}