"""Stack review stills into one labeled sheet, to look at many frames at once.

    uv run --with pillow python3 scripts/sheet.py out/review/v1 sheet.png [--cols 6] [--width 300]
"""

import argparse
import glob
import os
import re

from PIL import Image, ImageDraw

parser = argparse.ArgumentParser()
parser.add_argument("folder")
parser.add_argument("out")
parser.add_argument("--cols", type=int, default=6)
parser.add_argument("--width", type=int, default=300)
args = parser.parse_args()

files = sorted(glob.glob(os.path.join(args.folder, "f*.png")), key=lambda p: int(re.findall(r"\d+", os.path.basename(p))[0]))
first = Image.open(files[0])
w = args.width
h = round(first.height * w / first.width)
rows = (len(files) + args.cols - 1) // args.cols
sheet = Image.new("RGB", (args.cols * (w + 6) + 6, rows * (h + 30) + 6), "#333333")
draw = ImageDraw.Draw(sheet)
for i, path in enumerate(files):
    x = 6 + (i % args.cols) * (w + 6)
    y = 6 + (i // args.cols) * (h + 30)
    sheet.paste(Image.open(path).convert("RGB").resize((w, h), Image.LANCZOS), (x, y + 24))
    frame = int(re.findall(r"\d+", os.path.basename(path))[0])
    draw.text((x + 4, y + 6), f"f{frame}  {frame / 60:.2f}s", fill="#ffffff")
sheet.save(args.out)
print(args.out, sheet.size)
