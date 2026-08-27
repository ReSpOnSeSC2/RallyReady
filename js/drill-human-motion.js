// drill-human-motion.js — factual drill steps mapped to reviewed human motion.
//
// The court specs explain where a drill happens. This module explains how the
// athlete moves: every bundled written step is preserved verbatim, paired with
// a reviewed technique family, a four-pose human atlas, and phase-level body
// cues. Custom drills only receive a human demonstration when the coach saves
// an explicit motionType; free text is never used to invent custom mechanics.
window.RR = window.RR || {};

RR.drillHumanMotion = (function () {
  "use strict";

  var BASE = "images/drill-motion/";
  var actions = {
    pass: action("pass", "Forearm pass", 1067, 1120, "sequence", [
      phase("Ready", "Feet wider than hips; knees soft; shoulders forward."),
      phase("Build the platform", "Join the hands early and keep both forearms straight."),
      phase("Contact", "Meet the middle of the ball in front of the body."),
      phase("Hold the target", "Finish balanced with the platform facing the target.")
    ]),
    set: action("set", "Overhead set", 1120, 1057, "sequence", [
      phase("Read", "Track the ball early and move before raising the hands."),
      phase("Get underneath", "Balance the feet and show a clean window above the forehead."),
      phase("Finger contact", "Use relaxed, spread fingers and contact both sides evenly."),
      phase("Extend", "Drive through the legs and finish both hands toward the target.")
    ]),
    serve: action("serve", "Overhand serve", 1120, 1053, "sequence", [
      phase("Stance", "Start balanced and staggered with the ball in front of the hitting shoulder."),
      phase("Toss + load", "Keep the toss repeatable while the hitting elbow loads high."),
      phase("Contact", "Reach tall and strike the center of the ball with a firm open hand."),
      phase("Transfer", "Move body weight through the ball and finish inside the court.")
    ]),
    underhand: action("underhand", "Underhand serve", 1254, 1254, "sequence", [
      phase("Stance", "Step the opposite foot forward and support the ball below the waist."),
      phase("Backswing", "Keep the ball still while the straight hitting arm swings behind the hip."),
      phase("Contact", "Step and strike the bottom-back of the ball with a firm fist or hand heel."),
      phase("Follow through", "Swing the hitting arm toward the target and transfer weight forward.")
    ]),
    attack: action("attack", "Attack approach", 1120, 1120, "sequence", [
      phase("Read", "Stay available and time the first step from the set."),
      phase("Load", "Use a long penultimate step and swing both arms behind the hips."),
      phase("Reach + contact", "Jump vertically and contact high in front of the hitting shoulder."),
      phase("Land", "Absorb the landing on two feet and recover for the next play.")
    ]),
    block: action("block", "Block and press", 1120, 1050, "sequence", [
      phase("Ready", "Stay square to the net with hands high and knees loaded."),
      phase("Close", "Move along the net without drifting or turning the shoulders."),
      phase("Press", "Reach up, then press strong hands forward over the net."),
      phase("Land + reset", "Land on two feet, regain balance, and show the hands again.")
    ]),
    defense: action("defense", "Floor defense", 1050, 1120, "sequence", [
      phase("Ready", "Keep the hips low, weight forward, and hands available."),
      phase("Move", "Push from the outside foot and keep the shoulders behind the ball."),
      phase("Dig safely", "Angle a stable platform and let low momentum continue safely."),
      phase("Recover", "Get back to the feet quickly and return to a balanced base.")
    ]),
    footwork: action("footwork", "Athletic footwork", 1120, 879, "sequence", [
      phase("Base", "Start low enough to move in any direction without an extra step."),
      phase("Push", "Drive from the outside leg; do not reach with the lead foot."),
      phase("Travel", "Keep the hips level and the feet active without clicking together."),
      phase("Plant", "Stop under control, face the play, and be ready to reverse.")
    ]),
    run: action("run", "Running stride", 1254, 1254, "sequence", [
      phase("Drive", "Lean slightly from the ankles and push the floor behind you."),
      phase("Flight", "Drive the front knee while the opposite arm moves forward."),
      phase("Foot strike", "Land softly under the hips instead of reaching the foot ahead."),
      phase("Recover", "Pull the heel through quickly and flow into the next push-off.")
    ]),
    warmup: action("warmup", "Dynamic warm-up", 1120, 1065, "catalog", [
      phase("Easy jog", "Use relaxed posture and an easy rhythm to raise body temperature."),
      phase("High knees", "Drive opposite arm and knee while landing under the hips."),
      phase("Lunge + rotate", "Track the front knee over the toes and rotate through the chest."),
      phase("Lateral lunge", "Sit the hips back while the long leg stays extended.")
    ]),
    band: action("band", "Resistance-band form", 1067, 1120, "catalog", [
      phase("Set posture", "Stand tall with ribs down and the working shoulder relaxed."),
      phase("Rotate", "Keep the elbow pinned while the forearm moves under control."),
      phase("Pull apart", "Keep straight wrists and squeeze the shoulder blades together."),
      phase("Y raise", "Lift up and out without shrugging or arching the back.")
    ]),
    medicine: action("medicine", "Medicine-ball power", 1101, 1120, "sequence", [
      phase("Load", "Use an athletic stance and brace before moving the ball."),
      phase("Reach", "Extend tall with the ball controlled in both hands."),
      phase("Drive", "Snap the trunk and direct force through the intended target."),
      phase("Recover", "Stay balanced and retrieve the rebound with safe posture.")
    ]),
    recovery: action("recovery", "Recovery position", 1120, 1108, "catalog", [
      phase("Hamstring", "Keep a long spine and move only to a comfortable stretch."),
      phase("Figure four", "Relax the shoulders and keep the crossed foot flexed."),
      phase("Leg roll", "Support the body and roll slowly through the working tissue."),
      phase("Upper back", "Support the head and keep the roller off the neck and low back.")
    ]),
    cooldown: action("cooldown", "Cooldown sequence", 1312, 1312, "catalog", [
      phase("Recovery walk", "Walk easily until breathing and heart rate begin returning toward normal."),
      phase("Diaphragmatic breath", "Place the hands on the lower ribs and breathe slowly into the abdomen."),
      phase("Reflect", "Sit comfortably, notice how the body feels, and close with the team."),
      phase("Child's pose", "Sink the hips toward the heels, reach long, and keep the breath relaxed.")
    ]),
    jump: action("jump", "Jump and landing", 1120, 1050, "sequence", [
      phase("Ready", "Load the ankles, knees, and hips while keeping the chest controlled."),
      phase("Take off", "Swing both arms and leave the floor from a balanced base."),
      phase("Reach", "Stay tall through the trunk and reach without drifting sideways."),
      phase("Stick the landing", "Land quietly on two feet with knees tracking over toes.")
    ])
  };

  var FALLBACK_BY_SKILL = {
    Warmup: "warmup", "Ball Control": "pass", Passing: "pass", Setting: "set",
    Serving: "serve", Hitting: "attack", Blocking: "block", Defense: "defense",
    "Team Play": "footwork", Cooldown: "cooldown"
  };

  // Strong detectors describe an action the learner actually performs in this
  // saved step. Role nouns ("hitter", "setter") and feed language ("server
  // serves") live in the weaker tier below so they cannot beat an exact verb
  // such as digs, sets, or hits. Standalone `set`, `roll`, `read`, `rotate`,
  // `move`, and `recover` are deliberately absent because they are heavily
  // overloaded in real drill copy.
  var detectors = [
    detector("pass", /\bforearm pass(?:es|ed|ing)?\b|\bserve[- ]receive\b|\bbump(?:s|ed|ing)?\s+(?:it|the|a|that|this|ball|serve|to|back|up|over|across)\b|\bpass(?:es|ing)?\s+(?:it|the|a|that|this|another|ball|serve|rebound|to|back|up|over|across|themselves|himself|herself)\b/i),
    detector("set", /\b(?:front|back|jump|bump|overhead|quick|shoot|high|outside|one[- ]knee)[- ]set(?:s|ting)?\b|\bsetter\s+(?:sets?|releases?|squares?|chases?)\b|\bsetter\s+delivers?\s+(?:(?:a|the)\s+)?(?:front|back|quick|high|transition|outside|right[- ]side)?\s*set\b|\bsets?\s+(?:it|the|a|that|this|next|another|tossed|passed|dug|ball|rebound|to|back|outside|middle|right|left|over|for|themselves|himself|herself)\b|\bclean hands\b|\bhand window\b/i),
    detector("serve", /\b(?:standing|underhand|overhand|float|topspin|jump[- ]float|jump[- ]topspin|hybrid)\s+serv(?:e|es|ing)\b|\bserv(?:e|es|ed|ing)\s+(?:it|the|a|that|this|ball|to|at|into|over|from|for|real|tough|easy|high|deep)\b|\b(?:team|player|athlete|they)\s+serves?\b|\bserving\s+(?:toss|arm|contact|routine)\b|\bpre[- ]serve\b/i),
    detector("attack", /\bspik(?:e|es|ed|ing)\b|\barm swing\b|\broll[- ]shots?\b|\btip(?:s|ped|ping)?\s+(?:it|the|a|ball|over|to)\b|\bdump(?:s|ed|ing)?\s+(?:it|the|a|ball|over|to)\b|\bdown[- ]?balls?\b|\bkill(?:s|ed|ing)?\b|\bswing(?:s|ing)?\s+(?:through|hard|at|over|into)\b|\bapproach(?:es|ing)?\s+(?:and|to)\s+(?:hit|attack|swing|jump)\b|\bhits?\s+(?:it|back|down|over|into|(?:(?:the|a|that|this)\s+)?(?:ball|set))\b|\b(?:player|hitter|team|they|everyone|who)\s+(?:[a-z'-]+[\s,]+){0,6}attacks\b|\battack(?:ed|ing)\b|\battack\s+(?:it|over|into|back|(?:(?:the|a)\s+)?(?:ball|set|counter))\b|\b(?:player|hitter)\s+rolls?\s+(?:the\s+|a\s+)?ball\b/i),
    detector("block", /\bblocking\s+(?:footwork|hands|timing|movement)\b|\bblockers?\s+(?:move|moves|jump|jumps|close|closes|press|presses|land|lands|read|reads|block|blocks)\b|\bblocks?\s+(?:it|the|a|that|this|ball)\b|\bblock[- ]jump\b|\bdouble block\b|\bswing block\b|\bcommit block\b|\bpress(?:es|ed|ing)?\s+(?:the\s+)?hands?\b|\bseal(?:s|ed|ing)?\b/i),
    detector("defense", /\bdigs?\s+(?:it|the|a|that|this|ball|back|up|to)\b|\bwho\s+digs?\b|\bdigging\b|\bsprawl(?:s|ed|ing)?\b|\bpancake(?:s|d|ing)?\b|\bpursuit\b|\bemergency\s+(?:defense|save)\b|\bcollapse(?:s|d|ing)?\b|\bshoulder roll\b|\broll or sprawl\b|\bdiv(?:e|es|ed|ing)\b|\brun[- ]through\b|\bdeflect(?:s|ed|ing)?\s+(?:it|the|a|each|ball)\b/i),
    detector("jump", /\bjump(?:s|ed|ing)?\b|\btake[- ]?off\b|\bland(?:s|ed|ing)?\b|\bairborne\b|\bhop(?:s|ped|ping)?\b|\bdepth[- ](?:drop|jump)\b/i),
    detector("run", /\bsprint(?:s|ed|ing)?\b|\bjog(?:s|ged|ging)?\b|\bruns?\s+(?:to|toward|back|forward|onto|through|down|across|around|along|after|off|out|up|under|into)\b|\brunning\s+(?:stride|start|takeoff|pace)\b/i),
    detector("footwork", /\bfootwork\b|\bshuffle(?:s|d|ing)?\b|\bcrossover\b|\bdrop[- ]step\b|\bbackpedal(?:s|ed|ing)?\b|\bquick feet\b|\bagility ladder\b|\bcarioca\b|\bgrapevine\b|\bside[- ]steps?\b|\bsplit step\b|\bapproach\s+(?:steps?|footwork|rhythm)\b|\brelease\s+(?:from|to)\b|\bjump rope\b|\bquicksteps?\b|\b(?:pulls?|pushes?|crosses?|transitions?)\s+(?:to|toward|back|off|out|across|down|under|into)\b|\bsets?\s+(?:the|your)\s+feet\b/i),
    detector("warmup", /\bhigh knees\b|\bbutt[- ]?kicks?\b|\blunges?\b|\bleg swings?\b|\barm circles?\b|\bbear crawl\b|\bcrab walk\b|\binchworms?\b|\bactivation\b|\bwarm[- ]?up\b/i),
    detector("recovery", /\bfoam\s*roll(?:er|ing)?\b|\bstatic stretch\b|\bstretch(?:es|ed|ing)?\b/i),
    detector("cooldown", /\brecovery walk\b|\bcool[- ]?down walk\b|\bwalk(?:s|ed|ing)?\s+(?:slowly|easily)\b|\bbreath(?:e|es|ing|s)?\b|\breflect(?:s|ed|ing|ion)?\b|\bteam talk\b|\byoga\b|\bchild'?s pose\b|\bwind down\b|\bheart rate\s+(?:come|comes|coming)\s+down\b/i)
  ];

  var weakDetectors = [
    detector("pass", /\bpassers?\b|\breceivers?\b|\bforearms?\b|\bplatform\b/i),
    detector("set", /\bsetting\b|\bsetting window\b/i),
    detector("attack", /\bhitters?\b|\battack approach\b/i),
    detector("block", /\bblockers?\b|\bblocking\b/i),
    detector("defense", /\bdefenders?\b|\bdiggers?\b|\bdefensive\s+(?:base|stance|position|spot)\b/i)
  ];

  function action(id, label, width, height, mode, phases) {
    return { id: id, label: label, asset: BASE + id + "-atlas.webp",
      width: width, height: height, mode: mode, phases: phases };
  }

  function phase(label, cue) { return { label: label, cue: cue }; }
  function detector(id, regex) { return { id: id, regex: regex }; }
  function clean(value) { return typeof value === "string" ? value.trim() : ""; }
  function list(value) {
    return Array.isArray(value) ? value.map(clean).filter(function (item) { return !!item; }) : [];
  }

  function sanitizedText(value) {
    return clean(value)
      .replace(/\bsets?\s+of\b/gi, "rounds of")
      .replace(/\bset\s+(?:(?:a|the|your)\s+)?(?:number|time|score|amount|target|goal)\b/gi,
        "target amount")
      .replace(/\btarget\s+set(?:\s+of)?\b/gi, "target round")
      .replace(/\bset\s+up\b/gi, "arrange")
      .replace(/\bset\s+(?:(?:a|the|your)\s+)?(?:base|ladder|box|hoop|team|formation|court|station|timer|arm angle)\b/gi,
        "position the equipment");
  }

  function specialAction(drill, source) {
    var equipment = list(drill && drill.equipment).join(" ");
    var id = clean(drill && drill.id);
    var context = [id, drill && drill.name, equipment].map(clean).join(" ");
    if (id === "underhand-serve-progression") return "underhand";
    if (id === "guided-breathing-and-reflection") return "cooldown";
    if (id === "yoga-flow-cooldown") {
      return /child'?s pose|lying still|slow breaths?/i.test(source || "") ? "cooldown" : "recovery";
    }
    if (id === "static-stretch-cooldown" || id === "hamstring-and-hip-stretch" ||
        id === "calf-and-ankle-recovery") return "recovery";
    if (/\b(?:resistance|mini)\s*bands?\b|\bband[- ]/i.test(context)) return "band";
    if (/\b(?:medicine|med)\s*balls?\b/i.test(context)) return "medicine";
    if (/\bfoam\s*roller\b/i.test(context)) return "recovery";
    if (id === "box-step-ups-approach") return "footwork";
    if (id === "box-depth-jump-landings") return "jump";
    if (id === "box-block-reach" || id === "block-timing-box") return "block";
    if (id === "box-hitting-reps") return "attack";
    return "";
  }

  function addMatch(matches, id, index, rank) {
    if (!actions[id]) return;
    matches.push({ id: id, index: index, rank: rank || 0 });
  }

  function addSequence(matches, source, regex, ids, rank) {
    regex.lastIndex = 0;
    var match = regex.exec(source);
    if (!match) return false;
    ids.forEach(function (id, index) {
      addMatch(matches, id, match.index + index / 100, (rank || 0) + index);
    });
    return true;
  }

  // A sequence phrase carries more information than an isolated keyword. Add
  // its actions at the phrase location so the first actual learner action is
  // primary while every later contact remains visible as a technique chip.
  function addCompoundMatches(drill, source, matches) {
    addSequence(matches, source,
      /\bpass(?:es|ed|ing)?\s*[-–—,/]\s*set(?:s|ting)?\s*[-–—,/]\s*(?:hit|attack)(?:s|ting)?\b/i,
      ["pass", "set", "attack"], -20);
    addSequence(matches, source,
      /\bdig(?:s|ging)?\s*[-–—,/]\s*set(?:s|ting)?\s*[-–—,/]\s*(?:hit|attack)(?:s|ting)?\b/i,
      ["defense", "set", "attack"], -20);
    addSequence(matches, source,
      /\bdigs?\s*,\s*sets?\s*,?\s*(?:and\s+)?attacks?\b/i,
      ["defense", "set", "attack"], -20);
    addSequence(matches, source,
      /\b(?:pass|dig)\s+to\s+(?:themselves|yourself|himself|herself)[\s\S]{0,80}?\bset\s+to\s+(?:themselves|yourself|himself|herself)[\s\S]{0,80}?\bhit\b/i,
      ["pass", "set", "attack"], -18);
    addSequence(matches, source,
      /\ball three(?:\s+controlled)?\s+touches\b|\bthree(?:\s+controlled)?\s+touches(?:\s+(?:a|per)\s+side)?\b/i,
      ["pass", "set", "attack"], -16);
    addSequence(matches, source,
      /\bset\s*(?:,|and|or)\s*dump\b/i,
      ["set", "attack"], -18);
    addSequence(matches, source,
      /\b(?:setter\s+)?jumps?\s+to\s+set\b|\bjump[- ]set\b/i,
      ["set", "jump"], -24);
    addSequence(matches, source,
      /\battack[- ]then[- ]defend\b|\battack\s*(?:,|then|and)\s*defend\b/i,
      ["attack", "defense"], -18);
    addSequence(matches, source,
      /\bdig\s+(?:leads?|turns?)\s+(?:to|into)[\s\S]{0,50}?\bcounter[- ]attack\b/i,
      ["defense", "attack"], -18);

    // "Keep the rally alive" has no individual technique verb, but within a
    // pepper progression it truthfully refers to the complete control loop.
    if (drill && /pepper/i.test(clean(drill.id)) &&
        /\bkeep\s+(?:the\s+)?rally\s+(?:alive|going)\b/i.test(source)) {
      addSequence(matches, source,
        /\bkeep\s+(?:the\s+)?rally\s+(?:alive|going)\b/i,
        ["pass", "set", "attack", "defense"], -14);
    }
  }

  function feedActorAt(source, index, actionId) {
    var before = source.slice(Math.max(0, index - 24), index);
    if (actionId === "serve") return /\bservers?\s*$/i.test(before);
    if (actionId === "attack") return /\b(?:coach|feeder|tosser)\s*$/i.test(before);
    return false;
  }

  function actionWordOffset(actionId, value) {
    var words = {
      pass: /\b(?:pass(?:es|ing)?|bump(?:s|ed|ing)?)\b/i,
      set: /\b(?:sets?|setting|delivers?|releases?|squares?|chases?)\b/i,
      serve: /\bserv(?:e|es|ed|ing)\b/i,
      attack: /\b(?:attack(?:s|ed|ing)?|hits?|spik(?:e|es|ed|ing)|swing(?:s|ing)?|tip(?:s|ped|ping)?|dump(?:s|ed|ing)?|kill(?:s|ed|ing)?|rolls?)\b/i,
      block: /\b(?:blocks?|blocking|press(?:es|ed|ing)?|seal(?:s|ed|ing)?)\b/i,
      defense: /\b(?:digs?|digging|sprawl(?:s|ed|ing)?|pancake(?:s|d|ing)?|div(?:e|es|ed|ing)|deflect(?:s|ed|ing)?)\b/i,
      jump: /\b(?:jump(?:s|ed|ing)?|land(?:s|ed|ing)?|take[- ]?off|hop(?:s|ped|ping)?)\b/i,
      run: /\b(?:sprint(?:s|ed|ing)?|jog(?:s|ged|ging)?|runs?|running)\b/i,
      footwork: /\b(?:shuffle(?:s|d|ing)?|crossover|backpedal(?:s|ed|ing)?|pulls?|pushes?|crosses?|transitions?|footwork)\b/i
    };
    var regex = words[actionId];
    if (!regex) return 0;
    var match = regex.exec(value);
    return match ? match.index : 0;
  }

  function collectDetectorMatches(drill, source, registry, matches, rank) {
    registry.forEach(function (item, order) {
      item.regex.lastIndex = 0;
      var match = item.regex.exec(source);
      if (!match) return;
      if (drill && ((item.id === "serve" && drill.skill !== "Serving") ||
          item.id === "attack") && feedActorAt(source, match.index, item.id)) return;
      if (item.id === "attack" && drill && drill.skill === "Serving" &&
          !/\b(?:attack|spik|kill|roll[- ]shot|tip|dump|down[- ]ball)\b/i.test(match[0])) return;
      if (item.id === "recovery" && drill && drill.skill !== "Cooldown" &&
          !/\b(?:foam\s*roll|static stretch|yoga|child'?s pose)\b/i.test(match[0])) return;
      addMatch(matches, item.id, match.index + actionWordOffset(item.id, match[0]), rank + order);
    });
  }

  function orderedActions(matches) {
    matches.sort(function (a, b) {
      if (a.index !== b.index) return a.index - b.index;
      return a.rank - b.rank;
    });
    var seen = {};
    var result = [];
    matches.forEach(function (match) {
      if (!seen[match.id]) { seen[match.id] = true; result.push(match.id); }
    });
    return result;
  }

  function actionsFor(drill, text) {
    if (drill && drill.custom && actions[drill.motionType]) return [drill.motionType];
    if (drill && drill.custom) return [];
    var source = sanitizedText(text);
    var matches = [];
    var special = specialAction(drill, source);
    if (special) addMatch(matches, special, -1, -100);
    addCompoundMatches(drill, source, matches);
    collectDetectorMatches(drill, source, detectors, matches, 0);
    var result = orderedActions(matches);
    // The dedicated underhand progression must never cycle into the overhand
    // atlas merely because its saved copy also contains the generic word
    // "serve". The reviewed underhand sequence is the complete serving action.
    if (special === "underhand") result = result.filter(function (id) { return id !== "serve"; });
    // Only use role/shape nouns when the saved step contains no exact learner
    // action. This keeps "the hitter starts ... and digs" on defense while a
    // feed explicitly sent to a passer can still resolve as passing.
    if (!result.length) {
      collectDetectorMatches(drill, source, weakDetectors, matches, 100);
      result = orderedActions(matches);
    }
    if (!result.length) result.push(FALLBACK_BY_SKILL[drill && drill.skill] || "footwork");
    return result;
  }

  function actionFor(drill, text) {
    var found = actionsFor(drill, text);
    if (!found.length) return null;
    return found[0];
  }

  function catalogFrame(actionId, text) {
    text = sanitizedText(text).toLowerCase();
    if (actionId === "warmup") {
      if (/high knees?/.test(text)) return 1;
      if (/walking lunge|rotate|twist/.test(text)) return 2;
      if (/side|lateral/.test(text) && /lunge/.test(text)) return 3;
      return 0;
    }
    if (actionId === "band") {
      if (/pull.*apart|apart.*pull/.test(text)) return 2;
      if (/\by\b|raise|overhead/.test(text)) return 3;
      if (/rotate.*(?:out|external)/.test(text)) return 1;
      return 0;
    }
    if (actionId === "recovery") {
      if (/figure.?four|glute/.test(text)) return 1;
      if (/quad|calf|leg|thigh/.test(text) && /roll/.test(text)) return 2;
      if (/upper.?back|shoulder blade|arch/.test(text)) return 3;
      return 0;
    }
    if (actionId === "cooldown") {
      if (/child'?s pose|yoga/.test(text)) return 3;
      if (/reflect|team talk|close together|share/.test(text)) return 2;
      if (/breath|heart rate|wind down/.test(text)) return 1;
      return 0;
    }
    return 0;
  }

  // Court specs and written drill steps were authored independently, so their
  // counts often differ. Bind a step to the scene that actually describes it:
  // exact action words are strongest, specific shared words are next, and the
  // old proportional position is used only when the factual signals tie.
  var SCENE_STOP_WORDS = {
    a: 1, all: 1, an: 1, and: 1, are: 1, as: 1, at: 1, be: 1, been: 1,
    both: 1, by: 1, can: 1, do: 1, does: 1, each: 1, for: 1, from: 1,
    get: 1, gets: 1, go: 1, goes: 1, have: 1, if: 1, in: 1, into: 1,
    is: 1, it: 1, its: 1, of: 1, on: 1, one: 1, or: 1, other: 1,
    player: 1, players: 1, team: 1, teams: 1, ball: 1, balls: 1,
    coach: 1, drill: 1, than: 1, that: 1, the: 1, their: 1, them: 1,
    then: 1, they: 1, this: 1, through: 1, to: 1, use: 1, uses: 1,
    with: 1, you: 1, your: 1
  };

  var SCENE_TOKEN_ROOTS = {
    attacked: "attack", attacking: "attack", attacks: "attack",
    digging: "dig", digs: "dig", hitters: "hitter", hitting: "hit", hits: "hit",
    jogging: "jog", moves: "move", moving: "move", passed: "pass",
    passes: "pass", passing: "pass", running: "run", serves: "serve",
    served: "serve", serving: "serve", setters: "setter", setting: "set",
    sets: "set", shuffled: "shuffle", shuffles: "shuffle", shuffling: "shuffle"
  };

  function sceneTokenRoot(token) {
    if (SCENE_TOKEN_ROOTS[token]) return SCENE_TOKEN_ROOTS[token];
    if (token.length > 5 && /ies$/.test(token)) return token.slice(0, -3) + "y";
    if (token.length > 5 && /ed$/.test(token)) return token.slice(0, -2);
    if (token.length > 4 && /s$/.test(token) && !/ss$/.test(token)) return token.slice(0, -1);
    return token;
  }

  function meaningfulSceneTokens(value) {
    var source = clean(value).toLowerCase();
    if (source.normalize) source = source.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    var raw = source.match(/[a-z0-9]+/g) || [];
    var tokens = {};
    raw.forEach(function (token) {
      var root = sceneTokenRoot(token);
      if (root.length > 2 && !SCENE_STOP_WORDS[root]) tokens[root] = true;
    });
    return tokens;
  }

  // Unlike actionsFor(), this helper never supplies a skill fallback or an
  // equipment-derived action. It reports only mechanics stated in the text,
  // which keeps the binding score factual and leaves custom copy uninterpreted.
  function explicitSceneActions(drill, value) {
    if (drill && drill.custom) return [];
    var source = sanitizedText(value);
    var matches = [];
    addCompoundMatches(drill, source, matches);
    collectDetectorMatches(drill, source, detectors, matches, 0);
    // Scene copy often names one role while describing another movement (for
    // example, a setter running to the setting spot). Keep both explicit clues
    // for binding even though the user-facing primary resolver is stricter.
    collectDetectorMatches(drill, source, weakDetectors, matches, 100);
    return orderedActions(matches);
  }

  function sharedActionCount(left, right) {
    var present = {};
    left.forEach(function (id) { present[id] = true; });
    return right.reduce(function (count, id) { return count + (present[id] ? 1 : 0); }, 0);
  }

  function sharedTokenScore(stepTokens, spec) {
    var score = 0;
    var titleTokens = meaningfulSceneTokens(spec && spec.title);
    var captionTokens = meaningfulSceneTokens(spec && spec.caption);
    var sceneTokens = {};
    Object.keys(titleTokens).concat(Object.keys(captionTokens)).forEach(function (token) {
      sceneTokens[token] = true;
    });
    Object.keys(sceneTokens).forEach(function (token) {
      if (stepTokens[token]) score += 1;
    });
    return score;
  }

  function proportionalScenePosition(stepIndex, stepCount, sceneCount) {
    if (stepCount <= 1 || sceneCount <= 1) return 0;
    return stepIndex * (sceneCount - 1) / (stepCount - 1);
  }

  function bestSceneIndex(drill, instruction, stepIndex, stepCount, specs) {
    if (!specs.length) return -1;
    if (stepCount === specs.length) return stepIndex;

    var stepActions = explicitSceneActions(drill, instruction);
    var stepTokens = meaningfulSceneTokens(instruction);
    var target = proportionalScenePosition(stepIndex, stepCount, specs.length);
    var best = null;

    specs.forEach(function (spec, sceneIndex) {
      var sceneText = [spec && spec.title, spec && spec.caption].map(clean).filter(Boolean).join(". ");
      var candidate = {
        index: sceneIndex,
        actions: sharedActionCount(stepActions, explicitSceneActions(drill, sceneText)),
        words: sharedTokenScore(stepTokens, spec),
        distance: Math.abs(sceneIndex - target)
      };
      // One explicit mechanic is worth five shared words: strong enough to beat
      // generic copy, but not an almost-verbatim caption whose punctuation made
      // a detector miss (for example, a quoted "shoot" set).
      candidate.score = candidate.actions * 5 + candidate.words;
      if (!best || candidate.score > best.score ||
          (candidate.score === best.score && candidate.actions > best.actions) ||
          (candidate.score === best.score && candidate.actions === best.actions &&
            candidate.distance < best.distance) ||
          (candidate.score === best.score && candidate.actions === best.actions &&
            candidate.distance === best.distance && candidate.index < best.index)) {
        best = candidate;
      }
    });
    return best ? best.index : 0;
  }

  function programFor(drill, specs) {
    drill = drill || {};
    specs = Array.isArray(specs) ? specs : [];
    if (drill.custom && !actions[drill.motionType]) return [];
    var instructions = list(drill.steps);
    var setupOnly = false;
    if (!instructions.length) {
      var setup = clean(drill.setup);
      if (!setup) return [];
      instructions = [setup];
      setupOnly = true;
    }
    var cues = list(drill.cues);
    return instructions.map(function (instruction, index) {
      var allActions = actionsFor(drill, instruction);
      var primary = actionFor(drill, instruction);
      allActions = [primary].concat(allActions.filter(function (actionId) {
        return actionId !== primary;
      }));
      var sceneIndex = bestSceneIndex(drill, instruction, index, instructions.length, specs);
      return {
        sourceStep: setupOnly ? -1 : index,
        index: index,
        title: setupOnly ? "Setup" : "Step " + (index + 1) + " of " + instructions.length,
        instruction: instruction,
        action: primary,
        actions: allActions,
        frame: actions[primary].mode === "catalog" ? catalogFrame(primary, instruction) : 0,
        cue: cues.length ? cues[Math.min(index, cues.length - 1)] : "",
        sceneIndex: sceneIndex,
        scene: sceneIndex >= 0 ? specs[sceneIndex] : null
      };
    });
  }

  function assetFor(actionId) { return actions[actionId] || null; }
  function options() {
    return Object.keys(actions).map(function (id) { return { value: id, label: actions[id].label }; });
  }

  return {
    actions: actions,
    actionsFor: actionsFor,
    actionFor: actionFor,
    assetFor: assetFor,
    frameFor: catalogFrame,
    programFor: programFor,
    options: options
  };
})();
