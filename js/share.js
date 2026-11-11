// share.js — Share / Print / Export a practice plan or a season/camp overview.
//
// No backend, no network at runtime: we build a clean plain-text / lightweight
// Markdown string a coach can text to themselves, hand to an assistant, or carry.
// Order of preference per action:
//   1) the native Web Share API (navigator.share) when it exists — must run
//      inside the user's click gesture, which is where we are called from;
//   2) otherwise a tiny "share-" sheet we render ourselves offering
//      "Copy to clipboard" and "Download .txt".
// printSession() builds a hidden, print-only #rr-print-area and calls
// window.print(); css/print.css reveals only that area on paper.
//
// Everything is wrapped in try/catch so a blocked or missing browser API never
// throws — we just fall back gracefully (a cancelled native share does nothing).
window.RR = window.RR || {};

RR.share = (function () {
  "use strict";

  var h = RR.ui.h;

  // ======================================================================= //
  //  SMALL HELPERS                                                          //
  // ======================================================================= //

  // Net height + ball for a team's age group (safe if RR.team is absent).
  function referenceFor(team) {
    try {
      if (team && team.ageGroup && RR.team && RR.team.referenceFor) {
        return RR.team.referenceFor(team.ageGroup);
      }
    } catch (e) { /* ignore — fall through to a neutral default */ }
    return { net: "—", ball: "—" };
  }

  // Friendly equipment label, reusing RR.ui's mapping when present.
  function equipLabel(token) {
    try {
      if (RR.ui && RR.ui.equipLabel) return RR.ui.equipLabel(token);
    } catch (e) { /* ignore */ }
    return String(token);
  }

  // Full human date ("Fri, Aug 14, 2026"), via RR.ui with a plain fallback.
  function fmtFull(iso) {
    try { if (RR.ui && RR.ui.fmtFull) return RR.ui.fmtFull(iso); }
    catch (e) { /* ignore */ }
    return iso || "";
  }
  // Short human date ("Aug 14").
  function fmtShort(iso) {
    try { if (RR.ui && RR.ui.fmtShort) return RR.ui.fmtShort(iso); }
    catch (e) { /* ignore */ }
    return iso || "";
  }

  // A polite confirmation toast (no-op if the helper is missing).
  function toast(msg) {
    try { if (RR.ui && RR.ui.confirmToast) RR.ui.confirmToast(msg); }
    catch (e) { /* ignore */ }
  }

  // Sanitize a string into a safe filename fragment: lowercase, alnum + dashes.
  function slug(s) {
    return String(s || "rallyready")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")   // non-alnum -> single dash
      .replace(/^-+|-+$/g, "")        // trim leading/trailing dashes
      .slice(0, 60) || "rallyready";
  }

  function clubOverview(session) {
    return [
      ["Before players arrive", session.setup ? [session.setup] : []],
      ["Practice targets", (session.objectives || []).map(function (target) {
        return target.label + " — " + target.target;
      })],
      ["Equipment", session.equipment || []],
      ["Adjust for your gym", (session.adaptations || []).map(function (adaptation) {
        return adaptation.label + " — " + adaptation.description;
      })]
    ].filter(function (section) { return section[1].length; });
  }

  function clubDrillDetails(drill) {
    return [["Scoring & tracking", drill.scoring], ["Make it easier", drill.easier], ["Make it harder", drill.harder]]
      .filter(function (section) { return section[1]; })
      .concat((Array.isArray(drill.coaching) ? drill.coaching : []).map(function (item) { return [item.label, item.text]; }));
  }

  var clubRomanianLabels = {
    "Skill": "Temă", "Note": "Indicație", "Focus": "Obiectiv", "min total": "min în total",
    "Before players arrive": "Înainte să vină jucătorii", "Practice targets": "Obiective măsurabile",
    "Equipment": "Echipament", "Adjust for your gym": "Adaptări pentru sală",
    "Setup": "Așezare pe teren", "Run it": "Pașii exercițiului", "Say this": "Indicații pentru jucători",
    "Scoring & tracking": "Punctaj și criterii de reușită", "Make it easier": "Variantă mai ușoară",
    "Make it harder": "Variantă mai grea", "Gear": "Echipament", "Volleyballs": "Mingi de volei",
    "Net": "Fileu", "Warm-up": "Încălzire", "Serve": "Serviciu", "Team play": "Joc de echipă",
    "Water break": "Pauză de apă", "Pressure": "Joc sub presiune", "Compete": "Joc cu punctaj",
    "Cool-down": "Revenire", "Made with RallyReady": "Creat cu RallyReady"
  };

  function labelsFor(session) {
    var ro = session.kind === "club-practice" && session.language === "ro";
    return function (label) { return ro && clubRomanianLabels[label] || label; };
  }

  function blockMinutes(block, club) {
    if (block.minutes == null) return "";
    var range = club ? block.startMinute + "–" + block.endMinute + " min · " : "";
    return " (" + range + block.minutes + " min)";
  }

  // ======================================================================= //
  //  TEXT BUILDERS — readable in a phone messages app                      //
  // ======================================================================= //

  // One practice -> plain-text / lightweight-Markdown sheet.
  function sessionText(session, team) {
    session = session || {};
    team = team || {};
    var club = session.kind === "club-practice";
    var label = labelsFor(session);
    var ref = referenceFor(team);
    var L = [];   // lines

    // Header.
    var title = club ? session.title : (team.name || "Practice plan");
    L.push("# " + title);
    if (club || team.ageGroup) L.push(club ? session.ageGroup : team.ageGroup);
    if (session.date) L.push(fmtFull(session.date));

    // Phase · day type line.
    var sub = [];
    if (session.phaseLabel) sub.push(session.phaseLabel);
    if (session.dayType) sub.push(session.dayType);
    if (sub.length) L.push(sub.join(" · "));

    if (session.skillFocus) L.push(label("Skill") + ": " + session.skillFocus);

    var meta = [];
    if (session.totalMinutes != null) meta.push(session.totalMinutes + " " + label("min total"));
    if (session.intensity != null) meta.push("Intensity " + session.intensity + "/10");
    if (meta.length) L.push(meta.join(" · "));

    if (!club) L.push("Net: " + ref.net + " · Ball: " + ref.ball);

    // Coach note + focus reminder.
    if (session.coachNote) { L.push(""); L.push(label("Note") + ": " + session.coachNote); }
    if (session.focusReminder) {
      if (!session.coachNote) L.push("");
      L.push(label("Focus") + ": " + session.focusReminder);
    }
    if (club) clubOverview(session).forEach(function (section) {
      L.push("", "## " + label(section[0]));
      section[1].forEach(function (line) { L.push("• " + line); });
    });

    // Blocks.
    var blocks = session.blocks || [];
    blocks.forEach(function (b, i) {
      b = b || {};
      var drill = b.drill || {};
      L.push("");
      L.push("---");
      var roleBit = b.role ? "[" + label(b.role) + "] " : "";
      var minBit = blockMinutes(b, club);
      L.push((i + 1) + ". " + roleBit + (b.title || drill.name || "Block") + minBit);
      if (b.why) L.push(b.why);

      if (drill.setup) { L.push(""); L.push(label("Setup") + ": " + drill.setup); }

      var steps = drill.steps || [];
      if (steps.length) {
        L.push("");
        L.push(label("Run it") + ":");
        steps.forEach(function (s, si) { L.push("  " + (si + 1) + ". " + s); });
      }

      var cues = drill.cues || [];
      if (cues.length) {
        L.push("");
        L.push(label("Say this") + ":");
        cues.forEach(function (c) { L.push("  • " + c); });
      }

      if (club) clubDrillDetails(drill).forEach(function (section) {
        L.push(label(section[0]) + ": " + section[1]);
      });

      var gear = drill.equipment || [];
      if (gear.length) {
        L.push(label("Gear") + ": " + gear.map(equipLabel).map(label).join(", "));
      }

      if (drill.videoSearchUrl) L.push("Watch: " + drill.videoSearchUrl);
    });

    L.push("");
    L.push("— " + label("Made with RallyReady"));
    return L.join("\n");
  }

  // Whole season/camp -> plain-text overview.
  function seasonText(plan, team) {
    plan = plan || {};
    team = team || {};
    var L = [];

    var title = (team.name || "Plan");
    L.push("# " + title + (plan.label ? " — " + plan.label : ""));
    if (team.ageGroup) L.push(team.ageGroup);

    if (plan.startDate || plan.endDate) {
      L.push(fmtFull(plan.startDate) + " – " + fmtFull(plan.endDate));
    }
    var span = [];
    if (plan.type) span.push(plan.type === "camp" ? "Camp" : "Season");
    if (plan.lengthDays != null) span.push(plan.lengthDays + " days");
    if (plan.prepWeeks != null) span.push(plan.prepWeeks + " prep weeks");
    if (span.length) L.push(span.join(" · "));

    // One line per phase.
    var phases = plan.phases || [];
    if (phases.length) {
      L.push("");
      L.push("## Phases");
      phases.forEach(function (p) {
        p = p || {};
        var range = fmtShort(p.startDate) + "–" + fmtShort(p.endDate);
        var parts = [p.label || p.key || "Phase", range];
        if (p.targetIntensity != null) parts.push(p.targetIntensity + "/10");
        if (p.focusSummary) parts.push(p.focusSummary);
        L.push("• " + parts.join(" · "));
      });
    }

    // Games, if any.
    var games = plan.games || [];
    if (games.length) {
      L.push("");
      L.push("## Games");
      games.forEach(function (g) {
        g = g || {};
        L.push("• " + fmtShort(g.date) + " — " + (g.opponent || "TBD"));
      });
    }

    L.push("");
    L.push("— Made with RallyReady");
    return L.join("\n");
  }

  // ======================================================================= //
  //  EXPORT ACTIONS — copy / download                                      //
  // ======================================================================= //

  // Copy text to the clipboard, with a hidden-textarea fallback for browsers
  // (or contexts) where the async Clipboard API is unavailable or blocked.
  function copyText(text) {
    // Preferred path: async Clipboard API.
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          toast("Copied to clipboard");
        }, function () {
          legacyCopy(text);
        });
        return;
      }
    } catch (e) { /* fall through to legacy */ }
    legacyCopy(text);
  }

  // execCommand("copy") fallback via an off-screen textarea.
  function legacyCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      toast(ok ? "Copied to clipboard" : "Couldn't copy — try Download");
    } catch (e) {
      toast("Couldn't copy — try Download");
    }
  }

  // Download text as a .txt file via a Blob + temporary object URL + <a download>.
  function downloadText(text, filename) {
    try {
      var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = h("a", { href: url, download: filename });
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoke a tick later so the download has a chance to start.
      setTimeout(function () { try { URL.revokeObjectURL(url); } catch (e) {} }, 1500);
      toast("Saved " + filename);
    } catch (e) {
      toast("Couldn't save the file");
    }
  }

  // ======================================================================= //
  //  THE "share-" SHEET (fallback chooser)                                 //
  // ======================================================================= //

  var openSheet = null;   // the currently-open sheet node, if any

  // We render the chooser in our own files only, so it can't rely on the app's
  // screen stylesheet — give it self-contained inline styles. (print.css is for
  // print only.) Kept minimal and theme-neutral so it reads in light or dark.
  function styleSheetNode(scrim, panel) {
    scrim.style.cssText =
      "position:fixed;inset:0;background:rgba(20,28,46,0.45);" +
      "opacity:0;transition:opacity .18s ease;";
    panel.style.cssText =
      "position:fixed;left:50%;bottom:0;transform:translate(-50%,12px);" +
      "width:100%;max-width:440px;box-sizing:border-box;" +
      "background:#fff;color:#1b2a4a;" +
      "border-radius:16px 16px 0 0;padding:14px 16px 22px;" +
      "box-shadow:0 -8px 28px rgba(20,28,46,0.22);" +
      "opacity:0;transition:transform .2s ease,opacity .2s ease;";
  }

  // Tear down any open sheet (and its key/scroll listeners).
  function closeSheet() {
    if (!openSheet) return;
    try {
      document.removeEventListener("keydown", openSheet._onKey, true);
      if (openSheet.parentNode) openSheet.parentNode.removeChild(openSheet);
      if (openSheet._opener && openSheet._opener.isConnected) openSheet._opener.focus({ preventScroll: true });
    } catch (e) { /* ignore */ }
    openSheet = null;
  }

  // Render the bottom sheet offering Copy / Download. `text`, `filename`, and a
  // human `label` ("practice" / "plan") for the heading.
  function showSheet(text, filename, label) {
    closeSheet();   // never stack two sheets

    var actionCss =
      "display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;" +
      "margin-top:8px;padding:13px 14px;border:1px solid #e2e6ef;border-radius:12px;" +
      "background:#f6f7fb;color:#1b2a4a;font:inherit;font-size:15px;font-weight:600;" +
      "text-align:left;cursor:pointer;";

    var copyBtn = h("button", {
      type: "button", class: "share-action",
      onClick: function () { copyText(text); closeSheet(); }
    }, [
      h("span", { class: "share-action__icon", "aria-hidden": "true",
        html: RR.ui.icon('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>', 18) }),
      h("span", { class: "share-action__label", text: "Copy to clipboard" })
    ]);
    copyBtn.style.cssText = actionCss;

    var dlBtn = h("button", {
      type: "button", class: "share-action",
      onClick: function () { downloadText(text, filename); closeSheet(); }
    }, [
      h("span", { class: "share-action__icon", "aria-hidden": "true",
        html: RR.ui.icon('<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 21h14"/>', 18) }),
      h("span", { class: "share-action__label", text: "Download .txt" })
    ]);
    dlBtn.style.cssText = actionCss;

    var cancelBtn = h("button", {
      type: "button", class: "share-action share-action--ghost",
      text: "Cancel", onClick: closeSheet
    });
    cancelBtn.style.cssText = actionCss +
      "justify-content:center;background:transparent;border-color:transparent;color:#5a6680;";

    var panel = h("div", {
      class: "share-sheet__panel", role: "dialog", "aria-modal": "true",
      "aria-label": "Share " + (label || "plan")
    }, [
      h("div", { class: "share-sheet__grip", "aria-hidden": "true" }),
      h("h2", { class: "share-sheet__title", text: "Share this " + (label || "plan") }),
      copyBtn,
      dlBtn,
      cancelBtn
    ]);
    panel.querySelector(".share-sheet__grip").style.cssText =
      "width:36px;height:4px;border-radius:999px;background:#cfd5e2;margin:2px auto 12px;";
    panel.querySelector(".share-sheet__title").style.cssText =
      "margin:0 0 4px;font-size:17px;font-weight:700;color:#1b2a4a;";

    var scrim = h("div", { class: "share-sheet__scrim", onClick: closeSheet });
    var sheet = h("div", { class: "share-sheet" }, [scrim, panel]);
    sheet.style.cssText = "position:fixed;inset:0;z-index:9999;";
    styleSheetNode(scrim, panel);

    sheet._opener = document.activeElement;
    sheet._onKey = function (e) {
      if (e.key === "Escape") closeSheet();
      if (e.key === "Tab" && e.shiftKey && document.activeElement === copyBtn) {
        e.preventDefault();
        cancelBtn.focus();
      } else if (e.key === "Tab" && !e.shiftKey && document.activeElement === cancelBtn) {
        e.preventDefault();
        copyBtn.focus();
      }
    };
    document.addEventListener("keydown", sheet._onKey, true);

    document.body.appendChild(sheet);
    openSheet = sheet;
    copyBtn.focus();
    // Animate in on the next frame (toggle the inline opacity/transform).
    requestAnimationFrame(function () {
      scrim.style.opacity = "1";
      panel.style.opacity = "1";
      panel.style.transform = "translate(-50%,0)";
    });
  }

  // ======================================================================= //
  //  SHARE ENTRY POINTS                                                     //
  // ======================================================================= //

  // Try native share first (inside the click gesture). Returns true if we kicked
  // off a native share; false if it's unavailable so the caller shows the sheet.
  function tryNativeShare(title, text, fallback) {
    try {
      if (navigator.share) {
        navigator.share({ title: title, text: text }).then(function () {
          toast("Shared");
        }, function (error) {
          if (fallback && (!error || error.name !== "AbortError")) fallback();
        });
        return true;
      }
    } catch (e) { /* fall through to the sheet */ }
    return false;
  }

  // PUBLIC: share/export ONE practice.
  function shareSession(session, team) {
    try {
      var text = sessionText(session, team);
      var club = session && session.kind === "club-practice";
      var title = club ? session.title : (team && team.name ? team.name + " — " : "") +
        "Practice" + (session && session.date ? " " + fmtShort(session.date) : "");
      var fname = club ? "rallyready-" + slug(session.ageGroup + "-" + session.title) + ".txt" :
        "rallyready-" + slug(team && team.name) +
        "-" + slug((session && session.date) || "practice") + ".txt";
      var fallback = function () { showSheet(text, fname, "practice"); };
      if (!tryNativeShare(title, text, club ? fallback : null)) fallback();
    } catch (e) {
      toast("Couldn't prepare the share");
    }
  }

  // PUBLIC: share/export the whole season/camp overview.
  function shareSeason(plan, team) {
    try {
      var text = seasonText(plan, team);
      var title = (team && team.name ? team.name + " — " : "") +
        (plan && plan.label ? plan.label : "Plan");
      if (tryNativeShare(title, text)) return;
      var fname = "rallyready-" + slug(team && team.name) +
        "-" + slug((plan && plan.label) || (plan && plan.type) || "plan") + ".txt";
      showSheet(text, fname, "plan");
    } catch (e) {
      toast("Couldn't prepare the share");
    }
  }

  // ======================================================================= //
  //  PRINT — hidden, print-only #rr-print-area + window.print()            //
  // ======================================================================= //

  // Build the structured print DOM for one session. print.css reveals only this.
  function buildPrintArea(session, team) {
    session = session || {};
    team = team || {};
    var club = session.kind === "club-practice";
    var label = labelsFor(session);
    var ref = referenceFor(team);

    var kids = [];

    // Header.
    kids.push(h("h1", { class: "rr-print-title", text: club ? session.title : (team.name || "Practice plan") }));

    var headBits = [];
    if (club || team.ageGroup) headBits.push(club ? session.ageGroup : team.ageGroup);
    if (session.date) headBits.push(fmtFull(session.date));
    var sub = [];
    if (session.phaseLabel) sub.push(session.phaseLabel);
    if (session.dayType) sub.push(session.dayType);
    if (sub.length) headBits.push(sub.join(" · "));
    kids.push(h("p", { class: "rr-print-sub", text: headBits.join("  ·  ") }));

    var meta = [];
    if (session.skillFocus) meta.push(label("Skill") + ": " + session.skillFocus);
    if (session.totalMinutes != null) meta.push(session.totalMinutes + " " + label("min total"));
    if (session.intensity != null) meta.push("Intensity " + session.intensity + "/10");
    if (!club) {
      meta.push("Net: " + ref.net);
      meta.push("Ball: " + ref.ball);
    }
    kids.push(h("p", { class: "rr-print-meta", text: meta.join("  ·  ") }));

    if (session.coachNote) {
      kids.push(h("p", { class: "rr-print-note" }, [
        h("strong", { text: label("Note") + ": " }), session.coachNote
      ]));
    }
    if (session.focusReminder) {
      kids.push(h("p", { class: "rr-print-note" }, [
        h("strong", { text: label("Focus") + ": " }), session.focusReminder
      ]));
    }
    if (club) clubOverview(session).forEach(function (section) {
      kids.push(h("div", { class: "rr-print-overview" }, [
        h("h2", { class: "rr-print-label", text: label(section[0]) }),
        h("ul", { class: "rr-print-cues" }, section[1].map(function (line) {
          return h("li", { text: line });
        }))
      ]));
    });

    // Blocks.
    var blocks = session.blocks || [];
    blocks.forEach(function (b, i) {
      b = b || {};
      var drill = b.drill || {};
      var bodyKids = [];

      var roleBit = b.role ? "[" + label(b.role) + "] " : "";
      var minBit = blockMinutes(b, club);
      bodyKids.push(h("h2", { class: "rr-print-block__title",
        text: (i + 1) + ". " + roleBit + (b.title || drill.name || "Block") + minBit }));

      if (b.why) bodyKids.push(h("p", { class: "rr-print-why", text: b.why }));

      var court = club && RR.clubPracticeCourt ? RR.clubPracticeCourt.figure(session, b, session.language) : null;
      if (court) bodyKids.push(court);

      if (drill.setup) {
        bodyKids.push(h("p", { class: "rr-print-setup" }, [
          h("strong", { text: label("Setup") + ": " }), drill.setup
        ]));
      }

      var steps = drill.steps || [];
      if (steps.length) {
        bodyKids.push(h("p", { class: "rr-print-label", text: label("Run it") }));
        bodyKids.push(h("ol", { class: "rr-print-steps" },
          steps.map(function (s) { return h("li", { text: s }); })));
      }

      var cues = drill.cues || [];
      if (cues.length) {
        bodyKids.push(h("p", { class: "rr-print-label", text: label("Say this") }));
        bodyKids.push(h("ul", { class: "rr-print-cues" },
          cues.map(function (c) { return h("li", { text: c }); })));
      }

      if (club) clubDrillDetails(drill).forEach(function (section) {
        bodyKids.push(h("p", { class: "rr-print-note" }, [
          h("strong", { text: label(section[0]) + ": " }), section[1]
        ]));
      });

      var gear = drill.equipment || [];
      if (gear.length) {
        bodyKids.push(h("p", { class: "rr-print-gear" }, [
          h("strong", { text: label("Gear") + ": " }), gear.map(equipLabel).map(label).join(", ")
        ]));
      }

      if (drill.videoSearchUrl) {
        bodyKids.push(h("p", { class: "rr-print-watch",
          text: "Watch: " + drill.videoSearchUrl }));
      }

      kids.push(h("section", { class: "rr-print-block" }, bodyKids));
    });

    kids.push(h("p", { class: "rr-print-foot", text: label("Made with RallyReady") }));

    return h("div", { id: "rr-print-area", class: club ? "rr-print-club" : null, lang: session.language }, kids);
  }

  // PUBLIC: register (or clear) the practice that printing should produce.
  // The Today screen calls this whenever it paints, so a clean #rr-print-area is
  // always resident (kept invisible on screen by print.css) while a practice is
  // shown. Keeping it in the DOM — rather than injecting it for a split second
  // around the in-app button — means EVERY way of printing produces the carry
  // sheet: the button, Ctrl/Cmd+P, and a phone's browser "Save as PDF". Pass a
  // falsy session to remove it (e.g. on a rest day or when leaving the screen).
  function setPrintable(session, team) {
    var stale = document.getElementById("rr-print-area");
    if (stale && stale.parentNode) stale.parentNode.removeChild(stale);
    if (!session) return;
    document.body.appendChild(buildPrintArea(session, team));
  }

  // PUBLIC: drop any registered sheet (the router calls this on navigation so a
  // stale sheet never prints from another screen).
  function clearPrintable() { setPrintable(null); }

  // PUBLIC: print just one practice (the in-app Print button). Ensures the sheet
  // is current, then opens the browser print dialog.
  function printSession(session, team) {
    try {
      setPrintable(session, team);
      window.print();
    } catch (e) {
      toast("Couldn't open the print view");
    }
  }

  return {
    session: shareSession,
    season: shareSeason,
    printSession: printSession,
    setPrintable: setPrintable,
    clearPrintable: clearPrintable
  };
})();
