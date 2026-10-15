const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const viewsRoot = path.join(root, "server", "views");
const pageRoot = path.join(viewsRoot, "pages");
const officialTarget = "https://www.livroreclamacoes.pt/inicio";
const logoAssetPath = "/assets/images/logo-lre-vermelho-negativo.png";
const logoPath = path.join(root, logoAssetPath.slice(1));
const officialLogoHash = "76e87364e4efa4f26e76024240b7a785850b933c4ae492f17cb51e6c034b4eb5";
const failures = [];

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function requireLreMarkup(name, source) {
  if (!source.includes(officialTarget)) failures.push(`${name} does not use the official LRE target.`);
  if (!source.includes(logoAssetPath)) failures.push(`${name} does not include the official LRE image.`);
  if (!source.includes('class="complaints-book-link"')) failures.push(`${name} does not expose the LRE footer link.`);
  const logoIndex = source.indexOf(logoAssetPath);
  if (logoIndex >= 0 && source.slice(logoIndex, logoIndex + 320).includes('loading="lazy"')) {
    failures.push(`${name} defers the legally required LRE image.`);
  }
}

const baseSource = read(path.join(viewsRoot, "layouts", "base.njk"));
requireLreMarkup("Base layout", baseSource);

fs.readdirSync(pageRoot).filter((file) => file.endsWith(".njk")).forEach((file) => {
  const source = read(path.join(pageRoot, file));
  if (file === "not-found.njk") {
    requireLreMarkup("404 page", source);
    return;
  }
  if (!source.includes('{% extends "layouts/base.njk" %}')) {
    failures.push(`${file} does not inherit the shared footer.`);
  }
});

requireLreMarkup(
  "Page builder renderer",
  read(path.join(root, "server", "src", "services", "page-builder.renderer.js"))
);

if (!fs.existsSync(logoPath)) {
  failures.push("Official LRE logo asset is missing.");
} else {
  const logo = fs.readFileSync(logoPath);
  const isPng = logo.length >= 24 && logo.toString("ascii", 1, 4) === "PNG";
  if (!isPng || logo.readUInt32BE(16) !== 140 || logo.readUInt32BE(20) !== 58) {
    failures.push("LRE logo must be the supplied 140 x 58 PNG asset.");
  }
  if (crypto.createHash("sha256").update(logo).digest("hex") !== officialLogoHash) {
    failures.push("LRE logo must match the supplied red negative artwork without modifications.");
  }
}

if (failures.length) {
  console.error("LRE footer coverage check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("LRE footer coverage OK: shared pages, 404 page and builder pages use the official logo and target.");
