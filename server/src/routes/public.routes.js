const express = require("express");
const crypto = require("crypto");
const config = require("../config");
const { createAuditLog } = require("../services/users.service");
const { getSiteContentEntry } = require("../services/content.service");
const { createCallBooking, createContactRequest, syncCallBookingFromCalendar } = require("../services/ops.service");
const { notifyCallBookingCreated, notifyContactRequestCreated } = require("../services/notifications.service");
const { syncCallBookingToZoho, syncContactRequestToZoho } = require("../services/zoho.service");

const router = express.Router();

function hasValidCalSignature(request) {
  if (!config.calWebhookSecret || !request.rawBody) return false;
  const received = String(request.get("x-cal-signature-256") || "").trim().toLowerCase();
  const expected = crypto.createHmac("sha256", config.calWebhookSecret).update(request.rawBody).digest("hex");
  if (!/^[a-f0-9]{64}$/.test(received)) return false;
  return crypto.timingSafeEqual(Buffer.from(received, "hex"), Buffer.from(expected, "hex"));
}

function firstValue(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim()) return value;
  }
  return null;
}

function calWebhookFields(body) {
  const trigger = String(body && body.triggerEvent || "").toUpperCase();
  const payload = body && body.payload && typeof body.payload === "object" ? body.payload : (body || {});
  const responses = payload.responses || {};
  const metadata = payload.metadata || {};
  const attendee = Array.isArray(payload.attendees) ? payload.attendees[0] || {} : {};
  const status = trigger.includes("CANCEL") || trigger.includes("REJECT")
    ? "cancelled"
    : trigger.includes("BOOKING") || trigger.includes("INVITEE")
      ? "scheduled"
      : undefined;
  return {
    id: firstValue(metadata.leadId, metadata.lead_id, responses.leadId && responses.leadId.value),
    email: firstValue(attendee.email, payload.booker && payload.booker.email, responses.email && responses.email.value, payload.email),
    meetingAt: firstValue(payload.startTime, payload.start_time, payload.event && payload.event.start_time),
    meetingUrl: firstValue(payload.meetingUrl, payload.meeting_url, payload.videoCallData && payload.videoCallData.url, payload.location),
    status
  };
}

function queueNotification(sender, failureMessage) {
  if (config.notificationsDisabled) return;
  setImmediate(async () => {
    try {
      await sender();
    } catch (error) {
      console.error(failureMessage, error);
    }
  });
}

function queueCrmSync(sender, failureMessage) {
  setImmediate(async () => {
    try {
      await sender();
    } catch (error) {
      console.error(failureMessage, error);
    }
  });
}

router.get("/site-content/:pageKey([a-z0-9._-]+)", async (request, response, next) => {
  try {
    if (String(request.params.pageKey || "").startsWith("draft.")) {
      response.status(404).json({ error: "Conteudo nao encontrado." });
      return;
    }
    const contentEntry = await getSiteContentEntry(request.params.pageKey);
    response.json({
      contentEntry: contentEntry || {
        pageKey: request.params.pageKey,
        content: {},
        updatedBy: null,
        createdAt: null,
        updatedAt: null
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/contact-requests", async (request, response, next) => {
  try {
    if (String(request.body && request.body.website || "").trim()) {
      response.status(201).json({ contactRequest: null, notificationQueued: false });
      return;
    }
    const contactRequest = await createContactRequest(request.body || {});

    await createAuditLog(null, "contact_requests.create", "contact_request", contactRequest.id, {
      email: contactRequest.email,
      sourcePage: contactRequest.sourcePage
    });

    queueNotification(
      () => notifyContactRequestCreated(contactRequest),
      "Failed to send contact request notification."
    );
    queueCrmSync(
      () => syncContactRequestToZoho(contactRequest),
      "Failed to sync contact request with Zoho CRM."
    );

    response.status(201).json({ contactRequest, notificationQueued: true });
  } catch (error) {
    next(error);
  }
});

router.post("/call-bookings", async (request, response, next) => {
  try {
    if (String(request.body && request.body.website || "").trim()) {
      response.status(201).json({ callBooking: null, notificationQueued: false });
      return;
    }
    const callBooking = await createCallBooking(request.body || {});

    await createAuditLog(null, "call_bookings.create", "call_booking", callBooking.id, {
      email: callBooking.email,
      serviceInterest: callBooking.serviceInterest
    });

    queueNotification(
      () => notifyCallBookingCreated(callBooking),
      "Failed to send call booking notification."
    );
    queueCrmSync(
      () => syncCallBookingToZoho(callBooking),
      "Failed to sync call booking with Zoho CRM."
    );

    response.status(201).json({ callBooking, notificationQueued: true });
  } catch (error) {
    next(error);
  }
});

router.post("/calendar/calcom/webhook", async (request, response, next) => {
  try {
    if (!config.calWebhookSecret) {
      response.status(503).json({ message: "Integração Cal.com ainda não configurada." });
      return;
    }
    if (!hasValidCalSignature(request)) {
      response.status(401).json({ message: "Assinatura de webhook inválida." });
      return;
    }
    const fields = calWebhookFields(request.body || {});
    const callBooking = await syncCallBookingFromCalendar(fields);
    response.status(callBooking ? 200 : 202).json({ ok: true, matched: Boolean(callBooking) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
