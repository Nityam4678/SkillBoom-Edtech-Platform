import { useState, useMemo } from "react"
import { Chart, registerables } from "chart.js"
import { Pie } from "react-chartjs-2"

Chart.register(...registerables)

export default function InstructorChart({ courses }) {
  const [currChart, setCurrChart] = useState("students")

  // Stable colors (no re-randomizing on re-render)
  const colors = useMemo(
    () =>
      courses.map(
        (_, i) =>
          `hsl(${(i * 360) / courses.length}, 70%, 55%)`
      ),
    [courses]
  )

  const chartDataStudents = {
    labels: courses.map((c) => c.courseName),
    datasets: [
      {
        data: courses.map((c) => c.totalStudentsEnrolled),
        backgroundColor: colors,
        borderColor: "#ffffff",
        borderWidth: 2,
        radius: "80%",     // 🔑 KEY
      },
    ],
  }

  const chartIncomeData = {
    labels: courses.map((c) => c.courseName),
    datasets: [
      {
        data: courses.map((c) => c.totalAmountGenerated),
        backgroundColor: colors,
        borderColor: "#ffffff",
        borderWidth: 2,
        radius: "80%",     // 🔑 KEY
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false, // we control aspect via wrapper
    layout: {
      padding: {
        top: 20,
        bottom: 20,
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#CBD5E1",
          boxWidth: 14,
          padding: 16,
        },
      },
      tooltip: {
        enabled: true,
      },
    },
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      

      {/* Toggle */}
      <div className="mb-4 flex gap-6 font-semibold">
        <button
          onClick={() => setCurrChart("students")}
          className={`rounded-sm px-3 py-1 transition-all ${
            currChart === "students"
              ? "bg-richblack-700 text-yellow-50"
              : "text-yellow-400"
          }`}
        >
          Students
        </button>

        <button
          onClick={() => setCurrChart("income")}
          className={`rounded-sm px-3 py-1 transition-all ${
            currChart === "income"
              ? "bg-richblack-700 text-yellow-50"
              : "text-yellow-400"
          }`}
        >
          Income
        </button>
      </div>

      {/* Chart Container (STRICT SQUARE) */}
      <div className="relative mx-auto aspect-square w-full max-w-[420px]">
        <Pie
          data={
            currChart === "students"
              ? chartDataStudents
              : chartIncomeData
          }
          options={options}
        />
      </div>
    </div>
  )
}
