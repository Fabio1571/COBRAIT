const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const failures = [];

function expect(relativePath, pattern, message) {
  const source = read(relativePath);
  if (!pattern.test(source)) failures.push(`${relativePath}: ${message}`);
}

expect("assets/css/site-v2.css", /overflow-wrap:\s*anywhere/, "falta proteção para palavras e URLs longos");
expect("assets/css/site-v2.css", /\.need-row\s*\{\s*grid-template-columns:\s*48px minmax\(0,1fr\)/, "a lista de necessidades não colapsa de forma segura em tablet");
expect("assets/css/site-v2.css", /prefers-reduced-motion:\s*reduce/, "falta suporte a reduced motion");
expect("assets/css/site-v2.css", /booking-progress/, "falta o progresso visual do formulário");
expect("assets/css/site-v2.css", /page-hero-diagram/, "faltam os diagramas técnicos reutilizáveis");
expect("assets/js/site-v2.js", /sessionStorage\.setItem\(formDraftKey/, "o formulário não recupera dados durante a sessão");
expect("assets/js/cms-inline-editor.js", /"draft\." \+ state\.pageKey/, "o editor visual não está a guardar em rascunho");
expect("assets/js/cms-inline-editor.js", /cms-inline-count/, "falta contador de caracteres no editor visual");
expect("assets/js/cms-inline-editor.js", /cms-inline-enabled \.cms-inline-launcher/, "falta a barra de edição responsiva");
expect("admin.html", /id="cmsDraftBtn"/, "falta a ação Guardar rascunho");
expect("admin.html", /id="cmsUndoBtn"/, "falta a ação Desfazer publicação");
expect("admin.html", /value="seo"/, "falta o editor SEO simplificado");
expect("admin.html", /BOOKING_OPTIONAL_FIELDS/, "falta a gestão dedicada dos campos do formulário");
const publicRoutes = read("server/src/routes/public.routes.js");
if (!/startsWith\("draft\."\)/.test(publicRoutes)) {
  failures.push("server/src/routes/public.routes.js: os rascunhos podem ficar acessíveis pela API pública");
}

const booking = read("server/views/pages/booking.njk");
if ((booking.match(/data-form-step=/g) || []).length !== 2 || !booking.includes("data-booking-progress")) {
  failures.push("booking.njk: o percurso progressivo do formulário está incompleto");
}
[
  "form.optional.company",
  "form.optional.serviceInterest",
  "form.optional.projectStage",
  "form.optional.preferredStart",
  "form.optional.investmentStatus"
].forEach((key) => {
  if (!booking.includes(`data-cms-remove-key="${key}"`)) failures.push(`booking.njk: falta campo opcional ${key}`);
});
if ((booking.match(/data-cms-protected="true"/g) || []).length < 3) {
  failures.push("booking.njk: os campos essenciais do formulário não estão protegidos");
}

const blockTemplates = ["home", "about", "engineering", "process", "services", "service"];
blockTemplates.forEach((name) => {
  const template = read(`server/views/pages/${name}.njk`);
  if (!/data-cms-remove-key="block\./.test(template)) failures.push(`${name}.njk: não existem secções geríveis no editor visual`);
});

if (!fs.existsSync(path.join(root, "assets/images/cobrait-symbol.svg"))) {
  failures.push("assets/images: falta o símbolo vetorial da COBRAIT");
}

if (failures.length) {
  console.error("Editor/layout checks failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Editor/layout checks passed.");
