#!/usr/bin/env python3
"""Generates public/backdrop/topography.svg, the contour lines behind the top
of the home page (see `.backdrop` in app/globals.css).

A height field of a few peaks, traced at 18 levels with marching squares,
joined into polylines, simplified and smoothed. Contours of a real height
field never cross, which is what makes it read as terrain. Standard library
only; the seed and the peaks fix the result, so a rerun gives the same file.

Usage: python3 scripts/generate-topography.py public/backdrop/topography.svg
"""
import math, random, sys
random.seed(7)
W, H, STEP = 1440, 900, 12           # viewBox and grid cell size
NX, NY = W // STEP + 1, H // STEP + 1
peaks = [(260, 220, 1.0, 230), (980, 160, 0.85, 260), (1250, 620, 0.7, 210),
         (560, 640, 0.75, 240), (90, 760, 0.5, 180), (760, 380, 0.45, 170)]
def h(x, y):
    v = 0.0
    for px, py, a, s in peaks:
        d2 = ((x - px) ** 2 + (y - py) ** 2) / (2 * s * s)
        v += a * math.exp(-d2)
    # ridges and wobble so it reads as terrain, not as cones
    v += 0.06 * math.sin(x / 97 + y / 151) + 0.04 * math.sin(x / 53 - y / 71)
    return v
grid = [[h(i * STEP, j * STEP) for i in range(NX)] for j in range(NY)]
lo = min(min(r) for r in grid); hi = max(max(r) for r in grid)
levels = [lo + (hi - lo) * k / 19 for k in range(1, 19)]

def interp(p1, p2, v1, v2, lv):
    t = (lv - v1) / (v2 - v1) if v2 != v1 else 0.5
    return (p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1]))

def segments(lv):
    segs = []
    for j in range(NY - 1):
        for i in range(NX - 1):
            c = [(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)]
            v = [grid[y][x] for x, y in c]
            idx = sum(1 << k for k in range(4) if v[k] > lv)
            if idx in (0, 15): continue
            P = [(x * STEP, y * STEP) for x, y in c]
            e = {0: interp(P[0], P[1], v[0], v[1], lv), 1: interp(P[1], P[2], v[1], v[2], lv),
                 2: interp(P[2], P[3], v[2], v[3], lv), 3: interp(P[3], P[0], v[3], v[0], lv)}
            table = {1: [(3, 0)], 2: [(0, 1)], 3: [(3, 1)], 4: [(1, 2)], 5: [(3, 0), (1, 2)], 6: [(0, 2)],
                     7: [(3, 2)], 8: [(2, 3)], 9: [(0, 2)], 10: [(0, 1), (2, 3)], 11: [(1, 2)], 12: [(1, 3)],
                     13: [(0, 1)], 14: [(0, 3)]}
            for a, b in table[idx]:
                segs.append((e[a], e[b]))
    return segs

def key(p): return (round(p[0], 3), round(p[1], 3))
def join(segs):
    adj = {}
    for a, b in segs:
        adj.setdefault(key(a), []).append(key(b)); adj.setdefault(key(b), []).append(key(a))
    seen = set(); lines = []
    def ek(a, b): return (a, b) if a < b else (b, a)
    starts = [k for k, n in adj.items() if len(n) == 1] + list(adj.keys())
    for s in starts:
        for n in adj[s]:
            if ek(s, n) in seen: continue
            line = [s]; cur, nxt = s, n
            while True:
                seen.add(ek(cur, nxt)); line.append(nxt)
                cand = [m for m in adj[nxt] if ek(nxt, m) not in seen]
                if not cand: break
                cur, nxt = nxt, cand[0]
            lines.append(line)
    return lines

def rdp(pts, eps):
    if len(pts) < 3: return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1e-9
    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / L
        if d > dmax: dmax, idx = d, i
    if dmax > eps:
        return rdp(pts[:idx + 1], eps)[:-1] + rdp(pts[idx:], eps)
    return [pts[0], pts[-1]]

def smooth_path(pts):
    # quadratic curves through midpoints: smooth, compact
    if len(pts) < 3:
        return "M" + " ".join(f"{x:.0f} {y:.0f}" for x, y in pts)
    f = lambda p: f"{p[0]:.0f} {p[1]:.0f}"
    mids = [((pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2) for i in range(len(pts) - 1)]
    d = f"M{f(pts[0])}L{f(mids[0])}"
    for i in range(1, len(pts) - 1):
        d += f"Q{f(pts[i])} {f(mids[i])}"
    return d + f"L{f(pts[-1])}"

paths = []
for k, lv in enumerate(levels):
    for line in join(segments(lv)):
        # A closed ring starts and ends on the same point, which RDP reads as a
        # zero-length chord and collapses: simplify it as two open halves.
        if len(line) > 4 and math.dist(line[0], line[-1]) < 1e-6:
            half = len(line) // 2
            pts = rdp(line[:half + 1], 2.2)[:-1] + rdp(line[half:], 2.2)
        else:
            pts = rdp(line, 2.2)
        if len(pts) < 2: continue
        length = sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))
        if length < 40: continue
        # every fifth line is an index contour, drawn a little heavier
        paths.append((k % 5 == 4, smooth_path(pts)))
thin = "".join(d for heavy, d in paths if not heavy)
bold = "".join(d for heavy, d in paths if heavy)
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" fill="none" stroke="#000" '
       f'stroke-linecap="round" stroke-linejoin="round">'
       f'<path stroke-width="1" d="{thin}"/><path stroke-width="1.75" d="{bold}"/></svg>\n')
open(sys.argv[1], "w").write(svg)
print(len(svg), "bytes,", len(paths), "lines")
