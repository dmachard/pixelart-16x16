import json
from PIL import Image
import sys
from pathlib import Path

def json_to_png(json_path, output_path=None, pixel_size=1):
    """
    Convert a 16x16 LED matrix JSON file into a PNG image.

    Args:
        json_path (str or Path): Path to the input JSON file.
        output_path (str or Path, optional): Path to save the PNG file.
        pixel_size (int, optional): Scale factor for visualization (default=1 = true 16x16 image).
    """
    json_path = Path(json_path)
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    width = data.get("width", 16)
    height = data.get("height", 16)
    pixels_data = data.get("pixels")

    if not pixels_data:
        raise ValueError("JSON file does not contain a 'pixels' key.")

    # Create a blank RGB image (black background)
    img = Image.new("RGB", (width, height), (0, 0, 0))

    for y in range(height):
        for x in range(width):
            color_hex = pixels_data[y][x]
            if color_hex:
                # Convert "#RRGGBB" → (R, G, B)
                color_rgb = tuple(int(color_hex[i:i+2], 16) for i in (1, 3, 5))
                img.putpixel((x, y), color_rgb)

    # Optionally scale up for better visibility
    if pixel_size > 1:
        img = img.resize((width * pixel_size, height * pixel_size), Image.NEAREST)

    # Define output file name if not provided
    if not output_path:
        output_path = json_path.with_suffix('.png')

    img.save(output_path)
    print(f"✅ PNG saved: {output_path} ({width}x{height})")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python json_to_png.py input.json [pixel_size]")
        sys.exit(1)

    json_file = sys.argv[1]
    pixel_size = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    json_to_png(json_file, pixel_size=pixel_size)
