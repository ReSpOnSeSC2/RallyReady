// coachcam-library-3d.js — shared Blender CoachCam for the complete drill catalog.
//
// The GLB owns the full-body RR_Humanoid_v1 rig, 52 authored motion segments,
// the regulation court, cameras, ball, and all equipment families. Exact people,
// positions, routes, contacts, timing, and text come from the saved drill record
// through RR.drillChoreography; this file never invents drill data.
(function () {
  "use strict";

  var RR = window.RR = window.RR || {};
  var sequence = 0;
  var runtimePromise = null;
  var libraryPromise = null;

  var MOTION_IDS = Object.freeze([
    "ready", "sprint", "shuffle", "backpedal", "pass", "set", "feed",
    "serve", "attack", "block", "dig", "sprawl", "run-through",
    "defensive-ready", "down-ball-hit", "low-toss", "one-arm-save",
    "platform-save", "shoulder-roll-right", "shoulder-roll-left",
    "chest-hip-sprawl", "floor-recovery", "ladder", "jump-rope",
    "mini-band", "bridge", "band", "band-upper", "band-arm-swing",
    "box-hit", "signal", "free-arm-swing", "medicine", "medicine-slam",
    "medicine-rotate", "medicine-scoop", "box", "depth-drop", "box-block",
    "mat-defense", "jump", "approach-jump", "power", "warmup", "foam",
    "stretch", "recovery", "admin", "underhand", "jump-float",
    "jump-topspin", "tip-roll"
  ]);

  var EQUIPMENT_MODELS = Object.freeze({
    "agility ladder": "Prototype_AgilityLadder",
    "balls": "Prototype_Ball",
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
    "wall": "Prototype_TrainingWall"
  });

  var CONTRACT = Object.freeze({
    model: "models/coachcam/coachcam-library.glb",
    clip: "CoachCam_MotionLibrary",
    importedClip: "Animation",
    rig: "RR_Humanoid_v1",
    athlete: "AthleteTemplate",
    courtCamera: "Camera_Court_Library",
    mechanicsCamera: "Camera_Mechanics_Library",
    motionCount: 52,
    equipmentCount: 14,
    runtime: Object.freeze({
      three: "vendor/three/three.module.min.js",
      loader: "vendor/three/addons/loaders/GLTFLoader.js",
      skeleton: "vendor/three/addons/utils/SkeletonUtils.js"
    })
  });

  function clean(value) { return value == null ? "" : String(value).trim(); }
  function finite(value) { return typeof value === "number" && isFinite(value); }
  function list(value) { return Array.isArray(value) ? value : []; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  // Pure sampling rules are shared with the regression checks. Every pose and
  // ball position is a function of authored time, including paused scrubbing.
  function contactProgress(segment) {
    return clamp(segment && finite(segment.contactProgress) ? segment.contactProgress : 0.5, 0.05, 0.95);
  }
  function contactTime(beat, segment) {
    return beat.startMs + beat.durationMs * contactProgress(segment);
  }
  function sampleTime(segment, progress) {
    return segment.startSeconds + clamp(progress, 0, 1) * segment.durationSeconds;
  }
  function netClearanceArc(from, to, nets, height) {
    list(nets).forEach(function (net) {
      var crossing = (net.z - from[2]) / (to[2] - from[2]);
      if (!(crossing > 0 && crossing < 1)) return;
      var x = from[0] + (to[0] - from[0]) * crossing;
      if (Math.abs(x - net.x) > net.width / 2) return;
      var linearHeight = from[1] + (to[1] - from[1]) * crossing;
      height = Math.max(height, (net.height + 0.20 - linearHeight) / (4 * crossing * (1 - crossing)));
    });
    return height;
  }
  function travelProgress(progress) {
    var p = clamp(progress, 0, 1);
    return p * p * (3 - 2 * p);
  }
  function blendYaw(from, to, amount) {
    return from + Math.atan2(Math.sin(to - from), Math.cos(to - from)) * clamp(amount, 0, 1);
  }
  function routeFacing(motionId, routeYaw, initialYaw) {
    if (/^(shuffle|mini-band|ladder)$/.test(motionId)) return initialYaw;
    return routeYaw + (motionId === "backpedal" ? Math.PI : 0);
  }
  function courtSpace(plan) {
    var presentation = plan.presentation || {};
    var bounds = presentation.bounds || { minX: 0, minY: 0, maxX: Number(plan.width) || 9, maxY: Number(plan.height) || 10 };
    var width = Math.max(1, bounds.maxX - bounds.minX);
    var height = Math.max(1, bounds.maxY - bounds.minY);
    var metric = presentation.metric || presentation.coordinateSystem === "metric";
    var hasNet = finite(presentation.net);
    var halfDepth = hasNet ? Math.max(presentation.net - bounds.minY, bounds.maxY - presentation.net) : height;
    return {
      x: (bounds.minX + bounds.maxX) / 2,
      y: hasNet ? presentation.net : (bounds.minY + bounds.maxY) / 2,
      scaleX: metric ? 1 : 9 / width,
      scaleY: metric ? 1 : hasNet ? 9 / Math.max(1, halfDepth) : presentation.bounds ? 1 : 18 / height
    };
  }
  function mappedPoint(plan, point) {
    var space = courtSpace(plan);
    return [((Number(point && point[0]) || 0) - space.x) * space.scaleX,
      ((Number(point && point[1]) || 0) - space.y) * space.scaleY];
  }
  function targetElevation(plan, point) {
    var presentation = plan.presentation || {};
    var height = 0.12;
    list(presentation.zones).forEach(function (zone) {
      if (point[0] >= zone.x && point[0] <= zone.x + zone.w && point[1] >= zone.y && point[1] <= zone.y + zone.h && zone.elevation > 0) height = zone.elevation;
    });
    list(presentation.props).forEach(function (prop) {
      if (Math.abs(point[0] - prop.x) <= (prop.w || 1) / 2 && Math.abs(point[1] - prop.y) <= (prop.h || 1) / 2 && prop.elevation > 0) height = prop.elevation;
    });
    return height;
  }
  function stationMotion(motionId) {
    // These clips already contain their reach, step and weight transfer in
    // metres. Their diagram arrows describe the exercise at one station.
    return /^(box|box-hit|box-block|depth-drop|bridge|foam|band|band-upper|band-arm-swing|medicine|medicine-slam|medicine-rotate|medicine-scoop|jump-rope)$/.test(motionId);
  }
  function motionTimingScale(plan) {
    // Diagram routes span a full court. A one-second sprite beat must not
    // turn a lateral shuffle into a 15 m/s slide. Scale the whole phase so
    // parallel events and ball contacts retain their shared clock.
    var scale = 1;
    list(plan.beats).forEach(function (beat) {
      if (beat.variantDuration > 0) scale = Math.max(scale, beat.variantDuration * (beat.repetitions || 1) / Math.max(0.001, beat.durationMs / 1000));
      var actor = list(plan.actors).find(function (item) { return item.id === beat.actorId; });
      if (actor && actor.authored && actor.authored.posture === "sit-stand" && beat.motionId === "set") {
        scale = Math.max(scale, 3.5 / Math.max(0.001, beat.durationMs / 1000));
      }
      if (stationMotion(beat.motionId) || finite(beat.freezeProgress)) return;
      var route = list(plan.routes).find(function (item) { return item.id === beat.routeId && item.type === "move"; });
      if (!route) return;
      var points = [route.from].concat(list(route.via), [route.to]);
      var distance = 0;
      for (var i = 1; i < points.length; i++) {
        var space = courtSpace(plan);
        var dx = (points[i][0] - points[i - 1][0]) * space.scaleX;
        var dz = (points[i][1] - points[i - 1][1]) * space.scaleY;
        distance += Math.sqrt(dx * dx + dz * dz);
      }
      if (finite(beat.routeStartProgress) && finite(beat.routeEndProgress)) distance *= beat.routeEndProgress - beat.routeStartProgress;
      var speed = beat.motionId === "mini-band" ? 0.48 : beat.motionId === "shuffle" ? 0.8 : beat.motionId === "backpedal" ? 1.8
        : beat.motionId === "ladder" ? 2 : /sprint|run-through/.test(beat.motionId) ? 5.5 : 3;
      if (beat.variantStride > 0 && beat.variantDuration > 0) speed = Math.min(speed, 1.5 * beat.variantStride / beat.variantDuration);
      scale = Math.max(scale, 1.5 * distance / Math.max(0.001, beat.durationMs / 1000) / speed);
    });
    return scale;
  }
  function slug(value) {
    return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "phase";
  }
  function translated(value) {
    return RR.i18n && RR.i18n.t ? RR.i18n.t(value) : value;
  }
  function node(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = translated(text);
    return element;
  }
  function svgIcon(paths) {
    return "<svg viewBox='0 0 24 24' aria-hidden='true' focusable='false'>" + paths + "</svg>";
  }
  function controlButton(className, label, icon) {
    var button = node("button", "coachcam__control " + className);
    button.type = "button";
    button.setAttribute("aria-label", translated(label));
    button.innerHTML = svgIcon(icon) + "<span>" + translated(label) + "</span>";
    return button;
  }
  function formatTime(seconds) {
    var whole = Math.max(0, Math.floor(seconds + 0.001));
    return Math.floor(whole / 60) + ":" + String(whole % 60).padStart(2, "0");
  }
  function motionLabel(id) {
    var motion = RR.drillChoreography && RR.drillChoreography.motions &&
      RR.drillChoreography.motions[id];
    return motion && motion.label || id.split("-").map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(" ");
  }

  function equipmentKeys(plan) {
    var seen = {};
    return list(plan && plan.equipment).map(function (item) {
      return clean(item && typeof item === "object" ? (item.label || item.type) : item).toLowerCase();
    }).filter(function (key) {
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function isBundledDrill(drill) {
    if (!drill || !clean(drill.id) || drill.custom || drill.id === "rolls-and-sprawls") return false;
    return list(RR.drills).some(function (item) { return item === drill || item.id === drill.id; });
  }

  function compileDrill(drill) {
    if (!isBundledDrill(drill) || !RR.drillAnimation || !RR.drillHumanMotion ||
        !RR.drillChoreography) return null;
    var specs = RR.drillAnimation.scenesFor(drill);
    var program = RR.drillHumanMotion.programFor(drill, specs);
    var steps = list(drill.steps);
    var phases = [];
    var elapsed = 0;
    var sceneCounts = {};
    program.forEach(function (entry) {
      var sceneIndex = finite(entry.sceneIndex) && entry.sceneIndex >= 0
        ? Math.floor(entry.sceneIndex) : specs.indexOf(entry.scene);
      if (sceneIndex < 0) sceneIndex = Math.min(phases.length, Math.max(0, specs.length - 1));
      sceneCounts[sceneIndex] = (sceneCounts[sceneIndex] || 0) + 1;
    });
    program.forEach(function (entry, index) {
      var sceneIndex = finite(entry.sceneIndex) && entry.sceneIndex >= 0
        ? Math.floor(entry.sceneIndex) : specs.indexOf(entry.scene);
      if (sceneIndex < 0) sceneIndex = Math.min(index, Math.max(0, specs.length - 1));
      var spec = entry.scene || specs[sceneIndex] || {};
      var instruction = clean(entry.instruction) || clean(spec.caption) || clean(drill.setup) || clean(drill.name);
      var stepIndex = finite(entry.sourceStep) && entry.sourceStep >= 0
        ? Math.floor(entry.sourceStep) : index;
      var plan = RR.drillChoreography.planFor(drill, spec, instruction, {
        stepIndex: stepIndex,
        sceneIndex: sceneIndex,
        sceneUsageCount: sceneCounts[sceneIndex] || 1,
        showFullScene: entry.supplementalScene === true
      });
      if (!plan || !plan.valid) return;
      if (RR.coachCamVariants) {
        var expanded = [];
        plan.beats.forEach(function (beat) {
          var selection = RR.coachCamVariants.select(drill, { stepIndex: stepIndex, instruction: instruction, sceneIndex: sceneIndex, plan: plan }, beat);
          var choices = selection && selection.sequence || (selection ? [selection] : []);
          if (!choices.length) { expanded.push(beat); return; }
          var weight = choices.reduce(function (sum, choice) { return sum + (choice.durationSeconds || 1) * (choice.repetitions || 1); }, 0);
          var elapsedMs = beat.startMs;
          choices.forEach(function (choice, variantIndex) {
            var durationMs = beat.durationMs * (choice.durationSeconds || 1) * (choice.repetitions || 1) / weight;
            var selected = Object.assign({}, beat, {
              id: choices.length > 1 ? beat.id + "-variant-" + variantIndex : beat.id,
              motionId: choice.motionId || beat.motionId, variantId: choice.id || "",
              variantDuration: choice.durationSeconds || 0, variantStride: choice.strideMeters || 0,
              variantLabel: choice.label || "", repetitions: choice.repetitions || 1,
              freezeProgress: finite(choice.freezeProgress) ? choice.freezeProgress : null,
              routeStartProgress: choices.length > 1 ? (elapsedMs - beat.startMs) / beat.durationMs : 0,
              routeEndProgress: choices.length > 1 ? (elapsedMs + durationMs - beat.startMs) / beat.durationMs : 1,
              startMs: elapsedMs, durationMs: durationMs, endMs: elapsedMs + durationMs
            });
            expanded.push(selected);
            elapsedMs += durationMs;
          });
        });
        plan.beats = expanded;
      }
      var sourceDuration = Math.max(1200, Number(plan.durationMs) || 1200);
      var duration = Math.max(sourceDuration / 1000 * motionTimingScale(plan), 2.6);
      var used = {};
      var motions = list(plan.beats).map(function (beat) { return beat.motionId; }).filter(function (id) {
        if (!id || used[id]) return false;
        used[id] = true;
        return true;
      });
      if (!motions.length) motions = ["admin"];
      var cue = clean(entry.cue) || clean(list(drill.cues)[Math.min(stepIndex, Math.max(0, list(drill.cues).length - 1))]) ||
        clean(list(plan.beats)[0] && list(plan.beats)[0].cue) || instruction;
      var phase = {
        id: "phase-" + (index + 1) + "-" + slug(motions[0]),
        index: index,
        label: clean(entry.title) || (steps.length ? "Step " + (stepIndex + 1) + " of " + steps.length : clean(drill.name)),
        mechanic: motions.map(motionLabel).join(" · "),
        instruction: instruction,
        cue: cue,
        key: list(plan.actors).length + " people · " + motionLabel(motions[0]),
        start: elapsed,
        end: elapsed + duration,
        duration: duration,
        sourceDurationMs: sourceDuration,
        sceneIndex: sceneIndex,
        stepIndex: stepIndex,
        scene: spec,
        plan: plan,
        motionIds: motions
      };
      phases.push(phase);
      elapsed = phase.end;
    });
    if (!phases.length) return null;
    return {
      drill: drill,
      phases: phases,
      durationSeconds: elapsed,
      actorMaximum: phases.reduce(function (max, phase) { return Math.max(max, phase.plan.actors.length); }, 0),
      equipment: list(drill.equipment),
      sourceStepCount: steps.length,
      sceneCount: specs.length,
      valid: phases.every(function (phase) { return phase.plan.valid; })
    };
  }

  function phaseAt(compiled, seconds) {
    var duration = compiled.durationSeconds;
    var wrapped = ((Number(seconds) || 0) % duration + duration) % duration;
    for (var index = compiled.phases.length - 1; index >= 0; index--) {
      if (wrapped >= compiled.phases[index].start) return compiled.phases[index];
    }
    return compiled.phases[0];
  }

  function loadRuntime() {
    if (!runtimePromise) {
      runtimePromise = Promise.all([
        import("../" + CONTRACT.runtime.three),
        import("../" + CONTRACT.runtime.loader),
        import("../" + CONTRACT.runtime.skeleton)
      ]).then(function (modules) {
        if (!modules[0] || !modules[1] || !modules[1].GLTFLoader || !modules[2] || !modules[2].clone) {
          throw new Error("CoachCam shared runtime modules are incomplete");
        }
        return { THREE: modules[0], GLTFLoader: modules[1].GLTFLoader, cloneSkeleton: modules[2].clone };
      }).catch(function (error) {
        runtimePromise = null;
        throw error;
      });
    }
    return runtimePromise;
  }

  function loadLibrary() {
    if (!libraryPromise) {
      libraryPromise = loadRuntime().then(function (runtime) {
        return new runtime.GLTFLoader().loadAsync(CONTRACT.model).then(function (gltf) {
          return { runtime: runtime, gltf: gltf };
        });
      }).catch(function (error) {
        libraryPromise = null;
        throw error;
      });
    }
    return libraryPromise;
  }

  function buildViewFrame(kind, title, detail) {
    var frame = node("section", "coachcam__view coachcam__view--" + kind);
    frame.setAttribute("data-coachcam-view", kind);
    frame.setAttribute("aria-label", translated(title + ". " + detail));
    var label = node("div", "coachcam__view-label");
    label.appendChild(node("span", "coachcam__view-dot"));
    var words = node("span", "coachcam__view-words");
    words.appendChild(node("strong", "", title));
    words.appendChild(node("small", "", detail));
    label.appendChild(words);
    frame.appendChild(label);
    return frame;
  }

  function fallbackArtwork(compiled, markerId) {
    var phase = compiled.phases[0];
    var fallback = node("div", "coachcam__fallback coachcam__fallback--catalog");
    fallback.setAttribute("aria-hidden", "true");
    var wide = node("div", "coachcam__fallback-pane coachcam__fallback-pane--court");
    var mechanics = node("div", "coachcam__fallback-pane coachcam__fallback-pane--mechanics");
    try {
      var facts = RR.drillAnimation.courtFactsFor(compiled.drill, phase.scene, phase.instruction);
      wide.innerHTML = RR.drillAnimation.renderSvg(phase.scene, markerId + "-court", facts);
    } catch (error) {
      wide.textContent = translated(phase.instruction);
    }
    mechanics.innerHTML =
      "<div class='coachcam__fallback-mechanics'>" +
        "<span>" + translated("Body mechanics") + "</span>" +
        "<strong>" + translated(phase.mechanic) + "</strong>" +
        "<p>" + translated(phase.cue) + "</p>" +
      "</div>";
    fallback.appendChild(wide);
    fallback.appendChild(mechanics);
    return fallback;
  }

  function buildFigure(drill) {
    var compiled = compileDrill(drill);
    if (!compiled) return null;
    var first = compiled.phases[0];
    var id = "coachcam-library-" + (++sequence);
    var root = node("section", "coachcam coachcam--library");
    root.id = id;
    root.setAttribute("data-state", "idle");
    root.setAttribute("data-renderer", "shared-blender-library");
    root.setAttribute("data-drill-id", drill.id);
    root.setAttribute("data-actor-maximum", String(compiled.actorMaximum));
    root.setAttribute("aria-label", translated("3D CoachCam demonstration for " + drill.name));

    var header = node("header", "coachcam__header");
    var identity = node("div", "coachcam__identity");
    var mark = node("span", "coachcam__mark");
    mark.innerHTML = svgIcon("<path d='M4 7.5h10.5a3 3 0 0 1 3 3v6H4z'/><path d='m17.5 11 3.5-2v7l-3.5-2'/><circle cx='8' cy='5' r='2'/>");
    identity.appendChild(mark);
    var identityCopy = node("div", "coachcam__identity-copy");
    identityCopy.appendChild(node("span", "coachcam__eyebrow", "3D CoachCam"));
    var phaseStatus = node("span", "coachcam__phase-status", first.label + " · " + first.mechanic);
    identityCopy.appendChild(phaseStatus);
    identity.appendChild(identityCopy);
    header.appendChild(identity);

    var controls = node("div", "coachcam__controls");
    var pause = controlButton("coachcam__control--play", "Pause", "<path d='M8 5v14M16 5v14'/>");
    var replay = controlButton("coachcam__control--replay", "Replay",
      "<path d='M4 11a8 8 0 1 0 2.3-5.7L4 7.6'/><path d='M4 3v4.6h4.6'/>");
    controls.appendChild(pause);
    controls.appendChild(replay);
    var frameBack = controlButton("coachcam__control--frame-back", "Back one frame", "<path d='M6 5v14M18 5 8 12l10 7z'/>");
    var frameNext = controlButton("coachcam__control--frame-next", "Forward one frame", "<path d='M18 5v14M6 5l10 7-10 7z'/>");
    controls.appendChild(frameBack);
    controls.appendChild(frameNext);
    var speed = node("div", "coachcam__speed");
    speed.setAttribute("role", "group");
    speed.setAttribute("aria-label", translated("Playback speed"));
    [0.25, 0.5, 1].forEach(function (value) {
      var button = node("button", "coachcam__speed-button" + (value === 1 ? " is-active" : ""), value + "×");
      button.type = "button";
      button.setAttribute("aria-pressed", value === 1 ? "true" : "false");
      button.setAttribute("data-speed", String(value));
      speed.appendChild(button);
    });
    controls.appendChild(speed);
    header.appendChild(controls);
    root.appendChild(header);

    var framing = node("div", "coachcam__angles coachcam__framing");
    framing.setAttribute("role", "group");
    framing.setAttribute("aria-label", translated("Demonstration view"));
    [["both", "Whole drill"], ["layout", "Court layout"], ["technique", "Technique close-up"]].forEach(function (choice, index) {
      var button = node("button", "coachcam__control", choice[1]);
      button.type = "button";
      button.setAttribute("data-framing", choice[0]);
      button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      framing.appendChild(button);
    });
    root.appendChild(framing);
    root.setAttribute("data-framing", "both");

    var stage = node("div", "coachcam__stage");
    var canvas = node("canvas", "coachcam__canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.tabIndex = -1;
    stage.appendChild(canvas);
    stage.appendChild(fallbackArtwork(compiled, id + "-fallback"));
    var views = node("div", "coachcam__views");
    var courtView = buildViewFrame("court", "Full court",
      first.plan.actors.length + " people · exact drill positions");
    var mechanicsView = buildViewFrame("mechanics", "Body mechanics", first.mechanic);
    views.appendChild(courtView);
    views.appendChild(mechanicsView);
    stage.appendChild(views);
    var loading = node("div", "coachcam__loading", "Preparing the synchronized 3D court…");
    loading.setAttribute("role", "status");
    loading.setAttribute("aria-live", "polite");
    stage.appendChild(loading);
    root.appendChild(stage);

    var formation = node("div", "coachcam__formation");
    formation.appendChild(node("span", "coachcam__formation-label", "On court"));
    var formationValue = node("strong", "coachcam__formation-value",
      first.plan.actors.length + " people · " + (equipmentKeys(first.plan).join(" · ") || "court only"));
    formation.appendChild(formationValue);
    root.appendChild(formation);
    var setupNote = node("p", "coachcam__setup-note", first.plan.presentation && first.plan.presentation.exampleNote);
    setupNote.hidden = !setupNote.textContent;
    root.appendChild(setupNote);
    var setup = node("details", "coachcam__setup");
    setup.appendChild(node("summary", "", "Equipment and drill setup"));
    setup.appendChild(node("p", "", compiled.drill.setup));
    var equipmentList = node("p", "coachcam__setup-equipment", equipmentKeys(first.plan).join(" · "));
    setup.appendChild(equipmentList);
    var fullSteps = node("ol", "");
    list(compiled.drill.steps).forEach(function (step) { fullSteps.appendChild(node("li", "", step)); });
    setup.appendChild(fullSteps);
    root.appendChild(setup);
    var angles = node("div", "coachcam__angles");
    angles.setAttribute("role", "group");
    angles.setAttribute("aria-label", translated("Body mechanics viewing angle"));
    angles.appendChild(node("span", "coachcam__formation-label", "View technique"));
    [["three-quarter", "Three-quarter"], ["front", "Front"], ["side", "Side"]].forEach(function (choice, index) {
      var button = node("button", "coachcam__control", choice[1]);
      button.type = "button";
      button.setAttribute("data-angle", choice[0]);
      button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      angles.appendChild(button);
    });
    root.appendChild(angles);

    var timeline = node("div", "coachcam__timeline");
    var now = node("div", "coachcam__now");
    var nowCopy = node("div", "coachcam__now-copy");
    nowCopy.appendChild(node("span", "coachcam__now-kicker", "Current technique"));
    var phaseTitle = node("strong", "coachcam__now-title", first.mechanic);
    nowCopy.appendChild(phaseTitle);
    now.appendChild(nowCopy);
    var time = node("output", "coachcam__time", "0:00 / " + formatTime(compiled.durationSeconds));
    time.setAttribute("for", id + "-scrubber");
    now.appendChild(time);
    timeline.appendChild(now);
    var scrubber = node("input", "coachcam__scrubber");
    scrubber.type = "range";
    scrubber.id = id + "-scrubber";
    scrubber.min = "0";
    scrubber.max = "1000";
    scrubber.step = "1";
    scrubber.value = "0";
    scrubber.setAttribute("aria-label", translated("Scrub through the complete drill demonstration"));
    scrubber.setAttribute("aria-valuetext", translated(first.label + ", 0 seconds of " + Math.round(compiled.durationSeconds)));
    timeline.appendChild(scrubber);

    var phaseRail = node("div", "coachcam__phase-rail");
    phaseRail.setAttribute("aria-label", translated("Animation phases. The complete sequence plays automatically."));
    compiled.phases.forEach(function (phase, index) {
      var button = node("button", "coachcam__phase-button" + (index === 0 ? " is-active" : ""));
      button.type = "button";
      button.setAttribute("data-phase", phase.id);
      button.setAttribute("data-phase-start", String(phase.start));
      button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      button.appendChild(node("span", "coachcam__phase-index", String(index + 1).padStart(2, "0")));
      button.appendChild(node("span", "coachcam__phase-label", phase.label));
      phaseRail.appendChild(button);
    });
    timeline.appendChild(phaseRail);
    root.appendChild(timeline);

    var coaching = node("aside", "coachcam__coaching");
    coaching.setAttribute("aria-label", translated("Current body mechanics coaching"));
    var coachingCopy = node("div", "coachcam__coaching-copy");
    coachingCopy.appendChild(node("span", "coachcam__coaching-kicker", "Live instruction"));
    var cue = node("p", "coachcam__cue", first.instruction);
    coachingCopy.appendChild(cue);
    coaching.appendChild(coachingCopy);
    var safety = node("div", "coachcam__safety");
    safety.appendChild(node("span", "coachcam__safety-label", "Coach cue"));
    var safetyKey = node("strong", "coachcam__safety-key", first.cue);
    safety.appendChild(safetyKey);
    coaching.appendChild(safety);
    root.appendChild(coaching);

    var fallbackText = node("p", "coachcam__fallback-text");
    fallbackText.textContent = translated("The 3D view could not start on this device. The exact court formation, complete phase timeline, and coaching instructions remain available.");
    fallbackText.hidden = true;
    root.appendChild(fallbackText);
    var announcer = node("span", "coachcam__announcer");
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    root.appendChild(announcer);

    mountPlayer(compiled, {
      root: root, canvas: canvas, stage: stage, courtView: courtView,
      frameBack: frameBack, frameNext: frameNext, angles: angles, framing: framing,
      mechanicsView: mechanicsView, loading: loading, fallbackText: fallbackText,
      pause: pause, replay: replay, speed: speed, scrubber: scrubber,
      phaseRail: phaseRail, phaseStatus: phaseStatus, phaseTitle: phaseTitle,
      time: time, cue: cue, safetyKey: safetyKey, formationValue: formationValue,
      announcer: announcer, setupNote: setupNote
    });
    return root;
  }

  function mountPlayer(compiled, ui) {
    var player = {
      destroyed: false,
      wasConnected: false,
      initialized: false,
      initializing: false,
      failed: false,
      userPaused: false,
      autoPaused: false,
      scrubbing: false,
      resumeAfterScrub: false,
      speed: 1,
      authoredTime: 0,
      phaseId: "",
      phaseIndex: -1,
      frame: 0,
      lastFrame: 0,
      runtime: null,
      renderer: null,
      scene: null,
      model: null,
      clip: null,
      motionManifest: null,
      athletePrototype: null,
      ballPrototype: null,
      equipmentPrototypes: {},
      drillGroup: null,
      actors: {},
      actorList: [],
      routeVisuals: {},
      ballPool: [],
      equipment: [],
      wearables: [],
      courtLabels: [],
      framing: "both",
      layoutCamera: null,
      courtCamera: null,
      mechanicsCamera: null,
      netSystem: null,
      activeActor: null,
      mechanicsTarget: null,
      cameraAngle: "three-quarter",
      resizeObserver: null,
      intersectionObserver: null,
      mutationObserver: null,
      reducedQuery: window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null
    };

    function announce(message) {
      ui.announcer.textContent = "";
      window.setTimeout(function () {
        if (!player.destroyed) ui.announcer.textContent = translated(message);
      }, 20);
    }

    function updatePlayButton() {
      var label = player.userPaused ? "Play" : "Pause";
      ui.pause.setAttribute("aria-label", translated(label));
      ui.pause.querySelector("span").textContent = translated(label);
      ui.pause.querySelector("svg").innerHTML = player.userPaused
        ? "<path d='m8 5 11 7-11 7z'/>"
        : "<path d='M8 5v14M16 5v14'/>";
      ui.root.classList.toggle("is-paused", player.userPaused);
    }

    function updateSpeedButtons() {
      Array.prototype.forEach.call(ui.speed.querySelectorAll("button"), function (button) {
        var active = Number(button.getAttribute("data-speed")) === player.speed;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    function shouldAnimate() {
      return player.initialized && !player.destroyed && !player.userPaused && !player.scrubbing &&
        !player.autoPaused && !document.hidden;
    }

    function phaseProgress(phase, authoredTime) {
      return clamp((authoredTime - phase.start) / Math.max(0.001, phase.duration), 0, 1);
    }

    function updatePhaseUi(phase, force) {
      var progress = clamp(player.authoredTime / compiled.durationSeconds, 0, 1);
      if (!player.scrubbing) ui.scrubber.value = String(Math.round(progress * 1000));
      ui.scrubber.style.setProperty("--coachcam-progress", (progress * 100).toFixed(3) + "%");
      ui.scrubber.setAttribute("aria-valuetext", translated(phase.label + ", " +
        formatTime(player.authoredTime) + " of " + formatTime(compiled.durationSeconds)));
      ui.time.textContent = formatTime(player.authoredTime) + " / " + formatTime(compiled.durationSeconds);
      if (!force && player.phaseId === phase.id) return;
      player.phaseId = phase.id;
      ui.root.setAttribute("data-phase", phase.id);
      ui.phaseStatus.textContent = translated(phase.label + " · " + phase.mechanic);
      ui.phaseTitle.textContent = translated(phase.mechanic);
      ui.cue.textContent = translated(phase.instruction);
      ui.safetyKey.textContent = translated(phase.cue);
      ui.formationValue.textContent = translated(phase.plan.actors.length + " people · " +
        (equipmentKeys(phase.plan).join(" · ") || "court only"));
      ui.setupNote.textContent = translated(phase.plan.presentation && phase.plan.presentation.exampleNote || "");
      ui.setupNote.hidden = !ui.setupNote.textContent;
      var courtSmall = ui.courtView.querySelector("small");
      var mechanicsSmall = ui.mechanicsView.querySelector("small");
      if (courtSmall) courtSmall.textContent = translated(phase.plan.actors.length + " people · exact drill positions");
      if (mechanicsSmall) mechanicsSmall.textContent = translated(phase.mechanic);
      Array.prototype.forEach.call(ui.phaseRail.children, function (button) {
        var active = button.getAttribute("data-phase") === phase.id;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
        if (active && !player.scrubbing && ui.phaseRail.scrollTo) {
          var railLeft = ui.phaseRail.scrollLeft;
          var railRight = railLeft + ui.phaseRail.clientWidth;
          if (button.offsetLeft < railLeft || button.offsetLeft + button.offsetWidth > railRight) {
            ui.phaseRail.scrollTo({
              left: button.offsetLeft + button.offsetWidth / 2 - ui.phaseRail.clientWidth / 2,
              behavior: "smooth"
            });
          }
        }
      });
    }

    function findNamed(root, exactName, pattern, cameraOnly) {
      var exact = root.getObjectByName(exactName);
      if (exact && (!cameraOnly || exact.isCamera)) return exact;
      var found = null;
      root.traverse(function (object) {
        if (!found && (!cameraOnly || object.isCamera) && pattern.test(object.name || "")) found = object;
      });
      return found;
    }

    function detachNamed(root, exactName) {
      var found = root.getObjectByName(exactName);
      if (found && found.parent) found.parent.remove(found);
      return found;
    }

    function parseManifest(model) {
      var encoded = model.userData && model.userData.motion_manifest_json;
      if (!encoded) {
        var rig = model.getObjectByName(CONTRACT.rig);
        encoded = rig && rig.userData && rig.userData.motion_manifest_json;
      }
      var parsed = encoded ? JSON.parse(encoded) : null;
      if (!parsed || Object.keys(parsed).length !== CONTRACT.motionCount) {
        throw new Error("CoachCam motion manifest is incomplete");
      }
      MOTION_IDS.forEach(function (id) {
        if (!parsed[id] || !(parsed[id].durationSeconds > 0)) {
          throw new Error("CoachCam motion segment is missing: " + id);
        }
      });
      return parsed;
    }

    function cloneOwnedMaterial(material) {
      var copy = material.clone();
      copy.userData = Object.assign({}, copy.userData, { coachCamOwnedMaterial: true });
      return copy;
    }

    function applyAppearance(root, actor, index) {
      var colors = [0xff6542, 0x4f7dea, 0x28d4b5, 0xf0a85b, 0xb878e6, 0x68b989];
      var color = actor.team === "coach" || actor.support ? 0x183d62
        : actor.team === "b" ? 0x4f7dea : colors[index % colors.length];
      root.traverse(function (object) {
        if (!object.isMesh || !object.material) return;
        var materials = Array.isArray(object.material) ? object.material : [object.material];
        var copies = materials.map(function (material) {
          var copy = cloneOwnedMaterial(material);
          if (/rally.?coral|team.?blue|jersey/i.test(copy.name || "")) copy.color.setHex(color);
          return copy;
        });
        object.material = Array.isArray(object.material) ? copies : copies[0];
        object.castShadow = !actor.support || index < 6;
        object.receiveShadow = true;
      });
    }

    function makeLabelSprite(THREE, actor) {
      var canvas = document.createElement("canvas");
      canvas.width = 384;
      canvas.height = 96;
      var context = canvas.getContext("2d");
      var label = clean(actor.label) || clean(actor.role) || "Athlete";
      if (label.length > 22) label = label.slice(0, 21) + "…";
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = actor.team === "b" ? "rgba(31,61,112,.94)"
        : actor.team === "coach" || actor.support ? "rgba(13,28,45,.94)" : "rgba(255,101,66,.94)";
      context.beginPath();
      if (context.roundRect) context.roundRect(8, 8, 368, 80, 24);
      else context.rect(8, 8, 368, 80);
      context.fill();
      context.strokeStyle = "rgba(255,255,255,.72)";
      context.lineWidth = 3;
      context.stroke();
      context.fillStyle = "#ffffff";
      context.font = "700 34px system-ui, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(label, 192, 49, 340);
      var texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.userData.coachCamOwnedTexture = true;
      var material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
      material.userData.coachCamOwnedMaterial = true;
      var sprite = new THREE.Sprite(material);
      sprite.name = "ActorLabel_" + actor.id;
      sprite.position.set(0, 2.25, 0);
      sprite.scale.set(1.65, 0.41, 1);
      sprite.renderOrder = 30;
      return sprite;
    }

    function mapPoint(plan, point, vertical) {
      var pointOnCourt = mappedPoint(plan, point);
      return new player.runtime.THREE.Vector3(pointOnCourt[0], vertical || 0, pointOnCourt[1]);
    }

    function routePoints(plan, route, vertical) {
      return [route.from].concat(list(route.via), [route.to]).filter(function (point) {
        return Array.isArray(point) && point.length >= 2;
      }).map(function (point) { return mapPoint(plan, point, vertical); });
    }

    function pointOnPolyline(points, progress, target) {
      target = target || new player.runtime.THREE.Vector3();
      if (!points.length) return target.set(0, 0, 0);
      if (points.length === 1) return target.copy(points[0]);
      var lengths = [];
      var total = 0;
      for (var index = 1; index < points.length; index++) {
        var length = points[index - 1].distanceTo(points[index]);
        lengths.push(length);
        total += length;
      }
      var distance = clamp(progress, 0, 1) * total;
      for (var segment = 0; segment < lengths.length; segment++) {
        if (distance <= lengths[segment] || segment === lengths.length - 1) {
          var amount = lengths[segment] ? distance / lengths[segment] : 0;
          return target.lerpVectors(points[segment], points[segment + 1], clamp(amount, 0, 1));
        }
        distance -= lengths[segment];
      }
      return target.copy(points[points.length - 1]);
    }

    function routeDirection(points, progress, target) {
      var ahead = pointOnPolyline(points, clamp(progress + 0.018, 0, 1), new player.runtime.THREE.Vector3());
      var behind = pointOnPolyline(points, clamp(progress - 0.018, 0, 1), new player.runtime.THREE.Vector3());
      target = target || new player.runtime.THREE.Vector3();
      return target.subVectors(ahead, behind).setY(0).normalize();
    }

    function facingYaw(actor) {
      var facing = clean(actor.authored && actor.authored.facing).toLowerCase();
      if (/south/.test(facing)) return Math.PI;
      if (/east/.test(facing)) return -Math.PI / 2;
      if (/west/.test(facing)) return Math.PI / 2;
      if (actor.team === "b") return Math.PI;
      return 0;
    }

    function clearDrillGroup() {
      if (!player.drillGroup) return;
      player.actorList.forEach(function (entry) {
        if (entry.mixer) {
          entry.mixer.stopAllAction();
          entry.mixer.uncacheRoot(entry.root);
        }
      });
      player.drillGroup.traverse(function (object) {
        if (object.geometry && (object.geometry.userData.coachCamOwnedGeometry || object.userData.coachCamOwnedGeometry)) object.geometry.dispose();
        var materials = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : [];
        materials.forEach(function (material) {
          if (!material || !material.userData || !material.userData.coachCamOwnedMaterial) return;
          if (material.map && material.map.userData && material.map.userData.coachCamOwnedTexture) material.map.dispose();
          material.dispose();
        });
      });
      player.scene.remove(player.drillGroup);
      player.drillGroup = null;
      player.actors = {};
      player.actorList = [];
      player.routeVisuals = {};
      player.ballPool = [];
      player.equipment = [];
      player.wearables = [];
      player.courtLabels = [];
      player.activeActor = null;
    }

    function createActor(phase, actor, index) {
      var THREE = player.runtime.THREE;
      var root = player.runtime.cloneSkeleton(player.athletePrototype);
      root.name = "DrillActor_" + actor.id;
      root.visible = true;
      root.position.set(0, 0, 0);
      root.rotation.set(0, facingYaw(actor), 0);
      root.scale.setScalar(actor.support ? 0.96 : 1);
      applyAppearance(root, actor, index);
      var home = mapPoint(phase.plan, [actor.x, actor.y], 0);
      root.position.copy(home);
      var label = makeLabelSprite(THREE, actor);
      label.layers.set(1);
      root.add(label);

      var ringGeometry = new THREE.RingGeometry(0.38, 0.47, 32);
      ringGeometry.userData.coachCamOwnedGeometry = true;
      var ringMaterial = new THREE.MeshBasicMaterial({
        color: actor.team === "b" ? 0x4f7dea : actor.team === "coach" || actor.support ? 0x28d4b5 : 0xff6542,
        transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false
      });
      ringMaterial.userData.coachCamOwnedMaterial = true;
      var ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.name = "ActorSpot_" + actor.id;
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.035;
      ring.renderOrder = 5;
      root.add(ring);

      var mixer = new THREE.AnimationMixer(root);
      var action = mixer.clipAction(player.clip);
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.play();
      var entry = {
        data: actor, root: root, home: home, mixer: mixer, action: action,
        ring: ring, label: label, currentMotion: "ready", currentProgress: 0,
        currentRoute: "", contactPoints: {}
      };
      player.actors[actor.id] = entry;
      player.actorList.push(entry);
      player.drillGroup.add(root);
      return entry;
    }

    function createRouteVisual(phase, route) {
      if (route.type === "move" && list(phase.plan.beats).some(function (beat) {
        return beat.routeId === route.id && stationMotion(beat.motionId);
      })) return;
      var THREE = player.runtime.THREE;
      var points = routePoints(phase.plan, route, 0.055);
      if (points.length < 2) return;
      var geometry = new THREE.BufferGeometry().setFromPoints(points);
      geometry.userData.coachCamOwnedGeometry = true;
      var material = new THREE.LineDashedMaterial({
        color: route.type === "move" ? 0x28d4b5 : 0xff8060,
        transparent: true, opacity: 0.20, dashSize: 0.22, gapSize: 0.15,
        depthWrite: false
      });
      material.userData.coachCamOwnedMaterial = true;
      var line = new THREE.Line(geometry, material);
      line.name = "DrillRoute_" + route.id;
      line.computeLineDistances();
      line.renderOrder = 4;
      player.drillGroup.add(line);

      var coneGeometry = new THREE.ConeGeometry(0.11, 0.32, 18);
      coneGeometry.userData.coachCamOwnedGeometry = true;
      var coneMaterial = material.clone();
      coneMaterial.userData.coachCamOwnedMaterial = true;
      var arrow = new THREE.Mesh(coneGeometry, coneMaterial);
      arrow.name = "DrillRouteArrow_" + route.id;
      arrow.position.copy(points[points.length - 1]);
      var direction = points[points.length - 1].clone().sub(points[points.length - 2]).normalize();
      arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      arrow.renderOrder = 4;
      player.drillGroup.add(arrow);
      player.routeVisuals[route.id] = { route: route, line: line, arrow: arrow, points: points };
      var stepCount = route.authored && route.authored.stepCount;
      if (route.type === "move" && stepCount > 0) {
        var distance = points.reduce(function (sum, point, i) { return sum + (i ? point.distanceTo(points[i - 1]) : 0); }, 0);
        var stepLabel = makeLabelSprite(THREE, { id: route.id, label: stepCount + " steps · " + distance.toFixed(1) + " m", team: "coach" });
        pointOnPolyline(points, 0.5, stepLabel.position);
        stepLabel.position.y = 0.45;
        stepLabel.layers.set(1);
        player.drillGroup.add(stepLabel);
      }
    }

    function equipmentAnchor(phase) {
      var actor = list(phase.plan.actors).find(function (item) { return !item.support; }) || phase.plan.actors[0];
      return actor ? mapPoint(phase.plan, [actor.x, actor.y], 0) : new player.runtime.THREE.Vector3();
    }

    function placeEquipment(phase, key, prototype, index, placement) {
      if (!prototype || /^(net|balls|medicine ball|reaction ball)$/.test(key)) return null;
      var root = prototype.clone(true);
      root.name = "DrillEquipment_" + slug(key);
      root.visible = true;
      root.position.set(0, 0, 0);
      root.rotation.set(0, 0, 0);
      var anchor = equipmentAnchor(phase);
      if (key === "wall") {
        // Wall drills are taught from three-to-five feet away. Keep the full
        // group at its authored spots and bring the training wall to that
        // station instead of marooning it at the opposite end line.
        root.position.set(0, 0, anchor.z - 1.55);
      }
      else if (key === "agility ladder") {
        var movement = list(phase.plan.routes).find(function (route) { return route.type === "move"; });
        if (movement) {
          var points = routePoints(phase.plan, movement, 0);
          pointOnPolyline(points, 0.5, root.position);
          var direction = routeDirection(points, 0.5, new player.runtime.THREE.Vector3());
          root.rotation.y = Math.atan2(-direction.x, -direction.z);
        } else root.position.copy(anchor);
        root.scale.setScalar(0.78);
      } else if (key === "cones") {
        root.position.copy(anchor).add(new player.runtime.THREE.Vector3(0, 0, 1.1));
      } else if (key === "mats") {
        root.position.copy(anchor).add(new player.runtime.THREE.Vector3(0, 0, 0.32));
      } else if (key === "box") {
        var boxBeat = list(phase.plan.beats).find(function (beat) { return /^(box|box-hit|box-block|depth-drop)$/.test(beat.motionId); });
        var demonstrator = boxBeat && player.actors[boxBeat.actorId];
        var segment = boxBeat && player.motionManifest[boxBeat.motionId];
        if (demonstrator && segment && segment.equipmentAnchor) {
          actorTransform(demonstrator, phase, 0);
          var at = segment.equipmentAnchor;
          root.position.copy(new player.runtime.THREE.Vector3(at[0], at[2], -at[1])
            .applyQuaternion(demonstrator.root.quaternion).add(demonstrator.home));
          root.quaternion.copy(demonstrator.root.quaternion);
          root.scale.set(1, (segment.boxHeight || 0.32) / 0.8, 1);
        } else root.position.copy(anchor).add(new player.runtime.THREE.Vector3(0.75, 0, 0.15));
      } else if (key === "hoops") {
        var route = phase.plan.routes[0];
        root.position.copy(route ? mapPoint(phase.plan, route.to, 0) : anchor);
      } else {
        root.position.copy(anchor).add(new player.runtime.THREE.Vector3((index % 2 ? 0.62 : -0.62), 0, 0.42));
      }
      if (placement && key !== "box") {
        root.position.copy(mapPoint(phase.plan, [placement.x, placement.y], placement.elevation || 0));
        if (finite(placement.rotation)) root.rotation.y = placement.rotation * Math.PI / 180;
        // Prototype dimensions are fitted to the authored station footprint.
        if (placement.w > 0 && placement.h > 0 && /^(mats|agility ladder|wall)$/.test(key)) {
          var nativeBox = new player.runtime.THREE.Box3().setFromObject(root);
          var nativeSize = nativeBox.getSize(new player.runtime.THREE.Vector3());
          var space = courtSpace(phase.plan);
          if (key === "wall") {
            root.rotation.y = placement.h > placement.w ? Math.PI / 2 : 0;
            root.scale.x = Math.max(placement.w * space.scaleX, placement.h * space.scaleY) / 8.2;
          } else if (nativeSize.x > 0.01) root.scale.x *= placement.w * space.scaleX / nativeSize.x;
          if (key !== "wall" && nativeSize.z > 0.01) root.scale.z *= placement.h * space.scaleY / nativeSize.z;
        }
      }
      root.traverse(function (object) {
        if (object.isMesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });
      var entry = { key: key, root: root, anchor: anchor };
      player.equipment.push(entry);
      player.drillGroup.add(root);
      return entry;
    }

    function createPresentation(phase) {
      var THREE = player.runtime.THREE;
      var renderer = RR.coachCamEquipment3D;
      var presentation = phase.plan.presentation || {};
      var space = courtSpace(phase.plan);
      var handled = {};
      function labelAt(label, position, id) {
        if (!clean(label)) return;
        var sprite = makeLabelSprite(THREE, { id: id, label: translated(label), team: "coach" });
        sprite.name = "CourtLabel_" + id;
        sprite.position.copy(position).setY(position.y + 0.28);
        sprite.scale.set(2.8, 0.7, 1);
        sprite.layers.set(1);
        player.courtLabels.push(sprite);
        player.drillGroup.add(sprite);
      }
      function target(type, spec, id) {
        var object = renderer.createCourtTarget(THREE, {
          type: type, width: (spec.w || 0.8) * space.scaleX,
          depth: (spec.h || 0.8) * space.scaleY,
          radius: (spec.r || spec.radius || (type === "cone" ? 0.13 : 0.45)) * Math.min(space.scaleX, space.scaleY),
          shape: spec.shape,
          spaces: spec.spaces || spec.rungs,
          color: spec.tone === "a" ? 0xff7444 : spec.tone === "b" ? 0x689dff : 0xf9d65c,
          boundaryOnly: spec.boundaryOnly === true
        });
        object.name = "CourtProp_" + id;
        object.position.copy(mapPoint(phase.plan, [spec.x, spec.y], (spec.elevation || 0) + 0.025));
        if (spec.vertical) object.rotation.x = Math.PI / 2;
        player.drillGroup.add(object);
        player.equipment.push({ key: type, root: object, authored: spec });
        if (!/^(cone|hoop|target)$/i.test(clean(spec.label))) {
          var labelPosition = object.position.clone();
          if (type === "hoop" && !spec.vertical) labelPosition.z += (spec.r || 0.45) * Math.min(space.scaleX, space.scaleY) + 0.44;
          if (type === "ball-cart") labelPosition.z += 0.85;
          labelAt(spec.label, labelPosition, id);
        }
        return object;
      }
      list(presentation.zones).forEach(function (zone, index) {
        target(zone.markerKind === "hoop" ? "hoop" : "zone", Object.assign({}, zone, {
          x: zone.x + zone.w / 2, y: zone.y + zone.h / 2,
          r: (zone.diameterMeters || Math.min(zone.w * space.scaleX, zone.h * space.scaleY)) / (2 * Math.min(space.scaleX, space.scaleY))
        }), zone.id || "zone-" + index);
        if (zone.markerKind === "hoop") handled.hoops = true;
      });
      list(presentation.lines).forEach(function (line, index) {
        var b = presentation.bounds;
        if (finite(line.y)) target("zone", { x: finite(line.x) ? line.x + (line.w || 0) / 2 : (b.minX + b.maxX) / 2,
          y: line.y, w: line.w || b.maxX - b.minX, h: 0.035 / space.scaleY, boundaryOnly: true, tone: "b" }, "line-" + index);
        else if (finite(line.x)) target("zone", { x: line.x, y: (b.minY + b.maxY) / 2,
          w: 0.035 / space.scaleX, h: line.h || b.maxY - b.minY, boundaryOnly: true, tone: "b" }, "line-" + index);
      });
      list(presentation.labels).forEach(function (label, index) {
        if (finite(label.x) && finite(label.y)) labelAt(label.text || label.label, mapPoint(phase.plan, [label.x, label.y], 0), "authored-label-" + index);
      });
      list(presentation.boundaries).forEach(function (rect, index) {
        target("zone", { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2, w: rect.w, h: rect.h,
          tone: "b", boundaryOnly: true }, "boundary-" + index);
      });
      list(presentation.props).forEach(function (prop, index) {
        var aliases = { cone: "cones", hoop: "hoops", mat: "mats", ladder: "agility ladder", "plyo-box": "box", target: "hoops" };
        var key = aliases[prop.type] || prop.type;
        if (key === "mini bands" || key === "bands" || key === "jump ropes" || key === "net" || key === "balls") return;
        if (/^(cones|hoops|zone|target|ball-cart|agility ladder)$/.test(key)) {
          target(key === "cones" ? "cone" : key === "agility ladder" ? "agility-ladder" : /^(zone|ball-cart)$/.test(key) ? key : "hoop", prop, prop.id || "prop-" + index);
          handled[key] = true;
        } else if (player.equipmentPrototypes[key]) {
          if (!finite(prop.x) || !finite(prop.y)) return;
          var entry = placeEquipment(phase, key, player.equipmentPrototypes[key], index, prop);
          if (entry) labelAt(prop.label, entry.root.position, prop.id || "prop-" + index);
          handled[key] = true;
        }
      });
      // A zone marked out by cones needs physical corner markers at its saved
      // boundaries, not one unrelated cone pile next to the server.
      if (!handled.cones && equipmentKeys(phase.plan).indexOf("cones") !== -1 && list(presentation.zones).length) {
        list(presentation.zones).forEach(function (zone, index) {
          [[zone.x, zone.y], [zone.x + zone.w, zone.y], [zone.x, zone.y + zone.h], [zone.x + zone.w, zone.y + zone.h]].forEach(function (point, corner) {
            target("cone", { x: point[0], y: point[1] }, "zone-cone-" + index + "-" + corner);
          });
        });
        handled.cones = true;
      }
      list(presentation.nets).forEach(function (net, index) {
        if (!player.netSystem) return;
        var object = player.netSystem.clone(true);
        object.name = "CourtNet_" + index;
        object.visible = true;
        object.position.copy(mapPoint(phase.plan, [net.x + net.w / 2, net.y], 0));
        object.scale.set(net.w * space.scaleX / 9, (net.heightMeters || 2.43) / 2.43, 1);
        player.drillGroup.add(object);
        player.equipment.push({ key: "net", root: object, authored: net });
      });
      ui.root.setAttribute("data-visible-zones", String(list(presentation.zones).length));
      return handled;
    }

    function createWearables(phase, keys) {
      var text = [compiled.drill.setup].concat(list(compiled.drill.steps)).join(" ");
      keys.filter(function (key) { return /^(mini bands|bands|jump ropes)$/.test(key); }).forEach(function (key) {
        var pattern = key === "mini bands" ? /^(mini-band|bridge)$/ : key === "bands" ? /^band/ : /^jump-rope$/;
        var assigned = list(phase.plan.presentation && phase.plan.presentation.props).filter(function (prop) {
          var type = prop.type === "mini-band" ? "mini bands" : prop.type;
          return type === key && prop.actorId;
        });
        var eligible = assigned.length ? player.actorList.filter(function (actor) {
          return assigned.some(function (prop) { return prop.actorId === actor.data.id; });
        }) : player.actorList.filter(function (actor) {
          return !actor.data.support && list(phase.plan.beats).some(function (beat) { return beat.actorId === actor.data.id && pattern.test(beat.motionId); });
        });
        if (!eligible.length) eligible = player.actorList.filter(function (actor) { return !actor.data.support; });
        eligible.forEach(function (actor) {
          var assignedProp = assigned.find(function (prop) { return prop.actorId === actor.data.id; }) || {};
          var recipes = {};
          var beats = list(phase.plan.beats).filter(function (beat) { return beat.actorId === actor.data.id; });
          if (!beats.length) beats = [{ motionId: "ready" }];
          beats.forEach(function (beat) {
            var segment = poseSegment(actor, beat.motionId, beat.variantId);
            var rows = /\brows?\b/i.test(phase.instruction);
            var anchoredSwing = /band-arm-speed/.test(compiled.drill.id) && /resisted|anchor/i.test(phase.instruction);
            var options = Object.assign({
              placement: assignedProp.attachment || (/band.{0,30}(?:around|above|at)\s+(?:the\s+)?ankles/i.test(text) ? "ankles" : "above-knees"),
              mode: key === "bands" && rows ? "anchored" : anchoredSwing ? "anchored-single" : "handheld"
            }, key === "bands" ? segment.equipment || {} : {});
            var identity = JSON.stringify(options);
            if (!recipes[identity]) recipes[identity] = { options: options, variants: [] };
            recipes[identity].variants.push(beat.variantId || "");
          });
          Object.keys(recipes).forEach(function (identity) {
            var recipe = recipes[identity];
            if (recipe.options.anchor) {
              var at = recipe.options.anchor;
              recipe.options.anchor = new player.runtime.THREE.Vector3(at[0], at[2], -at[1])
                .applyQuaternion(actor.root.quaternion).add(actor.home);
            }
            var wearable = RR.coachCamEquipment3D.createWearable(player.runtime.THREE, key, recipe.options);
            wearable.actor = actor;
            wearable.key = key;
            wearable.variantIds = recipe.variants;
            player.wearables.push(wearable);
            player.drillGroup.add(wearable.root);
            wearable.update(actor);
          });
        });
      });
    }

    function ensureBall(index) {
      var ball = player.ballPool[index];
      if (ball) return ball;
      var prototype = player.equipmentPrototypes[player.ballKind] || player.ballPrototype;
      ball = player.ballKind === "balloon" ? RR.coachCamEquipment3D.createCourtTarget(player.runtime.THREE, { type: "balloon" }) : prototype.clone(true);
      ball.name = "AnimatedBall_" + (index + 1);
      ball.visible = false;
      ball.position.set(0, 0, 0);
      ball.scale.setScalar(1.08);
      ball.traverse(function (object) {
        if (object.isMesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });
      player.ballPool.push(ball);
      player.drillGroup.add(ball);
      return ball;
    }

    function configureNet(phase) {
      if (!player.netSystem) return;
      var keys = equipmentKeys(phase.plan);
      var usesWall = keys.indexOf("wall") !== -1;
      var savedCopy = [compiled.drill.setup, phase.instruction].map(clean).join(" ").toLowerCase();
      // Skill alone does not imply a net: pancakes, open-area passing, and
      // fitness defense work are still volleyball drills. Show it only when
      // the saved equipment/copy actually calls for one.
      player.netSystem.visible = !usesWall && !list(phase.plan.presentation && phase.plan.presentation.nets).length &&
        (keys.indexOf("net") !== -1 || /\bnet\b/.test(savedCopy));
    }

    function activatePhase(phase) {
      clearDrillGroup();
      player.drillGroup = new player.runtime.THREE.Group();
      player.drillGroup.name = "CompiledDrill_" + compiled.drill.id + "_Phase_" + (phase.index + 1);
      player.scene.add(player.drillGroup);
      list(phase.plan.actors).forEach(function (actor, index) { createActor(phase, actor, index); });
      list(phase.plan.routes).forEach(function (route) { createRouteVisual(phase, route); });
      var handled = createPresentation(phase);
      var keys = equipmentKeys(phase.plan);
      player.ballKind = keys.indexOf("medicine ball") !== -1 ? "medicine ball" : keys.indexOf("reaction ball") !== -1 ? "reaction ball" : "balls";
      if (/^(balloon-keep-it-up|shepherd-and-sheep)$/.test(compiled.drill.id)) player.ballKind = "balloon";
      ui.root.setAttribute("data-ball-kind", player.ballKind);
      keys.forEach(function (key, index) {
        if (!handled[key] && !/^(mini bands|bands|jump ropes)$/.test(key)) placeEquipment(phase, key, player.equipmentPrototypes[key], index);
      });
      createWearables(phase, keys);
      ensureBall(0);
      configureNet(phase);
      player.phaseIndex = phase.index;
      ui.root.setAttribute("data-visible-actors", String(player.actorList.length));
      ui.root.setAttribute("data-visible-equipment", String(player.equipment.length + player.wearables.length));
      ui.root.setAttribute("data-visible-wearables", String(player.wearables.length));
    }

    function routeFor(phase, beat) {
      return list(phase.plan.routes).find(function (route) { return route.id === beat.routeId; }) || null;
    }

    function poseSegment(entry, motionId, variantId) {
      var segment = player.motionManifest[motionId] || player.motionManifest.ready;
      if (variantId && segment.variants && segment.variants[variantId]) return segment.variants[variantId];
      var posture = clean(entry.data.authored && entry.data.authored.posture);
      return segment.postures && segment.postures[posture] || segment;
    }

    function motionSample(entry, motionId, progress, variant) {
      var segment = variant || poseSegment(entry, motionId);
      var sample = sampleTime(segment, progress);
      entry.action.paused = false;
      entry.mixer.setTime(sample);
      entry.action.paused = true;
      entry.currentMotion = motionId;
      entry.currentProgress = progress;
      entry.currentSegment = segment;
    }

    function activeBeats(phase, planTimeMs) {
      return list(phase.plan.beats).filter(function (beat) {
        return planTimeMs >= beat.startMs && planTimeMs < beat.endMs;
      });
    }

    function updateRoutes(active) {
      var activeIds = {};
      active.forEach(function (beat) { if (beat.routeId) activeIds[beat.routeId] = true; });
      Object.keys(player.routeVisuals).forEach(function (id) {
        var visual = player.routeVisuals[id];
        var isActive = !!activeIds[id];
        visual.line.material.opacity = isActive ? 0.95 : 0.16;
        visual.arrow.material.opacity = isActive ? 0.95 : 0.14;
        visual.line.material.color.setHex(isActive ? 0xff7444 :
          (visual.route.type === "move" ? 0x28d4b5 : 0x8aa4b8));
        visual.arrow.material.color.copy(visual.line.material.color);
        visual.line.material.dashSize = isActive ? 0.30 : 0.20;
        visual.line.material.needsUpdate = true;
      });
    }

    function actorTransform(entry, phase, planTimeMs) {
      var THREE = player.runtime.THREE;
      var beats = list(phase.plan.beats).filter(function (beat) { return beat.actorId === entry.data.id; });
      var movement = beats.filter(function (beat) {
        var route = routeFor(phase, beat);
        return beat.startMs <= planTimeMs && route && route.type === "move" && !stationMotion(beat.motionId) && !finite(beat.freezeProgress);
      }).pop();
      entry.root.position.copy(entry.home);
      var initialYaw = facingYaw(entry.data);
      // Both partners face the actual exchange, including the person waiting.
      var exchange = list(phase.plan.contacts).find(function (contact) {
        return contact.sourceActorId === entry.data.id || contact.recipientActorId === entry.data.id;
      });
      if (exchange) {
        var otherId = exchange.sourceActorId === entry.data.id ? exchange.recipientActorId : exchange.sourceActorId;
        var other = player.actors[otherId];
        var toward = other ? other.home : mapPoint(phase.plan, exchange.to, 0);
        var facing = toward.clone().sub(entry.home);
        if (facing.lengthSq() > 0.01) initialYaw = Math.atan2(-facing.x, -facing.z);
      }
      entry.root.rotation.y = initialYaw;
      if (movement) {
        var route = routeFor(phase, movement);
        var points = routePoints(phase.plan, route, 0);
        var progress = clamp((planTimeMs - movement.startMs) / movement.durationMs, 0, 1);
        var travel = travelProgress(progress);
        if (finite(movement.routeStartProgress) && finite(movement.routeEndProgress)) {
          travel = movement.routeStartProgress + travel * (movement.routeEndProgress - movement.routeStartProgress);
        }
        pointOnPolyline(points, travel, entry.root.position);
        var direction = routeDirection(points, travel, new THREE.Vector3());
        if (direction.lengthSq() > 0.001) {
          var yaw = routeFacing(movement.motionId, Math.atan2(-direction.x, -direction.z), initialYaw);
          var movementSegment = poseSegment(entry, movement.motionId, movement.variantId);
          var travelAxis = clean(movementSegment.travelAxis).toLowerCase();
          if (movement.motionId !== "shuffle" && movement.motionId !== "mini-band" && travelAxis) {
            yaw = Math.atan2(-direction.x, -direction.z) + (travelAxis === "x" ? Math.PI / 2 : 0);
          }
          entry.root.rotation.y = blendYaw(initialYaw, yaw, travelProgress(progress / 0.16));
        }
        entry.currentRoute = route.id;
      }
      if (!entry.data.support && equipmentKeys(phase.plan).indexOf("mats") !== -1) entry.root.position.y += 0.095;
    }

    function updateActors(phase, planTimeMs, active) {
      var THREE = player.runtime.THREE;
      var activeByActor = {};
      active.forEach(function (beat) {
        var route = routeFor(phase, beat);
        if (beat.actorId && (!activeByActor[beat.actorId] || player.ballKind === "balloon" && route && route.type === "move")) activeByActor[beat.actorId] = beat;
      });
      player.activeActor = null;
      player.actorList.forEach(function (entry, index) {
        var beat = activeByActor[entry.data.id];
        entry.currentBeat = beat || null;
        var completed = list(phase.plan.beats).filter(function (item) {
          return item.actorId === entry.data.id && item.endMs <= planTimeMs;
        }).pop();
        // Keep the actual finish pose until the next instruction. In
        // particular, a floor save must never pop upright while waiting.
        var motionId = beat ? beat.motionId : completed ? completed.motionId : "ready";
        var progress = beat ? clamp((planTimeMs - beat.startMs) / Math.max(1, beat.durationMs), 0, 1)
          : completed ? 1 : ((player.authoredTime * (0.55 + index * 0.015)) % player.motionManifest.ready.durationSeconds) /
            player.motionManifest.ready.durationSeconds;
        var chosenBeat = beat || completed;
        entry.currentVariantId = chosenBeat && chosenBeat.variantId || "";
        var segment = poseSegment(entry, motionId, chosenBeat && chosenBeat.variantId);
        var route = (beat || completed) && routeFor(phase, beat || completed);
        actorTransform(entry, phase, planTimeMs);
        entry.root.scale.x = Math.abs(entry.root.scale.x);
        if (route && route.type === "move" && clean(segment.travelAxis).toLowerCase() === "x") {
          var directionPoints = routePoints(phase.plan, route, 0);
          var directionProgress = travelProgress(progress);
          if (finite(chosenBeat.routeStartProgress) && finite(chosenBeat.routeEndProgress)) directionProgress = chosenBeat.routeStartProgress + directionProgress * (chosenBeat.routeEndProgress - chosenBeat.routeStartProgress);
          var localDirection = routeDirection(directionPoints, directionProgress, new THREE.Vector3())
            .applyQuaternion(entry.root.quaternion.clone().invert());
          if (Math.abs(localDirection.z) > Math.abs(localDirection.x) && segment.directionalVariants) {
            segment = segment.directionalVariants[localDirection.z < 0 ? "forward" : "backward"] || segment;
          } else if (localDirection.x < 0 && segment.mirrorForReverse) {
            entry.root.scale.x = -Math.abs(entry.root.scale.x);
          }
        }
        if (route && route.type === "move" && segment.cyclic && segment.strideMeters > 0) {
          var points = routePoints(phase.plan, route, 0);
          var distance = points.reduce(function (sum, point, i) {
            return sum + (i ? point.distanceTo(points[i - 1]) : 0);
          }, 0);
          if (finite(chosenBeat.routeStartProgress) && finite(chosenBeat.routeEndProgress)) distance *= chosenBeat.routeEndProgress - chosenBeat.routeStartProgress;
          progress = (travelProgress(progress) * distance / segment.strideMeters) % 1;
        } else if (chosenBeat && chosenBeat.repetitions > 1 && progress < 1) {
          progress = (progress * chosenBeat.repetitions) % 1;
        }
        if (chosenBeat && finite(chosenBeat.freezeProgress)) progress = clamp(chosenBeat.freezeProgress, 0, 1);
        var posture = clean(entry.data.authored && entry.data.authored.posture);
        var restingPose = player.motionManifest.ready.postures && player.motionManifest.ready.postures[posture];
        if (restingPose && (!route || route.type !== "move") && segment === player.motionManifest[motionId]) { segment = restingPose; progress = 0; }
        motionSample(entry, motionId, progress, segment);
        entry.root.updateMatrixWorld(true);
        var head = entry.root.getObjectByName("ATH_JOINT_NECK");
        if (head) {
          var headLocal = entry.root.worldToLocal(head.getWorldPosition(new THREE.Vector3()));
          entry.label.position.set(headLocal.x, headLocal.y + 0.64, headLocal.z);
        }
        var activeActor = !!beat;
        entry.ring.material.opacity = activeActor ? 0.92 : 0.30;
        entry.ring.scale.setScalar(activeActor ? 1.18 : 1);
        if (!player.activeActor && activeActor) player.activeActor = entry;
      });
      if (!player.activeActor) {
        player.activeActor = player.actorList.find(function (entry) { return !entry.data.support; }) || player.actorList[0] || null;
      }
    }

    function contactFor(phase, beat) {
      return list(phase.plan.contacts).find(function (contact) { return contact.id === beat.contactId; });
    }

    function bodyContact(entry, motionId, hand) {
      var THREE = player.runtime.THREE;
      var segment = player.motionManifest[motionId] || {};
      var singleHand = !!hand || segment.contactType === "right-hand" ||
        /^(one-arm-save|serve|underhand|attack|down-ball-hit|tip-roll|jump-float|jump-topspin)$/.test(motionId);
      entry.root.updateMatrixWorld(true);
      function joint(name) {
        var bone = entry.root.getObjectByName("ATH_JOINT_" + name);
        return bone ? bone.getWorldPosition(new THREE.Vector3()) : entry.root.position.clone();
      }
      var point = joint(hand === "left-hand" ? "WRIST_L" : "WRIST_R");
      if (!singleHand) point.add(joint("WRIST_L")).multiplyScalar(0.5);
      if (/^(pass|dig|platform-save|run-through)$/.test(motionId)) {
        var elbows = joint("ELBOW_L").add(joint("ELBOW_R")).multiplyScalar(0.5);
        point.lerp(elbows, 0.28); // Distal forearm surface, clear of the joined hands.
        point.y += 0.16;
      } else if (motionId === "one-arm-save") {
        point.add(new THREE.Vector3(0, 0.14, -0.06).applyQuaternion(entry.root.quaternion));
      } else {
        point.add(new THREE.Vector3(0, /set|block/.test(motionId) ? 0.12 : 0.03, -0.13)
          .applyQuaternion(entry.root.quaternion));
      }
      point.y = Math.max(0.12, point.y);
      return point;
    }

    function contactAnchor(phase, beat, atProgress, hand) {
      var entry = player.actors[beat.actorId];
      if (!entry) {
        var route = routeFor(phase, beat);
        return mapPoint(phase.plan, route && route.from, 1);
      }
      var cacheKey = beat.id + (atProgress == null ? "" : "-" + atProgress + "-" + hand);
      if (entry.contactPoints[cacheKey]) return entry.contactPoints[cacheKey].clone();
      var position = entry.root.position.clone(), rotation = entry.root.quaternion.clone(), scale = entry.root.scale.clone();
      var motion = entry.currentMotion, progress = entry.currentProgress, priorSegment = entry.currentSegment;
      var segment = poseSegment(entry, beat.motionId, beat.variantId);
      var poseProgress = atProgress == null ? contactProgress(segment) : atProgress;
      actorTransform(entry, phase, beat.startMs + beat.durationMs * poseProgress);
      motionSample(entry, beat.motionId, poseProgress, segment);
      var point = bodyContact(entry, beat.motionId, hand);
      entry.contactPoints[cacheKey] = point.clone();
      motionSample(entry, motion, progress, priorSegment);
      entry.root.position.copy(position);
      entry.root.quaternion.copy(rotation);
      entry.root.scale.copy(scale);
      entry.root.updateMatrixWorld(true);
      return point;
    }

    function flight(from, to, progress, height, target) {
      var p = clamp(progress, 0, 1);
      target.lerpVectors(from, to, p);
      target.y += 4 * height * p * (1 - p);
      return target;
    }

    function ballArcHeight(motionId, route) {
      if (/serve|jump-float|jump-topspin/.test(motionId)) return 1.5;
      if (/attack|down-ball/.test(motionId)) return 0.22;
      if (/set/.test(motionId)) return 1.35;
      if (/feed|toss/.test(motionId)) return 0.70;
      if (/pass|dig|save/.test(motionId)) return 0.9;
      return 0.8;
    }

    function updateBalls(phase, active) {
      var THREE = player.runtime.THREE;
      var now = phaseProgress(phase, player.authoredTime) * phase.sourceDurationMs;
      if (player.ballKind === "balloon") {
        var balloonCount = 0;
        player.actorList.forEach(function (actor) {
          var authored = actor.data.authored || {};
          if (actor.data.support || actor.data.team === "b" || authored.balloon === false) return;
          var balloon = ensureBall(balloonCount++);
          balloon.userData.actorId = actor.data.id;
          balloon.userData.contactActorId = null;
          var segment = actor.currentSegment || player.motionManifest.ready;
          var progress = actor.currentProgress;
          var motion = actor.currentMotion;
          var tapping = /^(set|pass|shuffle|warmup)$/.test(motion);
          // Sample the actual tap pose at the moving athlete's current world
          // position. Each cycle floats away and returns to that hand height.
          // Balloon drills do not send a volleyball to a floor-zone endpoint.
          if (tapping) motionSample(actor, motion, contactProgress(segment), segment);
          var anchor = bodyContact(actor, /^(set|pass)$/.test(motion) ? motion : "set");
          anchor.y += 0.13;
          if (tapping) motionSample(actor, motion, progress, segment);
          var cycle = ((progress - contactProgress(segment)) % 1 + 1) % 1;
          balloon.position.copy(anchor);
          balloon.position.y += tapping ? 0.72 * Math.sin(Math.PI * cycle) : 0.22;
          if (!tapping) balloon.position.y = Math.max(balloon.position.y, actor.root.position.y + 2.05);
          if (authored.balloon === "lost") {
            var tap = list(phase.plan.beats).find(function (item) {
              var dog = player.actors[item.actorId];
              return item.motionId === "set" && dog && dog.data.team === "b";
            });
            if (tap) {
              balloon.userData.contactActorId = tap.actorId;
              var tapSegment = poseSegment(player.actors[tap.actorId], tap.motionId, tap.variantId);
              var release = contactTime(tap, tapSegment);
              var tapPoint = contactAnchor(phase, tap).add(new THREE.Vector3(0, 0.13, 0));
              if (now < release) balloon.position.lerp(tapPoint, Math.pow(clamp((now - tap.startMs) / Math.max(1, release - tap.startMs), 0, 1), 3));
              else {
                var loss = travelProgress(clamp((now - release) / Math.max(1, phase.sourceDurationMs - release), 0, 1));
                flight(tapPoint, tapPoint.clone().add(new THREE.Vector3(-1.7, 0, 0)).setY(0.32), loss, 0.2, balloon.position);
              }
            }
          }
          balloon.rotation.set(0, 0, Math.sin(cycle * Math.PI * 2) * 0.09);
          balloon.visible = true;
          actor.root.updateMatrixWorld(true);
        });
        for (var balloonIndex = balloonCount; balloonIndex < player.ballPool.length; balloonIndex++) player.ballPool[balloonIndex].visible = false;
        updateTrainingEquipment();
        return;
      }
      var wall = player.equipment.find(function (entry) { return entry.key === "wall"; });
      var chains = {};
      var carried = {};
      var carriers = active.filter(function (beat) {
        var route = routeFor(phase, beat);
        return route && route.type === "move" && route.authored && route.authored.carriesBall;
      });
      function segmentFor(beat) {
        return player.actors[beat.actorId] ? poseSegment(player.actors[beat.actorId], beat.motionId, beat.variantId) : player.motionManifest[beat.motionId];
      }
      list(phase.plan.beats).forEach(function (beat) {
        var route = routeFor(phase, beat);
        if (!route || route.type === "move" || finite(beat.freezeProgress)) return;
        var key = beat.trackId || (contactFor(phase, beat) || {}).chainId || beat.id;
        var repetitions = beat.repetitions || 1;
        for (var repeat = 0; repeat < repetitions; repeat++) {
          (chains[key] = chains[key] || []).push(repetitions === 1 ? beat : Object.assign({}, beat, {
            id: beat.id + "-contact-" + repeat,
            startMs: beat.startMs + beat.durationMs * repeat / repetitions,
            endMs: beat.startMs + beat.durationMs * (repeat + 1) / repetitions,
            durationMs: beat.durationMs / repetitions, repetitions: 1
          }));
        }
      });
      // A saved self-toss may have no diagram route. Attach it to the next
      // contact by the same athlete so release, flight and set are continuous.
      list(phase.plan.beats).forEach(function (beat) {
        if (beat.routeId || !/^(feed|low-toss)$/.test(beat.motionId)) return;
        var key = Object.keys(chains).find(function (id) {
          var next = chains[id][0];
          return next.actorId === beat.actorId && next.startMs >= beat.endMs;
        });
        if (key) chains[key].unshift(beat);
      });
      var used = 0;
      Object.keys(chains).forEach(function (key) {
        var beats = chains[key].sort(function (a, b) {
          return contactTime(a, segmentFor(a)) - contactTime(b, segmentFor(b));
        });
        var first = beats[0];
        if (now < first.startMs) return;
        var carrier = carriers.find(function (item) { return beats.some(function (beat) { return beat.actorId === item.actorId; }); });
        if (carrier && player.actors[carrier.actorId]) {
          if (!carried[carrier.actorId]) {
            var carryBall = ensureBall(used++);
            carryBall.position.copy(bodyContact(player.actors[carrier.actorId], "feed", "left-hand"));
            carryBall.visible = true;
            carried[carrier.actorId] = true;
          }
          return;
        }
        var lastIndex = -1;
        beats.forEach(function (beat, i) {
          if (now >= contactTime(beat, segmentFor(beat))) lastIndex = i;
        });
        var ball = ensureBall(used++);
        var beat = beats[Math.max(0, lastIndex)];
        var entry = player.actors[beat.actorId];
        var segment = segmentFor(beat);
        var release = contactTime(beat, segment);
        var anchor = contactAnchor(phase, beat);
        if (lastIndex < 0) {
          // A feed is held until release. Strikes/sets have an incoming ball
          // arriving at the authored contact pose, not a ball glued to a wrist.
          if (entry && /^(feed|low-toss)$/.test(beat.motionId)) {
            ball.position.copy(bodyContact(entry, beat.motionId));
          } else if (entry && beat.motionId === "underhand") {
            var preparation = clamp((now - beat.startMs) / Math.max(1, release - beat.startMs), 0, 1);
            ball.position.copy(bodyContact(entry, beat.motionId, "left-hand"))
              .lerp(anchor, travelProgress((preparation - 0.8) / 0.2));
          } else if (entry && /^(serve|jump-float|jump-topspin)$/.test(beat.motionId)) {
            var tossProgress = Math.min(0.20, contactProgress(segment) * 0.4);
            var tossTime = beat.startMs + tossProgress * beat.durationMs;
            if (now < tossTime) ball.position.copy(bodyContact(entry, beat.motionId, "left-hand"));
            else flight(contactAnchor(phase, beat, tossProgress, "left-hand"), anchor,
              (now - tossTime) / Math.max(1, release - tossTime), 0.4, ball.position);
          } else {
            var incoming = anchor.clone().add(new THREE.Vector3(0, 0.75, 0));
            var p = clamp((now - beat.startMs) / Math.max(1, release - beat.startMs), 0, 1);
            flight(incoming, anchor, p, /serve|jump-/.test(beat.motionId) ? 0.45 : 0, ball.position);
          }
        } else {
          var next = beats[lastIndex + 1];
          var route = routeFor(phase, beat) || { to: [entry.data.x, entry.data.y] };
          var contact = contactFor(phase, beat);
          var arrival = next ? contactTime(next, segmentFor(next)) : beat.endMs + 450;
          var destination;
          if (next) destination = contactAnchor(phase, next);
          else if (contact && contact.recipientActorId && player.actors[contact.recipientActorId]) {
            destination = bodyContact(player.actors[contact.recipientActorId], "feed");
          } else destination = mapPoint(phase.plan, (contact || route).to, targetElevation(phase.plan, (contact || route).to));
          var progress = clamp((now - release) / Math.max(1, arrival - release), 0, 1);
          if (wall) {
            var normal = new THREE.Vector3(0, 0, 1).applyQuaternion(wall.root.quaternion);
            var impact = anchor.clone().addScaledVector(normal, wall.root.position.clone().sub(anchor).dot(normal));
            impact.y = Math.max(anchor.y + 0.30, 1.4);
            impact.addScaledVector(normal, 0.20 * Math.sign(anchor.clone().sub(wall.root.position).dot(normal) || 1));
            // One continuous outbound/rebound path, with exact hand endpoints.
            if (progress < 0.5) flight(anchor, impact, progress * 2, 0.18, ball.position);
            else flight(impact, destination, (progress - 0.5) * 2, 0.18, ball.position);
          } else {
            var nets = player.equipment.filter(function (item) { return item.key === "net"; }).map(function (item) {
              return { x: item.root.position.x, z: item.root.position.z, width: item.root.scale.x * 9, height: item.root.scale.y * 2.43 };
            });
            if (player.netSystem && player.netSystem.visible) nets.push({ x: 0, z: 0, width: 9, height: 2.43 });
            var height = netClearanceArc(anchor.toArray(), destination.toArray(), nets, ballArcHeight(beat.motionId, route));
            flight(anchor, destination, progress, height, ball.position);
          }
        }
        ball.rotation.set(player.authoredTime * 2.1, player.authoredTime * 2.9, player.authoredTime * 1.7);
        ball.visible = true;
      });
      carriers.forEach(function (beat) {
        if (carried[beat.actorId] || !player.actors[beat.actorId]) return;
        var carryBall = ensureBall(used++);
        carryBall.position.copy(bodyContact(player.actors[beat.actorId], "feed", "left-hand"));
        carryBall.visible = true;
        carried[beat.actorId] = true;
      });
      for (var i = used; i < player.ballPool.length; i++) player.ballPool[i].visible = false;

      // Only show a held ball when this step actually calls for handling one.
      // Floor recovery, waiting, and footwork no longer conjure a bouncing ball.
      if (!used && player.activeActor && equipmentKeys(phase.plan).some(function (key) { return /^(balls|medicine ball|reaction ball)$/.test(key); }) &&
          /^(feed|low-toss|admin)$/.test(player.activeActor.currentMotion)) {
        var held = ensureBall(0);
        held.visible = true;
        held.position.copy(bodyContact(player.activeActor, "feed"));
      }
      if (!used && player.ballKind === "medicine ball" && player.activeActor) {
        var actor = player.activeActor;
        var powerBeat = active.find(function (beat) { return beat.actorId === actor.data.id && /^medicine/.test(beat.motionId); });
        var medicine = ensureBall(0);
        medicine.visible = true;
        var release = powerBeat && contactTime(powerBeat, player.motionManifest[powerBeat.motionId]);
        if (!powerBeat || now <= release) medicine.position.copy(bodyContact(actor, powerBeat ? powerBeat.motionId : "feed"));
        else {
          var start = contactAnchor(phase, powerBeat);
          var end = start.clone().add(new THREE.Vector3(0, 0, -1.4).applyQuaternion(actor.root.quaternion));
          if (/slam/.test(powerBeat.motionId)) end.y = 0.18;
          flight(start, end, (now - release) / Math.max(1, powerBeat.endMs - release),
            /slam/.test(powerBeat.motionId) ? 0 : 0.22, medicine.position);
        }
      }
      updateTrainingEquipment();
    }

    function updateTrainingEquipment() {
      var attached = 0;
      player.wearables.forEach(function (wearable) {
        var segment = wearable.actor.currentSegment || {};
        var applicable = !wearable.variantIds || wearable.variantIds.indexOf(wearable.actor.currentVariantId || "") !== -1;
        if (!applicable || segment.equipmentHidden) { wearable.root.visible = false; return; }
        if (wearable.update(wearable.actor)) attached++;
      });
      ui.root.setAttribute("data-attached-wearables", String(attached));
      if (!player.activeActor) return;
      var actor = player.activeActor;
      var THREE = player.runtime.THREE;
      player.equipment.forEach(function (equipment) {
        if (equipment.key === "wall" && /^(standing-calf|bent-knee-calf)/.test(actor.currentVariantId || "")) {
          equipment.root.position.copy(new THREE.Vector3(0, 0, -0.60)
            .applyQuaternion(actor.root.quaternion).add(actor.root.position));
          equipment.root.quaternion.copy(actor.root.quaternion);
        }
        if (equipment.key === "foam roller" && actor.currentMotion === "foam") {
          var segment = actor.currentSegment || {};
          var contact = segment.rollerContact;
          var first = contact && actor.root.getObjectByName("ATH_JOINT_" + contact.bones[0]);
          var second = contact && actor.root.getObjectByName("ATH_JOINT_" + contact.bones[1]);
          if (first && second) {
            equipment.root.position.copy(first.getWorldPosition(new THREE.Vector3()))
              .lerp(second.getWorldPosition(new THREE.Vector3()), contact.fraction == null ? 0.5 : contact.fraction);
            equipment.root.position.y = actor.root.position.y;
          } else {
            var offset = segment.equipmentAnchor || [0, 0.56, 0];
            equipment.root.position.copy(new THREE.Vector3(offset[0], offset[2], -offset[1])
              .applyQuaternion(actor.root.quaternion).add(actor.root.position));
          }
          equipment.root.quaternion.copy(actor.root.quaternion);
        }
      });
    }

    function updateMechanicsCamera(delta, phase) {
      if (!player.mechanicsCamera || !player.activeActor) return;
      var THREE = player.runtime.THREE;
      var target = player.activeActor.root.position.clone();
      var floorAction = !!(player.activeActor.currentSegment || {}).floor || /sprawl|roll|floor|mat-defense|bridge|foam/.test(player.activeActor.currentMotion);
      var airAction = /jump|attack|block|serve|box/.test(player.activeActor.currentMotion);
      var balloonAction = player.ballKind === "balloon";
      target.y += balloonAction ? 1.45 : floorAction ? 0.62 : airAction ? 1.18 : 0.94;
      if (!player.mechanicsTarget) player.mechanicsTarget = target.clone();
      var blend = delta ? clamp(1 - Math.pow(0.002, delta), 0.06, 1) : 1;
      player.mechanicsTarget.lerp(target, blend);
      // The view is relative to the athlete, so hands stay visible when a
      // partner on the other side of the court becomes the demonstrator.
      var radius = balloonAction ? 5.4 : floorAction ? 4.5 : airAction ? 5.0 : 4.1;
      var azimuth = player.cameraAngle === "front" ? 0 : player.cameraAngle === "side" ? Math.PI / 2 : Math.PI / 4;
      var offset = new THREE.Vector3(Math.sin(azimuth) * radius,
        floorAction ? 1.30 : 1.05, -Math.cos(azimuth) * radius);
      offset.applyQuaternion(player.activeActor.root.quaternion);
      var desired = player.mechanicsTarget.clone().add(offset);
      player.mechanicsCamera.position.lerp(desired, blend);
      player.mechanicsCamera.fov = balloonAction ? 45 : floorAction ? 44 : airAction ? 42 : 39;
      player.mechanicsCamera.userData.coachCamBaseFov = player.mechanicsCamera.fov;
      player.mechanicsCamera.userData.coachCamBaseAspect = 1;
      player.mechanicsCamera.near = 0.04;
      player.mechanicsCamera.far = 80;
      player.mechanicsCamera.lookAt(player.mechanicsTarget);
      ui.root.setAttribute("data-mechanics-camera", floorAction ? "floor" : airAction ? "air" : "standing");
    }

    function updateAtTime(force) {
      var phase = phaseAt(compiled, player.authoredTime);
      if (player.phaseIndex !== phase.index) activatePhase(phase);
      updatePhaseUi(phase, force);
      var localProgress = phaseProgress(phase, player.authoredTime);
      var planTimeMs = localProgress * phase.sourceDurationMs;
      var active = activeBeats(phase, planTimeMs);
      updateRoutes(active);
      updateActors(phase, planTimeMs, active);
      updateBalls(phase, active);
      if (force || !player.mechanicsTarget) updateMechanicsCamera(0, phase);
      var activeBeat = player.activeActor && player.activeActor.currentBeat || active[0];
      if (activeBeat) {
        var label = translated(activeBeat.variantLabel || motionLabel(activeBeat.motionId));
        if (activeBeat.repetitions > 1) {
          var repetition = Math.min(activeBeat.repetitions, Math.floor((planTimeMs - activeBeat.startMs) / activeBeat.durationMs * activeBeat.repetitions) + 1);
          label += " · " + translated("Repetition") + " " + repetition + "/" + activeBeat.repetitions;
          ui.root.setAttribute("data-repetition", String(repetition));
        }
        ui.phaseTitle.textContent = label;
        ui.phaseStatus.textContent = translated(phase.label) + " · " + label;
        var mechanicsSmall = ui.mechanicsView.querySelector("small");
        if (mechanicsSmall) mechanicsSmall.textContent = label;
        ui.root.setAttribute("data-active-motion", activeBeat.motionId);
        ui.root.setAttribute("data-active-variant", activeBeat.variantId || "");
      } else {
        ui.root.setAttribute("data-active-motion", "ready");
        ui.root.setAttribute("data-active-variant", "");
      }
    }

    function prepareModel(model) {
      model.traverse(function (object) {
        if (!object.isMesh) return;
        object.castShadow = !/Court|ArenaFloor|Wall/i.test(object.name || "");
        object.receiveShadow = true;
        var materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(function (material) {
          if (material) material.needsUpdate = true;
        });
      });
    }

    function setupScene(loaded) {
      var runtime = loaded.runtime;
      var THREE = runtime.THREE;
      var gltf = loaded.gltf;
      var clip = THREE.AnimationClip.findByName(gltf.animations, CONTRACT.importedClip) ||
        THREE.AnimationClip.findByName(gltf.animations, CONTRACT.clip) || gltf.animations[0];
      if (!clip || !(clip.duration > 60)) throw new Error("CoachCam shared motion reel is missing");
      var model = runtime.cloneSkeleton(gltf.scene);
      var manifest = parseManifest(model);
      var athlete = detachNamed(model, CONTRACT.athlete);
      var ball = detachNamed(model, EQUIPMENT_MODELS.balls);
      if (!athlete || !athlete.getObjectByName(CONTRACT.rig) || !ball) {
        throw new Error("CoachCam shared prototypes are incomplete");
      }
      var equipment = {};
      if (!RR.coachCamEquipment3D) throw new Error("CoachCam equipment renderer is missing");
      Object.keys(EQUIPMENT_MODELS).forEach(function (key) {
        if (key === "balls" || key === "net") return;
        var prototype = detachNamed(model, EQUIPMENT_MODELS[key]);
        if (!prototype) throw new Error("CoachCam equipment prototype is missing: " + key);
        equipment[key] = prototype;
      });

      var renderer = new THREE.WebGLRenderer({
        canvas: ui.canvas,
        antialias: (window.devicePixelRatio || 1) <= 2,
        alpha: false,
        powerPreference: "high-performance"
      });
      var mobile = Math.min(window.innerWidth || 9999, ui.stage.clientWidth || 9999) < 700;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.04;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.shadowMap.autoUpdate = false;

      var scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x071724, 24, 50);
      scene.add(model);
      scene.add(new THREE.HemisphereLight(0xd8edff, 0x17212b, 1.8));
      var key = new THREE.DirectionalLight(0xfff1dc, 2.1);
      key.position.set(-7, 13, 9);
      key.castShadow = true;
      key.shadow.bias = -0.00025;
      key.shadow.normalBias = 0.025;
      key.shadow.mapSize.set(mobile ? 512 : 1024, mobile ? 512 : 1024);
      key.shadow.camera.left = key.shadow.camera.bottom = -12;
      key.shadow.camera.right = key.shadow.camera.top = 12;
      scene.add(key);
      var rim = new THREE.DirectionalLight(0xff6b35, 1.12);
      rim.position.set(8, 6, -9);
      scene.add(rim);

      player.runtime = runtime;
      player.runtime.scratchSize = new THREE.Vector2();
      player.renderer = renderer;
      player.scene = scene;
      player.model = model;
      player.clip = clip;
      player.motionManifest = manifest;
      player.athletePrototype = athlete;
      player.ballPrototype = ball;
      player.equipmentPrototypes = equipment;
      player.courtCamera = findNamed(model, CONTRACT.courtCamera, /camera.*(?:court|wide)/i, true);
      player.mechanicsCamera = findNamed(model, CONTRACT.mechanicsCamera, /camera.*mechanics/i, true);
      player.netSystem = model.getObjectByName("NetSystem");
      player.layoutCamera = new THREE.OrthographicCamera(-6, 6, 11, -11, 0.1, 100);
      player.layoutCamera.position.set(0, 40, 0);
      player.layoutCamera.up.set(0, 0, -1);
      player.layoutCamera.lookAt(0, 0, 0);
      scene.add(player.layoutCamera);
      if (!player.courtCamera) player.courtCamera = new THREE.PerspectiveCamera(48, 16 / 9, 0.04, 120);
      if (!player.mechanicsCamera) player.mechanicsCamera = new THREE.PerspectiveCamera(42, 16 / 9, 0.04, 80);
      if (!player.courtCamera.parent) scene.add(player.courtCamera);
      if (!player.mechanicsCamera.parent) scene.add(player.mechanicsCamera);
      player.courtCamera.layers.enable(1);
      player.layoutCamera.layers.enable(1);
      if (!model.getObjectByName(CONTRACT.courtCamera)) {
        player.courtCamera.position.set(12.8, 13.2, 17.5);
        player.courtCamera.lookAt(0, 0.6, 0);
      }
      prepareModel(model);
      activatePhase(compiled.phases[0]);
    }

    function viewBox(element) {
      var canvasRect = ui.canvas.getBoundingClientRect();
      var rect = element.getBoundingClientRect();
      return {
        x: Math.max(0, rect.left - canvasRect.left),
        y: Math.max(0, canvasRect.bottom - rect.bottom),
        width: Math.max(1, Math.min(rect.width, canvasRect.right - rect.left)),
        height: Math.max(1, Math.min(rect.height, rect.bottom - canvasRect.top))
      };
    }

    function renderCamera(camera, box, color) {
      var THREE = player.runtime.THREE;
      var aspect = box.width / box.height;
      if (camera.isPerspectiveCamera) {
        if (!(camera.userData.coachCamBaseFov > 0)) {
          camera.userData.coachCamBaseFov = camera.fov;
          camera.userData.coachCamBaseAspect = camera.aspect > 0 ? camera.aspect : 16 / 9;
        }
        var baseFov = camera.userData.coachCamBaseFov;
        var baseAspect = camera.userData.coachCamBaseAspect;
        camera.fov = aspect < baseAspect ? THREE.MathUtils.radToDeg(2 * Math.atan(
          Math.tan(THREE.MathUtils.degToRad(baseFov) / 2) * baseAspect / aspect)) : baseFov;
      }
      if (camera.isOrthographicCamera) {
        var bounds = { minX: -5.1, maxX: 5.1, minZ: -9.7, maxZ: 9.7 };
        compiled.phases.forEach(function (phase) {
          function includePoint(at) {
            var point = mappedPoint(phase.plan, at);
            bounds.minX = Math.min(bounds.minX, point[0] - 1.15);
            bounds.maxX = Math.max(bounds.maxX, point[0] + 1.15);
            bounds.minZ = Math.min(bounds.minZ, point[1] - 1.15);
            bounds.maxZ = Math.max(bounds.maxZ, point[1] + 1.15);
          }
          list(phase.plan.actors).forEach(function (actor) { includePoint([actor.x, actor.y]); });
          list(phase.plan.routes).forEach(function (route) {
            [route.from].concat(list(route.via), [route.to]).forEach(includePoint);
          });
          list((phase.plan.presentation || {}).props).forEach(function (prop) {
            if (!finite(prop.x) || !finite(prop.y)) return;
            includePoint([prop.x - (prop.w || 0) / 2, prop.y - (prop.h || 0) / 2]);
            includePoint([prop.x + (prop.w || 0) / 2, prop.y + (prop.h || 0) / 2]);
          });
        });
        var halfWidth = (bounds.maxX - bounds.minX) / 2;
        var halfHeight = (bounds.maxZ - bounds.minZ) / 2;
        halfHeight = Math.max(halfHeight, halfWidth / aspect);
        halfWidth = Math.max(halfWidth, halfHeight * aspect);
        camera.left = -halfWidth; camera.right = halfWidth;
        camera.top = halfHeight; camera.bottom = -halfHeight;
        camera.position.set((bounds.maxX + bounds.minX) / 2, 40, (bounds.maxZ + bounds.minZ) / 2);
      }
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      player.renderer.setViewport(box.x, box.y, box.width, box.height);
      player.renderer.setScissor(box.x, box.y, box.width, box.height);
      player.renderer.setClearColor(color, 1);
      player.renderer.clear(true, true, true);
      player.renderer.render(player.scene, camera);
    }

    function renderViews() {
      if (!player.renderer || !ui.canvas.clientWidth || !ui.canvas.clientHeight) return;
      var width = Math.max(1, Math.floor(ui.canvas.clientWidth));
      var height = Math.max(1, Math.floor(ui.canvas.clientHeight));
      var size = player.renderer.getSize(player.runtime.scratchSize);
      if (Math.round(size.x) !== width || Math.round(size.y) !== height) {
        player.renderer.setSize(width, height, false);
      }
      player.renderer.setScissorTest(true);
      player.renderer.autoClear = false;
      player.renderer.shadowMap.needsUpdate = true;
      if (player.framing !== "technique") {
        var fog = player.scene.fog;
        if (player.framing === "layout") player.scene.fog = null;
        try {
          renderCamera(player.framing === "layout" ? player.layoutCamera : player.courtCamera, viewBox(ui.courtView), 0x071724);
        } finally { player.scene.fog = fog; }
      }
      if (player.framing === "layout") return;

      // The court camera is the formation source of truth and always shows every
      // participant.  The mechanics camera is deliberately a clean coaching
      // close-up: isolate the athlete performing the current beat so teammates
      // elsewhere on the court cannot drift into (or be clipped by) this view.
      var actorVisibility = player.actorList.map(function (entry) {
        return { entry: entry, visible: entry.root.visible };
      });
      if (player.activeActor) {
        actorVisibility.forEach(function (state) {
          state.entry.root.visible = state.entry === player.activeActor;
        });
      }
      var wearableVisibility = player.wearables.map(function (wearable) { return wearable.root.visible; });
      player.wearables.forEach(function (wearable) { wearable.root.visible = wearable.root.visible && wearable.actor === player.activeActor; });
      var ballVisibility = player.ballPool.map(function (ball) { return ball.visible; });
      if (player.ballKind === "balloon" && player.activeActor) player.ballPool.forEach(function (ball) {
        ball.visible = ball.visible && (ball.userData.actorId === player.activeActor.data.id || ball.userData.contactActorId === player.activeActor.data.id);
      });
      try {
        renderCamera(player.mechanicsCamera, viewBox(ui.mechanicsView), 0x0b1b2b);
      } finally {
        actorVisibility.forEach(function (state) {
          state.entry.root.visible = state.visible;
        });
        player.wearables.forEach(function (wearable, index) { wearable.root.visible = wearableVisibility[index]; });
        player.ballPool.forEach(function (ball, index) { ball.visible = ballVisibility[index]; });
      }
    }

    function requestRender() {
      if (!player.initialized || player.destroyed || player.frame) return;
      player.frame = window.requestAnimationFrame(renderFrame);
    }

    function renderNow() {
      if (!player.initialized || player.destroyed || !ui.root.isConnected) return;
      updateAtTime(true);
      renderViews();
    }

    function startFrameLoop() {
      if (!player.initialized || player.destroyed || player.frame) return;
      player.lastFrame = performance.now();
      player.frame = window.requestAnimationFrame(renderFrame);
    }

    function renderFrame(now) {
      player.frame = 0;
      if (player.destroyed || !player.initialized) return;
      if (!ui.root.isConnected) {
        destroy();
        return;
      }
      var animate = shouldAnimate();
      var delta = player.lastFrame ? Math.min(0.05, Math.max(0, (now - player.lastFrame) / 1000)) : 0;
      player.lastFrame = now;
      if (animate) {
        player.authoredTime = (player.authoredTime + delta * player.speed) % compiled.durationSeconds;
      }
      updateAtTime(false);
      updateMechanicsCamera(delta, phaseAt(compiled, player.authoredTime));
      renderViews();
      if (animate) player.frame = window.requestAnimationFrame(renderFrame);
    }

    function syncTransport() {
      if (shouldAnimate()) startFrameLoop();
      else requestRender();
    }

    function seek(seconds, shouldAnnounce) {
      player.authoredTime = clamp(Number(seconds) || 0, 0, compiled.durationSeconds - 0.001);
      if (player.initialized) renderNow();
      else updatePhaseUi(phaseAt(compiled, player.authoredTime), true);
      if (shouldAnnounce) {
        var phase = phaseAt(compiled, player.authoredTime);
        announce("Showing " + phase.label + ". " + phase.instruction);
      }
    }

    function setUserPaused(value, shouldAnnounce) {
      player.userPaused = !!value;
      updatePlayButton();
      syncTransport();
      if (shouldAnnounce) announce(player.userPaused ? "Animation paused." :
        "Animation playing at " + player.speed + " times speed.");
    }

    function initialize() {
      if (player.destroyed || player.initialized || player.initializing || player.failed) return;
      player.initializing = true;
      ui.root.setAttribute("data-state", "loading");
      ui.loading.textContent = translated("Preparing the synchronized 3D court…");
      loadLibrary().then(function (loaded) {
        if (player.destroyed) return;
        setupScene(loaded);
        player.initialized = true;
        player.initializing = false;
        ui.root.setAttribute("data-state", "ready");
        ui.root.setAttribute("data-rig", CONTRACT.rig);
        ui.root.setAttribute("data-motion-count", String(CONTRACT.motionCount));
        ui.loading.textContent = translated("3D CoachCam ready");
        window.setTimeout(function () {
          if (!player.destroyed) ui.loading.setAttribute("aria-hidden", "true");
        }, 500);
        seek(player.authoredTime, false);
        syncTransport();
      }).catch(function () {
        if (player.destroyed) return;
        player.initializing = false;
        player.failed = true;
        ui.root.setAttribute("data-state", "fallback");
        ui.loading.textContent = translated("Court-aware phase guide");
        ui.fallbackText.hidden = false;
        updatePhaseUi(phaseAt(compiled, player.authoredTime), true);
      });
    }

    function destroy() {
      if (player.destroyed) return;
      player.destroyed = true;
      if (player.frame) window.cancelAnimationFrame(player.frame);
      if (player.resizeObserver) player.resizeObserver.disconnect();
      if (player.intersectionObserver) player.intersectionObserver.disconnect();
      if (player.mutationObserver) player.mutationObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", destroy);
      window.removeEventListener("resize", requestRender);
      clearDrillGroup();
      if (player.renderer) {
        player.renderer.dispose();
        if (player.renderer.forceContextLoss) player.renderer.forceContextLoss();
      }
    }

    function onVisibility() {
      player.autoPaused = document.hidden || ui.root.getAttribute("data-intersecting") === "false";
      syncTransport();
    }

    ui.pause.addEventListener("click", function () { setUserPaused(!player.userPaused, true); });
    ui.frameBack.addEventListener("click", function () { setUserPaused(true, false); seek(player.authoredTime - 1 / 24, true); });
    ui.frameNext.addEventListener("click", function () { setUserPaused(true, false); seek(player.authoredTime + 1 / 24, true); });
    ui.angles.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-angle]");
      if (!button) return;
      player.cameraAngle = button.getAttribute("data-angle");
      Array.prototype.forEach.call(ui.angles.querySelectorAll("button"), function (item) {
        item.setAttribute("aria-pressed", item === button ? "true" : "false");
      });
      renderNow();
    });
    ui.replay.addEventListener("click", function () {
      player.userPaused = false;
      updatePlayButton();
      seek(0, false);
      syncTransport();
      announce("Replaying the complete demonstration from the first step at " + player.speed + " times speed.");
    });
    ui.speed.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-speed]");
      if (!button) return;
      var speed = Number(button.getAttribute("data-speed"));
      player.speed = [0.25, 0.5, 1].indexOf(speed) !== -1 ? speed : 1;
      updateSpeedButtons();
      syncTransport();
      announce("Playback speed " + player.speed + " times.");
    });
    ui.framing.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-framing]");
      if (!button) return;
      player.framing = button.getAttribute("data-framing");
      ui.root.setAttribute("data-framing", player.framing);
      Array.prototype.forEach.call(ui.framing.querySelectorAll("button"), function (choice) {
        choice.setAttribute("aria-pressed", choice === button ? "true" : "false");
      });
      renderNow();
    });
    ui.phaseRail.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-phase-start]");
      if (button) seek(Number(button.getAttribute("data-phase-start")), true);
    });
    ui.scrubber.addEventListener("pointerdown", function () {
      player.scrubbing = true;
      player.resumeAfterScrub = !player.userPaused;
    });
    ui.scrubber.addEventListener("input", function () {
      if (!player.scrubbing) player.resumeAfterScrub = !player.userPaused;
      player.scrubbing = true;
      seek((Number(ui.scrubber.value) / 1000) * compiled.durationSeconds, false);
    });
    function finishScrub() {
      if (!player.scrubbing) return;
      player.scrubbing = false;
      if (player.resumeAfterScrub) player.userPaused = false;
      player.resumeAfterScrub = false;
      updatePlayButton();
      syncTransport();
      var phase = phaseAt(compiled, player.authoredTime);
      announce("Showing " + phase.label + ".");
    }
    ui.scrubber.addEventListener("change", finishScrub);
    ui.scrubber.addEventListener("pointerup", finishScrub);
    ui.scrubber.addEventListener("pointercancel", finishScrub);

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", destroy, { once: true });
    ui.canvas.addEventListener("webglcontextlost", function (event) {
      event.preventDefault();
      player.failed = true;
      ui.root.setAttribute("data-state", "fallback");
      ui.fallbackText.hidden = false;
      destroy();
    }, false);

    if (window.ResizeObserver) {
      player.resizeObserver = new ResizeObserver(requestRender);
      player.resizeObserver.observe(ui.stage);
    } else window.addEventListener("resize", requestRender);

    if (window.IntersectionObserver) {
      player.intersectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.target !== ui.root) return;
          ui.root.setAttribute("data-intersecting", entry.isIntersecting ? "true" : "false");
          player.autoPaused = !entry.isIntersecting || document.hidden;
          if (entry.isIntersecting) initialize();
          syncTransport();
        });
      }, { rootMargin: "320px 0px", threshold: 0.01 });
      player.intersectionObserver.observe(ui.root);
    } else window.setTimeout(initialize, 0);

    var screen = document.getElementById("screen");
    if (window.MutationObserver && screen) {
      player.mutationObserver = new MutationObserver(function () {
        if (ui.root.isConnected) player.wasConnected = true;
        else if (player.wasConnected) destroy();
      });
      player.mutationObserver.observe(screen, { childList: true, subtree: true });
    }

    if (player.reducedQuery && player.reducedQuery.matches) {
      player.userPaused = true;
      player.authoredTime = compiled.phases[0].start + compiled.phases[0].duration * 0.45;
      ui.root.setAttribute("data-reduced-motion", "true");
    }
    updatePlayButton();
    updateSpeedButtons();
    updatePhaseUi(phaseAt(compiled, player.authoredTime), true);
    ui.root._coachCamDestroy = destroy;
  }

  RR.coachCamLibrary3D = Object.freeze({
    isEligible: isBundledDrill,
    figure: buildFigure,
    compile: compileDrill,
    phaseAt: phaseAt,
    contract: CONTRACT,
    motionIds: MOTION_IDS,
    equipmentModels: EQUIPMENT_MODELS,
    mechanics: Object.freeze({ contactProgress: contactProgress, contactTime: contactTime,
      sampleTime: sampleTime, netClearanceArc: netClearanceArc, travelProgress: travelProgress, blendYaw: blendYaw, routeFacing: routeFacing,
      motionTimingScale: motionTimingScale, stationMotion: stationMotion, courtSpace: courtSpace, mappedPoint: mappedPoint, targetElevation: targetElevation })
  });
})();
