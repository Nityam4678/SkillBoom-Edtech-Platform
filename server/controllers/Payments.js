const { instance } = require("../config/razorpay")
const Course = require("../models/Course")
const crypto = require("crypto")
const User = require("../models/User")
const mongoose = require("mongoose")
const CourseProgress = require("../models/CourseProgress")
const PaymentOrder = require("../models/PaymentOrder")

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body
  const userId = req.user.id

  if (!Array.isArray(courses) || courses.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide course IDs",
    })
  }

  const courseIds = [...new Set(courses.map((courseId) => String(courseId)))]
  let total_amount = 0
  try {
    for (const course_id of courseIds) {
      if (!mongoose.Types.ObjectId.isValid(course_id)) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        })
      }
      const course = await Course.findOne({
        _id: course_id,
        status: "Published",
      })
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

    const amount = total_amount * 100
    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: String(userId),
        courses: courseIds.join(","),
      },
    }

    const paymentResponse = await instance.orders.create(options)
    await PaymentOrder.create({
      orderId: paymentResponse.id,
      user: userId,
      courses: courseIds,
      amount,
      currency: "INR",
    })
    return res.status(200).json({
      success: true,
      data: paymentResponse,
    })

  } catch (error) {
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
      !Array.isArray(courses) ||
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

    const expectedSignatureBuffer = Buffer.from(expectedSignature, "hex")
    const receivedSignatureBuffer = Buffer.from(razorpay_signature, "hex")
    if (
      expectedSignatureBuffer.length !== receivedSignatureBuffer.length ||
      !crypto.timingSafeEqual(expectedSignatureBuffer, receivedSignatureBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      })
    }

    const paymentOrder = await PaymentOrder.findOne({
      orderId: razorpay_order_id,
      user: userId,
    })
    if (!paymentOrder) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found",
      })
    }

    const requestedCourses = [...new Set(courses.map((courseId) => String(courseId)))].sort()
    const orderedCourses = paymentOrder.courses.map((courseId) => String(courseId)).sort()
    if (
      requestedCourses.length !== orderedCourses.length ||
      requestedCourses.some((courseId, index) => courseId !== orderedCourses[index])
    ) {
      return res.status(403).json({
        success: false,
        message: "Payment does not match this order",
      })
    }

    if (paymentOrder.status === "Paid") {
      if (paymentOrder.paymentId !== razorpay_payment_id) {
        return res.status(409).json({
          success: false,
          message: "Payment order was already verified",
        })
      }
      return res.status(200).json({
        success: true,
        message: "Payment already verified & courses enrolled",
      })
    }

    const order = await instance.orders.fetch(razorpay_order_id)
    if (
      order.id !== paymentOrder.orderId ||
      order.amount !== paymentOrder.amount ||
      order.currency !== paymentOrder.currency ||
      requestedCourses.length !== orderedCourses.length ||
      requestedCourses.some((courseId, index) => courseId !== orderedCourses[index])
    ) {
      return res.status(403).json({
        success: false,
        message: "Payment does not match this order",
      })
    }

    const payment = await instance.payments.fetch(razorpay_payment_id)
    if (
      payment.order_id !== paymentOrder.orderId ||
      payment.amount !== paymentOrder.amount ||
      payment.currency !== paymentOrder.currency ||
      payment.status !== "captured"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment was not captured",
      })
    }

    await enrollStudents(orderedCourses, userId)
    await PaymentOrder.findOneAndUpdate(
      { _id: paymentOrder._id, status: "Pending" },
      {
        status: "Paid",
        paymentId: razorpay_payment_id,
        verifiedAt: new Date(),
      }
    )

    return res.status(200).json({
      success: true,
      message: "Payment verified & courses enrolled",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not verify payment",
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

    const courseProgress = await CourseProgress.findOneAndUpdate(
      { courseID: courseId, userId },
      { $setOnInsert: { completedVideos: [] } },
      { new: true, upsert: true }
    )

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

  }

  return true
}

