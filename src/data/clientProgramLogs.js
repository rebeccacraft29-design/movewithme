// ── Client-specific program data ──────────────────────────────────────────────
// Indexed by programId.
// Each entry has: assignedClientIds, and per-client: logs, overrides, notes, insights.
// programVersion = which version of the master program the client started on.

export const clientProgramLogs = {

  // ── 12-Week Strength Build (prog-1): Sarah Mitchell + Alex Turner ───────────
  'prog-1': {
    assignedClientIds: ['client-1', 'client-2'],
    clients: {
      'client-1': {
        programVersion: 1,
        currentWeek: 4,
        completedSessions: 10,
        totalSessions: 12,
        personalBests: [
          { label: 'Barbell Back Squat — 75kg',       date: '2026-01-27' },
          { label: 'Bench Press — 57.5kg',             date: '2026-01-27' },
          { label: 'Conventional Deadlift — 87.5kg',   date: '2026-01-29' },
          { label: 'Romanian Deadlift — 65kg',         date: '2026-01-31' },
        ],
        weekLogs: {
          'p1w1': {
            'p1w1d1': { completed: true,  date: '2026-01-06', rating: 4, exercises: {
              'p1w1d1b1': { sets: 4, reps: '6',   weight: '60kg'  },
              'p1w1d1b2': { sets: 4, reps: '8',   weight: '50kg'  },
              'p1w1d1b3': { sets: 3, reps: '10',  weight: '40kg'  },
              'p1w1d1b4': { sets: 3, reps: '45s', weight: ''      },
            }},
            'p1w1d2': { completed: true,  date: '2026-01-08', rating: 5, exercises: {
              'p1w1d2b1': { sets: 4, reps: '5',  weight: '80kg' },
              'p1w1d2b2': { sets: 3, reps: '8',  weight: '35kg' },
              'p1w1d2b3': { sets: 3, reps: '6',  weight: 'BW'   },
              'p1w1d2b4': { sets: 3, reps: '10', weight: ''     },
            }},
            'p1w1d3': { completed: true,  date: '2026-01-10', rating: 3, exercises: {
              'p1w1d3b1': { sets: 4, reps: '8',  weight: '55kg' },
              'p1w1d3b2': { sets: 3, reps: '12', weight: '20kg' },
              'p1w1d3b3': { sets: 3, reps: '12', weight: '12kg' },
              'p1w1d3b4': { sets: 3, reps: '12', weight: ''     },
            }},
          },
          'p1w2': {
            'p1w2d1': { completed: true,  date: '2026-01-13', rating: 4, exercises: {
              'p1w2d1b1': { sets: 4, reps: '6',   weight: '67.5kg' }, // ▲ heavier than 65kg
              'p1w2d1b2': { sets: 4, reps: '8',   weight: '52.5kg' },
              'p1w2d1b3': { sets: 3, reps: '10',  weight: '42.5kg' },
              'p1w2d1b4': { sets: 3, reps: '50s', weight: ''       },
            }},
            'p1w2d2': { completed: false, date: null, rating: null, exercises: {} },
            'p1w2d3': { completed: true,  date: '2026-01-17', rating: 4, exercises: {
              'p1w2d3b1': { sets: 4, reps: '8',  weight: '57.5kg' },
              'p1w2d3b2': { sets: 3, reps: '12', weight: '22.5kg' },
              'p1w2d3b3': { sets: 3, reps: '12', weight: '13kg'   },
              'p1w2d3b4': { sets: 3, reps: '12', weight: ''       },
            }},
          },
          'p1w3': {
            'p1w3d1': { completed: true,  date: '2026-01-20', rating: 5, exercises: {
              'p1w3d1b1': { sets: 4, reps: '6',  weight: '72.5kg' }, // ▲ heavier than 70kg
              'p1w3d1b2': { sets: 4, reps: '8',  weight: '55kg'   },
              'p1w3d1b3': { sets: 3, reps: '10', weight: '45kg'   },
              'p1w3d1b4': { sets: 3, reps: '8',  weight: ''       },
            }},
            'p1w3d2': { completed: true,  date: '2026-01-22', rating: 3, exercises: {
              'p1w3d2b1': { sets: 4, reps: '5',  weight: '85kg'   },
              'p1w3d2b2': { sets: 3, reps: '8',  weight: '37.5kg' }, // used override weight
              'p1w3d2b3': { sets: 3, reps: '8',  weight: 'BW'     },
              'p1w3d2b4': { sets: 3, reps: '12', weight: ''       },
            }},
            'p1w3d3': { completed: true,  date: '2026-01-24', rating: 4, exercises: {
              'p1w3d3b1': { sets: 4, reps: '8',  weight: '60kg' },
              'p1w3d3b2': { sets: 3, reps: '10', weight: '25kg' },
              'p1w3d3b3': { sets: 3, reps: '12', weight: '14kg' },
              'p1w3d3b4': { sets: 3, reps: '15', weight: ''     },
            }},
          },
          'p1w4': {
            'p1w4d1': { completed: true,  date: '2026-01-27', rating: 5, exercises: {
              'p1w4d1b1': { sets: 4, reps: '6',  weight: '75kg'   }, // ▲ heavier than 72.5kg — PB!
              'p1w4d1b2': { sets: 4, reps: '8',  weight: '57.5kg' },
              'p1w4d1b3': { sets: 3, reps: '10', weight: '47.5kg' },
              'p1w4d1b4': { sets: 3, reps: '10', weight: ''       },
            }},
            'p1w4d2': { completed: false, date: null, rating: null, exercises: {} },
            'p1w4d3': { completed: true,  date: '2026-01-31', rating: 4, exercises: {
              'p1w4d3b1': { sets: 4, reps: '8',  weight: '65kg'   }, // ▲ heavier than 62.5kg
              'p1w4d3b2': { sets: 3, reps: '10', weight: '27.5kg' },
              'p1w4d3b3': { sets: 3, reps: '12', weight: '15kg'   },
              'p1w4d3b4': { sets: 3, reps: '15', weight: ''       },
            }},
          },
        },
        overrides: {
          'p1w3d2b2': { sets: 3, reps: '8', weight: '37.5kg', notes: 'Reduced — shoulder discomfort' },
          'p1w4d2b2': { sets: 3, reps: '8', weight: '40kg',   notes: 'Reduced — shoulder discomfort' },
        },
        trainerNotes: [
          { id: 'tn-sm-1', content: 'Watch knee tracking on Bulgarian split squats — cue hip hinge', date: '2026-01-24' },
          { id: 'tn-sm-2', content: 'OHP reduced due to shoulder — monitoring closely',               date: '2026-01-22' },
        ],
        insights: [
          'Bench Press up 7.5kg in 4 weeks (50kg → 57.5kg)',
          'Squat personal best in Week 4: 75kg (+15kg from Week 1)',
          'RDL progressed from 55kg → 65kg (+10kg)',
          'Missed 2 sessions — overall 83% compliance',
        ],
      },

      'client-2': {
        programVersion: 1,
        currentWeek: 4,
        completedSessions: 12,
        totalSessions: 12,
        personalBests: [
          { label: 'Barbell Back Squat — 82.5kg',     date: '2026-01-27' },
          { label: 'Conventional Deadlift — 95kg',    date: '2026-01-29' },
          { label: 'Bench Press — 60kg',              date: '2026-01-27' },
        ],
        weekLogs: {
          'p1w1': {
            'p1w1d1': { completed: true, date: '2026-01-06', rating: 5, exercises: {
              'p1w1d1b1': { sets: 4, reps: '6',   weight: '60kg'   },
              'p1w1d1b2': { sets: 4, reps: '8',   weight: '52.5kg' }, // ▲ heavier
              'p1w1d1b3': { sets: 3, reps: '10',  weight: '40kg'   },
              'p1w1d1b4': { sets: 3, reps: '45s', weight: ''       },
            }},
            'p1w1d2': { completed: true, date: '2026-01-08', rating: 4, exercises: {
              'p1w1d2b1': { sets: 4, reps: '5',  weight: '80kg' },
              'p1w1d2b2': { sets: 3, reps: '8',  weight: '35kg' },
              'p1w1d2b3': { sets: 3, reps: '6',  weight: 'BW'   },
              'p1w1d2b4': { sets: 3, reps: '10', weight: ''     },
            }},
            'p1w1d3': { completed: true, date: '2026-01-10', rating: 4, exercises: {
              'p1w1d3b1': { sets: 4, reps: '8',  weight: '55kg' },
              'p1w1d3b2': { sets: 3, reps: '12', weight: '20kg' },
              'p1w1d3b3': { sets: 3, reps: '12', weight: '14kg' }, // ▲ heavier
              'p1w1d3b4': { sets: 3, reps: '12', weight: ''     },
            }},
          },
          'p1w2': {
            'p1w2d1': { completed: true, date: '2026-01-13', rating: 5, exercises: {
              'p1w2d1b1': { sets: 4, reps: '6',   weight: '65kg'   },
              'p1w2d1b2': { sets: 4, reps: '8',   weight: '55kg'   }, // ▲ heavier than 52.5kg
              'p1w2d1b3': { sets: 3, reps: '10',  weight: '42.5kg' },
              'p1w2d1b4': { sets: 3, reps: '50s', weight: ''       },
            }},
            'p1w2d2': { completed: true, date: '2026-01-15', rating: 4, exercises: {
              'p1w2d2b1': { sets: 4, reps: '5',  weight: '82.5kg' },
              'p1w2d2b2': { sets: 3, reps: '8',  weight: '37.5kg' },
              'p1w2d2b3': { sets: 3, reps: '7',  weight: 'BW'     },
              'p1w2d2b4': { sets: 3, reps: '10', weight: ''       },
            }},
            'p1w2d3': { completed: true, date: '2026-01-17', rating: 4, exercises: {
              'p1w2d3b1': { sets: 4, reps: '8',  weight: '57.5kg' },
              'p1w2d3b2': { sets: 3, reps: '12', weight: '22.5kg' },
              'p1w2d3b3': { sets: 3, reps: '12', weight: '13kg'   },
              'p1w2d3b4': { sets: 3, reps: '12', weight: ''       },
            }},
          },
          'p1w3': {
            'p1w3d1': { completed: true, date: '2026-01-20', rating: 5, exercises: {
              'p1w3d1b1': { sets: 4, reps: '6',  weight: '75kg'   }, // ▲ heavier than 70kg
              'p1w3d1b2': { sets: 4, reps: '8',  weight: '57.5kg' }, // ▲ heavier than 55kg
              'p1w3d1b3': { sets: 3, reps: '10', weight: '45kg'   },
              'p1w3d1b4': { sets: 3, reps: '8',  weight: ''       },
            }},
            'p1w3d2': { completed: true, date: '2026-01-22', rating: 5, exercises: {
              'p1w3d2b1': { sets: 4, reps: '5',  weight: '90kg'   }, // ▲ heavier than 85kg
              'p1w3d2b2': { sets: 3, reps: '8',  weight: '40kg'   },
              'p1w3d2b3': { sets: 3, reps: '8',  weight: 'BW+5kg' },
              'p1w3d2b4': { sets: 3, reps: '12', weight: ''       },
            }},
            'p1w3d3': { completed: true, date: '2026-01-24', rating: 4, exercises: {
              'p1w3d3b1': { sets: 4, reps: '8',  weight: '60kg'   },
              'p1w3d3b2': { sets: 3, reps: '10', weight: '27.5kg' }, // ▲ heavier than 25kg
              'p1w3d3b3': { sets: 3, reps: '12', weight: '14kg'   },
              'p1w3d3b4': { sets: 3, reps: '15', weight: ''       },
            }},
          },
          'p1w4': {
            'p1w4d1': { completed: true, date: '2026-01-27', rating: 5, exercises: {
              'p1w4d1b1': { sets: 4, reps: '6',  weight: '82.5kg' }, // ▲ huge jump — PB!
              'p1w4d1b2': { sets: 4, reps: '8',  weight: '60kg'   }, // ▲ heavier than 57.5kg
              'p1w4d1b3': { sets: 3, reps: '10', weight: '47.5kg' },
              'p1w4d1b4': { sets: 3, reps: '10', weight: ''       },
            }},
            'p1w4d2': { completed: true, date: '2026-01-29', rating: 5, exercises: {
              'p1w4d2b1': { sets: 4, reps: '5',  weight: '95kg'   }, // ▲ PB deadlift
              'p1w4d2b2': { sets: 3, reps: '8',  weight: '42.5kg' },
              'p1w4d2b3': { sets: 3, reps: '8',  weight: 'BW+5kg' },
              'p1w4d2b4': { sets: 3, reps: '15', weight: ''       },
            }},
            'p1w4d3': { completed: true, date: '2026-01-31', rating: 4, exercises: {
              'p1w4d3b1': { sets: 4, reps: '8',  weight: '62.5kg' },
              'p1w4d3b2': { sets: 3, reps: '10', weight: '27.5kg' },
              'p1w4d3b3': { sets: 3, reps: '12', weight: '15kg'   },
              'p1w4d3b4': { sets: 3, reps: '15', weight: ''       },
            }},
          },
        },
        overrides: {},
        trainerNotes: [
          { id: 'tn-at-1', content: 'Exceptional Week 4 — squat and deadlift both hit new bests', date: '2026-01-29' },
        ],
        insights: [
          'Squat up 22.5kg in 4 weeks (60kg → 82.5kg) — outstanding progression',
          'Deadlift PB: 95kg in Week 4',
          'Bench consistently going heavier than prescribed each week',
          'Perfect attendance — 12/12 sessions',
        ],
      },
    },
  },

  // ── Strength & Conditioning (prog-2): Alex Turner ───────────────────────────
  'prog-2': {
    assignedClientIds: ['client-2'],
    clients: {
      'client-2': {
        programVersion: 1,
        currentWeek: 2,
        completedSessions: 5,
        totalSessions: 6,
        personalBests: [
          { label: 'Bench Press — 85kg', date: '2026-02-10' },
        ],
        weekLogs: {
          'p2w1': {
            'p2w1d1': { completed: true,  date: '2026-02-03', rating: 5, exercises: {
              'p2w1d1b1': { sets: 4, reps: '8',    weight: '82.5kg' }, // ▲ heavier than 80kg
              'p2w1d1b2': { sets: 3, reps: '10',   weight: '30kg'   },
              'p2w1d1b3': { sets: 3, reps: '12',   weight: '50kg'   },
              'p2w1d1b4': { sets: 3, reps: '15',   weight: '8kg'    },
            }},
            'p2w1d2': { completed: true,  date: '2026-02-06', rating: 4, exercises: {
              'p2w1d2b1': { sets: 4, reps: '8',  weight: '80kg' },
              'p2w1d2b2': { sets: 3, reps: '10', weight: '60kg' },
              'p2w1d2b3': { sets: 3, reps: '12', weight: '20kg' },
              'p2w1d2b4': { sets: 3, reps: '60s', weight: ''    },
            }},
            'p2w1d3': { completed: true,  date: '2026-02-08', rating: 3, exercises: {
              'p2w1d3b1': { sets: 1, reps: '30min', weight: ''    },
              'p2w1d3b2': { sets: 4, reps: '15',    weight: '24kg'},
              'p2w1d3b3': { sets: 3, reps: '90s',   weight: ''    },
            }},
          },
          'p2w2': {
            'p2w2d1': { completed: true,  date: '2026-02-10', rating: 5, exercises: {
              'p2w2d1b1': { sets: 4, reps: '8',  weight: '85kg'   }, // ▲ PB bench
              'p2w2d1b2': { sets: 3, reps: '10', weight: '32.5kg' },
              'p2w2d1b3': { sets: 3, reps: '12', weight: '52.5kg' },
              'p2w2d1b4': { sets: 3, reps: '15', weight: '9kg'    },
            }},
            'p2w2d2': { completed: true,  date: '2026-02-13', rating: 4, exercises: {
              'p2w2d2b1': { sets: 4, reps: '8',  weight: '82.5kg' },
              'p2w2d2b2': { sets: 3, reps: '10', weight: '62.5kg' },
              'p2w2d2b3': { sets: 3, reps: '12', weight: '22.5kg' },
              'p2w2d2b4': { sets: 3, reps: '10', weight: ''       },
            }},
            'p2w2d3': { completed: false, date: null, rating: null, exercises: {} },
          },
        },
        overrides: {},
        trainerNotes: [],
        insights: [
          'Bench Press PB: 85kg in Week 2 (up 5kg from Week 1)',
          'Strong compliance — 5/6 sessions',
        ],
      },
    },
  },

  // ── Shoulder Rehab Phase 3 (prog-5): Damien Cross ───────────────────────────
  'prog-5': {
    assignedClientIds: ['client-4'],
    clients: {
      'client-4': {
        programVersion: 1,
        currentWeek: 2,
        completedSessions: 5,
        totalSessions: 6,
        personalBests: [],
        weekLogs: {
          'p5w1': {
            'p5w1d1': { completed: true,  date: '2026-03-02', rating: 4, exercises: {
              'p5w1d1b1': { sets: 3, reps: '2min', weight: ''          },
              'p5w1d1b2': { sets: 3, reps: '10',   weight: ''          },
              'p5w1d1b3': { sets: 3, reps: '15',   weight: 'Light band'},
              'p5w1d1b4': { sets: 2, reps: '15',   weight: '5kg'       },
            }},
            'p5w1d2': { completed: true,  date: '2026-03-04', rating: 3, exercises: {
              'p5w1d2b1': { sets: 3, reps: '2min', weight: ''            },
              'p5w1d2b2': { sets: 2, reps: '10',   weight: ''            },
              'p5w1d2b3': { sets: 2, reps: '10',   weight: ''            },
              'p5w1d2b4': { sets: 3, reps: '20',   weight: 'Medium band' },
            }},
            'p5w1d3': { completed: true,  date: '2026-03-06', rating: 4, exercises: {
              'p5w1d3b1': { sets: 3, reps: '12',   weight: ''            },
              'p5w1d3b2': { sets: 3, reps: '20',   weight: 'Medium band' },
              'p5w1d3b3': { sets: 3, reps: '15',   weight: '5kg'         },
              'p5w1d3b4': { sets: 2, reps: '2min', weight: ''            },
            }},
          },
          'p5w2': {
            'p5w2d1': { completed: true,  date: '2026-03-09', rating: 4, exercises: {
              'p5w2d1b1': { sets: 3, reps: '2min', weight: ''            },
              'p5w2d1b2': { sets: 3, reps: '12',   weight: ''            },
              'p5w2d1b3': { sets: 3, reps: '20',   weight: 'Medium band' },
              'p5w2d1b4': { sets: 3, reps: '15',   weight: '6kg'         },
            }},
            'p5w2d2': { completed: false, date: null, rating: null, exercises: {} },
            'p5w2d3': { completed: true,  date: '2026-03-13', rating: 5, exercises: {
              'p5w2d3b1': { sets: 3, reps: '15',   weight: ''           },
              'p5w2d3b2': { sets: 3, reps: '20',   weight: 'Heavy band' },
              'p5w2d3b3': { sets: 3, reps: '15',   weight: '6kg'        },
              'p5w2d3b4': { sets: 2, reps: '2min', weight: ''           },
            }},
          },
        },
        overrides: {},
        trainerNotes: [
          { id: 'tn-dc-1', content: 'ROM improving steadily — encourage home exercises daily',     date: '2026-03-10' },
          { id: 'tn-dc-2', content: 'Pain score now 2/10 on overhead movements (was 5/10 week 1)', date: '2026-03-04' },
        ],
        insights: [
          'Progressed from Light band → Heavy band for band exercises in 2 weeks',
          'Pain score reduced from 5/10 to 2/10',
          '5/6 sessions completed',
        ],
      },
    },
  },
}
