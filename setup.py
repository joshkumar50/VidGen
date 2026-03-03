"""
VisionFlow Studio — Setup script.
Run this before starting the app for the first time.
It checks CUDA, installs PyTorch with CUDA 11.8, and all dependencies.
"""
import subprocess
import sys
import os

def run(cmd: list, check: bool = True):
    print(f"\n> {' '.join(cmd)}")
    result = subprocess.run(cmd, check=check)
    return result.returncode

def main():
    print("=" * 60)
    print("   VisionFlow Studio — First-time Setup")
    print("=" * 60)

    # 1. Install PyTorch with CUDA 11.8
    print("\n[1/5] Installing PyTorch with CUDA 11.8...")
    run([
        sys.executable, "-m", "pip", "install",
        "torch", "torchvision", "torchaudio",
        "--index-url", "https://download.pytorch.org/whl/cu118"
    ])

    # 2. Check CUDA (via subprocess to avoid library locks)
    print("\n[2/5] Checking CUDA availability...")
    check_code = "import torch; print(f'CUDA_OK:{torch.cuda.is_available()}'); print(f'GPU:{torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"None\"}')"
    try:
        result = subprocess.check_output([sys.executable, "-c", check_code], text=True)
        print(result)
    except Exception as e:
        print(f"  CUDA check failed or not yet installed: {e}")

    # 3. Install main requirements
    print("\n[3/5] Installing main requirements...")
    run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

    # 4. Install xformers (optional but speeds up SD on CUDA)
    print("\n[4/5] Attempting to install xformers (optional, may fail on some systems)...")
    run([sys.executable, "-m", "pip", "install", "xformers"], check=False)

    # 5. Create output dirs
    print("\n[5/5] Creating output directories...")
    for d in ["outputs", "uploads"]:
        os.makedirs(d, exist_ok=True)
        print(f"  Created: {d}/")

    print("\n" + "=" * 60)
    print("   Setup complete!")
    print("   Run the backend:  python backend/main.py")
    print("   Run the frontend: cd frontend && npm run dev")
    print("=" * 60)

if __name__ == "__main__":
    main()
