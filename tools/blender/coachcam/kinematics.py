"""CoachCam control-space motion authoring and fixed-length human kinematics.

All coordinates are metres in Blender world space; +Y is the athlete's front.
Interpolation happens on targets, then limbs are solved at EVERY export frame.
This avoids the stretching and disconnected joints caused by interpolating
independent segment transforms between a handful of cartoon key poses.
"""

from __future__ import annotations

import math
from mathutils import Matrix, Quaternion, Vector

LENGTHS = {"TORSO": .60, "HEAD": .27, "UARM": .31, "FARM": .27, "HAND": .15,
           "THIGH": .43, "SHIN": .43, "FOOT": .26}
FLOOR = .035
ANKLE_Z = .155


def orientation(up=(0, 0, 1), front=(0, 1, 0)):
    z = Vector(up).normalized()
    y = Vector(front) - z * Vector(front).dot(z)
    if y.length < .00001:
        y = Vector((0, 0, 1)) - z * z.z
    y.normalize()
    x = y.cross(z).normalized()
    return Matrix((x, z.cross(x), z)).transposed().to_quaternion()


def control(height=.85, lean=.18, width=.30, **kwargs):
    """Balanced bilateral stance; hands and feet are independent world targets."""
    result = {
        "pelvis": Vector((0, 0, height)),
        "body": orientation((0, lean, 1)),
        "head": orientation((0, .025, 1)),
        "hips": Quaternion(),
    }
    for side, sign in (("L", -1), ("R", 1)):
        result["wrist_" + side] = Vector((sign * .25, .37, height + .25))
        result["arm_pole_" + side] = Vector((sign * .65, .10, height + .20))
        result["ankle_" + side] = Vector((sign * width, 0, ANKLE_Z))
        result["knee_pole_" + side] = Vector((sign * width, 1, .55))
        result["foot_" + side] = Vector((sign * .03, .258, -.015))
    result.update(kwargs)
    return result


def copy(c, **kwargs):
    out = {name: value.copy() for name, value in c.items()}
    out.update(kwargs)
    return out


def hands(c, left, right, poles=None):
    c = copy(c, wrist_L=Vector(left), wrist_R=Vector(right))
    if poles:
        c["arm_pole_L"], c["arm_pole_R"] = map(Vector, poles)
    return c


def smooth(t):
    t = max(0., min(1., t))
    return t * t * (3. - 2. * t)


def blend(a, b, t):
    out = {name: (value.slerp(b[name], t) if isinstance(value, Quaternion)
                  else value.lerp(b[name], t)) for name, value in a.items()}
    # A world-space linear wrist/ankle path can pass THROUGH its shoulder/hip
    # during a floor transition or overhead swing. Interpolate reachable limb
    # directions on the sphere instead, transporting the hinge plane with it.
    # This removes the discontinuous minimum-reach clamp and pole reversals.
    for side, sign in (("L",-1),("R",1)):
        fa,fb=a["foot_"+side].normalized(),b["foot_"+side].normalized()
        yaw_a,yaw_b=math.atan2(fa.x,fa.y),math.atan2(fb.x,fb.y)
        delta=(yaw_b-yaw_a+math.pi)%(2*math.pi)-math.pi
        yaw=yaw_a+delta*t
        pitch=math.asin(fa.z)+(math.asin(fb.z)-math.asin(fa.z))*t
        out["foot_"+side]=Vector((math.sin(yaw)*math.cos(pitch),math.cos(yaw)*math.cos(pitch),math.sin(pitch)))
        for target_name,pole_name,rotation,offset,l1,l2,limit in (
            ("wrist_","arm_pole_","body",(sign*.22,0,.50),.31,.27,150),
            ("ankle_","knee_pole_","hips",(sign*.15,0,0),.43,.43,145)):
            target,pole=target_name+side,pole_name+side
            roots=[c["pelvis"]+c[rotation]@Vector(offset) for c in (a,b,out)]
            joint_a,end_a=two_bone(roots[0],a[target],a[pole],l1,l2,limit)
            joint_b,end_b=two_bone(roots[1],b[target],b[pole],l1,l2,limit)
            da,db=end_a-roots[0],end_b-roots[1]
            axis_a,axis_b=da.normalized(),db.normalized()
            turn=axis_a.rotation_difference(axis_b)
            axis=Quaternion().slerp(turn,t)@axis_a
            reach=da.length+(db.length-da.length)*t
            out[target]=roots[2]+axis*reach
            # Loaded soles remain on their explicit court target. No change
            # of pelvis height or torso lean may lift a planted support foot.
            if target_name=="ankle_" and (
                (a[target]-b[target]).length<.0001 or
                (abs(a[target].z-ANKLE_Z)<.0001 and abs(b[target].z-ANKLE_Z)<.0001)):
                out[target]=a[target].lerp(b[target],t)
                axis=(out[target]-roots[2]).normalized()
            bend_a=joint_a-roots[0]-axis_a*(joint_a-roots[0]).dot(axis_a)
            bend_b=joint_b-roots[1]-axis_b*(joint_b-roots[1]).dot(axis_b)
            bend_a=axis_a.rotation_difference(axis)@bend_a.normalized()
            bend_b=axis_b.rotation_difference(axis)@bend_b.normalized()
            angle=math.atan2(axis.dot(bend_a.cross(bend_b)),bend_a.dot(bend_b))
            bend=Quaternion(axis,angle*t)@bend_a
            out[pole]=roots[2]+bend*.65
    return out


def timeline(keys, t):
    for (at, a), (bt, b) in zip(keys, keys[1:]):
        if t <= bt:
            return blend(a, b, smooth((t - at) / max(.00001, bt - at)))
    return copy(keys[-1][1])


def two_bone(root, target, pole, a, b, max_flex, minimum_joint_z=None):
    """Analytic two-bone IK, with a nonzero bend and bounded hinge flexion."""
    line = target - root
    if line.length < .00001:
        line = Vector((0, 0, -1))
    axis = line.normalized()
    min_d = math.sqrt(a*a + b*b + 2*a*b*math.cos(math.radians(max_flex)))
    max_d = math.sqrt(a*a + b*b + 2*a*b*math.cos(math.radians(3)))
    d = min(max_d, max(min_d, line.length))
    end = root + axis * d
    pole_delta = pole - root
    bend = pole_delta - axis * pole_delta.dot(axis)
    if bend.length < .00001:
        fallback = Vector((0, 1, 0)) if abs(axis.y) < .95 else Vector((1, 0, 0))
        bend = fallback - axis * fallback.dot(axis)
    bend.normalize()
    along = (a*a - b*b + d*d) / (2*d)
    height = math.sqrt(max(0, a*a - along*along))
    joint = root + axis * along + bend * height
    if minimum_joint_z is not None and joint.z < minimum_joint_z:
        # Rotate within the valid hinge circle to respect the court contact
        # plane. This preserves both segment lengths instead of lifting a
        # knee landmark independently or allowing kneepads through the floor.
        center=root+axis*along
        upper=Vector((0,0,1))-axis*axis.z
        if upper.length>.00001 and height>.00001:
            upper.normalize()
            lateral=axis.cross(upper).normalized()
            cosine=min(1.,max(-1.,(minimum_joint_z-center.z)/(height*upper.z)))
            sign=1 if bend.dot(lateral)>=0 else -1
            bend=upper*cosine+lateral*(sign*math.sqrt(max(0,1-cosine*cosine)))
            joint=center+bend*height
    return joint, end


def solve(c):
    pelvis, body, hips = c["pelvis"], c["body"], c["hips"]
    result = {"pelvis": pelvis.copy(), "neck": pelvis + body @ Vector((0, 0, .60))}
    result["head_top"] = result["neck"] + c["head"] @ Vector((0, 0, .27))
    for side, sign in (("L", -1), ("R", 1)):
        shoulder = pelvis + body @ Vector((sign * .22, 0, .50))
        hip = pelvis + hips @ Vector((sign * .15, 0, 0))
        elbow, wrist = two_bone(shoulder, c["wrist_" + side], c["arm_pole_" + side], .31, .27, 150)
        knee, ankle = two_bone(hip, c["ankle_" + side], c["knee_pole_" + side], .43, .43, 145, .14)
        result.update({"shoulder_" + side: shoulder, "hip_" + side: hip,
                       "elbow_" + side: elbow, "wrist_" + side: wrist,
                       "knee_" + side: knee, "ankle_" + side: ankle,
                       "toe_" + side: ankle + c["foot_" + side].normalized() * .26})
        # Articulated wrists: support palms lie along the court; raised hands
        # extend the reach. The old hand mesh inherited forearm tilt and drove
        # its fingers into the court in every hands-down support pose.
        hand_axis = (wrist-elbow).normalized()
        low=smooth((.36-wrist.z)/.16)
        high=smooth((wrist.z-shoulder.z-.04)/.36)
        hand_axis=hand_axis.lerp(Vector((0,1,0)),low).normalized()
        hand_axis=hand_axis.lerp(Vector((0,.13,.992)),high).normalized()
        result["hand_tip_" + side] = wrist + hand_axis*.15
    return result


def standing():
    c = control(.96, .025, .22)
    return hands(c, (-.29, .08, .96), (.29, .08, .96))


def ready(low=0.):
    return control(.84 - .16 * low, .22 + .15 * low, .32)


def platform(low=.2, side=0., one=False):
    c = ready(low)
    c["pelvis"].x = .10 * side
    z = c["pelvis"].z + .12
    # Wrists join in front of the body. Elbows lie on the nearly straight
    # shoulder-to-wrist platform; knees provide the lift, not an arm swing.
    c = hands(c, (.18*side-.045, .54, z), (.18*side+.045, .54, z),
              ((-.34, .36, z+.12), (.34, .36, z+.12)))
    if one:
        c["wrist_R"] = Vector((.40, .58, z-.08))
        c["wrist_L"] = Vector((-.35, .26, z+.18))
    return c


def overhead(c, extension=0., block=False):
    p = c["pelvis"]
    # The set window is above the forehead; extension finishes at actual reach.
    y = .25 if not block else .22
    width = .14 if not block else .25
    z = p.z + .82 + .21 * extension
    return hands(c, (-width, y, z), (width, y, z),
                 ((-.55, .18, p.z+.70), (.55, .18, p.z+.70)))


def airborne(height=.30, arms="up"):
    c = control(.98 + height, .035, .24)
    for side in ("L", "R"):
        c["ankle_" + side].z += height + .03
        c["foot_" + side] = Vector((0, .245, -.087))
    if arms == "up":
        c = overhead(c, .94, True)
    return c


def translated(c, offset):
    c = copy(c)
    for name in ("pelvis", "wrist_L", "wrist_R", "arm_pole_L", "arm_pole_R",
                 "ankle_L", "ankle_R", "knee_pole_L", "knee_pole_R"):
        c[name] += Vector(offset)
    return c


def box_states():
    """Right lead onto a 32cm platform; the support leg lifts the body."""
    floor = control(.87,.08,.23)
    place = copy(floor)
    place["pelvis"].y=.08
    place["ankle_R"]=Vector((.23,.47,ANKLE_Z+.32))
    transfer=copy(place)
    transfer["pelvis"]=Vector((0,.28,1.03))
    transfer["ankle_L"]=Vector((-.23,.12,.25))
    top=translated(control(.93,.04,.23),(0,.62,.32))
    return floor,place,transfer,top


def backswing():
    c = ready(.62)
    z = c["pelvis"].z
    return hands(c, (-.27, -.30, z+.02), (.27, -.30, z+.02),
                 ((-.38, -.20, z+.20), (.38, -.20, z+.20)))


def hit(c, phase):
    p = c["pelvis"]
    if phase == "draw":
        return hands(c, (-.20, .25, p.z+.92), (.31, -.24, p.z+.84),
                     ((-.45, .18, p.z+.65), (.62, -.14, p.z+.63)))
    if phase == "contact":
        return hands(c, (-.27, .25, p.z+.33), (.18, .28, p.z+1.02),
                     ((-.43, .18, p.z+.30), (.38, .10, p.z+.78)))
    return hands(c, (-.27, .27, p.z+.24), (-.06, .47, p.z+.29),
                 ((-.40, .15, p.z+.25), (.37, .32, p.z+.48)))


def prone(reach=True, pancake=False):
    c = control(.255, 0, .23,
                body=orientation((0, .996, .085), (0, .085, -.996)),
                head=orientation((0, .90, .44), (0, .44, -.90)))
    for side, sign in (("L", -1), ("R", 1)):
        c["ankle_" + side] = Vector((sign*.23, -.69, .58))
        c["knee_pole_" + side] = Vector((sign*.24, -.48, .10))
        c["foot_" + side] = Vector((0, -.25, -.07))
    if reach:
        c = hands(c, (-.16, 1.02, .26), (.16, 1.02, .26),
                  ((-.38, .72, .32), (.38, .72, .32)))
    else:
        c = hands(c, (-.38, .58, .15), (.38, .58, .15),
                  ((-.53, .30, .33), (.53, .30, .33)))
    if pancake:
        c["wrist_R"] = Vector((.20, 1.02, .105))
        c["wrist_L"] = Vector((-.39, .58, .26))
    return c


def kneeling():
    c = control(.53, .20, .23)
    c["ankle_L"] = Vector((-.24, -.32, .17))
    c["ankle_R"] = Vector((.25, .34, .155))
    c["knee_pole_L"] = Vector((-.24, .10, .08))
    c["knee_pole_R"] = Vector((.25, .8, .4))
    c["foot_L"] = Vector((0, -.25, -.02))
    return hands(c, (-.25, .25, .65), (.28, .35, .70))


def all_fours():
    c = control(.56, 0, .23,
                body=orientation((0, .97, -.24), (0, -.24, -.97)),
                head=orientation((0, .97, .24), (0, .24, -.97)))
    for side, sign in (("L", -1), ("R", 1)):
        c["ankle_" + side] = Vector((sign*.24, -.35, .18))
        c["knee_pole_" + side] = Vector((sign*.24, .14, -.30))
        c["foot_" + side] = Vector((0, -.25, -.02))
    return hands(c, (-.30, .66, .14), (.30, .66, .14),
                 ((-.40, .55, .25), (.40, .55, .25)))


def side_roll(sign, phase):
    # Progress across a shoulder and flank into a tucked seated base. Neck
    # remains in line with the trunk, lifted away from the contact surface.
    angle = math.radians(phase * 90)
    body = orientation((sign*.20, .978, .07+.11*phase),
                       (sign*math.cos(angle), 0, math.sin(angle)))
    height=.285-.10*phase
    c = control(height, 0, .25, body=body,
                head=orientation((sign*.20, .85, .48)),
                hips=body.copy(),
                pelvis=Vector((sign*.13, .10, height)))
    for side, s in (("L", -1), ("R", 1)):
        # Keep the feet behind the pelvis during descent. Targets passing
        # within 3cm of the hip caused the old IK reach axis to reverse.
        c["ankle_" + side] = Vector((sign*.10+s*.20, -.32, .44))
        c["knee_pole_" + side] = Vector((sign*.32+s*.12, .25, .95))
        c["foot_" + side] = Vector((0, .25, .04))
    return hands(c, (sign*.15-.14, .83, .62), (sign*.15+.14, .83, .62),
                 ((-.48, .50, .65), (.48, .50, .65)))


def roll_exit(sign):
    c=control(.43,.25,.25,pelvis=Vector((sign*.06,.08,.43)))
    c["ankle_L"]=Vector((-.26,-.30,.155))
    c["ankle_R"]=Vector((.26,.34,.155))
    return hands(c,(-.24,.42,.79),(.24,.42,.79))


def bridge(lift):
    z = .25 + .24*lift
    neck_z = .275
    dy = -math.sqrt(.60**2 - (neck_z-z)**2)
    c = control(z, 0, .24,
                body=orientation((0, dy, neck_z-z), (0, 0, 1)),
                head=orientation((0, -.995, -.10), (0, -.10, .995)))
    for side, sign in (("L", -1), ("R", 1)):
        c["ankle_" + side] = Vector((sign*.24, .50, .155))
        c["knee_pole_" + side] = Vector((sign*.24, .65, .9))
        c["foot_" + side] = Vector((0, .26, -.015))
    return hands(c, (-.39, -.12, .14), (.39, -.12, .14),
                 ((-.46, -.42, .15), (.46, -.42, .15)))


def foam(t):
    c = control(.44, -.12, .23, pelvis=Vector((0, .055*math.sin(t*2*math.pi), .44)))
    for side, sign in (("L", -1), ("R", 1)):
        c["ankle_" + side] = Vector((sign*.22, .78, .31))
        c["knee_pole_" + side] = Vector((sign*.22, .40, .75))
        c["foot_" + side] = Vector((0, .17, .197))
    return hands(c, (-.34, -.18, .17), (.34, -.18, .17),
                 ((-.43, -.12, .35), (.43, -.12, .35)))


def gait(t, kind):
    # One full left/right gait cycle. The planted foot travels backwards at a
    # uniform speed while the unloaded foot clears the court in swing phase.
    theta = 2*math.pi*t
    c = control(.91 + .025*math.cos(2*theta), .12 if kind != "backpedal" else -.035, .20)
    stride = .24 if kind == "ladder" else .32
    direction = -1 if kind == "backpedal" else 1
    for side, sign in (("L", -1), ("R", 1)):
        p = (t + (0 if side == "L" else .5)) % 1
        if p < .60:
            y = stride * (1-2*p/.60)
            z = ANKLE_Z
        else:
            swing = (p-.60)/.40
            y = stride * (-1+2*smooth(swing))
            z = ANKLE_Z + (.20 if kind == "ladder" else .16)*math.sin(math.pi*swing)
        c["ankle_"+side] = Vector((sign*.19, y*direction, z))
        arm_y = -.23 * math.cos(2*math.pi*p) * direction
        c["wrist_"+side] = Vector((sign*.27, .17+arm_y, 1.18))
        c["arm_pole_"+side] = Vector((sign*.37, arm_y-.10, 1.06))
    return c


def shuffle(t, band=False):
    c = ready(.25 if not band else .36)
    # Step out then bring the trail foot in; neither crosses the midline.
    keys = [(0, -.28, .28), (.25, -.47, .28), (.5, -.47, .47),
            (.75, -.28, .47), (1, -.28, .28)]
    for (at, al, ar), (bt, bl, br) in zip(keys, keys[1:]):
        if t <= bt:
            u = smooth((t-at)/(bt-at))
            for side, start, end in (("L", al, bl), ("R", ar, br)):
                c["ankle_"+side].x = start+(end-start)*u
                c["ankle_"+side].z = ANKLE_Z + (.035 if abs(end-start)>.01 else 0)*math.sin(math.pi*u)
            break
    c["pelvis"].x = (c["ankle_L"].x+c["ankle_R"].x)*.5
    return c


CYCLIC = {"ready", "defensive-ready", "admin", "sprint", "shuffle", "backpedal",
          "ladder", "mini-band", "jump-rope", "bridge", "band", "band-upper",
          "warmup", "foam", "stretch", "recovery"}
CONTACTS = {
    "pass": (.50, "platform"), "platform-save": (.50, "platform"),
    "dig": (.50, "platform"), "set": (.56, "two-hands"),
    "feed": (.55, "two-hands"), "low-toss": (.55, "two-hands"),
    "serve": (.55, "right-hand"), "underhand": (.55, "right-hand"),
    "attack": (.55, "right-hand"), "down-ball-hit": (.55, "right-hand"),
    "jump-float": (.55, "right-hand"), "jump-topspin": (.55, "right-hand"),
    "tip-roll": (.55, "right-hand"), "box-hit": (.55, "right-hand"),
    "block": (.55, "two-hands"), "box-block": (.55, "two-hands"),
    "one-arm-save": (.60, "right-hand"), "sprawl": (.32, "platform"),
    "chest-hip-sprawl": (.32, "platform"), "run-through": (.50, "platform"),
    "shoulder-roll-right": (.24, "platform"), "shoulder-roll-left": (.24, "platform"),
    "mat-defense": (.24, "platform"), "medicine": (.55, "two-hands"),
    "medicine-slam": (.58, "two-hands"), "medicine-scoop": (.58, "two-hands"),
    "medicine-rotate": (.58, "two-hands"),
}


def sample_control(motion, t):
    t = max(0, min(1, t))
    r, st = ready(), standing()
    if motion in ("sprint", "backpedal", "ladder"):
        return gait(t, motion)
    if motion in ("shuffle", "mini-band"):
        return shuffle(t, motion == "mini-band")
    if motion in ("ready", "defensive-ready", "admin", "recovery"):
        c = st if motion in ("admin", "recovery") else r
        c["pelvis"].z += .006*math.sin(2*math.pi*t)
        return c
    if motion in ("pass", "dig", "platform-save"):
        low = .70 if motion == "dig" else .28
        return timeline([(0, r), (.28, platform(low)), (.5, platform(low-.12)),
                         (.65, platform(low-.22)), (1, r)], t)
    if motion == "set":
        return timeline([(0, r), (.28, overhead(ready(.30))),
                         (.56, overhead(ready(.10), .45)), (.74, overhead(st, 1)), (1, r)], t)
    if motion in ("feed", "low-toss"):
        low = hands(st, (-.10, .37, 1.07), (.10, .37, 1.07))
        release = hands(st, (-.11, .49, 1.34), (.11, .49, 1.34))
        return timeline([(0, st), (.25, low), (.55, release), (.7, release), (1, st)], t)
    if motion == "underhand":
        start = hands(st, (-.08, .42, 1.10), (.25, -.30, .99))
        contact = hands(st, (-.15, .32, 1.17), (.10, .47, 1.08))
        follow = hands(st, (-.20, .25, 1.2), (.19, .51, 1.37))
        return timeline([(0, st), (.28, start), (.55, contact), (.72, follow), (1, st)], t)
    if motion in ("box", "box-hit", "box-block", "depth-drop"):
        floor,place,transfer,top=box_states()
        if motion=="depth-drop":
            # Both feet begin on the platform. Step off its front edge and
            # absorb the descent with hips/knees; do not jump up from the box.
            edge=copy(top)
            edge["pelvis"].y=.93
            edge["ankle_R"]=Vector((.23,1.13,ANKLE_Z+.30))
            flight=translated(control(.96,.05,.23),(0,1.22,.14))
            for side in ("L","R"):
                flight["ankle_"+side].z+=.14
            landing=translated(ready(.72),(0,1.22,0))
            finish=translated(r,(0,1.22,0))
            return timeline([(0,top),(.20,edge),(.43,flight),(.63,landing),(1,finish)],t)
        if motion=="box-hit":
            draw=translated(hit(standing(),"draw"),(0,.62,.32))
            action=translated(hit(standing(),"contact"),(0,.62,.32))
            follow=translated(hit(standing(),"follow"),(0,.62,.32))
        elif motion=="box-block":
            draw=translated(overhead(control(.86,.03,.23),.15,True),(0,.62,.32))
            action=translated(overhead(control(.96,.02,.23),.9,True),(0,.62,.32))
            follow=top
        else:
            draw=action=follow=top
        return timeline([(0,floor),(.13,place),(.27,transfer),(.34,top),
                         (.46,draw),(.55,action),(.64,follow),(.72,top),
                         (.82,transfer),(.91,place),(1,floor)],t)
    if motion in ("serve", "jump-float", "jump-topspin", "attack", "down-ball-hit",
                  "free-arm-swing", "band-arm-swing", "tip-roll"):
        jumping = motion in ("attack", "jump-float", "jump-topspin", "tip-roll")
        high = airborne(.27 if motion != "jump-topspin" else .34) if jumping else st
        draw = hit(airborne(.14) if jumping else st, "draw")
        contact = hit(high, "contact")
        follow = hit(airborne(.17) if jumping else st, "follow")
        return timeline([(0, r), (.14, backswing() if jumping else hit(st,"draw")),
                         (.40, draw), (.55, contact), (.69, follow), (.83, ready(.62)), (1, r)], t)
    if motion in ("block", "jump", "power", "approach-jump"):
        height = .33
        peak = airborne(height)
        launch = overhead(ready(.50), .1, True) if motion=="block" else backswing()
        return timeline([(0,r), (.16,launch), (.43,airborne(.10)), (.55,peak),
                         (.70,airborne(.14)), (.84,ready(.66)), (1,r)], t)
    if motion == "jump-rope":
        lift = .065 * max(0, math.sin(4*math.pi*t))
        c = control(.91+lift, .02, .20)
        for side in ("L","R"):
            c["ankle_"+side].z += lift
        return hands(c, (-.40,.12,1.04+lift), (.40,.12,1.04+lift))
    if motion == "run-through":
        return timeline([(0,gait(0,"sprint")), (.25,gait(.35,"sprint")),
                         (.5,platform(.50)), (.73,gait(.65,"sprint")), (1,gait(1,"sprint"))],t)
    if motion in ("one-arm-save", "sprawl", "chest-hip-sprawl"):
        low = platform(.95, one=motion=="one-arm-save")
        land = prone(True, motion=="one-arm-save")
        return timeline([(0,r), (.18,ready(.60)), (.35 if motion=="one-arm-save" else .32,low), (.52,land),
                         (.73,land), (.88,prone(False)), (1,prone(False))],t)
    if motion in ("shoulder-roll-right","shoulder-roll-left","mat-defense"):
        side = -1 if motion=="shoulder-roll-left" else 1
        return timeline([(0,r), (.24,platform(.9,side)), (.43,side_roll(side,0)),
                         (.56,side_roll(side,1)), (.70,roll_exit(side)), (.82,kneeling()), (1,r)],t)
    if motion == "floor-recovery":
        return timeline([(0,prone(False)), (.20,all_fours()), (.52,kneeling()),
                         (.78,ready(.75)), (1,r)], t)
    if motion == "bridge":
        return bridge(smooth((1-math.cos(2*math.pi*t))*.5))
    if motion == "foam":
        return foam(t)
    if motion in ("band", "band-upper"):
        phase = (1-math.cos(2*math.pi*t))*.5
        if motion == "band":
            return hands(st, (-.20,.24,1.17), (.21+.21*phase,.28-.10*phase,1.18),
                         ((-.33,.02,1.19),(.33,.01,1.19)))
        return hands(st, (-.16-.26*phase,.40-.14*phase,1.45),
                     (.16+.26*phase,.40-.14*phase,1.45),
                     ((-.50,.11,1.37),(.50,.11,1.37)))
    if motion.startswith("medicine"):
        held = hands(r, (-.15,.43,1.17),(.15,.43,1.17))
        if motion == "medicine-slam":
            draw = overhead(st,.65)
            release = hands(ready(.50),(-.15,.48,.97),(.15,.48,.97))
        elif motion == "medicine-scoop":
            draw = hands(ready(.72),(-.15,.38,.86),(.15,.38,.86))
            release = hands(st,(-.15,.50,1.39),(.15,.50,1.39))
        elif motion == "medicine-rotate":
            draw = hands(r,(-.42,.26,1.18),(-.18,.34,1.18))
            release = hands(r,(.18,.34,1.18),(.42,.26,1.18))
        else:
            draw = held
            release = hands(st,(-.15,.53,1.37),(.15,.53,1.37))
        return timeline([(0,held),(.28,draw),(.58,release),(.73,release),(1,held)],t)
    if motion == "signal":
        raised = hands(st,(-.29,.08,.96),(.26,.08,1.94))
        return timeline([(0,st),(.3,raised),(.75,raised),(1,st)],t)
    if motion in ("stretch","warmup"):
        if motion == "warmup":
            return gait(t,"ladder")
        # Controlled lateral weight shift, knee tracking over the loaded foot.
        side = math.sin(2*math.pi*t)
        c = control(.79,.12,.49,pelvis=Vector((.13*side,0,.79)))
        return hands(c,(-.28,.20,1.05),(.28,.20,1.05))
    raise ValueError("Unimplemented motion: " + motion)


def sample(motion, t):
    return solve(sample_control(motion, t))
