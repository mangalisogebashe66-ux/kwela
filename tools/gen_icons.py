from PIL import Image
from pathlib import Path

SRC = Path(__file__).parent.parent / "img" / "khwela_logo.72975aed.png"
OUT = Path(__file__).parent.parent / "img"

def make_icons():
    if not SRC.exists():
        raise FileNotFoundError(f"Source image not found: {SRC}")
    im = Image.open(SRC).convert("RGBA")

    # Ensure square by padding
    size = max(im.width, im.height)
    square = Image.new("RGBA", (size, size), (0,0,0,0))
    square.paste(im, ((size - im.width)//2, (size - im.height)//2), im)

    # Save various PNG sizes
    sizes_png = {
        "apple-touch-icon.png": (180, 180),
        "icon-192.png": (192, 192),
        "icon-512.png": (512, 512),
    }
    for name, s in sizes_png.items():
        out = OUT / name
        square.resize(s, Image.LANCZOS).save(out, format="PNG")
        print(f"Wrote {out}")

    # Create favicon.ico with multiple sizes
    ico_sizes = [(16,16), (32,32), (48,48), (64,64), (128,128), (256,256)]
    icons = [square.resize(s, Image.LANCZOS) for s in ico_sizes]
    ico_path = OUT / "favicon.ico"
    icons[0].save(ico_path, format="ICO", sizes=ico_sizes)
    print(f"Wrote {ico_path}")

if __name__ == '__main__':
    make_icons()
