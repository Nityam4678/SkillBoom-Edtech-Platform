const mailSender = require("../utils/mailSender")
const User = require("../models/User")

exports.testEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("email")
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      })
    }

    await mailSender(
      user.email,
      "SkillBoom email test",
      "This is a protected SkillBoom email delivery test."
    )

    return res.status(200).json({
      success: true,
      message: "Test email sent successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not send test email",
    })
  }
}