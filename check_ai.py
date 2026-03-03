import sys
import torch
import diffusers
import transformers
import accelerate

print(f"--- Environment Status ---")
print(f"Python: {sys.version}")
print(f"Torch: {torch.__version__}")
print(f"Diffusers: {diffusers.__version__}")
print(f"Transformers: {transformers.__version__}")
print(f"Accelerate: {accelerate.__version__}")

print(f"\n--- Testing Imports ---")
try:
    from diffusers import StableDiffusionPipeline
    print("SUCCESS: StableDiffusionPipeline imported.")
    
    # The specific line that often fails in old diffusers + torch 2.5
    from diffusers.pipelines.stable_diffusion import pipeline_stable_diffusion
    print("SUCCESS: Internal pipeline module imported.")
    
    # Check torch.distributed
    import torch.distributed
    if hasattr(torch.distributed, 'distributed_c10d'):
        print("SUCCESS: torch.distributed.distributed_c10d exists.")
    else:
        print("WARNING: torch.distributed.distributed_c10d not found directly.")
        
except Exception as e:
    print(f"\n!!! IMPORT FAILED !!!")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n--- ALL TESTS PASSED ---")
