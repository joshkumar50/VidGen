import sys
import torch
import diffusers
import transformers
import accelerate

print(f"--- Final Environment Status ---")
print(f"Python: {sys.version}")
print(f"Torch: {torch.__version__}")
print(f"Diffusers: {diffusers.__version__}")
print(f"Transformers: {transformers.__version__}")
print(f"Accelerate: {accelerate.__version__}")

print(f"\n--- Testing Core AI Imports ---")
try:
    from diffusers import StableDiffusionPipeline
    print("SUCCESS: StableDiffusionPipeline imported.")
    from diffusers.pipelines.stable_diffusion import pipeline_stable_diffusion
    print("SUCCESS: Internal pipeline module imported.")
except Exception as e:
    print(f"FAILED Core AI: {e}")

print(f"\n--- Testing Secondary Tools ---")
try:
    import moviepy
    print("SUCCESS: MoviePy imported.")
    import faster_whisper
    print("SUCCESS: Faster-Whisper imported.")
    import edge_tts
    print("SUCCESS: Edge-TTS imported.")
except Exception as e:
    print(f"FAILED Secondary: {e}")

print(f"\n--- Testing TTS (Coqui) ---")
try:
    import TTS
    print(f"SUCCESS: TTS imported (Version: {TTS.__version__})")
except Exception as e:
    print(f"INFO: Coqui TTS not available: {e}")

print("\n--- Diagnostic Complete ---")
