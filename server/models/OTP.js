const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");
const OTPSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	otpHash: {
		type: String,
		required: true,
		select: false,
	},
	attempts: {
		type: Number,
		default: 0,
		max: 5,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
	},
});

OTPSchema.index({ email: 1, createdAt: -1 });

// Define a function to send emails
async function sendVerificationEmail(email, otp) {
	// Create a transporter to send emails

	// Define the email options

	// Send the email
	try {
		const mailResponse = await mailSender(
			email,
			"Verification Email",
			emailTemplate(otp)
		);
	} catch (error) {
		throw error;
	}
}

// Send verification email before the new OTP document is persisted
OTPSchema.pre("save", async function () {
	if (this.isNew) {
		await sendVerificationEmail(this.email, this._otp);
	}
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;