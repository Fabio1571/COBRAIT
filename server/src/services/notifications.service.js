const nodemailer = require("nodemailer");
const config = require("../config");

let transporter;
const NOTIFICATION_TIMEOUT_MS = 10000;

function isEmailEnabled() {
  return Boolean(config.smtpHost && config.smtpUser && config.smtpPassword && config.notificationEmailTo);
}

function getNotificationConfigSummary() {
  const warnings = [];

  if (!isEmailEnabled()) {
    warnings.push("SMTP incompleto. A app vai tentar FormSubmit em vez de SMTP.");
  }
  if (config.smtpPort === 465 && !config.smtpSecure) {
    warnings.push("Porta 465 normalmente requer SMTP_SECURE=true.");
  }
  if (config.smtpPort === 587 && config.smtpSecure) {
    warnings.push("Porta 587 normalmente usa SMTP_SECURE=false.");
  }
  if (config.notificationEmailFrom && !String(config.notificationEmailFrom).includes("@")) {
    warnings.push("NOTIFICATION_EMAIL_FROM deve incluir um email, por exemplo: COBRAIT Website <geral@cobrait.pt>.");
  }

  return {
    smtpEnabled: isEmailEnabled(),
    smtpHost: config.smtpHost || "",
    smtpPort: config.smtpPort,
    smtpSecure: config.smtpSecure,
    smtpUser: config.smtpUser || "",
    smtpPasswordConfigured: Boolean(config.smtpPassword),
    notificationEmailFrom: config.notificationEmailFrom || "",
    notificationEmailTo: config.notificationEmailTo || "",
    warnings
  };
}

function describeNotificationError(error) {
  return {
    message: error && error.message ? error.message : "Erro desconhecido ao enviar email.",
    code: error && error.code ? error.code : "",
    command: error && error.command ? error.command : "",
    responseCode: error && error.responseCode ? error.responseCode : "",
    response: error && error.response ? String(error.response).slice(0, 500) : ""
  };
}

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      connectionTimeout: NOTIFICATION_TIMEOUT_MS,
      greetingTimeout: NOTIFICATION_TIMEOUT_MS,
      socketTimeout: NOTIFICATION_TIMEOUT_MS,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword
      }
    });
  }

  return transporter;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatValue(value) {
  const text = String(value || "").trim();
  return text || "-";
}

function formatRowsForFormSubmit(rows) {
  return rows.reduce((params, row) => {
    params.append(row.label, formatValue(row.value));
    return params;
  }, new URLSearchParams());
}

function detailsText(title, rows) {
  return [
    title,
    "",
    ...rows.map((row) => row.label + ": " + formatValue(row.value))
  ].join("\n");
}

function detailsHtml(title, rows) {
  const bodyRows = rows
    .map((row) => {
      return (
        "<tr>" +
        '<td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;">' +
        escapeHtml(row.label) +
        "</td>" +
        '<td style="padding:8px 10px;border:1px solid #e5e7eb;white-space:pre-line;">' +
        escapeHtml(formatValue(row.value)) +
        "</td>" +
        "</tr>"
      );
    })
    .join("");

  return (
    '<div style="font-family:Arial,sans-serif;color:#111827;line-height:1.45;">' +
    '<h2 style="margin:0 0 16px;">' +
    escapeHtml(title) +
    "</h2>" +
    '<table style="border-collapse:collapse;width:100%;max-width:760px;">' +
    bodyRows +
    "</table>" +
    "</div>"
  );
}

async function sendViaFormSubmit(subject, rows) {
  const endpoint = "https://formsubmit.co/ajax/" + encodeURIComponent(config.notificationEmailTo);
  const body = formatRowsForFormSubmit(rows);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NOTIFICATION_TIMEOUT_MS);
  body.append("_subject", subject);
  body.append("_captcha", "false");
  body.append("_template", "table");

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error("FormSubmit notification failed with status " + response.status);
  }
}

async function sendNotification(subject, rows, replyTo) {
  if (!isEmailEnabled()) {
    await sendViaFormSubmit(subject, rows);
    return;
  }

  const title = subject;

  return getTransporter().sendMail({
    from: config.notificationEmailFrom,
    to: config.notificationEmailTo,
    replyTo: replyTo || undefined,
    subject,
    text: detailsText(title, rows),
    html: detailsHtml(title, rows)
  });
}

async function sendTestNotification(requestedBy) {
  const configSummary = getNotificationConfigSummary();
  const info = await sendNotification(
    "Teste de email - COBRAIT",
    [
      { label: "Estado", value: "Teste manual disparado pelo painel admin." },
      { label: "Pedido por", value: requestedBy || "admin" },
      { label: "Destino", value: config.notificationEmailTo },
      { label: "Data", value: new Date().toISOString() }
    ]
  );

  return {
    config: configSummary,
    messageId: info && info.messageId ? info.messageId : "",
    accepted: info && Array.isArray(info.accepted) ? info.accepted : [],
    rejected: info && Array.isArray(info.rejected) ? info.rejected : []
  };
}

async function notifyCallBookingCreated(booking) {
  await sendNotification(
    "Novo pedido de chamada - COBRAIT",
    [
      { label: "Nome", value: booking.fullName },
      { label: "Email", value: booking.email },
      { label: "Telefone", value: booking.phone },
      { label: "Empresa", value: booking.company },
      { label: "Resumo do projeto", value: booking.projectSummary },
      { label: "Data preferida", value: booking.preferredDate },
      { label: "Hora preferida", value: booking.preferredTime },
      { label: "Fuso horario", value: booking.timezone },
      { label: "Orcamento", value: booking.budgetRange },
      { label: "Servico de interesse", value: booking.serviceInterest },
      { label: "Origem", value: booking.sourceCampaign },
      { label: "Pagina", value: booking.sourcePage },
      { label: "Recebido em", value: booking.createdAt },
      { label: "ID", value: booking.id }
    ],
    booking.email
  );

  if (!config.leadConfirmationEnabled || !isEmailEnabled() || !booking.email) return;

  const isPortuguese = String(booking.sourcePage || "").startsWith("/pt/");
  const subject = isPortuguese
    ? "Recebemos o seu pedido — COBRAIT"
    : "We received your request — COBRAIT";
  const greeting = isPortuguese
    ? `Olá ${formatValue(booking.fullName)},`
    : `Hello ${formatValue(booking.fullName)},`;
  const message = isPortuguese
    ? "Recebemos o contexto do seu projeto. A nossa equipa comercial irá analisá-lo para preparar uma primeira conversa útil. Se selecionou um horário no calendário, receberá também a respetiva confirmação."
    : "We have received your project context. Our commercial team will review it to prepare a useful initial conversation. If you selected a calendar slot, you will also receive the corresponding confirmation.";
  const closing = isPortuguese
    ? "Obrigado,\nEquipa COBRAIT"
    : "Thank you,\nCOBRAIT team";

  await getTransporter().sendMail({
    from: config.notificationEmailFrom,
    to: booking.email,
    replyTo: config.notificationEmailTo,
    subject,
    text: [greeting, "", message, "", closing].join("\n"),
    html: `<div style="font-family:Arial,sans-serif;color:#111827;line-height:1.6;max-width:620px;"><p>${escapeHtml(greeting)}</p><p>${escapeHtml(message)}</p><p>${escapeHtml(closing).replace(/\n/g, "<br>")}</p></div>`
  });
}

async function notifyContactRequestCreated(contactRequest) {
  await sendNotification(
    "Novo contacto via site - COBRAIT",
    [
      { label: "Nome", value: contactRequest.fullName },
      { label: "Email", value: contactRequest.email },
      { label: "Telefone", value: contactRequest.phone },
      { label: "Empresa", value: contactRequest.company },
      { label: "Assunto", value: contactRequest.subject },
      { label: "Mensagem", value: contactRequest.message },
      { label: "Origem", value: contactRequest.sourceCampaign },
      { label: "Pagina", value: contactRequest.sourcePage },
      { label: "Recebido em", value: contactRequest.createdAt },
      { label: "ID", value: contactRequest.id }
    ],
    contactRequest.email
  );

  if (!config.leadConfirmationEnabled || !isEmailEnabled() || !contactRequest.email) return;
  const isPortuguese = String(contactRequest.sourcePage || "").startsWith("/pt/");
  const subject = isPortuguese ? "Recebemos a sua mensagem — COBRAIT" : "We received your message — COBRAIT";
  const greeting = isPortuguese ? `Olá ${formatValue(contactRequest.fullName)},` : `Hello ${formatValue(contactRequest.fullName)},`;
  const message = isPortuguese
    ? "A sua mensagem ficou guardada e será analisada pela nossa equipa comercial."
    : "Your message has been saved and will be reviewed by our commercial team.";
  const closing = isPortuguese ? "Obrigado,\nEquipa COBRAIT" : "Thank you,\nCOBRAIT team";

  await getTransporter().sendMail({
    from: config.notificationEmailFrom,
    to: contactRequest.email,
    replyTo: config.notificationEmailTo,
    subject,
    text: [greeting, "", message, "", closing].join("\n"),
    html: `<div style="font-family:Arial,sans-serif;color:#111827;line-height:1.6;max-width:620px;"><p>${escapeHtml(greeting)}</p><p>${escapeHtml(message)}</p><p>${escapeHtml(closing).replace(/\n/g, "<br>")}</p></div>`
  });
}

async function sendPasswordResetEmail(user, resetUrl) {
  if (!isEmailEnabled()) return { sent: false };
  await getTransporter().sendMail({
    from: config.notificationEmailFrom,
    to: user.email,
    replyTo: config.notificationEmailTo,
    subject: "Recuperar acesso ao painel COBRAIT",
    text: `Olá ${formatValue(user.fullName)},\n\nUtilize esta ligação para definir uma nova palavra-passe. A ligação é válida durante 30 minutos:\n${resetUrl}\n\nSe não pediu esta alteração, ignore esta mensagem.`,
    html: `<div style="font-family:Arial,sans-serif;color:#111827;line-height:1.6;max-width:620px;"><p>Olá ${escapeHtml(formatValue(user.fullName))},</p><p>Utilize a ligação seguinte para definir uma nova palavra-passe. A ligação é válida durante 30 minutos.</p><p><a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:12px 18px;color:#fff;background:#2059b5;border-radius:7px;text-decoration:none;font-weight:700;">Definir nova palavra-passe</a></p><p>Se não pediu esta alteração, ignore esta mensagem.</p></div>`
  });
  return { sent: true };
}

module.exports = {
  describeNotificationError,
  getNotificationConfigSummary,
  notifyCallBookingCreated,
  notifyContactRequestCreated,
  sendPasswordResetEmail,
  sendTestNotification
};
