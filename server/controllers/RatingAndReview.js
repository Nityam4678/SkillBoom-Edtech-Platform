const RatingAndReview = require("../models/RatingAndRaview");
const Course = require("../models/Course");
const mongoose = require("mongoose");

//createRating
exports.createRating = async (req, res) => {
    try{

        //get user id
        const userId = req.user.id;
        //fetchdata from req body
        const {rating, review, courseId} = req.body;
        //check if user is enrolled or not
        //  console.log("userId: ", userId);
        //  console.log("courseId: ", courseId);
        const courseDetails = await Course.findOne(
                                    {_id:courseId,
                                    studentsEnrolled: {$elemMatch: {$eq: userId} },
                                });
        if(!courseDetails) {
            return res.status(404).json({
                success:false,
                message:'Student is not enrolled in the course',
            });
        }
        //check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
                                                user:userId,
                                                course:courseId,
                                            });
        if(alreadyReviewed) {
                    return res.status(409).json({
                        success:false,
                        message:'Course is already reviewed by the user',
                    });
                }
        //create rating and review
        const ratingReview = await RatingAndReview.create({
                                        rating, review, 
                                        course:courseId,
                                        user:userId,
                                    });
       
        //update course with this rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
                                    {
                                        $push: {
                                            ratingAndReviews: ratingReview._id,
                                        }
                                    },
                                    {new: true});
        //return response
        return res.status(201).json({
            success:true,
            message:"Rating and Review created Successfully",
            ratingReview,
        })
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:"Could not create rating",
        })
    }
}



//getAverageRating
exports.getAverageRating = async (req, res) => {
    try {
            //get course ID
            const courseId = req.body.courseId;
            //calculate avg rating

            const result = await RatingAndReview.aggregate([
                {
                    $match:{
                        course: new mongoose.Types.ObjectId(courseId),
                    },
                },
                {
                    $group:{
                        _id:null,
                        averageRating: { $avg: "$rating"},
                    }
                }
            ])

            //return rating
            if(result.length > 0) {

                return res.status(200).json({
                    success:true,
                    averageRating: result[0].averageRating,
                })

            }
            
            //if no rating/Review exist
            return res.status(200).json({
                success:true,
                message:'Average Rating is 0, no ratings given till now',
                averageRating:0,
            })
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:"Could not calculate average rating",
        })
    }
}


//getAllRatingAndReviews

exports.getAllRating = async (req, res) => {
    try{
            const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
            const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50);
            const skip = (page - 1) * limit;
            const [allReviews, total] = await Promise.all([
                RatingAndReview.find({})
                    .sort({rating: "desc"})
                    .skip(skip)
                    .limit(limit)
                    .populate({
                        path:"user",
                        select:"firstName lastName email image",
                    })
                    .populate({
                        path:"course",
                        select: "courseName",
                    })
                    .exec(),
                RatingAndReview.countDocuments({})
            ]);
            return res.status(200).json({
                success:true,
                message:"All reviews fetched successfully",
                data:allReviews,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            });
    }   
    catch(error) {
        return res.status(500).json({
            success:false,
            message:"Could not fetch reviews",
        })
    } 
}