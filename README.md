# VisionFlow Studio 🎬

A complete **local AI Video Generator** that turns text prompts into MP4 videos with Ken Burns effects, AI narration, and auto-generated subtitles — running entirely on your **RTX 3050 (4GB VRAM)**.

---

## Features

| Feature | Technology |
|---|---|
| 🎨 Image generation | Stable Diffusion 1.5 (fp16) |
| 🎙️ Voice narration | Coqui XTTS-v2 |
| 📝 Subtitles | OpenAI Whisper base (CPU) |
| 🎞️ Ken Burns + stitching | MoviePy + FFmpeg |
| 🌐 Web UI | React + Vite + Tailwind CSS |
| ⚡ Backend API | FastAPI + WebSocket |

---

## Requirements

- **OS**: Windows or Linux
- **GPU**: NVIDIA RTX 3050 (4GB VRAM) or better
- **CUDA**: 11.8
- **Python**: 3.10+
- **Node.js**: 18+
- **FFmpeg**: Installed and on PATH (`ffmpeg -version` should work)

> **FFmpeg Installation (Windows):**  
> Download from https://ffmpeg.org/download.html, extract, and add the `bin/` folder to your system PATH.

---

## First-Time Setup

```bash
# From the visionflow-studio/ directory
python setup.py
```

This will:
1. Install PyTorch with CUDA 11.8
2. Verify GPU / VRAM
3. Install all Python dependencies
4. Attempt to install xformers (optional, ~30% VRAM savings)
5. Create `outputs/` and `uploads/` directories

> ⚠️ **First run downloads ~5–10 GB of models** (SD 1.5, XTTS-v2, Whisper base). They are cached locally and never re-downloaded.

---

## Running the App

### Terminal 1 — Backend

```bash
cd visionflow-studio/backend
python main.py
```

Backend runs at: `http://localhost:8000`  
API docs at: `http://localhost:8000/docs`

### Terminal 2 — Frontend

```bash
cd visionflow-studio/frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## VRAM Optimization Details

| Technique | Savings |
|---|---|
| `torch.float16` | ~50% VRAM |
| `enable_attention_slicing` | ~20% VRAM |
| `enable_vae_slicing` | ~10% VRAM |
| Sequential image gen (batch=1) | No OOM peaks |
| Whisper on CPU | Saves ~1 GB |
| `torch.cuda.empty_cache()` after each image | Prevents fragmentation |

---

## Project Structure

```
visionflow-studio/
├── backend/
│   ├── main.py                  # FastAPI + WebSocket server
│   ├── video_pipeline.py        # Orchestration logic
│   ├── models/
│   │   ├── image_generator.py   # SD 1.5 wrapper
│   │   ├── tts_engine.py        # Coqui XTTS-v2 wrapper
│   │   ├── subtitle_generator.py# Whisper wrapper (CPU)
│   │   └── video_composer.py    # MoviePy Ken Burns + stitching
│   └── utils/
│       ├── scene_parser.py      # Prompt → scene list
│       ├── aspect_ratio_helper.py
│       └── file_manager.py
├── frontend/
│   └── src/
│       ├── pages/Studio.tsx     # Main UI page
│       └── components/          # UI components
├── outputs/                     # Generated MP4s
├── requirements.txt
├── setup.py
└── README.md
```

---

## Video Pipeline

```
Text Prompt
    │
    ▼
SceneParser → [Scene 1 text, Scene 2 text, ...]
    │
    ▼
ImageGenerator (SD 1.5, GPU, fp16) → scene_0000.png, scene_0001.png, ...
    │
    ▼
TTSEngine (XTTS-v2) → narration.wav
    │
    ▼
SubtitleGenerator (Whisper base, CPU) → subtitles.srt
    │
    ▼
VideoComposer (MoviePy)
  ├── Ken Burns effect on each image
  ├── Crossfade transitions
  ├── Subtitle burn-in
  └── Audio mix → output.mp4
```

---

## Output Specs

| Setting | Value |
|---|---|
| Codec | H.264 (libx264) |
| Audio | AAC |
| FPS | 24 |
| Quality | CRF 18 (high quality) |
| 16:9 resolution | 1920 × 1080 |
| 9:16 resolution | 1080 × 1920 |

---

## Troubleshooting

**Backend is offline (frontend shows red indicator)**  
→ Make sure `python backend/main.py` is running in a separate terminal.

**VRAM Out of Memory**  
→ The pipeline automatically retries on CPU if OOM is detected. For persistent issues, reduce inference steps to 15 in Advanced Options.

**FFmpeg not found**  
→ Install FFmpeg and ensure `ffmpeg` is on your system PATH.

**Models downloading slowly**  
→ SD 1.5 (~4 GB) and XTTS-v2 (~2 GB) only download once. Be patient on first run.
