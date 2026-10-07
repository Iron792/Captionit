"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Captions,
  Download,
  Loader2,
  PanelRight,
  SlidersHorizontal,
  Sparkles,
  Film,
} from "lucide-react";

import UploadPanel from "@/components/editor/UploadPanel";
import VideoPreview from "@/components/editor/VideoPreview";
import SubtitleTimeline from "@/components/editor/SubtitleTimeline";
import SubtitleEditor from "@/components/editor/SubtitleEditor";
import StylePanel from "@/components/editor/StylePanel";

import type {
  SubtitleAnimation,
  SubtitleSegment,
  SubtitleStyle,
} from "@/types/subtitle";

import {
  transcribeVideo,
} from "@/lib/transcription/browser";

import {
  renderCaptionedVideo,
} from "@/lib/render/browser-render";

import {
  toSrt,
  toVtt,
} from "@/lib/subtitles/format";

const defaultStyle: SubtitleStyle = {
  preset: "Classic",

  font: "Arial",
  size: 42,
  weight: 700,

  letterSpacing: 0,
  lineHeight: 1.1,

  align: "center",

  color: "#ffffff",
  highlightColor: "#ff2d55",

  background: "#000000",
  backgroundOpacity: 0,

  outline: 2,
  shadow: 2,

  radius: 10,
  padding: 8,

  position: "bottom",

  x: 50,
  y: 90,
};

const defaultAnimation: SubtitleAnimation = {
  preset: "fade",
  speed: 1,
  intensity: 1,
};

type MobilePanel =
  | "captions"
  | "timeline"
  | "style"
  | null;

export default function EditorPage() {
  const [file, setFile] =
    useState<File | null>(null);

  const [url, setUrl] =
    useState("");

  const [duration, setDuration] =
    useState(0);

  const [
    currentTime,
    setCurrentTime,
  ] = useState(0);

  const [playing, setPlaying] =
    useState(false);

  const [
    segments,
    setSegments,
  ] = useState<SubtitleSegment[]>(
    []
  );

  const [selected, setSelected] =
    useState<string | null>(
      null
    );

  const [style, setStyle] =
    useState<SubtitleStyle>(
      defaultStyle
    );

  const [
    animation,
    setAnimation,
  ] =
    useState<SubtitleAnimation>(
      defaultAnimation
    );

  const [
    transcribing,
    setTranscribing,
  ] = useState(false);

  const [
    transcriptionProgress,
    setTranscriptionProgress,
  ] = useState(0);

  const [
    transcriptionMessage,
    setTranscriptionMessage,
  ] = useState("");

  const [exporting, setExporting] =
    useState(false);

  const [exportProgress, setExportProgress] =
    useState(0);

  const [error, setError] =
    useState("");

  const [
    mobilePanel,
    setMobilePanel,
  ] = useState<MobilePanel>(
    "captions"
  );

  const busyRef =
    useRef(false);

  useEffect(() => {
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  const loadVideo = (
    selectedFile: File,
    videoUrl: string
  ) => {
    setFile(selectedFile);
    setUrl(videoUrl);

    setSegments([]);
    setSelected(null);
    setCurrentTime(0);
    setDuration(0);
    setError("");

    setTranscribing(true);
    setTranscriptionProgress(0);
    setTranscriptionMessage(
      "Preparing audio…"
    );

    const video =
      document.createElement(
        "video"
      );

    video.preload = "metadata";
    video.src = videoUrl;

    video.onloadedmetadata =
      async () => {
        const videoDuration =
          Number.isFinite(
            video.duration
          )
            ? video.duration
            : 0;

        setDuration(
          videoDuration
        );

        try {
          const captions =
            await transcribeVideo(
              selectedFile,
              (
                progress,
                message
              ) => {
                setTranscriptionProgress(
                  progress
                );

                setTranscriptionMessage(
                  message
                );
              }
            );

          setSegments(
            captions
          );

          setSelected(
            captions[0]?.id ??
              null
          );

          if (
            captions.length ===
            0
          ) {
            setError(
              "No speech was detected in this video."
            );
          }
        } catch (transcriptionError) {
          setError(
            transcriptionError instanceof
              Error
              ? transcriptionError.message
              : "Automatic transcription failed."
          );
        } finally {
          setTranscribing(false);
        }
      };

    video.onerror = () => {
      setTranscribing(false);
      setError(
        "This video could not be decoded by the browser."
      );
    };
  };

  const handleSeek = (
    time: number
  ) => {
    setCurrentTime(
      Math.max(
        0,
        Math.min(
          duration || time,
          time
        )
      )
    );
  };

  const handleExport = async () => {
    if (
      busyRef.current ||
      !file ||
      segments.length === 0
    ) {
      return;
    }

    busyRef.current = true;

    setError("");
    setExporting(true);
    setExportProgress(0);

    try {
      const output =
        await renderCaptionedVideo(
          file,
          segments,
          style,
          animation,
          (progress) => {
            setExportProgress(
              progress
            );
          }
        );

      const downloadUrl =
        URL.createObjectURL(
          output
        );

      const anchor =
        document.createElement(
          "a"
        );

      const baseName =
        file.name.replace(
          /\.[^/.]+$/,
          ""
        );

      anchor.href =
        downloadUrl;

      anchor.download =
        `${baseName}-captioned.mp4`;

      document.body.appendChild(
        anchor
      );

      anchor.click();

      anchor.remove();

      setTimeout(() => {
        URL.revokeObjectURL(
          downloadUrl
        );
      }, 5000);
    } catch (exportError) {
      setError(
        exportError instanceof
          Error
          ? exportError.message
          : "Video rendering failed."
      );
    } finally {
      busyRef.current = false;
      setExporting(false);
    }
  };

  const downloadTextFile = (
    content: string,
    extension: string
  ) => {
    if (!content) return;

    const blob =
      new Blob(
        [content],
        {
          type:
            "text/plain;charset=utf-8",
        }
      );

    const downloadUrl =
      URL.createObjectURL(
        blob
      );

    const anchor =
      document.createElement(
        "a"
      );

    anchor.href =
      downloadUrl;

    anchor.download =
      `captions.${extension}`;

    document.body.appendChild(
      anchor
    );

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(
      downloadUrl
    );
  };

  const canExport =
    Boolean(file) &&
    segments.length > 0 &&
    !transcribing &&
    !exporting;

  return (
    <main className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[#09090b] text-white">
      {/* HEADER */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#0d0d10]/95 px-3 backdrop-blur-xl sm:h-16 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
          >
            <ArrowLeft
              size={18}
            />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Film
                size={15}
                className="text-white/60"
              />
              <span className="truncate text-sm font-semibold">
                Captionit
              </span>
            </div>

            {file && (
              <p className="max-w-[170px] truncate text-[10px] text-white/40 sm:max-w-xs">
                {file.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {segments.length >
            0 && (
            <>
              <button
                type="button"
                onClick={() =>
                  downloadTextFile(
                    toSrt(
                      segments
                    ),
                    "srt"
                  )
                }
                className="hidden h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-medium text-white/80 hover:bg-white/10 sm:flex"
              >
                SRT
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadTextFile(
                    toVtt(
                      segments
                    ),
                    "vtt"
                  )
                }
                className="hidden h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-medium text-white/80 hover:bg-white/10 sm:flex"
              >
                VTT
              </button>
            </>
          )}

          <button
            type="button"
            disabled={!canExport}
            onClick={
              handleExport
            }
            className="flex h-9 items-center gap-1.5 rounded-xl bg-white px-3 text-xs font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
          >
            {exporting ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Download
                size={15}
              />
            )}

            <span>
              {exporting
                ? `${Math.round(
                    exportProgress
                  )}%`
                : "Export"}
            </span>
          </button>
        </div>
      </header>

      {/* MAIN */}
      {!url ? (
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4 sm:p-8">
          <div className="w-full max-w-2xl">
            <UploadPanel
              onVideo={
                loadVideo
              }
            />
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* DESKTOP */}
          <div className="hidden min-h-0 flex-1 lg:flex">
            {/* LEFT */}
            <aside className="flex w-[290px] shrink-0 flex-col border-r border-white/10 bg-[#0d0d10]">
              <div className="border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Captions
                    size={16}
                  />
                  <span className="text-sm font-semibold">
                    Captions
                  </span>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                <SubtitleEditor
                  items={segments}
                  selected={
                    selected
                  }
                  onSelect={
                    (id) => {
                      setSelected(
                        id
                      );

                      const item =
                        segments.find(
                          (
                            segment
                          ) =>
                            segment.id ===
                            id
                        );

                      if (item) {
                        handleSeek(
                          item.start
                        );
                      }
                    }
                  }
                  onChange={
                    setSegments
                  }
                />
              </div>
            </aside>

            {/* CENTER */}
            <section className="flex min-w-0 min-h-0 flex-1 flex-col p-3">
              <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black">
                <VideoPreview
                  url={url}
                  currentTime={
                    currentTime
                  }
                  onTime={
                    setCurrentTime
                  }
                  playing={
                    playing
                  }
                  setPlaying={
                    setPlaying
                  }
                  segments={
                    segments
                  }
                  style={style}
                />
              </div>

              <div className="mt-3 h-[230px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d10]">
                <SubtitleTimeline
                  segments={
                    segments
                  }
                  current={
                    currentTime
                  }
                  onSeek={
                    handleSeek
                  }
                  onChange={
                    setSegments
                  }
                  zoom={1}
                  setZoom={() => {}}
                  undo={() => {}}
                  redo={() => {}}
                  canUndo={false}
                  canRedo={false}
                />
              </div>
            </section>

            {/* RIGHT */}
            <aside className="flex w-[310px] shrink-0 flex-col border-l border-white/10 bg-[#0d0d10]">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <SlidersHorizontal
                  size={16}
                />
                <span className="text-sm font-semibold">
                  Style
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                <StylePanel
                  style={
                    style
                  }
                  setStyle={
                    setStyle
                  }
                  animation={
                    animation
                  }
                  setAnimation={
                    setAnimation
                  }
                />
              </div>
            </aside>
          </div>

          {/* MOBILE */}
          <div className="flex min-h-0 flex-1 flex-col lg:hidden">
            <section className="min-h-0 flex-1 p-2">
              <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-black">
                <VideoPreview
                  url={url}
                  currentTime={
                    currentTime
                  }
                  onTime={
                    setCurrentTime
                  }
                  playing={
                    playing
                  }
                  setPlaying={
                    setPlaying
                  }
                  segments={
                    segments
                  }
                  style={style}
                />

                {transcribing && (
                  <div className="absolute left-1/2 top-3 z-20 w-[calc(100%-24px)] max-w-sm -translate-x-1/2 rounded-2xl border border-white/10 bg-black/80 p-3 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      <span className="text-xs font-medium">
                        {transcriptionMessage ||
                          "Generating captions…"}
                      </span>
                    </div>

                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-white transition-[width]"
                        style={{
                          width: `${transcriptionProgress}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            <div className="shrink-0 border-t border-white/10 bg-[#0d0d10]">
              <div className="grid grid-cols-3 gap-1 p-2">
                <button
                  type="button"
                  onClick={() =>
                    setMobilePanel(
                      mobilePanel ===
                        "captions"
                        ? null
                        : "captions"
                    )
                  }
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-medium ${
                    mobilePanel ===
                    "captions"
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/60"
                  }`}
                >
                  <Captions
                    size={15}
                  />
                  Captions
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMobilePanel(
                      mobilePanel ===
                        "timeline"
                        ? null
                        : "timeline"
                    )
                  }
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-medium ${
                    mobilePanel ===
                    "timeline"
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/60"
                  }`}
                >
                  <Film
                    size={15}
                  />
                  Timeline
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMobilePanel(
                      mobilePanel ===
                        "style"
                        ? null
                        : "style"
                    )
                  }
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-medium ${
                    mobilePanel ===
                    "style"
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/60"
                  }`}
                >
                  <SlidersHorizontal
                    size={15}
                  />
                  Style
                </button>
              </div>

              {mobilePanel && (
                <div className="max-h-[38dvh] overflow-y-auto border-t border-white/10 p-3">
                  {mobilePanel ===
                    "captions" && (
                    <SubtitleEditor
                      items={
                        segments
                      }
                      selected={
                        selected
                      }
                      onSelect={
                        (id) => {
                          setSelected(
                            id
                          );

                          const item =
                            segments.find(
                              (
                                segment
                              ) =>
                                segment.id ===
                                id
                            );

                          if (
                            item
                          ) {
                            handleSeek(
                              item.start
                            );
                          }
                        }
                      }
                      onChange={
                        setSegments
                      }
                    />
                  )}

                  {mobilePanel ===
                    "timeline" && (
                    <SubtitleTimeline
                      segments={
                        segments
                      }
                      current={
                        currentTime
                      }
                      onSeek={
                        handleSeek
                      }
                      onChange={
                        setSegments
                      }
                      zoom={1}
                      setZoom={() => {}}
                      undo={() => {}}
                      redo={() => {}}
                      canUndo={
                        false
                      }
                      canRedo={
                        false
                      }
                    />
                  )}

                  {mobilePanel ===
                    "style" && (
                    <StylePanel
                      style={
                        style
                      }
                      setStyle={
                        setStyle
                      }
                      animation={
                        animation
                      }
                      setAnimation={
                        setAnimation
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-24px)] max-w-xl -translate-x-1/2 rounded-2xl border border-red-400/20 bg-red-950/90 px-4 py-3 text-xs text-red-100 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              {error}
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="text-red-200/60 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* EXPORT STATUS */}
      {exporting && (
        <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-[#111116]/95 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-black">
              <Sparkles
                size={18}
              />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Rendering video
              </p>

              <p className="text-xs text-white/40">
                Burning captions locally…
              </p>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-[width]"
              style={{
                width: `${exportProgress}%`,
              }}
            />
          </div>

          <p className="mt-2 text-right text-xs tabular-nums text-white/40">
            {Math.round(
              exportProgress
            )}
            %
          </p>
        </div>
      )}
    </main>
  );
}