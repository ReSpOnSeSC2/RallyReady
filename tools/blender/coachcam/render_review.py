"""Render deterministic front three-quarter samples for anatomical visual QA."""
import json
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[3]
bpy.ops.wm.open_mainfile(filepath=str(ROOT / "design-assets/blender/coachcam-library.blend"))
scene = bpy.context.scene
manifest = json.loads(scene["motion_manifest_json"])
bpy.data.objects["AthleteTemplate"].location = (0, 0, 0)
for obj in scene.objects:
    if obj.type == "MESH" and obj.name not in ("AthleteTemplate_Mesh", "ArenaFloor", "Court"):
        obj.hide_render = True
camera = bpy.data.objects["Camera_Mechanics_Library"]
camera.location = (3.8, 5.8, 2.9)
camera.rotation_euler = (Vector((0, 0, 1.05))-camera.location).to_track_quat("-Z", "Y").to_euler()
camera.data.type = "ORTHO"
camera.data.ortho_scale = 2.85
scene.camera = camera
scene.render.resolution_x = 480
scene.render.resolution_y = 480
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.eevee.taa_render_samples = 24
out = ROOT / "design-assets/blender/previews/anatomy-review"
out.mkdir(parents=True, exist_ok=True)
samples = [("ready", .0), ("pass", .5), ("set", .56), ("attack", .55),
           ("sprint", .15), ("block", .55), ("one-arm-save", .6),
           ("shoulder-roll-right", .5), ("floor-recovery", .52),
           ("bridge", .5), ("foam", .5), ("medicine-slam", .58),
           ("box", .55), ("box-hit", .55), ("box-block", .55), ("depth-drop", .63)]
box = bpy.data.objects["Prototype_PlyoBox"]
box.location=(0,.62,0)
box.scale.z=.4
for name, progress in samples:
    entry = manifest[name]
    scene.frame_set(entry["startFrame"] + round(progress*(entry["endFrame"]-entry["startFrame"])))
    for child in box.children_recursive:
        child.hide_render=name not in ("box","box-hit","box-block","depth-drop")
    scene.render.filepath = str(out / (name+".png"))
    bpy.ops.render.render(write_still=True)
print("REVIEW_RENDER_DIR=" + str(out))
