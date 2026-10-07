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

  /*
   * Keep video play/pause state synchronized
   * with the editor state.
   */
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

  /*
   * Seek video when the timeline/editor changes
   * the current time.
   */
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (
      Math.abs(video.currentTime - currentTime) >
      0.35
    ) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  /*
   * Find currently active subtitle.
   */
  const activeSubtitle = segments.find(
    (segment) =>
      currentTime >= segment.start &&
      currentTime <= segment.end
  );

  const positionStyle =
    style.position === "top"
      ? {
          top: `${100 - style.y}%`,
        }
      : style.position === "center"
        ? {
            top: "50%",
            transform:
              "translate(-50%, -50%)",
          }
        : {
            bottom: `${100 - style.y}%`,
          };

  return (
    <div className="relative flex h-full min-h-[400px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black">
      <video
        ref={videoRef}
        src={url}
        playsInline
        preload="metadata"
        className="max-h-full max-w-full object-contain"
        onLoadedMetadata={(event) => {
          const duration =
            event.currentTarget.duration;

          if (
            Number.isFinite(duration) &&
            duration > 0 &&
            currentTime > duration
          ) {
            onTime(duration);
          }
        }}
        onTimeUpdate={(event) => {
          onTime(
            event.currentTarget.currentTime
          );
        }}
        onPlay={() => {
          setPlaying(true);
        }}
        onPause={() => {
          setPlaying(false);
        }}
        onEnded={() => {
          setPlaying(false);
        }}
      />

      {/* Subtitle */}
      {activeSubtitle && (
        <div
          className="pointer-events-none absolute left-1/2 max-w-[90%] text-center"
          style={{
            ...positionStyle,
            left: `${style.x}%`,
            fontFamily: style.font,
            fontSize: `${style.size}px`,
            fontWeight: style.weight,
            letterSpacing: `${style.letterSpacing}px`,
            lineHeight: style.lineHeight,
            color: style.color,
            textAlign: style.align,
            padding: `${style.padding}px`,
            borderRadius: `${style.radius}px`,
            backgroundColor: style.background,
            opacity:
              style.backgroundOpacity / 100,
            textShadow:
              style.shadow > 0
                ? `0 0 ${style.shadow}px rgba(0,0,0,0.85)`
                : "none",
            WebkitTextStroke:
              style.outline > 0
                ? `${style.outline}px rgba(0,0,0,0.8)`
                : "0 transparent",
          }}
        >
          {activeSubtitle.text}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-black/75 px-4 py-2 shadow-xl backdrop-blur">
        <button
          type="button"
          onClick={() =>
            setPlaying(!playing)
          }
          className="text-xs font-medium text-white transition hover:text-cyan-300"
        >
          {playing ? "Pause" : "Play"}
        </button>

        <span className="text-xs tabular-nums text-zinc-400">
          {currentTime.toFixed(1)}s
        </span>
      </div>
    </div>
  );
}