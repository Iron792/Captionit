"use client";

import { useEffect, useRef } from "react";
import type {
  SubtitleSegment,
  SubtitleStyle,
} from "@/types/subtitle";

type VideoPreviewProps = {
  url: string;
  currentTime: number;
  onTime: (time: number) => void;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  segments: SubtitleSegment[];
  style: SubtitleStyle;
};

export default function VideoPreview({
  url,
  currentTime,
  onTime,
  playing,
  setPlaying,
  segments,
  style,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      void video.play().catch(() => {
        setPlaying(false);
      });
    } else {
      video.pause();
    }
  }, [playing, setPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (
      Math.abs(video.currentTime - currentTime) > 0.3
    ) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  const activeSubtitle = segments.find(
    (segment) =>
      currentTime >= segment.start &&
      currentTime <= segment.end
  );

  const subtitlePosition =
    style.position === "top"
      ? {
          top: "8%",
          transform: "translateX(-50%)",
        }
      : style.position === "center"
        ? {
            top: "50%",
            transform: "translate(-50%, -50%)",
          }
        : {
            bottom: "10%",
            transform: "translateX(-50%)",
          };

  return (
    <div className="flex h-full w-full items-center justify-center">
      {/* Responsive video canvas */}
      <div className="relative flex h-full max-h-[calc(100dvh-190px)] w-full max-w-5xl items-center justify-center overflow-hidden rounded-xl bg-black sm:rounded-2xl lg:max-h-full">
        <video
          ref={videoRef}
          src={url}
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
          onTimeUpdate={(event) =>
            onTime(
              event.currentTarget.currentTime
            )
          }
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />

        {/* Captions */}
        {activeSubtitle && (
          <div
            className="pointer-events-none absolute left-1/2 max-w-[88%] text-center sm:max-w-[80%]"
            style={{
              ...subtitlePosition,
              left: `${style.x}%`,
              fontFamily: style.font,
              fontSize: `clamp(18px, 3vw, ${style.size}px)`,
              fontWeight: style.weight,
              letterSpacing: `${style.letterSpacing}px`,
              lineHeight: style.lineHeight,
              color: style.color,
              textAlign: style.align,
              padding: `${style.padding}px`,
              borderRadius: `${style.radius}px`,
              backgroundColor: style.background,
              background:
                style.backgroundOpacity > 0
                  ? `${style.background}${Math.round(
                      (style.backgroundOpacity /
                        100) *
                        255
                    )
                      .toString(16)
                      .padStart(2, "0")}`
                  : "transparent",
              textShadow:
                style.shadow > 0
                  ? `0 2px ${style.shadow}px rgba(0,0,0,.9)`
                  : "none",
              WebkitTextStroke:
                style.outline > 0
                  ? `${style.outline}px rgba(0,0,0,.8)`
                  : undefined,
            }}
          >
            {activeSubtitle.text}
          </div>
        )}

        {/* Compact controls */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-black/80 px-4 py-2 backdrop-blur sm:bottom-4">
          <button
            type="button"
            onClick={() => setPlaying(!playing)}
            className="text-xs font-medium text-white"
          >
            {playing ? "Pause" : "Play"}
          </button>

          <span className="text-xs tabular-nums text-zinc-400">
            {currentTime.toFixed(1)}s
          </span>
        </div>
      </div>
    </div>
  );
}