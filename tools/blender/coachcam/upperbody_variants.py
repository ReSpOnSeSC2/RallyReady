"""Specific shoulder-band actions and one-foot slide attack controls."""
from __future__ import annotations
import math
import json
import sys
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0,str(HERE))
import kinematics as k


VARIANTS = {
    ("band", "band-external-right"): {"durationSeconds":2.,"cyclic":True,"bandMode":"rotation","workingHand":"right","bandAnchor":[-.55,.22,1.13]},
    ("band", "band-external-left"): {"durationSeconds":2.,"cyclic":True,"bandMode":"rotation","workingHand":"left","bandAnchor":[.55,.22,1.13]},
    ("band", "band-internal-right"): {"durationSeconds":2.,"cyclic":True,"bandMode":"rotation","workingHand":"right","bandAnchor":[.80,.15,1.13]},
    ("band", "band-internal-left"): {"durationSeconds":2.,"cyclic":True,"bandMode":"rotation","workingHand":"left","bandAnchor":[-.80,.15,1.13]},
    ("band-upper", "band-pull-apart"): {"durationSeconds":2.,"cyclic":True,"bandMode":"between-hands"},
    ("band-upper", "band-row"): {"durationSeconds":2.,"cyclic":True,"bandMode":"front-anchor","bandAnchor":[0,1.35,1.30]},
    ("band-upper", "band-y-raise"): {"durationSeconds":2.,"cyclic":True,"bandMode":"between-hands"},
    ("band-upper", "band-overhead-pulldown"): {"durationSeconds":2.,"cyclic":True,"bandMode":"between-hands"},
    ("warmup", "arm-circles-forward"): {"durationSeconds":2.4,"cyclic":True,"equipmentHidden":True},
    ("warmup", "arm-circles-backward"): {"durationSeconds":2.4,"cyclic":True,"equipmentHidden":True},
    ("warmup", "arm-hug-open"): {"durationSeconds":2.,"cyclic":True,"equipmentHidden":True},
    ("warmup", "goalpost-slides"): {"durationSeconds":2.,"cyclic":True,"equipmentHidden":True},
    ("warmup", "shoulder-squeeze"): {"durationSeconds":2.,"cyclic":True,"equipmentHidden":True},
    ("attack", "slide-one-foot"): {"durationSeconds":1.6,"cyclic":False,"contactProgress":.55,"contactType":"right-hand","takeoffFoot":"left"},
}
for _settings in VARIANTS.values():
    if "bandMode" in _settings:
        _settings["equipment"]={
            "mode":"anchored-single" if _settings["bandMode"]=="rotation" else
                   "anchored" if "bandAnchor" in _settings else "handheld"}
        if "bandAnchor" in _settings:
            _settings["equipment"]["anchor"]=_settings.pop("bandAnchor")
        if "workingHand" in _settings:
            _settings["equipment"]["hand"]="L" if _settings.pop("workingHand")=="left" else "R"
        del _settings["bandMode"]


def rep(t):
    return math.sin(math.pi*t)**2


def shoulder_rotation(t, side, internal=False):
    c=k.control(.93,.025,.22)
    sign=-1 if side=="L" else 1
    shoulder=c["pelvis"]+c["body"]@Vector((sign*.22,0,.5))
    elbow=shoulder+Vector((sign*.025,.015,-math.sqrt(.31**2-.025**2-.015**2)))
    # The humerus and elbow stay still; the forearm rotates around the upper
    # arm's near-vertical axis while the elbow stays at ninety degrees.
    angle=math.radians((55-85*rep(t)) if internal else 60*rep(t))
    c["wrist_"+side]=elbow+Vector((sign*.27*math.sin(angle),.27*math.cos(angle),0))
    c["arm_pole_"+side]=elbow
    other="R" if side=="L" else "L"
    c["wrist_"+other]=Vector((-sign*.19,.20,1.05))
    c["arm_pole_"+other]=Vector((-sign*.38,.1,1.02))
    return c


def band_action(kind,t):
    c=k.control(.93,.025,.22)
    u=rep(t)
    if kind=="band-pull-apart":
        # Horizontal shoulder abduction keeps a soft, constant elbow bend.
        # A downward guide never crosses the shoulder-to-wrist line, so the
        # elbow cannot flip while the hands open from forward to either side.
        angle=math.pi*.5*u
        for side,sign in (("L",-1),("R",1)):
            shoulder=c["pelvis"]+c["body"]@Vector((sign*.22,0,.5))
            c["wrist_"+side]=shoulder+Vector((sign*.565*math.sin(angle),.565*math.cos(angle),-.045))
            c["arm_pole_"+side]=shoulder+Vector((0,0,-1))
        return c
    if kind=="band-row":
        return k.hands(c,(-.28,.52-.44*u,1.26),(.28,.52-.44*u,1.26),
                       ((-.37,.20-.39*u,1.21),(.37,.20-.39*u,1.21)))
    if kind=="band-y-raise":
        return k.hands(c,(-.25-.24*u,.22,1.27+.63*u),(.25+.24*u,.22,1.27+.63*u),
                       ((-.53,.12,1.51),(.53,.12,1.51)))
    # Keep the band behind the crown by a small amount, without drawing elbows
    # below shoulder height or forcing a deep behind-the-neck range.
    return k.hands(c,(-.31-.23*u,.03-.10*u,1.97-.15*u),(.31+.23*u,.03-.10*u,1.97-.15*u),
                   ((-.56,-.04,1.61),(.56,-.04,1.61)))


def shoulder_warmup(kind,t):
    c=k.control(.93,.025,.22)
    u=rep(t)
    if kind.startswith("arm-circles"):
        angle=math.pi+2*math.pi*t*(-1 if kind.endswith("backward") else 1)
        for side,sign in (("L",-1),("R",1)):
            shoulder=c["pelvis"]+c["body"]@Vector((sign*.22,0,.5))
            c["wrist_"+side]=shoulder+Vector((sign*.13,.54*math.sin(angle),.54*math.cos(angle)))
            c["arm_pole_"+side]=shoulder+Vector((sign*.40,.20*math.sin(angle),.20*math.cos(angle)))
        return c
    if kind=="arm-hug-open":
        width=.72-.93*u
        return k.hands(c,(-width,.04+.35*u,1.36+.035*u),(width,.04+.35*u,1.36-.035*u),
                       ((-.48,.20,1.25),(.48,.20,1.25)))
    if kind=="goalpost-slides":
        return k.hands(c,(-.49+.19*u,.12,1.70+.30*u),(.49-.19*u,.12,1.70+.30*u),
                       ((-.52,.02,1.49),(.52,.02,1.49)))
    return k.hands(c,(-.29,.12-.13*u,1.03),(.29,.12-.13*u,1.03),
                   ((-.35,-.05-.09*u,1.15),(.35,-.05-.09*u,1.15)))


def slide_attack(t):
    ready=k.ready(.15)
    load=k.control(.83,.16,.22)
    load["ankle_L"]=Vector((-.20,.12,k.ANKLE_Z))
    load["ankle_R"]=Vector((.20,-.22,k.ANKLE_Z))
    drive=k.control(.96,.08,.22)
    drive["ankle_L"]=Vector((-.20,.12,k.ANKLE_Z))
    drive["ankle_R"]=Vector((.20,.25,.47))
    drive["knee_pole_R"]=Vector((.23,.85,.8))
    drive=k.hit(drive,"draw")
    flight=k.control(1.24,.055,.22)
    flight["ankle_L"]=Vector((-.20,.02,.46))
    flight["ankle_R"]=Vector((.22,.20,.62))
    flight["knee_pole_R"]=Vector((.23,.9,.85))
    peak=k.hit(flight,"contact")
    follow=k.hit(flight,"follow")
    landing=k.control(.75,.25,.25)
    landing["ankle_L"]=Vector((-.25,-.04,k.ANKLE_Z))
    landing["ankle_R"]=Vector((.25,.10,k.ANKLE_Z))
    # Left support remains grounded while the right knee drives. Both legs
    # clear the floor at contact, then absorb a balanced landing.
    return k.timeline([(0,ready),(.16,load),(.32,drive),(.55,peak),(.68,follow),
                       (.86,landing),(1,ready)],t)


def build_variant(motion_id,variant_id,t):
    if (motion_id,variant_id) not in VARIANTS:
        raise ValueError((motion_id,variant_id))
    if "external-" in variant_id or "internal-" in variant_id:
        side="L" if variant_id.endswith("left") else "R"
        return shoulder_rotation(t,side,"internal-" in variant_id)
    if variant_id.startswith("band-"):
        return band_action(variant_id,t)
    if variant_id=="slide-one-foot":
        return slide_attack(t)
    return shoulder_warmup(variant_id,t)


def validate():
    samples=0
    max_error=0
    for (motion_id,name),settings in VARIANTS.items():
        count=round(settings["durationSeconds"]*96)
        previous=None
        first=None
        for index in range(count+1):
            pose=k.solve(build_variant(motion_id,name,index/count))
            first=first or pose
            for side in ("L","R"):
                for start,end,length in (("shoulder","elbow",.31),("elbow","wrist",.27),("hip","knee",.43),("knee","ankle",.43)):
                    error=abs((pose[start+"_"+side]-pose[end+"_"+side]).length-length)
                    max_error=max(max_error,error)
                    assert error<.000002,(name,index,"limb length",error)
                assert pose["knee_"+side].z>=.1399,(name,index,"knee floor")
                if name!="slide-one-foot":
                    assert (pose["ankle_"+side]-first["ankle_"+side]).length<.00001,(name,"support slides")
            if previous:
                for key in ("wrist_L","wrist_R","elbow_L","elbow_R","neck"):
                    assert (pose[key]-previous[key]).length*96<18,(name,index,key,"pop")
            previous=pose
            samples+=1
        if settings["cyclic"]:
            assert max((pose[key]-first[key]).length for key in first)<.00001,(name,"seam")
        # The browser interpolates the delivered 48 fps landmark tracks.
        # Check their actual midpoint chords as well as exact solver poses;
        # a near-singular elbow guide can pass endpoint lengths yet flip.
        frame_count=round(settings["durationSeconds"]*48)
        prior=k.solve(build_variant(motion_id,name,0))
        for frame in range(1,frame_count+1):
            current=k.solve(build_variant(motion_id,name,frame/frame_count))
            for side in ("L","R"):
                for start,end,length in (("shoulder","elbow",.31),("elbow","wrist",.27)):
                    a=prior[start+"_"+side].lerp(current[start+"_"+side],.5)
                    z=prior[end+"_"+side].lerp(current[end+"_"+side],.5)
                    assert abs((z-a).length-length)<.012,(name,frame,"interpolated arm collapses")
            prior=current
        if "external" in name or "internal" in name:
            side="L" if name.endswith("left") else "R"
            elbow=first["elbow_"+side]
            peak=k.solve(build_variant(motion_id,name,.5))
            assert (peak["elbow_"+side]-elbow).length<.00001,(name,"tucked elbow drifts")
            assert (peak["wrist_"+side]-first["wrist_"+side]).length>.20,(name,"forearm does not rotate")
    return {"variants":len(VARIANTS),"samples":samples,"maxLimbLengthErrorM":max_error}


if __name__=="__main__":
    print("COACHCAM_UPPERBODY_VARIANTS="+json.dumps(validate(),sort_keys=True))
