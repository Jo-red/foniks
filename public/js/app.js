(() => {
  const body = document.body;
  const menuButton = document.querySelector("[data-toggle-menu]");
  const nav = document.querySelector("[data-primary-nav]");
  const searchButtons = document.querySelectorAll("[data-open-search]");
  const searchOverlay = document.querySelector("[data-search-overlay]");
  const searchClose = document.querySelector("[data-close-search]");
  const searchInput = document.querySelector("[data-search-input]");
  let lastTrigger = null;

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("is-open", !expanded);
    });
  }

  function openSearch(trigger) {
    if (!searchOverlay) {
      return;
    }

    lastTrigger = trigger || document.activeElement;
    body.classList.add("has-overlay");
    searchOverlay.hidden = false;

    requestAnimationFrame(() => {
      searchOverlay.classList.add("is-open");
      if (searchInput) {
        searchInput.focus();
      }
    });
  }

  function closeSearch() {
    if (!searchOverlay) {
      return;
    }

    searchOverlay.classList.remove("is-open");
    body.classList.remove("has-overlay");

    window.setTimeout(() => {
      searchOverlay.hidden = true;
      if (lastTrigger && typeof lastTrigger.focus === "function") {
        lastTrigger.focus();
      }
    }, 160);
  }

  searchButtons.forEach((button) => {
    button.addEventListener("click", () => openSearch(button));
  });

  if (searchOverlay) {
    searchOverlay.addEventListener("click", (event) => {
      if (event.target === searchOverlay) {
        closeSearch();
      }
    });
  }

  if (searchClose) {
    searchClose.addEventListener("click", closeSearch);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSearch();
      return;
    }

    if (event.key === "/" && !searchOverlay?.classList.contains("is-open")) {
      const tag = document.activeElement ? document.activeElement.tagName : "";

      if (tag !== "INPUT" && tag !== "TEXTAREA") {
        event.preventDefault();
        openSearch(document.activeElement);
      }
    }
  });
})();
