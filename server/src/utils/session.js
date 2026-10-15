const jwt = require("jsonwebtoken");
const config = require("../config");

function signSessionToken(user) {
  return jwt.sign(
    {
      email: user.email,
      role: user.role,
      fullName: user.fullName
    },
    config.jwtSecret,
    {
      subject: user.id,
      expiresIn: config.jwtExpiresIn
    }
  );
}

function verifySessionToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

function signPasswordResetToken(user) {
  return jwt.sign({ type: "password-reset", email: user.email }, config.jwtSecret, { subject: user.id, expiresIn: "30m" });
}

function verifyPasswordResetToken(token) {
  const payload = jwt.verify(token, config.jwtSecret);
  if (!payload || payload.type !== "password-reset") throw new Error("Invalid password reset token");
  return payload;
}

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: config.sessionCookieSecure,
    path: "/",
    maxAge: config.sessionMaxAgeHours * 60 * 60 * 1000
  };
}

function setSessionCookie(response, token) {
  response.cookie(config.sessionCookieName, token, getCookieOptions());
}

function clearSessionCookie(response) {
  response.clearCookie(config.sessionCookieName, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.sessionCookieSecure,
    path: "/"
  });
}

module.exports = {
  clearSessionCookie,
  setSessionCookie,
  signPasswordResetToken,
  signSessionToken,
  verifyPasswordResetToken,
  verifySessionToken
};
