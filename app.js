/**
 * Bawh - Anonymous Messaging App
 * Pure HTML/CSS/JS Implementation
 */

// --- Constants & Translations ---
const supabaseUrl = 'https://hhbhmhyqgszvgkaacbvm.supabase.co';
const supabaseKey = 'sb_publishable_H_ZX2gdYhq606lCTUqXPQA_KrnRefL_';
const supabaseClient = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;
window.supabaseClient = supabaseClient;

// --- Backend Data Layer: Blocks ---
const blocksAPI = {
    async isBlocked(blockerId, blockedId) {
        if (!supabaseClient) return false;
        try {
            const { data } = await supabaseClient
                .from('blocks')
                .select('id')
                .eq('blocker_id', blockerId)
                .eq('blocked_id', blockedId)
                .single();
            return !!data;
        } catch (err) {
            console.error("Error checking block:", err);
            return false;
        }
    },
    
    async blockUser(blockerId, blockedId) {
        if (!supabaseClient) return { error: 'No client' };
        
        // Ensure it doesn't already exist to avoid duplicate errors, or just let DB handle unique constraint
        return await supabaseClient
            .from('blocks')
            .insert({ blocker_id: blockerId, blocked_id: blockedId });
    },
    
    async unblockUser(blockerId, blockedId) {
        if (!supabaseClient) return { error: 'No client' };
        return await supabaseClient
            .from('blocks')
            .delete()
            .match({ blocker_id: blockerId, blocked_id: blockedId });
    },
    
    async getBlockedUsers(blockerId) {
        if (!supabaseClient) return [];
        try {
            const { data } = await supabaseClient.from('blocks').select('blocked_id').eq('blocker_id', blockerId);
            return data ? data.map(r => r.blocked_id) : [];
        } catch (e) {
            return [];
        }
    }
};

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

// --- App State ---
const state = {
    lang: localStorage.getItem('bawh_lang') || 'ar',
    theme: localStorage.getItem('whispr_theme') || 'dark',
    largeText: localStorage.getItem('whispr_largetext') === 'true',
    users: JSON.parse(localStorage.getItem('bawh_users')) || [],
    messages: JSON.parse(localStorage.getItem('bawh_messages')) || [],
    currentUser: JSON.parse(localStorage.getItem('bawh_current_user')) || null
};

// --- Utility Functions ---
const saveState = () => {
    localStorage.setItem('bawh_users', JSON.stringify(state.users));
    localStorage.setItem('bawh_messages', JSON.stringify(state.messages));
    localStorage.setItem('bawh_current_user', JSON.stringify(state.currentUser));
    localStorage.setItem('bawh_lang', state.lang);
    localStorage.setItem('whispr_theme', state.theme);
    localStorage.setItem('whispr_largetext', state.largeText);
};

const t = (key) => TRANSLATIONS[state.lang][key] || key;

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(state.lang === 'ar' ? 'ar-SA' : 'en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
    });
};

const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString(state.lang === 'ar' ? 'ar-EG' : 'en-US', { hour: 'numeric', minute:'2-digit', hour12: true });
};

const getDateLabel = (timestamp) => {
    const d = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) {
        return state.lang === 'ar' ? 'اليوم' : 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
        return state.lang === 'ar' ? 'أمس' : 'Yesterday';
    } else {
        return d.toLocaleDateString(state.lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });
    }
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
    init() {
        this.root = document.getElementById('app-root');
        this.applyTheme();
        this.applyLargeText();
        this.setupEventListeners();
        this.applyLanguage();
        this.handleRoute();
        this.initParticles();
        this.initCursor();
        
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Add sample user if empty for demo purposes
        if (state.users.length === 0) {
            state.users.push({
                id: generateId(),
                username: 'demo',
                password: '123',
                email: 'demo@bawh.com',
                bio: 'Demo User - Testing the app'
            });
            saveState();
        }
    },

    setupEventListeners() {
        document.getElementById('lang-toggle').addEventListener('click', () => {
            state.lang = state.lang === 'ar' ? 'en' : 'ar';
            saveState();
            this.applyLanguage();
            this.renderCurrentView();
        });

        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                state.theme = state.theme === 'dark' ? 'light' : 'dark';
                saveState();
                this.applyTheme();
            });
        }

        window.addEventListener('scroll', () => {
            const nav = document.querySelector('.navbar');
            if (window.scrollY > 20) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    },

    applyTheme() {
        document.body.setAttribute('data-theme', state.theme);
        const icon = document.getElementById('theme-icon');
        if (icon) {
            icon.className = state.theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        }
    },

    applyLargeText() {
        if (state.largeText) {
            document.body.classList.add('large-text-enabled');
        } else {
            document.body.classList.remove('large-text-enabled');
        }
    },

    toggleLargeText() {
        state.largeText = !state.largeText;
        saveState();
        this.applyLargeText();
        this.renderCurrentView();
    },

    applyLanguage() {
        const html = document.documentElement;
        html.lang = state.lang;
        html.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
        
        document.querySelector('.lang-text').textContent = TRANSLATIONS[state.lang].lang_toggle;
        
        // Update static translations
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

    async initAuth() {
        if (this.authPromise) return this.authPromise;
        
        this.authPromise = (async () => {
            this.root.innerHTML = `<div class="view active" style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; gap: 16px;"><i class="fa-solid fa-circle-notch fa-spin fa-3x" style="color: var(--primary);"></i><div style="color: var(--text-muted);">جاري التحميل...</div></div>`;
            
            let authEmail = null;
            if (window.supabaseClient) {
                try {
                    const { data } = await window.supabaseClient.auth.getUser();
                    if (data && data.user && data.user.email) {
                        authEmail = data.user.email;
                        app.authUser = data.user;
                        
                        // Fetch from public.profiles
                        try {
                            const { data: profile } = await window.supabaseClient
                                .from('profiles')
                                .select('*')
                                .eq('id', data.user.id)
                                .single();
                                
                            if (profile) {
                                app.currentProfile = profile;
                            }
                        } catch (err) {}
                    }
                } catch (err) {}
            }
            
            if (!authEmail && state.currentUser) {
                const localU = state.users.find(u => u.id === state.currentUser.id);
                if (localU) authEmail = localU.email;
            }

            app.authEmail = authEmail;
            app.isOwner = authEmail === 'admin@whispr.app';
        })();
        
        return this.authPromise;
    },

    async handleRoute() {
        await this.initAuth();
        
        const hash = window.location.hash.slice(1) || 'home';
        
        if (!localStorage.getItem('whispr_onboarding_completed') && hash !== 'onboarding' && hash !== 'login' && hash !== 'register' && !hash.startsWith('u/')) {
            window.location.hash = 'onboarding';
            return;
        }

        if (this.currentRoute !== hash) {
            app.chatLimit = 30; // Reset pagination on route change
        }

        this.currentRoute = hash;
        await this.renderCurrentView();
        this.updateNav();
    },

    finishOnboarding() {
        localStorage.setItem('whispr_onboarding_completed', 'true');
        if (state.currentUser) {
            this.navigate('inbox');
        } else {
            this.navigate('home');
        }
    },

    nextOnboardingStep() {
        const step1 = document.getElementById('onboard-1');
        const step2 = document.getElementById('onboard-2');
        const step3 = document.getElementById('onboard-3');
        
        if (step1 && step1.style.display !== 'none') {
            step1.style.display = 'none';
            step2.style.display = 'block';
        } else if (step2 && step2.style.display !== 'none') {
            step2.style.display = 'none';
            step3.style.display = 'block';
        } else {
            this.finishOnboarding();
        }
    },

    async updateNav() {
        const container = document.getElementById('auth-nav-container');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '8px';
        
        let authEmail = (app.currentProfile && app.currentProfile.email) ? app.currentProfile.email : (app.authEmail || "غير مسجل الدخول");

        const userIndicatorHtml = `
            <div class="current-user-indicator" style="display: flex; align-items: center; font-size: 0.75rem; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 20px; border: 1px solid var(--glass-border); max-width: 120px; margin-left: 4px;" title="${authEmail}">
                <i class="fa-regular fa-user" style="margin-left: 4px;"></i>
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: ltr; display: inline-block; width: 100%; text-align: left;">${authEmail}</span>
            </div>
        `;

        if (state.currentUser) {
            const unreadCount = state.messages.filter(m => m.recipientId === state.currentUser.id && !m.isRead).length;
            container.innerHTML = `
                ${userIndicatorHtml}
                <button class="btn btn-outline" style="position: relative;" onclick="app.navigate('inbox')">
                    <i class="fa-solid fa-inbox"></i> <span class="hide-mobile">${t('nav_inbox')}</span>
                    ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ''}
                </button>
                <button class="btn btn-outline" onclick="app.logout()">
                    <i class="fa-solid fa-right-from-bracket"></i>
                </button>
            `;
        } else {
            container.innerHTML = `
                ${userIndicatorHtml}
                <button class="btn btn-outline" onclick="app.navigate('login')">${t('nav_login')}</button>
                <button class="btn btn-primary" onclick="app.navigate('register')">${t('nav_register')}</button>
            `;
        }
    },

    async renderCurrentView() {
        const routeParts = this.currentRoute.split('/');
        const mainRoute = routeParts[0];

        // Fetch blocked users before rendering inbox or profile
        if ((mainRoute === 'inbox' || mainRoute === 'u' || mainRoute === 'blocked') && state.currentUser) {
            state.currentUser.blockedUsers = await blocksAPI.getBlockedUsers(state.currentUser.id);
        }

        let content = '';

        try {
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
                    content = this.views.inbox();
                    break;
                case 'blocked':
                    if (!state.currentUser) return this.navigate('login');
                    content = this.views.blocked();
                    break;
                case 'analytics':
                    return this.navigate('inbox');
                case 'onboarding':
                    content = this.views.onboarding();
                    break;
                case 'u':
                    if (routeParts[1]) {
                        content = this.views.profile(routeParts[1]);
                    } else {
                        this.navigate('home');
                    }
                    break;
                default:
                    content = this.views.home();
            }
        } catch (error) {
            console.error("Render error:", error);
            content = `<div class="view active empty-state" style="padding: 40px; text-align: center;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; color: var(--danger); margin-bottom: 20px;"></i>
                <h3>حدث خطأ غير متوقع</h3>
                <p style="color: var(--text-muted); margin-top: 10px;">عذراً، حدثت مشكلة أثناء تحميل هذه الصفحة.</p>
                <button class="btn btn-primary" style="margin-top: 20px; width: auto; padding: 10px 24px; border-radius: 20px;" onclick="app.navigate('home')">العودة للرئيسية</button>
            </div>`;
        }

        this.root.innerHTML = content;
        
        // Execute post-render scripts
        if (mainRoute === 'u' && routeParts[1]) {
            this.setupProfileEvents(routeParts[1]);
        } else if (mainRoute === 'inbox') {
            this.setupInboxEvents();
        } else if (mainRoute === 'login') {
            this.setupLoginEvents();
        } else if (mainRoute === 'register') {
            this.setupRegisterEvents();
        }
    },

    // --- Actions ---
    async logout() {
        if (window.supabaseClient) {
            await window.supabaseClient.auth.signOut();
        }
        state.currentUser = null;
        app.currentProfile = null;
        app.authUser = null;
        saveState();
        app.authPromise = null;
        await app.initAuth();
        this.navigate('home');
        showToast(t('nav_logout'), 'success');
    },

    copyLink(url) {
        navigator.clipboard.writeText(url).then(() => {
            showToast(t('link_copied'), 'success');
        });
    },

    async uploadAvatar(file) {
        if (!supabaseClient || !state.currentUser) return showToast("Supabase not initialized", "error");
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${state.currentUser.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        showToast("جاري رفع الصورة...", "info");

        let { error: uploadError } = await supabaseClient.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            return showToast("فشل في رفع الصورة", "error");
        }

        const { data } = supabaseClient.storage.from('avatars').getPublicUrl(filePath);
        
        const userIndex = state.users.findIndex(u => u.id === state.currentUser.id);
        if (userIndex !== -1) {
            state.users[userIndex].avatar_url = data.publicUrl;
            state.currentUser.avatar_url = data.publicUrl;
            saveState();
            showToast("تم تحديث الصورة!", "success");
            this.renderCurrentView();
        }
    },

    copyProfileLink() {
        navigator.clipboard.writeText(window.location.href)
            .then(() => showToast("تم نسخ الرابط", "success"))
            .catch(() => showToast("حدث خطأ في النسخ", "error"));
    },

    async unblockFromList(targetId) {
        if (!state.currentUser) return;
        await blocksAPI.unblockUser(state.currentUser.id, targetId);
        showToast('تم إلغاء الحظر', 'success');
        this.renderCurrentView();
    },

    async toggleBlockUser(targetId) {
        if (!state.currentUser) return;
        const btn = document.getElementById(`block-btn-${targetId}`);
        const txt = document.getElementById(`block-text-${targetId}`);
        if (!btn || !txt) return;

        const currentlyBlocked = btn.dataset.blocked === 'true';
        btn.disabled = true;

        if (currentlyBlocked) {
            await blocksAPI.unblockUser(state.currentUser.id, targetId);
            btn.dataset.blocked = 'false';
            txt.textContent = 'حظر هذا المرسل';
            showToast('تم إلغاء الحظر', 'success');
        } else {
            await blocksAPI.blockUser(state.currentUser.id, targetId);
            btn.dataset.blocked = 'true';
            txt.textContent = 'إلغاء الحظر';
            showToast('تم حظر هذا المستخدم', 'success');
        }
        
        btn.disabled = false;
    },

    toggleReactions(id) {
        document.getElementById(`reactions-popup-${id}`).classList.toggle('active');
    },

    addReaction(msgId, emoji) {
        const msg = state.messages.find(m => m.id === msgId);
        if (msg) {
            if (!msg.reactions) msg.reactions = [];
            msg.reactions.push(emoji);
            saveState();
            this.renderCurrentView();
        }
    },

    renderReactions(msg) {
        const emojis = ['❤️', '😂', '😮', '😢', '🔥'];
        return `
            <div style="position: relative; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--glass-border);">
                <button class="reaction-toggle-btn" onclick="app.toggleReactions('${msg.id}')" title="أضف تفاعل">
                    😀
                </button>
                <div class="reactions-popup" id="reactions-popup-${msg.id}">
                    ${emojis.map(e => `<button class="reaction-emoji-btn" onclick="app.addReaction('${msg.id}', '${e}')">${e}</button>`).join('')}
                </div>
                ${msg.reactions && msg.reactions.length > 0 ? `
                    <div class="reactions-row">
                        ${msg.reactions.join(' ')}
                    </div>
                ` : ''}
            </div>
        `;
    },

    // --- Views ---
    views: {
        onboarding: () => `
            <div class="view active auth-wrapper" style="text-align: center; padding: 20px;">
                <div class="glass-card auth-card" id="onboard-1" style="display: block; max-width: 400px; margin: 0 auto; width: 100%;">
                    <i class="fa-solid fa-ghost" style="font-size: 4rem; color: var(--primary); margin-bottom: 20px;"></i>
                    <h2 class="auth-title text-gradient">مرحباً بك في Whispr</h2>
                    <p class="auth-subtitle" style="margin-bottom: 30px;">استقبل رسائل سرية من أصدقائك أو متابعينك بدون أن تعرف هويتهم، مساحة آمنة للصراحة.</p>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-outline" style="flex: 1;" onclick="app.finishOnboarding()">تخطي</button>
                        <button class="btn btn-primary" style="flex: 1;" onclick="app.nextOnboardingStep()">التالي</button>
                    </div>
                </div>
                
                <div class="glass-card auth-card" id="onboard-2" style="display: none; max-width: 400px; margin: 0 auto; width: 100%;">
                    <i class="fa-solid fa-link" style="font-size: 4rem; color: #10b981; margin-bottom: 20px;"></i>
                    <h2 class="auth-title text-gradient">شارك رابطك الخاص</h2>
                    <p class="auth-subtitle" style="margin-bottom: 30px;">بمجرد إنشاء حسابك، انسخ رابطك الخاص وشاركه في انستقرام أو تويتر لتبدأ بتلقي الرسائل.</p>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-outline" style="flex: 1;" onclick="app.finishOnboarding()">تخطي</button>
                        <button class="btn btn-primary" style="flex: 1;" onclick="app.nextOnboardingStep()">التالي</button>
                    </div>
                </div>

                <div class="glass-card auth-card" id="onboard-3" style="display: none; max-width: 400px; margin: 0 auto; width: 100%;">
                    <i class="fa-solid fa-shield-halved" style="font-size: 4rem; color: #ef4444; margin-bottom: 20px;"></i>
                    <h2 class="auth-title text-gradient">تحكم كامل بخصوصيتك</h2>
                    <p class="auth-subtitle" style="margin-bottom: 30px;">هل أزعجتك رسالة؟ يمكنك بضغطة زر واحدة حظر أي مرسل مزعج لمنعه من مراسلتك مجدداً.</p>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" style="width: 100%;" onclick="app.finishOnboarding()">ابدأ الآن!</button>
                    </div>
                </div>
            </div>
        `,

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
                            <label class="form-label">البريد الإلكتروني</label>
                            <input type="email" id="login-email" class="form-control" placeholder="أدخل بريدك الإلكتروني" required>
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

        profile: (username) => {
            const user = state.users.find(u => u.username === username);
            if (!user) {
                return `<div class="view active empty-state"><h2>${t('err_user_not_found')}</h2></div>`;
            }

            const blockedIds = (state.currentUser && state.currentUser.blockedUsers) ? state.currentUser.blockedUsers : [];
            const publicReplies = state.messages.filter(m => 
                m.recipientId === user.id && 
                m.reply && 
                (!m.expiresAt || m.expiresAt > Date.now()) &&
                (!m.senderId || !blockedIds.includes(m.senderId))
            );
            
            app.chatTotalCount = publicReplies.length;
            const limit = app.chatLimit || 30;
            const visibleReplies = publicReplies.slice(Math.max(publicReplies.length - limit, 0));
            const hasMore = publicReplies.length > limit;

            return `
                <div class="view active">
                    <div class="profile-header">
                        <div class="avatar-container">
                            ${user.avatar_url ? `<img src="${user.avatar_url}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; box-shadow: var(--glass-shadow); border: 2px solid var(--primary);" />` : `<div class="avatar-placeholder" style="width: 80px; height: 80px; font-size: 2rem;">${username.charAt(0).toUpperCase()}</div>`}
                        </div>
                        <h2 class="profile-name">@${username}</h2>
                        <p class="text-muted">${user.bio || t('bio_default')}</p>
                        <div style="display: flex; gap: 10px; justify-content: center; align-items: center; margin-top: 15px; flex-wrap: wrap;">
                            <button class="btn btn-outline" style="border-radius: 20px; font-size: 0.9rem;" onclick="app.copyProfileLink()">
                                <i class="fa-solid fa-link"></i> نسخ الرابط
                            </button>
                            ${state.currentUser && state.currentUser.id !== user.id ? `
                                <button class="btn btn-outline" style="border-radius: 20px; font-size: 0.9rem; color: var(--danger); border-color: rgba(255,51,102,0.3);" id="block-btn-${user.id}" onclick="app.toggleBlockUser('${user.id}')">
                                    <i class="fa-solid fa-ban"></i> <span id="block-text-${user.id}">...</span>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="glass-card send-message-card">
                        <div class="msg-header">
                            <i class="fa-solid fa-paper-plane"></i>
                            <h3>${t('profile_title')}</h3>
                        </div>
                        <form id="send-msg-form" class="mobile-composer-form">
                            <div class="form-group composer-row">
                                <textarea id="msg-content" class="form-control auto-expand" placeholder="اكتب رسالتك هنا..." required maxlength="300" rows="1"></textarea>
                                <button type="submit" class="btn btn-primary send-btn">
                                    <i class="fa-solid fa-paper-plane mobile-only-icon"></i> 
                                    <span class="desktop-only-text"><i class="fa-solid fa-lock"></i> ${t('btn_send')}</span>
                                </button>
                            </div>
                            <div id="block-error-msg" style="color: var(--danger); font-size: 0.85rem; margin-top: -10px; margin-bottom: 10px; display: none;">لا يمكنك إرسال رسائل لهذا المستخدم.</div>
                            <div class="msg-footer">
                                <span class="char-count" id="char-counter">300 ${t('chars_left')}</span>
                            </div>
                        </form>
                    </div>
                    
                    ${publicReplies.length > 0 ? (() => {
                        let lastDateLabelProfile = null;
                        return `
                        <div class="inbox-container">
                            <h3 style="margin-bottom:20px;text-align:center;">الردود السابقة</h3>
                            <div class="messages-grid">
                                ${hasMore ? `
                                    <div id="chat-loader" style="text-align: center; padding: 15px; color: var(--primary); display: flex; justify-content: center; align-items: center; gap: 8px; opacity: 0.7; transition: opacity 0.3s ease;">
                                        <i class="fa-solid fa-circle-notch fa-spin"></i> جاري تحميل الرسائل القديمة...
                                    </div>
                                ` : ''}
                                ${visibleReplies.map(msg => {
                                    const dateLabel = getDateLabel(msg.timestamp);
                                    let separatorHtml = '';
                                    if (dateLabel !== lastDateLabelProfile) {
                                        separatorHtml = `<div class="date-separator" style="text-align: center; margin: 24px 0 16px;"><span style="background: var(--surface); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; color: var(--text-muted); box-shadow: var(--glass-shadow);">${dateLabel}</span></div>`;
                                        lastDateLabelProfile = dateLabel;
                                    }
                                    return `
                                    ${separatorHtml}
                                    <div class="message-swipe-container" style="position: relative; overflow: hidden; border-radius: var(--radius-lg); margin-bottom: 16px;">
                                        <div class="swipe-actions" style="position: absolute; top: 0; right: 0; height: 100%; display: flex; align-items: center; justify-content: flex-end; padding: 0 16px; gap: 8px; z-index: 1;">
                                            <button class="btn-icon swipe-btn" style="width:36px;height:36px;background:var(--surface);" onclick="app.copyLink('${window.location.origin}${window.location.pathname}#u/${username}')"><i class="fa-solid fa-copy"></i></button>
                                            ${state.currentUser && state.currentUser.id === user.id ? `<button class="btn-icon swipe-btn" style="width:36px;height:36px;color:var(--danger);background:var(--surface);" onclick="app.deleteMessage('${msg.id}')"><i class="fa-solid fa-trash"></i></button>` : ''}
                                        </div>
                                        <div class="glass-card message-card message-swipe-front" id="swipe-front-${msg.id}" style="position: relative; z-index: 2; transition: transform 0.3s ease; margin-bottom: 0;">
                                            <div class="msg-time" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                                                <span style="font-size: 0.8rem; color: var(--text-muted);"><i class="fa-regular fa-clock"></i> ${formatTime(msg.timestamp)}</span>
                                                <span style="font-size: 0.7rem; color: var(--danger); background: rgba(255,51,102,0.1); padding: 2px 6px; border-radius: 10px;">يحذف بعد ٢٤ ساعة</span>
                                            </div>
                                            <div class="msg-content">"${msg.content}"</div>
                                            <div class="reply-content">
                                                <div class="reply-label">${t('reply_label')}</div>
                                                <div>${msg.reply}</div>
                                            </div>
                                            ${app.renderReactions(msg)}
                                        </div>
                                    </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        `;
                    })() : ''}
                </div>
            `;
        },

        analytics: () => {
            const fullUser = state.currentUser ? state.users.find(u => u.id === state.currentUser.id) : null;
            if (!fullUser || fullUser.email !== 'admin@whispr.app') {
                return `<div class="view active empty-state"><h2>غير مصرح لك بالدخول</h2></div>`;
            }

            const totalUsers = state.users.length;
            const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            
            const recentMessages = state.messages.filter(m => m.timestamp >= sevenDaysAgo);
            const totalRecentMessages = recentMessages.length;
            
            const activeUserIds = new Set();
            recentMessages.forEach(m => {
                if (m.senderId) activeUserIds.add(m.senderId);
                if (m.recipientId) activeUserIds.add(m.recipientId);
            });
            const activeUsersCount = activeUserIds.size;
            const avgMessages = activeUsersCount === 0 ? 0 : (totalRecentMessages / activeUsersCount).toFixed(1);

            const senders = new Set();
            for (let i = 0; i < state.messages.length; i++) {
                if (state.messages[i].senderId) senders.add(state.messages[i].senderId);
            }
            const activatedUsersCount = senders.size;
            const activationRate = totalUsers === 0 ? 0 : Math.round((activatedUsersCount / totalUsers) * 100);

            const dailyStats = [];
            let maxDailyMsgs = 0;
            const now = new Date();
            now.setHours(23, 59, 59, 999);
            
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                date.setHours(0, 0, 0, 0);
                const endOfDay = date.getTime() + 24 * 60 * 60 * 1000;
                
                const count = state.messages.filter(m => m.timestamp >= date.getTime() && m.timestamp < endOfDay).length;
                if (count > maxDailyMsgs) maxDailyMsgs = count;
                
                const dayLabel = date.toLocaleDateString('ar-EG', { weekday: 'short' });
                dailyStats.push({ label: dayLabel, count: count });
            }
            
            const chartMax = maxDailyMsgs === 0 ? 1 : maxDailyMsgs;

            return `
                <div class="view active inbox-container">
                    <div class="inbox-header">
                        <h2>لوحة الإحصائيات</h2>
                        <button class="btn btn-outline" onclick="app.navigate('inbox')" style="padding: 6px 12px; font-size: 0.9rem;">
                            <i class="fa-solid fa-arrow-right"></i> رجوع
                        </button>
                    </div>
                    
                    <div class="messages-grid" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));">
                        <div class="glass-card" style="text-align: center; padding: 20px;">
                            <i class="fa-solid fa-users" style="font-size: 2rem; color: var(--primary); margin-bottom: 10px;"></i>
                            <h3 style="font-size: 1.8rem; margin: 0;">${totalUsers}</h3>
                            <p class="text-muted" style="margin: 5px 0 0; font-size: 0.9rem;">إجمالي المستخدمين</p>
                        </div>
                        
                        <div class="glass-card" style="text-align: center; padding: 20px;">
                            <i class="fa-solid fa-user-check" style="font-size: 2rem; color: #10b981; margin-bottom: 10px;"></i>
                            <h3 style="font-size: 1.8rem; margin: 0;">${activeUsersCount}</h3>
                            <p class="text-muted" style="margin: 5px 0 0; font-size: 0.9rem;">نشطون آخر 7 أيام</p>
                        </div>
                        
                        <div class="glass-card" style="text-align: center; padding: 20px;">
                            <i class="fa-solid fa-envelope" style="font-size: 2rem; color: #f59e0b; margin-bottom: 10px;"></i>
                            <h3 style="font-size: 1.8rem; margin: 0;">${totalRecentMessages}</h3>
                            <p class="text-muted" style="margin: 5px 0 0; font-size: 0.9rem;">رسائل آخر 7 أيام</p>
                        </div>
                        
                        <div class="glass-card" style="text-align: center; padding: 20px;">
                            <i class="fa-solid fa-chart-pie" style="font-size: 2rem; color: #8b5cf6; margin-bottom: 10px;"></i>
                            <h3 style="font-size: 1.8rem; margin: 0;">${avgMessages}</h3>
                            <p class="text-muted" style="margin: 5px 0 0; font-size: 0.9rem;">متوسط الرسائل/مستخدم</p>
                        </div>
                        
                        <div class="glass-card" style="text-align: center; padding: 20px;">
                            <i class="fa-solid fa-rocket" style="font-size: 2rem; color: #ef4444; margin-bottom: 10px;"></i>
                            <h3 style="font-size: 1.8rem; margin: 0;">${activatedUsersCount}</h3>
                            <p class="text-muted" style="margin: 5px 0 0; font-size: 0.9rem;">مستخدمون مفعلون</p>
                        </div>
                        
                        <div class="glass-card" style="text-align: center; padding: 20px;">
                            <i class="fa-solid fa-percent" style="font-size: 2rem; color: #3b82f6; margin-bottom: 10px;"></i>
                            <h3 style="font-size: 1.8rem; margin: 0;">${activationRate}%</h3>
                            <p class="text-muted" style="margin: 5px 0 0; font-size: 0.9rem;">معدل التفعيل</p>
                        </div>
                    </div>
                    
                    <div class="glass-card" style="margin-top: 24px; padding: 20px;">
                        <h3 style="margin-top: 0; margin-bottom: 20px; font-size: 1.2rem; text-align: center;">الرسائل المرسلة في آخر 7 أيام</h3>
                        <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 150px; padding-top: 20px; border-bottom: 1px solid var(--glass-border);">
                            ${dailyStats.map(stat => {
                                const heightPercentage = (stat.count / chartMax) * 100;
                                return `
                                    <div style="display: flex; flex-direction: column; align-items: center; width: 10%; height: 100%;">
                                        <div style="flex-grow: 1; display: flex; align-items: flex-end; width: 100%; justify-content: center;">
                                            <div style="width: 100%; max-width: 30px; height: ${heightPercentage}%; min-height: 4px; background: var(--primary); border-radius: 4px 4px 0 0; transition: height 0.3s ease; position: relative;">
                                                <span style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 0.8rem; color: var(--text-muted);">${stat.count}</span>
                                            </div>
                                        </div>
                                        <span style="font-size: 0.75rem; margin-top: 8px; color: var(--text-muted);">${stat.label}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        },

        blocked: () => {
            const user = state.currentUser;
            const blockedIds = user.blockedUsers || [];
            
            const blockedUsers = blockedIds.map(id => state.users.find(u => u.id === id)).filter(Boolean);

            return `
                <div class="view active inbox-container">
                    <div class="inbox-header">
                        <h2>المستخدمون المحظورون</h2>
                        <button class="btn btn-outline" onclick="app.navigate('inbox')" style="padding: 6px 12px; font-size: 0.9rem;">
                            <i class="fa-solid fa-arrow-right"></i> رجوع
                        </button>
                    </div>
                    <div class="messages-grid">
                        ${blockedUsers.length === 0 ? `
                            <div class="glass-card empty-state">
                                <i class="fa-solid fa-user-slash empty-icon"></i>
                                <p>لا يوجد مستخدمون محظورون</p>
                            </div>
                        ` : blockedUsers.map(bu => `
                            <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; margin-bottom: 12px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    ${bu.avatar_url ? `<img src="${bu.avatar_url}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;" />` : `<div class="avatar-placeholder" style="width: 48px; height: 48px; font-size: 1.2rem;">${bu.username.charAt(0).toUpperCase()}</div>`}
                                    <div>
                                        <div style="font-weight: 600; font-size: 1.1rem;">@${bu.username}</div>
                                    </div>
                                </div>
                                <button class="btn btn-outline" style="border-radius: 20px; font-size: 0.85rem; color: var(--danger); border-color: rgba(255,51,102,0.3);" onclick="app.unblockFromList('${bu.id}')">
                                    إلغاء الحظر
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        inbox: () => {
            const user = state.currentUser;
            const fullUser = state.users.find(u => u.id === user.id);
            const isAdmin = fullUser && fullUser.email === 'admin@whispr.app';
            const blockedIds = user.blockedUsers || [];
            const myMessages = state.messages.filter(m => 
                m.recipientId === user.id && 
                (!m.expiresAt || m.expiresAt > Date.now()) &&
                (!m.senderId || !blockedIds.includes(m.senderId))
            ).sort((a,b) => b.timestamp - a.timestamp);
            const shareUrl = window.location.origin + window.location.pathname + '#u/' + user.username;

            return `
                <div class="view active inbox-container">
                    <div class="profile-header" style="margin-bottom: 30px;">
                        <div class="avatar-container" style="position: relative; display: inline-block;">
                            ${user.avatar_url ? `<img src="${user.avatar_url}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; box-shadow: var(--glass-shadow); border: 2px solid var(--primary);" />` : `<div class="avatar-placeholder" style="width: 80px; height: 80px; font-size: 2rem;">${user.username.charAt(0).toUpperCase()}</div>`}
                            <label class="btn-icon" style="position: absolute; bottom: 0; right: -10px; background: var(--primary); padding: 6px; border-radius: 50%; cursor: pointer; color: white; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;" title="تغيير الصورة">
                                <i class="fa-solid fa-camera" style="font-size: 0.9rem;"></i>
                                <input type="file" accept="image/*" style="display: none;" onchange="app.uploadAvatar(this.files[0])">
                            </label>
                        </div>
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
                    
                    <div class="glass-card" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; padding: 16px; cursor: pointer;" onclick="app.navigate('blocked')">
                        <div style="font-weight: 600;">المستخدمون المحظورون</div>
                        <i class="fa-solid fa-chevron-left" style="color: var(--text-muted);"></i>
                    </div>
                    


                    <div class="glass-card" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; padding: 16px;">
                        <div>
                            <span style="font-weight: 600;">تكبير حجم الخط في المحادثات</span>
                        </div>
                        <div>
                            <input type="checkbox" ${state.largeText ? 'checked' : ''} onchange="app.toggleLargeText()" style="width: 22px; height: 22px; accent-color: var(--primary); cursor: pointer;">
                        </div>
                    </div>
                    
                    <div class="messages-grid">
                        ${myMessages.length === 0 ? `
                            <div class="glass-card empty-state" style="text-align: center; padding: 40px 20px;">
                                <i class="fa-solid fa-ghost empty-icon" style="font-size: 4rem; color: var(--primary); margin-bottom: 20px; opacity: 0.8;"></i>
                                <h3 style="margin-bottom: 10px; font-size: 1.3rem;">صندوق الوارد فارغ</h3>
                                <p style="color: var(--text-muted); margin-bottom: 25px; line-height: 1.6;">لم تصلك أي رسائل حتى الآن. انشر رابطك الخاص في حساباتك (مثل تويتر أو انستقرام) ليستطيع الناس إرسال رسائل لك بسرية تامة.</p>
                                <button class="btn btn-primary" style="padding: 12px 24px; font-size: 1rem; border-radius: 30px;" onclick="app.copyLink('${shareUrl}')">
                                    <i class="fa-solid fa-link"></i> نسخ رابط الحساب
                                </button>
                            </div>
                        ` : (() => {
                            let lastDateLabelInbox = null;
                            return myMessages.map(msg => {
                                const dateLabel = getDateLabel(msg.timestamp);
                                let separatorHtml = '';
                                if (dateLabel !== lastDateLabelInbox) {
                                    separatorHtml = `<div class="date-separator" style="text-align: center; margin: 24px 0 16px;"><span style="background: var(--surface); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; color: var(--text-muted); box-shadow: var(--glass-shadow);">${dateLabel}</span></div>`;
                                    lastDateLabelInbox = dateLabel;
                                }
                                return `
                                ${separatorHtml}
                                <div class="message-swipe-container" style="position: relative; overflow: hidden; border-radius: var(--radius-lg); margin-bottom: 16px;">
                                    <div class="swipe-actions" style="position: absolute; top: 0; right: 0; height: 100%; display: flex; align-items: center; justify-content: flex-end; padding: 0 16px; gap: 8px; z-index: 1;">
                                        ${!msg.reply ? `<button class="btn-icon swipe-btn" style="width:36px;height:36px;background:var(--surface);" onclick="document.getElementById('reply-area-${msg.id}').classList.toggle('active'); document.querySelector('#swipe-front-${msg.id}').style.transform='translateX(0)';"><i class="fa-solid fa-reply"></i></button>` : ''}
                                        <button class="btn-icon swipe-btn" style="width:36px;height:36px;background:var(--surface);" onclick="app.copyLink('${msg.content}')"><i class="fa-solid fa-copy"></i></button>
                                        <button class="btn-icon swipe-btn" style="width:36px;height:36px;color:var(--danger);background:var(--surface);" onclick="app.deleteMessage('${msg.id}')"><i class="fa-solid fa-trash"></i></button>
                                    </div>
                                    <div class="glass-card message-card message-swipe-front" id="swipe-front-${msg.id}" style="position: relative; z-index: 2; transition: transform 0.3s ease; margin-bottom: 0;">
                                        <div class="msg-time" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                                            <span style="font-size: 0.8rem; color: var(--text-muted);"><i class="fa-regular fa-clock"></i> ${formatTime(msg.timestamp)}</span>
                                            <span style="font-size: 0.7rem; color: var(--danger); background: rgba(255,51,102,0.1); padding: 2px 6px; border-radius: 10px;">يحذف بعد ٢٤ ساعة</span>
                                        </div>
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
                                        ${app.renderReactions(msg)}
                                    </div>
                                </div>
                                `;
                            }).join('');
                        })()}
                    </div>
                </div>
            `;
        }
    },

    // --- Form Handlers ---
    setupLoginEvents() {
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const em = document.getElementById('login-email').value;
            const pw = document.getElementById('login-password').value;
            const btn = document.querySelector('#login-form button[type="submit"]');
            
            btn.disabled = true;
            const originalBtnText = btn.textContent;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> جاري الدخول...';
            
            if (window.supabaseClient) {
                const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                    email: em,
                    password: pw
                });
                
                if (error) {
                    showToast('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
                } else {
                    app.authPromise = null;
                    await app.initAuth();
                    
                    let localU = state.users.find(u => u.email === em);
                    if (!localU) {
                        localU = { id: data.user.id, username: em.split('@')[0], email: em, password: pw, bio: '' };
                        state.users.push(localU);
                    }
                    state.currentUser = { id: localU.id, username: localU.username };
                    saveState();
                    
                    app.navigate('inbox');
                    showToast('تم تسجيل الدخول بنجاح', 'success');
                }
            } else {
                const user = state.users.find(u => u.email === em && u.password === pw);
                if (user) {
                    state.currentUser = { id: user.id, username: user.username };
                    saveState();
                    app.authPromise = null;
                    await app.initAuth();
                    app.navigate('inbox');
                    showToast(`أهلاً بك @${user.username}`, 'success');
                } else {
                    showToast(t('err_invalid_creds'), 'error');
                }
            }
            
            btn.disabled = false;
            btn.textContent = originalBtnText;
        });
    },

    setupRegisterEvents() {
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const un = document.getElementById('reg-username').value;
            const em = document.getElementById('reg-email').value;
            const pw = document.getElementById('reg-password').value;
            const btn = document.querySelector('#register-form button[type="submit"]');
            
            btn.disabled = true;
            const originalBtnText = btn.textContent;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> جاري التسجيل...';
            
            if (state.users.some(u => u.username === un)) {
                showToast(t('err_user_exists'), 'error');
                btn.disabled = false;
                btn.textContent = originalBtnText;
                return;
            }
            
            if (window.supabaseClient) {
                const { data, error } = await window.supabaseClient.auth.signUp({
                    email: em,
                    password: pw,
                    options: {
                        data: {
                            full_name: un
                        }
                    }
                });
                
                if (error) {
                    showToast(error.message.includes('already registered') ? 'البريد الإلكتروني مسجل مسبقاً' : 'حدث خطأ أثناء التسجيل', 'error');
                    btn.disabled = false;
                    btn.textContent = originalBtnText;
                    return;
                }
                
                const newUser = {
                    id: data.user?.id || generateId(),
                    username: un,
                    email: em,
                    password: pw,
                    bio: ''
                };
                state.users.push(newUser);
                state.currentUser = { id: newUser.id, username: newUser.username };
                saveState();
                
                app.authPromise = null;
                await app.initAuth();
                app.navigate('inbox');
                showToast(t('reg_success'), 'success');
            } else {
                const newUser = {
                    id: generateId(),
                    username: un,
                    email: em,
                    password: pw,
                    bio: ''
                };
                
                state.users.push(newUser);
                state.currentUser = { id: newUser.id, username: newUser.username };
                saveState();
                app.authPromise = null;
                await app.initAuth();
                app.navigate('inbox');
                showToast(t('reg_success'), 'success');
            }
            
            btn.disabled = false;
            btn.textContent = originalBtnText;
        });
    },

    setupProfileEvents(username) {
        const user = state.users.find(u => u.username === username);
        if (!user) return;

        const ta = document.getElementById('msg-content');
        const counter = document.getElementById('char-counter');
        
        ta.addEventListener('input', () => {
            const left = 300 - ta.value.length;
            counter.textContent = `${left} ${t('chars_left')}`;
            
            ta.style.height = 'auto';
            ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
        });

        if (state.currentUser && state.currentUser.id !== user.id) {
            blocksAPI.isBlocked(state.currentUser.id, user.id).then(isBlocked => {
                const btn = document.getElementById(`block-btn-${user.id}`);
                const txt = document.getElementById(`block-text-${user.id}`);
                if (btn && txt) {
                    btn.dataset.blocked = isBlocked ? 'true' : 'false';
                    txt.textContent = isBlocked ? 'إلغاء الحظر' : 'حظر هذا المرسل';
                }
            });
        }

        document.getElementById('send-msg-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = ta.value.trim();
            if (!content) return;
            
            const errorMsg = document.getElementById('block-error-msg');
            if (errorMsg) errorMsg.style.display = 'none';
            
            if (state.currentUser) {
                const isBlocked = await blocksAPI.isBlocked(user.id, state.currentUser.id);
                if (isBlocked) {
                    if (errorMsg) errorMsg.style.display = 'block';
                    return;
                }
            }
            
            state.messages.push({
                id: generateId(),
                recipientId: user.id,
                senderId: state.currentUser ? state.currentUser.id : null,
                content: content,
                timestamp: Date.now(),
                expiresAt: Date.now() + 24 * 60 * 60 * 1000,
                reply: null,
                isRead: false
            });
            saveState();
            
            if (state.currentUser && state.currentUser.id === user.id) {
                app.updateNav();
            }
            
            ta.value = '';
            ta.style.height = 'auto';
            counter.textContent = `300 ${t('chars_left')}`;
            showToast(t('msg_sent'), 'success');
            
            // Add a little celebration effect
            this.celebrateSend(e.target.querySelector('button'));
            
            // Smooth scroll to latest on send
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
        
        // Smart scrolling logic
        const oldBtn = document.getElementById('scroll-to-bottom-btn');
        if (oldBtn) oldBtn.remove();

        const scrollBtn = document.createElement('button');
        scrollBtn.id = 'scroll-to-bottom-btn';
        scrollBtn.className = 'btn btn-primary';
        scrollBtn.style.cssText = 'position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); z-index: 1000; border-radius: 30px; display: none; box-shadow: 0 4px 15px rgba(0,0,0,0.3); transition: opacity 0.3s ease, transform 0.3s ease; padding: 10px 20px; font-size: 0.95rem; opacity: 0; transform: translate(-50%, 20px); pointer-events: none;';
        scrollBtn.innerHTML = '<i class="fa-solid fa-arrow-down" style="margin-left: 8px;"></i> الانتقال لآخر رسالة';
        document.body.appendChild(scrollBtn);
        
        const scrollToBottom = () => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        };
        
        scrollBtn.addEventListener('click', scrollToBottom);

        // Scroll smoothly on open ONLY if it's a fresh load (not pagination)
        if (!app.isPaginating) {
            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 150);
        } else {
            app.isPaginating = false;
        }

        let scrollTimeout;
        let isFetchingMore = false;
        const handleScroll = () => {
            if (app.currentRoute !== 'u') {
                window.removeEventListener('scroll', handleScroll);
                if (scrollBtn) scrollBtn.remove();
                return;
            }
            
            // Calculate if user is near bottom (within 200px)
            const scrollPosition = window.innerHeight + window.scrollY;
            const threshold = document.body.scrollHeight - 200;
            
            if (scrollPosition < threshold) {
                scrollBtn.style.display = 'block';
                // Trigger reflow for animation
                void scrollBtn.offsetWidth;
                scrollBtn.style.opacity = '1';
                scrollBtn.style.transform = 'translate(-50%, 0)';
                scrollBtn.style.pointerEvents = 'auto';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.transform = 'translate(-50%, 20px)';
                scrollBtn.style.pointerEvents = 'none';
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    if (scrollBtn.style.opacity === '0') {
                        scrollBtn.style.display = 'none';
                    }
                }, 300);
            }
            
            // Pagination logic
            if (window.scrollY < 50 && !isFetchingMore && app.chatLimit < app.chatTotalCount) {
                isFetchingMore = true;
                const loader = document.getElementById('chat-loader');
                if (loader) {
                    loader.style.opacity = '1';
                }
                
                setTimeout(async () => {
                    const oldScrollHeight = document.body.scrollHeight;
                    const oldScrollY = window.scrollY;
                    
                    app.chatLimit += 30;
                    app.isPaginating = true;
                    await app.renderCurrentView();
                    
                    const newScrollHeight = document.body.scrollHeight;
                    window.scrollTo(0, oldScrollY + (newScrollHeight - oldScrollHeight));
                    isFetchingMore = false;
                }, 600); // Artificial delay to show loader
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Mock incoming message detection for smart scroll demo
        const originalPush = state.messages.push;
        state.messages.push = function() {
            const res = originalPush.apply(this, arguments);
            if (app.currentRoute === 'u') {
                const scrollPosition = window.innerHeight + window.scrollY;
                const threshold = document.body.scrollHeight - 200;
                if (scrollPosition >= threshold) {
                    setTimeout(scrollToBottom, 50);
                }
            }
            return res;
        };

        this.initSwipeActions();
    },

    setupInboxEvents() {
        if (!state.currentUser) return;
        let modified = false;
        state.messages.forEach(m => {
            if (m.recipientId === state.currentUser.id && !m.isRead) {
                m.isRead = true;
                modified = true;
            }
        });
        if (modified) {
            saveState();
            this.updateNav();
        }
        this.initSwipeActions();
    },

    deleteMessage(msgId) {
        if(confirm('هل أنت متأكد من الحذف؟')) {
            state.messages = state.messages.filter(m => m.id !== msgId);
            saveState();
            this.renderCurrentView();
        }
    },

    initSwipeActions() {
        if (window.innerWidth > 768) return; 
        
        const fronts = document.querySelectorAll('.message-swipe-front');
        fronts.forEach(front => {
            let startX = 0, startY = 0;
            let isSwiping = false;
            let isVertical = false;

            front.addEventListener('touchstart', e => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                isSwiping = true;
                isVertical = false;
                front.style.transition = 'none';
            }, {passive: true});

            front.addEventListener('touchmove', e => {
                if (!isSwiping) return;
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                const diffX = touchX - startX;
                const diffY = touchY - startY;

                if (!isVertical && Math.abs(diffY) > Math.abs(diffX)) {
                    isVertical = true;
                }

                if (isVertical) return; 

                if (diffX < 0 && diffX > -160) {
                    front.style.transform = `translateX(${diffX}px)`;
                }
            }, {passive: true});

            front.addEventListener('touchend', e => {
                if (!isSwiping || isVertical) return;
                isSwiping = false;
                front.style.transition = 'transform 0.3s ease';
                
                const transform = window.getComputedStyle(front).transform;
                let currentX = 0;
                if (transform !== 'none') {
                    const matrix = new DOMMatrixReadOnly(transform);
                    currentX = matrix.m41;
                }

                if (currentX < -60) {
                    front.style.transform = `translateX(-140px)`;
                } else {
                    front.style.transform = `translateX(0)`;
                }
            });
        });
    },

    submitReply(e, msgId) {
        e.preventDefault();
        const textarea = e.target.querySelector('textarea');
        const replyText = textarea.value.trim();
        
        const msgIndex = state.messages.findIndex(m => m.id === msgId);
        if (msgIndex !== -1 && replyText) {
            state.messages[msgIndex].reply = replyText;
            saveState();
            showToast(t('reply_added'), 'success');
            this.renderCurrentView(); // re-render to show the reply
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
        const colors = ['#8a2be2', '#ff007f', '#00f0ff'];
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random properties
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
            
            // Immediate cursor
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        // Smooth follower
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
