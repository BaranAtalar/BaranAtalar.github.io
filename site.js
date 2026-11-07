"use strict";

const papers = Array.from(document.querySelectorAll(".paper"));
const filters = document.querySelector(".filters");
const resultCount = document.querySelector("#result-count");
filters.hidden = false;

for (const button of filters.querySelectorAll("button")) {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    let count = 0;
    for (const paper of papers) {
      paper.hidden = filter !== "all" && paper.dataset.group !== filter;
      if (!paper.hidden) count++;
    }
    for (const option of filters.querySelectorAll("button")) {
      option.setAttribute("aria-pressed", String(option === button));
    }
    resultCount.textContent = count + " publications shown.";
  });
}

for (const toggle of document.querySelectorAll(".bib-toggle")) {
  const panel = document.getElementById(toggle.getAttribute("aria-controls"));
  const copy = panel.querySelector(".copy-bib");
  toggle.hidden = false;
  toggle.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute("aria-expanded", String(!panel.hidden));
    copy.textContent = "Copy citation";
  });
  copy.addEventListener("click", async () => {
    const code = panel.querySelector("code");
    try {
      await navigator.clipboard.writeText(code.textContent);
      copy.textContent = "Copied";
    } catch {
      const selection = window.getSelection();
      if (selection) selection.selectAllChildren(code);
      copy.textContent = "Use your device’s Copy command";
    }
  });
}

const viewer = document.getElementById("figure-dialog");
if (typeof viewer.showModal === "function") {
  const title = document.getElementById("figure-title");
  const largeFigure = document.getElementById("large-figure");
  const description = document.getElementById("figure-description");
  const source = document.getElementById("figure-source");
  for (const link of document.querySelectorAll(".figure-link")) {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const thumbnail = link.querySelector("img");
      title.textContent = link.closest(".paper").querySelector("h3").textContent;
      largeFigure.src = thumbnail.src;
      largeFigure.alt = thumbnail.alt;
      description.textContent = "Figure " + link.dataset.figure + ". " + link.dataset.caption;
      source.href = link.href;
      viewer.showModal();
      document.body.classList.add("viewer-open");
    });
  }
  viewer.querySelector(".close-viewer").addEventListener("click", () => viewer.close());
  viewer.addEventListener("close", () => document.body.classList.remove("viewer-open"));
  viewer.addEventListener("click", (event) => {
    if (event.target !== viewer) return;
    const rect = viewer.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
  });
}

const navLinks = Array.from(document.querySelectorAll(".nav-link[data-section]"));
const navSections = navLinks.map((link) => document.getElementById(link.dataset.section));

if (window.location.hash === "#about") {
  window.history.replaceState(window.history.state, "", "./" + window.location.search);
}
for (const link of document.querySelectorAll('a[href="./"]')) {
  link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (window.location.hash) window.history.pushState(null, "", "./" + window.location.search);
    document.getElementById("profile-name").focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  });
}

let scrollPending = false;
function updateNavigation() {
  const offset = document.querySelector(".masthead").offsetHeight + 30;
  let active = 0;
  for (const [index, section] of navSections.entries()) {
    if (section.getBoundingClientRect().top <= offset) active = index;
  }
  if (Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2) {
    active = navSections.length - 1;
  }
  navLinks.forEach((link, index) => {
    if (index === active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  scrollPending = false;
}
function scheduleNavigation() {
  if (scrollPending) return;
  scrollPending = true;
  window.requestAnimationFrame(updateNavigation);
}
window.addEventListener("scroll", scheduleNavigation, { passive: true });
window.addEventListener("resize", scheduleNavigation);
window.addEventListener("load", scheduleNavigation);
updateNavigation();
