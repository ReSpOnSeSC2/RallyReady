# CoachCam motion review

Reviewed 5 September 2026. Scope: the shared 52-motion Blender reel, its browser contact and route timing, and the separate rolls-and-sprawls demonstration. This is a software and visual instruction review; it is not a certification of human biomechanics.

## Defects addressed

The original shared reel positioned joints independently and scaled each limb to reach them. Several poses mixed pelvis-relative and world coordinates. As a result, arms and legs changed length between tasks; a technically plausible key pose could still deform during interpolation. Sprinting moved the arm and leg on the same side together. Some overhead contact poses were inconsistent with the shoulders or head; floor hand reach exceeded the character's arm length.

The revised shared authoring model uses fixed character dimensions, constrained two-bone chains, and per-frame baking. The arm segments are 0.31/0.27 m and leg segments 0.43/0.43 m. Those values describe this character, not recommended measurements for athletes. Contact progress and cyclic behavior are exported with each motion. The browser joins ball flights between sampled contact anchors on the actual rig and samples the body deterministically; it does not blend independent joint positions across different clips, which would reintroduce stretching. Turn and route timing retain the distinct orientation of lateral footwork and backpedaling.

Quarter-speed playback, frame stepping and front/side inspection angles make the contact, loading and recovery poses reviewable. Paused inspection uses absolute timeline samples for ball rotation and camera placement so repeated renders do not drift.

Station exercises retain a fixed court position. The box is anchored once to the demonstrator's home and the authored equipment offset; it does not follow the active athlete. The local skeleton supplies the step up, weight transfer and step down. Conditioning arrows for the box, bands, bridge, foam roller, medicine ball and jump rope do not add a second court-length translation to those local motions.

The choreography review also found that a permanent "setter" role stole the other partner's return set. Reciprocal partner sets and passes now retain their factual outgoing performer. Saved instructions naming "Player A" take precedence over a generic partner role for that player's action.

## Coaching evidence used

| Skill | Instructional criterion | Primary coaching reference |
| --- | --- | --- |
| Passing | Show an early, stable forearm platform, efficient movement into position, and a controlled contact angle. Do not suggest that a wide, uncontrolled arm swing is the normal passing action. | [USA Volleyball: Five Keys to Better Passing](https://usavolleyball.org/resource/five-keys-to-better-passing/) |
| Setting | Prepare the hands high, contact in front of the face above the eyebrows near the body midline, and extend through release. A set must visibly leave the hands; a ball glued to them resembles a catch. | [USA Volleyball: Thoughts for Setters](https://usavolleyball.org/resource/thoughts-for-setters/) |
| Attacking | Make the final approach steps and upward jump readable, and keep the ball in front so the hitter can see the opposing court. | [USA Volleyball: Pro Tips for Attacking, Middle Blockers and Beach](https://usavolleyball.org/resource/pro-tips-for-attacking-middle-blockers-and-beach/) |
| Blocking | Keep the shoulders square to the net, extend the arms near jump maximum, and return to the ready hand position on landing. | [USA Volleyball: Staying Square to the Volleyball Net While Blocking](https://usavolleyball.org/resource/staying-square-to-the-volleyball-net-while-blocking-five-steps/) |

These are coaching criteria translated into animation requirements. None of the linked organizations reviewed or endorsed the generated assets. The numerical regression bounds below are engineering checks, not published clinical joint limits.

## Verification

Run `node scripts/verify-coachcam-mechanics.js` for contact clocks, exact clip-end sampling, repeatable scrubbing, shortest turns, route easing, lateral/backpedal orientation, and partner contact ownership. This reads the actual exported GLB motion metadata. It also executes the dedicated player's actual seek function against a Three.js animation mixer to verify paused and playing seeks at quarter, half and full speed, forward/back frame steps, replay and transport preservation. All compiled movement beats are checked against the phase's actual playback duration so long diagram routes cannot become implausibly fast shuffles. The existing `verify-coachcam-library-3d.js` and `verify-drill-human-motion.js` cover catalog mapping and saved instructions.

Run Blender with `--background --factory-startup --python-exit-code 1 --python tools/blender/coachcam/validate_library.py` after rebuilding. It reimports the delivered GLB and samples every motion at half-frame intervals to check fixed segment lengths, folded or collapsed joints, and abrupt landmark motion. It also checks passing and setting landmarks at the authored contact point, opposite arm/leg sprint timing, airborne reach, selected floor clearances, and camera framing. Half-frame samples matter because export interpolation can distort a chain even when the source keys are correct.

At each half-frame sample, joint-to-joint lengths must remain within 12 mm of the character's fixed dimensions. The validator reads the exported sample rate instead of assuming 24 fps. Conservative folding and velocity limits detect obvious defects; they do not prove that every motion follows a human joint's correct rotation axis. A passing numeric report also does not prove correct force, balance, contact pressure or safe landing mechanics.

Recorded automated result for this revision: **PASS**. The shared GLB passed 6,284 half-frame pose samples at 48 fps, including all 52 motion segments. Maximum limb-length deviation was 9.857 mm; sampled elbow/knee flexion ranged from 3.00 to 142.05 degrees. Contact poses, sprint coordination, selected floor clearances and both camera aspects passed. The mesh contains 9,520 athlete triangles and 28 animated bones. The browser mechanics test passed 990 checks, including speed limits for all 286 compiled court-movement beats and actual Three.js paused/slow seek tests. It executes the production station placement and update functions to verify that all four box exercises keep the box fixed across timeline samples and active-athlete switches, then checks the delivered GLB for local stepping movement. Catalog mapping also passed 23,286 checks.

## Training use and limits

CoachCam is a visual aid for a coach-led explanation of task order, body position and contact timing. The simplified character has no separately articulated fingers, scapulae, individual spinal segments or soft-tissue simulation. It cannot teach precise hand shape, shoulder rotation, spinal loading or exercise resistance from geometry alone. Ball flight is an instructional trajectory rather than a validated physics or motion-capture measurement.

Advanced dives, shoulder rolls, loaded exercises and landing technique still need a qualified coach's demonstration and athlete-specific feedback. Geometry checks cannot establish that a floor transition is safe to imitate, and the listed references do not validate the bespoke floor animations. Before describing the whole catalog as fully anatomically correct or independently sufficient for training, a volleyball coach should review every motion family and a movement professional should review the floor and conditioning sequences with those limitations in mind.
