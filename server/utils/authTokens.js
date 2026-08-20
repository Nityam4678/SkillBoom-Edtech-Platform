const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const AuthSession = require("../models/AuthSession")

const refreshCookieName = "refreshToken"

function getRefreshTokenDays() {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7)
  return Number.isFinite(days) && days > 0 ? days : 7
}

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production"
  const sameSite = process.env.COOKIE_SAME_SITE || "lax"

  return {
    httpOnly: true,
    secure: isProduction || process.env.COOKIE_SECURE === "true",
    sameSite,
    path: "/api/v1/auth",
    maxAge: getRefreshTokenDays() * 24 * 60 * 60 * 1000,
  }
}

function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex")
}

function createAccessToken(user) {
  return jwt.sign(
    { email: user.email, id: user._id, role: user.accountType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" }
  )
}

async function createRefreshSession(userId) {
  const token = crypto.randomBytes(48).toString("base64url")
  const expiresAt = new Date(
    Date.now() + getRefreshTokenDays() * 24 * 60 * 60 * 1000
  )

  await AuthSession.create({
    user: userId,
    tokenHash: hashRefreshToken(token),
    expiresAt,
  })

  return { token, expiresAt }
}

async function revokeRefreshSession(token) {
  if (!token) return

  await AuthSession.updateOne(
    { tokenHash: hashRefreshToken(token), revokedAt: null },
    { revokedAt: new Date() }
  )
}

module.exports = {
  refreshCookieName,
  getCookieOptions,
  hashRefreshToken,
  createAccessToken,
  createRefreshSession,
  revokeRefreshSession,
}
