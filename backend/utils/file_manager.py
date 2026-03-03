import os
import shutil
import tempfile
from pathlib import Path


class FileManager:
    def __init__(self, base_output_dir: str = "outputs"):
        self.base_output_dir = base_output_dir
        self.temp_dir = None
        os.makedirs(base_output_dir, exist_ok=True)

    def create_temp_dir(self) -> str:
        self.temp_dir = tempfile.mkdtemp(prefix="visionflow_")
        return self.temp_dir

    def cleanup_temp(self):
        if self.temp_dir and os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir, ignore_errors=True)
            self.temp_dir = None

    def get_output_path(self, job_id: str, filename: str) -> str:
        job_dir = os.path.join(self.base_output_dir, job_id)
        os.makedirs(job_dir, exist_ok=True)
        return os.path.join(job_dir, filename)

    def get_temp_path(self, filename: str) -> str:
        if not self.temp_dir:
            self.create_temp_dir()
        return os.path.join(self.temp_dir, filename)
