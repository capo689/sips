const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const revealItems = Array.from(document.querySelectorAll(".reveal"));

function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

function revealWithFallback() {
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const item = entry.target;

      if (window.gsap && !prefersReduced) {
        window.gsap.to(item, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out"
        });
      } else {
        item.classList.add("is-visible");
      }

      observer.unobserve(item);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

  revealItems.forEach((item) => observer.observe(item));
}

function animateHero() {
  if (!window.gsap || prefersReduced) return;

  window.gsap.set(".hero .reveal", { autoAlpha: 0, y: 24 });
  window.gsap.timeline({ defaults: { ease: "power3.out" } })
    .to(".hero .reveal", {
      autoAlpha: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.11
    }, 0.12)
    .fromTo(".hero-media img", { scale: 1.08 }, {
      scale: 1.02,
      duration: 4.2,
      ease: "power2.out"
    }, 0);
}

function animateBrandStars() {
  if (!window.gsap || prefersReduced) return;

  window.gsap.to(".hero-stars .brand-star", {
    y: (index) => [12, -10, 8][index] || 8,
    x: (index) => [-8, 10, 6][index] || 6,
    rotation: (index) => [18, -22, 16][index] || 12,
    duration: (index) => [5.2, 6.4, 4.8][index] || 5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    stagger: 0.18
  });

  window.gsap.to(".section-star", {
    rotation: 18,
    scale: 1.08,
    duration: 6,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
}

function initForm() {
  const form = document.querySelector("[data-rfp-form]");
  const note = document.querySelector("[data-form-note]");
  if (!form || !note) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const name = data.name?.trim() || "Thanks";
    note.textContent = `${name}, your request is drafted. Once this form is connected, this is where the proposal details will be sent.`;
    note.classList.add("is-success");
  });
}

window.addEventListener("load", () => {
  animateHero();
  animateBrandStars();
  revealWithFallback();
});

initForm();
