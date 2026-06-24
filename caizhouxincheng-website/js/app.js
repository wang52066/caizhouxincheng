/* ============================================
   蔡州芯辰 · 全站交互脚本
   - 主题切换(系统/浅/深)
   - 滚动时导航栏收紧
   - 进入视口动画
   - 联系表单提交
   ============================================ */

(function () {
  'use strict';

  /* ---------- 主题 ---------- */
  const THEME_KEY = 'cx-theme';
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');

  function getPreferred() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }
  function toggleTheme() {
    const current = root.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }
  applyTheme(getPreferred());

  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  // 跟随系统
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'light' : 'dark');
    }
  });

  /* ---------- 滚动时导航栏 ---------- */
  const nav = document.querySelector('.nav');
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal 动画 ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ---------- 移动菜单 ---------- */
  const menuBtn = document.getElementById('menuBtn');
  const closeMenuBtn = document.getElementById('closeMenu');
  const mobileMenu = document.getElementById('mobileMenu');
  function openMenu() { mobileMenu && mobileMenu.classList.add('open'); }
  function closeMenu() { mobileMenu && mobileMenu.classList.remove('open'); }
  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  }

  /* ---------- 联系表单 ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = form.querySelector('.form-status');
      const btn = form.querySelector('button[type="submit"]');
      if (status) status.textContent = '正在发送…';
      btn && (btn.disabled = true);

      setTimeout(() => {
        if (status) status.textContent = '✓ 您的需求已提交,工程师将在 24 小时内联系您。';
        form.reset();
        btn && (btn.disabled = false);
      }, 900);
    });
  }

  /* ---------- 数字滚动 ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach((c) => counterIO.observe(c));

  function animateCount(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    const dur = 1400;
    const start = performance.now();
    const decimals = (el.getAttribute('data-count').split('.')[1] || '').length;
    function step(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = target * eased;
      el.textContent = decimals ? val.toFixed(decimals) : Math.floor(val);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- 平滑滚动 (锚点) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
})();
