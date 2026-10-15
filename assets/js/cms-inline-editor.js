(function () {
  var cms = window.CobraitCms || null;
  if (!cms || !document.body) return;

  var EDITABLE_SELECTOR = "[data-cms-key],[data-cms-src-key],[data-cms-remove-key]";
  var HIDDEN_PREFIX = "__hidden.";
  var state = {
    apiBase: cms.apiBase,
    pageKey: cms.getPageKey(),
    content: { page: {}, global: {} },
    user: null,
    enabled: false,
    active: null,
    editableNodes: [],
    booted: false
  };
  var ui = {};

  function escapeAttributeValue(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  function apiRequest(path, options) {
    var requestOptions = options || {};
    var init = {
      method: requestOptions.method || "GET",
      credentials: "include",
      cache: "no-store",
      headers: {}
    };
    if (requestOptions.body !== undefined) {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(requestOptions.body);
    }
    return fetch(state.apiBase + path, init).then(async function (response) {
      var text = await response.text();
      var payload = null;
      if (text) {
        try { payload = JSON.parse(text); } catch (_error) { payload = { message: text }; }
      }
      if (!response.ok) {
        var error = new Error((payload && payload.message) || ("Pedido falhou: " + response.status));
        error.status = response.status;
        throw error;
      }
      return payload;
    });
  }

  function scopeForElement(element) {
    var owner = element && element.closest ? element.closest("[data-cms-scope]") : null;
    return owner && owner.getAttribute("data-cms-scope") === "global" ? "global" : "page";
  }

  function pageKeyForScope(scope) {
    return scope === "global" ? "v2.global" : "draft." + state.pageKey;
  }

  function contentForScope(scope) {
    return state.content[scope === "global" ? "global" : "page"];
  }

  function hiddenItems() {
    var items = [];
    ["page", "global"].forEach(function (scope) {
      Object.keys(contentForScope(scope)).forEach(function (fieldKey) {
        if (fieldKey.indexOf(HIDDEN_PREFIX) !== 0 || String(contentForScope(scope)[fieldKey]) !== "true") return;
        items.push({ scope: scope, key: fieldKey.slice(HIDDEN_PREFIX.length) });
      });
    });
    return items;
  }

  function nodesForCmsKey(key) {
    var safe = escapeAttributeValue(key);
    return Array.prototype.slice.call(document.querySelectorAll(
      '[data-cms-key="' + safe + '"],[data-cms-src-key="' + safe + '"],[data-cms-remove-key="' + safe + '"]'
    ));
  }

  function applyHiddenState() {
    var hiddenLookup = {};
    hiddenItems().forEach(function (item) { hiddenLookup[item.key] = true; });
    document.querySelectorAll("[data-cms-content-hidden=true]").forEach(function (node) {
      var key = node.getAttribute("data-cms-key") || node.getAttribute("data-cms-src-key") || node.getAttribute("data-cms-remove-key") || "";
      if (hiddenLookup[key]) return;
      node.removeAttribute("data-cms-content-hidden");
      node.querySelectorAll("[data-cms-disabled-by-hidden=true]").forEach(function (control) {
        control.disabled = false;
        control.removeAttribute("data-cms-disabled-by-hidden");
      });
    });
    Object.keys(hiddenLookup).forEach(function (key) {
      nodesForCmsKey(key).forEach(function (node) {
        node.setAttribute("data-cms-content-hidden", "true");
        node.querySelectorAll("input,select,textarea,button").forEach(function (control) {
          if (!control.disabled) {
            control.disabled = true;
            control.setAttribute("data-cms-disabled-by-hidden", "true");
          }
        });
      });
    });
    var style = document.getElementById("cms-content-hidden-style");
    if (style) style.textContent = '[data-cms-content-hidden="true"]{display:none!important}';
    if (ui.hiddenLauncher) {
      var count = hiddenItems().length;
      ui.hiddenLauncher.innerHTML = '<span aria-hidden="true">↶</span><span>Ocultos (' + count + ")</span>";
      ui.hiddenLauncher.hidden = !state.enabled;
    }
  }

  function readText(element) {
    if (!element) return "";
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      return element.hasAttribute("placeholder") ? element.getAttribute("placeholder") || "" : element.value || "";
    }
    return element.textContent.trim();
  }

  function friendlyFieldLabel(key) {
    var labels = {
      "hero.kicker": "Etiqueta acima do título",
      "hero.title": "Título principal",
      "hero.text": "Texto de apresentação",
      "hero.primary": "Botão principal",
      "hero.secondary": "Ligação secundária",
      "needs.kicker": "Etiqueta da secção",
      "needs.title": "Título da secção",
      "needs.text": "Introdução da secção",
      "services.kicker": "Etiqueta da secção de serviços",
      "services.title": "Título da secção de serviços",
      "services.text": "Introdução aos serviços",
      "process.kicker": "Etiqueta da secção do processo",
      "process.title": "Título da secção do processo",
      "process.text": "Introdução ao processo",
      "evidence.kicker": "Etiqueta da secção de confiança",
      "evidence.title": "Título da secção de confiança",
      "evidence.text": "Introdução da secção de confiança",
      "engineering.kicker": "Etiqueta da secção de engenharia",
      "engineering.title": "Título da secção de engenharia",
      "engineering.text": "Introdução à engenharia",
      "story.title": "Título da apresentação da empresa",
      "story.text": "Texto da apresentação da empresa",
      "form.title": "Título do formulário",
      "form.text": "Introdução do formulário",
      "brand.logo": "Logótipo COBRAIT",
      "company.email": "Email geral",
      "company.legalName": "Nome jurídico"
    };
    if (labels[key]) return labels[key];
    if (/^nav\./.test(key)) return "Opção do menu";
    if (/^footer\./.test(key)) return "Conteúdo do rodapé";
    if (/^common\./.test(key)) return "Chamada final";
    if (/^block\./.test(key)) return "Secção completa";
    if (key === "form.optional.company") return "Campo Empresa";
    if (key === "form.optional.serviceInterest") return "Campo Tipo de necessidade";
    if (key === "form.optional.projectStage") return "Campo Fase atual";
    if (key === "form.optional.preferredStart") return "Campo Data de início";
    if (key === "form.optional.investmentStatus") return "Campo Investimento aprovado";
    var match = key.match(/^(?:capabilities|services)\.(\d+)\.(title|short|summary|situation|outcome)$/);
    if (match) {
      var servicePart = { title: "Título", short: "Categoria", summary: "Descrição", situation: "Situação", outcome: "Resultado" }[match[2]];
      return servicePart + " do serviço " + (Number(match[1]) + 1);
    }
    match = key.match(/^needs\.items\.(\d+)\.(title|text|label)$/);
    if (match) return ({ title: "Título", text: "Descrição", label: "Ligação" }[match[2]]) + " do ponto de partida " + (Number(match[1]) + 1);
    match = key.match(/^(?:workflow|steps)\.(\d+)\.(title|text)$/);
    if (match) return (match[2] === "title" ? "Título" : "Descrição") + " da fase " + (Number(match[1]) + 1);
    return "Conteúdo selecionado";
  }

  function injectStyles() {
    if (document.getElementById("cms-inline-style")) return;
    var style = document.createElement("style");
    style.id = "cms-inline-style";
    style.textContent = [
      ".cms-inline-launcher{position:fixed;right:24px;bottom:24px;z-index:999999;display:inline-flex;align-items:center;gap:10px;min-height:50px;padding:13px 18px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:#10141c;color:#fff;font:700 13px Inter,system-ui,sans-serif;box-shadow:0 20px 50px rgba(15,23,42,.28);cursor:pointer;transition:transform .2s ease,background-color .2s ease}",
      ".cms-inline-launcher:hover,.cms-inline-launcher[aria-pressed=true]{background:#175cd3}",
      ".cms-inline-launcher-icon{display:grid;place-items:center;width:26px;height:26px;border:1px solid rgba(255,255,255,.3);border-radius:50%;font-size:15px}",
      ".cms-inline-hidden-launcher{position:fixed;right:24px;bottom:88px;z-index:999999;display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:9px 14px;border:1px solid #cbd5e1;border-radius:999px;background:#fff;color:#334155;font:700 12px Inter,system-ui,sans-serif;box-shadow:0 12px 30px rgba(15,23,42,.16);cursor:pointer}",
      ".cms-inline-hidden-launcher[hidden]{display:none}",
      ".cms-inline-panel{position:fixed;top:24px;right:24px;z-index:1000000;width:min(440px,calc(100vw - 32px));max-height:calc(100dvh - 48px);overflow:auto;padding:22px;border:1px solid #d8e2ef;border-radius:20px;background:#fff;box-shadow:0 30px 70px rgba(15,23,42,.2);display:none}",
      ".cms-inline-panel.is-open{display:block}",
      ".cms-inline-panel-head{display:flex;align-items:start;justify-content:space-between;gap:18px;padding-bottom:16px;border-bottom:1px solid #e2e8f0}",
      ".cms-inline-panel h3{margin:0 0 5px;font:800 22px Inter,sans-serif;color:#0f172a;letter-spacing:-.03em}",
      ".cms-inline-panel p{margin:0;color:#64748b;font:400 14px/1.6 Inter,system-ui,sans-serif}",
      ".cms-inline-admin-link{flex:0 0 auto;color:#175cd3;font:700 12px/1.2 Inter,sans-serif;text-decoration:none}",
      ".cms-inline-control{display:block;margin-top:16px}",
      ".cms-inline-control[hidden]{display:none}",
      ".cms-inline-control label{display:block;margin:0 0 8px;font:700 12px/1.2 Inter,system-ui,sans-serif;color:#334155}",
      ".cms-inline-control textarea,.cms-inline-control input[type=url],.cms-inline-control input[type=text]{box-sizing:border-box;width:100%;padding:13px 14px;border:1px solid #c9d6e6;border-radius:12px;background:#f8fafc;color:#0f172a;font:400 15px/1.55 Inter,system-ui,sans-serif;outline:none}",
      ".cms-inline-control textarea{min-height:150px;resize:vertical}",
      ".cms-inline-control textarea:focus,.cms-inline-control input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.18)}",
      ".cms-inline-image-preview{display:block;width:100%;max-height:160px;object-fit:contain;margin:12px 0;padding:10px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc}",
      ".cms-inline-file{width:100%;font:500 13px Inter,system-ui,sans-serif;color:#475569}",
      ".cms-inline-note{display:block;margin-top:7px;color:#64748b;font:500 11px/1.5 Inter,system-ui,sans-serif}",
      ".cms-inline-count{display:block;margin-top:7px;color:#64748b;font:600 11px/1.4 Inter,system-ui,sans-serif;text-align:right}",
      ".cms-inline-count.is-warning{color:#9a5b00}.cms-inline-count.is-over{color:#b42318;font-weight:800}",
      ".cms-inline-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}",
      ".cms-inline-btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:11px 16px;border-radius:999px;border:1px solid transparent;background:#175cd3;color:#fff;font:700 13px Inter,system-ui,sans-serif;cursor:pointer}",
      ".cms-inline-btn[hidden]{display:none}",
      ".cms-inline-btn:disabled{opacity:.55;cursor:wait}",
      ".cms-inline-btn--soft{background:#fff;border-color:#d8e2ef;color:#0f172a}",
      ".cms-inline-btn--danger{background:#fff;border-color:#fecaca;color:#b42318}",
      ".cms-inline-hidden-list{display:grid;gap:10px;margin-top:14px}",
      ".cms-inline-hidden-empty{padding:18px;border:1px dashed #cbd5e1;border-radius:12px;text-align:center;color:#64748b;font:500 13px/1.5 Inter,system-ui,sans-serif}",
      ".cms-inline-hidden-item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 13px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc}",
      ".cms-inline-hidden-item span{color:#334155;font:600 13px/1.4 Inter,system-ui,sans-serif}",
      ".cms-inline-restore{flex:0 0 auto;border:0;background:transparent;color:#175cd3;font:700 12px Inter,system-ui,sans-serif;cursor:pointer}",
      ".cms-inline-status{min-height:18px;margin-top:10px;color:#2563eb;font:600 13px Inter,system-ui,sans-serif}",
      "body.cms-inline-enabled [data-cms-editable=true]{position:relative;outline:1px dashed rgba(23,92,211,.46);outline-offset:6px;cursor:pointer;transition:outline-color .2s ease,background-color .2s ease}",
      "body.cms-inline-enabled [data-cms-editable=true]::after{content:'✎';position:absolute;z-index:20;top:-18px;right:-14px;display:grid;place-items:center;width:24px;height:24px;color:#fff;border:2px solid #fff;border-radius:50%;background:#175cd3;box-shadow:0 5px 15px rgba(23,92,211,.24);font:700 12px/1 system-ui;opacity:0;transform:scale(.82);transition:opacity .18s ease,transform .18s ease;pointer-events:none}",
      "body.cms-inline-enabled [data-cms-editable=true]:hover,body.cms-inline-enabled [data-cms-editable=true]:focus-visible,body.cms-inline-enabled [data-cms-editable=true].cms-inline-active{outline:2px solid #175cd3;background:rgba(23,92,211,.06)}",
      "body.cms-inline-enabled [data-cms-editable=true]:hover::after,body.cms-inline-enabled [data-cms-editable=true]:focus-visible::after,body.cms-inline-enabled [data-cms-editable=true].cms-inline-active::after{opacity:1;transform:scale(1)}",
      "body.cms-inline-enabled{padding-top:48px}body.cms-inline-enabled .site-header{top:48px}",
      "body.cms-inline-enabled::before{content:'MODO DE EDIÇÃO · CLIQUE NUM CONTEÚDO';position:fixed;z-index:999998;inset:0 0 auto 0;height:48px;padding:0 24px;display:flex;align-items:center;color:#fff;background:#10141c;box-shadow:0 8px 24px rgba(15,23,42,.18);font:700 10px/1.2 ui-monospace,monospace;letter-spacing:.08em}",
      "body.cms-inline-enabled .cms-inline-launcher{top:5px;right:12px;bottom:auto;min-height:38px;padding:7px 12px;background:#175cd3;box-shadow:none}",
      "body.cms-inline-enabled .cms-inline-launcher-icon{width:22px;height:22px}",
      "body.cms-inline-enabled .cms-inline-hidden-launcher{top:5px;right:170px;bottom:auto;min-height:38px;padding:7px 12px;border-color:rgba(255,255,255,.25);background:#232a36;color:#fff;box-shadow:none}",
      "body.cms-inline-enabled .cms-inline-panel{top:64px;right:16px;max-height:calc(100dvh - 80px)}",
      "@media (max-width:768px){.cms-inline-launcher{right:16px;bottom:16px}body.cms-inline-enabled .cms-inline-panel{top:auto;right:0;bottom:0;width:100%;max-height:calc(100dvh - 56px);padding:18px;border-radius:18px 18px 0 0}.cms-inline-panel-head{gap:10px}.cms-inline-panel h3{font-size:19px}body.cms-inline-enabled{padding-top:52px}body.cms-inline-enabled::before{height:52px;padding-left:12px;content:'EDIÇÃO'}body.cms-inline-enabled .site-header{top:52px}body.cms-inline-enabled .cms-inline-launcher{top:7px;right:8px;min-height:38px}body.cms-inline-enabled .cms-inline-launcher>span:last-child{font-size:11px}body.cms-inline-enabled .cms-inline-hidden-launcher{top:7px;right:142px;min-height:38px;padding:7px 9px}body.cms-inline-enabled .cms-inline-hidden-launcher>span:last-child{font-size:10px}.cms-inline-actions{display:grid;grid-template-columns:1fr 1fr}.cms-inline-actions .cms-inline-btn:first-child{grid-column:1/-1}body.cms-inline-enabled .mobile-sticky-cta{display:none!important}}",
      "@media (max-width:430px){body.cms-inline-enabled .cms-inline-launcher>span:last-child{display:none}body.cms-inline-enabled .cms-inline-hidden-launcher{right:60px}.cms-inline-admin-link{max-width:88px;text-align:right}.cms-inline-control textarea{min-height:120px}}"
    ].join("");
    document.head.appendChild(style);
  }

  function buildUi() {
    injectStyles();
    ui.launcher = document.createElement("button");
    ui.launcher.type = "button";
    ui.launcher.className = "cms-inline-launcher";
    ui.launcher.setAttribute("aria-pressed", "false");
    ui.launcher.innerHTML = '<span class="cms-inline-launcher-icon" aria-hidden="true">✎</span><span>Editar esta página</span>';
    ui.hiddenLauncher = document.createElement("button");
    ui.hiddenLauncher.type = "button";
    ui.hiddenLauncher.className = "cms-inline-hidden-launcher";
    ui.hiddenLauncher.hidden = true;
    ui.hiddenLauncher.innerHTML = '<span aria-hidden="true">↶</span><span>Ocultos (0)</span>';
    ui.panel = document.createElement("aside");
    ui.panel.className = "cms-inline-panel";
    ui.panel.innerHTML = [
      '<div class="cms-inline-panel-head"><div><h3 id="cmsInlinePanelTitle">Editar conteúdo</h3><p id="cmsInlineHelp">Altere o conteúdo selecionado e guarde.</p></div><a class="cms-inline-admin-link" href="/admin">Administração ↗</a></div>',
      '<div class="cms-inline-control" id="cmsInlineTextGroup"><label id="cmsInlineFieldLabel" for="cmsInlineTextarea">Conteúdo selecionado</label><textarea id="cmsInlineTextarea"></textarea><small id="cmsInlineCount" class="cms-inline-count"></small></div>',
      '<div class="cms-inline-control" id="cmsInlineUrlGroup" hidden><label for="cmsInlineUrl">Destino da ligação</label><input id="cmsInlineUrl" type="url" inputmode="url"><small class="cms-inline-note">Use uma página interna, https://, mailto: ou tel:.</small></div>',
      '<div class="cms-inline-control" id="cmsInlineImageGroup" hidden><label for="cmsInlineImageUrl">Imagem</label><img id="cmsInlineImagePreview" class="cms-inline-image-preview" alt="Pré-visualização"><input id="cmsInlineImageFile" class="cms-inline-file" type="file" accept="image/jpeg,image/png,image/webp"><small class="cms-inline-note">JPG, PNG ou WebP, até 5 MB. Pode também indicar um URL abaixo.</small><input id="cmsInlineImageUrl" type="text" inputmode="url" aria-label="URL da imagem"></div>',
      '<div class="cms-inline-control" id="cmsInlineAltGroup" hidden><label for="cmsInlineAlt">Descrição alternativa</label><input id="cmsInlineAlt" type="text" maxlength="240"><small class="cms-inline-note">Descreva o conteúdo da imagem. Deixe vazio apenas se for decorativa.</small></div>',
      '<div class="cms-inline-control" id="cmsInlineHiddenGroup" hidden><div id="cmsInlineHiddenList" class="cms-inline-hidden-list"></div></div>',
      '<div class="cms-inline-actions"><button type="button" id="cmsInlineSave" class="cms-inline-btn">Guardar alteração</button><button type="button" id="cmsInlineRemove" class="cms-inline-btn cms-inline-btn--danger">Remover do website</button><button type="button" id="cmsInlineClose" class="cms-inline-btn cms-inline-btn--soft">Cancelar</button></div>',
      '<div id="cmsInlineStatus" class="cms-inline-status" role="status" aria-live="polite"></div>'
    ].join("");
    document.body.appendChild(ui.launcher);
    document.body.appendChild(ui.hiddenLauncher);
    document.body.appendChild(ui.panel);
    ["panelTitle", "help", "fieldLabel", "textarea", "count", "url", "imageUrl", "imageFile", "imagePreview", "alt", "save", "remove", "close", "status", "hiddenList"].forEach(function (name) {
      var id = "cmsInline" + name.charAt(0).toUpperCase() + name.slice(1);
      ui[name] = document.getElementById(id);
    });
    ui.textGroup = document.getElementById("cmsInlineTextGroup");
    ui.urlGroup = document.getElementById("cmsInlineUrlGroup");
    ui.imageGroup = document.getElementById("cmsInlineImageGroup");
    ui.altGroup = document.getElementById("cmsInlineAltGroup");
    ui.hiddenGroup = document.getElementById("cmsInlineHiddenGroup");

    ui.launcher.addEventListener("click", function () { setEditingEnabled(!state.enabled); });
    ui.hiddenLauncher.addEventListener("click", openHiddenManager);
    ui.close.addEventListener("click", closePanel);
    ui.save.addEventListener("click", saveActiveField);
    ui.remove.addEventListener("click", removeActiveField);
    ui.imageUrl.addEventListener("input", function () { ui.imagePreview.src = ui.imageUrl.value || ""; });
    ui.imageFile.addEventListener("change", function () {
      if (ui.imageFile.files && ui.imageFile.files[0]) ui.imagePreview.src = URL.createObjectURL(ui.imageFile.files[0]);
    });
    ui.textarea.addEventListener("keydown", function (event) {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); saveActiveField(); }
    });
    ui.textarea.addEventListener("input", updateInlineCount);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && ui.panel.classList.contains("is-open")) closePanel();
    });
    document.addEventListener("click", function (event) {
      if (!state.enabled || ui.panel.contains(event.target) || ui.launcher.contains(event.target) || ui.hiddenLauncher.contains(event.target)) return;
      var target = event.target && event.target.nodeType === 1 ? event.target.closest("[data-cms-editable=true]") : null;
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      openField(target);
    }, true);
    try {
      if (new URLSearchParams(window.location.search).get("active") === "1") setEditingEnabled(true);
    } catch (_error) {}
  }

  function setEditingEnabled(enabled) {
    state.enabled = Boolean(enabled);
    document.body.classList.toggle("cms-inline-enabled", state.enabled);
    ui.launcher.setAttribute("aria-pressed", String(state.enabled));
    ui.launcher.innerHTML = state.enabled
      ? '<span class="cms-inline-launcher-icon" aria-hidden="true">×</span><span>Sair da edição</span>'
      : '<span class="cms-inline-launcher-icon" aria-hidden="true">✎</span><span>Editar esta página</span>';
    if (state.enabled) {
      applyHiddenState();
      refreshEditableNodes();
      ui.help.textContent = "Clique num conteúdo assinalado na página para o editar.";
    } else {
      ui.hiddenLauncher.hidden = true;
      clearEditableNodes();
      closePanel();
    }
  }

  function clearEditableNodes() {
    state.editableNodes.forEach(function (node) { node.removeAttribute("data-cms-editable"); });
    state.editableNodes = [];
  }

  function refreshEditableNodes() {
    clearEditableNodes();
    state.editableNodes = Array.prototype.slice.call(document.querySelectorAll(EDITABLE_SELECTOR)).filter(function (element) {
      return !element.closest(".cms-inline-panel,.cms-inline-launcher,.cms-inline-hidden-launcher,script,style,noscript,svg") && element.getAttribute("data-cms-content-hidden") !== "true";
    });
    state.editableNodes.forEach(function (node) { node.setAttribute("data-cms-editable", "true"); });
  }

  function closePanel() {
    if (state.active && state.active.element) state.active.element.classList.remove("cms-inline-active");
    ui.panel.classList.remove("is-open");
    ui.status.textContent = "";
    ui.imageFile.value = "";
    ui.close.textContent = "Cancelar";
    state.active = null;
  }

  function storedValue(scope, key, fallback) {
    var content = contentForScope(scope);
    return Object.prototype.hasOwnProperty.call(content, key) ? String(content[key] == null ? "" : content[key]) : String(fallback || "");
  }

  function inlineRecommendedLimit(key) {
    key = String(key || "");
    if (key.indexOf("kicker") !== -1) return 42;
    if (key === "hero.title") return 90;
    if (/\.title$/.test(key)) return 80;
    if (/\.(?:label|primary|secondary)$/.test(key) || key.indexOf("nav.") === 0) return 45;
    if (/\.(?:text|description|summary)$/.test(key)) return 320;
    return 0;
  }

  function updateInlineCount() {
    if (!ui.count) return;
    var key = state.active && state.active.textKey || "";
    var limit = inlineRecommendedLimit(key);
    var length = ui.textarea.value.length;
    ui.count.textContent = length + " caracteres" + (limit ? " · recomendado até " + limit : "");
    ui.count.classList.toggle("is-warning", Boolean(limit && length >= Math.round(limit * .9) && length <= limit));
    ui.count.classList.toggle("is-over", Boolean(limit && length > limit));
  }

  function openField(element) {
    if (state.active && state.active.element) state.active.element.classList.remove("cms-inline-active");
    var link = element.closest("a[data-cms-href-key]");
    var textKey = element.getAttribute("data-cms-key") || "";
    var srcKey = element.getAttribute("data-cms-src-key") || "";
    var altKey = element.getAttribute("data-cms-alt-key") || "";
    var hrefKey = link ? link.getAttribute("data-cms-href-key") || "" : "";
    var removableOwner = element.closest("[data-cms-remove-key]");
    var removalKey = removableOwner ? removableOwner.getAttribute("data-cms-remove-key") || "" : (textKey || srcKey);
    var protectedContent = Boolean(element.closest("[data-cms-protected=true]"));
    var scope = scopeForElement(element);
    state.active = { element: element, link: link, scope: scope, textKey: textKey, srcKey: srcKey, altKey: altKey, hrefKey: hrefKey, removalKey: removalKey, protectedContent: protectedContent };
    element.classList.add("cms-inline-active");

    ui.panelTitle.textContent = removalKey.indexOf("block.") === 0 ? "Gerir secção" : (textKey || srcKey ? "Editar conteúdo" : "Gerir campo");
    ui.textGroup.hidden = !textKey;
    ui.urlGroup.hidden = !hrefKey;
    ui.imageGroup.hidden = !srcKey;
    ui.altGroup.hidden = !altKey;
    ui.hiddenGroup.hidden = true;
    ui.save.hidden = !(textKey || srcKey || hrefKey || altKey);
    ui.remove.hidden = !removalKey || protectedContent;
    ui.close.textContent = "Cancelar";
    if (textKey) {
      ui.fieldLabel.textContent = friendlyFieldLabel(textKey);
      ui.textarea.value = storedValue(scope, textKey, readText(element));
      updateInlineCount();
    }
    if (hrefKey) ui.url.value = storedValue(scope, hrefKey, link.getAttribute("href") || "");
    if (srcKey) {
      ui.imageUrl.value = storedValue(scope, srcKey, element.getAttribute("src") || "");
      ui.imagePreview.src = ui.imageUrl.value;
    }
    if (altKey) ui.alt.value = storedValue(scope, altKey, element.getAttribute("alt") || "");
    ui.help.textContent = scope === "global"
      ? "Esta alteração será aplicada em todo o website."
      : (textKey || srcKey ? "Esta alteração será guardada no rascunho desta página." : "Pode remover este campo da página e restaurá-lo mais tarde.");
    ui.status.textContent = "";
    ui.panel.classList.add("is-open");
    if (textKey) ui.textarea.focus();
  }

  async function persistScope(scope) {
    var data = await apiRequest("/site-content/" + encodeURIComponent(pageKeyForScope(scope)), {
      method: "PUT",
      body: { content: contentForScope(scope) }
    });
    state.content[scope] = data && data.contentEntry && data.contentEntry.content
      ? data.contentEntry.content
      : contentForScope(scope);
  }

  function renderHiddenList() {
    ui.hiddenList.innerHTML = "";
    var items = hiddenItems();
    if (!items.length) {
      var empty = document.createElement("div");
      empty.className = "cms-inline-hidden-empty";
      empty.textContent = "Não existem elementos ocultos nesta página.";
      ui.hiddenList.appendChild(empty);
      return;
    }
    items.forEach(function (item) {
      var row = document.createElement("div");
      row.className = "cms-inline-hidden-item";
      var label = document.createElement("span");
      label.textContent = friendlyFieldLabel(item.key) + (item.scope === "global" ? " · todo o website" : "");
      var restore = document.createElement("button");
      restore.type = "button";
      restore.className = "cms-inline-restore";
      restore.textContent = "Restaurar";
      restore.addEventListener("click", function () { restoreHiddenField(item.scope, item.key, restore); });
      row.appendChild(label);
      row.appendChild(restore);
      ui.hiddenList.appendChild(row);
    });
  }

  function openHiddenManager() {
    if (state.active && state.active.element) state.active.element.classList.remove("cms-inline-active");
    state.active = null;
    ui.panelTitle.textContent = "Elementos ocultos";
    ui.help.textContent = "Restaure campos e conteúdos removidos anteriormente.";
    ui.textGroup.hidden = true;
    ui.urlGroup.hidden = true;
    ui.imageGroup.hidden = true;
    ui.altGroup.hidden = true;
    ui.hiddenGroup.hidden = false;
    ui.save.hidden = true;
    ui.remove.hidden = true;
    ui.close.textContent = "Fechar";
    ui.status.textContent = "";
    renderHiddenList();
    ui.panel.classList.add("is-open");
  }

  async function removeActiveField() {
    if (!state.active || !state.active.removalKey || state.active.protectedContent) return;
    var active = state.active;
    var label = friendlyFieldLabel(active.removalKey);
    var scopeMessage = active.scope === "global" ? " em todo o website" : " nesta página";
    if (!window.confirm('Remover "' + label + '"' + scopeMessage + "? Poderá restaurá-lo mais tarde.")) return;
    ui.remove.disabled = true;
    ui.status.textContent = "A remover...";
    try {
      contentForScope(active.scope)[HIDDEN_PREFIX + active.removalKey] = "true";
      await persistScope(active.scope);
      applyHiddenState();
      refreshEditableNodes();
      openHiddenManager();
      ui.status.textContent = "Elemento removido. Pode restaurá-lo nesta lista.";
    } catch (error) {
      ui.status.textContent = error.message || "Não foi possível remover o elemento.";
    } finally {
      ui.remove.disabled = false;
    }
  }

  async function restoreHiddenField(scope, key, button) {
    button.disabled = true;
    ui.status.textContent = "A restaurar...";
    try {
      delete contentForScope(scope)[HIDDEN_PREFIX + key];
      await persistScope(scope);
      applyHiddenState();
      refreshEditableNodes();
      renderHiddenList();
      ui.status.textContent = "Elemento restaurado com sucesso.";
    } catch (error) {
      ui.status.textContent = error.message || "Não foi possível restaurar o elemento.";
      button.disabled = false;
    }
  }

  function isSafeLink(value) {
    return /^(?:\/(?!\/)|#|https:\/\/|mailto:|tel:)/i.test(String(value || "").trim());
  }

  function isSafeImage(value) {
    return /^(?:\/assets\/[a-z0-9/_.-]+|https:\/\/[^\s]+)$/i.test(String(value || "").trim());
  }

  async function uploadSelectedImage() {
    var file = ui.imageFile.files && ui.imageFile.files[0];
    if (!file) return "";
    if (["image/jpeg", "image/png", "image/webp"].indexOf(file.type) === -1) throw new Error("Use uma imagem JPG, PNG ou WebP.");
    if (file.size > 5 * 1024 * 1024) throw new Error("A imagem excede o limite de 5 MB.");
    var query = "?filename=" + encodeURIComponent(file.name) + "&alt=" + encodeURIComponent(ui.alt.value || "");
    var response = await fetch(state.apiBase + "/media" + query, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": file.type },
      body: file
    });
    var payload = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      var error = new Error(payload.message || "Não foi possível carregar a imagem.");
      error.status = response.status;
      throw error;
    }
    return payload.item && payload.item.url ? payload.item.url : "";
  }

  function updatePage(active, values) {
    if (active.textKey && values.text !== undefined) {
      document.querySelectorAll('[data-cms-key="' + escapeAttributeValue(active.textKey) + '"]').forEach(function (node) {
        cms.setElementValue(node, values.text);
      });
    }
    if (active.hrefKey && values.href) {
      document.querySelectorAll('[data-cms-href-key="' + escapeAttributeValue(active.hrefKey) + '"]').forEach(function (node) { node.setAttribute("href", values.href); });
    }
    if (active.srcKey && values.src) {
      document.querySelectorAll('[data-cms-src-key="' + escapeAttributeValue(active.srcKey) + '"]').forEach(function (node) { node.setAttribute("src", values.src); });
    }
    if (active.altKey) {
      document.querySelectorAll('[data-cms-alt-key="' + escapeAttributeValue(active.altKey) + '"]').forEach(function (node) { node.setAttribute("alt", values.alt || ""); });
    }
  }

  async function saveActiveField() {
    if (!state.active) return;
    var active = state.active;
    var content = contentForScope(active.scope);
    ui.save.disabled = true;
    ui.save.textContent = "A guardar...";
    ui.status.textContent = "";
    try {
      var values = {};
      if (active.textKey) {
        values.text = ui.textarea.value.trim();
        if (!values.text) throw new Error("O conteúdo de texto não pode ficar vazio.");
        content[active.textKey] = values.text;
      }
      if (active.hrefKey) {
        values.href = ui.url.value.trim();
        if (!isSafeLink(values.href)) throw new Error("O destino da ligação não é válido ou seguro.");
        content[active.hrefKey] = values.href;
      }
      if (active.srcKey) {
        values.src = await uploadSelectedImage() || ui.imageUrl.value.trim();
        if (!isSafeImage(values.src)) throw new Error("O endereço da imagem não é válido ou seguro.");
        content[active.srcKey] = values.src;
      }
      if (active.altKey) {
        values.alt = ui.alt.value.trim();
        if (values.alt) content[active.altKey] = values.alt; else delete content[active.altKey];
      }
      var data = await apiRequest("/site-content/" + encodeURIComponent(pageKeyForScope(active.scope)), {
        method: "PUT",
        body: { content: content }
      });
      state.content[active.scope] = data && data.contentEntry && data.contentEntry.content ? data.contentEntry.content : content;
      updatePage(active, values);
      refreshEditableNodes();
      ui.status.textContent = active.scope === "global" ? "Alteração publicada em todo o website." : "Alteração guardada no rascunho. Publique-a na administração quando estiver pronta.";
    } catch (error) {
      if (error && error.status === 401) ui.status.textContent = "Sessão expirada. Volte ao admin e inicie sessão novamente.";
      else if (error && error.status === 403) ui.status.textContent = "A sua conta não tem permissão para editar.";
      else ui.status.textContent = error.message || "Não foi possível guardar.";
    } finally {
      ui.save.disabled = false;
      ui.save.textContent = "Guardar alteração";
    }
  }

  async function bootstrapContent() {
    var data = await apiRequest("/site-content").catch(function () { return null; });
    var entries = data && Array.isArray(data.contentEntries) ? data.contentEntries : [];
    function contentForKey(key) {
      var entry = entries.find(function (item) { return item.pageKey === key; });
      return entry && entry.content ? entry.content : {};
    }
    var published = contentForKey(state.pageKey);
    var draft = contentForKey("draft." + state.pageKey);
    state.content.page = Object.keys(draft).length ? draft : published;
    state.content.global = contentForKey("v2.global");
  }

  async function init() {
    if (state.booted) return;
    try {
      var session = await apiRequest("/auth/me");
      var user = session && session.user ? session.user : null;
      if (!user || ["admin", "editor"].indexOf(user.role) === -1) return;
      state.user = user;
    } catch (_error) { return; }
    await bootstrapContent();
    buildUi();
    applyHiddenState();
    state.booted = true;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
