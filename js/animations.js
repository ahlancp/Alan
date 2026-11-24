// 1. FITUR GANTI TEMA (LIGHT / DARK MODE)
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Cek apakah pengguna sebelumnya memilih dark mode
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    
    // Ubah ikon dan simpan preferensi di browser
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// 2. FITUR FILTER KATEGORI PORTOFOLIO
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Pindahkan status 'active' ke tombol yang diklik
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const selectedCategory = button.getAttribute('data-filter');

        projectCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                card.classList.remove('hide');
            } else {
                card.classList.add('hide');
            }
        });
    });
});

// 3. ANIMASI MUNCUL HALUS SAAT HALAMAN DI-SCROLL
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.12 });

revealElements.forEach(el => revealObserver.observe(el));

// 4. INTERAKSI SIMULASI KIRIM FORM KONTAK
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Mencegah halaman reload
    const namaPengirim = document.getElementById('nama').value;
    
    formStatus.textContent = `Terima kasih, ${namaPengirim}. Pesan Anda telah tercatat.`;
    contactForm.reset();
});

/* Motion dimuat lewat <script> biasa (global "Motion"), jadi tidak perlu server lokal */
if (!window.Motion) {
  console.error("[Mooketan] Motion gagal dimuat. Cek koneksi internet / link CDN di index.html.");
}
const { animate, inView, hover, press, stagger } = window.Motion || {};

const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Tandai siap: CSS menyembunyikan elemen reveal hanya sampai titik ini */
window.__animReady = true;
root.classList.add("anim-ready");

if (!reduceMotion) {
  initSmoothScroll();
  if (window.Motion) {
    initHeadingReveal();
    initCardEntrances();
    initHovers();
  } else {
    root.classList.remove("js");
  }
} else {
  root.classList.remove("js");
}

/* ============================================================
   0. Smooth scroll (Lenis), disambung ke GSAP ScrollTrigger
   ============================================================ */
function initSmoothScroll() {
  if (!window.Lenis) {
    console.error("[Mooketan] Lenis gagal dimuat. Cek koneksi internet / link CDN di index.html.");
    return;
  }

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    anchors: true, // klik menu #keunggulan, #paket, dll ikut halus
  });

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    // Sinkronkan ScrollTrigger dengan posisi scroll dari Lenis
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }
}

/* ============================================================
   1. Judul muncul per kata (GSAP + ScrollTrigger)
   ============================================================ */
function splitWords(el) {
  const text = el.textContent.trim().replace(/\s+/g, " ");
  el.setAttribute("aria-label", text);
  el.textContent = "";

  const inners = [];
  text.split(" ").forEach((word, i, arr) => {
    const mask = document.createElement("span");
    mask.className = "word";
    mask.setAttribute("aria-hidden", "true");

    const inner = document.createElement("span");
    inner.className = "word-inner";
    inner.textContent = word;

    mask.appendChild(inner);
    el.appendChild(mask);
    if (i < arr.length - 1) el.appendChild(document.createTextNode(" "));
    inners.push(inner);
  });
  return inners;
}

function initHeadingReveal() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll("h1, h2").forEach((heading) => {
    const words = splitWords(heading);

    gsap.set(words, { yPercent: 110, rotate: 4, opacity: 0 });
    gsap.to(words, {
      yPercent: 0,
      rotate: 0,
      opacity: 1,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.09,
      scrollTrigger: {
        trigger: heading,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

/* ============================================================
   2. Animasi masuk card (Motion)
   ============================================================ */
function initCardEntrances() {
  const groups = [
    { container: ".cards", items: ".feature" },
    { container: ".topping-grid", items: ".topping-card" },
    { container: ".packages", items: ".package" },
    { container: ".steps", items: ".step" },
  ];

  groups.forEach(({ container, items }) => {
    const box = document.querySelector(container);
    if (!box) return;
    const cards = box.querySelectorAll(items);

    inView(
      box,
      () => {
        animate(
          cards,
          { opacity: [0, 1], y: [48, 0], scale: [0.96, 1] },
          {
            duration: 0.7,
            delay: stagger(0.1),
            ease: [0.22, 1, 0.36, 1],
          }
        );
      },
      { amount: 0.2 }
    );
  });

  /* Blok lain yang cuma satu: bagian topping ekstra, hero art */
  document.querySelectorAll(".extras, .hero-circle").forEach((el) => {
    inView(
      el,
      () => {
        animate(el, { opacity: [0, 1], y: [32, 0] }, { duration: 0.8, ease: [0.22, 1, 0.36, 1] });
      },
      { amount: 0.2 }
    );
  });
}

const spring = { type: "spring", stiffness: 320, damping: 22 };

function initHovers() {
  /* Card: terangkat sedikit, gambar di dalamnya zoom halus */
  hover(".feature, .topping-card, .package", (card) => {
    animate(card, { y: -8, scale: 1.02 }, spring);
    /* Zoom hanya untuk foto topping (punya pembungkus overflow: hidden) */
    const img = card.querySelector(".topping-photo img");
    if (img) animate(img, { scale: 1.08 }, { duration: 0.5, ease: "easeOut" });

    return () => {
      animate(card, { y: 0, scale: 1 }, spring);
      if (img) animate(img, { scale: 1 }, { duration: 0.5, ease: "easeOut" });
    };
  });

  /* Tombol & chip */
  hover(".btn, .pick-btn, .chip, .theme-toggle", (btn) => {
    animate(btn, { scale: 1.05 }, spring);
    return () => animate(btn, { scale: 1 }, spring);
  });

  press(".btn, .pick-btn, .theme-toggle", (btn) => {
    animate(btn, { scale: 0.96 }, { duration: 0.12 });
    return () => animate(btn, { scale: 1.05 }, spring);
  });
}

