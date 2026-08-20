const mongoose = require("mongoose")

const paymentOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
      index: true,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Course",
      },
    ],
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      enum: ["INR"],
    },
    paymentId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
      index: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

paymentOrderSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model("PaymentOrder", paymentOrderSchema)
