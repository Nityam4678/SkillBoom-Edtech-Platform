const express = require("express")
const router = express.Router()
const { contactUsController } = require("../controllers/ContactUs")
const { contactLimiter } = require("../middlewares/security")
const { contactValidation } = require("../middlewares/validation")

router.post("/contact", contactLimiter, contactValidation, contactUsController)

module.exports = router