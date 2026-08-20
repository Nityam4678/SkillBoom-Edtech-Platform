const Profile = require("../models/Profile")
const CourseProgress = require("../models/CourseProgress")

const Course = require("../models/Course")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const mongoose = require("mongoose")
const { convertSecondsToDuration } = require("../utils/secToDuration")
// Method for updating a profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      about,
      contactNumber,
      gender,
    } = req.body
    const id = req.user.id

    // Find the profile by id
    const userDetails = await User.findById(id)
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }
    
    if (!userDetails.additionalDetails) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      })
    }
    
    const profile = await Profile.findById(userDetails.additionalDetails)
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      })
    }

    const userUpdates = {}
    if (firstName !== undefined) userUpdates.firstName = firstName
    if (lastName !== undefined) userUpdates.lastName = lastName
    const user = await User.findByIdAndUpdate(id, userUpdates, { new: true })
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Update the profile fields
    if (dateOfBirth !== undefined) profile.dateOfBirth = dateOfBirth
    if (about !== undefined) profile.about = about
    if (contactNumber !== undefined) profile.contactNumber = contactNumber
    if (gender !== undefined) profile.gender = gender

    // Save the updated profile
    await profile.save()

    // Find the updated user details
    const updatedUserDetails = await User.findById(id)
      .select("-password -token")
      .populate("additionalDetails")
      .exec()

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        updatedUserDetails,
      })
  } catch (error) {
     console.log(error)
    return res.status(500).json({
      success: false,
      message: "Could not update profile",
    })
  }
}

exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id
     console.log(id)
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }
    // Delete Assosiated Profile with the User
    if (user.additionalDetails) {
      await Profile.findByIdAndDelete(user.additionalDetails)
    }
    for (const courseId of user.courses) {
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnrolled: id } },
        { new: true }
      )
    }
    // Now Delete User
    await User.findByIdAndDelete(id)
    await CourseProgress.deleteMany({ userId: id })
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
     console.log(error)
    res
      .status(500)
      .json({ success: false, message: "User Cannot be deleted successfully" })
  }
}

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id
    const userDetails = await User.findById(id)
      .select("-password -token")
      .populate("additionalDetails")
      .exec()
    
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }
    
    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not fetch user details",
    })
  }
}

exports.updateDisplayPicture = async (req, res) => {
  try {
    if (!req.files || !req.files.displayPicture) {
      return res.status(400).json({
        success: false,
        message: "Display picture is required",
      })
    }
    
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      { image: image.secure_url },
      { new: true }
    )
    
    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }
    
    const profileResponse = updatedProfile.toObject()
    delete profileResponse.password
    delete profileResponse.token
    res.status(200).json({
      success: true,
      message: `Image Updated successfully`,
      data: profileResponse,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not update display picture",
    })
  }
}

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()
    
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }
    
    userDetails = userDetails.toObject()
    
    // Check if courses exist and is an array
    if (!userDetails.courses || !Array.isArray(userDetails.courses)) {
      return res.status(200).json({
        success: true,
        data: [],
      })
    }
    
    const courseIds = userDetails.courses.map((course) => course._id)
    const progressRecords = await CourseProgress.find({
      userId,
      courseID: { $in: courseIds },
    }).select("courseID completedVideos").lean()
    const progressByCourse = new Map(
      progressRecords.map((progress) => [String(progress.courseID), progress])
    )

    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      
      // Check if courseContent exists and is an array
      if (!userDetails.courses[i].courseContent || !Array.isArray(userDetails.courses[i].courseContent)) {
        userDetails.courses[i].totalDuration = "00:00:00"
        userDetails.courses[i].progressPercentage = 0
        continue
      }
      
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        // Check if subSection exists and is an array
        if (userDetails.courses[i].courseContent[j].subSection && Array.isArray(userDetails.courses[i].courseContent[j].subSection)) {
          totalDurationInSeconds += userDetails.courses[i].courseContent[
            j
          ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration || 0), 0)
          SubsectionLength += userDetails.courses[i].courseContent[j].subSection.length
        }
      }
      userDetails.courses[i].totalDuration = convertSecondsToDuration(
        totalDurationInSeconds
      )
      let courseProgressCount = progressByCourse.get(String(userDetails.courses[i]._id))
      courseProgressCount = courseProgressCount?.completedVideos?.length || 0
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not fetch enrolled courses",
    })
  }
}

exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnrolled.length
      const totalAmountGenerated = totalStudentsEnrolled * course.price

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      }

      return courseDataWithStats
    })

    res.status(200).json({ courses: courseData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Internal Server Error" })
  }
}