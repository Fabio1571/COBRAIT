const express = require("express");
const config = require("../config");
const { requireAuth, requireEditor } = require("../middleware/auth");
const { createAuditLog, getUserById } = require("../services/users.service");
const {
  getSiteContentRevision,
  getSiteContentEntry,
  listSiteContentRevisions,
  listSiteContentEntries,
  upsertSiteContentEntry
} = require("../services/content.service");
const {
  archiveBuilderPage,
  duplicateBuilderPage,
  listBuilderPages,
  normalizeBuilderPage,
  upsertBuilderPage
} = require("../services/page-builder.service");
const { renderBuilderPage } = require("../services/page-builder.renderer");
const {
  describeNotificationError,
  getNotificationConfigSummary,
  sendTestNotification
} = require("../services/notifications.service");
const { listMedia, saveMedia } = require("../services/media.service");
const { isZohoEnabled } = require("../services/zoho.service");
const { HttpError } = require("../utils/errors");

const router = express.Router();

router.use(requireAuth, requireEditor);

router.get("/integrations", async (_request, response) => {
  const notification = getNotificationConfigSummary();
  const globalEntry = await getSiteContentEntry("v2.global");
  const managedCalendarUrl = String(globalEntry && globalEntry.content && globalEntry.content["calendar.url"] || "").trim();
  response.json({
    integrations: {
      smtp: { configured: Boolean(config.smtpHost && config.smtpUser && config.smtpPassword), host: config.smtpHost || "", destination: config.notificationEmailTo || "", warnings: notification.warnings || [] },
      zoho: { configured: isZohoEnabled(), region: config.zohoApiDomain, module: config.zohoLeadModule },
      calendar: { configured: Boolean((managedCalendarUrl || config.calBookingUrl) && config.calWebhookSecret), publicUrlConfigured: Boolean(managedCalendarUrl || config.calBookingUrl), webhookConfigured: Boolean(config.calWebhookSecret) },
      storage: { mode: config.storageMode, database: config.storageMode === "file" ? "Ficheiro local" : config.databaseClient }
    }
  });
});

router.get("/media", async (_request, response, next) => {
  try {
    response.json({ media: listMedia() });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/media",
  express.raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "5mb" }),
  async (request, response, next) => {
    try {
      const item = saveMedia(request.body, {
        alt: request.query.alt,
        mimeType: request.get("content-type"),
        originalName: request.query.filename
      }, request.user.id);
      await createAuditLog(request.user.id, "media.create", "media", item.id, {
        mimeType: item.mimeType,
        originalName: item.originalName,
        size: item.size
      });
      response.status(201).json({ item });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/site-content", async (request, response, next) => {
  try {
    const contentEntries = await listSiteContentEntries();
    response.json({ contentEntries });
  } catch (error) {
    next(error);
  }
});

router.put("/site-content/:pageKey([a-z0-9._-]+)", async (request, response, next) => {
  try {
    const contentEntry = await upsertSiteContentEntry(
      request.params.pageKey,
      (request.body && request.body.content) || {},
      request.user.id
    );

    await createAuditLog(request.user.id, "site_content.upsert", "site_content", contentEntry.pageKey, {
      pageKey: contentEntry.pageKey,
      fieldCount: Object.keys(contentEntry.content || {}).length
    });

    response.json({ contentEntry });
  } catch (error) {
    next(error);
  }
});

router.get("/site-content/:pageKey([a-z0-9._-]+)/revisions", async (request, response, next) => {
  try {
    const revisions = await listSiteContentRevisions(request.params.pageKey, request.query.limit);
    const withActors = await Promise.all(revisions.map(async (revision) => {
      const actor = revision.createdBy ? await getUserById(revision.createdBy) : null;
      return { ...revision, actorName: actor ? actor.fullName : "Sistema" };
    }));
    response.json({ revisions: withActors });
  } catch (error) {
    next(error);
  }
});

router.post("/site-content/:pageKey([a-z0-9._-]+)/revisions/:revisionId/restore", async (request, response, next) => {
  try {
    const revision = await getSiteContentRevision(request.params.pageKey, request.params.revisionId);
    if (!revision) throw new HttpError(404, "Versao nao encontrada.");
    const contentEntry = await upsertSiteContentEntry(request.params.pageKey, revision.content, request.user.id);
    await createAuditLog(request.user.id, "site_content.restore", "site_content", contentEntry.pageKey, {
      pageKey: contentEntry.pageKey,
      revisionId: revision.id
    });
    response.json({ contentEntry, restoredRevision: revision });
  } catch (error) {
    next(error);
  }
});

router.get("/site-pages", async (request, response, next) => {
  try {
    const pages = await listBuilderPages();
    response.json({ pages });
  } catch (error) {
    next(error);
  }
});

router.post("/site-pages/preview", async (request, response, next) => {
  try {
    const page = normalizeBuilderPage(request.body || {}, (request.body && request.body.slug) || "preview");
    response.type("html").send(renderBuilderPage(page, { preview: true }));
  } catch (error) {
    next(error);
  }
});

router.put("/site-pages/:slug([a-z0-9-]+)", async (request, response, next) => {
  try {
    const page = await upsertBuilderPage(request.params.slug, request.body || {}, request.user.id);

    await createAuditLog(request.user.id, "site_pages.upsert", "site_page", page.slug, {
      slug: page.slug,
      status: page.status,
      blockCount: Array.isArray(page.blocks) ? page.blocks.length : 0
    });

    response.json({ page });
  } catch (error) {
    next(error);
  }
});

router.post("/site-pages/:slug([a-z0-9-]+)/duplicate", async (request, response, next) => {
  try {
    const page = await duplicateBuilderPage(request.params.slug, request.user.id);
    await createAuditLog(request.user.id, "site_pages.duplicate", "site_page", page.slug, {
      sourceSlug: request.params.slug,
      duplicateSlug: page.slug
    });
    response.status(201).json({ page });
  } catch (error) {
    next(error);
  }
});

router.post("/site-pages/:slug([a-z0-9-]+)/archive", async (request, response, next) => {
  try {
    const page = await archiveBuilderPage(request.params.slug, request.user.id);
    await createAuditLog(request.user.id, "site_pages.archive", "site_page", page.slug, { slug: page.slug });
    response.json({ page });
  } catch (error) {
    next(error);
  }
});

router.post("/notification-test", async (request, response) => {
  try {
    const result = await sendTestNotification(request.user && request.user.email);

    response.json({
      ok: true,
      message: "Email de teste enviado.",
      result
    });
  } catch (error) {
    response.status(502).json({
      ok: false,
      message: "Falha ao enviar email de teste.",
      config: getNotificationConfigSummary(),
      error: describeNotificationError(error)
    });
  }
});

module.exports = router;
