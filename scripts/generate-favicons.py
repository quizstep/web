"""
Generate centered and enlarged favicon images from the logo-icon-badge source.
The logo-icon-badge.png (256x256) is a circular badge with the QuizStep logo.
We resize it to fill more of the favicon canvas and ensure it's perfectly centered.
"""
from PIL import Image
import os

SOURCE = os.path.join("public", "images", "logo-icon-badge.png")
OUTPUT_DIR = os.path.join("public", "images")

def generate_favicon(source_img, output_path, canvas_size, logo_fill_ratio=0.95):
    """
    Place the source logo centered on a transparent canvas.
    logo_fill_ratio controls how much of the canvas the logo fills (0.0 to 1.0).
    Higher = larger logo.
    """
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    
    # Calculate the size the logo should be
    logo_size = int(canvas_size * logo_fill_ratio)
    
    # Resize the source logo with high-quality resampling
    resized = source_img.resize((logo_size, logo_size), Image.LANCZOS)
    
    # Calculate position to center it
    offset = (canvas_size - logo_size) // 2
    
    # Paste centered
    canvas.paste(resized, (offset, offset), resized)
    
    canvas.save(output_path, "PNG")
    print(f"  Generated: {output_path} ({canvas_size}x{canvas_size}, logo fills {logo_fill_ratio*100:.0f}%)")


def generate_ico(source_img, output_path):
    """Generate a .ico file with multiple sizes."""
    sizes = [(16, 16), (32, 32), (48, 48)]
    icons = []
    for size in sizes:
        canvas = Image.new("RGBA", size, (0, 0, 0, 0))
        logo_size = int(size[0] * 0.95)
        resized = source_img.resize((logo_size, logo_size), Image.LANCZOS)
        offset = (size[0] - logo_size) // 2
        canvas.paste(resized, (offset, offset), resized)
        icons.append(canvas)
    
    icons[0].save(output_path, format="ICO", sizes=[(s.width, s.height) for s in icons], append_images=icons[1:])
    print(f"  Generated: {output_path} (ICO with sizes {[s for s in [(16,16),(32,32),(48,48)]]})") 


if __name__ == "__main__":
    print("Loading source:", SOURCE)
    source = Image.open(SOURCE).convert("RGBA")
    print(f"  Source size: {source.size}")
    
    # Generate favicon.png (32x32) - enlarged to fill 95% of canvas
    generate_favicon(source, os.path.join(OUTPUT_DIR, "favicon.png"), 32, logo_fill_ratio=0.95)
    
    # Generate favicon-64.png (64x64) - enlarged to fill 95% of canvas
    generate_favicon(source, os.path.join(OUTPUT_DIR, "favicon-64.png"), 64, logo_fill_ratio=0.95)
    
    # Generate apple-touch-icon.png (180x180) - enlarged to fill 92% (apple needs slight padding)
    generate_favicon(source, os.path.join(OUTPUT_DIR, "apple-touch-icon.png"), 180, logo_fill_ratio=0.92)
    
    # Generate favicon.ico with multiple sizes
    generate_ico(source, os.path.join("public", "favicon.ico"))
    
    print("\nDone! All favicons regenerated.")
