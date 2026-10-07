"use client";

import type { SubtitleSegment } from "@/types/subtitle";

type SubtitleTimelineProps = {
  segments: SubtitleSegment[];
  current: number;
  onSeek: (time: number) => void;
  onChange: (segments: SubtitleSegment[]) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export default function SubtitleTimeline({
  segments,
  current,
  onSeek,
  onChange,
  zoom,
  setZoom,
  undo,
  redo,
  canUndo,
  canRedo,
}: SubtitleTimelineProps) {
  const lastEnd =
    segments.length > 0
      ? Math.max(
          ...segments.map(
            (segment) => segment.end
          )
        )
      : 10;

  const duration = Math.max(
    lastEnd,
    current,
    1
  );

  const updateSegment = (
    id: string,
    changes: Partial<SubtitleSegment>
  ) => {
    onChange(
      segments.map((segment) =>
        segment.id === id
          ? {
              ...segment,
              ...changes,
            }
          : segment
      )
    );
  };

  const deleteSegment = (id: string) => {
    onChange(
      segments.filter(
        (segment) => segment.id !== id
      )
    );
  };

  const splitSegment = (
    segment: SubtitleSegment
  ) => {
    const midpoint =
      (segment.start + segment.end) / 2;

    if (
      midpoint <= segment.start ||
      midpoint >= segment.end
    ) {
      return;
    }

    const words = segment.text.trim().split(/\s+/);

    const middle =
      Math.max(
        1,
        Math.floor(words.length / 2)
      );

    const firstText =
      words.slice(0, middle).join(" ");

    const secondText =
      words.slice(middle).join(" ");

    const first: SubtitleSegment = {
      ...segment,
      id: crypto.randomUUID(),
      end: midpoint,
      text: firstText || segment.text,
    };

    const second: SubtitleSegment = {
      ...segment,
      id: crypto.randomUUID(),
      start: midpoint,
      text: secondText || segment.text,
    };

    onChange([
      ...segments.filter(
        (item) => item.id !== segment.id
      ),
      first,
      second,
    ].sort((a, b) => a.start - b.start));
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-3">
      {/* Toolbar */}
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Undo
        </button>

        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Redo
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-zinc-500">
            Zoom
          </span>

          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={zoom}
            onChange={(event) =>
              setZoom(
                Number(event.target.value)
              )
            }
            className="w-24"
          />

          <span className="w-7 text-right text-xs text-zinc-500">
            {zoom}x
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative overflow-x-auto rounded-xl border border-white/5 bg-black/30">
        <div
          className="relative h-24 min-w-full"
          style={{
            width: `${Math.max(
              100,
              zoom * 100
            )}%`,
          }}
          onClick={(event) => {
            const rect =
              event.currentTarget.getBoundingClientRect();

            const percentage =
              (event.clientX - rect.left) /
              rect.width;

            const nextTime =
              percentage * duration;

            onSeek(
              Math.max(
                0,
                Math.min(
                  duration,
                  nextTime
                )
              )
            );
          }}
        >
          {/* Time markers */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between px-2 text-[9px] text-zinc-700">
            <span>0s</span>

            <span>
              {(duration / 2).toFixed(1)}s
            </span>

            <span>
              {duration.toFixed(1)}s
            </span>
          </div>

          {/* Playhead */}
          <div
            className="pointer-events-none absolute bottom-0 top-0 z-30 w-px bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,.8)]"
            style={{
              left: `${Math.min(
                100,
                Math.max(
                  0,
                  (current / duration) * 100
                )
              )}%`,
            }}
          />

          {/* Caption blocks */}
          {segments.map((segment) => {
            const left =
              (segment.start / duration) *
              100;

            const width =
              ((segment.end -
                segment.start) /
                duration) *
              100;

            return (
              <div
                key={segment.id}
                className="absolute bottom-3 top-7"
                style={{
                  left: `${left}%`,
                  width: `${Math.max(
                    width,
                    3
                  )}%`,
                }}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSeek(segment.start);
                  }}
                  className="h-full w-full overflow-hidden rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 text-left transition hover:border-cyan-300/50 hover:bg-cyan-300/20"
                >
                  <span className="block truncate text-[10px] text-white">
                    {segment.text}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Caption controls */}
      {segments.length > 0 && (
        <div className="mt-3 max-h-32 space-y-1 overflow-y-auto">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2 py-1.5"
            >
              <button
                type="button"
                onClick={() =>
                  onSeek(segment.start)
                }
                className="w-14 shrink-0 text-left text-[10px] tabular-nums text-cyan-300"
              >
                {segment.start.toFixed(1)}s
              </button>

              <input
                value={segment.text}
                onChange={(event) =>
                  updateSegment(
                    segment.id,
                    {
                      text: event.target.value,
                    }
                  )
                }
                className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none"
              />

              <span className="shrink-0 text-[10px] text-zinc-600">
                {segment.end.toFixed(1)}s
              </span>

              <button
                type="button"
                onClick={() =>
                  splitSegment(segment)
                }
                className="shrink-0 text-[10px] text-zinc-500 transition hover:text-white"
              >
                Split
              </button>

              <button
                type="button"
                onClick={() =>
                  deleteSegment(segment.id)
                }
                className="shrink-0 text-[10px] text-red-400 transition hover:text-red-300"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}