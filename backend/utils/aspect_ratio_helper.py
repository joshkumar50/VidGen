from typing import Tuple


RESOLUTIONS = {
    "16:9": {
        "720p":  (1280, 720),
        "1080p": (1920, 1080),
        "1440p": (2560, 1440),
        "sd_native": (768, 432),   # SD 1.5 generation size (divisible by 8)
    },
    "9:16": {
        "720p":  (720, 1280),
        "1080p": (1080, 1920),
        "1440p": (1440, 2560),
        "sd_native": (432, 768),   # SD 1.5 generation size (divisible by 8)
    },
}


def get_generation_size(aspect_ratio: str) -> Tuple[int, int]:
    res = RESOLUTIONS.get(aspect_ratio, RESOLUTIONS["16:9"])
    return res["sd_native"]


def get_output_size(aspect_ratio: str, resolution: str = "1080p") -> Tuple[int, int]:
    res = RESOLUTIONS.get(aspect_ratio, RESOLUTIONS["16:9"])
    return res.get(resolution, res["1080p"])
