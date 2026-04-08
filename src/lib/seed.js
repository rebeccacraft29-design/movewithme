// ─── Seed data for new trainers ───────────────────────────────────────────────
// Called once after onboarding completes.
// Creates 2 demo clients, 3 templates, 2 active programs, session logs,
// messages, habits, and goals so the app looks populated from day 1.

import { supabase } from './supabase'

const uid = () => Math.random().toString(36).slice(2, 9)

// ─── Program content builders ─────────────────────────────────────────────────

function makeWeeks(daysTemplate, weekCount) {
  return Array.from({ length: weekCount }, (_, wi) => ({
    id: uid(),
    weekNumber: wi + 1,
    days: daysTemplate.map(day => ({
      ...day,
      id: uid(),
      exercises: day.exercises.map(ex => ({ ...ex, id: uid() })),
    })),
  }))
}

const strengthDays = [
  {
    label: 'Day 1 — Upper Body',
    sessionNotes: 'Focus on controlled tempo. Rest 90s between sets.',
    exercises: [
      { exerciseId: 'ex-4',  sets: 4, reps: '8',   weight: '60kg', notes: '' },
      { exerciseId: 'ex-5',  sets: 4, reps: '8',   weight: '50kg', notes: '' },
      { exerciseId: 'ex-6',  sets: 3, reps: '10',  weight: '40kg', notes: '' },
      { exerciseId: 'ex-9',  sets: 3, reps: '12',  weight: '12kg', notes: '' },
      { exerciseId: 'ex-10', sets: 3, reps: '12',  weight: '',     notes: '' },
    ],
  },
  {
    label: 'Day 2 — Lower Body',
    sessionNotes: 'Warm up with 5 min light cardio before squats.',
    exercises: [
      { exerciseId: 'ex-1',  sets: 4, reps: '8',   weight: '60kg', notes: '' },
      { exerciseId: 'ex-2',  sets: 3, reps: '10',  weight: '50kg', notes: '' },
      { exerciseId: 'ex-12', sets: 3, reps: '12',  weight: '80kg', notes: '' },
      { exerciseId: 'ex-15', sets: 3, reps: '15',  weight: '',     notes: '' },
      { exerciseId: 'ex-17', sets: 3, reps: '45s', weight: '',     notes: '' },
    ],
  },
  {
    label: 'Day 3 — Full Body',
    sessionNotes: 'Compound movements. Keep rest periods to 2 min on deadlifts.',
    exercises: [
      { exerciseId: 'ex-3',  sets: 3, reps: '6',  weight: '80kg', notes: '' },
      { exerciseId: 'ex-7',  sets: 3, reps: '8',  weight: '',     notes: 'Assisted if needed' },
      { exerciseId: 'ex-8',  sets: 3, reps: '10', weight: '',     notes: '' },
      { exerciseId: 'ex-11', sets: 3, reps: '15', weight: '8kg',  notes: '' },
      { exerciseId: 'ex-18', sets: 3, reps: '10', weight: '',     notes: '' },
    ],
  },
]

const mobilityDays = [
  {
    label: 'Day 1 — Lower Body Mobility',
    sessionNotes: 'Move slowly and breathe through each stretch.',
    exercises: [
      { exerciseId: 'ex-28', sets: 3, reps: '30s', weight: '', notes: 'Each side' },
      { exerciseId: 'ex-29', sets: 3, reps: '15',  weight: '', notes: '' },
      { exerciseId: 'ex-30', sets: 3, reps: '10',  weight: '', notes: 'Each side' },
      { exerciseId: 'ex-19', sets: 3, reps: '12',  weight: '', notes: '' },
      { exerciseId: 'ex-18', sets: 3, reps: '10',  weight: '', notes: '' },
    ],
  },
  {
    label: 'Day 2 — Upper Body Mobility',
    sessionNotes: 'Especially important for desk workers. Go gentle on shoulder pendulum.',
    exercises: [
      { exerciseId: 'ex-31', sets: 3, reps: '60s', weight: '', notes: 'Gravity only — no effort' },
      { exerciseId: 'ex-36', sets: 3, reps: '15',  weight: '', notes: '' },
      { exerciseId: 'ex-16', sets: 3, reps: '15',  weight: '5kg', notes: '' },
      { exerciseId: 'ex-37', sets: 3, reps: '20',  weight: '', notes: '' },
    ],
  },
  {
    label: 'Day 3 — Functional Strength',
    sessionNotes: 'Light loads, focus on joint control and full range.',
    exercises: [
      { exerciseId: 'ex-42', sets: 3, reps: '12', weight: '12kg', notes: '' },
      { exerciseId: 'ex-43', sets: 3, reps: '10', weight: '',     notes: 'Each leg' },
      { exerciseId: 'ex-41', sets: 3, reps: '30m', weight: '12kg', notes: '' },
      { exerciseId: 'ex-15', sets: 3, reps: '20', weight: '',     notes: '' },
    ],
  },
]

const rehabDays = [
  {
    label: 'Session 1 — Mobility & Activation',
    sessionNotes: 'Pain-free range only. Stop if sharp pain occurs.',
    exercises: [
      { exerciseId: 'ex-31', sets: 3, reps: '60s', weight: '', notes: 'Let arm hang, gravity only' },
      { exerciseId: 'ex-36', sets: 3, reps: '15',  weight: '', notes: 'Against wall, arms slide up' },
      { exerciseId: 'ex-37', sets: 3, reps: '20',  weight: '', notes: 'Light band' },
      { exerciseId: 'ex-16', sets: 3, reps: '15',  weight: '5kg', notes: '' },
    ],
  },
  {
    label: 'Session 2 — Core & Stability',
    sessionNotes: 'Neutral spine throughout. Breathe out on exertion.',
    exercises: [
      { exerciseId: 'ex-29', sets: 3, reps: '15',  weight: '', notes: '' },
      { exerciseId: 'ex-19', sets: 3, reps: '12',  weight: '', notes: 'Slow and controlled' },
      { exerciseId: 'ex-18', sets: 3, reps: '10',  weight: '', notes: '' },
      { exerciseId: 'ex-28', sets: 3, reps: '30s', weight: '', notes: 'Each side' },
    ],
  },
  {
    label: 'Session 3 — Strengthening',
    sessionNotes: 'Build slowly — quality over quantity every time.',
    exercises: [
      { exerciseId: 'ex-32', sets: 3, reps: '20',  weight: '', notes: '' },
      { exerciseId: 'ex-38', sets: 3, reps: '10',  weight: '', notes: 'Each direction' },
      { exerciseId: 'ex-33', sets: 3, reps: '15',  weight: '', notes: '' },
      { exerciseId: 'ex-34', sets: 3, reps: '15',  weight: '', notes: '10s hold each rep' },
    ],
  },
]

// ─── Main seed function ───────────────────────────────────────────────────────

export async function seedTrainerData(trainerId) {
  // ── 1. Create dummy clients ──────────────────────────────────────────────────

  const { data: newClients, error: clientError } = await supabase
    .from('clients')
    .insert([
      {
        trainer_id:   trainerId,
        first_name:   'Alex',
        last_name:    'Johnson',
        email:        'alex.johnson@example.com',
        service_type: 'personal_trainer',
        status:       'active',
      },
      {
        trainer_id:   trainerId,
        first_name:   'Sam',
        last_name:    'Rivera',
        email:        'sam.rivera@example.com',
        service_type: 'physiotherapist',
        status:       'active',
        health_context: 'Previous lower back injury (2024)\nL4-L5 disc bulge — cleared for rehab',
      },
    ])
    .select()

  if (clientError || !newClients?.length) {
    console.error('Seed: client insert failed', clientError)
    return
  }

  const alexId = newClients[0].id
  const samId  = newClients[1].id

  // ── 2. Create templates ──────────────────────────────────────────────────────

  const { data: templates } = await supabase
    .from('programs')
    .insert([
      {
        trainer_id:          trainerId,
        name:                '4-Week Strength Foundation',
        program_type:        'personal_trainer',
        weeks:               4,
        sessions_per_week:   3,
        visibility:          'trainer_only',
        status:              'template',
        is_template:         true,
        template_name:       '4-Week Strength Foundation',
        template_description: 'A progressive 4-week program covering upper body, lower body, and full-body days. Ideal for beginner to intermediate clients building a strength base.',
        content:             { weeks: makeWeeks(strengthDays, 4) },
      },
      {
        trainer_id:          trainerId,
        name:                '6-Week Mobility Program',
        program_type:        'personal_trainer',
        weeks:               6,
        sessions_per_week:   3,
        visibility:          'trainer_only',
        status:              'template',
        is_template:         true,
        template_name:       '6-Week Mobility Program',
        template_description: 'Six weeks of structured mobility and functional strength work. Great for clients returning from a break or needing joint health focus.',
        content:             { weeks: makeWeeks(mobilityDays, 6) },
      },
      {
        trainer_id:          trainerId,
        name:                '4-Week Rehab Protocol',
        program_type:        'physiotherapist',
        weeks:               4,
        sessions_per_week:   3,
        visibility:          'trainer_only',
        status:              'template',
        is_template:         true,
        template_name:       '4-Week Rehab Protocol',
        template_description: 'Evidence-based rehab protocol covering mobility, core stability, and progressive strengthening. Suitable for post-injury recovery.',
        content:             { weeks: makeWeeks(rehabDays, 4) },
      },
    ])
    .select()

  // ── 3. Create active programs for the demo clients ───────────────────────────

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 14) // started 2 weeks ago
  const startStr = startDate.toISOString().slice(0, 10)

  const { data: activePrograms } = await supabase
    .from('programs')
    .insert([
      {
        trainer_id:        trainerId,
        name:              "Alex's Strength Program",
        program_type:      'personal_trainer',
        weeks:             4,
        sessions_per_week: 3,
        visibility:        'trainer_only',
        status:            'active',
        is_template:       false,
        content:           { weeks: makeWeeks(strengthDays, 4) },
      },
      {
        trainer_id:        trainerId,
        name:              "Sam's Rehab Plan",
        program_type:      'physiotherapist',
        weeks:             6,
        sessions_per_week: 3,
        visibility:        'trainer_only',
        status:            'active',
        is_template:       false,
        content:           { weeks: makeWeeks(rehabDays, 6) },
      },
    ])
    .select()

  if (activePrograms?.length === 2) {
    const alexProgId = activePrograms[0].id
    const samProgId  = activePrograms[1].id

    await supabase.from('program_clients').insert([
      { program_id: alexProgId, client_id: alexId, start_date: startStr, status: 'active' },
      { program_id: samProgId,  client_id: samId,  start_date: startStr, status: 'active' },
    ])
  }

  // ── 4. Session logs ──────────────────────────────────────────────────────────

  const d = (daysAgo) => {
    const dt = new Date()
    dt.setDate(dt.getDate() - daysAgo)
    return dt.toISOString()
  }

  await supabase.from('session_logs').insert([
    // Alex — 3 strength sessions
    { trainer_id: trainerId, client_id: alexId, session_category: 'trainer',      session_type: 'strength', duration_minutes: 60, completed_at: d(12), rating: 4, notes: 'Good form on bench press. Increased weight on last set.' },
    { trainer_id: trainerId, client_id: alexId, session_category: 'trainer',      session_type: 'strength', duration_minutes: 60, completed_at: d(9),  rating: 5, notes: 'Excellent session — hit all sets with solid form.' },
    { trainer_id: trainerId, client_id: alexId, session_category: 'independent',  session_type: 'cardio',   duration_minutes: 30, completed_at: d(7),  rating: 3, notes: '5km run, felt a bit tired but pushed through.' },
    // Sam — 2 rehab sessions
    { trainer_id: trainerId, client_id: samId,  session_category: 'trainer',      session_type: 'rehabilitation', duration_minutes: 45, completed_at: d(11), rating: 4, notes: 'Responded well to mobilisation. Reported pain 6/10 → 4/10 by end.' },
    { trainer_id: trainerId, client_id: samId,  session_category: 'trainer',      session_type: 'rehabilitation', duration_minutes: 45, completed_at: d(7),  rating: 4, notes: 'Core stability exercises progressing. Bird dog now pain-free.' },
  ])

  // ── 5. Messages ──────────────────────────────────────────────────────────────

  const ts = (daysAgo, hour = 10) => {
    const dt = new Date()
    dt.setDate(dt.getDate() - daysAgo)
    dt.setHours(hour, 0, 0, 0)
    return dt.toISOString()
  }

  await supabase.from('messages').insert([
    // Alex conversation
    { trainer_id: trainerId, client_id: alexId, sender_type: 'trainer', body: "Hey Alex! Great first week — your form on the bench press is looking solid already.", created_at: ts(10) },
    { trainer_id: trainerId, client_id: alexId, sender_type: 'client', body: "Thanks! Feeling good after that session. My chest is a bit sore today though 😄", created_at: ts(10, 14) },
    { trainer_id: trainerId, client_id: alexId, sender_type: 'trainer', body: "That's the DOMS kicking in — totally normal. Make sure to get enough protein to support recovery.", created_at: ts(10, 15) },
    { trainer_id: trainerId, client_id: alexId, sender_type: 'client', body: "Quick question — can we add more deadlifts next week? I really enjoy those.", created_at: ts(2, 9) },
    // Sam conversation
    { trainer_id: trainerId, client_id: samId, sender_type: 'trainer', body: "Hi Sam, welcome aboard! Looking forward to getting your back feeling better. How did you sleep last night?", created_at: ts(11) },
    { trainer_id: trainerId, client_id: samId, sender_type: 'client', body: "Hi! Slept okay, still a bit stiff in the morning but better than last week.", created_at: ts(11, 11) },
    { trainer_id: trainerId, client_id: samId, sender_type: 'trainer', body: "That's a good sign. Keep doing the morning mobility routine before you get out of bed.", created_at: ts(11, 12) },
    { trainer_id: trainerId, client_id: samId, sender_type: 'client', body: "The exercises are really helping. My back feels much better after the mobility work yesterday!", created_at: ts(1, 16) },
  ])

  // ── 6. Habits ────────────────────────────────────────────────────────────────

  const { data: habits } = await supabase
    .from('habits')
    .insert([
      { trainer_id: trainerId, client_id: alexId, name: 'Daily protein target',    target_frequency: 7 },
      { trainer_id: trainerId, client_id: alexId, name: 'Morning mobility routine', target_frequency: 7 },
      { trainer_id: trainerId, client_id: samId,  name: 'Home exercise program',   target_frequency: 6 },
      { trainer_id: trainerId, client_id: samId,  name: 'Ice/heat therapy',        target_frequency: 7 },
    ])
    .select()

  // Log some habit completions this week (Mon–today)
  if (habits?.length) {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1))

    const habitLogs = []
    for (let i = 0; i < Math.min(Math.ceil((today - monday) / 86400000) + 1, 7); i++) {
      const logDate = new Date(monday)
      logDate.setDate(monday.getDate() + i)
      const dateStr = logDate.toISOString().slice(0, 10)

      // Alex: protein target most days, mobility every day
      if (i < (today - monday) / 86400000) {
        habitLogs.push({ habit_id: habits[0].id, client_id: alexId, completed_date: dateStr })
        habitLogs.push({ habit_id: habits[1].id, client_id: alexId, completed_date: dateStr })
        habitLogs.push({ habit_id: habits[2].id, client_id: samId,  completed_date: dateStr })
        if (i % 2 === 0) {
          habitLogs.push({ habit_id: habits[3].id, client_id: samId, completed_date: dateStr })
        }
      }
    }

    if (habitLogs.length) {
      await supabase.from('habit_logs').insert(habitLogs)
    }
  }

  // ── 7. Goals ─────────────────────────────────────────────────────────────────

  await supabase.from('goals').insert([
    {
      trainer_id:    trainerId,
      client_id:     alexId,
      description:   'Deadlift 120kg',
      target_value:  120,
      current_value: 80,
      unit:          'kg',
    },
    {
      trainer_id:    trainerId,
      client_id:     alexId,
      description:   'Run 5km in under 25 minutes',
      target_value:  25,
      current_value: 28.5,
      unit:          'min',
    },
    {
      trainer_id:    trainerId,
      client_id:     samId,
      description:   'Reduce lower back pain to 0/10',
      target_value:  0,
      current_value: 5,
      unit:          '/10 pain score',
    },
  ])

  // ── 8. Upcoming scheduled sessions ───────────────────────────────────────────

  const future = (daysAhead, time = '09:00') => {
    const dt = new Date()
    dt.setDate(dt.getDate() + daysAhead)
    return { date: dt.toISOString().slice(0, 10), time }
  }

  const f1 = future(2)
  const f2 = future(3)
  const f3 = future(4)
  const f4 = future(5)

  await supabase.from('sessions').insert([
    {
      trainer_id:       trainerId,
      client_id:        alexId,
      scheduled_date:   f1.date,
      start_time:       '07:00',
      duration_minutes: 60,
      session_type:     'Strength',
      is_group_class:   false,
    },
    {
      trainer_id:       trainerId,
      client_id:        samId,
      scheduled_date:   f2.date,
      start_time:       '09:00',
      duration_minutes: 45,
      session_type:     'Rehabilitation',
      is_group_class:   false,
    },
    {
      trainer_id:       trainerId,
      client_id:        alexId,
      scheduled_date:   f3.date,
      start_time:       '07:00',
      duration_minutes: 60,
      session_type:     'Strength',
      is_group_class:   false,
    },
    {
      trainer_id:       trainerId,
      client_id:        samId,
      scheduled_date:   f4.date,
      start_time:       '10:00',
      duration_minutes: 45,
      session_type:     'Rehabilitation',
      is_group_class:   false,
    },
  ])
}
