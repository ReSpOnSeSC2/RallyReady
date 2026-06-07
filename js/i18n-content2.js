// i18n-content2.js — Romanian dictionary, part 3 of 4: season/camp narratives,
// the generator's plan copy, the Tips visuals, and the volleyball glossary.
// Also holds the runtime PATTERN rules for the Today / Season status lines.
//
// Loads after i18n.js. Keys are the EXACT English source with straight quotes.
(function () {
  "use strict";
  if (!RR.i18n) return;
  var t = RR.i18n.t;

  RR.i18n.add({
    // ---- periodization: phase focus summaries ----
    "Build the fundamentals and good habits at a low, confident intensity.": "Construiește bazele și obiceiurile bune la o intensitate mică, în siguranță.",
    "Connect the skills together and steadily raise the workload.": "Leagă deprinderile între ele și crește treptat volumul de lucru.",
    "Sharpen full-speed systems at the season's highest intensity.": "Pune la punct sistemele la viteză maximă, la cea mai mare intensitate din sezon.",
    "Ease the volume, keep it crisp, and build confidence for the opener.": "Reduci volumul, păstrezi totul curat și prinzi încredere pentru primul meci.",
    "Maintain sharpness with undulating, game-focused practices.": "Menții forma cu antrenamente variate, axate pe joc.",
    "Learn names, have fun, and get comfortable with the ball.": "Învățați numele, distrați-vă și obișnuiți-vă cu mingea.",
    "Teach core skills with a fresh themed skill each day.": "Predă deprinderile de bază, cu câte o temă nouă în fiecare zi.",
    "Celebrate with favorite games, a mini-tournament, and awards.": "Sărbătoriți cu jocurile preferate, un mini-turneu și premii.",
    "A bit of everything: welcome, a core skill, games, and a send-off.": "Câte puțin din toate: primire, o deprindere de bază, jocuri și un final pe cinste.",

    // ---- periodization: phase "why" copy ----
    "Early reps on the basics — passing platforms, serving routines, ball control — give every player a base to grow from, with low pressure so technique sticks.": "Primele repetări pe baze — platforma brațelor la preluare, rutina la serviciu, controlul mingii — dau fiecărui jucător o temelie de la care să crească, fără presiune, ca tehnica să se fixeze.",
    "With the basics in place we link them up — serve receive into setting into attack — and add competitive reps so players adapt to game speed.": "Cu bazele puse, le legăm între ele — preluarea serviciului, ridicarea, apoi atacul — și adăugăm repetări competitive, ca jucătorii să se adapteze la viteza de joc.",
    "This is the hardest block: game-like, full-speed reps and team systems so the squad is firing on all cylinders heading into the opener.": "E cel mai greu bloc: repetări ca în meci, la viteză maximă, și sisteme de echipă, ca lotul să fie la turație maximă înainte de primul meci.",
    "We cut the workload so legs are fresh, run only familiar drills (no new complex material), and finish on confidence games so players arrive believing in themselves.": "Reducem volumul ca picioarele să fie odihnite, facem doar exerciții cunoscute (nimic nou și complicat) și terminăm cu jocuri care dau încredere, ca jucătorii să ajungă crezând în ei.",
    "Through the season we keep skills sharp with moderate, varied intensity — enough to keep improving and stay fresh without burning out between matches.": "În timpul sezonului ținem deprinderile ascuțite cu o intensitate moderată și variată — suficient cât să progresăm și să rămânem proaspeți, fără să ne epuizăm între meciuri.",
    "Day one is about belonging and touches — names, rituals, and lots of ball-handling games so every camper leaves smiling and ready to come back.": "Prima zi e despre apartenență și contacte cu mingea — nume, ritualuri și multe jocuri cu mingea, ca fiecare copil să plece zâmbind și gata să revină.",
    "The middle of camp is real volleyball — a 'skill of the day' plus small-sided games — so campers feel themselves improving fast.": "Mijlocul taberei e volei adevărat — o „deprindere a zilei” plus jocuri pe teren redus — ca cei mici să simtă că progresează repede.",
    "We lighten the load and let campers show what they've learned — favorite games, a mini-tournament, and high-fives — so camp ends on its highest note.": "Reducem efortul și îi lăsăm pe copii să arate ce au învățat — jocuri preferate, un mini-turneu și bătut palma — ca tabăra să se termine cum nu se poate mai frumos.",
    "With a single day we pack the whole arc into one session — names and ball-handling to start, a core skill in the middle, and favorite games to finish.": "Într-o singură zi strângem tot parcursul într-o ședință — nume și joc cu mingea la început, o deprindere de bază la mijloc și jocuri preferate la final.",

    // ---- generator: block "why" copy + coach note ----
    "A staple warm-up gets bodies loose and hands on the ball before the work starts.": "O încălzire clasică dezmorțește trupul și pune mâinile pe minge înainte să înceapă treaba.",
    "Cool down, stretch, and recap the day's focus so the lesson sticks.": "Revenire, întinderi și o recapitulare a temei zilei, ca lecția să rămână.",
    "Celebrate with a favorite, light-hearted mini-tournament to show off the week.": "Sărbătoriți cu un mini-turneu preferat și relaxat, ca să arătați ce ați făcut toată săptămâna.",
    "A cooperative game so everyone keeps the ball alive and stays in it.": "Un joc de cooperare, ca toți să țină mingea în joc și să rămână implicați.",
    "Apply the skill in a small-sided game where every rep counts.": "Aplică deprinderea într-un joc pe teren redus, unde fiecare repetare contează.",
    "A second quick game keeps energy high and exposes campers to more of the sport.": "Un al doilea joc scurt ține energia sus și îi apropie pe copii și mai mult de acest sport.",
    "A familiar, confidence-building favorite — keep it light and send them in believing.": "Un joc preferat, cunoscut, care dă încredere — păstrează-l lejer și trimite-i în teren crezând în ei.",
    "A ball-control anchor (Pepper / partner passing) that recurs each week — rotated for freshness.": "Un reper de control al mingii (Pepper / preluare în doi) care revine în fiecare săptămână — rotit ca să nu devină plictisitor.",
    "Serving reps — like a real program, get serves and serve-receive in nearly every practice.": "Repetări la serviciu — ca într-un program serios, pune serviciu și preluarea serviciului la aproape fiecare antrenament.",
    "A competitive, game-speed scrimmage to sharpen everything under pressure.": "Un joc-școală competitiv, la viteza meciului, ca să pui totul la punct sub presiune.",
    "A cooperative scoring game so players compete with the rally, not each other.": "Un joc de cooperare cu punctaj, ca jucătorii să se lupte cu faza de joc, nu între ei.",
    "Keep instructions short, maximise ball contacts, and finish on a game.": "Ține instrucțiunile scurte, maximizează contactele cu mingea și termină cu un joc.",

    // ---- tips-visuals: six core skill captions ----
    "A calm toss, a full arm swing, and the ball clears the net into the open court.": "O aruncare calmă, un braț întins complet și mingea trece fileul în terenul liber.",
    "Read the serve, drop a flat platform angled to the target, and pop it up to the setter.": "Citește serviciul, coboară platforma brațelor plată și orientată spre țintă și ridică mingea ușor către ridicător.",
    "Take the ball high in a relaxed triangle, then push through the legs out to the hitter.": "Prinde mingea sus, în triunghi relaxat, apoi împinge din picioare către atacant.",
    "Time the approach (left–right–left), contact the ball high, and snap it down over the net.": "Cronometrează elanul (stânga–dreapta–stânga), lovește mingea sus și trimite-o în jos peste fileu.",
    "Press the hands over the net, watch the hitter, and turn the attack straight back down.": "Împinge mâinile peste fileu, urmărește atacantul și întoarce atacul direct în jos.",
    "Stay low, get the platform to the ball, and lift a hard-driven attack back up high.": "Stai jos, du platforma brațelor la minge și ridică sus un atac puternic.",

    // ---- tips-visuals: hero diagrams ----
    "A practice that flows": "Un antrenament care curge",
    "Run practice in clear blocks and keep each one moving — warm-up, a couple of skill blocks, a game, then a cool-down.": "Ține antrenamentul pe blocuri clare și menține ritmul fiecăruia — încălzire, câteva blocuri de deprinderi, un joc, apoi revenire.",
    "The reset breath": "Respirația de resetare",
    "A slow breath — in, hold, out — and a cue word settle the nerves so the last mistake doesn't carry to the next rally.": "O respirație lentă — inspiri, ții, expiri — și un cuvânt-cheie liniștesc nervii, ca ultima greșeală să nu treacă în faza următoare.",
    "breathe": "respiră",
    "Rotate clockwise": "Rotație în sensul acelor de ceasornic",
    "Each time you win the serve, everyone rotates one spot clockwise: 1 → 6 → 5 → 4 → 3 → 2. Line up legally and you never give away a point.": "De fiecare dată când câștigi serviciul, toți se rotesc cu o poziție în sensul acelor de ceasornic: 1 → 6 → 5 → 4 → 3 → 2. Așază-te corect și nu vei pierde niciun punct.",
    "See it in action": "Vezi cum arată în practică",

    // ---- tips-visuals: video link labels ----
    "Practice structure": "Structura antrenamentului",
    "Max-reps drills": "Exerciții cu maxim de repetări",
    "Talking to players": "Cum vorbești cu jucătorii",
    "Specific feedback": "Feedback concret",
    "Building confidence": "Cum dai încredere",
    "Growth mindset": "Mentalitatea de creștere",
    "Pre-serve routine": "Rutina dinaintea serviciului",
    "Reset routine": "Rutina de resetare",
    "High-energy practice": "Antrenament cu energie mare",
    "Managing the gym": "Cum ții sala sub control",
    "Fun warm-up games": "Jocuri de încălzire distractive",
    "Practice games": "Jocuri de antrenament",
    "On match day": "În ziua meciului",
    "Using timeouts": "Cum folosești time-out-urile",
    "Planning a season": "Cum planifici un sezon",
    "Season phases": "Fazele sezonului",
    "Tryout stations": "Stații pentru selecție",
    "Running tryouts": "Cum organizezi selecția",
    "Including everyone": "Cum îi incluzi pe toți",
    "Differentiating drills": "Cum adaptezi exercițiile",
    "Athletic training": "Pregătire fizică",
    "Injury prevention": "Prevenirea accidentărilor",
    "Warm-up & stretch": "Încălzire și întinderi",
    "Safety basics": "Reguli de bază pentru siguranță",
    "Rules explained": "Regulile explicate",
    "Rotation & overlap": "Rotația și suprapunerea",
    "Pre-season meeting": "Ședința de dinaintea sezonului",
    "Camp stations": "Stații pentru tabără",

    // ---- glossary (keyed by the English DEFINITION, since coaching.js renders
    //      the term and its definition as separate nodes) ----
    "A serve that scores directly — it lands in untouched, or the receiver can't keep it in play.": "Un serviciu care aduce punct direct — cade în teren neatins sau cel care preia nu reușește să țină mingea în joc.",
    "The vertical rod on each side of the net marking the legal width of play; the ball must cross between the antennas.": "Tija verticală de pe fiecare margine a fileului care marchează lățimea legală de joc; mingea trebuie să treacă printre antene.",
    'The footwork an attacker uses to jump and hit — most often a three-step "left-right-left" (for a right-hander).': "Pașii pe care îi face atacantul ca să sară și să lovească — cel mai des un elan în trei pași „stânga-dreapta-stânga” (pentru un dreptaci).",
    "The pass or set to the teammate who then scores the kill; usually credited to the setter.": "Pasa sau ridicarea către coechipierul care apoi marchează punctul din atac; de regulă i se atribuie ridicătorului.",
    "Sending the ball forcefully into the opponent's court to try to score.": "Trimiterea mingii cu forță în terenul advers pentru a încerca să marchezi.",
    "The line three metres from the net; a back-row player must take off from behind it to attack a ball that's above net height.": "Linia aflată la trei metri de fileu; un jucător din linia a doua trebuie să se desprindă din spatele ei ca să atace o minge mai sus de fileu.",
    "A spike launched by a back-row player who jumps from behind the attack line.": "Un atac executat de un jucător din linia a doua care sare din spatele liniei de atac.",
    "Jumping at the net with hands pressed over it to stop or slow an opponent's attack.": "Săritura la fileu cu mâinile întinse peste el ca să oprești sau să încetinești atacul adversarului.",
    "When the ball drops to the floor between several players who all stop and watch it, as if gathered around a fire.": "Când mingea cade pe podea între mai mulți jucători care se opresc toți și o privesc, ca și cum ar sta strânși în jurul focului.",
    "An illegal contact where the ball comes to rest in or is thrown by the hands rather than cleanly hit.": "Un contact neregulamentar în care mingea se oprește în mâini sau e împinsă, în loc să fie lovită curat.",
    "A spike hit diagonally across the court — the longest, most common attacking angle.": "Un atac lovit în diagonală pe teren — cel mai lung și mai des folosit unghi de atac.",
    "A sharp cross-court attack hit at an extreme angle, close to the net.": "Un atac în diagonală foarte ascuțit, lovit aproape de fileu.",
    "A defensive forearm save of a hard-driven attack that keeps the ball off the floor.": "O preluare din atac cu antebrațele a unei mingi puternice, care o ține departe de podea.",
    "A soft one-handed attack placed into open space instead of a hard swing.": "Un atac ușor cu o singură mână, plasat într-un spațiu liber în loc de o lovitură puternică.",
    "An illegal contact where the ball touches a player twice in a row (except off a hard first ball or a block).": "Un contact neregulamentar în care mingea atinge un jucător de două ori la rând (cu excepția primei mingi dure sau a unui blocaj).",
    "An attack a hitter swings from the ground without jumping — easier for the defense to read and dig.": "Un atac pe care atacantul îl lovește de la sol, fără să sară — mai ușor de citit și de preluat de apărare.",
    "A surprise attack by the setter, who tips the ball over on the second contact instead of setting it.": "Un atac surpriză al ridicătorului, care plasează mingea peste fileu la al doilea contact în loc să o ridice.",
    "A serve hit flat with no spin so the ball wavers unpredictably in the air.": "Un serviciu lovit plat, fără efect, astfel încât mingea pendulează imprevizibil în aer.",
    "Stepping on or over the end line (or into the court) while serving — it loses the point.": "Călcarea pe sau peste linia de fund (sau intrarea în teren) în timpul serviciului — pierzi punctul.",
    "An easy, non-attacking return from the opponent that lets your team set up its offense.": "O minge ușoară, fără atac, trimisă de adversar, care îți lasă echipa timp să-și organizeze atacul.",
    "When the ball lands between two players who each assumed the other would take it — a communication breakdown.": "Când mingea cade între doi jucători care fiecare a crezut că o ia celălalt — o problemă de comunicare.",
    "When two opposing players contact the ball at the same time above the net.": "Când doi jucători adverși ating mingea în același timp deasupra fileului.",
    "A serve hit with a full hitting approach and jump for extra power and a steeper angle.": "Un serviciu lovit cu elan complet și săritură, pentru putere în plus și un unghi mai abrupt.",
    "An attack that directly ends the rally for a point.": "Un atac care încheie direct faza de joc cu un punct.",
    "A one-handed block, named after King Kong swatting at the ball.": "Un blocaj cu o singură mână, denumit după King Kong care plesnește mingea.",
    "An attack hit straight down the sideline, parallel to it.": "Un atac lovit drept pe lângă linia de margine, paralel cu ea.",
    "Touching the net while making a play on the ball, which loses the point.": "Atingerea fileului în timp ce joci mingea, ceea ce duce la pierderea punctului.",
    "A softer, controlled attack placed into open court to catch a defense leaning for a hard swing.": "Un atac mai moale și controlat, plasat în terenul liber ca să prinzi pe picior greșit o apărare pregătită pentru o lovitură puternică.",
    "Shorthand for how many hitters and setters are on court — a 5-1 runs one setter all the way around, a 6-2 uses two setters who switch out to attack.": "Notație pentru câți atacanți și câți ridicători sunt pe teren — un 5-1 folosește un singur ridicător pe tot parcursul rotației, un 6-2 folosește doi ridicători care ies ca să atace.",
    "A pass that accidentally carries over the net, handing the other team an easy attack.": "O preluare care trece din greșeală peste fileu, oferind adversarului un atac ușor.",
    "A last-ditch save where a player slides a flat hand under the ball so it bounces off the back of the hand.": "O salvare disperată în care jucătorul alunecă cu palma întinsă sub minge, iar aceasta sare de pe dosul palmei.",
    "The first contact, played off the forearm platform to control a serve or attack.": "Primul contact, jucat de pe platforma brațelor ca să controlezi un serviciu sau un atac.",
    "A two-player warm-up of pass, set, and hit back and forth to groove ball control.": "O încălzire în doi cu preluare, ridicare și atac, dus-întors, ca să fixezi controlul mingii.",
    "A back-row attack hit from the middle of the court (zone 6).": "Un atac din linia a doua lovit din mijlocul terenului (zona 6).",
    "The flat surface made by joining the forearms together for passing.": "Suprafața plată formată prin lipirea antebrațelor pentru preluare.",
    "A low, fast set to a middle hitter who is already in the air, designed to beat the block.": "O ridicare joasă și rapidă către centrul care e deja în aer, gândită ca să depășească blocajul.",
    "The scoring system where a point is won on every rally, no matter which team served.": "Sistemul de punctaj în care se câștigă un punct la fiecare fază de joc, indiferent ce echipă a servit.",
    "The low, balanced athletic stance — knees bent, weight forward — players hold before every contact.": "Poziția de bază, joasă și echilibrată — genunchii îndoiți, greutatea în față — pe care jucătorii o țin înainte de fiecare contact.",
    "A soft attack lofted with topspin up and over the block and down into the court.": "Un atac moale, trimis cu efect liftat peste blocaj și în jos în teren.",
    "A dominant block that sends the attack straight back down to the floor.": "Un blocaj dominant care trimite atacul direct în jos pe podea.",
    "The clockwise shift of players through the six court positions each time the team wins back the serve.": "Deplasarea jucătorilor în sensul acelor de ceasornic prin cele șase poziții ale terenului, de fiecare dată când echipa recâștigă serviciul.",
    "The gap between two defenders or two blockers that attackers aim to exploit.": "Spațiul dintre doi apărători sau doi blocheuri pe care atacanții încearcă să-l exploateze.",
    "The system and skill of passing the opponent's serve accurately to the setter.": "Sistemul și deprinderea de a prelua serviciul adversarului cu precizie către ridicător.",
    "An overhead contact (usually the second) that places the ball for a hitter to attack.": "Un contact de sus (de obicei al doilea) care plasează mingea pentru ca atacantul să poată ataca.",
    "A badly misjudged pass that shoots off at a wild angle, out of the setter's reach.": "O preluare ratată urât, care zboară într-un unghi aiurea, departe de ridicător.",
    "Winning the rally — and the serve — when the other team was serving.": "Câștigarea fazei de joc — și a serviciului — atunci când servea cealaltă echipă.",
    "Slang for getting hit in the face or head by an attacked ball.": "Termen de argou pentru când ești lovit în față sau în cap de o minge atacată.",
    "A quick attack where a middle hitter takes off from one foot while running along the net, like a layup.": "Un atac rapid în care centrul se desprinde de pe un singur picior alergând de-a lungul fileului, ca la baschet.",
    "A designed play where two hitters attack close together to confuse and split the block.": "O fază pregătită în care doi atacanți atacă unul lângă altul ca să încurce și să despartă blocajul.",
    "How fast a set reaches the hitter — a 1st-tempo set is quick and flat, a 3rd-tempo set is high and slow.": "Cât de repede ajunge ridicarea la atacant — o ridicare de tempo 1 e rapidă și plată, una de tempo 3 e înaltă și lentă.",
    "Deliberately hitting the ball off the blockers' hands so it deflects out of bounds for a point.": "Lovirea intenționată a mingii de mâinile blocheurilor, astfel încât să sară în afara terenului pentru un punct.",
    "A slight contact a blocker gets on the ball; it still counts as one of that team's three hits.": "O atingere ușoară pe care blocheurul o pune pe minge; se numără totuși ca unul dintre cele trei contacte ale echipei.",
    "Switching from defense to offense (or back) within a rally — for example, blocking, then pulling off the net to hit.": "Trecerea de la apărare la atac (sau invers) în cadrul unei faze de joc — de exemplu, blochezi, apoi te desprinzi de fileu ca să ataci.",
    'The "quarterback" who runs the offense and delivers sets to the attackers.': "„Creierul” echipei, cel care conduce atacul și livrează ridicări către atacanți.",
    "The left-front attacker who usually takes the most swings on the team.": "Atacantul din stânga-față, care de obicei are cele mai multe lovituri de atac din echipă.",
    "The attacker and blocker on the right front, positioned opposite the setter in the rotation.": "Atacantul și blocheurul din dreapta-față, plasat opus ridicătorului în rotație.",
    "The front-row center player who blocks across the net and hits quick attacks.": "Jucătorul din centrul liniei întâi, care blochează de-a lungul fileului și atacă mingi rapide.",
    "A back-row defensive specialist in a contrasting jersey who subs freely but can't attack above net height or block.": "Specialistul în apărare din linia a doua, cu un tricou de altă culoare, care intră liber la schimbare, dar nu poate ataca mai sus de fileu și nici nu poate bloca.",
    "A back-row substitute brought in to pass and play defense.": "O rezervă din linia a doua adusă ca să preia și să joace în apărare.",
    "A substitute sent in just to serve a strong or strategic serve, then rotated back out.": "O rezervă trimisă doar ca să execute un serviciu puternic sau strategic, apoi scoasă înapoi.",

    // ---- small connective words used in built sentences ----
    "every day": "în fiecare zi",
    "first game": "primul meci",
    "Light — game tomorrow": "Ușor — meci mâine"
  });

  // ======================================================================= //
  //  PATTERN RULES — Today / Season / History / generator dynamic strings   //
  // ======================================================================= //
  RR.i18n.addPatterns([
    // generator.js — skill block roles + reminders
    { re: /^Skill Block A — (.+)$/, ro: function (m) { return "Bloc de tehnică A — " + t(m[1]); } },
    { re: /^Skill Block B — (.+)$/, ro: function (m) { return "Bloc de tehnică B — " + t(m[1]); } },
    { re: /^Today's skill of the day is (.+) — focused reps so campers feel fast improvement\.$/,
      ro: function (m) { return "Deprinderea zilei e " + t(m[1]) + " — repetări concentrate ca cei mici să simtă progresul rapid."; } },
    { re: /^Skill of the week is (.+) — the session's primary technical focus\.$/,
      ro: function (m) { return "Tehnica săptămânii e " + t(m[1]) + " — accentul tehnic principal al ședinței."; } },
    { re: /^A complementary (.+) block that rounds out the session\.$/,
      ro: function (m) { return "Un bloc complementar de " + t(m[1]) + " care întregește ședința."; } },
    { re: /^Keep it light and confident today — sharpen (.+), no new material\.$/,
      ro: function (m) { return "Ține-l ușor și cu încredere azi — pune la punct " + t(m[1]) + ", nimic nou."; } },
    { re: /^Bring (.+) to game speed today — compete every rally\.$/,
      ro: function (m) { return "Du " + t(m[1]) + " la viteză de joc azi — luptați fiecare fază."; } },
    { re: /^Slow it down and groove clean (.+) technique today\.$/,
      ro: function (m) { return "Încetinește și fixează o tehnică curată de " + t(m[1]) + " azi."; } },
    { re: /^Blend technique and competition around today's focus: (.+)\.$/,
      ro: function (m) { return "Îmbină tehnica și competiția în jurul accentului de azi: " + t(m[1]) + "."; } },

    // today.js — game banners, breakout, next-practice, rest day
    { re: /^vs (.+) — keep it light and confident\.$/, ro: function (m) { return "vs " + m[1] + " — ține-l ușor și cu încredere."; } },
    { re: /^vs (.+)\. This plan is eased for fresh legs\.$/, ro: function (m) { return "vs " + m[1] + ". Planul e ușurat ca picioarele să fie odihnite."; } },
    { re: /^Position breakout · ~(\d+) min$/, ro: function (m) { return "Lucru pe posturi · ~" + m[1] + " min"; } },
    { re: /^Split the squad into position groups for about (\d+) minutes so players sharpen their specialist skills\. Tap a role for its coaching guide and drills\.$/,
      ro: function (m) { return "Împarte lotul în grupe pe posturi vreo " + m[1] + " minute, ca jucătorii să-și ascută tehnicile de specialitate. Apasă un post pentru ghidul lui și exerciții."; } },
    { re: /^Go to next practice · (.+)$/, ro: function (m) { return "Mergi la antrenamentul următor · " + m[1]; } },
    { re: /^No practice scheduled for (.+)\. Recovery is part of the plan\.$/,
      ro: function (m) { return "Niciun antrenament programat pe " + m[1] + ". Recuperarea face parte din plan."; } },
    { re: /^Practice days: (.+)$/, ro: function (m) { return "Zile de antrenament: " + m[1]; } },
    { re: /^Day (\d+) of (\d+) · (.+) session$/, ro: function (m) { return "Ziua " + m[1] + " din " + m[2] + " · sesiunea " + m[3]; } },

    // history.js
    { re: /^Camp Day (\d+) · (.+)$/, ro: function (m) { return "Ziua " + m[1] + " de tabără · " + m[2]; } },
    { re: /^Copied to (.+)\.$/, ro: function (m) { return "Copiat la " + m[1] + "."; } },

    // calendar.js
    { re: /^Light — game tomorrow vs (.+)$/, ro: function (m) { return "Ușor — meci mâine vs " + m[1]; } },

    // season.js — status line
    { re: /^Today is Day (\d+) of (\d+) · (.+) phase\.$/,
      ro: function (m) { return "Azi e ziua " + m[1] + " din " + m[2] + " · etapa " + t(m[3]) + "."; } },
    { re: /^Camp starts in (.+) — (.+)\.$/, ro: function (m) { return "Tabăra începe peste " + m[1] + " — " + m[2] + "."; } },
    { re: /^Practices start in (.+) — (.+)\.$/, ro: function (m) { return "Antrenamentele încep peste " + m[1] + " — " + m[2] + "."; } },
    { re: /^You're in the (.+) phase · (.+) to your first game \((.+)\)\.$/,
      ro: function (m) { return "Ești în etapa " + t(m[1]) + " · " + m[2] + " până la primul meci (" + m[3] + ")."; } },
    { re: /^Your season is underway — In-season maintenance\. First game was (.+)\.$/,
      ro: function (m) { return "Sezonul e în desfășurare — menținere în sezon. Primul meci a fost pe " + m[1] + "."; } },
    { re: /^Camp's a wrap — nice work! It ran (.+) – (.+)\.$/,
      ro: function (m) { return "Tabăra s-a încheiat — bravo! A ținut " + m[1] + " – " + m[2] + "."; } },

    // season.js — phase range / duration helpers
    { re: /^(\d+) weeks$/, ro: function (m) { return m[1] + " săptămâni"; } },
    { re: /^From (.+) \(first game\) onward$/, ro: function (m) { return "De pe " + m[1] + " (primul meci) încolo"; } },
    { re: /^Days (\d+)–(\d+) · (.+)$/, ro: function (m) { return "Zilele " + m[1] + "–" + m[2] + " · " + m[3]; } },
    { re: /^Day (\d+) · (.+)$/, ro: function (m) { return "Ziua " + m[1] + " · " + m[2]; } }
  ]);
}());
