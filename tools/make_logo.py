"""Builds the AgentiQly.io logo SVGs: script A and Q strokes plus the bold sans letters as outlines."""
import json, sys, os
G = json.load(open(sys.argv[1]))  # glyph outlines in font units (Schibsted Grotesk 800), baseline y=0
OUT = sys.argv[2]
A_PATHS = ["M22 188 C52 186 78 150 104 92 C120 56 132 30 140 22 C146 60 156 118 166 160 C172 186 188 199 218 192",
           "M70 132 C100 118 140 116 176 120"]
Q_PATHS = ["M352 58 C326 26 268 28 246 76 C226 120 248 172 296 170 C344 168 368 120 356 82 C350 62 336 50 318 48",
           "M296 148 C318 176 342 196 404 192"]
K = 13.4            # font units per sketch unit
BASE = 194          # sketch y that sits on the baseline (A's foot)
SW = 15             # stroke width in sketch units

def strokes(paths, dx, cls):
    # sketch coords -> font units: x' = (x - x0)*K + dx, y' = (y - BASE)*K
    return "".join(f'<path class="{cls}" pathLength="1" d="{d}"/>' for d in paths), dx

def wordmark(text_fill, aqua, animate=False):
    parts = []
    a_x0, a_x1 = 14, 222
    q_x0, q_x1 = 236, 410
    x = 0
    a = f'<g transform="translate({x - a_x0*K:.0f} {-BASE*K:.0f}) scale({K})" fill="none" stroke="{aqua}" stroke-width="{SW}" stroke-linecap="round" stroke-linejoin="round">' + "".join(f'<path class="s" pathLength="1" d="{d}"/>' for d in A_PATHS) + "</g>"
    parts.append(a); x += (a_x1 - a_x0) * K + 60
    parts.append(f'<path fill="{text_fill}" transform="translate({x:.0f} 0)" d="{G["genti"]["d"]}"/>'); x += G["genti"]["adv"] + 40
    q = f'<g transform="translate({x - q_x0*K:.0f} {-(BASE+2)*K:.0f}) scale({K})" fill="none" stroke="{aqua}" stroke-width="{SW}" stroke-linecap="round" stroke-linejoin="round">' + "".join(f'<path class="s" pathLength="1" d="{d}"/>' for d in Q_PATHS) + "</g>"
    parts.append(q); x += (q_x1 - q_x0) * K - 420
    parts.append(f'<path fill="{text_fill}" transform="translate({x:.0f} 0)" d="{G["ly"]["d"]}"/>'); x += G["ly"]["adv"]
    io = G["ly.io"]["d"]  # not used directly
    return parts, x

def svg_wordmark(text_fill, aqua, dot_io_fill, title="AgentiQly.io"):
    parts, x = wordmark(text_fill, aqua)
    # ".io" = the last three glyphs of "ly.io": rebuild from the per-word outline by offset
    parts.append(f'<path fill="{dot_io_fill}" transform="translate({x - G["ly"]["adv"]:.0f} 0)" d="{G["ly.io"]["io_d"]}"/>')
    x += G["ly.io"]["adv"] - G["ly"]["adv"]
    top, bottom = -2350, 420
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 {top} {x+120:.0f} {bottom-top}" role="img" aria-label="{title}"><title>{title}</title>' + "".join(parts) + "</svg>", (x + 120, bottom - top)

def svg_q(bg, aqua, size_sw=SW*1.6, pad=24):
    vb = f"{226-pad} {20-pad} {186+2*pad} {186+2*pad}"
    rect = f'<rect x="{226-pad}" y="{20-pad}" width="{186+2*pad}" height="{186+2*pad}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">{rect}<g fill="none" stroke="{aqua}" stroke-width="{size_sw}" stroke-linecap="round" stroke-linejoin="round">' + "".join(f'<path d="{d}"/>' for d in Q_PATHS) + "</g></svg>"

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    light, dims = svg_wordmark("#0f1b2d", "#17616a", "#17616a")
    dark, _ = svg_wordmark("#ffffff", "#6cc3cb", "#6cc3cb")
    cur, _ = svg_wordmark("currentColor", "var(--aqua)", "var(--aqua)")
    open(f"{OUT}/logo-light.svg", "w").write(light)
    open(f"{OUT}/logo-dark.svg", "w").write(dark)
    open(f"{OUT}/logo-inline.svg", "w").write(cur)
    open(f"{OUT}/favicon.svg", "w").write(svg_q("#0d141f", "#6cc3cb"))
    open(f"{OUT}/mark-q.svg", "w").write(svg_q(None, "#17616a", SW, 6))
    print("wordmark size (font units)", dims)
