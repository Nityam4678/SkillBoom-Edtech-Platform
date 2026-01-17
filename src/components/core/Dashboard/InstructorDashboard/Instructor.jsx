import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { fetchInstructorCourses } from "../../../../services/operations/courseDetailsAPI"
import { getInstructorData } from "../../../../services/operations/profileAPI"
import InstructorChart from "./InstructorChart"
import { Link } from "react-router-dom"

export default function Instructor() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const [loading, setLoading] = useState(false)
  const [instructorData, setInstructorData] = useState([])
  const [courses, setCourses] = useState([])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const instructorApiData = await getInstructorData(token)
      const result = await fetchInstructorCourses(token)

      if (instructorApiData?.length) setInstructorData(instructorApiData)
      if (result) setCourses(result)

      setLoading(false)
    })()
  }, [token])

  const totalAmount = instructorData.reduce(
    (acc, curr) => acc + curr.totalAmountGenerated,
    0
  )

  const totalStudents = instructorData.reduce(
    (acc, curr) => acc + curr.totalStudentsEnrolled,
    0
  )

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-richblack-5">
          Hi {user?.firstName} 👋
        </h1>
        <p className="text-richblack-200">
          Let's start something new
        </p>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : courses.length > 0 ? (
        <>
          {/* ================= CHART + STATS ================= */}
          <div className="flex flex-col gap-4 lg:flex-row">

            {/* CHART CARD */}
            <div className="flex-1 rounded-md bg-richblack-800 p-6">
              <p className="mb-4 text-lg font-bold text-richblack-5">
                Visualize
              </p>

              {totalStudents > 0 || totalAmount > 0 ? (
                <div className="mx-auto flex w-full max-w-[420px] items-center justify-center aspect-square overflow-hidden">
                  <InstructorChart courses={instructorData} />
                </div>
              ) : (
                <p className="text-richblack-200">
                  Not Enough Data To Visualize
                </p>
              )}
            </div>

            {/* STATISTICS */}
            <div className="w-full lg:w-[280px] rounded-md bg-richblack-800 p-6">
              <p className="text-lg font-bold text-richblack-5">
                Statistics
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-richblack-200">Total Courses</p>
                  <p className="text-3xl font-semibold text-richblack-50">
                    {courses.length}
                  </p>
                </div>

                <div>
                  <p className="text-richblack-200">Total Students</p>
                  <p className="text-3xl font-semibold text-richblack-50">
                    {totalStudents}
                  </p>
                </div>

                <div>
                  <p className="text-richblack-200">Total Income</p>
                  <p className="text-3xl font-semibold text-richblack-50">
                    Rs. {totalAmount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= COURSES ================= */}
          <div className="rounded-md bg-richblack-800 p-6">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-richblack-5">
                Your Courses
              </p>
              <Link to="/dashboard/my-courses">
                <p className="text-xs font-semibold text-yellow-50">
                  View All
                </p>
              </Link>
            </div>

            <div className="mt-4 grid gap-6 lg:grid-cols-3">
              {courses.slice(0, 3).map((course) => (
                <div key={course._id}>
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="h-[200px] w-full rounded-md object-cover"
                  />
                  <p className="mt-2 text-sm font-medium text-richblack-50">
                    {course.courseName}
                  </p>
                  <p className="text-xs text-richblack-300">
                    {course.studentsEnrolled.length} students | Rs. {course.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-md bg-richblack-800 p-10 text-center">
          <p className="text-2xl font-bold text-richblack-5">
            You have not created any courses yet
          </p>
          <Link to="/dashboard/add-course">
            <p className="mt-2 font-semibold text-yellow-50">
              Create a course
            </p>
          </Link>
        </div>
      )}
    </div>
  )
}
