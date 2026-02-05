/**
 * Claude Code 教程网站 - 主脚本
 */

// ==================== 返回顶部按钮 ====================
function initBackToTop() {
    // 创建返回顶部按钮
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', '返回顶部');
    backToTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>';
    document.body.appendChild(backToTop);

    // 滚动时显示/隐藏按钮
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 400) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
        lastScrollY = scrollY;
    }, { passive: true });

    // 点击返回顶部
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ==================== 滚动动画 ====================
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 50); // 轻微交错
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 观察需要动画的元素
    const animatedElements = document.querySelectorAll(
        '.path-section, .chapter-card, .alert, .quiz, .checklist, .article-content h2, .article-content h3, .article-content table'
    );

    animatedElements.forEach((el, index) => {
        el.classList.add('fade-in');
        el.classList.add(`stagger-${index % 5}`);
        observer.observe(el);
    });
}

// ==================== 本页目录（TOC：H2/H3） ====================
function slugifyHeading(text) {
    const raw = (text || '').trim().toLowerCase();
    if (!raw) return 'section';

    // 允许中文；移除常见标点，空白转连字符（避免使用 \p{} 以兼容较老浏览器）
    const cleaned = raw
        .replace(/[^a-z0-9\u4e00-\u9fff\s\-]+/gi, '')
        .replace(/\s+/g, '-')
        .replace(/\-+/g, '-')
        .replace(/^\-+|\-+$/g, '');

    return cleaned || 'section';
}

function initToc() {
    const article = document.querySelector('.article-content');
    if (!article) return;

    const headings = Array.from(article.querySelectorAll('h2, h3'));
    if (headings.length === 0) return;

    // 生成/补齐 id（保证可跳转、可分享）
    const used = new Set();
    headings.forEach((h) => {
        if (h.id) {
            used.add(h.id);
            return;
        }
        const base = slugifyHeading(h.textContent);
        let id = base;
        let i = 2;
        while (used.has(id)) {
            id = `${base}-${i++}`;
        }
        h.id = id;
        used.add(id);
    });

    // 构建 TOC DOM
    const panel = document.createElement('aside');
    panel.className = 'toc-panel';
    panel.innerHTML = `
        <div class="toc-title">本页目录</div>
        <nav class="toc-nav" aria-label="本页目录"></nav>
    `;

    const nav = panel.querySelector('.toc-nav');
    if (!nav) return;

    const items = [];
    headings.forEach((h) => {
        const level = h.tagName.toLowerCase() === 'h3' ? 3 : 2;
        const a = document.createElement('a');
        a.className = `toc-item level-${level}`;
        a.href = `#${h.id}`;
        a.textContent = (h.textContent || '').trim();
        a.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState(null, '', `#${h.id}`);
        });
        nav.appendChild(a);
        items.push({ heading: h, link: a });
    });

    document.body.appendChild(panel);
    document.body.classList.add('has-toc');

    // 高亮逻辑：以“标题上沿到达导航高度下方”作为激活点
    const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '60', 10) || 60;
    let headingTops = [];

    const recalc = () => {
        headingTops = items.map(({ heading }) => ({
            id: heading.id,
            top: heading.getBoundingClientRect().top + window.scrollY
        }));
        headingTops.sort((a, b) => a.top - b.top);
    };

    const setActive = (id) => {
        items.forEach(({ heading, link }) => {
            const active = heading.id === id;
            link.classList.toggle('active', active);
        });
    };

    const updateActive = () => {
        const y = window.scrollY + headerHeight + 18;
        let activeId = headingTops[0]?.id || null;
        for (const h of headingTops) {
            if (h.top <= y) activeId = h.id;
            else break;
        }
        if (activeId) setActive(activeId);
    };

    recalc();
    updateActive();

    let raf = 0;
    const onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
            raf = 0;
            updateActive();
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
        recalc();
        updateActive();
    });
}

// ==================== 本页阅读进度 / 预计阅读时间 ====================
function estimateReadingMinutes(text) {
    const s = (text || '').trim();
    if (!s) return 1;

    // 粗略：中文字符 450/min；英文单词 180/min
    const cjkCount = (s.match(/[\u4E00-\u9FFF]/g) || []).length;
    const wordCount = (s.replace(/[\u4E00-\u9FFF]/g, ' ').match(/\b[\w'-]+\b/g) || []).length;

    const minutes = (cjkCount / 450) + (wordCount / 180);
    return Math.max(1, Math.round(minutes));
}

function initReadingProgress() {
    const article = document.querySelector('.article-content');
    if (!article) return;

    const topRight = document.querySelector('.top-nav-right');
    if (!topRight) return;

    const text = article.innerText || article.textContent || '';
    const totalMinutes = estimateReadingMinutes(text);

    const indicator = document.createElement('div');
    indicator.className = 'reading-indicator';
    indicator.innerHTML = `
        <div class="reading-meta" aria-label="本页阅读信息">本页 0% · 预计 ${totalMinutes} 分钟</div>
        <div class="reading-bar" aria-hidden="true"><div class="reading-fill" style="width:0%"></div></div>
    `;

    topRight.appendChild(indicator);

    const meta = indicator.querySelector('.reading-meta');
    const fill = indicator.querySelector('.reading-fill');
    if (!meta || !fill) return;

    let start = 0;
    let end = 0;

    const recalc = () => {
        const rect = article.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const height = article.scrollHeight || rect.height;
        start = top;
        end = top + height - window.innerHeight;
        if (end < start) end = start;
    };

    const update = () => {
        const y = window.scrollY;
        let p = 0;
        if (end === start) {
            p = 100;
        } else {
            p = ((y - start) / (end - start)) * 100;
            p = Math.max(0, Math.min(100, p));
        }

        const percent = Math.round(p);
        fill.style.width = `${percent}%`;

        const remaining = Math.max(0, Math.round(totalMinutes * (1 - percent / 100)));
        meta.textContent = `本页 ${percent}% · 预计 ${totalMinutes} 分钟 · 剩余 ${remaining} 分钟`;
    };

    recalc();
    update();

    let raf = 0;
    const onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
            raf = 0;
            update();
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
        recalc();
        update();
    });
}

// ==================== 数据 ====================
const courseData = {
    chapters: [
        {
            id: 'quickstart',
            number: '00',
            title: '10分钟跑通第一次成功',
            desc: '只做三件事：安装CLI、配置Key、跑通第一次对话',
            time: '10分钟',
            difficulty: '超简单',
            category: '必修',
            path: 'pages/quickstart.html'
        },
        {
            id: 'concepts',
            number: '00A',
            title: '概念扫盲（必看）',
            desc: '用一张图讲清 Claude / 模型 / API Key / 工作目录 / 权限模式',
            time: '15分钟',
            difficulty: '超简单',
            category: '必修',
            path: 'pages/concepts.html'
        },
        {
            id: 'chapter-01',
            number: '01',
            title: '环境安装与第一次成功',
            desc: '完成所有环境配置，跑通第一次对话，为后续学习做好准备',
            time: '50分钟',
            difficulty: '简单',
            category: '必修',
            path: 'pages/chapter-01.html'
        },
        {
            id: 'chapter-02',
            number: '02',
            title: 'Claude Code 命令详解',
            desc: '掌握所有核心命令、模式和权限，安全高效地使用 Claude Code CLI',
            time: '40分钟',
            difficulty: '简单',
            category: '必修',
            path: 'pages/chapter-02.html'
        },
        {
            id: 'chapter-03',
            number: '03',
            title: 'Git 存档与版本管理',
            desc: '学会用 Git 做好存档，随时可以回退，不用担心改错文件',
            time: '45分钟',
            difficulty: '简单',
            category: '必修',
            path: 'pages/chapter-03.html'
        },
        {
            id: 'chapter-04',
            number: '04',
            title: '实战场景',
            desc: '学会用 Claude Code 处理日常高频任务，Excel 数据处理、文件整理、周报生成等',
            time: '60分钟',
            difficulty: '中等',
            category: '必修',
            path: 'pages/chapter-04.html'
        },
        {
            id: 'chapter-05',
            number: '05',
            title: '高质量提问与提示词模板',
            desc: '学会让 Claude Code 更好地帮你干活，掌握万能提示词模板',
            time: '35分钟',
            difficulty: '中等',
            category: '必修',
            path: 'pages/chapter-05.html'
        },
        {
            id: 'chapter-06',
            number: '06',
            title: 'MCP 服务器扩展',
            desc: '让 Claude Code 连接外部世界，使用数据库、API、搜索等功能',
            time: '50分钟',
            difficulty: '进阶',
            category: '进阶',
            path: 'pages/chapter-06.html'
        },
        {
            id: 'chapter-07',
            number: '07',
            title: 'SKILL 自定义技能',
            desc: '创建可复用的技能模板，让常用操作一键执行',
            time: '40分钟',
            difficulty: '进阶',
            category: '进阶',
            path: 'pages/chapter-07.html'
        },
        {
            id: 'chapter-08',
            number: '08',
            title: '搭配 Trae 使用',
            desc: '在 Trae 中使用 Claude Code，结合可视化界面的优势',
            time: '25分钟',
            difficulty: '简单',
            category: '进阶',
            path: 'pages/chapter-08.html'
        },
        {
            id: 'chapter-09',
            number: '09',
            title: '需求先行',
            desc: '明确需求、购买服务器、配置环境、连接服务器',
            time: '60分钟',
            difficulty: '进阶',
            category: '实战',
            path: 'pages/chapter-09.html'
        },
        {
            id: 'chapter-10',
            number: '10',
            title: '正规开发流程',
            desc: '用 Plan 模式梳理需求、写项目文档、处理第三方对接、部署上线',
            time: '90分钟',
            difficulty: '进阶',
            category: '实战',
            path: 'pages/chapter-10.html'
        },
        {
            id: 'appendix',
            number: '附录',
            title: '速查手册',
            desc: '安装速查、命令速查、提示词模板速查、常见问题速查',
            time: '随时查阅',
            difficulty: '-',
            category: '附录',
            path: 'pages/appendix.html'
        },
        {
            id: 'troubleshooting',
            number: 'A1',
            title: '故障排查（按症状）',
            desc: '不懂报错也能查：按“我看到什么/我点了什么”来解决',
            time: '随时查阅',
            difficulty: '-',
            category: '附录',
            path: 'pages/troubleshooting.html'
        },
        {
            id: 'cost-saving',
            number: 'A2',
            title: '省钱与避坑',
            desc: '减少无效对话，避免烧额度：先问清楚再开工',
            time: '10分钟',
            difficulty: '-',
            category: '附录',
            path: 'pages/cost-saving.html'
        },
        {
            id: 'cc-switch',
            number: 'A3',
            title: 'cc-switch 图形化配置工具',
            desc: '图形化界面一键切换 API 配置，无需手动编辑配置文件',
            time: '15分钟',
            difficulty: '简单',
            category: '附录',
            path: 'pages/cc-switch.html'
        },
        {
            id: 'scenario-pack',
            number: 'P2-1',
            title: '场景包（带练习素材）',
            desc: '土木/非程序员常见任务：练习素材 + 一键提示词 + 验收标准',
            time: '随时练习',
            difficulty: '-',
            category: '附录',
            path: 'pages/scenario-pack.html'
        }
    ]
};

// 给首页内联脚本复用（避免重复维护同一份章节数据）
window.courseData = courseData;

// ==================== 图标（避免 emoji 兼容问题） ====================
function isInPagesDir() {
    // main.js 同时被首页与 pages/* 引用；有些本地/预览工具会把 pages 目录当站点根，导致 pathname 不包含 /pages/
    if (window.location.pathname.includes('/pages/')) return true;

    return !!(
        document.querySelector('link[href^="../css/"]') ||
        document.querySelector('script[src^="../js/"]') ||
        document.querySelector('a[href="../index.html"]')
    );
}

function getIconSpritePath() {
    // main.js 同时被首页与 pages/* 引用，需要动态计算相对路径
    return isInPagesDir() ? '../images/icons.svg' : 'images/icons.svg';
}

// ==================== 导航路径（修复 pages/ 相对路径问题） ====================
function resolveNavPath(targetPath) {
    if (!targetPath) return targetPath;

    // 绝对 URL / 锚点不处理
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(targetPath) || targetPath.startsWith('#')) {
        return targetPath;
    }

    const inPages = isInPagesDir();

    // 课程数据统一写成相对站点根的 "pages/xxx.html"
    // 但在 pages/*.html 页面里点击时，需要去掉前缀，避免变成 pages/pages/xxx.html
    if (inPages && targetPath.startsWith('pages/')) {
        return targetPath.slice('pages/'.length);
    }

    // 反向兼容：如果有人传入了 "chapter-01.html" 这种页面内相对路径
    if (!inPages && !targetPath.startsWith('pages/') && targetPath.endsWith('.html')) {
        return `pages/${targetPath}`;
    }

    return targetPath;
}

function iconSvg(symbolId, className = 'icon icon-xs') {
    const sprite = getIconSpritePath();
    return `<svg class="${className}" aria-hidden="true"><use href="${sprite}#${symbolId}"></use></svg>`;
}

// 提供给首页内联脚本复用
window.iconSvg = iconSvg;

// ==================== 操作系统偏好（隐藏不相关步骤） ====================
const OsPreference = {
    key: 'claude-os-preference',

    get() {
        const value = localStorage.getItem(this.key);
        return value === 'windows' || value === 'mac' || value === 'all' ? value : null;
    },

    set(value) {
        if (value === 'windows' || value === 'mac' || value === 'all') {
            localStorage.setItem(this.key, value);
            return;
        }
        localStorage.removeItem(this.key);
    }
};

function detectOs() {
    const platform = (navigator.platform || '').toLowerCase();
    const ua = (navigator.userAgent || '').toLowerCase();
    const raw = `${platform} ${ua}`;

    if (raw.includes('win')) return 'windows';
    if (raw.includes('mac')) return 'mac';
    return null;
}

function applyOsVisibility(os) {
    const selected = os && os !== 'all' ? os : null;
    document.documentElement.setAttribute('data-os', selected || 'all');

    document.querySelectorAll('[data-os]').forEach(el => {
        const value = (el.getAttribute('data-os') || '').trim();
        const allowed = value
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

        const shouldShow = !selected || allowed.length === 0 || allowed.includes(selected);
        el.classList.toggle('os-hidden', !shouldShow);
    });

    document.querySelectorAll('[data-os-switcher]').forEach(switcher => {
        switcher.querySelectorAll('[data-os-value]').forEach(btn => {
            const isActive = (btn.dataset.osValue || '') === (selected || 'all');
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    });
}

function initOsSwitcher() {
    const switchers = document.querySelectorAll('[data-os-switcher]');

    let os = OsPreference.get();
    if (!os) {
        os = detectOs() || 'windows';
        OsPreference.set(os);
    }

    applyOsVisibility(os);

    switchers.forEach(switcher => {
        switcher.querySelectorAll('[data-os-value]').forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.dataset.osValue || 'all';
                OsPreference.set(value);
                applyOsVisibility(value);
            });
        });
    });
}

// ==================== 本存储管理 ====================
const Storage = {
    getProgress() {
        const data = localStorage.getItem('claude-course-progress');
        return data ? JSON.parse(data) : { completed: [], current: null };
    },

    saveProgress(progress) {
        localStorage.setItem('claude-course-progress', JSON.stringify(progress));
    },

    markCompleted(chapterId) {
        const progress = this.getProgress();
        if (!progress.completed.includes(chapterId)) {
            progress.completed.push(chapterId);
        }
        this.saveProgress(progress);
        this.updateProgressDisplay();
    },

    markIncomplete(chapterId) {
        const progress = this.getProgress();
        progress.completed = progress.completed.filter(id => id !== chapterId);
        this.saveProgress(progress);
        this.updateProgressDisplay();
    },

    isCompleted(chapterId) {
        const progress = this.getProgress();
        return progress.completed.includes(chapterId);
    },

    setCurrent(chapterId) {
        const progress = this.getProgress();
        progress.current = chapterId;
        this.saveProgress(progress);
    },

    getCompletionRate() {
        const progress = this.getProgress();
        const trackable = courseData.chapters.filter(ch => ch.category !== '附录');
        const completedTrackable = progress.completed.filter(id => trackable.some(ch => ch.id === id));
        if (trackable.length === 0) return 0;
        return Math.round((completedTrackable.length / trackable.length) * 100);
    },

    updateProgressDisplay() {
        const rate = this.getCompletionRate();
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = rate + '%';
        }

        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = rate + '%';
        }

        // 更新侧边栏完成状态
        courseData.chapters.forEach(chapter => {
            const navItem = document.querySelector(`[data-chapter="${chapter.id}"]`);
            if (navItem) {
                navItem.classList.toggle('completed', this.isCompleted(chapter.id));
            }
        });
    },

    exportAll() {
        const checklists = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            if (key.startsWith('checklist-')) {
                checklists[key] = localStorage.getItem(key);
            }
        }

        return {
            version: 1,
            exportedAt: new Date().toISOString(),
            progress: this.getProgress(),
            checklists
        };
    },

    importAll(payload) {
        if (!payload || typeof payload !== 'object') {
            throw new Error('进度文件格式不正确');
        }
        if (!payload.progress || typeof payload.progress !== 'object') {
            throw new Error('进度文件缺少 progress');
        }

        const progress = {
            completed: Array.isArray(payload.progress.completed) ? payload.progress.completed : [],
            current: payload.progress.current ?? null
        };
        this.saveProgress(progress);

        const checklists = payload.checklists && typeof payload.checklists === 'object' ? payload.checklists : {};
        Object.entries(checklists).forEach(([key, value]) => {
            if (typeof key === 'string' && key.startsWith('checklist-') && typeof value === 'string') {
                localStorage.setItem(key, value);
            }
        });

        this.updateProgressDisplay();
    },

    resetAll() {
        localStorage.removeItem('claude-course-progress');

        const toRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('checklist-')) {
                toRemove.push(key);
            }
        }
        toRemove.forEach(key => localStorage.removeItem(key));

        this.updateProgressDisplay();
    }
};

// ==================== UI 操作 ====================
const UI = {
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.overlay');
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');

        const menuToggle = document.getElementById('menuToggle') || document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', sidebar.classList.contains('open') ? 'true' : 'false');
        }

        document.body.classList.toggle('no-scroll', sidebar.classList.contains('open'));
    },

    closeSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.overlay');
        sidebar.classList.remove('open');
        overlay.classList.remove('show');

        const menuToggle = document.getElementById('menuToggle') || document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', 'false');
        }

        document.body.classList.remove('no-scroll');
    },

    highlightCode() {
        // 简单的语法高亮
        document.querySelectorAll('pre code').forEach(block => {
            const lang = block.className.match(/language-(\w+)/);
            if (lang) {
                this.highlightBlock(block, lang[1]);
            }
        });
    },

    highlightBlock(block, lang) {
        let code = block.innerHTML;

        // 注释
        if (['javascript', 'js', 'python', 'py', 'bash', 'sh'].includes(lang)) {
            code = code.replace(/(\/\/.*$|#.*$)/gm, '<span class="code-comment">$1</span>');
        }

        // 字符串
        code = code.replace(/(['"`])(.*?)\1/g, '<span class="code-string">$1$2$1</span>');

        // 关键字
        const keywords = {
            javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'from', 'class', 'new', 'async', 'await'],
            python: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'import', 'from', 'as', 'async', 'await', 'try', 'except', 'with', 'lambda'],
            bash: ['if', 'then', 'else', 'fi', 'for', 'do', 'done', 'while', 'function', 'echo', 'cd', 'ls', 'mkdir', 'rm']
        };

        if (keywords[lang]) {
            const keywordPattern = new RegExp('\\b(' + keywords[lang].join('|') + ')\\b', 'g');
            code = code.replace(keywordPattern, '<span class="code-keyword">$1</span>');
        }

        block.innerHTML = code;
    },

    copyCode(button) {
        const pre = button.closest('.code-block-wrapper')?.querySelector('pre') ||
                   button.closest('.code-header')?.nextElementSibling;
        if (pre) {
            const code = pre.textContent;
            navigator.clipboard.writeText(code).then(() => {
                button.textContent = '已复制!';
                setTimeout(() => {
                    button.textContent = '复制代码';
                }, 2000);
            });
        }
    },

    buildSidebar() {
        const navContainer = document.querySelector('.sidebar-nav');
        if (!navContainer) return;

        const categories = {
            '必修': courseData.chapters.filter(c => c.category === '必修'),
            '进阶': courseData.chapters.filter(c => c.category === '进阶'),
            '实战': courseData.chapters.filter(c => c.category === '实战'),
            '附录': courseData.chapters.filter(c => c.category === '附录')
        };

        const categoryIcons = {
            '必修': 'icon-book',
            '进阶': 'icon-spark',
            '实战': 'icon-target',
            '附录': 'icon-list'
        };

        let html = '';
        for (const [category, chapters] of Object.entries(categories)) {
            if (chapters.length === 0) continue;

            html += `
                <div class="nav-section">
                    <div class="nav-section-title">
                        ${iconSvg(categoryIcons[category], 'icon icon-xs')}
                        <span>${category}课程</span>
                    </div>
            `;

            for (const chapter of chapters) {
                const isCompleted = Storage.isCompleted(chapter.id);
                const completedClass = isCompleted ? ' completed' : '';
                const checkmark = isCompleted ? ` <span class="checkmark">${iconSvg('icon-check', 'icon icon-xs')}</span>` : '';

                const href = resolveNavPath(chapter.path);
                html += `
                    <a class="nav-item${completedClass}" href="${href}" data-chapter="${chapter.id}" data-path="${chapter.path}">
                        <span class="nav-icon">${isCompleted ? iconSvg('icon-check', 'icon icon-xs') : iconSvg('icon-circle', 'icon icon-xs')}</span>
                        <span class="nav-text">${chapter.number}. ${chapter.title}</span>
                        ${checkmark}
                    </a>
                `;
            }

            html += '</div>';
        }

        navContainer.innerHTML = html;

        // 添加点击事件
        navContainer.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // 用 <a href> 做真实跳转，避免某些预览环境下的相对路径误判
                e.preventDefault();

                const href = item.getAttribute('href');
                const fallbackPath = item.dataset.path;
                const target = href || (fallbackPath ? resolveNavPath(fallbackPath) : null);

                if (target) window.location.href = target;

                // 移动端点击后收起侧边栏
                UI.closeSidebar();
            });
        });
    },

    buildChapterGrid() {
        // 仅在明确标记的容器中自动生成，避免覆盖其它页面的 chapter-grid（例如场景包）
        const gridContainer = document.querySelector('[data-auto-chapter-grid="true"]');
        if (!gridContainer) return;

        let html = '';
        for (const chapter of courseData.chapters) {
            html += `
                <div class="chapter-card" data-path="${chapter.path}">
                    <div class="chapter-header">
                        <span class="chapter-number">${chapter.number}</span>
                        <span class="chapter-title">${chapter.title}</span>
                    </div>
                    <p class="chapter-desc">${chapter.desc}</p>
                    <div class="chapter-meta">
                        <span>${iconSvg('icon-clock', 'icon icon-xs')} ${chapter.time}</span>
                        <span>${iconSvg('icon-signal', 'icon icon-xs')} ${chapter.difficulty}</span>
                    </div>
                </div>
            `;
        }

        gridContainer.innerHTML = html;

        // 添加点击事件
        gridContainer.querySelectorAll('.chapter-card').forEach(card => {
            card.addEventListener('click', () => {
                const path = card.dataset.path;
                if (path) {
                    window.location.href = resolveNavPath(path);
                }
            });
        });
    },

    initSearch() {
        const searchInput = document.querySelector('.search-box input');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const navItems = document.querySelectorAll('.nav-item');

            navItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (query === '' || text.includes(query)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    },

    initChecklist() {
        document.querySelectorAll('.checklist-item input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const label = e.target.nextElementSibling;
                if (e.target.checked) {
                    label.style.textDecoration = 'line-through';
                    label.style.color = 'var(--text-muted)';
                } else {
                    label.style.textDecoration = '';
                    label.style.color = '';
                }

                // 保存到本地存储
                const checklistId = checkbox.closest('.checklist')?.dataset.id;
                if (checklistId) {
                    this.saveChecklistState(checklistId);
                }
            });
        });

        // 恢复检查状态
        document.querySelectorAll('.checklist').forEach(checklist => {
            const checklistId = checklist.dataset.id;
            if (checklistId) {
                this.restoreChecklistState(checklistId);
            }
        });
    },

    saveChecklistState(checklistId) {
        const checklist = document.querySelector(`.checklist[data-id="${checklistId}"]`);
        if (!checklist) return;

        const items = checklist.querySelectorAll('.checklist-item input');
        const state = Array.from(items).map(item => item.checked);
        localStorage.setItem(`checklist-${checklistId}`, JSON.stringify(state));
    },

    restoreChecklistState(checklistId) {
        const checklist = document.querySelector(`.checklist[data-id="${checklistId}"]`);
        if (!checklist) return;

        const data = localStorage.getItem(`checklist-${checklistId}`);
        if (!data) return;

        const state = JSON.parse(data);
        const items = checklist.querySelectorAll('.checklist-item input');
        items.forEach((item, index) => {
            if (state[index]) {
                item.checked = true;
                item.dispatchEvent(new Event('change'));
            }
        });
    }
};

// ==================== 页面初始化 ====================
function init() {
    // 初始化返回顶部按钮
    initBackToTop();

    // 初始化滚动动画
    initScrollAnimations();

    // 更新进度显示
    Storage.updateProgressDisplay();

    // 首页：继续学习入口
    updateContinueLearningButtons();

    // 构建侧边栏
    UI.buildSidebar();

    // 操作系统选择（隐藏不相关步骤）
    initOsSwitcher();

    // 构建章节网格
    UI.buildChapterGrid();

    // 初始化搜索
    UI.initSearch();

    // 初始化检查清单
    UI.initChecklist();

    // 右侧 TOC（仅文章页）
    initToc();

    // 本页阅读进度与预计时间（仅文章页）
    initReadingProgress();

    // 让卡片/目录支持键盘访问
    initCardNavigation();

    // 进度导出/导入/重置
    initProgressTools();

    // 侧边栏切换
    const menuToggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.overlay');
    if (menuToggle) {
        menuToggle.addEventListener('click', UI.toggleSidebar);
        menuToggle.setAttribute('aria-expanded', 'false');
    }
    if (overlay) {
        overlay.addEventListener('click', UI.closeSidebar);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            UI.closeSidebar();
        }
    });

    // 代码复制按钮
    document.querySelectorAll('.code-copy').forEach(button => {
        button.addEventListener('click', () => UI.copyCode(button));
    });

    // 标记当前章节
    const currentChapter = getCurrentChapterId();
    if (currentChapter) {
        Storage.setCurrent(currentChapter);

        const currentNavItem = document.querySelector(`[data-chapter="${currentChapter}"]`);
        if (currentNavItem) {
            currentNavItem.classList.add('active');
        }

        // 标记完成按钮
        const markCompleteBtn = document.querySelector('.mark-complete-btn');
        if (markCompleteBtn) {
            setupMarkCompleteButton(markCompleteBtn, currentChapter);
        }
    }

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

function initCardNavigation() {
    document.querySelectorAll('.chapter-card[data-path]').forEach(card => {
        // 如果是 <a>，浏览器本身就支持键盘访问
        if (card.tagName.toLowerCase() === 'a') return;

        const path = card.dataset.path;
        if (!path) return;

        card.tabIndex = 0;
        card.setAttribute('role', 'link');
        card.addEventListener('click', () => {
            window.location.href = resolveNavPath(path);
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.href = resolveNavPath(path);
            }
        });
    });
}

function initProgressTools() {
    const exportBtn = document.getElementById('exportProgressBtn');
    const importInput = document.getElementById('importProgressFile');
    const resetBtn = document.getElementById('resetProgressBtn');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = Storage.exportAll();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            const ts = new Date().toISOString().replace(/[:.]/g, '-');
            a.href = url;
            a.download = `claude-course-progress_${ts}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        });
    }

    if (importInput) {
        importInput.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const payload = JSON.parse(text);
                const ok = window.confirm('确认导入进度？这会覆盖你当前浏览器的学习进度。');
                if (!ok) return;

                Storage.importAll(payload);
                UI.initChecklist();
                alert('导入成功：已更新学习进度（仅保存到本地浏览器）。');
            } catch (err) {
                alert(`导入失败：${err?.message || err}`);
            } finally {
                e.target.value = '';
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const ok = window.confirm('确认重置所有学习进度和清单勾选？此操作不可撤销（仅影响当前浏览器）。');
            if (!ok) return;

            Storage.resetAll();
            // 重新加载以确保所有页面状态恢复到初始
            window.location.reload();
        });
    }
}

function setupMarkCompleteButton(button, pageId) {
    const setState = (completed) => {
        button.classList.toggle('completed', completed);
        if (completed) {
            button.innerHTML = `${iconSvg('icon-check', 'icon icon-sm')} 已完成（点击可取消）`;
            button.title = '已保存到本地浏览器，点击可取消完成标记';
        } else {
            button.innerHTML = `${iconSvg('icon-circle', 'icon icon-sm')} 标记为已完成（保存进度）`;
            button.title = '把本章标记为已完成（仅保存到本地浏览器）';
        }
    };

    setState(Storage.isCompleted(pageId));

    button.addEventListener('click', () => {
        const completed = Storage.isCompleted(pageId);
        if (completed) {
            const ok = window.confirm('要取消本章的完成标记吗？');
            if (!ok) return;
            Storage.markIncomplete(pageId);
            setState(false);
            return;
        }

        Storage.markCompleted(pageId);
        setState(true);
    });
}

function updateContinueLearningButtons() {
    const primary = document.getElementById('primaryLearningBtn');
    const secondary = document.getElementById('secondaryLearningBtn');
    if (!primary) return;

    const progress = Storage.getProgress();
    const chapters = courseData.chapters;

    let target = null;
    if (progress.current) {
        target = chapters.find(c => c.id === progress.current) || null;
    }

    if (!target) {
        const nonAppendix = chapters.filter(c => c.category !== '附录');
        target = nonAppendix.find(c => !Storage.isCompleted(c.id)) || chapters.find(c => c.id === 'appendix') || nonAppendix[0] || null;
    }

    if (!target) return;

    const isFreshStart = target.id === 'chapter-01' && (!progress.completed || progress.completed.length === 0) && !progress.current;
    if (isFreshStart) return;

    const label = `继续学习（${target.number}）`;
    const title = `${target.number}. ${target.title}`;
    const html = `${iconSvg('icon-target', 'icon icon-sm')} ${label}`;

    primary.href = resolveNavPath(target.path);
    primary.innerHTML = html;
    primary.title = title;

    const hint = document.getElementById('continueHint');
    if (hint) {
        hint.textContent = `上次学到：${title}`;
        hint.style.display = '';
    }
}

function getCurrentChapterId() {
    const explicit = document.body?.dataset?.pageId;
    if (explicit) return explicit;

    const path = window.location.pathname;
    const match = path.match(/chapter-(\d+)|appendix/);
    if (match) {
        return match[0] === 'appendix' ? 'appendix' : `chapter-${match[1].padStart(2, '0')}`;
    }
    return null;
}

// DOM 加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ==================== 浮动帮助按钮 ====================
function initFloatingHelpButton() {
    const helpBtn = document.getElementById('floatingHelpBtn');
    if (!helpBtn) return;

    // 滚动后显示
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 200) {
            helpBtn.classList.add('show');
        } else {
            helpBtn.classList.remove('show');
        }
        lastScrollY = scrollY;
    }, { passive: true });
}

// ==================== 字体大小调节 ====================
function initFontSizeControls() {
    const increaseBtn = document.getElementById('fontIncrease');
    const decreaseBtn = document.getElementById('fontDecrease');
    const display = document.getElementById('fontSizeDisplay');

    if (!increaseBtn || !decreaseBtn || !display) return;

    const storageKey = 'claude-font-size';
    const defaultSize = 100;
    const minSize = 85;
    const maxSize = 130;
    const step = 5;

    // 获取保存的字体大小
    let currentSize = parseInt(localStorage.getItem(storageKey)) || defaultSize;
    updateFontSize(currentSize);

    increaseBtn.addEventListener('click', () => {
        if (currentSize < maxSize) {
            currentSize = Math.min(currentSize + step, maxSize);
            updateFontSize(currentSize);
            localStorage.setItem(storageKey, currentSize);
        }
    });

    decreaseBtn.addEventListener('click', () => {
        if (currentSize > minSize) {
            currentSize = Math.max(currentSize - step, minSize);
            updateFontSize(currentSize);
            localStorage.setItem(storageKey, currentSize);
        }
    });

    function updateFontSize(size) {
        display.textContent = size + '%';
        document.documentElement.style.fontSize = size + '%';
    }
}

// ==================== 自测题功能 ====================
function initSelfQuiz() {
    const quizzes = document.querySelectorAll('.self-quiz');

    quizzes.forEach(quiz => {
        const questions = quiz.querySelectorAll('.self-quiz-question');
        let correctCount = 0;
        let answeredCount = 0;

        questions.forEach((question, qIndex) => {
            const options = question.querySelectorAll('.self-quiz-option');
            const feedback = question.querySelector('.self-quiz-feedback');
            const correctAnswer = question.dataset.correct;

            options.forEach((option, oIndex) => {
                option.addEventListener('click', () => {
                    // 已经回答过，不再处理
                    if (question.classList.contains('answered')) return;

                    question.classList.add('answered');
                    answeredCount++;

                    const isCorrect = option.dataset.correct === 'true';

                    // 显示正确/错误状态
                    options.forEach(opt => {
                        if (opt.dataset.correct === 'true') {
                            opt.classList.add('correct');
                        } else if (opt === option && !isCorrect) {
                            opt.classList.add('wrong');
                        }
                    });

                    // 显示反馈信息
                    if (feedback) {
                        feedback.classList.add('show', isCorrect ? 'correct' : 'wrong');
                        feedback.textContent = isCorrect
                            ? (option.dataset.feedback || '回答正确！')
                            : (option.dataset.feedback || '回答错误，正确答案已标出。');
                    }

                    if (isCorrect) {
                        correctCount++;
                    }

                    // 更新结果
                    updateQuizResult();
                });
            });

            function updateQuizResult() {
                const resultDiv = quiz.querySelector('.self-quiz-result');
                if (!resultDiv) return;

                resultDiv.classList.add('show');
                const scoreDiv = resultDiv.querySelector('.self-quiz-result-score');
                const textDiv = resultDiv.querySelector('.self-quiz-result-text');

                if (scoreDiv) {
                    scoreDiv.textContent = correctCount + '/' + questions.length;
                }
                if (textDiv) {
                    if (answeredCount === questions.length) {
                        const percentage = (correctCount / questions.length) * 100;
                        if (percentage >= 80) {
                            textDiv.textContent = '太棒了！你已经掌握了本章内容！';
                        } else if (percentage >= 60) {
                            textDiv.textContent = '不错！建议再复习一下薄弱环节。';
                        } else {
                            textDiv.textContent = '建议重新学习本章内容后再试。';
                        }
                    } else {
                        textDiv.textContent = `已回答 ${answeredCount}/${questions.length} 题`;
                    }
                }
            }
        });
    });
}

// ==================== 术语卡片 ====================
function initTermCards() {
    // 自动为带有 data-term 的元素添加术语卡片功能
    document.querySelectorAll('[data-term]').forEach(el => {
        const term = el.dataset.term;
        const definition = el.dataset.definition;

        if (term && definition) {
            el.classList.add('term-card');
            el.innerHTML = `${term}<span class="term-card-tooltip">${definition}</span>`;
        }
    });
}

// ==================== 初始化新增功能 ====================
function initNewFeatures() {
    initFloatingHelpButton();
    initFontSizeControls();
    initSelfQuiz();
    initTermCards();
}

// 在页面加载后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNewFeatures);
} else {
    initNewFeatures();
}
