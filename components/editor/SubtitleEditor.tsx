"use client";

type SubtitleSegment = {
  id: string;
  start: number;
  end: number;
  text: string;
};

type SubtitleEditorProps = {
  subtitles?: SubtitleSegment[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  onUpdate?: (subtitles: SubtitleSegment[]) => void;
};

export default function SubtitleEditor({
  subtitles = [],
  selectedId,
  onSelect,
  onUpdate,
}: SubtitleEditorProps) {
  const update = (
    id: string,
    changes: Partial<SubtitleSegment>
  ) => {
    onUpdate?.(
      subtitles.map((item) =>
        item.id === id
          ? { ...item, ...changes }
          : item
      )
    );
  };

  const addSubtitle = () => {
    const last = subtitles[subtitles.length - 1];

    const start = last ? last.end : 0;

    const newSubtitle: SubtitleSegment = {
      id: crypto.randomUUID(),
      start,
      end: start + 2,
      text: "New subtitle",
    };

    onUpdate?.([...subtitles, newSubtitle]);
  };

  const deleteSubtitle = (id: string) => {
    onUpdate?.(
      subtitles.filter((item) => item.id !== id)
    );
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-white">
          Captions
        </h3>

        <button
          type="button"
          onClick={addSubtitle}
          className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black transition hover:bg-white/90"
        >
          + Add
        </button>
      </div>

      <div className="space-y-3">
        {subtitles.map((subtitle) => {
          const selected = subtitle.id === selectedId;

          return (
            <div
              key={subtitle.id}
              onClick={() => onSelect?.(subtitle.id)}
              className={`rounded-xl border p-3 transition ${
                selected
                  ? "border-white/30 bg-white/[0.08]"
                  : "border-white/5 bg-white/[0.02]"
              }`}
            >
              <textarea
                value={subtitle.text}
                onChange={(e) =>
                  update(subtitle.id, {
                    text: e.target.value,
                  })
                }
                rows={2}
                className="w-full resize-none bg-transparent text-sm text-white outline-none"
              />

              <div className="mt-3 flex items-center gap-2">
                <label className="text-xs text-white/40">
                  Start
                </label>

                <input
                  type="number"
                  step="0.1"
                  value={subtitle.start}
                  onChange={(e) =>
                    update(subtitle.id, {
                      start: Number(e.target.value),
                    })
                  }
                  className="w-20 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-xs text-white"
                />

                <label className="ml-2 text-xs text-white/40">
                  End
                </label>

                <input
                  type="number"
                  step="0.1"
                  value={subtitle.end}
                  onChange={(e) =>
                    update(subtitle.id, {
                      end: Number(e.target.value),
                    })
                  }
                  className="w-20 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-xs text-white"
                />

                <button
                  type="button"
                  onClick={() =>
                    deleteSubtitle(subtitle.id)
                  }
                  className="ml-auto text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}

        {subtitles.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">
            No subtitles yet.
          </div>
        )}
      </div>
    </div>
  );
}