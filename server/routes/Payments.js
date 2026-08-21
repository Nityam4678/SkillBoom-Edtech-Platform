// Import the required modules
const express = require("express")
const router = express.Router()

const { capturePayment, verifyPayment } = require("../controllers/Payments")
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")
const { paymentLimiter } = require("../middlewares/security")
const { coursesValidation, paymentVerificationValidation } = require("../middlewares/validation")
router.post("/capturePayment", auth, isStudent, paymentLimiter, coursesValidation, capturePayment)
router.post("/verifyPayment", auth, isStudent, paymentLimiter, paymentVerificationValidation, verifyPayment)

module.exports = router