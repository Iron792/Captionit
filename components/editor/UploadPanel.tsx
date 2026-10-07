"use client";

import { useRef, useState } from "react";

type UploadPanelProps = {
  onVideoLoaded?: (url: string, file: File) => void;
};

export default function UploadPanel({
  onVideoLoaded,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (file?: File) => {
    if (!file) return;

    const allowed = [
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "video/x-matroska",
    ];

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!allowed.includes(file.type) && !["mp4", "mov", "webm", "mkv"].includes(extension || "")) {
      setError("Please upload an MP4, MOV, WebM, or MKV video.");
      return;
    }

    setError("");

    const url = URL.createObjectURL(file);
    onVideoLoaded?.(url, file);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border border-dashed p-10 text-center transition ${
          dragging
            ? "border-white/50 bg-white/10"
            : "border-white/15 hover:border-white/30 hover:bg-white/[0.04]"
        }`}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-xl">
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
          onChange={(e) => handleFile(e.target.files?.[0])}
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