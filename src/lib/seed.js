// ─── Seed data for new trainers ───────────────────────────────────────────────
// Called once after onboarding completes.
// Role-aware: generates 2 demo clients, 2 templates, and matching session data
// based on the trainer's primary professional role.

import { supabase } from './supabase'

const uid = () => Math.random().toString(36).slice(2, 9)

// ─── Program content builders ─────────────────────────────────────────────────

// Strength: squat, deadlift, bench, row, OHP — progressive overload
function makeStrengthContent(totalWeeks = 4) {
  const weekSpecs = [
    { sets: 3, reps: '8' },
    { sets: 3, reps: '10' },
    { sets: 4, reps: '8' },
    { sets: 4, reps: '10' },
  ].slice(0, totalWeeks)

  const exercises = [
    { exerciseId: 'ex-1',  weight: '60kg', notes: 'Control the descent' },
    { exerciseId: 'ex-3',  weight: '80kg', notes: 'Keep back neutral' },
    { exerciseId: 'ex-4',  weight: '50kg', notes: 'Touch chest, press up' },
    { exerciseId: 'ex-5',  weight: '50kg', notes: 'Retract shoulder blades' },
    { exerciseId: 'ex-6',  weight: '35kg', notes: 'Brace core throughout' },
  ]
  const days = [
    { label: 'Day 1', sessionNotes: 'Focus on form — controlled tempo throughout.' },
    { label: 'Day 2', sessionNotes: 'Rest 2 min between sets on compound lifts.' },
    { label: 'Day 3', sessionNotes: 'Quality over quantity — full range of motion.' },
  ]
  return {
    weeks: weekSpecs.map((spec, wi) => ({
      id: uid(), weekNumber: wi + 1,
      days: days.map(day => ({
        id: uid(), label: day.label, sessionNotes: day.sessionNotes,
        exercises: exercises.map(ex => ({ id: uid(), ...ex, sets: spec.sets, reps: spec.reps })),
      })),
    })),
  }
}

// Body composition: functional + conditioning circuit, 8 weeks
function makeBodyCompositionContent() {
  const exercises = [
    { exerciseId: 'ex-51', sets: 3, reps: '15', weight: '',      notes: 'Drive hips up fully' },
    { exerciseId: 'ex-1',  sets: 3, reps: '12', weight: 'bw',    notes: 'Jump squat option' },
    { exerciseId: 'ex-18', sets: 3, reps: '10', weight: '',      notes: 'Slow and controlled' },
    { exerciseId: 'ex-19', sets: 3, reps: '10', weight: '',      notes: 'Each side' },
    { exerciseId: 'ex-5',  sets: 3, reps: '12', weight: '30kg',  notes: 'Full retraction at top' },
  ]
  const days = [
    { label: 'Session 1', sessionNotes: 'Aerobic base — maintain conversational pace.' },
    { label: 'Session 2', sessionNotes: 'Strength circuit — 45 s rest between rounds.' },
    { label: 'Session 3', sessionNotes: 'Mixed cardio + resistance, higher intensity.' },
  ]
  return {
    weeks: Array.from({ length: 8 }, (_, wi) => ({
      id: uid(), weekNumber: wi + 1,
      days: days.map(day => ({
        id: uid(), label: day.label, sessionNotes: day.sessionNotes,
        exercises: exercises.map(ex => ({ id: uid(), ...ex })),
      })),
    })),
  }
}

// Post-injury rehab: hip + spine + core
function makePostInjuryRehabContent() {
  const exercises = [
    { exerciseId: 'ex-28', sets: 3, reps: '30s', weight: '', notes: 'Each side — breathe deeply' },
    { exerciseId: 'ex-51', sets: 3, reps: '15',  weight: '', notes: 'Press through heels' },
    { exerciseId: 'ex-19', sets: 3, reps: '10',  weight: '', notes: 'Each side, slow and controlled' },
    { exerciseId: 'ex-18', sets: 3, reps: '10',  weight: '', notes: 'Exhale on extension' },
    { exerciseId: 'ex-29', sets: 3, reps: '12',  weight: '', notes: 'Smooth, flowing movement' },
    { exerciseId: 'ex-30', sets: 3, reps: '8',   weight: '', notes: 'Pain-free range only' },
  ]
  const days = [
    { label: 'Session 1', sessionNotes: 'Move slowly and breathe through each exercise.' },
    { label: 'Session 2', sessionNotes: 'Focus on quality of movement over quantity.' },
    { label: 'Session 3', sessionNotes: 'Listen to your body — stop if pain increases.' },
  ]
  return {
    weeks: Array.from({ length: 6 }, (_, wi) => ({
      id: uid(), weekNumber: wi + 1,
      days: days.map(day => ({
        id: uid(), label: day.label, sessionNotes: day.sessionNotes,
        exercises: exercises.map(ex => ({ id: uid(), ...ex })),
      })),
    })),
  }
}

// Home exercise program (HEP): simple, low-equipment
function makeHEPContent() {
  const exercises = [
    { exerciseId: 'ex-29', sets: 2, reps: '10',  weight: '', notes: 'Morning routine — before getting up' },
    { exerciseId: 'ex-30', sets: 2, reps: '8',   weight: '', notes: 'Each side' },
    { exerciseId: 'ex-28', sets: 2, reps: '30s', weight: '', notes: 'Hold gently — no forcing' },
    { exerciseId: 'ex-51', sets: 2, reps: '12',  weight: '', notes: 'Slow and controlled' },
    { exerciseId: 'ex-19', sets: 2, reps: '8',   weight: '', notes: 'Each side' },
  ]
  const days = [
    { label: 'Morning', sessionNotes: 'Complete before breakfast — sets the tone for the day.' },
    { label: 'Evening', sessionNotes: 'Wind-down routine — gentle, relaxed pace.' },
  ]
  return {
    weeks: Array.from({ length: 4 }, (_, wi) => ({
      id: uid(), weekNumber: wi + 1,
      days: days.map(day => ({
        id: uid(), label: day.label, sessionNotes: day.sessionNotes,
        exercises: exercises.map(ex => ({ id: uid(), ...ex })),
      })),
    })),
  }
}

// Spinal mobility: chiro cervical/thoracic/lumbar program
function makeSpinalMobilityContent() {
  const exercises = [
    { exerciseId: 'ex-29', sets: 3, reps: '12',  weight: '', notes: 'Segmental movement — vertebra by vertebra' },
    { exerciseId: 'ex-30', sets: 3, reps: '10',  weight: '', notes: 'Each side, controlled rotation' },
    { exerciseId: 'ex-19', sets: 3, reps: '10',  weight: '', notes: 'Each side — stabilise lumbar' },
    { exerciseId: 'ex-18', sets: 3, reps: '8',   weight: '', notes: 'Protect low back throughout' },
    { exerciseId: 'ex-51', sets: 3, reps: '15',  weight: '', notes: 'Activate gluteals' },
    { exerciseId: 'ex-28', sets: 3, reps: '30s', weight: '', notes: 'Each side, gentle traction' },
  ]
  const days = [
    { label: 'Session 1', sessionNotes: 'Spinal decompression focus.' },
    { label: 'Session 2', sessionNotes: 'Rotation and thoracic mobility.' },
    { label: 'Session 3', sessionNotes: 'Stabilisation and strengthening.' },
  ]
  return {
    weeks: Array.from({ length: 6 }, (_, wi) => ({
      id: uid(), weekNumber: wi + 1,
      days: days.map(day => ({
        id: uid(), label: day.label, sessionNotes: day.sessionNotes,
        exercises: exercises.map(ex => ({ id: uid(), ...ex })),
      })),
    })),
  }
}

// Postural correction: chiro forward-head posture / rounded shoulders
function makePosturalCorrectionContent() {
  const exercises = [
    { exerciseId: 'ex-30', sets: 3, reps: '10',  weight: '',      notes: 'Retract chin before rotating' },
    { exerciseId: 'ex-19', sets: 3, reps: '10',  weight: '',      notes: 'Maintain neutral pelvis' },
    { exerciseId: 'ex-5',  sets: 3, reps: '12',  weight: '20kg',  notes: 'Squeeze shoulder blades' },
    { exerciseId: 'ex-6',  sets: 3, reps: '10',  weight: '15kg',  notes: 'Brace core before pressing' },
    { exerciseId: 'ex-18', sets: 3, reps: '8',   weight: '',      notes: 'Breathe throughout' },
  ]
  const days = [
    { label: 'Session 1', sessionNotes: 'Postural awareness drills.' },
    { label: 'Session 2', sessionNotes: 'Strengthen weak postural muscles.' },
    { label: 'Session 3', sessionNotes: 'Integration — combine mobility + strength.' },
  ]
  return {
    weeks: Array.from({ length: 4 }, (_, wi) => ({
      id: uid(), weekNumber: wi + 1,
      days: days.map(day => ({
        id: uid(), label: day.label, sessionNotes: day.sessionNotes,
        exercises: exercises.map(ex => ({ id: uid(), ...ex })),
      })),
    })),
  }
}

// Pre/post event recovery (massage)
function makeEventRecoveryContent() {
  const exercises = [
    { exerciseId: 'ex-28', sets: 2, reps: '60s', weight: '', notes: 'Each side — long, passive hold' },
    { exerciseId: 'ex-29', sets: 2, reps: '15',  weight: '', notes: 'Pre-event: dynamic. Post-event: slow.' },
    { exerciseId: 'ex-30', sets: 2, reps: '8',   weight: '', notes: 'Each side' },
    { exerciseId: 'ex-51', sets: 2, reps: '12',  weight: '', notes: 'Activate and release' },
    { exerciseId: 'ex-19', sets: 2, reps: '8',   weight: '', notes: 'Each side' },
  ]
  const days = [
    { label: 'Pre-Event',  sessionNotes: 'Dynamic warm-up — 24–48 hours before event.' },
    { label: 'Post-Event', sessionNotes: 'Flush and recovery — within 24 hours after.' },
  ]
  return {
    weeks: Array.from({ length: 4 }, (_, wi) => ({
      id: uid(), weekNumber: wi + 1,
      days: days.map(day => ({
        id: uid(), label: day.label, sessionNotes: day.sessionNotes,
        exercises: exercises.map(ex => ({ id: uid(), ...ex })),
      })),
    })),
  }
}

// Chronic tension relief (massage): neck, shoulders, upper back
function makeChronicTensionContent() {
  const exercises = [
    { exerciseId: 'ex-30', sets: 3, reps: '10',  weight: '', notes: 'Each side — slow, pain-free range' },
    { exerciseId: 'ex-29', sets: 3, reps: '12',  weight: '', notes: 'Release upper back tension' },
    { exerciseId: 'ex-28', sets: 3, reps: '60s', weight: '', notes: 'Each side — sustained hold' },
    { exerciseId: 'ex-18', sets: 3, reps: '8',   weight: '', notes: 'Activate deep core' },
    { exerciseId: 'ex-19', sets: 3, reps: '8',   weight: '', notes: 'Each side' },
  ]
  const days = [
    { label: 'Session 1', sessionNotes: 'Focus on breath and tissue release.' },
    { label: 'Session 2', sessionNotes: 'Self-massage techniques + movement.' },
    { label: 'Session 3', sessionNotes: 'Progressive tissue loading.' },
  ]
  return {
    weeks: Array.from({ length: 6 }, (_, wi) => ({
      id: uid(), weekNumber: wi + 1,
      days: days.map(day => ({
        id: uid(), label: day.label, sessionNotes: day.sessionNotes,
        exercises: exercises.map(ex => ({ id: uid(), ...ex })),
      })),
    })),
  }
}

// ─── Role config ──────────────────────────────────────────────────────────────
// Returns everything needed to seed a new account for a given role.

function getRoleConfig(role) {
  switch (role) {

    case 'physiotherapist':
      return {
        alex: {
          serviceType:      'physiotherapist',
          healthContext:    'Previous knee surgery (2024)\nACL reconstruction — cleared for progressive rehab',
          programName:      "Alex's Post-Injury Rehab",
          programType:      'physiotherapist',
          startDaysAgo:     10,                 // week 2
          sessionDaysAgo:   [10, 8, 6, 3, 2, 1],
          sessionType:      'rehabilitation',
          sessionDuration:  45,
          sessionNotes: [
            'First session. Assessed ROM — 110°. All exercises completed pain-free.',
            'Hip flexor stretch progressing. Reported 3/10 discomfort.',
            'Improved quad activation. ROM now 118°.',
            'Week 1 complete. Compliance excellent.',
            'Week 2 begun. Progressing to closed-chain exercises.',
            'Good proprioception responses. ROM 122°.',
          ],
          habit: '10-min icing + elevation protocol',
          goal:  { description: 'Restore full knee ROM (135°)', targetValue: 135, currentValue: 122, unit: '°' },
        },
        sam: {
          serviceType:     'physiotherapist',
          healthContext:   'Chronic lower back pain — postural (desk worker)\nL4-L5 disc bulge, cleared for conservative management',
          programName:     "Sam's Home Exercise Program",
          programType:     'physiotherapist',
          startDaysAgo:    3,                   // week 1
          sessionDaysAgo:  [3, 2, 1],
          sessionType:     'rehabilitation',
          sessionDuration: 45,
          sessionNotes: [
            'Initial assessment. Cat-cow and dead bug performed well.',
            'Reported morning stiffness 5/10. All exercises completed.',
            'Hip flexor stretch much easier today.',
          ],
          habit: 'Hourly desk standing breaks (5 min)',
          goal:  { description: 'Pain-free sitting for 8 hours', targetValue: 8, currentValue: 3, unit: 'hours' },
        },
        templates: [
          {
            name: '6-Week Post-Injury Rehab', programType: 'physiotherapist',
            weeks: 6, sessionsPerWeek: 3,
            description: 'Progressive 6-week rehabilitation program for post-injury recovery. Evidence-based movements targeting joint mobility, muscle activation, and functional strength. Suitable for ACL, meniscus, and hip surgery recovery.',
            content: makePostInjuryRehabContent(),
          },
          {
            name: '4-Week Mobility Recovery', programType: 'physiotherapist',
            weeks: 4, sessionsPerWeek: 2,
            description: '4-week home exercise program for mobility and pain management. Low-load, high-frequency approach using cat-cow, bird dog, hip flexor stretching, and core stabilisation.',
            content: makeHEPContent(),
          },
        ],
        messages: {
          trainerOpen:      "Hi Alex! Welcome to your rehab program. I've reviewed your surgical notes — you're a great candidate for progressive loading. How's the swelling been this week?",
          clientReply1:     "Hi! Swelling has reduced a lot since last week. The icing protocol has really helped. Feeling more confident already.",
          trainerFollowup:  "That's great progress! Consistency with the icing is key at this stage. Keep it up and we'll start loading more next week.",
          alexRecent:       "ROM felt noticeably better in today's session. I could actually squat down to pick something up without pain for the first time!",
          samOpen:          "Hi Sam, welcome! I've looked at your assessment notes. Let's take things nice and easy this week — the goal is to find pain-free movement and build from there.",
          samReply:         "Thanks! I was a bit nervous but the exercises weren't as uncomfortable as I expected. The morning stretches have been a game changer.",
          samTrainerReply:  "That's exactly what we want to hear. Consistency with the home program is everything — even 10 minutes in the morning makes a huge difference.",
          samRecent:        "The exercises are really helping! Sitting at my desk doesn't feel as tight now. Down to about 4/10 discomfort by end of day.",
        },
        scheduleTypes:    { alexType: 'Rehabilitation', samType: 'Rehabilitation' },
        scheduleDurations: { alexDuration: 45, samDuration: 45 },
      }

    case 'chiropractor':
      return {
        alex: {
          serviceType:     'chiropractor',
          healthContext:   'Cervical spine tension — forward head posture\nOffice worker, 8+ hours/day at desk. Referred upper back pain.',
          programName:     "Alex's Spinal Mobility Program",
          programType:     'chiropractor',
          startDaysAgo:    10,
          sessionDaysAgo:  [10, 8, 6, 3, 2, 1],
          sessionType:     'chiropractic',
          sessionDuration: 30,
          sessionNotes: [
            'Initial assessment. Cervical ROM restricted. Started spinal mobility protocol.',
            'Chin tucks improving. Neck pain 5/10, down from 7.',
            'Thoracic rotation significantly improved. Home exercise compliance excellent.',
            'Week 1 complete. Pain now 4/10.',
            'Week 2: adding loaded scapular retraction.',
            'Posture notably improved. Forward head posture reducing.',
          ],
          habit: 'Chin tucks x10 every hour at desk',
          goal:  { description: 'Reduce neck pain to 0/10', targetValue: 0, currentValue: 4, unit: '/10 pain score' },
        },
        sam: {
          serviceType:     'chiropractor',
          healthContext:   'Lumbar tension — sedentary lifestyle\nNew patient, lower back stiffness and hip tightness.',
          programName:     "Sam's Postural Correction Protocol",
          programType:     'chiropractor',
          startDaysAgo:    3,
          sessionDaysAgo:  [3, 2, 1],
          sessionType:     'chiropractic',
          sessionDuration: 30,
          sessionNotes: [
            'Initial intake. Thoracic kyphosis noted. Began postural correction protocol.',
            'Responded well to soft tissue work and corrective exercises.',
            'Reports improved awareness of posture at desk.',
          ],
          habit: 'Thoracic extension over foam roller (2 min AM/PM)',
          goal:  { description: 'Correct forward head posture', targetValue: 0, currentValue: 4, unit: 'cm forward head offset' },
        },
        templates: [
          {
            name: 'Spinal Mobility Program', programType: 'chiropractor',
            weeks: 6, sessionsPerWeek: 3,
            description: '6-week spinal mobility program targeting cervical, thoracic, and lumbar regions. Combines corrective exercises, joint mobilisation, and postural retraining for desk-bound patients.',
            content: makeSpinalMobilityContent(),
          },
          {
            name: 'Postural Correction Protocol', programType: 'chiropractor',
            weeks: 4, sessionsPerWeek: 3,
            description: '4-week postural correction program addressing forward head posture, rounded shoulders, and anterior pelvic tilt. Evidence-based corrective exercises with home care instructions.',
            content: makePosturalCorrectionContent(),
          },
        ],
        messages: {
          trainerOpen:      "Hi Alex! Great first session today. Your thoracic mobility is a key focus — the exercises I've prescribed specifically address that forward head posture. How's the neck feeling?",
          clientReply1:     "Feeling a bit achy but better than yesterday! The chin tucks are surprisingly challenging — I had no idea how much tension I was holding there.",
          trainerFollowup:  "Totally normal — those muscles haven't been activated properly in a while. Should ease off in 2–3 days.",
          alexRecent:       "The hourly reminders have been a game changer. My neck pain went from 7/10 to 4/10 in under two weeks. Really noticing the difference!",
          samOpen:          "Hi Sam, welcome to the practice! Based on your intake, I'd like to focus on releasing the thoracic spine before we work on the lumbar. Sound good?",
          samReply:         "That makes sense! I've had this upper back stiffness for years. Looking forward to finally addressing it properly.",
          samTrainerReply:  "Perfect — that's the right mindset. We'll have you feeling much more comfortable within a few weeks.",
          samRecent:        "I caught myself sitting up straight at my desk today without even thinking about it! The postural drills are starting to become second nature.",
        },
        scheduleTypes:    { alexType: 'Chiropractic', samType: 'Chiropractic' },
        scheduleDurations: { alexDuration: 30, samDuration: 30 },
      }

    case 'massage_therapist':
      return {
        alex: {
          serviceType:     'massage_therapist',
          healthContext:   'Marathon training — 80 km/week\nChronically tight hamstrings, calves, and IT band. No current injuries.',
          programName:     "Alex's Pre/Post Event Recovery Plan",
          programType:     'massage_therapist',
          startDaysAgo:    10,
          sessionDaysAgo:  [10, 7, 4, 2, 1],
          sessionType:     'massage',
          sessionDuration: 60,
          sessionNotes: [
            'Deep tissue massage — lower limbs. Significant trigger points in hamstrings.',
            'Post-race recovery session. Flushing massage. Client reported 8/10 fatigue.',
            'Good response to treatment. Calf tightness reduced significantly.',
            'Week 2: pre-race flush massage. Client running a half marathon Sunday.',
            'Post half-marathon recovery. Light effleurage — general fatigue present.',
          ],
          habit: '15-min post-run stretching protocol',
          goal:  { description: 'Reduce hamstring tension score', targetValue: 2, currentValue: 6, unit: '/10 tension' },
        },
        sam: {
          serviceType:     'massage_therapist',
          healthContext:   'Desk worker — chronic shoulder and neck tension\nHolding pattern from stress and poor ergonomics.',
          programName:     "Sam's Chronic Tension Relief Program",
          programType:     'massage_therapist',
          startDaysAgo:    3,
          sessionDaysAgo:  [3, 2, 1],
          sessionType:     'massage',
          sessionDuration: 60,
          sessionNotes: [
            'Initial treatment. Upper trapezius and levator scapulae extremely tense.',
            'Good response to myofascial release. Tension 7/10, down from 9.',
            'Continuing upper body work. Introduced self-care stretches.',
          ],
          habit: 'Neck rolls + shoulder drops x5 every 2 hours',
          goal:  { description: 'Reduce shoulder tension score', targetValue: 2, currentValue: 7, unit: '/10 tension' },
        },
        templates: [
          {
            name: 'Pre/Post Event Recovery', programType: 'massage_therapist',
            weeks: 4, sessionsPerWeek: 2,
            description: 'Structured 4-week recovery program for athletes around competition events. Alternates between pre-event preparation (dynamic, lighter pressure) and post-event recovery (deeper, flushing) protocols.',
            content: makeEventRecoveryContent(),
          },
          {
            name: 'Chronic Tension Relief Program', programType: 'massage_therapist',
            weeks: 6, sessionsPerWeek: 2,
            description: '6-week massage and self-care program for chronic muscle tension. Targets the upper back, neck, and shoulders with progressive soft tissue work and home stretching protocols.',
            content: makeChronicTensionContent(),
          },
        ],
        messages: {
          trainerOpen:      "Hi Alex! After today's session I can really feel how tight your hamstrings and IT band are — classic marathon training pattern. Make sure you're doing the stretching protocol I sent through after every run.",
          clientReply1:     "Will do! That was honestly the best I've felt in weeks. My legs have been so heavy lately — this is exactly what I needed.",
          trainerFollowup:  "Glad it helped! Consistency is key. Let's book your pre-race session for the week before your half marathon.",
          alexRecent:       "Just finished the half — PB by 4 minutes! Can I book a recovery session ASAP? My calves are absolutely cooked.",
          samOpen:          "Hi Sam, welcome! Your intake notes mention chronic neck and shoulder tension — very common for desk workers. Today we'll focus on releasing the upper traps and levator scapulae.",
          samReply:         "Oh yes please! I've been carrying so much tension in my neck and shoulders for months. Really looking forward to some relief.",
          samTrainerReply:  "We'll get there! The key is also addressing the cause — I'll show you some simple stretches you can do at your desk.",
          samRecent:        "I did the neck rolls you showed me every 2 hours yesterday and my tension was noticeably better by end of day. Such a small thing but it really helps!",
        },
        scheduleTypes:    { alexType: 'Massage', samType: 'Massage' },
        scheduleDurations: { alexDuration: 60, samDuration: 60 },
      }

    default: // personal_trainer (also covers nutritionist / other)
      return {
        alex: {
          serviceType:     'personal_trainer',
          healthContext:   null,
          programName:     "Alex's 4-Week Strength Foundation",
          programType:     'personal_trainer',
          startDaysAgo:    18,                  // week 3
          sessionDaysAgo:  [18, 16, 14, 11, 9, 7, 4, 2],
          sessionType:     'strength',
          sessionDuration: 60,
          sessionNotes: [
            'Solid first session. Great form on squats at 60kg.',
            'Pushed the deadlift to 85kg — above prescribed. Excellent control.',
            'All sets completed. Bench press form improving.',
            'Squats at 65kg — heavier than prescribed, excellent control.',
            'Best session yet. Deadlift up to 90kg — well above prescribed.',
            'Stayed at prescribed weights for upper body. Great volume session.',
            'First 4×8 week. Squat 67kg, deadlift 92kg — maintaining heavier loads.',
            'Strong week 3 session. Upper body holding at new volume.',
          ],
          habit: 'Drink 2L water daily',
          goal:  { description: 'Deadlift 120kg', targetValue: 120, currentValue: 92, unit: 'kg' },
        },
        sam: {
          serviceType:     'personal_trainer',
          healthContext:   'Goal: Improve cardiovascular fitness and body composition.',
          programName:     "Sam's 8-Week Body Composition",
          programType:     'personal_trainer',
          startDaysAgo:    3,                   // week 1
          sessionDaysAgo:  [3, 2, 1],
          sessionType:     'strength',
          sessionDuration: 60,
          sessionNotes: [
            'Great first session! High energy and good form throughout.',
            'Introduced progressive overload concepts. Responded really well.',
            'Third session this week — showing real commitment.',
          ],
          habit: '20-min morning walk daily',
          goal:  { description: 'Complete 8-week body composition program', targetValue: 8, currentValue: 1, unit: 'weeks' },
        },
        templates: [
          {
            name: '4-Week Strength Foundation', programType: 'personal_trainer',
            weeks: 4, sessionsPerWeek: 3,
            description: 'Progressive 4-week full-body strength program using the big five lifts: Squat, Deadlift, Bench Press, Row, and Overhead Press. Volume increases each week (W1: 3×8, W2: 3×10, W3: 4×8, W4: 4×10).',
            content: makeStrengthContent(4),
          },
          {
            name: '8-Week Body Composition', programType: 'personal_trainer',
            weeks: 8, sessionsPerWeek: 3,
            description: '8-week body composition program combining strength and conditioning. Alternates between strength-focus days and metabolic conditioning to build lean muscle while improving cardiovascular fitness.',
            content: makeBodyCompositionContent(),
          },
        ],
        messages: {
          trainerOpen:      "Hey Alex! Great first week — your form on squats and deadlifts is already looking strong.",
          clientReply1:     "Thanks! I really enjoyed the program. Legs are definitely feeling it today 😄",
          trainerFollowup:  "That's the DOMS from the compound lifts — totally normal. Keep hitting that protein target.",
          alexRecent:       "I've been going a bit heavier on the squats and deadlifts — hope that's okay? Felt really good!",
          samOpen:          "Hey Sam, welcome to the program! Really excited to work with you. How are you feeling after today's session?",
          samReply:         "So good! I'm a bit nervous about all the exercises but you made it really easy to follow. Can't wait for the next one!",
          samTrainerReply:  "That's the spirit! You're going to make incredible progress. See you next session!",
          samRecent:        "I did my walk this morning before work and felt amazing for the whole day. Already loving this lifestyle change!",
        },
        scheduleTypes:    { alexType: 'Strength', samType: 'Strength' },
        scheduleDurations: { alexDuration: 60, samDuration: 60 },
      }
  }
}

// ─── Main seed function ───────────────────────────────────────────────────────

export async function seedTrainerData(trainerId, roles = []) {
  // Map display role names → DB role values (same mapping used in Onboarding.jsx)
  const roleMap = {
    'Personal Trainer':  'personal_trainer',
    'Physiotherapist':   'physiotherapist',
    'Chiropractor':      'chiropractor',
    'Massage Therapist': 'massage_therapist',
    'Nutritionist':      'personal_trainer',
    'Other':             'personal_trainer',
  }

  // Use the first role selected to determine seed data
  const primaryRole = roles.length > 0
    ? (roleMap[roles[0]] ?? 'personal_trainer')
    : 'personal_trainer'

  const cfg  = getRoleConfig(primaryRole)
  const alex = cfg.alex
  const sam  = cfg.sam

  // ── 1. Demo clients ────────────────────────────────────────────────────────

  const { data: newClients, error: clientError } = await supabase
    .from('clients')
    .insert([
      {
        trainer_id:     trainerId,
        first_name:     'Alex',
        last_name:      'Johnson',
        email:          'alex.johnson@example.com',
        service_type:   alex.serviceType,
        status:         'active',
        health_context: alex.healthContext ?? null,
      },
      {
        trainer_id:     trainerId,
        first_name:     'Sam',
        last_name:      'Rivera',
        email:          'sam.rivera@example.com',
        service_type:   sam.serviceType,
        status:         'active',
        health_context: sam.healthContext ?? null,
      },
    ])
    .select()

  if (clientError || !newClients?.length) {
    console.error('Seed: client insert failed', clientError)
    return
  }

  const alexId = newClients[0].id
  const samId  = newClients[1].id

  // ── 2. Program templates ───────────────────────────────────────────────────

  await supabase.from('programs').insert(
    cfg.templates.map(t => ({
      trainer_id:           trainerId,
      name:                 t.name,
      program_type:         t.programType,
      weeks:                t.weeks,
      sessions_per_week:    t.sessionsPerWeek,
      visibility:           'trainer_only',
      status:               'template',
      is_template:          true,
      template_name:        t.name,
      template_description: t.description,
      content:              t.content,
    }))
  )

  // ── 3. Active programs assigned to clients ─────────────────────────────────

  const dateStr = (daysAgo) => {
    const d = new Date(); d.setDate(d.getDate() - daysAgo); return d.toISOString().slice(0, 10)
  }

  const { data: activePrograms } = await supabase
    .from('programs')
    .insert([
      {
        trainer_id:        trainerId,
        name:              alex.programName,
        program_type:      alex.programType,
        weeks:             cfg.templates[0].weeks,
        sessions_per_week: cfg.templates[0].sessionsPerWeek,
        visibility:        'trainer_only',
        status:            'active',
        is_template:       false,
        content:           cfg.templates[0].content,
      },
      {
        trainer_id:        trainerId,
        name:              sam.programName,
        program_type:      sam.programType,
        weeks:             cfg.templates[1].weeks,
        sessions_per_week: cfg.templates[1].sessionsPerWeek,
        visibility:        'trainer_only',
        status:            'active',
        is_template:       false,
        content:           cfg.templates[1].content,
      },
    ])
    .select()

  if (activePrograms?.length === 2) {
    await supabase.from('program_clients').insert([
      { program_id: activePrograms[0].id, client_id: alexId, start_date: dateStr(alex.startDaysAgo), status: 'active' },
      { program_id: activePrograms[1].id, client_id: samId,  start_date: dateStr(sam.startDaysAgo),  status: 'active' },
    ])
  }

  // ── 4. Session logs ────────────────────────────────────────────────────────

  const isoAt = (daysAgo) => {
    const dt = new Date(); dt.setDate(dt.getDate() - daysAgo); return dt.toISOString()
  }

  const alexSessions = alex.sessionDaysAgo.map((daysAgo, i) => ({
    trainer_id:       trainerId,
    client_id:        alexId,
    session_category: 'trainer',
    session_type:     alex.sessionType,
    duration_minutes: alex.sessionDuration,
    completed_at:     isoAt(daysAgo),
    rating:           4,
    notes:            alex.sessionNotes[i] ?? '',
  }))

  const samSessions = sam.sessionDaysAgo.map((daysAgo, i) => ({
    trainer_id:       trainerId,
    client_id:        samId,
    session_category: 'trainer',
    session_type:     sam.sessionType,
    duration_minutes: sam.sessionDuration,
    completed_at:     isoAt(daysAgo),
    rating:           3,
    notes:            sam.sessionNotes[i] ?? '',
  }))

  await supabase.from('session_logs').insert([...alexSessions, ...samSessions])

  // ── 5. Messages ────────────────────────────────────────────────────────────

  const tsAt = (daysAgo, hour = 10) => {
    const dt = new Date()
    dt.setDate(dt.getDate() - daysAgo)
    dt.setHours(hour, 0, 0, 0)
    return dt.toISOString()
  }

  const m = cfg.messages
  await supabase.from('messages').insert([
    { trainer_id: trainerId, client_id: alexId, sender_type: 'trainer', body: m.trainerOpen,     created_at: tsAt(alex.startDaysAgo - 1) },
    { trainer_id: trainerId, client_id: alexId, sender_type: 'client',  body: m.clientReply1,    created_at: tsAt(alex.startDaysAgo - 1, 14) },
    { trainer_id: trainerId, client_id: alexId, sender_type: 'trainer', body: m.trainerFollowup, created_at: tsAt(alex.startDaysAgo - 1, 15) },
    { trainer_id: trainerId, client_id: alexId, sender_type: 'client',  body: m.alexRecent,      created_at: tsAt(3, 9) },
    { trainer_id: trainerId, client_id: samId,  sender_type: 'trainer', body: m.samOpen,         created_at: tsAt(sam.startDaysAgo) },
    { trainer_id: trainerId, client_id: samId,  sender_type: 'client',  body: m.samReply,        created_at: tsAt(sam.startDaysAgo, 12) },
    { trainer_id: trainerId, client_id: samId,  sender_type: 'trainer', body: m.samTrainerReply, created_at: tsAt(sam.startDaysAgo, 13) },
    { trainer_id: trainerId, client_id: samId,  sender_type: 'client',  body: m.samRecent,       created_at: tsAt(1, 8) },
  ])

  // ── 6. Habits ──────────────────────────────────────────────────────────────

  const { data: habits } = await supabase
    .from('habits')
    .insert([
      { trainer_id: trainerId, client_id: alexId, name: alex.habit, target_frequency: 7 },
      { trainer_id: trainerId, client_id: samId,  name: sam.habit,  target_frequency: 7 },
    ])
    .select()

  if (habits?.length === 2) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const alexSkip = new Set([2, 5])   // missed 2 of last 7 days
    const samSkip  = new Set([4])      // missed 1 of last 7 days
    const habitLogs = []

    for (let i = 6; i >= 0; i--) {
      const dt = new Date(today); dt.setDate(today.getDate() - i)
      const dayStr = dt.toISOString().slice(0, 10)
      if (!alexSkip.has(i)) habitLogs.push({ habit_id: habits[0].id, client_id: alexId, completed_date: dayStr })
      if (!samSkip.has(i))  habitLogs.push({ habit_id: habits[1].id, client_id: samId,  completed_date: dayStr })
    }

    if (habitLogs.length) await supabase.from('habit_logs').insert(habitLogs)
  }

  // ── 7. Goals ───────────────────────────────────────────────────────────────

  await supabase.from('goals').insert([
    { trainer_id: trainerId, client_id: alexId, ...alex.goal },
    { trainer_id: trainerId, client_id: samId,  ...sam.goal  },
  ])

  // ── 8. Upcoming scheduled sessions ────────────────────────────────────────

  const futureDate = (daysAhead) => {
    const dt = new Date(); dt.setDate(dt.getDate() + daysAhead); return dt.toISOString().slice(0, 10)
  }

  const { scheduleTypes: st, scheduleDurations: sd } = cfg
  await supabase.from('sessions').insert([
    { trainer_id: trainerId, client_id: alexId, scheduled_date: futureDate(1), start_time: '07:00', duration_minutes: sd.alexDuration, session_type: st.alexType, is_group_class: false },
    { trainer_id: trainerId, client_id: alexId, scheduled_date: futureDate(4), start_time: '07:00', duration_minutes: sd.alexDuration, session_type: st.alexType, is_group_class: false },
    { trainer_id: trainerId, client_id: samId,  scheduled_date: futureDate(2), start_time: '09:00', duration_minutes: sd.samDuration,  session_type: st.samType,  is_group_class: false },
    { trainer_id: trainerId, client_id: samId,  scheduled_date: futureDate(3), start_time: '09:00', duration_minutes: sd.samDuration,  session_type: st.samType,  is_group_class: false },
  ])
}
