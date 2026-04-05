// ─── Overview-specific mock data ──────────────────────────────────────────────
// Supplements mockData.js and progressData.js for the Trainer Overview page.

// Maps client IDs to plan type categories (derived from plan names in mockData)
export const clientPlanTypeMap = {
  'client-1': 'Strength',        // 12-Week Strength Build
  'client-2': 'Strength',        // 12-Week Strength Build
  'client-3': 'Conditioning',    // Summer Shred Program
  'client-5': 'Conditioning',    // 8-Week Fat Loss
  'client-7': 'Conditioning',    // 10-Week Body Recomp
  'client-8': 'Strength',        // Lean & Strong — Phase 2
  'client-4': 'Rehabilitation',  // Mobility & Recovery
  'client-9': 'Rehabilitation',  // Lower Back Rehab Protocol
  'client-10': 'Rehabilitation', // Post-Surgical Knee Rehab
  'client-6': 'Mobility',        // Sports Recovery Program
}

// Plan type groupings (used for effectiveness bar chart)
export const planTypeGroups = [
  { label: 'Strength',       ids: ['client-1', 'client-2', 'client-8'] },
  { label: 'Conditioning',   ids: ['client-3', 'client-5', 'client-7'] },
  { label: 'Rehabilitation', ids: ['client-4', 'client-9', 'client-10'] },
  { label: 'Mobility',       ids: ['client-6'] },
]

// Most-skipped exercises aggregated across all clients (week of Mar 29–Apr 4)
export const mostSkippedExercises = [
  { name: 'HIIT Finisher',      skips: 8 },
  { name: 'Mobility Cool-down', skips: 6 },
  { name: 'Morning Cardio',     skips: 5 },
]

// Wins for the current week (week of Mar 29–Apr 4, 2026)
export const winsThisWeek = {
  personalBests: [
    { clientId: 'client-2',  clientName: 'Alex Turner',    exercise: 'Bench Press', value: '100 kg'   },
    { clientId: 'client-1',  clientName: 'Sarah Mitchell', exercise: 'Hip Thrust',  value: '112.5 kg' },
    { clientId: 'client-8',  clientName: 'Elena Vasquez',  exercise: 'Deadlift',    value: '67.5 kg'  },
    { clientId: 'client-3',  clientName: 'Keiko Tanaka',   exercise: 'Box Jump',    value: '58 cm'    },
  ],
  firstFullWeek: [
    { clientId: 'client-9',  clientName: 'Jordan Lee'      },
    { clientId: 'client-10', clientName: 'Emma Rodriguez'  },
  ],
  streaks: [
    { clientId: 'client-3', clientName: 'Keiko Tanaka',   days: 71 },
    { clientId: 'client-8', clientName: 'Elena Vasquez',  days: 45 },
    { clientId: 'client-9', clientName: 'Jordan Lee',     days: 38 },
  ],
}
