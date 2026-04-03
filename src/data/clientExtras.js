// Extra mock data for the ClientProfile page.
// Kept separate to avoid bloating mockData.js.

// Session extras: rating (1–5 how client felt), heavierThanPrescribed (PT only)
export const sessionExtras = {
  'ts-sm-1': { rating: 4, heavierThanPrescribed: true  },
  'ts-sm-2': { rating: null, heavierThanPrescribed: false },
  'ts-sm-3': { rating: 5, heavierThanPrescribed: false },
  'is-sm-1': { rating: 3, heavierThanPrescribed: null  },
  'is-sm-2': { rating: null, heavierThanPrescribed: null  },
  'ts-at-1': { rating: 5, heavierThanPrescribed: true  },
  'ts-at-2': { rating: 4, heavierThanPrescribed: false },
  'is-at-1': { rating: 3, heavierThanPrescribed: null  },
  'is-at-2': { rating: 4, heavierThanPrescribed: null  },
  'ts-kt-1': { rating: 5, heavierThanPrescribed: false },
  'ts-kt-2': { rating: 4, heavierThanPrescribed: true  },
  'is-kt-1': { rating: 4, heavierThanPrescribed: null  },
  'is-kt-2': { rating: 3, heavierThanPrescribed: null  },
  'ts-ml-1': { rating: 3, heavierThanPrescribed: false },
  'ts-ml-2': { rating: 4, heavierThanPrescribed: false },
  'is-ml-1': { rating: 2, heavierThanPrescribed: null  },
  'ts-tr-1': { rating: 2, heavierThanPrescribed: false },
  'ts-tr-2': { rating: null, heavierThanPrescribed: false },
  'is-tr-1': { rating: null, heavierThanPrescribed: false },
  'is-tr-2': { rating: null, heavierThanPrescribed: false },
  'ts-ev-1': { rating: 5, heavierThanPrescribed: true  },
  'ts-ev-2': { rating: 4, heavierThanPrescribed: false },
  'is-ev-1': { rating: 4, heavierThanPrescribed: null  },
  'is-ev-2': { rating: 5, heavierThanPrescribed: null  },
  'ts-dc-1': { rating: 4, heavierThanPrescribed: null  },
  'ts-dc-2': { rating: 4, heavierThanPrescribed: null  },
  'is-dc-1': { rating: 3, heavierThanPrescribed: null  },
  'is-dc-2': { rating: 4, heavierThanPrescribed: null  },
  'ts-jl-1': { rating: 4, heavierThanPrescribed: null  },
  'ts-jl-2': { rating: 3, heavierThanPrescribed: null  },
  'is-jl-1': { rating: 4, heavierThanPrescribed: null  },
  'is-jl-2': { rating: 5, heavierThanPrescribed: null  },
  'is-jl-3': { rating: null, heavierThanPrescribed: null  },
  'ts-er-1': { rating: 5, heavierThanPrescribed: null  },
  'ts-er-2': { rating: 4, heavierThanPrescribed: null  },
  'is-er-1': { rating: 4, heavierThanPrescribed: null  },
  'is-er-2': { rating: 3, heavierThanPrescribed: null  },
  'ts-pn-1': { rating: 3, heavierThanPrescribed: null  },
  'ts-pn-2': { rating: 4, heavierThanPrescribed: null  },
  'is-pn-1': { rating: 4, heavierThanPrescribed: null  },
  'is-pn-2': { rating: null, heavierThanPrescribed: null  },
}

// Weekly habits: Mon–Sun index 0–6.
// true = completed, false = missed, null = future / not tracked
// Today is Thursday April 2, 2026 → index 3
// Past: Mon(0) Mar 30, Tue(1) Mar 31, Wed(2) Apr 1, Thu(3) Apr 2 today
// Future: Fri(4), Sat(5), Sun(6)

export const clientExtras = {
  'client-1': {
    plansCompleted: 3,
    notes: [
      { id: 'n-sm-1', type: 'auto',   content: 'Load progression detected: deadlift increased 10 kg over 3 sessions (60 → 70 → 80 kg).', createdAt: '2026-03-25' },
      { id: 'n-sm-2', type: 'auto',   content: 'Completion rate dropped below 80% this week — 2 missed home workouts.', createdAt: '2026-03-27' },
      { id: 'n-sm-3', type: 'manual', content: 'Sarah mentioned work stress is affecting sleep. Adjusted intensity for this week.', createdAt: '2026-03-25' },
      { id: 'n-sm-4', type: 'manual', content: 'Great deadlift form — consider moving to 85 kg next session.', createdAt: '2026-03-20' },
    ],
    messages: [
      { id: 'msg-sm-1', from: 'client',  text: 'Hey Rebecca! Just finished the cardio session. Felt harder than usual today 😅', timestamp: '2026-04-01T09:30:00' },
      { id: 'msg-sm-2', from: 'trainer', text: "Great effort Sarah! That's totally normal mid-week. Make sure you're hydrating well before tomorrow's session.", timestamp: '2026-04-01T10:15:00' },
      { id: 'msg-sm-3', from: 'client',  text: 'Will do! Should I still do the mobility work tonight or skip it since I have a big session tomorrow?', timestamp: '2026-04-01T10:45:00' },
    ],
    weeklyHabits: [
      { name: 'Morning mobility',  days: [true,  true,  true,  true,  null, null, null] },
      { name: 'Protein target hit', days: [true,  false, true,  true,  null, null, null] },
      { name: 'Steps > 8,000',     days: [true,  true,  false, true,  null, null, null] },
      { name: 'Sleep 7+ hrs',      days: [false, true,  true,  false, null, null, null] },
    ],
  },
  'client-2': {
    plansCompleted: 2,
    notes: [
      { id: 'n-at-1', type: 'auto',   content: 'Consistent 5 km improvement: 30:00 → 28:30 → 27:00 → 25:45 over 4 weeks.', createdAt: '2026-03-29' },
      { id: 'n-at-2', type: 'auto',   content: 'Personal best on bench press: 100 kg recorded on Mar 28.', createdAt: '2026-03-28' },
      { id: 'n-at-3', type: 'manual', content: 'Alex is very close to the 5 km goal. Consider adding one interval session per week to break 25 min.', createdAt: '2026-03-29' },
    ],
    messages: [
      { id: 'msg-at-1', from: 'client',  text: 'PB on bench today! 100 kg felt solid 💪', timestamp: '2026-03-28T11:00:00' },
      { id: 'msg-at-2', from: 'trainer', text: "Amazing work Alex! That's a huge milestone. We'll add more volume to the upper body block next week.", timestamp: '2026-03-28T11:30:00' },
      { id: 'msg-at-3', from: 'client',  text: 'Sounds good! My legs are still sore from Tuesday though 😂', timestamp: '2026-03-28T12:00:00' },
    ],
    weeklyHabits: [
      { name: 'Run logged',          days: [true,  false, true,  false, null, null, null] },
      { name: 'Protein target hit',  days: [true,  true,  true,  true,  null, null, null] },
      { name: 'Ice bath / recovery', days: [false, true,  false, true,  null, null, null] },
    ],
  },
  'client-3': {
    plansCompleted: 4,
    notes: [
      { id: 'n-kt-1', type: 'auto',   content: 'Body fat trend: 26% → 25% → 23.5% → 22% — on track for June target.', createdAt: '2026-03-30' },
      { id: 'n-kt-2', type: 'manual', content: 'Keiko responds very well to HIIT. Consider increasing frequency from 2× to 3× per week.', createdAt: '2026-03-30' },
    ],
    messages: [
      { id: 'msg-kt-1', from: 'client',  text: "Loved today's HIIT session! Felt strong all the way through 🔥", timestamp: '2026-03-30T16:00:00' },
      { id: 'msg-kt-2', from: 'trainer', text: "You crushed it today Keiko! Your endurance has improved so much since January.", timestamp: '2026-03-30T16:30:00' },
      { id: 'msg-kt-3', from: 'client',  text: "What's on the menu for the next program after this one ends?", timestamp: '2026-03-31T08:00:00' },
    ],
    weeklyHabits: [
      { name: 'Calorie target',        days: [true, true,  true,  true,  null, null, null] },
      { name: 'Morning cardio',        days: [true, true,  true,  false, null, null, null] },
      { name: 'Steps > 10,000',        days: [true, true,  true,  true,  null, null, null] },
      { name: 'No late-night snacking',days: [true, true,  false, true,  null, null, null] },
    ],
  },
  'client-5': {
    plansCompleted: 1,
    notes: [
      { id: 'n-ml-1', type: 'auto',   content: 'Completion rate declining: 80% → 75% → 60% → 62% — check in on motivation.', createdAt: '2026-03-24' },
      { id: 'n-ml-2', type: 'manual', content: "Marcus hasn't logged a check-in since Monday. Follow up before Thursday's session.", createdAt: '2026-03-29' },
    ],
    messages: [
      { id: 'msg-ml-1', from: 'trainer', text: "Hey Marcus, just checking in — how are you feeling this week? Haven't seen a check-in since Monday.", timestamp: '2026-03-29T10:00:00' },
      { id: 'msg-ml-2', from: 'client',  text: 'Hey sorry, been really busy with work. Will try to get the sessions in this week.', timestamp: '2026-03-29T14:00:00' },
      { id: 'msg-ml-3', from: 'trainer', text: "No worries! Even 20 mins counts. Let's touch base before Thursday's session.", timestamp: '2026-03-29T14:30:00' },
    ],
    weeklyHabits: [
      { name: 'Workout logged',     days: [false, false, false, false, null, null, null] },
      { name: 'Protein target hit', days: [true,  false, false, false, null, null, null] },
      { name: 'Steps > 7,000',      days: [true,  true,  false, false, null, null, null] },
    ],
  },
  'client-7': {
    plansCompleted: 1,
    notes: [
      { id: 'n-tr-1', type: 'auto',   content: 'Missed 3 of 4 independent sessions this week — significant drop in home engagement.', createdAt: '2026-03-31' },
      { id: 'n-tr-2', type: 'auto',   content: 'In-person attendance maintained despite low home effort — may need adjusted program.', createdAt: '2026-03-31' },
      { id: 'n-tr-3', type: 'manual', content: 'Tom mentioned new job — long hours. Considering reducing home workout volume temporarily.', createdAt: '2026-03-31' },
    ],
    messages: [
      { id: 'msg-tr-1', from: 'trainer', text: "Great to see you today Tom! Shall we talk about adjusting your schedule to make the home sessions more realistic?", timestamp: '2026-03-31T12:00:00' },
      { id: 'msg-tr-2', from: 'client',  text: "Yeah the new job is killing me. I barely have time to eat let alone work out at home 😬", timestamp: '2026-03-31T18:00:00' },
      { id: 'msg-tr-3', from: 'trainer', text: "Totally understand! Let's drop home sessions to 2× a week and focus on quality over quantity.", timestamp: '2026-03-31T18:30:00' },
    ],
    weeklyHabits: [
      { name: 'Workout logged',     days: [false, false, false, false, null, null, null] },
      { name: 'Protein target hit', days: [true,  true,  false, false, null, null, null] },
    ],
  },
  'client-8': {
    plansCompleted: 3,
    notes: [
      { id: 'n-ev-1', type: 'auto',   content: 'Deadlift progression: 50 → 57.5 → 62.5 → 65 kg — excellent rate of improvement.', createdAt: '2026-03-31' },
      { id: 'n-ev-2', type: 'auto',   content: 'Perfect session attendance this month — 100% in-person completion rate.', createdAt: '2026-03-31' },
      { id: 'n-ev-3', type: 'manual', content: 'Elena asked about updating nutrition plan — follow up next session.', createdAt: '2026-03-31' },
    ],
    messages: [
      { id: 'msg-ev-1', from: 'client',  text: 'Hey Rebecca! Can we update my meal plan? I feel like I need more carbs on training days.', timestamp: '2026-03-31T15:00:00' },
      { id: 'msg-ev-2', from: 'trainer', text: "Great call Elena! Yes, let's increase your carb targets on session days. I'll draft a revised plan tomorrow.", timestamp: '2026-03-31T15:30:00' },
      { id: 'msg-ev-3', from: 'client',  text: "Awesome, thank you! Also that deadlift session today was 🔥", timestamp: '2026-03-31T15:45:00' },
    ],
    weeklyHabits: [
      { name: 'Morning mobility',  days: [true, true, true, true, null, null, null] },
      { name: 'Protein target hit', days: [true, true, true, true, null, null, null] },
      { name: 'Steps > 8,000',     days: [true, true, true, true, null, null, null] },
      { name: 'Sleep 7+ hrs',      days: [true, true, true, false, null, null, null] },
    ],
  },
  'client-4': {
    plansCompleted: 2,
    notes: [
      { id: 'n-dc-1', type: 'auto',   content: 'ROM improving: 90° → 110° → 130° → 140° → 150° → 155° — on track toward 180° target.', createdAt: '2026-03-28' },
      { id: 'n-dc-2', type: 'manual', content: 'Damien achieved full abduction ROM during session. Consider progressing to strengthening phase next appointment.', createdAt: '2026-03-28' },
    ],
    messages: [
      { id: 'msg-dc-1', from: 'client',  text: 'Great session today! Shoulder feels so much better after the manipulation.', timestamp: '2026-03-28T13:00:00' },
      { id: 'msg-dc-2', from: 'trainer', text: "That's wonderful Damien! Full ROM today was a big milestone. Keep up the band exercises at home.", timestamp: '2026-03-28T13:30:00' },
      { id: 'msg-dc-3', from: 'client',  text: 'Will do. I forgot my bands — can I use a towel as a substitute?', timestamp: '2026-03-28T14:00:00' },
    ],
    weeklyHabits: [
      { name: 'Home exercise program', days: [true, true, true,  true,  null, null, null] },
      { name: 'Ice/heat routine',      days: [true, false, true, true,  null, null, null] },
      { name: 'Posture checks',        days: [true, true,  true, false, null, null, null] },
    ],
  },
  'client-9': {
    plansCompleted: 1,
    notes: [
      { id: 'n-jl-1', type: 'auto',   content: 'Pain score reduced from 8/10 to 3/10 over 12 weeks — significant functional improvement.', createdAt: '2026-03-27' },
      { id: 'n-jl-2', type: 'manual', content: 'Jordan is close to discharge criteria. Consider functional movement assessment next appointment.', createdAt: '2026-03-27' },
    ],
    messages: [
      { id: 'msg-jl-1', from: 'client',  text: "My back felt fine all day today — first time in months! 🎉", timestamp: '2026-03-28T19:00:00' },
      { id: 'msg-jl-2', from: 'trainer', text: "That's incredible Jordan! That's exactly the outcome we've been working toward. Keep doing the HEP daily.", timestamp: '2026-03-28T19:30:00' },
      { id: 'msg-jl-3', from: 'client',  text: "I will! Really grateful for your help. When do you think I'll be fully discharged?", timestamp: '2026-03-29T08:00:00' },
    ],
    weeklyHabits: [
      { name: 'HEP exercises',      days: [true, true, true, true, null, null, null] },
      { name: 'Walking 20+ min',    days: [true, true, true, true, null, null, null] },
      { name: 'Avoid sitting >1 hr',days: [true, false, true, true, null, null, null] },
    ],
  },
  'client-10': {
    plansCompleted: 1,
    notes: [
      { id: 'n-er-1', type: 'auto',   content: "Quad strength at 80% of contralateral limb — cleared for plyometric progression.", createdAt: '2026-03-30' },
      { id: 'n-er-2', type: 'manual', content: "Emma introduced light plyometrics with no adverse reactions. Good candidate for return-to-running assessment in 3 weeks.", createdAt: '2026-03-30' },
    ],
    messages: [
      { id: 'msg-er-1', from: 'client',  text: 'Did my pool walking again today — easier than last week!', timestamp: '2026-03-29T11:00:00' },
      { id: 'msg-er-2', from: 'trainer', text: "Amazing progress Emma! The aquatic resistance is building your quad strength without impact. Keep it up!", timestamp: '2026-03-29T11:30:00' },
      { id: 'msg-er-3', from: 'client',  text: "When do you think I'll be able to run again? It feels so close 😊", timestamp: '2026-03-29T12:00:00' },
    ],
    weeklyHabits: [
      { name: 'HEP completed',       days: [true, true, true,  true,  null, null, null] },
      { name: 'Pool walking',        days: [false, true, false, false, null, null, null] },
      { name: 'Quad sets (3× daily)',days: [true, true, true,  false, null, null, null] },
    ],
  },
  'client-6': {
    plansCompleted: 2,
    notes: [
      { id: 'n-pn-1', type: 'auto',   content: 'Recovery time improving: 72 hrs → 60 hrs → 48 hrs post-run — on track for June target.', createdAt: '2026-03-16' },
      { id: 'n-pn-2', type: 'manual', content: 'Client reported increased knee soreness after recent runs. Flag for further assessment — possible IT band tightness.', createdAt: '2026-03-30' },
    ],
    messages: [
      { id: 'msg-pn-1', from: 'client',  text: 'My knee was quite sore after my long run on Sunday. Is that normal?', timestamp: '2026-03-30T10:00:00' },
      { id: 'msg-pn-2', from: 'trainer', text: "Thanks for flagging Priya. IT band tightness can cause lateral knee pain after long runs. I'll do a full assessment at your next appointment.", timestamp: '2026-03-30T10:30:00' },
      { id: 'msg-pn-3', from: 'client',  text: 'OK thank you. Should I still run this week or rest it?', timestamp: '2026-03-30T11:00:00' },
    ],
    weeklyHabits: [
      { name: 'Foam rolling',  days: [true, true, true,  true,  null, null, null] },
      { name: 'Run logged',    days: [true, false, false, false, null, null, null] },
      { name: 'Ice after runs',days: [true, false, false, false, null, null, null] },
    ],
  },
  'client-11': { plansCompleted: 2, notes: [], messages: [], weeklyHabits: [] },
  'client-12': { plansCompleted: 1, notes: [], messages: [], weeklyHabits: [] },
}

const DEFAULT_EXTRAS = { plansCompleted: 0, notes: [], messages: [], weeklyHabits: [] }

export function getClientExtras(clientId) {
  return clientExtras[clientId] ?? DEFAULT_EXTRAS
}

export function getSessionExtras(sessionId) {
  return sessionExtras[sessionId] ?? {}
}
