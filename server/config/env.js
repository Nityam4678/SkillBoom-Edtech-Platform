const requiredVariables = [
  "PORT",
  "CLIENT_URL",
  "MONGODB_URL",
  "JWT_SECRET",
  "CLOUD_NAME",
  "API_KEY",
  "API_SECRET",
  "MAIL_HOST",
  "MAIL_USER",
  "MAIL_PASS",
  "FOLDER_NAME",
  "RAZORPAY_KEY",
  "RAZORPAY_SECRET",
]

function validateEnvironment() {
  const missing = requiredVariables.filter((name) => !process.env[name]?.trim())

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable: ${missing.join(", ")}`
    )
  }

  const port = Number(process.env.PORT)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Environment variable PORT must be a valid TCP port")
  }

  if (!process.env.MONGODB_URL.startsWith("mongodb")) {
    throw new Error("Environment variable MONGODB_URL must be a MongoDB URI")
  }

  const clientOrigins = process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
  if (
    clientOrigins.some((origin) => {
      try {
        return new URL(origin).protocol !== "http:" && new URL(origin).protocol !== "https:"
      } catch (error) {
        return true
      }
    })
  ) {
    throw new Error("Environment variable CLIENT_URL must contain valid HTTP(S) origins")
  }

  const sameSite = (process.env.COOKIE_SAME_SITE || "lax").toLowerCase()
  if (!["lax", "strict", "none"].includes(sameSite)) {
    throw new Error("Environment variable COOKIE_SAME_SITE must be lax, strict, or none")
  }

  if (!["true", "false"].includes((process.env.COOKIE_SECURE || "false").toLowerCase())) {
    throw new Error("Environment variable COOKIE_SECURE must be true or false")
  }

  const accessTokenLifetime = process.env.ACCESS_TOKEN_EXPIRES_IN
  if (!accessTokenLifetime?.trim()) {
    throw new Error("Missing required environment variable: ACCESS_TOKEN_EXPIRES_IN")
  }

  const refreshDays = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS)
  if (!Number.isFinite(refreshDays) || refreshDays <= 0) {
    throw new Error(
      "Environment variable REFRESH_TOKEN_EXPIRES_DAYS must be greater than zero"
    )
  }
}

module.exports = { validateEnvironment }
