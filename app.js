/**
 * Whispr - Anonymous Messaging App
 * Pure HTML/CSS/JS Implementation
 */

// --- Constants & Translations ---
const TRANSLATIONS = {
    ar: {
        logo: "Whispr",
        lang_toggle: "EN",
        nav_home: "الرئيسية",
        nav_login: "دخول",
        nav_register: "تسجيل",
        nav_inbox: "الوارد",
        nav_profile: "ملفي",
        nav_logout: "خروج",
        
        hero_title: "استقبل رسائل مجهولة",
        hero_subtitle: "آراء صريحة من أصدقائك بشكل مجهول تام",
        btn_start: "ابدأ الآن",
        btn_learn: "كيف يعمل؟",
        
        login_title: "تسجيل الدخول",
        login_subtitle: "مرحباً بعودتك إلى Whispr",
        email_label: "البريد الإلكتروني",
        email_ph: "أدخل بريدك الإلكتروني",
        password_label: "كلمة المرور",
        password_ph: "أدخل كلمة المرور",
        btn_login_submit: "دخول",
        no_account: "ليس لديك حساب؟",
        create_account: "أنشئ حساباً",
        
        register_title: "حساب جديد",
        register_subtitle: "انضم إلينا وابدأ باستقبال الرسائل",
        username_label: "اسم المستخدم",
        username_ph: "أدخل اسم المستخدم",
        btn_register_submit: "تسجيل",
        have_account: "لديك حساب بالفعل؟",
        login_now: "سجل دخولك",
        
        profile_title: "أرسل رسالة مجهولة",
        bio_default: "أنتظر رسائلكم 🤫",
        msg_ph: "اكتب رسالتك هنا...",
        btn_send: "إرسال الرسالة",
        chars_left: "حرف متبقي",
        
        inbox_title: "صندوق الوارد",
        msgs_count: "رسالة",
        reply_ph: "اكتب ردك العلني هنا...",
        btn_reply: "رد",
        reply_label: "ردك:",
        no_messages: "صندوق الوارد فارغ. شارك رابطك للحصول على رسائل!",
        share_link: "انسخ رابطك وشاركه",
        btn_copy: "نسخ الرابط",
        
        err_user_not_found: "المستخدم غير موجود",
        msg_sent: "تم إرسال الرسالة بنجاح!",
        link_copied: "تم نسخ الرابط بنجاح!",
        reply_added: "تمت إضافة الرد بنجاح",
        reg_success: "تم التسجيل بنجاح!",
        block_success: "تم حظر المرسل بنجاح",
        avatar_updated: "تم تحديث الصورة الشخصية",
        
        analytics_title: "إحصائيات حسابك",
        stat_msgs: "الرسائل",
        stat_views: "الزيارات"
    },
    en: {
        logo: "Whispr",
        lang_toggle: "AR",
        nav_home: "Home",
        nav_login: "Login",
        nav_register: "Register",
        nav_inbox: "Inbox",
        nav_profile: "Profile",
        nav_logout: "Logout",
        
        hero_title: "Receive Anonymous Messages",
        hero_subtitle: "Honest feedback from your friends, completely anonymously.",
        btn_start: "Start Now",
        btn_learn: "How it works?",
        
        login_title: "Welcome Back",
        login_subtitle: "Login to your Whispr account",
        email_label: "Email",
        email_ph: "Enter your email",
        password_label: "Password",
        password_ph: "Enter password",
        btn_login_submit: "Login",
        no_account: "Don't have an account?",
        create_account: "Create one",
        
        register_title: "Create Account",
        register_subtitle: "Join us and start receiving messages",
        username_label: "Username",
        username_ph: "Enter username",
        btn_register_submit: "Register",
        have_account: "Already have an account?",
        login_now: "Login now",
        
        profile_title: "Send an anonymous message",
        bio_default: "Waiting for your messages 🤫",
        msg_ph: "Write your message here...",
        btn_send: "Send Message",
        chars_left: "chars left",
        
        inbox_title: "Your Inbox",
        msgs_count: "Messages",
        reply_ph: "Write your public reply here...",
        btn_reply: "Reply",
        reply_label: "Your reply:",
        no_messages: "Inbox is empty. Share your link to get messages!",
        share_link: "Copy & share your link",
        btn_copy: "Copy Link",
        
        err_user_not_found: "User not found",
        msg_sent: "Message sent successfully!",
        link_copied: "Link copied to clipboard!",
        reply_added: "Reply added successfully",
        reg_success: "Registered successfully!",
        block_success: "Sender blocked successfully",
        avatar_updated: "Avatar updated successfully",
        
        analytics_title: "Your Analytics",
        stat_msgs: "Messages",
        stat_views: "Views"
    }
};

// --- Supabase Setup ---
const supabaseUrl = 'https://hhbhmhyqgszvgkaacbvm.supabase.co';
const supabaseKey = 'sb_publishable_H_ZX2gdYhq606lCTUqXPQA_KrnRefL_';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- App State ---
const state = {
    lang: localStorage.getItem('whispr_lang') || 'ar',
    theme: localStorage.getItem('whispr_theme') || 'dark',
    currentUser: null,
    unreadCount: 0,
    clientIp: null
};

// --- Utility Functions ---
const saveState = () => {
    localStorage.setItem('whispr_lang', state.lang);
    localStorage.setItem('whispr_theme', state.theme);
};

const t = (key) => TRANSLATIONS[state.lang][key] || key;

const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    return d.toLocaleDateString(state.lang === 'ar' ? 'ar-SA' : 'en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
    });
};

const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Fetch client IP for blocking
fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => state.clientIp = data.ip)
    .catch(() => console.log('IP fetch failed'));

// --- Core Application Logic ---
const app = {
    async init() {
        this.root = document.getElementById('app-root');
        this.applyTheme();
        this.applyLanguage();
        this.setupEventListeners();
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (profile) {
                state.currentUser = profile;
                this.setupRealtime();
                await this.fetchUnreadCount();
            }
        }
        
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                state.currentUser = null;
                state.unreadCount = 0;
                supabase.removeAllChannels();
                this.navigate('home');
            }
        });

        this.handleRoute();
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Show bottom nav
        document.getElementById('bottom-nav').style.display = 'block';
    },

    setupRealtime() {
        if (!state.currentUser) return;
        supabase.channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${state.currentUser.id}` }, payload => {
                showToast(state.lang === 'ar' ? 'لديك رسالة جديدة!' : 'New message arrived!', 'success');
                this.fetchUnreadCount();
                if (this.currentRoute === 'inbox') {
                    this.renderCurrentView();
                }
            })
            .subscribe();
    },

    async fetchUnreadCount() {
        if (!state.currentUser) return;
        const now = new Date().toISOString();
        const { count } = await supabase.from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', state.currentUser.id)
            .eq('is_read', false)
            .gt('expires_at', now);
            
        state.unreadCount = count || 0;
        this.updateNav();
    },

    setupEventListeners() {
        document.getElementById('lang-toggle').addEventListener('click', () => {
            state.lang = state.lang === 'ar' ? 'en' : 'ar';
            saveState();
            this.applyLanguage();
            this.renderCurrentView();
        });

        document.getElementById('theme-toggle').addEventListener('click', () => {
            state.theme = state.theme === 'dark' ? 'light' : 'dark';
            saveState();
            this.applyTheme();
        });
    },

    applyTheme() {
        document.body.setAttribute('data-theme', state.theme);
        const icon = document.getElementById('theme-icon');
        if (state.theme === 'dark') {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    },

    applyLanguage() {
        const html = document.documentElement;
        html.lang = state.lang;
        html.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
        document.querySelector('.lang-text').textContent = TRANSLATIONS[state.lang].lang_toggle;
        this.updateNav();
    },

    navigate(route) {
        window.location.hash = route;
    },

    async handleRoute() {
        const hash = window.location.hash.slice(1) || 'home';
        this.currentRoute = hash;
        await this.renderCurrentView();
        this.updateNav();
        window.scrollTo(0, 0);
    },

    updateNav() {
        const container = document.getElementById('bottom-nav-container');
        const r = this.currentRoute.split('/')[0];
        
        if (state.currentUser) {
            container.innerHTML = `
                <a class="nav-item ${r === 'home' ? 'active' : ''}" onclick="app.navigate('home')">
                    <i class="fa-solid fa-house"></i>
                    <span>${t('nav_home')}</span>
                </a>
                <a class="nav-item ${r === 'inbox' ? 'active' : ''}" onclick="app.navigate('inbox')">
                    <i class="fa-solid fa-inbox"></i>
                    <span>${t('nav_inbox')}</span>
                    ${state.unreadCount > 0 ? `<div class="unread-badge">${state.unreadCount}</div>` : ''}
                </a>
                <a class="nav-item ${r === 'u' ? 'active' : ''}" onclick="app.navigate('u/${state.currentUser.username}')">
                    <i class="fa-solid fa-user"></i>
                    <span>${t('nav_profile')}</span>
                </a>
                <a class="nav-item" onclick="app.logout()">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span>${t('nav_logout')}</span>
                </a>
            `;
        } else {
            container.innerHTML = `
                <a class="nav-item ${r === 'home' ? 'active' : ''}" onclick="app.navigate('home')">
                    <i class="fa-solid fa-house"></i>
                    <span>${t('nav_home')}</span>
                </a>
                <a class="nav-item ${r === 'login' ? 'active' : ''}" onclick="app.navigate('login')">
                    <i class="fa-solid fa-right-to-bracket"></i>
                    <span>${t('nav_login')}</span>
                </a>
                <a class="nav-item ${r === 'register' ? 'active' : ''}" onclick="app.navigate('register')">
                    <i class="fa-solid fa-user-plus"></i>
                    <span>${t('nav_register')}</span>
                </a>
            `;
        }
    },

    async renderCurrentView() {
        const routeParts = this.currentRoute.split('/');
        const mainRoute = routeParts[0];

        let content = '';
        let profileUser = null;

        switch (mainRoute) {
            case 'home':
                content = this.views.home();
                break;
            case 'login':
                if (state.currentUser) return this.navigate('inbox');
                content = this.views.login();
                break;
            case 'register':
                if (state.currentUser) return this.navigate('inbox');
                content = this.views.register();
                break;
            case 'inbox':
                if (!state.currentUser) return this.navigate('login');
                content = await this.views.inbox();
                break;
            case 'u':
                if (routeParts[1]) {
                    const result = await this.views.profile(routeParts[1]);
                    content = result.html;
                    profileUser = result.user;
                } else {
                    this.navigate('home');
                    return;
                }
                break;
            default:
                content = this.views.home();
        }

        this.root.innerHTML = content;
        
        if (mainRoute === 'u' && profileUser) {
            this.setupProfileEvents(profileUser);
        } else if (mainRoute === 'login') {
            this.setupLoginEvents();
        } else if (mainRoute === 'register') {
            this.setupRegisterEvents();
        } else if (mainRoute === 'inbox') {
            this.setupInboxEvents();
        }
    },

    // --- Actions ---
    async logout() {
        await supabase.auth.signOut();
        this.navigate('home');
        showToast(t('nav_logout'), 'success');
    },

    copyLink(url) {
        navigator.clipboard.writeText(url).then(() => {
            showToast(t('link_copied'), 'success');
        });
    },
    
    async blockIp(ip) {
        if(!confirm(state.lang === 'ar' ? 'هل أنت متأكد من حظر هذا المرسل؟' : 'Are you sure you want to block this sender?')) return;
        await supabase.from('blocked_ips').insert({ user_id: state.currentUser.id, ip_address: ip });
        showToast(t('block_success'), 'success');
        this.renderCurrentView();
    },

    async addReaction(msgId, emoji) {
        await supabase.from('reactions').insert({ message_id: msgId, emoji });
        this.renderCurrentView();
    },

    async uploadAvatar(e) {
        const file = e.target.files[0];
        if (!file) return;
        showToast(state.lang === 'ar' ? 'جاري رفع الصورة...' : 'Uploading avatar...', 'info');
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${state.currentUser.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
        if (uploadError) {
            showToast(uploadError.message, 'error');
            return;
        }
        
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', state.currentUser.id);
        state.currentUser.avatar_url = data.publicUrl;
        showToast(t('avatar_updated'), 'success');
        this.renderCurrentView();
    },

    // --- Views ---
    views: {
        home: () => `
            <div class="view active hero">
                <h1 class="hero-title text-gradient">${t('hero_title')}</h1>
                <p class="hero-subtitle">${t('hero_subtitle')}</p>
                <div class="hero-actions">
                    <button class="btn btn-primary" onclick="app.navigate('register')">
                        <i class="fa-solid fa-rocket"></i> ${t('btn_start')}
                    </button>
                    <button class="btn btn-outline" onclick="app.navigate('login')">
                        ${t('btn_login_submit')}
                    </button>
                </div>
            </div>
        `,

        login: () => `
            <div class="view active auth-wrapper">
                <div class="glass-card auth-card">
                    <div class="auth-header">
                        <h2 class="auth-title text-gradient">${t('login_title')}</h2>
                        <p class="auth-subtitle">${t('login_subtitle')}</p>
                    </div>
                    <form id="login-form">
                        <div class="form-group">
                            <label class="form-label">${t('email_label')}</label>
                            <input type="email" id="login-email" class="form-control" placeholder="${t('email_ph')}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${t('password_label')}</label>
                            <input type="password" id="login-password" class="form-control" placeholder="${t('password_ph')}" required>
                        </div>
                        <button type="submit" class="btn btn-primary">${t('btn_login_submit')}</button>
                    </form>
                    <div class="auth-footer">
                        ${t('no_account')} <a onclick="app.navigate('register')" class="auth-link">${t('create_account')}</a>
                    </div>
                </div>
            </div>
        `,

        register: () => `
            <div class="view active auth-wrapper">
                <div class="glass-card auth-card">
                    <div class="auth-header">
                        <h2 class="auth-title text-gradient">${t('register_title')}</h2>
                        <p class="auth-subtitle">${t('register_subtitle')}</p>
                    </div>
                    <form id="register-form">
                        <div class="form-group">
                            <label class="form-label">${t('username_label')}</label>
                            <input type="text" id="reg-username" class="form-control" placeholder="${t('username_ph')}" required pattern="[A-Za-z0-9_]+" title="Only letters, numbers, and underscores">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${t('email_label')}</label>
                            <input type="email" id="reg-email" class="form-control" placeholder="${t('email_ph')}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${t('password_label')}</label>
                            <input type="password" id="reg-password" class="form-control" placeholder="${t('password_ph')}" required minlength="6">
                        </div>
                        <button type="submit" class="btn btn-primary">${t('btn_register_submit')}</button>
                    </form>
                    <div class="auth-footer">
                        ${t('have_account')} <a onclick="app.navigate('login')" class="auth-link">${t('login_now')}</a>
                    </div>
                </div>
            </div>
        `,

        profile: async (username) => {
            const { data: user, error } = await supabase.from('profiles').select('*').eq('username', username).single();
            if (error || !user) {
                return { html: `<div class="view active empty-state"><i class="fa-solid fa-ghost empty-icon"></i><h2>${t('err_user_not_found')}</h2></div>`, user: null };
            }
            
            // Record profile view
            if (!state.currentUser || state.currentUser.id !== user.id) {
                supabase.from('profile_views').insert({ profile_id: user.id }).then();
            }

            const now = new Date().toISOString();
            const { data: messages } = await supabase.from('messages')
                .select('id, content, created_at, replies(content, created_at), reactions(emoji)')
                .eq('recipient_id', user.id)
                .gt('expires_at', now);
            
            const publicReplies = (messages || []).filter(m => m.replies && m.replies.length > 0).map(m => {
                const reactionsCount = {};
                if(m.reactions) m.reactions.forEach(r => { reactionsCount[r.emoji] = (reactionsCount[r.emoji]||0)+1; });
                return {
                    id: m.id,
                    content: m.content,
                    timestamp: new Date(m.created_at).getTime(),
                    reply: m.replies[0].content,
                    reactions: reactionsCount
                };
            }).sort((a,b) => b.timestamp - a.timestamp);

            const isOwner = state.currentUser && state.currentUser.id === user.id;
            const shareUrl = window.location.origin + window.location.pathname + '#u/' + user.username;

            const html = `
                <div class="view active">
                    <div class="profile-header">
                        <div class="avatar-container">
                            ${user.avatar_url 
                                ? `<img src="${user.avatar_url}" class="avatar" alt="Avatar">`
                                : `<div class="avatar-placeholder">${username.charAt(0).toUpperCase()}</div>`
                            }
                            ${isOwner ? `
                                <label class="upload-btn">
                                    <i class="fa-solid fa-camera"></i>
                                    <input type="file" id="avatar-upload" accept="image/*" class="d-none" onchange="app.uploadAvatar(event)">
                                </label>
                            ` : ''}
                        </div>
                        <h2 class="profile-name">@${username}</h2>
                        <p class="text-muted">${user.bio || t('bio_default')}</p>
                        ${isOwner ? `
                            <div style="margin-top: 16px;">
                                <button class="btn btn-outline" style="border-radius:30px; min-height:40px;" onclick="app.copyLink('${shareUrl}')">
                                    <i class="fa-solid fa-link"></i> ${t('btn_copy')}
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${!isOwner ? `
                    <div class="glass-card send-message-card">
                        <div class="msg-header">
                            <i class="fa-solid fa-paper-plane"></i>
                            <h3>${t('profile_title')}</h3>
                        </div>
                        <form id="send-msg-form">
                            <div class="form-group">
                                <textarea id="msg-content" class="form-control" placeholder="${t('msg_ph')}" required maxlength="300"></textarea>
                            </div>
                            <div class="msg-footer">
                                <span class="char-count" id="char-counter">300 ${t('chars_left')}</span>
                                <button type="submit" class="btn btn-primary" style="width:auto; padding:0 20px;">
                                    <i class="fa-solid fa-lock"></i> ${t('btn_send')}
                                </button>
                            </div>
                        </form>
                    </div>
                    ` : ''}
                    
                    ${publicReplies.length > 0 ? `
                        <div class="inbox-container">
                            <h3 style="margin-bottom:20px;text-align:center;">الردود العامة</h3>
                            <div class="messages-grid">
                                ${publicReplies.map(msg => `
                                    <div class="glass-card message-card">
                                        <div class="msg-time"><i class="fa-regular fa-clock"></i> ${formatDate(msg.timestamp)}</div>
                                        <div class="msg-content">"${msg.content}"</div>
                                        <div class="reply-content">
                                            <div class="reply-label">${t('reply_label')}</div>
                                            <div>${msg.reply}</div>
                                        </div>
                                        <div class="reactions-bar">
                                            ${['❤️','😂','🔥','😮','😢'].map(emoji => `
                                                <button class="reaction-btn" onclick="app.addReaction('${msg.id}', '${emoji}')">
                                                    ${emoji} <span class="reaction-count">${msg.reactions[emoji] || 0}</span>
                                                </button>
                                            `).join('')}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
            return { html, user };
        },

        inbox: async () => {
            const user = state.currentUser;
            const now = new Date().toISOString();
            
            // Fetch Blocked IPs
            const { data: blocked } = await supabase.from('blocked_ips').select('ip_address').eq('user_id', user.id);
            const blockedIps = (blocked || []).map(b => b.ip_address);
            
            // Fetch Messages
            const { data: messages } = await supabase.from('messages')
                .select('id, content, created_at, sender_ip, is_read, replies(content, created_at), reactions(emoji)')
                .eq('recipient_id', user.id)
                .gt('expires_at', now)
                .order('created_at', { ascending: false });

            const myMessages = (messages || [])
                .filter(m => !blockedIps.includes(m.sender_ip)) // Client-side filter
                .map(m => {
                    const reactionsCount = {};
                    if(m.reactions) m.reactions.forEach(r => { reactionsCount[r.emoji] = (reactionsCount[r.emoji]||0)+1; });
                    return {
                        id: m.id,
                        content: m.content,
                        sender_ip: m.sender_ip,
                        is_read: m.is_read,
                        timestamp: new Date(m.created_at).getTime(),
                        reply: m.replies && m.replies.length > 0 ? m.replies[0].content : null,
                        reactions: reactionsCount
                    };
                });

            // Analytics
            const { count: msgCount } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('recipient_id', user.id);
            const { count: viewsCount } = await supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('profile_id', user.id);

            return `
                <div class="view active inbox-container">
                    <div class="analytics-dashboard">
                        <div class="stat-card">
                            <div class="stat-value">${msgCount || 0}</div>
                            <div class="stat-label">${t('stat_msgs')}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${viewsCount || 0}</div>
                            <div class="stat-label">${t('stat_views')}</div>
                        </div>
                    </div>

                    <div class="inbox-header">
                        <h2>${t('inbox_title')}</h2>
                        <div class="stats-pill">
                            <i class="fa-solid fa-envelope-open-text"></i> ${myMessages.length} ${t('msgs_count')}
                        </div>
                    </div>
                    
                    <div class="messages-grid">
                        ${myMessages.length === 0 ? `
                            <div class="glass-card empty-state">
                                <i class="fa-solid fa-ghost empty-icon"></i>
                                <p>${t('no_messages')}</p>
                            </div>
                        ` : myMessages.map(msg => `
                            <div class="glass-card message-card" style="${!msg.is_read ? 'border-color: var(--primary);' : ''}">
                                <div class="msg-time"><i class="fa-regular fa-clock"></i> ${formatDate(msg.timestamp)}</div>
                                <div class="msg-content">"${msg.content}"</div>
                                
                                ${msg.reply ? `
                                    <div class="reply-content">
                                        <div class="reply-label">${t('reply_label')}</div>
                                        <div>${msg.reply}</div>
                                    </div>
                                ` : `
                                    <div class="msg-actions">
                                        <button class="btn btn-outline" style="min-height: 36px; padding: 0 16px; font-size: 0.9rem;" onclick="document.getElementById('reply-area-${msg.id}').classList.toggle('active')">
                                            <i class="fa-solid fa-reply"></i> ${t('btn_reply')}
                                        </button>
                                        ${msg.sender_ip ? `
                                        <button class="btn-icon" style="width:36px; height:36px;" onclick="app.blockIp('${msg.sender_ip}')" title="Block Sender">
                                            <i class="fa-solid fa-ban text-danger"></i>
                                        </button>
                                        ` : ''}
                                    </div>
                                    <div class="msg-reply-area" id="reply-area-${msg.id}">
                                        <form onsubmit="app.submitReply(event, '${msg.id}')">
                                            <textarea class="form-control" placeholder="${t('reply_ph')}" required style="min-height: 80px; margin-bottom: 10px;"></textarea>
                                            <button type="submit" class="btn btn-primary" style="min-height: 40px;">${t('btn_reply')}</button>
                                        </form>
                                    </div>
                                `}
                                <div class="reactions-bar">
                                    ${['❤️','😂','🔥','😮','😢'].map(emoji => `
                                        <button class="reaction-btn" onclick="app.addReaction('${msg.id}', '${emoji}')">
                                            ${emoji} <span class="reaction-count">${msg.reactions[emoji] || 0}</span>
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    },

    // --- Form Handlers ---
    setupLoginEvents() {
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.disabled = true;

            const em = document.getElementById('login-email').value;
            const pw = document.getElementById('login-password').value;
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email: em,
                password: pw,
            });
            
            if (error) {
                showToast(t('err_invalid_creds'), 'error');
            } else if (data.user) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
                if (profile) {
                    state.currentUser = profile;
                    this.setupRealtime();
                    await this.fetchUnreadCount();
                    this.navigate('inbox');
                    showToast(`أهلاً بك @${profile.username}`, 'success');
                }
            }
            btn.disabled = false;
        });
    },

    setupRegisterEvents() {
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.disabled = true;

            const un = document.getElementById('reg-username').value;
            const em = document.getElementById('reg-email').value;
            const pw = document.getElementById('reg-password').value;
            
            const { data, error } = await supabase.auth.signUp({
                email: em,
                password: pw,
            });
            
            if (error) {
                showToast(error.message, 'error');
                btn.disabled = false;
                return;
            }

            if (data.user) {
                const { error: profileError } = await supabase.from('profiles').insert([
                    { id: data.user.id, username: un, bio: '' }
                ]);
                
                if (profileError) {
                    showToast(profileError.message, 'error');
                } else {
                    const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
                    state.currentUser = p;
                    this.setupRealtime();
                    this.navigate('inbox');
                    showToast(t('reg_success'), 'success');
                }
            }
            btn.disabled = false;
        });
    },

    setupProfileEvents(user) {
        const form = document.getElementById('send-msg-form');
        if(!form) return;
        
        const ta = document.getElementById('msg-content');
        const counter = document.getElementById('char-counter');
        
        ta.addEventListener('input', () => {
            const left = 300 - ta.value.length;
            counter.textContent = `${left} ${t('chars_left')}`;
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = ta.value.trim();
            if (!content) return;
            
            const btn = e.target.querySelector('button[type="submit"]');
            btn.disabled = true;

            const ip = state.clientIp || 'unknown';
            const { error } = await supabase.from('messages').insert([
                { recipient_id: user.id, content: content, sender_ip: ip }
            ]);
            
            if (error) {
                showToast('حدث خطأ أثناء الإرسال', 'error');
            } else {
                ta.value = '';
                counter.textContent = `300 ${t('chars_left')}`;
                showToast(t('msg_sent'), 'success');
            }
            btn.disabled = false;
        });
    },
    
    setupInboxEvents() {
        if (!state.currentUser) return;
        // Mark all as read when opening inbox
        supabase.from('messages').update({ is_read: true })
            .eq('recipient_id', state.currentUser.id)
            .eq('is_read', false)
            .then(() => {
                state.unreadCount = 0;
                this.updateNav();
            });
    },

    async submitReply(e, msgId) {
        e.preventDefault();
        const textarea = e.target.querySelector('textarea');
        const replyText = textarea.value.trim();
        const btn = e.target.querySelector('button[type="submit"]');
        
        if (replyText) {
            btn.disabled = true;
            const { error } = await supabase.from('replies').insert([
                { message_id: msgId, content: replyText }
            ]);
            
            if (error) {
                showToast(error.message, 'error');
                btn.disabled = false;
            } else {
                showToast(t('reply_added'), 'success');
                this.renderCurrentView(); 
            }
        }
    }
};

// Start app
document.addEventListener('DOMContentLoaded', () => app.init());
