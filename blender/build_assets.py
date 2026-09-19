"""
AIMBOT v2.0 — generates public/models/aimbot.glb

Run headless:
    blender --background --python blender/build_assets.py

Why this exists: the in-browser model is authored as flat extrusions of a traced
2D profile. That gives a readable silhouette but a slab — constant thickness,
no crown across the face, and edges that are either knife-sharp or, if the
bevel is pushed far enough to see, thick enough to swallow the profile. There
is no parameter that fixes it, because the limitation is the representation.

Blender gets three things the browser path cannot:

  * curve extrusion with a true bevel radius, so the face crowns and rolls into
    the edge the way moulded ABS actually does;
  * a Bevel modifier with an angle limit, which rounds real edges and leaves
    the intentional creases alone;
  * weighted normals and auto-smoothing, so a low-poly mesh shades like a
    moulded surface rather than a faceted one.

Every part is exported as a separately named object, because the scroll
timeline drives each one independently.
"""

import math
import os
import sys

import bpy

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from outline import BODY, SLIDE, STOCK, mm  # noqa: E402

OUT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "public", "models", "aimbot.glb",
)

# ----------------------------------------------------------------------------
# scene helpers
# ----------------------------------------------------------------------------


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.curves, bpy.data.materials):
        for item in list(block):
            if item.users == 0:
                block.remove(item)


def material(name, colour, roughness=0.5, metallic=0.0, emission=None):
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*colour, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission is not None:
        # socket names moved between Blender versions
        for key in ("Emission Color", "Emission"):
            if key in bsdf.inputs:
                bsdf.inputs[key].default_value = (*emission, 1.0)
                break
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = 1.4
    return mat


def finish(obj, mat, bevel_width=0.008, segments=3, smooth_angle=38.0):
    """Round the edges, weight the normals, shade it like a moulded part."""
    obj.data.materials.clear()
    obj.data.materials.append(mat)

    if bevel_width > 0:
        bevel = obj.modifiers.new(name="Bevel", type="BEVEL")
        bevel.width = bevel_width
        bevel.segments = segments
        bevel.limit_method = "ANGLE"
        bevel.angle_limit = math.radians(50)
        bevel.harden_normals = True

    wn = obj.modifiers.new(name="WeightedNormal", type="WEIGHTED_NORMAL")
    wn.keep_sharp = True

    for poly in obj.data.polygons:
        poly.use_smooth = True

    # auto-smooth moved to a modifier in 4.1; set it whichever way exists
    if hasattr(obj.data, "use_auto_smooth"):
        obj.data.use_auto_smooth = True
        obj.data.auto_smooth_angle = math.radians(smooth_angle)
    else:
        bpy.context.view_layer.objects.active = obj
        try:
            bpy.ops.object.shade_auto_smooth(angle=math.radians(smooth_angle))
        except Exception:
            pass

    return obj


def profile_solid(name, points, depth, radius, resolution=4):
    """
    A traced outline turned into a crowned solid.

    Curve extrusion with a bevel radius is what the browser path cannot do: the
    radius rolls the face over into the edge on all sides at once, so the part
    reads as moulded rather than cut out of sheet.
    """
    curve = bpy.data.curves.new(name + "_curve", type="CURVE")
    curve.dimensions = "2D"
    curve.fill_mode = "BOTH"
    curve.resolution_u = 6
    curve.extrude = max(0.0, depth - radius)
    curve.bevel_depth = radius
    curve.bevel_resolution = resolution

    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for i, (x, y) in enumerate(points):
        spline.points[i].co = (x, y, 0.0, 1.0)
    spline.use_cyclic_u = True

    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)

    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    obj.select_set(False)

    # profile is drawn in XY with +Y up; stand it upright for Blender's Z-up
    obj.rotation_euler = (math.radians(90), 0, 0)
    return obj


def box(name, size, location=(0, 0, 0), rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    obj.rotation_euler = rotation
    return obj


def cylinder(name, radius, depth, location=(0, 0, 0), rotation=(0, 0, 0), verts=32):
    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius, depth=depth, vertices=verts, location=location
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.rotation_euler = rotation
    return obj


def apply_transforms(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    obj.select_set(False)


def join(name, objects):
    """Merge parts that always move together, so the export stays cheap."""
    if not objects:
        return None
    bpy.ops.object.select_all(action="DESELECT")
    for o in objects:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    if len(objects) > 1:
        bpy.ops.object.join()
    merged = bpy.context.active_object
    merged.name = name
    bpy.ops.object.select_all(action="DESELECT")
    return merged


def bisect_half(obj, keep_positive, name):
    """
    Cut a solid body at the parting plane and cap the cut.

    The real blaster is two moulded halves screwed together, and beat 3 splits
    them laterally to show the cavity. Modelling the body whole and then
    bisecting it gives both halves a flat, properly capped parting face —
    which is what you actually see when the shell opens.
    """
    import bmesh

    obj.name = name
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")

    bm = bmesh.from_edit_mesh(obj.data)
    bmesh.ops.bisect_plane(
        bm,
        geom=list(bm.verts) + list(bm.edges) + list(bm.faces),
        plane_co=(0, 0, 0),
        plane_no=(0, 1, 0),
        clear_inner=not keep_positive,
        clear_outer=keep_positive,
    )
    bmesh.update_edit_mesh(obj.data)

    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.region_to_loop()
    try:
        bpy.ops.mesh.edge_face_add()
    except RuntimeError:
        pass
    bpy.ops.object.mode_set(mode="OBJECT")
    return obj


# ----------------------------------------------------------------------------
# materials
# ----------------------------------------------------------------------------

MAT = {}


def build_materials():
    MAT["shell"] = material("shell", (0.92, 0.91, 0.88), roughness=0.42)
    MAT["accent"] = material("accent", (0.09, 0.09, 0.11), roughness=0.45)
    MAT["trim"] = material("trim", (0.88, 0.47, 0.05), roughness=0.38)
    MAT["metal"] = material("metal", (0.70, 0.70, 0.75), roughness=0.22, metallic=0.95)
    MAT["pcb"] = material("pcb", (0.08, 0.28, 0.14), roughness=0.7)
    MAT["breakout"] = material("breakout", (0.18, 0.12, 0.42), roughness=0.68)
    MAT["perf"] = material("perf", (0.36, 0.22, 0.11), roughness=0.85)
    MAT["black"] = material("black", (0.05, 0.05, 0.06), roughness=0.6)
    MAT["led"] = material("led", (0.30, 0.95, 0.45), roughness=0.3, emission=(0.2, 1.0, 0.35))
    for i, c in enumerate(
        [(0.75, 0.18, 0.15), (0.85, 0.55, 0.10), (0.15, 0.50, 0.25),
         (0.12, 0.35, 0.70), (0.45, 0.20, 0.70), (0.80, 0.80, 0.80)]
    ):
        MAT["wire%d" % i] = material("wire%d" % i, c, roughness=0.42)


# ----------------------------------------------------------------------------
# the blaster
# ----------------------------------------------------------------------------


def build_shell():
    body = profile_solid("body_solid", BODY, depth=0.25, radius=0.045, resolution=5)
    apply_transforms(body)

    right = body
    left = body.copy()
    left.data = body.data.copy()
    bpy.context.collection.objects.link(left)

    bisect_half(left, keep_positive=True, name="shell_left")
    bisect_half(right, keep_positive=False, name="shell_right")

    finish(left, MAT["shell"], bevel_width=0.006, segments=3)
    finish(right, MAT["shell"], bevel_width=0.006, segments=3)

    slide = profile_solid("slide", SLIDE, depth=0.21, radius=0.03, resolution=4)
    apply_transforms(slide)
    finish(slide, MAT["accent"], bevel_width=0.005, segments=3)

    # picatinny teeth along the slide, which is where the Retaliator carries
    # its single tactical rail
    teeth = []
    for i in range(13):
        t = i / 12.0
        x = -0.42 + t * 1.28
        teeth.append(box("tooth_%d" % i, (0.045, 0.17, 0.05), location=(x, 0.0, 0.44)))
    rail = join("rail", teeth)
    apply_transforms(rail)
    finish(rail, MAT["accent"], bevel_width=0.004, segments=2)

    return [left, right, slide, rail]


def build_furniture():
    stock = profile_solid("stock", STOCK, depth=0.18, radius=0.035, resolution=4)
    apply_transforms(stock)
    finish(stock, MAT["shell"], bevel_width=0.006, segments=3)

    # barrel extension — a body of revolution, so it is spun rather than traced
    barrel = cylinder("barrel", 0.125, 0.66, location=(1.65, 0, 0.0),
                      rotation=(0, math.radians(90), 0), verts=40)
    apply_transforms(barrel)
    finish(barrel, MAT["shell"], bevel_width=0.006, segments=3)

    muzzle = cylinder("muzzle", 0.135, 0.06, location=(1.97, 0, 0.0),
                      rotation=(0, math.radians(90), 0), verts=40)
    apply_transforms(muzzle)
    finish(muzzle, MAT["trim"], bevel_width=0.004, segments=2)

    sight = box("sight", (0.07, 0.02, 0.13), location=(1.72, 0, 0.17))
    apply_transforms(sight)
    finish(sight, MAT["accent"], bevel_width=0.004, segments=2)

    foregrip = cylinder("foregrip", 0.105, 0.56, location=(0.84, 0, -0.46), verts=32)
    apply_transforms(foregrip)
    finish(foregrip, MAT["trim"], bevel_width=0.008, segments=3)

    mag = box("mag", (0.30, 0.34, 0.62), location=(0.27, 0, -0.62))
    apply_transforms(mag)
    finish(mag, MAT["accent"], bevel_width=0.01, segments=3)

    trigger = box("trigger", (0.055, 0.10, 0.19), location=(-0.24, 0, -0.32))
    apply_transforms(trigger)
    finish(trigger, MAT["trim"], bevel_width=0.006, segments=3)

    return [stock, barrel, muzzle, sight, foregrip, mag, trigger]


# ----------------------------------------------------------------------------
# internals — real millimetre sizes, from docs/REFERENCES.md
# ----------------------------------------------------------------------------


def build_internals():
    out = []

    # Raspberry Pi Pico: 51 x 21 x 1 mm, micro-USB overhanging the top edge,
    # 40 castellated pins, RP2040 package, BOOTSEL, green LED on GP25.
    parts = [box("pico_board", (mm(51), mm(21), mm(1)))]
    parts[0].data.materials.append(MAT["pcb"])
    chip = box("pico_chip", (mm(7), mm(7), mm(1)), location=(0, 0, mm(1)))
    usb = box("pico_usb", (mm(6), mm(7.5), mm(2.6)), location=(mm(27), 0, mm(1)))
    boot = cylinder("pico_boot", mm(1.5), mm(1.2), location=(mm(15), 0, mm(1)), verts=12)
    led = box("pico_led", (mm(1.6), mm(1.2), mm(0.8)), location=(mm(9), mm(6), mm(1)))

    pins = []
    for i in range(20):
        x = (i - 9.5) * mm(2.54)
        for side in (1, -1):
            pins.append(
                box("pin_%d_%d" % (i, side), (mm(1.4), mm(1.2), mm(1.4)),
                    location=(x, side * mm(10.5), 0))
            )

    pico_metal = join("pico_metal", [chip, usb] + pins)
    apply_transforms(pico_metal)
    finish(pico_metal, MAT["metal"], bevel_width=mm(0.2), segments=2)
    apply_transforms(boot)
    finish(boot, MAT["black"], bevel_width=mm(0.2), segments=2)
    apply_transforms(led)
    finish(led, MAT["led"], bevel_width=0, segments=0)
    apply_transforms(parts[0])
    finish(parts[0], MAT["pcb"], bevel_width=mm(0.3), segments=2)

    pico = join("pico", [parts[0], pico_metal, boot, led])
    pico.location = (-0.24, 0, -0.04)
    out.append(pico)

    # MPU-9250 breakout: 3 x 3 mm QFN die on a ~25 x 15 mm board
    imu_board = box("imu_board", (mm(25), mm(15), mm(1.2)))
    apply_transforms(imu_board)
    finish(imu_board, MAT["breakout"], bevel_width=mm(0.3), segments=2)
    die = box("imu_die", (mm(3), mm(3), mm(1)), location=(0, 0, mm(1.1)))
    header = []
    for i in range(9):
        header.append(
            box("imu_pin_%d" % i, (mm(0.65), mm(0.65), mm(6)),
                location=((i - 4) * mm(2.54), -mm(6), mm(2)))
        )
    imu_metal = join("imu_metal", header)
    apply_transforms(imu_metal)
    finish(imu_metal, MAT["metal"], bevel_width=mm(0.15), segments=2)
    apply_transforms(die)
    finish(die, MAT["black"], bevel_width=mm(0.2), segments=2)
    imu = join("imu", [imu_board, die, imu_metal])
    imu.location = (0.16, 0, 0.17)
    out.append(imu)

    # Omron D2FC micro-switch, out of a dead Logitech mouse
    omron_body = box("omron_body", (mm(12.8), mm(5.8), mm(6.5)))
    apply_transforms(omron_body)
    finish(omron_body, MAT["shell"], bevel_width=mm(0.3), segments=2)
    lever = box("omron_lever", (mm(11), mm(3.5), mm(0.35)),
                location=(mm(1.2), 0, mm(4.2)), rotation=(0, math.radians(-7), 0))
    apply_transforms(lever)
    finish(lever, MAT["metal"], bevel_width=mm(0.1), segments=2)
    legs = []
    for x in (-mm(4), 0, mm(4)):
        legs.append(box("omron_leg", (mm(0.8), mm(0.5), mm(4)), location=(x, 0, -mm(5))))
    omron_legs = join("omron_legs", legs)
    apply_transforms(omron_legs)
    finish(omron_legs, MAT["metal"], bevel_width=mm(0.1), segments=2)
    omron = join("omron", [omron_body, lever, omron_legs])
    omron.location = (-0.37, 0, -0.27)
    out.append(omron)

    # four 6x6mm tactile switches, split across both sides of the shell
    btns = []
    clusters = [(-0.40, -mm(38), -0.26), (0.24, mm(38), -0.08)]
    for ci, (cx, cy, cz) in enumerate(clusters):
        for i in range(2):
            along = (i - 0.5) * mm(14)
            b = box("btn_body_%d_%d" % (ci, i), (mm(6), mm(6), mm(3.2)),
                    location=(cx + along, cy, cz))
            p = cylinder("btn_plunger_%d_%d" % (ci, i), mm(1.7), mm(1.6),
                         location=(cx + along, cy, cz + mm(2.4)), verts=12)
            btns.extend([b, p])
    buttons = join("buttons", btns)
    apply_transforms(buttons)
    finish(buttons, MAT["metal"], bevel_width=mm(0.3), segments=2)
    out.append(buttons)

    # 10k potentiometer — the accessibility dial
    pot_body = cylinder("pot_body", mm(5), mm(7), location=(0, 0, 0), verts=24)
    shaft = cylinder("pot_shaft", mm(3), mm(12), location=(0, 0, mm(9)), verts=20)
    collar = cylinder("pot_collar", mm(3.5), mm(3), location=(0, 0, mm(4.5)), verts=20)
    pot = join("pot", [pot_body, shaft, collar])
    apply_transforms(pot)
    finish(pot, MAT["metal"], bevel_width=mm(0.3), segments=3)
    pot.location = (1.02, 0.12, -0.58)
    pot.rotation_euler = (math.radians(80), 0, 0)
    out.append(pot)

    # KY-023 thumb joystick on the front stability handle
    js_board = box("js_board", (mm(34), mm(26), mm(1.6)))
    gimbal = box("js_gimbal", (mm(22), mm(22), mm(11)), location=(0, 0, mm(6)))
    cap = cylinder("js_cap", mm(8), mm(5), location=(0, 0, mm(15)), verts=24)
    stick = cylinder("js_stick", mm(3), mm(6), location=(0, 0, mm(11)), verts=16)
    apply_transforms(js_board)
    finish(js_board, MAT["breakout"], bevel_width=mm(0.3), segments=2)
    js_black = join("js_black", [gimbal, cap, stick])
    apply_transforms(js_black)
    finish(js_black, MAT["black"], bevel_width=mm(0.6), segments=3)
    joystick = join("joystick", [js_board, js_black])
    joystick.location = (0.86, 0.15, -0.30)
    joystick.rotation_euler = (math.radians(20), 0, 0)
    out.append(joystick)

    # perfboard on the floor of the cavity
    pcb = box("pcb", (mm(70), mm(30), mm(1.6)), location=(-0.18, 0, -0.15))
    apply_transforms(pcb)
    finish(pcb, MAT["perf"], bevel_width=mm(0.3), segments=2)
    out.append(pcb)

    # USB tail out of the grip base
    usb_shell = box("usb_shell", (mm(12), mm(7), mm(5)))
    usb_boot = box("usb_boot", (mm(18), mm(11), mm(9)), location=(-mm(14), 0, 0))
    apply_transforms(usb_shell)
    finish(usb_shell, MAT["metal"], bevel_width=mm(0.3), segments=2)
    apply_transforms(usb_boot)
    finish(usb_boot, MAT["black"], bevel_width=mm(1), segments=3)
    usb = join("usb", [usb_shell, usb_boot])
    usb.location = (-0.86, 0, -0.99)
    usb.rotation_euler = (0, math.radians(-28), 0)
    out.append(usb)

    return out


def build_wiring():
    """
    Dupont jumpers as swept curves.

    A bevelled curve gives a real round cross-section that follows the path, so
    the harness drapes instead of looking like bent tube segments. The routing
    is deliberately loose — the references are explicit that the inside of this
    build is not tidy, and pretending otherwise would misrepresent it.
    """
    runs = [
        ("i2c", (-0.24, 0, -0.04), (0.16, 0, 0.17), (0.02, 0.03, 0.10), 4),
        ("gpio_r", (-0.24, 0, -0.04), (-0.40, -0.23, -0.26), (-0.34, -0.12, -0.16), 3),
        ("gpio_l", (-0.24, 0, -0.04), (0.24, 0.23, -0.08), (0.02, 0.12, -0.04), 3),
        ("adc_pot", (-0.24, 0, -0.04), (1.02, 0.12, -0.58), (0.42, 0.08, -0.30), 3),
        ("adc_js", (-0.24, 0, -0.04), (0.86, 0.15, -0.30), (0.34, 0.10, -0.12), 3),
        ("usb", (-0.24, 0, -0.04), (-0.86, 0, -0.99), (-0.60, 0.02, -0.50), 2),
    ]

    strands = []
    for ri, (name, a, mid, b, count) in enumerate(
        [(r[0], r[1], r[3], r[2], r[4]) for r in runs]
    ):
        for i in range(count):
            jitter = (i - count / 2.0) * 0.008
            curve = bpy.data.curves.new("%s_%d" % (name, i), type="CURVE")
            curve.dimensions = "3D"
            curve.bevel_depth = mm(0.7)
            curve.bevel_resolution = 3
            curve.resolution_u = 8

            spline = curve.splines.new("NURBS")
            spline.points.add(2)
            pts = [
                (a[0] + jitter, a[1] + jitter, a[2]),
                (mid[0] + jitter, mid[1] + jitter * 2, mid[2] - 0.02),
                (b[0] + jitter, b[1] + jitter, b[2]),
            ]
            for j, p in enumerate(pts):
                spline.points[j].co = (p[0], p[1], p[2], 1.0)
            spline.use_endpoint_u = True
            spline.order_u = 3

            obj = bpy.data.objects.new("%s_%d" % (name, i), curve)
            bpy.context.collection.objects.link(obj)
            bpy.context.view_layer.objects.active = obj
            obj.select_set(True)
            bpy.ops.object.convert(target="MESH")
            obj.select_set(False)
            obj.data.materials.append(MAT["wire%d" % ((ri + i) % 6)])
            strands.append(obj)

    wires = join("wires", strands)
    return [wires] if wires else []


def export_glb():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")

    kwargs = dict(
        filepath=OUT,
        export_format="GLB",
        export_apply=True,          # bake the bevel and normal modifiers
        export_yup=True,
        export_materials="EXPORT",
        export_normals=True,
    )
    try:
        bpy.ops.export_scene.gltf(**kwargs)
    except (AttributeError, TypeError):
        kwargs.pop("export_normals", None)
        bpy.ops.export_scene.gltf(**kwargs)

    size = os.path.getsize(OUT)
    print("WROTE %s (%.2f MB)" % (OUT, size / 1024 / 1024))
    return size


def main():
    clear_scene()
    build_materials()

    objects = []
    objects += build_shell()
    objects += build_furniture()
    objects += build_internals()
    objects += build_wiring()

    print("PARTS: " + ", ".join(sorted(o.name for o in objects if o)))
    print("OBJECT COUNT: %d" % len([o for o in objects if o]))

    total = 0
    for o in bpy.data.objects:
        if o.type == "MESH":
            total += len(o.data.polygons)
    print("POLYGONS (pre-modifier): %d" % total)

    export_glb()


if __name__ == "__main__":
    main()
