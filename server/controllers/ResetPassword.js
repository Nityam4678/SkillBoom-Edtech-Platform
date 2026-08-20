const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const AuthSession = require("../models/AuthSession");

exports.resetPasswordToken = async (req, res) => {
	try {
		const email = req.body.email;
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.status(200).json({
				success: true,
				message: "If the email is registered, a reset message will be sent",
			});
		}
		const token = crypto.randomBytes(32).toString("hex");
		const resetPasswordTokenHash = crypto
			.createHash("sha256")
			.update(token)
			.digest("hex");

		const updatedDetails = await User.findOneAndUpdate(
			{ email: email },
			{
				resetPasswordTokenHash,
				resetPasswordExpires: Date.now() + 3600000,
			},
			{ new: true }
		);

		const clientUrl = process.env.CLIENT_URL;
		const url = `${clientUrl}/update-password/${token}`;

		await mailSender(
			email,
			"Password Reset",
			`Your Link for email verification is ${url}. Please click this url to reset your password.`
		);

		res.json({
			success: true,
			message:
				"Email Sent Successfully, Please Check Your Email to Continue Further",
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: `Some Error in Sending the Reset Message`,
		});
	}
};

exports.resetPassword = async (req, res) => {
	try {
		const { password, confirmPassword, token } = req.body;

		if (confirmPassword !== password) {
			return res.status(400).json({
				success: false,
				message: "Password and Confirm Password Does not Match",
			});
		}
		const resetPasswordTokenHash = crypto
			.createHash("sha256")
			.update(token)
			.digest("hex");
		const userDetails = await User.findOne({
			resetPasswordTokenHash,
		}).select("+resetPasswordTokenHash");
		if (!userDetails) {
			return res.status(404).json({
				success: false,
				message: "Token is Invalid",
			});
		}
		if (!(userDetails.resetPasswordExpires > Date.now())) {
			return res.status(403).json({
				success: false,
				message: "Token is expired",
			});
		}
		const encryptedPassword = await bcrypt.hash(password, 10);
		const updatedUser = await User.findOneAndUpdate(
			{ _id: userDetails._id, resetPasswordTokenHash },
			{
				password: encryptedPassword,
				token: null,
				resetPasswordTokenHash: null,
				resetPasswordExpires: null,
			},
			{ new: true }
		);
		if (!updatedUser) {
			return res.status(404).json({ success: false, message: "Token is invalid or already used" });
		}
		await AuthSession.deleteMany({ user: userDetails._id });
		res.status(200).json({
			success: true,
			message: `Password Reset Successful`,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: `Some Error in Updating the Password`,
		});
	}
};