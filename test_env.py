import sys
import torch
print(f"Python: {sys.version}")
print(f"Torch: {torch.__version__}")
try:
    from diffusers import StableDiffusionPipeline
    print("Successfully imported Stable Diffusion Pipeline!")
    # Test loading a small part to check for GroupName error
    from diffusers.pipelines.stable_diffusion import pipeline_stable_diffusion
    print("Successfully imported Stable Diffusion internal modules!")
except Exception as e:
    print(f"FAILED: {e}")
    sys.exit(1)
