(() => {
  const root = document.documentElement;
  const storedLanguage = localStorage.getItem("aidme_public_lang");
  let language = storedLanguage === "en" ? "en" : "no";
  const shellPresentation = new URLSearchParams(window.location.search).get("aidme-shell") === "1";

  if (window.self !== window.top && !shellPresentation) {
    root.classList.add("is-embedded");
  }

  const main = document.querySelector("main");
  if (main) {
    main.id = "main-content";
    const skipLink = document.createElement("a");
    skipLink.className = "skip-link";
    skipLink.href = "#main-content";
    skipLink.innerHTML = '<span class="lang-no">Hopp til innhold</span><span class="lang-en">Skip to content</span>';
    document.body.prepend(skipLink);
  }

  document.querySelectorAll(".workspace-link").forEach((link) => {
    link.target = "_blank";
    link.rel = "noopener";
  });

  document.querySelectorAll("img").forEach((image) => {
    image.decoding = "async";
    if (!image.closest(".hero, .page-hero")) image.loading = "lazy";
  });

  const navigationLabels = {
    via: ["Slik virker det", "How it works"],
    deltakere: ["Deltakere", "Participants"],
    partnere: ["Partnere", "Partners"],
    om: ["Historien", "Our story"],
  };

  const pageKey = (link) => {
    const path = new URL(link.href, window.location.href).pathname;
    const lastPart = path.split("/").filter(Boolean).pop() || "index";
    return lastPart.replace(/\.html$/, "");
  };

  document.querySelectorAll(".desktop-nav, .mobile-nav").forEach((nav) => {
    nav.setAttribute("aria-label", nav.classList.contains("mobile-nav") ? "Mobilmeny / Mobile menu" : "Hovedmeny / Main menu");
    const links = [...nav.querySelectorAll("a.nav-link")];
    const viaLink = links.find((link) => pageKey(link) === "via");
    const routeLink = document.createElement("a");
    const currentPage = (window.location.pathname.split("/").filter(Boolean).pop() || "index").replace(/\.html$/, "");

    routeLink.className = `nav-link ${currentPage === "ruter" ? "active" : ""}`;
    routeLink.href = "ruter.html";
    routeLink.innerHTML = '<span class="lang-no">Camino & ruter</span><span class="lang-en">Camino & routes</span>';

    if (viaLink) {
      if (["via", "ser", "vida"].includes(currentPage)) {
        viaLink.classList.add("active");
      }
      viaLink.insertAdjacentElement("afterend", routeLink);
    }

    links.filter((link) => ["ser", "vida"].includes(pageKey(link))).forEach((link) => link.remove());

    Object.entries(navigationLabels).forEach(([key, labels]) => {
      const link = [...nav.querySelectorAll("a.nav-link")].find((candidate) => pageKey(candidate) === key);
      if (!link) return;
      const no = link.querySelector(".lang-no");
      const en = link.querySelector(".lang-en");
      if (no) no.textContent = labels[0];
      if (en) en.textContent = labels[1];
    });

    nav.querySelectorAll(".nav-link.active").forEach((link) => link.setAttribute("aria-current", "page"));

    if (nav.classList.contains("mobile-nav") && !nav.querySelector(".mobile-workspace-link")) {
      const workspace = document.createElement("a");
      workspace.className = "nav-link mobile-workspace-link";
      workspace.href = "https://my.aidme.no/";
      workspace.target = "_blank";
      workspace.rel = "noopener";
      workspace.innerHTML = '<span class="lang-no">my.AidMe</span><span class="lang-en">my.AidMe</span>';
      nav.appendChild(workspace);
    }
  });

  if (!document.querySelector('link[rel="icon"]')) {
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.href = "assets/aidme-logo.webp";
    document.head.appendChild(favicon);
  }

  const languageToggles = document.querySelectorAll(".lang-toggle");
  const menuButton = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-nav");

  const applyLanguage = () => {
    root.dataset.lang = language;
    root.lang = language === "no" ? "no" : "en";
    languageToggles.forEach((button) => {
      button.textContent = language === "no" ? "EN" : "NO";
      button.setAttribute("aria-label", language === "no" ? "Switch to English" : "Bytt til norsk");
    });
  };

  languageToggles.forEach((button) => {
    button.addEventListener("click", () => {
      language = language === "no" ? "en" : "no";
      localStorage.setItem("aidme_public_lang", language);
      applyLanguage();
    });
  });

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    mobileMenu.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.textContent = "☰";
  };

  if (menuButton && mobileMenu) {
    mobileMenu.id = "mobile-navigation";
    menuButton.setAttribute("aria-controls", mobileMenu.id);
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.textContent = isOpen ? "×" : "☰";
    });
    mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const naturalContentHeight = () => {
    // Do not use documentElement.scrollHeight here. The Wix iframe can start much taller
    // than the page, and html/body min-height:100% would then report that oversized
    // viewport back to the parent and create a permanent blank scroll tail.
    const nodes = [...document.body.children].filter((el) => {
      const tag = el.tagName;
      if (tag === "SCRIPT" || tag === "STYLE") return false;
      const pos = getComputedStyle(el).position;
      return pos !== "fixed";
    });
    const bottom = nodes.reduce((max, el) => {
      const r = el.getBoundingClientRect();
      return Math.max(max, r.bottom + window.scrollY);
    }, 0);
    return Math.max(500, Math.ceil(bottom + 2));
  };

  const reportHeight = () => {
    if (window.self === window.top) return;
    window.parent.postMessage(
      {
        type: "aidme-vida:content-height",
        height: naturalContentHeight(),
        path: window.location.pathname,
      },
      "*",
    );
  };

  if ("ResizeObserver" in window) {
    new ResizeObserver(reportHeight).observe(document.body);
  }
  window.addEventListener("load", reportHeight, { once: true });

  applyLanguage();
})();

/* 2026-08-18 reversible public UX extension. */
(() => {
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "mobile-ux.css?v=20260818a";
  style.dataset.aidmeMobileUx = "1";
  document.head.appendChild(style);

  // Keep one semantic anchor per phase card. CSS stretches that anchor across
  // the full card for pointer users, while keyboard/screen-reader users retain
  // the original link instead of a nested synthetic role=link container.
  document.querySelectorAll(".step").forEach((card) => {
    if (card.querySelector("a.step-link")) card.classList.add("has-card-link");
  });

  const mobileNav = document.querySelector(".mobile-nav");
  if (mobileNav && !mobileNav.querySelector(".mobile-process-nav")) {
    const details = document.createElement("details");
    details.className = "mobile-process-nav";
    details.innerHTML = `
      <summary><span class="lang-no">Slik virker det · VÍA → SER → VIDA</span><span class="lang-en">How it works · VÍA → SER → VIDA</span></summary>
      <div class="mobile-process-links">
        <a href="via.html"><span class="lang-no">01 · VÍA · Før</span><span class="lang-en">01 · VÍA · Before</span></a>
        <a href="ser.html"><span class="lang-no">02 · SER · Under</span><span class="lang-en">02 · SER · During</span></a>
        <a href="vida.html"><span class="lang-no">03 · VIDA · Etter</span><span class="lang-en">03 · VIDA · After</span></a>
        <a href="ruter.html"><span class="lang-no">Camino · rute og målgang</span><span class="lang-en">Camino · route and arrival</span></a>
      </div>`;
    const simpleVia = [...mobileNav.querySelectorAll("a.nav-link")].find((a) => /via\.html$/.test(a.getAttribute("href") || ""));
    if (simpleVia) simpleVia.hidden = true;
    mobileNav.prepend(details);
    details.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      const button = document.querySelector(".menu-toggle");
      if (button) {
        button.setAttribute("aria-expanded", "false");
        button.textContent = "☰";
      }
    }));
  }

  if (window.self !== window.top && !window.location.hash) {
    window.addEventListener("pageshow", () => {
      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
    }, { once: true });
  }
})();

/* 2026-08-21 owner-approved N1 public journey layer. */
(() => {
  const script = document.createElement("script");
  script.src = "n1-ux.js?v=20260821a";
  script.dataset.aidmeN1 = "1";
  script.async = false;
  script.addEventListener("load", () => {
    const delta = document.createElement("script");
    delta.src = "n1-feedback-completion.js?v=20260822a";
    delta.dataset.aidmeN1FeedbackCompletion = "1";
    delta.async = false;
    document.body.appendChild(delta);
  }, { once: true });
  document.body.appendChild(script);
})();
