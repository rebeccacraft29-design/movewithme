// ─── Progress mock data ───────────────────────────────────────────────────────
// 16 weekly snapshots, oldest → newest (Dec 14 2025 → Mar 29 2026)

export const WEEK_LABELS = [
  'Dec 14', 'Dec 21', 'Dec 28',
  'Jan 4',  'Jan 11', 'Jan 18', 'Jan 25',
  'Feb 1',  'Feb 8',  'Feb 15', 'Feb 22',
  'Mar 1',  'Mar 8',  'Mar 15', 'Mar 22', 'Mar 29',
]

// Compact helpers
function ex(values) {
  return WEEK_LABELS.map((date, i) => ({ date, value: values[i] }))
}
function wc(rates) {
  return WEEK_LABELS.map((week, i) => ({ week, rate: rates[i] }))
}
// habit string "TTFFTTFT..." → boolean array
function h(s) { return s.split('').map(c => c === 'T') }

export const progressData = {

  // ── Sarah Mitchell ──────────────────────────────────────────────────────────
  'client-1': {
    exercises: [
      { name: 'Deadlift',  unit: 'kg', color: '#FF6B5B', lowerIsBetter: false,
        data: ex([65, 67.5, 70, 70, 72.5, 75, 75, 77.5, 80, 80, 82.5, 82.5, 85, 87.5, 90, 90]) },
      { name: 'Squat',     unit: 'kg', color: '#FFA733', lowerIsBetter: false,
        data: ex([60, 62.5, 65, 65, 67.5, 70, 70, 72.5, 75, 77.5, 80, 80, 82.5, 85, 85, 85]) },
      { name: 'Hip Thrust', unit: 'kg', color: '#2EC4A0', lowerIsBetter: false,
        data: ex([80, 80, 85, 90, 90, 95, 95, 100, 100, 102.5, 102.5, 105, 107.5, 110, 110, 112.5]) },
    ],
    weeklyCompletion: wc([85, 80, 90, 75, 70, 85, 80, 82, 78, 72, 65, 75, 80, 78, 68, 72]),
    habits: [
      { name: 'Morning mobility',  weeks: h('TTTFTTTTTFTTTTFTT').slice(0, 16) },
      { name: 'Protein target hit',weeks: h('TFTTTFTTTTTFTTFTT').slice(0, 16) },
      { name: 'Steps > 8,000',     weeks: h('TTFTTTTFTTTTTTFTT').slice(0, 16) },
      { name: 'Sleep 7+ hrs',      weeks: h('FTTTFTTTTFTTTFFTT').slice(0, 16) },
    ],
    sessionsPerWeek: { trainer: 1, independent: 2 },
  },

  // ── Alex Turner ─────────────────────────────────────────────────────────────
  'client-2': {
    exercises: [
      { name: 'Bench Press', unit: 'kg',  color: '#FF6B5B', lowerIsBetter: false,
        data: ex([80, 82.5, 85, 85, 87.5, 87.5, 90, 90, 92.5, 95, 95, 97.5, 97.5, 100, 100, 100]) },
      { name: 'Deadlift',    unit: 'kg',  color: '#FFA733', lowerIsBetter: false,
        data: ex([100, 100, 105, 107.5, 107.5, 110, 110, 112.5, 115, 115, 117.5, 120, 120, 122.5, 125, 125]) },
      { name: '5km Run',     unit: 'min', color: '#2EC4A0', lowerIsBetter: true,
        data: ex([30, 29.5, 29, 28.5, 28, 28, 27.5, 27, 26.5, 26.5, 26, 25.75, 25.75, 25.75, 25.75, 25.75]) },
    ],
    weeklyCompletion: wc([88, 90, 85, 92, 88, 90, 85, 88, 90, 92, 88, 85, 90, 88, 92, 90]),
    habits: [
      { name: 'Run logged',          weeks: h('TTFTTTTTTFTTTFTFF') .slice(0, 16) },
      { name: 'Protein target hit',  weeks: h('TTTTTTTTTTTTTTTTF').slice(0, 16) },
      { name: 'Ice bath / recovery', weeks: h('FTFTTTFTTTFTFTFTT').slice(0, 16) },
    ],
    sessionsPerWeek: { trainer: 1, independent: 2 },
  },

  // ── Keiko Tanaka ─────────────────────────────────────────────────────────────
  'client-3': {
    exercises: [
      { name: 'Box Jump',     unit: 'cm', color: '#FF6B5B', lowerIsBetter: false,
        data: ex([40, 42, 42, 44, 44, 46, 46, 48, 50, 50, 52, 52, 54, 56, 56, 58]) },
      { name: 'Goblet Squat', unit: 'kg', color: '#FFA733', lowerIsBetter: false,
        data: ex([16, 16, 18, 18, 20, 20, 22, 22, 24, 24, 24, 26, 26, 28, 28, 28]) },
      { name: 'KB Swing',     unit: 'kg', color: '#2EC4A0', lowerIsBetter: false,
        data: ex([12, 12, 14, 14, 16, 16, 16, 18, 18, 20, 20, 20, 22, 22, 24, 24]) },
    ],
    weeklyCompletion: wc([88, 90, 85, 92, 90, 88, 92, 95, 90, 88, 85, 90, 92, 88, 90, 88]),
    habits: [
      { name: 'Calorie target',         weeks: h('TTTTTTTTTTTTTTTT') },
      { name: 'Morning cardio',          weeks: h('TTTTFTTTTTFTTTTTF').slice(0, 16) },
      { name: 'Steps > 10,000',          weeks: h('TTTTTTTTTFTTTTTTT').slice(0, 16) },
      { name: 'No late-night snacking',  weeks: h('TTFTTTTFTTTTTFTTT').slice(0, 16) },
    ],
    sessionsPerWeek: { trainer: 1, independent: 2 },
  },

  // ── Marcus Lee ───────────────────────────────────────────────────────────────
  'client-5': {
    exercises: [
      { name: 'Bench Press', unit: 'kg', color: '#FF6B5B', lowerIsBetter: false,
        data: ex([70, 72.5, 72.5, 75, 75, 75, 72.5, 75, 77.5, 77.5, 75, 72.5, 75, 75, 77.5, 77.5]) },
      { name: 'Squat',       unit: 'kg', color: '#FFA733', lowerIsBetter: false,
        data: ex([80, 82.5, 82.5, 85, 85, 80, 82.5, 85, 87.5, 85, 82.5, 80, 82.5, 85, 82.5, 82.5]) },
      { name: 'Barbell Row', unit: 'kg', color: '#2EC4A0', lowerIsBetter: false,
        data: ex([55, 57.5, 57.5, 60, 60, 57.5, 60, 62.5, 62.5, 60, 57.5, 60, 62.5, 62.5, 60, 60]) },
    ],
    weeklyCompletion: wc([80, 75, 82, 78, 70, 65, 72, 75, 70, 65, 60, 62, 65, 60, 58, 62]),
    habits: [
      { name: 'Workout logged',     weeks: h('TTTFTFTTTTFFFFFFT').slice(0, 16) },
      { name: 'Protein target hit', weeks: h('TTFTFTFTFFTFFFTFT').slice(0, 16) },
      { name: 'Steps > 7,000',      weeks: h('TTTTFTFTTFTFFFFTF').slice(0, 16) },
    ],
    sessionsPerWeek: { trainer: 1, independent: 1 },
  },

  // ── Tom Richter ──────────────────────────────────────────────────────────────
  'client-7': {
    exercises: [
      { name: 'Bench Press',    unit: 'kg', color: '#FF6B5B', lowerIsBetter: false,
        data: ex([75, 75, 77.5, 77.5, 80, 80, 80, 80, 77.5, 80, 80, 82.5, 80, 80, 75, 77.5]) },
      { name: 'Squat',          unit: 'kg', color: '#FFA733', lowerIsBetter: false,
        data: ex([90, 92.5, 95, 95, 97.5, 95, 95, 97.5, 100, 97.5, 95, 95, 97.5, 92.5, 90, 92.5]) },
      { name: 'Overhead Press', unit: 'kg', color: '#2EC4A0', lowerIsBetter: false,
        data: ex([50, 50, 52.5, 52.5, 52.5, 55, 55, 55, 52.5, 55, 55, 57.5, 55, 52.5, 50, 52.5]) },
    ],
    weeklyCompletion: wc([75, 72, 68, 80, 70, 65, 72, 68, 65, 60, 55, 58, 60, 50, 42, 40]),
    habits: [
      { name: 'Workout logged',     weeks: h('TTFTTTFTTTFTFTTFF').slice(0, 16) },
      { name: 'Protein target hit', weeks: h('TTTTFTFTTTFTFTFFT').slice(0, 16) },
    ],
    sessionsPerWeek: { trainer: 1, independent: 1 },
  },

  // ── Elena Vasquez ────────────────────────────────────────────────────────────
  'client-8': {
    exercises: [
      { name: 'Deadlift',        unit: 'kg', color: '#FF6B5B', lowerIsBetter: false,
        data: ex([50, 52.5, 55, 55, 57.5, 57.5, 60, 60, 62.5, 62.5, 62.5, 65, 65, 65, 67.5, 67.5]) },
      { name: 'Romanian DL',     unit: 'kg', color: '#FFA733', lowerIsBetter: false,
        data: ex([40, 42.5, 42.5, 45, 45, 47.5, 47.5, 50, 50, 52.5, 52.5, 55, 55, 57.5, 57.5, 60]) },
      { name: 'Lat Pulldown',    unit: 'kg', color: '#2EC4A0', lowerIsBetter: false,
        data: ex([35, 35, 37.5, 37.5, 40, 40, 42.5, 42.5, 45, 45, 47.5, 47.5, 50, 50, 52.5, 52.5]) },
    ],
    weeklyCompletion: wc([85, 88, 90, 88, 92, 90, 88, 92, 95, 92, 90, 95, 100, 95, 100, 100]),
    habits: [
      { name: 'Morning mobility',  weeks: h('TTTTTTTTTTTTTTTT') },
      { name: 'Protein target hit',weeks: h('TTTTTTTTTTTTTTTT') },
      { name: 'Steps > 8,000',     weeks: h('TTTTTTTTTTTTTTTT') },
      { name: 'Sleep 7+ hrs',      weeks: h('TTTTTFTTTTTTFTTTF').slice(0, 16) },
    ],
    sessionsPerWeek: { trainer: 2, independent: 2 },
  },

  // ── Damien Cross (physio) ─────────────────────────────────────────────────────
  'client-4': {
    exercises: [
      { name: 'Shoulder ROM',   unit: '°',    color: '#FF6B5B', lowerIsBetter: false,
        data: ex([95, 100, 105, 110, 110, 115, 120, 120, 125, 130, 130, 135, 140, 145, 150, 155]) },
      { name: 'Overhead Reach', unit: 'cm',   color: '#FFA733', lowerIsBetter: false,
        data: ex([40, 42, 44, 46, 46, 48, 50, 52, 54, 56, 56, 58, 60, 62, 64, 65]) },
      { name: 'Band Pull-Apart',unit: 'reps', color: '#2EC4A0', lowerIsBetter: false,
        data: ex([10, 10, 12, 12, 12, 14, 14, 15, 15, 15, 16, 16, 18, 18, 20, 20]) },
    ],
    weeklyCompletion: wc([90, 88, 92, 90, 88, 90, 92, 88, 85, 90, 88, 92, 95, 90, 88, 92]),
    habits: [
      { name: 'Home exercise program', weeks: h('TTTTTTTTTTTTTTTT') },
      { name: 'Ice/heat routine',      weeks: h('TTFTTTTFTTTTTFTTT').slice(0, 16) },
      { name: 'Posture checks',        weeks: h('TTTTTFTTTFTTTTFTTT').slice(0, 16) },
    ],
    sessionsPerWeek: { trainer: 1, independent: 2 },
  },

  // ── Jordan Lee (physio) ──────────────────────────────────────────────────────
  'client-9': {
    exercises: [
      { name: 'Back Extension',   unit: 'reps', color: '#FF6B5B', lowerIsBetter: false,
        data: ex([5, 8, 8, 10, 10, 12, 12, 15, 15, 15, 18, 18, 20, 20, 22, 25]) },
      { name: 'Bird-Dog',         unit: 'reps', color: '#FFA733', lowerIsBetter: false,
        data: ex([6, 8, 8, 10, 10, 12, 12, 15, 15, 18, 18, 20, 20, 22, 24, 25]) },
      { name: 'Walking Distance', unit: 'km',   color: '#2EC4A0', lowerIsBetter: false,
        data: ex([1, 1.5, 1.5, 2, 2, 2.5, 2.5, 3, 3, 3.5, 3.5, 4, 4, 4.5, 5, 5]) },
    ],
    weeklyCompletion: wc([88, 90, 92, 88, 85, 90, 92, 95, 92, 90, 88, 95, 98, 95, 90, 92]),
    habits: [
      { name: 'HEP exercises',       weeks: h('TTTTTTTTTTTTTTTT') },
      { name: 'Walking 20+ min',     weeks: h('TTTTTTTTTTTTTTTT') },
      { name: 'Avoid sitting >1 hr', weeks: h('TFTTFTTTTTFTTTFTT').slice(0, 16) },
    ],
    sessionsPerWeek: { trainer: 1, independent: 3 },
  },

  // ── Emma Rodriguez (physio) ──────────────────────────────────────────────────
  'client-10': {
    exercises: [
      { name: 'Leg Press',   unit: 'kg',   color: '#FF6B5B', lowerIsBetter: false,
        data: ex([20, 25, 30, 35, 35, 40, 45, 50, 55, 60, 65, 70, 70, 75, 80, 85]) },
      { name: 'Quad Index',  unit: '%',    color: '#FFA733', lowerIsBetter: false,
        data: ex([30, 35, 40, 44, 48, 52, 55, 58, 62, 65, 68, 72, 75, 78, 80, 80]) },
      { name: 'Step-Ups',    unit: 'reps', color: '#2EC4A0', lowerIsBetter: false,
        data: ex([5, 8, 10, 10, 12, 15, 15, 18, 18, 20, 20, 22, 25, 25, 28, 30]) },
    ],
    weeklyCompletion: wc([85, 88, 90, 88, 92, 90, 88, 90, 92, 88, 90, 92, 95, 92, 90, 88]),
    habits: [
      { name: 'HEP completed',        weeks: h('TTTTTTTTTTTTTTTT') },
      { name: 'Pool walking',         weeks: h('TFTFTTTFTTFTTTFTT').slice(0, 16) },
      { name: 'Quad sets (3× daily)', weeks: h('TTTTTTTTTTTTTTTTF').slice(0, 16) },
    ],
    sessionsPerWeek: { trainer: 1, independent: 3 },
  },

  // ── Priya Nair (massage) ─────────────────────────────────────────────────────
  'client-6': {
    exercises: [
      { name: 'Recovery Time',   unit: 'hrs', color: '#FF6B5B', lowerIsBetter: true,
        data: ex([72, 70, 68, 65, 65, 62, 60, 58, 58, 55, 52, 50, 48, 48, 48, 48]) },
      { name: 'Flexibility',     unit: 'pts', color: '#FFA733', lowerIsBetter: false,
        data: ex([45, 48, 50, 52, 52, 55, 58, 60, 60, 62, 65, 65, 68, 68, 68, 70]) },
      { name: 'Post-Run HRV',    unit: 'ms',  color: '#2EC4A0', lowerIsBetter: false,
        data: ex([35, 36, 38, 38, 40, 40, 42, 44, 44, 46, 48, 48, 50, 52, 52, 54]) },
    ],
    weeklyCompletion: wc([78, 75, 80, 75, 72, 78, 80, 75, 72, 70, 75, 78, 72, 70, 68, 72]),
    habits: [
      { name: 'Foam rolling',  weeks: h('TTTTTTTTTTTTTTTT') },
      { name: 'Run logged',    weeks: h('TTFTTFTTTTFTTFTTT').slice(0, 16) },
      { name: 'Ice after runs',weeks: h('TTFTFTTTTFTTTTFFT').slice(0, 16) },
    ],
    sessionsPerWeek: { trainer: 1, independent: 1 },
  },
}

const FALLBACK = {
  exercises: [],
  weeklyCompletion: WEEK_LABELS.map(week => ({ week, rate: 0 })),
  habits: [],
  sessionsPerWeek: { trainer: 0, independent: 0 },
}

export function getProgressData(clientId) {
  return progressData[clientId] ?? FALLBACK
}
