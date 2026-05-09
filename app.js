/**
 * Bawh - Anonymous Messaging App
 * Pure HTML/CSS/JS Implementation
 */

// --- Constants & Translations ---
const TRANSLATIONS = {
    ar: {
        logo: "Whispr",
        lang_toggle: "EN",
        nav_login: "دخول",
        nav_register: "تسجيل جديد",
        nav_inbox: "صندوق الوارد",
        nav_logout: "خروج",
        
        hero_title: "استقبل رسائل مجهولة",
        hero_subtitle: "آراء صريحة من أصدقائك بشكل مجهول تام",
        btn_start: "ابدأ الآن",
        btn_learn: "كيف يعمل؟",
        
        login_title: "تسجيل الدخول",
        login_subtitle: "مرحباً بعودتك إلى Whispr",
        username_label: "اسم المستخدم",
        username_ph: "أدخل اسم المستخدم",
        password_label: "كلمة المرور",
        password_ph: "أدخل كلمة المرور",
        btn_login_submit: "دخول",
        no_account: "ليس لديك حساب؟",
        create_account: "أنشئ حساباً",
        
        register_title: "حساب جديد",
        register_subtitle: "انضم إلينا وابدأ باستقبال الرسائل من أصدقائك",
        email_label: "البريد الإلكتروني",
        email_ph: "أدخل بريدك الإلكتروني",
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
        share_link: "انسخ رابطك وشاركه:",
        btn_copy: "نسخ الرابط",
        
        err_user_exists: "اسم المستخدم موجود مسبقاً",
        err_invalid_creds: "بيانات الدخول غير صحيحة",
        err_user_not_found: "المستخدم غير موجود",
        msg_sent: "تم إرسال الرسالة بنجاح!",
        link_copied: "تم نسخ الرابط!",
        reply_added: "تمت إضافة الرد بنجاح",
        reg_success: "تم التسجيل بنجاح!"
    },
    en: {
        logo: "Whispr",
        lang_toggle: "AR",
        nav_login: "Login",
        nav_register: "Register",
        nav_inbox: "Inbox",
        nav_logout: "Logout",
        
        hero_title: "Receive Anonymous Messages",
        hero_subtitle: "Honest feedback from your friends, completely anonymously.",
        btn_start: "Start Now",
        btn_learn: "How it works?",
        
        login_title: "Welcome Back",
        login_subtitle: "Login to your Whispr account",
        username_label: "Username",
        username_ph: "Enter username",
        password_label: "Password",
        password_ph: "Enter password",
        btn_login_submit: "Login",
        no_account: "Don't have an account?",
        create_account: "Create one",
        
        register_title: "Create Account",
        register_subtitle: "Join us and start receiving messages from your friends",
        email_label: "Email",
        email_ph: "Enter your email",
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
        share_link: "Copy & share your link:",
        btn_copy: "Copy Link",
        
        err_user_exists: "Username already exists",
        err_invalid_creds: "Invalid credentials",
        err_user_not_found: "User not found",
        msg_sent: "Message sent successfully!",
        link_copied: "Link copied to clipboard!",
        reply_added: "Reply added successfully",
        reg_success: "Registered successfully!"
    }
};

// --- Supabase Setup ---
const supabaseUrl = 'https://hhbhmhyqgszvgkaacbvm.supabase.co';
const supabaseKey = 'sb_publishable_H_ZX2gdYhq606lCTUqXPQA_KrnRefL_';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- App State ---
const state = {
    lang: localStorage.getItem('bawh_lang') || 'ar',
    currentUser: null
};

// --- Utility Functions ---
const saveState = () => {
    localStorage.setItem('bawh_lang', state.lang);
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

// --- Core Application Logic ---
const app = {
    async init() {
        this.root = document.getElementById('app-root');
        this.setupEventListeners();
        this.applyLanguage();
        this.initParticles();
        this.initCursor();
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (profile) {
                state.currentUser = { id: profile.id, username: profile.username };
            }
        }
        
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                state.currentUser = null;
                this.navigate('home');
            }
        });

        this.handleRoute();
        window.addEventListener('hashchange', () => this.handleRoute());
    },

    setupEventListeners() {
        document.getElementById('lang-toggle').addEventListener('click', () => {
            state.lang = state.lang === 'ar' ? 'en' : 'ar';
            saveState();
            this.applyLanguage();
            this.renderCurrentView();
        });

        window.addEventListener('scroll', () => {
            const nav = document.querySelector('.navbar');
            if (window.scrollY > 20) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    },

    applyLanguage() {
        const html = document.documentElement;
        html.lang = state.lang;
        html.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
        
        document.querySelector('.lang-text').textContent = TRANSLATIONS[state.lang].lang_toggle;
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = t(key);
            } else {
                el.textContent = t(key);
            }
        });
        
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
    },

    updateNav() {
        const container = document.getElementById('auth-nav-container');
        if (state.currentUser) {
            container.innerHTML = `
                <button class="btn btn-outline" onclick="app.navigate('inbox')">
                    <i class="fa-solid fa-inbox"></i> <span class="hide-mobile">${t('nav_inbox')}</span>
                </button>
                <button class="btn btn-outline" onclick="app.logout()">
                    <i class="fa-solid fa-right-from-bracket"></i>
                </button>
            `;
        } else {
            container.innerHTML = `
                <button class="btn btn-outline" onclick="app.navigate('login')">${t('nav_login')}</button>
                <button class="btn btn-primary" onclick="app.navigate('register')">${t('nav_register')}</button>
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
        }
    },

    // --- Actions ---
    async logout() {
        await supabase.auth.signOut();
        state.currentUser = null;
        this.navigate('home');
        showToast(t('nav_logout'), 'success');
    },

    copyLink(url) {
        navigator.clipboard.writeText(url).then(() => {
            showToast(t('link_copied'), 'success');
        });
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
                        <button type="submit" class="btn btn-primary" style="width: 100%">${t('btn_login_submit')}</button>
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
                        <button type="submit" class="btn btn-primary" style="width: 100%">${t('btn_register_submit')}</button>
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
                return { html: `<div class="view active empty-state"><h2>${t('err_user_not_found')}</h2></div>`, user: null };
            }

            const { data: messages } = await supabase.from('messages')
                .select('id, content, created_at, replies(content, created_at)')
                .eq('recipient_id', user.id);
            
            const publicReplies = (messages || []).filter(m => m.replies && m.replies.length > 0).map(m => ({
                id: m.id,
                content: m.content,
                timestamp: new Date(m.created_at).getTime(),
                reply: m.replies[0].content
            })).sort((a,b) => b.timestamp - a.timestamp);

            const html = `
                <div class="view active">
                    <div class="profile-header">
                        <div class="avatar-container">
                            <div class="avatar-placeholder">${username.charAt(0).toUpperCase()}</div>
                        </div>
                        <h2 class="profile-name">@${username}</h2>
                        <p class="text-muted">${user.bio || t('bio_default')}</p>
                    </div>
                    
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
                                <button type="submit" class="btn btn-primary">
                                    <i class="fa-solid fa-lock"></i> ${t('btn_send')}
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    ${publicReplies.length > 0 ? `
                        <div class="inbox-container">
                            <h3 style="margin-bottom:20px;text-align:center;">الردود السابقة</h3>
                            <div class="messages-grid">
                                ${publicReplies.map(msg => `
                                    <div class="glass-card message-card">
                                        <div class="msg-time"><i class="fa-regular fa-clock"></i> ${formatDate(msg.timestamp)}</div>
                                        <div class="msg-content">"${msg.content}"</div>
                                        <div class="reply-content">
                                            <div class="reply-label">${t('reply_label')}</div>
                                            <div>${msg.reply}</div>
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
            
            const { data: messages } = await supabase.from('messages')
                .select('id, content, created_at, replies(content, created_at)')
                .eq('recipient_id', user.id)
                .order('created_at', { ascending: false });

            const myMessages = (messages || []).map(m => ({
                id: m.id,
                content: m.content,
                timestamp: new Date(m.created_at).getTime(),
                reply: m.replies && m.replies.length > 0 ? m.replies[0].content : null
            }));

            const shareUrl = window.location.origin + window.location.pathname + '#u/' + user.username;

            return `
                <div class="view active inbox-container">
                    <div class="profile-header" style="margin-bottom: 30px;">
                        <h2 class="profile-name">@${user.username}</h2>
                        <div class="share-link-container">
                            <span style="font-size:0.9rem; color:var(--text-muted); white-space:nowrap;">${t('share_link')}</span>
                            <div class="share-url" dir="ltr">${shareUrl}</div>
                            <button class="btn-icon" onclick="app.copyLink('${shareUrl}')" title="${t('btn_copy')}">
                                <i class="fa-regular fa-copy"></i>
                            </button>
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
                            <div class="glass-card message-card">
                                <div class="msg-time"><i class="fa-regular fa-clock"></i> ${formatDate(msg.timestamp)}</div>
                                <div class="msg-content">"${msg.content}"</div>
                                
                                ${msg.reply ? `
                                    <div class="reply-content">
                                        <div class="reply-label">${t('reply_label')}</div>
                                        <div>${msg.reply}</div>
                                    </div>
                                ` : `
                                    <div class="msg-actions">
                                        <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.9rem;" onclick="document.getElementById('reply-area-${msg.id}').classList.toggle('active')">
                                            <i class="fa-solid fa-reply"></i> ${t('btn_reply')}
                                        </button>
                                    </div>
                                    <div class="msg-reply-area" id="reply-area-${msg.id}">
                                        <form onsubmit="app.submitReply(event, '${msg.id}')">
                                            <textarea class="form-control" placeholder="${t('reply_ph')}" required style="min-height: 80px; margin-bottom: 10px;"></textarea>
                                            <button type="submit" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.9rem;">${t('btn_reply')}</button>
                                        </form>
                                    </div>
                                `}
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
                    state.currentUser = { id: profile.id, username: profile.username };
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
                    state.currentUser = { id: data.user.id, username: un };
                    this.navigate('inbox');
                    showToast(t('reg_success'), 'success');
                }
            }
            btn.disabled = false;
        });
    },

    setupProfileEvents(user) {
        const ta = document.getElementById('msg-content');
        const counter = document.getElementById('char-counter');
        
        ta.addEventListener('input', () => {
            const left = 300 - ta.value.length;
            counter.textContent = `${left} ${t('chars_left')}`;
        });

        document.getElementById('send-msg-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = ta.value.trim();
            if (!content) return;
            
            const btn = e.target.querySelector('button[type="submit"]');
            btn.disabled = true;

            const { error } = await supabase.from('messages').insert([
                { recipient_id: user.id, content: content }
            ]);
            
            if (error) {
                showToast('حدث خطأ أثناء الإرسال', 'error');
            } else {
                ta.value = '';
                counter.textContent = `300 ${t('chars_left')}`;
                showToast(t('msg_sent'), 'success');
                this.celebrateSend(btn);
            }
            btn.disabled = false;
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
    },

    // --- Visual Effects ---
    celebrateSend(button) {
        const rect = button.getBoundingClientRect();
        for(let i=0; i<10; i++) {
            const p = document.createElement('div');
            p.style.position = 'fixed';
            p.style.left = (rect.left + rect.width/2) + 'px';
            p.style.top = (rect.top + rect.height/2) + 'px';
            p.style.width = '10px';
            p.style.height = '10px';
            p.style.backgroundColor = i%2===0 ? 'var(--primary)' : 'var(--secondary)';
            p.style.borderRadius = '50%';
            p.style.zIndex = 9999;
            p.style.pointerEvents = 'none';
            document.body.appendChild(p);
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = 2 + Math.random() * 5;
            let tx = Math.cos(angle) * velocity * 20;
            let ty = Math.sin(angle) * velocity * 20;
            
            p.animate([
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
            ], {
                duration: 600 + Math.random() * 400,
                easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)'
            }).onfinish = () => p.remove();
        }
    },

    initParticles() {
        const container = document.getElementById('particles');
        if (!container) return;
        const colors = ['#8a2be2', '#ff007f', '#00f0ff'];
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 4 + 2;
            const left = Math.random() * 100;
            const delay = Math.random() * 20;
            const duration = Math.random() * 10 + 10;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${left}%`;
            particle.style.bottom = `-10px`;
            particle.style.backgroundColor = color;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            
            container.appendChild(particle);
        }
    },

    initCursor() {
        const cursor = document.getElementById('cursor');
        const follower = document.getElementById('cursor-follower');
        
        if (!cursor || !follower) return;

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        const render = () => {
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            
            follower.style.left = cursorX + 'px';
            follower.style.top = cursorY + 'px';
            
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }
};

// Start app
document.addEventListener('DOMContentLoaded', () => app.init());
