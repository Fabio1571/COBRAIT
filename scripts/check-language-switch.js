const fs = require("fs");
const path = require("path");
const { paths, services, shared } = require("../server/src/site/content");
const { getPage } = require("../server/src/site/pages");

const root = path.resolve(__dirname, "..");
const failures = [];
const pageIds = [
  "home", "services", "productScope", "mvp", "customSoftware", "uxui", "dedicatedTeams",
  "process", "engineering", "about", "booking", "privacy", "cookies", "terms"
];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

["pt", "en"].forEach((locale) => {
  if (!shared[locale]) fail(`Missing shared content for ${locale}`);
  if (!paths[locale]) fail(`Missing route map for ${locale}`);
  if (!Array.isArray(services[locale]) || services[locale].length !== 5) fail(`Expected five services for ${locale}`);

  pageIds.forEach((id) => {
    const page = getPage(locale, id);
    if (!page) {
      fail(`Missing ${locale} page: ${id}`);
      return;
    }
    if (!page.seo || !page.seo.title || !page.seo.description) fail(`Missing SEO copy for ${locale}.${id}`);
    if (!page.hero || !page.hero.title || !page.hero.text) fail(`Missing hero copy for ${locale}.${id}`);
    if (!paths[locale][id]) fail(`Missing route for ${locale}.${id}`);
  });
});

const allPaths = Object.values(paths.pt).concat(Object.values(paths.en));
if (new Set(allPaths).size !== allPaths.length) fail("Localized paths must be unique.");
if (allPaths.some((route) => /\/es(?:\/|$)/.test(route))) fail("Spanish routes are still present.");

const baseTemplate = read("server/views/layouts/base.njk");
["hreflang=\"pt\"", "hreflang=\"en\"", "hreflang=\"x-default\"", "alternatePath", "data-cms-page"].forEach((marker) => {
  if (!baseTemplate.includes(marker)) fail(`Base template is missing ${marker}`);
});

const appSource = read("server/src/app.js");
if (appSource.includes("mobile-preview.js") || appSource.includes("isMobileRequest")) {
  fail("The Express application still contains the separate mobile implementation.");
}

const viewFiles = fs.readdirSync(path.join(root, "server", "views", "pages"));
viewFiles.forEach((file) => {
  const source = read(path.join("server", "views", "pages", file));
  if (source.includes("data-es=") || source.includes("mobile-preview.js") || source.includes("nebula-language.js")) {
    fail(`Legacy language/mobile marker found in ${file}`);
  }
});

if (failures.length) {
  console.error("Localized site check failed:");
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Localized site check OK: ${pageIds.length * 2} PT/EN routes, one responsive implementation, no ES routes.`);
