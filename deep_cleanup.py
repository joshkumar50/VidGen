import os
import shutil
import signal
import subprocess
import sys
import psutil

def kill_python_processes():
    print("Stopping all Python processes to release file locks...")
    current_pid = os.getpid()
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            if 'python' in proc.info['name'].lower() and proc.info['pid'] != current_pid:
                print(f"  Killing process {proc.info['pid']} ({proc.info['name']})")
                os.kill(proc.info['pid'], signal.SIGTERM)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

def cleanup_corrupted_folders(venv_path):
    site_packages = os.path.join(venv_path, "Lib", "site-packages")
    if not os.path.exists(site_packages):
        print(f"Site-packages not found at {site_packages}")
        return

    print(f"Checking for corrupted folders in {site_packages}...")
    for item in os.listdir(site_packages):
        if item.startswith("~"):
            target = os.path.join(site_packages, item)
            print(f"  Removing corrupted folder: {item}")
            try:
                shutil.rmtree(target, ignore_errors=True)
            except Exception as e:
                print(f"    Failed to remove {item}: {e}")

def main():
    venv_path = os.path.join(os.getcwd(), "venv")
    
    # 1. Kill processes
    try:
        kill_python_processes()
    except ImportError:
        print("psutil not installed, skiping process kill. Please ensure no other python scripts are running.")

    # 2. Cleanup corrupted folders
    cleanup_corrupted_folders(venv_path)

    print("\nDeep cleanup finished. Please run setup again:")
    print(".\venv\Scripts\python.exe setup.py")

if __name__ == "__main__":
    main()
