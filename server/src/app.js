const compression = require("compression");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const crypto = require("crypto");
const express = require("express");
const helmet = require("helmet");
const nunjucks = require("nunjucks");
const path = require("path");
const { rateLimit } = require("express-rate-limit");
const config = require("./config");
const { errorHandler, notFound } = require("./middleware/error-handler");
const authRoutes = require("./routes/auth.routes");
const contentRoutes = require("./routes/content.routes");
const opsRoutes = require("./routes/ops.routes");
const publicRoutes = require("./routes/public.routes");
const siteRoutes = require("./routes/site.routes");
const usersRoutes = require("./routes/users.routes");
const { paths } = require("./site/content");
const { getBuilderPage } = require("./services/page-builder.service");
const { renderBuilderPage } = require("./services/page-builder.renderer");

const app = express();
const allowedOrigins = new Set(config.corsOrigins);
const siteRoot = path.resolve(__dirname, "../..");
const viewsRoot = path.join(siteRoot, "server", "views");
const STATIC_SITE_PORTS = new Set(["3000", "5500", "8080", "8092"]);

nunjucks.configure(viewsRoot, {
  autoescape: true,
  express: app,
  noCache: config.env !== "production",
  watch: false
});
app.set("view engine", "njk");
app.set("views", viewsRoot);
app.set("trust proxy", 1);

function isLoopbackHostname(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isPrivateIpv4(hostname) {
  const value = String(hostname || "");
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(value)) return true;
  const match = value.match(/^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (!match) return false;
  const secondOctet = Number.parseInt(match[1], 10);
  return Number.isFinite(secondOctet) && secondOctet >= 16 && secondOctet <= 31;
}

function isTrustedLocalOrigin(origin) {
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    const port = parsed.port || (parsed.protocol === "https:" ? "443" : "80");
    return STATIC_SITE_PORTS.has(String(port)) && (isLoopbackHostname(parsed.hostname) || isPrivateIpv4(parsed.hostname));
  } catch (_error) {
    return false;
  }
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.size === 0 || allowedOrigins.has(origin) || isTrustedLocalOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true
};

const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Demasiados pedidos. Tente novamente dentro de alguns minutos." }
});
const passwordResetLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Demasiados pedidos de recuperação. Tente novamente mais tarde." }
});

app.use((request, response, next) => {
  response.locals.cspNonce = crypto.randomBytes(18).toString("base64");
  next();
});
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use((request, response, next) => {
  if (/^\/(pt|en)(\/|$)/.test(request.path)) {
    const nonce = response.locals.cspNonce;
    response.set("Content-Security-Policy", [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}'`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-src 'self' https://cal.com https://*.cal.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join("; "));
  }
  next();
});
app.use(compression());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({
  limit: "1mb",
  verify(request, _response, buffer) {
    request.rawBody = buffer;
  }
}));
app.use(cookieParser());

app.get("/api/health", async (_request, response) => {
  response.json({ ok: true, service: "cobrait-admin-api" });
});

app.use(["/api/contact-requests", "/api/call-bookings"], publicFormLimiter);
app.use("/api/auth/forgot-password", passwordResetLimiter);
app.use("/api", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api", contentRoutes);
app.use("/api", opsRoutes);

app.use("/assets", express.static(path.join(siteRoot, "assets"), {
  index: false,
  maxAge: config.env === "production" ? "1h" : 0,
  etag: true
}));
app.get(["/favicon-16x16.png", "/favicon-32x32.png", "/apple-touch-icon.png"], (request, response) => {
  response.sendFile(path.join(siteRoot, "assets", "images", "favicon", request.path.slice(1)));
});

app.use(siteRoutes);

app.get(["/admin", "/admin.html"], (_request, response) => {
  response.set("Cache-Control", "no-store");
  response.sendFile(path.join(siteRoot, "admin.html"));
});

function localeForLegacyRequest(request) {
  const cookieLocale = String(request.cookies.cobrait_locale || "").toLowerCase();
  if (cookieLocale === "pt" || cookieLocale === "en") return cookieLocale;
  return String(request.get("accept-language") || "").toLowerCase().startsWith("en") ? "en" : "pt";
}

const legacyRedirects = new Map([
  ["/index.html", "home"],
  ["/about-us.html", "about"],
  ["/sobre-nos", "about"],
  ["/tech.html", "engineering"],
  ["/tecnologia", "engineering"],
  ["/book-a-call.html", "booking"],
  ["/agendar-chamada", "booking"],
  ["/privacidade.html", "privacy"],
  ["/privacidade", "privacy"],
  ["/termos.html", "terms"],
  ["/termos", "terms"],
  ["/cookies.html", "cookies"],
  ["/cookies", "cookies"],
  ["/process.html", "process"],
  ["/process", "process"],
  ["/servicos.html", "services"],
  ["/servicos", "services"],
  ["/servicos/product-scope.html", "productScope"],
  ["/servicos/product-scope", "productScope"],
  ["/servicos/mvp-builder.html", "mvp"],
  ["/servicos/mvp-builder", "mvp"],
  ["/servicos/ux-ui.html", "uxui"],
  ["/servicos/ux-ui", "uxui"],
  ["/servicos/custom-software.html", "customSoftware"],
  ["/servicos/custom-software", "customSoftware"],
  ["/servicos/dedicated-teams.html", "dedicatedTeams"],
  ["/servicos/dedicated-teams", "dedicatedTeams"]
]);

app.get(Array.from(legacyRedirects.keys()), (request, response) => {
  const locale = localeForLegacyRequest(request);
  const pageId = legacyRedirects.get(request.path) || "home";
  response.redirect(301, paths[locale][pageId] || paths[locale].home);
});

async function sendBuilderPage(request, response, next) {
  try {
    const slug = String(request.params.slug || "").toLowerCase();
    const page = await getBuilderPage(slug);
    if (!page || page.status !== "published") return next();
    response.type("html").send(renderBuilderPage(page));
  } catch (error) {
    next(error);
  }
}

app.get("/:slug([a-z0-9-]+)", sendBuilderPage);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
