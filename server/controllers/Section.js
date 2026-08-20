const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");
const mongoose = require("mongoose");
// CREATE a new section
exports.createSection = async (req, res) => {
	try {
		// Extract the required properties from the request body
		const { sectionName, courseId } = req.body;
		if (!mongoose.Types.ObjectId.isValid(courseId)) {
			return res.status(404).json({ success: false, message: "Course not found" });
		}

		// Validate the input
		if (!sectionName || !courseId) {
			return res.status(400).json({
				success: false,
				message: "Missing required properties",
			});
		}
		const course = await Course.findOne({ _id: courseId, instructor: req.user.id });
		if (!course) {
			return res.status(404).json({ success: false, message: "Course not found" });
		}

		// Create a new section with the given name
		const newSection = await Section.create({ sectionName });

		// Add the new section to the course's content array
		const updatedCourse = await Course.findByIdAndUpdate(
			courseId,
			{
				$push: {
					courseContent: newSection._id,
				},
			},
			{ new: true }
		)
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

		// Return the updated course object in the response
		res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourse,
		});
	} catch (error) {
		// Handle errors
		res.status(500).json({
			success: false,
			message: "Internal server error",
			message: "Internal server error",
		});
	}
};

// UPDATE a section
exports.updateSection = async (req, res) => {
	try {
		const { sectionName, sectionId,courseId } = req.body;
		if (!mongoose.Types.ObjectId.isValid(sectionId) || !mongoose.Types.ObjectId.isValid(courseId)) {
			return res.status(404).json({ success: false, message: "Section not found" });
		}
		const course = await Course.findOne({
			_id: courseId,
			instructor: req.user.id,
			courseContent: sectionId,
		});
		if (!course) {
			return res.status(404).json({ success: false, message: "Section not found" });
		}
		const section = await Section.findByIdAndUpdate(
			sectionId,
			{ sectionName },
			{ new: true }
		);

		const updatedCourse = await Course.findById(courseId)
		.populate({
			path:"courseContent",
			populate:{
				path:"subSection",
			},
		})
		.exec();

		res.status(200).json({
			success: true,
			message: section,
			data:updatedCourse,
		});
	} catch (error) {
		console.error("Error updating section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// DELETE a section
exports.deleteSection = async (req, res) => {
	try {

		const { sectionId, courseId }  = req.body;
		if (!mongoose.Types.ObjectId.isValid(sectionId) || !mongoose.Types.ObjectId.isValid(courseId)) {
			return res.status(404).json({ success: false, message: "Section not found" });
		}
		const course = await Course.findOne({
			_id: courseId,
			instructor: req.user.id,
			courseContent: sectionId,
		});
		if (!course) {
			return res.status(404).json({ success: false, message: "Section not found" });
		}
		await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})
		const section = await Section.findById(sectionId);
		 console.log(sectionId, courseId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

		//delete sub section
		await SubSection.deleteMany({_id: {$in: section.subSection}});

		await Section.findByIdAndDelete(sectionId);

		//find the updated course and return 
		const updatedCourse = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();

		res.status(200).json({
			success:true,
			message:"Section deleted",
			data:updatedCourse
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};   