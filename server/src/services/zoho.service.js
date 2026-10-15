const config = require("../config");

let cachedToken = "";
let cachedApiDomain = "";
let tokenExpiresAt = 0;

function isZohoEnabled() {
  return Boolean(config.zohoClientId && config.zohoClientSecret && config.zohoRefreshToken);
}

function officialZohoUrl(value, kind) {
  const url = new URL(value);
  const allowedHosts = kind === "accounts"
    ? ["accounts.zoho.com", "accounts.zoho.eu", "accounts.zoho.com.au", "accounts.zoho.in", "accounts.zoho.com.cn", "accounts.zoho.jp", "accounts.zoho.sa", "accounts.zohocloud.ca"]
    : ["www.zohoapis.com", "www.zohoapis.eu", "www.zohoapis.com.au", "www.zohoapis.in", "www.zohoapis.com.cn", "www.zohoapis.jp", "www.zohoapis.sa", "www.zohoapis.ca"];

  if (url.protocol !== "https:" || !allowedHosts.includes(url.hostname)) {
    throw new Error(`Invalid Zoho ${kind} URL.`);
  }
  return url;
}

async function accessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return { token: cachedToken, apiDomain: cachedApiDomain || config.zohoApiDomain };
  }

  const endpoint = officialZohoUrl(config.zohoAccountsUrl, "accounts");
  endpoint.pathname = "/oauth/v2/token";
  endpoint.search = "";
  const body = new URLSearchParams({
    refresh_token: config.zohoRefreshToken,
    client_id: config.zohoClientId,
    client_secret: config.zohoClientSecret,
    grant_type: "refresh_token"
  });
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.access_token) {
    throw new Error(`Zoho OAuth refresh failed (${response.status}): ${String(payload.error || "unknown_error")}`);
  }

  cachedToken = String(payload.access_token);
  cachedApiDomain = officialZohoUrl(payload.api_domain || config.zohoApiDomain, "api").origin;
  const expiresIn = Number(payload.expires_in || 3600);
  tokenExpiresAt = Date.now() + Math.max(60, expiresIn - 120) * 1000;
  return { token: cachedToken, apiDomain: cachedApiDomain };
}

function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "", lastName: "Website" };
  if (parts.length === 1) return { firstName: "", lastName: parts[0] };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}

function compactRecord(record) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== ""));
}

async function createLead(input) {
  if (!isZohoEnabled()) return { enabled: false, synced: false };

  const { token, apiDomain } = await accessToken();
  const { firstName, lastName } = splitName(input.fullName);
  const description = [
    input.kind ? `Tipo: ${input.kind}` : "",
    input.serviceInterest ? `Serviço: ${input.serviceInterest}` : "",
    input.subject ? `Assunto: ${input.subject}` : "",
    input.summary || input.message || "",
    input.sourcePage ? `Origem: ${input.sourcePage}` : ""
  ].filter(Boolean).join("\n\n").slice(0, 30000);
  const record = compactRecord({
    First_Name: firstName,
    Last_Name: lastName,
    Company: String(input.company || "Não indicado").slice(0, 200),
    Email: input.email,
    Phone: input.phone,
    Lead_Source: "Website",
    Description: description
  });
  const endpoint = new URL(`/crm/v8/${encodeURIComponent(config.zohoLeadModule)}`, officialZohoUrl(apiDomain, "api"));
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      data: [record],
      trigger: config.zohoTriggerWorkflows ? ["workflow"] : []
    })
  });
  const payload = await response.json().catch(() => ({}));
  const result = payload && Array.isArray(payload.data) ? payload.data[0] : null;

  if (!response.ok || !result || result.status !== "success") {
    const code = result && result.code ? result.code : `HTTP_${response.status}`;
    const message = result && result.message ? result.message : "Zoho lead creation failed.";
    throw new Error(`${code}: ${message}`);
  }

  return { enabled: true, synced: true, id: result.details && result.details.id ? String(result.details.id) : "" };
}

function syncCallBookingToZoho(booking) {
  return createLead({
    kind: "Pedido de reunião",
    fullName: booking.fullName,
    email: booking.email,
    phone: booking.phone,
    company: booking.company,
    serviceInterest: booking.serviceInterest,
    summary: booking.projectSummary,
    sourcePage: booking.sourcePage
  });
}

function syncContactRequestToZoho(contactRequest) {
  return createLead({
    kind: "Pedido de contacto",
    fullName: contactRequest.fullName,
    email: contactRequest.email,
    phone: contactRequest.phone,
    company: contactRequest.company,
    subject: contactRequest.subject,
    message: contactRequest.message,
    sourcePage: contactRequest.sourcePage
  });
}

module.exports = {
  createLead,
  isZohoEnabled,
  syncCallBookingToZoho,
  syncContactRequestToZoho
};
