// coaching-tips-2.js — expanded coaching library, part 1 (RR.coaching.addTips).
//
// More practical, scannable guidance in the same coach-to-coach voice as
// coaching.js: the mental game (sports psychology to unlock a player's
// potential), how players actually learn skills, and talking & relationships.
// Each tip is { id, title, icon, category, points:[...] } and attaches itself to
// the live tips library via RR.coaching.addTips, so the Tips screen groups it
// under its category automatically. Loaded right after coaching.js.
window.RR = window.RR || {};

(function () {
  "use strict";
  if (!RR.coaching || !RR.coaching.addTips) return;

  RR.coaching.addTips([
    // ===================== THE MENTAL GAME ===============================
    {
      id: "growth-mindset", title: "Grow a growth mindset", icon: "growth", category: "mental",
      points: [
        "Praise the work, not the talent: \"you kept your platform steady that whole rally\" tells a player what to repeat; \"you're a natural\" tells them nothing — and quietly says ability is fixed.",
        "Add one word: \"yet.\" \"I can't serve overhand\" becomes \"I can't serve overhand yet\" — a tiny change that turns a dead end into a road.",
        "Treat mistakes as information, not failure. Ask \"what did that teach us?\" so an error becomes the lesson instead of the enemy.",
        "Tell them the brain is a muscle: skills feel awkward, then clumsy, then automatic, because practice physically rewires it. Kids who know this push through the awkward stage.",
        "Compare players to their own last month, never to the best athlete in the gym — visible progress is the fuel that keeps them working.",
        "Model it yourself: say \"I haven't figured out the best way to teach this yet\" out loud. When the coach is still learning, it's safe for players to be learning too."
      ]
    },
    {
      id: "motivation-that-lasts", title: "Motivation that lasts", icon: "energy", category: "mental",
      points: [
        "Lean on the three things that drive kids from the inside: feeling they're getting better, having some say, and belonging to the group. Hit those and you rarely need to nag.",
        "Give choices wherever you can — \"which of these two games should we finish with?\" Ownership turns 'have to' into 'want to.'",
        "Reward effort and improvement out loud, not just winning; kids chase whatever gets noticed.",
        "Keep the wins small and frequent — a high-five, a shout-out, beating last week's score. Steady little victories beat one far-off trophy.",
        "Make sure everyone tastes success. A player who only ever fails stops trying, so engineer reps they can win, then stretch them.",
        "Protect the fun. Enjoyment is the top reason kids keep playing and the top reason they quit — guard it like part of the training, because it is."
      ]
    },
    {
      id: "set-goals-that-work", title: "Set goals that work", icon: "goal", category: "mental",
      points: [
        "Aim at the process, not the scoreboard: \"serve to the deep corner\" is something a player controls; \"win the tournament\" isn't.",
        "Make goals specific and checkable — \"10 good serves in a row\" beats \"serve better,\" because everyone can see when it's done.",
        "Stack short and long: a goal for today's practice and a goal for the month. The little ones keep focus; the big one keeps direction.",
        "Put team goals on the whiteboard and point every practice back at them, so the work always has an obvious why.",
        "Set the bar just past what they can do now — challenging but reachable. Too easy is boring; too hard is discouraging.",
        "Revisit goals often. Hit one? Celebrate and set the next. Missed one? Adjust it, don't abandon it."
      ]
    },
    {
      id: "focus-and-attention", title: "Sharpen focus & attention", icon: "focus", category: "mental",
      points: [
        "Give players a cue word to snap back to — \"target,\" \"reset,\" \"feet\" — so a wandering mind has a handle to grab.",
        "Point attention outside the body: \"hit the deep corner\" works better than \"snap your wrist.\" Aiming at the result beats over-thinking the mechanics.",
        "Teach focus as a switch, not a dimmer stuck on full: lock in for the serve, relax between rallies. Staying tense all practice just burns kids out.",
        "Cut the clutter — one cue at a time. A player chasing five thoughts catches none of them.",
        "Use the eyes: \"watch the toss,\" \"read the setter's hands.\" Knowing the right thing to look at is most of attention.",
        "Build little pre-play routines — a bounce, a breath — so focus has a reliable on-switch when the gym gets loud."
      ]
    },
    {
      id: "visualization", title: "Picture it: mental rehearsal", icon: "focus", category: "mental",
      points: [
        "Have players close their eyes for twenty seconds before serving and SEE the ball land where they want — the brain rehearses the move almost like a real rep.",
        "Make the picture vivid: the feel of the contact, the sound, the ball dropping in. The more senses, the stronger the rehearsal.",
        "Preview success, not disaster — imagine the clean pass, not the shank.",
        "Use it for new skills too: picturing the approach footwork before trying it speeds up the learning.",
        "Keep it short and game-like; ten focused seconds beats a long daydream.",
        "Pair it with a breath before big moments, so players walk to the line calm and already 'seeing' the point go their way."
      ]
    },
    {
      id: "composure-under-pressure", title: "Stay calm under pressure", icon: "breathe", category: "mental",
      points: [
        "Teach one slow breath — in for four, out for six — to drop the heart rate and steady the hands when the game tightens.",
        "Normalize nerves: butterflies just mean it matters. The goal isn't to kill them, it's to fly them in formation.",
        "Build a between-rally reset — a breath, a bounce, a cue word — so a mistake gets left behind instead of carried into the next point.",
        "Shrink the moment. Instead of \"we have to win this,\" it's \"just make a good serve\" — one controllable action at a time.",
        "Keep your own sideline calm. Players read the coach's body; panic is contagious, and so is composure.",
        "Rehearse pressure in practice — \"win the next three or we run a lap\" — so the squeeze feels familiar by game day."
      ]
    },
    {
      id: "self-talk", title: "Coach the inner voice", icon: "talk", category: "mental",
      points: [
        "Players talk to themselves nonstop; your job is to help them say something useful. \"Next ball\" beats \"don't mess up.\"",
        "Trade 'don't' for 'do': the brain skips the 'don't' and just hears 'shank it.' Say the action you want instead.",
        "Give them a go-to phrase for tough moments — \"I've got this,\" \"big arm,\" \"reset\" — short, positive, and theirs.",
        "Catch the negative spiral early. A player muttering at themselves needs a quick, calm cue to break it.",
        "Model kind self-talk out loud: \"okay, that drill flopped — let's tweak it.\" They learn the tone from you.",
        "Remind them everyone's inner critic is loud; the best players just don't take dictation from it."
      ]
    },
    {
      id: "team-confidence", title: "Build team confidence & momentum", icon: "confidence", category: "mental",
      points: [
        "Confidence is collective — when the group believes it can side-out, it usually does. Talk about 'us' and point at proof: \"that's three in a row.\"",
        "Teach a celebration after every won point — a huddle, a clap, a shout. Energy you create on purpose carries a team through a run.",
        "When momentum slips, take the timeout early: settle the breathing, give one clear job, send them back out before the slide snowballs.",
        "Bank evidence. Remind the team of a comeback they've already made; belief grows from memories of doing it before.",
        "Spread small responsibilities so confidence isn't riding on one star — a team with six contributors is hard to rattle.",
        "Make body language a team standard: heads up, talk loud, hustle to the next ball. Looking confident is the first step to feeling it."
      ]
    },

    // ===================== TEACHING THE SKILLS ===========================
    {
      id: "teach-so-it-sticks", title: "Teach so it sticks", icon: "skills", category: "teaching",
      points: [
        "Let the game do the teaching: kids learn to read a real ball faster in a 2v2 rally than in a hundred perfect tosses.",
        "Use small-sided games — 2v2, 3v3 — so everyone gets buckets of touches and real decisions, not a line of eight waiting their turn.",
        "Coach in the flow: a quick cue between rallies, then play on. Long lectures kill the very reps that build the skill.",
        "Add a constraint to grow a skill — \"every ball must be set before it crosses\" — and players discover the technique by solving the problem.",
        "Keep it game-like and a little messy. Random, over-the-net reps with a score transfer to matches; tidy blocked drills often don't.",
        "Finish skills inside a game so players feel why the technique matters — a clean pass that actually leads to a point."
      ]
    },
    {
      id: "show-dont-tell", title: "Show, don't just tell", icon: "demo", category: "teaching",
      points: [
        "A five-second demo beats a five-minute explanation. Kids copy what they see far better than what they hear.",
        "Show it from the angle they'll use it, and show it more than once — slow first, then game-speed.",
        "Use a player to demo when you can: \"watch how Maya plants her feet\" lifts that player and frees you to talk.",
        "Demo the right way, briefly the wrong way, then the right way again — the contrast makes the key point obvious.",
        "Pair the picture with one or two words (\"high, then snap\") so they carry a cue away from the demo.",
        "Then get out of the way and let them try it immediately; a demo they don't act on right away is forgotten by the next drill."
      ]
    },
    {
      id: "ask-dont-tell", title: "Ask, don't always tell", icon: "question", category: "teaching",
      points: [
        "Ask before you correct: \"where were your feet?\" makes a player notice for themselves — and self-corrections stick far better than yours.",
        "Use short, real questions, not quizzes: \"what did you see the setter do?\" gets them reading the game.",
        "Give thinking time. Count to five in your head after asking; that first silence is just a brain working.",
        "Let players coach each other in pairs — explaining a skill is one of the fastest ways to actually learn it.",
        "Resist fixing everything. A little struggle while they figure it out builds problem-solvers, not robots who wait for instructions.",
        "Save the direct answer for safety and for when they're truly stuck; the rest of the time, hand the thinking back to them."
      ]
    },
    {
      id: "challenge-everyone", title: "Challenge everyone at once", icon: "skills", category: "teaching",
      points: [
        "Build an easier and a harder version of the same drill, so the beginner and the standout are both stretched — not bored or buried.",
        "Change the task, not the kid: shorter distance or a catch-and-throw step for those who need it; a target or a defender for those who don't.",
        "Group flexibly — sometimes by skill for focused work, sometimes mixed so stronger players lift the developing ones.",
        "Give fast finishers a 'next level' to chase so they never stand around waiting for the rest.",
        "Watch the quiet middle, not just the top and bottom — they're the easiest players to accidentally ignore.",
        "Measure success against each player's own start line; everyone can win at their own level on the very same drill."
      ]
    },
    {
      id: "feedback-that-sticks", title: "Give feedback that sticks", icon: "talk", category: "teaching",
      points: [
        "Be specific and immediate: \"great platform angle on that pass\" lands; \"good job\" evaporates.",
        "Catch them being right. Aim for far more 'caught you doing it well' than 'fix this' — players grow toward attention.",
        "One fix at a time. Pick the single biggest thing and let the rest go until that one's solid.",
        "Coach the next rep, not the last mistake — say what to do, point forward, keep it moving.",
        "Skip the 'compliment sandwich.' Kids smell the criticism buried in the middle; be warm, be honest, be brief.",
        "Check it landed: a nod, a thumbs-up, or have them say the cue back. Feedback they can't repeat never arrived."
      ]
    },

    // ===================== TALKING & RELATIONSHIPS =======================
    {
      id: "build-trust", title: "Build trust & real connection", icon: "talk", category: "talking",
      points: [
        "Learn every name in the first week and use it constantly — nothing says 'you matter here' faster.",
        "Greet each kid as they arrive. Ten seconds of \"how was your day?\" buys you a season of buy-in.",
        "Be consistent and fair: players trust a coach whose reactions they can predict, not one who's warm Monday and sharp Thursday.",
        "Do what you say. Keep your promises about playing time, drills, and fairness, or the words stop counting.",
        "Notice the person, not just the player — a tough week at school shows up at practice, and a little grace goes a long way.",
        "Keep healthy boundaries, especially with other people's kids: warm and caring, professional and clear."
      ]
    },
    {
      id: "body-language", title: "Your body language & presence", icon: "energy", category: "talking",
      points: [
        "Teams mirror the coach. Move, clap, use your voice — flat coaches grow flat practices.",
        "Get down to eye level to correct a young player; standing over them turns coaching into a telling-off.",
        "Keep your face and shoulders calm after errors — your reaction sets whether the gym feels safe to try hard things.",
        "Use a clear quiet signal (\"balls down, eyes up\") instead of shouting over the noise; control beats volume.",
        "Stand where you can see everyone and everyone can see you; position is half of presence.",
        "Mind the sideline on game day: arms crossed and pacing reads as panic. Steady body, steady team."
      ]
    },
    {
      id: "player-leaders", title: "Grow player leaders & captains", icon: "leader", category: "talking",
      points: [
        "Hand out small jobs — lead the warm-up, call the line, gather the balls — so leadership is practiced, not just appointed.",
        "Pick captains for how they treat teammates, not only how they play; the loudest or most talented isn't always the leader.",
        "Teach captains to encourage first and organize second — their main job is lifting heads, not bossing.",
        "Let players solve some problems themselves: who serves, who covers tips. Ownership grows leaders.",
        "Coach your leaders privately so they carry your standards onto the court when you can't say a word.",
        "Rotate little leadership chances around the whole team — every kid should get to be the one who picks others up."
      ]
    }
  ]);
})();
