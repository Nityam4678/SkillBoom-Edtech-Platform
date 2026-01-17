const { instance } = require("../config/razorpay")
const Course = require("../models/Course")
const crypto = require("crypto")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose")
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const CourseProgress = require("../models/CourseProgress")

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body
  const userId = req.user.id

  if (!courses || courses.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide course IDs",
    })
  }

  let total_amount = 0
  try {
    for (const course_id of courses) {
      const course = await Course.findById(course_id)
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        })
      }

      const isEnrolled = course.studentsEnrolled.some(
        (id) => id.toString() === userId.toString()
      )

      if (isEnrolled) {
        return res.status(409).json({
          success: false,
          message: "Student already enrolled",
        })
      }

      total_amount += course.price
    }

    const options = {
      amount: total_amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    }

    const paymentResponse = await instance.orders.create(options)
    return res.status(200).json({
      success: true,
      data: paymentResponse,
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Could not initiate payment",
    })
  }
}


// verify the payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courses,
    } = req.body

    const userId = req.user.id

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !courses ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      })
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      })
    }

    await enrollStudents(courses, userId)

    return res.status(200).json({
      success: true,
      message: "Payment verified & courses enrolled",
    })
  } catch (error) {
    console.error("verifyPayment error:", error)

    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  try {
    const { orderId, paymentId, amount } = req.body
    const userId = req.user.id

    if (!orderId || !paymentId || !amount || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      })
    }

    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      "Payment Received",
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )

    return res.status(200).json({
      success: true,
      message: "Payment success email sent",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not send email",
    })
  }
}


// enroll the student in the courses
const enrollStudents = async (courses, userId) => {
  if (!courses || !userId) {
    throw new Error("Courses or User ID missing")
  }

  for (const courseId of courses) {
    const enrolledCourse = await Course.findOneAndUpdate(
      { _id: courseId },
      { $addToSet: { studentsEnrolled: userId } },
      { new: true }
    )

    if (!enrolledCourse) {
      throw new Error("Course not found")
    }

    const courseProgress = await CourseProgress.create({
      courseID: courseId,
      userId,
      completedVideos: [],
    })

    const enrolledStudent = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          courses: courseId,
          courseProgress: courseProgress._id,
        },
      },
      { new: true }
    )

    try {
      await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      )
    } catch (mailError) {
    }
  }

  return true
}

