(function () {
  /*
    CINEMONK SITE JS EDIT GUIDE
    - Scroll animation: edit initScrollReveal().
    - Stats count-up animation: edit initStatsCounters().
    - Contact form submission: edit initGoogleFormSubmit().
    - Hamburger menu: edit initMobileMenu().
    - Feedback carousel speed: edit CAROUSEL_INTERVAL_MS.
    - Feedback carousel movement: edit getCarouselStep().
  */

  // Auto-scroll delay for the client feedback carousel.
  const CAROUSEL_INTERVAL_MS = 3600;
  const STATS_COUNTER_DURATION_MS = 1300;
  const CONTACT_FALLBACK_TEXT = "Submission could not be confirmed. Please contact us at cinemonkdigitals@gmail.com or call +91 8886940584.";
  const CONTACT_SENT_UNVERIFIED_TEXT = "Your details were sent to Google Forms, but this page cannot verify whether Google saved them. If the form is closed or you do not hear from us, please contact us at cinemonkdigitals@gmail.com or call +91 8886940584.";

  function formatStatValue(value, target, prefix, suffix) {
    // Keep integer stats clean while allowing future decimal targets if needed.
    const hasDecimal = String(target).includes(".");
    const formatted = hasDecimal ? value.toFixed(1) : String(Math.round(value));
    return `${prefix}${formatted}${suffix}`;
  }

  function setStatToFinal(stat) {
    const target = Number(stat.dataset.countTo || "0");
    const prefix = stat.dataset.countPrefix || "";
    const suffix = stat.dataset.countSuffix || "";
    stat.textContent = formatStatValue(target, stat.dataset.countTo || "0", prefix, suffix);
  }

  function animateStat(stat) {
    // Avoid replaying the count if the observer fires more than once.
    if (stat.dataset.counted === "true") return;
    stat.dataset.counted = "true";

    const targetText = stat.dataset.countTo || "0";
    const target = Number(targetText);
    const prefix = stat.dataset.countPrefix || "";
    const suffix = stat.dataset.countSuffix || "";
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / STATS_COUNTER_DURATION_MS, 1);
      // Ease-out movement gives the number a premium, less mechanical finish.
      const eased = 1 - Math.pow(1 - progress, 3);
      stat.textContent = formatStatValue(target * eased, targetText, prefix, suffix);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setStatToFinal(stat);
      }
    }

    requestAnimationFrame(tick);
  }

  function initStatsCounters() {
    const stats = document.querySelectorAll("[data-count-to]");
    if (!stats.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stats.forEach(setStatToFinal);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateStat(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.5
    });

    stats.forEach((stat) => observer.observe(stat));
  }

  function initScrollReveal() {
    // These major page blocks reveal as they enter the viewport; nav is excluded because it uses its own fixed transform.
    const revealItems = document.querySelectorAll(".section, .featured-reels, .footer");

    // Add the hidden starting state before observing scroll position.
    revealItems.forEach((item) => item.classList.add("scroll-reveal"));

    // IntersectionObserver triggers each reveal when the section reaches the viewport.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.16,
      rootMargin: "0px 0px -10% 0px"
    });

    // Observe each section/footer block.
    revealItems.forEach((item) => observer.observe(item));
  }

  function initReducedMotionFallback() {
    // If the visitor prefers reduced motion, show sections immediately.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

    document.querySelectorAll(".section, .featured-reels, .footer").forEach((item) => {
      item.classList.add("scroll-reveal", "is-visible");
    });

    return true;
  }

  function initMobileMenu() {
    // Main floating header.
    const nav = document.querySelector(".nav");
    // Hamburger button inside the header.
    const toggle = document.querySelector(".menu-toggle");

    // Stop if the button/header is missing.
    if (!nav || !toggle) return;

    toggle.addEventListener("click", () => {
      // Toggle dropdown menu visibility.
      const isOpen = nav.classList.toggle("is-menu-open");
      // Keep screen readers informed.
      toggle.setAttribute("aria-expanded", String(isOpen));
      // Update the label depending on open/closed state.
      toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    nav.querySelectorAll("nav a").forEach((link) => {
      link.addEventListener("click", () => {
        // Close menu after tapping a link on small screens.
        nav.classList.remove("is-menu-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  function setFormStatus(status, type, message) {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = type;
  }

  function showFormSuccess(form) {
    form.classList.add("is-submitted");
    form.innerHTML = `
      <div class="form-success" role="status" aria-live="polite">
        <span class="success-check" aria-hidden="true">
          <svg viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="21"></circle>
            <path d="M15 24.5 21 30.5 34 17.5"></path>
          </svg>
        </span>
        <h3>Submission Sent</h3>
        <p>Thank you for reaching out. We will reply within one day.</p>
        <p class="success-note">If it is urgent, kindly call <a href="tel:+918886940584">+91 8886940584</a>.</p>
      </div>
    `;
  }

  function isValidPhoneNumber(value) {
    const trimmedValue = value.trim();
    const digitCount = trimmedValue.replace(/\D/g, "").length;
    const hasAllowedCharactersOnly = /^\+?[0-9\s().-]+$/.test(trimmedValue);
    const hasSingleLeadingPlus = !trimmedValue.includes("+") || trimmedValue.startsWith("+") && trimmedValue.indexOf("+", 1) === -1;

    return hasAllowedCharactersOnly && hasSingleLeadingPlus && digitCount >= 7 && digitCount <= 15;
  }

  function isValidEmailAddress(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
  }

  function setContactError(contactError, message) {
    if (!contactError) return;
    contactError.textContent = message;
    contactError.dataset.state = message ? "error" : "";
  }

  function validateContactMethods(emailInput, phoneInput, contactError) {
    if (!emailInput || !phoneInput) return true;

    const hasEmail = emailInput.value.trim().length > 0;
    const hasPhone = phoneInput.value.trim().length > 0;

    if (hasEmail || hasPhone) return true;

    const message = "Please provide either an email address or phone number.";
    setContactError(contactError, message);
    return false;
  }

  function validateEmailAddress(emailInput, contactError) {
    if (!emailInput) return true;

    const emailValue = emailInput.value.trim();
    if (!emailValue || isValidEmailAddress(emailValue)) return true;

    const message = "Please enter a valid email address.";
    setContactError(contactError, message);
    return false;
  }

  function validatePhoneNumber(phoneInput, contactError) {
    if (!phoneInput) return true;

    const phoneValue = phoneInput.value.trim();
    if (!phoneValue || isValidPhoneNumber(phoneValue)) return true;

    const message = "Please enter a valid phone number with 7 to 15 digits. Add the country code if needed.";
    setContactError(contactError, message);
    return false;
  }

  function initGoogleFormSubmit() {
    const form = document.querySelector("[data-google-form]");
    if (!form) return;

    const status = form.querySelector("[data-form-status]");
    const submitButton = form.querySelector('button[type="submit"]');
    const emailInput = form.querySelector('[name="entry.888339443"]');
    const phoneInput = form.querySelector('[name="entry.132729876"]');
    const contactError = form.querySelector("[data-contact-error]");

    [emailInput, phoneInput].forEach((input) => {
      if (!input) return;

      input.addEventListener("input", () => {
        setContactError(contactError, "");
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setContactError(contactError, "");

      if (!validateContactMethods(emailInput, phoneInput, contactError)) return;

      if (!validateEmailAddress(emailInput, contactError)) return;

      if (!validatePhoneNumber(phoneInput, contactError)) return;

      if (!form.reportValidity()) return;

      setFormStatus(status, "loading", "Submitting your details...");
      if (submitButton) submitButton.disabled = true;

      try {
        await fetch(form.action, {
          method: "POST",
          mode: "no-cors",
          body: new FormData(form)
        });

        form.reset();
        // Google Forms blocks readable submit responses in the browser, so no-cors can only confirm that the request was sent.
        showFormSuccess(form);
      } catch (error) {
        setFormStatus(status, "error", CONTACT_FALLBACK_TEXT);
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  function getCarouselStep(viewport) {
    // Use the first card width plus gap as the manual/auto movement amount.
    const firstCard = viewport.querySelector(".feedback-card");
    if (!firstCard) return viewport.clientWidth;

    // Read actual rendered gap from the carousel track.
    const track = viewport.querySelector("[data-carousel-track]");
    const gap = track ? parseFloat(getComputedStyle(track).gap) || 0 : 0;

    // One card per movement keeps the carousel calm and readable.
    return firstCard.getBoundingClientRect().width + gap;
  }

  function moveCarousel(viewport, direction) {
    // Calculate one-card movement.
    const step = getCarouselStep(viewport);
    // Detect the end of the carousel so autoplay loops back cleanly.
    const maxScroll = viewport.scrollWidth - viewport.clientWidth - 4;

    if (direction > 0 && viewport.scrollLeft >= maxScroll) {
      // Loop back to first testimonial.
      viewport.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    if (direction < 0 && viewport.scrollLeft <= 4) {
      // Loop backward to the last testimonial.
      viewport.scrollTo({ left: viewport.scrollWidth, behavior: "smooth" });
      return;
    }

    // Move one card left or right.
    viewport.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  function initFeedbackCarousel() {
    // Carousel container.
    const carousel = document.querySelector("[data-carousel]");
    // Scrollable viewport.
    const viewport = document.querySelector("[data-carousel-viewport]");
    // Previous arrow.
    const prev = document.querySelector("[data-carousel-prev]");
    // Next arrow.
    const next = document.querySelector("[data-carousel-next]");

    // Stop if carousel markup is missing.
    if (!carousel || !viewport || !prev || !next) return;

    let timer = window.setInterval(() => moveCarousel(viewport, 1), CAROUSEL_INTERVAL_MS);

    const restartTimer = () => {
      // Pause and restart autoplay after manual interaction.
      window.clearInterval(timer);
      timer = window.setInterval(() => moveCarousel(viewport, 1), CAROUSEL_INTERVAL_MS);
    };

    prev.addEventListener("click", () => {
      moveCarousel(viewport, -1);
      restartTimer();
    });

    next.addEventListener("click", () => {
      moveCarousel(viewport, 1);
      restartTimer();
    });

    carousel.addEventListener("mouseenter", () => {
      // Pause autoplay while the visitor is reading/hovering.
      window.clearInterval(timer);
    });

    carousel.addEventListener("mouseleave", restartTimer);
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Start scroll-based reveal animation, unless reduced motion is requested.
    if (!initReducedMotionFallback()) initScrollReveal();
    // Enable the mobile hamburger dropdown.
    initMobileMenu();
    // Count stats up when the proof section enters view.
    initStatsCounters();
    // Submit the contact form to Google Forms without leaving the page.
    initGoogleFormSubmit();
    // Enable testimonial carousel arrows and autoplay.
    initFeedbackCarousel();
  });
})();
