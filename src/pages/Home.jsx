// Icons Import
import { FaArrowRight } from "react-icons/fa"
import { Link } from "react-router-dom"

// Image and Video Import
import Banner from "../assets/Images/banner.mp4"

// Component Imports
import Footer from "../components/common/Footer"
import ReviewSlider from "../components/common/ReviewSlider"
import CTAButton from "../components/core/HomePage/Button"
import CodeBlocks from "../components/core/HomePage/CodeBlocks"
import ExploreMore from "../components/core/HomePage/ExploreMore"
import HighlightText from "../components/core/HomePage/HighlightText"
import InstructorSection from "../components/core/HomePage/InstructorSection"
import LearningLanguageSection from "../components/core/HomePage/LearningLanguageSection"
import TimelineSection from "../components/core/HomePage/TimelineSection"

function Home() {
  return (
    <div className="home-background-wrapper bg-gradient-to-br from-richblack-900 via-richblack-800 to-richblack-900">

      {/* ================= SECTION 1 ================= */}
      <div className="relative mx-auto flex w-11/12 max-w-maxContent flex-col items-center gap-10 text-white">

        {/* Become Instructor */}
        <Link to={"/signup"}>
          <div className="group mx-auto mt-16 w-fit rounded-full 
            bg-white/10 backdrop-blur-md border border-white/10
            p-1 font-bold text-richblack-200 shadow-lg
            transition-all duration-300 hover:scale-95 hover:bg-white/15">
            <div className="flex items-center gap-2 rounded-full px-10 py-[6px]">
              <p>Become an Instructor</p>
              <FaArrowRight />
            </div>
          </div>
        </Link>

        {/* Heading */}
        <div className="text-center text-4xl lg:text-5xl font-semibold tracking-tight">
          Empower Your Future with{" "}
          <HighlightText text={"Coding Skills"} />
        </div>

        {/* Sub Heading */}
        <div className="w-[85%] text-center text-lg text-richblack-300 leading-relaxed">
          With our online coding courses, you can learn at your own pace, from
          anywhere in the world, and get access to hands-on projects, quizzes,
          and personalized feedback from instructors.
        </div>

        {/* CTA Buttons */}
        <div className="mt-6 flex gap-7">
          <CTAButton active={true} linkto={"/signup"}>
            Learn More
          </CTAButton>
          <CTAButton active={false} linkto={"/login"}>
            Book a Demo
          </CTAButton>
        </div>

        {/* Video */}
        <div className="mx-3 my-10 rounded-2xl overflow-hidden
          bg-white/5 backdrop-blur-lg border border-white/10
          shadow-[0_20px_60px_rgba(0,255,255,0.15)]">
          <video muted loop autoPlay className="rounded-2xl">
            <source src={Banner} type="video/mp4" />
          </video>
        </div>

        {/* Code Sections */}
        <CodeBlocks
          position={"lg:flex-row"}
          heading={
            <div className="text-4xl font-semibold">
              Unlock your <HighlightText text={"coding potential"} />
            </div>
          }
          subheading={
            "Our courses are designed and taught by industry experts with real-world experience."
          }
          ctabtn1={{ btnText: "Try it Yourself", link: "/signup", active: true }}
          ctabtn2={{ btnText: "Learn More", link: "/signup", active: false }}
          codeColor={"text-yellow-25"}
          codeblock={`<!DOCTYPE html>
<html>
<body>
<h1>Hello World</h1>
</body>
</html>`}
          backgroundGradient={<div className="codeblock1 absolute opacity-60"></div>}
        />

        <CodeBlocks
          position={"lg:flex-row-reverse"}
          heading={
            <div className="text-4xl font-semibold">
              Start <HighlightText text={"coding in seconds"} />
            </div>
          }
          subheading={
            "Write real code from your very first lesson."
          }
          ctabtn1={{ btnText: "Continue Lesson", link: "/signup", active: true }}
          ctabtn2={{ btnText: "Learn More", link: "/signup", active: false }}
          codeColor={"text-white"}
          codeblock={`import React from "react";
const App = () => <div>Hello</div>;
export default App;`}
          backgroundGradient={<div className="codeblock2 absolute opacity-60"></div>}
        />

        <ExploreMore />
      </div>

      <div className="relative bg-gradient-to-b from-pure-greys-5 to-white text-richblack-700">

        <div className="homepage_bg min-h-[420px]">
          <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center gap-8 pt-28">
            <div className="flex gap-7 text-white">
              <CTAButton active={true} linkto={"/signup"}>
                <div className="flex items-center gap-2">
                  Explore Full Catalog <FaArrowRight />
                </div>
              </CTAButton>
              <CTAButton active={false} linkto={"/login"}>
                Learn More
              </CTAButton>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-[-40px] flex w-11/12 max-w-maxContent flex-col gap-12">

          <div className="flex flex-col gap-8 lg:flex-row justify- around">
            <div className="text-4xl font-semibold lg:w-[45%]">
              Get the skills you need for a{" "}
              <HighlightText text={"job that is in demand."} />
            </div>

            <div className="lg:w-[40%] flex flex-col gap-10">
              <p>
                Today’s job market requires more than just knowledge — it
                demands real skills.
              </p>
              <CTAButton active={true} linkto={"/signup"}>
                Learn More
              </CTAButton>
            </div>
          </div>

          <TimelineSection />
          <LearningLanguageSection />
        </div>
      </div>

      {/* ================= SECTION 3 ================= */}
      <div className="relative mx-auto my-20 flex w-11/12 max-w-maxContent flex-col gap-12 
        bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl text-white p-10">

        <InstructorSection />

        <h1 className="text-center text-4xl font-semibold">
          Reviews from other learners
        </h1>

        <ReviewSlider />
      </div>

      <Footer />
    </div>
  )
}

export default Home
