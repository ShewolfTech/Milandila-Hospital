document.addEventListener('DOMContentLoaded', () => {
  /* =========================================================
     MILANDILA HOSPITAL - GALLERY FUNCTIONALITY
     ========================================================= */

  /* ---------------------------------------------------------
     LIGHTBOX MARKUP
     Creates the fullscreen image viewer dynamically.
     --------------------------------------------------------- */

  const lightbox = document.createElement('div');

  lightbox.className = 'gallery-lightbox';

  lightbox.setAttribute('aria-hidden', 'true');

  lightbox.innerHTML = `
    <div
      class="gallery-lightbox-backdrop"
      data-lightbox-close
    ></div>

    <div
      class="gallery-lightbox-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-lightbox-title"
    >

      <button
        class="gallery-lightbox-close"
        type="button"
        data-lightbox-close
        aria-label="Close image viewer"
      >
        ✕
      </button>

      <button
        class="gallery-lightbox-nav gallery-lightbox-prev"
        type="button"
        data-gallery-prev
        aria-label="Previous image"
      >
        ←
      </button>

      <div class="gallery-lightbox-media">
        <img
          src=""
          alt=""
        >
      </div>

      <button
        class="gallery-lightbox-nav gallery-lightbox-next"
        type="button"
        data-gallery-next
        aria-label="Next image"
      >
        →
      </button>

      <div class="gallery-lightbox-details">

        <p
          class="eyebrow"
          id="gallery-lightbox-category"
        ></p>

        <h3 id="gallery-lightbox-title"></h3>

        <p class="gallery-lightbox-description"></p>

        <span
          class="gallery-lightbox-counter"
          aria-live="polite"
        ></span>

      </div>

    </div>
  `;

  document.body.appendChild(lightbox);


  /* ---------------------------------------------------------
     GALLERY ELEMENTS
     --------------------------------------------------------- */

  const grid = document.querySelector('#gallery-grid');

  const filterButtons = [
    ...document.querySelectorAll('.gallery-filter')
  ];

  const items = [
    ...document.querySelectorAll('.gallery-item')
  ];

  const countEl = document.querySelector('#gallery-count');

  const emptyEl = document.querySelector('#gallery-empty');


  /* ---------------------------------------------------------
     LIGHTBOX ELEMENTS
     --------------------------------------------------------- */

  const lightboxImage =
    lightbox.querySelector(
      '.gallery-lightbox-media img'
    );

  const lightboxCategory =
    lightbox.querySelector(
      '#gallery-lightbox-category'
    );

  const lightboxTitle =
    lightbox.querySelector(
      '#gallery-lightbox-title'
    );

  const lightboxDescription =
    lightbox.querySelector(
      '.gallery-lightbox-description'
    );

  const lightboxCounter =
    lightbox.querySelector(
      '.gallery-lightbox-counter'
    );

  const closeButtons =
    lightbox.querySelectorAll(
      '[data-lightbox-close]'
    );

  const prevButton =
    lightbox.querySelector(
      '[data-gallery-prev]'
    );

  const nextButton =
    lightbox.querySelector(
      '[data-gallery-next]'
    );


  /* ---------------------------------------------------------
     STATE
     --------------------------------------------------------- */

  let currentFilter = 'all';

  let visibleCards = [];

  let currentCardIndex = 0;

  let previousFocusedElement = null;

  let touchStartX = null;


  /* ---------------------------------------------------------
     GET VISIBLE GALLERY CARDS
     --------------------------------------------------------- */

  const getCards = (filter = currentFilter) => {

    return items

      .filter(item => {

        return (
          filter === 'all' ||
          item.dataset.category === filter
        );

      })

      .map(item => {

        return item.querySelector(
          '.gallery-card'
        );

      })

      .filter(Boolean);

  };


  /* ---------------------------------------------------------
     UPDATE IMAGE COUNT
     --------------------------------------------------------- */

  const updateCount = () => {

    visibleCards = getCards();

    if (countEl) {

      countEl.textContent =
        String(visibleCards.length);

    }

    if (emptyEl) {

      emptyEl.hidden =
        visibleCards.length !== 0;

    }

    if (grid) {

      grid.setAttribute(
        'aria-busy',
        'false'
      );

    }

  };


  /* ---------------------------------------------------------
     FILTER GALLERY
     --------------------------------------------------------- */

  const filterGallery = (filter) => {

    currentFilter = filter;

    if (grid) {

      grid.setAttribute(
        'aria-busy',
        'true'
      );

    }


    /* Update active filter button */

    filterButtons.forEach(button => {

      const active =
        button.dataset.filter === filter;

      button.classList.toggle(
        'is-active',
        active
      );

      button.setAttribute(
        'aria-pressed',
        String(active)
      );

    });


    /* Show / hide gallery items */

    items.forEach((item, index) => {

      const shouldShow =
        filter === 'all' ||
        item.dataset.category === filter;

      item.classList.toggle(
        'is-hidden',
        !shouldShow
      );


      /* Subtle staggered reveal */

      if (shouldShow) {

        item.style.setProperty(
          '--reveal-delay',
          `${Math.min(
            (index % 4) * 0.06,
            0.18
          )}s`
        );

      }

    });


    updateCount();

  };


  /* ---------------------------------------------------------
     FILTER BUTTON EVENTS
     --------------------------------------------------------- */

  filterButtons.forEach(button => {

    button.addEventListener(
      'click',
      () => {

        filterGallery(
          button.dataset.filter
        );

      }
    );

  });


  /* ---------------------------------------------------------
     SET LIGHTBOX IMAGE
     --------------------------------------------------------- */

  const setLightboxImage = (index) => {

    if (!visibleCards.length) {
      return;
    }


    /* Allow cycling from first to last and vice versa */

    currentCardIndex =
      (index + visibleCards.length) %
      visibleCards.length;


    const card =
      visibleCards[currentCardIndex];


    /* Full-size image */

    const full =
      card.dataset.full ||
      card.querySelector('img')?.src ||
      '';


    /* Image title */

    const title =
      card.dataset.title ||
      card.querySelector('img')?.alt ||
      'Gallery image';


    /* Category */

    const category =
      card.dataset.categoryLabel ||
      'Milandila';


    /* Description */

    const description =
      card.dataset.description ||
      '';


    /* Populate lightbox */

    lightboxImage.src = full;

    lightboxImage.alt = title;

    lightboxCategory.textContent =
      category;

    lightboxTitle.textContent =
      title;

    lightboxDescription.textContent =
      description;

    lightboxCounter.textContent =
      `${currentCardIndex + 1} / ${visibleCards.length}`;


    /* Disable arrows if only one image exists */

    prevButton.disabled =
      visibleCards.length < 2;

    nextButton.disabled =
      visibleCards.length < 2;

  };


  /* ---------------------------------------------------------
     OPEN LIGHTBOX
     --------------------------------------------------------- */

  const openLightbox = (card) => {

    const index =
      visibleCards.indexOf(card);

    if (index < 0) {
      return;
    }


    /* Remember where focus was */

    previousFocusedElement =
      document.activeElement;


    /* Load selected image */

    setLightboxImage(index);


    /* Show lightbox */

    lightbox.classList.add(
      'is-open'
    );

    lightbox.setAttribute(
      'aria-hidden',
      'false'
    );


    /* Stop background scrolling */

    document.body.classList.add(
      'gallery-lightbox-open'
    );


    /* Move keyboard focus */

    lightbox
      .querySelector(
        '.gallery-lightbox-close'
      )
      .focus();

  };


  /* ---------------------------------------------------------
     CLOSE LIGHTBOX
     --------------------------------------------------------- */

  const closeLightbox = () => {

    lightbox.classList.remove(
      'is-open'
    );

    lightbox.setAttribute(
      'aria-hidden',
      'true'
    );


    document.body.classList.remove(
      'gallery-lightbox-open'
    );


    /* Clear image */

    lightboxImage.src = '';


    /* Return focus */

    if (
      previousFocusedElement &&
      typeof previousFocusedElement.focus === 'function'
    ) {

      previousFocusedElement.focus();

    }

  };


  /* ---------------------------------------------------------
     GALLERY CARD CLICK EVENTS
     --------------------------------------------------------- */

  items.forEach(item => {

    const card =
      item.querySelector(
        '.gallery-card'
      );

    if (!card) {
      return;
    }


    card.addEventListener(
      'click',
      () => {

        openLightbox(card);

      }
    );

  });


  /* ---------------------------------------------------------
     PREVIOUS / NEXT BUTTONS
     --------------------------------------------------------- */

  prevButton.addEventListener(
    'click',
    () => {

      setLightboxImage(
        currentCardIndex - 1
      );

    }
  );


  nextButton.addEventListener(
    'click',
    () => {

      setLightboxImage(
        currentCardIndex + 1
      );

    }
  );


  /* ---------------------------------------------------------
     CLOSE BUTTONS
     --------------------------------------------------------- */

  closeButtons.forEach(button => {

    button.addEventListener(
      'click',
      closeLightbox
    );

  });


  /* ---------------------------------------------------------
     CLOSE WHEN CLICKING LIGHTBOX BACKDROP
     --------------------------------------------------------- */

  lightbox.addEventListener(
    'click',
    event => {

      if (event.target === lightbox) {

        closeLightbox();

      }

    }
  );


  /* ---------------------------------------------------------
     KEYBOARD CONTROLS
     
     ESC       = Close
     LEFT      = Previous
     RIGHT     = Next
     --------------------------------------------------------- */

  document.addEventListener(
    'keydown',
    event => {

      if (
        !lightbox.classList.contains(
          'is-open'
        )
      ) {

        return;

      }


      if (event.key === 'Escape') {

        event.preventDefault();

        closeLightbox();

      }


      else if (
        event.key === 'ArrowLeft'
      ) {

        event.preventDefault();

        setLightboxImage(
          currentCardIndex - 1
        );

      }


      else if (
        event.key === 'ArrowRight'
      ) {

        event.preventDefault();

        setLightboxImage(
          currentCardIndex + 1
        );

      }

    }
  );


  /* ---------------------------------------------------------
     MOBILE SWIPE SUPPORT
     
     Swipe left  = Next
     Swipe right = Previous
     --------------------------------------------------------- */

  const lightboxMedia =
    lightbox.querySelector(
      '.gallery-lightbox-media'
    );


  lightboxMedia.addEventListener(
    'touchstart',
    event => {

      touchStartX =
        event.changedTouches[0]?.screenX ??
        null;

    },
    {
      passive: true
    }
  );


  lightboxMedia.addEventListener(
    'touchend',
    event => {

      if (touchStartX === null) {
        return;
      }


      const endX =
        event.changedTouches[0]?.screenX ??
        touchStartX;


      const delta =
        endX - touchStartX;


      /* Only trigger if the swipe is large enough */

      if (Math.abs(delta) > 45) {

        setLightboxImage(

          delta < 0

            ? currentCardIndex + 1

            : currentCardIndex - 1

        );

      }


      touchStartX = null;

    },
    {
      passive: true
    }
  );


  /* ---------------------------------------------------------
     REDUCED MOTION ACCESSIBILITY
     --------------------------------------------------------- */

  const prefersReducedMotion =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );


  if (prefersReducedMotion.matches) {

    items.forEach(item => {

      item.classList.add(
        'is-visible'
      );

    });

  }


  /* ---------------------------------------------------------
     HERO PARALLAX EFFECT
     
     Keeps movement subtle so the hospital site still feels
     professional and calm.
     --------------------------------------------------------- */

  const parallaxHero =
    document.querySelector(
      '.gallery-hero-visual.parallax'
    );


  const reduceMotion =
    prefersReducedMotion.matches;


  if (
    parallaxHero &&
    !reduceMotion
  ) {

    let ticking = false;


    const updateHeroParallax = () => {

      const rect =
        parallaxHero.getBoundingClientRect();


      const offset =
        (
          rect.top +
          rect.height / 2
        ) -
        (
          window.innerHeight / 2
        );


      /* Limit movement */

      const amount =
        Math.max(
          -26,
          Math.min(
            26,
            -offset * 0.045
          )
        );


      parallaxHero.style.transform =
        `translate3d(0, ${amount}px, 0)`;


      ticking = false;

    };


    window.addEventListener(
      'scroll',
      () => {

        if (!ticking) {

          window.requestAnimationFrame(
            updateHeroParallax
          );

          ticking = true;

        }

      },
      {
        passive: true
      }
    );


    /* Run once when page loads */

    updateHeroParallax();

  }


  /* ---------------------------------------------------------
     PREVENT BODY SCROLL WHILE LIGHTBOX IS OPEN
     --------------------------------------------------------- */

  const lockStyles =
    document.createElement('style');


  lockStyles.textContent = `
    body.gallery-lightbox-open {
      overflow: hidden;
    }
  `;


  document.head.appendChild(
    lockStyles
  );


  /* ---------------------------------------------------------
     INITIAL GALLERY STATE
     --------------------------------------------------------- */

  updateCount();

});
