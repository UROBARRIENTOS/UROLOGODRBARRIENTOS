const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");
const countUpItems = document.querySelectorAll(".count-up");
const profileSlides = document.querySelectorAll(".profile-slide");
const profileDots = document.querySelectorAll(".profile-dot");
const testimonialTrack = document.querySelector(".testimonial-track");
const testimonialCards = document.querySelectorAll(".testimonial-track .testimonial-card");
const testimonialDotsContainer = document.querySelector(".testimonial-dots");
const parallaxSections = document.querySelectorAll("[data-parallax]");
const revealTargets = document.querySelectorAll(
  [
    ".hero-copy",
    ".hero-visual",
    ".trust-strip article",
    ".section-heading",
    ".profile-card",
    ".credentials-card",
    ".service-card",
    ".testimonial-card",
    ".statement",
    ".faq-panel",
    ".contact-card",
    ".hero-metrics li",
    ".doctor-details",
  ].join(", "),
);

let activeProfileSlide = 0;
let profileIntervalId = null;
let activeTestimonialPage = 0;
let testimonialIntervalId = null;
let parallaxTicking = false;

const setActiveProfileSlide = (index) => {
  activeProfileSlide = index;

  profileSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === index);
  });

  profileDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === index);
  });
};

const startProfileRotation = () => {
  if (profileIntervalId) {
    window.clearInterval(profileIntervalId);
  }

  profileIntervalId = window.setInterval(() => {
    const nextIndex = (activeProfileSlide + 1) % profileSlides.length;
    setActiveProfileSlide(nextIndex);
  }, 10000);
};

const getVisibleTestimonials = () => {
  if (window.innerWidth <= 640) {
    return 1;
  }

  if (window.innerWidth <= 980) {
    return 2;
  }

  return 3;
};

const getTestimonialPages = () => {
  const visible = getVisibleTestimonials();
  return Math.max(1, Math.ceil(testimonialCards.length / visible));
};

const renderTestimonialDots = () => {
  if (!testimonialDotsContainer) {
    return;
  }

  testimonialDotsContainer.innerHTML = "";

  Array.from({ length: getTestimonialPages() }).forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "testimonial-dot";
    dot.setAttribute("aria-label", `Ver grupo de testimonios ${index + 1}`);
    dot.addEventListener("click", () => {
      setActiveTestimonialPage(index);
      startTestimonialRotation();
    });
    testimonialDotsContainer.appendChild(dot);
  });
};

const setActiveTestimonialPage = (pageIndex) => {
  if (!testimonialTrack || testimonialCards.length === 0) {
    return;
  }

  const visible = getVisibleTestimonials();
  const maxPage = getTestimonialPages() - 1;
  activeTestimonialPage = Math.min(pageIndex, maxPage);

  const cardWidth = testimonialCards[0].getBoundingClientRect().width;
  const gap = 16;
  const offset = (cardWidth + gap) * visible * activeTestimonialPage;

  testimonialTrack.style.transform = `translate3d(-${offset}px, 0, 0)`;

  testimonialDotsContainer?.querySelectorAll(".testimonial-dot").forEach((dot, index) => {
    dot.classList.toggle("active", index === activeTestimonialPage);
  });
};

const startTestimonialRotation = () => {
  if (!testimonialTrack || getTestimonialPages() <= 1) {
    return;
  }

  if (testimonialIntervalId) {
    window.clearInterval(testimonialIntervalId);
  }

  testimonialIntervalId = window.setInterval(() => {
    const nextPage = (activeTestimonialPage + 1) % getTestimonialPages();
    setActiveTestimonialPage(nextPage);
  }, 6200);
};

const updateParallax = () => {
  parallaxSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 1;
    const progress = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
    const offset = Math.max(-64, Math.min(64, progress * -64));
    const contentOffset = Math.max(-18, Math.min(18, progress * 18));
    section.style.setProperty("--parallax-offset", `${offset}px`);
    section.style.setProperty("--parallax-content-offset", `${contentOffset}px`);
  });

  parallaxTicking = false;
};

const requestParallaxUpdate = () => {
  if (parallaxTicking) {
    return;
  }

  parallaxTicking = true;
  window.requestAnimationFrame(updateParallax);
};

const animateCount = (element) => {
  if (element.dataset.counted === "true") {
    return;
  }

  const target = Number(element.dataset.target || 0);
  const suffix = element.dataset.suffix || "";
  const duration = target >= 1000 ? 1800 : 1400;
  const startTime = performance.now();

  element.dataset.counted = "true";

  const step = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(target * eased);

    element.textContent = `${currentValue.toLocaleString("es-MX")}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.tab;

    tabButtons.forEach((item) => item.classList.remove("active"));
    tabPanels.forEach((panel) => panel.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(targetId)?.classList.add("active");
  });
});

revealTargets.forEach((element, index) => {
  element.classList.add("reveal");

  if (
    element.matches(
      ".trust-strip article, .service-card, .testimonial-card, .hero-metrics li",
    )
  ) {
    element.classList.add("reveal-soft");
    element.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 90}ms`);
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");

      const counter = entry.target.querySelector(".count-up");
      if (counter) {
        animateCount(counter);
      }

      if (entry.target.classList.contains("count-up")) {
        animateCount(entry.target);
      }

      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px",
  },
);

revealTargets.forEach((element) => {
  revealObserver.observe(element);
});

countUpItems.forEach((counter) => {
  const metricCard = counter.closest("li");

  if (!metricCard) {
    revealObserver.observe(counter);
  }
});

if (profileSlides.length > 1) {
  profileDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      setActiveProfileSlide(index);
      startProfileRotation();
    });
  });

  startProfileRotation();
}

if (testimonialTrack && testimonialCards.length > 0) {
  renderTestimonialDots();
  setActiveTestimonialPage(0);
  startTestimonialRotation();

  window.addEventListener("resize", () => {
    renderTestimonialDots();
    setActiveTestimonialPage(activeTestimonialPage);
    startTestimonialRotation();
  });
}

if (parallaxSections.length > 0) {
  updateParallax();
  window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
  window.addEventListener("resize", requestParallaxUpdate);
}
