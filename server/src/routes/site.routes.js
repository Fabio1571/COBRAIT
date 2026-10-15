const express = require("express");
const config = require("../config");
const { getSiteContentEntry } = require("../services/content.service");
const { paths, processSteps, services, shared } = require("../site/content");
const { getPage } = require("../site/pages");
const { listBuilderPages } = require("../services/page-builder.service");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();
router.use(optionalAuth);

const routeEntries = [
  ["pt", "home", paths.pt.home],
  ["pt", "services", paths.pt.services],
  ["pt", "productScope", paths.pt.productScope],
  ["pt", "mvp", paths.pt.mvp],
  ["pt", "customSoftware", paths.pt.customSoftware],
  ["pt", "uxui", paths.pt.uxui],
  ["pt", "dedicatedTeams", paths.pt.dedicatedTeams],
  ["pt", "process", paths.pt.process],
  ["pt", "engineering", paths.pt.engineering],
  ["pt", "about", paths.pt.about],
  ["pt", "booking", paths.pt.booking],
  ["pt", "privacy", paths.pt.privacy],
  ["pt", "cookies", paths.pt.cookies],
  ["pt", "terms", paths.pt.terms],
  ["en", "home", paths.en.home],
  ["en", "services", paths.en.services],
  ["en", "productScope", paths.en.productScope],
  ["en", "mvp", paths.en.mvp],
  ["en", "customSoftware", paths.en.customSoftware],
  ["en", "uxui", paths.en.uxui],
  ["en", "dedicatedTeams", paths.en.dedicatedTeams],
  ["en", "process", paths.en.process],
  ["en", "engineering", paths.en.engineering],
  ["en", "about", paths.en.about],
  ["en", "booking", paths.en.booking],
  ["en", "privacy", paths.en.privacy],
  ["en", "cookies", paths.en.cookies],
  ["en", "terms", paths.en.terms]
];

const routeByPath = new Map(routeEntries.map(([locale, id, pathname]) => [pathname, { locale, id, pathname }]));
const alternateId = {
  productScope: "productScope",
  mvp: "mvp",
  customSoftware: "customSoftware",
  uxui: "uxui",
  dedicatedTeams: "dedicatedTeams"
};

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function applyContentOverrides(page, content) {
  Object.entries(content || {}).forEach(([key, value]) => {
    if (!key || key.startsWith("dom.") || key.startsWith("i18n.")) return;
    const parts = key.split(".").filter(Boolean);
    let target = page;

    for (let index = 0; index < parts.length - 1; index += 1) {
      const part = parts[index];
      if (!target || typeof target !== "object" || !(part in target)) return;
      target = target[part];
    }

    const finalKey = parts[parts.length - 1];
    if (target && typeof target === "object" && finalKey in target && String(value).trim()) {
      target[finalKey] = String(value);
    }
  });

  return page;
}

function hiddenCmsKeysFromContent(...contentObjects) {
  const keys = new Set();
  contentObjects.forEach((content) => {
    Object.entries(content || {}).forEach(([fieldKey, value]) => {
      if (!fieldKey.startsWith("__hidden.") || String(value) !== "true") return;
      const cmsKey = fieldKey.slice("__hidden.".length);
      if (/^[a-zA-Z0-9_][a-zA-Z0-9._-]{0,1023}$/.test(cmsKey)) keys.add(cmsKey);
    });
  });
  return Array.from(keys);
}

function safeExternalUrl(value) {
  const text = String(value || "").trim();
  return /^https:\/\//i.test(text) ? text : "";
}

function safeAssetUrl(value) {
  const text = String(value || "").trim();
  if (/^\/assets\/[a-z0-9/_.-]+$/i.test(text)) return text;
  return safeExternalUrl(text);
}

function safeCalUrl(value) {
  const text = safeExternalUrl(value);
  if (!text) return "";
  try {
    const url = new URL(text);
    return url.hostname === "cal.com" || url.hostname.endsWith(".cal.com") ? text.replace(/\/+$/, "") : "";
  } catch {
    return "";
  }
}

function applyGlobalSettings(sharedContent, content, locale) {
  const next = deepClone(sharedContent);
  const values = content || {};
  next.brand = {
    logo: safeAssetUrl(values["brand.logo"]) || "/assets/images/cobrait-symbol.svg?v=20260826b",
    logoAlt: String(values["brand.logoAlt"] || "").trim().slice(0, 240)
  };
  next.company = {
    email: String(values["company.email"] || "geral@cobrait.pt").trim(),
    linkedin: safeExternalUrl(values["company.linkedin"]),
    legalName: String(values["company.legalName"] || "Vírgula Prodigiosa").trim(),
    taxId: String(values["company.taxId"] || "518841057").trim(),
    street: String(values["company.street"] || "Rua Engenheiro Ferreira Dias, 161").trim(),
    postalCode: String(values["company.postalCode"] || "4100-247").trim(),
    city: String(values["company.city"] || "Porto").trim()
  };
  next.nav.visibility = {
    process: String(values["nav.showProcess"] || "true") !== "false",
    engineering: String(values["nav.showEngineering"] || "true") !== "false",
    about: String(values["nav.showAbout"] || "true") !== "false"
  };
  ["services", "process", "engineering", "about", "booking"].forEach((key) => {
    const label = String(values[`nav.${key}.${locale}`] || "").trim();
    if (label) next.nav[key] = label;
  });
  ["explore", "contact", "legal", "privacy", "cookies", "terms", "rights"].forEach((key) => {
    const label = String(values[`footer.${key}.${locale}`] || "").trim();
    if (label) next.footer[key] = label;
  });
  ["response", "finalCtaTitle", "finalCtaText", "talk", "learnMore", "backHome"].forEach((key) => {
    const label = String(values[`common.${key}.${locale}`] || "").trim();
    if (label) next.common[key] = label;
  });
  const socialImage = safeAssetUrl(values["seo.socialImage"]);
  next.seo = { socialImage: socialImage.startsWith("/") ? `${config.siteUrl}${socialImage}` : socialImage };
  next.calendar = { url: safeCalUrl(values["calendar.url"]) || config.calBookingUrl };
  if (String(values[`footer.statement.${locale}`] || "").trim()) {
    next.footer.statement = String(values[`footer.statement.${locale}`]).trim();
  }
  if (String(values[`footer.location.${locale}`] || "").trim()) {
    next.footer.location = String(values[`footer.location.${locale}`]).trim();
  }
  return next;
}

function getTemplate(kind) {
  if (["home", "services", "service", "process", "engineering", "about", "booking", "legal"].includes(kind)) {
    return `pages/${kind}.njk`;
  }
  return "pages/home.njk";
}

function activeSection(page) {
  if (page.kind === "service" || page.kind === "services") return "services";
  if (["process", "engineering", "about"].includes(page.kind)) return page.kind;
  return "";
}

function structuredDataFor(page, locale, canonical, localizedShared) {
  const organization = {
    "@type": "Organization",
    "@id": `${config.siteUrl}/#organization`,
    name: "COBRAIT",
    legalName: localizedShared.company.legalName,
    taxID: localizedShared.company.taxId,
    url: config.siteUrl,
    email: localizedShared.company.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: localizedShared.company.street,
      postalCode: localizedShared.company.postalCode,
      addressLocality: localizedShared.company.city,
      addressCountry: "PT"
    },
    areaServed: "PT"
  };
  const webpage = {
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: page.seo.title,
    description: page.seo.description,
    inLanguage: locale === "pt" ? "pt-PT" : "en-GB",
    isPartOf: { "@id": `${config.siteUrl}/#website` },
    about: { "@id": `${config.siteUrl}/#organization` }
  };
  const graph = [
    organization,
    {
      "@type": "WebSite",
      "@id": `${config.siteUrl}/#website`,
      url: config.siteUrl,
      name: "COBRAIT",
      publisher: { "@id": `${config.siteUrl}/#organization` },
      inLanguage: ["pt-PT", "en-GB"]
    },
    webpage
  ];

  if (page.kind === "service") {
    graph.push({
      "@type": "Service",
      name: page.service.title,
      description: page.seo.description,
      provider: { "@id": `${config.siteUrl}/#organization` },
      areaServed: "Portugal",
      url: canonical
    });
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}

async function renderSitePage(request, response, next) {
  try {
    const normalizedPath = request.path.endsWith("/") ? request.path : `${request.path}/`;
    const route = routeByPath.get(normalizedPath);
    if (!route) return next();

    if (request.path !== route.pathname) {
      const query = request.originalUrl.includes("?") ? request.originalUrl.slice(request.originalUrl.indexOf("?")) : "";
      return response.redirect(308, route.pathname + query);
    }

    const basePage = getPage(route.locale, route.id);
    if (!basePage) return next();

    const pageKey = `v2.${route.locale}.${basePage.id}`;
    const editorMode = Boolean(request.user && ["admin", "editor"].includes(request.user.role));
    const previewMode = editorMode && String(request.query.preview || "") === "draft";
    const [entry, draftEntry, globalEntry] = await Promise.all([
      getSiteContentEntry(pageKey),
      previewMode ? getSiteContentEntry(`draft.${pageKey}`) : Promise.resolve(null),
      getSiteContentEntry("v2.global")
    ]);
    const draftContent = draftEntry && draftEntry.content && Object.keys(draftEntry.content).length
      ? draftEntry.content
      : null;
    const effectiveContent = draftContent || (entry && entry.content);
    const page = applyContentOverrides(deepClone(basePage), effectiveContent);
    const localizedShared = applyGlobalSettings(shared[route.locale], globalEntry && globalEntry.content, route.locale);
    const otherLocale = route.locale === "pt" ? "en" : "pt";
    const equivalentId = alternateId[route.id] || route.id;
    const alternatePath = paths[otherLocale][equivalentId] || paths[otherLocale].home;
    const canonical = `${config.siteUrl}${route.pathname}`;
    const hiddenCmsKeys = hiddenCmsKeysFromContent(effectiveContent, globalEntry && globalEntry.content);

    response.cookie("cobrait_locale", route.locale, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
      secure: config.env === "production",
      httpOnly: false
    });
    response.set("Cache-Control", editorMode || config.env !== "production" ? "private, no-store" : "public, max-age=0, s-maxage=300, stale-while-revalidate=86400");

    return response.render(getTemplate(page.kind), {
      active: activeSection(page),
      alternateLocale: otherLocale,
      alternateName: shared[otherLocale].localeName,
      alternatePath,
      alternates: {
        pt: `${config.siteUrl}${paths.pt[equivalentId] || paths.pt.home}`,
        en: `${config.siteUrl}${paths.en[equivalentId] || paths.en.home}`
      },
      calBookingUrl: localizedShared.calendar.url,
      canonical,
      editorMode,
      hiddenCmsKeys,
      locale: route.locale,
      nonce: response.locals.cspNonce,
      page,
      previewMode,
      publishedPath: route.pathname,
      paths: paths[route.locale],
      processSteps: processSteps[route.locale],
      services: services[route.locale],
      shared: localizedShared,
      structuredData: structuredDataFor(page, route.locale, canonical, localizedShared),
      year: new Date().getFullYear()
    });
  } catch (error) {
    return next(error);
  }
}

router.get("/", (request, response) => {
  const cookieLocale = String(request.cookies.cobrait_locale || "").toLowerCase();
  if (cookieLocale === "pt" || cookieLocale === "en") return response.redirect(302, paths[cookieLocale].home);
  const accepted = String(request.get("accept-language") || "").toLowerCase();
  return response.redirect(302, accepted.startsWith("pt") ? paths.pt.home : paths.en.home);
});

router.get(["/pt/trabalho", "/pt/trabalho/"], (_request, response) => response.redirect(301, paths.pt.services));
router.get(["/en/work", "/en/work/"], (_request, response) => response.redirect(301, paths.en.services));

router.get(Array.from(routeByPath.keys()), renderSitePage);

router.get("/robots.txt", (request, response) => {
  response.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
});

router.get("/sitemap.xml", async (request, response, next) => {
  try {
  const urls = routeEntries.map(([locale, id, pathname]) => {
    const otherLocale = locale === "pt" ? "en" : "pt";
    const alternatePath = paths[otherLocale][id] || paths[otherLocale].home;
    return [
      "  <url>",
      `    <loc>${config.siteUrl}${pathname}</loc>`,
      `    <xhtml:link rel=\"alternate\" hreflang=\"${locale}\" href=\"${config.siteUrl}${pathname}\"/>`,
      `    <xhtml:link rel=\"alternate\" hreflang=\"${otherLocale}\" href=\"${config.siteUrl}${alternatePath}\"/>`,
      `    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"${config.siteUrl}${locale === "en" ? pathname : alternatePath}\"/>`,
      "  </url>"
    ].join("\n");
  });
  const builderPages = (await listBuilderPages()).filter((page) => page.status === "published");
  const builderUrls = builderPages.map((page) => `  <url>\n    <loc>${config.siteUrl}/${page.slug}</loc>\n  </url>`);
  response.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.concat(builderUrls).join("\n")}\n</urlset>`);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
