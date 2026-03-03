import os
import asyncio
import uuid
from typing import Callable, Optional

from utils.scene_parser import SceneParser
from utils.file_manager import FileManager
from utils.aspect_ratio_helper import get_generation_size, get_output_size
from models.image_generator import ImageGenerator
from models.tts_engine import TTSEngine
from models.subtitle_generator import SubtitleGenerator
from models.video_composer import VideoComposer


class VideoPipeline:
    def __init__(self):
        self.scene_parser = SceneParser()
        self.file_manager = FileManager(base_output_dir="outputs")
        self.image_gen = ImageGenerator()
        self.tts_engine = TTSEngine()
        self.subtitle_gen = SubtitleGenerator()

    async def generate(
        self,
        job_id: str,
        prompt: str,
        aspect_ratio: str = "16:9",
        resolution: str = "1080p",
        voice_style: str = "Narrator",
        total_duration: int = 60,
        inference_steps: int = 25,
        cfg_scale: float = 7.5,
        ken_burns_intensity: str = "subtle",
        transition_type: str = "crossfade",
        add_subtitles: bool = True,
        background_music_path: Optional[str] = None,
        progress_callback: Optional[Callable] = None,
    ) -> str:
        """
        Full async video generation pipeline.
        Returns the path to the final MP4.
        """
        temp_dir = self.file_manager.create_temp_dir()

        def _progress(msg: str):
            print(f"[{job_id}] {msg}")
            if progress_callback:
                asyncio.get_event_loop().call_soon_threadsafe(progress_callback, msg)

        # ── 1. Scene parsing ──────────────────────────────────────────────
        _progress("stage:parsing|Parsing scenes from prompt...")
        scenes = await asyncio.to_thread(self.scene_parser.parse, prompt, total_duration)
        total_scenes = len(scenes)
        _progress(f"stage:parsing|Found {total_scenes} scenes")

        # ── 2. Image generation ───────────────────────────────────────────
        output_size = get_output_size(aspect_ratio, resolution)  # (w, h)

        for i, scene in enumerate(scenes):
            _progress(f"stage:images|Generating image {i+1}/{total_scenes}")
            image_path = os.path.join(temp_dir, f"scene_{i:04d}.png")

            # Retry up to 3 times on failure
            for attempt in range(3):
                try:
                    await asyncio.to_thread(
                        self.image_gen.generate,
                        prompt=scene["image_prompt"],
                        aspect_ratio=aspect_ratio,
                        seed=42 + i + attempt,
                        output_path=image_path,
                        num_inference_steps=inference_steps,
                        guidance_scale=cfg_scale
                    )
                    break
                except Exception as e:
                    if "out of memory" in str(e).lower():
                        import torch
                        torch.cuda.empty_cache()
                        _progress(f"stage:images|OOM on attempt {attempt+1}, retrying with CPU...")
                        self.image_gen.device = "cpu"
                    else:
                        raise

            scene["image_path"] = image_path

        # ── 3. TTS narration ──────────────────────────────────────────────
        _progress("stage:audio|Generating narration audio...")
        narration_text = " ".join(s["text"] for s in scenes)
        audio_path = os.path.join(temp_dir, "narration.wav")
        await asyncio.to_thread(
            self.tts_engine.generate_speech,
            text=narration_text,
            voice_style=voice_style,
            output_path=audio_path,
        )

        srt_subtitles = None
        if add_subtitles:
            _progress("stage:subtitles|Transcribing audio for subtitles...")
            srt_path = os.path.join(temp_dir, "subtitles.srt")
            srt_subtitles = await asyncio.to_thread(
                self.subtitle_gen.generate_srt,
                audio_path=audio_path,
                srt_output_path=srt_path,
            )

        # ── 5. Video composition ──────────────────────────────────────────
        _progress("stage:video|Composing final video...")
        composer = VideoComposer(fps=24, output_size=output_size)
        output_mp4 = self.file_manager.get_output_path(job_id, "output.mp4")
        await asyncio.to_thread(
            composer.compose_video,
            scenes=scenes,
            audio_path=audio_path,
            srt_subtitles=srt_subtitles,
            output_path=output_mp4,
            ken_burns_intensity=ken_burns_intensity,
            transition_type=transition_type,
            add_subtitles=add_subtitles,
            background_music_path=background_music_path,
            progress_callback=lambda msg: _progress(f"stage:video|{msg}"),
        )
        
        # ── 6. Cleanup ────────────────────────────────────────────────────
        await asyncio.to_thread(self.file_manager.cleanup_temp)
        _progress(f"stage:done|Video saved to {output_mp4}")
        return output_mp4
