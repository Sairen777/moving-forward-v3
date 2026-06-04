"""Convert the source photo into abstract, glyph-forward colored ASCII art.

Style goal (per reference): heavy negative space on near-black, the subject
*formed* by clustered light glyphs rather than a dense photo-mosaic. Smooth
regions (sky) fall away to void; textured / warm regions (wheat) build up into
characters. Color is reduced to a few sky-teal + wheat-gold tones and lifted so
glyphs glow on black.

Outputs:
  python tools/asciify.py preview [cols]   -> tools/preview.html (with swatches)
"""
import sys, html, base64, os, datetime
from PIL import Image, ImageFilter
import numpy as np

SRC = "0x1900-000000-80-0-0.jpg"

# sparse -> dense. index 0 is a true space (void); higher = heavier glyph.
RAMP = " .,:;~=+*oae%#@"

# render geometry: monospace cell width/height ratio (measured in-engine).
CHAR_ASPECT = 0.668

# wheat color ramp anchors: deep shadow -> sun-bleached tip (deliberately golden).
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
        img = img.crop((0, int(H0 * crop_top), W0, H0))  # drop the album-title band
    W, H = img.size
    rows = max(1, round(cols * (H / W) * CHAR_ASPECT))

    # per-cell average color (for the palette)
    small = img.resize((cols, rows), Image.LANCZOS)
    rgb = np.asarray(small).astype(np.float32)
    flat = rgb.reshape(-1, 3)
    R, G, B = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    lum = 0.2126 * R + 0.7152 * G + 0.0722 * B

    # detail map: edge energy at 3x supersample, boxed down to the grid
    S = 3
    big = img.resize((cols * S, rows * S), Image.LANCZOS)
    lb = np.asarray(big.convert("L")).astype(np.float32)
    gx = np.abs(np.diff(lb, axis=1, prepend=lb[:, :1]))
    gy = np.abs(np.diff(lb, axis=0, prepend=lb[:1, :]))
    detail = (gx + gy).reshape(rows, S, cols, S).mean((1, 3))

    # warmth: red over blue -> the wheat reads as "subject" and fills in
    warmth = np.clip(R - B, 0, None)
    warm2d = R > B + 6   # wheat (warm) vs sky (cool), per cell

    # ink = how much glyph a cell gets. detail builds texture; warmth fills mass.
    ink = w_detail * _norm(detail, 40, 99) + w_warm * _norm(warmth, 60, 99)
    ink = np.clip(ink, 0, 1) ** gamma

    # carve negative space. thin the sky much harder than the wheat so the sky
    # reads as faint atmosphere, not a field of noise; the wheat keeps its texture.
    thr = np.empty_like(ink)
    thr[warm2d] = np.quantile(ink[warm2d], void) if warm2d.any() else 0.0
    thr[~warm2d] = np.quantile(ink[~warm2d], void_sky) if (~warm2d).any() else 0.0
    keep = ink > thr
    lvl = np.zeros_like(ink)
    if keep.any():
        lvl[keep] = np.clip((ink[keep] - thr[keep]) / (ink.max() - thr[keep]), 0, 1)
    cidx_char = np.where(keep, 1 + np.round(lvl * (len(RAMP) - 2)).astype(int), 0)
    cidx_char = np.clip(cidx_char, 0, len(RAMP) - 1)

    # ---- color ----------------------------------------------------------
    warm = warm2d.reshape(-1)
    # sky: a few cool tones lifted toward the paper so it whispers, not shouts.
    cool_raw = _kquant(flat[~warm], k_cool)
    cool_pal = [tuple(round(v + (255 - v) * sky_fade) for v in c) for c in cool_raw]
    # wheat: a designed golden ramp, deep shadow -> sun-bleached tip, many stops.
    warm_pal = _ramp(WHEAT, k_warm)
    palette = cool_pal + warm_pal

    col = np.empty(flat.shape[0], np.int32)
    col[~warm] = _nearest(flat[~warm], cool_raw)
    # gradient coordinate t in [0,1]: brighter (sunlit) and higher (tips) -> lighter gold.
    yy = (np.arange(flat.shape[0]) // cols).astype(np.float32)
    if warm.any():
        tb = _norm(lum.reshape(-1)[warm], 5, 95)        # luminance: sunlit -> light
        th = 1.0 - _norm(yy[warm], 5, 95)               # height: tips -> light
        t = _norm(w_grad * tb + (1 - w_grad) * th, 3, 97)
        col[warm] = k_cool + np.round(t * (k_warm - 1)).astype(int)
    col = col.reshape(rows, cols)
    # mirror horizontally so the tile wraps seamlessly: the unit is [art | flip(art)],
    # so every repeat seam is a duplicated column -> right edge meets left edge exactly.
    if mirror:
        cidx_char = np.concatenate([cidx_char, cidx_char[:, ::-1]], axis=1)
        col = np.concatenate([col, col[:, ::-1]], axis=1)
        cols *= 2
    return cidx_char, col, palette, cols, rows


def to_html_fragment(chari, col, palette):
    """Run-length encode each row. Space cells carry no color and merge freely,
    which keeps the markup small despite the large void."""
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
    open("tools/preview.html", "w").write(out)
    print(f"grid {c}x{r}, {len(palette)} colors, {filled}% glyphs, {len(out)} bytes")
    for i, (R, G, B) in enumerate(palette):
        print(f"  c{i} #{R:02x}{G:02x}{B:02x}")


def _pack_field(chari, col):
    """One byte per cell: low nibble = glyph index, high nibble = color class.
    Both are <16 (RAMP has 14 glyphs, palette has <=14 colors), so they co-pack."""
    ch = chari.astype(np.uint8) & 0x0f
    cc = (col.astype(np.uint8) & 0x0f) << 4
    return base64.b64encode((ch | cc).tobytes()).decode("ascii")


def _read_template(name):
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), name)
    with open(path, encoding="utf-8") as f:
        return f.read()


def _inject(template, cols=120):
    k_cool = 4
    chari, col, palette, c, r = build(cols=cols, k_cool=k_cool)
    artcss = "\n".join(
        f"    .c{i}{{color:#{R:02x}{G:02x}{B:02x}}}" for i, (R, G, B) in enumerate(palette)
    )
    field = _pack_field(chari, col)
    stamp = datetime.date.today().strftime("%Y.%m.%d")
    out = (template.replace("__ARTCSS__", artcss).replace("__FIELD__", field)
              .replace("__UCOLS__", str(c)).replace("__ROWS__", str(r))
              .replace("__KCOOL__", str(k_cool)).replace("__DH__", str(r))
              .replace("__DATE__", stamp).replace("__NCOLORS__", str(len(palette))))
    return out, c, r, len(palette)


def _build(template_name, out_name, cols=120):
    out, c, r, ncol = _inject(_read_template(template_name), cols)
    with open(out_name, "w", encoding="utf-8") as f:
        f.write(out)
    print(f"wrote {out_name}: {c}x{r} field, {ncol} colors, {len(out)} bytes")


def build_index(cols=120):
    _build("page_template.html", "index.html", cols)


def build_post(cols=120):
    _build("post_template.html", "post.html", cols)


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "preview"
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 120
    if cmd == "preview":
        preview(n)
    elif cmd == "index":
        build_index(n)
    elif cmd == "post":
        build_post(n)
    elif cmd == "all":
        build_index(n)
        build_post(n)
