import re
from typing import List, Dict

class SceneParser:
    def __init__(self):
        pass

    def parse(self, prompt: str, total_duration: int = 60) -> List[Dict]:
        """
        Splits a prompt into 6-12 scenes.
        If scenes are already explicitly divided (e.g., by double newlines or numbers), use those.
        Otherwise, split by sentences or paragraphs.
        """
        # Simple rule-based splitter
        # Look for existing scene markers like "Scene 1:", "1.", or double newlines
        if "\n\n" in prompt:
            scenes_raw = [s.strip() for s in prompt.split("\n\n") if s.strip()]
        elif re.search(r'\d+\.', prompt):
            scenes_raw = [s.strip() for s in re.split(r'\d+\.', prompt) if s.strip()]
        else:
            # Fallback: split by sentences (very basic)
            scenes_raw = [s.strip() for s in re.split(r'[.!?]\s+', prompt) if s.strip()]

        # Limit to 12 scenes max, 6 min (if possible)
        if len(scenes_raw) > 12:
            # Merge some scenes if too many
            scenes_raw = scenes_raw[:12]
        
        # Ensure we have at least 1 scene
        if not scenes_raw:
            scenes_raw = [prompt]

        # Calculate duration per scene
        scene_duration = max(3, total_duration // len(scenes_raw))
        
        parsed_scenes = []
        for i, text in enumerate(scenes_raw):
            parsed_scenes.append({
                "index": i,
                "text": text,
                "duration": scene_duration,
                "image_prompt": f"Photorealistic, high quality, 8k, {text}" # Basic prompt enhancement
            })
        
        return parsed_scenes
