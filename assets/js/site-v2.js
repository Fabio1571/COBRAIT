(function () {
  "use strict";

  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () { document.documentElement.classList.add("is-ready"); });
  });

  var header = document.querySelector("[data-site-header]");
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  var lastFocused = null;

  function track(name, properties) {
    var detail = Object.assign({
      event: "cobrait_" + name,
      locale: document.documentElement.lang || "",
      path: window.location.pathname
    }, properties || {});

    window.dispatchEvent(new CustomEvent("cobrait:conversion", { detail: detail }));
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(detail);
  }

  window.cobraitTrack = track;
  Array.prototype.forEach.call(document.querySelectorAll("[data-track]"), function (element) {
    element.addEventListener("click", function () {
      track(element.getAttribute("data-track") || "interaction", { label: String(element.textContent || "").trim().slice(0, 100) });
    });
  });

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  function focusableElements(container) {
    if (!container) return [];
    return Array.prototype.slice.call(container.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"));
  }

  function closeMenu(returnFocus) {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
    document.body.classList.remove("menu-open");
    var label = menuButton.querySelector("[data-menu-label]");
    if (label) label.textContent = label.getAttribute("data-open-label") || "Open menu";
    if (returnFocus && lastFocused) lastFocused.focus();
  }

  function openMenu() {
    if (!menuButton || !mobileNav) return;
    lastFocused = document.activeElement;
    menuButton.setAttribute("aria-expanded", "true");
    mobileNav.hidden = false;
    document.body.classList.add("menu-open");
    var label = menuButton.querySelector("[data-menu-label]");
    if (label) label.textContent = label.getAttribute("data-close-label") || "Close menu";
    var items = focusableElements(mobileNav);
    if (items.length) items[0].focus();
  }

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      if (menuButton.getAttribute("aria-expanded") === "true") closeMenu(false);
      else openMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (menuButton.getAttribute("aria-expanded") !== "true") return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      if (event.key !== "Tab") return;
      var items = focusableElements(mobileNav);
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080) closeMenu(false);
    });
  }

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  var revealItems = document.querySelectorAll(".reveal");
  revealItems.forEach(function (item, index) { item.style.setProperty("--reveal-order", String(index % 6)); });
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    revealItems.forEach(function (item) { observer.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
  }

  var finder = document.querySelector("[data-service-finder]");
  if (finder) {
    var finderOptions = Array.prototype.slice.call(finder.querySelectorAll("[data-finder-option]"));
    var finderResults = Array.prototype.slice.call(finder.querySelectorAll("[data-finder-result]"));
    var finderResultPanel = finder.querySelector(".finder-result");

    finderOptions.forEach(function (option) {
      option.addEventListener("click", function () {
        var selected = option.getAttribute("data-finder-option");
        finderOptions.forEach(function (item) { item.setAttribute("aria-pressed", String(item === option)); });
        finderResults.forEach(function (item) { item.hidden = item.getAttribute("data-finder-result") !== selected; });
        if (finderResultPanel) {
          finderResultPanel.classList.remove("is-changing");
          void finderResultPanel.offsetWidth;
          finderResultPanel.classList.add("is-changing");
        }
        track("service_finder", { selection: String(option.textContent || "").trim().slice(0, 100) });
      });
    });
  }

  var servicePreview = document.querySelector("[data-service-preview]");
  if (servicePreview) {
    var previewItems = Array.prototype.slice.call(servicePreview.querySelectorAll("[data-service-preview-item]"));
    var previewPanel = servicePreview.querySelector(".service-live-preview");
    var previewNumber = servicePreview.querySelector("[data-service-preview-number]");
    var previewTitle = servicePreview.querySelector("[data-service-preview-title]");
    var previewSummary = servicePreview.querySelector("[data-service-preview-summary]");
    var previewOutcome = servicePreview.querySelector("[data-service-preview-outcome]");

    function selectServicePreview(item) {
      previewItems.forEach(function (candidate) { candidate.classList.toggle("is-active", candidate === item); });
      if (previewNumber) previewNumber.textContent = item.getAttribute("data-preview-number") || "";
      if (previewTitle) previewTitle.textContent = item.getAttribute("data-preview-title") || "";
      if (previewSummary) previewSummary.textContent = item.getAttribute("data-preview-summary") || "";
      if (previewOutcome) previewOutcome.textContent = item.getAttribute("data-preview-outcome") || "";
      if (previewPanel) {
        previewPanel.classList.remove("is-changing");
        void previewPanel.offsetWidth;
        previewPanel.classList.add("is-changing");
      }
    }

    previewItems.forEach(function (item) {
      item.addEventListener("mouseenter", function () { selectServicePreview(item); });
      item.addEventListener("focus", function () { selectServicePreview(item); });
    });
  }

  var processExplorer = document.querySelector("[data-process-explorer]");
  if (processExplorer) {
    var processTabs = Array.prototype.slice.call(processExplorer.querySelectorAll("[data-process-tab]"));
    var processPanels = Array.prototype.slice.call(processExplorer.querySelectorAll("[data-process-panel]"));
    var processStage = processExplorer.querySelector(".process-stage");
    var processNumber = processExplorer.querySelector("[data-process-number]");

    function selectProcessTab(tab, moveFocus) {
      var selected = tab.getAttribute("data-process-tab");
      processTabs.forEach(function (item) {
        var active = item === tab;
        item.setAttribute("aria-selected", String(active));
        item.setAttribute("tabindex", active ? "0" : "-1");
      });
      processPanels.forEach(function (item) { item.hidden = item.getAttribute("data-process-panel") !== selected; });
      if (processNumber) processNumber.textContent = String(Number(selected) + 1).padStart(2, "0");
      if (processStage) {
        processStage.classList.remove("is-changing");
        void processStage.offsetWidth;
        processStage.classList.add("is-changing");
      }
      if (moveFocus) tab.focus();
    }

    processTabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { selectProcessTab(tab, false); });
      tab.addEventListener("keydown", function (event) {
        if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        var nextIndex = index;
        if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = processTabs.length - 1;
        else if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (index + 1) % processTabs.length;
        else nextIndex = (index - 1 + processTabs.length) % processTabs.length;
        selectProcessTab(processTabs[nextIndex], true);
      });
    });
  }

  var stickyCta = document.querySelector(".mobile-sticky-cta");
  function setStickyCtaState() {
    if (!stickyCta) return;
    stickyCta.classList.toggle("is-visible", window.scrollY > Math.min(650, window.innerHeight * 0.7));
  }
  setStickyCtaState();
  window.addEventListener("scroll", setStickyCtaState, { passive: true });

  var heroSystem = document.querySelector(".hero-system");
  if (heroSystem && window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
    heroSystem.addEventListener("pointermove", function (event) {
      var rect = heroSystem.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      heroSystem.style.setProperty("--pointer-x", String(x * 10) + "px");
      heroSystem.style.setProperty("--pointer-y", String(y * 10) + "px");
    });
    heroSystem.addEventListener("pointerleave", function () {
      heroSystem.style.setProperty("--pointer-x", "0px");
      heroSystem.style.setProperty("--pointer-y", "0px");
    });
  }

  var technicalDiagram = document.querySelector(".page-hero-diagram");
  var technicalHero = technicalDiagram && technicalDiagram.closest(".page-hero");
  if (technicalDiagram && technicalHero && window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
    technicalHero.addEventListener("pointermove", function (event) {
      var rect = technicalHero.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - .5;
      var y = (event.clientY - rect.top) / rect.height - .5;
      technicalDiagram.style.setProperty("--diagram-x", String(x * 16) + "px");
      technicalDiagram.style.setProperty("--diagram-y", String(y * 10) + "px");
    });
    technicalHero.addEventListener("pointerleave", function () {
      technicalDiagram.style.setProperty("--diagram-x", "0px");
      technicalDiagram.style.setProperty("--diagram-y", "0px");
    });
  }

  function safeCalendarUrl(value) {
    if (!value) return "";
    try {
      var url = new URL(value);
      if (url.protocol !== "https:" || (url.hostname !== "cal.com" && !url.hostname.endsWith(".cal.com"))) return "";
      return url;
    } catch (_error) {
      return "";
    }
  }

  function showCalendar(panel, formData, booking) {
    if (!panel) return;
    panel.hidden = false;
    panel.setAttribute("tabindex", "-1");
    var embed = panel.querySelector("[data-calendar-embed]");
    var url = safeCalendarUrl(panel.getAttribute("data-cal-url"));

    if (embed && url) {
      url.searchParams.set("embed", "true");
      url.searchParams.set("theme", "light");
      url.searchParams.set("name", String(formData.get("fullName") || ""));
      url.searchParams.set("email", String(formData.get("email") || ""));
      if (booking && booking.id) url.searchParams.set("metadata[leadId]", booking.id);
      var frame = document.createElement("iframe");
      frame.src = url.toString();
      frame.title = document.documentElement.lang === "pt" ? "Escolher data e hora da chamada" : "Choose a date and time for the call";
      frame.loading = "lazy";
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      frame.setAttribute("allow", "camera; microphone; fullscreen; payment");
      embed.appendChild(frame);
    }

    var heading = panel.querySelector("[data-calendar-heading]");
    var progress = document.querySelector("[data-booking-progress]");
    if (progress) {
      progress.setAttribute("data-step", "3");
      Array.prototype.forEach.call(progress.querySelectorAll("li"), function (item, index) {
        if (index === 2) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      });
    }
    if (heading) heading.focus();
  }

  var form = document.querySelector("[data-project-form]");
  if (form) {
    var bookingProgress = document.querySelector("[data-booking-progress]");
    var formSteps = Array.prototype.slice.call(form.querySelectorAll("[data-form-step]"));
    var formNext = form.querySelector("[data-form-next]");
    var formBack = form.querySelector("[data-form-back]");
    var stepOneStatus = form.querySelector("[data-form-status-one]");
    var summaryField = form.querySelector("#projectSummary");
    var summaryCount = form.querySelector("[data-summary-count]");
    var formDraftKey = "cobrait.bookingDraft." + (form.getAttribute("data-locale") || "pt");
    var formDraftTimer = null;

    function setBookingStep(step) {
      formSteps.forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-form-step") !== String(step);
      });
      if (bookingProgress) {
        bookingProgress.setAttribute("data-step", String(step));
        Array.prototype.forEach.call(bookingProgress.querySelectorAll("li"), function (item, index) {
          if (index === step - 1) item.setAttribute("aria-current", "step");
          else item.removeAttribute("aria-current");
        });
      }
      var activePanel = form.querySelector('[data-form-step="' + step + '"]');
      var firstField = activePanel && activePanel.querySelector("input:not([type=hidden]),select,textarea");
      if (firstField) firstField.focus();
    }

    function updateSummaryCount() {
      if (!summaryField || !summaryCount) return;
      summaryCount.textContent = summaryField.value.length + " / " + (summaryField.maxLength || 1600);
    }

    function saveFormDraft() {
      try {
        var values = {};
        Array.prototype.forEach.call(form.elements, function (field) {
          if (!field.name || field.name === "website" || field.type === "submit" || field.type === "button") return;
          values[field.name] = field.type === "checkbox" ? field.checked : field.value;
        });
        window.sessionStorage.setItem(formDraftKey, JSON.stringify(values));
      } catch (_error) {}
    }

    function scheduleFormDraft() {
      window.clearTimeout(formDraftTimer);
      formDraftTimer = window.setTimeout(saveFormDraft, 180);
    }

    try {
      var savedDraft = JSON.parse(window.sessionStorage.getItem(formDraftKey) || "null");
      if (savedDraft && typeof savedDraft === "object") {
        Object.keys(savedDraft).forEach(function (name) {
          var field = form.elements.namedItem(name);
          if (!field || field.disabled) return;
          if (field.type === "checkbox") field.checked = Boolean(savedDraft[name]);
          else field.value = String(savedDraft[name] == null ? "" : savedDraft[name]);
        });
      }
    } catch (_error) {}
    updateSummaryCount();

    form.addEventListener("input", function (event) {
      if (event.target && event.target.removeAttribute) event.target.removeAttribute("aria-invalid");
      if (event.target === summaryField) updateSummaryCount();
      scheduleFormDraft();
    });
    form.addEventListener("change", scheduleFormDraft);

    if (formNext) {
      formNext.addEventListener("click", function () {
        var firstStep = form.querySelector('[data-form-step="1"]');
        var invalid = firstStep && firstStep.querySelector(":invalid");
        if (invalid) {
          invalid.setAttribute("aria-invalid", "true");
          invalid.focus();
          if (stepOneStatus) stepOneStatus.textContent = form.getAttribute("data-required-message") || "Complete os campos obrigatórios.";
          return;
        }
        if (stepOneStatus) stepOneStatus.textContent = "";
        saveFormDraft();
        setBookingStep(2);
        track("booking_form_step", { step: "project" });
      });
    }
    if (formBack) formBack.addEventListener("click", function () { setBookingStep(1); });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      var status = form.querySelector("[data-form-status]");
      var submit = form.querySelector("button[type='submit']");
      var formData = new FormData(form);
      var requiredMessage = form.getAttribute("data-required-message") || "Complete the required fields.";
      var submitMessage = form.getAttribute("data-submit-message") || "Unable to send the request.";

      Array.prototype.forEach.call(form.querySelectorAll("[aria-invalid='true']"), function (field) {
        field.removeAttribute("aria-invalid");
      });

      if (!form.checkValidity()) {
        var invalid = form.querySelector(":invalid");
        if (invalid) {
          invalid.setAttribute("aria-invalid", "true");
          invalid.focus();
        }
        if (status) status.textContent = requiredMessage;
        return;
      }

      if (String(formData.get("website") || "").trim()) {
        form.reset();
        return;
      }

      var detailLines = [
        "Stage: " + String(formData.get("projectStage") || ""),
        "Preferred start: " + String(formData.get("preferredStart") || ""),
        "Investment approved: " + String(formData.get("investmentStatus") || ""),
        "",
        String(formData.get("projectSummary") || "")
      ];
      var payload = {
        fullName: String(formData.get("fullName") || ""),
        email: String(formData.get("email") || ""),
        company: String(formData.get("company") || ""),
        projectSummary: detailLines.join("\n"),
        budgetRange: String(formData.get("investmentStatus") || ""),
        serviceInterest: String(formData.get("serviceInterest") || ""),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
        sourcePage: window.location.pathname,
        sourceCampaign: new URLSearchParams(window.location.search).get("utm_campaign") || ""
      };

      if (submit) submit.disabled = true;
      if (status) status.textContent = "";
      track("booking_form_submit", { service: String(formData.get("serviceInterest") || "") });

      try {
        var response = await fetch("/api/call-bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload),
          credentials: "same-origin"
        });
        if (!response.ok) throw new Error("request_failed");
        var data = await response.json();
        var formPanel = document.querySelector("[data-booking-form-panel]");
        var calendarPanel = document.querySelector("[data-calendar-panel]");
        if (formPanel) formPanel.hidden = true;
        try { window.sessionStorage.removeItem(formDraftKey); } catch (_error) {}
        showCalendar(calendarPanel, formData, data.callBooking || null);
        track("booking_form_success", { service: String(formData.get("serviceInterest") || "") });
      } catch (_error) {
        if (status) status.textContent = submitMessage;
        if (submit) submit.disabled = false;
        track("booking_form_error");
      }
    });
  }
})();
