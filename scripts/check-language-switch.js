const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const publicHtmlDirs = [root, path.join(root, "servicos")];
const skippedPages = new Set(["admin.html"]);
const failures = [];

function fail(message) {
  failures.push(message);
}

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

function publicHtmlFiles() {
  return publicHtmlDirs.flatMap((dir) => {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter((name) => name.endsWith(".html"))
      .filter((name) => !skippedPages.has(name))
      .map((name) => path.join(dir, name));
  });
}

const languageScriptPath = path.join(root, "assets", "js", "nebula-language.js");
const responsiveCssPath = path.join(root, "assets", "css", "site-redesign.css");
const siteUiPath = path.join(root, "assets", "js", "site-ui.js");

if (!fs.existsSync(languageScriptPath)) {
  fail("Missing assets/js/nebula-language.js");
}

if (!fs.existsSync(responsiveCssPath)) {
  fail("Missing assets/css/site-redesign.css");
}

if (!fs.existsSync(siteUiPath)) {
  fail("Missing assets/js/site-ui.js");
}

if (fs.existsSync(languageScriptPath)) {
  const languageScript = readText(languageScriptPath);
  ["pt", "en", "es"].forEach((lang) => {
    if (!languageScript.includes('code: "' + lang + '"')) {
      fail("Desktop language script is missing option: " + lang);
    }
  });

  [
    "window.CobraitLanguage",
    "setLanguage(lang, true)",
    "applyLanguageToDocument",
    "MutationObserver"
  ].forEach((marker) => {
    if (!languageScript.includes(marker)) {
      fail("Desktop language script is missing marker: " + marker);
    }
  });
}

const htmlFiles = publicHtmlFiles();
if (!htmlFiles.length) {
  fail("No public HTML files found.");
}

htmlFiles.forEach((file) => {
  const relative = path.relative(root, file).replace(/\\/g, "/");
  const html = readText(file);

  if (!html.includes('/assets/js/nebula-language.js')) {
    fail(relative + " does not load nebula-language.js");
  }

  if (!html.includes('/assets/css/site-redesign.css')) {
    fail(relative + " does not load the shared responsive stylesheet");
  }

  if (!html.includes('/assets/js/site-ui.js')) {
    fail(relative + " does not load the shared interface script");
  }

  if (!/aria-label=["']Idioma["']/.test(html)) {
    fail(relative + " does not include the desktop language button");
  }
});

if (failures.length) {
  console.error("Language switch check failed:");
  failures.forEach((message) => console.error("- " + message));
  process.exit(1);
}

console.log("Public site check OK: " + htmlFiles.length + " responsive pages wired for PT/EN/ES.");
