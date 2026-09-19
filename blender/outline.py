"""
Traced 2D outlines, shared with the browser model.

These are the same figures as src/models/profiles.ts. Keeping one authority for
the silhouette matters: the GLB and the procedural fallback have to be the same
blaster, or switching between them changes the product.

Coordinates: +X toward the muzzle, +Y up. Depth is added by extrusion.
"""

BODY = [
    (1.30, -0.10), (1.30, 0.13), (1.06, 0.15), (1.06, 0.21),
    (-0.70, 0.21), (-0.86, 0.19), (-0.95, 0.12),
    (-0.95, -0.12), (-0.80, -0.15),
    (-0.90, -0.88), (-0.62, -0.95), (-0.45, -0.30),
    (-0.38, -0.26), (-0.34, -0.44), (-0.14, -0.48), (-0.08, -0.30), (-0.07, -0.18),
    (0.06, -0.18), (0.10, -0.70), (0.44, -0.72), (0.42, -0.18),
    (1.06, -0.16),
]

SLIDE = [
    (-0.62, 0.21), (1.02, 0.21), (1.02, 0.38), (0.90, 0.42), (-0.50, 0.42), (-0.62, 0.36),
]

STOCK = [
    (-0.95, 0.16), (-1.46, 0.12), (-1.54, 0.00), (-1.52, -0.30),
    (-1.40, -0.42), (-1.18, -0.40), (-1.14, -0.20), (-0.95, -0.18),
]

# Real dimensions in millimetres, from docs/REFERENCES.md.
MM_PER_UNIT = 154.0


def mm(v):
    """Millimetres to world units."""
    return v / MM_PER_UNIT
