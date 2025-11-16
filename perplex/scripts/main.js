// scripts/main.js
import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.180.0/three.module.min.js";

// Initialize Lenis for smooth scrolling
function initLenis() {
  if (typeof Lenis === "undefined") {
    console.warn("Lenis not loaded; smooth scrolling disabled.");
    return null;
  }

  const lenis = new Lenis({
    lerp: 0.12,
    wheelMultiplier: 1,
    smoothWheel: true,
    smoothTouch: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Keep GSAP ScrollTrigger in sync with Lenis if available :contentReference[oaicite:5]{index=5}
  if (window.ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
  }

  return lenis;
}

// Scroll progress bar
function initScrollProgress() {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;

  const update = () => {
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${progress}%`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

// Custom cursor
function initCustomCursor() {
  const cursor = document.getElementById("cursor-dot");
  if (!cursor) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  document.addEventListener("pointermove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  function render() {
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  const interactiveSelectors = "a, button, [data-cursor='interactive']";
  document.querySelectorAll(interactiveSelectors).forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("cursor-dot--active"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("cursor-dot--active"));
  });

  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    cursor.style.opacity = "1";
  });
}

// Dark / light theme toggle
function initThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const iconMoon = btn.querySelector("[data-theme-icon='moon']");
  const iconSun = btn.querySelector("[data-theme-icon='sun']");

  const setTheme = (theme) => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      // ignore
    }
    if (iconMoon && iconSun) {
      if (theme === "light") {
        iconMoon.classList.add("hidden");
        iconSun.classList.remove("hidden");
      } else {
        iconMoon.classList.remove("hidden");
        iconSun.classList.add("hidden");
      }
    }
  };

  const stored = (() => {
    try {
      return localStorage.getItem("theme");
    } catch {
      return null;
    }
  })();
  const prefersDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initial = stored || (prefersDark ? "dark" : "light");
  setTheme(initial);

  btn.addEventListener("click", () => {
    const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(current === "dark" ? "light" : "dark");
  });
}

// Navigation: smooth scroll + active link highlighting
function initNav(lenisInstance) {
  const links = Array.from(document.querySelectorAll("a[href^='#']"));

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    link.addEventListener("click", (event) => {
      event.preventDefault();
      if (lenisInstance) {
        lenisInstance.scrollTo(target);
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // IntersectionObserver for active section
  const sections = document.querySelectorAll("main section[id]");
  const map = new Map();
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    const id = href.slice(1);
    map.set(id, link);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        map.forEach((lnk) => lnk.removeAttribute("aria-current"));
        const active = map.get(id);
        if (active) {
          active.setAttribute("aria-current", "page");
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((section) => observer.observe(section));
}

// GSAP & ScrollTrigger animations
function initGSAPAnimations() {
  if (typeof gsap === "undefined") {
    console.warn("GSAP not loaded; animations disabled.");
    return;
  }

  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Hero entrance timeline
  gsap
    .timeline()
    .from(".hero-kicker", {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: "power2.out",
    })
    .from(
      ".hero-title span",
      {
        yPercent: 100,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
      },
      "-=0.1"
    )
    .from(
      ".hero-subtitle",
      {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.4"
    );

  // Sections fade-in on scroll
  document.querySelectorAll("[data-animate='section']").forEach((section) => {
    gsap.from(section, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });

  // Cards staggered on scroll
  document.querySelectorAll("[data-animate='card']").forEach((card) => {
    gsap.from(card, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: card,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });
  });

  // Parallax background blobs in hero
  if (window.ScrollTrigger) {
    gsap.to("[data-parallax='hero-bg']", {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }
}

// Three.js hero scene
function initHeroThree() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020617, 0.35);

  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0.2, 4);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  // Geometry & materials
  const geometry = new THREE.IcosahedronGeometry(1.3, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x7c3aed,
    metalness: 0.7,
    roughness: 0.25,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  const wireMesh = new THREE.Mesh(geometry, wireMaterial);
  scene.add(wireMesh);

  // Lights
  const light1 = new THREE.PointLight(0x22d3ee, 2, 10);
  light1.position.set(2.5, 2, 3);
  scene.add(light1);

  const light2 = new THREE.PointLight(0xf97316, 1.5, 10);
  light2.position.set(-2.5, -1.5, -3);
  scene.add(light2);

  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);

  let mouseX = 0;
  let mouseY = 0;

  function onPointerMove(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    mouseX = x * 2 - 1;
    mouseY = -(y * 2 - 1);
  }

  window.addEventListener("pointermove", onPointerMove);

  function onResize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  window.addEventListener("resize", onResize);

  const clock = new THREE.Clock();

  function animate() {
    const elapsed = clock.getElapsedTime();

    mesh.rotation.y = elapsed * 0.45;
    mesh.rotation.x = elapsed * 0.23;
    wireMesh.rotation.y = -elapsed * 0.18;

    camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.08;
    camera.position.y += (mouseY * 0.4 - camera.position.y) * 0.08;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}

// Loader fade-out
function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  window.addEventListener("load", () => {
    if (typeof gsap !== "undefined") {
      gsap.to(loader, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => loader.remove(),
      });
    } else {
      loader.style.display = "none";
    }
  });
}

// EmailJS contact form
function initContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");
  if (!form || typeof emailjs === "undefined") {
    console.warn("EmailJS not available; contact form will not send.");
    return;
  }

  // TODO: replace with your EmailJS values from dashboard :contentReference[oaicite:6]{index=6}
  const SERVICE_ID = "YOUR_SERVICE_ID";
  const TEMPLATE_ID = "YOUR_TEMPLATE_ID";
  const PUBLIC_KEY = "YOUR_PUBLIC_KEY";

  try {
    emailjs.init({ publicKey: PUBLIC_KEY });
  } catch (e) {
    console.warn("EmailJS init failed:", e);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (
      !SERVICE_ID ||
      !TEMPLATE_ID ||
      !PUBLIC_KEY ||
      SERVICE_ID.startsWith("YOUR_") ||
      TEMPLATE_ID.startsWith("YOUR_")
    ) {
      alert(
        "EmailJS is not configured yet. Set SERVICE_ID, TEMPLATE_ID, and PUBLIC_KEY in scripts/main.js."
      );
      return;
    }

    if (status) {
      status.textContent = "Sending...";
      status.classList.remove("text-emerald-400", "text-rose-400");
      status.classList.add("text-slate-400");
    }

    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form);
      if (status) {
        status.textContent = "Message sent! I’ll get back to you shortly.";
        status.classList.remove("text-slate-400");
        status.classList.add("text-emerald-400");
      }
      form.reset();
    } catch (error) {
      console.error("EmailJS error:", error);
      if (status) {
        status.textContent =
          "Something went wrong. Please try again or email me directly.";
        status.classList.remove("text-slate-400");
        status.classList.add("text-rose-400");
      }
    }
  });
}

// Simple util: year in footer
function initYear() {
  const el = document.getElementById("year");
  if (el) {
    el.textContent = new Date().getFullYear().toString();
  }
}

// Bootstrap all features
document.addEventListener("DOMContentLoaded", () => {
  const lenis = initLenis();
  initScrollProgress();
  initCustomCursor();
  initThemeToggle();
  initNav(lenis);
  initGSAPAnimations();
  initHeroThree();
  initLoader();
  initContactForm();
  initYear();
});
