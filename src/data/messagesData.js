// ─── Mock message conversations ───────────────────────────────────────────────

export const initialConversations = [
  {
    clientId: 'client-1', // Sarah Mitchell
    lastMessageAt: '2026-04-04T09:15:00',
    unreadCount: 2,
    messages: [
      {
        id: 'msg-sm-1',
        senderId: 'trainer-1',
        text: "Hey Sarah! Great work this week. Your deadlift form has really improved — keep that hip hinge tight.",
        timestamp: '2026-03-28T11:00:00',
        read: true,
        likeCount: 1,
        liked: false,
      },
      {
        id: 'msg-sm-2',
        senderId: 'client-1',
        text: "Thanks so much! I've been really focused on it. Should I try to increase the weight next session?",
        timestamp: '2026-03-28T11:25:00',
        read: true,
        likeCount: 0,
        liked: false,
      },
      {
        id: 'msg-sm-3',
        senderId: 'trainer-1',
        text: "Yes, let's try adding 5kg next time. Make sure to warm up with some Romanian deadlifts first.",
        timestamp: '2026-03-28T14:10:00',
        read: true,
        likeCount: 1,
        liked: false,
      },
      {
        id: 'msg-sm-4',
        senderId: 'client-1',
        text: "Hey, I had to miss my workouts this week. Work has been absolutely crazy. I feel so guilty about it 😞",
        timestamp: '2026-04-03T18:30:00',
        read: false,
        likeCount: 0,
        liked: false,
      },
      {
        id: 'msg-sm-5',
        senderId: 'client-1',
        text: "Any chance we can reschedule a couple of sessions? I really want to get back on track before the plan ends.",
        timestamp: '2026-04-04T09:15:00',
        read: false,
        likeCount: 0,
        liked: false,
      },
    ],
  },

  {
    clientId: 'client-8', // Elena Vasquez
    lastMessageAt: '2026-04-04T08:45:00',
    unreadCount: 1,
    messages: [
      {
        id: 'msg-ev-1',
        senderId: 'trainer-1',
        text: "Elena — excellent consistency this week! You're absolutely crushing Phase 2. Deadlift numbers are looking great.",
        timestamp: '2026-04-01T10:00:00',
        read: true,
        likeCount: 1,
        liked: false,
      },
      {
        id: 'msg-ev-2',
        senderId: 'client-8',
        text: "Thank you!! I've really been enjoying it. Quick question though — I've been feeling flat on the strength days.",
        timestamp: '2026-04-01T10:48:00',
        read: true,
        likeCount: 0,
        liked: false,
      },
      {
        id: 'msg-ev-3',
        senderId: 'client-8',
        text: "Would it be possible to update my nutrition plan? I feel like I'm not fuelling well enough before sessions.",
        timestamp: '2026-04-04T08:45:00',
        read: false,
        likeCount: 0,
        liked: false,
      },
    ],
  },

  {
    clientId: 'client-3', // Keiko Tanaka
    lastMessageAt: '2026-04-02T12:30:00',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-kt-1',
        senderId: 'client-3',
        text: "Rebecca! I just hit a new PB on my 5km — 22:40! The HIIT sessions are definitely paying off 🎉",
        timestamp: '2026-04-01T08:00:00',
        read: true,
        likeCount: 2,
        liked: true,
      },
      {
        id: 'msg-kt-2',
        senderId: 'trainer-1',
        text: "That's incredible Keiko! 22:40 is a massive improvement from where you started. Keep it up — you're going to smash your summer shred goals.",
        timestamp: '2026-04-02T12:30:00',
        read: true,
        likeCount: 1,
        liked: false,
      },
    ],
  },

  {
    clientId: 'client-7', // Tom Richter
    lastMessageAt: '2026-04-03T16:00:00',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-tr-1',
        senderId: 'trainer-1',
        text: "Tom, just checking in. I noticed you missed a couple of sessions last week — everything okay on your end?",
        timestamp: '2026-04-02T10:00:00',
        read: true,
        likeCount: 0,
        liked: false,
      },
      {
        id: 'msg-tr-2',
        senderId: 'client-7',
        text: "Hey, sorry about that. Been dealing with a lot of stress at work. I'll try to get back to it this week.",
        timestamp: '2026-04-03T16:00:00',
        read: true,
        likeCount: 0,
        liked: false,
      },
    ],
  },

  {
    clientId: 'client-2', // Alex Turner
    lastMessageAt: '2026-04-01T09:00:00',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-at-1',
        senderId: 'trainer-1',
        text: "Great PB on bench press yesterday Alex — 100kg is a huge milestone. Proper form throughout too.",
        timestamp: '2026-03-29T09:00:00',
        read: true,
        likeCount: 1,
        liked: false,
      },
      {
        id: 'msg-at-2',
        senderId: 'client-2',
        text: "Couldn't have done it without the programming! Really happy with how it's all coming together.",
        timestamp: '2026-03-29T11:05:00',
        read: true,
        likeCount: 1,
        liked: true,
      },
      {
        id: 'msg-at-3',
        senderId: 'trainer-1',
        text: "And your 5km is super close to sub-25 too. Two goals about to fall in the same month!",
        timestamp: '2026-04-01T09:00:00',
        read: true,
        likeCount: 0,
        liked: false,
      },
    ],
  },

  {
    clientId: 'client-4', // Damien Cross
    lastMessageAt: '2026-03-31T14:00:00',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-dc-1',
        senderId: 'client-4',
        text: "Just wanted to say the shoulder is feeling so much better. Getting close to full range of motion now!",
        timestamp: '2026-03-30T17:00:00',
        read: true,
        likeCount: 0,
        liked: false,
      },
      {
        id: 'msg-dc-2',
        senderId: 'trainer-1',
        text: "That's fantastic Damien! The mobilisation work has really paid off. Keep up the band exercises at home — we'll formally test full ROM at Thursday's appointment.",
        timestamp: '2026-03-31T14:00:00',
        read: true,
        likeCount: 1,
        liked: false,
      },
    ],
  },

  {
    clientId: 'client-6', // Priya Nair
    lastMessageAt: '2026-03-30T19:00:00',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-pn-1',
        senderId: 'client-6',
        text: "Hi Rebecca, my knee has been quite sore after runs lately. Should I be worried?",
        timestamp: '2026-03-29T21:00:00',
        read: true,
        likeCount: 0,
        liked: false,
      },
      {
        id: 'msg-pn-2',
        senderId: 'trainer-1',
        text: "Thanks for flagging that Priya. Can you describe where exactly — front, back, or outside of the knee?",
        timestamp: '2026-03-30T09:00:00',
        read: true,
        likeCount: 0,
        liked: false,
      },
      {
        id: 'msg-pn-3',
        senderId: 'client-6',
        text: "It's on the outside, comes on around 3km in. Eases off if I stop and stretch it.",
        timestamp: '2026-03-30T12:00:00',
        read: true,
        likeCount: 0,
        liked: false,
      },
      {
        id: 'msg-pn-4',
        senderId: 'trainer-1',
        text: "Sounds like IT band tightness. I'll focus extra work on that Thursday. In the meantime — keep foam rolling and cap your runs at 4km max.",
        timestamp: '2026-03-30T19:00:00',
        read: true,
        likeCount: 1,
        liked: false,
      },
    ],
  },

  {
    clientId: 'client-5', // Marcus Lee
    lastMessageAt: '2026-03-28T10:00:00',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-ml-1',
        senderId: 'trainer-1',
        text: "Marcus, haven't seen a check-in from you since Monday. How's the week going?",
        timestamp: '2026-03-28T10:00:00',
        read: true,
        likeCount: 0,
        liked: false,
      },
    ],
  },
]
