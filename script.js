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

  const form = document.querySelector(".demo-form");
  const formMessage = form.querySelector(".form-message");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const originalButtonText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    formMessage.textContent = "";

    try {
      const response = await fetch(
        "https://api.web3forms.com/submit",
        {
          method: "POST",
          body: new FormData(form)
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to send your message."
        );
      }

      formMessage.textContent =
        "Thank you! Your message has been sent successfully.";

      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);

      formMessage.textContent =
        "Sorry, your message could not be sent. Please try again.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });

});
