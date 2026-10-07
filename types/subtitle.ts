export type SubtitleWord = {
  text: string;
  start: number;
  end: number;
};

export type SubtitleSegment = {
  id: string;
  start: number;
  end: number;
  text: string;
  words?: SubtitleWord[];
};

export type SubtitleStyle = {
  preset: string;

  font: string;
  size: number;
  weight: number;

  letterSpacing: number;
  lineHeight: number;

  align: "left" | "center" | "right";

  color: string;
  highlightColor: string;

  background: string;
  backgroundOpacity: number;

  outline: number;
  shadow: number;

  radius: number;
  padding: number;

  position: "top" | "center" | "bottom";

  x: number;
  y: number;
};

export type SubtitleAnimation = {
  preset:
    | "fade"
    | "pop"
    | "bounce"
    | "slide-up"
    | "slide-down"
    | "scale"
    | "typewriter"
    | "word-pop"
    | "karaoke"
    | "none";

  speed: number;
  intensity: number;
};