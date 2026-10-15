const { paths } = require("../server/src/site/content");
const crypto = require("crypto");

const args = process.argv.slice(2);
const baseUrl = String(args.find((argument) => !argument.startsWith("--")) || "http://localhost:4000").replace(/\/+$/, "");
const skipForms = args.includes("--skip-forms");

async function expectStatus(pathname, expected, options) {
  const response = await fetch(baseUrl + pathname, options);
  if (response.status !== expected) {
    throw new Error(`${pathname}: expected ${expected}, received ${response.status}`);
  }
  return response;
}

async function checkPages() {
  const entries = [
    ...Object.values(paths.pt).map((pathname) => ["pt", pathname]),
    ...Object.values(paths.en).map((pathname) => ["en", pathname])
  ];

  for (const [locale, pathname] of entries) {
    const response = await expectStatus(pathname, 200);
    const html = await response.text();
    if (!html.includes(`<html lang="${locale}"`)) throw new Error(`${pathname}: wrong html lang`);
    if (!html.includes("rel=\"canonical\"")) throw new Error(`${pathname}: canonical missing`);
    if (!html.includes("hreflang=\"pt\"") || !html.includes("hreflang=\"en\"")) throw new Error(`${pathname}: hreflang missing`);
    if (!html.includes("id=\"main-content\"")) throw new Error(`${pathname}: main landmark missing`);
    if (html.includes("mobile-preview.js") || html.includes("data-es=")) throw new Error(`${pathname}: legacy mobile/language code present`);
  }
}

async function checkInfrastructure() {
  const health = await (await expectStatus("/api/health", 200)).json();
  if (!health.ok) throw new Error("Health endpoint is not OK");

  const sitemap = await (await expectStatus("/sitemap.xml", 200)).text();
  if (!sitemap.includes(paths.pt.home) || !sitemap.includes(paths.en.home)) throw new Error("Sitemap is missing localized homes");
  if (sitemap.includes("/pt/trabalho/") || sitemap.includes("/en/work/")) throw new Error("Removed case study routes are still present in sitemap");
  const robots = await (await expectStatus("/robots.txt", 200)).text();
  if (!robots.includes("Sitemap:")) throw new Error("robots.txt is missing sitemap reference");
  await expectStatus("/admin.html", 200);

  const legacy = await expectStatus("/servicos.html", 301, { redirect: "manual" });
  if (legacy.headers.get("location") !== paths.pt.services) throw new Error("Legacy redirect target is incorrect");
  const removedWork = await expectStatus("/pt/trabalho/", 301, { redirect: "manual" });
  if (removedWork.headers.get("location") !== paths.pt.services) throw new Error("Removed work route does not redirect to services");
}

async function checkForms() {
  const suffix = Date.now().toString(36);
  const response = await expectStatus("/api/call-bookings", 201, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      fullName: "Teste COBRAIT",
      email: `qa-${suffix}@example.com`,
      company: "QA local",
      projectSummary: "Pedido local criado pelo teste automatizado do novo formulário.",
      budgetRange: "Em definição",
      serviceInterest: "Product Scope",
      sourcePage: "/pt/agendar/",
      timezone: "Europe/Lisbon"
    })
  });
  const payload = await response.json();
  if (!payload.callBooking || !payload.callBooking.id) throw new Error("Booking API did not return a saved booking");

  const honeypot = await expectStatus("/api/call-bookings", 201, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ website: "https://spam.example", fullName: "Spam", email: "spam@example.com", projectSummary: "spam" })
  });
  const honeypotPayload = await honeypot.json();
  if (honeypotPayload.callBooking !== null) throw new Error("Honeypot request was not discarded");

  const webhookSecret = String(process.env.CALCOM_TEST_SECRET || "");
  if (webhookSecret) {
    const webhookBody = JSON.stringify({
      triggerEvent: "BOOKING_CREATED",
      payload: {
        metadata: { leadId: payload.callBooking.id },
        attendees: [{ email: `qa-${suffix}@example.com` }],
        startTime: "2026-08-12T10:00:00.000Z",
        meetingUrl: "https://cal.com/video/test-booking"
      }
    });
    const signature = crypto.createHmac("sha256", webhookSecret).update(webhookBody).digest("hex");
    const webhook = await expectStatus("/api/calendar/calcom/webhook", 200, {
      method: "POST",
      headers: { "content-type": "application/json", "x-cal-signature-256": signature },
      body: webhookBody
    });
    const webhookPayload = await webhook.json();
    if (!webhookPayload.matched) throw new Error("Signed calendar webhook did not match the saved booking");
  } else {
    await expectStatus("/api/calendar/calcom/webhook", 503, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ triggerEvent: "BOOKING_CREATED" })
    });
  }
}

async function main() {
  await checkPages();
  await checkInfrastructure();
  if (!skipForms) await checkForms();
  console.log(skipForms
    ? "Live site check OK: 28 pages, redirects and SEO endpoints (forms skipped)."
    : "Live site check OK: 28 pages, redirects, SEO endpoints and booking flow.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
