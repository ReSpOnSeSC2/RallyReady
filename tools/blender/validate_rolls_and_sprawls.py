"""Round-trip validation for the exported CoachCam Rolls & Sprawls GLB.

Run with:
  blender --background --factory-startup --python tools/blender/validate_rolls_and_sprawls.py
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector


FPS = 30
ROOT = Path(__file__).resolve().parents[2]
GLB_PATH = ROOT / "models" / "coachcam" / "rolls-and-sprawls.glb"
REQUIRED = {
    "Coach", "Defender", "Ball", "Ball_Left", "Ball_Sprawl", "Court", "SafetyRollArc", "SprawlLanding",
    "CoachCam_Rig", "Camera_Court", "Camera_Mechanics", "Camera_Sprawl",
    "ChestContact", "HipContact", "RollDiagonal_Right", "RollDiagonal_Left",
    "Impact_Right", "Impact_Left", "Impact_Sprawl",
}
REQUIRED_BONES = {
    "DEF_TORSO", "DEF_HEAD", "BALL_RIGHT", "BALL_LEFT", "BALL_SPRAWL",
    "GUIDE_DIAG_RIGHT", "GUIDE_DIAG_LEFT", "LANDING_CHEST", "LANDING_HIPS",
    *{
        f"DEF_JOINT_{joint}"
        for joint in (
            "SHOULDER_L", "SHOULDER_R", "ELBOW_L", "ELBOW_R", "WRIST_L", "WRIST_R",
            "HIP_L", "HIP_R", "KNEE_L", "KNEE_R", "ANKLE_L", "ANKLE_R",
        )
    },
}
MECHANICS_SAMPLE_FRAMES = (0, 78, 84, 90, 96, 102, 108, 114, 186, 192, 198, 204, 210, 216, 222, 390, 420)
COURT_SAMPLE_FRAMES = (
    0, 30, 54, 70, 78, 84, 96, 108, 114, 138, 162, 178, 186,
    192, 204, 216, 222, 246, 276, 294, 306, 318, 330, 342, 348,
    360, 378, 390, 420,
)
SPRAWL_SAMPLE_FRAMES = (276, 294, 300, 306, 318, 330, 342, 348, 360)
ROLL_FRAME_PAIRS = ((78, 186), (90, 198), (102, 210), (114, 222), (126, 234))
CONTACT_SAMPLES = (
    ("rightReach", 78, "BALL_RIGHT", (2.15, -5.02, 0.48)),
    ("leftReach", 186, "BALL_LEFT", (-2.15, -5.02, 0.48)),
    ("forearmSave", 306, "BALL_SPRAWL", (0.0, -3.98, 0.31)),
)

# These tolerances intentionally allow for glTF sampling/quantisation while
# remaining far tighter than the distances that would turn a save into a miss.
JOINT_TOLERANCE_M = 0.025
CAMERA_MARGIN = 0.012
KNEE_SURFACE_RADIUS_M = 0.09


def evaluated_corners(objects):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    corners = []
    for obj in objects:
        evaluated = obj.evaluated_get(depsgraph)
        corners.extend(evaluated.matrix_world @ Vector(corner) for corner in evaluated.bound_box)
    return corners


def world_bone_head(rig, bone_name):
    return rig.matrix_world @ rig.pose.bones[bone_name].head


def world_bone_tail(rig, bone_name):
    return rig.matrix_world @ rig.pose.bones[bone_name].tail


def object_bounds(objects):
    corners = evaluated_corners(objects)
    return {
        "minX": min(point.x for point in corners), "maxX": max(point.x for point in corners),
        "minY": min(point.y for point in corners), "maxY": max(point.y for point in corners),
        "minZ": min(point.z for point in corners), "maxZ": max(point.z for point in corners),
    }


def round_vector(value):
    return [round(component, 4) for component in value]


def rounded(mapping):
    return {key: round(value, 4) for key, value in mapping.items()}


def mirror_x(value):
    return Vector((-value.x, value.y, value.z))


def point_segment_distance(point, start, end):
    segment = end - start
    if segment.length_squared < 1e-10:
        return (point - start).length
    amount = max(0.0, min(1.0, (point - start).dot(segment) / segment.length_squared))
    return (point - (start + segment * amount)).length


def projected_bounds(scene, camera, objects):
    points = [world_to_camera_view(scene, camera, point) for point in evaluated_corners(objects)]
    return {
        "minX": min(p.x for p in points), "maxX": max(p.x for p in points),
        "minY": min(p.y for p in points), "maxY": max(p.y for p in points),
        "minDepth": min(p.z for p in points),
    }


def in_frame(bounds, margin=CAMERA_MARGIN):
    return (
        bounds["minX"] >= margin and bounds["maxX"] <= 1 - margin
        and bounds["minY"] >= margin and bounds["maxY"] <= 1 - margin
        and bounds["minDepth"] > 0
    )


def validate_contacts(scene, rig):
    results = {}
    for label, frame, ball_bone, expected_contact in CONTACT_SAMPLES:
        scene.frame_set(frame)
        ball = world_bone_head(rig, ball_bone)
        wrist_l = world_bone_head(rig, "DEF_JOINT_WRIST_L")
        wrist_r = world_bone_head(rig, "DEF_JOINT_WRIST_R")
        elbow_l = world_bone_head(rig, "DEF_JOINT_ELBOW_L")
        elbow_r = world_bone_head(rig, "DEF_JOINT_ELBOW_R")
        platform = (wrist_l + wrist_r) / 2
        platform_error = (ball - platform).length
        hand_distances = ((ball - wrist_l).length, (ball - wrist_r).length)
        wrist_span = (wrist_l - wrist_r).length
        forearm_l = (wrist_l - elbow_l).normalized()
        forearm_r = (wrist_r - elbow_r).normalized()
        forearm_alignment = forearm_l.dot(forearm_r)
        court_position_error = (ball - Vector(expected_contact)).length
        ball_scale = rig.pose.bones[ball_bone].scale.x

        forearm_distances = [point_segment_distance(ball, elbow_l, wrist_l),
                            point_segment_distance(ball, elbow_r, wrist_r)]
        # A 10.75 cm radius ball touches the forearm skin. The earlier check
        # placed its centre between the wrists, teaching an interpenetration.
        if min(forearm_distances) < .13 or min(forearm_distances) > .185:
            raise AssertionError(
                f"{label} misses/intersects the forearm surface at frame {frame}: "
                f"ball-to-forearm-axes={forearm_distances}"
            )
        if min(hand_distances) < .11:
            raise AssertionError(
                f"{label} embeds the hands inside the ball at frame {frame}: "
                f"distances={tuple(round(value, 4) for value in hand_distances)}"
            )
        if court_position_error > .25:
            raise AssertionError(
                f"{label} contact moved off its authored court station at frame {frame}: "
                f"error={court_position_error:.4f}m"
            )
        if ball_scale < 0.5:
            raise AssertionError(f"{label} ball is hidden at contact frame {frame}: scale={ball_scale:.4f}")
        if not 0.075 <= wrist_span <= 0.16 or forearm_alignment < .90:
            raise AssertionError(
                f"{label} loses the joined wrist platform at frame {frame}: "
                f"span={wrist_span:.4f}m distances={tuple(round(value, 4) for value in hand_distances)}"
            )

        results[label] = {
            "frame": frame,
            "ball": round_vector(ball),
            "platformMidpoint": round_vector(platform),
            "ballToPlatformM": round(platform_error, 4),
            "ballToHandsM": [round(value, 4) for value in hand_distances],
            "wristSpanM": round(wrist_span, 4),
            "forearmAlignment": round(forearm_alignment, 4),
            "ballToForearmAxesM": [round(value, 4) for value in forearm_distances],
            "courtPositionErrorM": round(court_position_error, 4),
            "ballScale": round(ball_scale, 4),
        }
    return results


def defender_landmarks(rig):
    landmarks = {
        "pelvis": world_bone_head(rig, "DEF_TORSO"),
        "neck": world_bone_tail(rig, "DEF_TORSO"),
        "headTop": world_bone_tail(rig, "DEF_HEAD"),
    }
    for joint in (
        "SHOULDER_L", "SHOULDER_R", "ELBOW_L", "ELBOW_R", "WRIST_L", "WRIST_R",
        "HIP_L", "HIP_R", "KNEE_L", "KNEE_R", "ANKLE_L", "ANKLE_R",
    ):
        landmarks[joint] = world_bone_head(rig, f"DEF_JOINT_{joint}")
    return landmarks


def validate_mirrored_rolls(scene, rig):
    swaps = {
        "SHOULDER_L": "SHOULDER_R", "SHOULDER_R": "SHOULDER_L",
        "ELBOW_L": "ELBOW_R", "ELBOW_R": "ELBOW_L",
        "WRIST_L": "WRIST_R", "WRIST_R": "WRIST_L",
        "HIP_L": "HIP_R", "HIP_R": "HIP_L",
        "KNEE_L": "KNEE_R", "KNEE_R": "KNEE_L",
        "ANKLE_L": "ANKLE_R", "ANKLE_R": "ANKLE_L",
    }
    pair_results = []
    for right_frame, left_frame in ROLL_FRAME_PAIRS:
        scene.frame_set(right_frame)
        right = defender_landmarks(rig)
        scene.frame_set(left_frame)
        left = defender_landmarks(rig)
        errors = []
        for name, position in right.items():
            counterpart = swaps.get(name, name)
            errors.append((mirror_x(position) - left[counterpart]).length)
        maximum_error = max(errors)
        if maximum_error > JOINT_TOLERANCE_M:
            raise AssertionError(
                f"Rolls are not mechanically mirrored at frames {right_frame}/{left_frame}: "
                f"max landmark error={maximum_error:.4f}m"
            )
        pair_results.append({
            "rightFrame": right_frame,
            "leftFrame": left_frame,
            "maxLandmarkMirrorErrorM": round(maximum_error, 4),
        })

    scene.frame_set(0)
    ready = world_bone_head(rig, "DEF_TORSO")
    scene.frame_set(102)
    right_mid = world_bone_head(rig, "DEF_TORSO")
    scene.frame_set(210)
    left_mid = world_bone_head(rig, "DEF_TORSO")
    if right_mid.x - ready.x < 1.7 or ready.x - left_mid.x < 1.7:
        raise AssertionError(
            f"Roll travel is too small: ready={tuple(ready)}, right={tuple(right_mid)}, left={tuple(left_mid)}"
        )
    if right_mid.y - ready.y < 0.35 or left_mid.y - ready.y < 0.35:
        raise AssertionError("Roll does not travel through the shoulder toward recovery")

    return {
        "pairs": pair_results,
        "readyPelvis": round_vector(ready),
        "rightMidPelvis": round_vector(right_mid),
        "leftMidPelvis": round_vector(left_mid),
        "lateralTravelM": round((abs(right_mid.x - ready.x) + abs(left_mid.x - ready.x)) / 2, 4),
        "forwardTravelM": round((right_mid.y + left_mid.y) / 2 - ready.y, 4),
    }


def validate_diagonal_guides(scene, rig):
    checks = (
        ("right", 102, "GUIDE_DIAG_RIGHT", "DEF_JOINT_SHOULDER_R", "DEF_JOINT_HIP_L", 76, 116),
        ("left", 210, "GUIDE_DIAG_LEFT", "DEF_JOINT_SHOULDER_L", "DEF_JOINT_HIP_R", 184, 224),
    )
    results = {}
    for label, frame, guide_name, shoulder_name, hip_name, before_frame, after_frame in checks:
        scene.frame_set(frame)
        guide_head = world_bone_head(rig, guide_name)
        guide_tail = world_bone_tail(rig, guide_name)
        shoulder = world_bone_head(rig, shoulder_name)
        opposite_hip = world_bone_head(rig, hip_name)
        head_error = (guide_head - shoulder).length
        tail_error = (guide_tail - opposite_hip).length
        diagonal = guide_tail - guide_head
        active_scale = rig.pose.bones[guide_name].scale.x

        if head_error > JOINT_TOLERANCE_M or tail_error > JOINT_TOLERANCE_M:
            raise AssertionError(
                f"{label} diagonal guide does not run outer shoulder-to-opposite hip: "
                f"headError={head_error:.4f}m tailError={tail_error:.4f}m"
            )
        if diagonal.length < 0.45 or abs(diagonal.x) < 0.18:
            raise AssertionError(f"{label} roll guide is not a readable torso diagonal: {tuple(diagonal)}")
        if active_scale < 0.5:
            raise AssertionError(f"{label} roll guide is hidden during its roll: scale={active_scale:.4f}")

        scene.frame_set(before_frame)
        before_scale = rig.pose.bones[guide_name].scale.x
        scene.frame_set(after_frame)
        after_scale = rig.pose.bones[guide_name].scale.x
        if before_scale > 0.02 or after_scale > 0.02:
            raise AssertionError(
                f"{label} roll guide leaks outside its teaching phase: "
                f"before={before_scale:.4f} after={after_scale:.4f}"
            )
        results[label] = {
            "frame": frame,
            "head": round_vector(guide_head),
            "tail": round_vector(guide_tail),
            "lengthM": round(diagonal.length, 4),
            "lateralSpanM": round(abs(diagonal.x), 4),
            "headErrorM": round(head_error, 4),
            "tailErrorM": round(tail_error, 4),
            "activeScale": round(active_scale, 4),
            "outsidePhaseScales": [round(before_scale, 4), round(after_scale, 4)],
        }

    arc_bounds = object_bounds([bpy.data.objects["SafetyRollArc"]])
    if abs(arc_bounds["minX"] + arc_bounds["maxX"]) > 0.035:
        raise AssertionError(f"Court roll paths are not bilateral: {arc_bounds}")
    if arc_bounds["maxX"] < 1.85 or arc_bounds["minX"] > -1.85:
        raise AssertionError(f"Court roll paths do not show both travel lanes: {arc_bounds}")
    if arc_bounds["maxY"] - arc_bounds["minY"] < 1.45:
        raise AssertionError(f"Court roll paths do not show forward shoulder-roll travel: {arc_bounds}")
    if arc_bounds["minZ"] < -0.01 or arc_bounds["maxZ"] > 0.16:
        raise AssertionError(f"Court roll paths are not floor guides: {arc_bounds}")
    results["courtSafetyArc"] = rounded(arc_bounds)
    return results


def validate_sprawl_contact(scene, rig):
    floor_top = max(
        object_bounds([bpy.data.objects["Court"]])["maxZ"],
        object_bounds([bpy.data.objects["SprawlLanding"]])["maxZ"],
    )
    results = {"preContact": {}}
    # Knees must remain clear through the forearm save and flight. This tests
    # contact order (chest/hips first) independently of the settled slide pose.
    for frame in (306, 318):
        scene.frame_set(frame)
        knee_center_clearance = min(
            world_bone_head(rig, "DEF_JOINT_KNEE_L").z,
            world_bone_head(rig, "DEF_JOINT_KNEE_R").z,
        ) - floor_top
        chest_guide_scale = rig.pose.bones["LANDING_CHEST"].scale.x
        hip_guide_scale = rig.pose.bones["LANDING_HIPS"].scale.x
        if knee_center_clearance < 0.08:
            raise AssertionError(
                f"Knees reach the floor before chest/hips at frame {frame}: "
                f"kneeCenterClearance={knee_center_clearance:.4f}m"
            )
        if chest_guide_scale > 0.02 or hip_guide_scale > 0.02:
            raise AssertionError(f"Chest/hip landing guides activate before floor contact at frame {frame}")
        results["preContact"][str(frame)] = {
            "kneeCenterClearanceM": round(knee_center_clearance, 4),
            "contactGuideScales": [round(chest_guide_scale, 4), round(hip_guide_scale, 4)],
        }

    for frame in (330, 342):
        scene.frame_set(frame)
        chest_bounds = object_bounds([bpy.data.objects["Defender"]])
        hip_bounds = object_bounds([bpy.data.objects["DEF_Joint_PELVIS"]])
        head_bounds = object_bounds([bpy.data.objects["DEF_Head"], bpy.data.objects["DEF_Hair"]])
        knee_centers = (
            world_bone_head(rig, "DEF_JOINT_KNEE_L"),
            world_bone_head(rig, "DEF_JOINT_KNEE_R"),
        )
        chest_ring = world_bone_head(rig, "LANDING_CHEST")
        hip_ring = world_bone_head(rig, "LANDING_HIPS")
        torso_start = world_bone_head(rig, "DEF_TORSO")
        torso_end = world_bone_tail(rig, "DEF_TORSO")
        pelvis = world_bone_head(rig, "DEF_TORSO")
        chest_guide_error = point_segment_distance(chest_ring, torso_start, torso_end)
        hip_guide_error = (hip_ring - pelvis).length

        chest_clearance = chest_bounds["minZ"] - floor_top
        hip_clearance = hip_bounds["minZ"] - floor_top
        head_clearance = head_bounds["minZ"] - floor_top
        knee_clearance = min(knee.z for knee in knee_centers) - floor_top
        knee_surface_clearance = knee_clearance - KNEE_SURFACE_RADIUS_M
        if not (-0.035 <= chest_clearance <= 0.13 and -0.035 <= hip_clearance <= 0.13):
            raise AssertionError(
                f"Sprawl does not share a low chest/hip landing at frame {frame}: "
                f"chest={chest_clearance:.4f}m hip={hip_clearance:.4f}m"
            )
        if head_clearance < max(chest_clearance, hip_clearance) + 0.12:
            raise AssertionError(
                f"Head is not clear of the floor in sprawl at frame {frame}: "
                f"head={head_clearance:.4f}m contacts={chest_clearance:.4f}/{hip_clearance:.4f}m"
            )
        if knee_surface_clearance < max(chest_clearance, hip_clearance) + 0.015:
            raise AssertionError(
                f"Knees take floor load before chest/hips at frame {frame}: "
                f"kneeSurface={knee_surface_clearance:.4f}m "
                f"contacts={chest_clearance:.4f}/{hip_clearance:.4f}m"
            )
        if chest_guide_error > 0.24 or hip_guide_error > 0.22:
            raise AssertionError(
                f"Sprawl contact guides are detached at frame {frame}: "
                f"chest={chest_guide_error:.4f}m hip={hip_guide_error:.4f}m"
            )
        if rig.pose.bones["LANDING_CHEST"].scale.x < 0.5 or rig.pose.bones["LANDING_HIPS"].scale.x < 0.5:
            raise AssertionError(f"Sprawl contact guides are hidden at frame {frame}")

        results[str(frame)] = {
            "floorTopZ": round(floor_top, 4),
            "chestClearanceM": round(chest_clearance, 4),
            "hipClearanceM": round(hip_clearance, 4),
            "headClearanceM": round(head_clearance, 4),
            "kneeCenterClearanceM": round(knee_clearance, 4),
            "kneeSurfaceClearanceM": round(knee_surface_clearance, 4),
            "chestGuideToTorsoM": round(chest_guide_error, 4),
            "hipGuideToPelvisM": round(hip_guide_error, 4),
        }
    return results


def validate_cameras(scene, defender_objects, coach_objects):
    mechanics = bpy.data.objects["Camera_Mechanics"]
    sprawl_camera = bpy.data.objects["Camera_Sprawl"]
    court = bpy.data.objects["Camera_Court"]
    all_ball_objects = [
        obj for obj in bpy.data.objects
        if obj.type == "MESH" and (
            obj.name in {"Ball", "Ball_Left", "Ball_Sprawl"}
            or obj.name.startswith("Ball_Band_")
            or obj.name.startswith("Ball_Left_Band_")
            or obj.name.startswith("Ball_Sprawl_Band_")
        )
    ]

    mechanics_samples = {}
    for frame in MECHANICS_SAMPLE_FRAMES:
        scene.frame_set(frame)
        objects = list(defender_objects)
        if frame == 78:
            objects += [obj for obj in all_ball_objects if obj.name == "Ball" or obj.name.startswith("Ball_Band_")]
        elif frame == 186:
            objects += [obj for obj in all_ball_objects if obj.name == "Ball_Left" or obj.name.startswith("Ball_Left_Band_")]
        elif frame == 306:
            objects += [obj for obj in all_ball_objects if obj.name == "Ball_Sprawl" or obj.name.startswith("Ball_Sprawl_Band_")]
        bounds = projected_bounds(scene, mechanics, objects)
        mechanics_samples[str(frame)] = rounded(bounds)
        if not in_frame(bounds):
            raise AssertionError(f"Mechanics camera crops the save at frame {frame}: {bounds}")

    court_samples = {}
    for frame in COURT_SAMPLE_FRAMES:
        scene.frame_set(frame)
        bounds = projected_bounds(scene, court, defender_objects + coach_objects + all_ball_objects)
        court_samples[str(frame)] = rounded(bounds)
        if not in_frame(bounds, margin=0.008):
            raise AssertionError(f"Court camera crops drill context at frame {frame}: {bounds}")

    if not math.isclose(float(sprawl_camera.get("active_phase_start_seconds", -1)), 9.2, abs_tol=0.001):
        raise AssertionError("Camera_Sprawl start metadata must be 9.2 seconds")
    if not math.isclose(float(sprawl_camera.get("active_phase_end_seconds", -1)), 12.0, abs_tol=0.001):
        raise AssertionError("Camera_Sprawl end metadata must be 12.0 seconds")
    if sprawl_camera.get("view") != "three-quarter forward sprawl mechanics":
        raise AssertionError(f"Unexpected Camera_Sprawl view metadata: {sprawl_camera.get('view')!r}")
    if abs(sprawl_camera.location.x) < 3.5 or (sprawl_camera.location - mechanics.location).length < 3.0:
        raise AssertionError("Camera_Sprawl is not a distinct three-quarter mechanics lens")

    sprawl_samples = {}
    sprawl_ball_objects = [
        obj for obj in all_ball_objects
        if obj.name == "Ball_Sprawl" or obj.name.startswith("Ball_Sprawl_Band_")
    ]
    for frame in SPRAWL_SAMPLE_FRAMES:
        scene.frame_set(frame)
        objects = list(defender_objects)
        # Keep the ball in-frame through the save. After contact it is authored
        # to rebound out of the mechanics lens while the camera stays on landing.
        if frame in (294, 300, 306):
            objects += sprawl_ball_objects
        bounds = projected_bounds(scene, sprawl_camera, objects)
        sprawl_samples[str(frame)] = rounded(bounds)
        if not in_frame(bounds):
            raise AssertionError(f"Sprawl camera crops the 9.2-12.0s mechanics at frame {frame}: {bounds}")

    return {
        "mechanics": mechanics_samples,
        "court": court_samples,
        "sprawl": sprawl_samples,
        "sprawlActiveSeconds": [
            float(sprawl_camera["active_phase_start_seconds"]),
            float(sprawl_camera["active_phase_end_seconds"]),
        ],
        "sprawlCameraLocation": round_vector(sprawl_camera.location),
    }


def validate_anatomy(scene, rig, defender_objects):
    """Check exported motion, including interpolation between stored frames.

    A key-pose screenshot cannot expose breathing limb lengths, bend-pole
    flips, detached joints, floor penetration, or an accidental face-up sprawl.
    """
    lengths = {"TORSO": .58, "HEAD": .27, "UARM": .32, "FARM": .28,
               "HAND": .16, "THIGH": .44, "SHIN": .43, "FOOT": .25}
    links = [("TORSO", "HEAD")]
    for side in ("L", "R"):
        links += [(f"UARM_{side}", f"FARM_{side}"), (f"FARM_{side}", f"HAND_{side}"),
                  (f"THIGH_{side}", f"SHIN_{side}"), (f"SHIN_{side}", f"FOOT_{side}")]
    max_length_error, max_seam, max_step, max_turn = 0, 0, 0, 0
    previous = {}
    worst_floor = (99, "", 0)
    for sample in range(1681):
        time = sample / 4
        scene.frame_set(int(time), subframe=time % 1)
        for prefix in ("DEF", "COACH"):
            for bone in rig.pose.bones:
                if not bone.name.startswith(prefix + "_") or "JOINT_" in bone.name:
                    continue
                kind = bone.name.split("_")[1]
                if kind not in lengths:
                    continue
                length_error = abs((bone.tail-bone.head).length-lengths[kind])
                max_length_error = max(max_length_error, length_error)
                if length_error > .002:
                    raise AssertionError(f"{bone.name} changes anatomical length at {time}: {length_error:.5f}m")
                if sample % 4 == 0:
                    rotation = bone.matrix.to_quaternion()
                    if bone.name in previous:
                        last_pos, last_rot = previous[bone.name]
                        step = (bone.head-last_pos).length
                        turn = rotation.rotation_difference(last_rot).angle
                        turn = min(turn, math.tau-turn)
                        max_step, max_turn = max(max_step, step), max(max_turn, turn)
                        if step > .30:
                            raise AssertionError(f"{bone.name} jumps {step:.3f}m in one frame at {time}")
                        if turn > 1.05:
                            raise AssertionError(f"{bone.name} rotates {math.degrees(turn):.1f} degrees in one frame at {time}")
                    previous[bone.name] = (bone.head.copy(), rotation)
            for start, end in links:
                seam = (rig.pose.bones[f"{prefix}_{start}"].tail-rig.pose.bones[f"{prefix}_{end}"].head).length
                max_seam = max(max_seam, seam)
                if seam > .018:
                    raise AssertionError(f"{prefix} {start}/{end} disconnect by {seam:.4f}m at {time}")
        if sample % 8 == 0:
            depsgraph = bpy.context.evaluated_depsgraph_get()
            for obj in defender_objects:
                evaluated = obj.evaluated_get(depsgraph)
                minimum = min((evaluated.matrix_world @ vertex.co).z for vertex in evaluated.data.vertices)
                if minimum < worst_floor[0]:
                    worst_floor = (minimum, obj.name, time)
                if minimum < .01:
                    raise AssertionError(f"{obj.name} penetrates the court at {time}: lowest vertex {minimum:.4f}m")
                if obj.name == "DEF_Head" and (78 <= time <= 114 or 186 <= time <= 222) and minimum < .13:
                    raise AssertionError(f"Roll loads the head at {time}: lowest head vertex {minimum:.4f}m")
    for frame in (330, 342):
        scene.frame_set(frame)
        forward = rig.pose.bones["DEF_TORSO"].matrix.to_quaternion() @ Vector((0, 0, -1))
        if forward.z > -.85:
            raise AssertionError(f"Sprawl chest faces away from floor at {frame}: {tuple(forward)}")
    return {"fractionalFrameSamples": 1681, "maxBoneLengthErrorM": round(max_length_error, 6),
            "maxJointSeamM": round(max_seam, 6), "maxJointStepM": round(max_step, 5),
            "maxSegmentTurnDegrees": round(math.degrees(max_turn), 3),
            "lowestSurface": {"z": round(worst_floor[0], 5), "mesh": worst_floor[1], "frame": worst_floor[2]}}


def main():
    if not GLB_PATH.exists():
        raise AssertionError(f"Missing GLB: {GLB_PATH}")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.fps = FPS
    bpy.ops.import_scene.gltf(filepath=str(GLB_PATH))

    missing = sorted(REQUIRED - set(bpy.data.objects.keys()))
    if missing:
        raise AssertionError(f"Missing required nodes: {missing}")

    actions = list(bpy.data.actions)
    if [action.name for action in actions] != ["CoachCam_RollsSprawls"]:
        raise AssertionError(f"Unexpected animation clips: {[a.name for a in actions]}")
    frame_range = tuple(round(value, 3) for value in actions[0].frame_range)
    if frame_range != (0.0, 420.0):
        raise AssertionError(f"Unexpected frame range: {frame_range}")

    rig = bpy.data.objects["CoachCam_Rig"]
    missing_bones = sorted(REQUIRED_BONES - set(rig.pose.bones.keys()))
    if missing_bones:
        raise AssertionError(f"Missing required CoachCam rig bones: {missing_bones}")
    defender_objects = [obj for obj in bpy.data.objects if obj.type == "MESH" and (obj.name == "Defender" or obj.name.startswith("DEF_"))]
    coach_objects = [obj for obj in bpy.data.objects if obj.type == "MESH" and (obj.name == "Coach" or obj.name.startswith("COACH_"))]
    if len(defender_objects) < 25 or len(coach_objects) < 25:
        raise AssertionError(f"Incomplete articulated humans: defender={len(defender_objects)} coach={len(coach_objects)}")

    contact_checks = validate_contacts(scene, rig)
    mirror_checks = validate_mirrored_rolls(scene, rig)
    guide_checks = validate_diagonal_guides(scene, rig)
    sprawl_checks = validate_sprawl_contact(scene, rig)
    camera_checks = validate_cameras(scene, defender_objects, coach_objects)
    anatomy_checks = validate_anatomy(scene, rig, defender_objects)

    # Verify the authored pose survived both glTF export and re-import without
    # the Blender-bone local-axis swap that caused the first invalid prototype.
    expected_heads = {
        0: (0.0, -5.72, 0.88),
        102: (1.92, -5.20, 0.24),
        210: (-1.92, -5.20, 0.24),
        342: (0.0, -4.18, 0.21),
    }
    sampled_heads = {}
    for frame, expected in expected_heads.items():
        scene.frame_set(frame)
        head = rig.pose.bones["DEF_TORSO"].head
        sampled_heads[str(frame)] = [round(value, 4) for value in head]
        if (head - Vector(expected)).length > 0.015:
            raise AssertionError(f"DEF_TORSO axis/position mismatch at {frame}: {tuple(head)} != {expected}")

    result = {
        "status": "PASS",
        "file": str(GLB_PATH),
        "bytes": GLB_PATH.stat().st_size,
        "clips": [{"name": actions[0].name, "frames": frame_range, "durationSeconds": 14.0}],
        "requiredNodes": sorted(REQUIRED),
        "requiredBones": sorted(REQUIRED_BONES),
        "defenderMeshes": len(defender_objects),
        "coachMeshes": len(coach_objects),
        "poseHeads": sampled_heads,
        "contactChecks": contact_checks,
        "mirroredRollChecks": mirror_checks,
        "diagonalGuideChecks": guide_checks,
        "sprawlContactChecks": sprawl_checks,
        "cameraChecks": camera_checks,
        "anatomyChecks": anatomy_checks,
    }
    print("COACHCAM_VALIDATION=" + json.dumps(result, sort_keys=True))


if __name__ == "__main__":
    main()
