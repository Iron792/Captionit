"use client";

type SubtitleSegment = {
  id: string;
  start: number;
  end: number;
  text: string;
};

type SubtitleTimelineProps = {
  subtitles?: SubtitleSegment[];
  duration?: number;
  currentTime?: number;
  onSeek?: (time: number) => void;
  onUpdate?: (subtitles: SubtitleSegment[]) => void;
};

export default function SubtitleTimeline({
  subtitles = [],
  duration = 60,
  currentTime = 0,
  onSeek,
  onUpdate,
}: SubtitleTimelineProps) {
  const safeDuration = Math.max(duration, 1);

  const updateSubtitle = (
    id: string,
    changes: Partial<SubtitleSegment>
  ) => {
    onUpdate?.(
      subtitles.map((subtitle) =>
        subtitle.id === id
          ? { ...subtitle, ...changes }
          : subtitle
      )
    );
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">
          Subtitle Timeline
        </h3>

        <span className="text-xs text-white/40">
          {currentTime.toFixed(1)}s / {safeDuration.toFixed(1)}s
        </span>
      </div>

      <div
        className="relative h-28 overflow-hidden rounded-xl bg-black/40"
        onClick={(e) => {
          const rect =
            e.currentTarget.getBoundingClientRect();

          const ratio =
            (e.clientX - rect.left) / rect.width;

          onSeek?.(
            Math.max(
              0,
              Math.min(safeDuration, ratio * safeDuration)
            )
          );
        }}
      >
        <div
          className="absolute bottom-0 top-0 z-20 w-px bg-red-400"
          style={{
            left: `${(currentTime / safeDuration) * 100}%`,
          }}
        />

        {subtitles.map((subtitle) => {
          const left =
            (subtitle.start / safeDuration) * 100;

          const width =
            ((subtitle.end - subtitle.start) /
              safeDuration) *
            100;

          return (
            <button
              key={subtitle.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSeek?.(subtitle.start);
              }}
              className="absolute top-6 h-12 overflow-hidden rounded-md border border-white/20 bg-white/10 px-2 text-left text-xs text-white transition hover:bg-white/20"
              style={{
                left: `${left}%`,
                width: `${Math.max(width, 2)}%`,
              }}
            >
              <span className="block truncate">
                {subtitle.text}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        {subtitles.map((subtitle) => (
          <div
            key={subtitle.id}
            className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2"
          >
            <span className="w-12 text-xs text-white/40">
              {subtitle.start.toFixed(1)}
            </span>

            <input
              value={subtitle.text}
              onChange={(e) =>
                updateSubtitle(subtitle.id, {
                  text: e.target.value,
                })
              }
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
            />

            <span className="text-xs text-white/40">
              {subtitle.end.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}