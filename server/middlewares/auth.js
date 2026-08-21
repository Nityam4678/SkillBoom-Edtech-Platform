// Importing required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
// Configuring dotenv to load environment variables from .env file
dotenv.config();

// This function is used as middleware to authenticate user requests
exports.auth = async (req, res, next) => {
	try {
		const authorization = req.header("Authorization");
		const token = authorization && authorization.startsWith("Bearer ")
			? authorization.slice(7)
			: null;

		// If JWT is missing, return 401 Unauthorized response
		if (!token) {
			return res.status(401).json({ success: false, message: `Token Missing` });
		}

		try {
			// Verifying the JWT using the secret key stored in environment variables
			const decode = await jwt.verify(token, process.env.JWT_SECRET);
			// Storing the decoded JWT payload in the request object for further use
			req.user = decode;
		} catch (error) {
			if (error.name === "TokenExpiredError") {
				return res.status(401).json({
					success: false,
					message: "Access token expired",
					code: "ACCESS_TOKEN_EXPIRED",
				});
			}
			return res.status(401).json({
				success: false,
				message: "Access token invalid",
				code: "ACCESS_TOKEN_INVALID",
			});
		}

		// If JWT is valid, move on to the next middleware or request handler
		next();
	} catch (error) {
		// If there is an error during the authentication process, return 401 Unauthorized response
		return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
		});
	}
};
exports.isStudent = async (req, res, next) => {
	try {
		const userDetails = await User.findById(req.user.id);

		if (!userDetails) {
			return res.status(401).json({
				success: false,
				message: "User is not authenticated",
			});
		}
		if (userDetails.accountType !== "Student") {
			return res.status(403).json({
				success: false,
				message: "This is a Protected Route for Students",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
exports.isAdmin = async (req, res, next) => {
	try {
		const userDetails = await User.findById(req.user.id);

		if (!userDetails) {
			return res.status(401).json({
				success: false,
				message: "User is not authenticated",
			});
		}
		if (userDetails.accountType !== "Admin") {
			return res.status(403).json({
				success: false,
				message: "This is a Protected Route for Admin",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
exports.isInstructor = async (req, res, next) => {
	try {
		const userDetails = await User.findById(req.user.id);

		if (
			!userDetails
		) {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Instructor",
			});
		}
		if (userDetails.accountType !== "Instructor") {
			return res.status(403).json({
				success: false,
				message: "This is a Protected Route for Instructor",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};