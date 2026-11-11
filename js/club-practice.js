// Generates standalone indoor club practices from age group and court time.
window.RR = window.RR || {};

RR.clubPractice = (function () {
  "use strict";

  var ageGroups = ["13U", "14U", "15U", "16U"];
  var minMinutes = 30;
  var maxMinutes = 180;
  var durationOptions = [45, 60, 75, 90, 105, 120];
  var themes = RR.clubPracticeThemes || [];
  var starterThemeCount = 4;
  var courtGear = ["balls", "net"];
  var sources = [
    { label: "USA Volleyball · Lesson Plans for Teachers and Coaches", url: "https://usavolleyball.org/resources-for-coaches/lesson-plans/" },
    { label: "USA Volleyball · How To Make Drills That Work", url: "https://usavolleyball.org/resource/how-to-make-drills-that-work/" },
    { label: "USA Volleyball · Building Complete Players at 14U and 16U", url: "https://usavolleyball.org/resource/kevin-hambly-blog-building-complete-players-at-14u-and-16u/" },
    { label: "FIVB · Coaches Manual, Practice and Drills Design", url: "https://www.fivb.com/wp-content/uploads/2024/03/FIVB_Coach_Manual_EN.pdf" }
  ];

  var profiles = {
    "13U": {
      opening: ["Demo one rep. Give one cue. Let every player pass, set and send the ball over.", "Arată o repetare. Dă o singură indicație. Lasă fiecare jucător să preia, să ridice și să trimită mingea peste fileu."],
      formation: ["Play 3v3 on a narrow court. Use 4v4 when both sides can cover the extra space.", "Joacă 3 la 3 pe teren îngust. Treci la 4 la 4 când ambele echipe pot acoperi spațiul în plus."],
      rotation: ["Change servers every 3 rallies. Rotate everyone through pass, set and attack.", "Schimbă jucătorul la serviciu după 3 mingi. Rotește toți jucătorii la preluare, ridicare și atac."],
      serve: ["Serve from just behind the attack line if needed. After 2 of 3 serves land in, step back.", "La nevoie, servește de imediat din spatele liniei de 3 metri. După 2 servicii bune din 3, fă un pas înapoi."],
      small: ["With 4–5, play 2v2. An extra player feeds. With 6–7, play 3v3 and rotate the extra player every 3 rallies.", "Cu 4–5 jucători, joacă 2 la 2. Jucătorul în plus introduce mingea. Cu 6–7, joacă 3 la 3 și schimbă rezerva după 3 mingi."]
    },
    "14U": {
      opening: ["Show one predictable rep. Vary the next ball so players have to read it.", "Arată o repetare cu o minge previzibilă. Schimbă mingea următoare ca jucătorii să-i citească traiectoria."],
      formation: ["Play 4v4. Start with three passers and a setter. Add a fifth player per side when possible.", "Joacă 4 la 4. Începe cu trei jucători la preluare și un ridicător. Adaugă al cincilea jucător când ai efectiv."],
      rotation: ["Rotate when the receiving team wins the rally. Change setters between mini-sets.", "Rotește când echipa la preluare câștigă punctul. Schimbă ridicătorii între miniseturi."],
      serve: ["Serve from the end line when ready. Call left or right before the toss.", "Servește din spatele liniei de fund când ești pregătit. Spune «stânga» sau «dreapta» înainte de aruncare."],
      small: ["With 4–5, play 2v2 and rotate the feeder. With 6–7, play 3v3 and name one setter per side.", "Cu 4–5 jucători, joacă 2 la 2 și schimbă jucătorul care introduce mingea. Cu 6–7, joacă 3 la 3 cu un ridicător de fiecare parte."]
    },
    "15U": {
      opening: ["Name the setter and backup setter. Between rounds, ask a player what they saw.", "Stabilește cine ridică și cine preia rolul la nevoie. Între runde, întreabă un jucător ce a observat."],
      formation: ["Play 5v5 with two front-row attackers. Use 4v4 with 8–9 players or 6v6 with 12.", "Joacă 5 la 5, cu doi atacanți la fileu. Cu 8–9 jucători, joacă 4 la 4. Cu 12, joacă 6 la 6."],
      rotation: ["Rotate on side-out. Change the backup setter after each mini-set.", "Rotește când echipa la preluare câștigă punctul. Schimbă ridicătorul de rezervă după fiecare miniset."],
      serve: ["Serve from the end line. Call one of two marked lanes before each serve.", "Servește din spatele liniei de fund. Spune în ce culoar marcat trimiți mingea înainte de fiecare serviciu."],
      small: ["With 4–5, play 2v2. With 6–7, play 3v3 and name a front attacker and a backup setter on each side.", "Cu 4–5 jucători, joacă 2 la 2. Cu 6–7, joacă 3 la 3. Stabilește un atacant la fileu și un ridicător de rezervă de fiecare parte."]
    },
    "16U": {
      opening: ["Use your match system. Name the backup setter and who covers the hitter.", "Folosește sistemul de joc din meciuri. Stabilește cine ridică la nevoie și cine asigură dublajul la atac."],
      formation: ["Play 6v6 in your match system. Use 5v5 with 10–11 players or 4v4 with 8–9.", "Joacă 6 la 6, în sistemul de joc din meciuri. Cu 10–11 jucători, joacă 5 la 5. Cu 8–9, joacă 4 la 4."],
      rotation: ["Rotate on side-out. Start the next mini-set in a different rotation.", "Rotește când echipa la preluare câștigă punctul. Începe următorul miniset din altă rotație."],
      serve: ["Serve from the end line. Aim short, deep or between two passers.", "Servește din spatele liniei de fund. Țintește scurt, lung sau între doi jucători la preluare."],
      small: ["With 4–5, play 2v2. With 6–7, play 3v3 and assign a backup setter and a defensive area to each player.", "Cu 4–5 jucători, joacă 2 la 2. Cu 6–7, joacă 3 la 3. Stabilește cine ridică la nevoie și ce zonă apără fiecare."]
    }
  };

  function measure(amount, length) {
    return Math.ceil(amount * length / 10) + "/" + length;
  }

  function note(label, text) { return { label: label, text: text }; }

  function materializeBlock(id, entry, startMinute) {
    var content = entry.content;
    var blockId = id + "-" + entry.key;
    return {
      id: blockId,
      blockKey: entry.key,
      role: entry.role,
      title: content.title,
      minutes: entry.minutes,
      startMinute: startMinute,
      endMinute: startMinute + entry.minutes,
      why: content.why,
      drill: {
        id: blockId,
        name: content.title,
        skill: entry.skill,
        durationMin: entry.minutes,
        setup: content.setup,
        steps: content.steps.slice(),
        cues: content.cues.slice(),
        equipment: (content.equipment || courtGear).slice(),
        scoring: content.scoring,
        easier: content.easier,
        harder: content.harder,
        coaching: (content.coaching || []).map(function (item) { return note(item.label, item.text); }),
        isGame: entry.role === "Compete"
      }
    };
  }

  function warmUp(minutes, t) {
    var movement = Math.floor(minutes / 2);
    return {
      title: t("Move, stop, pass", "Deplasare, oprire, preluare"),
      why: t("Warm up the feet and shoulders before serving or jumping.", "Încălzește picioarele și umerii înainte de servicii sau sărituri."),
      setup: t("Use clear lanes. Then put one pair and one ball in each lane across the net.", "Eliberează culoarele. Apoi pune câte o pereche și o minge în fiecare culoar, cu jucătorii de o parte și de alta a fileului."),
      steps: [
        t(movement + " min: jog, shuffle sideways and stop in balance.", movement + " min: aleargă ușor, fă pași laterali și oprește-te echilibrat."),
        t("Across the net: toss → forearm pass → catch.", "Peste fileu: aruncare → preluare cu antebrațele → prindere."),
        t("Swap jobs after 3 balls. Use the last minute to demo the next drill.", "Schimbă rolurile după 3 mingi. În ultimul minut, arată exercițiul următor.")
      ],
      cues: [t("Small steps. Soft landing.", "Pași mici. Aterizează ușor.")],
      scoring: t("Goal: 3 exchanges each pair can complete without chasing the ball.", "Țintă: 3 schimburi în fiecare pereche, fără să alerge după minge."),
      easier: t("Move closer to the net. Let players catch and toss it back.", "Apropie jucătorii de fileu. Lasă-i să prindă mingea și să o arunce înapoi."),
      harder: t("Alternate short and deep tosses. Keep every landing balanced.", "Alternează mingi scurte și lungi. Aterizează echilibrat de fiecare dată."),
      coaching: [
        note(t("Movement order", "Ordinea mișcărilor"), t("Start with an easy jog. Add side steps, arm circles and controlled stops. Add a few low jumps only after players are moving comfortably.", "Începe cu alergare ușoară. Adaugă pași laterali, rotiri ale brațelor și opriri controlate. Introdu câteva sărituri mici când jucătorii se mișcă deja în voie.")),
        note(t("What to correct", "Ce corectezi"), t("If a player passes while still running, slow the toss. Ask them to reach the ball, stop, then pass high enough for their partner to catch.", "Dacă un jucător preia din alergare, aruncă mai lent. Cere-i să ajungă la minge, să se oprească și să trimită o minge înaltă, ușor de prins."))
      ]
    };
  }

  function servePrep(profile, t) {
    return {
      title: t("Serve, pass, rotate", "Serviciu, preluare, schimb de roluri"),
      why: t("Build a repeatable serve and a high first pass.", "Exersează un serviciu constant și o preluare înaltă."),
      setup: t("Per lane: server across the net, passer deep, target near the net.", "În fiecare culoar: un jucător la serviciu, unul la preluare în spate și o țintă lângă fileu."),
      steps: [
        t.apply(null, profile.serve),
        t("Serve 3 balls. The passer sends each ball to the target player.", "Servește 3 mingi. Jucătorul la preluare trimite fiecare minge către țintă."),
        t("Rotate: server → passer → target → server.", "Schimbă rolurile: serviciu → preluare → țintă → serviciu.")
      ],
      cues: [t("Pick the target before you toss.", "Alege ținta înainte să arunci mingea.")],
      scoring: t("Goal: 2 of 3 serves in. After two good rounds, move back or narrow the target.", "Țintă: 2 servicii bune din 3. După două serii reușite, mută linia mai în spate sau micșorează ținta."),
      easier: t("Move the server closer. Aim at one half of the court.", "Apropie jucătorul de fileu. Folosește o jumătate de teren ca țintă."),
      harder: t("Call short or deep. Serve at 23–23.", "Spune «scurt» sau «lung». Servește la scorul de 23–23."),
      coaching: [
        note(t("Clear the lane", "Eliberează culoarul"), t("The target catches the pass and holds it. Start the next serve only when the lane is clear. After serving, step onto the court and get ready to defend.", "Jucătorul-țintă prinde preluarea și ține mingea. Servește din nou doar când culoarul e liber. După serviciu, intră în teren și ia poziție de apărare.")),
        note(t("What to correct", "Ce corectezi"), t("If serves keep missing in different directions, bring the server in. Check that the toss rises in front of the hitting shoulder before changing the swing.", "Dacă serviciile ies în direcții diferite, apropie jucătorul de fileu. Verifică mai întâi dacă aruncă mingea în fața umărului brațului de lovire."))
      ]
    };
  }

  function skillBuild(theme, age, sampleLength, t) {
    var drill = theme.build;
    return Object.assign({}, drill, {
      steps: [drill.steps[0], age.buildDemand || age.demand].concat(drill.steps.slice(1)),
      scoring: t("Target: " + measure(age.samples, sampleLength) + " reps with " + age.check + ".", "Țintă: " + measure(age.samples, sampleLength) + " repetări cu " + age.check + "."),
      coaching: (drill.coaching || []).concat(note(t("What to track", "Ce notezi"), t(
        "Tally the first " + sampleLength + " attempts. Mark a success only when you see " + age.check + ".",
        "Notează primele " + sampleLength + " încercări. Numără o reușită când vezi " + age.check + "."
      )))
    });
  }

  function teamPlay(theme, age, t) {
    var drill = theme.link;
    return Object.assign({}, drill, {
      steps: drill.steps.concat([age.demand]),
      scoring: t("Count 1 success for " + age.rally + ". Aim for 2 in a row.", "Notează 1 reușită pentru " + age.rally + ". Ținta este de 2 la rând."),
      coaching: (drill.coaching || []).concat(note(t("When to progress", "Când crești dificultatea"), t(
        "Keep the first ball predictable until the group can meet the goal twice in a row. Then add a harder serve or more court to cover.",
        "Păstrează prima minge previzibilă până când grupa reușește de două ori la rând. Apoi adaugă un serviciu mai greu sau mai mult teren de acoperit."
      )))
    });
  }

  function waterBreak(nextTitle, t) {
    return {
      title: t("Water and reset", "Pauză de apă și reorganizare"),
      why: t("Drink while the next group gets ready.", "Jucătorii beau apă cât se pregătește grupa următoare."),
      setup: t("Put balls in the cart. Keep the court clear.", "Pune mingile în coș. Lasă terenul liber."),
      steps: [
        t("Send players to their water bottles.", "Trimite jucătorii să bea apă."),
        t("Set up the next drill: " + nextTitle + ".", "Pregătește exercițiul următor: " + nextTitle + ".")
      ],
      cues: [t("Who starts the next ball?", "Cine începe următoarea minge?")],
      equipment: [],
      coaching: [note(t("Use the break", "Folosește pauza"), t(
        "Move any markers. Before players come back on court, tell each group where to start and who sends the first ball.",
        "Mută marcajele. Înainte ca jucătorii să revină pe teren, spune fiecărei grupe unde se așază și cine introduce prima minge."
      ))]
    };
  }

  function pressure(theme, profile, age, t) {
    return {
      title: t("Solve the tough ball", "Soluții la mingi dificile"),
      why: t("Make the same decision on a harder first ball.", "Exersează aceeași decizie când prima minge e mai grea."),
      setup: t.apply(null, profile.formation),
      steps: [
        theme.pressureStart,
        age.demand,
        t("Play 4 rallies. Then swap which side receives.", "Joacă 4 mingi. Apoi schimbă echipa la preluare.")
      ],
      cues: [theme.cue],
      scoring: t("Target: 2/4 rallies with " + age.rally + ".", "Țintă: 2/4 mingi cu " + age.rally + "."),
      easier: t("Tell players where the first ball is going. Slow it down.", "Spune jucătorilor unde vine prima minge. Trimite-o mai lent."),
      harder: t("Vary the first ball without warning.", "Schimbă prima minge fără să anunți."),
      coaching: (theme.pressureCoaching || []).concat(note(t("Reset between rounds", "Între runde"), t(
        "Have a player track four starts. Ask what changed on the toughest ball. Adjust one thing before starting the next four.",
        "Un jucător notează cele patru mingi. Întreabă ce s-a schimbat la mingea cea mai grea. Ajustează un singur lucru înainte de următoarele patru mingi."
      )))
    };
  }

  function compete(theme, profile, age, sampleLength, minutes, t) {
    var gameTarget = minutes < 10 ? 5 : 9;
    return {
      title: theme.game.title,
      why: t("Use today's skill in a scored game.", "Aplică tema zilei într-un joc cu punctaj."),
      setup: t.apply(null, profile.formation),
      steps: [
        theme.game.start,
        t("Play the whole rally. Call the score before the next serve.", "Joacă mingea până la capăt. Spune scorul înainte de serviciul următor."),
        t("Reach " + gameTarget + " to win. Finish the rally when time runs out.", "Câștigă echipa care ajunge prima la " + gameTarget + " de puncte. La finalul timpului, termină mingea în joc.")
      ],
      cues: [theme.cue],
      scoring: t("1 for the rally win. +1 if the winner showed " + age.rally + ".", "1 punct pentru mingea câștigată. +1 dacă echipa câștigătoare a reușit " + age.rally + "."),
      easier: t("Serve from closer in. Keep the same bonus rule.", "Servește de mai aproape. Păstrează regula pentru punctul bonus."),
      harder: t("Use full serves. Start in a tough rotation.", "Servește din spatele liniei de fund. Începe într-o rotație mai grea."),
      coaching: [note(t("Who rotates", "Cine și când se rotește"), t.apply(null, profile.rotation))].concat(
        theme.gameCoaching || [],
        note(t("Score example", "Exemplu de punctaj"), t(
          "At 2–1, a regular rally win by the leading team makes it 3–1. A win with a bonus makes it 4–1.",
          "La 2–1, dacă echipa din avantaj câștigă mingea, scorul devine 3–1. Cu punctul bonus, devine 4–1."
        )),
        note(t("What the scorer records", "Ce notează cel care ține scorul"), t(
          "Track bonus points on the scoreboard. On a separate tally, count the first " + sampleLength + " rallies with " + theme.eligible + ", even if that team loses the point. Goal: " + measure(age.rallies, sampleLength) + ".",
          "Trece punctele bonus pe tabelă. Separat, notează primele " + sampleLength + " mingi cu " + theme.eligible + ", chiar dacă echipa pierde punctul. Ținta: " + measure(age.rallies, sampleLength) + "."
        )),
        note(t("Extra players", "Jucătorii din afara terenului"), t(
          "Keep waiting players at the sideline with a tally or ball-cart job. Switch them in every three rallies.",
          "Jucătorii care așteaptă stau la margine. Țin scorul sau se ocupă de coșul cu mingi. Introdu-i în joc după fiecare trei mingi."
        ))
      )
    };
  }

  function matchFinish(theme, profile, age, t) {
    return {
      title: t("Play from 20–20", "Joc de la 20–20"),
      why: t("Use the same skill with normal scoring.", "Aplică aceeași temă cu punctaj normal."),
      setup: t.apply(null, profile.formation),
      steps: [
        t("Start at 20–20. Play to 25, with one deciding rally at 24–24.", "Începe de la 20–20. Joacă până la 25, cu o minge decisivă la 24–24."),
        t("Swap the first server. Start the next set in a different rotation.", "Schimbă primul jucător la serviciu. Începe setul următor din altă rotație.")
      ],
      cues: [theme.cue],
      scoring: t("1 point per rally. Separately tally " + age.rally + ".", "1 punct pe minge. Separat, notează " + age.rally + "."),
      easier: t("Use a narrower court or a closer serve line.", "Îngustează terenul sau apropie linia de serviciu."),
      harder: t("Start one side down 20–22. Let players call their own changes.", "Pornește cu o echipă condusă cu 20–22. Lasă jucătorii să decidă ce schimbă."),
      coaching: [
        note(t("Keep it game-like", "Păstrează ritmul de meci"), t(
          "Use your division's usual playing rules. Let the final mini-set run without coaching stops. Give feedback after the set.",
          "Aplică regulile de joc ale categoriei. În ultimul miniset, lasă jocul să curgă. Dă indicațiile după set."
        )),
        note(t("What to compare", "Ce compari"), t(
          "Compare how often the target skill showed up here with the bonus game. Ask what helped the team use it under normal scoring.",
          "Compară cât de des a apărut tema zilei aici și în jocul cu punct bonus. Întreabă ce a ajutat echipa să o aplice cu punctaj normal."
        ))
      ]
    };
  }

  function closePractice(theme, t) {
    return {
      title: t("Cool down and review", "Revenire și concluzii"),
      why: t("Finish with one clear goal for next practice.", "Încheie cu un obiectiv clar pentru următorul antrenament."),
      setup: t("Put balls away. Gather off the court with water and the scorecard.", "Strânge mingile. Adună echipa în afara terenului, cu apă și foaia de punctaj."),
      steps: [
        t("Walk and move shoulders, hips and ankles gently.", "Mergi ușor și mobilizează umerii, șoldurile și gleznele."),
        theme.debrief,
        t("Record both scores. Choose one thing to repeat next time.", "Notează ambele rezultate. Alege un lucru de repetat data viitoare.")
      ],
      cues: [t("What helped you play the next ball?", "Ce te-a ajutat să joci mingea următoare?")],
      equipment: [],
      coaching: [note(t("Keep a useful record", "Ce păstrezi în fișă"), t(
        "Write successes and attempts for both targets, even if you ran out of reps. Ask one player to name the cue that helped them.",
        "Notează reușitele și încercările pentru ambele ținte, chiar dacă nu ai apucat toate repetările. Întreabă un jucător ce indicație l-a ajutat."
      ))]
    };
  }

  function buildSchedule(total, theme, profile, age, sampleLength, t) {
    var warmMinutes = total >= 105 ? 12 : total >= 65 ? 10 : total >= 45 ? 8 : 7;
    var closeMinutes = total >= 105 ? 6 : total >= 65 ? 5 : total >= 45 ? 4 : 3;
    var schedule = [];
    function block(key, role, skill, content, minutes, weight) {
      schedule.push({ key: key, role: role, skill: skill, content: content, minutes: minutes, weight: weight });
    }
    function water(key, nextTitle, minutes) {
      block(key, "Water break", "Cooldown", waterBreak(nextTitle, t), minutes);
    }

    var pressureBlock = total >= 100 ? pressure(theme, profile, age, t) : null;
    var finish = total >= 140 ? matchFinish(theme, profile, age, t) : null;
    block("warm-up", "Warm-up", "Warmup", warmUp(warmMinutes, t), warmMinutes);
    if (total >= 75) block("serve-prep", "Serve", "Serving", servePrep(profile, t), 6, 7);
    block("build", "Skill", theme.skill, skillBuild(theme, age, sampleLength, t), 5, 11);
    if (total >= 65) water("water-first", theme.link.title, 2);
    block("link", "Team play", theme.skill, teamPlay(theme, age, t), 6, 14);
    water("water-main", pressureBlock ? pressureBlock.title : theme.game.title, total >= 90 ? 3 : 2);
    if (pressureBlock) block("pressure", "Pressure", theme.skill, pressureBlock, 7, 10);
    if (total >= 115) water("water-pressure", theme.game.title, 3);
    block("game", "Compete", "Team Play", null, 7, 16);
    if (finish) {
      water("water-game", finish.title, 3);
      block("match-finish", "Compete", "Team Play", finish, 8, 10);
    }
    block("close", "Cool-down", "Cooldown", closePractice(theme, t), closeMinutes);

    // Distribute remaining court time by largest remainder so no minute is lost.
    var active = schedule.filter(function (entry) { return entry.weight; });
    var extra = total - schedule.reduce(function (sum, entry) { return sum + entry.minutes; }, 0);
    var weightSum = active.reduce(function (sum, entry) { return sum + entry.weight; }, 0);
    var spare = extra;
    active.forEach(function (entry) {
      var whole = Math.floor(extra * entry.weight / weightSum);
      entry.minutes += whole;
      entry.remainder = extra * entry.weight % weightSum;
      spare -= whole;
    });
    active.sort(function (a, b) { return b.remainder - a.remainder; });
    active.slice(0, spare).forEach(function (entry) { entry.minutes += 1; });

    var game = schedule.find(function (entry) { return entry.key === "game"; });
    game.content = compete(theme, profile, age, sampleLength, game.minutes, t);
    active.forEach(function (entry) {
      if (entry.minutes >= 20) entry.content.coaching = (entry.content.coaching || []).concat(note(
        t("Halfway through", "La jumătatea blocului"),
        t("Take 30–60 seconds for water. Rotate roles and have each group name one adjustment.",
          "Ia o pauză de 30–60 de secunde pentru apă. Schimbă rolurile și cere fiecărei grupe să spună ce va ajusta.")
      ));
    });
    return schedule;
  }

  function adaptations(profile, t) {
    return [
      { label: t("4–7 players", "4–7 jucători"), description: t.apply(null, profile.small) },
      { label: t("13+ players", "Cel puțin 13 jucători"), description: t("Use short parallel courts if space allows. In full-court games, rotate waiting players in every 3 rallies.", "Folosește terenuri scurte în paralel dacă ai spațiu. În jocul pe teren întreg, schimbă jucătorii după fiecare 3 mingi.") },
      { label: t("One coach", "Un singur antrenor"), description: t("Give each side a captain to call the next server and keep score. Stop play before collecting balls.", "Alege câte un căpitan care anunță următorul serviciu și ține scorul. Oprește jocul înainte de a strânge mingile.") },
      { label: t("Limited space or gear", "Spațiu sau echipament limitat"), description: t("Use court lines as targets. Narrow the court. Run one ball per lane.", "Folosește liniile terenului ca repere. Îngustează terenul. Folosește o singură minge în fiecare culoar.") },
      { label: t("Mixed experience", "Niveluri diferite"), description: t("Give the group the same goal. Shorten the feed for beginners and vary it for experienced players.", "Păstrează același obiectiv pentru toți. Trimite mingi mai ușoare începătorilor și variază traiectoria pentru cei avansați.") }
    ];
  }

  function generate(ageGroup, minutes, variation, language) {
    var group = typeof ageGroup === "string" ? ageGroup.trim().toUpperCase() : "";
    var groupIndex = ageGroups.indexOf(group);
    var total = typeof minutes === "string" && /^\d+$/.test(minutes.trim()) ? Number(minutes) : minutes;
    if (groupIndex < 0 || !Number.isInteger(total) || total < minMinutes || total > maxMinutes || !themes.length) return null;

    var lang = language === "ro" ? "ro" : "en";
    var t = function (en, ro) { return lang === "ro" ? ro : en; };
    var offset = Number.isSafeInteger(variation) ? ((variation % themes.length) + themes.length) % themes.length : 0;
    var themeIndex = offset < starterThemeCount ? (groupIndex + offset) % starterThemeCount : offset;
    var theme = themes[themeIndex][lang];
    var profile = profiles[group];
    var age = theme.ages[group];
    var sampleLength = total < 45 ? 5 : 10;
    var id = "club-" + group.toLowerCase() + "-" + theme.key + "-" + total;
    var elapsed = 0;
    var blocks = buildSchedule(total, theme, profile, age, sampleLength, t).map(function (entry) {
      var result = materializeBlock(id, entry, elapsed);
      elapsed = result.endMinute;
      return result;
    });

    return {
      id: id,
      kind: "club-practice",
      language: lang,
      themeKey: theme.key,
      variation: offset,
      ageGroup: group,
      title: theme.title,
      totalMinutes: total,
      phaseLabel: t("Club practice", "Antrenament de club"),
      dayType: t("Indoor volleyball", "Volei în sală"),
      skillFocus: theme.focus,
      focusReminder: theme.headline,
      coachNote: t.apply(null, profile.opening),
      setup: t("Plan for 8–12 players on one court. Keep the cart outside the playing area. ",
        "Planul e pentru 8–12 jucători pe un teren. Ține coșul de mingi în afara zonei de joc. ") + theme.prep,
      objectives: [
        { label: theme.sampleLabel, target: measure(age.samples, sampleLength) + " · " + age.check },
        { label: theme.rallyLabel, target: measure(age.rallies, sampleLength) + " · " + age.rally }
      ],
      equipment: [
        t("One court and net", "Un teren și un fileu"),
        t("6–12 volleyballs and a cart", "6–12 mingi și un coș"),
        t("Flat tape or court lines", "Bandă plată sau liniile terenului"),
        t("Scoreboard or clipboard", "Tabelă sau foaie de punctaj"),
        t("Water bottles", "Sticle cu apă")
      ],
      adaptations: adaptations(profile, t),
      blocks: blocks
    };
  }

  function localize(plan, language) {
    if (!plan || plan.kind !== "club-practice") return plan;
    var lang = language === "ro" ? "ro" : "en";
    if (plan.language === lang && plan.themeKey) return plan;
    var revised = generate(plan.ageGroup, plan.totalMinutes, plan.variation, lang);
    return revised && revised.id === plan.id ? revised : plan;
  }

  return {
    generate: generate,
    localize: localize,
    ageGroups: ageGroups.slice(),
    minMinutes: minMinutes,
    maxMinutes: maxMinutes,
    durationOptions: durationOptions.slice(),
    variantCount: themes.length,
    sources: sources.slice()
  };
})();
