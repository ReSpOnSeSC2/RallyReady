// players-ui.js — the Players tab (RR.players).
//
// The squad at a glance: a grid of player cards (photo or initials avatar, name,
// number, position), an add-a-player form with optional photo, and quick links
// into Position coaching and the Lineup builder. Tapping a card opens that
// player's 1-on-1 profile (js/player-profile.js). All player data flows through
// RR.roster; photos through RR.photos (a separate localStorage store). This file
// also owns the small photo PICKER + CROPPER, exposed for the profile to reuse.
//
// Every colour is a semantic token (or the fixed avatar/skill hues that always
// carry navy text), so it reads correctly in both light and dark themes.
window.RR = window.RR || {};

RR.players = (function () {
  "use strict";

  var ui = RR.ui;
  var h = ui.h;

  // View mode persists across route changes within a session.
  var groupBy = "number";   // "number" | "position"

  // ======================================================================= //
  //  Screen                                                                 //
  // ======================================================================= //
  function render(host) {
    // Gate: a team must exist before there's a squad to manage.
    if (!(RR.team && RR.team.isSetUp && RR.team.isSetUp())) {
      host.appendChild(ui.emptyState({
        title: "Set up a team first",
        blurb: "Create your team on the Teams tab, then build your squad here.",
        btnLabel: "Go to Teams",
        hash: "#team"
      }));
      return;
    }

    host.appendChild(h("p", { class: "screen-sub",
      text: "Your squad — tap a player for 1-on-1 coaching: notes, goals, skills and attendance." }));

    // Quick links to the position tools (kept out of the tab bar to avoid clutter).
    host.appendChild(h("div", { class: "pl-quick" }, [
      quickLink("#positions", "Position coaching",
        '<path d="M12 3l2.3 5 5.2.5-3.9 3.5 1.2 5.2L12 19.8 7.2 22.7l1.2-5.2L4.5 8.5 9.7 8z"/>'),
      quickLink("#lineup", "Build lineup",
        '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 12h16M9 3v18"/>')
    ]));

    host.appendChild(buildAddCard(host));
    host.appendChild(buildSquadCard(host));
  }

  function refresh(host) {
    host.innerHTML = "";
    // Re-mount the screen title (the router owns it, so rebuild just our body).
    render(host);
  }

  function quickLink(hash, label, iconPath) {
    return h("a", { class: "btn btn-ghost pl-quick__btn", href: hash }, [
      h("span", { class: "btn__icon", "aria-hidden": "true", html: ui.icon(iconPath, 18) }),
      label
    ]);
  }

  // ---- Add-player form ------------------------------------------------------
  function buildAddCard(host) {
    var pendingPhoto = null;   // data URL chosen before the player has an id

    var nameInput = h("input", {
      type: "text", class: "input", id: "pl-add-name",
      placeholder: "Player name", autocomplete: "off", "aria-label": "Player name"
    });
    var numberInput = h("input", {
      type: "text", class: "input", inputmode: "numeric", maxlength: "3",
      placeholder: "No.", "aria-label": "Jersey number (optional)"
    });
    numberInput.addEventListener("input", function () {
      var cleaned = RR.roster.cleanNumber(numberInput.value);
      if (cleaned !== numberInput.value) numberInput.value = cleaned;
    });
    var positionSelect = RR.roster.positionSelect("");

    // Photo control: a tappable avatar that picks + crops an image.
    var avatarWrap = h("span", { class: "pl-add__avatar" });
    function paintAvatar() {
      avatarWrap.innerHTML = "";
      var node;
      if (pendingPhoto) {
        node = h("img", { class: "pl-avatar pl-avatar--photo", src: pendingPhoto, alt: "", "aria-hidden": "true" });
      } else {
        node = h("span", { class: "pl-avatar pl-avatar--initials pl-avatar--blank", "aria-hidden": "true",
          html: ui.icon('<path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM4 20a8 8 0 0 1 16 0"/>', 26) });
      }
      avatarWrap.appendChild(node);
    }
    paintAvatar();
    var photoBtn = h("button", { type: "button", class: "pl-add__photobtn",
      "aria-label": pendingPhoto ? "Change photo" : "Add a photo" }, [avatarWrap]);
    photoBtn.addEventListener("click", function () {
      pickPhoto(function (dataUrl) { pendingPhoto = dataUrl; paintAvatar(); });
    });

    function submit() {
      var name = nameInput.value.trim();
      if (!name) { nameInput.focus(); return; }
      var id = RR.roster.addPlayer({
        name: name, number: numberInput.value, position: positionSelect.value || ""
      });
      if (id && pendingPhoto && RR.photos) RR.photos.set(id, pendingPhoto);
      ui.confirmToast("Player added.");
      refresh(host);
      var fresh = document.getElementById("pl-add-name");
      if (fresh) fresh.focus();
    }
    [nameInput, numberInput].forEach(function (el) {
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); submit(); }
      });
    });

    var addBtn = h("button", { type: "button", class: "btn btn-primary pl-add__btn",
      "aria-label": "Add player to squad" }, [
      h("span", { class: "btn__icon", "aria-hidden": "true", html: ui.icon('<path d="M12 5v14M5 12h14"/>', 18) }),
      "Add player"
    ]);
    addBtn.addEventListener("click", submit);

    return h("section", { class: "card pl-add" }, [
      ui.sectionTitle("Add a player", null, "h2"),
      h("div", { class: "pl-add__grid" }, [
        h("div", { class: "pl-add__photo" }, [
          photoBtn,
          h("span", { class: "pl-add__photolabel muted", text: "Photo" })
        ]),
        h("div", { class: "pl-add__fields" }, [
          h("div", { class: "field" }, [
            h("label", { for: "pl-add-name", text: "Name" }), nameInput
          ]),
          h("div", { class: "pl-add__row" }, [
            h("div", { class: "field pl-add__num" }, [
              h("label", { class: "field-label", text: "Number" }), numberInput
            ]),
            h("div", { class: "field pl-add__pos" }, [
              h("label", { class: "field-label", text: "Position" }), positionSelect
            ])
          ])
        ])
      ]),
      addBtn,
      h("p", { class: "muted pl-add__privacy",
        text: "Photos are stored only on this device — they’re never uploaded." })
    ]);
  }

  // ---- Squad list -----------------------------------------------------------
  function buildSquadCard(host) {
    var players = RR.roster.getSortedRoster();

    var headerRight = players.length
      ? h("span", { class: "pill", text: players.length + (players.length === 1 ? " player" : " players") })
      : null;

    var card = h("section", { class: "card pl-squad" }, [
      ui.sectionTitle("Your squad", headerRight, "h2")
    ]);

    if (!players.length) {
      card.appendChild(h("p", { class: "muted pl-empty",
        text: "No players yet — add your first above." }));
      return card;
    }

    // Group toggle (by number / by position).
    card.appendChild(buildGroupToggle(host));

    if (groupBy === "position") {
      card.appendChild(buildGroupedGrid(players, host));
    } else {
      card.appendChild(buildGrid(players, host));
    }
    return card;
  }

  function buildGroupToggle(host) {
    var wrap = h("div", { class: "pl-grouptoggle", role: "group", "aria-label": "Group players by" });
    [["number", "By number"], ["position", "By position"]].forEach(function (opt) {
      var on = groupBy === opt[0];
      var b = h("button", { type: "button", class: "seg" + (on ? " is-on" : ""),
        "aria-pressed": on ? "true" : "false", text: opt[1] });
      b.addEventListener("click", function () {
        if (groupBy === opt[0]) return;
        groupBy = opt[0];
        refresh(host);
      });
      wrap.appendChild(b);
    });
    return wrap;
  }

  function buildGrid(players, host) {
    return h("div", { class: "pl-grid" }, players.map(function (p) { return playerCard(p, host); }));
  }

  // Group into position buckets in RR.positions order, then unassigned last.
  function buildGroupedGrid(players, host) {
    var order = (RR.positions && RR.positions.LIST) || [];
    var buckets = {};
    order.forEach(function (pos) { buckets[pos] = []; });
    var other = [];
    players.forEach(function (p) {
      if (p.position && buckets[p.position]) buckets[p.position].push(p);
      else other.push(p);
    });
    var wrap = h("div", { class: "pl-groups" });
    order.forEach(function (pos) {
      if (!buckets[pos].length) return;
      wrap.appendChild(positionGroup(pos, buckets[pos], host));
    });
    if (other.length) wrap.appendChild(positionGroup("No position yet", other, host));
    return wrap;
  }

  function positionGroup(label, players, host) {
    var abbr = (RR.positions && RR.positions.abbr(label)) || "";
    var head = h("div", { class: "pl-group__head" }, [
      h("span", { class: "eyebrow", text: label }),
      h("span", { class: "pl-group__count muted", text: String(players.length) })
    ]);
    // Tappable header that opens the position guide (when it's a real position).
    if (abbr && RR.positions.isCoachable(label)) {
      var link = h("a", { class: "pl-group__coach", href: "#positions",
        "aria-label": "Coaching for " + label }, ["Coach " + abbr + " →"]);
      link.addEventListener("click", function () {
        if (RR.positionsScreen && RR.positionsScreen.focus) RR.positionsScreen.focus(label);
      });
      head.appendChild(link);
    }
    return h("div", { class: "pl-group" }, [head, buildGrid(players, host)]);
  }

  function playerCard(player, host) {
    var posChip = player.position
      ? h("span", { class: "pl-card__pos", text: player.position })
      : h("span", { class: "pl-card__pos pl-card__pos--none muted", text: "No position" });

    var card = h("button", { type: "button", class: "pl-card",
      "aria-label": "Open " + player.name + (player.number ? ", number " + player.number : "") +
        (player.position ? ", " + player.position : "") }, [
      h("span", { class: "pl-card__avatarwrap" }, [
        RR.photos.avatar(player, 56),
        player.number
          ? h("span", { class: "pl-card__num", "aria-hidden": "true", text: player.number })
          : null
      ]),
      h("span", { class: "pl-card__name", text: player.name }),
      posChip
    ]);
    card.addEventListener("click", function () {
      if (!(RR.playerProfile && RR.playerProfile.open)) return;
      RR.playerProfile.open(player.id);
      location.hash = "#player";
    });
    return card;
  }

  // ======================================================================= //
  //  Photo picker + cropper (reused by the profile)                         //
  // ======================================================================= //

  // pickPhoto(onResult): open the system picker (gallery + camera on mobile),
  // then the cropper; calls onResult(dataUrl) when the coach confirms a crop.
  function pickPhoto(onResult) {
    var input = h("input", { type: "file", accept: "image/*", class: "pl-fileinput" });
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (file) openCropper(file, onResult);
      input.value = "";
    });
    // Some mobile browsers need the input in the DOM to open reliably.
    document.body.appendChild(input);
    input.click();
    setTimeout(function () { if (input.parentNode) input.parentNode.removeChild(input); }, 1000);
  }

  // A focused modal: a square live preview (WYSIWYG — it's the exact stored
  // result), a zoom slider, and drag-to-reposition. Confirm → onConfirm(dataUrl).
  function openCropper(file, onConfirm) {
    if (!(RR.photos && RR.photos.processFile)) return;
    var img = new Image();
    var zoom = 1, fx = 0.5, fy = 0.5;
    var raf = null;

    var preview = h("img", { class: "crop__preview", alt: "", "aria-hidden": "true" });
    function redraw() {
      raf = null;
      preview.src = RR.photos.squareDataUrl(img, zoom, fx, fy);
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(redraw); }

    var reader = new FileReader();
    reader.onload = function () {
      img.onload = function () { redraw(); };
      img.onerror = function () { ui.confirmToast("Couldn't open that image."); close(); };
      img.src = reader.result;
    };
    reader.onerror = function () { ui.confirmToast("Couldn't read that file."); close(); };
    reader.readAsDataURL(file);

    // Drag to reposition the focal point.
    var stage = h("div", { class: "crop__stage" }, [preview]);
    var dragging = false, lastX = 0, lastY = 0;
    stage.addEventListener("pointerdown", function (e) {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      fx = clamp(fx - (e.clientX - lastX) / 220, 0, 1);
      fy = clamp(fy - (e.clientY - lastY) / 220, 0, 1);
      lastX = e.clientX; lastY = e.clientY;
      schedule();
    });
    function endDrag() { dragging = false; }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    var zoomInput = h("input", { type: "range", min: "1", max: "3", step: "0.01", value: "1",
      class: "crop__zoom", "aria-label": "Zoom" });
    zoomInput.addEventListener("input", function () { zoom = parseFloat(zoomInput.value) || 1; schedule(); });

    var useBtn = h("button", { type: "button", class: "btn btn-primary" }, ["Use photo"]);
    useBtn.addEventListener("click", function () {
      var dataUrl = RR.photos.squareDataUrl(img, zoom, fx, fy);
      close();
      if (onConfirm) onConfirm(dataUrl);
    });
    var cancelBtn = h("button", { type: "button", class: "btn btn-ghost" }, ["Cancel"]);
    cancelBtn.addEventListener("click", close);

    var dialog = h("div", { class: "crop__dialog", role: "dialog", "aria-modal": "true",
      "aria-label": "Adjust photo" }, [
      h("h2", { class: "crop__title", text: "Adjust photo" }),
      stage,
      h("label", { class: "crop__zoomrow" }, [
        h("span", { class: "muted", text: "Zoom" }), zoomInput
      ]),
      h("p", { class: "muted crop__hint", text: "Drag the photo to reposition." }),
      h("div", { class: "crop__actions" }, [cancelBtn, useBtn])
    ]);
    var backdrop = h("div", { class: "crop__backdrop" }, [dialog]);
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) close(); });

    function onKey(e) { if (e.key === "Escape") close(); }
    function close() {
      document.removeEventListener("keydown", onKey);
      if (raf) cancelAnimationFrame(raf);
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    }
    document.addEventListener("keydown", onKey);
    document.body.appendChild(backdrop);
    useBtn.focus();
  }

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  return {
    render: render,
    refresh: refresh,
    pickPhoto: pickPhoto,
    openCropper: openCropper
  };
})();
