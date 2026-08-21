// Import the required modules
const express = require("express")
const router = express.Router()

// Import the required controllers and middleware functions
const {
  login,
  refreshAccessToken,
  logout,
  signup,
  changePassword,
} = require("../controllers/Auth")
const { auth } = require("../middlewares/auth")
const { authLimiter } = require("../middlewares/security")
const {
  loginValidation,
  signupValidation,
  changePasswordValidation,
} = require("../middlewares/validation")

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user login
router.post("/login", authLimiter, loginValidation, login)
router.post("/refresh", refreshAccessToken)
router.post("/logout", logout)

// Route for user signup
router.post("/signup", authLimiter, signupValidation, signup)

// Route for Changing the password
router.post("/changepassword", auth, authLimiter, changePasswordValidation, changePassword)

// Export the router for use in the main application
module.exports = router