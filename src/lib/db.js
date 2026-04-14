// ─── Data access layer ────────────────────────────────────────────────────────
// All Supabase queries live here. Pages import from this module instead of
// from src/data/*.js.  The returned shapes match what existing components
// expect, so UI logic stays unchanged.

import { supabase } from './supabase'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GRADIENTS = [
  'linear-gradient(135deg,#FF6B5B,#FFA733)',
  'linear-gradient(135deg,#FFA733,#2EC4A0)',
  'linear-gradient(135deg,#2EC4A0,#6C63FF)',
  'linear-gradient(135deg,#6C63FF,#FF6B5B)',
  'linear-gradient(135deg,#FF6B5B,#6C63FF)',
  'linear-gradient(135deg,#2EC4A0,#FFA733)',
]

export function getAvatarGrad(name) {
  const hash = (name ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return GRADIENTS[hash % GRADIENTS.length]
}

function addWeeks(dateStr, n) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n * 7)
  return d.toISOString().slice(0, 10)
}

function relativeTime(dateStr) {
  if (!dateStr) return null
  const diff = Math.round((Date.now() - new Date(dateStr)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7)  return `${diff} days ago`
  if (diff < 14) return '1 week ago'
  return `${Math.floor(diff / 7)} weeks ago`
}

function computeAttentionFlag(clientSessions) {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const recentTrainer = clientSessions.filter(
    s => s.session_category === 'trainer' && new Date(s.completed_at) > weekAgo
  )
  if (recentTrainer.length === 0) {
    return { issue: 'No sessions logged this week', tag: 'Check-in due', tagType: 'checkin' }
  }
  return null
}

function shapePlan(progLink) {
  if (!progLink) return null
  const prog = progLink.programs
  if (!prog) return null
  const startDate = progLink.start_date
  const endDate   = startDate ? addWeeks(startDate, prog.weeks) : null
  const daysLeft  = endDate
    ? Math.max(0, Math.ceil((new Date(endDate) - new Date()) / 86400000))
    : null
  const totalDays = endDate && startDate
    ? Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000)
    : null
  const elapsed = totalDays && daysLeft != null ? totalDays - daysLeft : 0
  const progress = totalDays ? Math.min(100, Math.max(0, Math.round((elapsed / totalDays) * 100))) : 0

  return {
    id:        progLink.id,
    name:      prog.name,
    startDate,
    endDate,
    daysLeft:  daysLeft ?? 0,
    progress,
  }
}

function shapeClient(client, progLinks, sessionLogs, goalRows, upcomingSessions) {
  const cSessions  = sessionLogs.filter(s => s.client_id === client.id)
  const cGoals     = goalRows.filter(g => g.client_id === client.id)
  const cNextSched = upcomingSessions.find(s => s.client_id === client.id)
  const activeLink = progLinks.find(pc => pc.client_id === client.id && pc.status === 'active')

  const lastLog = cSessions.slice().sort(
    (a, b) => new Date(b.completed_at) - new Date(a.completed_at)
  )[0]

  const trainerSessions = cSessions
    .filter(s => s.session_category === 'trainer')
    .map(s => ({
      id:              s.id,
      date:            s.completed_at?.slice(0, 10),
      type:            s.session_type,
      durationMinutes: s.duration_minutes,
      completed:       true,
      notes:           s.notes ?? '',
      rating:          s.rating,
    }))

  const independentSessions = cSessions
    .filter(s => s.session_category === 'independent')
    .map(s => ({
      id:              s.id,
      date:            s.completed_at?.slice(0, 10),
      type:            s.session_type,
      durationMinutes: s.duration_minutes,
      completed:       true,
      notes:           s.notes ?? '',
      rating:          s.rating,
    }))

  const goals = cGoals.map(g => ({
    id:              g.id,
    description:     g.description,
    targetValue:     g.target_value,
    currentValue:    g.current_value,
    unit:            g.unit,
    progressHistory: [],
  }))

  const healthConditions = client.health_context
    ? client.health_context.split('\n').map(s => s.trim()).filter(Boolean)
    : []

  const name = `${client.first_name} ${client.last_name}`

  return {
    id:                 client.id,
    name,
    initials:           `${client.first_name[0]}${client.last_name[0]}`.toUpperCase(),
    avatarGrad:         getAvatarGrad(name),
    serviceType:        client.service_type,
    status:             client.status,
    startDate:          client.created_at?.slice(0, 10),
    healthConditions,
    attentionFlag:      computeAttentionFlag(cSessions),
    nextSession:        cNextSched?.scheduled_date ?? null,
    lastSeen:           lastLog ? relativeTime(lastLog.completed_at) : null,
    currentPlan:        shapePlan(activeLink),
    trainerSessions,
    independentSessions,
    goals,
    // Raw DB fields for edit forms
    _firstName:  client.first_name,
    _lastName:   client.last_name,
    _email:      client.email,
    _phone:      client.phone,
  }
}

// ─── Client queries ───────────────────────────────────────────────────────────

export async function getClients(trainerId) {
  const [
    { data: clientRows },
    { data: progLinks },
    { data: sessionLogs },
    { data: goalRows },
    { data: upcomingSessions },
  ] = await Promise.all([
    supabase.from('clients').select('*').eq('trainer_id', trainerId).order('created_at'),
    supabase.from('program_clients').select('*, programs(name, weeks)').eq('status', 'active'),
    supabase.from('session_logs').select('*').eq('trainer_id', trainerId).order('completed_at', { ascending: false }),
    supabase.from('goals').select('*').eq('trainer_id', trainerId),
    supabase.from('sessions').select('client_id, scheduled_date').eq('trainer_id', trainerId)
      .gte('scheduled_date', new Date().toISOString().slice(0, 10))
      .order('scheduled_date'),
  ])

  if (!clientRows) return []

  return clientRows.map(c =>
    shapeClient(c, progLinks ?? [], sessionLogs ?? [], goalRows ?? [], upcomingSessions ?? [])
  )
}

export async function getActiveClients(trainerId) {
  const all = await getClients(trainerId)
  return all.filter(c => c.status === 'active')
}

export async function getClientsNeedingAttention(trainerId) {
  const all = await getActiveClients(trainerId)
  return all.filter(c => c.attentionFlag !== null)
}

export async function getClientsWithEndingPlans(trainerId, withinDays = 7) {
  const all = await getActiveClients(trainerId)
  return all
    .filter(c => c.currentPlan && c.currentPlan.daysLeft <= withinDays)
    .sort((a, b) => a.currentPlan.daysLeft - b.currentPlan.daysLeft)
}

export async function getClientById(trainerId, clientId) {
  const all = await getClients(trainerId)
  return all.find(c => c.id === clientId) ?? null
}

export async function addClient(trainerId, data) {
  const { data: row, error } = await supabase
    .from('clients')
    .insert({
      trainer_id:     trainerId,
      first_name:     data.firstName,
      last_name:      data.lastName,
      email:          data.email ?? null,
      phone:          data.phone ?? null,
      service_type:   data.serviceType ?? 'personal_trainer',
      status:         'active',
      health_context: data.healthContext ?? null,
      notes:          data.notes ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return row
}

export async function updateClient(clientId, data) {
  const { error } = await supabase
    .from('clients')
    .update({
      first_name:     data.firstName,
      last_name:      data.lastName,
      email:          data.email ?? null,
      phone:          data.phone ?? null,
      service_type:   data.serviceType,
      status:         data.status,
      health_context: data.healthContext ?? null,
    })
    .eq('id', clientId)
  if (error) throw error
}

// ─── Client extras (habits + messages for profile page) ───────────────────────

export async function getClientExtras(trainerId, clientId) {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1))
  monday.setHours(0, 0, 0, 0)
  const mondayStr = monday.toISOString().slice(0, 10)
  const sundayStr = new Date(monday.getTime() + 6 * 86400000).toISOString().slice(0, 10)

  const [
    { data: habits },
    { data: habitLogs },
    { data: recentMessages },
    { data: progLinks },
  ] = await Promise.all([
    supabase.from('habits').select('*').eq('client_id', clientId).eq('trainer_id', trainerId),
    supabase.from('habit_logs').select('*').eq('client_id', clientId)
      .gte('completed_date', mondayStr).lte('completed_date', sundayStr),
    supabase.from('messages').select('*').eq('client_id', clientId).eq('trainer_id', trainerId)
      .order('created_at', { ascending: false }).limit(10),
    supabase.from('program_clients')
      .select('id').eq('client_id', clientId).eq('status', 'active'),
  ])

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const weeklyHabits = (habits ?? []).map(habit => {
    const days = DAYS.map((_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const dateStr = d.toISOString().slice(0, 10)
      const isPast  = d <= today
      if (!isPast) return null
      const logged = (habitLogs ?? []).some(
        l => l.habit_id === habit.id && l.completed_date === dateStr
      )
      return logged
    })
    return { name: habit.name, days }
  })

  const messages = (recentMessages ?? []).slice().reverse().map(m => ({
    id:        m.id,
    from:      m.sender_type === 'trainer' ? 'trainer' : 'client',
    text:      m.body,
    timestamp: m.created_at,
  }))

  return {
    plansCompleted: progLinks?.length ?? 0,
    notes:          [],
    messages,
    weeklyHabits,
  }
}

// ─── Session logs (for ClientProfile history) ─────────────────────────────────

export async function addSessionLog(trainerId, clientId, data) {
  const { data: row, error } = await supabase
    .from('session_logs')
    .insert({
      trainer_id:       trainerId,
      client_id:        clientId,
      session_category: data.category ?? 'trainer',
      session_type:     data.type,
      duration_minutes: data.durationMinutes ?? 60,
      completed_at:     data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      rating:           data.rating ?? null,
      notes:            data.notes ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return row
}

// ─── Program queries ──────────────────────────────────────────────────────────

function shapeProgram(row, clientCountMap) {
  return {
    id:                  row.id,
    name:                row.name,
    clientId:            null, // resolved separately via _clientId
    _clientId:           clientCountMap?.[row.id]?.clientId ?? null,
    serviceType:         row.program_type ?? 'personal_trainer',
    status:              row.status ?? 'draft',
    startDate:           clientCountMap?.[row.id]?.startDate ?? '',
    sessionsPerWeek:     row.sessions_per_week ?? 3,
    visibility:          row.visibility ?? 'trainer_only',
    isTemplate:          row.is_template ?? false,
    templateName:        row.template_name ?? null,
    templateDescription: row.template_description ?? null,
    weeks:               row.content?.weeks ?? [],
    _clientCount:        clientCountMap?.[row.id]?.count ?? 0,
    _dbId:               row.id,
  }
}

export async function getPrograms(trainerId) {
  const [{ data: rows }, { data: links }] = await Promise.all([
    supabase.from('programs').select('*').eq('trainer_id', trainerId).order('created_at'),
    supabase.from('program_clients').select('program_id, client_id, start_date').eq('status', 'active'),
  ])

  if (!rows) return []

  // Build a map: programId → { count, clientId, startDate }
  const countMap = {}
  for (const link of (links ?? [])) {
    if (!countMap[link.program_id]) {
      countMap[link.program_id] = { count: 0, clientId: link.client_id, startDate: link.start_date }
    }
    countMap[link.program_id].count++
  }

  return rows.map(r => shapeProgram(r, countMap))
}

export async function saveProgram(trainerId, program) {
  const payload = {
    trainer_id:          trainerId,
    name:                program.name,
    program_type:        program.serviceType,
    weeks:               (program.weeks ?? []).length,
    sessions_per_week:   program.sessionsPerWeek,
    visibility:          program.visibility,
    status:              program.status,
    is_template:         program.isTemplate ?? false,
    template_name:       program.templateName ?? null,
    template_description: program.templateDescription ?? null,
    content:             { weeks: program.weeks ?? [] },
  }

  if (program._dbId) {
    // Update existing
    const { error } = await supabase
      .from('programs')
      .update(payload)
      .eq('id', program._dbId)
    if (error) throw error
    return program
  } else {
    // Insert new
    const { data: row, error } = await supabase
      .from('programs')
      .insert(payload)
      .select()
      .single()
    if (error) throw error

    // If program has a clientId, create program_clients link
    if (program.clientId) {
      await supabase.from('program_clients').insert({
        program_id: row.id,
        client_id:  program.clientId,
        start_date: program.startDate || new Date().toISOString().slice(0, 10),
        status:     'active',
      })
    }

    return shapeProgram(row, {})
  }
}

export async function deleteProgram(programId) {
  const { error } = await supabase.from('programs').delete().eq('id', programId)
  if (error) throw error
}

export async function getClientProgramLogs(trainerId) {
  const [{ data: links }, { data: logs }] = await Promise.all([
    supabase.from('program_clients').select('*, programs!inner(trainer_id)').eq('programs.trainer_id', trainerId),
    supabase.from('session_logs').select('*').eq('trainer_id', trainerId),
  ])

  // Build shape matching clientProgramLogs mock structure
  const result = {}
  for (const link of (links ?? [])) {
    if (!result[link.program_id]) {
      result[link.program_id] = { assignedClientIds: [], clients: {} }
    }
    result[link.program_id].assignedClientIds.push(link.client_id)
    const clientLogs = (logs ?? []).filter(l => l.client_id === link.client_id)
    result[link.program_id].clients[link.client_id] = {
      programVersion:    link.version ?? 1,
      currentWeek:       Math.max(1, Math.ceil((Date.now() - new Date(link.start_date)) / (86400000 * 7))),
      completedSessions: clientLogs.filter(l => l.session_category === 'trainer').length,
      totalSessions:     clientLogs.length,
      personalBests:     [],
      weekLogs:          {},
    }
  }
  return result
}

// ─── Message queries ──────────────────────────────────────────────────────────

export async function getConversations(trainerId) {
  const [{ data: msgs }, { data: clientRows }] = await Promise.all([
    supabase.from('messages').select('*').eq('trainer_id', trainerId).order('created_at'),
    supabase.from('clients').select('id, first_name, last_name, service_type, status').eq('trainer_id', trainerId),
  ])

  if (!msgs || !clientRows) return []

  const clientMap = Object.fromEntries(clientRows.map(c => [c.id, c]))

  // Group messages by client_id
  const convMap = {}
  for (const msg of msgs) {
    if (!convMap[msg.client_id]) {
      convMap[msg.client_id] = {
        clientId:      msg.client_id,
        lastMessageAt: msg.created_at,
        unreadCount:   0,
        messages:      [],
      }
    }
    const conv = convMap[msg.client_id]
    if (new Date(msg.created_at) > new Date(conv.lastMessageAt)) {
      conv.lastMessageAt = msg.created_at
    }
    const isUnread = msg.sender_type === 'client' && !msg.read_at
    if (isUnread) conv.unreadCount++

    conv.messages.push({
      id:        msg.id,
      senderId:  msg.sender_type === 'trainer' ? 'trainer-1' : msg.client_id,
      text:      msg.body,
      timestamp: msg.created_at,
      read:      msg.sender_type === 'trainer' || !!msg.read_at,
      likeCount: 0,
      liked:     false,
    })
  }

  return Object.values(convMap).sort(
    (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
  )
}

export async function sendMessage(trainerId, clientId, body) {
  const { data: row, error } = await supabase
    .from('messages')
    .insert({ trainer_id: trainerId, client_id: clientId, sender_type: 'trainer', body })
    .select()
    .single()
  if (error) throw error
  return {
    id:        row.id,
    senderId:  'trainer-1',
    text:      row.body,
    timestamp: row.created_at,
    read:      true,
    likeCount: 0,
    liked:     false,
  }
}

export async function markConversationRead(trainerId, clientId) {
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('trainer_id', trainerId)
    .eq('client_id', clientId)
    .eq('sender_type', 'client')
    .is('read_at', null)
}

// ─── Schedule session queries ─────────────────────────────────────────────────

export async function getScheduleSessions(trainerId) {
  const { data: rows } = await supabase
    .from('sessions')
    .select('*, clients(first_name, last_name, service_type)')
    .eq('trainer_id', trainerId)
    .not('scheduled_date', 'is', null)
    .order('scheduled_date')
    .order('start_time')

  if (!rows) return []

  return rows.map(r => {
    const name = r.clients
      ? `${r.clients.first_name} ${r.clients.last_name}`
      : 'Unknown'
    return {
      id:               r.id,
      clientId:         r.client_id,
      clientName:       name,
      clientInitials:   name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2),
      clientAvatarGrad: getAvatarGrad(name),
      serviceType:      r.clients?.service_type ?? 'personal_trainer',
      sessionType:      r.session_type,
      date:             r.scheduled_date,
      startTime:        r.start_time ?? '09:00',
      durationMinutes:  r.duration_minutes ?? 60,
      isGroupClass:     r.is_group_class ?? false,
      groupClassName:   r.group_class_name ?? null,
      attendees:        [],
    }
  })
}

export async function addScheduleSession(trainerId, sessionData) {
  const { data: row, error } = await supabase
    .from('sessions')
    .insert({
      trainer_id:       trainerId,
      client_id:        sessionData.clientId,
      scheduled_date:   sessionData.date,
      start_time:       sessionData.startTime,
      duration_minutes: sessionData.durationMinutes,
      session_type:     sessionData.sessionType,
      is_group_class:   sessionData.isGroupClass ?? false,
      group_class_name: sessionData.groupClassName ?? null,
    })
    .select('*, clients(first_name, last_name, service_type)')
    .single()
  if (error) throw error

  const name = row.clients
    ? `${row.clients.first_name} ${row.clients.last_name}`
    : 'Unknown'
  return {
    id:               row.id,
    clientId:         row.client_id,
    clientName:       name,
    clientInitials:   name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2),
    clientAvatarGrad: getAvatarGrad(name),
    serviceType:      row.clients?.service_type ?? 'personal_trainer',
    sessionType:      row.session_type,
    date:             row.scheduled_date,
    startTime:        row.start_time ?? '09:00',
    durationMinutes:  row.duration_minutes ?? 60,
    isGroupClass:     row.is_group_class ?? false,
    groupClassName:   row.group_class_name ?? null,
    attendees:        [],
  }
}

export async function updateScheduleSession(sessionId, updates) {
  const { error } = await supabase
    .from('sessions')
    .update({
      scheduled_date:   updates.date,
      start_time:       updates.startTime,
      duration_minutes: updates.durationMinutes,
      session_type:     updates.sessionType,
      client_id:        updates.clientId,
    })
    .eq('id', sessionId)
  if (error) throw error
}

export async function deleteScheduleSession(sessionId) {
  const { error } = await supabase.from('sessions').delete().eq('id', sessionId)
  if (error) throw error
}

// ─── Trainer profile ──────────────────────────────────────────────────────────

export async function updateTrainerProfile(userId, data) {
  const updates = {}
  if (data.fullName      !== undefined) updates.full_name       = data.fullName
  if (data.avatarUrl     !== undefined) updates.avatar_url      = data.avatarUrl
  if (data.bio           !== undefined) updates.bio             = data.bio
  if (data.onboardingDone !== undefined) updates.onboarding_completed = data.onboardingDone

  if (Object.keys(updates).length === 0) return

  const { error } = await supabase
    .from('trainers')
    .upsert({ id: userId, ...updates })
  if (error) {
    console.error('updateTrainerProfile failed:', {
      message: error.message,
      code:    error.code,
      details: error.details,
      hint:    error.hint,
      updates,
      userId,
    })
    throw error
  }
}

export async function upsertTrainerRoles(userId, roleTypes) {
  await supabase.from('trainer_roles').delete().eq('trainer_id', userId)
  if (roleTypes.length === 0) return
  await supabase.from('trainer_roles').insert(
    roleTypes.map(role_type => ({ trainer_id: userId, role_type }))
  )
}
