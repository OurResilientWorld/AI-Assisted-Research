(function () {
  "use strict";

  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const filterTargets = Array.from(document.querySelectorAll("[data-category]"));

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.dataset.filter;
      filterButtons.forEach((candidate) => {
        const active = candidate === button;
        candidate.classList.toggle("is-active", active);
        candidate.setAttribute("aria-pressed", String(active));
      });
      filterTargets.forEach((target) => {
        target.hidden = selected !== "all" && target.dataset.category !== selected;
      });
    });
  });

  const copyButton = document.querySelector("[data-copy-citation]");
  const citation = document.querySelector("[data-citation]");
  const status = document.querySelector("[data-copy-status]");
  if (copyButton && citation && status) {
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(citation.textContent.trim());
        status.textContent = "Citation copied";
      } catch (error) {
        status.textContent = "Select and copy the citation manually";
      }
    });
  }
})();
