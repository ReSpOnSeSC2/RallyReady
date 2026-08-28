// coachcam-3d.js — synchronized dual-camera 3D instruction for authored drills.
//
// CoachCam is deliberately a progressive enhancement. It lazy-loads the local
// Three.js runtime and the drill's Blender-authored GLB only when the experience
// approaches the viewport. If WebGL or an asset is unavailable, the same control
// surface remains useful as an accessible, court-aware phase guide.
(function () {
  "use strict";

  var RR = window.RR = window.RR || {};

  var CONTRACT = Object.freeze({
    drillId: "rolls-and-sprawls",
    model: "models/coachcam/rolls-and-sprawls.glb",
    clip: "CoachCam_RollsSprawls",
    durationSeconds: 14,
    sceneObjects: Object.freeze({
      coach: "Coach",
      defender: "Defender",
      ball: "Ball",
      court: "Court",
      courtCamera: "Camera_Court",
      mechanicsCamera: "Camera_Mechanics",
      sprawlCamera: "Camera_Sprawl"
    }),
    sprawlCameraWindow: Object.freeze({ start: 9.2, end: 12 }),
    runtime: Object.freeze({
      three: "vendor/three/three.module.min.js",
      loader: "vendor/three/addons/loaders/GLTFLoader.js"
    })
  });

  // These authored seconds match the 14-second Blender master clip. Runtime
  // scaling keeps phase labels locked if glTF compression changes the clip by a
  // few frames. Each cue describes the visible mechanical priority at that time.
  var PHASES = Object.freeze([
    phase("ready", "Ready", 0, 1,
      "Load through the hips with the chest over the knees, heels light, and hands quiet in front.",
      "Balanced base"),
    phase("read-right", "Read · low toss right", 1, 1.8,
      "Read the ball before moving. Turn the outside toe toward the target and keep the shoulders level.",
      "See ball first"),
    phase("reach-right", "Ball first · reach", 1.8, 2.6,
      "Step through the ball, lock the platform early, and make contact in front before the body goes down.",
      "Platform before floor"),
    phase("roll-right", "Right shoulder roll", 2.6, 3.8,
      "Tuck the chin and round the outside shoulder. Travel diagonally from shoulder blade to opposite hip — never over the neck or straight down the spine.",
      "Shoulder → opposite hip"),
    phase("recover-right", "Recover", 3.8, 4.6,
      "Carry the roll onto the outside foot, drive through the floor, and regain a balanced defensive base.",
      "Eyes up · rally alive"),
    phase("read-left", "Read · low toss left", 4.6, 5.4,
      "Stay low as the toss changes sides. Lead with the left foot without crossing the feet.",
      "Low and outside"),
    phase("reach-left", "Ball first · reach", 5.4, 6.2,
      "Reach the platform through the ball and angle the rebound high toward middle court before descending.",
      "Control the rebound"),
    phase("roll-left", "Left shoulder roll", 6.2, 7.4,
      "Tuck the chin, soften the left shoulder, and roll on the diagonal across the upper back to the opposite hip.",
      "No neck · no spine"),
    phase("recover-left", "Recover", 7.4, 8.2,
      "Use the rolling momentum to bring the feet underneath the hips and return directly to ready.",
      "Feet under hips"),
    phase("read-short", "Read · short toss", 8.2, 9.2,
      "Recognize the ball dying short. Drop the center of mass and accelerate forward under control.",
      "Forward, not upward"),
    phase("one-hand-save", "One-hand save", 9.2, 10.2,
      "Reach the heel of the hand or a firm one-arm platform under the ball. Play the ball before committing the torso to the floor.",
      "Ball first"),
    phase("sprawl", "Chest + hips sprawl", 10.2, 11.6,
      "Lengthen forward and absorb the floor with chest and hips together. Keep the chin lifted, elbows free, and knees from striking first.",
      "Chest + hips together"),
    phase("recover-sprawl", "Recover", 11.6, 13,
      "Press the hands under the shoulders, draw one knee through, and rise without turning away from the court.",
      "Face the next play"),
    phase("reset", "Ready again", 13, 14,
      "Finish balanced, eyes on the coach, and prepared to move in either direction for the next repetition.",
      "Reset · breathe · repeat")
  ]);

  var runtimePromise = null;
  var sequence = 0;

  function phase(id, label, start, end, cue, key) {
    return Object.freeze({ id: id, label: label, start: start, end: end, cue: cue, key: key });
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function phaseAtSeconds(seconds) {
    var wrapped = ((Number(seconds) || 0) % CONTRACT.durationSeconds + CONTRACT.durationSeconds) %
      CONTRACT.durationSeconds;
    for (var index = PHASES.length - 1; index >= 0; index--) {
      if (wrapped >= PHASES[index].start) return PHASES[index];
    }
    return PHASES[0];
  }

  function authoredSeconds(clipSeconds, clipDuration) {
    if (!clipDuration) return 0;
    return (clipSeconds / clipDuration) * CONTRACT.durationSeconds;
  }

  function clipSeconds(authoredTime, clipDuration) {
    return clamp(authoredTime / CONTRACT.durationSeconds, 0, 1) * clipDuration;
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

  function isEligible(drill) {
    return !!(drill && drill.id === CONTRACT.drillId);
  }

  function loadRuntime() {
    if (!runtimePromise) {
      runtimePromise = Promise.all([
        import("../vendor/three/three.module.min.js"),
        import("../vendor/three/addons/loaders/GLTFLoader.js")
      ]).then(function (modules) {
        if (!modules[0] || !modules[1] || !modules[1].GLTFLoader) {
          throw new Error("CoachCam runtime modules are incomplete");
        }
        return { THREE: modules[0], GLTFLoader: modules[1].GLTFLoader };
      }).catch(function (error) {
        // A later retry should be possible after a transient offline/cache miss.
        runtimePromise = null;
        throw error;
      });
    }
    return runtimePromise;
  }

  function fallbackArtwork(markerId) {
    var fallback = node("div", "coachcam__fallback");
    fallback.setAttribute("aria-hidden", "true");
    markerId = markerId || "coachcam-ball-arrow";

    var wide = node("div", "coachcam__fallback-pane coachcam__fallback-pane--court");
    wide.innerHTML =
      "<svg viewBox='0 0 640 390' focusable='false'>" +
        "<defs><marker id='" + markerId + "' markerWidth='8' markerHeight='8' refX='6' refY='4' orient='auto'><path d='M0 0 8 4 0 8z'/></marker></defs>" +
        "<path class='ccf-court' d='M116 42h408l66 304H50z'/>" +
        "<path class='ccf-line' d='M86 208h468M116 42h408M50 346h540M320 42v304'/>" +
        "<path class='ccf-net' d='M86 208h468'/>" +
        "<path class='ccf-flight' d='M320 91Q445 145 415 266' marker-end='url(#" + markerId + ")'/>" +
        "<path class='ccf-roll' d='M320 286C360 292 396 294 432 273'/>" +
        "<g class='ccf-person ccf-person--coach' transform='translate(320 86)'><circle r='13'/><path d='M0 14v34M-18 25 0 35l20-14M0 48l-15 29M0 48l17 29'/></g>" +
        "<g class='ccf-person' transform='translate(320 278)'><circle r='14'/><path d='M0 15v35M-23 26 0 40l23-14M0 50l-18 30M0 50l19 30'/></g>" +
        "<g class='ccf-person ccf-ghost' transform='translate(414 270) rotate(67)'><circle r='14'/><path d='M0 15v35M-23 26 0 40l23-14M0 50l-18 30M0 50l19 30'/></g>" +
        "<circle class='ccf-ball' cx='414' cy='242' r='9'/><text x='320' y='374'>" +
          translated("FULL COURT · BALL + PLAYER PATH") + "</text>" +
      "</svg>";

    var close = node("div", "coachcam__fallback-pane coachcam__fallback-pane--mechanics");
    close.innerHTML =
      "<svg viewBox='0 0 500 390' focusable='false'>" +
        "<path class='ccf-floor' d='M26 326h448'/>" +
        "<path class='ccf-diagonal' d='M208 144 332 292'/><text class='ccf-note' x='292' y='174'>" +
          translated("SHOULDER") + "</text><text class='ccf-note' x='352' y='290'>" +
          translated("OPPOSITE HIP") + "</text>" +
        "<g class='ccf-body ccf-body--reach'><circle cx='174' cy='112' r='25'/><path d='M187 137 254 212M205 156l92 18M229 190l-52 94M245 207l57 77'/></g>" +
        "<g class='ccf-body ccf-body--roll'><circle cx='300' cy='233' r='24'/><path d='M279 243c-48 12-53 57-10 70 51 16 96-12 93-52M273 260l-64 22M347 266l61 29'/></g>" +
        "<path class='ccf-motion' d='M192 122Q277 106 325 220'/><text x='250' y='365'>" +
          translated("MECHANICS · SAFE DIAGONAL ROLL") + "</text>" +
      "</svg>";
    fallback.appendChild(wide);
    fallback.appendChild(close);
    return fallback;
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

  function buildFigure(drill) {
    var id = "coachcam-" + (++sequence);
    var root = node("section", "coachcam");
    root.id = id;
    root.setAttribute("data-state", "idle");
    root.setAttribute("data-drill-id", CONTRACT.drillId);
    root.setAttribute("aria-label", translated("3D CoachCam demonstration for " +
      (drill.name || "Rolls and Sprawls")));

    var header = node("header", "coachcam__header");
    var identity = node("div", "coachcam__identity");
    var mark = node("span", "coachcam__mark");
    mark.innerHTML = svgIcon("<path d='M4 7.5h10.5a3 3 0 0 1 3 3v6H4z'/><path d='m17.5 11 3.5-2v7l-3.5-2'/><circle cx='8' cy='5' r='2'/>");
    identity.appendChild(mark);
    var identityCopy = node("div", "coachcam__identity-copy");
    identityCopy.appendChild(node("span", "coachcam__eyebrow", "3D CoachCam"));
    var phaseStatus = node("span", "coachcam__phase-status", "Ready · Balanced base");
    identityCopy.appendChild(phaseStatus);
    identity.appendChild(identityCopy);
    header.appendChild(identity);

    var controls = node("div", "coachcam__controls");
    var pause = controlButton("coachcam__control--play", "Pause",
      "<path d='M8 5v14M16 5v14'/>");
    var replay = controlButton("coachcam__control--replay", "Replay",
      "<path d='M4 11a8 8 0 1 0 2.3-5.7L4 7.6'/><path d='M4 3v4.6h4.6'/>");
    controls.appendChild(pause);
    controls.appendChild(replay);
    var speed = node("div", "coachcam__speed");
    speed.setAttribute("role", "group");
    speed.setAttribute("aria-label", translated("Playback speed"));
    [0.5, 1].forEach(function (value) {
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
    stage.appendChild(fallbackArtwork(id + "-ball-arrow"));
    var views = node("div", "coachcam__views");
    var courtView = buildViewFrame("court", "Full court", "player · coach · ball");
    var mechanicsView = buildViewFrame("mechanics", "Mechanics", "active athlete close-up");
    views.appendChild(courtView);
    views.appendChild(mechanicsView);
    stage.appendChild(views);
    var loading = node("div", "coachcam__loading", "Preparing the synchronized 3D court…");
    loading.setAttribute("role", "status");
    loading.setAttribute("aria-live", "polite");
    stage.appendChild(loading);
    root.appendChild(stage);

    var timeline = node("div", "coachcam__timeline");
    var now = node("div", "coachcam__now");
    var nowCopy = node("div", "coachcam__now-copy");
    nowCopy.appendChild(node("span", "coachcam__now-kicker", "Current technique"));
    var phaseTitle = node("strong", "coachcam__now-title", PHASES[0].label);
    nowCopy.appendChild(phaseTitle);
    now.appendChild(nowCopy);
    var time = node("output", "coachcam__time", "0:00 / 0:14");
    time.setAttribute("for", id + "-scrubber");
    now.appendChild(time);
    timeline.appendChild(now);
    var scrubber = node("input", "coachcam__scrubber");
    scrubber.type = "range";
    scrubber.id = id + "-scrubber";
    scrubber.min = "0";
    scrubber.max = "1400";
    scrubber.step = "1";
    scrubber.value = "0";
    scrubber.setAttribute("aria-label", translated("Scrub through the complete Rolls and Sprawls demonstration"));
    scrubber.setAttribute("aria-valuetext", translated("Ready, 0 seconds of 14"));
    timeline.appendChild(scrubber);

    var phaseRail = node("div", "coachcam__phase-rail");
    phaseRail.setAttribute("aria-label", translated("Animation phases. The complete sequence plays automatically."));
    PHASES.forEach(function (item, index) {
      var button = node("button", "coachcam__phase-button" + (index === 0 ? " is-active" : ""));
      button.type = "button";
      button.setAttribute("data-phase", item.id);
      button.setAttribute("data-phase-start", String(item.start));
      button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      button.appendChild(node("span", "coachcam__phase-index", String(index + 1).padStart(2, "0")));
      button.appendChild(node("span", "coachcam__phase-label", item.label));
      phaseRail.appendChild(button);
    });
    timeline.appendChild(phaseRail);
    root.appendChild(timeline);

    var coaching = node("aside", "coachcam__coaching");
    coaching.setAttribute("aria-label", translated("Current body mechanics coaching"));
    var coachingCopy = node("div", "coachcam__coaching-copy");
    coachingCopy.appendChild(node("span", "coachcam__coaching-kicker", "Mechanics cue"));
    var cue = node("p", "coachcam__cue", PHASES[0].cue);
    coachingCopy.appendChild(cue);
    coaching.appendChild(coachingCopy);
    var safety = node("div", "coachcam__safety");
    safety.appendChild(node("span", "coachcam__safety-label", "Safety focus"));
    var safetyKey = node("strong", "coachcam__safety-key", PHASES[0].key);
    safety.appendChild(safetyKey);
    coaching.appendChild(safety);
    root.appendChild(coaching);

    var fallbackText = node("p", "coachcam__fallback-text");
    fallbackText.textContent = translated("The 3D view could not start on this device. Use the complete, court-aware phase timeline and coaching cues above; no instructional steps are hidden.");
    fallbackText.hidden = true;
    root.appendChild(fallbackText);

    var announcer = node("span", "coachcam__announcer");
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    root.appendChild(announcer);

    mountPlayer({
      root: root,
      canvas: canvas,
      stage: stage,
      courtView: courtView,
      mechanicsView: mechanicsView,
      loading: loading,
      fallbackText: fallbackText,
      pause: pause,
      replay: replay,
      speed: speed,
      scrubber: scrubber,
      phaseRail: phaseRail,
      phaseStatus: phaseStatus,
      phaseTitle: phaseTitle,
      time: time,
      cue: cue,
      safetyKey: safetyKey,
      announcer: announcer
    });
    return root;
  }

  function formatTime(seconds) {
    var whole = Math.max(0, Math.floor(seconds + 0.001));
    return Math.floor(whole / 60) + ":" + String(whole % 60).padStart(2, "0");
  }

  function mountPlayer(ui) {
    var player = {
      ui: ui,
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
      clipDuration: CONTRACT.durationSeconds,
      phaseId: "",
      lastFrame: 0,
      frame: 0,
      renderRequested: false,
      resizeObserver: null,
      intersectionObserver: null,
      mutationObserver: null,
      reducedQuery: window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null,
      runtime: null,
      scene: null,
      model: null,
      mixer: null,
      action: null,
      renderer: null,
      courtCamera: null,
      mechanicsCamera: null,
      sprawlCamera: null,
      managesCourtCamera: false,
      managesMechanicsCamera: false,
      defender: null,
      mechanicsOffset: null,
      mechanicsTarget: null,
      optionalOverlays: []
    };

    function announce(message) {
      ui.announcer.textContent = "";
      window.setTimeout(function () {
        if (!player.destroyed) ui.announcer.textContent = translated(message);
      }, 20);
    }

    function updatePlayButton() {
      var paused = player.userPaused;
      var label = paused ? "Play" : "Pause";
      ui.pause.setAttribute("aria-label", translated(label));
      ui.pause.querySelector("span").textContent = translated(label);
      ui.pause.querySelector("svg").innerHTML = paused
        ? "<path d='m8 5 11 7-11 7z'/>"
        : "<path d='M8 5v14M16 5v14'/>";
      ui.root.classList.toggle("is-paused", paused);
    }

    function updateSpeedButtons() {
      Array.prototype.forEach.call(ui.speed.querySelectorAll("button"), function (button) {
        var active = Number(button.getAttribute("data-speed")) === player.speed;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    function currentClipTime() {
      return player.action ? player.action.time : 0;
    }

    function updatePhase(timeInClip, force) {
      var authored = authoredSeconds(timeInClip, player.clipDuration);
      var current = phaseAtSeconds(authored);
      var progress = clamp(authored / CONTRACT.durationSeconds, 0, 1);
      if (!player.scrubbing) ui.scrubber.value = String(Math.round(progress * 1400));
      ui.scrubber.style.setProperty("--coachcam-progress", (progress * 100).toFixed(3) + "%");
      ui.scrubber.setAttribute("aria-valuetext", translated(current.label + ", " +
        formatTime(authored) + " of " + formatTime(CONTRACT.durationSeconds)));
      ui.time.textContent = formatTime(authored) + " / " + formatTime(CONTRACT.durationSeconds);
      if (!force && player.phaseId === current.id) return;
      player.phaseId = current.id;
      ui.root.setAttribute("data-phase", current.id);
      ui.phaseStatus.textContent = translated(current.label + " · " + current.key);
      ui.phaseTitle.textContent = translated(current.label);
      ui.cue.textContent = translated(current.cue);
      ui.safetyKey.textContent = translated(current.key);
      Array.prototype.forEach.call(ui.phaseRail.children, function (button) {
        var active = button.getAttribute("data-phase") === current.id;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
        if (active && !player.scrubbing) {
          var railLeft = ui.phaseRail.scrollLeft;
          var railRight = railLeft + ui.phaseRail.clientWidth;
          if (button.offsetLeft < railLeft || button.offsetLeft + button.offsetWidth > railRight) {
            // Move only the horizontal phase rail. scrollIntoView would also
            // move the page vertically on phones and hide the active cameras.
            ui.phaseRail.scrollTo({
              left: button.offsetLeft + button.offsetWidth / 2 - ui.phaseRail.clientWidth / 2,
              behavior: "smooth"
            });
          }
        }
      });
      updateOptionalOverlays(current.id);
    }

    function updateOptionalOverlays(phaseId) {
      player.optionalOverlays.forEach(function (entry) {
        var name = entry.name.toLowerCase();
        var show = false;
        if (/ball.?first|platform|contact/.test(name)) show = /reach|one-hand/.test(phaseId);
        else if (/shoulder|roll.?(?:path|arc)|diagonal/.test(name)) show = /roll-/.test(phaseId);
        else if (/sprawl|landing|chest|hips/.test(name)) show = phaseId === "sprawl";
        else if (/head|chin|safe/.test(name)) show = /roll-|sprawl/.test(phaseId);
        entry.object.visible = show;
      });
    }

    function seek(authoredTime, shouldAnnounce) {
      var nextClipTime = clipSeconds(authoredTime, player.clipDuration);
      if (player.mixer && player.action) {
        // AnimationMixer.setTime respects AnimationAction.paused. Temporarily
        // release that clock so a paused scrub still evaluates every bone at
        // the requested pose, then restore the exact transport state.
        var wasActionPaused = player.action.paused;
        player.action.paused = false;
        player.mixer.setTime(nextClipTime);
        player.action.paused = wasActionPaused;
      }
      updatePhase(nextClipTime, true);
      // Scrubbing must paint the requested pose immediately, even when the tab
      // is paused or the browser throttles requestAnimationFrame. This keeps
      // the skeleton, animated cameras, safety overlays, and cue text locked to
      // the same authored instant under touch dragging and automated QA.
      renderNow();
      requestRender();
      if (shouldAnnounce) announce("Showing " + phaseAtSeconds(authoredTime).label + ". " +
        phaseAtSeconds(authoredTime).cue);
    }

    function shouldAnimate() {
      return player.initialized && !player.destroyed && !player.userPaused &&
        !player.autoPaused && !document.hidden;
    }

    function syncActionState() {
      if (player.action) {
        player.action.paused = !shouldAnimate();
        player.action.setEffectiveTimeScale(player.speed);
      }
      if (shouldAnimate()) startFrameLoop();
      else requestRender();
    }

    function setUserPaused(value, shouldAnnounce) {
      player.userPaused = !!value;
      updatePlayButton();
      syncActionState();
      if (shouldAnnounce) announce(player.userPaused ? "Animation paused." :
        "Animation playing at " + player.speed + " times speed.");
    }

    function requestRender() {
      if (!player.initialized || player.destroyed || player.frame) return;
      player.renderRequested = true;
      player.frame = window.requestAnimationFrame(renderFrame);
    }

    function renderNow() {
      if (!player.initialized || player.destroyed || !ui.root.isConnected) return;
      updateManagedMechanicsCamera(0);
      renderViews();
      player.renderRequested = false;
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
      // The action owns the 0.5×/1× scale; feed the mixer real elapsed time so
      // speed is applied exactly once.
      if (animate && player.mixer) player.mixer.update(delta);
      updatePhase(currentClipTime(), false);
      updateManagedMechanicsCamera(delta);
      renderViews();
      player.renderRequested = false;
      if (animate) player.frame = window.requestAnimationFrame(renderFrame);
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

    function renderCamera(camera, box, color, preserveAuthoredWidth) {
      var renderer = player.renderer;
      var nextAspect = box.width / box.height;
      // Blender cameras are authored at 16:9. A stacked phone pane is narrower;
      // changing only `aspect` would crop the sides and cut off the athlete
      // during a roll. Preserve the authored horizontal field of view by
      // opening the vertical field only when the runtime pane becomes narrower.
      if (camera.isPerspectiveCamera) {
        if (!(camera.userData.coachCamBaseFov > 0)) {
          camera.userData.coachCamBaseFov = camera.fov;
          camera.userData.coachCamBaseAspect = camera.aspect > 0 ? camera.aspect : 16 / 9;
        }
        var baseFov = camera.userData.coachCamBaseFov;
        var baseAspect = camera.userData.coachCamBaseAspect;
        camera.fov = preserveAuthoredWidth && nextAspect < baseAspect
          ? player.runtime.THREE.MathUtils.radToDeg(2 * Math.atan(
              Math.tan(player.runtime.THREE.MathUtils.degToRad(baseFov) / 2) *
              baseAspect / nextAspect))
          : baseFov;
      }
      camera.aspect = nextAspect;
      camera.updateProjectionMatrix();
      renderer.setViewport(box.x, box.y, box.width, box.height);
      renderer.setScissor(box.x, box.y, box.width, box.height);
      renderer.setClearColor(color, 1);
      renderer.clear(true, true, true);
      renderer.render(player.scene, camera);
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
      // Animated athletes still need a fresh shadow map each visual frame. With
      // autoUpdate disabled, Three clears this flag after the first (court)
      // render and the mechanics pane reuses that exact result.
      player.renderer.shadowMap.needsUpdate = true;
      // Both Blender cameras are authored at 16:9, while each responsive pane
      // can be substantially narrower. Preserve the authored horizontal field
      // in both views so the coach, defender, ball, and court boundaries never
      // get clipped by the desktop split or the stacked phone layout.
      renderCamera(player.courtCamera, viewBox(ui.courtView), 0x071724, true);
      var authored = authoredSeconds(currentClipTime(), player.clipDuration);
      var useSprawlLens = player.sprawlCamera &&
        authored >= CONTRACT.sprawlCameraWindow.start &&
        authored < CONTRACT.sprawlCameraWindow.end;
      ui.root.setAttribute("data-mechanics-camera", useSprawlLens ? "sprawl" : "mechanics");
      renderCamera(useSprawlLens ? player.sprawlCamera : player.mechanicsCamera,
        viewBox(ui.mechanicsView), 0x0b1b2b, true);
    }

    function findNamed(root, exactName, fallbackPattern, cameraOnly) {
      var exact = root.getObjectByName(exactName);
      if (exact && (!cameraOnly || exact.isCamera)) return exact;
      var found = null;
      root.traverse(function (object) {
        if (!found && (!cameraOnly || object.isCamera) && fallbackPattern.test(object.name || "")) found = object;
      });
      return found;
    }

    function frameFallbackCameras(THREE) {
      var box = new THREE.Box3().setFromObject(player.model);
      if (box.isEmpty()) box.setFromCenterAndSize(new THREE.Vector3(0, 1, 0), new THREE.Vector3(9, 3, 18));
      var center = box.getCenter(new THREE.Vector3());
      var size = box.getSize(new THREE.Vector3());
      var radius = Math.max(7, size.x, size.z, size.y * 2);

      if (player.managesCourtCamera) {
        player.courtCamera.position.set(center.x + radius * 0.52,
          center.y + radius * 0.72, center.z + radius * 0.92);
        player.courtCamera.near = Math.max(0.02, radius / 500);
        player.courtCamera.far = radius * 12;
        player.courtCamera.lookAt(center.x, center.y + size.y * 0.08, center.z);
        player.courtCamera.updateProjectionMatrix();
      }

      player.mechanicsOffset = new THREE.Vector3(radius * 0.23, radius * 0.13, radius * 0.29);
      player.mechanicsTarget = new THREE.Vector3();
      if (player.defender) player.defender.getWorldPosition(player.mechanicsTarget);
      else player.mechanicsTarget.copy(center);
      player.mechanicsTarget.y += Math.max(0.8, size.y * 0.25);
      if (player.managesMechanicsCamera) {
        player.mechanicsCamera.position.copy(player.mechanicsTarget).add(player.mechanicsOffset);
        player.mechanicsCamera.near = Math.max(0.02, radius / 800);
        player.mechanicsCamera.far = radius * 8;
        player.mechanicsCamera.lookAt(player.mechanicsTarget);
        player.mechanicsCamera.updateProjectionMatrix();
      }
    }

    function updateManagedMechanicsCamera(delta) {
      if (!player.managesMechanicsCamera || !player.defender || !player.mechanicsTarget) return;
      var THREE = player.runtime.THREE;
      var target = new THREE.Vector3();
      player.defender.getWorldPosition(target);
      target.y += player.mechanicsOffset.y * 0.72;
      var blend = delta ? 1 - Math.pow(0.001, delta) : 1;
      player.mechanicsTarget.lerp(target, clamp(blend, 0.08, 1));
      var desired = player.mechanicsTarget.clone().add(player.mechanicsOffset);
      player.mechanicsCamera.position.lerp(desired, clamp(blend, 0.06, 1));
      player.mechanicsCamera.lookAt(player.mechanicsTarget);
    }

    function prepareMaterials(THREE, model, renderer) {
      model.traverse(function (object) {
        if (!object.isMesh) return;
        object.castShadow = true;
        object.receiveShadow = true;
        var materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(function (material) {
          if (!material) return;
          if (material.map) material.map.anisotropy = Math.min(8,
            renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1);
          material.needsUpdate = true;
        });
      });
    }

    function setupScene(runtime, gltf) {
      var THREE = runtime.THREE;
      var clip = THREE.AnimationClip.findByName(gltf.animations, CONTRACT.clip) || gltf.animations[0];
      if (!clip || !(clip.duration > 0)) throw new Error("CoachCam animation clip is missing");
      var renderer = new THREE.WebGLRenderer({
        canvas: ui.canvas,
        antialias: (window.devicePixelRatio || 1) <= 2,
        alpha: false,
        powerPreference: "high-performance"
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.02;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      // The shared scene is drawn twice per visual frame. Updating the light's
      // 1024px shadow map for both camera panes would duplicate the most
      // expensive GPU pass on phones, so render it once and reuse it for the
      // second synchronized camera.
      renderer.shadowMap.autoUpdate = false;

      var scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x071724, 22, 48);
      scene.add(gltf.scene);
      var hemisphere = new THREE.HemisphereLight(0xd8edff, 0x17212b, 1.85);
      scene.add(hemisphere);
      var key = new THREE.DirectionalLight(0xfff1dc, 2.2);
      key.position.set(-7, 13, 9);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      scene.add(key);
      var rim = new THREE.DirectionalLight(0xff6b35, 1.15);
      rim.position.set(8, 6, -9);
      scene.add(rim);

      var mixer = new THREE.AnimationMixer(gltf.scene);
      var action = mixer.clipAction(clip);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.clampWhenFinished = false;
      action.play();

      player.runtime = runtime;
      player.runtime.scratchSize = new THREE.Vector2();
      player.scene = scene;
      player.model = gltf.scene;
      player.renderer = renderer;
      player.mixer = mixer;
      player.action = action;
      player.clipDuration = clip.duration;
      player.defender = findNamed(gltf.scene, CONTRACT.sceneObjects.defender,
        /(?:^|[_\s-])defender(?:$|[_\s-])|athlete/i, false);
      player.courtCamera = findNamed(gltf.scene, CONTRACT.sceneObjects.courtCamera,
        /camera.*(?:court|wide)|(?:court|wide).*camera/i, true);
      player.mechanicsCamera = findNamed(gltf.scene, CONTRACT.sceneObjects.mechanicsCamera,
        /camera.*(?:mechanics|close)|(?:mechanics|close).*camera/i, true);
      player.sprawlCamera = findNamed(gltf.scene, CONTRACT.sceneObjects.sprawlCamera,
        /camera.*sprawl|sprawl.*camera/i, true);
      player.managesCourtCamera = !player.courtCamera;
      player.managesMechanicsCamera = !player.mechanicsCamera;
      if (!player.courtCamera) player.courtCamera = new THREE.PerspectiveCamera(37, 1, 0.02, 200);
      if (!player.mechanicsCamera) player.mechanicsCamera = new THREE.PerspectiveCamera(32, 1, 0.02, 120);
      player.optionalOverlays = [];
      gltf.scene.traverse(function (object) {
        var overlayName = object.name || "";
        if (overlayName === "SafetyRollArc" || overlayName === "SprawlLanding" ||
            /^(?:Overlay|Safety)[_\s-]/i.test(overlayName) ||
            /(?:shoulder|roll.?arc|sprawl.?landing)/i.test(overlayName)) {
          object.visible = false;
          player.optionalOverlays.push({ name: overlayName, object: object });
        }
      });
      prepareMaterials(THREE, gltf.scene, renderer);
      frameFallbackCameras(THREE);
    }

    function initialize() {
      if (player.destroyed || player.initialized || player.initializing || player.failed) return;
      player.initializing = true;
      ui.root.setAttribute("data-state", "loading");
      ui.loading.textContent = translated("Preparing the synchronized 3D court…");
      loadRuntime().then(function (runtime) {
        if (player.destroyed) return null;
        var loader = new runtime.GLTFLoader();
        return loader.loadAsync(CONTRACT.model).then(function (gltf) {
          return { runtime: runtime, gltf: gltf };
        });
      }).then(function (loaded) {
        if (!loaded || player.destroyed) return;
        setupScene(loaded.runtime, loaded.gltf);
        player.initialized = true;
        player.initializing = false;
        ui.root.setAttribute("data-state", "ready");
        ui.root.setAttribute("data-clip", CONTRACT.clip);
        ui.root.setAttribute("data-clip-duration", String(player.clipDuration));
        ui.loading.textContent = translated("3D CoachCam ready");
        window.setTimeout(function () {
          if (!player.destroyed) ui.loading.setAttribute("aria-hidden", "true");
        }, 500);
        seek(0, false);
        syncActionState();
      }).catch(function () {
        if (player.destroyed) return;
        player.initializing = false;
        player.failed = true;
        ui.root.setAttribute("data-state", "fallback");
        ui.loading.textContent = translated("Court-aware phase guide");
        ui.fallbackText.hidden = false;
        updatePhase(0, true);
      });
    }

    function disposeMaterial(material) {
      if (!material) return;
      Object.keys(material).forEach(function (key) {
        var value = material[key];
        if (value && value.isTexture && value.dispose) value.dispose();
      });
      if (material.dispose) material.dispose();
    }

    function destroy() {
      if (player.destroyed) return;
      player.destroyed = true;
      if (player.frame) window.cancelAnimationFrame(player.frame);
      player.frame = 0;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", destroy);
      window.removeEventListener("resize", requestRender);
      ui.canvas.removeEventListener("webglcontextlost", onContextLost);
      if (player.resizeObserver) player.resizeObserver.disconnect();
      if (player.intersectionObserver) player.intersectionObserver.disconnect();
      if (player.mutationObserver) player.mutationObserver.disconnect();
      if (player.mixer && player.model) {
        player.mixer.stopAllAction();
        player.mixer.uncacheRoot(player.model);
      }
      if (player.model) {
        player.model.traverse(function (object) {
          if (object.geometry && object.geometry.dispose) object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach(disposeMaterial);
          else disposeMaterial(object.material);
        });
      }
      if (player.renderer) {
        player.renderer.dispose();
        if (player.renderer.forceContextLoss) player.renderer.forceContextLoss();
      }
      ui.root.removeAttribute("data-ready");
    }

    function onVisibility() {
      player.autoPaused = document.hidden || ui.root.getAttribute("data-intersecting") === "false";
      syncActionState();
    }

    function onContextLost(event) {
      event.preventDefault();
      if (player.destroyed) return;
      player.failed = true;
      player.initialized = false;
      if (player.frame) window.cancelAnimationFrame(player.frame);
      player.frame = 0;
      ui.root.setAttribute("data-state", "fallback");
      ui.loading.removeAttribute("aria-hidden");
      ui.loading.textContent = translated("Court-aware phase guide");
      ui.fallbackText.hidden = false;
    }

    ui.pause.addEventListener("click", function () {
      setUserPaused(!player.userPaused, true);
    });
    ui.replay.addEventListener("click", function () {
      player.userPaused = false;
      updatePlayButton();
      seek(0, false);
      syncActionState();
      announce("Replaying the complete demonstration from Ready at " + player.speed + " times speed.");
    });
    ui.speed.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-speed]");
      if (!button) return;
      player.speed = Number(button.getAttribute("data-speed")) === 0.5 ? 0.5 : 1;
      updateSpeedButtons();
      syncActionState();
      announce("Playback speed " + player.speed + " times.");
    });
    ui.phaseRail.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-phase-start]");
      if (!button) return;
      seek(Number(button.getAttribute("data-phase-start")), true);
    });
    ui.scrubber.addEventListener("pointerdown", function () {
      player.scrubbing = true;
      player.resumeAfterScrub = !player.userPaused;
      if (player.action) player.action.paused = true;
    });
    ui.scrubber.addEventListener("input", function () {
      player.scrubbing = true;
      seek((Number(ui.scrubber.value) / 1400) * CONTRACT.durationSeconds, false);
    });
    function finishScrub() {
      if (!player.scrubbing) return;
      player.scrubbing = false;
      if (player.resumeAfterScrub) player.userPaused = false;
      updatePlayButton();
      updatePhase(currentClipTime(), true);
      syncActionState();
      announce("Showing " + phaseAtSeconds((Number(ui.scrubber.value) / 1400) *
        CONTRACT.durationSeconds).label + ".");
    }
    ui.scrubber.addEventListener("change", finishScrub);
    ui.scrubber.addEventListener("pointerup", finishScrub);
    ui.scrubber.addEventListener("pointercancel", finishScrub);
    ui.scrubber.addEventListener("keydown", function (event) {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].indexOf(event.key) !== -1) {
        player.scrubbing = true;
        window.setTimeout(finishScrub, 0);
      }
    });

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", destroy, { once: true });
    ui.canvas.addEventListener("webglcontextlost", onContextLost, false);

    if (window.ResizeObserver) {
      player.resizeObserver = new ResizeObserver(function () { requestRender(); });
      player.resizeObserver.observe(ui.stage);
    } else {
      window.addEventListener("resize", requestRender);
    }

    if (window.IntersectionObserver) {
      player.intersectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.target !== ui.root) return;
          ui.root.setAttribute("data-intersecting", entry.isIntersecting ? "true" : "false");
          player.autoPaused = !entry.isIntersecting || document.hidden;
          if (entry.isIntersecting) initialize();
          syncActionState();
        });
      }, { rootMargin: "320px 0px", threshold: 0.01 });
      player.intersectionObserver.observe(ui.root);
    } else {
      window.setTimeout(initialize, 0);
    }

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
      ui.root.setAttribute("data-reduced-motion", "true");
    }
    updatePlayButton();
    updateSpeedButtons();
    updatePhase(0, true);
    ui.root._coachCamDestroy = destroy;
  }

  RR.coachCam3D = Object.freeze({
    isEligible: isEligible,
    figure: buildFigure,
    contract: CONTRACT,
    phases: PHASES,
    _internals: Object.freeze({
      phaseAtSeconds: phaseAtSeconds,
      authoredSeconds: authoredSeconds,
      clipSeconds: clipSeconds,
      formatTime: formatTime
    })
  });
})();
