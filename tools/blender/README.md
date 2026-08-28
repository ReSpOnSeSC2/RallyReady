# RallyReady CoachCam Blender pipeline

RallyReady's complete drill catalog is rendered through a reusable Blender
CoachCam library. The shared asset contains the court, a production humanoid
rig, 52 mechanically distinct motion clips, two teaching cameras, and 14
equipment families. At runtime each of the 241 real drills is compiled from its
saved participants, roles, positions, instructions, routes, contacts, and
equipment. This produces a drill-specific full-court view and synchronized
mechanics close-up without shipping a duplicate 3D scene for every drill.

## Complete drill library

Build the reusable browser asset and editable Blender source:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.1\blender.exe' `
  --background --factory-startup `
  --python 'tools\blender\coachcam\build_library.py'
```

Outputs:

- `models/coachcam/coachcam-library.glb` — optimized shared browser asset
- `design-assets/blender/coachcam-library.blend` — editable Blender source

Validate the rig, motion semantics, court/equipment contract, camera framing,
floor safety, and exported GLB size:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.1\blender.exe' `
  --background --factory-startup `
  --python 'tools\blender\coachcam\validate_library.py'
node scripts/verify-coachcam-library-3d.js
```

The catalog verifier exhaustively expands every walkthrough phase and saved
instruction. It also checks player counts and labels, multi-person positions,
routes, ball contacts, equipment, motion selection, accessibility, responsive
rendering hooks, reduced-motion behavior, and the single-renderer performance
contract. The app lazy-loads this library only when CoachCam approaches the
viewport and uses one WebGL renderer with two scissored cameras.

## Dedicated Rolls & Sprawls scene

The Rolls & Sprawls vertical slice is generated entirely from source so the
court, characters, choreography, cameras, and teaching overlays can be revised
without manually repairing a binary scene.

### Build

From the repository root on Windows:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.1\blender.exe' `
  --background --factory-startup `
  --python 'tools\blender\build_rolls_and_sprawls.py'
```

Outputs:

- `models/coachcam/rolls-and-sprawls.glb` — browser asset
- `design-assets/blender/rolls-and-sprawls.blend` — editable source scene
- `design-assets/blender/previews/rolls-and-sprawls-*.png` — local visual QA
  renders (ignored from the production app and deployment)

The GLB contains one continuous 14-second, 30 fps action named
`CoachCam_RollsSprawls`. Its exported node extras include a machine-readable
phase timeline, loop metadata, drill id, and safety cues. The scene includes
`Camera_Court`, `Camera_Mechanics`, and a phase-specific `Camera_Sprawl`. The
runtime still presents two panes: its mechanics pane uses the symmetric roll
camera, then switches to the three-quarter sprawl lens from 9.2–12.0 seconds.
All mechanics cameras retain the athlete's head, hands, and shoes.

### Validate

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.1\blender.exe' `
  --background --factory-startup `
  --python 'tools\blender\validate_rolls_and_sprawls.py'
```

Validation performs a GLB round trip, checks the exact clip and required node
contract, samples the authored body position after export, and projects the full
defender through both cameras at key phases to catch axis mistakes or cropping.

### Timeline

| Seconds | Phase |
| --- | --- |
| 0.0–1.0 | Balanced defensive ready position |
| 1.0–2.6 | Coach toss, right reach, platform contact |
| 2.6–3.8 | Right outer-shoulder-to-opposite-hip roll |
| 3.8–4.6 | Recovery to ready |
| 4.6–6.2 | Coach toss, left reach, platform contact |
| 6.2–7.4 | Left outer-shoulder-to-opposite-hip roll |
| 7.4–8.2 | Recovery to ready |
| 8.2–10.2 | Short toss and forward save |
| 10.2–11.6 | Chest-and-hips sprawl, head clear |
| 11.6–13.0 | Controlled recovery |
| 13.0–14.0 | Ready hold for a seamless loop |

The animation is an instructional visualization. Athletes should learn floor
skills with qualified coaching and suitable flooring.
