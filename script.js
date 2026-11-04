(() => {
  'use strict';

  /* ── Year ─────────────────────────────────────────────────── */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ── Latest release ───────────────────────────────────────── */
  const REPO = 'Deirmos/LoliBox';
  const STATIC_VERSION = '1.0.10';
  const CACHE_KEY = 'lolibox:latest-release:v1';
  const CACHE_TTL = 6 * 60 * 60 * 1000;

  const formatSize = (bytes) => {
    if (!bytes || !Number.isFinite(bytes)) return null;
    const mb = bytes / (1024 * 1024);
    return mb >= 10 ? `${Math.round(mb)} МБ` : `${mb.toFixed(1)} МБ`;
  };

  const readCache = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.at !== 'number') return null;
      if (Date.now() - parsed.at > CACHE_TTL) return null;
      return parsed.data || null;
    } catch {
      return null;
    }
  };

  const writeCache = (data) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
    } catch {
      /* приватный режим — просто не кешируем */
    }
  };

  const applyRelease = (release) => {
    if (!release) return;

    const version = String(release.version || '').replace(/^v/i, '');
    if (version) {
      document.querySelectorAll('[data-version]').forEach((el) => {
        el.textContent = version;
      });
    }

    if (release.url) {
      document.querySelectorAll('[data-download]').forEach((el) => {
        el.setAttribute('href', release.url);
      });
    }

    if (release.size) {
      const label = formatSize(release.size);
      if (label) {
        document.querySelectorAll('[data-size]').forEach((el) => {
          el.textContent = label;
        });
      }
    }

    // Контрольная сумма в футере известна только для статической версии.
    const shaRow = document.querySelector('[data-sha-row]');
    if (shaRow && version && version !== STATIC_VERSION) {
      shaRow.hidden = true;
    }
  };

  const loadLatestRelease = async () => {
    const cached = readCache();
    if (cached) {
      applyRelease(cached);
      return;
    }

    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (!res.ok) return;

      const data = await res.json();
      if (!data || data.draft || data.prerelease) return;

      const asset = (data.assets || []).find((a) => /\.exe$/i.test(a.name || ''));
      const info = {
        version: data.tag_name || '',
        url: asset ? asset.browser_download_url : data.html_url,
        size: asset ? asset.size : null,
        published: data.published_at || null,
      };

      writeCache(info);
      applyRelease(info);
    } catch {
      /* сеть недоступна — остаётся статическая ссылка из разметки */
    }
  };

  loadLatestRelease();

  /* ── Screenshot tabs ──────────────────────────────────────── */
  const tabs = Array.from(document.querySelectorAll('.shot-tab'));
  const shotImage = document.querySelector('[data-shot-image]');
  const shotTitle = document.querySelector('[data-shot-title]');
  const shotOpen = document.querySelector('.shot-open');

  const shots = tabs.map((tab) => ({
    src: tab.dataset.shot,
    title: tab.dataset.title,
    alt: tab.dataset.alt,
  }));

  let activeShot = 0;

  const setShot = (index, { animate = true } = {}) => {
    if (!shots.length || !shotImage) return;
    activeShot = (index + shots.length) % shots.length;
    const shot = shots[activeShot];

    tabs.forEach((tab, i) => {
      const isActive = i === activeShot;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (animate) shotImage.classList.add('is-swapping');

    const swap = () => {
      shotImage.src = shot.src;
      shotImage.alt = shot.alt;
      if (shotTitle) shotTitle.textContent = shot.title;
      if (shotOpen) shotOpen.setAttribute('aria-label', `Открыть скриншот «${shot.title}» на весь экран`);
      shotImage.classList.remove('is-swapping');
    };

    if (animate) {
      window.setTimeout(swap, 140);
    } else {
      swap();
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setShot(index));
    tab.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const next = index + (event.key === 'ArrowRight' ? 1 : -1);
        setShot(next);
        const nextTab = tabs[(next + tabs.length) % tabs.length];
        if (nextTab) nextTab.focus();
      }
    });
  });

  // Предзагрузка остальных скриншотов после загрузки страницы.
  window.addEventListener('load', () => {
    shots.slice(1).forEach((shot) => {
      const img = new Image();
      img.src = shot.src;
    });
  }, { once: true });

  /* ── Lightbox ─────────────────────────────────────────────── */
  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImage = document.querySelector('[data-lightbox-image]');
  const lightboxPrev = document.querySelector('[data-lightbox-prev]');
  const lightboxNext = document.querySelector('[data-lightbox-next]');
  const lightboxClose = document.querySelector('[data-lightbox-close]');
  let lastFocused = null;

  const openLightbox = (index) => {
    if (!lightbox || !lightboxImage || !shots.length) return;
    activeShot = (index + shots.length) % shots.length;
    const shot = shots[activeShot];
    lightboxImage.src = shot.src;
    lightboxImage.alt = shot.alt;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lastFocused = document.activeElement;
    if (lightboxClose) lightboxClose.focus();
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  };

  if (shotOpen) {
    shotOpen.addEventListener('click', () => openLightbox(activeShot));
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', () => openLightbox(activeShot - 1));
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', () => openLightbox(activeShot + 1));
  }

  if (lightbox) {
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (!lightbox || lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') openLightbox(activeShot - 1);
    if (event.key === 'ArrowRight') openLightbox(activeShot + 1);
  });

  /* ── Copy SHA ─────────────────────────────────────────────── */
  const copyBtn = document.querySelector('[data-copy-sha]');
  const shaEl = document.querySelector('[data-sha]');

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(area);
        return ok;
      } catch {
        return false;
      }
    }
  };

  if (copyBtn && shaEl) {
    copyBtn.addEventListener('click', async () => {
      const ok = await copyText(shaEl.textContent.trim());
      const original = copyBtn.textContent;
      copyBtn.textContent = ok ? 'Скопировано' : 'Не вышло';
      window.setTimeout(() => {
        copyBtn.textContent = original;
      }, 1800);
    });
  }

  /* ── Reveal on scroll ─────────────────────────────────────── */
  const revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach((el) => observer.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('is-visible'));
  }

  /* ── Card glow follows the pointer ────────────────────────── */
  document.querySelectorAll('.feature-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  });
})();
