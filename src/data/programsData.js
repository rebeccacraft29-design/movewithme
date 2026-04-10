// ─── Exercise library ─────────────────────────────────────────────────────────

export const exerciseLibrary = [
  // Compound strength
  { id: 'ex-1',  name: 'Barbell Back Squat',      category: 'strength',   muscle: 'Legs' },
  { id: 'ex-2',  name: 'Romanian Deadlift',        category: 'strength',   muscle: 'Posterior Chain' },
  { id: 'ex-3',  name: 'Conventional Deadlift',    category: 'strength',   muscle: 'Full Body' },
  { id: 'ex-4',  name: 'Bench Press',              category: 'strength',   muscle: 'Chest' },
  { id: 'ex-5',  name: 'Barbell Row',              category: 'strength',   muscle: 'Back' },
  { id: 'ex-6',  name: 'Overhead Press',           category: 'strength',   muscle: 'Shoulders' },
  { id: 'ex-7',  name: 'Pull-Up',                  category: 'strength',   muscle: 'Back' },
  { id: 'ex-8',  name: 'Dip',                      category: 'strength',   muscle: 'Chest / Triceps' },
  // Isolation
  { id: 'ex-9',  name: 'Dumbbell Curl',            category: 'strength',   muscle: 'Biceps' },
  { id: 'ex-10', name: 'Tricep Pushdown',          category: 'strength',   muscle: 'Triceps' },
  { id: 'ex-11', name: 'Lateral Raise',            category: 'strength',   muscle: 'Shoulders' },
  { id: 'ex-12', name: 'Leg Press',                category: 'strength',   muscle: 'Legs' },
  { id: 'ex-13', name: 'Leg Curl',                 category: 'strength',   muscle: 'Hamstrings' },
  { id: 'ex-14', name: 'Leg Extension',            category: 'strength',   muscle: 'Quads' },
  { id: 'ex-15', name: 'Calf Raise',               category: 'strength',   muscle: 'Calves' },
  { id: 'ex-16', name: 'Face Pull',                category: 'strength',   muscle: 'Rear Delts' },
  { id: 'ex-47', name: 'Incline Dumbbell Press',   category: 'strength',   muscle: 'Chest' },
  { id: 'ex-48', name: 'Cable Fly',                category: 'strength',   muscle: 'Chest' },
  { id: 'ex-49', name: 'Seated Cable Row',         category: 'strength',   muscle: 'Back' },
  { id: 'ex-50', name: 'Lat Pulldown',             category: 'strength',   muscle: 'Back' },
  { id: 'ex-45', name: 'Lunge',                    category: 'strength',   muscle: 'Legs' },
  { id: 'ex-46', name: 'Bulgarian Split Squat',    category: 'strength',   muscle: 'Legs' },
  // Core
  { id: 'ex-17', name: 'Plank',                    category: 'core',       muscle: 'Core' },
  { id: 'ex-18', name: 'Dead Bug',                 category: 'core',       muscle: 'Core' },
  { id: 'ex-19', name: 'Bird Dog',                 category: 'core',       muscle: 'Core' },
  { id: 'ex-20', name: 'Russian Twist',            category: 'core',       muscle: 'Obliques' },
  { id: 'ex-21', name: 'Ab Rollout',               category: 'core',       muscle: 'Core' },
  // Cardio / HIIT
  { id: 'ex-22', name: 'Treadmill Run',            category: 'cardio',     muscle: 'Full Body' },
  { id: 'ex-23', name: 'Rowing Machine',           category: 'cardio',     muscle: 'Full Body' },
  { id: 'ex-24', name: 'Assault Bike',             category: 'cardio',     muscle: 'Full Body' },
  { id: 'ex-25', name: 'Box Jump',                 category: 'plyometric', muscle: 'Legs' },
  { id: 'ex-26', name: 'Burpee',                   category: 'cardio',     muscle: 'Full Body' },
  { id: 'ex-27', name: 'Jump Rope',                category: 'cardio',     muscle: 'Full Body' },
  // Mobility
  { id: 'ex-28', name: 'Hip Flexor Stretch',       category: 'mobility',   muscle: 'Hip Flexors' },
  { id: 'ex-29', name: 'Cat-Cow',                  category: 'mobility',   muscle: 'Spine' },
  { id: 'ex-30', name: 'Thoracic Rotation',        category: 'mobility',   muscle: 'Thoracic Spine' },
  // Rehab
  { id: 'ex-31', name: 'Shoulder Pendulum',        category: 'rehab',      muscle: 'Shoulder' },
  { id: 'ex-32', name: 'Clamshell',               category: 'rehab',      muscle: 'Glutes / Hip' },
  { id: 'ex-33', name: 'Terminal Knee Extension',  category: 'rehab',      muscle: 'Knee' },
  { id: 'ex-34', name: 'Quad Set',                 category: 'rehab',      muscle: 'Quads' },
  { id: 'ex-35', name: 'Straight Leg Raise',       category: 'rehab',      muscle: 'Hip / Quads' },
  { id: 'ex-36', name: 'Wall Slides',              category: 'rehab',      muscle: 'Shoulder' },
  { id: 'ex-37', name: 'Band Pull Apart',          category: 'rehab',      muscle: 'Upper Back' },
  { id: 'ex-38', name: 'Mini Band Walk',           category: 'rehab',      muscle: 'Glutes / Hip' },
  // Functional
  { id: 'ex-39', name: 'Kettlebell Swing',         category: 'functional', muscle: 'Full Body' },
  { id: 'ex-40', name: 'Turkish Get-Up',           category: 'functional', muscle: 'Full Body' },
  { id: 'ex-41', name: 'Farmer Carry',             category: 'functional', muscle: 'Full Body' },
  { id: 'ex-42', name: 'Goblet Squat',             category: 'functional', muscle: 'Legs' },
  { id: 'ex-43', name: 'Single Leg Deadlift',      category: 'functional', muscle: 'Posterior Chain' },
  { id: 'ex-44', name: 'Step-Up',                  category: 'functional', muscle: 'Legs' },
  // Rehab / mobility extras
  { id: 'ex-51', name: 'Glute Bridge',             category: 'rehab',      muscle: 'Glutes' },
]

export function getExerciseName(exerciseId) {
  return exerciseLibrary.find(e => e.id === exerciseId)?.name ?? 'Unknown exercise'
}

// ─── ID generator ─────────────────────────────────────────────────────────────

export function uid() {
  return Math.random().toString(36).slice(2, 9)
}

// ─── Data builders (for mock data only) ──────────────────────────────────────

function blk(id, exerciseId, sets, reps, weight = '', notes = '') {
  return { id, exerciseId, sets, reps, weight, notes }
}

function day(id, label, exercises, sessionNotes = '') {
  return { id, label, exercises, sessionNotes }
}

function wk(id, weekNumber, days) {
  return { id, weekNumber, days }
}

// ─── Initial programs ─────────────────────────────────────────────────────────

export const initialPrograms = [

  // ── Active: Sarah Mitchell — 12-Week Strength Build ────────────────────────
  {
    id: 'prog-1',
    name: '12-Week Strength Build',
    clientId: 'client-1',
    serviceType: 'personal_trainer',
    status: 'active',
    startDate: '2026-01-05',
    sessionsPerWeek: 3,
    visibility: 'shared',
    isTemplate: false,
    templateName: null,
    templateDescription: null,
    weeks: [
      wk('p1w1', 1, [
        day('p1w1d1', 'Monday', [
          blk('p1w1d1b1', 'ex-1',  4, '6',  '60kg', 'Focus on depth'),
          blk('p1w1d1b2', 'ex-4',  4, '8',  '50kg', ''),
          blk('p1w1d1b3', 'ex-5',  3, '10', '40kg', ''),
          blk('p1w1d1b4', 'ex-17', 3, '45s', '', ''),
        ], 'Push / Pull focus — keep tempo controlled'),
        day('p1w1d2', 'Wednesday', [
          blk('p1w1d2b1', 'ex-3',  4, '5',  '80kg', 'Set up carefully'),
          blk('p1w1d2b2', 'ex-6',  3, '8',  '35kg', ''),
          blk('p1w1d2b3', 'ex-7',  3, '6',  'BW',   'Assisted if needed'),
          blk('p1w1d2b4', 'ex-18', 3, '10', '', ''),
        ], ''),
        day('p1w1d3', 'Friday', [
          blk('p1w1d3b1', 'ex-2',  4, '8',  '55kg', ''),
          blk('p1w1d3b2', 'ex-45', 3, '12', '20kg', 'Each leg'),
          blk('p1w1d3b3', 'ex-9',  3, '12', '12kg', ''),
          blk('p1w1d3b4', 'ex-10', 3, '12', '', ''),
        ], 'Note any hip tightness'),
      ]),
      wk('p1w2', 2, [
        day('p1w2d1', 'Monday', [
          blk('p1w2d1b1', 'ex-1',  4, '6',  '65kg', ''),
          blk('p1w2d1b2', 'ex-4',  4, '8',  '52.5kg', ''),
          blk('p1w2d1b3', 'ex-5',  3, '10', '42.5kg', ''),
          blk('p1w2d1b4', 'ex-17', 3, '50s', '', ''),
        ], ''),
        day('p1w2d2', 'Wednesday', [
          blk('p1w2d2b1', 'ex-3',  4, '5',  '82.5kg', ''),
          blk('p1w2d2b2', 'ex-6',  3, '8',  '37.5kg', ''),
          blk('p1w2d2b3', 'ex-7',  3, '7',  'BW', ''),
          blk('p1w2d2b4', 'ex-19', 3, '10', '', ''),
        ], ''),
        day('p1w2d3', 'Friday', [
          blk('p1w2d3b1', 'ex-2',  4, '8',  '57.5kg', ''),
          blk('p1w2d3b2', 'ex-45', 3, '12', '22.5kg', ''),
          blk('p1w2d3b3', 'ex-9',  3, '12', '13kg', ''),
          blk('p1w2d3b4', 'ex-10', 3, '12', '', ''),
        ], ''),
      ]),
      wk('p1w3', 3, [
        day('p1w3d1', 'Monday', [
          blk('p1w3d1b1', 'ex-1',  4, '6',  '70kg', ''),
          blk('p1w3d1b2', 'ex-4',  4, '8',  '55kg', ''),
          blk('p1w3d1b3', 'ex-5',  3, '10', '45kg', ''),
          blk('p1w3d1b4', 'ex-21', 3, '8',  '', ''),
        ], ''),
        day('p1w3d2', 'Wednesday', [
          blk('p1w3d2b1', 'ex-3',  4, '5',  '85kg', ''),
          blk('p1w3d2b2', 'ex-6',  3, '8',  '40kg', ''),
          blk('p1w3d2b3', 'ex-7',  3, '8',  'BW', ''),
          blk('p1w3d2b4', 'ex-19', 3, '12', '', ''),
        ], ''),
        day('p1w3d3', 'Friday', [
          blk('p1w3d3b1', 'ex-2',  4, '8',  '60kg', ''),
          blk('p1w3d3b2', 'ex-46', 3, '10', '25kg', ''),
          blk('p1w3d3b3', 'ex-9',  3, '12', '14kg', ''),
          blk('p1w3d3b4', 'ex-16', 3, '15', '', ''),
        ], ''),
      ]),
      wk('p1w4', 4, [
        day('p1w4d1', 'Monday', [
          blk('p1w4d1b1', 'ex-1',  4, '6',  '72.5kg', ''),
          blk('p1w4d1b2', 'ex-4',  4, '8',  '57.5kg', ''),
          blk('p1w4d1b3', 'ex-5',  3, '10', '47.5kg', ''),
          blk('p1w4d1b4', 'ex-21', 3, '10', '', ''),
        ], ''),
        day('p1w4d2', 'Wednesday', [
          blk('p1w4d2b1', 'ex-3',  4, '5',  '87.5kg', ''),
          blk('p1w4d2b2', 'ex-6',  3, '8',  '42.5kg', ''),
          blk('p1w4d2b3', 'ex-7',  3, '8',  'BW+5kg', ''),
          blk('p1w4d2b4', 'ex-20', 3, '15', '', ''),
        ], ''),
        day('p1w4d3', 'Friday', [
          blk('p1w4d3b1', 'ex-2',  4, '8',  '62.5kg', ''),
          blk('p1w4d3b2', 'ex-46', 3, '10', '27.5kg', ''),
          blk('p1w4d3b3', 'ex-9',  3, '12', '15kg', ''),
          blk('p1w4d3b4', 'ex-16', 3, '15', '', ''),
        ], ''),
      ]),
    ],
  },

  // ── Active: Alex Turner — Strength & Conditioning ──────────────────────────
  {
    id: 'prog-2',
    name: 'Strength & Conditioning',
    clientId: 'client-2',
    serviceType: 'personal_trainer',
    status: 'active',
    startDate: '2026-02-01',
    sessionsPerWeek: 3,
    visibility: 'shared',
    isTemplate: false,
    templateName: null,
    templateDescription: null,
    weeks: [
      wk('p2w1', 1, [
        day('p2w1d1', 'Tuesday', [
          blk('p2w1d1b1', 'ex-4',  4, '8',  '80kg', 'Working sets'),
          blk('p2w1d1b2', 'ex-47', 3, '10', '30kg', ''),
          blk('p2w1d1b3', 'ex-50', 3, '12', '50kg', ''),
          blk('p2w1d1b4', 'ex-11', 3, '15', '8kg',  ''),
        ], 'Upper hypertrophy'),
        day('p2w1d2', 'Thursday', [
          blk('p2w1d2b1', 'ex-1',  4, '8',  '80kg', ''),
          blk('p2w1d2b2', 'ex-2',  3, '10', '60kg', ''),
          blk('p2w1d2b3', 'ex-44', 3, '12', '20kg', 'Each leg'),
          blk('p2w1d2b4', 'ex-17', 3, '60s', '', ''),
        ], 'Lower hypertrophy'),
        day('p2w1d3', 'Saturday', [
          blk('p2w1d3b1', 'ex-22', 1, '30min', '', 'Z2 pace'),
          blk('p2w1d3b2', 'ex-39', 4, '15', '24kg', ''),
          blk('p2w1d3b3', 'ex-27', 3, '90s', '', ''),
        ], 'Conditioning'),
      ]),
      wk('p2w2', 2, [
        day('p2w2d1', 'Tuesday', [
          blk('p2w2d1b1', 'ex-4',  4, '8',  '82.5kg', ''),
          blk('p2w2d1b2', 'ex-47', 3, '10', '32.5kg', ''),
          blk('p2w2d1b3', 'ex-50', 3, '12', '52.5kg', ''),
          blk('p2w2d1b4', 'ex-11', 3, '15', '9kg', ''),
        ], ''),
        day('p2w2d2', 'Thursday', [
          blk('p2w2d2b1', 'ex-1',  4, '8',  '82.5kg', ''),
          blk('p2w2d2b2', 'ex-2',  3, '10', '62.5kg', ''),
          blk('p2w2d2b3', 'ex-44', 3, '12', '22.5kg', ''),
          blk('p2w2d2b4', 'ex-18', 3, '10', '', ''),
        ], ''),
        day('p2w2d3', 'Saturday', [
          blk('p2w2d3b1', 'ex-22', 1, '35min', '', 'Z2 pace'),
          blk('p2w2d3b2', 'ex-39', 4, '15', '24kg', ''),
          blk('p2w2d3b3', 'ex-26', 3, '10', '', ''),
        ], ''),
      ]),
    ],
  },

  // ── Active: Damien Cross — Shoulder Rehab ──────────────────────────────────
  {
    id: 'prog-5',
    name: 'Shoulder Rehab — Phase 3',
    clientId: 'client-4',
    serviceType: 'physiotherapist',
    status: 'active',
    startDate: '2026-03-01',
    sessionsPerWeek: 3,
    visibility: 'shared',
    isTemplate: false,
    templateName: null,
    templateDescription: null,
    weeks: [
      wk('p5w1', 1, [
        day('p5w1d1', 'Monday', [
          blk('p5w1d1b1', 'ex-31', 3, '2min', '',            'Pain-free ROM only'),
          blk('p5w1d1b2', 'ex-36', 3, '10',   '',            'Elbows below shoulder height'),
          blk('p5w1d1b3', 'ex-37', 3, '15',   'Light band',  ''),
          blk('p5w1d1b4', 'ex-16', 2, '15',   '5kg',         'Stop if impingement'),
        ], 'Shoulder stabilisation — report pain above 3/10'),
        day('p5w1d2', 'Wednesday', [
          blk('p5w1d2b1', 'ex-31', 3, '2min', '',  ''),
          blk('p5w1d2b2', 'ex-29', 2, '10',   '',  'Cervical mobility'),
          blk('p5w1d2b3', 'ex-30', 2, '10',   '',  'Each side'),
          blk('p5w1d2b4', 'ex-37', 3, '20',   'Medium band', ''),
        ], ''),
        day('p5w1d3', 'Friday', [
          blk('p5w1d3b1', 'ex-36', 3, '12',   '',            ''),
          blk('p5w1d3b2', 'ex-37', 3, '20',   'Medium band', ''),
          blk('p5w1d3b3', 'ex-16', 3, '15',   '5kg',         ''),
          blk('p5w1d3b4', 'ex-31', 2, '2min', '',            'Cool-down pendulums'),
        ], ''),
      ]),
      wk('p5w2', 2, [
        day('p5w2d1', 'Monday', [
          blk('p5w2d1b1', 'ex-31', 3, '2min', '',            ''),
          blk('p5w2d1b2', 'ex-36', 3, '12',   '',            ''),
          blk('p5w2d1b3', 'ex-37', 3, '20',   'Medium band', ''),
          blk('p5w2d1b4', 'ex-16', 3, '15',   '6kg',         ''),
        ], ''),
        day('p5w2d2', 'Wednesday', [
          blk('p5w2d2b1', 'ex-31', 2, '2min', '',            ''),
          blk('p5w2d2b2', 'ex-29', 2, '10',   '',            ''),
          blk('p5w2d2b3', 'ex-30', 3, '12',   '',            ''),
          blk('p5w2d2b4', 'ex-37', 3, '20',   'Medium band', ''),
        ], ''),
        day('p5w2d3', 'Friday', [
          blk('p5w2d3b1', 'ex-36', 3, '15',   '',            ''),
          blk('p5w2d3b2', 'ex-37', 3, '20',   'Heavy band',  ''),
          blk('p5w2d3b3', 'ex-16', 3, '15',   '6kg',         ''),
          blk('p5w2d3b4', 'ex-31', 2, '2min', '',            ''),
        ], ''),
      ]),
    ],
  },

  // ── Draft: Keiko Tanaka — Summer Shred Phase 2 ────────────────────────────
  {
    id: 'prog-3',
    name: 'Summer Shred — Phase 2',
    clientId: 'client-3',
    serviceType: 'personal_trainer',
    status: 'draft',
    startDate: '2026-04-07',
    sessionsPerWeek: 4,
    visibility: 'trainer_only',
    isTemplate: false,
    templateName: null,
    templateDescription: null,
    weeks: [
      wk('p3w1', 1, [
        day('p3w1d1', 'Monday', [
          blk('p3w1d1b1', 'ex-1',  4, '10', '45kg', ''),
          blk('p3w1d1b2', 'ex-45', 3, '12', '15kg', ''),
          blk('p3w1d1b3', 'ex-17', 4, '45s', '', ''),
        ], 'Lower A'),
        day('p3w1d2', 'Tuesday', [
          blk('p3w1d2b1', 'ex-4',  4, '10', '40kg', ''),
          blk('p3w1d2b2', 'ex-49', 3, '12', '35kg', ''),
          blk('p3w1d2b3', 'ex-11', 3, '15', '7kg',  ''),
        ], 'Upper A'),
        day('p3w1d3', 'Thursday', [
          blk('p3w1d3b1', 'ex-26', 4, '10', '', ''),
          blk('p3w1d3b2', 'ex-24', 3, '20min', '', 'Assault bike intervals'),
          blk('p3w1d3b3', 'ex-20', 3, '20', '', ''),
        ], 'HIIT + Cardio'),
        day('p3w1d4', 'Saturday', [
          blk('p3w1d4b1', 'ex-2',  4, '10', '50kg', ''),
          blk('p3w1d4b2', 'ex-42', 3, '12', '20kg', ''),
          blk('p3w1d4b3', 'ex-19', 3, '10', '', ''),
        ], 'Lower B'),
      ]),
    ],
  },

  // ── Draft: Marcus Lee — Fat Loss Phase 2 ─────────────────────────────────
  {
    id: 'prog-4',
    name: 'Fat Loss Phase 2',
    clientId: 'client-5',
    serviceType: 'personal_trainer',
    status: 'draft',
    startDate: '2026-04-28',
    sessionsPerWeek: 3,
    visibility: 'trainer_only',
    isTemplate: false,
    templateName: null,
    templateDescription: null,
    weeks: [
      wk('p4w1', 1, [
        day('p4w1d1', 'Monday', [
          blk('p4w1d1b1', 'ex-39', 4, '15',   '16kg', ''),
          blk('p4w1d1b2', 'ex-26', 3, '8',    '',     ''),
          blk('p4w1d1b3', 'ex-22', 1, '20min','',     'HIIT intervals'),
        ], ''),
        day('p4w1d2', 'Wednesday', [
          blk('p4w1d2b1', 'ex-1',  3, '12', '40kg', ''),
          blk('p4w1d2b2', 'ex-4',  3, '12', '40kg', ''),
          blk('p4w1d2b3', 'ex-17', 3, '30s', '', ''),
        ], ''),
        day('p4w1d3', 'Friday', [
          blk('p4w1d3b1', 'ex-42', 3, '12',   '16kg', ''),
          blk('p4w1d3b2', 'ex-49', 3, '12',   '30kg', ''),
          blk('p4w1d3b3', 'ex-23', 1, '15min','',     ''),
        ], ''),
      ]),
    ],
  },

  // ── Completed: Sarah Mitchell ─────────────────────────────────────────────
  {
    id: 'prog-6',
    name: '12-Week Strength Foundation',
    clientId: 'client-1',
    serviceType: 'personal_trainer',
    status: 'completed',
    startDate: '2025-09-15',
    sessionsPerWeek: 3,
    visibility: 'shared',
    isTemplate: false,
    templateName: null,
    templateDescription: null,
    weeks: [
      wk('p6w1', 1, [
        day('p6w1d1', 'Monday', [
          blk('p6w1d1b1', 'ex-1',  3, '8',  '40kg', ''),
          blk('p6w1d1b2', 'ex-4',  3, '8',  '30kg', ''),
          blk('p6w1d1b3', 'ex-17', 3, '30s', '', ''),
        ], ''),
        day('p6w1d2', 'Wednesday', [
          blk('p6w1d2b1', 'ex-3', 3, '5', '60kg', ''),
          blk('p6w1d2b2', 'ex-5', 3, '8', '30kg', ''),
        ], ''),
        day('p6w1d3', 'Friday', [
          blk('p6w1d3b1', 'ex-2',  3, '8',  '40kg', ''),
          blk('p6w1d3b2', 'ex-45', 3, '10', '10kg', ''),
        ], ''),
      ]),
    ],
  },

  // ── Template: 12-Week Strength Foundation ────────────────────────────────
  {
    id: 'tmpl-1',
    name: '12-Week Strength Foundation',
    clientId: null,
    serviceType: 'personal_trainer',
    status: 'template',
    startDate: null,
    sessionsPerWeek: 3,
    visibility: 'trainer_only',
    isTemplate: true,
    templateName: '12-Week Strength Foundation',
    templateDescription: 'Progressive 12-week compound strength program. Push/Pull/Legs split with linear progression from beginner to intermediate.',
    weeks: [
      wk('tm1w1', 1, [
        day('tm1w1d1', 'Day A — Push', [
          blk('tm1b1', 'ex-4',  4, '8',  '', 'Start at 70% 1RM'),
          blk('tm1b2', 'ex-47', 3, '10', '', ''),
          blk('tm1b3', 'ex-6',  3, '10', '', ''),
          blk('tm1b4', 'ex-11', 3, '15', '', ''),
          blk('tm1b5', 'ex-10', 3, '12', '', ''),
        ], 'Push — chest, shoulders, triceps'),
        day('tm1w1d2', 'Day B — Pull', [
          blk('tm1b6', 'ex-5',  4, '8', '', ''),
          blk('tm1b7', 'ex-50', 3, '10', '', ''),
          blk('tm1b8', 'ex-7',  3, '6',  'BW', ''),
          blk('tm1b9', 'ex-16', 3, '15', '', ''),
          blk('tm1b10','ex-9',  3, '12', '', ''),
        ], 'Pull — back, biceps, rear delts'),
        day('tm1w1d3', 'Day C — Legs', [
          blk('tm1b11', 'ex-1',  4, '8',  '', 'Start at 60% 1RM'),
          blk('tm1b12', 'ex-2',  3, '10', '', ''),
          blk('tm1b13', 'ex-45', 3, '12', '', 'Each leg'),
          blk('tm1b14', 'ex-15', 4, '15', '', ''),
          blk('tm1b15', 'ex-17', 3, '45s', '', ''),
        ], 'Legs and core'),
      ]),
    ],
  },

  // ── Template: Lower Back Rehab ───────────────────────────────────────────
  {
    id: 'tmpl-2',
    name: 'Lower Back Rehab Protocol',
    clientId: null,
    serviceType: 'physiotherapist',
    status: 'template',
    startDate: null,
    sessionsPerWeek: 3,
    visibility: 'trainer_only',
    isTemplate: true,
    templateName: 'Lower Back Rehab Protocol',
    templateDescription: '8-week evidence-based protocol for non-specific lower back pain. Core stability, hip mobility and graded loading for acute to sub-acute presentations.',
    weeks: [
      wk('tm2w1', 1, [
        day('tm2w1d1', 'Session A', [
          blk('tm2b1', 'ex-18', 3, '10',  '', 'Keep lower back neutral'),
          blk('tm2b2', 'ex-19', 3, '8',   '', 'Each side — 3s hold'),
          blk('tm2b3', 'ex-29', 2, '10',  '', ''),
          blk('tm2b4', 'ex-28', 2, '30s', '', 'Each side'),
        ], 'Core activation — stop if pain >3/10'),
        day('tm2w1d2', 'Session B', [
          blk('tm2b5', 'ex-32', 3, '15', 'Light band', 'Each side'),
          blk('tm2b6', 'ex-38', 3, '12', 'Light band', 'Each direction'),
          blk('tm2b7', 'ex-30', 2, '10', '',           'Pain-free ROM only'),
          blk('tm2b8', 'ex-17', 3, '20s', '',          'Modify to knees if needed'),
        ], 'Hip and glute activation'),
        day('tm2w1d3', 'Session C', [
          blk('tm2b9',  'ex-18', 3, '10', '', ''),
          blk('tm2b10', 'ex-19', 3, '10', '', ''),
          blk('tm2b11', 'ex-32', 3, '15', 'Light band', ''),
          blk('tm2b12', 'ex-29', 2, '10', '', ''),
        ], 'Walk 10 min post-session'),
      ]),
    ],
  },

  // ── Template: HIIT Fat Loss ───────────────────────────────────────────────
  {
    id: 'tmpl-3',
    name: 'HIIT Fat Loss 8-Week',
    clientId: null,
    serviceType: 'personal_trainer',
    status: 'template',
    startDate: null,
    sessionsPerWeek: 4,
    visibility: 'trainer_only',
    isTemplate: true,
    templateName: 'HIIT Fat Loss 8-Week',
    templateDescription: 'High-intensity interval training combined with resistance work for maximum caloric burn. 4 sessions/week alternating HIIT and strength.',
    weeks: [
      wk('tm3w1', 1, [
        day('tm3w1d1', 'Day 1 — HIIT A', [
          blk('tm3b1', 'ex-26', 4, '10', '',  '30s rest'),
          blk('tm3b2', 'ex-25', 3, '8',  '',  ''),
          blk('tm3b3', 'ex-27', 3, '60s','',  ''),
          blk('tm3b4', 'ex-17', 3, '30s','',  ''),
        ], ''),
        day('tm3w1d2', 'Day 2 — Strength A', [
          blk('tm3b5', 'ex-1',  4, '10', '', ''),
          blk('tm3b6', 'ex-4',  4, '10', '', ''),
          blk('tm3b7', 'ex-49', 3, '12', '', ''),
          blk('tm3b8', 'ex-18', 3, '10', '', ''),
        ], ''),
        day('tm3w1d3', 'Day 3 — HIIT B', [
          blk('tm3b9',  'ex-24', 1, '20min','', 'Tabata protocol'),
          blk('tm3b10', 'ex-39', 4, '15', '16kg', ''),
          blk('tm3b11', 'ex-20', 3, '20', '', ''),
        ], ''),
        day('tm3w1d4', 'Day 4 — Strength B', [
          blk('tm3b12', 'ex-3', 4, '6',  '', 'Work to RPE 8'),
          blk('tm3b13', 'ex-6', 3, '10', '', ''),
          blk('tm3b14', 'ex-7', 3, '8',  'BW', ''),
          blk('tm3b15', 'ex-15',4, '20', '', ''),
        ], ''),
      ]),
    ],
  },
]
