"""Authored floor and one-knee variants for drills that specify those postures.

Coordinates and constraints are the shared kinematics model's metres and
fixed-length IK. These variants change the actual support and pelvis position;
they never simulate sitting by shrinking a standing athlete or hiding legs.
The saved drill copy selects these poses. The geometry checks here verify this
rig's constraints, not clinical or coaching certification of the exercise.

Validate with Blender:
  blender --background --factory-startup --python-exit-code 1 --python tools/blender/coachcam/context_poses.py
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

from mathutils import Vector

HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))
import kinematics as k  # noqa: E402


CONTEXT_MOTIONS = {
    ("ready", "seated"): {"durationSeconds": 1.0, "cyclic": True},
    ("ready", "kneeling"): {"durationSeconds": 1.0, "cyclic": True},
    ("pass", "seated"): {"durationSeconds": 1.2, "cyclic": True,
                          "contactProgress": .50, "contactType": "platform"},
    ("set", "kneeling"): {"durationSeconds": 1.2, "cyclic": True,
                           "contactProgress": .56, "contactType": "two-hands"},
    ("set", "sit-stand"): {"durationSeconds": 3.5, "cyclic": True,
                            "contactProgress": .56, "contactType": "two-hands"},
}


def seated():
    """Upright floor sit, pelvis supported and legs in front of the body."""
    c = k.control(.16, .045, .36)
    for side, sign in (("L", -1), ("R", 1)):
        c["ankle_" + side] = Vector((sign * .36, .78, k.ANKLE_Z))
        c["knee_pole_" + side] = Vector((sign * .66, .40, .64))
        c["foot_" + side] = Vector((sign * .02, .258, -.015))
    return k.hands(c, (-.24, .34, .52), (.24, .34, .52),
                   ((-.44, .18, .48), (.44, .18, .48)))


def one_knee():
    """Left knee down, right foot flat; the back knee is a fixed support."""
    knee = Vector((-.24, .06, .14))
    # Construct the ankle from the intended support knee, then let the same
    # shared IK solve it. Neither leg is lengthened to reach the floor.
    hip_height = knee.z + math.sqrt(.43 ** 2 - .09 ** 2 - .06 ** 2)
    c = k.control(hip_height, .065, .24)
    c["ankle_L"] = Vector((knee.x, knee.y - math.sqrt(.43 ** 2 - (k.ANKLE_Z - knee.z) ** 2), k.ANKLE_Z))
    c["knee_pole_L"] = knee.copy()
    c["foot_L"] = Vector((0, -.258, -.015))
    c["ankle_R"] = Vector((.25, .37, k.ANKLE_Z))
    c["knee_pole_R"] = Vector((.28, .75, .54))
    c["foot_R"] = Vector((0, .258, -.015))
    return k.hands(c, (-.24, .27, hip_height + .23), (.24, .27, hip_height + .23),
                   ((-.43, .12, hip_height + .28), (.43, .12, hip_height + .28)))


def seated_platform(lift=0.):
    c = seated()
    # A quiet platform makes only a small, controlled angle change at contact.
    # The buttocks, heels and feet do not bounce to drive a seated pass.
    z = .435 + lift * .025
    return k.hands(c, (-.045, .535, z), (.045, .535, z),
                   ((-.28, .31, z + .095), (.28, .31, z + .095)))


def sit_stand_base(height, back, lean):
    """Both soles stay on their original targets throughout the floor transfer."""
    c = k.control(height, lean, .40, pelvis=Vector((0, back, height)))
    for side, sign in (("L", -1), ("R", 1)):
        c["ankle_" + side] = Vector((sign * .40, 0, k.ANKLE_Z))
        c["knee_pole_" + side] = Vector((sign * .62, .60, .60))
        c["foot_" + side] = Vector((sign * .08, .245, -.015))
    # Keep the hands in front of the forehead throughout the transfer; the
    # athlete does not push up from the floor with the setting hands.
    return setting_window(c)


def setting_window(c, extension=0.):
    """Locate the setting window above this pose's actual forehead position."""
    neck = c["pelvis"] + c["body"] @ Vector((0, 0, .60))
    y, z = neck.y + .16, neck.z + .22 + .21 * extension
    return k.hands(c, (-.14, y, z), (.14, y, z),
                   ((-.55, neck.y + .09, neck.z + .10),
                    (.55, neck.y + .09, neck.z + .10)))


def sit_stand(t):
    upright = sit_stand_base(.94, 0, .045)
    middle = sit_stand_base(.64, -.10, .34)
    squat = sit_stand_base(.35, -.17, .75)
    transfer = sit_stand_base(.205, -.205, 1.0)
    grounded_lean = sit_stand_base(.16, -.31, .85)
    floor = sit_stand_base(.16, -.40, .045)
    contact = setting_window(upright, .45)
    finish = setting_window(upright, .90)
    # The seated hold is visible; forward trunk lean precedes leaving the
    # floor so weight shifts over the planted feet before extension.
    return k.timeline([
        (0, upright), (.09, middle), (.16, squat), (.205, transfer),
        (.24, grounded_lean), (.28, floor), (.33, floor),
        (.365, grounded_lean), (.405, transfer), (.455, squat),
        (.515, middle), (.56, contact), (.69, finish), (1, upright),
    ], t)


def build_context_pose(motion_id, posture, t):
    key = (motion_id, posture)
    if key not in CONTEXT_MOTIONS:
        raise ValueError(f"Unknown contextual CoachCam pose: {motion_id}.{posture}")
    t = max(0., min(1., float(t)))
    if key == ("ready", "seated"):
        return seated()
    if key == ("ready", "kneeling"):
        return one_knee()
    if key == ("pass", "seated"):
        return k.timeline([(0, seated()), (.25, seated_platform()),
                           (.50, seated_platform(.30)), (.64, seated_platform(.75)),
                           (1, seated())], t)
    if key == ("set", "kneeling"):
        base = one_knee()
        return k.timeline([(0, base), (.28, k.overhead(base)),
                           (.56, k.overhead(base, .45)), (.74, k.overhead(base, .90)),
                           (1, base)], t)
    return sit_stand(t)


def validate():
    """Sample at 96Hz, including between the shared export's 48Hz keys."""
    samples = 0
    max_length_error = 0.
    max_support_error = 0.
    max_flexion = 0.
    max_turn = 0.
    chains = (("shoulder", "elbow", "wrist", .31, .27),
              ("hip", "knee", "ankle", .43, .43))
    for (motion_id, posture), metadata in CONTEXT_MOTIONS.items():
        total = round(metadata["durationSeconds"] * 96)
        first = None
        previous = None
        lowest_pelvis = float("inf")
        for index in range(total + 1):
            controls = build_context_pose(motion_id, posture, index / total)
            pose = k.solve(controls)
            if first is None:
                first = pose
            lowest_pelvis = min(lowest_pelvis, pose["pelvis"].z)
            for side in ("L", "R"):
                assert pose["knee_" + side].z >= .13999, (motion_id, posture, index, "knee below floor limit")
                assert pose["toe_" + side].z >= .139, (motion_id, posture, index, "toe floor penetration")
                support_error = (pose["ankle_" + side] - first["ankle_" + side]).length
                max_support_error = max(max_support_error, support_error)
                assert support_error < .00001, (motion_id, posture, index, "planted foot slides", support_error)
                for a, b, c, upper_length, lower_length in chains:
                    upper = pose[b + "_" + side] - pose[a + "_" + side]
                    lower = pose[c + "_" + side] - pose[b + "_" + side]
                    error = max(abs(upper.length - upper_length), abs(lower.length - lower_length))
                    max_length_error = max(max_length_error, error)
                    assert error < .000002, (motion_id, posture, index, "bone length error", error)
                    flexion = math.degrees(upper.angle(lower))
                    max_flexion = max(max_flexion, flexion)
                    assert flexion <= (150.01 if a == "shoulder" else 145.01), (motion_id, posture, index, "hinge beyond limit", flexion)
                    if previous:
                        old = previous[b + "_" + side] - previous[a + "_" + side]
                        turn = math.degrees(upper.angle(old))
                        max_turn = max(max_turn, turn)
                        assert turn < 12, (motion_id, posture, index, "discontinuous limb direction", turn)
            if posture == "kneeling":
                error = (pose["knee_L"] - first["knee_L"]).length
                max_support_error = max(max_support_error, error)
                assert error < .00001, (motion_id, posture, index, "support knee slides", error)
                assert abs(pose["knee_L"].z - .14) < .00001
            if posture == "seated":
                assert (pose["pelvis"] - first["pelvis"]).length < .00001, "seated performer cannot bounce the hips"
                assert abs(pose["pelvis"].z - .16) < .00001, "seated performer must reach the floor"
            if posture == "sit-stand":
                wrist_center = (pose["wrist_L"] + pose["wrist_R"]) * .5
                assert wrist_center.z >= pose["neck"].z + .12, "hands leave the setting window during the floor transfer"
                assert .04 <= wrist_center.y - pose["neck"].y <= .25, "hands drift in front of or behind the forehead"
            previous = pose
            samples += 1
        for name in first:
            assert (first[name] - previous[name]).length < .00002, (motion_id, posture, "loop seam", name)
        if posture == "sit-stand":
            assert lowest_pelvis <= .161, "Set and Sit must actually reach a seated floor position"
            assert first["pelvis"].z >= .90, "Set and Sit must return fully upright"
    return {
        "contextMotionCount": len(CONTEXT_MOTIONS), "samples": samples,
        "maxLimbLengthErrorMetres": max_length_error,
        "maxPlantedSupportDriftMetres": max_support_error,
        "maxJointFlexionDegrees": max_flexion,
        "maxHalfFrameLimbTurnDegrees": max_turn,
    }


if __name__ == "__main__":
    print("COACHCAM_CONTEXT_POSES=" + json.dumps(validate(), sort_keys=True))
