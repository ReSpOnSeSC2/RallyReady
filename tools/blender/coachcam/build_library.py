"""Build the shared RallyReady CoachCam 3D production library.

The library is intentionally drill-agnostic. Blender owns the court, the
articulated full-body athlete, all equipment, the ball, the camera grammar, and
the complete motion reel. Browser code supplies only factual drill-specific
placements, routes, contacts, and timing from RR.drillChoreography.

Run with Blender 5.1+ from the repository root:

  blender --background --factory-startup --python tools/blender/coachcam/build_library.py

Outputs:
  models/coachcam/coachcam-library.glb
  design-assets/blender/coachcam-library.blend
"""

from __future__ import annotations

import json
import math
import pathlib
import sys

import bpy
from mathutils import Vector


HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[2]
BLENDER_TOOLS = HERE.parent
if str(BLENDER_TOOLS) not in sys.path:
    sys.path.insert(0, str(BLENDER_TOOLS))

import build_rolls_and_sprawls as base  # noqa: E402


FPS = 24
GLB_PATH = REPO / "models" / "coachcam" / "coachcam-library.glb"
BLEND_PATH = REPO / "design-assets" / "blender" / "coachcam-library.blend"
PREVIEW_DIR = REPO / "design-assets" / "blender" / "previews"
CLIP_NAME = "CoachCam_MotionLibrary"


# This is the exact semantic action vocabulary exported by
# RR.drillChoreography. Durations mirror the browser contract and are recorded
# in scene extras so Blender and runtime can be validated against one another.
MOTIONS = [
    ("ready", 0.85), ("sprint", 1.15), ("shuffle", 1.05),
    ("backpedal", 1.10), ("pass", 0.95), ("set", 0.95),
    ("feed", 1.00), ("serve", 1.30), ("attack", 1.30),
    ("block", 1.05), ("dig", 1.10), ("sprawl", 1.45),
    ("run-through", 1.20), ("defensive-ready", 1.00),
    ("down-ball-hit", 1.25), ("low-toss", 0.90),
    ("one-arm-save", 1.15), ("platform-save", 1.10),
    ("shoulder-roll-right", 1.45), ("shoulder-roll-left", 1.45),
    ("chest-hip-sprawl", 1.45), ("floor-recovery", 1.25),
    ("ladder", 1.20), ("jump-rope", 1.20), ("mini-band", 1.25),
    ("bridge", 1.30), ("band", 1.25), ("band-upper", 1.25),
    ("band-arm-swing", 1.40), ("box-hit", 1.45), ("signal", 1.05),
    ("free-arm-swing", 1.25), ("medicine", 1.35),
    ("medicine-slam", 1.35), ("medicine-rotate", 1.35),
    ("medicine-scoop", 1.35), ("box", 1.25),
    ("depth-drop", 1.25), ("box-block", 1.25),
    ("mat-defense", 1.45), ("jump", 1.15),
    ("approach-jump", 1.25), ("power", 1.10),
    ("warmup", 1.50), ("foam", 1.60), ("stretch", 1.65),
    ("recovery", 1.70), ("admin", 0.90), ("underhand", 1.25),
    ("jump-float", 1.40), ("jump-topspin", 1.45),
    ("tip-roll", 1.25),
]


def v(value):
    return Vector(value)


def make_materials():
    rgba = base.rgba
    material = base.material
    return {
        "arena": material("Library arena navy", rgba("#071827"), roughness=0.64),
        "court": material("Library court terracotta", rgba("#aa5c40"), roughness=0.57),
        "line": material("Library court line", rgba("#fff6e9"), roughness=0.38),
        "navy": material("Library structural navy", rgba("#10223b"), metallic=0.08, roughness=0.38),
        "net": material("Library net graphite", rgba("#263b4d"), roughness=0.47),
        "coral": material("Library Rally coral", rgba("#ff6542"), roughness=0.39),
        "teal": material("Library teaching teal", rgba("#28d4b5"), roughness=0.34,
                         emission=rgba("#28d4b5")),
        "blue": material("Library team blue", rgba("#4f7dea"), roughness=0.43),
        "cream": material("Library cream panel", rgba("#fff0df"), roughness=0.45),
        "skin": material("Library warm skin", rgba("#b96d4e"), roughness=0.55),
        "hair": material("Library dark hair", rgba("#231b24"), roughness=0.68),
        "shorts": material("Library athlete shorts", rgba("#12223a"), roughness=0.49),
        "kneepad": material("Library kneepads", rgba("#f4e9dc"), roughness=0.57),
        "shoe": material("Library court shoes", rgba("#f8f0e5"), roughness=0.43),
        "ball": material("Library volleyball ivory", rgba("#fff8ea"), roughness=0.35),
        "ball_band": material("Library volleyball navy band", rgba("#173b61"), roughness=0.35),
        "rubber": material("Library equipment rubber", rgba("#182537"), roughness=0.66),
        "mat": material("Library training mat", rgba("#1e907e"), roughness=0.56),
        "wood": material("Library plyo wood", rgba("#ba7a43"), roughness=0.63),
        "yellow": material("Library training yellow", rgba("#ffd166"), roughness=0.46),
        "wall": material("Library training wall", rgba("#dce4e8"), roughness=0.72),
        "medicine": material("Library medicine ball", rgba("#304b68"), roughness=0.73),
    }


def parent_new_objects(root, before):
    for obj in bpy.context.scene.objects:
        if obj.name not in before and obj is not root and obj.parent is None:
            obj.parent = root


def empty(name, location=(0, 0, 0)):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    return obj


def build_world_and_court(mats):
    world = bpy.data.worlds.new("CoachCam Library World")
    bpy.context.scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = base.rgba("#07111f")
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.30

    root = empty("CourtEnvironment")
    root["asset_role"] = "shared-court"
    before = {obj.name for obj in bpy.context.scene.objects}
    base.cube("ArenaFloor", (0, 0, -0.22), (17.5, 25.0, 0.35), mats["arena"], 0.18)
    court = base.cube("Court", (0, 0, -0.04), (9, 18, 0.12), mats["court"], 0.08)
    court["width_m"] = 9.0
    court["length_m"] = 18.0
    court["surface"] = "indoor volleyball"
    line_z = 0.035
    for x in (-4.46, 4.46):
        base.cube(f"Sideline_{x:+.2f}", (x, 0, line_z), (0.08, 18, 0.025), mats["line"])
    for y in (-8.96, 8.96):
        base.cube(f"Baseline_{y:+.2f}", (0, y, line_z), (9, 0.08, 0.025), mats["line"])
    for y in (-3, 0, 3):
        base.cube(f"CourtLine_{y:+.0f}", (0, y, line_z), (9, 0.06, 0.022), mats["line"])

    net_root = empty("NetSystem")
    net_root["equipment_key"] = "net"
    for x in (-4.9, 4.9):
        base.cylinder_between(f"NetPost_{x:+.1f}", (x, 0, 0), (x, 0, 2.75), 0.075, mats["navy"])
        base.cylinder_between(f"PostPad_{x:+.1f}", (x, 0, 0.05), (x, 0, 1.25), 0.13, mats["coral"])
    base.cylinder_between("NetTopTape", (-4.6, 0, 2.43), (4.6, 0, 2.43), 0.035, mats["line"])
    base.cylinder_between("NetBottomTape", (-4.6, 0, 1.15), (4.6, 0, 1.15), 0.018, mats["line"])
    for x in [i * 0.46 - 4.6 for i in range(21)]:
        base.cylinder_between(f"NetV_{x:+.2f}", (x, 0, 1.16), (x, 0, 2.42), 0.008, mats["net"])
    for z in [1.18 + i * 0.18 for i in range(8)]:
        base.cylinder_between(f"NetH_{z:.2f}", (-4.58, 0, z), (4.58, 0, z), 0.007, mats["net"])

    # Parent the net first so runtime can hide it for wall/fitness phases, then
    # place the complete net system under the shared environment.
    for obj in bpy.context.scene.objects:
        if obj.name not in before and obj.parent is None and obj not in (root, net_root, court):
            if obj.name.startswith(("Net", "Post")):
                obj.parent = net_root
    net_root.parent = root
    for obj in bpy.context.scene.objects:
        if obj.name not in before and obj.parent is None and obj not in (root, net_root):
            obj.parent = root
    return root


def prototype_root(name, key, slot):
    root = empty(name, (42 + slot * 4, 42, 0))
    root["prototype"] = True
    root["equipment_key"] = key
    return root


def finish_prototype(root, objects):
    for obj in objects:
        obj.parent = root
    return root


def make_ball_group(name, key, slot, mats, radius=0.107, material_key="ball"):
    root = prototype_root(name, key, slot)
    ball = base.sphere(name + "_Body", (0, 0, 0), radius, mats[material_key], 24, 12)
    children = [ball]
    if key == "balls":
        for index, rotation in enumerate(((0, 0, 0), (math.pi / 2, 0, 0), (0, math.pi / 2, 0))):
            bpy.ops.mesh.primitive_torus_add(major_radius=radius, minor_radius=0.007,
                                             major_segments=24, minor_segments=6,
                                             location=(0, 0, 0), rotation=rotation)
            band = bpy.context.object
            band.name = f"{name}_Band_{index + 1}"
            band.data.materials.append(mats["ball_band"])
            children.append(band)
    return finish_prototype(root, children)


def build_equipment(mats):
    roots = {}
    roots["balls"] = make_ball_group("Prototype_Ball", "balls", 0, mats)

    root = prototype_root("Prototype_AgilityLadder", "agility ladder", 1)
    objs = [base.cube("LadderRail_L", (-0.45, 0, 0.025), (0.05, 4.2, 0.05), mats["yellow"], 0.02),
            base.cube("LadderRail_R", (0.45, 0, 0.025), (0.05, 4.2, 0.05), mats["yellow"], 0.02)]
    for i in range(9):
        objs.append(base.cube(f"LadderRung_{i + 1}", (0, -1.9 + i * 0.475, 0.035),
                              (0.92, 0.045, 0.055), mats["yellow"], 0.015))
    roots["agility ladder"] = finish_prototype(root, objs)

    root = prototype_root("Prototype_Bands", "bands", 2)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.42, minor_radius=0.026,
                                     major_segments=36, minor_segments=8, location=(0, 0, 0.85),
                                     rotation=(math.pi / 2, 0, 0))
    band = bpy.context.object
    band.name = "ResistanceBand"
    band.scale.z = 1.65
    band.data.materials.append(mats["teal"])
    roots["bands"] = finish_prototype(root, [band])

    root = prototype_root("Prototype_PlyoBox", "box", 3)
    box = base.cube("PlyoBox", (0, 0, 0.38), (0.9, 0.8, 0.76), mats["wood"], 0.08)
    top = base.cube("PlyoBoxTop", (0, 0, 0.775), (0.82, 0.72, 0.05), mats["rubber"], 0.04)
    roots["box"] = finish_prototype(root, [box, top])

    root = prototype_root("Prototype_Cones", "cones", 4)
    cones = []
    for i, (x, y) in enumerate(((-0.65, -0.55), (0.65, -0.55), (-0.65, 0.55), (0.65, 0.55))):
        bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.16, radius2=0.055,
                                       depth=0.36, location=(x, y, 0.18))
        cone = bpy.context.object
        cone.name = f"TrainingCone_{i + 1}"
        cone.data.materials.append(mats["coral"])
        cones.append(cone)
    roots["cones"] = finish_prototype(root, cones)

    root = prototype_root("Prototype_FoamRoller", "foam roller", 5)
    roller = base.cylinder_between("FoamRoller", (-0.42, 0, 0.14), (0.42, 0, 0.14), 0.14, mats["teal"], 28)
    roots["foam roller"] = finish_prototype(root, [roller])

    root = prototype_root("Prototype_Hoops", "hoops", 6)
    hoops = []
    for i, (x, y) in enumerate(((-0.55, 0), (0.55, 0))):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.42, minor_radius=0.025,
                                         major_segments=36, minor_segments=8,
                                         location=(x, y, 0.035))
        hoop = bpy.context.object
        hoop.name = f"FloorHoop_{i + 1}"
        hoop.data.materials.append(mats["yellow"] if i == 0 else mats["coral"])
        hoops.append(hoop)
    roots["hoops"] = finish_prototype(root, hoops)

    root = prototype_root("Prototype_JumpRope", "jump ropes", 7)
    rope = base.curve_mesh("JumpRope", [[(-0.58, 0, 0.65), (-0.48, 0.35, 0.1),
                                         (0, 0.5, -0.02), (0.48, 0.35, 0.1),
                                         (0.58, 0, 0.65)]], mats["teal"], 0.018)
    handles = [base.cylinder_between("RopeHandle_L", (-0.58, -0.08, 0.58), (-0.58, 0.08, 0.72), 0.035, mats["navy"]),
               base.cylinder_between("RopeHandle_R", (0.58, -0.08, 0.58), (0.58, 0.08, 0.72), 0.035, mats["navy"])]
    roots["jump ropes"] = finish_prototype(root, [rope] + handles)

    root = prototype_root("Prototype_Mat", "mats", 8)
    mat = base.cube("TrainingMat", (0, 0, 0.045), (1.45, 2.5, 0.09), mats["mat"], 0.11)
    roots["mats"] = finish_prototype(root, [mat])

    roots["medicine ball"] = make_ball_group("Prototype_MedicineBall", "medicine ball", 9,
                                               mats, 0.16, "medicine")

    root = prototype_root("Prototype_MiniBand", "mini bands", 10)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.28, minor_radius=0.035,
                                     major_segments=32, minor_segments=8, location=(0, 0, 0.34),
                                     rotation=(math.pi / 2, 0, 0))
    mini = bpy.context.object
    mini.name = "MiniBand"
    mini.scale.x = 1.75
    mini.data.materials.append(mats["coral"])
    roots["mini bands"] = finish_prototype(root, [mini])

    # The net is already part of the shared court and is toggled by name.
    roots["net"] = None

    root = prototype_root("Prototype_ReactionBall", "reaction ball", 11)
    reaction_parts = []
    for i, p in enumerate(((0, 0, 0), (0.08, 0, 0), (-0.08, 0, 0), (0, 0.08, 0))):
        reaction_parts.append(base.sphere(f"ReactionBallLobe_{i + 1}", p, 0.075, mats["coral"], 16, 8))
    roots["reaction ball"] = finish_prototype(root, reaction_parts)

    root = prototype_root("Prototype_TrainingWall", "wall", 12)
    wall = base.cube("TrainingWall", (0, 0, 2.1), (8.2, 0.28, 4.2), mats["wall"], 0.08)
    target = base.curve_mesh("WallTarget", [[(-0.55, -0.16, 2.05), (0.55, -0.16, 2.05)],
                                             [(0, -0.16, 1.5), (0, -0.16, 2.6)]], mats["coral"], 0.035)
    roots["wall"] = finish_prototype(root, [wall, target])
    return roots


def athlete_palette(mats):
    return {
        "jersey": mats["coral"], "jersey_alt": mats["cream"],
        "shorts": mats["shorts"], "skin": mats["skin"], "hair": mats["hair"],
        "kneepad": mats["kneepad"], "shoe": mats["shoe"],
    }


def build_athlete(mats):
    root = empty("AthleteTemplate", (38, 42, 0))
    root["prototype"] = True
    root["prototype_role"] = "athlete"
    root["rig_contract"] = "RR_Humanoid_v1"
    segment_bones = [f"ATH_{segment}" for segment in base.SEGMENTS]
    joint_bones = [f"ATH_JOINT_{joint}" for joint in base.POINT_JOINTS]
    rig = base.create_rig(segment_bones + joint_bones)
    rig.name = "RR_Humanoid_v1"
    rig.data.name = "RR_Humanoid_v1_Data"
    rig["rig_contract"] = "RR_Humanoid_v1"
    rig.parent = root
    palette = athlete_palette(mats)
    base.add_athlete_mesh("ATH", rig, palette, "AthleteTemplate_Torso")
    base.add_joint_meshes("ATH", rig, palette)

    # Merge the many readable anatomical pieces into one skinned object. The
    # armature and material assignments remain intact, while 13-player drills
    # avoid hundreds of duplicate object draw submissions.
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH" and obj.parent == rig]
    bpy.ops.object.select_all(action="DESELECT")
    for obj in meshes:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.join()
    mesh = bpy.context.view_layer.objects.active
    mesh.name = "AthleteTemplate_Mesh"
    mesh["shared_geometry"] = True
    mesh["palette_slots"] = "jersey,cream,shorts,skin,hair,kneepad,shoe"
    return root, rig, mesh


def pose_stand():
    return base.human_pose((0, 0, 0.98), limbs={
        "elbow_L": (-0.31, 0.02, 0.28), "elbow_R": (0.31, 0.02, 0.28),
        "wrist_L": (-0.34, 0.02, -0.02), "wrist_R": (0.34, 0.02, -0.02),
        "knee_L": (-0.20, 0, -0.44), "knee_R": (0.20, 0, -0.44),
        "ankle_L": (-0.20, 0, -0.88), "ankle_R": (0.20, 0, -0.88),
        "toe_L": (-0.20, 0.26, -0.91), "toe_R": (0.20, 0.26, -0.91),
    })


def pose_ready(low=0.0):
    z = 0.86 - low * 0.14
    return base.human_pose((0, 0, z), up=(0, 0.27 + low * 0.15, 0.96 - low * 0.06), limbs={
        "elbow_L": (-0.25, 0.31, 0.31), "elbow_R": (0.25, 0.31, 0.31),
        "wrist_L": (-0.10, 0.56, 0.16), "wrist_R": (0.10, 0.56, 0.16),
        "knee_L": (-0.36, 0.12, -0.39), "knee_R": (0.36, 0.12, -0.39),
        "ankle_L": (-0.49, -0.02, -0.72), "ankle_R": (0.49, -0.02, -0.72),
        "toe_L": (-0.49, 0.27, -0.75), "toe_R": (0.49, 0.27, -0.75),
    })


def pose_run(side=1, back=False, high=False):
    direction = -1 if back else 1
    knee_front = 0.18 if high else -0.05
    return base.human_pose((0, 0, 0.93 + (0.04 if high else 0)),
                           up=(0, 0.30 * direction, 0.954), limbs={
        "elbow_L": (-0.25, 0.25 * side * direction, 0.42),
        "elbow_R": (0.25, -0.25 * side * direction, 0.42),
        "wrist_L": (-0.18, 0.50 * side * direction, 0.20),
        "wrist_R": (0.18, -0.50 * side * direction, 0.20),
        "knee_L": (-0.20, 0.48 * side * direction, knee_front if side > 0 else -0.50),
        "knee_R": (0.20, -0.48 * side * direction, knee_front if side < 0 else -0.50),
        "ankle_L": (-0.20, 0.35 * side * direction, -0.36 if side > 0 else -0.88),
        "ankle_R": (0.20, -0.35 * side * direction, -0.36 if side < 0 else -0.88),
        "toe_L": (-0.20, 0.62 * side * direction, -0.42 if side > 0 else -0.91),
        "toe_R": (0.20, -0.62 * side * direction, -0.42 if side < 0 else -0.91),
    })


def pose_shuffle(side=1):
    return base.human_pose((0.12 * side, 0, 0.76), up=(0.12 * side, 0.34, 0.93), limbs={
        "elbow_L": (-0.30, 0.30, 0.30), "elbow_R": (0.30, 0.30, 0.30),
        "wrist_L": (-0.14, 0.55, 0.16), "wrist_R": (0.14, 0.55, 0.16),
        "knee_L": (-0.50, 0.12, -0.30), "knee_R": (0.50, 0.12, -0.30),
        "ankle_L": (-0.76 if side < 0 else -0.48, 0, -0.58),
        "ankle_R": (0.76 if side > 0 else 0.48, 0, -0.58),
        "toe_L": (-0.79 if side < 0 else -0.48, 0.27, -0.62),
        "toe_R": (0.79 if side > 0 else 0.48, 0.27, -0.62),
    })


def platform_pose(side=0, low=0.0, one_arm=False):
    pose = pose_ready(0.35 + low * 0.45)
    contact = Vector((0.62 * side, 0.82, 0.50 - low * 0.20))
    if one_arm:
        shoulder = pose["shoulder_R" if side >= 0 else "shoulder_L"]
        active = "R" if side >= 0 else "L"
        other = "L" if active == "R" else "R"
        direction = (contact - shoulder).normalized()
        pose[f"elbow_{active}"] = shoulder + direction * 0.42
        pose[f"wrist_{active}"] = contact
        pose[f"elbow_{other}"] = pose[f"shoulder_{other}"] + Vector((0, 0.20, -0.08))
        pose[f"wrist_{other}"] = pose[f"elbow_{other}"] + Vector((0, 0.25, -0.13))
    else:
        base.platform_overrides(pose, contact)
    return pose


def overhead_pose(kind="set", phase=0.5):
    pose = pose_ready(0.15 if phase < 0.5 else 0)
    if kind == "block":
        pose = base.human_pose((0, 0, 1.25 if phase >= 0.5 else 0.82), limbs={
            "elbow_L": (-0.28, 0.05, 0.78), "elbow_R": (0.28, 0.05, 0.78),
            "wrist_L": (-0.24, 0.18, 1.14), "wrist_R": (0.24, 0.18, 1.14),
            "knee_L": (-0.20, 0, -0.44), "knee_R": (0.20, 0, -0.44),
            "ankle_L": (-0.20, 0, -0.88), "ankle_R": (0.20, 0, -0.88),
            "toe_L": (-0.20, 0.24, -0.91), "toe_R": (0.20, 0.24, -0.91),
        })
    else:
        # Build the setting window from this pose's actual head/shoulder
        # landmarks. Absolute world heights caused the raised skeleton to put
        # its hands below the neck in the first library export.
        head = pose["head_top"]
        pose["elbow_L"] = Vector((-0.35, 0.15, head.z - 0.30))
        pose["elbow_R"] = Vector((0.35, 0.15, head.z - 0.30))
        pose["wrist_L"] = Vector((-0.15, 0.24, head.z + 0.03 + phase * 0.08))
        pose["wrist_R"] = Vector((0.15, 0.24, head.z + 0.03 + phase * 0.08))
    return pose


def arm_swing_pose(phase=0.0, jump=False, roll=False):
    height = 1.24 if jump and 0.38 <= phase <= 0.72 else 0.92
    pose = base.human_pose((0, 0, height), up=(0, 0.20, 0.98), limbs={
        "knee_L": (-0.24, 0.10, -0.43), "knee_R": (0.24, 0.10, -0.43),
        "ankle_L": (-0.24, 0, -0.86), "ankle_R": (0.24, 0, -0.86),
        "toe_L": (-0.24, 0.26, -0.89), "toe_R": (0.24, 0.26, -0.89),
    })
    head_z = pose["head_top"].z
    shoulder_z = pose["shoulder_R"].z
    if phase < 0.28:
        pose.update({"elbow_R": Vector((0.38, -0.18, head_z - 0.30)),
                     "wrist_R": Vector((0.28, -0.34, head_z - 0.02)),
                     "elbow_L": Vector((-0.35, 0.30, shoulder_z - 0.12)),
                     "wrist_L": Vector((-0.18, 0.60, shoulder_z - 0.32))})
    elif phase < 0.62:
        pose.update({"elbow_R": Vector((0.20, 0.14, head_z - 0.12)),
                     "wrist_R": Vector((0.10, 0.42, head_z + 0.28)),
                     "elbow_L": Vector((-0.28, 0.22, shoulder_z - 0.14)),
                     "wrist_L": Vector((-0.12, 0.54, shoulder_z - 0.34))})
    else:
        side = -0.32 if roll else 0.05
        pose.update({"elbow_R": Vector((0.22, 0.48, shoulder_z - 0.12)),
                     "wrist_R": Vector((side, 0.78, shoulder_z - 0.32)),
                     "elbow_L": Vector((-0.20, 0.36, shoulder_z - 0.28)),
                     "wrist_L": Vector((-0.06, 0.58, shoulder_z - 0.46))})
    return pose


def toss_pose(phase=0.5, low=False, underhand=False):
    pose = pose_stand()
    if underhand or low:
        pose["elbow_R"] = Vector((0.26, 0.35 if phase < 0.5 else 0.48, 0.24))
        pose["wrist_R"] = Vector((0.12, 0.68 if phase < 0.5 else 0.88, 0.16 + phase * 0.35))
        pose["elbow_L"] = Vector((-0.25, 0.18, 0.42))
        pose["wrist_L"] = Vector((-0.14, 0.42, 0.58))
    else:
        pose["elbow_L"] = Vector((-0.20, 0.20, 0.82))
        pose["wrist_L"] = Vector((-0.10, 0.25, 1.20 + phase * 0.22))
        pose["elbow_R"] = Vector((0.35, -0.10, 0.72))
        pose["wrist_R"] = Vector((0.25, -0.28, 1.02))
    return pose


def jump_pose(height=0.0, arms="up"):
    pelvis = 0.80 + height
    pose = base.human_pose((0, 0, pelvis), limbs={
        "knee_L": (-0.24, 0.08, -0.36), "knee_R": (0.24, 0.08, -0.36),
        "ankle_L": (-0.24, 0, -0.72), "ankle_R": (0.24, 0, -0.72),
        "toe_L": (-0.24, 0.25, -0.76), "toe_R": (0.24, 0.25, -0.76),
    })
    if arms == "up":
        pose.update({"elbow_L": Vector((-0.28, 0.06, 0.82)), "elbow_R": Vector((0.28, 0.06, 0.82)),
                     "wrist_L": Vector((-0.20, 0.15, 1.18)), "wrist_R": Vector((0.20, 0.15, 1.18))})
    elif arms == "back":
        pose.update({"elbow_L": Vector((-0.31, -0.24, 0.25)), "elbow_R": Vector((0.31, -0.24, 0.25)),
                     "wrist_L": Vector((-0.24, -0.48, 0.08)), "wrist_R": Vector((0.24, -0.48, 0.08))})
    return pose


def prone_pose(reach=True):
    # Long axis follows +Y; chest and hips share the low landing while knees
    # remain visibly lifted behind the body.
    return base.human_pose((0, 0.12, 0.26), up=(0, 0.998, 0.06), forward=(0, -0.06, 0.998), limbs={
        "elbow_L": (-0.28, 0.14, 0.84 if reach else 0.38),
        "elbow_R": (0.28, 0.14, 0.84 if reach else 0.38),
        "wrist_L": (-0.12, 0.03, 1.22 if reach else 0.62),
        "wrist_R": (0.12, 0.03, 1.22 if reach else 0.62),
        "knee_L": (-0.24, 0.14, -0.43), "knee_R": (0.24, 0.14, -0.43),
        "ankle_L": (-0.25, 0.44, -0.78), "ankle_R": (0.25, 0.44, -0.78),
        "toe_L": (-0.24, 0.37, -1.01), "toe_R": (0.24, 0.37, -1.01),
    }, overrides={"head_top": (0, 1.08, 0.61)})


def pancake_pose(side=1, extension=1.0):
    """Full-layout one-hand pancake with the free arm protecting the landing.

    The active hand stays long, flat, and court-level while the chest and hips
    arrive behind it. This is intentionally different from a two-arm sprawl:
    one shoulder reaches through the ball and the other elbow remains bent so
    the athlete can absorb the slide safely.
    """
    active_right = side >= 0
    active_x = 0.18 if active_right else -0.18
    support_x = -0.34 if active_right else 0.34
    limbs = {
        "knee_L": (-0.25, 0.12, -0.42), "knee_R": (0.25, 0.12, -0.42),
        "ankle_L": (-0.26, 0.42, -0.78), "ankle_R": (0.26, 0.42, -0.78),
        "toe_L": (-0.25, 0.38, -1.00), "toe_R": (0.25, 0.38, -1.00),
    }
    if active_right:
        limbs.update({
            "elbow_R": (0.24, -0.03, 0.84 + 0.14 * extension),
            "wrist_R": (active_x, -0.17, 1.28 + 0.28 * extension),
            "elbow_L": (support_x, 0.16, 0.48),
            "wrist_L": (-0.46, 0.10, 0.25),
        })
    else:
        limbs.update({
            "elbow_L": (-0.24, -0.03, 0.84 + 0.14 * extension),
            "wrist_L": (active_x, -0.17, 1.28 + 0.28 * extension),
            "elbow_R": (support_x, 0.16, 0.48),
            "wrist_R": (0.46, 0.10, 0.25),
        })
    return base.human_pose(
        (0.06 * side, 0.10, 0.25), up=(0, 0.998, 0.06),
        forward=(0, -0.06, 0.998), limbs=limbs,
        overrides={"head_top": (0.10 * side, 1.03, 0.62)}
    )


def roll_pose(side=1, phase=0.5):
    if phase < 0.34:
        return platform_pose(side, 0.65)
    if phase < 0.70:
        # Curled across the outside shoulder, never over the neck/spine.
        pose = base.human_pose((0.28 * side, 0.18, 0.38),
                               up=(0.70 * side, 0.66, 0.28), forward=(0, 0.30, 0.95), limbs={
            "elbow_L": (-0.24, 0.12, 0.34), "elbow_R": (0.24, 0.12, 0.34),
            "wrist_L": (-0.10, 0.30, 0.24), "wrist_R": (0.10, 0.30, 0.24),
            "knee_L": (-0.25, -0.16, -0.25), "knee_R": (0.25, -0.16, -0.25),
            "ankle_L": (-0.31, 0.06, -0.49), "ankle_R": (0.31, 0.06, -0.49),
            "toe_L": (-0.30, 0.29, -0.52), "toe_R": (0.30, 0.29, -0.52),
        }, overrides={"head_top": (0.42 * side, 0.82, 0.60)})
        # The continuous rounded silhouette includes kneepad volume outside the
        # centerline skeleton. Lift the curled phase by 8 cm so neither knee
        # shell penetrates the 3.5 cm court surface after glTF round-trip.
        for landmark in pose.values():
            landmark.z += 0.08
        return pose
    return pose_ready(0.55)


def floor_recovery_pose(phase):
    if phase < 0.34:
        return prone_pose(False)
    if phase < 0.68:
        return base.human_pose((0, 0, 0.54), up=(0, 0.52, 0.85), limbs={
            "elbow_L": (-0.30, 0.26, 0.30), "elbow_R": (0.30, 0.26, 0.30),
            "wrist_L": (-0.35, 0.52, 0.04), "wrist_R": (0.35, 0.52, 0.04),
            "knee_L": (-0.26, 0.12, -0.38), "knee_R": (0.30, -0.04, -0.18),
            "ankle_L": (-0.34, -0.08, -0.53), "ankle_R": (0.42, -0.18, -0.38),
            "toe_L": (-0.34, 0.18, -0.56), "toe_R": (0.48, 0.06, -0.42),
        })
    return pose_ready(0.15)


def bridge_pose(up=False):
    pose = base.human_pose((0, 0, 0.32 if up else 0.20), up=(0, 0.97, 0.24 if up else 0.08),
                           forward=(0, -0.15, 0.98), limbs={
        "elbow_L": (-0.34, 0.05, 0.30), "elbow_R": (0.34, 0.05, 0.30),
        "wrist_L": (-0.38, -0.25, 0.10), "wrist_R": (0.38, -0.25, 0.10),
        "knee_L": (-0.25, 0.28, -0.05), "knee_R": (0.25, 0.28, -0.05),
        "ankle_L": (-0.25, 0.10, -0.42), "ankle_R": (0.25, 0.10, -0.42),
        "toe_L": (-0.25, 0.34, -0.46), "toe_R": (0.25, 0.34, -0.46),
    })
    return pose


def band_pose(kind, phase):
    pose = pose_stand()
    if kind == "upper":
        y = 0.24 + 0.10 * math.sin(phase * math.pi)
        z = 0.74 + 0.52 * phase
        spread = 0.22 + 0.32 * math.sin(phase * math.pi)
        pose.update({"elbow_L": Vector((-0.30, y, z - 0.18)), "elbow_R": Vector((0.30, y, z - 0.18)),
                     "wrist_L": Vector((-spread, y + 0.05, z)), "wrist_R": Vector((spread, y + 0.05, z))})
    else:
        pose.update({"elbow_R": Vector((0.28, 0.10, 0.42)), "wrist_R": Vector((0.42, 0.30 + phase * 0.25, 0.42)),
                     "elbow_L": Vector((-0.28, 0.10, 0.42)), "wrist_L": Vector((-0.10, 0.28, 0.42))})
    return pose


def medicine_pose(kind, phase):
    pose = pose_ready(0.2)
    if kind == "slam":
        z = 1.35 - 1.05 * phase
        pose.update({"elbow_L": Vector((-0.24, 0.18, z - 0.20)), "elbow_R": Vector((0.24, 0.18, z - 0.20)),
                     "wrist_L": Vector((-0.10, 0.35, z)), "wrist_R": Vector((0.10, 0.35, z))})
    elif kind == "rotate":
        side = -1 + 2 * phase
        pose.update({"elbow_L": Vector((-0.25, 0.28, 0.45)), "elbow_R": Vector((0.25, 0.28, 0.45)),
                     "wrist_L": Vector((0.34 * side - 0.10, 0.58, 0.42)),
                     "wrist_R": Vector((0.34 * side + 0.10, 0.58, 0.42))})
    elif kind == "scoop":
        z = 0.20 + phase * 0.90
        pose.update({"elbow_L": Vector((-0.22, 0.28, z + 0.10)), "elbow_R": Vector((0.22, 0.28, z + 0.10)),
                     "wrist_L": Vector((-0.10, 0.58, z)), "wrist_R": Vector((0.10, 0.58, z))})
    else:
        reach = 0.32 + phase * 0.42
        pose.update({"elbow_L": Vector((-0.26, reach, 0.55)), "elbow_R": Vector((0.26, reach, 0.55)),
                     "wrist_L": Vector((-0.11, reach + 0.28, 0.55)), "wrist_R": Vector((0.11, reach + 0.28, 0.55))})
    return pose


def stretch_pose(phase):
    side = -1 if phase < 0.5 else 1
    return base.human_pose((0.16 * side, 0, 0.83), up=(0.22 * side, 0.18, 0.96), limbs={
        "elbow_L": (-0.35, 0.08, 0.65 if side < 0 else 0.42),
        "elbow_R": (0.35, 0.08, 0.65 if side > 0 else 0.42),
        "wrist_L": (-0.52, 0.12, 0.90 if side < 0 else 0.22),
        "wrist_R": (0.52, 0.12, 0.90 if side > 0 else 0.22),
        "knee_L": (-0.46, 0.08, -0.30), "knee_R": (0.46, 0.08, -0.30),
        "ankle_L": (-0.70, 0, -0.66), "ankle_R": (0.70, 0, -0.66),
        "toe_L": (-0.72, 0.28, -0.70), "toe_R": (0.72, 0.28, -0.70),
    })


def foam_pose(phase):
    # Seated hamstring/calves roll: the torso remains long while the hips travel
    # a visible short distance above the roller.
    travel = -0.18 + 0.36 * phase
    return base.human_pose((0, travel, 0.45), up=(0, 0.58, 0.81), limbs={
        "elbow_L": (-0.34, -0.04, 0.24), "elbow_R": (0.34, -0.04, 0.24),
        "wrist_L": (-0.42, -0.24, -0.04), "wrist_R": (0.42, -0.24, -0.04),
        "knee_L": (-0.24, 0.38, -0.24), "knee_R": (0.24, 0.38, -0.24),
        "ankle_L": (-0.24, 0.75, -0.36), "ankle_R": (0.24, 0.75, -0.36),
        "toe_L": (-0.24, 0.98, -0.30), "toe_R": (0.24, 0.98, -0.30),
    })


def pose_sequence(motion_id):
    """Return five full-body poses; every semantic action stays distinct."""
    ready = pose_ready()
    stand = pose_stand()
    if motion_id in ("ready", "defensive-ready"):
        return [pose_ready(0.05), pose_ready(0.16), pose_ready(0.08), pose_ready(0.16), pose_ready(0.05)]
    if motion_id == "admin":
        return [stand, pose_ready(0.05), stand, pose_ready(0.05), stand]
    if motion_id == "sprint":
        return [pose_run(1), pose_run(-1, high=True), pose_run(1, high=True), pose_run(-1), pose_run(1)]
    if motion_id == "backpedal":
        return [pose_run(1, True), pose_run(-1, True, True), pose_run(1, True, True), pose_run(-1, True), pose_run(1, True)]
    if motion_id in ("shuffle", "mini-band"):
        return [pose_shuffle(-1), pose_shuffle(1), pose_shuffle(-1), pose_shuffle(1), pose_shuffle(-1)]
    if motion_id == "ladder":
        return [pose_run(1, high=True), pose_run(-1, high=True), pose_run(1, high=True), pose_run(-1, high=True), pose_run(1, high=True)]
    if motion_id in ("pass", "platform-save"):
        return [ready, platform_pose(0, 0.15), platform_pose(0, 0.28), platform_pose(0, 0.12), ready]
    if motion_id == "dig":
        return [ready, platform_pose(-1, 0.38), platform_pose(1, 0.62), platform_pose(0, 0.28), ready]
    if motion_id == "one-arm-save":
        return [ready, platform_pose(1, 0.58, True), pancake_pose(1, 0.35),
                pancake_pose(1, 1.0), pancake_pose(1, 1.0)]
    if motion_id == "set":
        return [ready, overhead_pose("set", 0.15), overhead_pose("set", 0.65), overhead_pose("set", 1), ready]
    if motion_id in ("feed", "low-toss"):
        return [stand, toss_pose(0.05, low=True), toss_pose(0.55, low=True), toss_pose(1, low=True), stand]
    if motion_id in ("serve", "jump-float", "jump-topspin"):
        jump = motion_id != "serve"
        return [pose_ready(0.1), toss_pose(0.15), arm_swing_pose(0.18, jump), arm_swing_pose(0.52, jump), arm_swing_pose(0.90, False)]
    if motion_id == "underhand":
        return [stand, toss_pose(0.05, underhand=True), toss_pose(0.55, underhand=True), arm_swing_pose(0.75), stand]
    if motion_id in ("attack", "down-ball-hit", "free-arm-swing", "band-arm-swing", "box-hit"):
        jump = motion_id in ("attack", "box-hit")
        return [pose_ready(0.3), arm_swing_pose(0.12, jump), arm_swing_pose(0.48, jump), arm_swing_pose(0.72, jump), arm_swing_pose(0.95)]
    if motion_id == "tip-roll":
        return [pose_ready(0.15), arm_swing_pose(0.18, True), arm_swing_pose(0.48, True, True), arm_swing_pose(0.72, False, True), ready]
    if motion_id in ("block", "box-block"):
        return [pose_ready(0.4), jump_pose(0, "back"), overhead_pose("block", 0.65), overhead_pose("block", 0.9), pose_ready(0.3)]
    if motion_id in ("sprawl", "chest-hip-sprawl"):
        return [ready, platform_pose(0, 0.8, True), prone_pose(True), prone_pose(False), floor_recovery_pose(0.70)]
    if motion_id == "run-through":
        return [pose_run(1), pose_run(-1, high=True), platform_pose(0, 0.42), pose_run(1), pose_run(-1)]
    if motion_id == "shoulder-roll-right":
        return [ready, roll_pose(1, 0.2), roll_pose(1, 0.5), roll_pose(1, 0.8), ready]
    if motion_id == "shoulder-roll-left":
        return [ready, roll_pose(-1, 0.2), roll_pose(-1, 0.5), roll_pose(-1, 0.8), ready]
    if motion_id == "floor-recovery":
        return [floor_recovery_pose(0), floor_recovery_pose(0.30), floor_recovery_pose(0.55), floor_recovery_pose(0.80), ready]
    if motion_id == "mat-defense":
        return [ready, platform_pose(1, 0.65), roll_pose(1, 0.55), floor_recovery_pose(0.58), ready]
    if motion_id == "jump-rope":
        return [jump_pose(0.05), jump_pose(0.24), jump_pose(0.06), jump_pose(0.24), jump_pose(0.05)]
    if motion_id == "bridge":
        return [bridge_pose(False), bridge_pose(True), bridge_pose(False), bridge_pose(True), bridge_pose(False)]
    if motion_id == "band":
        return [band_pose("rotation", 0), band_pose("rotation", 1), band_pose("rotation", 0), band_pose("rotation", 1), band_pose("rotation", 0)]
    if motion_id == "band-upper":
        return [band_pose("upper", 0), band_pose("upper", .25), band_pose("upper", .5), band_pose("upper", .75), band_pose("upper", 1)]
    if motion_id == "signal":
        signal = pose_stand()
        signal["elbow_R"] = Vector((0.30, 0.05, 0.82)); signal["wrist_R"] = Vector((0.22, 0.08, 1.18))
        return [stand, signal, signal, stand, signal]
    if motion_id.startswith("medicine"):
        kind = motion_id.split("-", 1)[1] if "-" in motion_id else "pass"
        return [medicine_pose(kind, 0), medicine_pose(kind, .25), medicine_pose(kind, .5), medicine_pose(kind, .75), medicine_pose(kind, 1)]
    if motion_id == "box":
        return [pose_stand(), jump_pose(0.05), jump_pose(0.42), pose_stand(), pose_ready(0.1)]
    if motion_id == "depth-drop":
        return [jump_pose(0.38), jump_pose(0.18), jump_pose(0), pose_ready(0.55), pose_ready(0.15)]
    if motion_id in ("jump", "power"):
        return [pose_ready(0.45), jump_pose(0, "back"), jump_pose(0.48), jump_pose(0.16), pose_ready(0.25)]
    if motion_id == "approach-jump":
        return [pose_run(1), pose_run(-1, high=True), jump_pose(0.50, "up"), jump_pose(0.18, "up"), pose_ready(0.22)]
    if motion_id == "warmup":
        return [pose_run(1, high=True), pose_shuffle(1), stretch_pose(.2), pose_run(-1, high=True), pose_ready(0.1)]
    if motion_id == "foam":
        return [foam_pose(0), foam_pose(.35), foam_pose(.7), foam_pose(1), foam_pose(0)]
    if motion_id == "stretch":
        return [stretch_pose(0), stretch_pose(.25), stretch_pose(.5), stretch_pose(.75), stretch_pose(1)]
    if motion_id == "recovery":
        breathe = pose_stand()
        breathe["elbow_L"] = Vector((-0.32, 0.16, 0.52)); breathe["elbow_R"] = Vector((0.32, 0.16, 0.52))
        breathe["wrist_L"] = Vector((-0.12, 0.34, 0.58)); breathe["wrist_R"] = Vector((0.12, 0.34, 0.58))
        return [stand, breathe, stand, breathe, stand]
    return [stand, ready, stand, ready, stand]


def build_motion_reel(rig):
    if not rig.animation_data:
        rig.animation_data_create()
    action = bpy.data.actions.new(CLIP_NAME)
    action.use_fake_user = True
    rig.animation_data.action = action
    manifest = {}
    cursor = 0
    for motion_id, duration_seconds in MOTIONS:
        duration_frames = max(18, round(duration_seconds * FPS))
        start = cursor
        end = start + duration_frames
        poses = pose_sequence(motion_id)
        for index, pose in enumerate(poses):
            frame = round(start + duration_frames * index / (len(poses) - 1))
            base.key_human(rig, "ATH", frame, pose)
        manifest[motion_id] = {
            "startFrame": start,
            "endFrame": end,
            "startSeconds": start / FPS,
            "durationSeconds": duration_frames / FPS,
        }
        cursor = end + 2
    # A final key ensures Blender/glTF retain the complete reel duration.
    base.key_human(rig, "ATH", cursor, pose_stand())
    return action, manifest, cursor


def setup_lighting_and_cameras():
    def area(name, location, energy, size, color):
        data = bpy.data.lights.new(name, "AREA")
        data.energy = energy
        data.shape = "DISK"
        data.size = size
        data.color = color
        obj = bpy.data.objects.new(name, data)
        bpy.context.collection.objects.link(obj)
        obj.location = location
        base.look_at(obj, (0, 0, 0))
        return obj

    area("Library_Key", (-4, -3, 10), 1250, 6.0, base.rgba("#fff1dd")[:3])
    area("Library_Fill", (6, 2, 7), 900, 5.0, base.rgba("#b9dfff")[:3])
    area("Library_Rim", (0, 8, 7), 760, 4.5, base.rgba("#ff9b71")[:3])
    court_camera = base.camera("Camera_Court_Library", (16.5, -25.0, 19.0), (0, 0.15, 0.62), 40)
    mechanics_camera = base.camera("Camera_Mechanics_Library", (4.8, -5.8, 3.1), (0, 0, 1.0), 42)
    court_camera.data.clip_start = mechanics_camera.data.clip_start = 0.05
    court_camera.data.clip_end = mechanics_camera.data.clip_end = 100
    court_camera["camera_role"] = "full-court"
    mechanics_camera["camera_role"] = "full-body-mechanics"
    return court_camera, mechanics_camera


def render_preview(scene, camera_obj, frame, filename):
    scene.camera = camera_obj
    scene.frame_set(frame)
    scene.render.filepath = str(PREVIEW_DIR / filename)
    bpy.ops.render.render(write_still=True)


def main():
    GLB_PATH.parent.mkdir(parents=True, exist_ok=True)
    BLEND_PATH.parent.mkdir(parents=True, exist_ok=True)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.fps = FPS
    scene.render.fps_base = 1.0
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    try:
        scene.view_settings.look = "AgX - Medium High Contrast"
    except TypeError:
        pass

    mats = make_materials()
    build_world_and_court(mats)
    equipment = build_equipment(mats)
    athlete_root, rig, athlete_mesh = build_athlete(mats)
    action, manifest, final_frame = build_motion_reel(rig)
    court_camera, mechanics_camera = setup_lighting_and_cameras()
    scene.frame_start = 0
    scene.frame_end = final_frame

    scene["asset"] = "RallyReady CoachCam Shared Production Library"
    scene["asset_version"] = 1
    scene["rig_contract"] = "RR_Humanoid_v1"
    scene["animation"] = CLIP_NAME
    scene["motion_count"] = len(MOTIONS)
    scene["motion_manifest_json"] = json.dumps(manifest, separators=(",", ":"), sort_keys=True)
    scene["equipment_manifest_json"] = json.dumps(sorted(equipment.keys()), separators=(",", ":"))
    scene["camera_wide"] = court_camera.name
    scene["camera_mechanics"] = mechanics_camera.name
    scene["coordinate_system"] = "Blender Z-up; glTF/Three.js Y-up"
    scene["production_note"] = "Shared geometry; drill facts are supplied by RR.drillChoreography."
    rig["motion_manifest_json"] = scene["motion_manifest_json"]
    athlete_mesh["triangle_budget_target"] = 18000

    scene.frame_set(0)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH), compress=True)
    bpy.ops.export_scene.gltf(
        filepath=str(GLB_PATH),
        export_format="GLB",
        export_animations=True,
        export_animation_mode="ACTIVE_ACTIONS",
        export_force_sampling=True,
        export_frame_range=True,
        export_frame_step=1,
        export_anim_slide_to_zero=False,
        export_optimize_animation_size=True,
        export_optimize_animation_keep_anim_armature=True,
        export_cameras=True,
        export_lights=False,
        export_extras=True,
        export_materials="EXPORT",
        export_yup=True,
        export_apply=False,
    )

    report = {
        "asset": str(GLB_PATH),
        "blend": str(BLEND_PATH),
        "clip": action.name,
        "motionCount": len(MOTIONS),
        "equipmentCount": len(equipment),
        "frameRange": [0, final_frame],
        "durationSeconds": final_frame / FPS,
        "athleteMeshes": 1,
        "rig": rig.name,
    }
    print("COACHCAM_LIBRARY_BUILD_REPORT=" + json.dumps(report, sort_keys=True))


if __name__ == "__main__":
    main()
