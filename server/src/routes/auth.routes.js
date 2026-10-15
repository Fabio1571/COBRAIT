const express = require("express");
const {
  createAuditLog,
  getUserByEmail,
  getUserById,
  getUserWithPasswordCheck,
  updateUser,
  updateLastLogin
} = require("../services/users.service");
const config = require("../config");
const { sendPasswordResetEmail } = require("../services/notifications.service");
const { HttpError } = require("../utils/errors");
const { clearSessionCookie, setSessionCookie, signPasswordResetToken, signSessionToken, verifyPasswordResetToken } = require("../utils/session");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/login", async (request, response, next) => {
  try {
    const email = String(request.body && request.body.email ? request.body.email : "");
    const password = String(request.body && request.body.password ? request.body.password : "");

    if (!email || !password) {
      throw new HttpError(400, "Email e password sao obrigatorios.");
    }

    const result = await getUserWithPasswordCheck(email, password);
    if (!result || !result.passwordMatches) {
      throw new HttpError(401, "Credenciais invalidas.");
    }

    if (!result.user.isActive) {
      throw new HttpError(403, "Utilizador inativo.");
    }

    await updateLastLogin(result.user.id);
    const freshUser = await getUserById(result.user.id);
    const token = signSessionToken(freshUser);

    setSessionCookie(response, token);
    await createAuditLog(freshUser.id, "auth.login", "admin_user", freshUser.id, {
      email: freshUser.email
    });

    response.json({
      user: freshUser
    });
  } catch (error) {
    next(error);
  }
});

router.post("/forgot-password", async (request, response, next) => {
  try {
    const email = String(request.body && request.body.email || "").trim().toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const user = await getUserByEmail(email);
      if (user && user.isActive) {
        const token = signPasswordResetToken(user);
        const resetUrl = `${config.siteUrl}/admin?reset=${encodeURIComponent(token)}`;
        try {
          await sendPasswordResetEmail(user, resetUrl);
        } catch (error) {
          console.error("Failed to send admin password reset email.", error);
        }
        await createAuditLog(user.id, "auth.password_reset_requested", "admin_user", user.id, {});
      }
    }
    response.json({ message: "Se existir uma conta ativa e o email estiver configurado, receberá uma ligação de recuperação." });
  } catch (error) {
    next(error);
  }
});

router.post("/reset-password", async (request, response, next) => {
  try {
    const token = String(request.body && request.body.token || "");
    const newPassword = String(request.body && request.body.newPassword || "");
    const payload = verifyPasswordResetToken(token);
    const user = await getUserById(payload.sub);
    if (!user || !user.isActive || user.email !== payload.email) throw new HttpError(400, "A ligação de recuperação é inválida ou expirou.");
    await updateUser(user.id, { password: newPassword });
    await createAuditLog(user.id, "auth.password_reset_completed", "admin_user", user.id, {});
    response.json({ ok: true });
  } catch (error) {
    if (error && (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError")) {
      next(new HttpError(400, "A ligação de recuperação é inválida ou expirou."));
      return;
    }
    next(error);
  }
});

router.post("/logout", async (request, response) => {
  clearSessionCookie(response);
  response.json({ ok: true });
});

router.get("/me", requireAuth, async (request, response) => {
  response.json({
    user: request.user
  });
});

router.post("/password", requireAuth, async (request, response, next) => {
  try {
    const currentPassword = String(request.body && request.body.currentPassword || "");
    const newPassword = String(request.body && request.body.newPassword || "");
    const verification = await getUserWithPasswordCheck(request.user.email, currentPassword);
    if (!verification || !verification.passwordMatches) {
      throw new HttpError(400, "A palavra-passe atual não está correta.");
    }
    await updateUser(request.user.id, { password: newPassword });
    await createAuditLog(request.user.id, "auth.password_change", "admin_user", request.user.id, {});
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
