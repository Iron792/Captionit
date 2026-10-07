"use client";

import type { SubtitleSegment } from "@/types/subtitle";

type SubtitleEditorProps = {
  items: SubtitleSegment[];
  selected: string | null;
  onSelect: (id: string) => void;
  onChange: (items: SubtitleSegment[]) => void;
};

export default function SubtitleEditor({
  items,
  selected,
  onSelect,
  onChange,
}: SubtitleEditorProps) {
  const updateItem = (
    id: string,
    changes: Partial<SubtitleSegment>
  ) => {
    onChange(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              ...changes,
            }
          : item
      )
    );
  };

  const addItem = () => {
    const last = items.at(-1);

    const start = last?.end ?? 0;

    const newItem: SubtitleSegment = {
      id: crypto.randomUUID(),
      start,
      end: start + 2,
      text: "New caption",
    };

    onChange([...items, newItem]);
    onSelect(newItem.id);
  };

  const deleteItem = (
    event: React.MouseEvent,
    id: string
  ) => {
    event.stopPropagation();

    onChange(
      items.filter(
        (item) => item.id !== id
      )
    );

    if (selected === id) {
      onSelect("");
    }
  };

  return (
    <div className="h-full overflow-y-auto p-3">
      <button
        type="button"
        onClick={addItem}
        className="mb-3 w-full rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
      >
        + Add caption
      </button>

      <div className="space-y-2">
        {items.map((item) => {
          const isSelected =
            item.id === selected;

          return (
            <div
              key={item.id}
              onClick={() =>
                onSelect(item.id)
              }
              className={`cursor-pointer rounded-xl border p-3 transition ${
                isSelected
                  ? "border-cyan-400/40 bg-cyan-400/10"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
            >
              <textarea
                value={item.text}
                onChange={(event) =>
                  updateItem(item.id, {
                    text: event.target.value,
                  })
                }
                onClick={(event) =>
                  event.stopPropagation()
                }
                rows={2}
                className="w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                placeholder="Enter caption..."
              />

              <div className="mt-3 flex items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-1">
                  <label className="text-[10px] text-zinc-600">
                    START
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={item.start}
                    onChange={(event) =>
                      updateItem(item.id, {
                        start: Math.max(
                          0,
                          Number(
                            event.target.value
                          )
                        ),
                      })
                    }
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                    className="w-16 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-xs text-white outline-none focus:border-cyan-400/40"
                  />
                </div>

                <span className="text-zinc-700">
                  →
                </span>

                <div className="flex min-w-0 flex-1 items-center gap-1">
                  <label className="text-[10px] text-zinc-600">
                    END
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={item.end}
                    onChange={(event) =>
                      updateItem(item.id, {
                        end: Math.max(
                          0,
                          Number(
                            event.target.value
                          )
                        ),
                      })
                    }
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                    className="w-16 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-xs text-white outline-none focus:border-cyan-400/40"
                  />
                </div>

                <button
                  type="button"
                  onClick={(event) =>
                    deleteItem(
                      event,
                      item.id
                    )
                  }
                  className="ml-auto text-xs text-red-400 transition hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-xs text-zinc-600">
            No captions yet.
          </div>
        )}
      </div>
    </div>
  );
}