import { KEYWORDS, applyLang, detectLang } from "./i18n.js";

const APP_STORE =
  "https://apps.apple.com/us/app/dancing-particle/id6444665083";

function bootUI() {
  let lang = detectLang();
  applyLang(lang);

  const kw = document.getElementById("keywords");
  if (kw) {
    kw.innerHTML = KEYWORDS.map((k) => `<li>${k}</li>`).join("");
  }

  document.querySelectorAll(".lang button").forEach((btn) => {
    btn.addEventListener("click", () => {
      lang = btn.dataset.lang;
      applyLang(lang);
    });
  });

  document.querySelectorAll('a[href*="apps.apple.com"]').forEach((a) => {
    a.href = APP_STORE;
  });

  const topbar = document.getElementById("topbar");
  const progress = document.getElementById("progress");

  const onScroll = () => {
    const y = window.scrollY || 0;
    topbar?.classList.toggle("is-stuck", y > 24);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? y / max : 0;
      progress.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }
}

async function bootParticles() {
  const canvas = document.getElementById("bg");
  if (!canvas) return;

  const canWebGL = (() => {
    try {
      const c = document.createElement("canvas");
      return !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      return false;
    }
  })();

  if (!canWebGL) {
    document.body.classList.add("no-3d");
    return;
  }

  try {
    const { createParticleField } = await import("./particles.js");
    createParticleField(canvas);
  } catch (err) {
    console.warn("WebGL particles unavailable:", err);
    document.body.classList.add("no-3d");
  }
}

bootUI();
bootParticles();
