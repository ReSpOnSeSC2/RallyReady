// drill-choreography.js — factual full-scene motion plans for drill examples.
//
// This module never invents a roster or rewrites a saved instruction. It turns
// the authored scene primitives (players, routes, equipment and minimum player
// count) into a deterministic choreography plan that a renderer can sample.
// Explicit actor references win, unambiguous authored geometry is second, and
// every fallback records its source so coverage remains auditable.
window.RR = window.RR || {};

RR.drillChoreography = (function () {
  "use strict";

  var ASSET_BASE = "images/drill-motion/";
  var GRIDS = {
    locomotion: grid("locomotion", "scene-locomotion-grid.webp", 1230, 1278, true),
    volleyball: grid("volleyball", "scene-volleyball-grid.webp", 1246, 1262, true),
    defense: grid("defense", "scene-defense-grid.webp", 1254, 1254, true),
    equipment: grid("equipment", "scene-equipment-grid.webp", 1536, 1024, false),
    power: grid("power", "scene-power-grid.webp", 1536, 1024, false),
    recovery: grid("recovery", "scene-recovery-grid.webp", 1536, 1024, false),
    roster: grid("roster", "scene-roster-grid.webp", 1233, 1275, true),
    servingAttack: grid("servingAttack", "scene-serving-attack-grid.webp", 1536, 1024, false),
    boxMat: grid("boxMat", "scene-box-mat-grid.webp", 1254, 1254, false),
    jumpBand: grid("jumpBand", "scene-jump-band-grid.webp", 1024, 1536, false),
    specialized: grid("specialized", "scene-specialized-grid.webp", 1254, 1254, false)
  };

  // Every generated grid is a strict 4 × 4 sheet: four timeline frames across
  // and four named variants down. Rows are intentionally explicit so the UI
  // never guesses which human action a crop represents.
  var MOTIONS = {
    ready: motion("ready", "Athletic ready position", "locomotion", 0, 850),
    sprint: motion("sprint", "Sprint / run", "locomotion", 1, 1150),
    shuffle: motion("shuffle", "Lateral shuffle", "locomotion", 2, 1050),
    backpedal: motion("backpedal", "Controlled backpedal", "locomotion", 3, 1100),

    pass: motion("pass", "Forearm pass", "volleyball", 0, 950),
    set: motion("set", "Overhead set", "volleyball", 1, 950),
    feed: motion("feed", "Controlled toss / feed", "volleyball", 2, 1000),
    serve: motion("serve", "Serve", "volleyball", 2, 1300),
    attack: motion("attack", "Attack / send", "volleyball", 3, 1300),

    block: motion("block", "Block and press", "defense", 0, 1050),
    dig: motion("dig", "Dig / floor defense", "defense", 1, 1000),
    sprawl: motion("sprawl", "Sprawl / emergency save", "defense", 2, 1450),
    // Defense row 3 is a forward run-through save, not a static base. The
    // reviewed full-body ready pose lives in locomotion row 0.
    "run-through": motion("run-through", "Run-through defensive save", "defense", 3, 1200),
    "defensive-ready": motion("defensive-ready", "Defensive ready position", "locomotion", 0, 850),

    ladder: motion("ladder", "Agility-ladder footwork", "equipment", 0, 1200),
    "jump-rope": motion("jump-rope", "Jump-rope rhythm", "equipment", 1, 1200),
    "mini-band": motion("mini-band", "Mini-band lateral movement", "equipment", 2, 1250),
    bridge: motion("bridge", "Mini-band glute bridge", "equipment", 3, 1300),
    band: motion("band", "Shoulder-band external rotation", "jumpBand", 2, 1250),
    "band-upper": motion("band-upper", "Band pull-apart and overhead Y", "jumpBand", 3, 1250),
    "band-arm-swing": motion("band-arm-swing", "Band-resisted hitting arm swing", "specialized", 0, 1400),
    "box-hit": motion("box-hit", "Elevated box hitting sequence", "specialized", 1, 1450),
    signal: motion("signal", "Coach or partner reaction cue", "specialized", 2, 1050),
    "free-arm-swing": motion("free-arm-swing", "Unresisted full hitting arm swing", "specialized", 3, 1250),

    medicine: motion("medicine", "Medicine-ball chest pass", "power", 0, 1350),
    "medicine-slam": motion("medicine-slam", "Medicine-ball overhead slam", "power", 1, 1350),
    "medicine-rotate": motion("medicine-rotate", "Medicine-ball rotational throw", "power", 2, 1350),
    "medicine-scoop": motion("medicine-scoop", "Medicine-ball scoop throw", "power", 3, 1350),
    box: motion("box", "Controlled box step-up", "boxMat", 0, 1250),
    "depth-drop": motion("depth-drop", "Depth drop and two-foot stick", "boxMat", 1, 1250),
    "box-block": motion("box-block", "Step-up block reach", "boxMat", 2, 1250),
    "mat-defense": motion("mat-defense", "Mat roll, sprawl, and recovery", "boxMat", 3, 1450),
    jump: motion("jump", "Vertical jump and landing", "jumpBand", 0, 1150),
    "approach-jump": motion("approach-jump", "Approach jump and landing", "jumpBand", 1, 1250),
    power: motion("power", "Explosive power position", "power", 3, 1100),

    warmup: motion("warmup", "Dynamic mobility flow", "recovery", 0, 1500),
    foam: motion("foam", "Foam-roll movement", "recovery", 1, 1600),
    stretch: motion("stretch", "Guided stretch", "recovery", 2, 1650),
    recovery: motion("recovery", "Recovery / breathing", "recovery", 3, 1700),
    // Administrative copy gets an honest neutral full-body posture. Recovery
    // row 3 visibly breathes, walks, and reflects; it must not illustrate
    // scoring, equipment setup, waiting, or a role rotation.
    admin: motion("admin", "Organize, wait, or reset", "locomotion", 0, 900)
  };

  MOTIONS.underhand = motion("underhand", "Underhand serve", "servingAttack", 0, 1250);
  MOTIONS["jump-float"] = motion("jump-float", "Jump-float serve", "servingAttack", 1, 1400);
  MOTIONS["jump-topspin"] = motion("jump-topspin", "Jump-topspin serve", "servingAttack", 2, 1450);
  MOTIONS["tip-roll"] = motion("tip-roll", "Tip and roll-shot control", "servingAttack", 3, 1250);

  var APPEARANCE_IDS = [
    "roster-athlete-01", "roster-athlete-02",
    "roster-athlete-03", "roster-athlete-04"
  ];

  var ACTION_PATTERNS = [
    pattern("jump-topspin", /\bjump[- ]topspin\s+serv(?:e|es|ed|ing)\b/gi, -48),
    pattern("jump-float", /\bjump[- ]float\s+serv(?:e|es|ed|ing)\b/gi, -48),
    pattern("underhand", /\bunderhand\s+serv(?:e|es|ed|ing)\b/gi, -47),
    // `tip` is frequently the ball a defender reads, not an attacking action.
    // Require an attacking verb/object shape or the authored roll-shot name.
    pattern("tip-roll", /\broll[- ]shots?\b|\brolls?\s+(?:it|the|a|that|this|ball)\b|\btip(?:ped|ping)\b|\btips?\s+(?:it|the|a|that|this|ball|over|to|short|deep)\b|\b(?:short\s+tips?|deep\s+rolls?)\b|\bor\s+tip\b/gi, -46),
    pattern("medicine-slam", /\b(?:medicine|med)[- ]?ball\s+(?:overhead\s+)?slams?\b|\boverhead\s+slams?\b/gi, -45),
    pattern("medicine-rotate", /\b(?:medicine|med)[- ]?ball\s+(?:rotational|side)\s+throws?\b|\brotational\s+throws?\b/gi, -45),
    pattern("medicine-scoop", /\b(?:medicine|med)[- ]?ball\s+scoop\s+throws?\b|\bscoop\s+throws?\b/gi, -45),
    pattern("depth-drop", /\bdepth\s+(?:drop|jump)s?\b/gi, -44),
    pattern("box-block", /\b(?:step[- ]up|box)\s+block\s+reach\b|\bbox\s+block(?:ing)?\b/gi, -44),
    pattern("mat-defense", /\bmat\s+(?:floor[- ]?)?defen[cs]e\b|\b(?:roll|sprawl|pursuit|diving?)\b[^.]{0,35}\bmat\b/gi, -44),
    pattern("approach-jump", /\bapproach\s+jump\b|\bpenultimate\b[^.]{0,40}\b(?:jump|take[- ]?off)\b/gi, -43),
    pattern("bridge", /\bglute\s+bridges?\b|\bhips?\s+up\s+into\s+(?:a\s+)?bridge\b|\bbridges?\s+(?:and|with|hold|up)\b/gi, -42),
    pattern("mini-band", /\bmini[- ]?band\s+(?:lateral|defensive|side|monster|walk|shuffle|squat)\b|\bband\s+(?:just\s+)?(?:above|around)\s+(?:the\s+)?(?:knees|ankles)\b/gi, -41),
    pattern("band-upper", /\bband\s+(?:pull[- ]?aparts?|rows?|overhead\s+y|y\s+raises?|pull[- ]?downs?)\b|\bpull\s+(?:your\s+)?hands\s+apart\b|\b['\"]?y['\"]?\s+shape\s+against\s+the\s+band\b/gi, -41),
    pattern("jump-rope", /\bjump[- ]?rope(?:s|d|ing)?\b|\bskip(?:ping)?\s+rope\b/gi, -40),
    pattern("ladder", /\b(?:agility\s+)?ladder\b/gi, -35),
    pattern("band", /\b(?:resistance|mini|exercise)\s*bands?\b|\bband[- ](?:walk|pull|row|raise|rotation|swing)\b/gi, -35),
    pattern("medicine", /\b(?:medicine|med)\s*balls?\b|\boverhead\s+slams?\b|\bchest\s+pass(?:es)?\s+(?:to|at)\s+(?:the\s+)?wall\b|\brotational\s+throws?\b/gi, -34),
    pattern("box", /\b(?:on|onto|off|from|facing)\s+(?:a|the)\s+(?:(?:low|stable|knee[- ]height|plyo(?:metric)?)\s+)?box\b|\b(?:low|stable|knee[- ]height|plyo(?:metric)?)\s+box\b|\bbox\s+or\s+step\b|\bstep[- ]?ups?\b|\bdepth\s+(?:drop|jump)s?\b/gi, -34),
    pattern("foam", /\bfoam\s*(?:roller|roll|rolling)\b|\broll\s+(?:(?:the|your)\s+)?(?:quads?|calves|upper back|legs?|thighs?|outside\s+of\s+the\s+hip)\b/gi, -34),
    pattern("stretch", /\bstretch(?:es|ed|ing)?\b|\bhamstring\b|\bhip[- ]flexor\b|\bfigure[- ]?four\b|\bcalf\s+release\b/gi, -30),
    pattern("sprawl", /\bsprawl(?:s|ed|ing)?\b|\bpancake(?:s|d|ing)?\b|\bdiv(?:e|es|ed|ing)\b|\bshoulder\s+roll\b|\bemergency\s+save\b/gi, -28),
    pattern("run-through", /\brun(?:s|ning)?[- ]through(?:\s+(?:the\s+)?ball|\s+save)?\b|\b(?:sprint(?:s|ed|ing)?|explod(?:e|es|ed|ing))\s+forward\s+to\s+play\s+it\s+up\b|\bexplod(?:e|es|ed|ing)\s+forward\s+when\s+they\s+read\s+a\s+tip\b/gi, -27),
    pattern("feed", /\b(?:toss(?:es|ed|ing)?|feed(?:s|ed|ing)?)\b/gi, -26),
    pattern("block", /\bblock(?:s|ed|ing)?\b|\bpress(?:es|ed|ing)?\s+(?:both\s+)?hands?\b|\bseal(?:s|ed|ing)?\s+(?:the\s+)?net\b|\bblockers?\b[^.]{0,48}\b(?:jumps?|press(?:es|ed|ing)?|seal(?:s|ed|ing)?)\b/gi, -26),
    pattern("dig", /\bdig(?:s|ging|dug)?\b|\bfloor\s+defen[cs]e\b|\bdeflect(?:s|ed|ing)?\s+(?:the\s+)?ball\b/gi, -25),
    pattern("pass", /\bforearm\s+pass(?:es|ing)?\b|\bserve[- ]receive\b|\bbump(?:s|ed|ing)?\b|\bpass(?:es|ing)?\b/gi, -24),
    pattern("set", /\b(?:front|back|jump|bump|overhead|quick|shoot|high|outside|one[- ]knee)?\s*set(?:s|ting)?\b|\bsetter\s+(?:sets?|releases?|squares?|delivers?)\b|\bsets?\s+(?:the|a|that|this|another|passed|dug|tossed|ball|rebound|to|back|outside|middle|right|left|over|for)\b/gi, -23),
    pattern("serve", /\b(?:underhand|overhand|float|topspin|jump[- ]float|jump[- ]topspin|hybrid)?\s*serv(?:e|es|ed|ing)\b|\bpre[- ]serve\b/gi, -22),
    pattern("attack", /\battack(?:s|ed|ing)?\b|\bspik(?:e|es|ed|ing)\b|\bhits?\b|\barm\s+swing\b|\bdown[- ]balls?\b|\bdump(?:s|ed|ing)?\b|\bkill(?:s|ed|ing)?\b|\b(?:fast|hard|safe|deep|live|transition|full|controlled)\s+swings?\b|\bswings?\s+(?:hard|through|at|over|into|down|deep|across\s+(?:the\s+)?body|or\s+roll|to\s+(?:a\s+)?(?:hoop|target))\b|^\s*swings?\s*$|\bswings?\b(?=\s*(?:[/·,;]|$))/gi, -21),
    pattern("sprint", /\bsprint(?:s|ed|ing)?\b|\bjog(?:s|ged|ging)?\b|\bruns?\s+(?:to|toward|back|forward|through|down|across|around|along|after|off|out|up|under|into|a\s+(?:curved|straight)\s+path)\b|\bruns?\s+at\s+(?:about\s+)?(?:three[- ]quarter|half|full)\s+speed\b|\brunning\s+(?:stride|start|pace)\b|^\s*run\s*$/gi, -18),
    pattern("shuffle", /\bshuffle(?:s|d|ing)?\b|\blateral\s+(?:walk|movement|steps?|footwork)\b|\bside[- ]steps?\b|\bcrossover\s+(?:step|footwork|run)\b/gi, -17),
    pattern("backpedal", /\bbackpedal(?:s|ed|ing)?\b|\bbackward\s+(?:run|jog|movement)\b/gi, -17),
    // Deliberately excludes "land" and "landing". A landing cue alone is not
    // proof that the current saved step performs a jump.
    pattern("jump", /\bjump(?:s|ed|ing)?\b|\bhop(?:s|ped|ping)?\b|\btake[- ]?off\b|\bairborne\b/gi, -15),
    pattern("recovery", /\brecovery\s+walk\b|\bcool[- ]?down\b|\bwalk(?:s|ed|ing)?\s+(?:easy|easily|slowly|the\s+last)\b|\bbreath(?:e|es|ed|ing|s)?\b|\breflect(?:s|ed|ing|ion)?\b|\bteam\s+talk\b|\byoga\b|\bchild'?s\s+pose\b|\bheart\s+rate\b/gi, -12),
    pattern("warmup", /\bdynamic\s+(?:movement|mobility|warm[- ]?up)\b|\bhigh\s+knees\b|\bwalking\s+(?:knee\s+pull|lunge)\b|\bwalking\s+lunges?\b|\bleg\s+swings?\b|\barm\s+circles?\b|\bbear\s+crawl\b|\bcrab\s+walk\b|\binchworms?\b|\bcarioca\b|\bgrapevine\b/gi, -11),
    pattern("defensive-ready", /\bdefensive\s+(?:ready|base|stance|position)\b|\blow\s+ready\s+position\b/gi, -10),
    pattern("ready", /\bathletic\s+(?:ready|base|stance|position)\b|\bready\s+(?:position|stance)\b/gi, -9),
    pattern("admin", /\brotate(?:s|d|ing)?\s+(?:off|on|through|spots?|roles?|positions?|players?|partners?|groups?|teams?|servers?|setters?|hitters?|passers?|the\s+(?:formation|next))\b|\b(?:players?|partners?|groups?|teams?|servers?|setters?|hitters?|passers?)\s+rotate(?:s|d|ing)?\b|\brotation\b|\bwait(?:s|ed|ing)?\b|\bqueue\b|\bline\s+up\b|\btake\s+turns?\b|\bretrieve(?:s|d|ing)?\b|\bshag(?:s|ged|ging)?\b|\bcollect(?:s|ed|ing)?\b|\breset(?:s|ting)?\b|\brepeat(?:s|ed|ing)?\b|\bscore(?:s|d|ing)?\b/gi, 20)
  ];

  function grid(id, file, width, height, transparent) {
    return {
      id: id,
      asset: ASSET_BASE + file,
      cols: 4,
      rows: 4,
      frames: 4,
      width: width,
      height: height,
      cellAspect: width && height ? width / height : 1,
      transparent: transparent === true
    };
  }

  function motion(id, label, gridId, row, durationMs) {
    var source = GRIDS[gridId];
    return {
      id: id,
      variant: id,
      label: label,
      grid: gridId,
      asset: source.asset,
      width: source.width,
      height: source.height,
      cellAspect: source.cellAspect,
      transparent: source.transparent,
      cols: 4,
      rows: 4,
      row: row,
      frames: 4,
      frameOrder: [0, 1, 2, 3],
      posterFrame: 2,
      durationMs: durationMs,
      loop: true
    };
  }

  function pattern(id, regex, rank) {
    return { id: id, regex: regex, rank: rank || 0 };
  }

  function clean(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function list(value) {
    if (!Array.isArray(value)) return [];
    return value.map(clean).filter(function (item) { return !!item; });
  }

  function finite(value) {
    return typeof value === "number" && isFinite(value);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function slug(value) {
    var result = clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return result || "scene";
  }

  function point(value, fallback) {
    if (Array.isArray(value) && finite(value[0]) && finite(value[1])) {
      return [value[0], value[1]];
    }
    return fallback ? [fallback[0], fallback[1]] : [0, 0];
  }

  function distance(left, right) {
    var dx = left[0] - right[0];
    var dy = left[1] - right[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  function hashString(value) {
    var source = String(value || "");
    var hash = 2166136261;
    for (var index = 0; index < source.length; index++) {
      hash ^= source.charCodeAt(index);
      // FNV-1a using additions keeps the result deterministic in ES5 engines.
      hash += (hash << 1) + (hash << 4) + (hash << 7) +
        (hash << 8) + (hash << 24);
    }
    return hash >>> 0;
  }

  function sanitizedMotionText(value) {
    return clean(value)
      .replace(/\bsets?\s+of\b/gi, "rounds of")
      .replace(/\b(?:short|small|working|work)\s+sets?\b|\bsets?\s+(?:short|small|long)\b/gi,
        "exercise rounds")
      .replace(/\bsets?\s+up\b/gi, "arranges")
      .replace(/\bsets?\s+(?:(?:their|the|your)\s+)?arms?\s+angle\b/gi,
        "positions the forearm angle")
      .replace(/\b(?:not|never)\s+(?:a\s+)?sets?\b/gi, "an overhead defensive contact")
      .replace(/\b(?:isn['’]?t|aren['’]?t|not)\s+block(?:ing|ed)?\b/gi,
        "is reading at the net")
      .replace(/\b(?:imaginary\s+or\s+real|real\s+or\s+imaginary)\s+blocks?\b/gi,
        "net obstacle")
      .replace(/\b(?:thrown|tossed),?\s+(?:and\s+)?not\s+hit\b/gi,
        "delivered by a controlled toss")
      .replace(/\b(?:do\s+not|don['’]?t|never)\s+(?:hit|swing)\b/gi,
        "use controlled contact")
      .replace(/\b(?:targets?\s+hit|hits?\s+(?:the\s+)?target\s+(?:rate|percentage)|target\s+rate\s+hit)\b/gi,
        "target results")
      .replace(/\bat\s+sets?\s+height\b/gi, "at the intended height")
      .replace(/\btoss(?:es|ed|ing)?\s+(?:bad\s+|off[- ]target\s+)?passes\b/gi,
        "feeds off-target balls")
      .replace(/\b(?:bad|off[- ]target|different|varied)\s+passes\b/gi,
        "off-target balls")
      .replace(/\bwhere\s+(?:the\s+)?dig\s+comes?\s+from\b/gi,
        "the incoming ball location")
      .replace(/\bdug\s+balls?\b/gi, "incoming balls")
      .replace(/\b(?:reads?|watches?)\s+(?:where\s+)?(?:the\s+)?(?:pass|set|block)\b/gi,
        "reads the developing play")
      // A volleyball action such as "set the ball" must survive semantic
      // cleanup. Only explicit setup verbs ("set up", handled above) or true
      // non-action configuration objects belong in the administrative bucket.
      .replace(/\bset\s+(?:(?:a|the|your|one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+){0,2}(?:equipment|cones?|net|ladder|box|step|hoops?|timer|time|teams?|players?|positions?|spots?|base|formation|court|station|score|number|amount|target|goal|round|reps?|tries|arm\s+angle)\b/gi,
        "arrange equipment")
      .replace(/\btarget\s+set(?:\s+of)?\b/gi, "target round")
      .replace(/\battack\s+line\b/gi, "three-meter line")
      .replace(/\b(?:time|training)\s+block\b|\bfixed\s+block\s+of\s+balls\b/gi,
        "timed interval")
      .replace(/\bpassing\s+(?:surface|spot|line|zone|joint)s?\b/gi, "forearm area")
      .replace(/\bevery\s+pass\s+(?:slow|controlled)\b/gi, "every roller trip slow");
  }

  function contextDrill(options) {
    if (!options) return null;
    if (options.drill && typeof options.drill === "object") return options.drill;
    return options.id || options.drillId || options.skill || options.equipment
      ? options : null;
  }

  function phraseBefore(source, index) {
    return source.slice(Math.max(0, index - 58), index)
      .replace(/^.*[.!?;:]/, "").trim();
  }

  function nonAthleteImpactAt(source, index) {
    return /\b(?:it|ball|serve|pass|set|toss|shot|rebound|target)\s*$/i
      .test(phraseBefore(source, index));
  }

  function onlyReferencesSetAsAttackObject(source) {
    var objectPhrase = /\b(?:hit|hits|hitting|attack|attacks|attacking|swing|swings|swinging)\s+(?:(?:a|an|the)\s+)?(?:front|back|quick|shoot|high|outside|right[- ]side|middle)[- ]set(?:\s+ball)?\b/i;
    if (!objectPhrase.test(source)) return false;
    var remaining = source.replace(objectPhrase, "");
    return !/\bsetter\s+(?:sets?|delivers?)\b|\bsets?\s+(?:it|that|this|(?:(?:the|a)\s+)?(?:(?:high|low|quick|fast|front|back|outside|right[- ]side|middle)\s+){0,2}(?:ball|rebound))\b/i
      .test(remaining);
  }

  function rawMotionMatches(value, options) {
    var source = sanitizedMotionText(value);
    var matches = [];
    ACTION_PATTERNS.forEach(function (entry, patternIndex) {
      entry.regex.lastIndex = 0;
      var match;
      while ((match = entry.regex.exec(source))) {
        if (entry.id === "jump" && /jump[- ]?rope/i.test(source.slice(match.index, match.index + 20))) {
          if (!match[0].length) entry.regex.lastIndex += 1;
          continue;
        }
        if (entry.id === "attack" && /^hits?$/i.test(match[0]) &&
            nonAthleteImpactAt(source, match.index)) {
          if (!match[0].length) entry.regex.lastIndex += 1;
          continue;
        }
        var matchDrill = contextDrill(options) || {};
        if (entry.id === "ladder" && !list(matchDrill.equipment).some(function (item) {
          return /\bagility\s+ladder\b/i.test(item);
        })) {
          if (!match[0].length) entry.regex.lastIndex += 1;
          continue;
        }
        if (entry.id === "box" && clean(matchDrill.skill).toLowerCase() !== "warmup" &&
            /\b(?:partner|hitter|coach|feeder)\b[^.]{0,45}\b(?:on|from)\s+(?:a|the)\s+box\b/i.test(source)) {
          if (!match[0].length) entry.regex.lastIndex += 1;
          continue;
        }
        matches.push({
          id: entry.id,
          index: match.index,
          rank: entry.rank,
          patternIndex: patternIndex,
          text: match[0]
        });
        if (!match[0].length) entry.regex.lastIndex += 1;
      }
    });
    matches.sort(function (left, right) {
      if (left.index !== right.index) return left.index - right.index;
      if (left.rank !== right.rank) return left.rank - right.rank;
      return left.patternIndex - right.patternIndex;
    });
    return matches;
  }

  function allRelated(ids, related) {
    return ids.every(function (id) { return related[id] === true; });
  }

  function contextualMotionIds(value, ids, options) {
    var drill = contextDrill(options);
    if (!drill) return ids;
    var id = clean(drill.id || drill.drillId).toLowerCase();
    var skill = clean(drill.skill).toLowerCase();
    var source = sanitizedMotionText(value).toLowerCase();
    var serveRelated = {
      admin: true, ready: true, jump: true, attack: true, serve: true,
      underhand: true, "jump-float": true, "jump-topspin": true
    };
    var equipmentRelated = {
      admin: true, ready: true, set: true, pass: true, attack: true,
      serve: true, jump: true, sprint: true, shuffle: true, backpedal: true,
      block: true, dig: true, sprawl: true, "run-through": true,
      "defensive-ready": true, ladder: true, "jump-rope": true,
      "tip-roll": true,
      band: true, "band-upper": true, "band-arm-swing": true,
      "free-arm-swing": true, signal: true,
      "mini-band": true, bridge: true, medicine: true,
      "medicine-slam": true, "medicine-rotate": true, "medicine-scoop": true,
      box: true, "depth-drop": true, "box-block": true, "box-hit": true, stretch: true,
      recovery: true, foam: true, warmup: true
    };

    // The saved steps in these progressions describe phases of one reviewed
    // full-body serve. Drill identity is the missing factual signal that keeps
    // a jump-float from degrading into a generic jump or attack row.
    if (id === "jump-float-serve" && (!ids.length || allRelated(ids, serveRelated))) {
      return ["jump-float"];
    }
    if (id === "jump-topspin-serve" && (!ids.length || allRelated(ids, serveRelated))) {
      return ["jump-topspin"];
    }
    if (id === "underhand-serve-progression" && (!ids.length || allRelated(ids, serveRelated))) {
      return ["underhand"];
    }
    if (/^(?:standing-float-serve-progression|topspin-serve-progression|serving-toss-consistency)$/.test(id) &&
        (!ids.length || allRelated(ids, serveRelated))) {
      return ["serve"];
    }
    if (id === "serve-receive-vs-jump-serve" &&
        /\b(?:jump|hard\s+topspin)\b/.test(source) && /\bserv/.test(source)) {
      return ["jump-topspin"];
    }

    // Drill-scoped language disambiguation. These phrases name posture,
    // targets, equipment, or an opponent's action; they are not mechanics the
    // demonstrated athlete performs.
    if (id === "platform-angle-passing") return ["pass"];
    if (id === "overhead-defensive-hands") return ["dig"];
    if (id === "overhead-emergency-pass") {
      if (/server serves|mix in high and low serves/.test(source)) return ["serve", "pass"];
      if (/passer takes|firm,? clean hands|legal,? clean touch/.test(source)) return ["pass"];
    }
    if (id === "mid-court-passing-decision" &&
        /passer reacts|passes the actual serve/.test(source)) {
      return ["serve", "pass"];
    }
    if (id === "reaction-ball-scramble" && /low[,\s]+ready|ready\s+(?:defensive\s+)?posture/.test(source)) {
      return ["defensive-ready"];
    }
    if (id === "quadrant-reaction-footwork" && /arrange equipment/.test(source)) {
      return ["admin"];
    }
    if (id === "setter-hoop-stations" &&
        /arrange equipment|place|station|hoops?|targets?/.test(source) &&
        !/alternate\s+front[- ]set/.test(source) &&
        !/\bsetter\s+(?:sets?|delivers?)\b|\bset\s+(?:the|a|ball|to)\b/.test(source)) {
      return ["admin"];
    }
    if (id === "setter-hoop-stations" && /tosser\s+gives|gives\s+the\s+setter/.test(source)) {
      return ["feed"];
    }
    if (id === "setter-hoop-stations" && /alternate\s+front[- ]set\s+and\s+back[- ]set/.test(source)) {
      return ["set", "admin"];
    }
    if (id === "dig-to-target" && /target/.test(source) && !/\bdig(?:s|ging|dug)?\b/.test(source)) {
      return ids.filter(function (motionId) { return motionId !== "attack"; });
    }
    if (/^(?:tips-and-roll-shots|perimeter-defense-system|deep-corner-roll-shots|setter-live-read-options)$/.test(id)) {
      ids = ids.filter(function (motionId) { return motionId !== "block"; });
    }
    if (id === "jump-set-and-dump") {
      if (/jumps?\s+to\s+set[^.]*tossed\s+pass/.test(source)) {
        return ["pass", "jump", "set"];
      }
      if (/respect the dump|sets? the ball instead/.test(source)) return ["set"];
      if (/mix set and dump/.test(source)) return ["set", "tip-roll"];
      if (/dumps? the ball|defen[cs]e cheats/.test(source)) return ["tip-roll"];
    }
    if (id === "hitting-off-a-live-set" &&
        /ball is sent to the setter|pass or a coach toss/.test(source)) {
      return ["pass"];
    }
    if (id === "pancake-and-recover" && /practice both hands|toss the ball farther/.test(source)) {
      return ["feed", "sprawl"];
    }
    if (id === "pursuit-emergency-defense") {
      if (/coach throws a wild ball/.test(source)) return ["feed"];
      if (/first player chases it down[^.]*plays it up/.test(source)) return ["sprint", "dig"];
      if (/second player tracks that ball[^.]*sends it back over/.test(source)) {
        return ["dig"];
      }
    }
    if (id === "close-range-reaction-digging") {
      if (/starts low and balanced[^.]*hands out front/.test(source)) return ["defensive-ready"];
      if (/feeder quickly sends balls/.test(source)) return ["feed"];
    }
    if (id === "out-of-system-passing" && /passer plays the ball high to the middle/.test(source)) {
      return ["pass"];
    }
    if (id === "libero-serve-receive-range" && /server aims at the edges and seams/.test(source)) {
      return ["serve"];
    }
    if (id === "two-person-serve-receive" &&
        /whoever the ball is heading toward takes it[^.]*other one backs up/.test(source)) {
      return ["pass", "shuffle"];
    }
    if (id === "tempo-setting" && /coach call the speed at the last second/.test(source)) {
      // The saved scene has a passer and setter but no coach actor. Animate the
      // setter's factual adjustment without assigning the off-court call to a
      // player who did not make it.
      return ["set"];
    }
    if (id === "middle-blocker-read-close") {
      if (/watching the setter['’]s hands/.test(source)) return ["defensive-ready"];
      if (/reset to the middle[^.]*again to the other pin/.test(source)) {
        return ["set", "shuffle", "block", "admin"];
      }
    }
    if (id === "bump-set-self-control" && /stay under the ball[^.]*moving your feet/.test(source)) {
      return ["shuffle"];
    }
    if (id === "set-and-sit" && /stay under the ball[^.]*shuffling your feet/.test(source)) {
      return ["shuffle"];
    }
    if (id === "bounce-and-dig") {
      if (/coach bounces a ball hard off the floor/.test(source)) return ["feed"];
      if (/still arms[^.]*playing the ball in front/.test(source)) return ["dig"];
    }
    if (id === "block-jump-and-land") {
      if (/start square to the net[^.]*hands up/.test(source)) return ["ready"];
      if (/land softly on two feet/.test(source)) return ["ready"];
      if (/repeat slowly[^.]*landing under control/.test(source)) {
        return ["jump", "block", "ready"];
      }
    }
    if (id === "standing-spike-target" && /hitter swings overhand[^.]*snapping the ball down/.test(source)) {
      return ["attack"];
    }
    if (id === "toss-and-pass-intro" && /tosser lobs an easy,? high ball/.test(source)) {
      return ["feed"];
    }
    if (id === "deep-ball-backpedal-passing" && /server or feeder sends deep balls/.test(source)) {
      return ["serve"];
    }
    if (id === "w-formation-serve-receive" &&
        /whoever the ball is heading toward takes it[^.]*players next to them back up/.test(source)) {
      return ["pass", "shuffle"];
    }
    if (id === "one-knee-setting-form" && /repeat[^.]*ball touching your finger pads/.test(source)) {
      return ["set"];
    }
    if (id === "setter-triangle-continuous" && /reverse the direction on a call/.test(source)) {
      return ["set"];
    }
    if (id === "toss-and-tip") {
      if (/aim for targets short over the net[^.]*deep in the corners/.test(source)) return ["tip-roll"];
      if (/fingers firm[^.]*directed,? not pushed/.test(source)) return ["tip-roll"];
    }
    if (id === "commit-block-the-middle") {
      if (/blocker watches[^.]*setter['’]s release/.test(source)) return ["defensive-ready"];
      if (/quick is a fake[^.]*when committing is worth it/.test(source)) return ["defensive-ready"];
    }
    if (id === "partner-catch-bump-control" && /straight arms[^.]*aim the ball/.test(source)) {
      return ["pass"];
    }
    if (id === "hitting-off-a-bad-set" && /hitter adjusts their approach and contact/.test(source)) {
      return ["approach-jump", "attack"];
    }
    if (id === "serve-receive-vs-jump-serve" && /controlled,? playable ball/.test(source)) {
      return ["pass"];
    }
    if (id === "hybrid-serve-mix" && /mix them on purpose/.test(source)) return ["serve"];
    if (id === "collapse-dig-and-recover") {
      if (/coach drives balls low and hard/.test(source)) return ["attack"];
      if (/drop a knee or sit[^.]*recover to ready/.test(source)) return ["dig", "ready"];
    }
    if (id === "ladder-to-dig-reaction" && /tosser puts a ball just left or right/.test(source)) {
      return ["feed"];
    }
    if (id === "pass-to-the-hoop-target" && /tosser or server sends a ball to the passer/.test(source)) {
      return ["feed"];
    }
    if (id === "hit-the-target-zones" && /hitter approaches and swings/.test(source)) {
      return ["approach-jump", "attack"];
    }
    if (id === "butterfly-pepper" && /rotation flowing|clean cycles/.test(source)) {
      return ["set", "attack", "admin"];
    }
    if (id === "over-the-net-pepper" && /keep the rally going[^.]*count how many/.test(source)) {
      return ["admin"];
    }
    if (id === "defensive-pepper" && /partners pepper[^.]*hitter swings with real speed/.test(source)) {
      return ["attack", "dig", "set"];
    }
    if (id === "transition-setting-back-row") {
      if (/starts? in a back[- ]row base/.test(source)) return ["defensive-ready", "feed"];
      if (/sprints? to the setting target/.test(source)) return ["sprint", "set"];
      if (/incoming ball location|releases? from different spots/.test(source)) return ["sprint", "set"];
      if (/add hitters|real attack/.test(source)) return ["set", "attack"];
    }
    if (id === "setter-live-read-options") {
      if (/live first ball|different passes/.test(source)) return ["pass"];
      if (/reads? the developing play|how good the pass/.test(source)) return ["ready"];
      if (/choose the set|quick,? pin|back set|pipe/.test(source)) return ["set"];
      if (/talk through|choices afterward/.test(source)) return ["admin"];
    }
    if (id === "perimeter-defense-system") {
      if (/defenders? move|off[- ]blocker[^.]*pulls off|blocker[^.]*pulls off|spread to the perimeter/.test(source)) {
        return /coach attacks|run attacks/.test(source) ? ["attack", "shuffle"] : ["shuffle"];
      }
      if (/run attacks/.test(source)) return ["attack", "shuffle"];
      if (/coach attacks/.test(source)) return ["attack"];
    }
    if (id === "pass-set-hit-triangle") {
      if (/coach tosses a free ball/.test(source)) return ["feed"];
      if (/rotate each rep|passer to hitter line|hitter to shag/.test(source)) {
        return ["sprint", "admin"];
      }
      if (/passer passes to the setter|pass[- ]set[- ]hit/.test(source)) {
        return ["feed", "pass", "set", "attack", "admin"].filter(function (motionId) {
          return motionId !== "admin" || /switch sides|set number/.test(source);
        });
      }
    }
    if (id === "butterfly-passing" && /catches? or sets? it|ball gets shagged back/.test(source)) {
      return ["set", "sprint"];
    }
    if (/^(?:six-v-six-wash-scoring|transition-wash-game)$/.test(id) &&
        /win both|split(?:,|\s)|score a point|nobody scores/.test(source)) {
      return ["admin"];
    }
    if (/^(?:six-v-six-wash-scoring|transition-wash-game)$/.test(id) &&
        /second ball|free or down ball|forcing a transition/.test(source)) {
      return ["feed"];
    }
    if (id === "transition-wash-game" && /turning defense into offense/.test(source)) {
      return ["feed"];
    }
    if (id === "run-the-rotation-offense") {
      if (/rotation one['’]?s serve[- ]receive formation/.test(source)) {
        return ["admin"];
      }
      if (/coach tosses|team passes/.test(source)) return ["feed", "sprint", "pass", "set", "attack"];
      if (/balls per rotation|move to the next/.test(source)) {
        return ["feed", "sprint", "pass", "set", "attack", "admin"];
      }
      if (/work through all six rotations|fixing overlaps/.test(source)) {
        return ["feed", "sprint", "pass", "set", "attack", "admin"];
      }
    }
    if (/^(?:queen-of-the-court|king-of-the-court-doubles|six-on-six-queen-of-the-court)$/.test(id)) {
      if (/\b(?:rotate off|cross(?:es|ed|ing)? over|waiting (?:team|pair|partners?|players?) (?:comes?|steps?|enters?)|challengers? (?:win|cross)|new (?:queens?|kings?))\b/.test(source)) {
        return ["sprint", "admin"];
      }
      if (/\b(?:ball is put in play|put a serve|free ball in play|rally is played|play the rally|six on six)\b/.test(source)) {
        return ["serve", "pass", "set", "attack"];
      }
    }
    if (id === "transition-hitting-off-defense") {
      if (/starts? in a defensive spot|coach-entered ball/.test(source)) {
        return ["attack", "dig"];
      }
      if (/pulls? off the net|attack line to become/.test(source)) return ["sprint"];
      if (/setter delivers|transition set/.test(source)) return ["set", "attack"];
      if (/link defense|transition,? and the attack/.test(source)) {
        return ["dig", "sprint", "set", "attack"];
      }
    }
    if (id === "roll-the-ball-dig") {
      return /coach rolls|move from rolls|gentle bounces|soft tosses/.test(source)
        ? ["feed"] : ["dig"];
    }
    if (id === "libero-dig-and-run-through") {
      if (/coach mixes|hard-driven balls.*soft tips/.test(source)) {
        return ["attack", "tip-roll", "dig", "run-through"];
      }
      if (/on hard balls|digs? high/.test(source)) return ["attack", "dig"];
      if (/on tips|runs? through/.test(source)) return ["tip-roll", "run-through"];
      if (/getting the dig high|turn it into an attack/.test(source)) return ["dig", "attack"];
    }
    if (id === "defensive-base-and-read" && /coach hits or tips|defenders dig/.test(source)) {
      return ["attack", "dig", "admin"];
    }
    if (id === "transition-dig-to-attack") {
      if (/setter sets[^.]*hitter transitions to attack/.test(source)) {
        return ["attack", "dig", "approach-jump", "set", "attack"];
      }
      if (/dig leads to[^.]*counter-attack/.test(source)) {
        return ["attack", "dig", "approach-jump", "set", "attack", "admin"];
      }
      if (/everyone digs,? sets,? and attacks in transition/.test(source)) {
        return ["attack", "dig", "approach-jump", "set", "attack", "admin"];
      }
    }
    if (id === "off-the-block-cover" && /blocked ball up|defenders play/.test(source)) {
      return ["dig", "set", "attack"];
    }
    if (id === "continuous-cross-court-control" &&
        /dig \(or pass\)|controlled attack back/.test(source)) {
      return ["dig", "pass", "set", "attack"];
    }
    if (id === "defensive-pepper" && /digger sets the hitter|swings hard again/.test(source)) {
      return ["set", "attack"];
    }
    if (id === "wall-set-and-pass-combo" && /set the next rebound|set,? pass/.test(source)) {
      return ["set", "pass"];
    }
    if (id === "partner-pass-and-set-continuous" && /passes again|steady pass/.test(source)) {
      return ["pass", "set"];
    }
    if (id === "bump-set-self-control" && /set the next one,? then bump/.test(source)) {
      return ["set", "pass"];
    }
    if (id === "shuttle-passing-to-target" && /after they pass|jogs? to the back/.test(source)) {
      return ["pass", "sprint"];
    }
    if (id === "setting-shuttle-relay" && /follow your set|jog to the back/.test(source)) {
      return ["set", "sprint"];
    }
    if (id === "ladder-to-dig-reaction" && /breaks? to it|jogs? back/.test(source)) {
      return ["ladder", "sprint", "feed", "dig", "sprint"];
    }
    if (id === "spike-approach-footwork") {
      return /land(?:s|ed|ing)?\s+soft|balanced,?\s+ready/.test(source)
        ? ["ready"] : ["approach-jump"];
    }
    if (id === "approach-steps-walkthrough") return ["approach-jump"];
    if (id === "self-toss-spike" && /stand near|holding a ball/.test(source)) return ["ready"];
    if (id === "mirror-blocking") {
      if (/switch who leads/.test(source)) return ["admin"];
      if (/shuffles?|crossover[- ]steps?|mirrors? them/.test(source)) return ["shuffle"];
      return ["block"];
    }
    if (/^(?:blocking-hands-at-wall|double-block-seal)$/.test(id)) return ["block"];
    if (id === "block-and-transition" && /push off the net|back to the three-meter line/.test(source)) {
      return ["backpedal"];
    }
    if (id === "high-contact-arm-swing") {
      if (/stand a few feet|hitting stance/.test(source)) return ["ready"];
      return ["attack"];
    }
    if (id === "middle-quick-attack") {
      if (/short,? fast approach[^.]*setter releases/.test(source)) {
        return ["approach-jump", "set"];
      }
      if (/steady pass first[^.]*middle has to adjust/.test(source)) {
        return ["pass", "set", "attack"];
      }
    }
    if (id === "back-row-attack-pipe" && /starts? behind the three-meter line|starts? behind the attack line/.test(source)) {
      return ["ready"];
    }
    if (id === "back-row-attack-pipe" && /approach and jump|takeoff point|never step over the line/.test(source)) {
      return /\bset\b/.test(source) ? ["set", "approach-jump"] : ["approach-jump"];
    }
    if (id === "approach-timing-off-the-pass") {
      if (/time the last steps[^.]*set arrives/.test(source) ||
          /repeat with steady passes[^.]*hitters adjust/.test(source)) {
        return ["pass", "approach-jump", "set", "attack"];
      }
      if (/starts? their approach|ball reaches the setter|start on.*release/.test(source)) {
        return ["approach-jump"];
      }
    }
    if (id === "hitting-from-all-positions") {
      if (/setter.*outside|hitter attacks/.test(source)) return ["approach-jump", "set", "attack", "admin"];
      if (/quick set to the middle|back set to the right/.test(source)) return ["approach-jump", "set", "attack"];
      if (/back[- ]row set|attacking from behind/.test(source)) return ["approach-jump", "set", "attack"];
      if (/rotate hitters through the whole sequence/.test(source)) {
        return ["set", "approach-jump", "attack", "admin"];
      }
    }
    if (id === "defensive-base-and-read" && /read where|arm is doing|approaches/.test(source)) {
      return ["defensive-ready"];
    }
    if (id === "first-jump-and-hit" && /swing in the air|hitting the ball high/.test(source)) {
      return ["attack"];
    }
    if (id === "overhand-throw-progression") {
      if (/stand across|each with a ball/.test(source)) return ["ready"];
      return ["attack"];
    }
    if (id === "toss-bump-catch-control" && /catch the ball and reset/.test(source)) {
      return ["pass", "admin"];
    }
    if (id === "dig-and-catch-game") {
      if (/feeder tosses/.test(source)) return ["feed"];
      if (/digger plays it up|catcher behind/.test(source)) return ["dig"];
      return ["admin"];
    }
    if (id === "newcomb-catch-volley" && /between up to three players|before sending it over/.test(source)) {
      return ["feed"];
    }
    if (id === "deep-corner-roll-shots" && /aim for the deep corners|arcing the ball/.test(source)) {
      return ["tip-roll"];
    }
    if (id === "serve-receive-vs-jump-serve" && /passers start|arms quiet|take the speed off/.test(source)) {
      return ["pass"];
    }
    if (id === "attack-and-transition-to-defense") {
      if (/coach sends|now a defender/.test(source)) return ["attack", "dig"];
      if (/fast,? balanced move|back to your spot/.test(source)) return ["backpedal"];
      if (/attack-then-defend cycle/.test(source)) {
        return ["set", "attack", "backpedal", "attack", "dig"];
      }
    }
    if (id === "youth-team-defense-positions") {
      if (/put players in|name each one/.test(source)) return ["admin"];
      if (/coach attacks/.test(source)) return ["attack", "shuffle"];
      return ["shuffle"];
    }
    if (id === "amoeba-team-game" && /players? touch the ball|before it goes over/.test(source)) {
      return ["pass"];
    }
    if (id === "balloon-keep-it-up" && /move your feet|stay under/.test(source)) return ["shuffle"];
    if (id === "setter-release-from-base") {
      if (/coach slaps|release the setter/.test(source)) return ["signal"];
      if (/setter sprints/.test(source)) return ["sprint"];
      if (/coach tosses|outside set/.test(source)) return ["feed", "set", "sprint"];
      if (/run several reps|right-front/.test(source)) return ["sprint", "set", "admin"];
    }
    if (id === "reaction-ball-wall-singles") {
      if (/low,? ready stance/.test(source)) return ["ready"];
      if (/throw it firmly|ricochets/.test(source)) return ["feed"];
      if (/track the bounce|shuffle to it/.test(source)) return ["shuffle"];
      if (/repeat|light on your feet/.test(source)) return ["shuffle", "admin"];
    }
    if (id === "mat-sprawl-and-pursuit") {
      if (/lay a mat|tosser stands/.test(source)) return ["admin"];
      if (/tosser drops|short ball/.test(source)) return ["feed"];
      if (/defender explodes|sprawls onto/.test(source)) return ["mat-defense"];
      if (/pop up immediately|switch roles/.test(source)) return ["mat-defense", "admin"];
    }
    if (id === "libero-serve-receive-range" && /area the libero covers|reach more/.test(source)) {
      return ["shuffle", "pass"];
    }
    if (id === "two-ball-setting-footwork" && /back and forth|brisk pace/.test(source)) {
      return ["shuffle", "set", "admin"];
    }

    if (id === "shoulder-band-prep") {
      if (/arm circles?/.test(source)) return ["warmup"];
      if (/pull (?:your )?hands apart|['\"]?y['\"]? shape/.test(source)) return ["band-upper"];
      return ["band"];
    }
    if (id === "band-pull-aparts" &&
        (!ids.length || allRelated(ids, equipmentRelated))) {
      return ["band-upper"];
    }
    if (id === "band-arm-speed" &&
        (!ids.length || allRelated(ids, equipmentRelated))) {
      return /drop the band|\bfree(?: arm)? swings?\b/.test(source)
        ? ["free-arm-swing"] : ["band-arm-swing"];
    }
    if (/^(?:mini-band-lateral-walks|mini-band-defensive-shuffle)$/.test(id) &&
        (!ids.length || allRelated(ids, equipmentRelated))) {
      return ["mini-band"];
    }
    if (id === "mini-band-glute-bridges" &&
        (!ids.length || allRelated(ids, equipmentRelated))) {
      return /bridge|lie on your back|hips? up|knees? (?:bent|press)/.test(source)
        ? ["bridge"] : ["mini-band"];
    }
    if (id === "agility-ladder-footwork") {
      return /\bsprint(?:s|ed|ing)?\b/.test(source) ? ["sprint"] : ["ladder"];
    }
    if (id === "ladder-lateral-quicksteps") {
      return /\bshuffle\s+steps?\s+past\b/.test(source) ? ["shuffle"] : ["ladder"];
    }

    if (id === "core-rotational-power" &&
        (!ids.length || allRelated(ids, equipmentRelated))) {
      if (/exercise rounds|full rest/.test(source)) return ["admin"];
      return /overhead|throw it down|floor/.test(source)
        ? ["medicine-slam"] : ["medicine-rotate"];
    }
    if (id === "partner-medicine-ball-power" &&
        (!ids.length || allRelated(ids, equipmentRelated))) {
      if (/scoop/.test(source)) return ["medicine-scoop"];
      if (/twist|side throw|rotat/.test(source)) return ["medicine-rotate"];
      if (/overhead/.test(source)) return ["medicine-slam"];
      return ["medicine"];
    }
    if (id === "med-ball-overhead-slams" &&
        (!ids.length || allRelated(ids, equipmentRelated))) return ["medicine-slam"];
    if (id === "med-ball-chest-pass-wall" &&
        (!ids.length || allRelated(ids, equipmentRelated))) return ["medicine"];

    if (id === "box-step-ups-approach" &&
        (!ids.length || allRelated(ids, equipmentRelated))) return ["box"];
    if (id === "box-depth-jump-landings" &&
        (!ids.length || allRelated(ids, equipmentRelated))) return ["depth-drop"];
    if (id === "box-block-reach" &&
        (!ids.length || allRelated(ids, equipmentRelated))) {
      return /arrange equipment|coach or partner steadies/.test(source)
        ? ["admin"] : ["box-block"];
    }
    if (id === "box-hitting-reps" &&
        (!ids.length || allRelated(ids, equipmentRelated))) {
      return /rotate the next hitter/.test(source)
        ? ["box-hit", "admin"] : ["box-hit"];
    }
    if (id === "block-timing-box" &&
        (!ids.length || allRelated(ids, equipmentRelated))) {
      return /blocker|touch the ball at its highest/.test(source) ? ["block"] : ["admin"];
    }
    if (id === "block-a-tossed-ball" &&
        (!ids.length || allRelated(ids, equipmentRelated))) {
      return /partner stands on|reaches a ball just over/.test(source) ? ["admin"] : ["block"];
    }

    if (id === "mat-floor-defense-progression" &&
        (!ids.length || allRelated(ids, equipmentRelated) ||
          ids.every(function (motionId) { return motionId === "feed" || motionId === "admin"; }))) {
      return /keep tosses out|stage is all about/.test(source) ? ["admin"] : ["mat-defense"];
    }
    if (id === "mat-sprawl-and-pursuit" &&
        (!ids.length || allRelated(ids, equipmentRelated))) {
      return /defender (?:explodes|moves|reaches)|sprawl|pop up/.test(source)
        ? ["mat-defense"] : ["admin"];
    }
    if (id === "mat-diving-extension" &&
        (!ids.length || allRelated(ids, equipmentRelated))) {
      return /stop the moment|quality high/.test(source) ? ["admin"] : ["mat-defense"];
    }
    if (id === "mat-mobility-flow" &&
        (!ids.length || allRelated(ids, equipmentRelated))) return ["stretch"];

    if (id === "static-stretch-cooldown" &&
        (!ids.length || allRelated(ids, equipmentRelated))) return ["stretch"];
    if (id === "yoga-flow-cooldown" &&
        (!ids.length || allRelated(ids, equipmentRelated))) {
      return /lying still|slow breaths/.test(source) ? ["recovery"] : ["stretch"];
    }
    if (/^(?:guided-breathing-and-reflection|recovery-walk-and-goal-setting)$/.test(id) &&
        (!ids.length || allRelated(ids, equipmentRelated))) return ["recovery"];
    if (id === "cooldown-jog-and-breathing" &&
        (!ids.length || allRelated(ids, equipmentRelated))) {
      return /\bjog/.test(source) ? ["sprint"] : ["recovery"];
    }
    if (/^(?:calf-and-ankle-recovery|hamstring-and-hip-stretch)$/.test(id) &&
        (!ids.length || allRelated(ids, equipmentRelated))) return ["stretch"];
    if (id === "foam-roll-mobility-recovery" &&
        (!ids.length || allRelated(ids, equipmentRelated))) {
      if (/circle/.test(source)) return ["warmup"];
      if (/breath|stretch/.test(source) && !/\broll/.test(source)) return ["recovery"];
      return ["foam"];
    }
    if (id === "foam-roller-leg-reset" &&
        (!ids.length || allRelated(ids, equipmentRelated))) return ["foam"];
    if (id === "foam-roller-upper-back" &&
        (!ids.length || allRelated(ids, equipmentRelated))) {
      return /finish with|deep breath/.test(source) ? ["recovery"] : ["foam"];
    }
    if (id === "dynamic-mobility-flow" &&
        (!ids.length || allRelated(ids, equipmentRelated))) return ["warmup"];

    if (id === "tip-coverage-behind-block" &&
        (!ids.length || allRelated(ids, equipmentRelated))) {
      return /defenders?|stopped behind|sprint forward|explod/.test(source)
        ? ["run-through"] : ["tip-roll"];
    }

    if (id === "line-touch-conditioning" &&
        (!ids.length || allRelated(ids, equipmentRelated))) return ["sprint"];
    if (id === "reaction-sprint-starts" &&
        (!ids.length || allRelated(ids, equipmentRelated))) {
      if (/\bclap|whistle|hand drop|signal/.test(source) &&
          /\bsprint|explode|5[- ]yards?|accelerat/.test(source)) {
        return ["signal", "sprint"];
      }
      return /\bsprint|full effort|short sprints?|low drive steps?|5[- ]yards?|accelerat/.test(source)
        ? ["sprint"] : ["ready"];
    }

    // Reviewed physical instructions that do not use the canonical action
    // verbs still need an honest body mechanic. These fallbacks are scoped to
    // their authored drill identities, so descriptive words such as "hands",
    // "touch", or "catch" do not become broad guesses elsewhere.
    if (!ids.length) {
      if (/^(?:wall-setting|catch-and-set-progression)$/.test(id)) return ["set"];
      if (id === "mirror-defensive-shuffle") return ["shuffle"];
      if (/^(?:digging-coach-down-balls|free-ball-transition)$/.test(id)) {
        return ["defensive-ready"];
      }
      if (id === "rolls-and-sprawls") return ["dig"];
      if (id === "swing-blocking") return ["block"];
      if (/^(?:quadrant-reaction-footwork|net-shuffle-footwork-youth)$/.test(id)) {
        return ["shuffle"];
      }
      if (/^(?:right-side-back-set-footwork|setter-footwork-to-target)$/.test(id)) {
        return ["set"];
      }
      if (id === "off-the-block-cover") return ["defensive-ready"];
      if (/^(?:partner-pass-and-move-warmup|wall-forearm-passing|partner-toss-mirror|passing-on-the-move|rapid-fire-control)$/.test(id)) {
        return ["pass"];
      }
      if (id === "reaction-ball-quickness") {
        return /feeder bounces/.test(source) ? ["signal"] : ["sprint"];
      }
      if (id === "speedball") return ["signal"];
      if (id === "transition-setting-back-row") return ["set"];
      if (id === "defensive-ready-reaction-game") {
        return /coach holds|tosses one/.test(source) ? ["signal"] : ["run-through"];
      }
      if (id === "reaction-ball-scramble") {
        if (/switch jobs/.test(source)) return ["admin"];
        if (/feeder bounces/.test(source)) return ["signal"];
        if (/defender reads|moves? (?:their )?feet|catches? it low|short bursts/.test(source)) {
          return ["sprint"];
        }
        return ids;
      }
      if (id === "pancake-and-recover") return ["sprawl"];
      if (id === "reach-over-the-net") return ["block"];
      if (id === "bodyweight-shoulder-activation") return ["warmup"];
      if (id === "passing-box-drill") return ["pass"];
      if (id === "roll-the-ball-dig") return ["dig"];
      if (/^(?:mini-court-cooperative-rally|team-circle-recovery)$/.test(id)) return ["pass"];
      if (id === "bonus-ball-scramble") return ["defensive-ready"];
      if (id === "shepherd-and-sheep") return ["warmup"];
    }

    if (id === "pre-serve-routine" &&
        (!ids.length || allRelated(ids, serveRelated) ||
          allRelated(ids, equipmentRelated))) return ["serve"];

    if (/^jump-rope-/.test(id) &&
        (!ids.length || allRelated(ids, equipmentRelated))) return ["jump-rope"];

    // In a serving drill, generic "hit the ball/target" language describes the
    // serve contact, not an attack approach. Preserve explicit attack terms for
    // rare mixed drills, and keep other ordered actions such as the sprint.
    if (skill === "serving" && ids.indexOf("attack") !== -1 &&
        !/\b(?:attack|spik|kill|roll[- ]shot|tip|dump|down[- ]ball)/.test(source)) {
      var normalized = [];
      ids.forEach(function (motionId) {
        var next = motionId === "attack" ? "serve" : motionId;
        if (normalized.indexOf(next) === -1) normalized.push(next);
      });
      return normalized;
    }
    if (skill === "serving" && /breathing hard/.test(source)) {
      return ids.filter(function (motionId) { return motionId !== "recovery"; });
    }

    return ids;
  }

  function literalMotionIds(value, options) {
    var seen = {};
    var result = [];
    rawMotionMatches(value, options).forEach(function (match) {
      if (!MOTIONS[match.id] || seen[match.id]) return;
      seen[match.id] = true;
      result.push(match.id);
    });
    var supersedes = {
      underhand: { serve: 1 },
      "jump-float": { serve: 1, jump: 1 },
      "jump-topspin": { serve: 1, jump: 1 },
      "tip-roll": { attack: 1 },
      "mini-band": { band: 1, shuffle: 1 },
      bridge: { band: 1 },
      "band-upper": { band: 1 },
      ladder: { box: 1 },
      "jump-rope": { jump: 1, set: 1 },
      "medicine-slam": { medicine: 1 },
      "medicine-rotate": { medicine: 1 },
      "medicine-scoop": { medicine: 1 },
      "depth-drop": { box: 1, jump: 1 },
      "box-block": { box: 1, block: 1 },
      "mat-defense": { stretch: 1, dig: 1, sprawl: 1 },
      "approach-jump": { jump: 1 },
      "run-through": { sprint: 1, dig: 1 }
    };
    var hidden = {};
    result.forEach(function (id) {
      Object.keys(supersedes[id] || {}).forEach(function (genericId) {
        hidden[genericId] = true;
      });
    });
    result = result.filter(function (id) { return !hidden[id]; });
    if (onlyReferencesSetAsAttackObject(sanitizedMotionText(value))) {
      result = result.filter(function (id) { return id !== "set"; });
    }
    return result;
  }

  function exactMotionIds(value, options) {
    return contextualMotionIds(value, literalMotionIds(value, options), options);
  }

  function routeLabelMotionIds(value, drill) {
    // Route labels are terse authored mechanics, not full drill prose. Broad
    // drill-level fallbacks must never rewrite "live swing" into a block or
    // "slow pin attack" into a shuffle simply because of the drill category.
    return literalMotionIds(value, { drill: drill });
  }

  function equipmentMotionId(value, options) {
    var source = clean(value).toLowerCase();
    var drill = contextDrill(options) || {};
    var drillId = clean(drill.id || drill.drillId).toLowerCase();
    var skill = clean(drill.skill).toLowerCase();
    if (/jump[- ]?rope|skipping rope/.test(source)) return "jump-rope";
    if (/ladder/.test(source)) return "ladder";
    if (/glute\s+bridge/.test(source)) return "bridge";
    if (/mini[- ]?band/.test(source)) return "mini-band";
    if (/band/.test(source) && drillId === "band-pull-aparts") return "band-upper";
    if (/band/.test(source) && drillId === "band-arm-speed") return "band-arm-swing";
    if (/band/.test(source)) return "band";
    if (/medicine|med ball/.test(source) && /overhead-slams/.test(drillId)) return "medicine-slam";
    if (/medicine|med ball/.test(source) && /rotational-power/.test(drillId)) return "medicine-rotate";
    if (/medicine|med ball/.test(source)) return "medicine";
    if (/foam/.test(source)) return "foam";
    if (/box/.test(source) && /depth-jump/.test(drillId)) return "depth-drop";
    if (/box/.test(source) && /box-block-reach/.test(drillId)) return "box-block";
    if (/box/.test(source) && drillId === "box-hitting-reps") return "box-hit";
    if (/box/.test(source)) return "box";
    if (/mat/.test(source) && skill === "defense") return "mat-defense";
    if (/mat/.test(source)) return "stretch";
    return "";
  }

  function athleteLandingPosture(value) {
    var source = clean(value);
    if (/\b(?:ball|serve|pass|set|shot|toss)\s+lands?\b/i.test(source)) return false;
    return /^\s*land(?:s|ed|ing)?\b/i.test(source) ||
      /\b(?:player|athlete|hitter|blocker|server|setter|they|everyone)\s+lands?\b/i.test(source) ||
      /\bland(?:s|ed|ing)?\s+(?:softly|quietly|balanced|inside|on\s+(?:one|two|both)|with\s+(?:balance|bent knees|both feet|two feet))\b/i.test(source);
  }

  function administrativeInstruction(value) {
    var source = sanitizedMotionText(value);
    return /^(?:arrange equipment|put|place|lay|mark|split|pair|form|line up|make (?:even )?teams?)\b/i.test(source) ||
      /\b(?:players?|partners?|teams?|groups?)\s+(?:stand|line up|wait|split|form)\b/i.test(source) ||
      /\b(?:track|count|record)\s+(?:how many|the|each|makes?|points?|results?)\b/i.test(source);
  }

  // Public semantic resolver. It returns ordered metadata records rather than
  // a single broad category, so "pass, set, attack" remains three visible
  // beats. Exact text wins; saved equipment and path kind are factual fallback
  // signals. Administrative copy resolves to the explicitly named admin row.
  function motionForText(value, options) {
    options = options || {};
    var drill = contextDrill(options) || {};
    var kind = clean(options.pathKind).toLowerCase();
    var skill = clean(drill.skill).toLowerCase();
    var drillId = clean(drill.id || drill.drillId).toLowerCase();
    // A saved route label is already a compact authored mechanic. Resolve it
    // literally so broad drill-context fallbacks cannot rewrite an explicit
    // "live swing" into a block, or a "slow pin attack" into a shuffle.
    var ids = kind ? routeLabelMotionIds(value, drill) : exactMotionIds(value, options);
    if (kind && skill === "setting" && ids.indexOf("set") !== -1 &&
        ids.indexOf("jump") !== -1) {
      ids = ["set"];
    }
    if (kind && skill === "serving" && ids.indexOf("attack") !== -1 &&
        !/\b(?:attack|spik|kill|down[- ]ball|roll[- ]shot|tip|dump)\b/i.test(clean(value))) {
      ids = ids.map(function (id) { return id === "attack" ? "serve" : id; })
        .filter(function (id, index, list) { return list.indexOf(id) === index; });
    }
    // `kind: serve` is also used by legacy diagrams merely to draw a curved
    // ball route. Treat it as a contact only where serving is factual.
    if (kind === "serve" && !ids.length &&
        (skill === "serving" || drillId === "three-v-three-mini-game")) {
      ids.push("serve");
    }
    if (!ids.length && administrativeInstruction(value)) ids.push("admin");
    if (!ids.length && Array.isArray(options.equipment)) {
      options.equipment.some(function (item) {
        var id = equipmentMotionId(item, options);
        if (id) ids.push(id);
        return !!id;
      });
    }
    // A move path labelled only "land" remains administrative/ready; it must
    // never silently become a jump. Likewise sanitized "set equipment" never
    // reaches the volleyball set pattern above.
    if (!ids.length && athleteLandingPosture(value) && options.fallback !== false) ids.push("ready");
    if (!ids.length && options.fallback !== false) ids.push("admin");
    return ids.map(function (id) { return MOTIONS[id]; });
  }

  function isReferenceMarker(player) {
    var label = clean(player && player.label);
    var note = clean(player && player.note);
    return (label === "•" && /^(spot|ball)$/i.test(note)) ||
      (label === "◎" && /^target$/i.test(note)) ||
      (!label && /^(high ball|ball pops up|land (balanced|inside),? ready|step back|farthest in|passer spot|roll\/sprawl out)$/i.test(note)) ||
      (label === "T" && /^cone \/ hoop \/ coach$/i.test(note));
  }

  function groupedCount(player) {
    var match = /^\+(\d+)$/.exec(clean(player && player.label));
    return match ? Number(match[1]) : 0;
  }

  function isSupport(player) {
    var team = clean(player && player.team).toLowerCase();
    var note = clean(player && player.note);
    return team === "coach" || /\bcoach\b|\btrainer\b|\bmanager\b/i.test(note);
  }

  function validMinimum(drill) {
    var value = drill && drill.minPlayers;
    return finite(value) && Math.floor(value) === value && value >= 1 && value <= 30
      ? value : null;
  }

  function legendRole(spec, tone) {
    var matches = (spec.legend || []).filter(function (item) {
      return item && clean(item.tone) === tone && clean(item.text);
    });
    return matches.length === 1 ? clean(matches[0].text) : "";
  }

  function roleFor(player, spec, fallbackIndex) {
    var label = clean(player.label);
    var note = clean(player.note);
    var team = clean(player.team) || "n";
    if (isSupport(player)) return note || label || "Coach / support";
    if (label && !/^\+\d+$/.test(label)) return note ? label + " · " + note : label;
    if (note) return note;
    var fromLegend = legendRole(spec, team);
    if (fromLegend) return fromLegend;
    if (team === "n") return "Waiting player " + (fallbackIndex + 1);
    return "Athlete " + (fallbackIndex + 1);
  }

  function appearanceFor(actorId) {
    var row = hashString(actorId) % APPEARANCE_IDS.length;
    return {
      id: APPEARANCE_IDS[row],
      asset: GRIDS.roster.asset,
      grid: "roster",
      cols: 4,
      rows: 4,
      row: row,
      frames: 4,
      poseColumns: { ready: 0, active: 1, moving: 2, waiting: 3 }
    };
  }

  function actorIdFor(drill, player, playerIndex, groupIndex) {
    var explicit = clean(player && (player.id || player.actor || player.playerId));
    var base = explicit ? slug(explicit) : "p" + (playerIndex + 1);
    return "actor-" + slug(drill && drill.id) + "-" + base +
      (groupIndex == null ? "" : "-g" + (groupIndex + 1));
  }

  function makeActor(drill, spec, player, playerIndex, groupIndex, x, y, source) {
    var id = actorIdFor(drill, player, playerIndex, groupIndex);
    var support = isSupport(player);
    var role = roleFor(player, spec, playerIndex + (groupIndex || 0));
    var appearance = appearanceFor(id);
    return {
      id: id,
      source: source || "authored-player",
      sourcePlayerIndex: playerIndex,
      groupIndex: groupIndex == null ? null : groupIndex,
      label: clean(player.label) || role,
      role: role,
      note: clean(player.note),
      team: clean(player.team) || "n",
      support: support,
      staged: false,
      fullBody: true,
      x: x,
      y: y,
      position: [x, y],
      appearanceId: appearance.id,
      appearance: appearance,
      initialMotionId: support ? "admin" : "ready",
      motionIds: [support ? "admin" : "ready"],
      authored: player
    };
  }

  function groupOffset(index, count, width, height) {
    var columns = Math.max(1, Math.ceil(Math.sqrt(count)));
    var row = Math.floor(index / columns);
    var column = index % columns;
    return [
      (column - (Math.min(columns, count) - 1) / 2) * Math.min(0.42, width * 0.035),
      row * Math.min(0.38, height * 0.035)
    ];
  }

  function courtBounds(spec, width, height) {
    var courts = spec.court || [];
    if (!Array.isArray(courts)) courts = [courts];
    var bounds = { minX: width, minY: height, maxX: 0, maxY: 0, found: false };
    courts.forEach(function (court) {
      if (!court || !finite(court.x) || !finite(court.y) || !finite(court.w) || !finite(court.h)) return;
      bounds.found = true;
      bounds.minX = Math.min(bounds.minX, court.x);
      bounds.minY = Math.min(bounds.minY, court.y);
      bounds.maxX = Math.max(bounds.maxX, court.x + court.w);
      bounds.maxY = Math.max(bounds.maxY, court.y + court.h);
    });
    if (!bounds.found) return { minX: 0, minY: 0, maxX: width, maxY: height, found: false };
    return bounds;
  }

  function operationMode(drill, spec) {
    var authoredMode = clean(spec && (spec.operationMode || spec.operation)).toLowerCase();
    if (/^(?:parallel|rotation|waiting)$/.test(authoredMode)) return authoredMode;
    var fields = RR.format && RR.format.fields ? RR.format.fields(drill || {}) : {};
    var source = [fields.grouping, fields.flow, drill && drill.setup].map(clean).join(" ").toLowerCase();
    // Explicit simultaneous-flow copy outranks incidental nouns such as
    // "line" (especially the common "no standing in line" wording).
    if (/\b(?:all\s+(?:pairs?|groups?|stations?)\s+work\s+at\s+the\s+same\s+time|parallel|at once|same time|simultaneous|simultaneously)\b/.test(source)) {
      return "parallel";
    }
    if (/\b(wait|waiting|queue|line|sideline|sub|off[- ]?court)\b/.test(source)) return "waiting";
    if (/\b(pairs?|groups?|stations?|circles?|split)\b/.test(source)) return "parallel";
    if (/\b(rotate|rotates|rotating|rotation|take turns|alternate|alternates)\b/.test(source)) return "rotation";
    return "rotation";
  }

  function stagingLane(spec, count, mode) {
    if (!count) return null;
    var width = finite(spec.w) && spec.w > 0 ? spec.w : 9;
    var height = finite(spec.h) && spec.h > 0 ? spec.h : 10;
    var bounds = courtBounds(spec, width, height);
    var bottomFree = height - bounds.maxY;
    var rightFree = width - bounds.maxX;
    var edge = bottomFree >= 0.55 || bottomFree >= rightFree ? "bottom" : "right";
    var positions = [];
    var capacity;
    var index;
    if (edge === "bottom") {
      capacity = Math.max(1, Math.floor(Math.max(1, width - 0.7) / 0.68));
      for (index = 0; index < count; index++) {
        var row = Math.floor(index / capacity);
        var inRow = Math.min(capacity, count - row * capacity);
        var column = index % capacity;
        var startX = width / 2 - (inRow - 1) * 0.34;
        positions.push([clamp(startX + column * 0.68, 0.32, width - 0.32),
          clamp(height - 0.34 - row * 0.52, 0.34, height - 0.26)]);
      }
    } else {
      capacity = Math.max(1, Math.floor(Math.max(1, height - 0.7) / 0.68));
      for (index = 0; index < count; index++) {
        var columnIndex = Math.floor(index / capacity);
        var inColumn = Math.min(capacity, count - columnIndex * capacity);
        var rowIndex = index % capacity;
        var startY = height / 2 - (inColumn - 1) * 0.34;
        positions.push([clamp(width - 0.34 - columnIndex * 0.52, 0.34, width - 0.26),
          clamp(startY + rowIndex * 0.68, 0.32, height - 0.32)]);
      }
    }
    return {
      edge: edge,
      insideScene: true,
      mode: mode,
      label: mode === "parallel" ? "Parallel group lane" :
        mode === "waiting" ? "Waiting lane" : "Rotation lane",
      positions: positions
    };
  }

  function buildActors(drill, spec) {
    var width = finite(spec.w) && spec.w > 0 ? spec.w : 9;
    var height = finite(spec.h) && spec.h > 0 ? spec.h : 10;
    var players = Array.isArray(spec.players) ? spec.players : [];
    var actors = [];
    var markers = [];
    players.forEach(function (player, playerIndex) {
      player = player || {};
      if (isReferenceMarker(player)) {
        markers.push({
          id: "marker-" + slug(drill && drill.id) + "-p" + (playerIndex + 1),
          sourcePlayerIndex: playerIndex,
          label: clean(player.label),
          note: clean(player.note),
          x: finite(player.x) ? player.x : width / 2,
          y: finite(player.y) ? player.y : height / 2,
          authored: player
        });
        return;
      }
      var count = groupedCount(player);
      var baseX = finite(player.x) ? player.x : width / 2;
      var baseY = finite(player.y) ? player.y : height / 2;
      if (count) {
        for (var groupIndex = 0; groupIndex < count; groupIndex++) {
          var offset = groupOffset(groupIndex, count, width, height);
          actors.push(makeActor(drill, spec, player, playerIndex, groupIndex,
            clamp(baseX + offset[0], 0.2, width - 0.2),
            clamp(baseY + offset[1], 0.2, height - 0.2), "authored-group"));
        }
      } else {
        actors.push(makeActor(drill, spec, player, playerIndex, null,
          clamp(baseX, 0.2, width - 0.2), clamp(baseY, 0.2, height - 0.2),
          "authored-player"));
      }
    });

    var minimum = validMinimum(drill);
    var athleteCount = actors.filter(function (actor) { return !actor.support; }).length;
    var missing = minimum == null ? 0 : Math.max(0, minimum - athleteCount);
    var mode = operationMode(drill, spec);
    var lane = stagingLane(spec, missing, mode);
    for (var index = 0; index < missing; index++) {
      var rolePrefix = mode === "parallel" ? "Parallel group player " :
        mode === "waiting" ? "Waiting player " : "Rotation player ";
      var player = { label: rolePrefix + (index + 1), note: lane.label, team: "n" };
      var position = lane.positions[index];
      var actor = makeActor(drill, spec, player, players.length + index, null,
        position[0], position[1], "saved-minimum");
      actor.staged = true;
      actor.role = rolePrefix + (index + 1);
      actor.label = actor.role;
      actor.initialMotionId = mode === "parallel" ? "ready" : "admin";
      actor.motionIds = [actor.initialMotionId];
      actors.push(actor);
    }
    return {
      actors: actors,
      markers: markers,
      minimum: minimum,
      authoredAthletes: athleteCount,
      supportPeople: actors.filter(function (actor) { return actor.support; }).length,
      additional: missing,
      operationMode: mode,
      stagingLane: lane
    };
  }

  function actorsForPlayerIndex(actors, playerIndex) {
    return actors.filter(function (actor) {
      return actor.sourcePlayerIndex === playerIndex && !actor.staged;
    });
  }

  function explicitActorReference(path) {
    return clean(path && (path.actorId || path.actor || path.playerId || path.player));
  }

  function actorsMatchingReference(actors, reference) {
    reference = clean(reference);
    if (!reference) return [];
    return actors.filter(function (actor) {
      var authored = actor.authored || {};
      return [actor.id, actor.label, authored.id, authored.actor,
        authored.actorId, authored.playerId, authored.player, authored.label]
        .some(function (value) { return clean(value) === reference; });
    });
  }

  function bindReferencedActor(actors, reference, target, source) {
    var exact = actorsMatchingReference(actors, reference);
    if (!exact.length) return null;
    if (exact.length === 1) {
      return { actor: exact[0], source: source, distance: 0, reference: clean(reference) };
    }
    // A grouped authored marker can expand to several full-body actors. The
    // authored identity still wins; geometry only selects within that factual
    // group instead of crossing over to a different person.
    var ranked = nearestRanked(exact, target || [0, 0], true);
    return {
      actor: ranked[0].actor,
      source: source + "-group-nearest",
      distance: ranked[0].distance,
      reference: clean(reference)
    };
  }

  function nearestRanked(actors, target, includeStaged) {
    var candidates = actors.filter(function (actor) {
      return includeStaged || !actor.staged;
    });
    if (!candidates.length) candidates = actors.slice();
    return candidates.map(function (actor) {
      return { actor: actor, distance: distance(actor.position, target) };
    }).sort(function (left, right) {
      if (left.distance !== right.distance) return left.distance - right.distance;
      return left.actor.id < right.actor.id ? -1 : 1;
    });
  }

  function bindMoveActor(path, actors, options) {
    options = options || {};
    if (finite(path.playerIndex) && Math.floor(path.playerIndex) === path.playerIndex) {
      var indexed = actorsForPlayerIndex(actors, path.playerIndex);
      if (indexed.length) return { actor: indexed[0], source: "explicit-player-index", distance: 0 };
    }
    var reference = explicitActorReference(path);
    if (reference) {
      var referenced = bindReferencedActor(actors, reference,
        point(path.from, [0, 0]), "explicit-reference");
      if (referenced) return referenced;
    }
    var from = point(path.from, [0, 0]);
    var ranked = nearestRanked(actors, from, false);
    if (!ranked.length) return { actor: null, source: "unbound", distance: null };
    if (ranked.length === 1) {
      return { actor: ranked[0].actor, source: "sole-actor", distance: ranked[0].distance };
    }
    var maxDistance = finite(options.actorSnapDistance) ? options.actorSnapDistance : 1.35;
    var delta = finite(options.ambiguityDelta) ? options.ambiguityDelta : 0.08;
    if (ranked[0].distance <= maxDistance &&
        ranked[1].distance - ranked[0].distance >= delta) {
      return { actor: ranked[0].actor, source: "nearest-origin", distance: ranked[0].distance };
    }
    return { actor: null, source: "ambiguous-origin", distance: ranked[0].distance };
  }

  function isReviewedObjectMove(spec, pathIndex) {
    return (spec.motionBallPaths || []).indexOf(pathIndex) !== -1;
  }

  function buildRoutes(spec, actors, options) {
    options = options || {};
    return (spec.paths || []).map(function (path, pathIndex) {
      path = path || {};
      var stepIndices = Array.isArray(path.stepIndices) ? path.stepIndices : [];
      if (stepIndices.length && options.showFullScene !== true && finite(options.stepIndex) &&
          stepIndices.indexOf(Math.floor(options.stepIndex)) === -1) return null;
      var kind = clean(path.kind) || "ball";
      var isBall = kind !== "move" || isReviewedObjectMove(spec, pathIndex);
      var route = {
        id: "route-" + (pathIndex + 1),
        sourcePathIndex: pathIndex,
        type: isBall ? "ball" : "move",
        kind: kind,
        object: clean(path.object) || (isBall ? "volleyball" : ""),
        label: clean(path.label),
        hideLabel: path.hideLabel === true,
        from: point(path.from, [0, 0]),
        via: (path.via || []).map(function (item) { return point(item, [0, 0]); }),
        to: point(path.to, point(path.from, [0, 0])),
        curve: finite(path.curve) ? path.curve : 0,
        stepIndices: stepIndices.slice(),
        stepScoped: stepIndices.length > 0,
        sequenceOrder: finite(path.sequenceOrder) ? path.sequenceOrder : pathIndex,
        simultaneousGroup: clean(path.simultaneousGroup || path.parallelGroup),
        authored: path,
        actorId: null,
        bindingSource: ""
      };
      if (!isBall) {
        var binding = bindMoveActor(path, actors, options);
        route.actorId = binding.actor ? binding.actor.id : null;
        route.bindingSource = binding.source;
        route.bindingDistance = binding.distance;
      }
      return route;
    }).filter(function (route) { return !!route; });
  }

  function chainInfoFor(spec, pathIndex) {
    var found = null;
    (spec.motionChains || []).some(function (chain, chainIndex) {
      var position = chain.indexOf(pathIndex);
      if (position === -1) return false;
      found = { id: "chain-" + (chainIndex + 1), index: chainIndex, position: position };
      return true;
    });
    return found || { id: "route-track-" + (pathIndex + 1), index: -1, position: 0 };
  }

  function contactMotionIds(drill, route, instruction) {
    var context = { drill: drill };
    var labelIds = routeLabelMotionIds(route.label, drill).filter(function (id) {
      return id !== "ready" && id !== "defensive-ready" && id !== "admin" && id !== "recovery";
    });
    var source = "path-label";
    var routeLabel = clean(route.label).toLowerCase();
    var skill = clean(drill && drill.skill).toLowerCase();
    var drillId = clean(drill && drill.id).toLowerCase();
    if (skill === "setting" && labelIds.indexOf("set") !== -1 &&
        labelIds.indexOf("jump") !== -1) {
      labelIds = ["set"];
      source = "path-label-alias";
    }
    if (skill === "serving" && labelIds.indexOf("attack") !== -1 &&
        !/\b(?:attack|spik|kill|down[- ]ball|roll[- ]shot|tip|dump)\b/.test(routeLabel)) {
      labelIds = labelIds.map(function (motionId) {
        return motionId === "attack" ? "serve" : motionId;
      }).filter(function (motionId, index, ids) { return ids.indexOf(motionId) === index; });
      source = "path-label-alias";
    }
    if (!labelIds.length && skill === "hitting" &&
        /\b(?:snap(?:s|ped|ping)?(?:\s+down)?|line\s+or\s+cross|cross\s+or\s+line|hard[- ]driven|swing)\b/.test(routeLabel)) {
      labelIds = ["attack"];
      source = "path-label-alias";
    }
    if (!labelIds.length && skill === "hitting" &&
        /\b(?:roll\s+deep|deep\s+roll|short\s+tip|tip\s+short)\b/.test(routeLabel)) {
      labelIds = ["tip-roll"];
      source = "path-label-alias";
    }
    if (!labelIds.length && skill === "passing" &&
        /\b(?:to\s+target|target\s+pass|platform\s+angle)\b/.test(routeLabel)) {
      labelIds = ["pass"];
      source = "path-label-alias";
    }
    if (skill === "setting" && labelIds.length === 1 && labelIds[0] === "dig" &&
        /^\s*(?:dig|dug\s+ball|incoming\s+dig)\s*$/.test(routeLabel)) {
      labelIds = ["feed"];
      source = "path-label-alias";
    }
    if (drillId === "overhead-emergency-pass" && /high\s*&\s*tight/.test(routeLabel)) {
      labelIds = ["serve"];
      source = "reviewed-contact-alias";
    }
    if (drillId === "mid-court-passing-decision" && /read it early/.test(routeLabel)) {
      labelIds = ["serve"];
      source = "reviewed-contact-alias";
    }
    if (drillId === "roll-the-ball-dig" && /rolls? along floor/.test(routeLabel)) {
      labelIds = ["feed"];
      source = "reviewed-contact-alias";
    }
    if (drillId === "libero-dig-and-run-through" && /hard[- ]driven ball/.test(routeLabel)) {
      labelIds = ["attack"];
      source = "reviewed-contact-alias";
    }
    if (drillId === "libero-dig-and-run-through" && /soft tip/.test(routeLabel)) {
      labelIds = ["tip-roll"];
      source = "reviewed-contact-alias";
    }
    if (/^(?:wall-set-and-pass-combo|pepper)$/.test(drillId) && /^set up$/.test(routeLabel)) {
      labelIds = ["set"];
      source = "reviewed-contact-alias";
    }
    if (drillId === "jump-set-and-dump" && /^dump$/.test(routeLabel)) {
      labelIds = ["tip-roll"];
      source = "reviewed-contact-alias";
    }
    if (drillId === "setter-release-from-base" && /^pass$/.test(routeLabel)) {
      labelIds = ["feed"];
      source = "reviewed-contact-alias";
    }
    if (drillId === "ladder-to-dig-reaction" && /ball wide/.test(routeLabel)) {
      labelIds = ["feed"];
      source = "reviewed-contact-alias";
    }
    if (drillId === "hitting-from-all-positions" && /^back[- ]row set$/.test(routeLabel)) {
      labelIds = ["set"];
      source = "reviewed-contact-alias";
    }
    // `kind: serve` is a legacy curved-arrow style in the saved diagrams, not
    // proof of a serving mechanic. Only a real serving drill (or the reviewed
    // 3v3 rally start) may use it as semantic evidence.
    if (!labelIds.length && route.kind === "serve" &&
        (skill === "serving" || drillId === "three-v-three-mini-game")) {
      labelIds = ["serve"];
      source = "serving-path-kind";
    }
    if (!labelIds.length) {
      labelIds = ["admin"];
      source = "unclassified-route";
    }
    return { ids: labelIds, source: source };
  }

  function actorIdentity(actor) {
    if (!actor) return "";
    var authored = actor.authored || {};
    return [actor.label, actor.role, actor.note, authored.role, authored.note,
      authored.label, authored.id].map(clean).join(" ").toLowerCase();
  }

  function actorMotionScore(actor, motionId, drill) {
    if (!actor) return 0;
    var identity = actorIdentity(actor);
    var skill = clean(drill && drill.skill).toLowerCase();
    var patterns = {
      signal: /\b(?:coach|caller|cue|signal)\b/,
      feed: /\b(?:coach|feeder|tosser|tosses|feeds?|partner\s+on\s+(?:a\s+)?box)\b/,
      serve: /\bserver\b|^s(?:\s|$)|\bserves?\b/,
      underhand: /\bserver\b|^s(?:\s|$)|\bserves?\b/,
      "jump-float": /\bserver\b|^s(?:\s|$)|\bserves?\b/,
      "jump-topspin": /\bserver\b|^s(?:\s|$)|\bserves?\b/,
      pass: /\b(?:passer|receiver|serve[- ]receive)\b|^p(?:\s|$)/,
      set: /\bsetter\b|^st(?:\s|$)/,
      attack: /\b(?:hitter|attacker|outside|opposite|right[- ]side|middle|pin)\b|^h(?:\s|$)|^oh(?:\s|$)|^op(?:\s|$)|^m(?:\s|$)/,
      "tip-roll": /\b(?:hitter|attacker|outside|opposite|right[- ]side|middle|pin|setter)\b|^h(?:\s|$)|^st(?:\s|$)/,
      "box-hit": /\b(?:hitter|outside)\b|^h(?:\s|$)|^oh(?:\s|$)/,
      block: /\bblocker\b|^b(?:\s|$)|\bblocks?\b/,
      dig: /\b(?:digger|defender|libero|floor\s+defen[cs]e|covers?\s+low|cover\s+player)\b|^d\d*(?:\s|$)|^l(?:\s|$)/,
      sprawl: /\b(?:digger|defender|libero|diver|pancake|sprawl)\b|^d\d*(?:\s|$)|^l(?:\s|$)/,
      "run-through": /\b(?:digger|defender|libero|pursuit|chases?|save)\b|^d\d*(?:\s|$)|^l(?:\s|$)/,
      "mat-defense": /\b(?:digger|defender|libero|diver|pursuit|sprawl)\b|^d\d*(?:\s|$)|^l(?:\s|$)/,
      "defensive-ready": /\b(?:digger|defender|libero|defen[cs]e|back\s+row)\b|^d\d*(?:\s|$)|^l(?:\s|$)/,
      "approach-jump": /\b(?:hitter|attacker|outside|opposite|middle|pin)\b|^h(?:\s|$)|^oh(?:\s|$)|^op(?:\s|$)|^m(?:\s|$)/
    };
    var regex = patterns[motionId];
    if (regex && regex.test(identity)) return 4;
    if ((motionId === "feed" || motionId === "signal") && actor.support) return 3;
    if (motionId === "attack" && actor.support && /\b(?:hit|attack|down[- ]ball|tip)\b/.test(identity)) {
      return 4;
    }
    if (skill === "serving" && /^(?:serve|underhand|jump-float|jump-topspin)$/.test(motionId) && !actor.support) return 1;
    if (skill === "passing" && motionId === "pass" && !actor.support) return 1;
    if (skill === "setting" && motionId === "set" && !actor.support) return 1;
    if (skill === "hitting" && /^(?:attack|tip-roll|approach-jump)$/.test(motionId) && !actor.support) return 1;
    if (skill === "blocking" && motionId === "block" && !actor.support) return 1;
    if (skill === "defense" && /^(?:dig|sprawl|run-through|mat-defense|defensive-ready)$/.test(motionId) && !actor.support) return 1;
    return 0;
  }

  function preferredSkillContactMotion(drill, route, instruction, sourceActor, recipientActor) {
    var id = clean(drill && drill.id).toLowerCase();
    var skill = clean(drill && drill.skill).toLowerCase();
    var label = clean(route && route.label).toLowerCase();
    var instructionIds = exactMotionIds(instruction, { drill: drill }).filter(function (motionId) {
      return motionId !== "admin" && motionId !== "ready" && motionId !== "recovery" &&
        motionId !== "signal" && motionId !== "feed";
    });
    var receiverFamilies = {
      defense: { "mat-defense": 1, sprawl: 1, "run-through": 1, dig: 1, "defensive-ready": 1 },
      blocking: { block: 1 },
      passing: { pass: 1 },
      setting: { set: 1 },
      hitting: { "tip-roll": 1, attack: 1 },
      serving: { "jump-topspin": 1, "jump-float": 1, underhand: 1, serve: 1 }
    };
    var family = receiverFamilies[skill] || {};
    var preferred = instructionIds.filter(function (motionId) { return family[motionId]; })[0] || "";

    if (skill === "setting" && actorMotionScore(sourceActor, "feed", drill) >= 3 &&
        !/\b(?:set|pass|bump)\b/.test(label)) return "feed";

    if (skill === "hitting" && /\b(?:roll\s+deep|deep\s+roll|short\s+tip|tip\s+short)\b/.test(label)) {
      preferred = "tip-roll";
    }
    if (skill === "hitting" && !preferred) preferred = "attack";
    if (skill === "passing" && !preferred) preferred = "pass";
    if (skill === "setting" && !preferred) preferred = "set";
    if (skill === "blocking" && !preferred) preferred = "block";
    if (skill === "serving" && !preferred) preferred = "serve";
    if (skill === "defense" && !preferred) preferred = "dig";

    if (id === "defensive-ready-reaction-game") preferred = "run-through";
    if (id === "roll-the-ball-dig") preferred = "dig";
    if (/^(?:mat-floor-defense-progression|mat-sprawl-and-pursuit|mat-diving-extension)$/.test(id) &&
        !/keep tosses out|stage is all about|stop the moment|quality high/.test(sanitizedMotionText(instruction).toLowerCase())) {
      preferred = "mat-defense";
    }
    if (id === "pancake-and-recover") preferred = "sprawl";

    if (preferred && (actorMotionScore(sourceActor, preferred, drill) ||
        actorMotionScore(recipientActor, preferred, drill) ||
        (sourceActor && recipientActor))) return preferred;

    // Mixed/team drills: prefer an instruction mechanic that one of the two
    // factual endpoints can actually perform.
    for (var index = 0; index < instructionIds.length; index++) {
      var candidate = instructionIds[index];
      if (actorMotionScore(sourceActor, candidate, drill) ||
          actorMotionScore(recipientActor, candidate, drill)) return candidate;
    }
    return "";
  }

  function refineContactClassification(drill, route, instruction, sourceActor,
      recipientActor, classification, authoredContact) {
    if (authoredContact && clean(authoredContact.action)) return classification;
    if (classification.source === "path-label" || classification.source === "path-label-alias" ||
        classification.source === "reviewed-contact-alias" ||
        classification.source === "reviewed-contact-action" ||
        classification.source === "serving-path-kind") return classification;
    var inferred = preferredSkillContactMotion(drill, route, instruction,
      sourceActor, recipientActor);
    if (inferred) return { ids: [inferred], source: "role-skill-inference" };
    return { ids: ["admin"], source: "neutral-contact-fallback" };
  }

  function performerForContact(drill, motionId, source, recipient, authoredContact,
      actors, contactPoint) {
    if (authoredContact && authoredContactSourceReference(authoredContact) && source.actor) {
      return { actor: source.actor, partner: recipient.actor, source: "authored-contact-performer" };
    }
    if (!source.actor && recipient.actor) {
      return { actor: recipient.actor, partner: null, source: "recipient-of-factual-endpoint" };
    }
    // When a factual coach/support actor launches an attacking or off-speed
    // ball, ball direction owns the mechanic. A hitter-labelled receiver may
    // currently be defending; it must not steal the coach's delivery merely
    // because its stable role also scores as attack-capable.
    if (source.actor && source.actor.support &&
        /^(?:attack|tip-roll|feed|serve)$/.test(motionId)) {
      return { actor: source.actor, partner: recipient.actor,
        source: "support-source-contact" };
    }
    var sourceScore = actorMotionScore(source.actor, motionId, drill);
    var recipientScore = actorMotionScore(recipient.actor, motionId, drill);
    var capable = (actors || []).map(function (actor) {
      return { actor: actor, score: actorMotionScore(actor, motionId, drill) };
    }).filter(function (entry) {
      return !entry.actor.staged && entry.score >= 3;
    }).sort(function (left, right) {
      if (left.score !== right.score) return right.score - left.score;
      return distance(left.actor.position, contactPoint || left.actor.position) -
        distance(right.actor.position, contactPoint || right.actor.position);
    });
    if (capable.length && capable[0].score > Math.max(sourceScore, recipientScore)) {
      return { actor: capable[0].actor,
        partner: source.actor && source.actor.id !== capable[0].actor.id
          ? source.actor : recipient.actor,
        source: "scene-role-compatible" };
    }
    if (recipient.actor && recipientScore > sourceScore) {
      return { actor: recipient.actor, partner: source.actor, source: "recipient-role-compatible" };
    }
    if (source.actor && sourceScore > 0) {
      return { actor: source.actor, partner: recipient.actor, source: "source-role-compatible" };
    }
    if (recipient.actor && /^(?:block|dig|sprawl|run-through|mat-defense|defensive-ready)$/.test(motionId)) {
      return { actor: recipient.actor, partner: source.actor, source: "receiver-mechanic" };
    }
    return { actor: source.actor || recipient.actor,
      partner: source.actor ? recipient.actor : null, source: "contact-direction-fallback" };
  }

  function nearestContactActor(actors, target) {
    var ranked = nearestRanked(actors.filter(function (actor) {
      return !actor.staged;
    }), target, false);
    if (!ranked.length) ranked = nearestRanked(actors, target, true);
    return ranked.length ? ranked[0] : { actor: null, distance: null };
  }

  function authoredContactPathIndex(contact) {
    if (!contact || typeof contact !== "object") return null;
    if (finite(contact.pathIndex)) return Math.floor(contact.pathIndex);
    if (finite(contact.routeIndex)) return Math.floor(contact.routeIndex);
    return null;
  }

  function authoredContactsForPath(spec, pathIndex) {
    return (Array.isArray(spec.contacts) ? spec.contacts : []).map(function (contact, index) {
      return { contact: contact || {}, index: index };
    }).filter(function (entry) {
      return authoredContactPathIndex(entry.contact) === pathIndex;
    }).sort(function (left, right) {
      var leftOrder = finite(left.contact.order) ? left.contact.order : left.index;
      var rightOrder = finite(right.contact.order) ? right.contact.order : right.index;
      if (leftOrder !== rightOrder) return leftOrder - rightOrder;
      return left.index - right.index;
    });
  }

  function authoredContactSourceReference(contact) {
    return clean(contact && (contact.actor || contact.fromActor || contact.actorId ||
      contact.playerId || contact.player));
  }

  function authoredContactRecipientReference(contact) {
    return clean(contact && (contact.toActor || contact.recipientActor ||
      contact.recipient || contact.receiverActor || contact.receiver));
  }

  function firstAuthoredSourceForPath(spec, pathIndex) {
    var entries = authoredContactsForPath(spec, pathIndex);
    if (entries.length) return authoredContactSourceReference(entries[0].contact);
    var path = (spec.paths || [])[pathIndex] || {};
    return clean(path.fromActor || path.actorFrom);
  }

  function nextChainSourceReference(spec, pathIndex) {
    var reference = "";
    (spec.motionChains || []).some(function (chain) {
      var position = chain.indexOf(pathIndex);
      if (position === -1 || position + 1 >= chain.length) return false;
      reference = firstAuthoredSourceForPath(spec, chain[position + 1]);
      return !!reference;
    });
    return reference;
  }

  function normalizeEndpoint(value, fallbackId, position, source) {
    if (!value) return null;
    var object = typeof value === "object" ? value : { type: value };
    var type = clean(object.type || object.kind || object.endpoint).toLowerCase();
    if (!/^(?:wall|floor|zone|hoop|target)$/.test(type)) return null;
    return {
      id: clean(object.id) || fallbackId,
      type: type,
      label: clean(object.label) || type.charAt(0).toUpperCase() + type.slice(1),
      x: finite(object.x) ? object.x : position[0],
      y: finite(object.y) ? object.y : position[1],
      source: source
    };
  }

  function endpointTypeForZone(drill, zone) {
    var label = clean(zone && zone.label).toLowerCase();
    var equipment = list(drill && drill.equipment).join(" ").toLowerCase();
    if (/wall/.test(label) || /\bwall\b/.test(equipment)) return "wall";
    if (/hoop/.test(label) || /\bhoops?\b/.test(equipment)) return "hoop";
    if (/target/.test(label)) return "target";
    return "zone";
  }

  function factualEndpointFor(drill, spec, route, position, side) {
    var authored = route.authored || {};
    var explicit = side === "from"
      ? (authored.fromEndpoint || authored.sourceEndpoint)
      : (authored.toEndpoint || authored.recipientEndpoint || authored.endpoint);
    var normalized = normalizeEndpoint(explicit,
      "endpoint-" + (route.sourcePathIndex + 1) + "-" + side,
      position, "authored-path-endpoint");
    if (normalized) return normalized;

    var zones = Array.isArray(spec.zones) ? spec.zones : [];
    var candidates = zones.map(function (zone, zoneIndex) {
      if (!zone || !finite(zone.x) || !finite(zone.y) ||
          !finite(zone.w) || !finite(zone.h)) return null;
      var margin = 0.5;
      if (position[0] < zone.x - margin || position[0] > zone.x + zone.w + margin ||
          position[1] < zone.y - margin || position[1] > zone.y + zone.h + margin) return null;
      var center = [zone.x + zone.w / 2, zone.y + zone.h / 2];
      return { zone: zone, index: zoneIndex, distance: distance(position, center) };
    }).filter(function (candidate) { return !!candidate; }).sort(function (left, right) {
      return left.distance - right.distance;
    });
    if (candidates.length) {
      var candidate = candidates[0];
      var type = endpointTypeForZone(drill, candidate.zone);
      if (side === "from" && type !== "wall" && type !== "floor") return null;
      return {
        id: "endpoint-zone-" + (candidate.index + 1),
        type: type,
        label: clean(candidate.zone.label) || type.charAt(0).toUpperCase() + type.slice(1),
        x: position[0],
        y: position[1],
        zoneIndex: candidate.index,
        source: "authored-zone"
      };
    }

    // Floor contact can be represented without a rectangular zone when the
    // authored route itself explicitly names the surface.
    if (side === "to" && /\b(?:floor|ground)\b/i.test(route.label)) {
      return {
        id: "endpoint-" + (route.sourcePathIndex + 1) + "-floor",
        type: "floor",
        label: "Floor",
        x: position[0],
        y: position[1],
        source: "authored-path-label"
      };
    }
    return null;
  }

  function contactActorBinding(actors, reference, target, sourceName, endpoint) {
    var explicit = bindReferencedActor(actors, reference, target, sourceName);
    if (explicit) return explicit;
    if (!reference && endpoint) {
      return {
        actor: null,
        endpoint: endpoint,
        source: "factual-" + endpoint.type + "-endpoint",
        distance: 0,
        reference: ""
      };
    }
    var nearest = nearestContactActor(actors, target);
    return {
      actor: nearest.actor,
      endpoint: null,
      source: reference ? sourceName + "-unresolved-nearest" : "nearest-factual-endpoint",
      distance: nearest.distance,
      reference: clean(reference)
    };
  }

  function authoredContactClassification(drill, route, instruction, contact) {
    var action = clean(contact && contact.action);
    var drillId = clean(drill && drill.id).toLowerCase();
    var normalizedAction = action.toLowerCase();

    // A handful of terse saved contact labels are deliberately sport-specific.
    // Resolve them before the broad prose detector so the coach's delivery is
    // not reassigned to the receiver (for example, a "hard-driven ball" is the
    // coach's attack, while the next contact is the libero's dig).
    if (drillId === "overhead-emergency-pass" && /high\s*&\s*tight/.test(normalizedAction)) {
      return { ids: ["serve"], source: "reviewed-contact-action" };
    }
    if (drillId === "mid-court-passing-decision" && /read it early/.test(normalizedAction)) {
      return { ids: ["serve"], source: "reviewed-contact-action" };
    }
    if (drillId === "roll-the-ball-dig" && /rolls? along floor/.test(normalizedAction)) {
      return { ids: ["feed"], source: "reviewed-contact-action" };
    }
    if (drillId === "libero-dig-and-run-through" && /hard[- ]driven ball/.test(normalizedAction)) {
      return { ids: ["attack"], source: "reviewed-contact-action" };
    }
    if (drillId === "libero-dig-and-run-through" && /soft tip/.test(normalizedAction)) {
      return { ids: ["tip-roll"], source: "reviewed-contact-action" };
    }
    if (/^(?:wall-set-and-pass-combo|pepper)$/.test(drillId) && /^set up$/.test(normalizedAction)) {
      return { ids: ["set"], source: "reviewed-contact-action" };
    }
    if (drillId === "jump-set-and-dump" && /^dump$/.test(normalizedAction)) {
      return { ids: ["tip-roll"], source: "reviewed-contact-action" };
    }
    if (drillId === "setter-release-from-base" && /^pass$/.test(normalizedAction)) {
      return { ids: ["feed"], source: "reviewed-contact-action" };
    }
    if (drillId === "ladder-to-dig-reaction" && /ball wide/.test(normalizedAction)) {
      return { ids: ["feed"], source: "reviewed-contact-action" };
    }
    if (drillId === "hitting-from-all-positions" && /^back[- ]row set$/.test(normalizedAction)) {
      return { ids: ["set"], source: "reviewed-contact-action" };
    }
    if (/\bretrieve\b[^.]*\breturn\b/i.test(action)) {
      return { ids: ["sprint"], source: "authored-contact-action" };
    }
    if (/\b(?:toss|feed|free[- ]ball)\b/i.test(action)) {
      return { ids: ["feed"], source: "authored-contact-action" };
    }
    var actionIds = exactMotionIds(action, { drill: drill }).filter(function (id) {
      return id !== "ready" && id !== "defensive-ready" && id !== "recovery";
    });
    if (actionIds.length) return { ids: actionIds, source: "authored-contact-action" };
    return contactMotionIds(drill, route, instruction);
  }

  function authoredContactSegments(route, entries, actors) {
    var points = [route.from].concat(route.via).concat([route.to]);
    var boundaries = [0];
    var cursor = 0;
    for (var index = 1; index < entries.length; index++) {
      var reference = authoredContactSourceReference(entries[index].contact);
      var binding = bindReferencedActor(actors, reference, points[cursor],
        "authored-contact-actor");
      var target = binding && binding.actor ? binding.actor.position : null;
      var remaining = entries.length - index;
      var lastAllowed = Math.max(cursor + 1, points.length - 1 - remaining);
      var bestIndex = Math.min(cursor + 1, points.length - 1);
      var bestDistance = Infinity;
      if (target) {
        for (var pointIndex = cursor + 1;
          pointIndex <= lastAllowed && pointIndex < points.length; pointIndex++) {
          var candidateDistance = distance(points[pointIndex], target);
          if (candidateDistance < bestDistance) {
            bestDistance = candidateDistance;
            bestIndex = pointIndex;
          }
        }
      }
      boundaries.push(bestIndex);
      cursor = bestIndex;
    }
    boundaries.push(points.length - 1);

    return entries.map(function (entry, segmentIndex) {
      var startIndex = boundaries[segmentIndex];
      var endIndex = boundaries[segmentIndex + 1];
      var sourceReference = authoredContactSourceReference(entry.contact);
      var sourceBinding = bindReferencedActor(actors, sourceReference,
        points[startIndex], "authored-contact-actor");
      var nextReference = segmentIndex + 1 < entries.length
        ? authoredContactSourceReference(entries[segmentIndex + 1].contact) : "";
      var nextBinding = bindReferencedActor(actors, nextReference,
        points[endIndex], "authored-contact-actor");
      return {
        entry: entry,
        from: segmentIndex === 0 ? route.from.slice() :
          (sourceBinding && sourceBinding.actor
            ? sourceBinding.actor.position.slice() : points[startIndex].slice()),
        via: endIndex > startIndex
          ? points.slice(startIndex + 1, endIndex).map(function (item) { return item.slice(); })
          : [],
        to: segmentIndex === entries.length - 1 ? route.to.slice() :
          (nextBinding && nextBinding.actor
            ? nextBinding.actor.position.slice() : points[endIndex].slice())
      };
    });
  }

  function nextInstructionMotion(ids, currentId) {
    var index = ids.indexOf(currentId);
    if (index >= 0 && index + 1 < ids.length) return ids[index + 1];
    if (currentId === "serve") return ids.indexOf("pass") !== -1 ? "pass" : "ready";
    if (currentId === "attack") return ids.indexOf("dig") !== -1 ? "dig" : "defensive-ready";
    return "ready";
  }

  function buildContacts(drill, spec, routes, actors, instruction) {
    var instructionIds = exactMotionIds(instruction, { drill: drill });
    var contacts = [];
    routes.forEach(function (route) {
      if (route.type !== "ball") return;
      var points = [route.from].concat(route.via).concat([route.to]);
      var classification = contactMotionIds(drill, route, instruction);
      var authoredEntries = authoredContactsForPath(spec, route.sourcePathIndex);
      // Intermediate authored points are often a curved flight shape rather
      // than human contacts. Split them into contact legs only when the exact
      // route label names multiple mechanics (SERVE · PASS · SET · HIT), or
      // when the scene supplies an exact contact/action chain. A single-action
      // route remains one complete flight with its `via` geometry.
      var contactCount = authoredEntries.length ||
        (classification.source === "path-label" && classification.ids.length > 1
          ? Math.min(classification.ids.length, Math.max(1, points.length - 1)) : 1);
      var chain = chainInfoFor(spec, route.sourcePathIndex);
      var authoredSegments = authoredEntries.length
        ? authoredContactSegments(route, authoredEntries, actors) : [];
      for (var segmentIndex = 0; segmentIndex < contactCount; segmentIndex++) {
        var authoredSegment = authoredSegments[segmentIndex] || null;
        var authoredContact = authoredSegment ? authoredSegment.entry.contact : null;
        var fromPoint = authoredSegment ? authoredSegment.from :
          (contactCount === 1 ? route.from : points[segmentIndex]);
        var toPoint = authoredSegment ? authoredSegment.to :
          (contactCount === 1 ? route.to :
            (segmentIndex === contactCount - 1 ? points[points.length - 1] : points[segmentIndex + 1]));
        var sourceReference = authoredContactSourceReference(authoredContact) ||
          (segmentIndex === 0 ? clean(route.authored.fromActor || route.authored.actorFrom) : "");
        var recipientReference = authoredContactRecipientReference(authoredContact);
        if (!recipientReference && authoredEntries.length && segmentIndex + 1 < authoredEntries.length) {
          recipientReference = authoredContactSourceReference(authoredEntries[segmentIndex + 1].contact);
        }
        if (!recipientReference && segmentIndex === contactCount - 1) {
          recipientReference = clean(route.authored.toActor || route.authored.actorTo) ||
            nextChainSourceReference(spec, route.sourcePathIndex);
        }
        var sourceEndpoint = sourceReference ? null :
          factualEndpointFor(drill, spec, route, fromPoint, "from");
        var recipientEndpoint = recipientReference ? null :
          factualEndpointFor(drill, spec, route, toPoint, "to");
        var source = contactActorBinding(actors, sourceReference, fromPoint,
          authoredContact ? "authored-contact-actor" : "authored-path-fromActor",
          sourceEndpoint);
        var recipient = contactActorBinding(actors, recipientReference, toPoint,
          authoredEntries.length && segmentIndex + 1 < authoredEntries.length
            ? "authored-contact-chain" : "authored-path-toActor",
          recipientEndpoint);
        var segmentClassification = authoredContact
          ? authoredContactClassification(drill, route, instruction, authoredContact)
          : classification;
        segmentClassification = refineContactClassification(drill, route, instruction,
          source.actor, recipient.actor, segmentClassification, authoredContact);
        var classifiedId = segmentClassification.ids[
          Math.min(segmentIndex, segmentClassification.ids.length - 1)
        ];
        var performer = performerForContact(drill, classifiedId, source, recipient,
          authoredContact, actors, fromPoint);
        contacts.push({
          id: "",
          order: 0,
          authoredOrder: authoredContact && finite(authoredContact.order)
            ? authoredContact.order : null,
          authoredAction: clean(authoredContact && authoredContact.action),
          routeId: route.id,
          sourcePathIndex: route.sourcePathIndex,
          segmentIndex: segmentIndex,
          chainId: chain.id,
          chainPosition: chain.position + segmentIndex / 100,
          label: clean(authoredContact && authoredContact.action) ||
            route.label || MOTIONS[classifiedId].label,
          kind: route.kind,
          object: route.object,
          from: fromPoint.slice(),
          via: authoredSegment ? authoredSegment.via : (contactCount === 1
            ? route.via.map(function (item) { return item.slice(); })
            : (segmentIndex === contactCount - 1
              ? points.slice(segmentIndex + 1, points.length - 1).map(function (item) { return item.slice(); })
              : [])),
          to: toPoint.slice(),
          curve: route.curve,
          sourceActorId: source.actor ? source.actor.id : null,
          recipientActorId: recipient.actor ? recipient.actor.id : null,
          sourceEndpoint: source.endpoint || null,
          recipientEndpoint: recipient.endpoint || null,
          sourceActorReference: source.reference,
          recipientActorReference: recipient.reference,
          sourceDistance: source.distance,
          recipientDistance: recipient.distance,
          sourceBindingSource: source.source,
          recipientBindingSource: recipient.source,
          bindingSource: source.source + "+" + recipient.source,
          performerActorId: performer.actor ? performer.actor.id : null,
          partnerActorId: performer.partner ? performer.partner.id : null,
          performerBindingSource: performer.source,
          motionId: classifiedId,
          motion: MOTIONS[classifiedId],
          classificationSource: segmentClassification.source,
          recipientMotionId: nextInstructionMotion(instructionIds, classifiedId)
        });
      }
    });
    contacts.sort(function (left, right) {
      if (left.authoredOrder != null && right.authoredOrder != null &&
          left.authoredOrder !== right.authoredOrder) {
        return left.authoredOrder - right.authoredOrder;
      }
      if (left.sourcePathIndex !== right.sourcePathIndex) {
        return left.sourcePathIndex - right.sourcePathIndex;
      }
      return left.segmentIndex - right.segmentIndex;
    });
    contacts.forEach(function (contact, index) {
      contact.id = "contact-" + (index + 1);
      contact.order = index;
    });
    return contacts;
  }

  function equipmentType(value) {
    var source = clean(value).toLowerCase();
    if (/volleyball|\bballs?\b/.test(source)) return "volleyball";
    if (/net/.test(source)) return "net";
    if (/cone/.test(source)) return "cones";
    if (/wall/.test(source)) return "wall";
    if (/hoop|target/.test(source)) return "target";
    if (/jump[- ]?rope/.test(source)) return "jump-rope";
    if (/ladder/.test(source)) return "ladder";
    if (/band/.test(source)) return "band";
    if (/medicine|med ball/.test(source)) return "medicine-ball";
    if (/reaction ball/.test(source)) return "reaction-ball";
    if (/balloon/.test(source)) return "balloon";
    if (/foam/.test(source)) return "foam-roller";
    if (/box/.test(source)) return "box";
    if (/mat/.test(source)) return "mat";
    return slug(source) || "equipment";
  }

  function equipmentFor(drill) {
    var seen = {};
    var equipment = [];
    list(drill && drill.equipment).forEach(function (label) {
      var key = label.toLowerCase();
      if (seen[key]) return;
      seen[key] = true;
      var motionId = equipmentMotionId(label, { drill: drill }) || "admin";
      equipment.push({
        id: "equipment-" + (equipment.length + 1),
        label: label,
        type: equipmentType(label),
        saved: true,
        motionId: motionId,
        motion: MOTIONS[motionId]
      });
    });
    return equipment;
  }

  function eventMotionForMove(drill, route, actor) {
    var label = clean(route.label).toLowerCase();
    var drillId = clean(drill && drill.id).toLowerCase();
    var authoredAction = clean(route.authored &&
      (route.authored.motionId || route.authored.action || route.authored.motion));
    if (MOTIONS[authoredAction]) return authoredAction;
    var authoredIds = authoredAction
      ? exactMotionIds(authoredAction, { drill: drill }) : [];
    if (authoredIds.length) return authoredIds[0];

    // Movement paths describe where a body travels. They must remain stable
    // when the same scene supports several saved steps; inheriting the current
    // prose action made approaches look like sets and defensive shifts look
    // like attacks. These aliases are intentionally based only on the path.
    if (drillId === "mirror-blocking" && /leader moves|^mirror$/.test(label)) {
      return "shuffle";
    }
    if (drillId === "transition-hitting-off-defense" && /pull off to the line/.test(label)) {
      return "sprint";
    }
    if (drillId === "setting-shuttle-relay" && /follow (?:your set|across)/.test(label)) {
      return "sprint";
    }
    if (drillId === "shuttle-passing-to-target" && /follow to back/.test(label)) {
      return "sprint";
    }
    if (/\bapproach|penultimate|take[- ]?off\b/.test(label)) return "approach-jump";
    if (/\b(?:commit|press|seal|block|close\s+the\s+block)\b/.test(label)) return "block";
    if (/\b(?:ladder|quick\s+feet)\b/.test(label)) return "ladder";
    if (/\b(?:sprawl|pancake|div(?:e|ing)|roll\s*(?:out|and|\u2192)|reach\s*&\s*slide)\b/.test(label)) {
      return clean(drill && drill.id).indexOf("mat-") === 0 ? "mat-defense" : "sprawl";
    }
    if (/\b(?:backpedal|drop\s+back|retreat)\b/.test(label)) return "backpedal";
    if (/\b(?:sprint|run|chase|break|pursu|scramble|shag|retrieve|return|release|explode|save\s+and\s+go)\b/.test(label)) {
      return "sprint";
    }
    if (/\b(?:hitter|passer|shagger|server|target|queue)\b[^.]{0,34}(?:\u2192|->|\bto\b)\s*(?:shag|pass|hitter|serving|target|line|next)|(?:\u2192|->)\s*(?:shag|pass|hitter|serving)\b/.test(label)) {
      return "sprint";
    }
    if (/\b(?:shuffle|crossover|cross[- ]step|lateral|side[- ]step|slide|shift|spread|pull|move\s+to|rotate\s+to|cover|line|angle|seam|deep\s+cross|tip\s+cover)\b/.test(label)) {
      return "shuffle";
    }
    if (/\b(?:ready|base|hold|read|stay|stop)\b/.test(label)) return "defensive-ready";
    if (/\b(?:jump|hop)\b/.test(label)) return "jump";

    if (drillId === "band-arm-speed") {
      if (/\bfree\s+swing\b/.test(label)) return "free-arm-swing";
      if (/\bresisted\s+swing\b/.test(label)) return "band-arm-swing";
    }
    var ids = routeLabelMotionIds(route.label, drill).filter(function (motionId) {
      return /^(?:sprint|shuffle|backpedal|jump|approach-jump|block|sprawl|run-through|mat-defense|defensive-ready|ladder|jump-rope|mini-band|box|depth-drop|box-block|band-arm-swing|free-arm-swing|band-upper|band|warmup|stretch|recovery)$/.test(motionId);
    });
    if (ids.length) return ids[0];

    var skill = clean(drill && drill.skill).toLowerCase();
    if (skill === "hitting") return "approach-jump";
    if (skill === "blocking") return "block";
    if (skill === "defense" || skill === "passing" || skill === "setting") return "shuffle";
    if (actor && /\b(?:defender|libero|back\s+row)\b/.test(actorIdentity(actor))) return "shuffle";
    return "sprint";
  }

  function actorForMotion(actors, motionId, drill, instruction) {
    var rolePatterns = {
      ready: /\breact(?:ing|ive)\s+(?:runner|sprinter|athlete)\b|\bloaded\s+athletic\s+stance\b|\bsprinter\s+ready\b|\brunner\b|^r\b/i,
      sprint: /\breact(?:ing|ive)\s+(?:runner|sprinter|athlete)\b|\bsprinter\b|\brunner\b|\baccelerat(?:e|es|ing)\b|^r\b/i,
      signal: /\bsignal partner\b|\bcaller\b|\bcoach\b|\bcue\b/i,
      serve: /\bserver\b|^s\b/i,
      feed: /\bfeeder\b|\bcoach\b|\btosser\b/i,
      pass: /\bpasser\b|\breceiver\b|^p\b/i,
      set: /\bsetter\b|^st\b/i,
      attack: /\bhitter\b|\bmiddle\b|^h\b|^m\b/i,
      "box-hit": /\bhitter\b|\boutside\b|^h\b|^oh\b/i,
      "band-arm-swing": /\bhitter\b|\bathlete\b|\bplayer\b|^h\b/i,
      "free-arm-swing": /\bhitter\b|\bathlete\b|\bplayer\b|^h\b/i,
      block: /\bblocker\b|^b\b/i,
      dig: /\bdigger\b|\bdefender\b|\blibero\b|\bcovers?\s+low\b|^d\b|^l\b/i,
      sprawl: /\bdefender\b|\blibero\b|^d\b|^l\b/i
    };
    rolePatterns["run-through"] = /\bdigger\b|\bdefender\b|\blibero\b|\bpursuit\b|^d\b|^l\b/i;
    rolePatterns["mat-defense"] = /\bdigger\b|\bdefender\b|\blibero\b|\bdiver\b|^d\b|^l\b/i;
    rolePatterns["defensive-ready"] = /\bdigger\b|\bdefender\b|\blibero\b|\bback\s+row\b|^d\b|^l\b/i;
    rolePatterns["approach-jump"] = /\bhitter\b|\boutside\b|\bopposite\b|\bmiddle\b|^h\b|^oh\b|^op\b|^m\b/i;
    var regex = rolePatterns[motionId];
    var source = sanitizedMotionText(instruction).toLowerCase();
    var available = actors.filter(function (actor) { return !actor.staged; });
    if (!available.length) available = actors.slice();

    if (/^(?:feed|signal)$/.test(motionId) ||
        (motionId === "attack" && /\bcoach\s+(?:hits?|attacks?|drives?|tips?)\b/.test(source))) {
      var support = available.filter(function (actor) {
        return actor.support || /\b(?:coach|feeder|tosser|tosses|feeds?|partner|caller|signal)\b/.test(actorIdentity(actor));
      });
      if (support.length) return support[0];
    }
    if (motionId === "jump") {
      var jumpRole = /\bsetter\s+jumps?\b|\bjump[- ]set\b/.test(source) ? /\bsetter\b|^st\b/i :
        /\bblocker\s+jumps?\b|\bjump\s+to\s+block\b/.test(source) ? /\bblocker\b|^b\b/i :
          /\bhitter\s+jumps?\b|\bapproach\b/.test(source) ? /\bhitter\b|\boutside\b|\bopposite\b|\bmiddle\b|^h\b|^oh\b|^op\b|^m\b/i : null;
      if (jumpRole) {
        var jumpActor = available.filter(function (actor) {
          return jumpRole.test(actor.label + " " + actor.role + " " + actor.note);
        });
        if (jumpActor.length) return jumpActor[0];
      }
    }
    if (motionId === "tip-roll" && /\bsetter\s+dumps?\b/.test(source)) {
      var dumpingSetter = available.filter(function (actor) {
        return /\bsetter\b|^st\b/i.test(actor.label + " " + actor.role + " " + actor.note);
      });
      if (dumpingSetter.length) return dumpingSetter[0];
    }
    if (/^(?:ready|defensive-ready)$/.test(motionId) &&
        /^(?:middle-blocker-read-close|commit-block-the-middle)$/.test(clean(drill && drill.id))) {
      var readingBlocker = available.filter(function (actor) {
        return /\b(?:blocker|middle)\b|^b$|^m$/i.test(
          actor.label + " " + actor.role + " " + actor.note + " " +
          clean(actor.authored && actor.authored.role));
      });
      if (readingBlocker.length) return readingBlocker[0];
    }
    if (/^(?:sprint|shuffle|backpedal|defensive-ready|ready)$/.test(motionId)) {
      var movementRole = /\bsetter\b/.test(source) ? /\bsetter\b|^st\b/i :
        /\b(?:defender|digger|libero)\b/.test(source) ? /\b(?:defender|digger|libero)\b|^d\d*\b|^l\b/i :
          /\b(?:hitter|attacker)\b/.test(source) ? /\b(?:hitter|attacker|outside|opposite|middle)\b|^h\b|^oh\b|^op\b/i : null;
      if (movementRole) {
        var movingActor = available.filter(function (actor) {
          return movementRole.test(actor.label + " " + actor.role + " " + actor.note);
        });
        if (movingActor.length) return movingActor[0];
      }
    }

    var active = available.filter(function (actor) { return !actor.support; });
    if (!active.length) active = actors.filter(function (actor) { return !actor.support; });
    if (!active.length) active = actors.slice();
    if (regex) {
      var matched = active.filter(function (actor) {
        var authoredRole = clean(actor.authored && actor.authored.role);
        return regex.test(actor.label + " " + actor.role + " " + actor.note + " " + authoredRole);
      });
      if (matched.length) return matched[0];
    }
    if (motionId === "ready" || motionId === "sprint") {
      var reacting = active.filter(function (actor) {
        var authoredRole = clean(actor.authored && actor.authored.role);
        var identity = actor.label + " " + actor.role + " " + actor.note + " " + authoredRole;
        return !/\b(?:cue|caller|signal partner)\b/i.test(identity);
      });
      if (reacting.length) return reacting[0];
    }
    return active.length ? active[0] : null;
  }

  function buildEvents(drill, routes, contacts, actors, instruction) {
    var events = [];
    contacts.forEach(function (contact) {
      var contactRoute = routes.filter(function (route) { return route.id === contact.routeId; })[0];
      events.push({
        // Exact authored contact order describes the mechanics, even when the
        // drawing stores its flight paths in a different visual-layer order.
        // Path index is only a fallback for legacy scenes without contacts.
        key: finite(contact.authoredOrder)
          ? contact.authoredOrder - 1
          : contactRoute && finite(contactRoute.sequenceOrder)
          ? contactRoute.sequenceOrder + contact.segmentIndex / 100
          : contact.sourcePathIndex + contact.segmentIndex / 100,
        source: "contact",
        motionId: contact.motionId,
        // Ball-flight direction and body-mechanic ownership are independent.
        // A coach can send the ball while the recipient digs it; a setter can
        // deliver a set while the hitter performs the attack shown by the
        // current step. Explicit authored contacts remain authoritative.
        actorId: contact.performerActorId || contact.sourceActorId || contact.recipientActorId,
        partnerActorId: contact.partnerActorId,
        routeId: contact.routeId,
        contactId: contact.id,
        trackId: contact.chainId,
        label: contact.label,
        classificationSource: contact.classificationSource,
        simultaneousGroup: contactRoute && contactRoute.simultaneousGroup || "",
        stepScoped: !!(contactRoute && contactRoute.stepScoped)
      });
    });
    routes.forEach(function (route) {
      if (route.type !== "move") return;
      var routeActor = actors.filter(function (actor) { return actor.id === route.actorId; })[0] || null;
      var motionId = eventMotionForMove(drill, route, routeActor);
      events.push({
        key: finite(route.sequenceOrder) ? route.sequenceOrder : route.sourcePathIndex,
        source: "movement-route",
        motionId: motionId,
        actorId: route.actorId,
        partnerActorId: null,
        routeId: route.id,
        contactId: null,
        trackId: route.id,
        label: route.label || MOTIONS[motionId].label,
        classificationSource: "movement-path",
        simultaneousGroup: route.simultaneousGroup || "",
        stepScoped: route.stepScoped
      });
    });
    events.sort(function (left, right) {
      if (left.key !== right.key) return left.key - right.key;
      return left.source < right.source ? -1 : 1;
    });
    return events;
  }

  function motionFamily(id) {
    if (/^(?:serve|underhand|jump-float|jump-topspin)$/.test(id)) return "serve";
    if (/^(?:attack|tip-roll|box-hit|band-arm-swing|free-arm-swing|approach-jump)$/.test(id)) return "attack";
    if (/^(?:dig|sprawl|run-through|mat-defense|defensive-ready)$/.test(id)) return "defense";
    if (/^(?:sprint|shuffle|backpedal|ladder)$/.test(id)) return "locomotion";
    return id;
  }

  function relatedStepMechanic(eventId, instructionIds) {
    var eventFamily = motionFamily(eventId);
    return instructionIds.some(function (instructionId) {
      var instructionFamily = motionFamily(instructionId);
      if (eventId === instructionId || eventFamily === instructionFamily) return true;
      // Show the factual delivery that makes the named receiver mechanic
      // possible, but do not replay unrelated full-scene mechanics.
      if (instructionFamily === "attack") {
        return eventFamily === "set" || eventFamily === "pass" || eventFamily === "feed";
      }
      if (instructionFamily === "set") return eventFamily === "pass" || eventFamily === "feed";
      if (instructionFamily === "pass") return eventFamily === "serve" || eventFamily === "feed";
      if (instructionFamily === "defense" || instructionFamily === "block") {
        return eventFamily === "attack" || eventFamily === "serve" || eventFamily === "feed";
      }
      return false;
    });
  }

  function sequenceRank(motionId) {
    var ranks = {
      signal: 5, feed: 10, serve: 10, underhand: 10,
      "jump-float": 10, "jump-topspin": 10,
      sprint: 15, shuffle: 17, backpedal: 17, ladder: 18,
      pass: 20, jump: 24, "approach-jump": 24, set: 25,
      attack: 40, "tip-roll": 40, "box-hit": 40,
      block: 45, dig: 50, sprawl: 50, "run-through": 50,
      "mat-defense": 50, "defensive-ready": 52, admin: 90,
      recovery: 95
    };
    return finite(ranks[motionId]) ? ranks[motionId] : 60;
  }

  function reviewedBeatSequence(drill, instruction) {
    var id = clean(drill && drill.id).toLowerCase();
    var source = sanitizedMotionText(instruction).toLowerCase();

    if (id === "pursuit-emergency-defense") {
      if (/first player chases it down[^.]*plays it up/.test(source)) {
        return { ids: ["sprint", "dig"], preferFirst: { dig: 1 } };
      }
      if (/second player tracks that ball[^.]*sends it back over/.test(source)) {
        return { ids: ["dig"], preferLast: { dig: 1 } };
      }
    }
    if (id === "close-range-reaction-digging" &&
        /starts low and balanced[^.]*hands out front/.test(source)) {
      return { ids: ["defensive-ready"], fresh: { "defensive-ready": 1 } };
    }
    if (id === "out-of-system-passing" && /passer plays the ball high to the middle/.test(source)) {
      return { ids: ["pass"], preferLast: { pass: 1 } };
    }
    if (id === "w-formation-serve-receive" &&
        /whoever the ball is heading toward takes it[^.]*players next to them back up/.test(source)) {
      return {
        ids: ["serve", "pass", "shuffle"],
        excludeGroups: ["w-receive-receive-rotation"]
      };
    }
    if (id === "middle-blocker-read-close" &&
        /reset to the middle[^.]*again to the other pin/.test(source)) {
      return { ids: ["set", "shuffle", "block", "admin"] };
    }
    if (id === "commit-block-the-middle" &&
        (/blocker watches[^.]*setter['’]s release/.test(source) ||
         /quick is a fake[^.]*when committing is worth it/.test(source))) {
      return { ids: ["defensive-ready"], fresh: { "defensive-ready": 1 } };
    }
    if (id === "collapse-dig-and-recover" && /drop a knee or sit[^.]*recover to ready/.test(source)) {
      return { ids: ["dig", "ready"], preferLast: { dig: 1 } };
    }
    if (id === "pepper" && /player a hits it down[^.]*keep the dig/.test(source)) {
      return { ids: ["attack", "dig", "set", "attack"] };
    }
    if (id === "over-the-net-pepper") {
      if (/player a digs or passes[^.]*sets it[^.]*hits it over/.test(source)) {
        return { ids: ["pass", "set", "attack"] };
      }
      if (/player b digs it up[^.]*sets it[^.]*sends it back/.test(source)) {
        return { ids: ["dig", "set", "attack"] };
      }
    }
    if (id === "transition-hitting-off-defense" && /link defense[^.]*transition[^.]*attack/.test(source)) {
      return { ids: ["dig", "sprint", "set", "attack"] };
    }
    if (id === "libero-dig-and-run-through") {
      if (/coach mixes|hard-driven balls[^.]*soft tips/.test(source)) {
        return { ids: ["attack", "dig", "tip-roll", "run-through"] };
      }
      if (/on hard balls/.test(source)) return { ids: ["attack", "dig"] };
      if (/on tips/.test(source)) return { ids: ["tip-roll", "run-through"] };
      if (/getting the dig high[^.]*turn it into an attack/.test(source)) {
        return { ids: ["dig", "attack"], fresh: { attack: 1 } };
      }
    }
    if (id === "defensive-base-and-read" && /coach hits or tips[^.]*defenders dig/.test(source)) {
      return { ids: ["attack", "dig", "admin"] };
    }
    if (id === "transition-dig-to-attack" &&
        /setter sets[^.]*hitter transitions|dig leads to|everyone digs[^.]*sets[^.]*attacks/.test(source)) {
      return { ids: ["attack", "dig", "approach-jump", "set", "attack"].concat(
        /only score|rotate so everyone/.test(source) ? ["admin"] : []) };
    }
    if (id === "off-the-block-cover" && /defenders play the blocked ball[^.]*another attack/.test(source)) {
      return { ids: ["dig", "set", "attack"] };
    }
    if (id === "continuous-cross-court-control" && /dig \(or pass\)[^.]*controlled attack back/.test(source)) {
      return { ids: ["dig", "set", "attack", "dig", "set", "attack"] };
    }
    if (id === "defensive-pepper" && /digger sets the hitter[^.]*swings hard again/.test(source)) {
      return { ids: ["set", "attack"] };
    }
    if (id === "wall-set-and-pass-combo" && /set the next rebound[^.]*pass the next/.test(source)) {
      return { ids: ["set", "pass"] };
    }
    if (id === "partner-pass-and-set-continuous" && /partner a passes again/.test(source)) {
      return { ids: ["pass", "set"] };
    }
    if (id === "bump-set-self-control" && /set the next one[^.]*then bump again/.test(source)) {
      return { ids: ["set", "pass"] };
    }
    if (id === "jump-set-and-dump") {
      if (/defen[cs]e cheats[^.]*dumps the ball/.test(source)) return { ids: ["tip-roll"] };
      if (/respect the dump[^.]*sets the ball instead/.test(source)) return { ids: ["set"] };
      if (/mix set and dump/.test(source)) return { ids: ["set", "tip-roll"] };
    }
    if (id === "shuttle-passing-to-target" && /after they pass[^.]*jogs to the back/.test(source)) {
      return { ids: ["pass", "sprint"] };
    }
    if (id === "slide-approach-attack" && /steady back set[^.]*takeoff spot/.test(source)) {
      return { ids: ["set", "approach-jump"] };
    }
    if (id === "approach-timing-off-the-pass" &&
        /time the last steps[^.]*set arrives|repeat with steady passes[^.]*hitters adjust/.test(source)) {
      return { ids: ["pass", "approach-jump", "set", "attack"] };
    }
    if (id === "middle-quick-attack") {
      if (/short,? fast approach[^.]*setter releases/.test(source)) {
        return { ids: ["approach-jump", "set"] };
      }
      if (/steady pass first[^.]*middle has to adjust/.test(source)) {
        return { ids: ["pass", "set", "attack"] };
      }
    }
    if (id === "attack-and-transition-to-defense" && /attack-then-defend cycle/.test(source)) {
      return { ids: ["set", "attack", "backpedal", "attack", "dig"] };
    }
    if (id === "hitting-from-all-positions" &&
        /back[- ]row set|attacking from behind|rotate hitters through the whole sequence/.test(source)) {
      return { ids: ["set", "approach-jump", "attack"].concat(
        /rotate hitters/.test(source) ? ["admin"] : []) };
    }
    if (id === "setting-shuttle-relay" && /follow your set[^.]*jog to the back/.test(source)) {
      return { ids: ["set", "sprint", "set", "sprint"] };
    }
    if (id === "setter-release-from-base" && /coach tosses a pass[^.]*outside set[^.]*jogs back/.test(source)) {
      return { ids: ["feed", "set", "sprint"] };
    }
    if (id === "ladder-to-dig-reaction" && /player breaks to it[^.]*jogs back/.test(source)) {
      return { ids: ["ladder", "sprint", "feed", "dig", "sprint"] };
    }
    return null;
  }

  function savedInstructionEvent(motionId, actors, drill, instruction, index) {
    var actor = actorForMotion(actors, motionId, drill, instruction);
    return {
      key: index + 0.5,
      source: "saved-instruction",
      motionId: motionId,
      actorId: actor ? actor.id : null,
      partnerActorId: null,
      routeId: null,
      contactId: null,
      trackId: "reviewed-instruction-" + (index + 1),
      label: MOTIONS[motionId].label,
      instructionIndex: index,
      stepScoped: true
    };
  }

  function applyReviewedBeatSequence(drill, instruction, ordered, actors) {
    var review = reviewedBeatSequence(drill, instruction);
    if (!review || !review.ids.length) return ordered;
    var excludedGroups = review.excludeGroups || [];
    var pool = ordered.filter(function (event) {
      return excludedGroups.indexOf(clean(event.simultaneousGroup)) === -1;
    });
    var totals = {};
    var fresh = {};
    var preferLast = {};
    var preferFirst = {};
    review.ids.forEach(function (motionId) {
      totals[motionId] = (totals[motionId] || 0) + 1;
    });
    Object.keys(review.fresh || {}).forEach(function (motionId) {
      fresh[motionId] = review.fresh[motionId];
    });
    Object.keys(review.preferLast || {}).forEach(function (motionId) {
      preferLast[motionId] = review.preferLast[motionId];
    });
    Object.keys(review.preferFirst || {}).forEach(function (motionId) {
      preferFirst[motionId] = review.preferFirst[motionId];
    });
    var result = [];

    review.ids.forEach(function (motionId, index) {
      var matches = [];
      if (fresh[motionId] > 0) {
        fresh[motionId] -= 1;
      } else if (preferFirst[motionId] > 0) {
        preferFirst[motionId] -= 1;
        for (var firstIndex = 0; firstIndex < pool.length; firstIndex++) {
          if (pool[firstIndex].motionId !== motionId) continue;
          matches.push(pool.splice(firstIndex, 1)[0]);
          break;
        }
      } else if (preferLast[motionId] > 0) {
        preferLast[motionId] -= 1;
        for (var reverseIndex = pool.length - 1; reverseIndex >= 0; reverseIndex--) {
          if (pool[reverseIndex].motionId !== motionId) continue;
          matches.push(pool.splice(reverseIndex, 1)[0]);
          break;
        }
      } else {
        for (var poolIndex = 0; poolIndex < pool.length; poolIndex++) {
          if (pool[poolIndex].motionId !== motionId) continue;
          matches.push(pool.splice(poolIndex, 1)[0]);
          poolIndex -= 1;
          if (totals[motionId] > 1) break;
        }
      }
      if (!matches.length) {
        matches.push(savedInstructionEvent(motionId, actors, drill, instruction, index));
      }
      result = result.concat(matches);
    });
    return result;
  }

  function buildBeats(drill, routes, contacts, actors, instruction, operation, options) {
    options = options || {};
    var events = buildEvents(drill, routes, contacts, actors, instruction);
    var instructionIds = exactMotionIds(instruction, { drill: drill });
    if (!instructionIds.length) instructionIds = ["admin"];
    var showFullScene = options.showFullScene === true;
    var administrativeOnly = instructionIds.every(function (motionId) {
      return motionId === "admin";
    });
    var ordered = events.filter(function (event) {
      if (administrativeOnly) return false;
      return showFullScene || event.stepScoped ||
        relatedStepMechanic(event.motionId, instructionIds);
    });

    // Factual path order remains authoritative. Add only mechanics that the
    // current saved instruction explicitly names and that are not already
    // represented by a route/contact. A small canonical rank inserts those
    // body-only actions without scrambling the authored ball chain.
    instructionIds.forEach(function (motionId, instructionIndex) {
      var represented = ordered.some(function (event) { return event.motionId === motionId; });
      if (represented) return;
      var actor = actorForMotion(actors, motionId, drill, instruction);
      var supplemental = {
        key: instructionIndex + 0.5,
        source: "saved-instruction",
        motionId: motionId,
        actorId: actor ? actor.id : null,
        partnerActorId: null,
        routeId: null,
        contactId: null,
        trackId: "instruction-" + (instructionIndex + 1),
        label: MOTIONS[motionId].label,
        instructionIndex: instructionIndex,
        stepScoped: true
      };
      var rank = sequenceRank(motionId);
      var insertAt = ordered.length;
      for (var eventIndex = 0; eventIndex < ordered.length; eventIndex++) {
        if (sequenceRank(ordered[eventIndex].motionId) > rank) {
          insertAt = eventIndex;
          break;
        }
      }
      ordered.splice(insertAt, 0, supplemental);
    });

    // Reviewed cyclic instructions state their actual temporal mechanics in
    // prose. Reorder only those exact saved steps; all other scenes continue
    // to follow factual route/contact order untouched.
    ordered = applyReviewedBeatSequence(drill, instruction, ordered, actors);

    if (!ordered.length) {
      var neutralActor = actorForMotion(actors, "admin", drill, instruction);
      ordered.push({
        key: 0, source: "saved-instruction", motionId: "admin",
        actorId: neutralActor ? neutralActor.id : null, partnerActorId: null,
        routeId: null, contactId: null, trackId: "instruction-1",
        label: MOTIONS.admin.label, instructionIndex: 0, stepScoped: true
      });
    }

    var cues = list(drill && drill.cues);
    var elapsed = 0;
    var previous = null;
    var simultaneousStarts = {};
    var beats = ordered.map(function (event, index) {
      var meta = MOTIONS[event.motionId] || MOTIONS.admin;
      var group = clean(event.simultaneousGroup);
      var authoredParallel = !!(group && Object.prototype.hasOwnProperty.call(
        simultaneousStarts, group));
      var inferredParallel = operation === "parallel" && previous &&
        previous.motionId === event.motionId && previous.routeId !== event.routeId &&
        previous.actorId && event.actorId && previous.actorId !== event.actorId;
      var parallel = authoredParallel || inferredParallel;
      var startMs = authoredParallel ? simultaneousStarts[group]
        : (inferredParallel ? previous.startMs : elapsed);
      if (group && !Object.prototype.hasOwnProperty.call(simultaneousStarts, group)) {
        simultaneousStarts[group] = startMs;
      }
      var beat = {
        id: "beat-" + (index + 1),
        order: index,
        source: event.source,
        label: event.label || meta.label,
        instruction: instruction,
        cue: cues.length ? cues[Math.min(index, cues.length - 1)] : "",
        motionId: meta.id,
        motion: meta,
        actorId: event.actorId,
        partnerActorId: event.partnerActorId,
        activeActorIds: [event.actorId, event.partnerActorId].filter(function (id) { return !!id; }),
        routeId: event.routeId,
        contactId: event.contactId,
        trackId: event.trackId,
        simultaneousGroup: group,
        parallel: !!parallel,
        startMs: startMs,
        durationMs: meta.durationMs,
        endMs: startMs + meta.durationMs
      };
      if (!parallel) elapsed = beat.endMs;
      else elapsed = Math.max(elapsed, beat.endMs);
      previous = beat;
      return beat;
    });
    return { beats: beats, durationMs: Math.max(1200, elapsed + 450) };
  }

  function addActorMotions(actors, beats) {
    var byId = {};
    actors.forEach(function (actor) { byId[actor.id] = actor; });
    beats.forEach(function (beat) {
      if (!beat.actorId || !byId[beat.actorId]) return;
      if (byId[beat.actorId].motionIds.indexOf(beat.motionId) === -1) {
        byId[beat.actorId].motionIds.push(beat.motionId);
      }
    });
  }

  function validatePlan(plan) {
    var errors = [];
    var warnings = [];
    if (!plan || typeof plan !== "object") {
      return { valid: false, errors: ["Plan must be an object."], warnings: [] };
    }
    var actors = Array.isArray(plan.actors) ? plan.actors : [];
    var actorIds = {};
    actors.forEach(function (actor, index) {
      if (!actor || !clean(actor.id)) {
        errors.push("Actor " + (index + 1) + " has no stable id.");
        return;
      }
      if (actorIds[actor.id]) errors.push("Duplicate actor id: " + actor.id + ".");
      actorIds[actor.id] = true;
      if (!finite(actor.x) || !finite(actor.y)) errors.push(actor.id + " has no factual position.");
      if (!clean(actor.appearanceId)) errors.push(actor.id + " has no deterministic appearance id.");
    });
    if (plan.minimum != null) {
      var athletes = actors.filter(function (actor) { return !actor.support; }).length;
      if (athletes < plan.minimum) {
        errors.push("Only " + athletes + " athletes represent saved minimum " + plan.minimum + ".");
      }
    }
    (plan.routes || []).forEach(function (route) {
      if (route.type === "move" && (!route.actorId || !actorIds[route.actorId])) {
        errors.push(route.id + " has no unambiguous factual actor binding.");
      }
    });
    (plan.contacts || []).forEach(function (contact) {
      if ((!contact.sourceActorId || !actorIds[contact.sourceActorId]) &&
          !(contact.sourceEndpoint && contact.sourceEndpoint.type)) {
        errors.push(contact.id + " has no factual source actor.");
      }
      if ((!contact.recipientActorId || !actorIds[contact.recipientActorId]) &&
          !(contact.recipientEndpoint && contact.recipientEndpoint.type)) {
        errors.push(contact.id + " has no factual recipient actor.");
      }
      if (!MOTIONS[contact.motionId]) errors.push(contact.id + " has an unknown motion.");
      if (!contact.performerActorId || !actorIds[contact.performerActorId]) {
        errors.push(contact.id + " has no factual mechanic performer.");
      }
      if (contact.classificationSource === "factual-object-fallback") {
        warnings.push(contact.id + " uses the neutral object-contact fallback.");
      }
    });
    if (!Array.isArray(plan.beats) || !plan.beats.length) {
      errors.push("Plan has no ordered beats.");
    } else {
      plan.beats.forEach(function (beat) {
        if (!MOTIONS[beat.motionId]) errors.push(beat.id + " has an unknown motion.");
        if (!finite(beat.startMs) || !finite(beat.durationMs) || beat.durationMs <= 0) {
          errors.push(beat.id + " has invalid timing.");
        }
        if (beat.actorId && !actorIds[beat.actorId]) errors.push(beat.id + " names a missing actor.");
      });
    }
    if (!actors.length) warnings.push("No factual people were available for this scene.");
    return { valid: errors.length === 0, errors: errors, warnings: warnings };
  }

  function planFor(drill, spec, instruction, options) {
    drill = drill || {};
    spec = spec || {};
    options = options || {};
    var stepIndex = finite(options.stepIndex) ? Math.max(0, Math.floor(options.stepIndex)) : 0;
    var savedSteps = list(drill.steps);
    var savedInstruction = clean(instruction) || savedSteps[stepIndex] ||
      clean(spec.caption) || clean(drill.setup) || clean(drill.name);
    var actorModel = buildActors(drill, spec);
    var routes = buildRoutes(spec, actorModel.actors, options);
    var contacts = buildContacts(drill, spec, routes, actorModel.actors, savedInstruction);
    var timed = buildBeats(drill, routes, contacts, actorModel.actors,
      savedInstruction, actorModel.operationMode, options);
    addActorMotions(actorModel.actors, timed.beats);

    var plan = {
      id: "plan-" + slug(drill.id || drill.name) + "-" +
        (finite(options.sceneIndex) ? "scene-" + (Math.floor(options.sceneIndex) + 1) : "scene") +
        "-step-" + (stepIndex + 1),
      drillId: clean(drill.id),
      sceneIndex: finite(options.sceneIndex) ? Math.floor(options.sceneIndex) : null,
      stepIndex: stepIndex,
      instruction: savedInstruction,
      title: clean(spec.title) || "How the drill runs",
      width: finite(spec.w) && spec.w > 0 ? spec.w : 9,
      height: finite(spec.h) && spec.h > 0 ? spec.h : 10,
      minimum: actorModel.minimum,
      operationMode: actorModel.operationMode,
      actors: actorModel.actors,
      markers: actorModel.markers,
      routes: routes,
      contacts: contacts,
      beats: timed.beats,
      equipment: equipmentFor(drill),
      stagingLane: actorModel.stagingLane,
      participantSummary: {
        authoredAthletes: actorModel.authoredAthletes,
        supportPeople: actorModel.supportPeople,
        addedFromSavedMinimum: actorModel.additional,
        totalAthletes: actorModel.actors.filter(function (actor) { return !actor.support; }).length
      },
      durationMs: timed.durationMs,
      posterBeat: timed.beats.length ? Math.min(2, timed.beats.length - 1) : 0,
      grids: GRIDS
    };
    var validation = validatePlan(plan);
    plan.valid = validation.valid;
    plan.errors = validation.errors;
    plan.warnings = validation.warnings;
    return plan;
  }

  return {
    grids: GRIDS,
    motions: MOTIONS,
    motionForText: motionForText,
    planFor: planFor,
    validatePlan: validatePlan
  };
})();
