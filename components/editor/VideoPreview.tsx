"use client";

import { useEffect, useRef } from "react";

type Word = {
  word: string;
  start: number;
  end: number;
};

type SubtitleSegment = {
  id: string;
  start: number;
  end: number;
  text: string;
  words?: Word[];
};

type VideoPreviewProps = {
  videoUrl?: string;
  subtitles?: SubtitleSegment[];
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
};

export default function VideoPreview({
  videoUrl,
  subtitles = [],
  currentTime = 0,
  onTimeUpdate,
  onDurationChange,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Math.abs(video.currentTime - currentTime) > 0.4) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  const activeSubtitle = subtitles.find(
    (subtitle) =>
      currentTime >= subtitle.start &&
      currentTime <= subtitle.end
  );

  const activeWordIndex =
    activeSubtitle?.words?.findIndex(
      (word) =>
        currentTime >= word.start &&
        currentTime <= word.end
    ) ?? -1;

  return (
    <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black">
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          playsInline
          className="max-h-[70vh] w-full object-contain"
          onTimeUpdate={(e) =>
            onTimeUpdate?.(e.currentTarget.currentTime)
          }
          onLoadedMetadata={(e) =>
            onDurationChange?.(e.currentTarget.duration)
          }
        />
      ) : (
        <div className="text-center text-white/40">
          <div className="mb-3 text-4xl">▶</div>
          <p>Upload a video to start editing</p>
        </div>
      )}

      {activeSubtitle && (
        <div className="pointer-events-none absolute bottom-16 left-1/2 w-[90%] -translate-x-1/2 text-center">
          <div className="inline-block rounded-lg bg-black/50 px-4 py-2 backdrop-blur-sm">
            {activeSubtitle.words?.length ? (
              activeSubtitle.words.map((word, index) => (
                <span
                  key={`${activeSubtitle.id}-${index}`}
                  className={`mx-1 inline-block font-bold transition-all ${
                    index === activeWordIndex
                      ? "scale-110 text-yellow-300"
                      : "text-white"
                  }`}
                >
                  {word.word}
                </span>
              ))
            ) : (
              <span className="font-bold text-white">
                {activeSubtitle.text}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}