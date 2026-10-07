"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  PanelRight,
} from "lucide-react";

import { UploadPanel } from "@/components/editor/UploadPanel";
import { VideoPreview } from "@/components/editor/VideoPreview";
import { SubtitleTimeline } from "@/components/editor/SubtitleTimeline";
import { SubtitleEditor } from "@/components/editor/SubtitleEditor";
import { StylePanel } from "@/components/editor/StylePanel";

import {
  SubtitleSegment,
  SubtitleStyle,
  SubtitleAnimation,
} from "@/types/subtitle";

import { toSrt, toVtt } from "@/lib/subtitles/format";

const defaultStyle: SubtitleStyle = {
  font: "Inter",
  size: 38,
  weight: 800,
  letterSpacing: 0,
  lineHeight: 1.15,
  align: "center",
  color: "#ffffff",
  highlightColor: "#22d3ee",
  background: "#000000",
  backgroundOpacity: 25,
  outline: 1,
  shadow: 8,
  radius: 10,
  padding: 8,
  position: "bottom",
  x: 50,
  y: 85,
  preset: "Creator",
};

const defaultAnimation: SubtitleAnimation = {
  preset: "Word Pop",
  speed: 1,
  intensity: 70,
};

export default function Editor() {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);

  const [segments, setSegments] = useState<SubtitleSegment[]>([]);

  const [style, setStyle] =
    useState<SubtitleStyle>(defaultStyle);

  const [animation, setAnimation] =
    useState<SubtitleAnimation>(defaultAnimation);

  const [selected, setSelected] = useState<string | null>(
    null
  );

  const [zoom, setZoom] = useState(2);

  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState("");

  const [past, setPast] = useState<SubtitleSegment[][]>([]);
  const [future, setFuture] = useState<SubtitleSegment[][]>([]);

  const busyRef = useRef(false);

  /**
   * Update subtitle state and create undo history.
   */
  const change = (next: SubtitleSegment[]) => {
    setPast((previous) => [
      ...previous,
      segments,
    ].slice(-30));

    setFuture([]);
    setSegments(next);
  };

  /**
   * Undo last subtitle change.
   */
  const undo = () => {
    const previous = past.at(-1);

    if (!previous) {
      return;
    }

    setFuture((current) => [
      ...current,
      segments,
    ]);

    setPast((current) =>
      current.slice(0, -1)
    );

    setSegments(previous);
  };

  /**
   * Redo last subtitle change.
   */
  const redo = () => {
    const next = future.at(-1);

    if (!next) {
      return;
    }

    setPast((current) => [
      ...current,
      segments,
    ]);

    setFuture((current) =>
      current.slice(0, -1)
    );

    setSegments(next);
  };

  /**
   * Upload video and start transcription.
   */
  const load = async (
    selectedFile: File,
    videoUrl: string
  ) => {
    setFile(selectedFile);
    setUrl(videoUrl);
    setError("");
    setSegments([]);
    setSelected(null);
    setTime(0);
    setPlaying(false);

    const video = document.createElement("video");

    video.preload = "metadata";
    video.src = videoUrl;

    video.onloadedmetadata = async () => {
      const videoDuration = video.duration;

      setDuration(videoDuration);
      setTranscribing(true);

      try {
        const response = await fetch(
          "/api/transcribe",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              duration: videoDuration,
              fileName: selectedFile.name,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Transcription failed"
          );
        }

        const nextSegments =
          Array.isArray(data?.segments)
            ? data.segments
            : [];

        setSegments(nextSegments);

        setSelected(
          nextSegments[0]?.id ?? null
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Transcription failed"
        );
      } finally {
        setTranscribing(false);
      }
    };

    video.onerror = () => {
      setTranscribing(false);
      setError(
        "Unable to read the uploaded video."
      );
    };
  };

  /**
   * Keyboard shortcuts.
   */
  useEffect(() => {
    const handleKeyboard = (
      event: KeyboardEvent
    ) => {
      const target = event.target;

      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement;

      /**
       * Undo
       */
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "z"
      ) {
        event.preventDefault();
        undo();
        return;
      }

      /**
       * Redo
       */
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "y"
      ) {
        event.preventDefault();
        redo();
        return;
      }

      /**
       * Play / pause.
       */
      if (
        event.code === "Space" &&
        !isTyping
      ) {
        event.preventDefault();

        setPlaying(
          (current) => !current
        );

        return;
      }

      /**
       * Delete selected subtitle.
       */
      if (
        event.key === "Delete" &&
        selected &&
        !isTyping
      ) {
        event.preventDefault();

        change(
          segments.filter(
            (segment) =>
              segment.id !== selected
          )
        );

        setSelected(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyboard
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };
  }, [
    segments,
    selected,
    past,
    future,
  ]);

  /**
   * Selected caption text for mobile footer.
   */
  const selectedText = useMemo(() => {
    return (
      segments.find(
        (segment) =>
          segment.id === selected
      )?.text || "Captions"
    );
  }, [segments, selected]);

  /**
   * Export SRT/VTT.
   */
  const exportSubtitles = (
    type: "srt" | "vtt"
  ) => {
    try {
      const content =
        type === "srt"
          ? toSrt(segments)
          : toVtt(segments);

      const blob = new Blob(
        [content],
        {
          type: "text/plain;charset=utf-8",
        }
      );

      const objectUrl =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = objectUrl;
      anchor.download = `captions.${type}`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      setTimeout(() => {
        URL.revokeObjectURL(
          objectUrl
        );
      }, 500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Unable to export ${type.toUpperCase()}`
      );
    }
  };

  /**
   * Render/export video.
   */
  const handleExport = async () => {
    if (busyRef.current) {
      return;
    }

    busyRef.current = true;
    setError("");

    try {
      const response = await fetch(
        "/api/render",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file?.name,
            duration,
            segments,
            style,
            animation,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Render failed"
        );
      }

      if (data?.downloadUrl) {
        window.location.href =
          data.downloadUrl;
      } else {
        alert(
          data?.message ||
            "Render completed."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Render failed"
      );
    } finally {
      busyRef.current = false;
    }
  };

  /**
   * Empty editor/upload screen.
   */
  if (!url) {
    return (
      <main className="min-h-screen bg-zinc-950 px-5 py-6 text-white">
        <header className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Captionit
          </Link>
        </header>

        <div className="mx-auto max-w-2xl pt-24">
          <h1 className="mb-2 text-3xl font-semibold">
            Start a caption project
          </h1>

          <p className="mb-8 text-zinc-500">
            Upload a video and the editor
            will build a timed caption track.
          </p>

          <UploadPanel onVideo={load} />
        </div>
      </main>
    );
  }

  /**
   * Main editor.
   */
  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#09090b] text-white">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-white/10 px-4">
        <Link
          href="/"
          className="text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={17} />
        </Link>

        <div className="min-w-0 font-semibold">
          Captionit

          {file?.name && (
            <span className="ml-2 hidden max-w-[240px] truncate text-xs font-normal text-zinc-600 sm:inline">
              {file.name}
            </span>
          )}
        </div>

        <div className="ml-auto flex gap-2">
          {/* SRT */}
          <button
            type="button"
            onClick={() =>
              exportSubtitles("srt")
            }
            className="hidden items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs transition hover:bg-white/5 sm:flex"
          >
            <FileText size={14} />
            SRT
          </button>

          {/* VTT */}
          <button
            type="button"
            onClick={() =>
              exportSubtitles("vtt")
            }
            className="hidden items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs transition hover:bg-white/5 sm:flex"
          >
            <FileText size={14} />
            VTT
          </button>

          {/* Export */}
          <button
            type="button"
            onClick={handleExport}
            disabled={busyRef.current}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </header>

      {/* Editor layout */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Caption list */}
        <aside className="hidden w-64 shrink-0 border-r border-white/10 lg:block">
          <div className="border-b border-white/10 p-4 text-xs font-medium text-zinc-500">
            CAPTIONS · {segments.length}
          </div>

          <SubtitleEditor
            items={segments}
            selected={selected}
            onSelect={(id) => {
              setSelected(id);

              const segment =
                segments.find(
                  (item) =>
                    item.id === id
                );

              if (segment) {
                setTime(segment.start);
              }
            }}
            onChange={change}
          />
        </aside>

        {/* Center */}
        <section className="flex min-w-0 flex-1 flex-col p-3">
          {/* Preview */}
          <div className="min-h-0 flex-1">
            {transcribing ? (
              <div className="grid h-full place-items-center rounded-2xl border border-white/10 bg-zinc-950">
                <div className="text-center">
                  <Loader2
                    size={28}
                    className="mx-auto animate-spin text-cyan-300"
                  />

                  <p className="mt-4 text-sm">
                    Transcribing your video…
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Building timestamped
                    captions
                  </p>
                </div>
              </div>
            ) : (
              <VideoPreview
                url={url}
                currentTime={time}
                onTime={setTime}
                playing={playing}
                setPlaying={setPlaying}
                segments={segments}
                style={style}
              />
            )}
          </div>

          {/* Timeline */}
          <div className="mt-3 shrink-0">
            <SubtitleTimeline
              segments={segments}
              current={time}
              onSeek={setTime}
              onChange={change}
              zoom={zoom}
              setZoom={setZoom}
              undo={undo}
              redo={redo}
              canUndo={past.length > 0}
              canRedo={future.length > 0}
            />
          </div>
        </section>

        {/* Properties */}
        <aside className="hidden w-72 shrink-0 border-l border-white/10 p-4 xl:block">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <PanelRight size={16} />
            Properties
          </div>

          <StylePanel
            style={style}
            setStyle={setStyle}
            animation={animation}
            setAnimation={setAnimation}
          />
        </aside>
      </div>

      {/* Error */}
      {error && (
        <div className="absolute bottom-4 left-1/2 z-50 flex max-w-[90vw] -translate-x-1/2 items-center rounded-xl border border-red-400/30 bg-red-950/90 px-4 py-3 text-sm text-red-200 shadow-xl">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-3 text-lg leading-none text-red-300 transition hover:text-white"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Mobile footer */}
      <div className="border-t border-white/10 bg-zinc-950 px-4 py-2 text-xs text-zinc-500 lg:hidden">
        {selectedText} ·{" "}
        {time.toFixed(2)}s

        <button
          type="button"
          onClick={() =>
            document
              .querySelectorAll(
                "aside"
              )
              .forEach((element) =>
                element.classList.toggle(
                  "hidden"
                )
              )
          }
          className="ml-2 underline"
        >
          Panels
        </button>
      </div>
    </main>
  );
}