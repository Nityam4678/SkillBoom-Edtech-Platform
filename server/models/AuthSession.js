const mongoose = require("mongoose")

const authSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

authSessionSchema.index({ user: 1, revokedAt: 1 })

module.exports = mongoose.model("AuthSession", authSessionSchema)
