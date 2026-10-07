import type {
  SubtitleAnimation,
  SubtitleSegment,
  SubtitleStyle,
} from "@/types/subtitle";

function assTime(
  seconds: number
) {
  const safe =
    Math.max(
      0,
      Number.isFinite(seconds)
        ? seconds
        : 0
    );

  const hours =
    Math.floor(
      safe / 3600
    );

  const minutes =
    Math.floor(
      (safe % 3600) / 60
    );

  const secs =
    Math.floor(
      safe % 60
    );

  const centiseconds =
    Math.floor(
      (safe -
        Math.floor(safe)) *
        100
    );

  return `${hours}:${String(
    minutes
  ).padStart(2, "0")}:${String(
    secs
  ).padStart(2, "0")}.${String(
    centiseconds
  ).padStart(2, "0")}`;
}

function hexToAss(
  hex: string,
  opacity = 1
) {
  const clean =
    hex
      .replace("#", "")
      .trim();

  const normalized =
    clean.length === 3
      ? clean
          .split("")
          .map(
            (value) =>
              value + value
          )
          .join("")
      : clean;

  const r =
    parseInt(
      normalized.slice(0, 2),
      16
    ) || 255;

  const g =
    parseInt(
      normalized.slice(2, 4),
      16
    ) || 255;

  const b =
    parseInt(
      normalized.slice(4, 6),
      16
    ) || 255;

  const alpha =
    Math.round(
      255 -
        Math.max(
          0,
          Math.min(
            1,
            opacity
          )
        ) *
          255
    );

  return `&H${alpha
    .toString(16)
    .padStart(2, "0")}${b
    .toString(16)
    .padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${r
    .toString(16)
    .padStart(2, "0")}`;
}

function escapeAss(
  value: string
) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}");
}

function animationTags(
  animation: SubtitleAnimation
) {
  const intensity =
    Math.max(
      0.5,
      Math.min(
        2,
        animation.intensity || 1
      )
    );

  const speed =
    Math.max(
      0.5,
      Math.min(
        2,
        animation.speed || 1
      )
    );

  const duration =
    Math.round(
      180 /
        speed
    );

  switch (
    animation.preset
  ) {
    case "fade":
      return `\\fad(${duration},${duration})`;

    case "pop": {
      const scale =
        Math.round(
          100 +
            15 *
              intensity
        );

      return `\\fscx100\\fscy100\\t(0,${duration},\\fscx${scale}\\fscy${scale})\\t(${duration},${duration * 2},\\fscx100\\fscy100)`;
    }

    case "bounce":
      return `\\fscy100\\t(0,${duration},\\fscy${Math.round(
        115 * intensity
      )})\\t(${duration},${
        duration * 2
      },\\fscy100)`;

    case "scale":
      return `\\fscx90\\fscy90\\t(0,${duration},\\fscx100\\fscy100)`;

    default:
      return "";
  }
}

function positionForStyle(
  style: SubtitleStyle
) {
  const x =
    style.x ||
    50;

  if (
    style.position ===
    "top"
  ) {
    return {
      alignment: 8,
      x,
      y:
        style.y ||
        10,
    };
  }

  if (
    style.position ===
    "center"
  ) {
    return {
      alignment: 5,
      x,
      y:
        style.y ||
        50,
    };
  }

  return {
    alignment: 2,
    x,
    y:
      style.y ||
      90,
  };
}

function createDialogueText(
  segment: SubtitleSegment,
  animation: SubtitleAnimation,
  style: SubtitleStyle
) {
  const tags =
    animationTags(
      animation
    );

  const useKaraoke =
    animation.preset ===
      "karaoke" ||
    animation.preset ===
      "word-pop" ||
    Boolean(
      segment.words?.length
    );

  if (
    !useKaraoke ||
    !segment.words?.length
  ) {
    return `{${tags}}${escapeAss(
      segment.text
    )}`;
  }

  return (
    `{${tags}}` +
    segment.words
      .map(
        (word) => {
          const duration =
            Math.max(
              1,
              Math.round(
                (word.end -
                  word.start) *
                  100
              )
            );

          return `\\k${duration}${escapeAss(
            word.text
          )}`;
        }
      )
      .join(" ")
  );
}

export function toAss(
  segments: SubtitleSegment[],
  style: SubtitleStyle,
  animation: SubtitleAnimation
) {
  const position =
    positionForStyle(
      style
    );

  const primary =
    hexToAss(
      style.color ||
        "#FFFFFF"
    );

  const secondary =
    hexToAss(
      style.highlightColor ||
        "#FF2D55"
    );

  const outline =
    hexToAss(
      "#000000",
      1
    );

  const background =
    hexToAss(
      style.background ||
        "#000000",
      style.backgroundOpacity ||
        0
    );

  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,${style.font || "Arial"},${style.size || 56},${primary},${secondary},${outline},${background},${style.weight >= 700 ? 1 : 0},0,0,0,100,100,${style.letterSpacing || 0},0,1,${style.outline || 2},${style.shadow || 0},${position.alignment},60,60,60,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const dialogues =
    segments
      .filter(
        (segment) =>
          segment.end >
            segment.start &&
          segment.text.trim()
      )
      .map(
        (segment) => {
          const x =
            Math.round(
              (position.x /
                100) *
                1920
            );

          const y =
            Math.round(
              (position.y /
                100) *
                1080
            );

          const text =
            createDialogueText(
              segment,
              animation,
              style
            );

          return `Dialogue: 0,${assTime(
            segment.start
          )},${assTime(
            segment.end
          )},Caption,,0,0,0,,{\\pos(${x},${y})}${text}`;
        }
      )
      .join("\n");

  return (
    header +
    dialogues +
    "\n"
  );
}