// Top-down court maps for one representative group or rally in a club practice.
window.RR = window.RR || {};

RR.clubPracticeCourt = (function () {
  "use strict";

  var SVG = "http://www.w3.org/2000/svg";
  var serial = 0;
  var roles = {
    partner: { en: ["A", "Partner A"], ro: ["A", "Jucător A"] },
    partnerB: { en: ["B", "Partner B"], ro: ["B", "Jucător B"] },
    feed: { en: ["F", "Feeder"], ro: ["L", "Lansează mingea"] },
    feedDefense: { en: ["F", "Feeder / defender"], ro: ["L", "Lansează / apără"] },
    server: { en: ["SE", "Server"], ro: ["S", "La serviciu"] },
    pass: { en: ["P", "Passer"], ro: ["P", "La preluare"] },
    passTwo: { en: ["P2", "Second passer"], ro: ["P2", "Al doilea la preluare"] },
    setter: { en: ["S", "Setter"], ro: ["R", "Ridicător"] },
    hitter: { en: ["H", "Hitter"], ro: ["A", "Atacant"] },
    defense: { en: ["D", "Defender"], ro: ["D", "Apărător"] },
    block: { en: ["B", "Blocker"], ro: ["B", "La blocaj"] },
    cover: { en: ["C", "Attack cover"], ro: ["DB", "La dublaj"] },
    target: { en: ["T", "Pass target"], ro: ["Ț", "Țintă la preluare"] },
    open: { en: ["X", "Open space"], ro: ["X", "Zonă liberă"] }
  };
  var actions = {
    toss: { en: "Toss", ro: "Aruncare" },
    serve: { en: "Serve", ro: "Serviciu" },
    pass: { en: "Pass", ro: "Preluare" },
    set: { en: "Set", ro: "Ridicare" },
    attack: { en: "Attack", ro: "Atac" },
    dig: { en: "Dig", ro: "Preluare din atac" },
    over: { en: "Send over", ro: "Peste fileu" },
    free: { en: "Free ball", ro: "Minge ușoară" }
  };
  var captions = {
    pair: { en: "One pair shown.", ro: "Exemplu cu o pereche." },
    lane: { en: "One group shown.", ro: "Exemplu cu o grupă." },
    rally: { en: "First ball shown.", ro: "Traseul primei mingi." },
    short: { en: "The short ball is shown.", ro: "Traseul mingii scurte." },
    moveUp: { en: "P2 moves up for the third touch.", ro: "P2 vine în față pentru a treia atingere." },
    deep: { en: "Example: attack the deep corner.", ro: "Exemplu: atac în colțul din spate." },
    line: { en: "The blocker takes the line. The defender covers the diagonal.", ro: "Blocajul acoperă linia. Apărătorul acoperă diagonala." }
  };

  function player(role, x, y, side) {
    return { role: role, x: x, y: y, side: side };
  }

  function entry(kind, ageGroup) {
    var y = kind === "serve" ? (ageGroup === "13U" ? 69 : 18) : 51;
    return player(kind === "serve" ? "server" : kind === "attack" ? "hitter" : "feed", 188, y, "far");
  }

  function warmUp() {
    return {
      caption: "pair",
      players: [player("partner", 94, 58, "far"), player("partnerB", 210, 151, "near")],
      paths: [[0, 1, "toss", -0.18], [1, 0, "pass", -0.18]]
    };
  }

  function passToTarget(kind, ageGroup) {
    return {
      caption: "lane",
      players: [entry(kind, ageGroup), player("pass", 108, 163, "near"), player("target", 210, 121, "target")],
      paths: [[0, 1, kind], [1, 2, "pass"]]
    };
  }

  function buildRally(kind, ageGroup, lastAction, options) {
    options = options || {};
    var starts = entry(kind, ageGroup);
    starts.x = 235;
    if (options.feedDefense) starts.role = "feedDefense";
    var participants = [
      starts,
      player(kind === "attack" ? "defense" : "pass", options.shortFeed ? 213 : 190, options.shortFeed ? 142 : 165, "near"),
      player("setter", 164, 126, "near"),
      player("hitter", 74, options.offNet ? 132 : 117, "near"),
      player("open", 53, 49, "target")
    ];
    if (options.cover) participants.push(player("cover", 56, 150, "near"));
    return {
      caption: options.deep ? "deep" : options.caption || "rally",
      players: participants,
      paths: [[0, 1, kind], [1, 2, kind === "attack" ? "dig" : "pass"], [2, 3, "set"], [3, 4, lastAction]]
    };
  }

  function threeTouchLink(ageGroup) {
    var spec = buildRally("toss", ageGroup, "over", { caption: "moveUp" });
    spec.players[3].role = "passTwo";
    spec.players.push(player("passTwo", 58, 161, "ghost"));
    spec.movements = [[5, 3]];
    return spec;
  }

  function blockAndDig() {
    return {
      caption: "line",
      players: [
        player("setter", 211, 63, "far"), player("hitter", 78, 63, "far"),
        player("block", 78, 117, "near"), player("defense", 184, 165, "near"),
        player("target", 242, 121, "target")
      ],
      paths: [[0, 1, "set"], [1, 3, "attack"], [3, 4, "dig"]]
    };
  }

  function courtSpec(plan, block) {
    var key = block.blockKey;
    var theme = plan.themeKey;
    var group = plan.ageGroup;
    if (key === "warm-up") return warmUp();
    if (key === "serve-prep") return passToTarget("serve", group);
    if (key === "match-finish") return buildRally("serve", group, "attack");
    if (["build", "link", "pressure", "game"].indexOf(key) === -1) return null;

    switch (theme) {
      case "first-contact":
        if (key === "build") return passToTarget("toss", group);
        if (key === "link") return threeTouchLink(group);
        if (key === "pressure") return buildRally("free", group, "over", { caption: "short", shortFeed: true });
        return buildRally("serve", group, "over");
      case "side-out":
        if (key === "build") return passToTarget("serve", group);
        return buildRally("serve", group, "attack");
      case "attack-choice":
        return buildRally(key === "game" ? "serve" : "free", group, "attack", {
          deep: true, cover: key !== "build" && group !== "13U", feedDefense: key === "build", offNet: key === "pressure"
        });
      case "transition":
        return buildRally("attack", group, group === "13U" ? "over" : "attack");
      case "setting":
        return buildRally(key === "build" || key === "pressure" ? "toss" : "serve", group, "over");
      case "block-defense":
        return blockAndDig();
      default:
        return null;
    }
  }

  function svgNode(tag, attributes, value) {
    var node = document.createElementNS(SVG, tag);
    Object.keys(attributes).forEach(function (key) { node.setAttribute(key, attributes[key]); });
    if (value != null) node.textContent = value;
    return node;
  }

  function line(x1, y1, x2, y2, className) {
    return svgNode("line", { x1: x1, y1: y1, x2: x2, y2: y2, class: className });
  }

  function svgLabel(value, x, y, className) {
    return svgNode("text", { x: x, y: y, class: className, "text-anchor": "middle", "dominant-baseline": "central" }, value);
  }

  function addCourt(board, net) {
    board.appendChild(svgNode("rect", { x: 23, y: 28, width: 257, height: 154, rx: 5, class: "cp-map-floor" }));
    board.appendChild(svgNode("path", { d: "M23 105H280V177Q280 182 275 182H28Q23 182 23 177Z", class: "cp-map-half" }));
    board.appendChild(line(23, 79, 280, 79, "cp-map-attack-line"));
    board.appendChild(line(23, 131, 280, 131, "cp-map-attack-line"));
    board.appendChild(line(18, 105, 286, 105, "cp-map-net"));
    [18, 286].forEach(function (x) {
      board.appendChild(svgNode("circle", { cx: x, cy: 105, r: 2.8, class: "cp-map-net-post" }));
    });
    board.appendChild(svgNode("rect", { x: 267, y: 96, width: 41, height: 18, rx: 4, class: "cp-map-net-tag" }));
    board.appendChild(svgLabel(net, 287, 104.5, "cp-map-net-label"));
  }

  function addArrow(board, from, to, bend, marker, className) {
    var dx = to.x - from.x;
    var dy = to.y - from.y;
    var length = Math.hypot(dx, dy);
    var sx = from.x + dx * 15 / length;
    var sy = from.y + dy * 15 / length;
    var ex = to.x - dx * 16 / length;
    var ey = to.y - dy * 16 / length;
    var mx = (sx + ex) / 2 + (bend || 0) * dy;
    var my = (sy + ey) / 2 - (bend || 0) * dx;
    board.appendChild(svgNode("path", {
      d: "M" + sx + " " + sy + "Q" + mx + " " + my + " " + ex + " " + ey,
      class: className, "marker-end": "url(#" + marker + ")"
    }));
    return [(sx + ex + 2 * mx) / 4, (sy + ey + 2 * my) / 4];
  }

  function renderBoard(spec, lang, id, accessibleTitle) {
    var board = svgNode("svg", {
      class: "cp-court-map__board", viewBox: "0 0 312 194", role: "img",
      "aria-labelledby": id + "-title " + id + "-desc", focusable: "false"
    });
    var arrows = id + "-arrow";
    var descriptions = spec.paths.map(function (path, index) {
      var from = roles[spec.players[path[0]].role][lang][1];
      var to = roles[spec.players[path[1]].role][lang][1];
      return (index + 1) + ". " + actions[path[2]][lang] + " (" + from + " → " + to + ").";
    });
    board.appendChild(svgNode("title", { id: id + "-title" }, accessibleTitle));
    board.appendChild(svgNode("desc", { id: id + "-desc" }, descriptions.join(" ")));

    var defs = svgNode("defs", {});
    function addMarker(markerId, className) {
      var marker = svgNode("marker", { id: markerId, viewBox: "0 0 9 8", refX: 8, refY: 4, markerWidth: 5, markerHeight: 5, orient: "auto" });
      marker.appendChild(svgNode("path", { d: "M0 0L9 4L0 8Z", class: className }));
      defs.appendChild(marker);
    }
    addMarker(arrows, "cp-map-arrow");
    if (spec.movements) addMarker(arrows + "-move", "cp-map-move-arrow");
    board.appendChild(defs);
    addCourt(board, lang === "ro" ? "Fileu" : "Net");

    (spec.movements || []).forEach(function (path) {
      addArrow(board, spec.players[path[0]], spec.players[path[1]], 0, arrows + "-move", "cp-map-move");
    });

    var positions = spec.paths.map(function (path) {
      return addArrow(board, spec.players[path[0]], spec.players[path[1]], path[3], arrows, "cp-map-flight");
    });
    positions.forEach(function (position, index) {
      board.appendChild(svgNode("circle", { cx: position[0], cy: position[1], r: 8, class: "cp-map-index" }));
      board.appendChild(svgLabel(index + 1, position[0], position[1] - 0.25, "cp-map-index-label"));
    });
    spec.players.forEach(function (spot) {
      board.appendChild(svgNode("circle", { cx: spot.x, cy: spot.y, r: 12.5, class: "cp-map-player cp-map-player--" + spot.side }));
      board.appendChild(svgLabel(roles[spot.role][lang][0], spot.x, spot.y - 0.25, "cp-map-player-label"));
    });
    return board;
  }

  function htmlNode(tag, className, content) {
    var node = document.createElement(tag);
    node.className = className;
    if (content != null) node.textContent = content;
    return node;
  }

  function figure(plan, block, language) {
    if (!plan || !block) return null;
    var spec = courtSpec(plan, block);
    if (!spec) return null;
    var lang = language === "ro" ? "ro" : "en";
    var id = "cp-map-" + (++serial);
    var label = lang === "ro" ? "Schița terenului" : "Court map";
    var root = htmlNode("figure", "cp-court-map");
    root.setAttribute("data-no-i18n", "");
    root.setAttribute("lang", lang);
    var caption = htmlNode("figcaption", "cp-court-map__caption");
    caption.appendChild(htmlNode("strong", "cp-court-map__title", label));
    caption.appendChild(htmlNode("span", "cp-court-map__note", captions[spec.caption][lang]));
    root.appendChild(caption);
    root.appendChild(renderBoard(spec, lang, id, label + ". " + captions[spec.caption][lang]));

    var legend = htmlNode("ul", "cp-court-map__legend");
    var listedRoles = new Set();
    spec.players.forEach(function (spot) {
      if (listedRoles.has(spot.role)) return;
      listedRoles.add(spot.role);
      var role = roles[spot.role][lang];
      var item = htmlNode("li", "cp-court-map__role");
      var chip = htmlNode("span", "cp-map-chip cp-map-chip--" + spot.side, role[0]);
      chip.setAttribute("aria-hidden", "true");
      item.appendChild(chip);
      item.appendChild(htmlNode("span", "cp-map-role-label", role[1]));
      legend.appendChild(item);
    });
    root.appendChild(legend);

    var sequence = htmlNode("ol", "cp-court-map__sequence");
    sequence.setAttribute("aria-label", lang === "ro" ? "Traseul mingii" : "Ball path");
    spec.paths.forEach(function (path, index) {
      var step = htmlNode("li", "cp-court-map__step");
      var number = htmlNode("span", "cp-map-number", index + 1);
      number.setAttribute("aria-hidden", "true");
      step.appendChild(number);
      step.appendChild(htmlNode("span", "cp-map-action-label", actions[path[2]][lang]));
      sequence.appendChild(step);
    });
    root.appendChild(sequence);
    return root;
  }

  return { figure: figure };
})();
