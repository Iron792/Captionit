"use client";

import {
  useEffect,
  useRef,
} from "react";

import type {
  SubtitleSegment,
  SubtitleStyle,
} from "@/types/subtitle";

type VideoPreviewProps = {
  url: string;
  currentTime: number;
  onTime: (time: number) => void;
  playing: boolean;
  setPlaying: (
    playing: boolean
  ) => void;
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
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const activeSubtitle =
    segments.find(
      (segment) =>
        currentTime >=
          segment.start &&
        currentTime <=
          segment.end
    );

  useEffect(() => {
    const video =
      videoRef.current;

    if (!video) return;

    if (playing) {
      void video.play();
    } else {
      video.pause();
    }
  }, [playing]);

  useEffect(() => {
    const video =
      videoRef.current;

    if (!video) return;

    if (
      Math.abs(
        video.currentTime -
          currentTime
      ) > 0.15
    ) {
      video.currentTime =
        currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate =
    () => {
      const video =
        videoRef.current;

      if (!video) return;

      onTime(
        video.currentTime
      );
    };

  const subtitlePosition =
    style.position === "top"
      ? {
          top: `${style.y || 10}%`,
          left: `${style.x || 50}%`,
          transform:
            "translateX(-50%)",
        }
      : style.position ===
        "center"
      ? {
          top: `${style.y || 50}%`,
          left: `${style.x || 50}%`,
          transform:
            "translate(-50%, -50%)",
        }
      : {
          bottom: `${100 - (style.y || 90)}%`,
          left: `${style.x || 50}%`,
          transform:
            "translateX(-50%)",
        };

  return (
    <div className="flex min-h-0 h-full w-full items-center justify-center">
      <div className="relative flex h-full max-h-full w-full items-center justify-center overflow-hidden rounded-xl bg-black shadow-2xl sm:rounded-2xl">
        <video
          ref={videoRef}
          src={url}
          playsInline
          preload="metadata"
          className="block h-full w-full object-contain"
          onTimeUpdate={
            handleTimeUpdate
          }
          onPlay={() =>
            setPlaying(true)
          }
          onPause={() =>
            setPlaying(false)
          }
          onEnded={() =>
            setPlaying(false)
          }
        />

        {activeSubtitle && (
          <div
            className="pointer-events-none absolute max-w-[88%] text-center"
            style={
              subtitlePosition
            }
          >
            <span
              style={{
                display:
                  "inline-block",
                color:
                  style.color ||
                  "#ffffff",
                fontFamily:
                  style.font ||
                  "Arial",
                fontSize: `clamp(16px, 4vw, ${style.size || 42}px)`,
                fontWeight:
                  style.weight ||
                  700,
                letterSpacing: `${style.letterSpacing || 0}px`,
                lineHeight:
                  style.lineHeight ||
                  1.1,
                background:
                  style.background ||
                  "#000000",
                backgroundColor:
                  style.background
                    ? style.background
                    : undefined,
                padding: `${style.padding || 8}px`,
                borderRadius: `${style.radius || 8}px`,
                textShadow:
                  style.shadow
                    ? `0 ${style.shadow}px ${style.shadow * 2}px rgba(0,0,0,.65)`
                    : "none",
                WebkitTextStroke:
                  style.outline
                    ? `${Math.max(
                        1,
                        style.outline
                      )}px rgba(0,0,0,.75)`
                    : undefined,
              }}
            >
              {activeSubtitle.text}
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
          <div className="mx-auto flex max-w-md items-center gap-2 rounded-full border border-white/10 bg-black/70 px-2 py-2 text-xs text-white shadow-xl backdrop-blur-xl">
            <button
              type="button"
              onClick={() =>
                setPlaying(!playing)
              }
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black"
            >
              {playing ? "Ⅱ" : "▶"}
            </button>

            <div className="min-w-0 flex-1">
              <div className="h-1 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-[width]"
                  style={{
                    width: `${
                      Math.max(
                        0,
                        Math.min(
                          100,
                          (currentTime /
                            Math.max(
                              1,
                              segments.at(
                                -1
                              )?.end ||
                                currentTime ||
                                1
                            )) *
                            100
                        )
                      )
                    }%`,
                  }}
                />
              </div>
            </div>

            <span className="shrink-0 tabular-nums">
              {currentTime.toFixed(1)}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}