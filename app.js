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

async function initThreeScene() {
  const canvas = document.querySelector("#spirits-scene");
  if (!canvas || prefersReduced) return;

  let THREE;
  try {
    THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");
  } catch (error) {
    canvas.hidden = true;
    return;
  }

  if (!THREE.WebGLRenderer) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  const group = new THREE.Group();
  scene.add(group);

  const particleCount = 300;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const colorA = new THREE.Color("#c4a35f");
  const colorB = new THREE.Color("#f7f6f2");
  const colorC = new THREE.Color("#8e98a0");

  for (let i = 0; i < particleCount; i += 1) {
    const stride = i * 3;
    const angle = i * 0.145;
    const radius = 1.4 + Math.random() * 3.5;
    const drift = (Math.random() - 0.5) * 4;

    positions[stride] = Math.cos(angle) * radius + drift;
    positions[stride + 1] = Math.sin(angle * 0.74) * 1.9 + (Math.random() - 0.5) * 2.2;
    positions[stride + 2] = (Math.random() - 0.5) * 5.8;

    const color = i % 3 === 0 ? colorA : i % 3 === 1 ? colorB : colorC;
    colors[stride] = color.r;
    colors[stride + 1] = color.g;
    colors[stride + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.036,
    vertexColors: true,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);
  group.add(points);

  const ringGeometry = new THREE.TorusGeometry(2.7, 0.006, 8, 160);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: "#c4a35f",
    transparent: true,
    opacity: 0.16
  });
  const rings = Array.from({ length: 4 }, (_, index) => {
    const ring = new THREE.Mesh(ringGeometry, ringMaterial.clone());
    ring.rotation.x = 1.16 + index * 0.19;
    ring.rotation.y = 0.28 + index * 0.36;
    ring.position.x = index * 0.24 - 0.42;
    ring.material.opacity = 0.06 + index * 0.025;
    group.add(ring);
    return ring;
  });

  const pointer = new THREE.Vector2(0, 0);
  window.addEventListener("pointermove", (event) => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 0.6;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * -0.45;
  }, { passive: true });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = Math.max(rect.width / Math.max(rect.height, 1), 0.1);
    camera.updateProjectionMatrix();
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });

  const clock = new THREE.Clock();
  function frame() {
    const elapsed = clock.getElapsedTime();
    group.rotation.y += (pointer.x - group.rotation.y) * 0.025;
    group.rotation.x += (pointer.y - group.rotation.x) * 0.025;
    points.rotation.z = elapsed * 0.025;
    points.rotation.y = Math.sin(elapsed * 0.2) * 0.12;

    rings.forEach((ring, index) => {
      ring.rotation.z = elapsed * (0.06 + index * 0.018);
      ring.scale.setScalar(1 + Math.sin(elapsed * 0.5 + index) * 0.045);
    });

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  frame();
}

window.addEventListener("load", () => {
  animateHero();
  revealWithFallback();
});

initForm();
initThreeScene();
