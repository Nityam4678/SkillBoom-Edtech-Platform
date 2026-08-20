const { validationResult, body } = require("express-validator")

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
      fields: errors.array().map((error) => error.path),
    })
  }
  next()
}

const email = body("email").trim().isEmail().normalizeEmail()
const password = body("password").isString().isLength({ min: 8, max: 128 })
const confirmPassword = body("confirmPassword")
  .isString()
  .isLength({ min: 8, max: 128 })

const loginValidation = [email, body("password").isString().notEmpty(), validate]

const signupValidation = [
  body("firstName").trim().isLength({ min: 1, max: 80 }),
  body("lastName").trim().isLength({ min: 1, max: 80 }),
  email,
  password,
  confirmPassword,
  body("accountType").isIn(["Student", "Instructor"]),
  body("otp").trim().matches(/^\d{6}$/),
  validate,
]

const otpValidation = [email, validate]

const passwordResetRequestValidation = [email, validate]

const passwordResetValidation = [
  password,
  confirmPassword,
  body("token").isString().isLength({ min: 20, max: 200 }),
  validate,
]

const changePasswordValidation = [
  body("oldPassword").isString().notEmpty(),
  body("newPassword").isString().isLength({ min: 8, max: 128 }),
  validate,
]

const contactValidation = [
  email,
  body("firstname").trim().isLength({ min: 1, max: 80 }),
  body("lastname").trim().isLength({ min: 1, max: 80 }),
  body("message").trim().isLength({ min: 1, max: 4000 }),
  body("phoneNo").optional({ values: "falsy" }).trim().isLength({ max: 30 }),
  body("countrycode").optional({ values: "falsy" }).trim().isLength({ max: 10 }),
  validate,
]

const coursesValidation = [
  body("courses").isArray({ min: 1, max: 20 }),
  body("courses.*").isMongoId(),
  validate,
]

const paymentVerificationValidation = [
  body("razorpay_order_id").isString().isLength({ min: 5, max: 100 }),
  body("razorpay_payment_id").isString().isLength({ min: 5, max: 100 }),
  body("razorpay_signature").isString().isLength({ min: 20, max: 200 }),
  ...coursesValidation.slice(0, 2),
  validate,
]

module.exports = {
  validate,
  loginValidation,
  signupValidation,
  otpValidation,
  passwordResetRequestValidation,
  passwordResetValidation,
  changePasswordValidation,
  contactValidation,
  coursesValidation,
  paymentVerificationValidation,
}
