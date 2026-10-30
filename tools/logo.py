"""The AgentiQly.io logo: script A and Q drawn as strokes, the A's right leg curling out like the Q's tail.

Run `python3 tools/logo.py` (needs fonttools and brotli) to rewrite the logo and favicon SVGs in static/assets/.
The site header uses the same strokes inline (see build.py)."""
from pathlib import Path

A_PATHS = ["M30 192 C62 170 92 110 118 30 C132 80 146 140 158 170 C168 192 188 200 214 192",
           "M72 128 C100 120 132 118 164 122"]
Q_PATHS = ["M300 38 C342 38 366 74 366 108 C366 146 338 172 300 172 C260 172 236 142 236 106 C236 70 262 38 300 38 Z",
           "M290 146 C312 170 340 198 406 190"]
A_VIEW, Q_VIEW = "0 0 220 220", "214 20 200 200"


def strokes(paths):
    return "".join(f'<path d="{d}"/>' for d in paths)


def main():
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen
    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer

    assets = Path(__file__).resolve().parent.parent / "static" / "assets"
    font = instancer.instantiateVariableFont(TTFont(assets / "fonts" / "schibsted-grotesk.woff2"), {"wght": 800})
    glyphs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font["hmtx"]
    size, base = 26, 36
    k, track = size / font["head"].unitsPerEm, -0.02 * size

    def text(s, x):
        pen = SVGPathPen(glyphs)
        for ch in s:
            g = cmap[ord(ch)]
            glyphs[g].draw(TransformPen(pen, (k, 0, 0, -k, x, base)))
            x += hmtx[g][0] * k + track
        return pen.getCommands(), x

    genti, x = text("genti", 38)
    qx = x + 1
    ly, x = text("ly", qx + 34)
    io, x = text(".io", x)
    width = round(x + 2)

    def logo(ink, aqua):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} 44" width="{width}" height="44" role="img" aria-label="AgentiQly.io">'
                f'<g fill="none" stroke="{aqua}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">'
                f'<g transform="translate(0 1) scale({38 / 220:.5f})">{strokes(A_PATHS)}</g>'
                f'<g transform="translate({qx:.2f} 5) scale({36 / 200:.5f}) translate(-214 -20)">{strokes(Q_PATHS)}</g></g>'
                f'<path fill="{ink}" d="{genti} {ly}"/><path fill="{aqua}" d="{io}"/></svg>\n')

    (assets / "logo-light.svg").write_text(logo("#0f1b2d", "#17616a"))
    (assets / "logo-dark.svg").write_text(logo("#ffffff", "#6cc3cb"))
    (assets / "favicon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0d141f"/>'
        '<g fill="none" stroke="#6cc3cb" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" '
        f'transform="translate(5 3) scale(.27) translate(-226 -24)">{strokes(Q_PATHS)}</g></svg>\n')
    print("logo width", width)


if __name__ == "__main__":
    main()
