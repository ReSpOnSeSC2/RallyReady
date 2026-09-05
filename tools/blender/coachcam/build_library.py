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
from mathutils import Matrix, Vector


HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[2]
BLENDER_TOOLS = HERE.parent
if str(BLENDER_TOOLS) not in sys.path:
    sys.path.insert(0, str(BLENDER_TOOLS))

import build_rolls_and_sprawls as base  # noqa: E402

if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))
import kinematics as motion  # noqa: E402
import context_poses  # noqa: E402
import upperbody_variants  # noqa: E402
import locomotion_variants  # noqa: E402
import mobility_variants  # noqa: E402


FPS = 48
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
    segment_bones = [f"ATH_{segment}" for segment in dict.fromkeys([*base.SEGMENTS, "HAND_L", "HAND_R", "SPINE_LOW", "SPINE_MID", "SPINE_UPPER"])]
    joint_bones = [f"ATH_JOINT_{joint}" for joint in base.POINT_JOINTS]
    rig = base.create_rig(segment_bones + joint_bones)
    configure_spine(rig)
    rig.name = "RR_Humanoid_v1"
    rig.data.name = "RR_Humanoid_v1_Data"
    rig["rig_contract"] = "RR_Humanoid_v1"
    rig.parent = root
    palette = athlete_palette(mats)
    add_instructional_athlete_mesh(rig, palette)

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


def add_instructional_athlete_mesh(rig, palette):
    """Adult proportions, real hand length, palms, fingers and facial direction."""
    def part(name, bone, dims, center, color, offset=(0, 0, 0), segments=16, rings=8):
        obj = base.weighted_ellipsoid(name, rig, "ATH_"+bone, dims, center,
                                     palette[color], segments, rings)
        for vert in obj.data.vertices:
            vert.co += Vector(offset)
        return obj

    torso=part("AthleteTemplate_Torso", "TORSO", (.45,.29,1.09), .48, "jersey", segments=28, rings=14)
    panel=part("ATH_JerseyPanel", "TORSO", (.15,.025,.24), .68, "jersey_alt", (0,0,-.143))
    # The original surface and normals stay intact. Rest spine segments divide
    # its normalized length into thirds; smooth neighboring weights bend the
    # jersey without remapping or folding its rest vertices.
    for obj in (torso,panel):
        obj.vertex_groups.remove(obj.vertex_groups["ATH_TORSO"])
        groups=[obj.vertex_groups.new(name="ATH_"+name) for name in ("SPINE_LOW","SPINE_MID","SPINE_UPPER")]
        for vertex in obj.data.vertices:
            # Uniform .6 spine transforms preserve glTF TRS hierarchy without
            # shear. Restore the intended body width/depth in rest geometry.
            vertex.co.x/=.6
            vertex.co.z/=.6
            location=max(0.,min(2.,vertex.co.y*3-.5))
            section=int(location)
            weight=location-section
            groups[section].add([vertex.index],1.-weight,"REPLACE")
            if weight>0 and section<2:
                groups[section+1].add([vertex.index],weight,"REPLACE")
    part("ATH_Shorts", "TORSO", (.39,.30,.30), .08, "shorts")
    part("ATH_Head", "HEAD", (.23,.23,1.02), .50, "skin", segments=24,rings=12)
    part("ATH_Hair", "HEAD", (.235,.236,.36), .84, "hair")
    # Face details provide a clear front/back cue when coaching body rotation.
    for sign in (-1,1):
        part("ATH_Eye_"+str(sign), "HEAD", (.025,.012,.04), .63, "hair", (sign*.045,0,-.112), segments=10,rings=6)
    part("ATH_Nose", "HEAD", (.035,.045,.09), .49, "skin", (0,0,-.122), segments=12,rings=6)
    for side, sign in (("L",-1),("R",1)):
        part("ATH_UpperArm_"+side,"UARM_"+side,(.125,.13,1.08),.5,"skin")
        part("ATH_Forearm_"+side,"FARM_"+side,(.10,.105,1.07),.5,"skin")
        part("ATH_Thigh_"+side,"THIGH_"+side,(.19,.205,1.08),.5,"skin")
        part("ATH_Shin_"+side,"SHIN_"+side,(.14,.155,1.08),.5,"skin")
        part("ATH_Kneepad_"+side,"SHIN_"+side,(.185,.18,.30),.055,"kneepad")
        part("ATH_Shoe_"+side,"FOOT_"+side,(.17,.235,1.03),.48,"shoe")
        part("ATH_Palm_"+side,"HAND_"+side,(.092,.052,.65),.30,"skin")
        for index in range(4):
            part("ATH_Finger_%s_%s"%(side,index),"HAND_"+side,
                 (.018,.023,.48 if index in (1,2) else .40),.76,"skin",
                 ((index-1.5)*.022,0,0),segments=10,rings=6)
        part("ATH_Thumb_"+side,"HAND_"+side,(.023,.026,.37),.35,"skin",
             (-sign*.055,0,-.010),segments=10,rings=6)
    joint_specs = {"PELVIS":((.35,.28,.25),"shorts"),"NECK":((.13,.13,.16),"skin")}
    for side in ("L","R"):
        for joint,size,color in (("SHOULDER",.135,"skin"),("ELBOW",.105,"skin"),
                                ("WRIST",.075,"skin"),("HIP",.20,"shorts"),
                                ("KNEE",.175,"kneepad"),("ANKLE",.14,"shoe")):
            joint_specs[joint+"_"+side]=((size,size,size),color)
    for joint,(dims,color) in joint_specs.items():
        part("ATH_Joint_"+joint,"JOINT_"+joint,dims,0,color)


def configure_spine(rig):
    """Keep adjacent vertebral sections attached between baked samples."""
    bpy.context.view_layer.objects.active=rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    parent=None
    for index,name in enumerate(("SPINE_LOW","SPINE_MID","SPINE_UPPER")):
        bone=rig.data.edit_bones["ATH_"+name]
        bone.head=(0,index/3,0)
        bone.tail=(0,(index+1)/3,0)
        bone.inherit_scale="FULL"
        if parent is not None:
            bone.parent=parent
            bone.use_connect=True
        parent=bone
    bpy.ops.object.mode_set(mode="OBJECT")
    rig.select_set(False)


def key_pose(rig, frame, pose, controls, previous, only_spine=False):
    segments = {**base.SEGMENTS, "HAND_L":("wrist_L","hand_tip_L"),
                "HAND_R":("wrist_R","hand_tip_R"),
                "SPINE_LOW":("spine_0","spine_1"),
                "SPINE_MID":("spine_1","spine_2"),
                "SPINE_UPPER":("spine_2","spine_3")}
    spine_matrices={}
    for segment,(a,b) in segments.items():
        if only_spine and not segment.startswith("SPINE_"):
            continue
        bone = rig.pose.bones["ATH_"+segment]
        direction = (pose[b]-pose[a]).normalized()
        reference = controls["head"] if segment=="HEAD" else controls["body"]
        right = reference @ Vector((1,0,0))
        right -= direction * right.dot(direction)
        if right.length<.00001:
            right=Vector((0,0,1)).cross(direction)
        right.normalize()
        rotation=Matrix((right,direction,right.cross(direction))).transposed().to_quaternion()
        rest=rig.data.bones[bone.name]
        bone.rotation_mode="QUATERNION"
        if segment.startswith("SPINE_"):
            spine_scale=(pose[b]-pose[a]).length/rest.length
            desired=Matrix.LocRotScale(pose[a],rotation,
                                      Vector((spine_scale,spine_scale,spine_scale)))
            parent_args={} if rest.parent is None else {
                "parent_matrix":spine_matrices[rest.parent.name],
                "parent_matrix_local":rest.parent.matrix_local}
            bone.matrix_basis=rest.convert_local_to_pose(desired,rest.matrix_local,
                                                         invert=True,**parent_args)
            if rest.parent is not None:
                bone.location=(0,0,0)
            spine_matrices[bone.name]=desired
        else:
            bone.location=pose[a]-rest.head_local
            bone.rotation_quaternion=rotation
            bone.scale=(1,(pose[b]-pose[a]).length/rest.length,1)
        rotation=bone.rotation_quaternion.copy()
        if segment in previous and rotation.dot(previous[segment])<0:
            rotation.negate()
        previous[segment]=rotation.copy()
        bone.rotation_quaternion=rotation
        for path in ("location","rotation_quaternion","scale"):
            bone.keyframe_insert(data_path=path,frame=frame,group=bone.name)
    for suffix,joint in ({} if only_spine else base.POINT_JOINTS).items():
        # Library frames already use source_fps. The dedicated scene's point
        # helper applies its own supersampling rate and must not retime these.
        bone=rig.pose.bones["ATH_JOINT_"+suffix]
        bone.location=pose[joint]
        bone.rotation_mode="QUATERNION"
        bone.rotation_quaternion=(1,0,0,0)
        bone.scale=(1,1,1)
        for path in ("location","rotation_quaternion","scale"):
            bone.keyframe_insert(data_path=path,frame=frame,group=bone.name)


def build_motion_reel(rig):
    rig.animation_data_create()
    action=bpy.data.actions.new(CLIP_NAME)
    action.use_fake_user=True
    rig.animation_data.action=action
    manifest={}
    cursor=0
    previous={}
    for motion_id,duration_seconds in MOTIONS:
        duration_frames=max(18,round(duration_seconds*FPS))
        start,end=cursor,cursor+duration_frames
        # Bake control-space interpolation and two-bone constraints at each
        # exported sample. Constant bone scales prevent changing limb length.
        for offset in range(duration_frames+1):
            controls=motion.sample_control(motion_id,offset/duration_frames)
            pose=motion.solve(controls)
            key_pose(rig,start+offset,pose,controls,previous)
        manifest[motion_id]={"startFrame":start,"endFrame":end,
                             "startSeconds":start/FPS,"durationSeconds":duration_frames/FPS,
                             "cyclic":motion_id in motion.CYCLIC}
        if motion_id in motion.CONTACTS:
            contact,kind=motion.CONTACTS[motion_id]
            manifest[motion_id].update(contactProgress=contact,contactType=kind)
        if motion_id in ("sprint","backpedal","ladder"):
            manifest[motion_id]["strideMeters"] = .8 if motion_id=="ladder" else 1.0666666667
        if motion_id in motion.SHUFFLE_STRIDES:
            manifest[motion_id].update(
                strideMeters=motion.SHUFFLE_STRIDES[motion_id], travelAxis="x",
                travelSign=1, mirrorForReverse=True,
                stancePhases={side: [[0, start], [end, 1]]
                              for side, (start, end) in motion.SHUFFLE_SWINGS.items()})
        if motion_id in ("box","box-hit","box-block","depth-drop"):
            manifest[motion_id].update(equipmentAnchor=[0,.62,0],boxHeight=.32)
        cursor=end+2
    # Variants are authored after the public 52-action reel. This preserves
    # semantic action IDs while allowing a band box walk to keep facing the
    # court during forward/back travel instead of using upright running poses.
    variants={}
    for name,direction in (("forward",1),("backward",-1)):
        duration_frames=round(1.25*FPS)
        start,end=cursor,cursor+duration_frames
        for offset in range(duration_frames+1):
            controls=motion.band_walk(offset/duration_frames,direction)
            key_pose(rig,start+offset,motion.solve(controls),controls,previous)
        variants[name]={"startFrame":start,"endFrame":end,
                        "startSeconds":start/FPS,"durationSeconds":duration_frames/FPS,
                        "cyclic":True,"strideMeters":.40,"travelAxis":"y",
                        "travelSign":direction,
                        "stancePhases":{"L":[[0,.60]],"R":[[0,.10],[.50,1]]}}
        cursor=end+2
    manifest["mini-band"]["directionalVariants"]=variants
    manifest["shuffle"]["directionalVariants"]=variants
    manifest["shuffle"]["directionalVariantSource"]="mini-band"
    # Context poses represent people who are present without performing the
    # main ball skill: for example the face-up targets in the Dead Fish game.
    start,end=cursor,cursor+8
    for frame in range(start,end+1):
        controls=motion.supine_rest()
        key_pose(rig,frame,motion.solve(controls),controls,previous)
    manifest["ready"]["postures"]={"supine":{
        "startFrame":start,"endFrame":end,"startSeconds":start/FPS,
        "durationSeconds":(end-start)/FPS,"cyclic":False,"static":True}}
    cursor=end+2
    for (motion_id,posture),settings in context_poses.CONTEXT_MOTIONS.items():
        duration_frames=max(8,round(settings["durationSeconds"]*FPS))
        start,end=cursor,cursor+duration_frames
        for offset in range(duration_frames+1):
            controls=context_poses.build_context_pose(motion_id,posture,offset/duration_frames)
            key_pose(rig,start+offset,motion.solve(controls),controls,previous)
        variant=dict(settings,startFrame=start,endFrame=end,startSeconds=start/FPS,
                     durationSeconds=duration_frames/FPS)
        manifest[motion_id].setdefault("postures",{})[posture]=variant
        cursor=end+2
    for library in (upperbody_variants,locomotion_variants,mobility_variants):
        for (motion_id,variant_id),settings in library.VARIANTS.items():
            duration_frames=max(8,round(settings["durationSeconds"]*FPS))
            start,end=cursor,cursor+duration_frames
            for offset in range(duration_frames+1):
                controls=library.build_variant(motion_id,variant_id,offset/duration_frames)
                key_pose(rig,start+offset,motion.solve(controls),controls,previous)
            variant=dict(settings,startFrame=start,endFrame=end,startSeconds=start/FPS,
                         durationSeconds=duration_frames/FPS)
            manifest[motion_id].setdefault("variants",{})[variant_id]=variant
            cursor=end+2
    controls=motion.standing()
    key_pose(rig,cursor,motion.solve(controls),controls,previous)
    # Blender's default Bezier overshoots between baked samples. Linear curves
    # and quaternion sign continuity keep exports bounded and joints attached.
    for layer in action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for curve in bag.fcurves:
                    for key in curve.keyframe_points:
                        key.interpolation="LINEAR"
    return action,manifest,cursor


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
    mechanics_camera = base.camera("Camera_Mechanics_Library", (4.8, 5.8, 3.1), (0, 0, 1.0), 42)
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
    scene["asset_version"] = 3
    scene["source_fps"] = FPS
    scene["rig_contract"] = "RR_Humanoid_v1"
    scene["animation"] = CLIP_NAME
    scene["motion_count"] = len(MOTIONS)
    scene["motion_manifest_json"] = json.dumps(manifest, separators=(",", ":"), sort_keys=True)
    scene["equipment_manifest_json"] = json.dumps(sorted(equipment.keys()), separators=(",", ":"))
    scene["camera_wide"] = court_camera.name
    scene["camera_mechanics"] = mechanics_camera.name
    scene["coordinate_system"] = "Blender Z-up; glTF/Three.js Y-up"
    scene["production_note"] = "Shared geometry; drill facts are supplied by RR.drillChoreography."
    scene["anatomy_note"] = "Fixed adult segment lengths; per-frame two-bone IK; 3-145 degree knee and 3-150 degree elbow flexion. Instructional visualization requires coach review."
    scene["segment_lengths_json"] = json.dumps(motion.LENGTHS,sort_keys=True)
    scene["spine_segment_lengths_json"] = json.dumps([.20,.20,.20])
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
