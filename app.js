const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const scrollLinks = Array.from(document.querySelectorAll('a[href^="#"]'));

function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

function prepareRevealStates() {
  if (!window.gsap || prefersReduced) return;

  window.gsap.set(revealItems, {
    autoAlpha: 0,
    y: 24,
    rotationX: -5,
    filter: "blur(7px)",
    transformPerspective: 1200
  });
}

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
        if (item.closest(".hero")) {
          observer.unobserve(item);
          return;
        }

        window.gsap.to(item, {
          autoAlpha: 1,
          y: 0,
          rotationX: 0,
          filter: "blur(0px)",
          duration: 0.86,
          ease: "power3.out",
          clearProps: "filter,willChange"
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

  window.gsap.set(".hero .reveal", {
    autoAlpha: 0,
    y: 34,
    rotationX: -10,
    filter: "blur(10px)",
    transformPerspective: 1200
  });

  window.gsap.timeline({ defaults: { ease: "power3.out" } })
    .to(".hero .reveal", {
      autoAlpha: 1,
      y: 0,
      rotationX: 0,
      filter: "blur(0px)",
      duration: 1.05,
      stagger: 0.12,
      clearProps: "filter,willChange"
    }, 0.16)
    .fromTo(".hero-media img", { scale: 1.08 }, {
      scale: 1.02,
      duration: 4.2,
      ease: "power2.out"
    }, 0)
    .fromTo("#brand-glow-scene", { autoAlpha: 0 }, {
      autoAlpha: 0.58,
      duration: 1.6,
      ease: "sine.out"
    }, 0.2);
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

function initSmoothScroll() {
  scrollLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.hash.slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();

      const headerOffset = targetId === "top" ? 0 : Math.max(header?.offsetHeight || 0, 72);
      const top = Math.max(target.getBoundingClientRect().top + window.scrollY - headerOffset, 0);

      window.scrollTo({
        top,
        behavior: prefersReduced ? "auto" : "smooth"
      });

      if (window.history?.pushState) {
        window.history.pushState(null, "", `#${targetId}`);
      }
    });
  });
}

async function initHeroWebGL() {
  const canvas = document.querySelector("#brand-glow-scene");
  if (!canvas || prefersReduced) return;

  let THREE;
  try {
    THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");
  } catch {
    canvas.hidden = true;
    return;
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.z = 8;

  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 96;
  textureCanvas.height = 96;
  const textureContext = textureCanvas.getContext("2d");
  const glow = textureContext.createRadialGradient(48, 48, 0, 48, 48, 48);
  glow.addColorStop(0, "rgba(255, 255, 255, 1)");
  glow.addColorStop(0.34, "rgba(102, 190, 255, 0.75)");
  glow.addColorStop(1, "rgba(102, 190, 255, 0)");
  textureContext.fillStyle = glow;
  textureContext.fillRect(0, 0, 96, 96);

  const sparkleTexture = new THREE.CanvasTexture(textureCanvas);
  const rect = canvas.getBoundingClientRect();
  const particleCount = rect.width < 720 ? 76 : 128;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const seeds = [];
  const blue = new THREE.Color("#42aaff");
  const white = new THREE.Color("#ffffff");

  for (let index = 0; index < particleCount; index += 1) {
    const stride = index * 3;
    const depth = Math.random() * 2.2 - 1.1;
    positions[stride] = (Math.random() - 0.5) * 10;
    positions[stride + 1] = (Math.random() - 0.5) * 5.6;
    positions[stride + 2] = depth;

    const color = blue.clone().lerp(white, Math.random() * 0.45 + 0.25);
    colors[stride] = color.r;
    colors[stride + 1] = color.g;
    colors[stride + 2] = color.b;

    seeds.push({
      x: positions[stride],
      y: positions[stride + 1],
      speed: Math.random() * 0.34 + 0.12,
      phase: Math.random() * Math.PI * 2
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.12,
    map: sparkleTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);
  points.position.x = 1.35;
  scene.add(points);

  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(48 * 3);
  for (let index = 0; index < linePositions.length; index += 6) {
    const x = (Math.random() - 0.5) * 9;
    const y = (Math.random() - 0.5) * 4.6;
    linePositions[index] = x;
    linePositions[index + 1] = y;
    linePositions[index + 2] = Math.random() * -1.8;
    linePositions[index + 3] = x + Math.random() * 0.42 + 0.18;
    linePositions[index + 4] = y + Math.random() * 0.2 - 0.1;
    linePositions[index + 5] = linePositions[index + 2];
  }
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x42aaff,
    transparent: true,
    opacity: 0.11,
    blending: THREE.AdditiveBlending
  });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  lines.position.x = 1.2;
  scene.add(lines);

  const pointer = { x: 0, y: 0 };
  let frameId = null;

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(bounds.width, 1);
    const height = Math.max(bounds.height, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function trackPointer(event) {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  }

  function render(time = 0) {
    const seconds = time * 0.001;

    seeds.forEach((seed, index) => {
      const stride = index * 3;
      positions[stride] = seed.x + Math.cos(seconds * seed.speed + seed.phase) * 0.08;
      positions[stride + 1] = seed.y + Math.sin(seconds * seed.speed + seed.phase) * 0.11;
    });

    geometry.attributes.position.needsUpdate = true;
    points.rotation.z = Math.sin(seconds * 0.11) * 0.025;
    points.rotation.y = pointer.x * 0.045;
    points.rotation.x = pointer.y * -0.025;
    lines.rotation.z = Math.sin(seconds * 0.08) * -0.018;
    lines.rotation.y = pointer.x * 0.03;

    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(render);
  }

  resize();
  canvas.dataset.ready = "true";
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", trackPointer, { passive: true });
  frameId = window.requestAnimationFrame(render);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    } else if (!document.hidden && !frameId) {
      frameId = window.requestAnimationFrame(render);
    }
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
  prepareRevealStates();
  animateHero();
  animateBrandStars();
  initHeroWebGL();
  revealWithFallback();
});

initSmoothScroll();
initForm();
