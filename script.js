document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile navigation
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav-links');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.textContent = open ? '✕' : '☰';
    });
  }

  // Scroll progress indicator
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.innerHTML = '<span></span>';
  document.body.appendChild(progress);
  const progressBar = progress.querySelector('span');

  const updateScrollUI = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', scrollTop > 12);

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? scrollTop / maxScroll : 0;
    progressBar.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
  };
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();

  // Add reveal classes to meaningful content blocks on every page.
  const revealTargets = document.querySelectorAll(
    '.section-head, .card, .info-list, .notice, .contact-card, .form-card, .cta, .image-placeholder, .footer-brand, .footer-main > div'
  );
  revealTargets.forEach((el, index) => {
    if (!el.classList.contains('reveal') && !el.classList.contains('reveal-left') && !el.classList.contains('reveal-right')) {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', `${Math.min((index % 5) * 0.07, 0.28)}s`);
    }
  });

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => el.classList.add('is-visible'));
  }

  // Gentle parallax on the main hero visual.
  const parallaxEls = document.querySelectorAll('.hero-visual, [data-parallax]');
  if (!reduceMotion && parallaxEls.length) {
    let ticking = false;
    const runParallax = () => {
      const y = window.scrollY || 0;
      parallaxEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        const offsetFromViewport = rect.top + rect.height / 2 - window.innerHeight / 2;
        const amount = Math.max(-32, Math.min(32, -offsetFromViewport * 0.05));
        el.style.transform = `translate3d(0, ${amount}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(runParallax);
        ticking = true;
      }
    }, { passive: true });
    runParallax();
  }

  // Demo contact form behavior
  document.querySelectorAll('.demo-form').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const message = form.querySelector('.form-message');
      if (message) {
        message.textContent = 'Demo form submitted. Connect this form to Wix Forms or your approved submission service before launch.';
        message.style.display = 'block';
      }
      form.reset();
    });
  });
});
