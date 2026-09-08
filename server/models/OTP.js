const mongoose = require("mongoose")

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
      select: false,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
)

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
otpSchema.index({ email: 1, createdAt: -1 })

module.exports = mongoose.model("OTP", otpSchema)
