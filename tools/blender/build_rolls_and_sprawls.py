"""Build the RallyReady CoachCam Rolls & Sprawls vertical-slice asset.

Run with Blender 5.1+:
  blender --background --factory-startup --python tools/blender/build_rolls_and_sprawls.py

The file is intentionally procedural and dependency free.  It creates a stylised
volleyball court, two articulated athletes, three live-ball exchanges, coaching
guides, two embedded cameras, one continuous animation action, a .blend source,
browser-ready GLB, and QA preview renders.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


FPS = 30
FRAME_END = 420
CLIP_NAME = "CoachCam_RollsSprawls"
ROOT = Path(__file__).resolve().parents[2]
GLB_PATH = ROOT / "models" / "coachcam" / "rolls-and-sprawls.glb"
BLEND_PATH = ROOT / "design-assets" / "blender" / "rolls-and-sprawls.blend"
PREVIEW_DIR = ROOT / "design-assets" / "blender" / "previews"

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

    torso = weighted_ellipsoid(torso_public_name, rig, f"{prefix}_TORSO", (0.58, 0.34, 1.14), 0.52, palette["jersey"], 28, 14)
    torso["role"] = "defender" if prefix == "DEF" else "coach"
    torso["rig_prefix"] = prefix
    e("JerseyPanel", "TORSO", (0.46, 0.345, 0.54), 0.60, "jersey_alt", segments=24, rings=12)
    e("Shorts", "TORSO", (0.47, 0.34, 0.26), 0.13, "shorts", segments=24, rings=12)
    e("Head", "HEAD", (0.31, 0.29, 1.0), 0.50, "skin", segments=28, rings=14)
    e("Hair", "HEAD", (0.325, 0.30, 0.42), 0.86, "hair", segments=24, rings=12)

    for side in ("L", "R"):
        e(f"UpperArm_{side}", f"UARM_{side}", (0.16, 0.16, 1.14), 0.50, "skin")
        e(f"Forearm_{side}", f"FARM_{side}", (0.14, 0.14, 1.14), 0.50, "skin")
        e(f"Hand_{side}", f"FARM_{side}", (0.17, 0.14, 0.18), 1.01, "skin")
        e(f"Thigh_{side}", f"THIGH_{side}", (0.22, 0.22, 1.13), 0.50, "skin")
        e(f"Shin_{side}", f"SHIN_{side}", (0.18, 0.18, 1.13), 0.50, "skin")
        e(f"Kneepad_{side}", f"SHIN_{side}", (0.245, 0.21, 0.24), 0.06, "kneepad")
        e(f"Shoe_{side}", f"FOOT_{side}", (0.19, 0.24, 0.98), 0.50, "shoe")


def add_joint_meshes(prefix, rig, palette):
    specs = {
        "PELVIS": ((0.44, 0.30, 0.28), "shorts"),
        "NECK": ((0.23, 0.21, 0.23), "skin"),
        "SHOULDER_L": ((0.18, 0.18, 0.18), "skin"),
        "SHOULDER_R": ((0.18, 0.18, 0.18), "skin"),
        "ELBOW_L": ((0.16, 0.16, 0.16), "skin"),
        "ELBOW_R": ((0.16, 0.16, 0.16), "skin"),
        "WRIST_L": ((0.16, 0.15, 0.16), "skin"),
        "WRIST_R": ((0.16, 0.15, 0.16), "skin"),
        "HIP_L": ((0.23, 0.22, 0.23), "shorts"),
        "HIP_R": ((0.23, 0.22, 0.23), "shorts"),
        "KNEE_L": ((0.235, 0.22, 0.235), "kneepad"),
        "KNEE_R": ((0.235, 0.22, 0.235), "kneepad"),
        "ANKLE_L": ((0.17, 0.17, 0.17), "shoe"),
        "ANKLE_R": ((0.17, 0.17, 0.17), "shoe"),
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
        "neck": transform((0, 0, 0.70)),
        "head_top": transform((0, 0, 1.03)),
        "shoulder_L": transform((-0.28, 0, 0.57)),
        "shoulder_R": transform((0.28, 0, 0.57)),
        "hip_L": transform((-0.18, 0, 0)),
        "hip_R": transform((0.18, 0, 0)),
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


def key_segment(pose_bone, frame, start, end, scale_xy=1.0):
    start, end = Vector(start), Vector(end)
    delta = end - start
    pose_bone.location = start
    pose_bone.rotation_mode = "QUATERNION"
    pose_bone.rotation_quaternion = Vector((0, 1, 0)).rotation_difference(delta.normalized())
    pose_bone.scale = (scale_xy, delta.length, scale_xy)
    for path in ("location", "rotation_quaternion", "scale"):
        pose_bone.keyframe_insert(data_path=path, frame=frame, group=pose_bone.name)


def key_human(rig, prefix, frame, pose):
    for segment, joints in SEGMENTS.items():
        key_segment(rig.pose.bones[f"{prefix}_{segment}"], frame, pose[joints[0]], pose[joints[1]])
    for bone_suffix, joint in POINT_JOINTS.items():
        key_point(rig, f"{prefix}_JOINT_{bone_suffix}", frame, pose[joint])


def key_point(rig, bone_name, frame, location, scale=1.0, rotation=None):
    bone = rig.pose.bones[bone_name]
    bone.location = location
    bone.rotation_mode = "QUATERNION"
    bone.rotation_quaternion = rotation or (1, 0, 0, 0)
    bone.scale = (scale, scale, scale)
    for path in ("location", "rotation_quaternion", "scale"):
        bone.keyframe_insert(data_path=path, frame=frame, group=bone_name)


def platform_overrides(pose, contact):
    contact = Vector(contact)
    shoulder_l, shoulder_r = pose["shoulder_L"], pose["shoulder_R"]
    midpoint = (shoulder_l + shoulder_r) / 2
    direction = (contact - midpoint).normalized()
    pose["elbow_L"] = shoulder_l + direction * 0.37
    pose["elbow_R"] = shoulder_r + direction * 0.37
    pose["wrist_L"] = contact + Vector((-0.055, 0, 0))
    pose["wrist_R"] = contact + Vector((0.055, 0, 0))
    return pose


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
    right_entry = human_pose((1.54, -5.25, 0.54), up=(0.70, 0.48, -0.53), forward=(0.18, 0.95, 0.25), limbs={
        "elbow_L": (-0.15, 0.24, 0.31), "elbow_R": (0.10, 0.30, 0.22),
        "wrist_L": (-0.06, 0.50, 0.22), "wrist_R": (0.08, 0.51, 0.16),
        "knee_L": (-0.28, -0.02, -0.30), "knee_R": (0.32, 0.10, -0.18),
        "ankle_L": (-0.38, -0.12, -0.54), "ankle_R": (0.43, -0.02, -0.42),
        "toe_L": (-0.35, 0.12, -0.61), "toe_R": (0.50, 0.18, -0.48),
    })
    # Back phase: knees tuck, arms protect the torso, and the skull remains clear of the floor.
    right_mid = human_pose((1.92, -5.20, 0.34), up=(0.24, 0.94, 0.25), forward=(-0.04, 0.06, 1), limbs={
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

    # Forward sprawl: low split step -> one-hand/forearm save -> elongated flight -> chest and hips share the landing.
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
    sprawl_flight = human_pose((0, -4.45, 0.50), up=(0, 0.98, 0.18), forward=(0, -0.18, 0.98), limbs={
        "elbow_L": (-0.26, 0.48, 0.18), "elbow_R": (0.26, 0.48, 0.18),
        "wrist_L": (-0.10, 0.90, 0.12), "wrist_R": (0.10, 0.90, 0.12),
        # Knees trail the hips in court space while remaining lifted; lower
        # legs fold upward instead of passing through the floor during flight.
        "knee_L": (-0.20, -0.10, -0.30), "knee_R": (0.20, -0.10, -0.30),
        "ankle_L": (-0.24, 0.20, -0.68), "ankle_R": (0.24, 0.20, -0.68),
        "toe_L": (-0.23, 0.16, -0.88), "toe_R": (0.23, 0.16, -0.88),
    }, overrides={"head_top": (0, -3.53, 0.72)})
    sprawl_land = human_pose((0, -4.18, 0.25), up=(0, 1, 0.05), forward=(0, -0.05, 1), limbs={
        # Arms remain long in the direction of travel after the save rather
        # than posting underneath the shoulders or taking the landing load.
        "elbow_L": (-0.30, 0.12, 0.88), "elbow_R": (0.30, 0.12, 0.88),
        "wrist_L": (-0.12, 0.03, 1.23), "wrist_R": (0.12, 0.03, 1.23),
        # Chest and hips are the low contact surfaces. Knees trail behind and
        # stay clearly elevated; ankles fold upward to keep every leg segment
        # above the court through the settled slide.
        "knee_L": (-0.23, 0.13, -0.46), "knee_R": (0.23, 0.13, -0.46),
        "ankle_L": (-0.25, 0.42, -0.82), "ankle_R": (0.25, 0.42, -0.82),
        "toe_L": (-0.23, 0.35, -1.04), "toe_R": (0.23, 0.35, -1.04),
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
        (84, right_entry), (96, right_mid), (108, right_exit), (114, kneel_right),
        (126, kneel_right), (138, ready),
        (150, ready_low), (162, left_react), (178, left_contact), (186, left_contact),
        (192, left_entry), (204, left_mid), (216, left_exit), (222, kneel_left),
        (234, kneel_left), (246, ready),
        (264, ready_low), (276, sprawl_read), (294, sprawl_contact), (306, sprawl_contact),
        (318, sprawl_flight), (330, sprawl_land), (348, sprawl_land),
        (360, sprawl_push), (378, sprawl_read), (390, ready), (420, ready),
    ]
    for frame, pose in keys:
        key_human(rig, "DEF", frame, pose)

    # A slim body-attached stripe makes the safe diagonal unmistakable: outside
    # shoulder -> upper back -> opposite hip. It appears only during each roll.
    hidden = 0.001
    key_point(rig, "GUIDE_DIAG_RIGHT", 0, right_contact["shoulder_R"], hidden)
    key_point(rig, "GUIDE_DIAG_RIGHT", 76, right_contact["shoulder_R"], hidden)
    for frame, pose in ((78, right_contact), (84, right_entry), (96, right_mid), (108, right_exit), (114, kneel_right)):
        key_segment(rig.pose.bones["GUIDE_DIAG_RIGHT"], frame, pose["shoulder_R"], pose["hip_L"])
    key_point(rig, "GUIDE_DIAG_RIGHT", 116, kneel_right["shoulder_R"], hidden)
    key_point(rig, "GUIDE_DIAG_RIGHT", FRAME_END, kneel_right["shoulder_R"], hidden)

    key_point(rig, "GUIDE_DIAG_LEFT", 0, left_contact["shoulder_L"], hidden)
    key_point(rig, "GUIDE_DIAG_LEFT", 184, left_contact["shoulder_L"], hidden)
    for frame, pose in ((186, left_contact), (192, left_entry), (204, left_mid), (216, left_exit), (222, kneel_left)):
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
    for frame, phase in keys:
        key_human(rig, "COACH", frame, coach_pose(base, phase))


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
            spin = Matrix.Rotation(math.radians(frame * 7), 4, "Z").to_quaternion()
            key_point(rig, bone_name, frame, location, scale, spin)

    impacts = {
        "IMPACT_RIGHT": (78, (2.15, -5.02, 0.48)),
        "IMPACT_LEFT": (186, (-2.15, -5.02, 0.48)),
        "IMPACT_SPRAWL": (306, (0, -3.98, 0.31)),
    }
    for bone_name, (frame, location) in impacts.items():
        key_point(rig, bone_name, 0, location, hidden)
        key_point(rig, bone_name, frame - 2, location, hidden)
        key_point(rig, bone_name, frame, location, 1.0)
        key_point(rig, bone_name, frame + 8, location, 1.65)
        key_point(rig, bone_name, frame + 10, location, hidden)
        key_point(rig, bone_name, FRAME_END, location, hidden)


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
    rig["duration_seconds"] = FRAME_END / FPS
    rig["loop"] = True
    rig["drill_id"] = "rolls-and-sprawls"
    rig["timeline_json"] = json.dumps([
        {"name": name, "start": start / FPS, "end": end / FPS, "startFrame": start, "endFrame": end}
        for name, start, end in phases
    ])
    for name, start, end in phases:
        bpy.context.scene.timeline_markers.new(name, frame=start)
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
    # Blender's default Bezier interpolation provides continuous body motion.
    # Exact contacts and floor poses are held by the paired keys around them.
    # (Blender 5 stores curves in layered action channel-bags rather than the
    # legacy Action.fcurves collection.)
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
    scene.frame_set(frame)
    scene.render.filepath = str(PREVIEW_DIR / filename)
    bpy.ops.render.render(write_still=True)


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.frame_start = 0
    scene.frame_end = FRAME_END
    scene.render.fps = FPS
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
    rig["asset_version"] = 1
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
    render_preview(scene, court_camera, 0, "rolls-and-sprawls-court.png")
    render_preview(scene, mechanics_camera, 84, "rolls-and-sprawls-right-roll.png")
    render_preview(scene, mechanics_camera, 192, "rolls-and-sprawls-left-roll.png")
    render_preview(scene, sprawl_camera, 294, "rolls-and-sprawls-sprawl.png")
    render_preview(scene, sprawl_camera, 342, "rolls-and-sprawls-sprawl-landing.png")

    report = {
        "glb": str(GLB_PATH), "blend": str(BLEND_PATH), "clip": action.name,
        "fps": FPS, "frames": [0, FRAME_END], "durationSeconds": FRAME_END / FPS,
        "previews": [str(p) for p in sorted(PREVIEW_DIR.glob("rolls-and-sprawls-*.png"))],
    }
    print("COACHCAM_BUILD_REPORT=" + json.dumps(report, sort_keys=True))


if __name__ == "__main__":
    main()
