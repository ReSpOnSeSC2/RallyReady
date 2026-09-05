"""Build the RallyReady CoachCam Rolls & Sprawls vertical-slice asset.

Run with Blender 5.1+:
  blender --background --factory-startup --python tools/blender/build_rolls_and_sprawls.py

The file is intentionally procedural and dependency free.  It creates a stylised
volleyball court, two articulated athletes, three live-ball exchanges, coaching
guides, three embedded cameras, one continuous animation action, a .blend source,
browser-ready GLB, and QA preview renders.
"""

from __future__ import annotations

import json
import math
import os
from pathlib import Path

import bpy
from mathutils import Matrix, Quaternion, Vector


FPS = 30
SAMPLE_RATE = 2
FRAME_END = 420
CLIP_NAME = "CoachCam_RollsSprawls"
ROOT = Path(__file__).resolve().parents[2]
GLB_PATH = ROOT / "models" / "coachcam" / "rolls-and-sprawls.glb"
BLEND_PATH = ROOT / "design-assets" / "blender" / "rolls-and-sprawls.blend"
PREVIEW_DIR = ROOT / "design-assets" / "blender" / "previews"

# Adult reference proportions in metres. End effectors and joint poles are
# animated, but bones never change length, including between authored poses.
BODY = {"TORSO": 0.58, "HEAD": 0.27, "UARM": 0.32, "FARM": 0.28,
        "THIGH": 0.44, "SHIN": 0.43, "FOOT": 0.25, "HAND": 0.16}
FLOOR_Z = 0.06

for directory in (GLB_PATH.parent, BLEND_PATH.parent, PREVIEW_DIR):
    directory.mkdir(parents=True, exist_ok=True)


def rgba(hex_color: str, alpha: float = 1.0):
    value = hex_color.lstrip("#")
    return tuple(int(value[i : i + 2], 16) / 255.0 for i in (0, 2, 4)) + (alpha,)


def material(name, color, metallic=0.0, roughness=0.5, emission=None, alpha=1.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color[:3], alpha)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color[:3], alpha)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Alpha"].default_value = alpha
    if emission:
        socket = bsdf.inputs.get("Emission Color") or bsdf.inputs.get("Emission")
        if socket:
            socket.default_value = (*emission[:3], 1.0)
        strength = bsdf.inputs.get("Emission Strength")
        if strength:
            strength.default_value = 2.5
    if alpha < 1:
        mat.surface_render_method = "DITHERED"
    return mat


def apply_bevel(obj, width=0.08, segments=3):
    bevel = obj.modifiers.new("Edge softening", "BEVEL")
    bevel.width = width
    bevel.segments = segments
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.modifier_apply(modifier=bevel.name)
    obj.select_set(False)


def cube(name, location, dimensions, mat, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        apply_bevel(obj, min(bevel, min(dimensions) * 0.45))
    obj.data.materials.append(mat)
    return obj


def cylinder_between(name, start, end, radius, mat, vertices=20):
    start, end = Vector(start), Vector(end)
    direction = end - start
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=direction.length)
    obj = bpy.context.object
    obj.name = name
    obj.location = (start + end) / 2
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(direction.normalized())
    obj.data.materials.append(mat)
    return obj


def sphere(name, location, radius, mat, segments=24, rings=12):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=location, radius=radius)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj


def curve_mesh(name, splines, mat, bevel_depth=0.035):
    curve_data = bpy.data.curves.new(name + "_Curve", "CURVE")
    curve_data.dimensions = "3D"
    curve_data.resolution_u = 2
    curve_data.bevel_depth = bevel_depth
    curve_data.bevel_resolution = 3
    for points in splines:
        spline = curve_data.splines.new("POLY")
        spline.points.add(len(points) - 1)
        for point, co in zip(spline.points, points):
            point.co = (*co, 1.0)
    obj = bpy.data.objects.new(name, curve_data)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    obj = bpy.context.object
    obj.name = name
    obj.select_set(False)
    return obj


def text_mesh(name, text, location, size, mat):
    data = bpy.data.curves.new(name + "_Font", "FONT")
    data.body = text
    data.align_x = "CENTER"
    data.align_y = "CENTER"
    data.size = size
    data.extrude = 0.008
    data.bevel_depth = 0.003
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.data.materials.append(mat)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    obj = bpy.context.object
    obj.name = name
    obj.select_set(False)
    return obj


def look_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def camera(name, location, target, lens):
    data = bpy.data.cameras.new(name)
    data.lens = lens
    data.sensor_width = 36
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    look_at(obj, target)
    return obj


def create_world_and_court(mats):
    world = bpy.data.worlds.new("CoachCam World")
    bpy.context.scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = rgba("#07111f")
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.32

    cube("ArenaFloor", (0, 0, -0.22), (16.5, 25, 0.35), mats["floor"], 0.18)
    court = cube("Court", (0, 0, -0.04), (9, 18, 0.12), mats["court"], 0.08)
    court["width_m"] = 9.0
    court["length_m"] = 18.0
    court["surface"] = "indoor volleyball"

    line_z = 0.035
    # Sidelines and baselines.
    for x in (-4.46, 4.46):
        cube(f"Sideline_{x:+.2f}", (x, 0, line_z), (0.08, 18, 0.025), mats["line"])
    for y in (-8.96, 8.96):
        cube(f"Baseline_{y:+.2f}", (0, y, line_z), (9, 0.08, 0.025), mats["line"])
    for y in (-3, 0, 3):
        cube(f"CourtLine_{y:+.0f}", (0, y, line_z), (9, 0.06, 0.022), mats["line"])

    # Net and posts, with enough grid to read clearly in the wide camera.
    for x in (-4.9, 4.9):
        cylinder_between(f"NetPost_{x:+.1f}", (x, 0, 0), (x, 0, 2.75), 0.075, mats["navy"])
        cylinder_between(f"PostPad_{x:+.1f}", (x, 0, 0.05), (x, 0, 1.25), 0.13, mats["coral"])
    cylinder_between("NetTopTape", (-4.6, 0, 2.43), (4.6, 0, 2.43), 0.035, mats["line"])
    cylinder_between("NetBottomTape", (-4.6, 0, 1.15), (4.6, 0, 1.15), 0.018, mats["line"])
    for x in [i * 0.38 - 4.56 for i in range(25)]:
        cylinder_between(f"NetV_{x:+.2f}", (x, 0, 1.16), (x, 0, 2.42), 0.008, mats["net"])
    for z in [1.18 + i * 0.16 for i in range(8)]:
        cylinder_between(f"NetH_{z:.2f}", (-4.58, 0, z), (4.58, 0, z), 0.007, mats["net"])

    # Court-aware teaching stations: the geometry shows where each save belongs.
    right_arc = [(0.35 + 0.24 * i, -5.72 + 0.035 * i * i, 0.065) for i in range(8)]
    left_arc = [(-x, y, z) for x, y, z in right_arc]
    arc = curve_mesh("SafetyRollArc", [right_arc, left_arc], mats["guide"], 0.045)
    arc["coaching_cue"] = "Contact low; rotate diagonally across the outer shoulder and upper back, never the head or spine."
    arc["phase"] = "right and left shoulder roll"

    landing = cube("SprawlLanding", (0, -4.36, 0.025), (1.55, 2.15, 0.035), mats["landing"], 0.28)
    landing["coaching_cue"] = "Reach first, then distribute landing through chest and hips while the head stays lifted."
    landing["phase"] = "forward sprawl"

    # Direction arrow on the landing zone.
    curve_mesh("SprawlDirection", [[(0, -5.05, 0.07), (0, -4.65, 0.07), (0, -4.2, 0.07), (0, -3.8, 0.07)]], mats["teal"], 0.035)
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.15, radius2=0, depth=0.32, location=(0, -3.66, 0.075), rotation=(math.pi / 2, 0, 0))
    arrow = bpy.context.object
    arrow.name = "SprawlDirection_Arrow"
    arrow.data.materials.append(mats["teal"])

    return court


def create_rig(bone_names):
    data = bpy.data.armatures.new("CoachCam_RigData")
    rig = bpy.data.objects.new("CoachCam_Rig", data)
    bpy.context.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    for name in bone_names:
        bone = data.edit_bones.new(name)
        bone.head = (0, 0, 0)
        # Blender bones use local +Y as their length axis. Keeping the rest bone
        # aligned to world +Y makes keyed pose locations true armature-space
        # court coordinates and avoids axis-swapped deformation.
        bone.tail = (0, 1, 0)
        bone.use_deform = True
    bpy.ops.object.mode_set(mode="OBJECT")
    rig.show_in_front = True
    rig.select_set(False)
    return rig


def weighted_ellipsoid(name, rig, bone_name, dimensions, center_z, mat, segments=20, rings=10):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=(0, 0, 0))
    obj = bpy.context.object
    obj.name = name
    # API dimensions are (body width, body depth, segment length).  The mesh's
    # local +Y follows the Blender bone, with local +Z providing body depth.
    obj.scale = (dimensions[0] / 2, dimensions[2] / 2, dimensions[1] / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for vertex in obj.data.vertices:
        vertex.co.y += center_z
    obj.data.materials.append(mat)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    group = obj.vertex_groups.new(name=bone_name)
    group.add(list(range(len(obj.data.vertices))), 1.0, "REPLACE")
    modifier = obj.modifiers.new("CoachCam Rig", "ARMATURE")
    modifier.object = rig
    # glTF requires the armature to be the direct parent of every skinned mesh.
    obj.parent = rig
    return obj


def add_athlete_mesh(prefix, rig, palette, torso_public_name):
    def e(suffix, bone, dims, center, mat, **kwargs):
        return weighted_ellipsoid(f"{prefix}_{suffix}", rig, f"{prefix}_{bone}", dims, center, palette[mat], **kwargs)

    torso = weighted_profile(torso_public_name, rig, f"{prefix}_TORSO", [
        (-0.04, .165, .125), (.12, .185, .135), (.32, .175, .125),
        (.56, .205, .14), (.76, .235, .14), (.88, .225, .125), (1.0, .10, .09),
    ], palette["jersey"])
    torso["role"] = "defender" if prefix == "DEF" else "coach"
    torso["rig_prefix"] = prefix
    e("Shorts", "TORSO", (0.36, 0.27, 0.31), 0.09, "shorts", segments=24, rings=12)
    e("Head", "HEAD", (0.205, 0.225, 1.0), 0.50, "skin", segments=28, rings=14)
    e("Hair", "HEAD", (0.212, 0.235, 0.42), 0.83, "hair", segments=24, rings=12)
    # Face landmarks expose head orientation and a tucked chin in the roll.
    for name, offset, dims, mat in (
        ("Nose", (0, .48, -.115), (.043, .046, .15), "skin"),
        ("Eye_L", (-.045, .61, -.104), (.017, .011, .055), "hair"),
        ("Eye_R", (.045, .61, -.104), (.017, .011, .055), "hair"),
        ("Ear_L", (-.106, .49, 0), (.034, .037, .21), "skin"),
        ("Ear_R", (.106, .49, 0), (.034, .037, .21), "skin"),
    ):
        feature = e(name, "HEAD", dims, offset[1], mat)
        for vertex in feature.data.vertices:
            vertex.co.x += offset[0]
            vertex.co.z += offset[2]

    for side in ("L", "R"):
        for label, bone, widths, mat in (
            ("UpperArm", "UARM", (.062, .077, .058), "skin"),
            ("Forearm", "FARM", (.058, .060, .040), "skin"),
            ("Thigh", "THIGH", (.10, .118, .079), "skin"),
            ("Shin", "SHIN", (.077, .082, .046), "skin"),
        ):
            weighted_profile(f"{prefix}_{label}_{side}", rig, f"{prefix}_{bone}_{side}",
                             [(-.05, widths[0]*.8, widths[0]*.8), (.12, widths[0], widths[0]),
                              (.40, widths[1], widths[1]*.95), (.82, widths[2], widths[2]),
                              (1.04, widths[2]*.82, widths[2]*.82)], palette[mat])
        e(f"Hand_{side}", f"HAND_{side}", (.084, .042, .67), .31, "skin")
        for finger, offset, center in (("Index", -.029, .79), ("Middle", -.009, .85),
                                        ("Ring", .011, .82), ("Little", .029, .74)):
            digit = e(f"{finger}_{side}", f"HAND_{side}", (.017, .020, .34), center, "skin", segments=12, rings=8)
            for vertex in digit.data.vertices:
                vertex.co.x += -offset if side == "L" else offset
        thumb = e(f"Thumb_{side}", f"HAND_{side}", (.030, .028, .40), .32, "skin", segments=12, rings=8)
        for vertex in thumb.data.vertices:
            vertex.co.x += .046 if side == "L" else -.046
        weighted_profile(f"{prefix}_ShortsLeg_{side}", rig, f"{prefix}_THIGH_{side}",
                         [(-.07, .103, .103), (.13, .119, .114), (.40, .117, .109)], palette["shorts"])
        e(f"Kneepad_{side}", f"SHIN_{side}", (0.18, 0.18, 0.27), 0.04, "kneepad")
        e(f"Shoe_{side}", f"FOOT_{side}", (0.125, 0.13, 1.24), 0.43, "shoe")


def weighted_profile(name, rig, bone, rings, mat, count=24):
    """Continuous tapered cross sections, rather than stacked ellipsoids."""
    vertices, faces = [], []
    for y, rx, rz in rings:
        for i in range(count):
            angle = i * math.tau / count
            vertices.append((rx * math.cos(angle), y, rz * math.sin(angle)))
    for ring in range(len(rings) - 1):
        for i in range(count):
            a, b = ring*count+i, ring*count+(i+1)%count
            faces.append((a, b, b+count, a+count))
    faces += [tuple(reversed(range(count))), tuple(range((len(rings)-1)*count, len(rings)*count))]
    mesh = bpy.data.meshes.new(name + "Mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    mesh.materials.append(mat)
    for poly in mesh.polygons:
        poly.use_smooth = True
    group = obj.vertex_groups.new(name=bone)
    group.add(list(range(len(vertices))), 1, "REPLACE")
    obj.modifiers.new("Anatomical skin", "ARMATURE").object = rig
    obj.parent = rig
    return obj


def add_joint_meshes(prefix, rig, palette):
    specs = {
        "PELVIS": ((0.36, 0.27, 0.22), "shorts"),
        "NECK": ((0.13, 0.13, 0.16), "skin"),
        "SHOULDER_L": ((0.15, 0.15, 0.15), "skin"),
        "SHOULDER_R": ((0.15, 0.15, 0.15), "skin"),
        "ELBOW_L": ((0.12, 0.12, 0.12), "skin"),
        "ELBOW_R": ((0.12, 0.12, 0.12), "skin"),
        "WRIST_L": ((0.09, 0.085, 0.09), "skin"),
        "WRIST_R": ((0.09, 0.085, 0.09), "skin"),
        "HIP_L": ((0.20, 0.20, 0.20), "shorts"),
        "HIP_R": ((0.20, 0.20, 0.20), "shorts"),
        "KNEE_L": ((0.18, 0.18, 0.18), "kneepad"),
        "KNEE_R": ((0.18, 0.18, 0.18), "kneepad"),
        "ANKLE_L": ((0.105, 0.105, 0.105), "shoe"),
        "ANKLE_R": ((0.105, 0.105, 0.105), "shoe"),
    }
    for suffix, (dimensions, material_key) in specs.items():
        weighted_ellipsoid(
            f"{prefix}_Joint_{suffix}", rig, f"{prefix}_JOINT_{suffix}",
            dimensions, 0.0, palette[material_key], 18, 9,
        )


def add_ball_mesh(name, rig, bone_name, mats):
    # Utility bones are point controllers, so their meshes are centered at the
    # bone head rather than halfway down the unit segment.
    ball = weighted_ellipsoid(name, rig, bone_name, (0.215, 0.215, 0.215), 0.0, mats["ball"], 28, 14)
    ball["diameter_m"] = 0.215
    # Three thin colored bands make the moving object read as a volleyball.
    for index, rotation in enumerate(((0, 0, 0), (math.pi / 2, 0, 0), (0, math.pi / 2, 0))):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.107, minor_radius=0.008, major_segments=28, minor_segments=6, location=(0, 0, 0), rotation=rotation)
        band = bpy.context.object
        band.name = f"{name}_Band_{index + 1}"
        band.data.materials.append(mats["ball_band"])
        group = band.vertex_groups.new(name=bone_name)
        group.add(list(range(len(band.data.vertices))), 1.0, "REPLACE")
        modifier = band.modifiers.new("CoachCam Rig", "ARMATURE")
        modifier.object = rig
        band.parent = rig
    return ball


def add_impact_ring(name, rig, bone_name, mat):
    bpy.ops.mesh.primitive_torus_add(major_radius=0.28, minor_radius=0.022, major_segments=36, minor_segments=8, location=(0, 0, 0), rotation=(math.pi / 2, 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    group = obj.vertex_groups.new(name=bone_name)
    group.add(list(range(len(obj.data.vertices))), 1.0, "REPLACE")
    modifier = obj.modifiers.new("CoachCam Rig", "ARMATURE")
    modifier.object = rig
    obj.parent = rig
    return obj


def add_flat_contact_ring(name, rig, bone_name, mat, radius=0.26):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=radius, minor_radius=0.025, major_segments=36,
        minor_segments=8, location=(0, 0, 0),
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    group = obj.vertex_groups.new(name=bone_name)
    group.add(list(range(len(obj.data.vertices))), 1.0, "REPLACE")
    modifier = obj.modifiers.new("CoachCam Rig", "ARMATURE")
    modifier.object = rig
    obj.parent = rig
    return obj


def orientation(up, forward_hint):
    z_axis = Vector(up).normalized()
    y_axis = Vector(forward_hint) - z_axis * Vector(forward_hint).dot(z_axis)
    if y_axis.length < 1e-5:
        y_axis = Vector((0, 1, 0))
    y_axis.normalize()
    x_axis = y_axis.cross(z_axis).normalized()
    y_axis = z_axis.cross(x_axis).normalized()
    return Matrix((x_axis, y_axis, z_axis)).transposed().to_quaternion()


def human_pose(pelvis, up=(0, 0.25, 0.97), forward=(0, 1, 0), limbs=None, overrides=None):
    """Return named joints for a readable stylised human pose."""
    pelvis = Vector(pelvis)
    q = orientation(up, forward)
    transform = lambda p: pelvis + q @ Vector(p)
    limbs = limbs or {}
    local = {
        "elbow_L": (-0.23, 0.30, 0.32),
        "elbow_R": (0.23, 0.30, 0.32),
        "wrist_L": (-0.07, 0.56, 0.16),
        "wrist_R": (0.07, 0.56, 0.16),
        "knee_L": (-0.34, 0.10, -0.43),
        "knee_R": (0.34, 0.10, -0.43),
        "ankle_L": (-0.43, -0.03, -0.77),
        "ankle_R": (0.43, -0.03, -0.77),
        "toe_L": (-0.43, 0.25, -0.80),
        "toe_R": (0.43, 0.25, -0.80),
    }
    local.update(limbs)
    pose = {
        "pelvis": pelvis,
        "neck": transform((0, 0, BODY["TORSO"])),
        "head_top": transform((0, 0, BODY["TORSO"] + BODY["HEAD"])),
        "shoulder_L": transform((-0.22, 0, 0.48)),
        "shoulder_R": transform((0.22, 0, 0.48)),
        "hip_L": transform((-0.145, 0, 0)),
        "hip_R": transform((0.145, 0, 0)),
    }
    for joint, coordinate in local.items():
        pose[joint] = transform(coordinate)
    if overrides:
        pose.update({name: Vector(value) for name, value in overrides.items()})
    return pose


SEGMENTS = {
    "TORSO": ("pelvis", "neck"),
    "HEAD": ("neck", "head_top"),
    "UARM_L": ("shoulder_L", "elbow_L"),
    "FARM_L": ("elbow_L", "wrist_L"),
    "UARM_R": ("shoulder_R", "elbow_R"),
    "FARM_R": ("elbow_R", "wrist_R"),
    "HAND_L": ("wrist_L", "fingers_L"),
    "HAND_R": ("wrist_R", "fingers_R"),
    "THIGH_L": ("hip_L", "knee_L"),
    "SHIN_L": ("knee_L", "ankle_L"),
    "FOOT_L": ("ankle_L", "toe_L"),
    "THIGH_R": ("hip_R", "knee_R"),
    "SHIN_R": ("knee_R", "ankle_R"),
    "FOOT_R": ("ankle_R", "toe_R"),
}

# Independent point bones keep joints round instead of inheriting a limb's
# non-uniform length scale.  Their overlapping meshes turn the segmented rig
# into one continuous, readable full-body silhouette at every camera distance.
POINT_JOINTS = {
    "PELVIS": "pelvis",
    "NECK": "neck",
    "SHOULDER_L": "shoulder_L",
    "SHOULDER_R": "shoulder_R",
    "ELBOW_L": "elbow_L",
    "ELBOW_R": "elbow_R",
    "WRIST_L": "wrist_L",
    "WRIST_R": "wrist_R",
    "HIP_L": "hip_L",
    "HIP_R": "hip_R",
    "KNEE_L": "knee_L",
    "KNEE_R": "knee_R",
    "ANKLE_L": "ankle_L",
    "ANKLE_R": "ankle_R",
}


def key_segment(pose_bone, frame, start, end, scale_xy=1.0, lateral=None):
    start, end = Vector(start), Vector(end)
    delta = end - start
    pose_bone.location = start
    pose_bone.rotation_mode = "QUATERNION"
    if lateral is None:
        rotation = Vector((0, 1, 0)).rotation_difference(delta.normalized())
    else:
        y = delta.normalized()
        x = Vector(lateral) - y * Vector(lateral).dot(y)
        if x.length < .01:
            x = Vector((1, 0, 0)) - y * y.x
        x.normalize()
        rotation = Matrix((x, y, x.cross(y))).transposed().to_quaternion()
        kind = pose_bone.name.split("_")[1]
        if frame > 0 and kind not in ("TORSO", "HEAD"):
            # Parallel transport avoids an axial 180-degree flip when an arm
            # passes through the body's lateral axis. Small twist corrections
            # keep palms and shoe soles oriented without crossing that pole.
            previous = pose_bone.rotation_quaternion.copy()
            transported = (previous @ Vector((0, 1, 0))).rotation_difference(y) @ previous
            transported_x = transported @ Vector((1, 0, 0))
            twist = math.atan2(y.dot(transported_x.cross(x)), transported_x.dot(x))
            rotation = Quaternion(y, max(-.09/SAMPLE_RATE, min(.09/SAMPLE_RATE, twist))) @ transported
    # Quaternion signs are equivalent rotations but different interpolation
    # paths; hemisphere continuity prevents a one-frame 360-degree limb flip.
    if pose_bone.rotation_quaternion.dot(rotation) < 0:
        rotation.negate()
    pose_bone.rotation_quaternion = rotation
    pose_bone.scale = (scale_xy, delta.length, scale_xy)
    for path in ("location", "rotation_quaternion", "scale"):
        pose_bone.keyframe_insert(data_path=path, frame=frame * SAMPLE_RATE, group=pose_bone.name)


def key_human(rig, prefix, frame, pose):
    lateral = pose["shoulder_R"] - pose["shoulder_L"]
    for segment, joints in SEGMENTS.items():
        key_segment(rig.pose.bones[f"{prefix}_{segment}"], frame, pose[joints[0]], pose[joints[1]], lateral=lateral)
    for bone_suffix, joint in POINT_JOINTS.items():
        key_point(rig, f"{prefix}_JOINT_{bone_suffix}", frame, pose[joint])


def key_point(rig, bone_name, frame, location, scale=1.0, rotation=None):
    bone = rig.pose.bones[bone_name]
    bone.location = location
    bone.rotation_mode = "QUATERNION"
    bone.rotation_quaternion = rotation or (1, 0, 0, 0)
    bone.scale = (scale, scale, scale)
    for path in ("location", "rotation_quaternion", "scale"):
        bone.keyframe_insert(data_path=path, frame=frame * SAMPLE_RATE, group=bone_name)


def platform_overrides(pose, contact):
    contact = Vector(contact)
    # Contact is the ball centre. The ball meets the upper forearm surface,
    # just proximal to the wrists; it must never occupy the joined hands.
    forward = Vector((contact.x - pose["pelvis"].x, contact.y - pose["pelvis"].y, 0)).normalized()
    side = Vector((forward.y, -forward.x, 0))
    direction = (forward * .66 + Vector((0, 0, -.75))).normalized()
    wrist_center = contact + forward * .07 - Vector((0, 0, .14))
    shoulder_mid = wrist_center - direction * .565
    old_up = (pose["neck"] - pose["pelvis"]).normalized()
    up = (forward*math.sqrt(max(0, 1-old_up.z**2)) + Vector((0, 0, old_up.z))).normalized()
    pose["pelvis"] = shoulder_mid - up*.48
    pose["neck"] = pose["pelvis"] + up*BODY["TORSO"]
    pose["head_top"] = pose["neck"] + up*BODY["HEAD"]
    for suffix, sign in (("L", -1), ("R", 1)):
        pose[f"shoulder_{suffix}"] = shoulder_mid + side * .22 * sign
        pose[f"hip_{suffix}"] = pose["pelvis"] + side*.145*sign
        pose[f"wrist_{suffix}"] = wrist_center + side * .055 * sign
        pose[f"elbow_{suffix}"] = pose[f"wrist_{suffix}"] - direction * .28 + side*.03*sign
    return pose


def pose_orientation(pose):
    up = (pose["neck"] - pose["pelvis"]).normalized()
    side = (pose["shoulder_R"] - pose["shoulder_L"]).normalized()
    return orientation(up, up.cross(side))


def solve_limb(root, target, pole, upper, lower, minimum_z, previous=None):
    """Analytic two-bone IK with a stable authored bend plane."""
    target = Vector(target)
    target.z = max(target.z, minimum_z)
    ray = target - root
    distance = max(.03, min(ray.length, upper + lower - .001))
    direction = ray.normalized() if ray.length > 1e-5 else Vector((0, 0, -1))
    target = root + direction * distance
    along = (upper*upper - lower*lower + distance*distance) / (2*distance)
    height = math.sqrt(max(0, upper*upper - along*along))
    bend = Vector(pole) - root
    bend -= direction * bend.dot(direction)
    if bend.length < .01:
        bend = Vector((0, 1, .2)) - direction * direction.dot(Vector((0, 1, .2)))
    bend.normalize()
    if previous is not None:
        prior = previous - root
        prior -= direction * prior.dot(direction)
        if prior.length > .015:
            prior.normalize()
            angle = math.atan2(direction.dot(prior.cross(bend)), prior.dot(bend))
            bend = Quaternion(direction, max(-.30/SAMPLE_RATE, min(.30/SAMPLE_RATE, angle))) @ prior
    joint = root + direction * along + bend * height
    # The floor is a geometric constraint on the bend plane, not a licence to
    # stretch the limb or translate a planted foot after solving.
    if joint.z < minimum_z:
        upward = Vector((0, 0, 1)) - direction * direction.z
        if upward.length > .01:
            upward.normalize()
            side = direction.cross(upward)
            theta = math.atan2(bend.dot(side), bend.dot(upward))
            needed = (minimum_z-root.z-direction.z*along) / max(.00001, height*upward.z)
            limit = math.acos(max(-1, min(1, needed)))
            theta = max(-limit, min(limit, theta))
            bend = upward*math.cos(theta) + side*math.sin(theta)
            joint = root + direction*along + bend*height
    return joint, target


def anatomical_pose(pose, previous=None):
    pose = {name: value.copy() for name, value in pose.items()}
    q = pose_orientation(pose)
    pelvis = pose["pelvis"]
    pose["neck"] = pelvis + q @ Vector((0, 0, BODY["TORSO"]))
    head_direction = (pose["head_top"] - pose["neck"]).normalized()
    if pose["neck"].z < .6:
        head_direction.z = max(head_direction.z, .35)
        head_direction.normalize()
    pose["head_top"] = pose["neck"] + head_direction * BODY["HEAD"]
    up_z = (q @ Vector((0, 0, 1))).z
    plant_weight = max(0, min(1, (up_z - .35) / .35))
    plant_weight = plant_weight*plant_weight*(3-2*plant_weight)
    for side, sign in (("L", -1), ("R", 1)):
        pose[f"shoulder_{side}"] = pelvis + q @ Vector((sign*.22, 0, .48))
        pose[f"hip_{side}"] = pelvis + q @ Vector((sign*.145, 0, 0))
        ankle = pose[f"ankle_{side}"].copy()
        foot = pose[f"toe_{side}"] - ankle
        ankle.z = ankle.z*(1-plant_weight) + (FLOOR_Z+.072)*plant_weight
        knee, ankle = solve_limb(pose[f"hip_{side}"], ankle, pose[f"knee_{side}"],
                                 BODY["THIGH"], BODY["SHIN"], FLOOR_Z + .072,
                                 previous.get(f"knee_{side}") if previous else None)
        pose[f"knee_{side}"], pose[f"ankle_{side}"] = knee, ankle
        foot.z *= 1-plant_weight
        if foot.length < .01:
            foot = q @ Vector((0, 1, 0))
        foot.normalize()
        if previous:
            old_foot = (previous[f"toe_{side}"]-previous[f"ankle_{side}"]).normalized()
            turn = old_foot.rotation_difference(foot)
            if turn.angle > .22/SAMPLE_RATE:
                foot = Quaternion(turn.axis, .22/SAMPLE_RATE) @ old_foot
        minimum_toe_z = max(-1, min(1, (FLOOR_Z+.065-ankle.z) / BODY["FOOT"]))
        if foot.z < minimum_toe_z:
            horizontal = Vector((foot.x, foot.y, 0))
            if horizontal.length < .001:
                horizontal = Vector((0, 1, 0))
            horizontal.normalize()
            foot = horizontal*math.sqrt(1-minimum_toe_z**2) + Vector((0, 0, minimum_toe_z))
        pose[f"toe_{side}"] = ankle + foot * BODY["FOOT"]
        elbow, wrist = solve_limb(pose[f"shoulder_{side}"], pose[f"wrist_{side}"], pose[f"elbow_{side}"],
                                  BODY["UARM"], BODY["FARM"], FLOOR_Z + .065,
                                  previous.get(f"elbow_{side}") if previous else None)
        pose[f"elbow_{side}"], pose[f"wrist_{side}"] = elbow, wrist
        hand_direction = (wrist - elbow).normalized()
        if previous:
            old_hand = (previous[f"fingers_{side}"]-previous[f"wrist_{side}"]).normalized()
            turn = old_hand.rotation_difference(hand_direction)
            if turn.angle > .24/SAMPLE_RATE:
                hand_direction = Quaternion(turn.axis, .24/SAMPLE_RATE) @ old_hand
        minimum_finger_z = max(-1, min(1, (FLOOR_Z+.025-wrist.z)/BODY["HAND"]))
        if hand_direction.z < minimum_finger_z:
            horizontal = Vector((hand_direction.x, hand_direction.y, 0))
            if horizontal.length < .001:
                horizontal = Vector((0, 1, 0))
            horizontal.normalize()
            hand_direction = horizontal*math.sqrt(1-minimum_finger_z**2) + Vector((0, 0, minimum_finger_z))
        pose[f"fingers_{side}"] = wrist + hand_direction * BODY["HAND"]
    return pose


def sample_human_keys(rig, prefix, keys):
    """Blend root rotation with SLERP, then solve anatomy on every frame."""
    samples = {}
    for (start, a), (end, b) in zip(keys, keys[1:]):
        qa, qb = pose_orientation(a), pose_orientation(b)
        for sample in range(start * SAMPLE_RATE, end * SAMPLE_RATE + 1):
            frame = sample / SAMPLE_RATE
            t = (frame-start) / (end-start)
            t = t*t*(3-2*t)
            pose = {name: value.lerp(b[name], t) for name, value in a.items()}
            q = qa.slerp(qb, t)
            pelvis = pose["pelvis"]
            pose["neck"] = pelvis + q @ Vector((0, 0, BODY["TORSO"]))
            pose["shoulder_L"] = pelvis + q @ Vector((-.22, 0, .48))
            pose["shoulder_R"] = pelvis + q @ Vector((.22, 0, .48))
            for side in ("L", "R"):
                da = (a[f"toe_{side}"]-a[f"ankle_{side}"]).normalized()
                db = (b[f"toe_{side}"]-b[f"ankle_{side}"]).normalized()
                fa = Vector((0, 1, 0)).rotation_difference(da)
                fb = Vector((0, 1, 0)).rotation_difference(db)
                pose[f"toe_{side}"] = pose[f"ankle_{side}"] + (fa.slerp(fb,t) @ Vector((0, 1, 0))) * BODY["FOOT"]
            samples[frame] = anatomical_pose(pose, samples.get(frame-1/SAMPLE_RATE))
    for frame, pose in sorted(samples.items()):
        key_human(rig, prefix, frame, pose)
    return samples


def build_defender_animation(rig):
    ready = human_pose((0, -5.72, 0.88))
    ready_low = human_pose((0.12, -5.68, 0.80), up=(0, 0.35, 0.94), limbs={
        "knee_L": (-0.38, 0.12, -0.39), "knee_R": (0.34, 0.14, -0.39),
        "ankle_L": (-0.50, -0.02, -0.71), "ankle_R": (0.47, -0.03, -0.71),
        "toe_L": (-0.50, 0.27, -0.74), "toe_R": (0.47, 0.26, -0.74),
    })

    right_react = human_pose((0.62, -5.62, 0.72), up=(0.14, 0.35, 0.93), limbs={
        "knee_L": (-0.36, 0.12, -0.34), "knee_R": (0.43, 0.16, -0.43),
        "ankle_L": (-0.52, -0.04, -0.62), "ankle_R": (0.68, 0.00, -0.68),
        "toe_L": (-0.52, 0.23, -0.66), "toe_R": (0.74, 0.27, -0.70),
    })
    right_contact = human_pose((1.48, -5.50, 0.58), up=(0.33, 0.42, 0.85), limbs={
        "knee_L": (-0.42, 0.12, -0.29), "knee_R": (0.52, 0.18, -0.40),
        "ankle_L": (-0.65, -0.03, -0.50), "ankle_R": (0.82, 0.02, -0.53),
        "toe_L": (-0.66, 0.25, -0.53), "toe_R": (0.91, 0.29, -0.55),
    })
    platform_overrides(right_contact, (2.15, -5.02, 0.48))

    # The entry places the outside shoulder on the path while the head stays above it.
    right_entry = human_pose((1.76, -5.32, 0.34), up=(0.72, 0.69, 0.08), forward=(-0.68, 0.72, 0.08), limbs={
        "elbow_L": (-0.15, 0.24, 0.31), "elbow_R": (0.10, 0.30, 0.22),
        "wrist_L": (-0.06, 0.50, 0.22), "wrist_R": (0.08, 0.51, 0.16),
        "knee_L": (-0.28, -0.02, -0.30), "knee_R": (0.32, 0.10, -0.18),
        "ankle_L": (-0.38, -0.12, -0.54), "ankle_R": (0.43, -0.02, -0.42),
        "toe_L": (-0.35, 0.12, -0.61), "toe_R": (0.50, 0.18, -0.48),
    }, overrides={"head_top": (2.23, -4.75, .58)})
    # Back phase: knees tuck, arms protect the torso, and the skull remains clear of the floor.
    right_mid = human_pose((1.92, -5.20, 0.24), up=(0.24, 0.94, 0.25), forward=(-0.04, 0.06, 1), limbs={
        "elbow_L": (-0.26, 0.06, 0.36), "elbow_R": (0.26, 0.06, 0.36),
        "wrist_L": (-0.08, 0.15, 0.28), "wrist_R": (0.08, 0.15, 0.28),
        "knee_L": (-0.25, -0.18, -0.28), "knee_R": (0.25, -0.18, -0.28),
        "ankle_L": (-0.31, 0.05, -0.52), "ankle_R": (0.31, 0.05, -0.52),
        "toe_L": (-0.30, 0.28, -0.55), "toe_R": (0.30, 0.28, -0.55),
    }, overrides={"head_top": (2.08, -4.25, 0.54)})
    right_exit = human_pose((1.60, -4.82, 0.45), up=(-0.52, 0.40, 0.75), forward=(0.02, 0.88, -0.20), limbs={
        "elbow_L": (-0.28, 0.16, 0.22), "elbow_R": (0.25, 0.18, 0.20),
        "wrist_L": (-0.12, 0.36, 0.08), "wrist_R": (0.12, 0.37, 0.08),
        "knee_L": (-0.25, 0.18, -0.28), "knee_R": (0.32, 0.06, -0.24),
        "ankle_L": (-0.34, -0.02, -0.43), "ankle_R": (0.42, -0.10, -0.39),
        "toe_L": (-0.30, 0.22, -0.47), "toe_R": (0.48, 0.15, -0.43),
    })
    kneel_right = human_pose((1.08, -5.05, 0.58), up=(-0.16, 0.28, 0.95), limbs={
        "knee_L": (-0.28, 0.18, -0.38), "knee_R": (0.34, 0.18, -0.42),
        "ankle_L": (-0.35, -0.08, -0.52), "ankle_R": (0.52, -0.05, -0.51),
        "toe_L": (-0.35, 0.18, -0.55), "toe_R": (0.56, 0.20, -0.54),
    })

    # Mirror every right-side pose across center court for the left shoulder sequence.
    def mirror(pose):
        swap = {"shoulder_L": "shoulder_R", "elbow_L": "elbow_R", "wrist_L": "wrist_R", "hip_L": "hip_R", "knee_L": "knee_R", "ankle_L": "ankle_R", "toe_L": "toe_R"}
        result = {}
        for name, value in pose.items():
            target = swap.get(name, {v: k for k, v in swap.items()}.get(name, name))
            result[target] = Vector((-value.x, value.y, value.z))
        return result

    left_react, left_contact = mirror(right_react), mirror(right_contact)
    left_entry, left_mid, left_exit, kneel_left = mirror(right_entry), mirror(right_mid), mirror(right_exit), mirror(kneel_right)

    # Forward sprawl: low split step -> joined forearm save -> extended flight -> chest and hips share the landing.
    sprawl_read = human_pose((0, -5.45, 0.73), up=(0, 0.50, 0.87), limbs={
        "elbow_L": (-0.22, 0.38, 0.30), "elbow_R": (0.22, 0.40, 0.26),
        "wrist_L": (-0.10, 0.68, 0.12), "wrist_R": (0.10, 0.72, 0.10),
        "knee_L": (-0.34, 0.15, -0.36), "knee_R": (0.34, 0.17, -0.36),
        "ankle_L": (-0.45, -0.02, -0.62), "ankle_R": (0.45, -0.02, -0.62),
        "toe_L": (-0.44, 0.28, -0.66), "toe_R": (0.44, 0.28, -0.66),
    })
    sprawl_contact = human_pose((0, -4.92, 0.53), up=(0, 0.80, 0.60), limbs={
        "elbow_L": (-0.22, 0.46, 0.28), "elbow_R": (0.22, 0.46, 0.27),
        "wrist_L": (-0.08, 0.84, 0.17), "wrist_R": (0.08, 0.86, 0.16),
        "knee_L": (-0.25, -0.04, -0.28), "knee_R": (0.25, -0.04, -0.28),
        "ankle_L": (-0.36, -0.26, -0.48), "ankle_R": (0.36, -0.26, -0.48),
        "toe_L": (-0.35, -0.03, -0.53), "toe_R": (0.35, -0.03, -0.53),
    })
    platform_overrides(sprawl_contact, (0, -3.98, 0.31))
    sprawl_flight = human_pose((0, -4.45, 0.42), up=(0, 0.98, 0.18), forward=(0, 0.18, -0.98), limbs={
        "elbow_L": (-0.26, 0.12, 0.77), "elbow_R": (0.26, 0.12, 0.77),
        "wrist_L": (-0.10, 0.10, 1.04), "wrist_R": (0.10, 0.10, 1.04),
        # Knees trail the hips in court space while remaining lifted; lower
        # legs fold upward instead of passing through the floor during flight.
        "knee_L": (-0.20, -0.10, -0.30), "knee_R": (0.20, -0.10, -0.30),
        "ankle_L": (-0.24, -0.20, -0.68), "ankle_R": (0.24, -0.20, -0.68),
        "toe_L": (-0.23, -0.16, -0.88), "toe_R": (0.23, -0.16, -0.88),
    }, overrides={"head_top": (0, -3.53, 0.72)})
    sprawl_land = human_pose((0, -4.18, 0.21), up=(0, 1, 0.05), forward=(0, 0.05, -1), limbs={
        # Arms remain long in the direction of travel after the save rather
        # than posting underneath the shoulders or taking the landing load.
        "elbow_L": (-0.26, 0.06, 0.78), "elbow_R": (0.26, 0.06, 0.78),
        "wrist_L": (-0.12, 0.06, 1.02), "wrist_R": (0.12, 0.06, 1.02),
        # Chest and hips are the low contact surfaces. Knees trail behind and
        # stay clearly elevated; ankles fold upward to keep every leg segment
        # above the court through the settled slide.
        "knee_L": (-0.23, -0.10, -0.42), "knee_R": (0.23, -0.10, -0.42),
        "ankle_L": (-0.25, -0.42, -0.75), "ankle_R": (0.25, -0.42, -0.75),
        "toe_L": (-0.23, -0.35, -0.96), "toe_R": (0.23, -0.35, -0.96),
    }, overrides={"head_top": (0, -3.20, 0.58)})
    sprawl_push = human_pose((0, -4.34, 0.47), up=(0, 0.83, 0.56), limbs={
        "elbow_L": (-0.28, 0.28, 0.13), "elbow_R": (0.28, 0.28, 0.13),
        "wrist_L": (-0.26, 0.54, -0.10), "wrist_R": (0.26, 0.54, -0.10),
        "knee_L": (-0.28, -0.12, -0.31), "knee_R": (0.28, -0.12, -0.31),
        "ankle_L": (-0.36, -0.30, -0.48), "ankle_R": (0.36, -0.30, -0.48),
        "toe_L": (-0.34, -0.04, -0.53), "toe_R": (0.34, -0.04, -0.53),
    })

    keys = [
        (0, ready), (20, ready), (30, ready_low), (48, ready_low),
        (54, right_react), (70, right_contact), (78, right_contact),
        (90, right_entry), (102, right_mid), (114, right_exit), (126, kneel_right), (138, ready),
        (150, ready_low), (162, left_react), (178, left_contact), (186, left_contact),
        (198, left_entry), (210, left_mid), (222, left_exit), (234, kneel_left), (246, ready),
        (264, ready_low), (276, sprawl_read), (294, sprawl_contact), (306, sprawl_contact),
        (318, sprawl_flight), (330, sprawl_land), (348, sprawl_land),
        (360, sprawl_push), (378, sprawl_read), (390, ready), (420, ready),
    ]
    samples = sample_human_keys(rig, "DEF", keys)
    global DEFENDER_SAMPLES
    DEFENDER_SAMPLES = samples

    # A slim body-attached stripe makes the safe diagonal unmistakable: outside
    # shoulder -> upper back -> opposite hip. It appears only during each roll.
    hidden = 0.001
    key_point(rig, "GUIDE_DIAG_RIGHT", 0, right_contact["shoulder_R"], hidden)
    key_point(rig, "GUIDE_DIAG_RIGHT", 76, right_contact["shoulder_R"], hidden)
    for frame in range(78, 115):
        pose = samples[frame]
        key_segment(rig.pose.bones["GUIDE_DIAG_RIGHT"], frame, pose["shoulder_R"], pose["hip_L"])
    key_point(rig, "GUIDE_DIAG_RIGHT", 116, kneel_right["shoulder_R"], hidden)
    key_point(rig, "GUIDE_DIAG_RIGHT", FRAME_END, kneel_right["shoulder_R"], hidden)

    key_point(rig, "GUIDE_DIAG_LEFT", 0, left_contact["shoulder_L"], hidden)
    key_point(rig, "GUIDE_DIAG_LEFT", 184, left_contact["shoulder_L"], hidden)
    for frame in range(186, 223):
        pose = samples[frame]
        key_segment(rig.pose.bones["GUIDE_DIAG_LEFT"], frame, pose["shoulder_L"], pose["hip_R"])
    key_point(rig, "GUIDE_DIAG_LEFT", 224, kneel_left["shoulder_L"], hidden)
    key_point(rig, "GUIDE_DIAG_LEFT", FRAME_END, kneel_left["shoulder_L"], hidden)

    # Two floor pulses identify the intended chest/hip load sharing. The head is
    # deliberately keyed above these rings, with elbows and knees trailing.
    for bone_name, location in (("LANDING_CHEST", (0, -3.67, 0.075)), ("LANDING_HIPS", (0, -4.19, 0.075))):
        key_point(rig, bone_name, 0, location, hidden)
        key_point(rig, bone_name, 324, location, hidden)
        key_point(rig, bone_name, 330, location, 1.0)
        key_point(rig, bone_name, 348, location, 1.2)
        key_point(rig, bone_name, 354, location, hidden)
        key_point(rig, bone_name, FRAME_END, location, hidden)


def coach_pose(pelvis, phase="ready"):
    forward = (0, -1, 0)
    if phase == "ready":
        return human_pose(pelvis, up=(0, -0.10, 0.995), forward=forward, limbs={
            "elbow_L": (-0.22, 0.28, 0.36), "elbow_R": (0.22, 0.28, 0.36),
            "wrist_L": (-0.11, 0.52, 0.28), "wrist_R": (0.11, 0.52, 0.28),
            "knee_L": (-0.28, 0.02, -0.48), "knee_R": (0.28, 0.02, -0.48),
            "ankle_L": (-0.29, -0.02, -0.84), "ankle_R": (0.29, -0.02, -0.84),
            "toe_L": (-0.29, 0.24, -0.87), "toe_R": (0.29, 0.24, -0.87),
        })
    if phase == "toss":
        return human_pose(pelvis, up=(0, -0.12, 0.99), forward=forward, limbs={
            "elbow_L": (-0.24, 0.18, 0.58), "elbow_R": (0.27, -0.02, 0.69),
            "wrist_L": (-0.08, 0.33, 0.79), "wrist_R": (0.20, -0.10, 0.97),
            "knee_L": (-0.28, 0.03, -0.49), "knee_R": (0.28, 0.03, -0.49),
            "ankle_L": (-0.29, -0.02, -0.84), "ankle_R": (0.29, -0.02, -0.84),
            "toe_L": (-0.29, 0.24, -0.87), "toe_R": (0.29, 0.24, -0.87),
        })
    return human_pose(pelvis, up=(0, -0.18, 0.98), forward=forward, limbs={
        "elbow_L": (-0.20, 0.23, 0.50), "elbow_R": (0.18, 0.38, 0.54),
        "wrist_L": (-0.08, 0.44, 0.62), "wrist_R": (0.05, 0.65, 0.58),
        "knee_L": (-0.29, 0.02, -0.47), "knee_R": (0.29, 0.05, -0.47),
        "ankle_L": (-0.30, -0.02, -0.83), "ankle_R": (0.30, -0.01, -0.83),
        "toe_L": (-0.30, 0.24, -0.86), "toe_R": (0.30, 0.24, -0.86),
    })


def build_coach_animation(rig):
    base = (0, 3.25, 0.90)
    keys = [(0, "ready"), (22, "ready"), (30, "toss"), (44, "swing"), (62, "swing"), (88, "ready"),
            (128, "ready"), (138, "toss"), (152, "swing"), (170, "swing"), (196, "ready"),
            (238, "ready"), (246, "toss"), (262, "swing"), (282, "swing"), (312, "ready"), (420, "ready")]
    sample_human_keys(rig, "COACH", [(frame, coach_pose(base, phase)) for frame, phase in keys])


def build_ball_animation(rig):
    hidden = 0.001
    paths = {
        "BALL_RIGHT": [(0, (0, 2.68, 1.50), 1), (30, (0, 2.68, 1.55), 1), (45, (0.05, 1.65, 2.55), 1),
                       (60, (0.72, -1.45, 2.36), 1), (72, (1.62, -4.10, 1.15), 1), (78, (2.15, -5.02, 0.48), 1),
                       (91, (0.55, -2.65, 3.28), 1), (99, (0.55, -2.65, 3.28), hidden)],
        "BALL_LEFT": [(0, (0, 2.68, 1.50), hidden), (137, (0, 2.68, 1.50), hidden), (138, (0, 2.68, 1.55), 1),
                      (153, (-0.05, 1.65, 2.55), 1), (168, (-0.72, -1.45, 2.36), 1), (180, (-1.62, -4.10, 1.15), 1),
                      (186, (-2.15, -5.02, 0.48), 1), (199, (-0.55, -2.65, 3.28), 1), (207, (-0.55, -2.65, 3.28), hidden)],
        "BALL_SPRAWL": [(0, (0, 2.68, 1.50), hidden), (245, (0, 2.68, 1.50), hidden), (246, (0, 2.68, 1.55), 1),
                        (264, (0, 1.60, 2.28), 1), (282, (0, -1.30, 1.85), 1), (297, (0, -3.45, 0.70), 1),
                        (306, (0, -3.98, 0.31), 1), (321, (0, -1.90, 2.85), 1), (332, (0, -1.90, 2.85), hidden)],
    }
    for bone_name, keys in paths.items():
        for frame, location, scale in keys:
            if frame in (78, 186, 306):
                location = forearm_ball_contact(DEFENDER_SAMPLES[frame])
            spin = Matrix.Rotation(math.radians(frame * 7), 4, "Z").to_quaternion()
            key_point(rig, bone_name, frame, location, scale, spin)

    impacts = {
        "IMPACT_RIGHT": (78, (2.15, -5.02, 0.48)),
        "IMPACT_LEFT": (186, (-2.15, -5.02, 0.48)),
        "IMPACT_SPRAWL": (306, (0, -3.98, 0.31)),
    }
    for bone_name, (frame, location) in impacts.items():
        location = forearm_ball_contact(DEFENDER_SAMPLES[frame])
        key_point(rig, bone_name, 0, location, hidden)
        key_point(rig, bone_name, frame - 2, location, hidden)
        key_point(rig, bone_name, frame, location, 1.0)
        key_point(rig, bone_name, frame + 8, location, 1.65)
        key_point(rig, bone_name, frame + 10, location, hidden)
        key_point(rig, bone_name, FRAME_END, location, hidden)


def forearm_ball_contact(pose):
    wrists = (pose["wrist_L"] + pose["wrist_R"]) / 2
    elbows = (pose["elbow_L"] + pose["elbow_R"]) / 2
    along = (wrists-elbows).normalized()
    normal = Vector((0, 0, 1)) - along*along.z
    normal.normalize()
    return elbows.lerp(wrists, .75) + normal*.157


def add_timeline_metadata(rig):
    phases = [
        ("Ready", 0, 30), ("CoachTossRight", 30, 54), ("RightReachContact", 54, 78),
        ("RightShoulderRoll", 78, 114), ("RecoverRight", 114, 138),
        ("LeftSetupToss", 138, 162), ("LeftReachContact", 162, 186),
        ("LeftShoulderRoll", 186, 222), ("RecoverLeft", 222, 246),
        ("SprawlSetup", 246, 276), ("ForearmSave", 276, 306),
        ("ChestHipsSprawl", 306, 348), ("RecoverSprawl", 348, 390), ("ReadyHold", 390, 420),
    ]
    rig["clip_name"] = CLIP_NAME
    rig["fps"] = FPS
    rig["sample_fps"] = FPS * SAMPLE_RATE
    rig["duration_seconds"] = FRAME_END / FPS
    rig["loop"] = True
    rig["drill_id"] = "rolls-and-sprawls"
    rig["timeline_json"] = json.dumps([
        {"name": name, "start": start / FPS, "end": end / FPS, "startFrame": start, "endFrame": end}
        for name, start, end in phases
    ])
    for name, start, end in phases:
        bpy.context.scene.timeline_markers.new(name, frame=start * SAMPLE_RATE)
        marker = bpy.data.objects.new(f"Marker_{name}", None)
        bpy.context.collection.objects.link(marker)
        marker.empty_display_type = "PLAIN_AXES"
        marker.empty_display_size = 0.08
        marker["phase"] = name
        marker["start_seconds"] = start / FPS
        marker["end_seconds"] = end / FPS
        marker["start_frame"] = start
        marker["end_frame"] = end


def setup_animation(rig):
    action = bpy.data.actions.new(CLIP_NAME)
    rig.animation_data_create()
    rig.animation_data.action = action
    build_defender_animation(rig)
    build_coach_animation(rig)
    build_ball_animation(rig)
    # Dense solved frames use linear interpolation so glTF cannot add Bezier
    # overshoot, joint disconnection, or an unplanned elbow/knee inversion.
    for layer in action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for curve in bag.fcurves:
                    for key in curve.keyframe_points:
                        key.interpolation = "LINEAR"
    return action


def setup_lighting_and_cameras(mats):
    def area(name, location, energy, size, color):
        data = bpy.data.lights.new(name, "AREA")
        data.energy = energy
        data.shape = "DISK"
        data.size = size
        data.color = color
        obj = bpy.data.objects.new(name, data)
        bpy.context.collection.objects.link(obj)
        obj.location = location
        look_at(obj, (0, -1, 0))
        return obj

    area("KeyLight", (-5, -5, 10), 1550, 7, rgba("#fff2de")[:3])
    area("FillLight", (6, -2, 8), 1050, 6, rgba("#b7dfff")[:3])
    area("CoachRim", (0, 7, 7), 900, 5, rgba("#ff9b71")[:3])
    sun_data = bpy.data.lights.new("ArenaSun", "SUN")
    sun_data.energy = 1.25
    sun_data.angle = math.radians(28)
    sun = bpy.data.objects.new("ArenaSun", sun_data)
    bpy.context.collection.objects.link(sun)
    sun.rotation_euler = (math.radians(28), math.radians(-18), math.radians(24))

    court_camera = camera("Camera_Court", (12.8, -17.5, 13.2), (0, 0.15, 0.35), 48)
    # The mechanics lens is deliberately wide enough to retain fingers, head and
    # shoes throughout both ±2.2 m rolls and the forward slide on every aspect.
    # Raised front-of-athlete lens: this keeps right/left scale identical while
    # exposing the platform, chin tuck, torso diagonal, and chest/hip landing.
    # Its sightline clears the net instead of looking through it.
    mechanics_camera = camera("Camera_Mechanics", (0, 0.80, 3.50), (0, -4.95, 0.57), 37)
    # The mechanics pane can switch to this three-quarter lens for the forward
    # save/landing, revealing hands, ball, chest, hips, and lifted head in depth.
    sprawl_camera = camera("Camera_Sprawl", (4.85, -0.85, 3.25), (0, -4.35, 0.54), 46)
    court_camera["view"] = "full court tactical context"
    mechanics_camera["view"] = "body mechanics close-up"
    sprawl_camera["view"] = "three-quarter forward sprawl mechanics"
    sprawl_camera["active_phase_start_seconds"] = 9.2
    sprawl_camera["active_phase_end_seconds"] = 12.0
    return court_camera, mechanics_camera, sprawl_camera


def render_preview(scene, camera_obj, frame, filename):
    scene.camera = camera_obj
    scene.frame_set(frame * SAMPLE_RATE)
    scene.render.filepath = str(PREVIEW_DIR / filename)
    bpy.ops.render.render(write_still=True)


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.frame_start = 0
    scene.frame_end = FRAME_END * SAMPLE_RATE
    scene.render.fps = FPS * SAMPLE_RATE
    scene.render.fps_base = 1.0
    # Blender 5.1 exposes Eevee Next under the compact BLENDER_EEVEE enum.
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = False
    scene.render.image_settings.color_depth = "8"
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    scene.render.use_file_extension = True
    try:
        scene.view_settings.look = "AgX - Medium High Contrast"
    except TypeError:
        pass

    mats = {
        "floor": material("Arena navy", rgba("#071827"), roughness=0.62),
        "court": material("Court terracotta", rgba("#ad5c3f"), roughness=0.57),
        "line": material("Court line", rgba("#fff6e9"), roughness=0.38),
        "navy": material("Structural navy", rgba("#10223b"), metallic=0.1, roughness=0.36),
        "net": material("Net graphite", rgba("#263b4d"), roughness=0.46),
        "coral": material("Rally coral", rgba("#ff6542"), roughness=0.38),
        "teal": material("Teaching teal", rgba("#28d4b5"), roughness=0.33, emission=rgba("#28d4b5")),
        "guide": material("Roll guide", rgba("#ff8a64"), roughness=0.35, emission=rgba("#ff6542")),
        "impact": material("Contact contrast", rgba("#153e63"), roughness=0.31, emission=rgba("#153e63")),
        "landing": material("Sprawl landing", rgba("#1e907e"), roughness=0.42),
        "skin": material("Warm skin", rgba("#b96d4e"), roughness=0.55),
        "hair": material("Dark hair", rgba("#231b24"), roughness=0.68),
        "def_jersey": material("Defender coral jersey", rgba("#ff6542"), roughness=0.43),
        "def_alt": material("Defender cream panel", rgba("#fff0df"), roughness=0.45),
        "coach_jersey": material("Coach navy jersey", rgba("#183d62"), roughness=0.43),
        "coach_alt": material("Coach teal panel", rgba("#28d4b5"), roughness=0.43),
        "shorts": material("Athlete shorts", rgba("#12223a"), roughness=0.49),
        "kneepad": material("Kneepads", rgba("#f4e9dc"), roughness=0.57),
        "shoe": material("Court shoes", rgba("#f8f0e5"), roughness=0.43),
        "ball": material("Volleyball ivory", rgba("#fff8ea"), roughness=0.35),
        "ball_band": material("Volleyball navy band", rgba("#173b61"), roughness=0.35),
    }
    create_world_and_court(mats)

    segment_bones = [f"{prefix}_{segment}" for prefix in ("DEF", "COACH") for segment in SEGMENTS]
    joint_bones = [f"{prefix}_JOINT_{joint}" for prefix in ("DEF", "COACH") for joint in POINT_JOINTS]
    utility_bones = [
        "BALL_RIGHT", "BALL_LEFT", "BALL_SPRAWL",
        "IMPACT_RIGHT", "IMPACT_LEFT", "IMPACT_SPRAWL",
        "GUIDE_DIAG_RIGHT", "GUIDE_DIAG_LEFT", "LANDING_CHEST", "LANDING_HIPS",
    ]
    rig = create_rig(segment_bones + joint_bones + utility_bones)
    rig["asset_version"] = 2
    rig["anatomy_profile_json"] = json.dumps(BODY)
    rig["motion_sampling"] = "60 fps fixed-length IK, torso SLERP, continuous quaternion hemisphere"
    rig["coaching_reference"] = "USA Volleyball Indoor High Performance Boys Training Manual, floor defense, pp. 21-22"
    rig["coaching_reference_url"] = "https://cdn3.sportngin.com/attachments/document/0120/6224/2017_USA_Volleyball_Indoor_High_Performance_Boys_Training__Manual__2_.pdf"
    rig["coordinate_system"] = "Blender Z-up; glTF Y-up"
    add_timeline_metadata(rig)

    defender_palette = {"jersey": mats["def_jersey"], "jersey_alt": mats["def_alt"], "shorts": mats["shorts"],
                        "skin": mats["skin"], "hair": mats["hair"], "kneepad": mats["kneepad"], "shoe": mats["shoe"]}
    coach_palette = {"jersey": mats["coach_jersey"], "jersey_alt": mats["coach_alt"], "shorts": mats["shorts"],
                     "skin": mats["skin"], "hair": mats["hair"], "kneepad": mats["kneepad"], "shoe": mats["shoe"]}
    add_athlete_mesh("DEF", rig, defender_palette, "Defender")
    add_athlete_mesh("COACH", rig, coach_palette, "Coach")
    add_joint_meshes("DEF", rig, defender_palette)
    add_joint_meshes("COACH", rig, coach_palette)
    add_ball_mesh("Ball", rig, "BALL_RIGHT", mats)
    add_ball_mesh("Ball_Left", rig, "BALL_LEFT", mats)
    add_ball_mesh("Ball_Sprawl", rig, "BALL_SPRAWL", mats)
    add_impact_ring("Impact_Right", rig, "IMPACT_RIGHT", mats["impact"])
    add_impact_ring("Impact_Left", rig, "IMPACT_LEFT", mats["impact"])
    add_impact_ring("Impact_Sprawl", rig, "IMPACT_SPRAWL", mats["teal"])
    weighted_ellipsoid("RollDiagonal_Right", rig, "GUIDE_DIAG_RIGHT", (0.065, 0.065, 1.04), 0.50, mats["teal"], 16, 8)
    weighted_ellipsoid("RollDiagonal_Left", rig, "GUIDE_DIAG_LEFT", (0.065, 0.065, 1.04), 0.50, mats["teal"], 16, 8)
    add_flat_contact_ring("ChestContact", rig, "LANDING_CHEST", mats["teal"], 0.25)
    add_flat_contact_ring("HipContact", rig, "LANDING_HIPS", mats["teal"], 0.27)
    action = setup_animation(rig)
    court_camera, mechanics_camera, sprawl_camera = setup_lighting_and_cameras(mats)

    # Metadata is exported in node extras and used by the web timeline.
    scene["asset"] = "RallyReady CoachCam — Rolls & Sprawls"
    scene["animation"] = CLIP_NAME
    scene["duration_seconds"] = FRAME_END / FPS
    scene["camera_wide"] = "Camera_Court"
    scene["camera_mechanics"] = "Camera_Mechanics"
    scene["camera_sprawl"] = "Camera_Sprawl"
    scene["safety_note"] = "Instructional visualization; athletes should learn rolling and sprawling with qualified coaching and appropriate flooring."

    scene.frame_set(0)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH), compress=True)
    bpy.ops.export_scene.gltf(
        filepath=str(GLB_PATH),
        export_format="GLB",
        export_animations=True,
        export_animation_mode="ACTIONS",
        export_merge_animation="ACTION",
        export_force_sampling=True,
        export_frame_range=True,
        export_frame_step=1,
        export_anim_slide_to_zero=True,
        export_optimize_animation_size=True,
        export_optimize_animation_keep_anim_armature=True,
        export_cameras=True,
        export_lights=False,
        export_extras=True,
        export_materials="EXPORT",
        export_yup=True,
        export_apply=False,
    )

    # Render distinct wide and mechanics moments for visual QA.
    if not os.environ.get("COACHCAM_SKIP_PREVIEWS"):
        render_preview(scene, court_camera, 0, "rolls-and-sprawls-court.png")
        render_preview(scene, mechanics_camera, 90, "rolls-and-sprawls-right-roll.png")
        render_preview(scene, mechanics_camera, 198, "rolls-and-sprawls-left-roll.png")
        render_preview(scene, sprawl_camera, 306, "rolls-and-sprawls-sprawl.png")
        render_preview(scene, sprawl_camera, 342, "rolls-and-sprawls-sprawl-landing.png")

    report = {
        "glb": str(GLB_PATH), "blend": str(BLEND_PATH), "clip": action.name,
        "fps": FPS, "frames": [0, FRAME_END], "durationSeconds": FRAME_END / FPS,
        "previews": [str(p) for p in sorted(PREVIEW_DIR.glob("rolls-and-sprawls-*.png"))],
    }
    print("COACHCAM_BUILD_REPORT=" + json.dumps(report, sort_keys=True))


if __name__ == "__main__":
    main()
