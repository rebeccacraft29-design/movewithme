// ─── Seed data for new trainers ───────────────────────────────────────────────
// Called once after onboarding completes.
// Creates 2 demo clients, 2 templates, 2 active programs, session logs,
// messages, habits, and goals so the app looks populated from day 1.

import { supabase } from './supabase'

const uid = () => Math.random().toString(36).slice(2, 9)

// ─── Program content builders ─────────────────────────────────────────────────

// 4-Week Strength Foundation
// Progressive overload: W1: 3×8 → W2: 3×10 → W3: 4×8 → W4: 4×10
// Exercises: Squat (ex-1), Deadlift (ex-3), Bench Press (ex-4), Row (ex-5), OHP (ex-6)
function makeStrengthContent() {
  const weekSpecs = [
    { sets: 3, reps: '8' },   // Week 1
    { sets: 3, reps: '10' },  // Week 2
    { sets: 4, reps: '8' },   // Week 3
    { sets: 4, reps: '10' },  // Week 4
  ]

  const coreExercises = [
    { exerciseId: 'ex-1', weight: '60kg', notes: 'Control the descent' },
    { exerciseId: 'ex-3', weight: '80kg', notes: 'Keep back neutral' },
    { exerciseId: 'ex-4', weight: '50kg', notes: 'Touch chest, press up' },
    { exerciseId: 'ex-5', weight: '50kg', notes: 'Retract shoulder blades' },
    { exerciseId: 'ex-6', weight: '35kg', notes: 'Brace core throughout' },
  ]

  const dayDefs = [
    { label: 'Day 1', sessionNotes: 'Focus on form — controlled tempo throughout.' },
    { label: 'Day 2', sessionNotes: 'Rest 2 min between sets on compound lifts.' },
    { label: 'Day 3', sessionNotes: 'Quality over quantity — full range of motion on every rep.' },
  ]

  return {
    weeks: weekSpecs.map((spec, wi) => ({
      id: uid(),
      weekNumber: wi + 1,
      days: dayDefs.map(day => ({
        id: uid(),
        label: day.label,
        sessionNotes: day.sessionNotes,
        exercises: coreExercises.map(ex => ({
          id: uid(),
          exerciseId: ex.exerciseId,
          sets: spec.sets,
          reps: spec.reps,
          weight: ex.weight,
          notes: ex.notes,
        })),
      })),
    })),
  }
}

// 6-Week Mobility & Rehab
// Consistent exercises across 4 sessions/week for 6 weeks
// Exercises: Hip Flexor Stretch (ex-28), Glute Bridge (ex-51), Bird Dog (ex-19),
//            Dead Bug (ex-18), Cat-Cow (ex-29), Thoracic Rotation (ex-30)
function makeMobilityContent() {
  const coreExercises = [
    { exerciseId: 'ex-28', sets: 3, reps: '30s', weight: '', notes: 'Each side — breathe deeply' },
    { exerciseId: 'ex-51', sets: 3, reps: '15',  weight: '', notes: 'Press through heels, squeeze glutes' },
    { exerciseId: 'ex-19', sets: 3, reps: '10',  weight: '', notes: 'Each side, slow and controlled' },
    { exerciseId: 'ex-18', sets: 3, reps: '10',  weight: '', notes: 'Exhale on extension' },
    { exerciseId: 'ex-29', sets: 3, reps: '12',  weight: '', notes: 'Smooth, flowing movement' },
    { exerciseId: 'ex-30', sets: 3, reps: '8',   weight: '', notes: 'Each side, pain-free range only' },
  ]

  const dayDefs = [
    { label: 'Session 1', sessionNotes: 'Move slowly and breathe through each stretch.' },
    { label: 'Session 2', sessionNotes: 'Focus on spinal decompression and hip opening.' },
    { label: 'Session 3', sessionNotes: 'Engage core gently throughout — no breath holding.' },
    { label: 'Session 4', sessionNotes: 'Recovery session — listen to your body.' },
  ]

  return {
    weeks: Array.from({ length: 6 }, (_, wi) => ({
      id: uid(),
      weekNumber: wi + 1,
      days: dayDefs.map(day => ({
        id: uid(),
        label: day.label,
        sessionNotes: day.sessionNotes,
        exercises: coreExercises.map(ex => ({
          id: uid(),
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          notes: ex.notes,
        })),
      })),
    })),
  }
}

// ─── Main seed function ───────────────────────────────────────────────────────

export async function seedTrainerData(trainerId) {
  // ── 1. Demo clients ───────────────────────────────────────────────────────────

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
        trainer_id:     trainerId,
        first_name:     'Sam',
        last_name:      'Rivera',
        email:          'sam.rivera@example.com',
        service_type:   'physiotherapist',
        status:         'active',
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

  // ── 2. Program templates ──────────────────────────────────────────────────────

  await supabase
    .from('programs')
    .insert([
      {
        trainer_id:           trainerId,
        name:                 '4-Week Strength Foundation',
        program_type:         'personal_trainer',
        weeks:                4,
        sessions_per_week:    3,
        visibility:           'trainer_only',
        status:               'template',
        is_template:          true,
        template_name:        '4-Week Strength Foundation',
        template_description: 'Progressive 4-week full-body strength program using the big five lifts: Squat, Deadlift, Bench Press, Row, and Overhead Press. Volume increases each week (W1: 3×8, W2: 3×10, W3: 4×8, W4: 4×10).',
        content:              makeStrengthContent(),
      },
      {
        trainer_id:           trainerId,
        name:                 '6-Week Mobility & Rehab',
        program_type:         'physiotherapist',
        weeks:                6,
        sessions_per_week:    4,
        visibility:           'trainer_only',
        status:               'template',
        is_template:          true,
        template_name:        '6-Week Mobility & Rehab',
        template_description: 'Six-week mobility and rehabilitation program — four sessions per week targeting the hips, spine, and core. Uses gentle, evidence-based movements suitable for injury recovery and prevention.',
        content:              makeMobilityContent(),
      },
    ])

  // ── 3. Active programs assigned to clients ────────────────────────────────────

  // Alex on week 3: started 18 days ago → Math.ceil(18/7) = 3
  const alexStartStr = (() => {
    const d = new Date(); d.setDate(d.getDate() - 18); return d.toISOString().slice(0, 10)
  })()

  // Sam on week 2: started 10 days ago → Math.ceil(10/7) = 2
  const samStartStr = (() => {
    const d = new Date(); d.setDate(d.getDate() - 10); return d.toISOString().slice(0, 10)
  })()

  const { data: activePrograms } = await supabase
    .from('programs')
    .insert([
      {
        trainer_id:        trainerId,
        name:              "Alex's 4-Week Strength Foundation",
        program_type:      'personal_trainer',
        weeks:             4,
        sessions_per_week: 3,
        visibility:        'trainer_only',
        status:            'active',
        is_template:       false,
        content:           makeStrengthContent(),
      },
      {
        trainer_id:        trainerId,
        name:              "Sam's Mobility & Rehab Program",
        program_type:      'physiotherapist',
        weeks:             6,
        sessions_per_week: 4,
        visibility:        'trainer_only',
        status:            'active',
        is_template:       false,
        content:           makeMobilityContent(),
      },
    ])
    .select()

  if (activePrograms?.length === 2) {
    await supabase.from('program_clients').insert([
      { program_id: activePrograms[0].id, client_id: alexId, start_date: alexStartStr, status: 'active' },
      { program_id: activePrograms[1].id, client_id: samId,  start_date: samStartStr,  status: 'active' },
    ])
  }

  // ── 4. Session logs ───────────────────────────────────────────────────────────

  const d = (daysAgo) => {
    const dt = new Date(); dt.setDate(dt.getDate() - daysAgo); return dt.toISOString()
  }

  await supabase.from('session_logs').insert([
    // Alex — Week 1 (3/3 sessions, avg 4★)
    { trainer_id: trainerId, client_id: alexId, session_category: 'trainer', session_type: 'strength', duration_minutes: 60, completed_at: d(18), rating: 4, notes: 'Solid first session. Great form on squats at 60kg.' },
    { trainer_id: trainerId, client_id: alexId, session_category: 'trainer', session_type: 'strength', duration_minutes: 60, completed_at: d(16), rating: 4, notes: 'Pushed the deadlift to 85kg — above prescribed, excellent control.' },
    { trainer_id: trainerId, client_id: alexId, session_category: 'trainer', session_type: 'strength', duration_minutes: 60, completed_at: d(14), rating: 4, notes: 'All sets completed. Bench press form improving.' },
    // Alex — Week 2 (3/3 sessions, avg 4★)
    { trainer_id: trainerId, client_id: alexId, session_category: 'trainer', session_type: 'strength', duration_minutes: 60, completed_at: d(11), rating: 4, notes: 'Squats at 65kg — heavier than prescribed, excellent control.' },
    { trainer_id: trainerId, client_id: alexId, session_category: 'trainer', session_type: 'strength', duration_minutes: 60, completed_at: d(9),  rating: 5, notes: 'Best session yet. Deadlift up to 90kg — well above prescribed.' },
    { trainer_id: trainerId, client_id: alexId, session_category: 'trainer', session_type: 'strength', duration_minutes: 60, completed_at: d(7),  rating: 4, notes: 'Stayed at prescribed weights for upper body. Great volume session.' },
    // Alex — Week 3 (2/3 sessions = ~60% done)
    { trainer_id: trainerId, client_id: alexId, session_category: 'trainer', session_type: 'strength', duration_minutes: 60, completed_at: d(4),  rating: 4, notes: 'First 4×8 week. Squat 67kg, deadlift 92kg — maintaining heavier loads.' },
    { trainer_id: trainerId, client_id: alexId, session_category: 'trainer', session_type: 'strength', duration_minutes: 60, completed_at: d(2),  rating: 4, notes: 'Strong week 3 session. Upper body holding at new volume.' },

    // Sam — Week 1 (4/4 sessions, avg 3★)
    { trainer_id: trainerId, client_id: samId, session_category: 'trainer', session_type: 'rehabilitation', duration_minutes: 45, completed_at: d(10), rating: 3, notes: 'First session. Stiffness present but all exercises completed pain-free.' },
    { trainer_id: trainerId, client_id: samId, session_category: 'trainer', session_type: 'rehabilitation', duration_minutes: 45, completed_at: d(8),  rating: 3, notes: 'Hip flexor stretch improving. Bird dog controlled and pain-free.' },
    { trainer_id: trainerId, client_id: samId, session_category: 'trainer', session_type: 'rehabilitation', duration_minutes: 45, completed_at: d(6),  rating: 4, notes: 'Noticeable improvement in thoracic rotation. Reported pain 3/10.' },
    { trainer_id: trainerId, client_id: samId, session_category: 'trainer', session_type: 'rehabilitation', duration_minutes: 45, completed_at: d(4),  rating: 3, notes: 'Week 1 complete. Glute bridge comfortable across all 3 sets.' },
    // Sam — Week 2 (2/4 sessions = 50% done)
    { trainer_id: trainerId, client_id: samId, session_category: 'trainer', session_type: 'rehabilitation', duration_minutes: 45, completed_at: d(2),  rating: 3, notes: 'Cat-cow much smoother. Core engagement improving each session.' },
    { trainer_id: trainerId, client_id: samId, session_category: 'trainer', session_type: 'rehabilitation', duration_minutes: 45, completed_at: d(1),  rating: 3, notes: 'Dead bug progressing well. Reporting less morning stiffness.' },
  ])

  // ── 5. Messages ───────────────────────────────────────────────────────────────

  const ts = (daysAgo, hour = 10) => {
    const dt = new Date(); dt.setDate(dt.getDate() - daysAgo); dt.setHours(hour, 0, 0, 0)
    return dt.toISOString()
  }

  await supabase.from('messages').insert([
    // Alex conversation (latest from Alex is recent — shows in Messages)
    { trainer_id: trainerId, client_id: alexId, sender_type: 'trainer', body: "Hey Alex! Great first week — your form on squats and deadlifts is already looking strong.", created_at: ts(17) },
    { trainer_id: trainerId, client_id: alexId, sender_type: 'client', body: "Thanks! I really enjoyed the program. Legs are definitely feeling it today 😄", created_at: ts(17, 14) },
    { trainer_id: trainerId, client_id: alexId, sender_type: 'trainer', body: "That's the DOMS from the compound lifts — totally normal. Keep hitting that protein target.", created_at: ts(17, 15) },
    { trainer_id: trainerId, client_id: alexId, sender_type: 'client', body: "I've been going a bit heavier on the squats and deadlifts — hope that's okay? Felt really good!", created_at: ts(3, 9) },
    // Sam conversation (latest from Sam is very recent)
    { trainer_id: trainerId, client_id: samId, sender_type: 'trainer', body: "Hi Sam, welcome! Really looking forward to helping with your recovery. How's the morning stiffness at the moment?", created_at: ts(10) },
    { trainer_id: trainerId, client_id: samId, sender_type: 'client', body: "Hi! Still a bit stiff in the mornings but slowly improving. The hip stretches yesterday really helped.", created_at: ts(10, 12) },
    { trainer_id: trainerId, client_id: samId, sender_type: 'trainer', body: "Great to hear! Keep doing the routine before getting out of bed — it makes a real difference.", created_at: ts(10, 13) },
    { trainer_id: trainerId, client_id: samId, sender_type: 'client', body: "The exercises are really helping! Doing my morning stretch every day and my back feels so much better.", created_at: ts(1, 8) },
  ])

  // ── 6. Habits ─────────────────────────────────────────────────────────────────

  const { data: habits } = await supabase
    .from('habits')
    .insert([
      { trainer_id: trainerId, client_id: alexId, name: 'Drink 2L water daily',     target_frequency: 7 },
      { trainer_id: trainerId, client_id: samId,  name: '10 minute morning stretch', target_frequency: 7 },
    ])
    .select()

  // Alex: 5 of last 7 days completed (skip days 2 and 5 ago)
  // Sam:  6 of last 7 days completed (skip day 4 ago)
  if (habits?.length === 2) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const alexSkip = new Set([2, 5])
    const samSkip  = new Set([4])
    const habitLogs = []

    for (let i = 6; i >= 0; i--) {
      const dt = new Date(today); dt.setDate(today.getDate() - i)
      const dateStr = dt.toISOString().slice(0, 10)
      if (!alexSkip.has(i)) habitLogs.push({ habit_id: habits[0].id, client_id: alexId, completed_date: dateStr })
      if (!samSkip.has(i))  habitLogs.push({ habit_id: habits[1].id, client_id: samId,  completed_date: dateStr })
    }

    if (habitLogs.length) await supabase.from('habit_logs').insert(habitLogs)
  }

  // ── 7. Goals ──────────────────────────────────────────────────────────────────

  await supabase.from('goals').insert([
    {
      trainer_id:    trainerId,
      client_id:     alexId,
      description:   'Deadlift 120kg',
      target_value:  120,
      current_value: 92,
      unit:          'kg',
    },
    {
      trainer_id:    trainerId,
      client_id:     samId,
      description:   'Reduce lower back pain to 0/10',
      target_value:  0,
      current_value: 3,
      unit:          '/10 pain score',
    },
  ])

  // ── 8. Upcoming scheduled sessions ───────────────────────────────────────────

  const future = (daysAhead) => {
    const dt = new Date(); dt.setDate(dt.getDate() + daysAhead); return dt.toISOString().slice(0, 10)
  }

  await supabase.from('sessions').insert([
    // Alex — week 3 session 3 (next), then week 4 session 1
    { trainer_id: trainerId, client_id: alexId, scheduled_date: future(1), start_time: '07:00', duration_minutes: 60, session_type: 'Strength',       is_group_class: false },
    { trainer_id: trainerId, client_id: alexId, scheduled_date: future(4), start_time: '07:00', duration_minutes: 60, session_type: 'Strength',       is_group_class: false },
    // Sam — week 2 sessions 3 and 4
    { trainer_id: trainerId, client_id: samId,  scheduled_date: future(2), start_time: '09:00', duration_minutes: 45, session_type: 'Rehabilitation', is_group_class: false },
    { trainer_id: trainerId, client_id: samId,  scheduled_date: future(3), start_time: '09:00', duration_minutes: 45, session_type: 'Rehabilitation', is_group_class: false },
  ])
}
