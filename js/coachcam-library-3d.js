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
      if (stationMotion(beat.motionId)) return;
      var route = list(plan.routes).find(function (item) { return item.id === beat.routeId && item.type === "move"; });
      if (!route) return;
      var points = [route.from].concat(list(route.via), [route.to]);
      var distance = 0;
      for (var i = 1; i < points.length; i++) {
        var dx = (points[i][0] - points[i - 1][0]) * 9 / Math.max(1, Number(plan.width) || 9);
        var dz = (points[i][1] - points[i - 1][1]) * 18 / Math.max(1, Number(plan.height) || 10);
        distance += Math.sqrt(dx * dx + dz * dz);
      }
      var speed = /shuffle|mini-band|backpedal/.test(beat.motionId) ? 1.8
        : beat.motionId === "ladder" ? 2 : /sprint|run-through/.test(beat.motionId) ? 5.5 : 3;
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
      frameBack: frameBack, frameNext: frameNext, angles: angles,
      mechanicsView: mechanicsView, loading: loading, fallbackText: fallbackText,
      pause: pause, replay: replay, speed: speed, scrubber: scrubber,
      phaseRail: phaseRail, phaseStatus: phaseStatus, phaseTitle: phaseTitle,
      time: time, cue: cue, safetyKey: safetyKey, formationValue: formationValue,
      announcer: announcer
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
      var width = Math.max(1, Number(plan.width) || 9);
      var height = Math.max(1, Number(plan.height) || 10);
      var x = ((Number(point && point[0]) || 0) / width - 0.5) * 9;
      var z = ((Number(point && point[1]) || 0) / height - 0.5) * 18;
      return new player.runtime.THREE.Vector3(x, vertical || 0, z);
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
        if (object.geometry && object.userData && object.userData.coachCamOwnedGeometry) object.geometry.dispose();
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
    }

    function equipmentAnchor(phase) {
      var actor = list(phase.plan.actors).find(function (item) { return !item.support; }) || phase.plan.actors[0];
      return actor ? mapPoint(phase.plan, [actor.x, actor.y], 0) : new player.runtime.THREE.Vector3();
    }

    function placeEquipment(phase, key, prototype, index) {
      if (!prototype || key === "net" || key === "balls") return null;
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

    function ensureBall(index) {
      var ball = player.ballPool[index];
      if (ball) return ball;
      ball = player.ballPrototype.clone(true);
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
      player.netSystem.visible = !usesWall &&
        (keys.indexOf("net") !== -1 || /\bnet\b/.test(savedCopy));
    }

    function activatePhase(phase) {
      clearDrillGroup();
      player.drillGroup = new player.runtime.THREE.Group();
      player.drillGroup.name = "CompiledDrill_" + compiled.drill.id + "_Phase_" + (phase.index + 1);
      player.scene.add(player.drillGroup);
      list(phase.plan.actors).forEach(function (actor, index) { createActor(phase, actor, index); });
      list(phase.plan.routes).forEach(function (route) { createRouteVisual(phase, route); });
      equipmentKeys(phase.plan).forEach(function (key, index) {
        placeEquipment(phase, key, player.equipmentPrototypes[key], index);
      });
      ensureBall(0);
      configureNet(phase);
      player.phaseIndex = phase.index;
      ui.root.setAttribute("data-visible-actors", String(player.actorList.length));
      ui.root.setAttribute("data-visible-equipment", String(player.equipment.length));
    }

    function routeFor(phase, beat) {
      return list(phase.plan.routes).find(function (route) { return route.id === beat.routeId; }) || null;
    }

    function motionSample(entry, motionId, progress) {
      var segment = player.motionManifest[motionId] || player.motionManifest.ready;
      var sample = sampleTime(segment, progress);
      entry.action.paused = false;
      entry.mixer.setTime(sample);
      entry.action.paused = true;
      entry.currentMotion = motionId;
      entry.currentProgress = progress;
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
        return beat.startMs <= planTimeMs && route && route.type === "move" && !stationMotion(beat.motionId);
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
        pointOnPolyline(points, travel, entry.root.position);
        var direction = routeDirection(points, travel, new THREE.Vector3());
        if (direction.lengthSq() > 0.001) {
          var yaw = routeFacing(movement.motionId, Math.atan2(-direction.x, -direction.z), initialYaw);
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
        if (beat.actorId && !activeByActor[beat.actorId]) activeByActor[beat.actorId] = beat;
      });
      player.activeActor = null;
      player.actorList.forEach(function (entry, index) {
        var beat = activeByActor[entry.data.id];
        var completed = list(phase.plan.beats).filter(function (item) {
          return item.actorId === entry.data.id && item.endMs <= planTimeMs;
        }).pop();
        // Keep the actual finish pose until the next instruction. In
        // particular, a floor save must never pop upright while waiting.
        var motionId = beat ? beat.motionId : completed ? completed.motionId : "ready";
        var progress = beat ? clamp((planTimeMs - beat.startMs) / Math.max(1, beat.durationMs), 0, 1)
          : completed ? 1 : ((player.authoredTime * (0.55 + index * 0.015)) % player.motionManifest.ready.durationSeconds) /
            player.motionManifest.ready.durationSeconds;
        var segment = player.motionManifest[motionId];
        var route = beat && routeFor(phase, beat);
        if (route && route.type === "move" && segment.cyclic && segment.strideMeters > 0) {
          var points = routePoints(phase.plan, route, 0);
          var distance = points.reduce(function (sum, point, i) {
            return sum + (i ? point.distanceTo(points[i - 1]) : 0);
          }, 0);
          progress = (travelProgress(progress) * distance / segment.strideMeters) % 1;
        }
        motionSample(entry, motionId, progress);
        actorTransform(entry, phase, planTimeMs);
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
      var position = entry.root.position.clone(), rotation = entry.root.quaternion.clone();
      var motion = entry.currentMotion, progress = entry.currentProgress;
      var segment = player.motionManifest[beat.motionId];
      var poseProgress = atProgress == null ? contactProgress(segment) : atProgress;
      actorTransform(entry, phase, beat.startMs + beat.durationMs * poseProgress);
      motionSample(entry, beat.motionId, poseProgress);
      var point = bodyContact(entry, beat.motionId, hand);
      entry.contactPoints[cacheKey] = point.clone();
      motionSample(entry, motion, progress);
      entry.root.position.copy(position);
      entry.root.quaternion.copy(rotation);
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
      var wall = player.equipment.find(function (entry) { return entry.key === "wall"; });
      var chains = {};
      list(phase.plan.beats).forEach(function (beat) {
        var route = routeFor(phase, beat);
        if (!route || route.type === "move") return;
        var key = beat.trackId || (contactFor(phase, beat) || {}).chainId || beat.id;
        (chains[key] = chains[key] || []).push(beat);
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
          return contactTime(a, player.motionManifest[a.motionId]) - contactTime(b, player.motionManifest[b.motionId]);
        });
        var first = beats[0];
        if (now < first.startMs) return;
        var lastIndex = -1;
        beats.forEach(function (beat, i) {
          if (now >= contactTime(beat, player.motionManifest[beat.motionId])) lastIndex = i;
        });
        var ball = ensureBall(used++);
        var beat = beats[Math.max(0, lastIndex)];
        var entry = player.actors[beat.actorId];
        var segment = player.motionManifest[beat.motionId];
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
          var arrival = next ? contactTime(next, player.motionManifest[next.motionId]) : beat.endMs + 450;
          var destination;
          if (next) destination = contactAnchor(phase, next);
          else if (contact && contact.recipientActorId && player.actors[contact.recipientActorId]) {
            destination = bodyContact(player.actors[contact.recipientActorId], "feed");
          } else destination = mapPoint(phase.plan, (contact || route).to, 0.12);
          var progress = clamp((now - release) / Math.max(1, arrival - release), 0, 1);
          if (wall) {
            var impact = wall.root.position.clone();
            impact.x = anchor.x;
            impact.y = Math.max(anchor.y + 0.30, 1.4);
            impact.z += 0.20;
            // One continuous outbound/rebound path, with exact hand endpoints.
            if (progress < 0.5) flight(anchor, impact, progress * 2, 0.18, ball.position);
            else flight(impact, destination, (progress - 0.5) * 2, 0.18, ball.position);
          } else flight(anchor, destination, progress, ballArcHeight(beat.motionId, route), ball.position);
        }
        ball.rotation.set(player.authoredTime * 2.1, player.authoredTime * 2.9, player.authoredTime * 1.7);
        ball.visible = true;
      });
      for (var i = used; i < player.ballPool.length; i++) player.ballPool[i].visible = false;

      // Only show a held ball when this step actually calls for handling one.
      // Floor recovery, waiting, and footwork no longer conjure a bouncing ball.
      if (!used && player.activeActor && equipmentKeys(phase.plan).indexOf("balls") !== -1 &&
          /^(feed|low-toss|admin)$/.test(player.activeActor.currentMotion)) {
        var held = ensureBall(0);
        held.visible = true;
        held.position.copy(bodyContact(player.activeActor, "feed"));
      }
      player.equipment.forEach(function (equipment) {
        if (equipment.key !== "medicine ball" || !player.activeActor) return;
        var actor = player.activeActor;
        var powerBeat = active.find(function (beat) { return beat.actorId === actor.data.id && /^medicine/.test(beat.motionId); });
        if (!powerBeat) return;
        var release = contactTime(powerBeat, player.motionManifest[powerBeat.motionId]);
        if (now <= release) equipment.root.position.copy(bodyContact(actor, powerBeat.motionId));
        else {
          var start = contactAnchor(phase, powerBeat);
          var end = start.clone().add(new THREE.Vector3(0, 0, -1.4).applyQuaternion(actor.root.quaternion));
          if (/slam/.test(powerBeat.motionId)) end.y = 0.18;
          flight(start, end, (now - release) / Math.max(1, powerBeat.endMs - release),
            /slam/.test(powerBeat.motionId) ? 0 : 0.22, equipment.root.position);
        }
      });
      updateTrainingEquipment();
    }

    function updateTrainingEquipment() {
      if (!player.activeActor) return;
      var THREE = player.runtime.THREE;
      var actor = player.activeActor;
      actor.root.updateMatrixWorld(true);
      function joint(name) {
        var bone = actor.root.getObjectByName("ATH_JOINT_" + name);
        return bone ? bone.getWorldPosition(new THREE.Vector3()) : actor.root.position.clone();
      }
      player.equipment.forEach(function (equipment) {
        var id = actor.currentMotion;
        // Boxes are placed once in activatePhase. Only wearable or handled
        // equipment follows the active athlete during playback.
        if (equipment.key === "box") return;
        if (equipment.key === "foam roller" && id === "foam") {
          equipment.root.position.copy(new THREE.Vector3(0, 0, -0.56)
            .applyQuaternion(actor.root.quaternion).add(actor.root.position));
          equipment.root.quaternion.copy(actor.root.quaternion);
          return;
        }
        var rope = equipment.key === "jump ropes" && id === "jump-rope";
        var band = equipment.key === "bands" && /^band/.test(id);
        var mini = equipment.key === "mini bands" && /mini-band|bridge/.test(id);
        if (!rope && !band && !mini) {
          equipment.root.visible = true;
          if (equipment.dynamicLine) equipment.dynamicLine.visible = false;
          return;
        }
        equipment.root.visible = false;
        var left = joint(mini ? "KNEE_L" : "WRIST_L");
        var right = joint(mini ? "KNEE_R" : "WRIST_R");
        if (mini) {
          left.lerp(joint("HIP_L"), 0.24);
          right.lerp(joint("HIP_R"), 0.24);
        }
        var points = [];
        var center = left.clone().add(right).multiplyScalar(0.5);
        var across = right.clone().sub(left).normalize();
        var forward = new THREE.Vector3(0, 0, -1).applyQuaternion(actor.root.quaternion);
        var theta = 4 * Math.PI * (actor.currentProgress - 0.125);
        for (var i = 0; i <= 48; i++) {
          var p = i / 48, angle = p * Math.PI * 2;
          var point;
          if (mini) {
            point = center.clone().addScaledVector(across, Math.cos(angle) * (left.distanceTo(right) / 2 + 0.055))
              .addScaledVector(forward, Math.sin(angle) * 0.105);
          } else if (rope) {
            point = left.clone().lerp(right, p);
            var radius = Math.sin(Math.PI * p) * Math.max(0.65, center.y - actor.root.position.y - 0.02);
            point.y -= radius * Math.cos(theta);
            point.addScaledVector(forward, radius * Math.sin(theta));
          } else {
            point = center.clone().addScaledVector(across, Math.cos(angle) * left.distanceTo(right) / 2)
              .addScaledVector(forward, Math.sin(angle) * 0.055);
          }
          points.push(point);
        }
        if (!equipment.dynamicLine) {
          var geometry = new THREE.BufferGeometry().setFromPoints(points);
          geometry.userData.coachCamOwnedGeometry = true;
          var material = new THREE.LineBasicMaterial({ color: mini ? 0xff7444 : 0x2de0c4 });
          material.userData.coachCamOwnedMaterial = true;
          equipment.dynamicLine = new THREE.Line(geometry, material);
          equipment.dynamicLine.name = "WorkingEquipment_" + slug(equipment.key);
          player.drillGroup.add(equipment.dynamicLine);
        } else {
          var attribute = equipment.dynamicLine.geometry.getAttribute("position");
          points.forEach(function (point, index) { attribute.setXYZ(index, point.x, point.y, point.z); });
          attribute.needsUpdate = true;
          equipment.dynamicLine.geometry.computeBoundingSphere();
        }
        equipment.dynamicLine.visible = true;
      });
    }

    function updateMechanicsCamera(delta, phase) {
      if (!player.mechanicsCamera || !player.activeActor) return;
      var THREE = player.runtime.THREE;
      var target = player.activeActor.root.position.clone();
      var floorAction = /sprawl|roll|floor|mat-defense|bridge|foam/.test(player.activeActor.currentMotion);
      var airAction = /jump|attack|block|serve|box/.test(player.activeActor.currentMotion);
      target.y += floorAction ? 0.62 : airAction ? 1.18 : 0.94;
      if (!player.mechanicsTarget) player.mechanicsTarget = target.clone();
      var blend = delta ? clamp(1 - Math.pow(0.002, delta), 0.06, 1) : 1;
      player.mechanicsTarget.lerp(target, blend);
      // The view is relative to the athlete, so hands stay visible when a
      // partner on the other side of the court becomes the demonstrator.
      var radius = floorAction ? 4.5 : airAction ? 5.0 : 4.1;
      var azimuth = player.cameraAngle === "front" ? 0 : player.cameraAngle === "side" ? Math.PI / 2 : Math.PI / 4;
      var offset = new THREE.Vector3(Math.sin(azimuth) * radius,
        floorAction ? 1.30 : 1.05, -Math.cos(azimuth) * radius);
      offset.applyQuaternion(player.activeActor.root.quaternion);
      var desired = player.mechanicsTarget.clone().add(offset);
      player.mechanicsCamera.position.lerp(desired, blend);
      player.mechanicsCamera.fov = floorAction ? 44 : airAction ? 42 : 39;
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
      var activeBeat = active[0];
      if (activeBeat) {
        ui.phaseTitle.textContent = translated(motionLabel(activeBeat.motionId));
        ui.root.setAttribute("data-active-motion", activeBeat.motionId);
      } else {
        ui.root.setAttribute("data-active-motion", "ready");
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
      if (!player.courtCamera) player.courtCamera = new THREE.PerspectiveCamera(48, 16 / 9, 0.04, 120);
      if (!player.mechanicsCamera) player.mechanicsCamera = new THREE.PerspectiveCamera(42, 16 / 9, 0.04, 80);
      if (!player.courtCamera.parent) scene.add(player.courtCamera);
      if (!player.mechanicsCamera.parent) scene.add(player.mechanicsCamera);
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
      renderCamera(player.courtCamera, viewBox(ui.courtView), 0x071724);

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
      try {
        renderCamera(player.mechanicsCamera, viewBox(ui.mechanicsView), 0x0b1b2b);
      } finally {
        actorVisibility.forEach(function (state) {
          state.entry.root.visible = state.visible;
        });
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
      sampleTime: sampleTime, travelProgress: travelProgress, blendYaw: blendYaw, routeFacing: routeFacing,
      motionTimingScale: motionTimingScale, stationMotion: stationMotion })
  });
})();
