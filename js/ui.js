// ui.js — shared render helpers used across screens (RR.ui): tiny DOM builders,
// intensity dots, phase badges, external "Watch how" links, date formatting, and
// a celebratory toast. Screens stay lean by composing these instead of repeating
// markup. PURE presentation only — no planning logic, no persistence.
//
// All colours come from semantic tokens, except the fixed intensity hues
// (--i-easy/mid/hard/taper via the .badge--*/.dot--* classes) which always carry
// navy text, so everything reads correctly in BOTH light and dark themes.
window.RR = window.RR || {};

RR.ui = (function () {
  "use strict";

  // ---- Tiny hyperscript: h("div", {class:"x", onclick:fn}, [children]) -------
  // Mirrors the helper used in team.js / season.js, centralised here so new
  // screens share one implementation.
  function h(tag, props, kids) {
    var node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v == null || v === false) return;
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else if (k === "html") node.innerHTML = v;
        else if (k.slice(0, 2) === "on" && typeof v === "function") {
          node.addEventListener(k.slice(2).toLowerCase(), v);
        } else {
          node.setAttribute(k, v === true ? "" : v);
        }
      });
    }
    append(node, kids);
    return node;
  }

  function append(node, kids) {
    if (kids == null) return;
    if (Array.isArray(kids)) { kids.forEach(function (k) { append(node, k); }); }
    else if (kids instanceof Node) { node.appendChild(kids); }
    else { node.appendChild(document.createTextNode(String(kids))); }
  }

  // ---- Intensity dots — N filled out of `max`, coloured by phase hue ---------
  // The dots are decorative (aria-hidden); the visible "N / 10" text beside them
  // carries the meaning, so nothing rests on colour alone.
  function dots(n, color, max) {
    max = max || 10;
    var wrap = h("div", { class: "dots", "aria-hidden": "true" });
    for (var i = 1; i <= max; i++) {
      wrap.appendChild(h("span", {
        class: "dot " + (i <= n ? "dot--on dot--" + color : "dot--off")
      }));
    }
    return wrap;
  }

  // ---- Phase / category badge — fixed intensity hue with navy text -----------
  function badge(text, color) {
    return h("span", { class: "badge" + (color ? " badge--" + color : ""), text: text });
  }

  // ---- External reference link (RallyReady E) -------------------------------
  // Opens in a new tab with rel="noopener". Opening it is a user action, not a
  // runtime network call, so it never violates the offline rule.
  function watchLink(url, label) {
    return h("a", {
      class: "watch", href: url, target: "_blank", rel: "noopener"
    }, [
      h("span", { class: "watch__icon", "aria-hidden": "true",
        html: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' }),
      h("span", { text: label || "Watch how" })
    ]);
  }

  // ---- Date formatting (display only) ---------------------------------------
  function parseISO(iso) {
    if (!iso) return null;
    var p = String(iso).split("-");
    return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null;
  }
  function fmtFull(iso) {   // "Fri, Aug 14, 2026"
    var d = parseISO(iso);
    return d ? d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "";
  }
  function fmtShort(iso) {  // "Aug 14"
    var d = parseISO(iso);
    return d ? d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";
  }

  // ---- Celebratory toast -----------------------------------------------------
  // A polite live-region message that fades in then auto-dismisses. One shared
  // node is reused so repeated calls don't stack up.
  var toastNode = null, toastTimer = null;
  function confirmToast(message) {
    if (!toastNode) {
      toastNode = h("div", { class: "rr-toast", role: "status", "aria-live": "polite" });
      document.body.appendChild(toastNode);
    }
    toastNode.textContent = message;
    // Force a reflow so re-triggering restarts the transition reliably.
    void toastNode.offsetWidth;
    toastNode.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastNode.classList.remove("is-show"); }, 2600);
  }

  return {
    h: h,
    append: append,
    dots: dots,
    badge: badge,
    watchLink: watchLink,
    fmtFull: fmtFull,
    fmtShort: fmtShort,
    confirmToast: confirmToast
  };
})();
