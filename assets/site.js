(function () {
  const THEME_KEY = "ypa-theme";
  const DISCLAIMER_KEY = "ypa-disclaimer-seen";

  function setTheme(theme) {
    const finalTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", finalTheme);
    localStorage.setItem(THEME_KEY, finalTheme);

    const toggleBtn = document.querySelector("[data-theme-toggle]");
    if (!toggleBtn) return;

    const icon = toggleBtn.querySelector("i");
    const label = toggleBtn.querySelector("span");
    if (icon) {
      icon.className = finalTheme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
    if (label) {
      label.textContent = finalTheme === "dark" ? "Light Mode" : "Dark Mode";
    }
  }

  function initThemeToggle() {
    const saved = localStorage.getItem(THEME_KEY) || "light";
    setTheme(saved);

    const toggleBtn = document.querySelector("[data-theme-toggle]");
    if (!toggleBtn) return;

    toggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  function initDisclaimerModal() {
    const modal = document.querySelector("[data-disclaimer-modal]");
    if (!modal) return;
    const dismissBtn = modal.querySelector("[data-disclaimer-close]");

    const hasSeenDisclaimer = () => {
      try {
        return sessionStorage.getItem(DISCLAIMER_KEY) === "1";
      } catch (_) {
        return false;
      }
    };

    const markSeen = () => {
      try {
        sessionStorage.setItem(DISCLAIMER_KEY, "1");
      } catch (_) {
        // Ignore storage access issues.
      }
    };

    const closeModal = (remember = false) => {
      if (remember) markSeen();
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("disclaimer-open");
    };

    const openModal = () => {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("disclaimer-open");
    };

    if (dismissBtn) {
      dismissBtn.addEventListener("click", () => {
        closeModal(true);
      });
    }

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(true);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal(true);
      }
    });

    if (!hasSeenDisclaimer()) {
      window.requestAnimationFrame(openModal);
    }
  }

  function initPaginatedCollection({
    listSelector,
    itemSelector,
    paginationSelector,
    defaultPageSize = 3
  }) {
    const list = document.querySelector(listSelector);
    const pagination = document.querySelector(paginationSelector);
    if (!list || !pagination) return;

    const items = Array.from(list.querySelectorAll(itemSelector));
    if (!items.length) return;

    const parsedPageSize = Number.parseInt(
      list.getAttribute("data-page-size") || String(defaultPageSize),
      10
    );
    const pageSize =
      Number.isFinite(parsedPageSize) && parsedPageSize > 0 ? parsedPageSize : defaultPageSize;
    const totalPages = Math.ceil(items.length / pageSize);
    let currentPage = 1;

    const buildButton = ({ label, pageValue, disabled = false, isActive = false, ariaLabel = "" }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `pagination-btn${isActive ? " is-active" : ""}`;
      button.textContent = label;
      button.disabled = disabled;
      button.setAttribute("aria-label", ariaLabel || `Go to page ${label}`);
      if (isActive) {
        button.setAttribute("aria-current", "page");
      }
      if (!disabled && !isActive) {
        button.addEventListener("click", () => {
          renderPage(pageValue);
        });
      }
      return button;
    };

    const renderPage = (page) => {
      currentPage = Math.min(Math.max(page, 1), totalPages);
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;

      items.forEach((item, index) => {
        item.hidden = index < start || index >= end;
      });

      if (totalPages <= 1) {
        pagination.hidden = true;
        pagination.innerHTML = "";
        return;
      }

      pagination.hidden = false;
      pagination.innerHTML = "";

      pagination.appendChild(
        buildButton({
          label: "Prev",
          pageValue: currentPage - 1,
          disabled: currentPage === 1,
          ariaLabel: "Go to previous page"
        })
      );

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        pagination.appendChild(
          buildButton({
            label: String(pageNumber),
            pageValue: pageNumber,
            isActive: currentPage === pageNumber,
            ariaLabel: `Go to page ${pageNumber}`
          })
        );
      }

      pagination.appendChild(
        buildButton({
          label: "Next",
          pageValue: currentPage + 1,
          disabled: currentPage === totalPages,
          ariaLabel: "Go to next page"
        })
      );
    };

    renderPage(1);
  }

  function initBlogPagination() {
    initPaginatedCollection({
      listSelector: "[data-blog-post-list]",
      itemSelector: "[data-blog-post-item]",
      paginationSelector: "[data-blog-pagination]",
      defaultPageSize: 3
    });
  }

  function initGalleryPagination() {
    initPaginatedCollection({
      listSelector: "[data-gallery-list]",
      itemSelector: "[data-gallery-item]",
      paginationSelector: "[data-gallery-pagination]",
      defaultPageSize: 3
    });
  }

  function initTopbarScrollBehavior() {
    const topShell = document.querySelector(".top-shell");
    if (!topShell) return;

    let lastScrollY = window.scrollY;
    const deltaThreshold = 8;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 24) {
        topShell.classList.remove("is-topbar-hidden");
      } else if (currentScrollY > lastScrollY + deltaThreshold) {
        topShell.classList.add("is-topbar-hidden");
      } else if (currentScrollY < lastScrollY - deltaThreshold) {
        topShell.classList.remove("is-topbar-hidden");
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
  }

  function initFloatingActions() {
    if (document.querySelector("[data-floating-actions]")) return;

    const floatingActions = document.createElement("div");
    floatingActions.className = "floating-actions";
    floatingActions.setAttribute("data-floating-actions", "true");

    const whatsappLink = document.createElement("a");
    whatsappLink.className = "floating-btn floating-btn-whatsapp";
    whatsappLink.href = "https://wa.me/628114811343";
    whatsappLink.target = "_blank";
    whatsappLink.rel = "noopener noreferrer";
    whatsappLink.setAttribute("aria-label", "Contact customer service via WhatsApp");
    whatsappLink.innerHTML = `
      <span class="floating-btn-label">Contact CS</span>
      <span class="floating-btn-icon"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></span>
    `;

    const backToTopBtn = document.createElement("button");
    backToTopBtn.type = "button";
    backToTopBtn.className = "floating-btn floating-btn-top";
    backToTopBtn.setAttribute("aria-label", "Back to top");
    backToTopBtn.innerHTML = `
      <span class="floating-btn-icon"><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></span>
    `;

    const syncBackToTopVisibility = () => {
      backToTopBtn.classList.toggle("is-visible", window.scrollY > 260);
    };

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    syncBackToTopVisibility();
    window.addEventListener("scroll", syncBackToTopVisibility, { passive: true });

    floatingActions.append(whatsappLink, backToTopBtn);
    document.body.appendChild(floatingActions);
  }

  function initCardLinks() {
    document.querySelectorAll("[data-card-link]").forEach((card) => {
      const href = card.getAttribute("data-card-link");
      if (!href) return;

      card.classList.add("is-clickable");
      card.setAttribute("role", "link");
      if (!card.hasAttribute("tabindex")) {
        card.setAttribute("tabindex", "0");
      }

      card.addEventListener("click", (event) => {
        if (event.defaultPrevented) return;
        if (event.target.closest("a, button, input, textarea, select, label")) return;
        window.location.href = href;
      });

      card.addEventListener("keydown", (event) => {
        if (event.target !== card) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          window.location.href = href;
        }
      });
    });
  }
  function initLoader() {
    const loader = document.querySelector("[data-page-loader]");
    if (!loader) return;
    let isHidden = false;

    const hideLoader = () => {
      if (isHidden) return;
      isHidden = true;
      loader.classList.add("is-hidden");
    };

    const hideSoon = () => {
      window.setTimeout(hideLoader, 90);
    };

    if (document.readyState === "complete" || document.readyState === "interactive") {
      window.requestAnimationFrame(hideSoon);
    } else {
      document.addEventListener("DOMContentLoaded", hideSoon, { once: true });
    }

    window.addEventListener("load", hideLoader, { once: true });
    window.addEventListener("pageshow", hideLoader, { once: true });
  }

  function closeMobileMenu() {
    const mobileNav = document.querySelector("[data-mobile-nav]");
    const toggleBtn = document.querySelector("[data-menu-toggle]");
    if (!mobileNav || !toggleBtn) return;

    mobileNav.classList.remove("open");
    const icon = toggleBtn.querySelector("i");
    if (icon) {
      icon.className = "fa-solid fa-bars";
    }
    toggleBtn.setAttribute("aria-expanded", "false");
  }

  function initMobileMenu() {
    const toggleBtn = document.querySelector("[data-menu-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");
    if (!toggleBtn || !mobileNav) return;

    toggleBtn.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("open");
      const icon = toggleBtn.querySelector("i");
      if (icon) {
        icon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
      }
      toggleBtn.setAttribute("aria-expanded", String(isOpen));
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  function initAboutDropdown() {
    const dropdown = document.querySelector(".about-dropdown");
    const trigger = document.querySelector("[data-about-trigger]");
    if (!dropdown || !trigger) return;

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      dropdown.classList.toggle("open");
      trigger.classList.toggle("is-active");
    });

    document.addEventListener("click", (event) => {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove("open");
        trigger.classList.remove("is-active");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        dropdown.classList.remove("open");
        trigger.classList.remove("is-active");
      }
    });
  }

  function getGoogleCookieLang() {
    const cookieMatch = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]+\/([^;]+)/i);
    if (!cookieMatch) return "en";
    const lang = cookieMatch[1]?.toLowerCase() || "en";
    return lang === "id" ? "id" : "en";
  }

  function writeGoogleCookie(lang) {
    const value = lang === "id" ? "/en/id" : "/en/en";
    document.cookie = `googtrans=${value}; path=/`;
    document.cookie = `googtrans=${value}; domain=${location.hostname}; path=/`;
  }

  function syncGoogleSelect(lang) {
    const combo = document.querySelector(".goog-te-combo");
    if (!combo) return;
    combo.value = lang;
    combo.dispatchEvent(new Event("change"));
  }

  function ensureGoogleScript() {
    if (Array.from(document.scripts).some((script) => script.src.includes("translate_a/element.js"))) {
      return;
    }
    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }


  function initTranslateControl() {
    const select = document.querySelector("[data-translate-select]");
    if (!select) return;

    const initialLang = getGoogleCookieLang();
    select.value = initialLang;

    window.__onGoogleTranslateReady = window.__onGoogleTranslateReady || [];
    window.__onGoogleTranslateReady.push(() => {
      syncGoogleSelect(select.value);
    });

    select.addEventListener("change", () => {
      const lang = select.value === "id" ? "id" : "en";
      writeGoogleCookie(lang);
      syncGoogleSelect(lang);
    });

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        ensureGoogleScript();
      }, { timeout: 1200 });
    } else {
      window.setTimeout(ensureGoogleScript, 200);
    }
  }

  window.googleTranslateElementInit = function googleTranslateElementInit() {
    if (window.google?.translate?.TranslateElement && document.getElementById("google_translate_element")) {
      new google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
          includedLanguages: "en,id",
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        "google_translate_element"
      );
    }

    if (Array.isArray(window.__onGoogleTranslateReady)) {
      window.__onGoogleTranslateReady.forEach((callback) => {
        if (typeof callback === "function") callback();
      });
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    initLoader();
    initMobileMenu();
    initAboutDropdown();
    initDisclaimerModal();
    initBlogPagination();
    initGalleryPagination();
    initTopbarScrollBehavior();
    initFloatingActions();
    initCardLinks();
    initTranslateControl();

    document.querySelectorAll("a[href]").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        if (link.target === "_blank" || link.hasAttribute("download")) return;
        const href = link.getAttribute("href") || "";
        if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

        const targetUrl = new URL(href, window.location.href);
        if (targetUrl.origin !== window.location.origin) return;
        if (
          targetUrl.pathname === window.location.pathname &&
          targetUrl.search === window.location.search &&
          targetUrl.hash
        ) {
          return;
        }
        const loader = document.querySelector("[data-page-loader]");
        if (loader) loader.classList.remove("is-hidden");
      });
    });
  });
})();
