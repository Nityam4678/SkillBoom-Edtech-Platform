const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const User = require("../models/User")
const OTP = require("../models/OTP")
const jwt = require("jsonwebtoken")
const otpGenerator = require("otp-generator")
const mailSender = require("../utils/mailSender")
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
const Profile = require("../models/Profile")
const AuthSession = require("../models/AuthSession")
const {
  refreshCookieName,
  getCookieOptions,
  hashRefreshToken,
  createAccessToken,
  createRefreshSession,
  revokeRefreshSession,
} = require("../utils/authTokens")
require("dotenv").config()

// Signup Controller for Registering USers

exports.signup = async (req, res) => {
  try {
    // Destructure fields from the request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body
    // Check if All Details are there or not
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
      })
    }
    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password do not match. Please try again.",
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      })
    }

    // Find the most recent OTP for the email
    const otpRecord = await OTP.findOne({ email })
      .select("+otpHash attempts createdAt")
      .sort({ createdAt: -1 })
    if (!otpRecord || otpRecord.attempts >= 5) {
      // OTP not found for the email
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      })
    } else if (!(await bcrypt.compare(otp, otpRecord.otpHash))) {
      await OTP.updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } })
      // Invalid OTP
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      })
    }

    await OTP.deleteOne({ _id: otpRecord._id })

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    if (!["Student", "Instructor"].includes(accountType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account type",
      })
    }
    const approved = accountType !== "Instructor"

    // Create the Additional Profile For User
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    })
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType: accountType,
      approved: approved,
      additionalDetails: profileDetails._id,
      image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    })
    const userResponse = user.toObject()
    delete userResponse.password
    delete userResponse.token

    return res.status(201).json({
      success: true,
      user: userResponse,
      message: "User registered successfully",
    })
  } catch (error) {
  console.error("Signup error:", error);
  return res.status(500).json({
    success: false,
    message: "User cannot be registered.",
  });
}
}

// Login controller for authenticating users
exports.login = async (req, res) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body

    // Check if email or password is missing
    if (!email || !password) {
      // Return 400 Bad Request status code with error message
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      })
    }

    // Find user with provided email
    const user = await User.findOne({ email }).populate("additionalDetails")

    // If user not found with provided email
    if (!user) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is not Registered with Us Please SignUp to Continue`,
      })
    }

    // Generate JWT token and Compare Password
    if (await bcrypt.compare(password, user.password)) {
      const token = createAccessToken(user)
      const refreshSession = await createRefreshSession(user._id)
      user.password = undefined
      user.token = undefined
      res.cookie(refreshCookieName, refreshSession.token, getCookieOptions()).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      })
    } else {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      })
    }
  } catch (error) {
    console.error(error)
    // Return 500 Internal Server Error status code with error message
    return res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
    })
  }
}

exports.refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[refreshCookieName]
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token missing" })
    }

    const session = await AuthSession.findOne({
      tokenHash: hashRefreshToken(refreshToken),
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).populate("user")

    if (!session || !session.user || !session.user.active) {
      res.clearCookie(refreshCookieName, getCookieOptions())
      return res.status(401).json({ success: false, message: "Refresh token invalid" })
    }

    await revokeRefreshSession(refreshToken)
    const nextRefreshSession = await createRefreshSession(session.user._id)
    const token = createAccessToken(session.user)
    const user = session.user.toObject()
    delete user.password
    delete user.token

    return res.cookie(
      refreshCookieName,
      nextRefreshSession.token,
      getCookieOptions()
    ).status(200).json({ success: true, token, user })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Could not refresh session" })
  }
}

exports.logout = async (req, res) => {
  try {
    await revokeRefreshSession(req.cookies?.[refreshCookieName])
    res.clearCookie(refreshCookieName, getCookieOptions())
    return res.status(200).json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Could not log out" })
  }
}
// Send OTP For Email Verification
exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body
    console.log("OTP email request started")

    // Check if user is already present
    // Find user with provided email
    const checkUserPresent = await User.findOne({ email })
    // to be used in case of signup

    // If user found with provided email
    if (checkUserPresent) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      })
    }

    const genOpts = {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    }
    const otp = otpGenerator.generate(6, genOpts)
    const otpHash = await bcrypt.hash(otp, 10)
    const otpRecord = new OTP({ email, otpHash })
    otpRecord._otp = otp
    await otpRecord.save()

    console.log("OTP email request completed")

    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
    })
  } catch (error) {
    console.error("OTP email request failed", { message: error.message })
    return res.status(500).json({ success: false, message: "Could not send OTP" })
  }
}

// Controller for Changing Password
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id)

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    )
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" })
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10)
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    )

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      )
      console.log("Email sent successfully:", emailResponse.response)
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
      })
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error)
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
    })
  }
}