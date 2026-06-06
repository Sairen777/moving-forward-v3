"""Convert the source photo into abstract, glyph-forward colored ASCII art.

The main output for the SolidStart site is ``src/lib/field-data.ts``. The
preview command is kept for tuning the quantizer, but the generated web pages
from the old static build are retired.
"""
import base64
import datetime
import html
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

TOOLS_DIR = Path(__file__).resolve().parent
ROOT_DIR = TOOLS_DIR.parent
SRC = TOOLS_DIR / "0x1900-000000-80-0-0.jpg"
FIELD_DATA = ROOT_DIR / "src" / "lib" / "field-data.ts"
SOURCE_NAME = "wheat.jpg"

# sparse -> dense. index 0 is a true space (void); higher = heavier glyph.
RAMP = " .,:;~=+*oae%#@"

# render geometry: monospace cell width/height ratio measured in-engine.
CHAR_ASPECT = 0.668

# wheat color ramp anchors: deep shadow -> sun-bleached tip.
WHEAT = [
    (74, 44, 22), (112, 70, 30), (148, 98, 40), (180, 126, 50),
    (204, 152, 60), (222, 176, 78), (234, 198, 110), (244, 218, 146),
]


def _kquant(pixels, k):
    """Median-cut a flat list of RGB pixels into <=k representative colors."""
    im = Image.fromarray(pixels.reshape(-1, 1, 3).astype("uint8"), "RGB")
    q = im.quantize(colors=k, method=Image.MEDIANCUT, dither=Image.NONE)
    pf = q.getpalette()[: k * 3]
    return [tuple(pf[i * 3:i * 3 + 3]) for i in range(k)]


def _nearest(pixels, pal):
    pal = np.asarray(pal, np.float32)
    d = ((pixels[:, None, :] - pal[None, :, :]) ** 2).sum(2)
    return d.argmin(1)


def _norm(a, lo=2, hi=98):
    plo, phi = np.percentile(a, lo), np.percentile(a, hi)
    return np.clip((a - plo) / max(1e-6, phi - plo), 0, 1)


def _ramp(anchors, n):
    """Piecewise-linear interpolation of RGB anchor stops into n colors."""
    if n <= 1:
        return [tuple(map(round, anchors[0]))]
    segs = len(anchors) - 1
    out = []
    for i in range(n):
        u = i / (n - 1) * segs
        k = min(int(u), segs - 1)
        f = u - k
        a, b = anchors[k], anchors[k + 1]
        out.append(tuple(round(a[j] + (b[j] - a[j]) * f) for j in range(3)))
    return out


def build(cols=120, k_cool=4, k_warm=10, void=0.42, void_sky=0.72, gamma=0.85,
          w_detail=0.75, w_warm=0.6, crop_top=0.16, mirror=True,
          w_grad=0.6, sky_fade=0.55):
    img = Image.open(SRC).convert("RGB")
    W0, H0 = img.size
    if crop_top:
        img = img.crop((0, int(H0 * crop_top), W0, H0))
    W, H = img.size
    rows = max(1, round(cols * (H / W) * CHAR_ASPECT))

    small = img.resize((cols, rows), Image.LANCZOS)
    rgb = np.asarray(small).astype(np.float32)
    flat = rgb.reshape(-1, 3)
    R, G, B = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    lum = 0.2126 * R + 0.7152 * G + 0.0722 * B

    S = 3
    big = img.resize((cols * S, rows * S), Image.LANCZOS)
    lb = np.asarray(big.convert("L")).astype(np.float32)
    gx = np.abs(np.diff(lb, axis=1, prepend=lb[:, :1]))
    gy = np.abs(np.diff(lb, axis=0, prepend=lb[:1, :]))
    detail = (gx + gy).reshape(rows, S, cols, S).mean((1, 3))

    warmth = np.clip(R - B, 0, None)
    warm2d = R > B + 6

    ink = w_detail * _norm(detail, 40, 99) + w_warm * _norm(warmth, 60, 99)
    ink = np.clip(ink, 0, 1) ** gamma

    thr = np.empty_like(ink)
    thr[warm2d] = np.quantile(ink[warm2d], void) if warm2d.any() else 0.0
    thr[~warm2d] = np.quantile(ink[~warm2d], void_sky) if (~warm2d).any() else 0.0
    keep = ink > thr
    lvl = np.zeros_like(ink)
    if keep.any():
        lvl[keep] = np.clip((ink[keep] - thr[keep]) / (ink.max() - thr[keep]), 0, 1)
    cidx_char = np.where(keep, 1 + np.round(lvl * (len(RAMP) - 2)).astype(int), 0)
    cidx_char = np.clip(cidx_char, 0, len(RAMP) - 1)

    warm = warm2d.reshape(-1)
    cool_raw = _kquant(flat[~warm], k_cool)
    cool_pal = [tuple(round(v + (255 - v) * sky_fade) for v in c) for c in cool_raw]
    warm_pal = _ramp(WHEAT, k_warm)
    palette = cool_pal + warm_pal

    col = np.empty(flat.shape[0], np.int32)
    col[~warm] = _nearest(flat[~warm], cool_raw)
    yy = (np.arange(flat.shape[0]) // cols).astype(np.float32)
    if warm.any():
        tb = _norm(lum.reshape(-1)[warm], 5, 95)
        th = 1.0 - _norm(yy[warm], 5, 95)
        t = _norm(w_grad * tb + (1 - w_grad) * th, 3, 97)
        col[warm] = k_cool + np.round(t * (k_warm - 1)).astype(int)
    col = col.reshape(rows, cols)

    if mirror:
        cidx_char = np.concatenate([cidx_char, cidx_char[:, ::-1]], axis=1)
        col = np.concatenate([col, col[:, ::-1]], axis=1)
        cols *= 2
    return cidx_char, col, palette, cols, rows


def to_html_fragment(chari, col, palette):
    """Run-length encode each row for the preview page."""
    rows, cols = chari.shape
    css = "\n".join(
        f"  .c{i}{{color:#{r:02x}{g:02x}{b:02x}}}" for i, (r, g, b) in enumerate(palette)
    )
    out = []
    for y in range(rows):
        parts, x = [], 0
        while x < cols:
            ch = RAMP[chari[y, x]]
            if ch == " ":
                n = 0
                while x < cols and RAMP[chari[y, x]] == " ":
                    n += 1
                    x += 1
                parts.append("&#160;" * n)
            else:
                c = int(col[y, x])
                run = []
                while x < cols and RAMP[chari[y, x]] != " " and int(col[y, x]) == c:
                    run.append(RAMP[chari[y, x]])
                    x += 1
                parts.append(f'<span class="c{c}">{html.escape("".join(run))}</span>')
        out.append("".join(parts))
    return css, "\n".join(out)


def preview(cols=130):
    chari, col, palette, c, r = build(cols=cols)
    css, body = to_html_fragment(chari, col, palette)
    filled = int((chari > 0).mean() * 100)
    sw = "".join(f'<i style="background:#{R:02x}{G:02x}{B:02x}"></i>' for (R, G, B) in palette)
    out = f"""<!doctype html><meta charset=utf-8><title>preview {c}x{r} {len(palette)}c {filled}%</title>
<style>
  html,body{{margin:0;background:#0d1013}}
  pre{{font:11px/1 ui-monospace,Menlo,monospace;white-space:pre;margin:0;padding:18px;
       color:#9aa}}
{css}
  .sw{{position:fixed;top:8px;right:8px;display:flex;gap:2px}}
  .sw i{{width:22px;height:22px;display:block;border:1px solid #fff3}}
</style>
<div class=sw>{sw}</div>
<pre>{body}</pre>
"""
    out_path = TOOLS_DIR / "preview.html"
    out_path.write_text(out, encoding="utf-8")
    print(f"grid {c}x{r}, {len(palette)} colors, {filled}% glyphs, {len(out)} bytes")
    print(f"wrote {out_path.relative_to(ROOT_DIR)}")
    for i, (R, G, B) in enumerate(palette):
        print(f"  c{i} #{R:02x}{G:02x}{B:02x}")


def _pack_field(chari, col):
    """One byte per cell: low nibble = glyph index, high nibble = color class."""
    ch = chari.astype(np.uint8) & 0x0f
    cc = (col.astype(np.uint8) & 0x0f) << 4
    return base64.b64encode((ch | cc).tobytes()).decode("ascii")


def _hex_palette(palette):
    return [f"#{R:02x}{G:02x}{B:02x}" for R, G, B in palette]


def _field_payload(cols=120):
    k_cool = 4
    chari, col, palette, c, r = build(cols=cols, k_cool=k_cool)
    return {
        "cols": c,
        "rows": r,
        "kCool": k_cool,
        "chars": RAMP,
        "palette": _hex_palette(palette),
        "data": _pack_field(chari, col),
        "generated": datetime.date.today().strftime("%Y.%m.%d"),
        "source": SOURCE_NAME,
        "sourceFile": SRC.name,
    }


def _write_field_module(payload, out_path=FIELD_DATA):
    module = (
        "export type FieldPayload = {\n"
        "  readonly cols: number;\n"
        "  readonly rows: number;\n"
        "  readonly kCool: number;\n"
        "  readonly chars: string;\n"
        "  readonly palette: readonly string[];\n"
        "  readonly data: string;\n"
        "  readonly generated: string;\n"
        "  readonly source: string;\n"
        "  readonly sourceFile: string;\n"
        "};\n\n"
        f"export const field = {json.dumps(payload, separators=(',', ':'))} as const satisfies FieldPayload;\n"
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(module, encoding="utf-8")
    print(
        f"wrote {out_path.relative_to(ROOT_DIR)}: {payload['cols']}x{payload['rows']} field, "
        f"{len(payload['palette'])} colors, {len(module)} bytes"
    )


def build_field(cols=120):
    _write_field_module(_field_payload(cols))


def _usage():
    print("usage: tools/asciify.py [field|preview] [cols]")
    print("  field   write src/lib/field-data.ts, default 120 source columns")
    print("  preview write tools/preview.html for visual tuning")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "preview"
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 120
    if cmd == "preview":
        preview(n)
    elif cmd == "field":
        build_field(n)
    else:
        _usage()
        raise SystemExit(2)
