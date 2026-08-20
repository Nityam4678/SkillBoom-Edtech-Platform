const { rateLimit } = require("express-rate-limit")

const createLimiter = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
      })
    },
  })

const authLimiter = createLimiter(
  15 * 60 * 1000,
  20,
  "Too many authentication attempts. Please try again later."
)

const otpLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  "Too many OTP requests. Please try again later."
)

const passwordResetLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  "Too many password reset requests. Please try again later."
)

const contactLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many contact requests. Please try again later."
)

const paymentLimiter = createLimiter(
  15 * 60 * 1000,
  30,
  "Too many payment requests. Please try again later."
)

const uploadLimiter = createLimiter(
  15 * 60 * 1000,
  60,
  "Too many upload requests. Please try again later."
)

module.exports = {
  authLimiter,
  otpLimiter,
  passwordResetLimiter,
  contactLimiter,
  paymentLimiter,
  uploadLimiter,
}
