// page-guide.js — the "what is this page for?" helper shown at the top of every
// screen (RR.pageGuide).
//
// It gives each page two small affordances next to the title:
//   • an "i" (info) button that opens a friendly, plain-English explanation of
//     what the page is for and how to use it; and
//   • a speaker button that reads that same explanation aloud (via RR.tts), so a
//     coach with their hands full — or who'd simply rather listen — can hear it.
//
// Explanations are authored in everyday English and paired with a natural Romanian
// translation. They are rendered in English and flipped by the i18n DOM walker, so
// the panel matches the app's language; speech is built through RR.i18n.t() so it
// is always spoken in the right language even before the walker runs.
window.RR = window.RR || {};

RR.pageGuide = (function () {
  "use strict";

  function h() { return RR.ui.h.apply(null, arguments); }
  function tt(s) { return (RR.i18n && RR.i18n.t) ? RR.i18n.t(s) : s; }

  // ---- the copy -------------------------------------------------------------
  // Each entry: en/ro arrays of matching paragraphs ("what it's for", "how to
  // use it"). Keep the two arrays the same length and in the same order — they are
  // zipped into the translation dictionary at load.
  var GUIDE = {
    ideas: {
      en: [
        "Ideas is your inspiration feed — a place to pull from before practice, not another form to fill in. Scroll through ready-made practice ideas, drill spotlights, bite-size tips, fun challenges and mindset nuggets, all tuned to your team's age and program.",
        "Browse for as long as you like, save the ones you love, and tap “More ideas” for a fresh mix. Found something you want to run? Share or print it as a carry sheet — or open the full planner and timer when you'd rather have the classic, step-by-step practice."
      ],
      ro: [
        "Idei este fluxul tău de inspirație — un loc din care să te inspiri înainte de antrenament, nu încă un formular de completat. Derulează idei de antrenament gata făcute, exerciții puse în lumină, sfaturi scurte, provocări distractive și gânduri despre mentalitate, toate adaptate vârstei și programului echipei tale.",
        "Răsfoiește cât vrei, salvează-le pe cele care îți plac și apasă „Mai multe idei” pentru un amestec nou. Ai găsit ceva ce vrei să folosești? Distribuie-l sau tipărește-l ca foaie de teren — sau deschide planificatorul complet și cronometrul când preferi antrenamentul clasic, pas cu pas."
      ]
    },
    today: {
      en: [
        "This is your home base on practice day. RallyReady looks at your team's age group and where you are in the season, then builds a complete, ready-to-run practice plan for you — warm-up, skill blocks, a game, and a cool-down — so you can walk into the gym without spending your evening planning.",
        "Skim the blocks to see what's coming, swap or regenerate anything you don't love, then tap into run mode to coach it live with a built-in timer that keeps every block moving. When you're done, mark it complete and it's saved to your History."
      ],
      ro: [
        "Acesta este punctul tău de plecare în ziua de antrenament. RallyReady se uită la categoria de vârstă a echipei tale și la momentul din sezon, apoi îți construiește un plan de antrenament complet, gata de rulat — încălzire, blocuri de exerciții, un joc și o relaxare — ca să intri în sală fără să-ți petreci seara planificând.",
        "Parcurge blocurile ca să vezi ce urmează, schimbă sau regenerează orice nu-ți place, apoi intră în modul de rulare ca să conduci antrenamentul în direct cu un cronometru încorporat care menține fiecare bloc în mișcare. Când termini, marchează-l ca finalizat și se salvează în Istoricul tău."
      ]
    },
    season: {
      en: [
        "The Season screen is the big-picture view of your whole season. It lays out your weeks from preseason through to your peak and draws an intensity curve, so you can see at a glance when to push hard and when to ease off — the rhythm that keeps players improving without burning out.",
        "Use it to plan ahead: set your season dates, see which phase each week falls into, and let that shape the practices RallyReady generates. Coaching a camp instead? It switches to a day-by-day camp layout."
      ],
      ro: [
        "Ecranul Sezon este imaginea de ansamblu a întregului tău sezon. Îți așază săptămânile de la pre-sezon până la vârf și desenează o curbă de intensitate, ca să vezi dintr-o privire când să forțezi și când să reduci ritmul — cadența care îi face pe jucători să progreseze fără să se epuizeze.",
        "Folosește-l ca să planifici din timp: stabilește datele sezonului, vezi în ce fază cade fiecare săptămână și lasă asta să modeleze antrenamentele pe care le generează RallyReady. Antrenezi o tabără? Trece la un format zi-cu-zi."
      ]
    },
    drills: {
      en: [
        "This is your drill library — a searchable, filterable collection of activities for every skill, age group and part of practice. Each drill explains how to set it up, how to run it, and what to coach, often with a court diagram so you can picture it instantly.",
        "Search by name or filter by skill, then star the ones you love so they're easy to find again. You can also add your own drills, and anything in here can drop straight into your practice plans."
      ],
      ro: [
        "Aceasta este biblioteca ta de exerciții — o colecție în care poți căuta și filtra, cu activități pentru fiecare deprindere, categorie de vârstă și parte a antrenamentului. Fiecare exercițiu explică cum se pregătește, cum se desfășoară și ce să corectezi, deseori cu o diagramă de teren ca să-l vizualizezi imediat.",
        "Caută după nume sau filtrează după deprindere, apoi marchează cu stea cele care îți plac, ca să le găsești ușor data viitoare. Poți adăuga și propriile exerciții, iar orice se află aici poate intra direct în planurile tale de antrenament."
      ]
    },
    players: {
      en: [
        "The Players tab is your squad at a glance — every player with their photo, jersey number and positions. It's the roster you build once and lean on all season.",
        "Tap any player to open their 1-on-1 page for notes, goals, skills and attendance. Use the add form to bring in new players, and assign positions so the rest of the app — lineups, position coaching — knows who plays where."
      ],
      ro: [
        "Fila Jucători este lotul tău dintr-o privire — fiecare jucător cu poza, numărul de pe tricou și pozițiile. Este lista pe care o construiești o dată și pe care te bazezi tot sezonul.",
        "Apasă pe orice jucător ca să-i deschizi pagina individuală pentru notițe, obiective, deprinderi și prezență. Folosește formularul de adăugare ca să aduci jucători noi și atribuie poziții, ca restul aplicației — formații, coaching pe poziții — să știe cine unde joacă."
      ]
    },
    tips: {
      en: [
        "Tips is your coaching cheat-sheet — practical, no-nonsense guidance on running a great practice, what to expect at each age group, real net heights and ball sizes, and a plain-English glossary of volleyball terms (including a Romanian-to-English one).",
        "Tap any card to open it, and use its Listen button to have it read aloud while your hands are busy. It's tuned to your team, so the advice fits the players actually in front of you."
      ],
      ro: [
        "Sfaturi este foaia ta de ajutor în antrenorat — îndrumări practice și la obiect despre cum să conduci un antrenament bun, la ce să te aștepți la fiecare categorie de vârstă, înălțimi reale ale fileului și mărimi de minge, plus un glosar pe înțelesul tuturor de termeni de volei (inclusiv unul român-englez).",
        "Apasă pe orice card ca să-l deschizi și folosește butonul lui Ascultă pentru a ți-l citi cu voce tare când ai mâinile ocupate. Este adaptat echipei tale, așa că sfaturile se potrivesc jucătorilor pe care îi ai chiar în față."
      ]
    },
    team: {
      en: [
        "This is where your teams live. Create a team, set its age group and season dates, add a few details about your squad, and RallyReady uses all of it to tailor practices, drills and coaching tips specifically to them.",
        "Coaching more than one group? Add as many teams as you like and switch between them here — each keeps its own plan, history and settings. Everything saves automatically as you type."
      ],
      ro: [
        "Aici se află echipele tale. Creează o echipă, stabilește-i categoria de vârstă și datele sezonului, adaugă câteva detalii despre lot, iar RallyReady folosește toate acestea ca să adapteze antrenamentele, exercițiile și sfaturile de antrenorat special pentru ei.",
        "Antrenezi mai multe grupe? Adaugă câte echipe vrei și comută între ele aici — fiecare își păstrează propriul plan, istoric și setări. Totul se salvează automat pe măsură ce scrii."
      ]
    },
    history: {
      en: [
        "History is the logbook of every practice you've run. Each completed session is saved here, so you can look back at what you did, see how attendance and focus have shifted, and avoid repeating the same drills two sessions in a row.",
        "Open any past practice to review its plan and your notes. It's a quiet record of the work you've put in — handy for spotting patterns and showing the season's progress."
      ],
      ro: [
        "Istoric este jurnalul fiecărui antrenament pe care l-ai desfășurat. Fiecare ședință finalizată se salvează aici, ca să poți privi înapoi la ce ai făcut, să vezi cum s-au schimbat prezența și accentul și să eviți repetarea acelorași exerciții două ședințe la rând.",
        "Deschide orice antrenament trecut ca să-i revezi planul și notițele tale. Este o evidență discretă a muncii depuse — utilă ca să observi tipare și să arăți progresul sezonului."
      ]
    },
    calendar: {
      en: [
        "The Schedule gives you the next few weeks at a glance — practices and games laid out on a simple agenda, so nothing sneaks up on you.",
        "Use it to see what's coming, jump to a specific practice, and keep your week organised. Add games so the schedule reflects your real calendar, not just practice days."
      ],
      ro: [
        "Programul îți oferă următoarele câteva săptămâni dintr-o privire — antrenamente și meciuri așezate într-o agendă simplă, ca nimic să nu te ia prin surprindere.",
        "Folosește-l ca să vezi ce urmează, să sari direct la un anumit antrenament și să-ți ții săptămâna organizată. Adaugă meciuri, ca programul să reflecte calendarul tău real, nu doar zilele de antrenament."
      ]
    },
    player: {
      en: [
        "This is a single player's 1-on-1 page — the place to coach the individual, not just the team. Keep notes, set goals, track the skills they're working on, and log attendance over time.",
        "It's built for the small, personal touches that make players feel seen: a reminder of what you talked about last week, a goal to check in on, a quick note before practice."
      ],
      ro: [
        "Aceasta este pagina individuală a unui jucător — locul în care antrenezi persoana, nu doar echipa. Ține notițe, stabilește obiective, urmărește deprinderile la care lucrează și înregistrează prezența în timp.",
        "Este gândită pentru atențiile mici și personale care îi fac pe jucători să se simtă văzuți: o amintire a ceea ce ați discutat săptămâna trecută, un obiectiv de verificat, o notă rapidă înainte de antrenament."
      ]
    },
    positions: {
      en: [
        "Position coaching is a guide to every role on the court — setter, outside, middle, opposite, libero and defensive specialist. For each one it explains the job, the cues that matter, the common mistakes, and rotation basics.",
        "Each position also pulls recommended drills straight from the library, so when a player needs work in their role you've already got the activities to coach it."
      ],
      ro: [
        "Coaching pe poziții este un ghid pentru fiecare rol de pe teren — ridicător, extremă, central, opus, libero și specialist în apărare. Pentru fiecare explică sarcina, indicațiile care contează, greșelile frecvente și bazele rotației.",
        "Fiecare poziție aduce și exerciții recomandate direct din bibliotecă, așa că atunci când un jucător are nevoie de lucru pe rolul lui, ai deja activitățile cu care să-l antrenezi."
      ]
    },
    lineup: {
      en: [
        "The Lineup builder lets you place your starting six into the rotation and see how the court looks in each position. It's the easy way to plan who lines up where before a match.",
        "Set your players into their spots, work through the rotations, and get a clear picture of your serve-receive and base positions — so game day starts with a plan, not a scramble."
      ],
      ro: [
        "Constructorul de Formație îți permite să-ți așezi cei șase titulari în rotație și să vezi cum arată terenul în fiecare poziție. Este modul simplu de a planifica cine unde se așază înainte de meci.",
        "Așază-ți jucătorii în locurile lor, parcurge rotațiile și obține o imagine clară a pozițiilor de preluare a serviciului și a celor de bază — ca ziua meciului să înceapă cu un plan, nu cu o învălmășeală."
      ]
    },
    _default: {
      en: [
        "This page is part of RallyReady, your youth volleyball coaching companion.",
        "Look around, tap the controls, and use the Listen button any time you'd rather hear things than read them."
      ],
      ro: [
        "Această pagină face parte din RallyReady, însoțitorul tău pentru antrenoratul de volei juvenil.",
        "Explorează, apasă pe butoane și folosește butonul Ascultă oricând preferi să asculți în loc să citești."
      ]
    }
  };

  function entry(routeId) { return GUIDE[routeId] || GUIDE._default; }

  // ---- icons ----------------------------------------------------------------
  function infoSvg() {
    return "<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' " +
           "stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>" +
           "<circle cx='12' cy='12' r='9'/><line x1='12' y1='11' x2='12' y2='16'/>" +
           "<line x1='12' y1='8' x2='12' y2='8'/></svg>";
  }
  function speakerSvg() {
    return "<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' " +
           "stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>" +
           "<path d='M11 5 6 9H3v6h3l5 4z'/><path d='M15.5 8.5a5 5 0 0 1 0 7'/>" +
           "<path d='M18.5 5.5a9 9 0 0 1 0 13'/></svg>";
  }
  function stopSvg() {
    return "<svg viewBox='0 0 24 24' width='18' height='18' fill='currentColor' aria-hidden='true'>" +
           "<rect x='6' y='6' width='12' height='12' rx='2'/></svg>";
  }

  // ---- speech ---------------------------------------------------------------
  // Read the page title then its explanation, each translated to the live language.
  function speechFor(routeId) {
    var paras = entry(routeId).en.map(tt);
    var title = (RR.app && RR.app.SCREENS && RR.app.SCREENS[routeId])
      ? tt(RR.app.SCREENS[routeId].title) : "";
    return (title ? title + ". " : "") + paras.join(" ");
  }

  var seq = 0;

  // Only one explanation plays at a time. When a new speaker starts (or read-aloud
  // is stopped), this resets the previously-playing button's UI so it can never get
  // stuck on "Stop" — the same reset pattern the Tips speakers use (RR.tipsTTS).
  var stopCurrentUI = null;
  function resetCurrent() {
    if (stopCurrentUI) { stopCurrentUI(); stopCurrentUI = null; }
  }

  // ---- the control ----------------------------------------------------------
  // Returns the row of controls + the (collapsed) explanation panel for `routeId`.
  function control(routeId) {
    var pid = "page-guide-" + (++seq);
    var paras = entry(routeId).en;

    var panel = h("div", { class: "page-guide__panel", id: pid },
      paras.map(function (p) { return h("p", { text: p }); }));
    panel.hidden = true;

    // "i" — reveal the written explanation.
    var info = h("button", {
      type: "button", class: "page-guide__btn page-guide__info",
      "aria-expanded": "false", "aria-controls": pid
    }, [
      h("span", { class: "page-guide__ic", "aria-hidden": "true", html: infoSvg() }),
      h("span", { class: "page-guide__label", text: "About this page" })
    ]);
    info.addEventListener("click", function () {
      var open = info.getAttribute("aria-expanded") !== "true";
      info.setAttribute("aria-expanded", open ? "true" : "false");
      panel.hidden = !open;
    });

    var row = [info];

    // Speaker — read the explanation aloud (only where speech is supported).
    if (RR.tts && RR.tts.supported()) {
      var listen = h("button", {
        type: "button", class: "page-guide__btn page-guide__listen",
        "aria-pressed": "false", "aria-label": tt("Listen")
      }, [h("span", { class: "page-guide__ic", "aria-hidden": "true", html: speakerSvg() })]);

      var setPlaying = function (on) {
        listen.classList.toggle("is-playing", on);
        listen.setAttribute("aria-pressed", on ? "true" : "false");
        listen.setAttribute("aria-label", tt(on ? "Stop" : "Listen"));
        listen.querySelector(".page-guide__ic").innerHTML = on ? stopSvg() : speakerSvg();
      };
      listen.addEventListener("click", function () {
        if (listen.classList.contains("is-playing")) {   // tap again to stop
          RR.tts.cancel();
          setPlaying(false);
          stopCurrentUI = null;
          return;
        }
        resetCurrent();                                  // stop whatever else was playing
        stopCurrentUI = function () { setPlaying(false); };
        // Opening the panel as it reads keeps the words on screen in step with the audio.
        if (panel.hidden) { panel.hidden = false; info.setAttribute("aria-expanded", "true"); }
        var started = RR.tts.speak(speechFor(routeId), {
          onStart: function () { setPlaying(true); },
          onEnd: function () { setPlaying(false); stopCurrentUI = null; }
        });
        if (!started) { setPlaying(false); stopCurrentUI = null; }
      });
      row.push(listen);
    }

    return h("div", { class: "page-guide" }, [h("div", { class: "page-guide__row" }, row), panel]);
  }

  // ---- Romanian for the UI chrome + every explanation paragraph -------------
  if (RR.i18n) {
    RR.i18n.add({
      "About this page": "Despre această pagină",
      "Listen": "Ascultă",
      "Stop": "Oprește"
    });
    Object.keys(GUIDE).forEach(function (id) {
      var g = GUIDE[id], map = {};
      g.en.forEach(function (en, i) { if (g.ro[i]) map[en] = g.ro[i]; });
      RR.i18n.add(map);
    });
  }

  return { control: control, speechFor: speechFor, GUIDE: GUIDE };
})();
