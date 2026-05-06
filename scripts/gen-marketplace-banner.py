#!/usr/bin/env python3
"""Build docs/assets/marketplace/banner-220x140.png — gradient, flat doc+sparkle icon, fitted title."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/assets/marketplace/banner-220x140.png"

W, H = 220, 140


def gradient_blue(img: Image.Image, draw: ImageDraw.ImageDraw) -> None:
    top = (88, 156, 255)
    bot = (24, 72, 168)
    for y in range(H):
        t = y / max(H - 1, 1)
        c = tuple(int(top[i] * (1 - t) + bot[i] * t) for i in range(3))
        draw.line([(0, y), (W, y)], fill=c)


def draw_sparkle(draw: ImageDraw.ImageDraw, cx: float, cy: float, r: float) -> None:
    gold = (251, 191, 36)
    gold_dark = (234, 162, 19)
    pts = [
        (cx, cy - r),
        (cx + r * 0.28, cy - r * 0.28),
        (cx + r, cy),
        (cx + r * 0.28, cy + r * 0.28),
        (cx, cy + r),
        (cx - r * 0.28, cy + r * 0.28),
        (cx - r, cy),
        (cx - r * 0.28, cy - r * 0.28),
    ]
    draw.polygon(pts, fill=gold, outline=gold_dark)


def draw_doc_icon(draw: ImageDraw.ImageDraw, ox: int, oy: int) -> None:
    """Flat Google-Docs-style sheet + lines + sparkle (no outer white plate)."""
    # Soft “paper” so it doesn’t read as a harsh white slab on blue
    paper = (248, 252, 255)
    line_c = (52, 103, 185)
    fold_c = (214, 226, 242)

    pw, ph = 52, 68
    r = 8
    draw.rounded_rectangle([ox, oy, ox + pw, oy + ph], radius=r, fill=paper, outline=line_c)

    fs = 14
    fx1, fy1 = ox + pw - fs, oy
    fx2, fy2 = ox + pw, oy + fs
    draw.polygon(
        [(fx1, fy1), (fx2, fy1), (fx2, fy2), (fx1 + 4, fy2), (fx1, fy1 + fs)],
        fill=fold_c,
        outline=line_c,
    )

    lx0 = ox + 10
    lw_full = pw - 18
    y = oy + 22
    for lw in (lw_full, int(lw_full * 0.72), int(lw_full * 0.55)):
        draw.rounded_rectangle([lx0, y, lx0 + lw, y + 5], radius=2, fill=line_c)
        y += 11

    draw_sparkle(draw, ox + pw + 2, oy + 7, 10)


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for path in candidates:
        if Path(path).is_file():
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def main() -> None:
    banner = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(banner)
    gradient_blue(banner, draw)

    icon_w = 72
    ix = 14
    iy = (H - 72) // 2 + 2
    draw_doc_icon(draw, ix, iy)

    title = "Beauty File"
    text_left = ix + icon_w + 12
    max_right = W - 14

    font = None
    tw = th = 0
    for size in range(23, 13, -1):
        font = load_font(size)
        bbox = draw.textbbox((0, 0), title, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        if text_left + tw <= max_right:
            break

    ty = (H - th) // 2 - 4
    shadow = (15, 45, 105)
    for ox, oy in ((1, 1),):
        draw.text((text_left + ox, ty + oy), title, font=font, fill=shadow)
    draw.text((text_left, ty), title, font=font, fill=(255, 255, 255))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    banner.save(OUT, "PNG", optimize=True)
    print(f"Wrote {OUT.relative_to(ROOT)} ({W}x{H})")


if __name__ == "__main__":
    main()
