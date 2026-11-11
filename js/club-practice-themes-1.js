// Club Practice themes: passing, serving and attacking. Each language version
// describes the same court, roles and progression.
window.RR = window.RR || {};
RR.clubPracticeThemes = RR.clubPracticeThemes || [];

RR.clubPracticeThemes.push({
  en: {
    key: "first-contact", title: "Pass, Set, Send", skill: "Passing", focus: "First contact",
    headline: "Pass high to a teammate. Build three touches.",
    prep: "Mark the setter's spot right of center, a step off the net.",
    cue: "Call early. Pass high.",
    debrief: "What helped your teammate reach your pass?",
    sampleLabel: "Playable passes", rallyLabel: "Three-touch returns",
    eligible: "a serve in or an easy ball sent over",
    pressureStart: "Send one short ball and one deep ball across the net. Then let the feeder choose.",
    game: { title: "Three-Touch Game", start: "Start each rally with a serve. Move the server in if needed." },
    pressureCoaching: [
      { label: "Vary the feed", text: "Aim the short ball just beyond the attack line. Aim the deep ball several steps behind it. Keep the pace the same." },
      { label: "Fix a late call", text: "Freeze before the feed. Ask both passers to point to who takes the ball between them, then replay." }
    ],
    gameCoaching: [
      { label: "Score it", text: "Have a player off court track three-touch returns. Count the first chance for the receiving side, then watch the rest of the rally for the bonus." },
      { label: "Keep rallies alive", text: "If serves keep ending the point, move the serving line in one step. Move it back once the receivers are building three touches again." }
    ],
    build: {
      title: "Pass to a Target", why: "Give your teammate time to reach the pass.",
      setup: "Feeder across the net. Passer in backcourt. Target one step off the net, right of center.",
      steps: ["Feed an easy ball over the net. The passer calls ‘Mine!’ and passes high to the target.",
        "The target catches it and calls ‘Good!’ if they can reach it. Rotate all three roles after three balls."],
      cues: ["Call before contact.", "Angle your arms toward the target."],
      easier: "Toss from close to the net. Let the target move farther to catch.",
      harder: "Mix short and deep feeds. Have the target set the pass instead of catching it.",
      coaching: [
        { label: "Where to stand", text: "Start the passer halfway between the attack line and end line. Put the target just right of center, about 1 m off the net. The feeder faces the passer from across the net." },
        { label: "Rotate", text: "After three feeds, the passer becomes the target, the target becomes the feeder, and the feeder becomes the passer. Walk around the net when play stops." },
        { label: "Good rep", text: "The target catches the ball above chest height with at most one step. The pass stays on its own side of the net." },
        { label: "Fix a low pass", text: "Slow the feed. Ask the passer to show the angle of their forearms before the ball arrives and hold it through contact." }
      ]
    },
    link: {
      title: "Call, Pass, Set, Send", why: "Use all three touches on both sides.",
      setup: "On each side, put two passers back and one setter near the net.",
      steps: ["Send an easy ball over. One passer calls it and passes to the setter.",
        "Set to a teammate. That player sends the third touch over. Alternate the starting side after each rally."],
      cues: ["Call ‘Mine!’ early.", "Give your teammate a high ball."],
      easier: "Start with a gentle toss. Allow the setter one catch and toss.",
      harder: "Start with a serve. Use three clean contacts and reset for defense.",
      coaching: [
        { label: "Where to stand", text: "Split the backcourt between the two passers. Put the setter one step off the net. After the call, the passer without the ball gets wide to give the setter a target." },
        { label: "Rotate", text: "Swap which side sends the first ball after every rally. Change setters after three starts so all players get a turn." },
        { label: "Good rep", text: "The pass gives the setter time to face the third player. The third player sends a controlled ball over and the team gets ready to defend." },
        { label: "Fix two players chasing", text: "Before the next ball, point to the space between passers and name who owns it. Replay at the same speed." }
      ]
    },
    ages: {
      "13U": { buildDemand: "Toss first. Switch to a short-distance serve once passes reach the target.", demand: "Use two passers. Decide who takes a ball between them.", check: "an early call and a pass a teammate can reach", rally: "three touches and a controlled ball over the net", samples: 6, rallies: 4 },
      "14U": { buildDemand: "Mix short and deep feeds. If you add a passer, name who takes the middle ball.", demand: "Name who takes the ball between passers. The other passer gets ready to attack.", check: "the assigned passer getting the ball to the target", rally: "three touches and a ball sent away from the nearest defender", samples: 7, rallies: 5 },
      "15U": { buildDemand: "Mix feeds to the body and to either side. Keep the pass high and off the net.", demand: "Use three passers when space allows. If the pass drifts, set a high ball to the left hitter.", check: "a pass that leaves the setter an attack option", rally: "a third-touch attack with a teammate ready to cover it", samples: 7, rallies: 5 },
      "16U": { buildDemand: "Feed a ball that pulls the passer sideways. Call who takes the second ball before the pass lands.", demand: "Try two receive rotations. If the setter passes first, the backup calls for the second ball.", check: "a playable pass with the second-ball player called early", rally: "a three-touch attack using the called set or backup option", samples: 8, rallies: 6 }
    }
  },
  ro: {
    key: "first-contact", title: "Preluare, ridicare, minge peste fileu", skill: "Passing", focus: "Prima atingere",
    headline: "Trimite preluarea înalt, spre un coechipier. Joacă în trei atingeri.",
    prep: "Marchează locul ridicătorului puțin la dreapta centrului, la un pas de fileu.",
    cue: "Strigă din timp. Trimite mingea sus.",
    debrief: "Ce l-a ajutat pe coechipier să ajungă la preluare?",
    sampleLabel: "Preluări jucabile", rallyLabel: "Mingi returnate în trei atingeri",
    eligible: "un serviciu în teren sau o minge ușoară trimisă peste fileu",
    pressureStart: "Trimite o minge scurtă și una lungă peste fileu. Apoi lasă jucătorul care lansează mingea să aleagă.",
    game: { title: "Joc în trei atingeri", start: "Începe fiecare schimb cu un serviciu. Apropie jucătorul de fileu dacă e nevoie." },
    pressureCoaching: [
      { label: "Schimbă lungimea", text: "Trimite mingea scurtă imediat după linia de atac, iar pe cea lungă cu câțiva pași mai în spate. Păstrează același ritm." },
      { label: "Dacă strigă târziu", text: "Oprește jocul înainte de următoarea minge. Cere-le ambilor jucători să arate cine ia mingea dintre ei, apoi reia." }
    ],
    gameCoaching: [
      { label: "Cum ții scorul", text: "Un jucător de pe margine notează mingile returnate în trei atingeri. Notează prima ocazie a echipei la primire, apoi urmărește restul schimbului pentru bonus." },
      { label: "Păstrează mingea în joc", text: "Dacă serviciul încheie schimbul prea des, mută linia de serviciu cu un pas înainte. Mut-o înapoi când primirea poate construi din nou trei atingeri." }
    ],
    build: {
      title: "Preluare la țintă", why: "Dă-i coechipierului timp să ajungă la minge.",
      setup: "Un jucător lansează mingea de peste fileu. Unul preia din spate. Al treilea stă la țintă, la un pas de fileu, puțin la dreapta centrului.",
      steps: ["Trimite o minge ușoară peste fileu. Jucătorul care preia strigă «Eu!» și trimite mingea înalt la țintă.",
        "Jucătorul de la țintă prinde mingea și spune «Bună!» dacă ajunge la ea. Schimbați rolurile după trei mingi."],
      cues: ["Strigă înainte să atingi mingea.", "Orientează antebrațele spre țintă."],
      easier: "Aruncă mingea de aproape de fileu. Lasă jucătorul de la țintă să se deplaseze mai mult.",
      harder: "Alternează mingi scurte și lungi. Jucătorul de la țintă ridică mingea în loc s-o prindă.",
      coaching: [
        { label: "Unde stau jucătorii", text: "Jucătorul la preluare pornește la mijloc între linia de atac și linia de fund. Ținta stă puțin la dreapta centrului, la aproximativ 1 m de fileu. Cel care trimite mingea stă în fața jucătorului la preluare, dincolo de fileu." },
        { label: "Cum schimbați rolurile", text: "După trei mingi, jucătorul la preluare trece la țintă, cel de la țintă trimite mingea, iar cel care trimite trece la preluare. Treceți pe lângă fileu când jocul e oprit." },
        { label: "Cum arată o preluare bună", text: "Jucătorul de la țintă prinde mingea deasupra pieptului, cu cel mult un pas. Mingea nu trece fileul." },
        { label: "Dacă mingea pleacă prea jos", text: "Trimite o minge mai lentă. Cere-i jucătorului să arate unghiul antebrațelor înainte să vină mingea și să-l păstreze la contact." }
      ]
    },
    link: {
      title: "Strigă, preia, ridică, trimite", why: "Joacă în trei atingeri pe ambele părți.",
      setup: "Pe fiecare parte, pune doi jucători la preluare în spate și un ridicător lângă fileu.",
      steps: ["Trimite o minge ușoară peste fileu. Un jucător strigă «Eu!» și preia spre ridicător.",
        "Ridică pentru un coechipier. Acesta trimite mingea peste fileu la a treia atingere. Alternați echipa care începe."],
      cues: ["Strigă «Eu!» din timp.", "Trimite-i coechipierului o minge înaltă."],
      easier: "Începe cu o aruncare ușoară. Lasă ridicătorul să prindă și să arunce mingea o dată.",
      harder: "Începe cu serviciu. Joacă trei atingeri fără prindere și revino în apărare.",
      coaching: [
        { label: "Unde stau jucătorii", text: "Cei doi jucători la preluare împart terenul din spate. Ridicătorul stă la un pas de fileu. După apel, jucătorul fără minge se deschide în lateral pentru ridicare." },
        { label: "Cum schimbați rolurile", text: "Alternați echipa care trimite prima minge după fiecare schimb. Schimbați ridicătorul după trei mingi, ca să încerce toată lumea." },
        { label: "Cum arată o execuție bună", text: "Preluarea îi dă timp ridicătorului să se întoarcă spre al treilea jucător. Acesta trimite mingea controlat peste fileu, apoi echipa se pregătește să apere." },
        { label: "Dacă ambii aleargă la minge", text: "Arată spațiul dintre ei și desemnează cine îl acoperă. Reia cu o minge la aceeași viteză." }
      ]
    },
    ages: {
      "13U": { buildDemand: "Începe cu mingi aruncate. Treci la serviciu de aproape când preluările ajung la țintă.", demand: "Pune doi jucători la preluare. Stabiliți cine ia mingea dintre ei.", check: "un «Eu!» spus din timp și o preluare la care ajunge un coechipier", rally: "trei atingeri și o minge controlată peste fileu", samples: 6, rallies: 4 },
      "14U": { buildDemand: "Alternează mingi scurte și lungi. Dacă adaugi un al doilea jucător, stabiliți cine ia mingea dintre ei.", demand: "Stabiliți cine preia mingea dintre jucători. Celălalt se pregătește de atac.", check: "o preluare la țintă făcută de jucătorul desemnat", rally: "trei atingeri și o minge trimisă departe de apărătorul cel mai apropiat", samples: 7, rallies: 5 },
      "15U": { buildDemand: "Trimite mingi spre corp și în lateral. Cere preluări înalte, la distanță de fileu.", demand: "Pune trei jucători la preluare dacă ai loc. La o preluare imprecisă, ridică înalt pentru extrema stângă.", check: "o preluare care îi lasă ridicătorului o opțiune de atac", rally: "un atac la a treia atingere, cu un coechipier la dublaj", samples: 7, rallies: 5 },
      "16U": { buildDemand: "Trimite mingea în lateral. Spuneți cine ia mingea a doua înainte să cadă preluarea.", demand: "Încearcă două rotații la primire. Dacă ridicătorul preia, jucătorul de rezervă cere mingea a doua.", check: "o preluare jucabilă și un jucător anunțat din timp pentru mingea a doua", rally: "un atac în trei atingeri, cu ridicarea cerută sau cu soluția de rezervă", samples: 8, rallies: 6 }
    }
  }
}, {
  en: {
    key: "side-out", title: "Serve and Win on Receive", skill: "Serving", focus: "Targeted serves and the first attack",
    headline: "Aim your serve. On receive, build an attack right away.",
    prep: "Mark left and right serve targets. For 15U–16U, add short and deep targets.",
    cue: "Pick a spot. Serve. Step onto the court.",
    debrief: "Which serve made it hardest to attack?",
    sampleLabel: "Serves on target", rallyLabel: "Points won on the first attack",
    eligible: "a serve in",
    pressureStart: "Keep the same receive positions for three serves. On the third, aim at a different spot.",
    game: { title: "First-Attack Bonus Game", start: "Start every rally with a serve. Change the receive positions after each mini-set." },
    pressureCoaching: [
      { label: "Pick the new target", text: "Serve deep twice, then try the space just past the attack line. With younger players, use the other half of the court instead." },
      { label: "Check the adjustment", text: "Watch the receiver's first step on serve contact. If they lean back before the toss, ask them to start balanced and read the ball first." }
    ],
    gameCoaching: [
      { label: "Score it", text: "Award the first-attack bonus only when the receiving side wins the point on its first attack. A later rally win earns the normal point." },
      { label: "Reset the mini-set", text: "Name the next receive positions and who owns the space between passers. Start the next round from that look." }
    ],
    build: {
      title: "Serve to a Marked Spot", why: "Repeat the same serve routine with a clear target.",
      setup: "Server on one side. Passer and target across the net. Put the target a step off the net.",
      steps: ["Call your target. Take a breath and serve. The passer sends any serve in to the target.",
        "After each serve, step into the court. Rotate server → passer → target after three balls."],
      cues: ["Look at your target before the toss.", "Finish balanced. Step in."],
      easier: "Serve closer and aim at a whole half of the court.",
      harder: "Serve from the end line. Aim between two passers or near a corner.",
      coaching: [
        { label: "Where to stand", text: "The server faces the passer from the other half. Put the passer near the middle of the receiving half and the target about 1 m off the net. Use the center of the court to split left and right serve targets." },
        { label: "Rotate", text: "Serve a set of three. The server becomes the passer, the passer moves to target, and the target goes to serve when all balls have stopped." },
        { label: "Good rep", text: "The server names the target before the toss. The ball lands in the called area or would land there if the passer left it." },
        { label: "Fix scattered serves", text: "Widen the target and move the line in one step. Ask the player to keep the toss in front of the hitting shoulder." }
      ]
    },
    link: {
      title: "Receive, Set, Attack", why: "Build an attack straight from a serve.",
      setup: "Receivers in back, setter near the net, hitter on the left. Put the server and defenders across the net.",
      steps: ["Name who takes the ball between passers. Serve, pass, set, and attack.",
        "Rotate servers after three balls. Switch serving and receiving sides halfway through."],
      cues: ["Call who has the middle ball.", "On a wide pass, set high."],
      easier: "Move the server in. Keep the receivers in the same spots.",
      harder: "Mix short and deep serves. Start in your weakest receive rotation.",
      coaching: [
        { label: "Where to stand", text: "Spread passers across the backcourt. Set from just right of center. The left hitter starts wide of the court and approaches after reading the pass." },
        { label: "Who takes the second ball", text: "Name a backup setter before the serve. If the setter takes first contact, the backup calls and sends a high ball toward a ready hitter." },
        { label: "Good rep", text: "The passer calls early, the set stays off the net, and the hitter is able to choose an attack on the first swing." },
        { label: "Fix two passers freezing", text: "Pause before the serve and assign the space between them. Replay the same serve before making it harder." }
      ]
    },
    ages: {
      "13U": { buildDemand: "Aim at either half. Move the serving line closer for players who need it.", demand: "Use two passers and name the setter. A standing third touch can score.", check: "a serve in the called half", rally: "a point won by the receiving team on a controlled third touch", samples: 5, rallies: 3 },
      "14U": { buildDemand: "Call left or right before every serve. Track which half you hit.", demand: "Use three passers when space allows. If the pass drifts, set a high ball to the left hitter.", check: "a serve in the called half from the assigned line", rally: "a point won on the receiving team's first attack or roll shot", samples: 6, rallies: 4 },
      "15U": { buildDemand: "Serve from the end line. Aim between two passers or at a deep corner.", demand: "On a good pass, set left or right. On a wide pass, set high to a hitter who is ready.", check: "an end-line serve into the called gap or corner", rally: "a point won on the receiving team's first attack after choosing the right set", samples: 6, rallies: 4 },
      "16U": { buildDemand: "Call a gap, short spot, or deep spot. Keep your usual routine under score pressure.", demand: "Start in your weakest receive rotation. Keep two hitters ready, even when the server changes depth.", check: "an end-line serve into the called gap, short spot, or deep spot", rally: "a point won on the first attack against a serve in the chosen rotation", samples: 7, rallies: 5 }
    }
  },
  ro: {
    key: "side-out", title: "Serviciu și punct din primire", skill: "Serving", focus: "Serviciu la țintă și primul atac",
    headline: "Servește la țintă. La primire, construiește atacul din prima.",
    prep: "Marchează ținte în stânga și în dreapta. La 15U–16U, adaugă ținte scurte și lungi.",
    cue: "Alege ținta. Servește. Intră în teren.",
    debrief: "Ce serviciu a făcut atacul cel mai greu?",
    sampleLabel: "Servicii la țintă", rallyLabel: "Puncte din primul atac",
    eligible: "un serviciu în teren",
    pressureStart: "Păstrează aceleași poziții la primire pentru trei servicii. La al treilea, schimbă ținta.",
    game: { title: "Joc cu bonus la primul atac", start: "Începe fiecare schimb cu serviciu. Schimbă pozițiile la primire după fiecare mini-set." },
    pressureCoaching: [
      { label: "Alege ținta nouă", text: "Servește lung de două ori, apoi țintește imediat după linia de atac. La cei mai mici, poți schimba doar jumătatea de teren." },
      { label: "Urmărește primul pas", text: "Privește primul pas al jucătorului la contactul de serviciu. Dacă se lasă pe spate înainte de lansare, cere-i să pornească echilibrat și să citească mingea." }
    ],
    gameCoaching: [
      { label: "Cum ții scorul", text: "Dă bonus doar dacă echipa la primire câștigă punctul la primul atac. Dacă îl câștigă mai târziu, primește punctul obișnuit." },
      { label: "Între mini-seturi", text: "Stabilește următoarele poziții la primire și cine preia mingea dintre jucători. Începe următoarea rundă din acea așezare." }
    ],
    build: {
      title: "Serviciu la o țintă marcată", why: "Repetă rutina de serviciu cu o țintă clară.",
      setup: "Un jucător servește de pe o parte. Dincolo de fileu sunt un jucător la preluare și unul la țintă, la un pas de fileu.",
      steps: ["Spune ținta. Respiră și servește. Jucătorul de la primire preia serviciile din teren spre țintă.",
        "Intră în teren după serviciu. După trei mingi, rotește rolurile: serviciu → preluare → țintă."],
      cues: ["Privește ținta înainte de lansare.", "Rămâi în echilibru. Intră în teren."],
      easier: "Servește de mai aproape. Țintește o jumătate întreagă de teren.",
      harder: "Servește de la linia de fund. Țintește între doi jucători sau lângă un colț.",
      coaching: [
        { label: "Unde stau jucătorii", text: "Jucătorul la serviciu stă cu fața la cel de la preluare, dincolo de fileu. Pune jucătorul la preluare în mijlocul jumătății sale, iar ținta la aproximativ 1 m de fileu. Folosește mijlocul terenului ca reper între stânga și dreapta." },
        { label: "Cum schimbați rolurile", text: "Servește trei mingi. Cel de la serviciu trece la preluare, cel de la preluare trece la țintă, iar cel de la țintă merge la serviciu după ce toate mingile s-au oprit." },
        { label: "Cum arată un serviciu bun", text: "Jucătorul spune ținta înainte de lansare. Mingea cade în zona anunțată sau ar cădea acolo dacă nu ar fi preluată." },
        { label: "Dacă serviciile nu ajung la țintă", text: "Mărește ținta și mută linia cu un pas înainte. Cere-i jucătorului să lanseze mingea în fața umărului cu care lovește." }
      ]
    },
    link: {
      title: "Primește, ridică, atacă", why: "Construiește atacul direct din primirea serviciului.",
      setup: "Jucătorii la preluare stau în spate, ridicătorul lângă fileu și atacantul în stânga. Pe cealaltă parte stau jucătorul la serviciu și apărătorii.",
      steps: ["Stabiliți cine ia mingea dintre jucători. Servește, preia, ridică și atacă.",
        "Schimbați jucătorul la serviciu după trei mingi. La jumătate, inversați echipele la serviciu și la primire."],
      cues: ["Stabiliți cine ia mingea dintre voi.", "La o preluare imprecisă, ridică înalt."],
      easier: "Apropie jucătorul la serviciu de fileu. Păstrează aceleași poziții la primire.",
      harder: "Alternează servicii scurte și lungi. Începe în rotația cea mai grea la primire.",
      coaching: [
        { label: "Unde stau jucătorii", text: "Răspândește jucătorii la preluare în spate. Ridicătorul stă puțin la dreapta centrului. Extrema stângă pornește din lateral și începe elanul după ce citește preluarea." },
        { label: "Cine ia mingea a doua", text: "Stabilește un al doilea ridicător înainte de serviciu. Dacă ridicătorul preia, jucătorul desemnat cere mingea și o ridică înalt pentru un atacant pregătit." },
        { label: "Cum arată o execuție bună", text: "Jucătorul la preluare strigă din timp, ridicarea rămâne la distanță de fileu, iar atacantul poate alege cum să lovească din prima." },
        { label: "Dacă nimeni nu preia", text: "Oprește jocul înainte de serviciu și stabilește cine ia mingea dintre jucători. Repetă același serviciu înainte să crești dificultatea." }
      ]
    },
    ages: {
      "13U": { buildDemand: "Țintește una dintre jumătăți. Apropie de fileu linia de serviciu pentru cei care au nevoie.", demand: "Pune doi jucători la preluare și desemnează ridicătorul. Mingea trimisă fără săritură la a treia atingere poate aduce punct.", check: "un serviciu în jumătatea anunțată", rally: "un punct câștigat de echipa la primire cu o a treia atingere controlată", samples: 5, rallies: 3 },
      "14U": { buildDemand: "Spune «stânga» sau «dreapta» înainte de fiecare serviciu. Notează unde cade mingea.", demand: "Pune trei jucători la preluare dacă ai loc. La o preluare imprecisă, ridică înalt pentru extrema stângă.", check: "un serviciu în jumătatea anunțată, de la linia stabilită", rally: "un punct câștigat din primul atac al echipei la primire, inclusiv cu o lovitură plasată", samples: 6, rallies: 4 },
      "15U": { buildDemand: "Servește de la linia de fund. Țintește între doi jucători sau într-un colț din spate.", demand: "La o preluare bună, ridică în stânga sau în dreapta. La o preluare imprecisă, ridică înalt pentru un atacant pregătit.", check: "un serviciu de la linia de fund în spațiul sau colțul anunțat", rally: "un punct câștigat din primul atac al echipei la primire, după o ridicare aleasă bine", samples: 6, rallies: 4 },
      "16U": { buildDemand: "Anunță spațiul dintre jucători sau o țintă scurtă ori lungă. Păstrează rutina și când scorul e strâns.", demand: "Începe în rotația cea mai grea la primire. Ține doi atacanți pregătiți când serviciul schimbă lungimea.", check: "un serviciu de la linia de fund în spațiul sau zona anunțată", rally: "un punct din primul atac după un serviciu în teren, în rotația aleasă", samples: 7, rallies: 5 }
    }
  }
}, {
  en: {
    key: "attack-choice", title: "Hit the Open Space", skill: "Hitting", focus: "Attack choices and coverage",
    headline: "Look at the set and the defense. Hit where the court is open.",
    prep: "Clear the hitter's takeoff and landing space. Mark one short and one deep target.",
    cue: "See the set. Find the open spot.",
    debrief: "When did a softer shot work better?",
    sampleLabel: "Attacks to open space", rallyLabel: "Good attack choices in a rally",
    eligible: "a third ball the hitter can attack, including sets off the net",
    pressureStart: "Start with an easy ball over. Set the first ball high and off the net, then let the next pass guide the set.",
    game: { title: "Open-Space Bonus Game", start: "Start with a serve. The hitter picks an open spot. Teammates cover before contact." },
    pressureCoaching: [
      { label: "Show two pictures", text: "Use one high set a step or two off the net, then a set the hitter can reach in their usual approach. Ask what changed about the shot." },
      { label: "Fix a forced swing", text: "If the hitter chases a wide set and swings off balance, repeat it with a standing roll into the open half. Add the jump back when they are balanced." }
    ],
    gameCoaching: [
      { label: "Watch the open space", text: "Assign a scorer to watch where the defender stands at hitter contact. Track whether the attack goes into the open half and stays in." },
      { label: "Check the cover", text: "Look for a teammate low near the hitter and, when required, one deeper. Both should be outside the landing path when the ball is hit." }
    ],
    build: {
      title: "Look, Then Hit", why: "Pick a shot that fits the set and the defense.",
      setup: "Passer in backcourt, setter near the net, hitter on the left. One defender across the net.",
      steps: ["The defender sends an easy ball across. Pass to the setter. Mix a left-side set with a high set off the net.",
        "The hitter aims short or deep, away from the defender. Rotate hitters after three attacks."],
      cues: ["See the set before you move.", "Contact in front of your hitting shoulder."],
      easier: "Hit from the floor. Leave one big target open.",
      harder: "Let the defender move late. Add one blocker if both players can land safely.",
      coaching: [
        { label: "Where to stand", text: "Set from near center, about 1 m off the net. Give the left hitter a clear approach along the sideline. Mark a short and a deep zone across the net with flat tape." },
        { label: "Rotate", text: "Give the hitter three attempts. Bring in a new hitter and let the previous one pass or defend. Collect balls after the last attack of the round." },
        { label: "Good rep", text: "The hitter sees which space the defender leaves and directs a balanced shot there. Ask them to name the space before the next feed." },
        { label: "Fix an early approach", text: "Have the hitter wait until the setter touches the ball. Rehearse from the floor first, then add the jump." }
      ]
    },
    link: {
      title: "Attack and Cover", why: "Cover the hitter so the team can play a ball that comes back.",
      setup: "Two teams across the net. One teammate covers short near the hitter. Another covers deep.",
      steps: ["Start with a serve or easy ball over. The hitter aims at open space. Teammates move to short and deep cover before contact.",
        "Play the rally out. If the ball comes back, reset for another attack. Alternate which side starts."],
      cues: ["Get low to cover.", "Leave the hitter's landing space clear."],
      easier: "Start with an easy ball and one deep defender. Hit from the floor if space is tight.",
      harder: "Add a live block. Mix good passes with passes off the net.",
      coaching: [
        { label: "Where to stand", text: "The short cover player starts near the hitter but clear of the approach and landing lane. The deeper cover player stays several steps behind, facing the block." },
        { label: "Who takes the return", text: "Short cover takes a ball dropping off the block. Deep cover takes a longer deflection. Call for the ball and pass high to a teammate." },
        { label: "Good rep", text: "Both cover players are ready at hitter contact. If the ball returns, the first cover touch gives the team time to set again." },
        { label: "Fix late cover", text: "Freeze as the set reaches its peak. Move cover players into their spots, then replay the same ball at a slower pace." }
      ]
    },
    ages: {
      "13U": { buildDemand: "Hit from the floor or with a low jump. Choose between two large targets.", demand: "Offer one big short target and one deep target. Ask the hitter which was open.", check: "a balanced attack into the open short or deep half", rally: "a third touch that lands in the open half", samples: 5, rallies: 4 },
      "14U": { buildDemand: "Swing on a good set. Use a softer roll shot when the set drifts off the net.", demand: "Call one teammate to cover short. Choose a swing or roll shot based on the set.", check: "a swing or roll shot that fits the set", rally: "an attack in with a teammate covering short", samples: 6, rallies: 4 },
      "15U": { buildDemand: "Let the defender move late. Hit deep on a good set or roll the ball deep on a tough set.", demand: "Name the short and deep cover players. Pick the shot after seeing the set and defender.", check: "an in-bounds attack that fits the set and defender's position", rally: "an attack in with both short and deep cover in place", samples: 7, rallies: 5 },
      "16U": { buildDemand: "If you can add a blocker safely, hit past the block on a good set. Use a deep roll shot on a tough set.", demand: "Use your usual block and defense. After the attack, get back to defensive positions right away.", check: "an attack in that fits the set, the block, and the defense", rally: "an attack in with cover and a quick return to defense", samples: 7, rallies: 6 }
    }
  },
  ro: {
    key: "attack-choice", title: "Atacă în spațiul liber", skill: "Hitting", focus: "Alegerea loviturii și dublajul",
    headline: "Uită-te la ridicare și la apărare. Atacă unde e liber.",
    prep: "Lasă liber locul de desprindere și aterizare. Marchează o țintă scurtă și una lungă.",
    cue: "Urmărește ridicarea. Caută locul liber.",
    debrief: "Când a mers mai bine o lovitură plasată?",
    sampleLabel: "Atacuri în spațiul liber", rallyLabel: "Lovituri bine alese în joc",
    eligible: "o a treia minge care poate fi atacată, inclusiv departe de fileu",
    pressureStart: "Începe cu o minge ușoară peste fileu. Prima ridicare e înaltă și depărtată de fileu. Apoi alege ridicarea după preluare.",
    game: { title: "Joc cu bonus pentru atac în spațiul liber", start: "Începe cu serviciu. Atacantul caută locul liber. Coechipierii intră la dublaj înainte de lovitură." },
    pressureCoaching: [
      { label: "Arată două situații", text: "Ridică o minge înaltă, la un pas sau doi de fileu, apoi una la care atacantul ajunge cu elanul obișnuit. Întreabă ce a schimbat la lovitură." },
      { label: "Dacă forțează lovitura", text: "Dacă atacantul aleargă după o ridicare prea largă și lovește dezechilibrat, repetă cu o minge plasată fără săritură în jumătatea liberă. Reia săritura când e în echilibru." }
    ],
    gameCoaching: [
      { label: "Urmărește spațiul liber", text: "Pune un jucător să urmărească unde stă apărătorul când se lovește mingea. Notează dacă atacul merge în jumătatea liberă și rămâne în teren." },
      { label: "Verifică dublajul", text: "Urmărește un coechipier coborât lângă atacant și, când e cazul, unul mai în spate. La lovitură, ambii trebuie să lase liberă zona de aterizare." }
    ],
    build: {
      title: "Privește, apoi lovește", why: "Alege lovitura după ridicare și poziția apărătorului.",
      setup: "Jucător la preluare în spate, ridicător lângă fileu și atacant în stânga. Un apărător dincolo de fileu.",
      steps: ["Apărătorul trimite o minge ușoară peste fileu. Preia spre ridicător. Alternează o ridicare în stânga cu una înaltă, mai departe de fileu.",
        "Atacantul lovește scurt sau lung, departe de apărător. Schimbați atacantul după trei lovituri."],
      cues: ["Urmărește ridicarea înainte să pornești.", "Lovește mingea în fața umărului."],
      easier: "Lovește fără să sari. Lasă liberă o țintă mare.",
      harder: "Lasă apărătorul să se miște în ultimul moment. Adaugă un blocaj dacă ambii jucători au loc să aterizeze.",
      coaching: [
        { label: "Unde stau jucătorii", text: "Ridică din apropierea centrului, la aproximativ 1 m de fileu. Lasă extrema stângă să-și ia elanul liber pe lângă linia laterală. Marchează cu bandă o țintă scurtă și una lungă dincolo de fileu." },
        { label: "Cum schimbați rolurile", text: "Dă-i atacantului trei mingi. Intră alt atacant, iar cel de dinainte trece la preluare sau în apărare. Strânge mingile după ultima lovitură a rundei." },
        { label: "Cum arată un atac bun", text: "Atacantul vede locul lăsat liber de apărător și lovește controlat acolo. Cere-i să spună unde era loc liber înainte de următoarea minge." },
        { label: "Dacă pornește prea devreme", text: "Cere-i să aștepte până când ridicătorul atinge mingea. Repetă întâi fără săritură, apoi adaugă săritura." }
      ]
    },
    link: {
      title: "Atac și dublaj", why: "Intră la dublaj ca echipa să poată juca mingea întoarsă.",
      setup: "Două echipe la fileu. Un coechipier acoperă scurt lângă atacant. Altul acoperă în spate.",
      steps: ["Începe cu serviciu sau o minge ușoară. Atacantul țintește spațiul liber. Coechipierii acoperă scurt și lung înainte de lovitură.",
        "Joacă schimbul până la capăt. Dacă revine mingea, pregătiți alt atac. Alternați echipa care începe."],
      cues: ["Coboară centrul de greutate la dublaj.", "Lasă liber locul de aterizare al atacantului."],
      easier: "Începe cu o minge ușoară și un apărător în spate. Lovește fără să sari dacă terenul e îngust.",
      harder: "Adaugă blocaj la fileu. Alternează preluări bune și preluări depărtate de fileu.",
      coaching: [
        { label: "Unde stau jucătorii", text: "Jucătorul la dublaj scurt stă lângă atacant, cu loc liber pentru elan și aterizare. Cel din spate stă cu câțiva pași mai departe, cu fața la blocaj." },
        { label: "Cine ia mingea întoarsă", text: "Jucătorul din față ia mingea care cade scurt din blocaj. Cel din spate ia mingea deviată lung. Strigă și trimite mingea înalt spre un coechipier." },
        { label: "Cum arată un dublaj bun", text: "Ambii jucători sunt pregătiți când atacantul lovește. Dacă mingea revine, prima atingere îi dă timp echipei să ridice din nou." },
        { label: "Dacă ajung târziu la dublaj", text: "Oprește exercițiul când ridicarea ajunge sus. Așază jucătorii la dublaj, apoi repetă aceeași minge mai lent." }
      ]
    },
    ages: {
      "13U": { buildDemand: "Lovește fără săritură sau cu o săritură mică. Alege între două ținte mari.", demand: "Oferă o țintă mare în față și una în spate. Întreabă atacantul care era liberă.", check: "o lovitură controlată în jumătatea liberă, scurtă sau lungă", rally: "o a treia atingere care cade în jumătatea liberă", samples: 5, rallies: 4 },
      "14U": { buildDemand: "Atacă la o ridicare bună. Plasează mingea când ridicarea e prea departe de fileu.", demand: "Desemnează un jucător la dublaj scurt. Alege o lovitură puternică sau plasată după ridicare.", check: "o lovitură puternică sau plasată, potrivită ridicării", rally: "un atac în teren, cu un coechipier la dublaj scurt", samples: 6, rallies: 4 },
      "15U": { buildDemand: "Lasă apărătorul să se miște târziu. La o ridicare bună, lovește lung. La una grea, plasează mingea în spate.", demand: "Desemnează cine acoperă scurt și cine acoperă lung. Alege lovitura după ridicare și poziția apărătorului.", check: "un atac în teren, potrivit ridicării și poziției apărătorului", rally: "un atac în teren, cu dublaj scurt și lung", samples: 7, rallies: 5 },
      "16U": { buildDemand: "Dacă e loc pentru blocaj, atacă pe lângă el când ridicarea e bună. La o ridicare grea, plasează lung.", demand: "Folosește blocajul și așezarea voastră obișnuită în apărare. Revino în poziția de apărare imediat după atac.", check: "un atac în teren, ales după ridicare, blocaj și apărare", rally: "un atac în teren, cu dublaj și revenire rapidă în apărare", samples: 7, rallies: 6 }
    }
  }
});
