import React, { useEffect, useState } from "react"
import ReactStars from "react-rating-stars-component"

// Swiper
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"

// Icons
import { FaStar } from "react-icons/fa"

// Swiper modules
import { Autoplay, FreeMode, Pagination } from "swiper"

// API
import { apiConnector } from "../../services/apiconnector"
import { ratingsEndpoints } from "../../services/apis"

function ReviewSlider() {
  const [reviews, setReviews] = useState([])
  const truncateWords = 15

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await apiConnector(
          "GET",
          ratingsEndpoints.REVIEWS_DETAILS_API
        )
        if (data?.success) {
          setReviews(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch reviews", error)
      }
    })()
  }, [])

  return (
    <div className="text-white w-full">
      <div className="my-[50px] max-w-maxContentTab lg:max-w-maxContent mx-auto">
        <Swiper
          slidesPerView={4}
          spaceBetween={25}
          loop={true}
          freeMode={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
          modules={[FreeMode, Pagination, Autoplay]}
          className="w-full !h-auto"
        >
          {reviews.map((review, i) => (
            <SwiperSlide key={i} className="!h-auto">
              <div className="flex h-full flex-col gap-3 bg-richblack-800 p-4 text-[14px] text-richblack-25 rounded-lg shadow-md">
                
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={
                      review?.user?.image
                        ? review.user.image
                        : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                    }
                    alt="user"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <h1 className="font-semibold text-richblack-5">
                      {review?.user?.firstName} {review?.user?.lastName}
                    </h1>
                    <p className="text-xs text-richblack-400">
                      {review?.course?.courseName}
                    </p>
                  </div>
                </div>

                {/* Review Text */}
                <p className="font-medium text-richblack-25 leading-relaxed">
                  {review?.review?.split(" ").length > truncateWords
                    ? review.review
                        .split(" ")
                        .slice(0, truncateWords)
                        .join(" ") + " ..."
                    : review?.review}
                </p>

                {/* Rating */}
                <div className="mt-auto flex items-center gap-2">
                  <span className="font-semibold text-yellow-100">
                    {review?.rating?.toFixed(1)}
                  </span>
                  <ReactStars
                    count={5}
                    value={review?.rating}
                    size={20}
                    edit={false}
                    activeColor="#ffd700"
                    emptyIcon={<FaStar />}
                    fullIcon={<FaStar />}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}

export default ReviewSlider
