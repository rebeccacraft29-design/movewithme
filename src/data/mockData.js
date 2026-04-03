// ─── Service type configuration ───────────────────────────────────────────────
// Drives terminology throughout the app — program builder, session labels, etc.

export const SERVICE_CONFIG = {
  personal_trainer: {
    label: 'Personal Training',
    clientNoun: 'Client',
    sessionNoun: 'Session',
    programNoun: 'Program',
    independentSessionNoun: 'Home Workout',
  },
  physiotherapist: {
    label: 'Physiotherapy',
    clientNoun: 'Patient',
    sessionNoun: 'Appointment',
    programNoun: 'Treatment Plan',
    independentSessionNoun: 'Home Exercise',
  },
  chiropractor: {
    label: 'Chiropractic',
    clientNoun: 'Patient',
    sessionNoun: 'Appointment',
    programNoun: 'Care Plan',
    independentSessionNoun: 'Home Exercise',
  },
  massage_therapist: {
    label: 'Massage Therapy',
    clientNoun: 'Client',
    sessionNoun: 'Session',
    programNoun: 'Treatment Plan',
    independentSessionNoun: 'Home Routine',
  },
  other: {
    label: 'Wellness',
    clientNoun: 'Client',
    sessionNoun: 'Session',
    programNoun: 'Plan',
    independentSessionNoun: 'Independent Session',
  },
}

// ─── Trainer ──────────────────────────────────────────────────────────────────

export const trainer = {
  id: 'trainer-1',
  name: 'Rebecca Craft',
  initials: 'RC',
  // All professional roles this trainer holds
  roles: ['personal_trainer', 'physiotherapist', 'massage_therapist'],
}

// ─── Clients ──────────────────────────────────────────────────────────────────
// Each client relationship is scoped to ONE of the trainer's roles via serviceType.
// That determines all terminology: client vs. patient, session vs. appointment, etc.
//
// Session tracks:
//   trainerSessions  — sessions run by the trainer (in-person or supervised)
//   independentSessions — client-led sessions logged separately (home workouts, HEP, etc.)
//
// Goals:
//   Set by the trainer; each has a target value, current value, unit, and progress history.

export const clients = [
  // ── Personal Training clients ──────────────────────────────────────────────

  {
    id: 'client-1',
    name: 'Sarah Mitchell',
    initials: 'SM',
    avatarGrad: 'linear-gradient(135deg,#FF6B5B,#FFA733)',
    serviceType: 'personal_trainer',
    status: 'active',
    startDate: '2025-01-15',

    attentionFlag: {
      issue: 'Missed 3 workouts this week',
      tag: 'Overdue',
      tagType: 'overdue',
    },
    nextSession: '2026-04-02',
    lastSeen: '4 days ago',

    currentPlan: {
      id: 'plan-sm-1',
      name: '12-Week Strength Build',
      startDate: '2026-01-05',
      endDate: '2026-04-04',
      daysLeft: 3,
      progress: 92,
    },

    trainerSessions: [
      { id: 'ts-sm-1', date: '2026-03-25', type: 'strength', durationMinutes: 60, completed: true, notes: 'Good deadlift form — increase weight next session' },
      { id: 'ts-sm-2', date: '2026-03-27', type: 'strength', durationMinutes: 60, completed: false, notes: '' },
      { id: 'ts-sm-3', date: '2026-03-20', type: 'hiit', durationMinutes: 45, completed: true, notes: 'Excellent effort' },
    ],
    independentSessions: [
      { id: 'is-sm-1', date: '2026-03-24', type: 'cardio', durationMinutes: 30, completed: true, notes: '5km run' },
      { id: 'is-sm-2', date: '2026-03-26', type: 'mobility', durationMinutes: 20, completed: false, notes: 'Stretching routine' },
    ],

    goals: [
      {
        id: 'goal-sm-1',
        description: 'Squat 100kg',
        category: 'strength',
        targetValue: 100,
        currentValue: 85,
        unit: 'kg',
        targetDate: '2026-06-01',
        createdAt: '2026-01-15',
        progressHistory: [
          { date: '2026-01-15', value: 60 },
          { date: '2026-02-01', value: 70 },
          { date: '2026-03-01', value: 80 },
          { date: '2026-03-25', value: 85 },
        ],
      },
      {
        id: 'goal-sm-2',
        description: 'Lose 5kg body weight',
        category: 'weight',
        targetValue: 68,
        currentValue: 70.5,
        unit: 'kg',
        targetDate: '2026-05-01',
        createdAt: '2026-01-15',
        progressHistory: [
          { date: '2026-01-15', value: 73 },
          { date: '2026-02-01', value: 72 },
          { date: '2026-03-01', value: 71 },
          { date: '2026-03-25', value: 70.5 },
        ],
      },
    ],
  },

  {
    id: 'client-2',
    name: 'Alex Turner',
    initials: 'AT',
    avatarGrad: 'linear-gradient(135deg,#FF6B5B,#FFA733)',
    serviceType: 'personal_trainer',
    status: 'active',
    startDate: '2025-06-10',

    attentionFlag: null,
    nextSession: '2026-04-04',
    lastSeen: '1 day ago',

    currentPlan: {
      id: 'plan-at-1',
      name: '12-Week Strength Build',
      startDate: '2026-01-05',
      endDate: '2026-04-04',
      daysLeft: 3,
      progress: 92,
    },

    trainerSessions: [
      { id: 'ts-at-1', date: '2026-03-28', type: 'strength', durationMinutes: 60, completed: true, notes: 'PB on bench press — 100kg' },
      { id: 'ts-at-2', date: '2026-03-25', type: 'strength', durationMinutes: 60, completed: true, notes: 'Focused on form' },
    ],
    independentSessions: [
      { id: 'is-at-1', date: '2026-03-27', type: 'cardio', durationMinutes: 25, completed: true, notes: '5km run, 26:10' },
      { id: 'is-at-2', date: '2026-03-29', type: 'cardio', durationMinutes: 25, completed: true, notes: '5km run, 25:45' },
    ],

    goals: [
      {
        id: 'goal-at-1',
        description: 'Run 5km in under 25 minutes',
        category: 'cardio',
        targetValue: 25,
        currentValue: 25.75,
        unit: 'min',
        lowerIsBetter: true,
        targetDate: '2026-05-15',
        createdAt: '2026-01-05',
        progressHistory: [
          { date: '2026-01-05', value: 30 },
          { date: '2026-02-01', value: 28.5 },
          { date: '2026-03-01', value: 27 },
          { date: '2026-03-29', value: 25.75 },
        ],
      },
    ],
  },

  {
    id: 'client-3',
    name: 'Keiko Tanaka',
    initials: 'KT',
    avatarGrad: 'linear-gradient(135deg,#FFA733,#2EC4A0)',
    serviceType: 'personal_trainer',
    status: 'active',
    startDate: '2025-09-01',

    attentionFlag: null,
    nextSession: '2026-04-03',
    lastSeen: '2 days ago',

    currentPlan: {
      id: 'plan-kt-1',
      name: 'Summer Shred Program',
      startDate: '2026-01-26',
      endDate: '2026-04-06',
      daysLeft: 5,
      progress: 85,
    },

    trainerSessions: [
      { id: 'ts-kt-1', date: '2026-03-30', type: 'hiit', durationMinutes: 45, completed: true, notes: 'High energy session' },
      { id: 'ts-kt-2', date: '2026-03-27', type: 'strength', durationMinutes: 50, completed: true, notes: '' },
    ],
    independentSessions: [
      { id: 'is-kt-1', date: '2026-03-28', type: 'cardio', durationMinutes: 40, completed: true, notes: 'Morning run' },
      { id: 'is-kt-2', date: '2026-03-29', type: 'cardio', durationMinutes: 40, completed: true, notes: 'Cycling' },
    ],

    goals: [
      {
        id: 'goal-kt-1',
        description: 'Reach 18% body fat',
        category: 'weight',
        targetValue: 18,
        currentValue: 22,
        unit: '%',
        lowerIsBetter: true,
        targetDate: '2026-07-01',
        createdAt: '2026-01-26',
        progressHistory: [
          { date: '2026-01-26', value: 26 },
          { date: '2026-02-15', value: 25 },
          { date: '2026-03-01', value: 23.5 },
          { date: '2026-03-30', value: 22 },
        ],
      },
    ],
  },

  {
    id: 'client-5',
    name: 'Marcus Lee',
    initials: 'ML',
    avatarGrad: 'linear-gradient(135deg,#FFA733,#2EC4A0)',
    serviceType: 'personal_trainer',
    status: 'active',
    startDate: '2025-03-01',

    attentionFlag: {
      issue: 'No check-in logged since Monday',
      tag: 'Check-in due',
      tagType: 'checkin',
    },
    nextSession: '2026-04-02',
    lastSeen: '5 days ago',

    currentPlan: {
      id: 'plan-ml-1',
      name: '8-Week Fat Loss',
      startDate: '2026-02-01',
      endDate: '2026-04-27',
      daysLeft: 26,
      progress: 60,
    },

    trainerSessions: [
      { id: 'ts-ml-1', date: '2026-03-24', type: 'hiit', durationMinutes: 45, completed: true, notes: '' },
      { id: 'ts-ml-2', date: '2026-03-20', type: 'strength', durationMinutes: 60, completed: true, notes: 'Good session' },
    ],
    independentSessions: [
      { id: 'is-ml-1', date: '2026-03-22', type: 'cardio', durationMinutes: 30, completed: true, notes: 'Treadmill run' },
    ],

    goals: [
      {
        id: 'goal-ml-1',
        description: 'Complete all weekly workouts',
        category: 'general',
        targetValue: 100,
        currentValue: 62,
        unit: '% completion',
        targetDate: '2026-04-27',
        createdAt: '2026-02-01',
        progressHistory: [
          { date: '2026-02-07', value: 80 },
          { date: '2026-02-14', value: 75 },
          { date: '2026-02-21', value: 60 },
          { date: '2026-03-01', value: 65 },
          { date: '2026-03-24', value: 62 },
        ],
      },
    ],
  },

  {
    id: 'client-7',
    name: 'Tom Richter',
    initials: 'TR',
    avatarGrad: 'linear-gradient(135deg,#FF6B5B,#6C63FF)',
    serviceType: 'personal_trainer',
    status: 'active',
    startDate: '2025-10-01',

    attentionFlag: {
      issue: 'Completion rate dropped to 40%',
      tag: 'Low effort',
      tagType: 'effort',
    },
    nextSession: '2026-04-05',
    lastSeen: '1 day ago',

    currentPlan: {
      id: 'plan-tr-1',
      name: '10-Week Body Recomp',
      startDate: '2026-01-26',
      endDate: '2026-04-06',
      daysLeft: 5,
      progress: 40,
    },

    trainerSessions: [
      { id: 'ts-tr-1', date: '2026-03-31', type: 'strength', durationMinutes: 60, completed: true, notes: 'Motivation seems low — check in on life stress' },
      { id: 'ts-tr-2', date: '2026-03-25', type: 'strength', durationMinutes: 60, completed: false, notes: 'Did not show' },
    ],
    independentSessions: [
      { id: 'is-tr-1', date: '2026-03-28', type: 'strength', durationMinutes: 30, completed: false, notes: '' },
      { id: 'is-tr-2', date: '2026-03-26', type: 'cardio', durationMinutes: 30, completed: false, notes: '' },
    ],

    goals: [
      {
        id: 'goal-tr-1',
        description: 'Build visible muscle definition',
        category: 'strength',
        targetValue: 100,
        currentValue: 40,
        unit: '% program complete',
        targetDate: '2026-04-06',
        createdAt: '2026-01-26',
        progressHistory: [
          { date: '2026-02-01', value: 20 },
          { date: '2026-03-01', value: 35 },
          { date: '2026-03-31', value: 40 },
        ],
      },
    ],
  },

  {
    id: 'client-8',
    name: 'Elena Vasquez',
    initials: 'EV',
    avatarGrad: 'linear-gradient(135deg,#6C63FF,#2EC4A0)',
    serviceType: 'personal_trainer',
    status: 'active',
    startDate: '2025-02-01',

    attentionFlag: {
      issue: 'Asked about nutrition plan update',
      tag: 'Message',
      tagType: 'message',
    },
    nextSession: '2026-04-02',
    lastSeen: '3 hours ago',

    currentPlan: {
      id: 'plan-ev-1',
      name: 'Lean & Strong — Phase 2',
      startDate: '2026-02-22',
      endDate: '2026-05-17',
      daysLeft: 46,
      progress: 38,
    },

    trainerSessions: [
      { id: 'ts-ev-1', date: '2026-03-31', type: 'strength', durationMinutes: 60, completed: true, notes: 'Excellent consistency this week' },
      { id: 'ts-ev-2', date: '2026-03-28', type: 'strength', durationMinutes: 60, completed: true, notes: '' },
    ],
    independentSessions: [
      { id: 'is-ev-1', date: '2026-03-30', type: 'cardio', durationMinutes: 35, completed: true, notes: '6km run' },
      { id: 'is-ev-2', date: '2026-03-29', type: 'mobility', durationMinutes: 20, completed: true, notes: 'Yoga' },
    ],

    goals: [
      {
        id: 'goal-ev-1',
        description: 'Deadlift 80kg',
        category: 'strength',
        targetValue: 80,
        currentValue: 65,
        unit: 'kg',
        targetDate: '2026-06-01',
        createdAt: '2026-01-01',
        progressHistory: [
          { date: '2026-01-01', value: 50 },
          { date: '2026-02-01', value: 57.5 },
          { date: '2026-03-01', value: 62.5 },
          { date: '2026-03-31', value: 65 },
        ],
      },
    ],
  },

  // ── Physiotherapy patients ─────────────────────────────────────────────────

  {
    id: 'client-4',
    name: 'Damien Cross',
    initials: 'DC',
    avatarGrad: 'linear-gradient(135deg,#2EC4A0,#6C63FF)',
    serviceType: 'physiotherapist',
    status: 'active',
    startDate: '2025-11-01',

    attentionFlag: null,
    nextSession: '2026-04-04',
    lastSeen: '3 days ago',

    currentPlan: {
      id: 'plan-dc-1',
      name: 'Mobility & Recovery',
      startDate: '2026-02-09',
      endDate: '2026-04-08',
      daysLeft: 7,
      progress: 78,
    },

    trainerSessions: [
      { id: 'ts-dc-1', date: '2026-03-28', type: 'rehabilitation', durationMinutes: 45, completed: true, notes: 'Shoulder mobility improving — full ROM achieved in abduction' },
      { id: 'ts-dc-2', date: '2026-03-21', type: 'rehabilitation', durationMinutes: 45, completed: true, notes: 'Ultrasound + manual therapy' },
    ],
    independentSessions: [
      { id: 'is-dc-1', date: '2026-03-29', type: 'mobility', durationMinutes: 20, completed: true, notes: 'Home exercise program — band work' },
      { id: 'is-dc-2', date: '2026-03-30', type: 'mobility', durationMinutes: 20, completed: true, notes: 'Morning exercises' },
    ],

    goals: [
      {
        id: 'goal-dc-1',
        description: 'Full shoulder range of motion',
        category: 'rehabilitation',
        targetValue: 180,
        currentValue: 155,
        unit: '° abduction',
        targetDate: '2026-05-01',
        createdAt: '2025-11-01',
        progressHistory: [
          { date: '2025-11-01', value: 90 },
          { date: '2025-12-01', value: 110 },
          { date: '2026-01-01', value: 130 },
          { date: '2026-02-01', value: 140 },
          { date: '2026-03-01', value: 150 },
          { date: '2026-03-28', value: 155 },
        ],
      },
    ],
  },

  {
    id: 'client-9',
    name: 'Jordan Lee',
    initials: 'JL',
    avatarGrad: 'linear-gradient(135deg,#FF6B5B,#2EC4A0)',
    serviceType: 'physiotherapist',
    status: 'active',
    startDate: '2026-01-10',

    attentionFlag: null,
    nextSession: '2026-04-03',
    lastSeen: '5 days ago',

    currentPlan: {
      id: 'plan-jl-1',
      name: 'Lower Back Rehab Protocol',
      startDate: '2026-01-10',
      endDate: '2026-04-10',
      daysLeft: 9,
      progress: 88,
    },

    trainerSessions: [
      { id: 'ts-jl-1', date: '2026-03-27', type: 'rehabilitation', durationMinutes: 45, completed: true, notes: 'L4-L5 mobilisation — pain score 3/10 (was 7/10 at intake)' },
      { id: 'ts-jl-2', date: '2026-03-20', type: 'rehabilitation', durationMinutes: 45, completed: true, notes: 'Dry needling + manual therapy' },
    ],
    independentSessions: [
      { id: 'is-jl-1', date: '2026-03-28', type: 'mobility', durationMinutes: 15, completed: true, notes: 'HEP — cat-cow, bird-dog' },
      { id: 'is-jl-2', date: '2026-03-29', type: 'mobility', durationMinutes: 15, completed: true, notes: 'HEP completed' },
      { id: 'is-jl-3', date: '2026-03-30', type: 'mobility', durationMinutes: 15, completed: false, notes: '' },
    ],

    goals: [
      {
        id: 'goal-jl-1',
        description: 'Reduce lower back pain to 0/10',
        category: 'rehabilitation',
        targetValue: 0,
        currentValue: 3,
        unit: '/10 pain score',
        lowerIsBetter: true,
        targetDate: '2026-04-10',
        createdAt: '2026-01-10',
        progressHistory: [
          { date: '2026-01-10', value: 8 },
          { date: '2026-01-24', value: 7 },
          { date: '2026-02-07', value: 6 },
          { date: '2026-02-21', value: 5 },
          { date: '2026-03-07', value: 4 },
          { date: '2026-03-27', value: 3 },
        ],
      },
    ],
  },

  {
    id: 'client-10',
    name: 'Emma Rodriguez',
    initials: 'ER',
    avatarGrad: 'linear-gradient(135deg,#6C63FF,#FF6B5B)',
    serviceType: 'physiotherapist',
    status: 'active',
    startDate: '2025-08-20',

    attentionFlag: null,
    nextSession: '2026-04-07',
    lastSeen: '2 days ago',

    currentPlan: {
      id: 'plan-er-1',
      name: 'Post-Surgical Knee Rehab',
      startDate: '2025-08-20',
      endDate: '2026-05-20',
      daysLeft: 49,
      progress: 75,
    },

    trainerSessions: [
      { id: 'ts-er-1', date: '2026-03-30', type: 'rehabilitation', durationMinutes: 60, completed: true, notes: 'Week 32 — quad strength 80% of contralateral limb' },
      { id: 'ts-er-2', date: '2026-03-23', type: 'rehabilitation', durationMinutes: 60, completed: true, notes: 'Introduced light plyometrics' },
    ],
    independentSessions: [
      { id: 'is-er-1', date: '2026-03-31', type: 'mobility', durationMinutes: 30, completed: true, notes: 'HEP — quad sets, SLR, mini squats' },
      { id: 'is-er-2', date: '2026-03-29', type: 'mobility', durationMinutes: 30, completed: true, notes: 'Pool walking' },
    ],

    goals: [
      {
        id: 'goal-er-1',
        description: 'Return to running',
        category: 'rehabilitation',
        targetValue: 100,
        currentValue: 75,
        unit: '% readiness',
        targetDate: '2026-05-20',
        createdAt: '2025-08-20',
        progressHistory: [
          { date: '2025-09-01', value: 5 },
          { date: '2025-10-01', value: 15 },
          { date: '2025-11-01', value: 25 },
          { date: '2025-12-01', value: 40 },
          { date: '2026-01-01', value: 55 },
          { date: '2026-02-01', value: 65 },
          { date: '2026-03-01', value: 70 },
          { date: '2026-03-30', value: 75 },
        ],
      },
    ],
  },

  // ── Inactive clients ───────────────────────────────────────────────────────

  {
    id: 'client-11',
    name: 'Ryan Foster',
    initials: 'RF',
    avatarGrad: 'linear-gradient(135deg,#9090B0,#6C63FF)',
    serviceType: 'personal_trainer',
    status: 'inactive',
    startDate: '2024-06-01',

    attentionFlag: null,
    nextSession: null,
    lastSeen: '6 weeks ago',

    currentPlan: null,
    trainerSessions: [],
    independentSessions: [],
    goals: [],
  },

  {
    id: 'client-12',
    name: 'Mei Chen',
    initials: 'MC',
    avatarGrad: 'linear-gradient(135deg,#2EC4A0,#9090B0)',
    serviceType: 'physiotherapist',
    status: 'inactive',
    startDate: '2024-09-15',

    attentionFlag: null,
    nextSession: null,
    lastSeen: '3 weeks ago',

    currentPlan: null,
    trainerSessions: [],
    independentSessions: [],
    goals: [],
  },

  // ── Massage therapy clients ────────────────────────────────────────────────

  {
    id: 'client-6',
    name: 'Priya Nair',
    initials: 'PN',
    avatarGrad: 'linear-gradient(135deg,#2EC4A0,#6C63FF)',
    serviceType: 'massage_therapist',
    status: 'active',
    startDate: '2025-07-15',

    attentionFlag: {
      issue: 'Reported knee pain in last log',
      tag: 'Health flag',
      tagType: 'health',
    },
    nextSession: '2026-04-09',
    lastSeen: '2 days ago',

    currentPlan: {
      id: 'plan-pn-1',
      name: 'Sports Recovery Program',
      startDate: '2026-02-15',
      endDate: '2026-05-15',
      daysLeft: 44,
      progress: 45,
    },

    trainerSessions: [
      { id: 'ts-pn-1', date: '2026-03-30', type: 'massage', durationMinutes: 60, completed: true, notes: 'Deep tissue — hamstrings and IT band. Client reported increased knee soreness after runs.' },
      { id: 'ts-pn-2', date: '2026-03-16', type: 'massage', durationMinutes: 60, completed: true, notes: 'Sports massage pre-race' },
    ],
    independentSessions: [
      { id: 'is-pn-1', date: '2026-03-29', type: 'mobility', durationMinutes: 15, completed: true, notes: 'Foam rolling routine' },
      { id: 'is-pn-2', date: '2026-03-31', type: 'mobility', durationMinutes: 15, completed: false, notes: '' },
    ],

    goals: [
      {
        id: 'goal-pn-1',
        description: 'Reduce post-run recovery time',
        category: 'rehabilitation',
        targetValue: 24,
        currentValue: 48,
        unit: 'hrs recovery',
        lowerIsBetter: true,
        targetDate: '2026-06-01',
        createdAt: '2026-02-15',
        progressHistory: [
          { date: '2026-02-15', value: 72 },
          { date: '2026-03-01', value: 60 },
          { date: '2026-03-16', value: 48 },
        ],
      },
    ],
  },
]

// ─── Derived helpers ──────────────────────────────────────────────────────────

export function getActiveClients() {
  return clients.filter(c => c.status === 'active')
}

export function getClientsNeedingAttention() {
  return clients.filter(c => c.attentionFlag !== null)
}

export function getClientsWithEndingPlans(withinDays = 7) {
  return clients
    .filter(c => c.currentPlan && c.currentPlan.daysLeft <= withinDays)
    .sort((a, b) => a.currentPlan.daysLeft - b.currentPlan.daysLeft)
}

export function getServiceConfig(serviceType) {
  return SERVICE_CONFIG[serviceType] ?? SERVICE_CONFIG.other
}

export function getClientById(id) {
  return clients.find(c => c.id === id) ?? null
}
