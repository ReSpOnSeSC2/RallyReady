"""Distinct, contact-authored footwork programs for CoachCam training scenes.

Metres, Blender +Y forward. Each travelling cycle ends one stride farther along
the floor. Root travel is subtracted from planted foot targets so the runtime's
distance-sampled playback keeps support soles fixed instead of skating.
"""
from __future__ import annotations
import math
import sys
from pathlib import Path
from mathutils import Vector
HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))
import kinematics as k


VARIANTS = {}
def register(motion, name, duration, stride=None, axis="Y", **settings):
    settings.update(durationSeconds=duration, cyclic=True)
    if stride is not None:
        settings.update(strideMeters=stride, travelAxis=axis.lower(), travelSign=1,
                        mirrorForReverse=axis == "X")
    VARIANTS[(motion, name)] = settings

register("ladder", "two-in", 1.25, .50)
register("ladder", "in-out", 2.0, .50)
register("ladder", "icky", 2.7, 1.0)
register("ladder", "hopscotch", 1.5, .50)
register("ladder", "lateral-in-out", 3.3, 1.0, "X")
register("ladder", "lateral-two-in-one-out", 2.7, 1.0, "X")
for name in ("two-foot", "alternate", "right-foot", "left-foot"):
    register("jump-rope", name, 1.25)
register("mini-band", "squat", 2.8)
register("warmup", "high-knees", 1.7, .70)
register("warmup", "heel-kicks", 1.7, .70)
register("warmup", "walking-lunge", 3.5, .65)
register("warmup", "side-lunge", 3.5, .65, "X")
register("warmup", "carioca", 3.1, 1.5, "X")
register("warmup", "leg-swing-front", 4.0)
register("warmup", "leg-swing-side", 4.0)
register("warmup", "knee-pull", 4.0)
register("warmup", "heel-pull", 4.0)
register("warmup", "floor-touch", 2.4)
register("set", "balloon-walk", 1.25, .40, contactProgress=.56, contactType="fingertips")


def stepped(t, initial, events, stride, axis="Y", height=.76, lift=.075):
    """Explicit ordered foot placements; each event has exactly one swing foot."""
    root = Vector((stride * t if axis == "X" else 0,
                   stride * t if axis == "Y" else 0, 0))
    feet = {side: Vector((xy[0], xy[1], k.ANKLE_Z)) for side, xy in initial.items()}
    for side, start, end, destination in events:
        if t <= start:
            continue
        target = Vector((destination[0], destination[1], k.ANKLE_Z))
        p = min(1., max(0., (t - start) / (end - start)))
        feet[side] = feet[side].lerp(target, k.smooth(p))
        feet[side].z += lift * math.sin(math.pi * p) ** 2
    centre = (feet["L"] + feet["R"]) * .5 - root
    c = k.control(height, .19, .20,
                  pelvis=Vector((centre.x, centre.y, height)))
    for side, sign in (("L", -1), ("R", 1)):
        c["ankle_" + side] = feet[side] - root
        c["knee_pole_" + side] = Vector((centre.x + sign * .30, centre.y + .90, .55))
        c["wrist_" + side] += Vector((centre.x, centre.y, 0))
        c["arm_pole_" + side] += Vector((centre.x, centre.y, 0))
    return c


def ladder(name, t):
    narrow = {"L": (-.14, 0), "R": (.14, 0)}
    if name == "two-in":
        return stepped(t, narrow, [("R", .05, .42, (.14, .5)),
                                  ("L", .54, .92, (-.14, .5))], .5)
    if name == "in-out":
        initial = {"L": (-.38, 0), "R": (.38, 0)}
        return stepped(t, initial, [("R", .02, .21, (.13, .50)),
            ("L", .27, .46, (-.13, .50)), ("R", .52, .71, (.38, .5)),
            ("L", .77, .96, (-.38, .5))], .5, height=.72)
    if name in ("icky", "lateral-two-in-one-out"):
        events = [("L", .01, .14, (-.38, .20)), ("R", .18, .31, (.13, .50)),
                  ("L", .35, .48, (-.13, .50)), ("R", .52, .65, (.38, .70)),
                  ("L", .69, .82, (-.14, 1.0)), ("R", .86, .99, (.14, 1.0))]
        if name == "lateral-two-in-one-out":
            initial = {"L": (-.14, -.38), "R": (.14, -.38)}
            lateral = [("R", .01, .12, (.64, 0)), ("L", .15, .26, (.36, 0)),
                       ("R", .29, .40, (.64, .38)), ("L", .43, .54, (.86, 0)),
                       ("R", .57, .68, (1.14, 0)), ("L", .71, .82, (.86, -.38)),
                       ("R", .85, .96, (1.14, -.38))]
            return stepped(t, initial, lateral, 1., "X", .73)
        return stepped(t, narrow, events, 1., height=.73)
    if name == "lateral-in-out":
        # Two lead/follow crossings of the ladder, advancing one metre along
        # its length. Chest remains forward; the movement axis is local +X.
        initial = {"L": (-.14, -.38), "R": (.14, -.38)}
        events = [("R", .01, .10, (.64, 0)), ("L", .13, .22, (.36, 0)),
                  ("R", .25, .34, (.64, .38)), ("L", .37, .46, (.36, .38)),
                  ("R", .51, .60, (1.14, 0)), ("L", .63, .72, (.86, 0)),
                  ("R", .75, .84, (1.14, -.38)), ("L", .87, .96, (.86, -.38))]
        return stepped(t, initial, events, 1., "X", .72)
    # Hopscotch is a two-foot jump into a narrow box, then a two-foot straddle
    # outside the next rung. Body and both soles share the airborne lift.
    wide = .14 + .23 * math.sin(math.pi * t) ** 2
    p = (t * 2) % 1
    progress = .5 * (math.floor(t * 2) + k.smooth(p))
    if t >= 1:
        progress = 1
    lift = .09 * math.sin(math.pi * p) ** 2
    y = .5 * progress - .5 * t
    c = k.control(.76 + lift, .19, wide, pelvis=Vector((0, y, .76 + lift)))
    for side, sign in (("L", -1), ("R", 1)):
        c["ankle_" + side] = Vector((sign * wide, y, k.ANKLE_Z + lift))
        c["wrist_" + side].y += y
        c["arm_pole_" + side].y += y
    return c


def rope(name, t):
    lift = .055 * max(0., math.sin(4 * math.pi * t))
    # The loaded knee compresses between hops; a tucked free foot never
    # masquerades as a second support contact in the single-leg drills.
    c = k.control(.86 + lift, .035, .18)
    for side in ("L", "R"):
        c["ankle_" + side].z += lift
    if name in ("right-foot", "left-foot"):
        support = "R" if name == "right-foot" else "L"
        free = "L" if support == "R" else "R"
        c["pelvis"].x = .10 if support == "R" else -.10
        c["ankle_" + free].z += .25
        c["ankle_" + free].y = -.14
    elif name == "alternate":
        sign = math.cos(2 * math.pi * t)
        c["ankle_L"].z += .20 * max(0., sign)
        c["ankle_R"].z += .20 * max(0., -sign)
        c["pelvis"].x = .07 * sign
    arm_lift = .016 * math.sin(4 * math.pi * t)
    return k.hands(c, (-.37, .10, .99 + lift + arm_lift), (.37, .10, .99 + lift + arm_lift))


def squat(t):
    load = math.sin(math.pi * t) ** 2
    height = .86 - .32 * load
    c = k.control(height, .08 + .30 * load, .30,
                  pelvis=Vector((0, -.16 * load, height)))
    return k.hands(c, (-.22, .30, height + .28), (.22, .30, height + .28))


def warmup(name, t):
    if name == "floor-touch":
        start = k.control(.73, .30, .38)
        low = k.control(.34, 2.1, .38, pelvis=Vector((0, -.20, .34)))
        low = k.hands(low, (-.18, .35, .08), (.18, .35, .08),
                      ((-.42, .30, .42), (.42, .30, .42)))
        return k.timeline([(0, start), (.40, low), (.60, low), (1, start)], t)
    if name in ("high-knees", "heel-kicks"):
        c = stepped(t, {"L": (-.18, 0), "R": (.18, 0)},
                    [("R", .04, .44, (.18, .7)), ("L", .54, .94, (-.18, .7))], .7,
                    height=.88, lift=.32 if name == "high-knees" else .36)
        if name == "heel-kicks":
            for side, start, end in (("R", .04, .44), ("L", .54, .94)):
                p = max(0., min(1., (t-start)/(end-start)))
                c["ankle_" + side].y -= .32 * math.sin(math.pi*p)**2
        return c
    if name in ("walking-lunge", "side-lunge"):
        side = name == "side-lunge"
        initial = {"L": (-.20, 0), "R": (.20, 0)}
        events = [("R", .02, .22, (.85, 0) if side else (.20, .65)),
                  ("L", .75, .96, (.45, 0) if side else (-.20, .65))]
        load = math.sin(math.pi * k.smooth((t-.15)/.65))**2
        return stepped(t, initial, events, .65, "X" if side else "Y",
                       height=.82-.30*load, lift=.065)
    if name == "carioca":
        return stepped(t, {"L": (-.20, 0), "R": (.20, 0)},
            [("L", .02, .18, (.50, .24)), ("R", .22, .38, (.90, 0)),
             ("L", .42, .58, (1.15, -.24)), ("R", .62, .78, (1.70, 0)),
             ("L", .82, .98, (1.30, 0))], 1.5, "X", height=.73, lift=.11)
    c = k.control(.87, .04, .20)
    half = min(1, int(t * 2))
    p = t * 2 - half
    active, support = ("R", "L") if half == 0 else ("L", "R")
    sign = 1 if active == "R" else -1
    envelope = math.sin(math.pi * p) ** 2
    c["pelvis"].x = -sign * .10 * envelope
    if name == "leg-swing-front":
        c["ankle_" + active].y = .46 * math.sin(2 * math.pi*p) * math.sin(math.pi*p)
        c["ankle_" + active].z += .18 * envelope
    elif name == "leg-swing-side":
        c["ankle_" + active].x += sign * .38 * envelope
        c["ankle_" + active].z += .18 * envelope
    elif name == "knee-pull":
        c["ankle_" + active].y += .23 * envelope
        c["ankle_" + active].z += .39 * envelope
        c["wrist_" + active] = c["wrist_" + active].lerp(Vector((sign*.20, .44, 1.01)), envelope)
        c["wrist_" + support] = c["wrist_" + support].lerp(Vector((sign*.09, .43, 1.01)), envelope)
    elif name == "heel-pull":
        c["ankle_" + active].y -= .27 * envelope
        c["ankle_" + active].z += .38 * envelope
        c["wrist_" + active] = c["wrist_" + active].lerp(Vector((sign*.24, -.28, .62)), envelope)
    return c


def build_variant(motion_id, variant_id, t):
    t = min(1., max(0., t))
    if variant_id == "balloon-walk":
        c = stepped(t, {"L": (-.18, 0), "R": (.18, 0)},
                    [("R", .03, .42, (.18, .40)), ("L", .55, .95, (-.18, .40))], .40, height=.87, lift=.055)
        reach = math.sin(math.pi * t) ** 2
        centre = c["pelvis"].y
        return k.hands(c, (-.22, centre + .28, 1.40 + .27 * reach),
                       (.22, centre + .28, 1.40 + .27 * reach))
    if motion_id == "ladder":
        return ladder(variant_id, t)
    if motion_id == "jump-rope":
        return rope(variant_id, t)
    if motion_id == "mini-band":
        return squat(t)
    return warmup(variant_id, t)


def validate():
    max_support_error = 0
    samples = 0
    for (motion, variant), settings in VARIANTS.items():
        first = k.solve(build_variant(motion, variant, 0))
        last = k.solve(build_variant(motion, variant, 1))
        seam = max((first[name]-last[name]).length for name in first)
        assert seam < .008, (motion, variant, "loop seam", seam)
        for i in range(241):
            t = i / 240
            c = build_variant(motion, variant, t)
            p = k.solve(c)
            samples += 1
            assert all(math.isfinite(v) for point in p.values() for v in point), (motion, variant, t)
            for side in ("L", "R"):
                ankle = p["ankle_" + side]
                toe = p["toe_" + side]
                assert min(ankle.z, toe.z) >= .055, (motion, variant, t, "floor", ankle, toe)
                if abs(c["ankle_"+side].z-k.ANKLE_Z) < .00001:
                    error = (ankle-c["ankle_"+side]).length
                    max_support_error = max(max_support_error, error)
                    assert error < .006, (motion, variant, t, "support target unreachable", error)
    print(f"Locomotion variants: {len(VARIANTS)} variants, {samples} samples; support error {max_support_error:.6f}m")


if __name__ == "__main__":
    validate()
