import React, { useState } from "react";
import { HomePageExplore } from "../../../data/homepage-explore";
import CourseCard from "./CourseCard";
import HighlightText from "./HighlightText";

const tabsName = [
  "Free",
  "New to coding",
  "Most popular",
  "Skills paths",
  "Career paths",
];

const ExploreMore = () => {
  const [currentTab, setCurrentTab] = useState(tabsName[0]);
  const [courses, setCourses] = useState(HomePageExplore[0].courses);
  const [currentCard, setCurrentCard] = useState(
    HomePageExplore[0].courses[0].heading
  );

  const setMyCards = (value) => {
    setCurrentTab(value);
    const result = HomePageExplore.filter(
      (course) => course.tag === value
    );
    setCourses(result[0].courses);
    setCurrentCard(result[0].courses[0].heading);
  };

  return (
    <div className="relative w-full bg-richblack-900 py-16">

      {/* Heading */}
      <div className="text-center">
        <h2 className="text-4xl font-semibold text-richblack-5">
          Unlock the <HighlightText text={"Power of Code"} />
        </h2>
        <p className="text-richblack-300 text-lg font-medium mt-2">
          Learn to Build Anything You Can Imagine
        </p>
      </div>

      {/* Tabs */}
      <div className="hidden lg:flex gap-4 mt-10 mx-auto w-max 
        bg-richblack-800 p-1 rounded-full 
        drop-shadow-[0_1.5px_rgba(255,255,255,0.25)]">
        {tabsName.map((tab, index) => (
          <div
            key={index}
            onClick={() => setMyCards(tab)}
            className={`px-7 py-2 rounded-full cursor-pointer transition-all duration-200
              ${currentTab === tab
                ? "bg-richblack-900 text-richblack-5"
                : "text-richblack-200 hover:bg-richblack-900 hover:text-richblack-5"
              }`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Cards Section (FIXED) */}
      <div className="mt-16 flex flex-wrap justify-center gap-8 px-4 lg:px-0">
        {courses.map((course, index) => (
          <CourseCard
            key={index}
            cardData={course}
            currentCard={currentCard}
            setCurrentCard={setCurrentCard}
          />
        ))}
      </div>

    </div>
  );
};

export default ExploreMore;
