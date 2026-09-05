"""Round-trip validation for the shared RallyReady CoachCam Blender library.

Run from the repository root with Blender 5.1 or newer:

  blender --background --factory-startup --python tools/blender/coachcam/validate_library.py

The checks deliberately use the exported GLB rather than the source .blend so
the runtime contract, animation sampling, skinning, and scene extras are all
verified after the same serialization boundary used by the web application.
"""

from __future__ import annotations

import json
import math
import struct
from pathlib import Path

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector


FPS = 24
ROOT = Path(__file__).resolve().parents[3]
GLB_PATH = ROOT / "models" / "coachcam" / "coachcam-library.glb"
CLIP_NAME = "CoachCam_MotionLibrary"
RIG_NAME = "RR_Humanoid_v1"

EXPECTED_MOTIONS = (
    "ready", "sprint", "shuffle", "backpedal", "pass", "set", "feed", "serve",
    "attack", "block", "dig", "sprawl", "run-through", "defensive-ready",
    "down-ball-hit", "low-toss", "one-arm-save", "platform-save",
    "shoulder-roll-right", "shoulder-roll-left", "chest-hip-sprawl",
    "floor-recovery", "ladder", "jump-rope", "mini-band", "bridge", "band",
    "band-upper", "band-arm-swing", "box-hit", "signal", "free-arm-swing",
    "medicine", "medicine-slam", "medicine-rotate", "medicine-scoop", "box",
    "depth-drop", "box-block", "mat-defense", "jump", "approach-jump", "power",
    "warmup", "foam", "stretch", "recovery", "admin", "underhand", "jump-float",
    "jump-topspin", "tip-roll",
)

EXPECTED_EQUIPMENT_ROOTS = {
    "balls": "Prototype_Ball",
    "agility ladder": "Prototype_AgilityLadder",
    "bands": "Prototype_Bands",
    "box": "Prototype_PlyoBox",
    "cones": "Prototype_Cones",
    "foam roller": "Prototype_FoamRoller",
    "hoops": "Prototype_Hoops",
    "jump ropes": "Prototype_JumpRope",
    "mats": "Prototype_Mat",
    "medicine ball": "Prototype_MedicineBall",
    "mini bands": "Prototype_MiniBand",
    "net": "NetSystem",
    "reaction ball": "Prototype_ReactionBall",
    "wall": "Prototype_TrainingWall",
}

SEGMENT_BONES = (
    "TORSO", "HEAD", "UARM_L", "FARM_L", "HAND_L", "UARM_R", "FARM_R", "HAND_R",
    "THIGH_L", "SHIN_L", "FOOT_L", "THIGH_R", "SHIN_R", "FOOT_R",
)
POINT_BONES = (
    "PELVIS", "NECK", "SHOULDER_L", "SHOULDER_R", "ELBOW_L", "ELBOW_R",
    "WRIST_L", "WRIST_R", "HIP_L", "HIP_R", "KNEE_L", "KNEE_R",
    "ANKLE_L", "ANKLE_R",
)
EXPECTED_BONES = {
    *{f"ATH_{name}" for name in SEGMENT_BONES},
    *{f"ATH_JOINT_{name}" for name in POINT_BONES},
}

MAX_GLB_BYTES = 3 * 1024 * 1024
MAX_ATHLETE_TRIANGLES = 18_000
MAX_TOTAL_TRIANGLES = 80_000
MAX_MESH_NODES = 100
MAX_PRIMITIVES = 120
MAX_MATERIALS = 24
FRAME_MARGIN = 0.012
KNEE_RADIUS_M = 0.095
HEAD_RADIUS_M = 0.15

# These dimensions describe this authored adult character, not a population
# norm. Validate the exported landmark chain at and BETWEEN baked frames: a
# constant mesh scale alone does not detect a detached wrist or sliding knee.
LIMB_CHAINS = {
    "upperArm": ("SHOULDER", "ELBOW", 0.31),
    "forearm": ("ELBOW", "WRIST", 0.27),
    "thigh": ("HIP", "KNEE", 0.43),
    "shin": ("KNEE", "ANKLE", 0.43),
}
LANDMARK_LENGTH_TOLERANCE_M = 0.012


def read_glb(path):
    payload = path.read_bytes()
    if len(payload) < 20:
        raise AssertionError(f"GLB is truncated: {len(payload)} bytes")
    magic, version, declared_length = struct.unpack_from("<4sII", payload, 0)
    if magic != b"glTF" or version != 2 or declared_length != len(payload):
        raise AssertionError(
            f"Invalid GLB header: magic={magic!r} version={version} "
            f"declared={declared_length} actual={len(payload)}"
        )
    offset = 12
    json_chunk = None
    binary_chunks = 0
    while offset < len(payload):
        if offset + 8 > len(payload):
            raise AssertionError("GLB chunk header is truncated")
        chunk_length, chunk_type = struct.unpack_from("<II", payload, offset)
        offset += 8
        end = offset + chunk_length
        if end > len(payload):
            raise AssertionError("GLB chunk body is truncated")
        chunk = payload[offset:end]
        offset = end
        if chunk_type == 0x4E4F534A:
            if json_chunk is not None:
                raise AssertionError("GLB contains more than one JSON chunk")
            json_chunk = json.loads(chunk.rstrip(b" \x00").decode("utf-8"))
        elif chunk_type == 0x004E4942:
            binary_chunks += 1
    if json_chunk is None or binary_chunks != 1:
        raise AssertionError(f"Expected one JSON and one BIN chunk; binaryChunks={binary_chunks}")
    return json_chunk


def triangle_count(document, mesh_indices=None):
    accessors = document.get("accessors", [])
    meshes = document.get("meshes", [])
    indices = range(len(meshes)) if mesh_indices is None else mesh_indices
    total = 0
    for mesh_index in indices:
        for primitive in meshes[mesh_index].get("primitives", []):
            mode = primitive.get("mode", 4)
            if mode != 4:
                raise AssertionError(f"Non-triangle primitive in mesh {mesh_index}: mode={mode}")
            if "indices" in primitive:
                total += accessors[primitive["indices"]]["count"] // 3
            else:
                position_accessor = primitive.get("attributes", {}).get("POSITION")
                if position_accessor is None:
                    raise AssertionError(f"Primitive in mesh {mesh_index} has no POSITION accessor")
                total += accessors[position_accessor]["count"] // 3
    return total


def animation_time_range(document, animation):
    accessors = document["accessors"]
    starts = []
    ends = []
    for sampler in animation.get("samplers", []):
        accessor = accessors[sampler["input"]]
        starts.append(float(accessor["min"][0]))
        ends.append(float(accessor["max"][0]))
    if not starts:
        raise AssertionError("Animation contains no samplers")
    return min(starts), max(ends)


def pose_head(rig, name):
    return rig.pose.bones[name].head.copy()


def pose_tail(rig, name):
    return rig.pose.bones[name].tail.copy()


def landmarks(rig):
    result = {
        "pelvis": pose_head(rig, "ATH_TORSO"),
        "neck": pose_tail(rig, "ATH_TORSO"),
        "headTop": pose_tail(rig, "ATH_HEAD"),
    }
    for name in POINT_BONES:
        result[name] = pose_head(rig, f"ATH_JOINT_{name}")
    return result


def frame_for(manifest, motion, fraction):
    segment = manifest[motion]
    return round(segment["startFrame"] + (segment["endFrame"] - segment["startFrame"]) * fraction)


def sample_pose(scene, rig, manifest, motion, fraction):
    frame = frame_for(manifest, motion, fraction)
    scene.frame_set(frame)
    return frame, landmarks(rig)


def contact_fraction(manifest, motion, fallback=0.5):
    return float(manifest[motion].get("contactProgress", fallback))


def validate_anatomy(scene, rig, manifest):
    """Catch stretching, collapsed joints and frame pops in the shipped GLB.

    Bounds are animation regression limits, not medical range-of-motion advice.
    Interior angles alone cannot establish correct shoulder or spinal rotation.
    """
    failures = []
    maximum_error = 0.0
    maximum_speed = 0.0
    samples = 0
    worst_length = None
    worst_speed = None
    minimum_flexion = 180.0
    maximum_flexion = 0.0
    for motion, segment in manifest.items():
        previous = None
        previous_time = None
        # Half frames exercise glTF interpolation as well as authored keys.
        for half_frame in range(segment["startFrame"] * 2, segment["endFrame"] * 2 + 1):
            frame = half_frame / 2
            scene.frame_set(int(frame), subframe=frame % 1)
            pose = landmarks(rig)
            samples += 1
            for name, point in pose.items():
                if not all(math.isfinite(component) for component in point):
                    raise AssertionError(f"{motion}@{frame:g} {name} has a non-finite position")
            for name, (start, end, expected) in LIMB_CHAINS.items():
                for side in ("L", "R"):
                    actual = (pose[f"{end}_{side}"] - pose[f"{start}_{side}"]).length
                    error = abs(actual - expected)
                    if error > maximum_error:
                        maximum_error = error
                        worst_length = {"motion": motion, "frame": frame, "limb": f"{name}_{side}",
                                        "actualM": round(actual, 5), "expectedM": expected}
                    if error > LANDMARK_LENGTH_TOLERANCE_M and len(failures) < 16:
                        failures.append(f"{motion}@{frame:g} {name}_{side} length {actual:.4f}m; expected {expected}m")
            for side in ("L", "R"):
                for proximal, joint, distal, max_flex in (
                    ("SHOULDER", "ELBOW", "WRIST", 155),
                    ("HIP", "KNEE", "ANKLE", 150),
                ):
                    incoming = pose[f"{proximal}_{side}"] - pose[f"{joint}_{side}"]
                    outgoing = pose[f"{distal}_{side}"] - pose[f"{joint}_{side}"]
                    if incoming.length < 0.1 or outgoing.length < 0.1:
                        if len(failures) < 16:
                            failures.append(f"{motion}@{frame:g} {joint}_{side} collapsed")
                        continue
                    interior = math.degrees(math.acos(max(-1, min(1, incoming.normalized().dot(outgoing.normalized())))))
                    flexion = 180 - interior
                    minimum_flexion = min(minimum_flexion, flexion)
                    maximum_flexion = max(maximum_flexion, flexion)
                    if flexion > max_flex and len(failures) < 16:
                        failures.append(f"{motion}@{frame:g} {joint}_{side} folds to {flexion:.2f} degrees")
            if previous is not None:
                elapsed = (frame - previous_time) / FPS
                for name in POINT_BONES:
                    speed = (pose[name] - previous[name]).length / elapsed
                    if speed > maximum_speed:
                        maximum_speed = speed
                        worst_speed = {"motion": motion, "frame": frame, "landmark": name}
                    if speed > 18.0 and len(failures) < 16:
                        failures.append(f"{motion}@{frame:g} {name} pops at {speed:.2f}m/s")
            previous, previous_time = pose, frame
    if failures:
        raise AssertionError("; ".join(failures) +
                             f"; worst length={worst_length}; max landmark speed={maximum_speed:.3f}m/s at {worst_speed}")
    return {
        "samples": samples,
        "lengthToleranceM": LANDMARK_LENGTH_TOLERANCE_M,
        "maxLengthErrorM": round(maximum_error, 6),
        "worstLength": worst_length,
        "maxLandmarkSpeedMps": round(maximum_speed, 4),
        "worstSpeed": worst_speed,
        "flexionDegrees": [round(minimum_flexion, 2), round(maximum_flexion, 2)],
        "scope": "geometric regression; not biomechanical certification",
    }


def vector_round(value):
    return [round(component, 4) for component in value]


def bounds_round(bounds):
    return {key: round(value, 4) for key, value in bounds.items()}


def evaluated_corners(objects):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    corners = []
    for obj in objects:
        evaluated = obj.evaluated_get(depsgraph)
        corners.extend(evaluated.matrix_world @ Vector(corner) for corner in evaluated.bound_box)
    return corners


def projected_bounds(scene, camera, objects):
    points = [world_to_camera_view(scene, camera, point) for point in evaluated_corners(objects)]
    return {
        "minX": min(point.x for point in points),
        "maxX": max(point.x for point in points),
        "minY": min(point.y for point in points),
        "maxY": max(point.y for point in points),
        "minDepth": min(point.z for point in points),
    }


def in_frame(bounds, margin=FRAME_MARGIN):
    return (
        bounds["minX"] >= margin and bounds["maxX"] <= 1 - margin
        and bounds["minY"] >= margin and bounds["maxY"] <= 1 - margin
        and bounds["minDepth"] > 0
    )


def validate_manifest(document, scene_extras, action):
    if scene_extras.get("rig_contract") != RIG_NAME:
        raise AssertionError(f"Scene rig contract is {scene_extras.get('rig_contract')!r}")
    if scene_extras.get("animation") != CLIP_NAME:
        raise AssertionError(f"Scene animation contract is {scene_extras.get('animation')!r}")
    if scene_extras.get("motion_count") != 52:
        raise AssertionError(f"Scene motion_count is {scene_extras.get('motion_count')!r}, expected 52")

    manifest = json.loads(scene_extras["motion_manifest_json"])
    if len(manifest) != 52 or set(manifest) != set(EXPECTED_MOTIONS):
        missing = sorted(set(EXPECTED_MOTIONS) - set(manifest))
        extra = sorted(set(manifest) - set(EXPECTED_MOTIONS))
        raise AssertionError(f"Motion manifest mismatch: count={len(manifest)} missing={missing} extra={extra}")
    ordered = sorted(manifest, key=lambda motion: manifest[motion]["startFrame"])
    if tuple(ordered) != EXPECTED_MOTIONS:
        raise AssertionError("Motion manifest order no longer matches the browser semantic vocabulary")

    previous_end = None
    for motion in ordered:
        segment = manifest[motion]
        start = segment["startFrame"]
        end = segment["endFrame"]
        if not isinstance(start, int) or not isinstance(end, int) or end <= start:
            raise AssertionError(f"Invalid frame range for {motion}: {segment}")
        if previous_end is not None and start != previous_end + 2:
            raise AssertionError(f"Motion reel gap changed before {motion}: start={start} previousEnd={previous_end}")
        if not math.isclose(segment["startSeconds"], start / FPS, abs_tol=1e-7):
            raise AssertionError(f"Invalid startSeconds for {motion}: {segment}")
        if not math.isclose(segment["durationSeconds"], (end - start) / FPS, abs_tol=1e-7):
            raise AssertionError(f"Invalid durationSeconds for {motion}: {segment}")
        if not isinstance(segment.get("cyclic"), bool):
            raise AssertionError(f"Missing authored cycle behavior for {motion}")
        if "contactProgress" in segment:
            contact = segment["contactProgress"]
            if not isinstance(contact, (int, float)) or not math.isfinite(contact) or not 0.05 <= contact <= 0.95:
                raise AssertionError(f"Invalid authored contact progress for {motion}: {contact!r}")
            if segment.get("contactType") not in ("platform", "two-hands", "right-hand", "left-hand"):
                raise AssertionError(f"Missing authored contact surface for {motion}")
        previous_end = end

    expected_final_frame = manifest[ordered[-1]]["endFrame"] + 2
    action_range = tuple(round(value, 3) for value in action.frame_range)
    if action_range != (0.0, float(expected_final_frame)):
        raise AssertionError(f"Action range {action_range} does not cover manifest through {expected_final_frame}")

    animation = document["animations"][0]
    seconds_start, seconds_end = animation_time_range(document, animation)
    if not math.isclose(seconds_start, 0.0, abs_tol=1e-7):
        raise AssertionError(f"Animation starts at {seconds_start}s instead of zero")
    if not math.isclose(seconds_end * FPS, expected_final_frame, abs_tol=0.05):
        raise AssertionError(
            f"Raw glTF animation ends at frame {seconds_end * FPS:.3f}, expected {expected_final_frame}"
        )
    return manifest, ordered, expected_final_frame, action_range


def validate_sprint(scene, rig, manifest):
    # Gait phase zero is an authoring choice; test both peak knee-drive phases
    # over the full cycle rather than assuming a quarter-frame is airborne.
    samples = [sample_pose(scene, rig, manifest, "sprint", i / 32) for i in range(33)]
    frame_a, phase_a = max(samples, key=lambda item: item[1]["KNEE_L"].y - item[1]["KNEE_R"].y)
    frame_b, phase_b = min(samples, key=lambda item: item[1]["KNEE_L"].y - item[1]["KNEE_R"].y)
    frame_ready, ready = sample_pose(scene, rig, manifest, "ready", 0.50)
    frame_dig, dig = sample_pose(scene, rig, manifest, "dig", 0.50)

    def alternation_signature(pose):
        return (
            pose["KNEE_L"].y - pose["KNEE_R"].y,
            pose["WRIST_L"].y - pose["WRIST_R"].y,
        )

    signature_a = alternation_signature(phase_a)
    signature_b = alternation_signature(phase_b)
    ready_signature = alternation_signature(ready)
    dig_signature = alternation_signature(dig)
    if signature_a[0] * signature_b[0] >= -0.04 or signature_a[1] * signature_b[1] >= -0.04:
        raise AssertionError(
            f"Sprint does not visibly alternate opposite phases: {signature_a} -> {signature_b}"
        )
    if min(abs(signature_a[0]), abs(signature_b[0])) < 0.25:
        raise AssertionError(f"Sprint knee drive is too small: {signature_a[0]:.4f}/{signature_b[0]:.4f}m")
    if min(abs(signature_a[1]), abs(signature_b[1])) < 0.25:
        raise AssertionError(f"Sprint arm swing is too small: {signature_a[1]:.4f}/{signature_b[1]:.4f}m")
    if signature_a[0] * signature_a[1] >= 0 or signature_b[0] * signature_b[1] >= 0:
        raise AssertionError("Sprint arm swing must oppose the leg on the same side")
    if max(abs(value) for value in ready_signature) > 0.32:
        raise AssertionError(f"Ready pose incorrectly resembles a sprint: {ready_signature}")
    if abs(dig_signature[1]) > 0.32:
        raise AssertionError(f"Dig platform incorrectly resembles sprint arms: {dig_signature}")
    return {
        "phaseFrames": [frame_a, frame_b],
        "kneeAlternationM": [round(signature_a[0], 4), round(signature_b[0], 4)],
        "armAlternationM": [round(signature_a[1], 4), round(signature_b[1], 4)],
        "readyFrame": frame_ready,
        "readySignatureM": [round(value, 4) for value in ready_signature],
        "digFrame": frame_dig,
        "digSignatureM": [round(value, 4) for value in dig_signature],
    }


def validate_set(scene, rig, manifest):
    frame, pose = sample_pose(scene, rig, manifest, "set", contact_fraction(manifest, "set"))
    wrists = (pose["WRIST_L"], pose["WRIST_R"])
    elbows = (pose["ELBOW_L"], pose["ELBOW_R"])
    shoulders = (pose["SHOULDER_L"], pose["SHOULDER_R"])
    wrist_span = (wrists[0] - wrists[1]).length
    if min(wrist.z for wrist in wrists) < pose["neck"].z + 0.10:
        raise AssertionError(
            f"Set hands are not overhead at frame {frame}: wrists={tuple(round(w.z, 4) for w in wrists)} "
            f"neck={pose['neck'].z:.4f}"
        )
    # A .27 m forearm is angled inward toward the setting window. Requiring
    # .18 m vertically forced the old long-limbed character's proportions.
    if min(wrist.z - elbow.z for wrist, elbow in zip(wrists, elbows)) < 0.12:
        raise AssertionError(f"Set wrists are not stacked above elbows at frame {frame}")
    if min(elbow.z - shoulder.z for elbow, shoulder in zip(elbows, shoulders)) < -0.10:
        raise AssertionError(f"Set elbows collapse below the shoulder line at frame {frame}")
    if not 0.18 <= wrist_span <= 0.55:
        raise AssertionError(f"Set hand window is implausible at frame {frame}: span={wrist_span:.4f}m")
    return {
        "frame": frame,
        "wristHeightsM": [round(wrist.z, 4) for wrist in wrists],
        "neckHeightM": round(pose["neck"].z, 4),
        "wristSpanM": round(wrist_span, 4),
    }


def validate_pass(scene, rig, manifest):
    frame, pose = sample_pose(scene, rig, manifest, "pass", contact_fraction(manifest, "pass"))
    wrists = (pose["WRIST_L"], pose["WRIST_R"])
    elbows = (pose["ELBOW_L"], pose["ELBOW_R"])
    shoulders = (pose["SHOULDER_L"], pose["SHOULDER_R"])
    wrist_span = (wrists[0] - wrists[1]).length
    platform_midpoint = (wrists[0] + wrists[1]) / 2
    shoulder_midpoint = (shoulders[0] + shoulders[1]) / 2
    straightness = []
    for shoulder, elbow, wrist in zip(shoulders, elbows, wrists):
        upper = (elbow - shoulder).normalized()
        forearm = (wrist - elbow).normalized()
        straightness.append(upper.dot(forearm))
    if not 0.075 <= wrist_span <= 0.16:
        raise AssertionError(f"Pass wrists are not locked together at frame {frame}: span={wrist_span:.4f}m")
    if abs(wrists[0].y - wrists[1].y) > 0.025 or abs(wrists[0].z - wrists[1].z) > 0.025:
        raise AssertionError(f"Pass platform is uneven at frame {frame}")
    # The .58 m arm also reaches down and inward; forward distance cannot be
    # measured as if the complete arm were horizontal in the sagittal plane.
    if platform_midpoint.y - shoulder_midpoint.y < 0.35:
        raise AssertionError(f"Pass platform is not extended in front at frame {frame}")
    if min(straightness) < 0.72:
        raise AssertionError(f"Pass elbows are not locked at frame {frame}: {straightness}")
    return {
        "frame": frame,
        "platformMidpoint": vector_round(platform_midpoint),
        "wristSpanM": round(wrist_span, 4),
        "armStraightness": [round(value, 4) for value in straightness],
    }


def validate_jump_reach(scene, rig, manifest):
    results = {}
    failures = []
    for motion, both_hands in (("attack", False), ("block", True)):
        start_frame, start = sample_pose(scene, rig, manifest, motion, 0.0)
        apex_frame, apex = sample_pose(scene, rig, manifest, motion, contact_fraction(manifest, motion))
        pelvis_rise = apex["pelvis"].z - start["pelvis"].z
        wrists = (apex["WRIST_L"], apex["WRIST_R"])
        if pelvis_rise < 0.30:
            failures.append(f"{motion} has no readable jump: pelvis rise={pelvis_rise:.4f}m")
        if both_hands:
            if min(wrist.z for wrist in wrists) < apex["headTop"].z + 0.02:
                failures.append(
                    f"block hands do not reach above the head at frame {apex_frame}: "
                    f"wrists={tuple(round(wrist.z, 4) for wrist in wrists)} "
                    f"headTop={apex['headTop'].z:.4f}"
                )
        elif max(wrist.z for wrist in wrists) < apex["neck"].z + 0.12:
            failures.append(
                f"attack hitting arm does not reach overhead at frame {apex_frame}: "
                f"wrists={tuple(round(wrist.z, 4) for wrist in wrists)} "
                f"neck={apex['neck'].z:.4f} headTop={apex['headTop'].z:.4f}"
            )
        results[motion] = {
            "frames": [start_frame, apex_frame],
            "pelvisRiseM": round(pelvis_rise, 4),
            "wristHeightsM": [round(wrist.z, 4) for wrist in wrists],
            "neckHeightM": round(apex["neck"].z, 4),
            "headTopM": round(apex["headTop"].z, 4),
        }
    if failures:
        raise AssertionError("; ".join(failures))
    return results


def validate_floor_actions(scene, rig, manifest, floor_top):
    results = {}
    failures = []
    for motion in ("sprawl", "chest-hip-sprawl"):
        samples = []
        for fraction in (0.50, 0.75):
            frame, pose = sample_pose(scene, rig, manifest, motion, fraction)
            knee_surface = min(pose["KNEE_L"].z, pose["KNEE_R"].z) - KNEE_RADIUS_M
            head_surface = min(pose["neck"].z, pose["headTop"].z) - HEAD_RADIUS_M
            chest_surface = pose["pelvis"].z - 0.17
            if chest_surface - floor_top > 0.10:
                failures.append(
                    f"{motion} is not a low chest/hip floor action at frame {frame}: "
                    f"chestSurface={chest_surface - floor_top:.4f}m"
                )
            if head_surface - floor_top < 0.10:
                failures.append(
                    f"{motion} does not protect the head at frame {frame}: "
                    f"headSurface={head_surface - floor_top:.4f}m"
                )
            if knee_surface < chest_surface + 0.025:
                failures.append(
                    f"{motion} puts knees below chest/hips at frame {frame}: "
                    f"knee={knee_surface:.4f} chest={chest_surface:.4f}"
                )
            samples.append({
                "frame": frame,
                "chestSurfaceM": round(chest_surface - floor_top, 4),
                "headSurfaceM": round(head_surface - floor_top, 4),
                "kneeSurfaceM": round(knee_surface - floor_top, 4),
            })
        results[motion] = samples

    pancake_frame, pancake = sample_pose(scene, rig, manifest, "one-arm-save", contact_fraction(manifest, "one-arm-save", 0.75))
    pancake_wrist = pancake["WRIST_R"]
    pancake_shoulder = pancake["SHOULDER_R"]
    pancake_support_wrist = pancake["WRIST_L"]
    pancake_reach = (pancake_wrist - pancake_shoulder).length
    if pancake["pelvis"].z - floor_top > 0.40:
        failures.append(
            "one-arm-save does not reach a full-layout floor level: "
            f"pelvis={pancake['pelvis'].z - floor_top:.4f}m"
        )
    if pancake_wrist.z - floor_top > 0.16:
        failures.append(
            "one-arm-save contact hand is not flat at court level: "
            f"wrist={pancake_wrist.z - floor_top:.4f}m"
        )
    if not 0.53 <= pancake_reach <= 0.60:
        failures.append(
            "one-arm-save contact arm must extend within its fixed anatomical reach: "
            f"reach={pancake_reach:.4f}m"
        )
    if pancake_support_wrist.z < pancake_wrist.z + 0.08:
        failures.append("one-arm-save support arm is not visibly protected above the flat contact hand")
    results["one-arm-save"] = [{
        "frame": pancake_frame,
        "pelvisM": round(pancake["pelvis"].z - floor_top, 4),
        "contactWristM": round(pancake_wrist.z - floor_top, 4),
        "supportWristM": round(pancake_support_wrist.z - floor_top, 4),
        "reachM": round(pancake_reach, 4),
    }]

    for motion in ("shoulder-roll-right", "shoulder-roll-left", "mat-defense"):
        frame, pose = sample_pose(scene, rig, manifest, motion, 0.50)
        knee_surface = min(pose["KNEE_L"].z, pose["KNEE_R"].z) - KNEE_RADIUS_M
        head_surface = min(pose["neck"].z, pose["headTop"].z) - HEAD_RADIUS_M
        if pose["pelvis"].z - floor_top > 0.48:
            failures.append(
                f"{motion} never reaches a readable floor level at frame {frame}: "
                f"pelvis={pose['pelvis'].z - floor_top:.4f}m"
            )
        if head_surface - floor_top < 0.10:
            failures.append(
                f"{motion} exposes the head to the floor at frame {frame}: "
                f"headSurface={head_surface - floor_top:.4f}m"
            )
        if knee_surface - floor_top < -0.02:
            failures.append(
                f"{motion} drives a knee through the floor at frame {frame}: "
                f"kneeSurface={knee_surface - floor_top:.4f}m"
            )
        results[motion] = [{
            "frame": frame,
            "pelvisM": round(pose["pelvis"].z - floor_top, 4),
            "headSurfaceM": round(head_surface - floor_top, 4),
            "kneeSurfaceM": round(knee_surface - floor_top, 4),
        }]

    start_frame, start = sample_pose(scene, rig, manifest, "floor-recovery", 0.0)
    end_frame, end = sample_pose(scene, rig, manifest, "floor-recovery", 1.0)
    if start["pelvis"].z - floor_top > 0.40 or end["pelvis"].z - start["pelvis"].z < 0.45:
        failures.append(
            "floor-recovery does not clearly progress from floor to ready stance: "
            f"start={start['pelvis'].z - floor_top:.4f}m "
            f"rise={end['pelvis'].z - start['pelvis'].z:.4f}m"
        )
    if min(start["neck"].z, start["headTop"].z) - HEAD_RADIUS_M - floor_top < 0.10:
        failures.append("floor-recovery starts with unsafe head clearance")
    results["floor-recovery"] = [{
        "frames": [start_frame, end_frame],
        "pelvisRiseM": round(end["pelvis"].z - start["pelvis"].z, 4),
    }]
    if failures:
        raise AssertionError("; ".join(failures))
    return results


def validate_cameras(scene, athlete_root, athlete_mesh, manifest):
    # Prototypes live outside the court so the browser can clone them. Move the
    # imported athlete root to the deployment origin only for framing checks.
    athlete_root.location = (0, 0, 0)
    bpy.context.view_layer.update()
    mechanics = bpy.data.objects["Camera_Mechanics_Library"]
    court_camera = bpy.data.objects["Camera_Court_Library"]
    court = bpy.data.objects["Court"]
    net_objects = [obj for obj in bpy.data.objects if obj.name.startswith(("Net", "Post")) and obj.type == "MESH"]

    mechanics_samples = {}
    court_samples = {}
    failures = []
    sample_specs = (
        ("ready", 0.50), ("sprint", 0.25), ("sprint", 0.50), ("pass", 0.50),
        ("set", 0.75), ("attack", 0.50), ("block", 0.50), ("sprawl", 0.50),
        ("sprawl", 0.75), ("shoulder-roll-right", 0.50),
        ("shoulder-roll-left", 0.50), ("stretch", 0.50), ("approach-jump", 0.50),
    )
    for aspect_name, width, height in (("16:9", 1280, 720), ("4:3", 800, 600)):
        scene.render.resolution_x = width
        scene.render.resolution_y = height
        scene.render.resolution_percentage = 100
        mechanics_samples[aspect_name] = {}
        for motion, fraction in sample_specs:
            frame = frame_for(manifest, motion, fraction)
            scene.frame_set(frame)
            bpy.context.view_layer.update()
            bounds = projected_bounds(scene, mechanics, [athlete_mesh])
            key = f"{motion}@{fraction:g}"
            mechanics_samples[aspect_name][key] = {"frame": frame, **bounds_round(bounds)}
            if not in_frame(bounds):
                failures.append(f"mechanics {aspect_name} crops {key}: {bounds}")

        scene.frame_set(frame_for(manifest, "ready", 0.50))
        bpy.context.view_layer.update()
        court_bounds = projected_bounds(scene, court_camera, [court, athlete_mesh] + net_objects)
        court_samples[aspect_name] = bounds_round(court_bounds)
        if not in_frame(court_bounds, margin=0.006):
            failures.append(f"court {aspect_name} crops court/net/athlete context: {court_bounds}")
    if failures:
        raise AssertionError("; ".join(failures))
    return {
        "mechanics": mechanics_samples,
        "court": court_samples,
    }


def main():
    global FPS
    if not GLB_PATH.exists():
        raise AssertionError(f"Missing shared CoachCam GLB: {GLB_PATH}")
    document = read_glb(GLB_PATH)
    if GLB_PATH.stat().st_size > MAX_GLB_BYTES:
        raise AssertionError(f"GLB exceeds {MAX_GLB_BYTES} byte budget: {GLB_PATH.stat().st_size}")
    if any("uri" in buffer for buffer in document.get("buffers", [])):
        raise AssertionError("Shared CoachCam GLB must not depend on external buffers")
    if document.get("images") or document.get("textures"):
        raise AssertionError("Shared CoachCam library unexpectedly embeds texture/image payloads")
    if len(document.get("animations", [])) != 1:
        raise AssertionError(f"Expected one motion-reel animation: {[a.get('name') for a in document.get('animations', [])]}")
    if len(document.get("skins", [])) != 1:
        raise AssertionError(f"Expected exactly one glTF skin, found {len(document.get('skins', []))}")

    scene_index = document.get("scene", 0)
    scene_extras = document["scenes"][scene_index].get("extras", {})
    authored_fps = scene_extras.get("source_fps", 24)
    if not isinstance(authored_fps, (int, float)) or not 24 <= authored_fps <= 96 or authored_fps != int(authored_fps):
        raise AssertionError(f"Unsupported authored sample rate: {authored_fps!r}")
    FPS = int(authored_fps)
    equipment_manifest = json.loads(scene_extras.get("equipment_manifest_json", "[]"))
    if len(equipment_manifest) != 14 or set(equipment_manifest) != set(EXPECTED_EQUIPMENT_ROOTS):
        raise AssertionError(f"Equipment manifest mismatch: {equipment_manifest}")

    nodes = document.get("nodes", [])
    nodes_by_name = {node.get("name"): (index, node) for index, node in enumerate(nodes)}
    if len(nodes_by_name) != len(nodes):
        raise AssertionError("GLB node names are not unique")
    equipment_entries = [
        (node.get("extras", {}).get("equipment_key"), node.get("name"))
        for node in nodes
        if node.get("extras", {}).get("equipment_key")
    ]
    if len(equipment_entries) != 14:
        raise AssertionError(f"Expected exactly 14 equipment roots, found {equipment_entries}")
    equipment_nodes = dict(equipment_entries)
    if equipment_nodes != EXPECTED_EQUIPMENT_ROOTS:
        raise AssertionError(f"Equipment root contract mismatch: {equipment_nodes}")
    for key, root_name in EXPECTED_EQUIPMENT_ROOTS.items():
        extras = nodes_by_name[root_name][1].get("extras", {})
        if key != "net" and extras.get("prototype") is not True:
            raise AssertionError(f"Equipment root {root_name} is not marked as a prototype")

    required_nodes = {
        "CourtEnvironment", "Court", "NetSystem", "Camera_Court_Library",
        "Camera_Mechanics_Library", "Prototype_Ball", "Prototype_Ball_Body",
        "AthleteTemplate", "AthleteTemplate_Mesh", RIG_NAME,
    }
    missing_nodes = sorted(required_nodes - set(nodes_by_name))
    if missing_nodes:
        raise AssertionError(f"Missing shared-library nodes: {missing_nodes}")
    if nodes_by_name[RIG_NAME][1].get("extras", {}).get("rig_contract") != RIG_NAME:
        raise AssertionError("RR_Humanoid_v1 node is missing its rig-contract extra")
    if nodes_by_name[RIG_NAME][1].get("extras", {}).get("motion_manifest_json") != scene_extras.get("motion_manifest_json"):
        raise AssertionError("Rig and scene motion-manifest extras disagree")
    for camera_name in ("Camera_Court_Library", "Camera_Mechanics_Library"):
        if "camera" not in nodes_by_name[camera_name][1]:
            raise AssertionError(f"{camera_name} is not exported as a glTF camera node")
    if "mesh" not in nodes_by_name["Prototype_Ball_Body"][1]:
        raise AssertionError("Volleyball prototype body is not exported as renderable geometry")

    skin_joint_names = {nodes[index].get("name") for index in document["skins"][0].get("joints", [])}
    if skin_joint_names != EXPECTED_BONES:
        raise AssertionError(
            f"{len(EXPECTED_BONES)}-bone skin contract mismatch: missing={sorted(EXPECTED_BONES - skin_joint_names)} "
            f"extra={sorted(skin_joint_names - EXPECTED_BONES)}"
        )

    skinned_nodes = [(index, node) for index, node in enumerate(nodes) if "skin" in node]
    if len(skinned_nodes) != 1 or skinned_nodes[0][1].get("name") != "AthleteTemplate_Mesh":
        raise AssertionError(f"Expected one merged skinned athlete node, found {[(n.get('name')) for _, n in skinned_nodes]}")
    athlete_mesh_index = skinned_nodes[0][1].get("mesh")
    if athlete_mesh_index is None:
        raise AssertionError("Merged athlete node has no mesh")
    athlete_node_extras = skinned_nodes[0][1].get("extras", {})
    if athlete_node_extras.get("shared_geometry") is not True:
        raise AssertionError("Merged athlete node is not marked as shared geometry")
    if athlete_node_extras.get("triangle_budget_target") != MAX_ATHLETE_TRIANGLES:
        raise AssertionError(
            f"Athlete triangle-budget extra changed: {athlete_node_extras.get('triangle_budget_target')!r}"
        )

    animated_node_names = {
        nodes[channel["target"]["node"]].get("name")
        for channel in document["animations"][0].get("channels", [])
        if "node" in channel.get("target", {})
    }
    if not EXPECTED_BONES.issubset(animated_node_names):
        raise AssertionError(f"Animation omits rig bones: {sorted(EXPECTED_BONES - animated_node_names)}")

    athlete_triangles = triangle_count(document, [athlete_mesh_index])
    total_triangles = triangle_count(document)
    mesh_node_count = sum(1 for node in nodes if "mesh" in node)
    primitive_count = sum(len(mesh.get("primitives", [])) for mesh in document.get("meshes", []))
    if athlete_triangles > MAX_ATHLETE_TRIANGLES:
        raise AssertionError(f"Athlete exceeds {MAX_ATHLETE_TRIANGLES} triangle budget: {athlete_triangles}")
    if total_triangles > MAX_TOTAL_TRIANGLES:
        raise AssertionError(f"Library exceeds {MAX_TOTAL_TRIANGLES} triangle budget: {total_triangles}")
    if mesh_node_count > MAX_MESH_NODES or primitive_count > MAX_PRIMITIVES:
        raise AssertionError(
            f"Library draw complexity exceeds budget: meshNodes={mesh_node_count} primitives={primitive_count}"
        )
    if len(document.get("materials", [])) > MAX_MATERIALS:
        raise AssertionError(f"Library material count exceeds {MAX_MATERIALS}: {len(document.get('materials', []))}")

    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.fps = FPS
    scene.render.fps_base = 1.0
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    bpy.ops.import_scene.gltf(filepath=str(GLB_PATH))

    armatures = [obj for obj in bpy.data.objects if obj.type == "ARMATURE"]
    if len(armatures) != 1 or armatures[0].name != RIG_NAME:
        raise AssertionError(f"Expected one {RIG_NAME} armature after import: {[obj.name for obj in armatures]}")
    rig = armatures[0]
    if set(rig.pose.bones.keys()) != EXPECTED_BONES:
        raise AssertionError(f"Blender round-trip changed the {len(EXPECTED_BONES)}-bone rig contract")
    actions = list(bpy.data.actions)
    if len(actions) != 1:
        raise AssertionError(f"Unexpected Blender actions: {[action.name for action in actions]}")

    manifest, ordered_motions, final_frame, action_range = validate_manifest(document, scene_extras, actions[0])

    athlete_meshes = [
        obj for obj in bpy.data.objects
        if obj.type == "MESH" and any(modifier.type == "ARMATURE" for modifier in obj.modifiers)
    ]
    if len(athlete_meshes) != 1 or athlete_meshes[0].name != "AthleteTemplate_Mesh":
        raise AssertionError(f"Merged athlete did not survive import: {[obj.name for obj in athlete_meshes]}")
    athlete_mesh = athlete_meshes[0]
    athlete_root = bpy.data.objects.get("AthleteTemplate")
    if athlete_root is None or rig.parent != athlete_root or athlete_mesh.parent != rig:
        raise AssertionError("Athlete prototype hierarchy did not survive round-trip")
    if set(athlete_mesh.vertex_groups.keys()) != EXPECTED_BONES:
        raise AssertionError("Merged athlete vertex groups no longer match the rig contract")

    for key, root_name in EXPECTED_EQUIPMENT_ROOTS.items():
        root_object = bpy.data.objects.get(root_name)
        if root_object is None or root_object.get("equipment_key") != key:
            raise AssertionError(f"Equipment root {root_name} did not survive Blender round-trip")
        if key != "net" and root_object.get("prototype") is not True:
            raise AssertionError(f"Equipment prototype flag did not survive on {root_name}")
    court_object = bpy.data.objects.get("Court")
    if court_object is None or court_object.get("width_m") != 9.0 or court_object.get("length_m") != 18.0:
        raise AssertionError("Regulation court dimensions did not survive Blender round-trip")
    if bpy.data.objects["Camera_Court_Library"].get("camera_role") != "full-court":
        raise AssertionError("Court camera role extra did not survive Blender round-trip")
    if bpy.data.objects["Camera_Mechanics_Library"].get("camera_role") != "full-body-mechanics":
        raise AssertionError("Mechanics camera role extra did not survive Blender round-trip")

    floor_top = max(point.z for point in evaluated_corners([court_object]))
    failures = []

    def run_semantic_check(name, callback):
        try:
            return callback()
        except AssertionError as error:
            failures.append(f"{name}: {error}")
            return {"status": "FAIL", "error": str(error)}

    anatomy_checks = run_semantic_check("anatomy", lambda: validate_anatomy(scene, rig, manifest))
    sprint_checks = run_semantic_check("sprint", lambda: validate_sprint(scene, rig, manifest))
    set_checks = run_semantic_check("set", lambda: validate_set(scene, rig, manifest))
    pass_checks = run_semantic_check("pass", lambda: validate_pass(scene, rig, manifest))
    jump_checks = run_semantic_check("jumpReach", lambda: validate_jump_reach(scene, rig, manifest))
    floor_checks = run_semantic_check(
        "floorActions", lambda: validate_floor_actions(scene, rig, manifest, floor_top)
    )
    camera_checks = run_semantic_check(
        "cameras", lambda: validate_cameras(scene, athlete_root, athlete_mesh, manifest)
    )

    report = {
        "status": "FAIL" if failures else "PASS",
        "failures": failures,
        "file": str(GLB_PATH),
        "bytes": GLB_PATH.stat().st_size,
        "rig": {"name": rig.name, "bones": len(rig.pose.bones), "skinCount": 1},
        "motions": {"count": len(manifest), "order": ordered_motions, "finalFrame": final_frame},
        "equipment": {"count": len(equipment_nodes), "roots": equipment_nodes},
        "animation": {
            "name": actions[0].name,
            "sourceFps": FPS,
            "frameRange": action_range,
            "animatedBones": len(EXPECTED_BONES & animated_node_names),
        },
        "performance": {
            "athleteTriangles": athlete_triangles,
            "totalTriangles": total_triangles,
            "meshNodes": mesh_node_count,
            "primitives": primitive_count,
            "materials": len(document.get("materials", [])),
            "textures": len(document.get("textures", [])),
        },
        "anatomy": anatomy_checks,
        "sprint": sprint_checks,
        "set": set_checks,
        "pass": pass_checks,
        "jumpReach": jump_checks,
        "floorActions": floor_checks,
        "cameras": camera_checks,
    }
    print("COACHCAM_LIBRARY_VALIDATION=" + json.dumps(report, sort_keys=True))
    if failures:
        raise AssertionError("CoachCam library semantic validation failed: " + " | ".join(failures))


if __name__ == "__main__":
    main()
