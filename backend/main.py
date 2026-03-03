import os
import uuid
import asyncio
import json
import sys
from typing import Optional
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

# Ensure imports resolve from backend directory
sys.path.insert(0, os.path.dirname(__file__))

from video_pipeline import VideoPipeline

app = FastAPI(title="VisionFlow Studio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve finished videos
os.makedirs("outputs", exist_ok=True)
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# ── In-memory job store ───────────────────────────────────────────────────────
jobs: dict = {}  # job_id -> {status, progress, output_path, error}
pipeline = VideoPipeline()


class GenerationRequest(BaseModel):
    prompt: str
    aspect_ratio: str = "16:9"
    resolution: str = "1080p"
    voice_style: str = "Narrator"
    total_duration: int = 60
    inference_steps: int = 25
    cfg_scale: float = 7.5
    ken_burns_intensity: str = "subtle"
    transition_type: str = "crossfade"
    add_subtitles: bool = True


# ── WebSocket connection pool ─────────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self._connections: dict[str, WebSocket] = {}

    async def connect(self, job_id: str, ws: WebSocket):
        await ws.accept()
        self._connections[job_id] = ws

    def disconnect(self, job_id: str):
        self._connections.pop(job_id, None)

    async def send(self, job_id: str, data: dict):
        ws = self._connections.get(job_id)
        if ws:
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                self.disconnect(job_id)


manager = ConnectionManager()


# ── Background generation task ────────────────────────────────────────────────
async def run_generation(job_id: str, req: GenerationRequest):
    jobs[job_id]["status"] = "running"

    def on_progress(msg: str):
        # msg format: "stage:images|Generating image 2/6"
        parts = msg.split("|", 1)
        stage = parts[0].replace("stage:", "") if len(parts) > 1 else "processing"
        text = parts[1] if len(parts) > 1 else msg
        jobs[job_id]["progress"] = {"stage": stage, "message": text}
        asyncio.create_task(manager.send(job_id, {"event": "progress", "stage": stage, "message": text}))

    try:
        output_path = await pipeline.generate(
            job_id=job_id,
            prompt=req.prompt,
            aspect_ratio=req.aspect_ratio,
            resolution=req.resolution,
            voice_style=req.voice_style,
            total_duration=req.total_duration,
            inference_steps=req.inference_steps,
            cfg_scale=req.cfg_scale,
            ken_burns_intensity=req.ken_burns_intensity,
            transition_type=req.transition_type,
            add_subtitles=req.add_subtitles,
            progress_callback=on_progress,
        )
        jobs[job_id]["status"] = "done"
        jobs[job_id]["output_path"] = output_path
        file_size = os.path.getsize(output_path) if os.path.exists(output_path) else 0
        await manager.send(job_id, {
            "event": "done",
            "video_url": f"/outputs/{job_id}/output.mp4",
            "file_size": file_size,
        })
    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)
        await manager.send(job_id, {"event": "error", "message": str(e)})


# ── REST Endpoints ────────────────────────────────────────────────────────────
@app.post("/api/generate")
async def generate_video(req: GenerationRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "queued", "progress": {}, "output_path": None, "error": None}
    background_tasks.add_task(run_generation, job_id, req)
    return {"job_id": job_id}


@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str):
    job = jobs.get(job_id)
    if not job:
        return {"error": "Job not found"}
    return job


@app.delete("/api/jobs/{job_id}")
async def cancel_job(job_id: str):
    if job_id in jobs:
        jobs[job_id]["status"] = "cancelled"
    return {"ok": True}


@app.post("/api/upload-music")
async def upload_music(file: UploadFile = File(...)):
    """Allow users to upload background music."""
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    dest = os.path.join(upload_dir, f"music_{uuid.uuid4()}{Path(file.filename).suffix}")
    with open(dest, "wb") as f:
        f.write(await file.read())
    return {"path": dest}


@app.get("/api/health")
async def health():
    import torch
    return {
        "status": "ok",
        "cuda_available": torch.cuda.is_available(),
        "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU only",
        "vram_total_gb": round(torch.cuda.get_device_properties(0).total_memory / 1e9, 2) if torch.cuda.is_available() else 0,
        "vram_free_gb": round((torch.cuda.get_device_properties(0).total_memory - torch.cuda.memory_allocated(0)) / 1e9, 2) if torch.cuda.is_available() else 0,
    }


# ── WebSocket Progress ────────────────────────────────────────────────────────
@app.websocket("/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    await manager.connect(job_id, websocket)
    try:
        # Send current state immediately
        job = jobs.get(job_id, {})
        await websocket.send_text(json.dumps({"event": "connected", "status": job.get("status", "unknown")}))
        while True:
            await websocket.receive_text()  # keep alive
    except WebSocketDisconnect:
        manager.disconnect(job_id)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
