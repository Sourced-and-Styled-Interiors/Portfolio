document.addEventListener("DOMContentLoaded", () => {
  setupHeaderState();
  setupScrollReveal();
  setupActiveNavState();
  setupDesignSlider();
  setupFormSubmission();
});

function setupHeaderState() {
  const header = document.querySelector(".top-bar");
  if (!header) return;

  const syncHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 22);
  };

  syncHeaderState();
  window.addEventListener("scroll", syncHeaderState, { passive: true });
}

function setupScrollReveal() {
  const targets = Array.from(
    document.querySelectorAll(
      "main > section, .footer, .pillars article, .pricing-grid .price-card, .steps li"
    )
  );

  if (!targets.length) return;

  targets.forEach((target, index) => {
    target.classList.add("reveal");
    target.style.setProperty("--reveal-delay", `${(index % 6) * 70}ms`);
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  targets.forEach((target) => {
    const rect = target.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      target.classList.add("is-visible");
      return;
    }
    revealObserver.observe(target);
  });
}

function setupActiveNavState() {
  const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
  if (!navLinks.length) return;

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length) return;

  const setActive = (id) => {
    navLinks.forEach((link) => {
      const isMatch = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isMatch);
    });
  };

  setActive(sections[0].id);

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    {
      threshold: 0,
      rootMargin: "-42% 0px -45% 0px",
    }
  );

  sections.forEach((section) => navObserver.observe(section));
}

function setupDesignSlider() {
  const track = document.querySelector("[data-design-track]");
  if (!track) return;

  const slides = Array.from(track.querySelectorAll(".design-slide"));
  const dots = Array.from(document.querySelectorAll(".slider-dots .dot"));
  if (slides.length < 2) return;

  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  firstClone.dataset.clone = "first";
  lastClone.dataset.clone = "last";
  firstClone.setAttribute("aria-hidden", "true");
  lastClone.setAttribute("aria-hidden", "true");
  track.append(firstClone);
  track.prepend(lastClone);

  let index = 1;
  let timerId = null;
  const autoplayDelayMs = 3200;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const getRealIndex = () => {
    if (index === 0) return slides.length - 1;
    if (index === slides.length + 1) return 0;
    return index - 1;
  };

  const renderDots = () => {
    const activeDot = getRealIndex();
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeDot);
    });
  };

  const renderSlide = (animated = true) => {
    track.style.transition = animated ? "" : "none";
    track.style.transform = `translateX(-${index * 100}%)`;
    renderDots();

    if (!animated) {
      // Flush the no-transition jump so subsequent slides animate normally.
      void track.offsetWidth;
      track.style.transition = "";
    }
  };

  const showNextSlide = () => {
    index += 1;
    renderSlide(true);
  };

  const stopAutoplay = () => {
    if (!timerId) return;
    window.clearInterval(timerId);
    timerId = null;
  };

  const startAutoplay = () => {
    if (reducedMotion) return;
    stopAutoplay();
    timerId = window.setInterval(showNextSlide, autoplayDelayMs);
  };

  track.addEventListener("transitionend", (event) => {
    if (event.propertyName !== "transform") return;

    if (index === slides.length + 1) {
      index = 1;
      renderSlide(false);
    } else if (index === 0) {
      index = slides.length;
      renderSlide(false);
    }
  });

  track.addEventListener("mouseenter", stopAutoplay);
  track.addEventListener("mouseleave", startAutoplay);
  track.addEventListener("focusin", stopAutoplay);
  track.addEventListener("focusout", startAutoplay);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  renderSlide(false);
  startAutoplay();
}

function setupFormSubmission() {
  const form = document.querySelector(".intake-form");
  const success = document.querySelector(".form-success");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    const endpoint = form.getAttribute("action");

    if (!endpoint || endpoint.includes("REPLACE_WITH_YOUR_ENDPOINT")) {
      event.preventDefault();
      alert("Add your Getform endpoint URL in the form action first.");
      return;
    }

    const usesHostedGetform =
      endpoint.includes("getform.com/") && !endpoint.includes("getform.io/");

    if (usesHostedGetform) {
      // Hosted Getform links don't support fetch + CORS; allow normal form submit.
      return;
    }

    event.preventDefault();

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
      });

      if (response.ok || response.type === "opaque") {
        form.reset();
        success.hidden = false;
      } else {
        alert("There was a problem sending the form. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("There was a problem sending the form. Please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit questionnaire";
    }
  });
}
