"use client";

import { useRef, useState } from "react";

type UploadPanelProps = {
  onVideo: (file: File, url: string) => void;
};

export default function UploadPanel({
  onVideo,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (file?: File) => {
    if (!file) return;

    const extension = file.name
      .split(".")
      .pop()
      ?.toLowerCase();

    const allowedExtensions = [
      "mp4",
      "mov",
      "webm",
      "mkv",
    ];

    if (
      !extension ||
      !allowedExtensions.includes(extension)
    ) {
      setError(
        "Please upload an MP4, MOV, WebM, or MKV video."
      );
      return;
    }

    setError("");

    const url = URL.createObjectURL(file);

    onVideo(file, url);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => {
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);

          handleFile(
            event.dataTransfer.files?.[0]
          );
        }}
        className={`cursor-pointer rounded-xl border border-dashed p-10 text-center transition ${
          dragging
            ? "border-cyan-300 bg-cyan-300/10"
            : "border-white/15 hover:border-white/30 hover:bg-white/[0.04]"
        }`}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl">
          ↑
        </div>

        <h3 className="font-medium text-white">
          Drop your video here
        </h3>

        <p className="mt-2 text-sm text-white/50">
          or click to browse your files
        </p>

        <p className="mt-4 text-xs text-white/30">
          MP4 · MOV · WebM · MKV
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/x-matroska,.mkv"
          className="hidden"
          onChange={(event) => {
            handleFile(
              event.target.files?.[0]
            );

            // Allow selecting the same file again.
            event.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}