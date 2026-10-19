const config = require("../config");

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeHref(value, fallback) {
  const href = String(value || "").trim();
  if (/^(https?:\/\/|mailto:|\/|#)/i.test(href)) return escapeHtml(href);
  return fallback;
}

function safeImageSource(value) {
  const source = String(value || "").trim();
  if (/^\/assets\/uploads\/[a-z0-9._-]+$/i.test(source) || /^https:\/\//i.test(source)) {
    return escapeHtml(source);
  }
  return "";
}

function blockButton(block, className, fallback) {
  if (!block.buttonLabel || !block.buttonHref) return "";
  return `<a class="button ${className}" href="${safeHref(block.buttonHref, fallback)}">${escapeHtml(block.buttonLabel)}<span aria-hidden="true">↗</span></a>`;
}

function renderList(items) {
  if (!Array.isArray(items) || !items.length) return "";
  return `<ul class="builder-statement-list">${items.map((item, index) => `<li><span>0${index + 1}</span><p>${escapeHtml(item)}</p></li>`).join("")}</ul>`;
}

function renderCards(items) {
  if (!Array.isArray(items) || !items.length) return "";
  return `<div class="builder-card-grid">${items.map((item, index) => `<article><span>0${index + 1}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></article>`).join("")}</div>`;
}

function renderFaq(items) {
  if (!Array.isArray(items) || !items.length) return "";
  return `<div class="accordion-list">${items.map((item) => `<details class="accordion-item"><summary>${escapeHtml(item.title)}<span aria-hidden="true">+</span></summary><div><p>${escapeHtml(item.text)}</p></div></details>`).join("")}</div>`;
}

function renderBlock(block, locale) {
  if (block.hidden) return "";
  const fallback = locale === "en" ? "/en/book-a-call/" : "/pt/agendar/";
  const kicker = block.kicker ? `<p class="eyebrow">${escapeHtml(block.kicker)}</p>` : "";
  const title = block.title ? `<h2>${escapeHtml(block.title)}</h2>` : "";
  const text = block.text ? `<p>${escapeHtml(block.text)}</p>` : "";

  if (block.type === "hero") {
    return `<section class="page-hero builder-hero"><div class="shell page-hero-grid">${kicker}${block.title ? `<h1>${escapeHtml(block.title)}</h1>` : ""}${block.text ? `<p class="hero-text">${escapeHtml(block.text)}</p>` : ""}${renderList(block.items)}${blockButton(block, "button-primary", fallback)}</div></section>`;
  }

  if (block.type === "cards") {
    return `<section class="section builder-block"><div class="shell"><div class="section-heading section-heading-narrow">${kicker}${title}${text}</div>${renderCards(block.items)}${blockButton(block, "button-primary", fallback)}</div></section>`;
  }

  if (block.type === "faq") {
    return `<section class="section faq-section"><div class="shell faq-grid"><div>${kicker}${title}${text}</div>${renderFaq(block.items)}</div></section>`;
  }

  if (block.type === "cta") {
    return `<section class="section section-cta"><div class="shell"><div class="cta-panel">${kicker}${title}${text}${blockButton(block, "button-light", fallback)}</div></div></section>`;
  }

  if (block.type === "image") {
    const source = safeImageSource(block.imageUrl);
    if (!source) return "";
    const caption = block.imageCaption ? `<figcaption>${escapeHtml(block.imageCaption)}</figcaption>` : "";
    return `<section class="section builder-image-section"><div class="shell"><figure class="builder-image"><img src="${source}" alt="${escapeHtml(block.imageAlt)}" loading="lazy" decoding="async">${caption}</figure></div></section>`;
  }

  return `<section class="section builder-block"><div class="shell editorial-intro"><div>${kicker}${title}</div><div>${text}${renderList(block.items)}${blockButton(block, "button-primary", fallback)}</div></div></section>`;
}

function renderBuilderPage(page, options = {}) {
  const locale = page.locale === "en" ? "en" : "pt";
  const isEnglish = locale === "en";
  const home = isEnglish ? "/en/" : "/pt/";
  const services = isEnglish ? "/en/services/" : "/pt/servicos/";
  const about = isEnglish ? "/en/about/" : "/pt/sobre/";
  const booking = isEnglish ? "/en/book-a-call/" : "/pt/agendar/";
  const title = escapeHtml(page.title || "COBRAIT");
  const description = escapeHtml(page.description || (isEnglish ? "COBRAIT software company" : "COBRAIT software company"));
  const blocks = (page.blocks || []).map((block) => renderBlock(block, locale)).join("");
  const canonical = `${config.siteUrl}/${escapeHtml(page.slug)}`;
  const robots = options.preview ? "noindex,nofollow" : "index,follow";

  return `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${description}">
  <meta name="robots" content="${robots}">
  <title>${title} — COBRAIT</title>
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/assets/images/favicon/favicon.ico" sizes="any">
  <link rel="icon" type="image/svg+xml" href="/assets/images/cobrait-symbol.svg?v=20261015a">
  <link rel="stylesheet" href="/assets/css/site-v2.css?v=20261015a">
</head>
<body class="site-v2 builder-page">
  <a class="skip-link" href="#main-content">${isEnglish ? "Skip to content" : "Saltar para o conteúdo"}</a>
  <header class="site-header" data-site-header>
    <div class="shell header-inner">
      <a class="brand" href="${home}"><span class="brand-symbol" aria-hidden="true"><img src="/assets/images/cobrait-symbol.svg?v=20261015a" alt="" width="96" height="56"></span><span class="brand-word">COBRAIT</span></a>
      <nav class="desktop-nav" aria-label="${isEnglish ? "Primary navigation" : "Navegação principal"}"><a href="${services}">${isEnglish ? "Services" : "Serviços"}</a><a href="${about}">${isEnglish ? "About" : "Sobre"}</a></nav>
      <a class="button button-small button-dark" href="${booking}">${isEnglish ? "Discuss a project" : "Falar sobre um projeto"}</a>
    </div>
  </header>
  <main id="main-content">${blocks}</main>
  <footer class="site-footer"><div class="shell"><div class="footer-lead"><a class="brand brand-footer" href="${home}"><span class="brand-word">COBRAIT</span></a><p>${isEnglish ? "Software shaped with clarity and built with accountability." : "Software pensado com clareza e construído com responsabilidade."}</p><a class="complaints-book-link" href="https://www.livroreclamacoes.pt/inicio" target="_blank" rel="noopener noreferrer"><img src="/assets/images/logo-lre-vermelho-negativo.png" alt="${isEnglish ? "Electronic Complaints Book" : "Livro de Reclamações Eletrónico"}" width="140" height="58" decoding="async"><span class="sr-only">${isEnglish ? " (opens in a new tab)" : " (abre num novo separador)"}</span></a></div><div class="footer-links"><div><p class="footer-label">${isEnglish ? "Explore" : "Explorar"}</p><a href="${services}">${isEnglish ? "Services" : "Serviços"}</a><a href="${about}">${isEnglish ? "About" : "Sobre"}</a></div><div><p class="footer-label">Contact</p><a href="mailto:geral@cobrait.pt">geral@cobrait.pt</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} COBRAIT.</span></div></div></footer>
  <script src="/assets/js/site-v2.js?v=20260806h" defer></script>
</body>
</html>`;
}

module.exports = { renderBuilderPage };
