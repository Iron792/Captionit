"use client";

import type {
  SubtitleAnimation,
  SubtitleStyle,
} from "@/types/subtitle";

type StylePanelProps = {
  style: SubtitleStyle;
  setStyle: React.Dispatch<
    React.SetStateAction<SubtitleStyle>
  >;
  animation: SubtitleAnimation;
  setAnimation: React.Dispatch<
    React.SetStateAction<SubtitleAnimation>
  >;
};

const presets = [
  "Classic",
  "Bold",
  "Creator",
  "Minimal",
  "Karaoke",
  "Neon",
  "Social",
] as const;

const animations = [
  "None",
  "Fade",
  "Pop",
  "Bounce",
  "Slide Up",
  "Slide Down",
  "Scale",
  "Typewriter",
  "Word Pop",
  "Karaoke",
] as const;

export default function StylePanel({
  style,
  setStyle,
  animation,
  setAnimation,
}: StylePanelProps) {
  const updateStyle = (
    changes: Partial<SubtitleStyle>
  ) => {
    setStyle((current) => ({
      ...current,
      ...changes,
    }));
  };

  const updateAnimation = (
    changes: Partial<SubtitleAnimation>
  ) => {
    setAnimation((current) => ({
      ...current,
      ...changes,
    }));
  };

  return (
    <div className="space-y-5 overflow-y-auto pb-6">
      {/* Presets */}
      <section>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Preset
        </label>

        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() =>
                updateStyle({
                  preset,
                })
              }
              className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                style.preset === preset
                  ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                  : "border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </section>

      {/* Font */}
      <section>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Font
        </label>

        <select
          value={style.font}
          onChange={(event) =>
            updateStyle({
              font: event.target.value,
            })
          }
          className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
        >
          <option value="Inter">
            Inter
          </option>
          <option value="Arial">
            Arial
          </option>
          <option value="Helvetica">
            Helvetica
          </option>
          <option value="Verdana">
            Verdana
          </option>
          <option value="Georgia">
            Georgia
          </option>
          <option value="Impact">
            Impact
          </option>
          <option value="Courier New">
            Courier New
          </option>
        </select>
      </section>

      {/* Size */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Size
          </label>

          <span className="text-xs tabular-nums text-zinc-500">
            {style.size}px
          </span>
        </div>

        <input
          type="range"
          min="16"
          max="96"
          step="1"
          value={style.size}
          onChange={(event) =>
            updateStyle({
              size: Number(
                event.target.value
              ),
            })
          }
          className="w-full"
        />
      </section>

      {/* Weight */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Weight
          </label>

          <span className="text-xs text-zinc-500">
            {style.weight}
          </span>
        </div>

        <input
          type="range"
          min="300"
          max="900"
          step="100"
          value={style.weight}
          onChange={(event) =>
            updateStyle({
              weight: Number(
                event.target.value
              ),
            })
          }
          className="w-full"
        />
      </section>

      {/* Text color */}
      <section>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Text color
        </label>

        <div className="flex gap-2">
          <input
            type="color"
            value={style.color}
            onChange={(event) =>
              updateStyle({
                color: event.target.value,
              })
            }
            className="h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
          />

          <input
            type="text"
            value={style.color}
            onChange={(event) =>
              updateStyle({
                color: event.target.value,
              })
            }
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 text-xs text-white outline-none"
          />
        </div>
      </section>

      {/* Highlight */}
      <section>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Highlight
        </label>

        <div className="flex gap-2">
          <input
            type="color"
            value={style.highlightColor}
            onChange={(event) =>
              updateStyle({
                highlightColor:
                  event.target.value,
              })
            }
            className="h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
          />

          <input
            type="text"
            value={style.highlightColor}
            onChange={(event) =>
              updateStyle({
                highlightColor:
                  event.target.value,
              })
            }
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 text-xs text-white outline-none"
          />
        </div>
      </section>

      {/* Alignment */}
      <section>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Alignment
        </label>

        <div className="grid grid-cols-3 gap-1">
          {(
            ["left", "center", "right"] as const
          ).map((align) => (
            <button
              key={align}
              type="button"
              onClick={() =>
                updateStyle({
                  align,
                })
              }
              className={`rounded-lg border px-2 py-2 text-xs capitalize transition ${
                style.align === align
                  ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                  : "border-white/10 text-zinc-500 hover:text-white"
              }`}
            >
              {align}
            </button>
          ))}
        </div>
      </section>

      {/* Position */}
      <section>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Position
        </label>

        <div className="grid grid-cols-3 gap-1">
          {(
            ["top", "center", "bottom"] as const
          ).map((position) => (
            <button
              key={position}
              type="button"
              onClick={() =>
                updateStyle({
                  position,
                })
              }
              className={`rounded-lg border px-2 py-2 text-xs capitalize transition ${
                style.position === position
                  ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                  : "border-white/10 text-zinc-500 hover:text-white"
              }`}
            >
              {position}
            </button>
          ))}
        </div>
      </section>

      {/* Background opacity */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Background
          </label>

          <span className="text-xs text-zinc-500">
            {style.backgroundOpacity}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={style.backgroundOpacity}
          onChange={(event) =>
            updateStyle({
              backgroundOpacity:
                Number(
                  event.target.value
                ),
            })
          }
          className="w-full"
        />
      </section>

      {/* Animation */}
      <section className="border-t border-white/10 pt-5">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Animation
        </label>

        <select
          value={animation.preset}
          onChange={(event) =>
            updateAnimation({
              preset: event.target.value,
            })
          }
          className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
        >
          {animations.map((animationPreset) => (
            <option
              key={animationPreset}
              value={animationPreset}
            >
              {animationPreset}
            </option>
          ))}
        </select>
      </section>

      {/* Animation speed */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Animation speed
          </label>

          <span className="text-xs text-zinc-500">
            {animation.speed.toFixed(1)}x
          </span>
        </div>

        <input
          type="range"
          min="0.25"
          max="3"
          step="0.25"
          value={animation.speed}
          onChange={(event) =>
            updateAnimation({
              speed: Number(
                event.target.value
              ),
            })
          }
          className="w-full"
        />
      </section>

      {/* Animation intensity */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Intensity
          </label>

          <span className="text-xs text-zinc-500">
            {animation.intensity}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={animation.intensity}
          onChange={(event) =>
            updateAnimation({
              intensity: Number(
                event.target.value
              ),
            })
          }
          className="w-full"
        />
      </section>
    </div>
  );
}