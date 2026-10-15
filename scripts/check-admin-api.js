const config = require("../server/src/config");

const baseUrl = String(process.argv[2] || "http://localhost:4000").replace(/\/+$/, "");

async function main() {
  if (!config.bootstrapAdminEmail || !config.bootstrapAdminPassword) {
    console.log("Admin API check skipped: ADMIN_EMAIL or ADMIN_PASSWORD is not configured.");
    return;
  }

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: config.bootstrapAdminEmail, password: config.bootstrapAdminPassword })
  });
  if (!login.ok) throw new Error(`Admin login failed with ${login.status}`);
  const setCookie = login.headers.get("set-cookie") || "";
  const cookie = setCookie.split(";")[0];
  if (!cookie) throw new Error("Admin login did not return a session cookie");

  const endpoints = [
    "/api/auth/me",
    "/api/site-content",
    "/api/site-content/v2.pt.home/revisions",
    "/api/media",
    "/api/site-pages",
    "/api/integrations",
    "/api/contact-requests",
    "/api/call-bookings",
    "/api/users",
    "/api/users/audit"
  ];
  for (const endpoint of endpoints) {
    const response = await fetch(baseUrl + endpoint, { headers: { cookie } });
    if (!response.ok) throw new Error(`${endpoint} failed with ${response.status}`);
    await response.json();
  }

  const preview = await fetch(`${baseUrl}/api/site-pages/preview`, {
    method: "POST",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({
      slug: "preview-check",
      locale: "pt",
      title: "Preview check",
      status: "draft",
      blocks: [{ id: "preview-block", type: "text", title: "Verificação", text: "Conteúdo de teste", items: [] }]
    })
  });
  if (!preview.ok || !(await preview.text()).includes("noindex,nofollow")) {
    throw new Error(`Page builder preview failed with ${preview.status}`);
  }

  console.log("Admin API check OK: auth, CMS, revisions, media, preview, integrations, activity, users, leads and bookings.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
