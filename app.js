/**
 * Whispr - Anonymous Messaging App
 * Pure HTML/CSS/JS + Supabase
 */

// --- Supabase Setup ---
const supabaseUrl = 'https://hhbhmhyqgszvgkaacbvm.supabase.co';
const supabaseKey = 'sb_publishable_H_ZX2gdYhq606lCTUqXPQA_KrnRefL_';
let supabaseClient = null;
try {
  supabaseClient = (window.supabase && typeof window.supabase.createClient === 'function')
    ? window.supabase.createClient(supabaseUrl, supabaseKey)
    : null;
} catch(e) { console.warn('Supabase init failed', e); supabaseClient = null; }
window.supabaseClient = supabaseClient;

// --- SVG Icons (professional, no emojis) ---
const icons = {
  send:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  lock:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  reply:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>`,
  copy:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  trash:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  inbox:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
  logout:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  login:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`,
  register:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`,
  link:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  ban:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
  shield:  `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  ghost:   `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg>`,
  chart:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
  users:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  check:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  info:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  warn:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  clock:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  camera:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  back:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  forward: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  arrow_down:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`,
  x:       `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  instagram:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  twitter: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  spin:    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin-icon"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
  sun:     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  user:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  rocket:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
  slash:   `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="8" x2="23" y2="14"/><line x1="23" y1="8" x2="17" y2="14"/></svg>`,
  msg_circle:`<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  eye:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
};

// --- localStorage safe wrapper ---
const ls = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, val) { try { localStorage.setItem(key, val); } catch {} },
  remove(key) { try { localStorage.removeItem(key); } catch {} },
};

// --- Translations ---
const TRANSLATIONS = {
  ar: {
    logo: "Whispr",
    nav_inbox: "صندوقي",
    nav_logout: "خروج",
    nav_login: "دخول",
    nav_register: "تسجيل",
    hero_title: "استقبل رسائل مجهولة",
    hero_subtitle: "آراء صريحة من أصدقائك بشكل مجهول تام",
    btn_start: "ابدأ الآن",
    btn_login_submit: "دخول",
    login_title: "تسجيل الدخول",
    login_subtitle: "مرحباً بعودتك إلى Whispr",
    username_label: "اسم المستخدم",
    username_ph: "أدخل اسم المستخدم",
    password_label: "كلمة المرور",
    password_ph: "أدخل كلمة المرور",
    no_account: "ليس لديك حساب؟",
    create_account: "أنشئ حساباً",
    register_title: "حساب جديد",
    register_subtitle: "انضم وابدأ باستقبال الرسائل",
    email_label: "البريد الإلكتروني",
    email_ph: "أدخل بريدك الإلكتروني",
    btn_register_submit: "تسجيل",
    have_account: "لديك حساب؟",
    login_now: "سجل دخولك",
    profile_title: "أرسل رسالة مجهولة",
    bio_default: "أنتظر رسائلكم",
    msg_ph: "اكتب رسالتك هنا...",
    btn_send: "إرسال",
    chars_left: "حرف متبقي",
    inbox_title: "صندوق الوارد",
    msgs_count: "رسالة",
    reply_ph: "اكتب ردك هنا...",
    btn_reply: "رد",
    reply_label: "الرد:",
    share_link: "رابطك الخاص:",
    btn_copy: "نسخ",
    err_invalid_creds: "البريد أو كلمة المرور غير صحيحة",
    err_user_not_found: "المستخدم غير موجود",
    msg_sent: "تم إرسال الرسالة",
    link_copied: "تم نسخ الرابط",
    reply_added: "تم إضافة الرد",
    reg_success: "تم التسجيل بنجاح",
    err_user_exists: "اسم المستخدم موجود مسبقاً",
  }
};

// --- App State ---
const state = {
  lang: 'ar',
  theme: ls.get('whispr_theme') || 'dark',
  largeText: ls.get('whispr_largetext') === 'true',
  currentUser: JSON.parse(ls.get('whispr_current_user') || 'null'),
  _localMessages: JSON.parse(ls.get('bawh_messages') || '[]'),
  _localUsers: JSON.parse(ls.get('bawh_users') || '[]'),
};

const t = (key) => TRANSLATIONS[state.lang][key] || key;

const saveLocal = () => {
  ls.set('whispr_current_user', JSON.stringify(state.currentUser));
  ls.set('whispr_theme', state.theme);
  ls.set('whispr_largetext', state.largeText);
  ls.set('bawh_messages', JSON.stringify(state._localMessages));
  ls.set('bawh_users', JSON.stringify(state._localUsers));
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const getDateLabel = (ts) => {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'اليوم';
  if (d.toDateString() === yesterday.toDateString()) return 'أمس';
  return d.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
};

const showToast = (message, type = 'info') => {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const ico = type === 'success' ? icons.check : type === 'error' ? icons.warn : icons.info;
  toast.innerHTML = `<span class="toast-icon">${ico}</span><span>${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 350);
  }, 3000);
};

// --- Blocks API ---
const blocksAPI = {
  async isBlocked(blockerId, blockedId) {
    if (!supabaseClient) return false;
    try {
      const { data } = await supabaseClient.from('blocks').select('id')
        .eq('blocker_id', blockerId).eq('blocked_id', blockedId).maybeSingle();
      return !!data;
    } catch { return false; }
  },
  async blockUser(blockerId, blockedId) {
    if (!supabaseClient) return;
    try { await supabaseClient.from('blocks').insert({ blocker_id: blockerId, blocked_id: blockedId }); } catch {}
  },
  async unblockUser(blockerId, blockedId) {
    if (!supabaseClient) return;
    try { await supabaseClient.from('blocks').delete().match({ blocker_id: blockerId, blocked_id: blockedId }); } catch {}
  },
  async getBlockedIds(blockerId) {
    if (!supabaseClient) return [];
    try {
      const { data } = await supabaseClient.from('blocks').select('blocked_id').eq('blocker_id', blockerId);
      return data ? data.map(r => r.blocked_id) : [];
    } catch { return []; }
  }
};

// --- Supabase Messages API ---
// All reads/writes go through Supabase. We intentionally do NOT silently fall
// back to localStorage on failure — that used to mask real RLS / schema errors
// (sender thought the message was sent but it only lived in their own browser,
// so the receiver never got it). Errors are now surfaced to the caller.
const messagesAPI = {
  async getInbox(userId) {
    if (!supabaseClient) {
      console.warn('[messagesAPI.getInbox] Supabase client missing');
      return [];
    }
    if (!userId) {
      console.warn('[messagesAPI.getInbox] called without userId');
      return [];
    }
    const { data, error } = await supabaseClient
      .from('messages')
      .select('id, content, created_at, is_read, sender_id, reply')
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[messagesAPI.getInbox] supabase error:', error);
      throw error;
    }
    return (data || []).map(m => ({
      id: m.id,
      content: m.content,
      timestamp: new Date(m.created_at).getTime(),
      reply: m.reply || null,
      isRead: !!m.is_read,
      senderId: m.sender_id || null,
    }));
  },

  async send(receiverId, content, senderId = null) {
    if (!supabaseClient) {
      console.error('[messagesAPI.send] Supabase client missing');
      return { ok: false, error: 'no-client' };
    }
    if (!receiverId || !content) {
      console.error('[messagesAPI.send] invalid args', { receiverId, content });
      return { ok: false, error: 'invalid-args' };
    }
    const payload = { receiver_id: receiverId, content };
    if (senderId) payload.sender_id = senderId;
    const { data, error } = await supabaseClient
      .from('messages')
      .insert(payload)
      .select('id')
      .single();
    if (error) {
      console.error('[messagesAPI.send] supabase insert error:', error, 'payload:', payload);
      return { ok: false, error };
    }
    return { ok: true, id: data?.id };
  },

  async reply(msgId, replyText) {
    if (!supabaseClient) return { ok: false, error: 'no-client' };
    const { error } = await supabaseClient
      .from('messages')
      .update({ reply: replyText })
      .eq('id', msgId);
    if (error) {
      console.error('[messagesAPI.reply] supabase error:', error);
      return { ok: false, error };
    }
    return { ok: true };
  },

  async markRead(userId) {
    if (!supabaseClient || !userId) return;
    const { error } = await supabaseClient
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);
    if (error) console.error('[messagesAPI.markRead] supabase error:', error);
  },

  async delete(msgId) {
    if (!supabaseClient) return { ok: false };
    const { error } = await supabaseClient.from('messages').delete().eq('id', msgId);
    if (error) {
      console.error('[messagesAPI.delete] supabase error:', error);
      return { ok: false, error };
    }
    return { ok: true };
  },

  async getPublicReplies(userId) {
    if (!supabaseClient || !userId) return [];
    const { data, error } = await supabaseClient
      .from('messages')
      .select('id, content, created_at, reply')
      .eq('receiver_id', userId)
      .not('reply', 'is', null)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[messagesAPI.getPublicReplies] supabase error:', error);
      return [];
    }
    return (data || []).map(m => ({
      id: m.id,
      content: m.content,
      timestamp: new Date(m.created_at).getTime(),
      reply: m.reply,
    }));
  },

  async unreadCount(userId) {
    if (!supabaseClient || !userId) return 0;
    const { count, error } = await supabaseClient
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);
    if (error) {
      console.error('[messagesAPI.unreadCount] supabase error:', error);
      return 0;
    }
    return count || 0;
  },
};

// --- Profiles API ---
const profilesAPI = {
  async getByUsername(username) {
    if (supabaseClient) {
      try {
        const { data } = await supabaseClient.from('profiles')
          .select('id, email, full_name, avatar_url').eq('full_name', username).maybeSingle();
        if (data) return { id: data.id, username: data.full_name || username, email: data.email, avatar_url: data.avatar_url };
      } catch {}
    }
    const u = state._localUsers.find(u => u.username === username);
    return u || null;
  },
  async getById(userId) {
    if (supabaseClient) {
      try {
        const { data } = await supabaseClient.from('profiles').select('*').eq('id', userId).maybeSingle();
        if (data) return { id: data.id, username: data.full_name || data.email?.split('@')[0], email: data.email, avatar_url: data.avatar_url };
      } catch {}
    }
    return state._localUsers.find(u => u.id === userId) || null;
  }
};

// --- Main App ---
const app = {
  root: null,
  currentRoute: null,
  authUser: null,
  authPromise: null,

  init() {
    this.root = document.getElementById('app-root');
    this.applyTheme();
    this.applyLargeText();
    this.setupNavListeners();
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
    this.initParticles();
    this.initCursor();
  },

  setupNavListeners() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      saveLocal();
      this.applyTheme();
    });
    window.addEventListener('scroll', () => {
      document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  },

  applyTheme() {
    document.body.setAttribute('data-theme', state.theme);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.innerHTML = state.theme === 'light' ? icons.moon : icons.sun;
  },

  applyLargeText() {
    document.body.classList.toggle('large-text-enabled', state.largeText);
  },

  toggleLargeText() {
    state.largeText = !state.largeText;
    saveLocal();
    this.applyLargeText();
    this.renderCurrentView();
  },

  navigate(route) { window.location.hash = route; },

  async initAuth() {
    if (this.authPromise) return this.authPromise;
    this.authPromise = (async () => {
      if (!supabaseClient) return;
      try {
        const { data } = await supabaseClient.auth.getUser();
        if (data?.user) {
          this.authUser = data.user;
          if (!state.currentUser || state.currentUser.supaId !== data.user.id) {
            try {
              const { data: profile } = await supabaseClient.from('profiles')
                .select('id, full_name, email, avatar_url').eq('id', data.user.id).maybeSingle();
              if (profile) {
                const username = profile.full_name || data.user.email.split('@')[0];
                state.currentUser = { id: data.user.id, supaId: data.user.id, username, email: profile.email || data.user.email, avatar_url: profile.avatar_url };
                saveLocal();
              }
            } catch {}
          }
        } else {
          if (state.currentUser) { state.currentUser = null; saveLocal(); }
        }
      } catch(e) { console.error('initAuth error', e); }
    })();
    return this.authPromise;
  },

  async handleRoute() {
    if (!this.currentRoute) {
      this.root.innerHTML = `<div class="loading-screen"><span class="loading-spin">${icons.spin}</span><span>جاري التحميل...</span></div>`;
    }
    await this.initAuth();

    const hash = window.location.hash.slice(1) || 'home';

    // Onboarding check: skip if user is logged in, or visiting a profile/auth page
    const skipOnboarding = state.currentUser ||
      ['onboarding','login','register'].includes(hash) ||
      hash.startsWith('u/');

    const onboardingDone = skipOnboarding || ls.get('whispr_onboarding_done') === '1';

    if (!onboardingDone) {
      window.location.hash = 'onboarding';
      return;
    }

    if (this.currentRoute !== hash) app.chatLimit = 30;
    this.currentRoute = hash;
    await this.renderCurrentView();
    this.updateNav();
  },

  async updateNav() {
    const container = document.getElementById('auth-nav-container');
    if (!container) return;
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '8px';

    if (state.currentUser) {
      let unread = 0;
      try { unread = await messagesAPI.unreadCount(state.currentUser.id); } catch {}
      container.innerHTML = `
        <button class="btn btn-ghost nav-btn" onclick="app.navigate('inbox')" aria-label="${t('nav_inbox')}">
          <span class="btn-icon-wrap">${icons.inbox}</span>
          <span class="hide-mobile">${t('nav_inbox')}</span>
          ${unread > 0 ? `<span class="unread-badge">${unread}</span>` : ''}
        </button>
        <button class="btn btn-ghost nav-btn icon-only" onclick="app.logout()" aria-label="${t('nav_logout')}">
          <span class="btn-icon-wrap">${icons.logout}</span>
        </button>
      `;
    } else {
      container.innerHTML = `
        <button class="btn btn-ghost nav-btn" onclick="app.navigate('login')">
          <span class="btn-icon-wrap">${icons.login}</span>
          <span>${t('nav_login')}</span>
        </button>
        <button class="btn btn-primary nav-btn" onclick="app.navigate('register')">
          <span class="btn-icon-wrap">${icons.register}</span>
          <span>${t('nav_register')}</span>
        </button>
      `;
    }
  },

  async renderCurrentView() {
    if (!this.currentRoute) return;
    const parts = this.currentRoute.split('/');
    const route = parts[0];
    let html = '';

    try {
      switch (route) {
        case 'home':      html = this.views.home(); break;
        case 'onboarding': html = this.views.onboarding(); break;
        case 'login':
          if (state.currentUser) return this.navigate('inbox');
          html = this.views.login(); break;
        case 'register':
          if (state.currentUser) return this.navigate('inbox');
          html = this.views.register(); break;
        case 'inbox':
          if (!state.currentUser) return this.navigate('login');
          html = await this.views.inbox(); break;
        case 'blocked':
          if (!state.currentUser) return this.navigate('login');
          html = await this.views.blocked(); break;
        case 'analytics': {
          if (!supabaseClient) return this.navigate('inbox');
          const { data } = await supabaseClient.auth.getUser();
          if (data?.user?.email !== 'abadihdar@gmail.com') return this.navigate('inbox');
          html = this.views.analytics(); break;
        }
        case 'u':
          if (parts[1]) { html = await this.views.profile(parts[1]); }
          else this.navigate('home');
          break;
        default: html = this.views.home();
      }
    } catch(err) {
      console.error('Render error:', err);
      html = `<div class="view active empty-state">
        <div class="empty-icon danger-icon">${icons.warn}</div>
        <h3>حدث خطأ غير متوقع</h3>
        <p>عذراً، حدثت مشكلة أثناء تحميل الصفحة.</p>
        <button class="btn btn-primary mt-24" onclick="app.navigate('home')">العودة للرئيسية</button>
      </div>`;
    }

    this.root.innerHTML = html;

    if (route === 'u' && parts[1]) this.setupProfileEvents(parts[1]);
    else if (route === 'inbox') this.setupInboxEvents();
    else if (route === 'login') this.setupLoginEvents();
    else if (route === 'register') this.setupRegisterEvents();
    else if (route === 'onboarding') this.setupOnboardingEvents();
  },

  async logout() {
    if (supabaseClient) await supabaseClient.auth.signOut();
    state.currentUser = null;
    this.authUser = null;
    this.authPromise = null;
    saveLocal();
    this.navigate('home');
    showToast('تم تسجيل الخروج', 'info');
  },

  copyLink(url) {
    navigator.clipboard.writeText(url)
      .then(() => showToast(t('link_copied'), 'success'))
      .catch(() => showToast('تعذر النسخ، حاول مرة أخرى', 'error'));
  },

  copyProfileLink() {
    navigator.clipboard.writeText(window.location.href)
      .then(() => showToast(t('link_copied'), 'success'))
      .catch(() => showToast('حدث خطأ في النسخ', 'error'));
  },

  shareTo(platform, url, text) {
    if (platform === 'instagram') {
      navigator.clipboard.writeText(`${text} ${url}`)
        .then(() => showToast('تم نسخ الرابط — افتح إنستغرام والصقه في قصتك', 'success'))
        .catch(() => {});
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    } else {
      window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    }
  },

  insertPrompt(text) {
    const ta = document.getElementById('msg-content');
    if (!ta) return;
    ta.value = text;
    ta.focus();
    ta.dispatchEvent(new Event('input'));
  },

  async uploadAvatar(file) {
    if (!supabaseClient || !state.currentUser || !file) return;
    if (!file.type.startsWith('image/')) return showToast('اختر ملف صورة فقط', 'error');
    if (file.size > 3 * 1024 * 1024) return showToast('حجم الصورة أكبر من 3 ميجابايت', 'error');
    try {
      const { data: authData } = await supabaseClient.auth.getUser();
      if (!authData?.user) return showToast('سجل الدخول أولاً', 'error');
      showToast('جاري رفع الصورة...', 'info');
      const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '') || 'jpg';
      const path = `${authData.user.id}/avatar.${ext}`;
      const { error: upErr } = await supabaseClient.storage.from('avatars').upload(path, file, { cacheControl: '60', upsert: true });
      if (upErr) return showToast('فشل رفع الصورة', 'error');
      const { data } = supabaseClient.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?v=${Date.now()}`;
      await supabaseClient.from('profiles').update({ avatar_url: publicUrl }).eq('id', authData.user.id);
      state.currentUser.avatar_url = publicUrl;
      saveLocal();
      showToast('تم تحديث الصورة', 'success');
      this.renderCurrentView();
    } catch(e) { showToast('خطأ أثناء رفع الصورة', 'error'); }
  },

  async toggleBlockUser(targetId) {
    if (!state.currentUser) return;
    const btn = document.getElementById(`block-btn-${targetId}`);
    if (!btn) return;
    const isBlocked = btn.dataset.blocked === 'true';
    btn.disabled = true;
    btn.classList.add('loading');
    if (isBlocked) {
      await blocksAPI.unblockUser(state.currentUser.id, targetId);
      btn.dataset.blocked = 'false';
      btn.querySelector('.block-btn-text').textContent = 'حظر هذا المرسل';
      showToast('تم إلغاء الحظر', 'success');
    } else {
      await blocksAPI.blockUser(state.currentUser.id, targetId);
      btn.dataset.blocked = 'true';
      btn.querySelector('.block-btn-text').textContent = 'إلغاء الحظر';
      showToast('تم حظر هذا المستخدم', 'success');
    }
    btn.disabled = false;
    btn.classList.remove('loading');
  },

  async unblockFromList(targetId) {
    if (!state.currentUser) return;
    await blocksAPI.unblockUser(state.currentUser.id, targetId);
    showToast('تم إلغاء الحظر', 'success');
    this.renderCurrentView();
  },

  async deleteMessage(msgId) {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    await messagesAPI.delete(msgId);
    showToast('تم حذف الرسالة', 'success');
    this.renderCurrentView();
  },

  finishOnboarding() {
    ls.set('whispr_onboarding_done', '1');
    this.navigate(state.currentUser ? 'inbox' : 'home');
  },

  views: {
    onboarding() {
      return `<div class="view active auth-wrapper onboarding-wrapper">
        <div class="onboarding-card glass-card" id="onboard-1">
          <div class="onboard-icon primary-color">${icons.ghost}</div>
          <h2 class="auth-title text-gradient">مرحباً بك في Whispr</h2>
          <p class="auth-subtitle">استقبل رسائل سرية من أصدقائك أو متابعيك بدون معرفة هويتهم.</p>
          <div class="onboard-actions">
            <button class="btn btn-ghost" onclick="app.finishOnboarding()">تخطي</button>
            <button class="btn btn-primary" onclick="app.nextOnboard(1)">التالي</button>
          </div>
        </div>
        <div class="onboarding-card glass-card hidden" id="onboard-2">
          <div class="onboard-icon accent-color">${icons.link}</div>
          <h2 class="auth-title text-gradient">شارك رابطك الخاص</h2>
          <p class="auth-subtitle">بعد إنشاء حسابك، انسخ رابطك وشاركه في حساباتك لتبدأ بتلقي الرسائل.</p>
          <div class="onboard-actions">
            <button class="btn btn-ghost" onclick="app.finishOnboarding()">تخطي</button>
            <button class="btn btn-primary" onclick="app.nextOnboard(2)">التالي</button>
          </div>
        </div>
        <div class="onboarding-card glass-card hidden" id="onboard-3">
          <div class="onboard-icon danger-color">${icons.shield}</div>
          <h2 class="auth-title text-gradient">تحكم بخصوصيتك</h2>
          <p class="auth-subtitle">يمكنك بضغطة واحدة حظر أي مرسل مزعج لمنعه من مراسلتك مجدداً.</p>
          <div class="onboard-actions">
            <button class="btn btn-primary full-width" onclick="app.finishOnboarding()">ابدأ الآن</button>
          </div>
        </div>
      </div>`;
    },

    home() {
      return `<div class="view active hero">
        <div class="hero-shell">
          <div class="hero-copy">
            <div class="eyebrow">${icons.shield} <span>مساحة صريحة وآمنة</span></div>
            <h1 class="hero-title text-gradient">${t('hero_title')}</h1>
            <p class="hero-subtitle">${t('hero_subtitle')}، مع رابط خاص ومظهر أنيق يناسب المشاركة في كل مكان.</p>
            <div class="hero-actions">
              <button class="btn btn-primary" onclick="app.navigate('register')">
                ${icons.rocket} ${t('btn_start')}
              </button>
              <button class="btn btn-outline" onclick="app.navigate('login')">
                ${icons.login} ${t('btn_login_submit')}
              </button>
            </div>
          </div>
          <div class="hero-preview" aria-hidden="true">
            <div class="floating-note note-a">
              <span class="note-label">رسالة جديدة</span>
              <strong>كلامك اليوم كان ملهمًا جدًا</strong>
            </div>
            <div class="phone-frame">
              <div class="phone-top"></div>
              <div class="preview-bubble">ما أكثر شيء تحب الناس يعرفونه عنك؟</div>
              <div class="preview-bubble alt">رد جميل ومختصر يظهر للكل بدون كشف المرسل.</div>
              <div class="preview-composer">
                <span>اكتب بسرية...</span>
                <span class="composer-icon">${icons.send}</span>
              </div>
            </div>
            <div class="floating-note note-b">
              <span class="note-label">خصوصية</span>
              <strong>حظر، ردود، وتنبيهات مرئية</strong>
            </div>
          </div>
        </div>
        <div class="feature-strip">
          <div>${icons.link} <span>رابط شخصي جاهز</span></div>
          <div>${icons.user} <span>إرسال مجهول</span></div>
          <div>${icons.ban} <span>تحكم بالحظر</span></div>
        </div>
        <div class="how-it-works">
          <div class="mini-card">
            <span class="step-number">١</span>
            <h3>أنشئ حسابك</h3>
            <p>اختر اسمًا قصيرًا واحصل على رابطك خلال ثوان.</p>
          </div>
          <div class="mini-card">
            <span class="step-number">٢</span>
            <h3>شارك الرابط</h3>
            <p>ضعه في حساباتك لتبدأ باستقبال الرسائل.</p>
          </div>
          <div class="mini-card">
            <span class="step-number">٣</span>
            <h3>اقرأ ورد</h3>
            <p>استقبل الرسائل ورد عليها بشكل عام دون كشف الهوية.</p>
          </div>
        </div>
      </div>`;
    },

    login() {
      return `<div class="view active auth-wrapper">
        <div class="glass-card auth-card">
          <div class="auth-header">
            <h2 class="auth-title text-gradient">${t('login_title')}</h2>
            <p class="auth-subtitle">${t('login_subtitle')}</p>
          </div>
          <form id="login-form" autocomplete="on">
            <div class="form-group">
              <label class="form-label">${t('email_label')}</label>
              <input type="email" id="login-email" class="form-control" placeholder="${t('email_ph')}" autocomplete="email" required>
            </div>
            <div class="form-group">
              <label class="form-label">${t('password_label')}</label>
              <input type="password" id="login-password" class="form-control" placeholder="${t('password_ph')}" autocomplete="current-password" required>
            </div>
            <button type="submit" class="btn btn-primary full-width" id="login-submit-btn">
              ${icons.login} ${t('btn_login_submit')}
            </button>
          </form>
          <div class="auth-footer">
            <a class="auth-link" id="forgot-password-link" href="#">نسيت كلمة المرور؟</a>
          </div>
          <div class="auth-footer">
            ${t('no_account')} <a class="auth-link" onclick="app.navigate('register')">${t('create_account')}</a>
          </div>
        </div>
      </div>`;
    },

    register() {
      return `<div class="view active auth-wrapper">
        <div class="glass-card auth-card">
          <div class="auth-header">
            <h2 class="auth-title text-gradient">${t('register_title')}</h2>
            <p class="auth-subtitle">${t('register_subtitle')}</p>
          </div>
          <form id="register-form" autocomplete="on">
            <div class="form-group">
              <label class="form-label">${t('username_label')}</label>
              <input type="text" id="reg-username" class="form-control" placeholder="${t('username_ph')}" autocomplete="username" required pattern="[A-Za-z0-9_]+" title="استخدم حروفاً إنجليزية أو أرقاماً أو شرطة سفلية">
            </div>
            <div class="form-group">
              <label class="form-label">${t('email_label')}</label>
              <input type="email" id="reg-email" class="form-control" placeholder="${t('email_ph')}" autocomplete="email" required>
            </div>
            <div class="form-group">
              <label class="form-label">${t('password_label')}</label>
              <input type="password" id="reg-password" class="form-control" placeholder="${t('password_ph')}" autocomplete="new-password" required minlength="6">
            </div>
            <button type="submit" class="btn btn-primary full-width" id="reg-submit-btn">
              ${icons.register} ${t('btn_register_submit')}
            </button>
          </form>
          <div class="auth-footer">
            ${t('have_account')} <a class="auth-link" onclick="app.navigate('login')">${t('login_now')}</a>
          </div>
        </div>
      </div>`;
    },

    async profile(username) {
      let user = await profilesAPI.getByUsername(username);
      if (!user) {
        return `<div class="view active empty-state">
          <div class="empty-icon danger-icon">${icons.warn}</div>
          <h3>${t('err_user_not_found')}</h3>
        </div>`;
      }
      const replies = await messagesAPI.getPublicReplies(user.id);
      const limit = app.chatLimit || 30;
      const visible = replies.slice(0, limit);
      const hasMore = replies.length > limit;
      let lastDateLabel = null;
      const repliesHtml = visible.map(msg => {
        const dl = getDateLabel(msg.timestamp);
        let sep = '';
        if (dl !== lastDateLabel) { sep = `<div class="date-sep"><span>${dl}</span></div>`; lastDateLabel = dl; }
        return `${sep}<div class="msg-thread-item glass-card">
          <div class="msg-bubble incoming">${escHtml(msg.content)}</div>
          <div class="msg-bubble reply">${icons.reply} <span>${escHtml(msg.reply)}</span></div>
          <div class="msg-meta">${icons.clock} ${formatTime(msg.timestamp)}</div>
        </div>`;
      }).join('');

      return `<div class="view active">
        <div class="profile-header">
          <div class="avatar-wrap">
            ${user.avatar_url
              ? `<img src="${user.avatar_url}" class="avatar-img" alt="صورة ${username}">`
              : `<div class="avatar-placeholder">${username.charAt(0).toUpperCase()}</div>`}
          </div>
          <h2 class="profile-name" dir="ltr">@${escHtml(username)}</h2>
          <p class="text-muted bio-text">${escHtml(user.bio || t('bio_default'))}</p>
          <div class="profile-actions">
            <button class="btn btn-outline" onclick="app.copyProfileLink()">${icons.link} نسخ الرابط</button>
            ${state.currentUser && state.currentUser.id !== user.id ? `
              <button class="btn btn-outline btn-danger-outline" id="block-btn-${user.id}" data-blocked="false" onclick="app.toggleBlockUser('${user.id}')">
                ${icons.ban} <span class="block-btn-text">حظر هذا المرسل</span>
              </button>` : ''}
          </div>
        </div>
        <div class="glass-card send-card">
          <div class="send-card-header">${icons.send}<h3>${t('profile_title')}</h3></div>
          <div class="prompt-row" id="prompt-row">
            <button class="prompt-chip" onclick="app.insertPrompt('ما الشيء الذي تتمنى أن أخبرك به بصراحة؟')">سؤال صريح</button>
            <button class="prompt-chip" onclick="app.insertPrompt('رسالة لطيفة وصلتني منك وأحببتها...')">رسالة لطيفة</button>
            <button class="prompt-chip" onclick="app.insertPrompt('نصيحة قصيرة بدون مجاملة:')">نصيحة</button>
          </div>
          <form id="send-msg-form" class="composer-form">
            <div class="composer-row">
              <textarea id="msg-content" class="form-control composer-textarea" placeholder="${t('msg_ph')}" required maxlength="300" rows="1"></textarea>
              <button type="submit" class="btn btn-primary send-btn" aria-label="إرسال">
                <span class="send-icon-mobile">${icons.send}</span>
                <span class="send-text-desktop">${icons.lock} ${t('btn_send')}</span>
              </button>
            </div>
            <div id="send-block-error" class="send-error hidden">لا يمكنك إرسال رسائل لهذا المستخدم.</div>
            <div class="composer-footer">
              <span class="char-counter" id="char-counter">300 ${t('chars_left')}</span>
            </div>
          </form>
        </div>
        ${replies.length > 0 ? `
          <div class="inbox-container">
            <div class="section-header"><h3>الردود السابقة</h3></div>
            ${hasMore ? `<div class="load-more-hint">${icons.arrow_down} مرر لأعلى لتحميل المزيد</div>` : ''}
            <div class="messages-list" id="msg-list">${repliesHtml}</div>
          </div>` : ''}
      </div>`;
    },

    async inbox() {
      const user = state.currentUser;
      const shareUrl = `${location.origin}${location.pathname}#u/${user.username}`;
      const shareText = 'أرسل لي رسالة مجهولة على Whispr';
      let messages = [];
      let fetchError = null;
      try {
        messages = await messagesAPI.getInbox(user.id);
      } catch (e) {
        fetchError = e?.message || String(e);
      }
      const unread = messages.filter(m => !m.isRead).length;
      const replied = messages.filter(m => m.reply).length;
      let blockedIds = [];
      try { blockedIds = await blocksAPI.getBlockedIds(user.id); } catch {}
      const filtered = messages.filter(m => !m.senderId || !blockedIds.includes(m.senderId));
      let lastDateLabel = null;
      const msgsHtml = filtered.map(msg => {
        const dl = getDateLabel(msg.timestamp);
        let sep = '';
        if (dl !== lastDateLabel) { sep = `<div class="date-sep"><span>${dl}</span></div>`; lastDateLabel = dl; }
        return `${sep}
        <div class="msg-card glass-card ${!msg.isRead ? 'unread' : ''}" id="msg-${msg.id}">
          <div class="msg-card-header">
            <span class="msg-time">${icons.clock} ${formatTime(msg.timestamp)}</span>
            <div class="msg-card-actions">
              ${!msg.reply ? `<button class="icon-btn" onclick="app.toggleReplyArea('${msg.id}')" title="${t('btn_reply')}">${icons.reply}</button>` : ''}
              <button class="icon-btn danger-btn" onclick="app.deleteMessage('${msg.id}')" title="حذف">${icons.trash}</button>
            </div>
          </div>
          <div class="msg-bubble incoming">${escHtml(msg.content)}</div>
          ${msg.reply ? `
            <div class="msg-bubble reply">${icons.reply} <span>${escHtml(msg.reply)}</span></div>` : `
            <div class="reply-area hidden" id="reply-area-${msg.id}">
              <form class="reply-form" onsubmit="app.submitReply(event,'${msg.id}')">
                <textarea class="form-control reply-textarea" placeholder="${t('reply_ph')}" required></textarea>
                <button type="submit" class="btn btn-primary btn-sm">${icons.reply} ${t('btn_reply')}</button>
              </form>
            </div>`}
        </div>`;
      }).join('');

      let isOwner = false;
      if (supabaseClient) {
        try {
          const { data } = await supabaseClient.auth.getUser();
          isOwner = data?.user?.email === 'abadihdar@gmail.com';
        } catch {}
      }

      return `<div class="view active inbox-container">
        <div class="inbox-hero glass-card">
          <div class="avatar-wrap-inbox">
            ${user.avatar_url
              ? `<img src="${user.avatar_url}" class="avatar-img" alt="صورة الحساب">`
              : `<div class="avatar-placeholder">${user.username.charAt(0).toUpperCase()}</div>`}
            <label class="avatar-upload-btn" title="تغيير الصورة">
              <span>${icons.camera}</span>
              <input type="file" accept="image/*" class="sr-only" onchange="app.uploadAvatar(this.files[0])">
            </label>
          </div>
          <h2 class="profile-name" dir="ltr">@${escHtml(user.username)}</h2>
          <div class="inbox-stats">
            <div class="stat-item"><strong>${filtered.length}</strong><span>رسالة</span></div>
            <div class="stat-item"><strong>${unread}</strong><span>غير مقروءة</span></div>
            <div class="stat-item"><strong>${replied}</strong><span>مُجاب عليها</span></div>
          </div>
          <div class="share-row">
            <div class="share-link-box">
              <span class="share-label">${t('share_link')}</span>
              <span class="share-url" dir="ltr">${shareUrl}</span>
              <button class="icon-btn" onclick="app.copyLink('${shareUrl}')" title="${t('btn_copy')}">${icons.copy}</button>
            </div>
          </div>
          <div class="quick-share">
            <button class="btn btn-outline btn-sm" onclick="app.shareTo('instagram','${shareUrl}','${shareText}')">
              ${icons.instagram} إنستغرام
            </button>
            <button class="btn btn-outline btn-sm" onclick="app.shareTo('x','${shareUrl}','${shareText}')">
              ${icons.twitter} X
            </button>
          </div>
        </div>
        <div class="inbox-toolbar">
          <h2>${t('inbox_title')}</h2>
          <span class="pill">${filtered.length} ${t('msgs_count')}</span>
        </div>
        <div class="settings-list">
          <button class="settings-item glass-card" onclick="app.navigate('blocked')">
            <div class="settings-item-label">${icons.ban} <span>المستخدمون المحظورون</span></div>
            <span class="settings-item-arrow">${icons.forward}</span>
          </button>
          ${isOwner ? `<button class="settings-item glass-card" onclick="app.navigate('analytics')">
            <div class="settings-item-label">${icons.chart} <span>لوحة التحليلات</span></div>
            <span class="settings-item-arrow">${icons.forward}</span>
          </button>` : ''}
          <div class="settings-item glass-card">
            <div class="settings-item-label">${icons.eye} <span>تكبير الخط في المحادثات</span></div>
            <label class="toggle-switch">
              <input type="checkbox" ${state.largeText ? 'checked' : ''} onchange="app.toggleLargeText()">
              <span class="toggle-track"></span>
            </label>
          </div>
        </div>
        <div class="messages-list">
          ${fetchError
            ? `<div class="empty-state glass-card">
                <div class="empty-icon danger-icon">${icons.warn}</div>
                <h3>تعذر تحميل الرسائل</h3>
                <p>${escHtml(fetchError)}</p>
                <button class="btn btn-primary mt-24" onclick="app.renderCurrentView()">إعادة المحاولة</button>
              </div>`
            : filtered.length === 0
            ? `<div class="empty-state glass-card">
                <div class="empty-icon">${icons.msg_circle}</div>
                <h3>صندوق الوارد فارغ</h3>
                <p>انشر رابطك الخاص ليرسل لك الناس رسائل بسرية تامة.</p>
                <button class="btn btn-primary mt-24" onclick="app.copyLink('${shareUrl}')">${icons.link} نسخ رابط الحساب</button>
              </div>`
            : msgsHtml}
        </div>
      </div>`;
    },

    async blocked() {
      const blockedIds = await blocksAPI.getBlockedIds(state.currentUser.id);
      const blockedUsers = await Promise.all(blockedIds.map(id => profilesAPI.getById(id)));
      const valid = blockedUsers.filter(Boolean);
      return `<div class="view active inbox-container">
        <div class="page-header">
          <button class="btn btn-ghost icon-only" onclick="app.navigate('inbox')">${icons.back}</button>
          <h2>المحظورون</h2>
        </div>
        <div class="messages-list">
          ${valid.length === 0
            ? `<div class="empty-state glass-card">
                <div class="empty-icon">${icons.slash}</div>
                <p>لا يوجد مستخدمون محظورون</p>
              </div>`
            : valid.map(u => `
              <div class="glass-card blocked-item">
                <div class="blocked-user">
                  ${u.avatar_url ? `<img src="${u.avatar_url}" class="avatar-sm" alt="">` : `<div class="avatar-sm placeholder-sm">${(u.username||'?').charAt(0).toUpperCase()}</div>`}
                  <span class="blocked-name" dir="ltr">@${escHtml(u.username || u.id)}</span>
                </div>
                <button class="btn btn-outline btn-sm btn-danger-outline" onclick="app.unblockFromList('${u.id}')">
                  ${icons.x} إلغاء الحظر
                </button>
              </div>`).join('')}
        </div>
      </div>`;
    },

    analytics() {
      return `<div class="view active inbox-container">
        <div class="page-header">
          <button class="btn btn-ghost icon-only" onclick="app.navigate('inbox')">${icons.back}</button>
          <h2>لوحة التحليلات</h2>
        </div>
        <div class="analytics-grid">
          <div class="glass-card stat-card">
            ${icons.users}
            <h3>${state._localUsers.length}</h3>
            <p>إجمالي المستخدمين</p>
          </div>
          <div class="glass-card stat-card">
            ${icons.inbox}
            <h3>${state._localMessages.length}</h3>
            <p>إجمالي الرسائل</p>
          </div>
        </div>
        <p class="text-muted" style="text-align:center;padding:20px;font-size:0.9rem;">البيانات التفصيلية تتطلب استعلامات مباشرة على Supabase.</p>
      </div>`;
    }
  },

  setupOnboardingEvents() {},

  nextOnboard(step) {
    document.getElementById(`onboard-${step}`)?.classList.add('hidden');
    document.getElementById(`onboard-${step + 1}`)?.classList.remove('hidden');
  },

  setupLoginEvents() {
    const form = document.getElementById('login-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('login-submit-btn');
      const em = document.getElementById('login-email').value.trim();
      const pw = document.getElementById('login-password').value;
      setLoading(btn, true, `${icons.spin} جاري الدخول...`);
      if (supabaseClient) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email: em, password: pw });
        if (error) {
          console.error('[login] supabase error:', error);
          const code = (error.code || error.name || '').toLowerCase();
          const msg = (error.message || '').toLowerCase();
          let friendly = t('err_invalid_creds');
          if (msg.includes('email not confirmed') || code.includes('email_not_confirmed')) {
            friendly = 'البريد لم يُؤكَّد بعد. تحقق من صندوق الوارد أو راسلنا لإعادة الإرسال.';
          } else if (msg.includes('invalid login credentials') || code.includes('invalid_credentials')) {
            friendly = 'البريد أو كلمة المرور غير صحيحة. اضغط "نسيت كلمة المرور" لإعادة تعيينها.';
          } else if (msg.includes('rate limit') || code.includes('over_request_rate')) {
            friendly = 'محاولات كثيرة، انتظر قليلاً ثم أعد المحاولة.';
          } else if (error.message) {
            friendly = error.message;
          }
          showToast(friendly, 'error');
        } else {
          this.authPromise = null;
          await this.initAuth();
          if (state.currentUser) {
            this.navigate('inbox');
            showToast(`أهلاً بك @${state.currentUser.username}`, 'success');
          }
        }
      } else {
        const u = state._localUsers.find(u => u.email === em && u.password === pw);
        if (u) {
          state.currentUser = { id: u.id, username: u.username, email: u.email };
          saveLocal();
          this.navigate('inbox');
          showToast(`أهلاً بك @${u.username}`, 'success');
        } else {
          showToast(t('err_invalid_creds'), 'error');
        }
      }
      setLoading(btn, false, `${icons.login} ${t('btn_login_submit')}`);
    });

    const forgot = document.getElementById('forgot-password-link');
    if (forgot) {
      forgot.addEventListener('click', async (e) => {
        e.preventDefault();
        const em = document.getElementById('login-email').value.trim();
        if (!em) { showToast('اكتب بريدك الإلكتروني أولاً ثم اضغط الرابط', 'info'); return; }
        if (!supabaseClient) { showToast('الخدمة غير متاحة', 'error'); return; }
        const redirectTo = `${location.origin}${location.pathname}#login`;
        const { error } = await supabaseClient.auth.resetPasswordForEmail(em, { redirectTo });
        if (error) {
          console.error('[forgot-password] supabase error:', error);
          showToast(error.message || 'تعذر إرسال رابط إعادة التعيين', 'error');
        } else {
          showToast('أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك', 'success');
        }
      });
    }
  },

  setupRegisterEvents() {
    const form = document.getElementById('register-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('reg-submit-btn');
      const un = document.getElementById('reg-username').value.trim();
      const em = document.getElementById('reg-email').value.trim();
      const pw = document.getElementById('reg-password').value;
      setLoading(btn, true, `${icons.spin} جاري التسجيل...`);
      if (state._localUsers.some(u => u.username === un)) {
        showToast(t('err_user_exists'), 'error');
        setLoading(btn, false, `${icons.register} ${t('btn_register_submit')}`);
        return;
      }
      if (supabaseClient) {
        const { data, error } = await supabaseClient.auth.signUp({
          email: em, password: pw, options: { data: { full_name: un } }
        });
        if (error) {
          showToast(error.message.includes('already') ? 'البريد مسجل مسبقاً' : 'خطأ في التسجيل', 'error');
        } else {
          const newUser = { id: data.user?.id || generateId(), username: un, email: em, password: pw };
          state._localUsers.push(newUser);
          state.currentUser = { id: newUser.id, username: un, email: em };
          saveLocal();
          this.authPromise = null;
          await this.initAuth();
          this.navigate('inbox');
          showToast(t('reg_success'), 'success');
        }
      } else {
        const newUser = { id: generateId(), username: un, email: em, password: pw };
        state._localUsers.push(newUser);
        state.currentUser = { id: newUser.id, username: un, email: em };
        saveLocal();
        this.navigate('inbox');
        showToast(t('reg_success'), 'success');
      }
      setLoading(btn, false, `${icons.register} ${t('btn_register_submit')}`);
    });
  },

  async setupProfileEvents(username) {
    const user = await profilesAPI.getByUsername(username);
    if (!user) return;
    if (state.currentUser && state.currentUser.id !== user.id) {
      const isBlocked = await blocksAPI.isBlocked(state.currentUser.id, user.id);
      const btn = document.getElementById(`block-btn-${user.id}`);
      if (btn) {
        btn.dataset.blocked = isBlocked ? 'true' : 'false';
        btn.querySelector('.block-btn-text').textContent = isBlocked ? 'إلغاء الحظر' : 'حظر هذا المرسل';
      }
    }
    const ta = document.getElementById('msg-content');
    const counter = document.getElementById('char-counter');
    if (ta && counter) {
      ta.addEventListener('input', () => {
        const left = 300 - ta.value.length;
        counter.textContent = `${left} ${t('chars_left')}`;
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
      });
    }
    const form = document.getElementById('send-msg-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = ta?.value?.trim();
      if (!content) return;
      const errEl = document.getElementById('send-block-error');
      if (errEl) errEl.classList.add('hidden');
      if (state.currentUser) {
        const isBlocked = await blocksAPI.isBlocked(user.id, state.currentUser.id);
        if (isBlocked) { if (errEl) errEl.classList.remove('hidden'); return; }
      }
      const btn = form.querySelector('.send-btn');
      setLoading(btn, true);
      const result = await messagesAPI.send(user.id, content, state.currentUser?.id || null);
      if (result.ok) {
        if (ta) { ta.value = ''; ta.style.height = 'auto'; }
        if (counter) counter.textContent = `300 ${t('chars_left')}`;
        showToast(t('msg_sent'), 'success');
        this.celebrateSend(btn);
      } else {
        const detail = result.error?.message || (typeof result.error === 'string' ? result.error : '');
        console.error('[send-msg-form] send failed:', result.error);
        showToast(detail ? `تعذر الإرسال: ${detail}` : 'تعذر الإرسال، حاول مجدداً', 'error');
      }
      setLoading(btn, false);
    });
  },

  setupInboxEvents() {
    if (!state.currentUser) return;
    (async () => {
      await messagesAPI.markRead(state.currentUser.id);
      this.updateNav();
    })();
    this.subscribeInboxRealtime(state.currentUser.id);
  },

  // --- Realtime: live updates of the inbox without manual refresh ---
  subscribeInboxRealtime(userId) {
    if (!supabaseClient || !userId) return;
    // Tear down any previous channel so we don't stack subscriptions.
    if (this._inboxChannel) {
      try { supabaseClient.removeChannel(this._inboxChannel); } catch {}
      this._inboxChannel = null;
    }
    const channel = supabaseClient
      .channel(`inbox-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      }, (payload) => {
        // Only refresh while the user is still on the inbox view.
        if (this.currentRoute === 'inbox' && state.currentUser?.id === userId) {
          this.renderCurrentView();
        }
        this.updateNav();
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('[realtime] inbox channel status:', status);
        }
      });
    this._inboxChannel = channel;
  },

  toggleReplyArea(msgId) {
    const area = document.getElementById(`reply-area-${msgId}`);
    if (!area) return;
    area.classList.toggle('hidden');
    if (!area.classList.contains('hidden')) area.querySelector('textarea')?.focus();
  },

  async submitReply(e, msgId) {
    e.preventDefault();
    const textarea = e.target.querySelector('textarea');
    const replyText = textarea?.value?.trim();
    if (!replyText) return;
    const btn = e.target.querySelector('button[type="submit"]');
    setLoading(btn, true);
    const result = await messagesAPI.reply(msgId, replyText);
    if (result.ok) {
      showToast(t('reply_added'), 'success');
      this.renderCurrentView();
    } else {
      const detail = result.error?.message || '';
      showToast(detail ? `تعذر إضافة الرد: ${detail}` : 'تعذر إضافة الرد', 'error');
      setLoading(btn, false);
    }
  },

  celebrateSend(button) {
    if (!button) return;
    const rect = button.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
      const p = document.createElement('div');
      Object.assign(p.style, {
        position: 'fixed', left: `${rect.left + rect.width / 2}px`, top: `${rect.top + rect.height / 2}px`,
        width: '8px', height: '8px', borderRadius: '50%', zIndex: '9999', pointerEvents: 'none',
        backgroundColor: i % 2 === 0 ? 'var(--primary)' : 'var(--secondary)'
      });
      document.body.appendChild(p);
      const angle = Math.random() * Math.PI * 2;
      const vel = 2 + Math.random() * 5;
      p.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${Math.cos(angle) * vel * 20}px, ${Math.sin(angle) * vel * 20}px) scale(0)`, opacity: 0 }
      ], { duration: 600 + Math.random() * 400, easing: 'ease-out' }).onfinish = () => p.remove();
    }
  },

  initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const colors = ['#8a2be2', '#ff007f', '#00f0ff'];
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      Object.assign(p.style, {
        width: `${Math.random() * 4 + 2}px`, height: `${Math.random() * 4 + 2}px`,
        left: `${Math.random() * 100}%`, bottom: '-10px',
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        animationDelay: `${Math.random() * 20}s`,
        animationDuration: `${Math.random() * 10 + 10}s`
      });
      container.appendChild(p);
    }
  },

  initCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    if (!cursor || !follower) return;
    let mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    });
    const render = () => {
      cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
      follower.style.left = cx + 'px'; follower.style.top = cy + 'px';
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }
};

// --- Helpers ---
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function setLoading(btn, isLoading, originalHtml) {
  if (!btn) return;
  if (isLoading) {
    btn._originalHtml = originalHtml || btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="btn-spin">${icons.spin}</span>`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn._originalHtml || originalHtml || btn.innerHTML;
  }
}

window.app = app;
document.addEventListener('DOMContentLoaded', () => app.init());
