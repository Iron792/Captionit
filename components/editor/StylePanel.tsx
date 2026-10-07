"use client";

type SubtitleStyle = {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  highlightColor?: string;
  background?: string;
  backgroundOpacity?: number;
  position?: "top" | "center" | "bottom";
  textAlign?: "left" | "center" | "right";
};

type StylePanelProps = {
  style?: SubtitleStyle;
  onChange?: (style: SubtitleStyle) => void;
};

const presets: Record<string, SubtitleStyle> = {
  Classic: {
    fontFamily: "Arial",
    fontSize: 32,
    fontWeight: 600,
    color: "#ffffff",
    highlightColor: "#facc15",
    background: "#000000",
    backgroundOpacity: 0.5,
    position: "bottom",
    textAlign: "center",
  },

  Bold: {
    fontFamily: "Arial",
    fontSize: 40,
    fontWeight: 800,
    color: "#ffffff",
    highlightColor: "#ef4444",
    background: "#000000",
    backgroundOpacity: 0.35,
    position: "bottom",
    textAlign: "center",
  },

  Creator: {
    fontFamily: "Arial",
    fontSize: 36,
    fontWeight: 800,
    color: "#ffffff",
    highlightColor: "#a78bfa",
    background: "#000000",
    backgroundOpacity: 0.2,
    position: "center",
    textAlign: "center",
  },

  Minimal: {
    fontFamily: "Arial",
    fontSize: 28,
    fontWeight: 500,
    color: "#ffffff",
    highlightColor: "#ffffff",
    background: "#000000",
    backgroundOpacity: 0,
    position: "bottom",
    textAlign: "center",
  },

  Karaoke: {
    fontFamily: "Arial",
    fontSize: 34,
    fontWeight: 800,
    color: "#ffffff",
    highlightColor: "#22c55e",
    background: "#000000",
    backgroundOpacity: 0.4,
    position: "bottom",
    textAlign: "center",
  },

  Neon: {
    fontFamily: "Arial",
    fontSize: 34,
    fontWeight: 800,
    color: "#ffffff",
    highlightColor: "#22d3ee",
    background: "#000000",
    backgroundOpacity: 0.35,
    position: "center",
    textAlign: "center",
  },

  Social: {
    fontFamily: "Arial",
    fontSize: 38,
    fontWeight: 900,
    color: "#ffffff",
    highlightColor: "#f472b6",
    background: "#000000",
    backgroundOpacity: 0.25,
    position: "bottom",
    textAlign: "center",
  },
};

export default function StylePanel({
  style = presets.Classic,
  onChange,
}: StylePanelProps) {
  const update = (changes: Partial<SubtitleStyle>) => {
    onChange?.({
      ...style,
      ...changes,
    });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="mb-4 font-medium text-white">
        Subtitle Style
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {Object.entries(presets).map(([name, preset]) => (
          <button
            key={name}
            type="button"
            onClick={() => onChange?.(preset)}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-xs text-white transition hover:bg-white/10"
          >
            {name}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-xs text-white/50">
            Font
          </label>

          <select
            value={style.fontFamily}
            onChange={(e) =>
              update({ fontFamily: e.target.value })
            }
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          >
            <option>Arial</option>
            <option>Inter</option>
            <option>Georgia</option>
            <option>Verdana</option>
            <option>Impact</option>
            <option>Courier New</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/50">
            Size
          </label>

          <input
            type="range"
            min="12"
            max="96"
            value={style.fontSize}
            onChange={(e) =>
              update({
                fontSize: Number(e.target.value),
              })
            }
            className="w-full"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/50">
            Text Color
          </label>

          <input
            type="color"
            value={style.color}
            onChange={(e) =>
              update({ color: e.target.value })
            }
            className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/50">
            Highlight Color
          </label>

          <input
            type="color"
            value={style.highlightColor}
            onChange={(e) =>
              update({
                highlightColor: e.target.value,
              })
            }
            className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/50">
            Position
          </label>

          <div className="grid grid-cols-3 gap-2">
            {(["top", "center", "bottom"] as const).map(
              (position) => (
                <button
                  key={position}
                  type="button"
                  onClick={() => update({ position })}
                  className={`rounded-lg border px-2 py-2 text-xs capitalize ${
                    style.position === position
                      ? "border-white/30 bg-white/10 text-white"
                      : "border-white/10 text-white/50"
                  }`}
                >
                  {position}
                </button>
              )
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/50">
            Alignment
          </label>

          <div className="grid grid-cols-3 gap-2">
            {(["left", "center", "right"] as const).map(
              (textAlign) => (
                <button
                  key={textAlign}
                  type="button"
                  onClick={() => update({ textAlign })}
                  className={`rounded-lg border px-2 py-2 text-xs capitalize ${
                    style.textAlign === textAlign
                      ? "border-white/30 bg-white/10 text-white"
                      : "border-white/10 text-white/50"
                  }`}
                >
                  {textAlign}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}