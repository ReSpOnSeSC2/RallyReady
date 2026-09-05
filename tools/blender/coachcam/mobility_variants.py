"""Distinct recovery and supported floor actions for the authored drill steps.

The existing fixed-length IK remains authoritative. Variants explicitly place
support hands, feet, knees, the pelvis and equipment; they are not renamed
standing stretches. Unilateral holds have separate mirrored clips so switching
sides never drags planted feet across the floor.
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

from mathutils import Matrix, Quaternion, Vector

HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))
import kinematics as k  # noqa: E402
import context_poses as context  # noqa: E402


def mirror(c):
    reflect = Matrix.Diagonal((-1., 1., 1.))
    out = {}
    for name, value in c.items():
        source = name[:-1] + ("R" if name.endswith("L") else "L") if name.endswith(("_L", "_R")) else name
        value = c[source]
        if isinstance(value, Quaternion):
            out[name] = (reflect @ value.to_matrix() @ reflect).to_quaternion()
        else:
            out[name] = value.copy()
            out[name].x *= -1
    return out


def _back_supported(height=.40, shift=0.):
    c = k.control(height, 0, .20, pelvis=Vector((0, shift, height)),
                  body=k.orientation((0, -.85, .527)),
                  head=k.orientation((0, -.35, .937)))
    for side, sign in (("L", -1), ("R", 1)):
        c["ankle_" + side] = Vector((sign * .20, .77, k.ANKLE_Z))
        c["knee_pole_" + side] = Vector((sign * .20, .40, .68))
    return k.hands(c, (-.34, -.40, .14), (.34, -.40, .14),
                   ((-.48, -.35, .33), (.48, -.35, .33)))


def foam_calves(t):
    c = _back_supported(.34, .04 * math.cos(2 * math.pi * t))
    c["ankle_L"] = Vector((-.18, .81, .25))
    c["ankle_R"] = Vector((-.13, .73, .40))
    c["knee_pole_R"] = Vector((.30, .40, .70))
    return c


def foam_hamstrings(t):
    return _back_supported(.40, .045 * math.cos(2 * math.pi * t))


def foam_quads(t):
    c = k.control(.43, 0, .22, pelvis=Vector((0, .045 * math.cos(2 * math.pi * t), .43)),
                  body=k.orientation((0, .997, -.075), (0, -.075, -.997)),
                  head=k.orientation((0, .93, .365)))
    for side, sign in (("L", -1), ("R", 1)):
        c["ankle_" + side] = Vector((sign * .22, -.75, k.ANKLE_Z))
        c["knee_pole_" + side] = Vector((sign * .24, -.38, .30))
        c["foot_" + side] = Vector((0, -.258, -.015))
    return k.hands(c, (-.22, .91, .145), (.22, .91, .145),
                   ((-.29, .59, .14), (.29, .59, .14)))


def foam_upper_back(t):
    shift = .04 * math.cos(2 * math.pi * t)
    c = k.control(.40, 0, .23, pelvis=Vector((0, shift, .40)),
                  body=k.orientation((0, -.998, .065), (0, .065, .998)),
                  head=k.orientation((0, -.98, .20), (0, .20, .98)))
    for side, sign in (("L", -1), ("R", 1)):
        c["ankle_" + side] = Vector((sign * .23, .50, k.ANKLE_Z))
        c["knee_pole_" + side] = Vector((sign * .23, .60, .90))
    return k.hands(c, (-.15, -.72 + shift, .54), (.15, -.72 + shift, .54),
                   ((-.48, -.44 + shift, .66), (.48, -.44 + shift, .66)))


def foam_side_hip(t):
    c = k.control(.54, 0, .23, pelvis=Vector((0, .025 * math.cos(2 * math.pi * t), .54)),
                  body=k.orientation((0, .95, .312), (1, 0, 0)),
                  head=k.orientation((0, .95, .312), (1, 0, 0)))
    c["hips"] = c["body"].copy()
    c["ankle_L"] = Vector((0, -.75, k.ANKLE_Z))
    c["ankle_R"] = Vector((.36, -.22, k.ANKLE_Z))
    c["knee_pole_L"] = Vector((0, -.36, .28))
    c["knee_pole_R"] = Vector((.52, -.15, .55))
    c["foot_L"] = Vector((0, -.258, -.015))
    return k.hands(c, (-.12, .63, .14), (.15, .08, .65),
                   ((-.18, .49, .25), (.36, .36, .68)))


def hamstring(t):
    c = context.seated()
    c["body"] = k.orientation((0, .76, .65))
    c["head"] = k.orientation((0, .42, .907))
    return k.hands(c, (-.25, .76, .25), (.25, .76, .25),
                   ((-.36, .47, .35), (.36, .47, .35)))


def figure_four(t):
    c = k.supine_rest()
    c["ankle_L"] = Vector((-.20, .25, .62))
    c["knee_pole_L"] = Vector((-.20, -.22, .66))
    knee = k.solve(c)["knee_L"]
    hip = c["pelvis"] + Vector((-.15, 0, 0))
    c["ankle_R"] = hip.lerp(knee, .82) + Vector((-.01, .02, .11))
    c["knee_pole_R"] = Vector((.55, .17, .46))
    c["foot_R"] = Vector((-.25, .055, .02))
    return k.hands(c, (-.30, -.17, .50), (-.07, -.17, .50),
                   ((-.48, -.32, .43), (.25, -.27, .47)))


def hip_flexor(t):
    c = context.one_knee()
    y = .075
    c["pelvis"].y = y
    c["pelvis"].z = .14 + math.sqrt(.43 ** 2 - .09 ** 2 - (y - .06) ** 2)
    c["ankle_R"] = Vector((.25, .53, k.ANKLE_Z))
    c["body"] = k.orientation((0, .035, 1))
    return k.hands(c, (-.27, .15, .66), (.24, .42, .64),
                   ((-.43, .14, .78), (.38, .32, .79)))


def supine_twist(t):
    c = k.supine_rest()
    c["hips"] = Quaternion((0, 1, 0), .32)
    c["ankle_L"] = Vector((.27, .46, k.ANKLE_Z))
    c["ankle_R"] = Vector((.35, .48, .23))
    c["knee_pole_L"] = Vector((.62, .15, .20))
    c["knee_pole_R"] = Vector((.65, .16, .28))
    return k.hands(c, (-.66, -.29, .16), (.66, -.29, .16),
                   ((-.44, -.47, .15), (.44, -.47, .15)))


def childs_pose(t):
    c = k.control(.27, 0, .28, pelvis=Vector((0, -.10, .27)),
                  body=k.orientation((0, .98, -.20), (0, -.20, -.98)),
                  head=k.orientation((0, .96, .28)))
    for side, sign in (("L", -1), ("R", 1)):
        c["ankle_" + side] = Vector((sign * .28, -.31, k.ANKLE_Z))
        c["knee_pole_" + side] = Vector((sign * .32, .48, .14))
        c["foot_" + side] = Vector((0, -.258, -.015))
    return k.hands(c, (-.23, .94, .135), (.23, .94, .135),
                   ((-.30, .66, .17), (.30, .66, .17)))


def forward_fold(t):
    c = k.control(.96, 0, .23, body=k.orientation((0, .90, -.436), (0, -.436, -.90)),
                  head=k.orientation((0, .58, -.815), (0, -.815, -.58)))
    return k.hands(c, (-.23, .43, .24), (.23, .43, .24),
                   ((-.31, .38, .48), (.31, .38, .48)))


def side_bend(t):
    side = math.sin(2 * math.pi * t)
    c = k.standing()
    c["body"] = k.orientation((.19 * side, .02, 1))
    c["head"] = c["body"].copy()
    return k.hands(c, (-.14 + .13 * side, .08, 1.92), (.14 + .13 * side, .08, 1.92),
                   ((-.45 + .13 * side, .04, 1.68), (.45 + .13 * side, .04, 1.68)))


def lunge_rotation(t):
    c = hip_flexor(t)
    c["body"] = k.orientation((0, .36, .93), (.58, .76, -.29))
    neck = c["pelvis"] + c["body"] @ Vector((0, 0, .60))
    return k.hands(c, (-.28, .36, .48), (.38, neck.y + .05, neck.z + .38),
                   ((-.42, .28, .66), (.47, neck.y + .02, neck.z + .14)))


def standing_quad(t):
    c = k.standing()
    c["ankle_R"] = Vector((.21, -.25, .88))
    c["knee_pole_R"] = Vector((.23, .30, .50))
    c["foot_R"] = Vector((0, -.12, .23))
    return k.hands(c, (-.42, .22, 1.10), (.24, -.20, .97),
                   ((-.44, .13, 1.31), (.39, -.19, 1.20)))


def standing_calf(t):
    c = k.control(.90, .28, .20, pelvis=Vector((0, -.04, .90)))
    c["ankle_L"] = Vector((-.20, .27, k.ANKLE_Z))
    c["ankle_R"] = Vector((.20, -.43, k.ANKLE_Z))
    return k.hands(c, (-.24, .56, 1.22), (.24, .56, 1.22),
                   ((-.38, .29, 1.22), (.38, .29, 1.22)))


def standing_hamstring(t):
    # Staggered support: the front heel stays down with toes raised, rear knee
    # soft, and hands supported on the thighs while the trunk hinges forward.
    c = k.control(.88, 0, .18, pelvis=Vector((0, -.14, .88)),
                  body=k.orientation((0, .58, .815)),
                  head=k.orientation((0, .35, .937)))
    c["ankle_L"] = Vector((-.18, .30, k.ANKLE_Z))
    c["ankle_R"] = Vector((.18, -.40, k.ANKLE_Z))
    c["foot_L"] = Vector((0, .25, .07))
    return k.hands(c, (-.19, .23, .70), (.20, .03, .76),
                   ((-.34, .32, .97), (.35, .20, .99)))


def bent_knee_calf(t):
    c = standing_calf(t)
    # Both heels remain on their existing floor targets. Shifting down/back
    # bends the rear knee for the separate bent-knee calf instruction.
    c["pelvis"] = Vector((0, -.13, .87))
    return c


def cross_chest(t):
    c = k.standing()
    c["wrist_R"] = Vector((-.24, .33, 1.40))
    c["arm_pole_R"] = Vector((.02, .31, 1.48))
    elbow = k.solve(c)["elbow_R"]
    c["wrist_L"] = elbow + Vector((-.025, .035, -.025))
    c["arm_pole_L"] = Vector((-.34, .23, 1.21))
    return c


def triceps(t):
    c = k.standing()
    c["wrist_R"] = Vector((.16, -.19, 1.61))
    c["arm_pole_R"] = Vector((.25, -.015, 1.89))
    elbow = k.solve(c)["elbow_R"]
    c["wrist_L"] = elbow + Vector((-.035, .08, .015))
    c["arm_pole_L"] = Vector((-.30, .15, 1.77))
    return c


def seated_figure_four(t):
    c = context.seated()
    c["body"] = k.orientation((0, -.13, .99))
    c["ankle_L"] = Vector((-.22, .52, k.ANKLE_Z))
    c["knee_pole_L"] = Vector((-.23, .26, .66))
    knee = k.solve(c)["knee_L"]
    hip = c["pelvis"] + Vector((-.15, 0, 0))
    c["ankle_R"] = hip.lerp(knee, .85) + Vector((-.01, .01, .11))
    c["knee_pole_R"] = Vector((.56, .30, .38))
    c["foot_R"] = Vector((-.245, .08, .01))
    return k.hands(c, (-.32, -.16, .145), (.32, -.16, .145),
                   ((-.43, -.12, .37), (.43, -.12, .37)))


def seated_twist(t):
    c = context.seated()
    c["body"] = Quaternion((0, 0, 1), .35) @ k.orientation((0, .045, 1))
    c["head"] = Quaternion((0, 0, 1), .48) @ k.orientation((0, .025, 1))
    c["ankle_L"] = Vector((-.24, .77, k.ANKLE_Z))
    c["ankle_R"] = Vector((-.37, .36, k.ANKLE_Z))
    c["knee_pole_R"] = Vector((-.04, .22, .72))
    c["wrist_R"] = Vector((.31, -.15, .145))
    c["arm_pole_R"] = Vector((.43, -.10, .40))
    knee = k.solve(c)["knee_R"]
    c["wrist_L"] = knee + Vector((-.065, .025, .06))
    c["arm_pole_L"] = Vector((-.32, .20, .62))
    return c


def _crawl_target(t, side, stride, base, clearance):
    p = (t + (0 if side == "L" else .5)) % 1
    if p < .60:
        return base + stride * (.30 - p), 0
    swing = (p - .60) / .40
    return base + stride * (-.30 + .60 * k.smooth(swing)), clearance * math.sin(math.pi * swing) ** 2


def bear_crawl(t):
    c = k.control(.585, 0, .25, body=k.orientation((0, .986, .166)),
                  head=k.orientation((0, .99, -.14), (0, -.14, -.99)))
    for side, sign in (("L", -1), ("R", 1)):
        foot_y, foot_lift = _crawl_target(t, side, .40, -.36, .05)
        hand_y, hand_lift = _crawl_target(t, "R" if side == "L" else "L", .40, .59, .055)
        c["ankle_" + side] = Vector((sign * .25, foot_y, k.ANKLE_Z + foot_lift))
        c["knee_pole_" + side] = Vector((sign * .30, .09, .29))
        c["wrist_" + side] = Vector((sign * .30, hand_y, .14 + hand_lift))
        c["arm_pole_" + side] = Vector((sign * .40, .44, .31))
    return c


def crab_walk(t):
    c = k.control(.48, 0, .24, body=k.orientation((0, -.96, .28), (0, .28, .96)),
                  head=k.orientation((0, -.72, .694), (0, .694, .72)))
    for side, sign in (("L", -1), ("R", 1)):
        foot_y, foot_lift = _crawl_target(t, side, .36, .52, .04)
        hand_y, hand_lift = _crawl_target(t, "R" if side == "L" else "L", .36, -.55, .045)
        c["ankle_" + side] = Vector((sign * .24, foot_y, k.ANKLE_Z + foot_lift))
        c["knee_pole_" + side] = Vector((sign * .30, .69, .82))
        c["wrist_" + side] = Vector((sign * .32, hand_y, .14 + hand_lift))
        c["arm_pole_" + side] = Vector((sign * .44, -.42, .35))
    return c


def frog_hop(t):
    crouch = k.control(.62, .45, .36)
    compressed = k.control(.55, .55, .36)
    launch = k.control(.91, .10, .36)
    high = k.control(1.09, .05, .36)
    land = k.control(.59, .48, .36)
    c = k.timeline([(0, crouch), (.16, compressed), (.28, launch),
                    (.50, high), (.78, land), (1, crouch)], t)
    stride = .70
    if t <= .20:
        y, lift = -stride * t, 0
    elif t >= .80:
        y, lift = stride * (1 - t), 0
    else:
        flight = (t - .20) / .60
        y = -.20 * stride + .40 * stride * k.smooth(flight)
        lift = .26 * math.sin(math.pi * flight)
    for side, sign in (("L", -1), ("R", 1)):
        c["ankle_" + side] = Vector((sign * .36, y, k.ANKLE_Z + lift))
        c["wrist_" + side] = Vector((sign * .27, .35, c["pelvis"].z + .23))
        c["arm_pole_" + side] = Vector((sign * .41, .20, c["pelvis"].z + .27))
    return c


def inchworm(t):
    folded = k.control(.95, 0, .22, body=k.orientation((0, .78, -.626), (0, -.626, -.78)),
                        head=k.orientation((0, .80, -.60), (0, -.60, -.80)))
    plank = k.control(.49, 0, .22, pelvis=Vector((0, .78, .49)),
                      body=k.orientation((0, .938, .346)),
                      head=k.orientation((0, .99, -.14), (0, -.14, -.99)))
    for c in (folded, plank):
        c.update(wrist_L=Vector((-.30, .44 if c is folded else 1.28, .14)),
                 wrist_R=Vector((.30, .44 if c is folded else 1.28, .14)))
    progress = k.smooth(t / .44) if t < .44 else 1 if t <= .56 else k.smooth((1 - t) / .44)
    c = k.blend(folded, plank, progress)
    raw = min(5.999999, progress * 6)
    step, fraction = int(raw), raw % 1
    for side, sign in (("L", -1), ("R", 1)):
        moving = step % 2 == (0 if side == "L" else 1)
        completed = (step + (1 if side == "L" else 0)) // 2
        advance = completed + (k.smooth(fraction) if moving else 0)
        lift = .055 * math.sin(math.pi * fraction) ** 2 if moving else 0
        c["wrist_" + side] = Vector((sign * .30, .44 + .28 * advance, .14 + lift))
        c["arm_pole_" + side] = Vector((sign * .40, .40 + .78 * progress, .34))
    return c


def cat_camel(t):
    c = context.one_knee()
    c["ankle_R"] = Vector((.24, c["ankle_L"].y, k.ANKLE_Z))
    c["knee_pole_R"] = Vector((.24, .06, .14))
    c["foot_R"] = Vector((0, -.258, -.015))
    phase = math.cos(2 * math.pi * t)
    c["body"] = k.orientation((0, .987, .16 + .025 * phase))
    c["head"] = k.orientation((0, .96, -.28 - .12 * phase), (0, -.28 - .12 * phase, -.96))
    c["hips"] = Quaternion((1, 0, 0), .06 * phase)
    c["spineBow"] = Vector((0, .045 * phase, 0))
    return k.hands(c, (-.30, .60, .14), (.30, .60, .14),
                   ((-.40, .45, .34), (.40, .45, .34)))


_FUNCTIONS = {
    "calves": foam_calves, "quads": foam_quads, "hamstrings": foam_hamstrings,
    "upper-back": foam_upper_back, "side-hip": foam_side_hip,
    "hamstring": hamstring, "figure-four": figure_four, "hip-flexor": hip_flexor,
    "supine-twist": supine_twist, "childs-pose": childs_pose,
    "forward-fold": forward_fold, "side-bend": side_bend,
    "lunge-rotation": lunge_rotation, "standing-quad": standing_quad,
    "standing-calf": standing_calf, "bear-crawl": bear_crawl,
    "standing-hamstring": standing_hamstring,
    "bent-knee-calf": bent_knee_calf,
    "crab-walk": crab_walk, "frog-hop": frog_hop,
    "inchworm": inchworm, "cat-camel": cat_camel,
    "cross-chest": cross_chest, "triceps": triceps,
    "seated-figure-four": seated_figure_four, "seated-twist": seated_twist,
}

VARIANTS = {}
for name, a, b, fraction, radius, anchor_y in (
    ("calves", "KNEE_L", "ANKLE_L", .65, .075, .62),
    ("quads", "HIP_L", "KNEE_L", .48, .10, -.20),
    ("hamstrings", "HIP_L", "KNEE_L", .55, .10, .24),
    ("upper-back", "PELVIS", "NECK", .67, .145, -.40),
    ("side-hip", "HIP_L", "KNEE_L", .35, .10, -.20),
):
    VARIANTS[("foam", name)] = {"durationSeconds": 6., "cyclic": True, "floor": True,
        "equipmentAnchor": [0, anchor_y, 0], "rollerRadius": .14,
        "rollerContact": {"bones": [a, b], "fraction": fraction, "surfaceRadius": radius}}
for name in ("hamstring", "figure-four", "hip-flexor", "supine-twist", "childs-pose",
             "forward-fold", "side-bend", "lunge-rotation", "standing-quad", "standing-calf",
             "cross-chest", "triceps", "seated-figure-four", "seated-twist", "standing-hamstring", "bent-knee-calf"):
    VARIANTS[("stretch", name)] = {"durationSeconds": 3., "cyclic": True,
        "floor": name not in ("forward-fold", "side-bend", "standing-quad", "standing-calf", "cross-chest", "triceps", "standing-hamstring", "bent-knee-calf"),
        "static": name != "side-bend"}
for name, duration in (("inchworm", 6.), ("bear-crawl", 2.), ("crab-walk", 2.2), ("frog-hop", 1.6), ("cat-camel", 4.)):
    VARIANTS[("warmup", name)] = {"durationSeconds": duration, "cyclic": True, "floor": True}
for name, stride in (("bear-crawl", .40), ("crab-walk", .36), ("frog-hop", .70)):
    VARIANTS[("warmup", name)].update(strideMeters=stride, travelAxis="y", travelSign=1)
for motion, name in (("foam", "calves"), ("foam", "side-hip"), ("stretch", "figure-four"),
                     ("stretch", "hip-flexor"), ("stretch", "supine-twist"),
                     ("stretch", "lunge-rotation"), ("stretch", "standing-quad"), ("stretch", "standing-calf"),
                     ("stretch", "cross-chest"), ("stretch", "triceps"),
                     ("stretch", "seated-figure-four"), ("stretch", "seated-twist"), ("stretch", "standing-hamstring"),
                     ("stretch", "bent-knee-calf")):
    VARIANTS[(motion, name)]["otherSideVariant"] = name + "-right"
    VARIANTS[(motion, name + "-right")] = {**VARIANTS[(motion, name)], "otherSideVariant": name}
    if "rollerContact" in VARIANTS[(motion, name)]:
        contact = VARIANTS[(motion, name)]["rollerContact"]
        VARIANTS[(motion, name + "-right")]["rollerContact"] = {**contact,
            "bones": [bone[:-1] + ("R" if bone.endswith("L") else "L") for bone in contact["bones"]]}


def build_variant(motion_id, variant_id, t):
    if (motion_id, variant_id) not in VARIANTS:
        raise ValueError(f"Unknown CoachCam mobility variant: {motion_id}.{variant_id}")
    right = variant_id.endswith("-right")
    name = variant_id[:-6] if right else variant_id
    c = _FUNCTIONS[name](max(0., min(1., float(t))))
    return mirror(c) if right else c


def validate():
    samples, max_error, max_floor_miss = 0, 0., 0.
    issues = []
    for (motion, name), metadata in VARIANTS.items():
        for index in range(97):
            c = build_variant(motion, name, index / 96)
            pose = k.solve(c)
            for side in ("L", "R"):
                for a, b, length in (("shoulder", "elbow", .31), ("elbow", "wrist", .27),
                                     ("hip", "knee", .43), ("knee", "ankle", .43)):
                    error = abs((pose[a + "_" + side] - pose[b + "_" + side]).length - length)
                    max_error = max(max_error, error)
                    assert error < .00001, (motion, name, index, "limb length", error)
                for joint in ("wrist", "ankle"):
                    target = c[joint + "_" + side]
                    if target.z < .16:
                        miss = (pose[joint + "_" + side] - target).length
                        max_floor_miss = max(max_floor_miss, miss)
                        if miss > .01:
                            issues.append((name, joint + side, index, round(miss, 4)))
                if pose["wrist_" + side].z < .105:
                    issues.append((name, "wrist below floor", index, round(pose["wrist_" + side].z, 4)))
                if pose["knee_" + side].z < .1399:
                    issues.append((name, "knee below floor", index))
            samples += 1
    if issues:
        # One worst example per action/contact makes authoring errors legible.
        worst = {}
        for issue in issues:
            key = issue[:2]
            if key not in worst or issue[-1] > worst[key][-1]:
                worst[key] = issue
        raise AssertionError(json.dumps(list(worst.values())))
    return {"variantCount": len(VARIANTS), "samples": samples,
            "maxLimbLengthErrorMetres": max_error, "maxFloorTargetMissMetres": max_floor_miss}


if __name__ == "__main__":
    print("COACHCAM_MOBILITY_VARIANTS=" + json.dumps(validate(), sort_keys=True))
