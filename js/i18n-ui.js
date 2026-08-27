// i18n-ui.js — Romanian dictionary, part 1 of 3: the app chrome.
//
// Navigation, buttons, labels, form fields, empty states, toasts, the practice
// timer, sharing, the schedule, players, lineup and team setup. Written in
// natural, spoken Romanian the way a coach actually talks — informal "tu",
// warm and short. Volleyball terms follow how the game is named in Romania
// (fileu = net, preluare = pass, ridicare = set, atac = hit, blocaj = block,
// extremă/central/opus for the positions, etc.).
//
// Keys are the exact English source text with STRAIGHT quotes/apostrophes; the
// engine normalizes curly quotes before lookup, so straight keys always match.
// Loads after i18n.js; registers via RR.i18n.add().
(function () {
  "use strict";
  if (!RR.i18n) return;

  RR.i18n.add({
    // ---- brand + tabs + screen titles ----
    "Today": "Azi",
    "Season": "Sezon",
    "Drills": "Exerciții",
    "Players": "Jucători",
    "Tips": "Sfaturi",
    "Teams": "Echipe",
    "History": "Istoric",
    "Schedule": "Program",
    "Player": "Jucător",
    "Position coaching": "Antrenament pe posturi",
    "Lineup": "Formație",

    // ---- skills (badges / focus options, used everywhere) ----
    "Passing": "Preluare",
    "Setting": "Ridicare",
    "Serving": "Serviciu",
    "Hitting": "Atac",
    "Blocking": "Blocaj",
    "Defense": "Apărare",
    "Digging": "Preluare din atac",
    "Ball Control": "Controlul mingii",
    "Team Play": "Joc în echipă",
    "Teamwork": "Lucru în echipă",
    "Warmup": "Încălzire",
    "Cooldown": "Revenire",

    // ---- difficulty ----
    "Beginner": "Începător",
    "Intermediate": "Intermediar",
    "Advanced": "Avansat",

    // ---- animated drill example ----
    "Animated example": "Exemplu animat",
    "Live movement loop": "Mișcare în buclă",
    "Animation steps": "Pașii animației",
    "Pause": "Pauză",
    "Play": "Redă",
    "Replay": "Reia",
    "Previous step": "Pasul anterior",
    "Next step": "Pasul următor",
    "Still preview": "Previzualizare statică",
    "Animation is off because reduced motion is enabled on this device.":
      "Animația este oprită deoarece mișcarea redusă este activată pe acest dispozitiv.",
    "Human technique": "Demonstrație tehnică",
    "Human demonstration needed": "Este necesară o demonstrație cu sportiv",
    "Edit this drill and choose a human demonstration before using the example. RallyReady will not guess from your notes.":
      "Editează acest exercițiu și alege o demonstrație cu sportiv înainte să folosești exemplul. RallyReady nu va ghici mișcarea din notițele tale.",
    "Demonstration view": "Vizualizarea demonstrației",
    "Technique": "Tehnică",
    "Court movement": "Mișcare pe teren",
    "Techniques in this step": "Tehnicile din acest pas",
    "Technique phases and body cues": "Fazele tehnicii și indicațiile pentru corp",
    "Coach this": "Indicații de antrenor",
    "Players & mechanics": "Jucători și mecanică",
    "Court participant and movement details": "Detalii despre jucători și mișcarea pe teren",
    "Positioned": "Poziționați",
    "Grouped marker": "Marcaj de grup",
    "Coach / support": "Antrenor / ajutor",
    "support role": "rol de ajutor",
    "Saved minimum": "Minim salvat",
    "Waiting / line": "În așteptare / la rând",
    "Parallel / grouped": "În paralel / grupați",
    "Rotating roles": "Roluri prin rotație",
    "Not individually plotted": "Nereprezentați individual",
    "Position map": "Harta pozițiilor",
    "Participants": "Participanți",
    "Unlabeled court marker": "Marcaj fără etichetă pe teren",
    "Authored routes": "Trasee definite",
    "ball path": "traseu al mingii",
    "ball paths": "trasee ale mingii",
    "player path": "traseu al jucătorului",
    "player paths": "trasee ale jucătorilor",
    "No authored ball path in this step.": "Niciun traseu al mingii nu este definit în acest pas.",
    "No authored player path in this step.": "Niciun traseu al jucătorului nu este definit în acest pas.",
    "Current step": "Pasul curent",
    "this drill": "acest exercițiu",

    // ---- human drill actions, phases + body cues ----
    "Forearm pass": "Preluare cu antebrațele",
    "Overhead set": "Ridicare de sus",
    "Overhand serve": "Serviciu de sus",
    "Attack approach": "Elan de atac",
    "Block and press": "Blocaj și presare",
    "Floor defense": "Apărare la sol",
    "Athletic footwork": "Deplasare atletică",
    "Dynamic warm-up": "Încălzire dinamică",
    "Resistance-band form": "Execuție cu banda elastică",
    "Medicine-ball power": "Putere cu mingea medicinală",
    "Recovery position": "Poziție de recuperare",
    "Jump and landing": "Săritură și aterizare",
    "Running stride": "Pas de alergare",
    "Underhand serve": "Serviciu de jos",
    "Cooldown sequence": "Secvență de revenire",

    "Ready": "Pregătire",
    "Build the platform": "Formează platforma",
    "Contact": "Contact",
    "Hold the target": "Menține direcția",
    "Read": "Citește jocul",
    "Get underneath": "Intră sub minge",
    "Finger contact": "Contact cu degetele",
    "Extend": "Extinde",
    "Stance": "Poziție",
    "Toss + load": "Aruncare + armare",
    "Transfer": "Transfer",
    "Load": "Încărcare",
    "Reach + contact": "Întindere + contact",
    "Land": "Aterizare",
    "Press": "Presează",
    "Land + reset": "Aterizează + revino",
    "Move": "Deplasare",
    "Dig safely": "Preluare sigură",
    "Recover": "Revino",
    "Base": "Poziție de bază",
    "Push": "Împingere",
    "Travel": "Deplasează-te",
    "Plant": "Fixare",
    "Easy jog": "Alergare ușoară",
    "High knees": "Genunchii sus",
    "Lunge + rotate": "Fandare + rotație",
    "Lateral lunge": "Fandare laterală",
    "Set posture": "Fixează postura",
    "Rotate": "Rotește",
    "Pull apart": "Depărtează brațele",
    "Y raise": "Ridicare în Y",
    "Reach": "Întinde-te",
    "Drive": "Propulsie",
    "Hamstring": "Ischiogambieri",
    "Figure four": "Poziția cifrei patru",
    "Leg roll": "Rularea piciorului",
    "Upper back": "Partea superioară a spatelui",
    "Take off": "Desprindere",
    "Stick the landing": "Fixează aterizarea",
    "Flight": "Zbor",
    "Foot strike": "Contact cu solul",
    "Backswing": "Balans înapoi",
    "Follow through": "Finalizare",
    "Recovery walk": "Mers de revenire",
    "Diaphragmatic breath": "Respirație diafragmatică",
    "Reflect": "Reflecție",
    "Child's pose": "Poziția copilului",

    "Step the opposite foot forward and support the ball below the waist.":
      "Pășește înainte cu piciorul opus și susține mingea sub nivelul taliei.",
    "Keep the ball still while the straight hitting arm swings behind the hip.":
      "Ține mingea nemișcată în timp ce brațul de lovire întins se balansează în spatele șoldului.",
    "Step and strike the bottom-back of the ball with a firm fist or hand heel.":
      "Pășește și lovește partea de jos-spate a mingii cu pumnul ferm sau podul palmei.",
    "Swing the hitting arm toward the target and transfer weight forward.":
      "Balansează brațul de lovire spre țintă și transferă greutatea înainte.",
    "Walk easily until breathing and heart rate begin returning toward normal.":
      "Mergi ușor până când respirația și pulsul încep să revină la normal.",
    "Breathe into the lower ribs, then make the exhale longer than the inhale.":
      "Inspiră în partea de jos a cutiei toracice, apoi expiră mai lung decât inspiri.",
    "Sit comfortably, relax the shoulders, and name one useful team takeaway.":
      "Așază-te confortabil, relaxează umerii și spune un lucru util învățat de echipă.",
    "Sink the hips toward the heels, reach long, and keep the breath relaxed.":
      "Coboară șoldurile spre călcâie, întinde brațele și păstrează respirația relaxată.",

    "Feet wider than hips; knees soft; shoulders forward.":
      "Picioarele mai depărtate decât șoldurile; genunchii flexați; umerii înainte.",
    "Join the hands early and keep both forearms straight.":
      "Unește mâinile din timp și ține ambele antebrațe întinse.",
    "Meet the middle of the ball in front of the body.":
      "Ia contact cu mijlocul mingii în fața corpului.",
    "Finish balanced with the platform facing the target.":
      "Încheie echilibrat, cu platforma orientată spre țintă.",
    "Track the ball early and move before raising the hands.":
      "Urmărește mingea din timp și deplasează-te înainte să ridici mâinile.",
    "Balance the feet and show a clean window above the forehead.":
      "Echilibrează picioarele și formează o fereastră clară deasupra frunții.",
    "Use relaxed, spread fingers and contact both sides evenly.":
      "Ține degetele relaxate și răsfirate și atinge uniform ambele laturi ale mingii.",
    "Drive through the legs and finish both hands toward the target.":
      "Împinge din picioare și încheie cu ambele mâini spre țintă.",
    "Start balanced and staggered with the ball in front of the hitting shoulder.":
      "Pornește echilibrat, cu picioarele decalate și mingea în fața umărului de lovire.",
    "Keep the toss repeatable while the hitting elbow loads high.":
      "Aruncă mingea constant și armează sus cotul brațului de lovire.",
    "Reach tall and strike the center of the ball with a firm open hand.":
      "Întinde-te sus și lovește centrul mingii cu palma fermă și deschisă.",
    "Move body weight through the ball and finish inside the court.":
      "Transferă greutatea corpului prin minge și încheie în interiorul terenului.",
    "Stay available and time the first step from the set.":
      "Rămâi pregătit și sincronizează primul pas după ridicare.",
    "Use a long penultimate step and swing both arms behind the hips.":
      "Fă un penultim pas lung și balansează ambele brațe în spatele șoldurilor.",
    "Jump vertically and contact high in front of the hitting shoulder.":
      "Sari vertical și contactează mingea sus, în fața umărului de lovire.",
    "Absorb the landing on two feet and recover for the next play.":
      "Amortizează aterizarea pe ambele picioare și revino pentru faza următoare.",
    "Stay square to the net with hands high and knees loaded.":
      "Rămâi paralel cu fileul, cu mâinile sus și genunchii flexați.",
    "Move along the net without drifting or turning the shoulders.":
      "Deplasează-te de-a lungul fileului fără să te îndepărtezi sau să rotești umerii.",
    "Reach up, then press strong hands forward over the net.":
      "Întinde-te în sus, apoi presează mâinile ferme înainte, peste fileu.",
    "Land on two feet, regain balance, and show the hands again.":
      "Aterizează pe ambele picioare, recapătă echilibrul și ridică din nou mâinile.",
    "Keep the hips low, weight forward, and hands available.":
      "Ține șoldurile jos, greutatea în față și mâinile pregătite.",
    "Push from the outside foot and keep the shoulders behind the ball.":
      "Împinge din piciorul exterior și păstrează umerii în spatele mingii.",
    "Angle a stable platform and let low momentum continue safely.":
      "Ține platforma stabilă la unghiul corect și lasă mișcarea joasă să continue în siguranță.",
    "Get back to the feet quickly and return to a balanced base.":
      "Ridică-te repede și revino într-o poziție de bază echilibrată.",
    "Start low enough to move in any direction without an extra step.":
      "Pornește suficient de jos ca să te poți deplasa în orice direcție fără un pas în plus.",
    "Drive from the outside leg; do not reach with the lead foot.":
      "Împinge din piciorul exterior; nu întinde piciorul din față.",
    "Keep the hips level and the feet active without clicking together.":
      "Ține șoldurile la același nivel și picioarele active, fără să le apropii până se ating.",
    "Stop under control, face the play, and be ready to reverse.":
      "Oprește-te controlat, întoarce-te spre joc și fii gata să schimbi direcția.",
    "Use relaxed posture and an easy rhythm to raise body temperature.":
      "Păstrează o postură relaxată și un ritm ușor ca să încălzești corpul.",
    "Drive opposite arm and knee while landing under the hips.":
      "Ridică brațul și genunchiul opus și aterizează cu piciorul sub șolduri.",
    "Track the front knee over the toes and rotate through the chest.":
      "Ține genunchiul din față aliniat peste degetele piciorului și rotește toracele.",
    "Sit the hips back while the long leg stays extended.":
      "Împinge șoldurile înapoi și ține piciorul opus întins.",
    "Stand tall with ribs down and the working shoulder relaxed.":
      "Stai drept, ține coastele coborâte și umărul care lucrează relaxat.",
    "Keep the elbow pinned while the forearm moves under control.":
      "Ține cotul lipit de corp și mișcă antebrațul controlat.",
    "Keep straight wrists and squeeze the shoulder blades together.":
      "Ține încheieturile drepte și apropie omoplații.",
    "Lift up and out without shrugging or arching the back.":
      "Ridică brațele în sus și în afară fără să înalți umerii sau să arcuiești spatele.",
    "Use an athletic stance and brace before moving the ball.":
      "Adoptă o poziție atletică și încordează trunchiul înainte să miști mingea.",
    "Extend tall with the ball controlled in both hands.":
      "Întinde-te sus, păstrând mingea sub control în ambele mâini.",
    "Snap the trunk and direct force through the intended target.":
      "Accelerează trunchiul și direcționează forța spre ținta dorită.",
    "Stay balanced and retrieve the rebound with safe posture.":
      "Rămâi echilibrat și recuperează mingea ricoșată cu o postură sigură.",
    "Keep a long spine and move only to a comfortable stretch.":
      "Menține coloana alungită și mergi doar până la o întindere confortabilă.",
    "Relax the shoulders and keep the crossed foot flexed.":
      "Relaxează umerii și ține laba piciorului încrucișat trasă spre tine.",
    "Support the body and roll slowly through the working tissue.":
      "Sprijină corpul și rulează lent peste zona lucrată.",
    "Support the head and keep the roller off the neck and low back.":
      "Sprijină capul și nu lăsa rola pe gât sau pe zona lombară.",
    "Load the ankles, knees, and hips while keeping the chest controlled.":
      "Încarcă gleznele, genunchii și șoldurile, păstrând trunchiul controlat.",
    "Swing both arms and leave the floor from a balanced base.":
      "Balansează ambele brațe și desprinde-te dintr-o bază echilibrată.",
    "Stay tall through the trunk and reach without drifting sideways.":
      "Ține trunchiul alungit și întinde-te fără să te abați lateral.",
    "Land quietly on two feet with knees tracking over toes.":
      "Aterizează silențios pe ambele picioare, cu genunchii aliniați peste degete.",
    "Lean slightly from the ankles and push the floor behind you.":
      "Înclină-te ușor din glezne și împinge podeaua în spatele tău.",
    "Drive the front knee while the opposite arm moves forward.":
      "Ridică energic genunchiul din față în timp ce brațul opus se mișcă înainte.",
    "Land softly under the hips instead of reaching the foot ahead.":
      "Aterizează ușor sub șolduri, fără să întinzi piciorul înainte.",
    "Pull the heel through quickly and flow into the next push-off.":
      "Trage rapid călcâiul pe sub corp și treci cursiv în următoarea propulsie.",
    "How it moves": "Cum se mișcă",
    "Controlled resistance": "Rezistență controlată",
    "Recovery sequence": "Secvență de revenire",
    "Movement sequence": "Secvență de mișcare",
    "Quick feet through the ladder": "Pași rapizi prin scăriță",
    "Fast, balanced contacts": "Contacte rapide și echilibrate",
    "Explode, receive, reset": "Explodează, primește, revino",
    "Approach, land, and reset": "Elan, aterizare și revenire",
    "Press over the net": "Apasă peste fileu",
    "Roll, sprawl, recover": "Rostogolește-te, plonjează, revino",
    "Roll, side-roll, sprawl, pop up": "Rostogolește-te, rulează lateral, plonjează, ridică-te",
    "Cross the pasture with control": "Traversează pășunea cu control",
    "Rotate, pull apart, raise": "Rotește, depărtează, ridică",
    "Four-part guided stretch": "Întindere ghidată în patru părți",
    "Rotate and throw to the wall": "Rotește și aruncă spre perete",
    "Roll, mobilize, then breathe": "Rulează, mobilizează, apoi respiră",
    "Build the rope progression": "Construiește progresia la coardă",
    "Slow floor flow": "Secvență lentă la sol",
    "Circle, swing, slide, squeeze": "Cercuri, balans, glisare, strângere",
    "Breathe, reflect, close together": "Respirați, reflectați, încheiați împreună",
    "Side steps, monster walks, squats": "Pași laterali, mers controlat, genuflexiuni",
    "Calf and ankle reset": "Revenire pentru gambe și glezne",
    "Move through four mobility phases": "Parcurge patru faze de mobilitate",
    "Hamstrings, hips, and twist": "Ischiogambieri, șolduri și răsucire",
    "Keep your own balloon overhead": "Ține propriul balon deasupra",
    "Pull apart, row, pull down": "Depărtează, trage, coboară",
    "Load high and swing through": "Încarcă sus și balansează complet",
    "Bridge, hold, then side-step": "Pod, menține, apoi pas lateral",
    "Shuffle both ways, then box": "Deplasare în ambele sensuri, apoi în pătrat",
    "Sideways in-in, out-out": "Lateral: în-în, afară-afară",
    "Five fast work-rest rounds": "Cinci runde rapide de lucru și pauză",
    "Two feet, right, left, alternate": "Două picioare, dreptul, stângul, alternativ",
    "Snap straight down to the floor": "Lovește exploziv direct în podea",
    "Chest pass and catch the rebound": "Pasă de la piept și prinde ricoșeul",
    "Throw low, read the angle, shuffle": "Aruncă jos, citește unghiul, deplasează-te",
    "Slow leg-roll sequence": "Secvență lentă de rulare a picioarelor",
    "Upper-back release": "Relaxarea spatelui superior",
    "Step up, drive the knee, lower": "Urcă, ridică genunchiul, coboară",
    "Step off and stick the landing": "Coboară și fixează aterizarea",
    "Four-part mat mobility flow": "Mobilitate pe saltea în patru părți",
    "Saved drill": "Exercițiu salvat",
    "No setup or steps saved yet.": "Nu există încă pregătire sau pași salvați.",
    "Saved as a game": "Salvat ca joc",
    "Saved sequence": "Secvență salvată",
    "Partner rhythm": "Ritmul în perechi",
    "Keep the balloon moving": "Ține balonul în mișcare",
    "Live rally flow": "Fluxul schimbului de joc",
    "Across-the-net sequence": "Secvență peste fileu",
    "Send the ball to space": "Trimite mingea în spațiul liber",
    "Read, defend, recover": "Citește, apără, revino",
    "Bring the group down": "Calmează ritmul grupei",
    "Move together": "Mișcați-vă împreună",

    // ---- block kinds / generic ----
    "Skill": "Tehnică",
    "Game": "Joc",
    "Warm-up": "Încălzire",
    "Cool-down": "Revenire",
    "Block": "Bloc",
    "Skill Block": "Bloc de tehnică",

    // ---- app.js empty states + theme + fallback ----
    "Set up your team first": "Întâi configurează echipa",
    "Once your team is set up, your next practice plan appears here — tailored to their age group and where they are in the season.":
      "După ce configurezi echipa, planul următorului antrenament apare aici — potrivit vârstei lor și momentului din sezon.",
    "Add your season dates and RallyReady maps out the whole season for you, week by week.":
      "Adaugă datele sezonului și RallyReady îți construiește tot sezonul, săptămână cu săptămână.",
    "Mark a practice complete and it appears here — a log of everything you've run.":
      "Bifează un antrenament ca finalizat și apare aici — un jurnal cu tot ce ai lucrat.",
    "Switch to light theme": "Treci pe tema deschisă",
    "Switch to dark theme": "Treci pe tema întunecată",
    "Something stopped this screen from loading. Close and reopen RallyReady — your saved team and history are safe.":
      "Ceva a împiedicat încărcarea acestui ecran. Închide și redeschide RallyReady — echipa și istoricul tău sunt în siguranță.",

    // ---- today.js ----
    "Tell RallyReady your team and dates, and your next practice plan appears here — ready to run.":
      "Spune-i lui RallyReady echipa și datele, iar planul următorului antrenament apare aici — gata de pus în practică.",
    "How Today works": "Cum funcționează Azi",
    "Each card is one ready-to-run block for this camp day — change the focus, edit the plan, run the timer, then mark it complete.":
      "Fiecare card e un bloc gata de folosit pentru această zi de tabără — schimbă accentul, editează planul, pornește cronometrul, apoi bifează-l ca finalizat.",
    "Each card is one ready-to-run block for this practice — change the focus, edit the plan, run the timer, then mark it complete.":
      "Fiecare card e un bloc gata de folosit pentru acest antrenament — schimbă accentul, editează planul, pornește cronometrul, apoi bifează-l ca finalizat.",
    "Choose a date": "Alege o dată",
    "Previous practice": "Antrenamentul anterior",
    "Next practice": "Antrenamentul următor",
    "Previous day": "Ziua anterioară",
    "Next day": "Ziua următoare",
    "Session slot": "Sesiunea",
    "No practice could be generated for this date.": "Nu s-a putut genera niciun antrenament pentru această dată.",
    "Game day": "Zi de meci",
    "Match today — keep it light and confident.": "Meci azi — ține-l ușor și cu încredere.",
    "Game tomorrow": "Meci mâine",
    "This plan is eased for fresh legs.": "Planul e ușurat ca picioarele să fie odihnite.",
    "Next game": "Următorul meci",
    "Skill of the Day": "Tehnica zilei",
    "Skill of the Week": "Tehnica săptămânii",
    "Your focus": "Accentul tău",
    "✓ Completed": "✓ Finalizat",
    "Intensity": "Intensitate",
    "Practice time": "Durata antrenamentului",
    "Optional add-on": "Opțional, în plus",
    "Today's skill focus": "Accentul tehnic de azi",
    "Auto (curriculum)": "Automat (programă)",
    "Back to the planned focus.": "Înapoi la accentul planificat.",
    "Add an extra practice here": "Adaugă un antrenament în plus aici",
    "Practice added for this day.": "Antrenament adăugat pentru această zi.",
    "Rest day": "Zi de odihnă",
    "Coach note": "Notă de la antrenor",
    "Add a block": "Adaugă un bloc",
    "Just a net and volleyballs — nothing extra needed.": "Doar fileu și mingi — nimic în plus.",
    "Equipment for today": "Echipament pentru azi",
    "Net height": "Înălțimea fileului",
    "Ball": "Minge",
    "Plan actions": "Acțiuni pentru plan",
    "Start": "Pornește",
    "Edit plan": "Editează planul",
    "Share": "Distribuie",
    "Print": "Printează",
    "Regenerate": "Regenerează",
    "Fresh plan — pinned drills kept.": "Plan nou — exercițiile fixate au rămas.",
    "Fresh practice ready.": "Antrenament nou, gata.",
    "Done editing": "Gata cu editarea",
    "Reset to the generated plan": "Revino la planul generat",
    "Back to the generated plan.": "Înapoi la planul generat.",
    "Mark practice complete": "Bifează antrenamentul ca finalizat",
    "How did it go? What to work on next time? (optional)": "Cum a fost? La ce lucrăm data viitoare? (opțional)",
    "Save — practice complete 🏐": "Salvează — antrenament finalizat 🏐",
    "Nice work — practice logged! 🏐": "Bravo — antrenamentul a fost salvat! 🏐",
    "Cancel": "Anulează",
    "Mark this practice complete": "Bifează acest antrenament ca finalizat",
    "Attendance": "Prezență",
    "Practice note": "Notă de antrenament",
    "Run it again": "Reia antrenamentul",
    "Unmark": "Anulează bifa",
    "Completion removed.": "Finalizarea a fost ștearsă.",
    "Logged to your History. Future practices avoid these drills for a while.":
      "Salvat în Istoric. Antrenamentele viitoare vor evita aceste exerciții o vreme.",

    // ---- history.js ----
    "Every practice you've marked complete — newest first. Re-open one, or copy a good one to a future date.":
      "Toate antrenamentele bifate ca finalizate — cele noi primele. Redeschide unul sau copiază unul reușit la o dată viitoare.",
    "No practices logged yet": "Niciun antrenament salvat încă",
    'When you tap "Mark practice complete" on the Today screen, it shows up here.':
      'Când apeși „Bifează antrenamentul ca finalizat” în ecranul Azi, apare aici.',
    "Go to Today": "Mergi la Azi",
    "Copy this practice to another date": "Copiază acest antrenament la altă dată",
    "Remove this completion": "Șterge această finalizare",
    "Removed from History.": "Șters din Istoric.",
    "Copy this practice to which date? (YYYY-MM-DD)": "La ce dată copiezi antrenamentul? (AAAA-LL-ZZ)",
    "Please use the format YYYY-MM-DD.": "Folosește formatul AAAA-LL-ZZ.",

    // ---- calendar.js ----
    "This week": "Săptămâna aceasta",
    "Next week": "Săptămâna viitoare",
    "Camp's a wrap": "Tabăra s-a încheiat",
    "This camp has already finished. Set up a new program to plan your next one.":
      "Această tabără s-a încheiat deja. Configurează un program nou ca să o planifici pe următoarea.",
    "Nothing scheduled yet": "Nimic programat încă",
    "Your camp days will appear here once they're in range.": "Zilele de tabără vor apărea aici când se apropie.",
    "No practices in the next 3 weeks": "Niciun antrenament în următoarele 3 săptămâni",
    "There are no practice days or games scheduled in this window. Check your practice days and dates on the Team screen.":
      "Nu sunt zile de antrenament sau meciuri programate în acest interval. Verifică zilele și datele de antrenament în ecranul Echipă.",
    "Add your team and dates to see your schedule.": "Adaugă echipa și datele ca să vezi programul.",
    "Set up your team": "Configurează echipa",
    "The next 3 weeks at a glance — tap any day to open its plan.":
      "Următoarele 3 săptămâni dintr-o privire — apasă pe orice zi ca să-i deschizi planul.",
    "✓ Done": "✓ Gata",
    "Match day": "Zi de meci",

    // ---- teams-ui.js ----
    "Camp": "Tabără",
    "No age set": "Fără vârstă setată",
    "Untitled team": "Echipă fără nume",
    "Active": "Activă",
    "Keep at least one team — edit this one instead.": "Păstrează cel puțin o echipă — editeaz-o mai bine pe aceasta.",
    "Add another team": "Adaugă altă echipă",
    "Your teams": "Echipele tale",
    "team": "echipă",
    "teams": "echipe",
    "Export backup": "Exportă o copie",
    "Backup downloaded.": "Copia a fost descărcată.",
    "Restore from this file? It replaces all teams and history on this device.":
      "Restaurezi din acest fișier? Înlocuiește toate echipele și tot istoricul de pe acest dispozitiv.",
    "Backup restored. 🏐": "Copia a fost restaurată. 🏐",
    "Couldn't read that file.": "Nu s-a putut citi fișierul.",
    "Not a RallyReady backup file.": "Fișierul nu este o copie RallyReady.",
    "That file isn't valid JSON.": "Fișierul nu este un JSON valid.",
    "That backup is too large to restore on this device.":
      "Copia este prea mare pentru a fi restaurată pe acest dispozitiv.",
    "That backup couldn't be saved on this device — storage may be full.":
      "Copia nu a putut fi salvată pe acest dispozitiv — spațiul de stocare ar putea fi plin.",
    "Backup restored, but the photos didn't fit in storage.":
      "Copia a fost restaurată, dar fotografiile nu au încăput în spațiul de stocare.",
    // Storage-health banner (app.js) — shown while saves are failing.
    "Your changes aren't being saved.": "Modificările tale nu se salvează.",
    "Storage is full or blocked — remove a few player photos or old history, or export a backup from Teams before closing.":
      "Spațiul de stocare e plin sau blocat — șterge câteva fotografii ale jucătorilor sau din istoricul vechi, ori exportă o copie din Echipe înainte să închizi.",
    "Restore backup": "Restaurează o copie",
    "Backup & restore": "Copie & restaurare",
    "Everything lives on this device. Export a file to keep it safe or move it to another phone, then restore it there.":
      "Totul rămâne pe acest dispozitiv. Exportă un fișier ca să-l păstrezi în siguranță sau să-l muți pe alt telefon, apoi restaurează-l acolo.",
    "A season opener that falls after practices begin": "Un prim meci care să fie după ce încep antrenamentele",
    "Finish this to generate your plan:": "Termină asta ca să-ți generăm planul:",
    "Finish these to generate your plan:": "Termină acestea ca să-ți generăm planul:",
    "Almost ready": "Aproape gata",
    "Plan not ready yet": "Planul nu e gata încă",

    // ---- season.js ----
    "Soon": "Curând",
    "Wrapped": "Încheiat",
    "Camp plan": "Planul taberei",
    "Season plan": "Planul sezonului",
    "Add your season dates or camp length and RallyReady maps out the whole plan for you — phase by phase.":
      "Adaugă datele sezonului sau durata taberei, iar RallyReady îți construiește tot planul — etapă cu etapă.",
    "Camp day by day": "Tabăra zi cu zi",
    "Season intensity": "Intensitatea sezonului",
    "Now": "Acum",
    "Why it matters": "De ce contează",
    "Camp intensity rising from Welcome through Build, then easing for the Showcase on the final day.":
      "Intensitatea taberei crește de la Bun venit prin Construcție, apoi se domolește pentru Demonstrația din ultima zi.",
    "Season intensity rising through Foundation, Development and Peak, then easing for the Taper before the first game.":
      "Intensitatea sezonului crește prin Fundație, Dezvoltare și Vârf, apoi se domolește în etapa de Descărcare înainte de primul meci.",
    "Share camp plan": "Distribuie planul taberei",
    "Share season plan": "Distribuie planul sezonului",

    // ---- periodization.js: phase names + day types ----
    "Foundation": "Fundație",
    "Development": "Dezvoltare",
    "Peak": "Vârf",
    "Taper": "Descărcare",
    "In-season": "În sezon",
    "Welcome": "Bun venit",
    "Build": "Construcție",
    "Showcase": "Demonstrație",
    "Camp day": "Zi de tabără",
    "Technical": "Tehnic",
    "Competitive": "Competitiv",
    "Mixed": "Mixt",

    // ---- generator.js: block role labels ----
    "Warm-up & Ball Handling": "Încălzire & lucru cu mingea",
    "Cool-down & Coach Talk": "Revenire & discuție cu antrenorul",
    "Mini-Tournament (favorite)": "Mini-turneu (preferat)",
    "Cooperative Game": "Joc cooperativ",
    "Game / Application": "Joc / aplicare",
    "Favorite Mini-Game": "Mini-joc preferat",
    "Mini-Game or Station Rotation": "Mini-joc sau rotație pe ateliere",
    "Confidence Game (favorite)": "Joc de încredere (preferat)",
    "Competitive Game": "Joc competitiv",

    // ---- ui.js shared helpers ----
    "Watch how": "Vezi cum",
    "Volleyballs": "Mingi de volei",
    "Net": "Fileu",
    "A wall": "Un perete",
    "Cones": "Conuri",
    "Resistance bands": "Benzi elastice",
    "Camp-friendly": "Bun pentru tabără",
    "Your camp": "Tabăra ta",
    "Your season": "Sezonul tău",
    "Your drill": "Exercițiul tău",
    "How it's organized": "Cum e organizat",
    "Setup": "Pregătire",
    "Run it": "Desfășurare",
    "Say this": "Spune-le așa",
    "Equipment": "Echipament",
    "Just a net and volleyballs.": "Doar fileu și mingi.",
    "Difficulty": "Dificultate",
    "Age range": "Interval de vârstă",
    "Time": "Durată",
    "On the court": "Pe teren",
    "Make it easier": "Fă-l mai ușor",
    "Make it harder": "Fă-l mai greu",
    "Edit drill": "Editează exercițiul",
    "Delete": "Șterge",
    "Swap drill": "Schimbă exercițiul",

    // ---- format.js: "how it's organized" ----
    "Grouping": "Organizare",
    "How it runs": "Cum se desfășoară",
    "Tracking": "Cum ții scorul",
    "Where": "Unde",
    "Aim for": "Țintește",
    "On your own — every player takes a spot along the wall so the whole team goes at once.":
      "Individual — fiecare jucător își ia un loc lângă perete, ca toată echipa să lucreze deodată.",
    "On your own — spread out so everyone works at the same time. Pair up to feed or shag balls if you can.":
      "Individual — împrăștiați-vă ca toți să lucreze în același timp. Faceți perechi ca să pasați sau să adunați mingile, dacă se poate.",
    "In pairs. Split the squad into twos; odd player out joins a trio or rotates in.":
      "În perechi. Împarte lotul câte doi; jucătorul rămas se alătură unui grup de trei sau intră prin rotație.",
    "In groups of three.": "În grupe de câte trei.",
    "As a full team in one court formation.": "Toată echipa într-o singură formație pe teren.",
    "Two teams on the court; any extra players wait just off the court and rotate in.":
      "Două echipe pe teren; jucătorii în plus așteaptă lângă teren și intră prin rotație.",
    "Head-to-head — winner keeps playing, loser swaps with someone waiting.":
      "Unu la unu — cine câștigă rămâne, cine pierde face schimb cu cineva care așteaptă.",
    "Everyone is in the game; rotate positions so no one is parked in one spot.":
      "Toți sunt în joc; rotiți pozițiile ca nimeni să nu stea blocat într-un singur loc.",
    "All groups work at the same time — no lines. Shag and reset between rounds so reps stay high.":
      "Toate grupele lucrează în același timp — fără rânduri. Adunați mingile și resetați între reprize ca să faceți cât mai multe repetări.",
    "All groups work at the same time — no standing in line.":
      "Toate grupele lucrează în același timp — fără statul la rând.",
    "Run it as one group; rotate players through each role so everyone gets reps.":
      "Lucrați ca un singur grup; rotiți jucătorii prin fiecare rol ca toți să aibă repetări.",
    "Players call their own score out loud; the coach confirms the result and keeps the running total.":
      "Jucătorii își strigă singuri scorul; antrenorul confirmă rezultatul și ține totalul.",
    "Players count their own reps; the coach circulates, watches technique, and feeds the cues below.":
      "Jucătorii își numără singuri repetările; antrenorul trece pe la fiecare, urmărește tehnica și dă indicațiile de mai jos.",
    "At the net, using the full court width.": "La fileu, pe toată lățimea terenului.",
    "Against a flat wall with room to move.": "Lângă un perete drept, cu loc de mișcare.",
    "Any open area — no net needed.": "Orice spațiu liber — fără fileu.",

    // ---- drills-ui.js ----
    "Browse the full drill library. Set up your team to tune it to their age and program.":
      "Răsfoiește toată biblioteca de exerciții. Configurează-ți echipa ca să o potrivim vârstei și programului lor.",
    "Search drills by name…": "Caută exerciții după nume…",
    "Search drills by name": "Caută exerciții după nume",
    "Filters": "Filtre",
    "Position": "Post",
    "Show all ages": "Arată toate vârstele",
    "★ Favorites": "★ Favorite",
    "Your drills": "Exercițiile tale",
    "Show": "Arată",
    "Add your own drill": "Adaugă propriul exercițiu",
    "Clear filters": "Șterge filtrele",
    "No drills match": "Niciun exercițiu nu se potrivește",
    "Try removing a filter or searching a different skill — the full library is still here.":
      "Încearcă să scoți un filtru sau caută altă tehnică — toată biblioteca e tot aici.",
    "No drills are available right now.": "Niciun exercițiu disponibil acum.",
    "All drills": "Toate exercițiile",
    "Drill deleted.": "Exercițiu șters.",

    // ---- drill-editor.js ----
    "Mini bands": "Mini benzi elastice",
    "Agility ladder": "Scăriță de agilitate",
    "Jump ropes": "Corzi de sărit",
    "Medicine ball": "Minge medicinală",
    "Reaction ball": "Minge de reacție",
    "Hoops / targets": "Cercuri / ținte",
    "Foam roller": "Rolă de masaj",
    "Plyo box": "Cutie pliometrică",
    "Mats": "Saltele",
    "e.g. Queen of the Court": "ex. Regina terenului",
    "Give your drill a name and pick a skill.": "Dă-i un nume exercițiului și alege o tehnică.",
    "Choose a human demonstration…": "Alege o demonstrație cu sportiv…",
    "Give your drill a name, human demonstration, and at least one step.":
      "Dă-i un nume exercițiului, alege o demonstrație cu sportiv și adaugă cel puțin un pas.",
    "Drill name": "Numele exercițiului",
    "Which category it belongs to.": "Din ce categorie face parte.",
    "Human demonstration": "Demonstrație cu sportiv",
    "Choose the movement the athlete should demonstrate. RallyReady will not guess from your notes.":
      "Alege mișcarea pe care trebuie să o demonstreze sportivul. RallyReady nu va ghici din notițele tale.",
    "Youngest age": "Vârsta minimă",
    "Oldest age": "Vârsta maximă",
    "1 = beginner, 5 = advanced.": "1 = începător, 5 = avansat.",
    "Min players": "Minim jucători",
    "Minutes": "Minute",
    "It's a game": "Este un joc",
    "How to set the court / players up.": "Cum aranjezi terenul / jucătorii.",
    "Steps": "Pași",
    "How to run it — one step per line.": "Cum se desfășoară — câte un pas pe rând.",
    "Coaching cues": "Indicații de antrenor",
    "What to say — one cue per line.": "Ce să spui — câte o indicație pe rând.",
    "Save changes": "Salvează modificările",
    "Add drill": "Adaugă exercițiul",
    "Edit your drill": "Editează exercițiul tău",
    "Give your drill a name and choose a valid human demonstration.":
      "Dă-i un nume exercițiului și alege o demonstrație cu sportiv validă.",
    "Add at least one step so the demonstration can follow your drill.":
      "Adaugă cel puțin un pas pentru ca demonstrația să poată urma exercițiul.",
    "Slow it down or shorten it.": "Încetinește-l sau scurtează-l.",
    "Add a target, a score, or game speed.": "Adaugă o țintă, un scor sau ritm de joc.",
    "Drill updated.": "Exercițiu actualizat.",
    "Drill added to your library. 🏐": "Exercițiu adăugat în biblioteca ta. 🏐",

    // ---- plan-edit.js ----
    "Added by you.": "Adăugat de tine.",
    "No matching drills.": "Niciun exercițiu care să se potrivească.",
    "Search drills…": "Caută exerciții…",
    "Search drills": "Caută exerciții",
    "Close": "Închide",
    "Choose a drill": "Alege un exercițiu",
    "Subtract 5 minutes": "Scade 5 minute",
    "Add 5 minutes": "Adaugă 5 minute",
    "Unpin drill": "Anulează fixarea exercițiului",
    "Pin drill (kept on Regenerate)": "Fixează exercițiul (rămâne la Regenerare)",
    "Swap for the next option": "Schimbă cu următoarea opțiune",
    "Choose a specific drill": "Alege un exercițiu anume",
    "Move up": "Mută mai sus",
    "Move down": "Mută mai jos",
    "Remove block": "Elimină blocul",

    // ---- games-ui.js ----
    "No games added yet. Your first-game date above is the opener — add the rest so practices build toward each match.":
      "Niciun meci adăugat încă. Data primului meci de mai sus e deschiderea — adaugă-le pe restul ca antrenamentele să ducă spre fiecare meci.",
    "Choose date": "Alege data",
    "Game date": "Data meciului",
    "vs. (optional)": "vs. (opțional)",
    "Opponent": "Adversar",
    "Remove game": "Elimină meciul",
    "Add a game": "Adaugă un meci",

    // ---- run.js ----
    "Close Run mode": "Închide modul Antrenament",
    "Practice run mode": "Mod antrenament live",
    "Practice": "Antrenament",
    "Subtract one minute": "Scade un minut",
    "Add one minute": "Adaugă un minut",
    "Resume timer": "Reia cronometrul",
    "Pause timer": "Pune pauză",
    "Previous block": "Blocul anterior",
    "Reset this block's timer": "Resetează cronometrul blocului",
    "Finish practice": "Încheie antrenamentul",
    "Next block": "Blocul următor",
    "Practice complete 🏐": "Antrenament finalizat 🏐",
    "Nice work — that's the whole plan. Cool down and check in with the team.":
      "Bravo — ăsta a fost tot planul. Faceți revenirea și discutați cu echipa.",
    "Done": "Gata",

    // ---- share.js ----
    "Practice plan": "Plan de antrenament",
    "Plan": "Plan",
    "Copied to clipboard": "Copiat în clipboard",
    "Couldn't copy — try Download": "Nu s-a putut copia — încearcă Descarcă",
    "Copy to clipboard": "Copiază în clipboard",
    "Download .txt": "Descarcă .txt",
    "Couldn't save the file": "Nu s-a putut salva fișierul",
    "Shared": "Distribuit",
    "Couldn't prepare the share": "Nu s-a putut pregăti distribuirea",
    "Made with RallyReady": "Făcut cu RallyReady",
    "Couldn't open the print view": "Nu s-a putut deschide vizualizarea pentru printare",
    "Phase": "Etapă",
    "TBD": "De stabilit",
    "Note:": "Notă:",
    "Focus:": "Accent:",
    "Gear:": "Echipament:",

    // ---- install.js ----
    "Install": "Instalează",
    "Dismiss install banner": "Închide bannerul de instalare",
    "Install RallyReady": "Instalează RallyReady",
    "Add it to your home screen for one-tap, offline access.":
      "Adaug-o pe ecranul principal pentru acces rapid, dintr-o atingere, și offline.",

    // ---- roster.js / positions (names) ----
    "Setter": "Ridicător",
    "Outside hitter": "Extremă",
    "Opposite": "Opus",
    "Middle blocker": "Central",
    "Libero": "Libero",
    "Defensive specialist": "Specialist în apărare",
    "Not sure yet": "Încă nu știu",
    "Position (optional)": "Post (opțional)",
    "No position": "Fără post",
    "Secondary position (optional)": "Post secundar (opțional)",
    "None": "Niciunul",
    "Add players on the Players tab to take attendance.": "Adaugă jucători în fila Jucători ca să iei prezența.",
    "Open the Players tab.": "Deschide fila Jucători.",

    // ---- players-ui.js ----
    "Set up a team first": "Întâi configurează o echipă",
    "Create your team on the Teams tab, then build your squad here.":
      "Creează-ți echipa în fila Echipe, apoi construiește-ți lotul aici.",
    "Go to Teams": "Mergi la Echipe",
    "Your squad — tap a player for 1-on-1 coaching: notes, goals, skills and attendance.":
      "Lotul tău — apasă pe un jucător pentru lucru individual: notițe, obiective, tehnici și prezență.",
    "Build lineup": "Construiește formația",
    "Player name": "Numele jucătorului",
    "No.": "Nr.",
    "Jersey number (optional)": "Numărul de pe tricou (opțional)",
    "Primary position": "Postul principal",
    "Change photo": "Schimbă poza",
    "Add a photo": "Adaugă o poză",
    "Player added.": "Jucător adăugat.",
    "Add player to squad": "Adaugă jucătorul în lot",
    "Add player": "Adaugă jucător",
    "Add a player": "Adaugă un jucător",
    "Photo": "Poză",
    "Name": "Nume",
    "Number": "Număr",
    "Photos are stored only on this device — they're never uploaded.":
      "Pozele sunt păstrate doar pe acest dispozitiv — nu sunt încărcate nicăieri.",
    "Your squad": "Lotul tău",
    "No players yet — add your first above.": "Niciun jucător încă — adaugă-l pe primul mai sus.",
    "By number": "După număr",
    "By position": "După post",
    "Group players by": "Grupează jucătorii după",
    "No position yet": "Încă fără post",
    "Couldn't open that image.": "Nu s-a putut deschide imaginea.",
    "Zoom": "Mărire",
    "Use photo": "Folosește poza",
    "Adjust photo": "Ajustează poza",
    "Drag the photo to reposition.": "Trage poza ca să o repoziționezi.",

    // ---- player-profile.js ----
    "All players": "Toți jucătorii",
    "Player not found": "Jucătorul nu a fost găsit",
    "This player may have been removed. Head back to your squad.":
      "Acest jucător s-ar putea să fi fost șters. Întoarce-te la lot.",
    "Back to Players": "Înapoi la Jucători",
    "Add photo": "Adaugă poză",
    "Couldn't save the photo — storage is full.": "Nu s-a putut salva poza — spațiul de stocare e plin.",
    "Remove": "Șterge",
    "Stop editing position": "Termină editarea postului",
    "Edit position": "Editează postul",
    "No position set yet — assign one so this player shows up in the right group and gets role-specific drills. Tap edit to choose.":
      "Încă fără post — atribuie unul ca jucătorul să apară în grupul potrivit și să primească exerciții pe rolul lui. Apasă editează ca să alegi.",
    "2nd": "sec.",
    "Save position": "Salvează postul",
    "Stop editing details": "Termină editarea detaliilor",
    "Edit player details": "Editează detaliile jucătorului",
    "Player details": "Detalii jucător",
    "Dominant hand": "Mâna dominantă",
    "Height": "Înălțime",
    "Birthday": "Data nașterii",
    "Add the player's hand, height and birthday — useful context when picking positions. Tap edit to start.":
      "Adaugă mâna, înălțimea și data nașterii jucătorului — utile când alegi posturile. Apasă editează ca să începi.",
    "Right": "Dreapta",
    "Left": "Stânga",
    "Feet": "Picioare",
    "Inches": "Inci",
    "Save details": "Salvează detaliile",
    "Skill tracker": "Evoluția tehnicilor",
    "Tap to rate each skill 0–5. We log it so you can see growth over the season.":
      "Apasă ca să evaluezi fiecare tehnică de la 0 la 5. Salvăm ca să vezi progresul pe parcursul sezonului.",
    "Focus goals": "Obiective de lucru",
    "e.g. Land 7/10 overhand serves": "ex. 7 din 10 servicii de sus reușite",
    "New focus goal": "Obiectiv nou",
    "Add goal": "Adaugă obiectiv",
    "No goals yet — set one or two clear targets for this player.":
      "Niciun obiectiv încă — stabilește una-două ținte clare pentru acest jucător.",
    "Coaching notes": "Notițe de antrenor",
    "Add a note — what to praise, what to work on…": "Adaugă o notiță — ce să lauzi, la ce să lucrați…",
    "New coaching note": "Notiță nouă",
    "Add note": "Adaugă notița",
    "No notes yet — jot the first one after practice.": "Nicio notiță încă — scrie prima după antrenament.",
    "Edit note": "Editează notița",
    "Delete note": "Șterge notița",
    "Save": "Salvează",
    "Most recent": "Cele mai recente",
    "Present": "Prezent",
    "Absent": "Absent",
    "present": "prezent",
    "absent": "absent",
    "No completed practices yet. Mark a practice complete on the Today tab to start tracking attendance.":
      "Niciun antrenament finalizat încă. Bifează un antrenament în fila Azi ca să începi să ții prezența.",

    // ---- positions-ui.js ----
    "How to coach every position — tuned to your team's age, with drills from the library.":
      "Cum antrenezi fiecare post — potrivit vârstei echipei tale, cu exerciții din bibliotecă.",
    "Position breakout in practices": "Lucru pe posturi la antrenamente",
    "On": "Pornit",
    "Off": "Oprit",
    "When on, your Today practice plan adds a short position-breakout block so players can work their specialist skills. Best for older teams — turn it off to keep everyone developing every skill.":
      "Când e pornit, planul din Azi adaugă un scurt bloc pe posturi, ca jucătorii să lucreze tehnicile lor de specialitate. Cel mai potrivit pentru echipele mai mari — oprește-l ca toți să dezvolte toate tehnicile.",
    "Position guides": "Ghiduri pe posturi",
    "Build your starting lineup": "Construiește formația de start",
    "Your squad by position": "Lotul tău pe posturi",
    "No one yet": "Încă nimeni",
    "gap": "lipsă",
    "All positions": "Toate posturile",
    "Responsibilities": "Responsabilități",
    "Front row": "Linia din față",
    "Back row": "Linia din spate",
    "Common mistakes & fixes": "Greșeli frecvente & corecturi",
    "Watch for": "Atenție la",
    "Fix": "Corectură",
    // Also a Tips section title — keep in step with i18n-content2.js, which
    // registers the same English key (one translation must win for both).
    "Rotation & overlap": "Rotația și suprapunerea",
    "Drills for this position": "Exerciții pentru acest post",
    "No matching drills for this age band yet — browse the full library on the Drills tab.":
      "Niciun exercițiu potrivit pentru această grupă de vârstă încă — răsfoiește toată biblioteca în fila Exerciții.",
    "Tap a drill for the full setup, cues and video. These work the skills this position lives in.":
      "Apasă pe un exercițiu pentru pregătire, indicații și video. Acestea lucrează tehnicile de care depinde acest post.",

    // ---- lineup.js ----
    "Zone 1 · back-right (serves first)": "Zona 1 · spate-dreapta (servește prima)",
    "Zone 2 · front-right": "Zona 2 · față-dreapta",
    "Zone 3 · front-middle": "Zona 3 · față-mijloc",
    "Zone 4 · front-left": "Zona 4 · față-stânga",
    "Zone 5 · back-left": "Zona 5 · spate-stânga",
    "Zone 6 · back-middle": "Zona 6 · spate-mijloc",
    "Create your team on the Teams tab and add players, then build a lineup here.":
      "Creează-ți echipa în fila Echipe și adaugă jucători, apoi construiește formația aici.",
    "No players yet": "Niciun jucător încă",
    "Add players to your squad first, then place them into the rotation here.":
      "Adaugă întâi jucători în lot, apoi așază-i în rotație aici.",
    "Add players": "Adaugă jucători",
    "Place your starting six. Numbers are the rotation zones — players rotate clockwise 1→6.":
      "Așază cei șase titulari. Numerele sunt zonele de rotație — jucătorii se rotesc în sensul acelor de ceas 1→6.",
    "Overlap basics": "Regulile de suprapunere",
    "At the moment the server contacts the ball, each player must be in their rotational order: front-row players ahead of their back-row partner, and right/centre/left in order across each row. Once the ball is served, players can move anywhere.":
      "În momentul în care jucătorul atinge mingea la serviciu, fiecare trebuie să fie în ordinea de rotație: jucătorii din linia din față înaintea partenerului din spate, iar dreapta/centru/stânga în ordine pe fiecare linie. După ce mingea e servită, jucătorii se pot mișca oriunde.",
    "Clear lineup": "Golește formația",
    "Clear the whole lineup?": "Golești toată formația?",
    "Empty zone": "Zonă goală",
    "Net at the top. Discs show each zone's player (number or initials).":
      "Fileul e sus. Discurile arată jucătorul din fiecare zonă (număr sau inițiale).",
    "Tap any zone to assign or change its player.": "Apasă pe orice zonă ca să atribui sau să schimbi jucătorul.",
    "— Empty —": "— Goală —",
    "Leave this zone open": "Lasă această zonă liberă",
    "Assign from a list": "Atribuie dintr-o listă",
    "Prefer dropdowns? Set each zone here — it stays in sync with the court above.":
      "Preferi liste derulante? Setează fiecare zonă aici — rămâne sincronizat cu terenul de mai sus.",
    "— empty —": "— goală —",

    // ---- team.js: age groups + program types ----
    "8-10 (FUNdamentals)": "8-10 (Distracție & bază)",
    "11-12 (Foundations)": "11-12 (Bazele jocului)",
    "13-14 (Developing)": "13-14 (Dezvoltare)",
    "15-16 (Competitive)": "15-16 (Competițional)",
    "17-18 (Advanced)": "17-18 (Avansat)",
    "Summer camp": "Tabără de vară",

    // ---- team.js: weekdays ----
    "Sunday": "Duminică", "Monday": "Luni", "Tuesday": "Marți", "Wednesday": "Miercuri",
    "Thursday": "Joi", "Friday": "Vineri", "Saturday": "Sâmbătă",
    "Sun": "Dum", "Mon": "Lun", "Tue": "Mar", "Wed": "Mie", "Thu": "Joi", "Fri": "Vin", "Sat": "Sâm",

    // ---- team.js: equipment extras ----
    "Plyo box / step": "Cutie / treaptă pliometrică",
    "Tumbling mats": "Saltele de gimnastică",

    // ---- team.js: net/ball reference words ----
    "Lightweight (foam / Volley-Lite)": "Ușoară (spumă / Volley-Lite)",
    "Lightweight (Volley-Lite)": "Ușoară (Volley-Lite)",
    "Regulation indoor": "Oficială de sală",

    // ---- team.js: required-field labels ----
    "Team name": "Numele echipei",
    "Age group": "Grupa de vârstă",
    "Camp start date": "Data de început a taberei",
    "Practice start date": "Data primului antrenament",
    "First game / season start": "Primul meci / începutul sezonului",

    // ---- team.js: form ----
    "The only setup RallyReady needs. Change anything anytime — it saves as you go.":
      "Singura configurare de care are nevoie RallyReady. Schimbă orice, oricând — se salvează pe măsură ce scrii.",
    "Saved": "Salvat",
    "Team setup": "Configurarea echipei",
    "Changes drills, net height, and ball.": "Schimbă exercițiile, înălțimea fileului și mingea.",
    "Program type": "Tipul programului",
    "A full season, or a 1–30 day camp.": "Un sezon întreg sau o tabără de 1–30 de zile.",
    "More options (optional)": "Mai multe opțiuni (opțional)",
    "Session length": "Durata sesiunii",
    "min": "min",
    "Minutes per session.": "Minute pe sesiune.",
    "Squad size": "Mărimea lotului",
    "Roughly how many players — drills are picked to suit the group.":
      "Aproximativ câți jucători — exercițiile sunt alese ca să se potrivească grupului.",
    "Equipment on hand": "Echipamentul disponibil",
    "Balls, a net and cones are assumed. Tick any extras you have so drills can use them.":
      "Mingile, fileul și conurile se presupun. Bifează ce mai ai în plus ca exercițiile să le poată folosi.",
    "Skill emphasis": "Accent pe tehnici",
    "Optional — weights which skills get featured.": "Opțional — influențează ce tehnici apar mai des.",
    "Edit team setup": "Editează configurarea echipei",
    "Your season opener should fall after practices begin — try a later date.":
      "Primul meci ar trebui să fie după ce încep antrenamentele — încearcă o dată mai târzie.",
    "Your season opener.": "Primul tău meci.",
    "Day one of camp.": "Prima zi de tabără.",
    "Camp length": "Durata taberei",
    "How many days it runs (1–30).": "Câte zile durează (1–30).",
    "Sessions per day": "Sesiuni pe zi",
    "When your practices begin.": "Când încep antrenamentele.",
    "Which days?": "În ce zile?",
    "Tap the days you practice — your plan only fills these.":
      "Apasă zilele în care vă antrenați — planul completează doar aceste zile.",
    "Game schedule": "Programul meciurilor",
    "Add your matches. Practices ramp toward the next game and ease the day before.":
      "Adaugă-ți meciurile. Antrenamentele cresc spre următorul meci și se domolesc cu o zi înainte.",
    "Select an age group…": "Alege o grupă de vârstă…",
    "e.g. Northside Spikers": "ex. Spikerii din Nord",

    // ---- team.js: summary ----
    "day of camp": "zi de tabără",
    "days of camp": "zile de tabără",
    "Sessions / day": "Sesiuni / zi",
    "Total sessions": "Total sesiuni",
    "Session": "Sesiune",
    "week to first game": "săptămână până la primul meci",
    "weeks to first game": "săptămâni până la primul meci",
    "Practices / week": "Antrenamente / săptămână",
    "Practice days": "Zile de antrenament",
    "Squad": "Lot",
    "Emphasis": "Accent",
    "Balanced": "Echilibrat",
    "Games": "Meciuri",
    "Opener only": "Doar deschiderea",
    "Manage players & attendance": "Gestionează jucătorii & prezența",
    "1-minute setup": "Configurare de un minut",
    "Tell RallyReady your team's age group and season dates, and every practice will be tailored to them.":
      "Spune-i lui RallyReady grupa de vârstă a echipei și datele sezonului, iar fiecare antrenament va fi croit pe ele.",

    // ---- feed-deck.js: the Ideas deck ----
    "One card at a time — today's picks, fresh each day.":
      "Câte o carte pe rând — alegerile de azi, proaspete în fiecare zi.",
    "Skip": "Sari peste",
    "Skipped": "Sărit peste",
    "Back": "Înapoi",
    "Back one card": "Înapoi o carte",
    "♥ Save": "♥ Salvează",
    "Swipe right to save, left to skip.": "Glisează la dreapta ca să salvezi, la stânga ca să sari peste.",
    "Browse all ideas": "Răsfoiește toate ideile",
    "All ideas": "Toate ideile",
    "The full feed — every idea, drill, challenge and tip, with filters.":
      "Fluxul complet — fiecare idee, exercițiu, provocare și sfat, cu filtre.",
    "That's the deck for today": "Acesta a fost pachetul de azi",
    "New cards tomorrow — same time, fresh mix.": "Cărți noi mâine — același loc, amestec proaspăt.",
    "Nothing saved this time — deal more or browse the full feed.":
      "Nimic salvat de data asta — mai împarte cărți sau răsfoiește fluxul complet.",
    "Deal me more": "Mai împarte-mi cărți",
    "See saved": "Vezi salvatele",
    "Back to the deck": "Înapoi la pachet",
    "Back to today's deck": "Înapoi la pachetul de azi",
    "Nothing in the deck": "Nimic în pachet",
    "Try a different age group — or browse the full feed of ideas, drills, challenges and tips.":
      "Încearcă altă grupă de vârstă — sau răsfoiește fluxul complet de idei, exerciții, provocări și sfaturi."
  });

  // ---- file-specific runtime patterns ---------------------------------------
  var t = RR.i18n.t;
  RR.i18n.addPatterns([
    // fallback screen-load error (app.js)
    { re: /^Couldn't load (.+)$/, ro: function (m) { return "Nu s-a putut încărca " + t(m[1]); } },

    // format.js
    { re: /^In small groups of (\d+)\.$/, ro: function (m) { return "În grupe mici de câte " + m[1] + "."; } },
    { re: /^Play about (\d+) min, then crown a winner or log the team's best score for next time\.$/,
      ro: function (m) { return "Jucați cam " + m[1] + " min, apoi desemnați un câștigător sau notați cel mai bun scor al echipei pentru data viitoare."; } },
    { re: /^About (\d+) min of work — chase clean, repeatable reps rather than rushing\.$/,
      ro: function (m) { return "Cam " + m[1] + " min de lucru — urmăriți repetări curate și constante, nu vă grăbiți."; } },

    // plan-edit.js — "<difficultyWord> · <n> min" and "<label> — <skill>"
    { re: /^(Beginner|Intermediate|Advanced) · (\d+) min$/, ro: function (m) { return t(m[1]) + " · " + m[2] + " min"; } },
    { re: /^(Warm-up|Skill Block|Game|Cool-down|Block) — (.+)$/, ro: function (m) { return t(m[1]) + " — " + t(m[2]); } },

    // run.js / today.js — "Skill: <focus>"
    { re: /^Skill: (.+)$/, ro: function (m) { return "Tehnică: " + t(m[1]); } },

    // share.js — print labels + share headings/aria
    { re: /^Focus: (.+)$/, ro: function (m) { return "Accent: " + t(m[1]); } },
    { re: /^Setup: (.+)$/, ro: function (m) { return "Pregătire: " + m[1]; } },
    { re: /^Note: (.+)$/, ro: function (m) { return "Notă: " + m[1]; } },
    { re: /^Gear: (.+)$/, ro: function (m) { return "Echipament: " + m[1]; } },
    { re: /^Share this (practice|plan)$/, ro: function (m) { return "Distribuie acest " + (m[1] === "plan" ? "plan" : "antrenament"); } },
    { re: /^Share (practice|plan)$/, ro: function (m) { return "Distribuie " + (m[1] === "plan" ? "planul" : "antrenamentul"); } },

    // roster.js — attendance aria
    { re: /^(.+): present$/, ro: function (m) { return m[1] + ": prezent"; } },
    { re: /^(.+): absent$/, ro: function (m) { return m[1] + ": absent"; } },
    { re: /^(\d+) of (\d+) present$/, ro: function (m) { return m[1] + " din " + m[2] + " prezenți"; } },

    // teams-ui.js — remove team + confirm
    { re: /^Remove "(.+)" and its history\? This can't be undone\.$/,
      ro: function (m) { return 'Elimini „' + m[1] + '” și istoricul ei? Nu se poate anula.'; } },
    { re: /^Remove (.+)$/, ro: function (m) { return "Elimină " + m[1]; } },

    // drills-ui.js — header blurb with program/age tail
    { re: /^Find the right activity for any skill — tuned to (.+)\.$/,
      ro: function (m) { return "Găsește activitatea potrivită pentru orice tehnică — adaptat pentru " + t(m[1]) + "."; } },
    { re: /^Delete "(.+)" from your drills\?$/, ro: function (m) { return 'Ștergi „' + m[1] + '” din exercițiile tale?'; } },
    { re: /^Step (\d+) of (\d+)(?: · Action (\d+) of (\d+))? · (.+)$/,
      ro: function (m) {
        return "Pasul " + m[1] + " din " + m[2] +
          (m[3] ? " · Acțiunea " + m[3] + " din " + m[4] : "") + " · " + t(m[5]);
      } },
    { re: /^Court movement · Step (\d+) of (\d+)$/,
      ro: function (m) { return "Mișcare pe teren · Pasul " + m[1] + " din " + m[2]; } },
    { re: /^Step (\d+) of (\d+)$/, ro: function (m) { return "Pasul " + m[1] + " din " + m[2]; } },
    { re: /^Show step (\d+)$/, ro: function (m) { return "Arată pasul " + m[1]; } },
    { re: /^Show (.+) technique$/, ro: function (m) { return "Arată tehnica: " + t(m[1]); } },
    { re: /^Human demonstration for (.+)$/,
      ro: function (m) { return "Demonstrație cu sportiv pentru " + t(m[1]); } },
    { re: /^Human demonstration selection needed for (.+)$/,
      ro: function (m) { return "Trebuie aleasă demonstrația cu sportiv pentru " + t(m[1]); } },
    { re: /^Animated example for (.+)$/, ro: function (m) { return "Exemplu animat pentru " + t(m[1]); } },
    { re: /^Saved minimum: (\d+) player$/, ro: function (m) { return "Minim salvat: " + m[1] + " jucător"; } },
    { re: /^Saved minimum: (\d+) players$/, ro: function (m) { return "Minim salvat: " + m[1] + " jucători"; } },
    { re: /^Ball route (\d+)$/, ro: function (m) { return "Traseul mingii " + m[1]; } },
    { re: /^Serve route (\d+)$/, ro: function (m) { return "Traseul serviciului " + m[1]; } },
    { re: /^Player route (\d+)$/, ro: function (m) { return "Traseul jucătorului " + m[1]; } },

    // team.js — summary hero dates
    { re: /^Starts · (.+)$/, ro: function (m) { return "Începe · " + m[1]; } },
    { re: /^Opener · (.+)$/, ro: function (m) { return "Deschidere · " + m[1]; } },

    // players-ui / player-profile — "<name>'s profile", grouping aria
    { re: /^Open (.+)'s profile$/, ro: function (m) { return "Deschide profilul lui " + m[1]; } },

    // positions-ui.js
    { re: /^Open the (.+) guide \((\d+|no) players\)$/, ro: function (m) {
        return "Deschide ghidul: " + t(m[1]) + " (" + (m[2] === "no" ? "fără" : m[2]) + " jucători)"; } },
    { re: /^Still exploring: (.+)$/, ro: function (m) { return "Încă explorează: " + m[1]; } },
    { re: /^Back to (.+)$/, ro: function (m) { return "Înapoi la " + t(m[1]); } },

    // lineup.js — picker title
    { re: /^Assign (.+)$/, ro: function (m) { return "Atribuie " + t(m[1]); } },

    // feed-deck.js — deck progress (for the ear) + end-card summary
    { re: /^Card (\d+) of (\d+)$/, ro: function (m) { return "Cartea " + m[1] + " din " + m[2]; } },
    { re: /^You saved (\d+) ideas?\.$/,
      ro: function (m) { return "Ai salvat " + m[1] + (m[1] === "1" ? " idee." : " idei."); } }
  ]);
}());
