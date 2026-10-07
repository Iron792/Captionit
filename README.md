# Captionit

Production-oriented Next.js starter for an automatic subtitle editor.

## Current MVP
- Video upload with object URL preview
- MP4/MOV/WebM/MKV validation
- Timestamped demo transcription adapter
- Word-level subtitle highlighting
- Live video/subtitle preview
- Subtitle editing, add/delete, split, undo/redo
- Timeline with seek + zoom
- Style presets and animation controls
- SRT/VTT export
- Modular `/api/transcribe` and `/api/render` boundaries

## Run
```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Production providers
Set `TRANSCRIPTION_PROVIDER` to a real provider and implement its adapter under `lib/transcription`. The render endpoint is intentionally a queue boundary: connect it to a Node worker/container with FFmpeg so large renders never block the Next.js request process.
