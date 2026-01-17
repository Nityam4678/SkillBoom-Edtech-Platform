const { Mongoose } = require("mongoose");
const Category = require("../models/Category");
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }

exports.createCategory = async (req, res) => {
	try {
		const { name, description } = req.body;
		if (!name) {
			return res
				.status(400)
				.json({ success: false, message: "All fields are required" });
		}
		const CategorysDetails = await Category.create({
			name: name,
			description: description,
		});
		 console.log(CategorysDetails);
		return res.status(200).json({
			success: true,
			message: "Categorys Created Successfully",
		});
	} catch (error) {
		return res.status(500).json({
			success: true,
			message: error.message,
		});
	}
};

exports.showAllCategories = async (req, res) => {
	try {
         console.log("INSIDE SHOW ALL CATEGORIES");
		const allCategorys = await Category.find({});
		res.status(200).json({
			success: true,
			data: allCategorys,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message:`Error ${error.message}`,
		});
	}
};

//categoryPageDetails 

exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body

    //  console.log("PRINTING CATEGORY ID:", categoryId)

    // 1Validate categoryId
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      })
    }

    // Get selected category with published courses
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec()

    //If category not found
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    //  If no published courses in selected category
    if (!selectedCategory.courses || selectedCategory.courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category",
      })
    }

    //  Get categories except selected
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    })

    //  Get random different category (SAFE)
    let differentCategory = null

    if (categoriesExceptSelected.length > 0) {
      const randomIndex = Math.floor(
        Math.random() * categoriesExceptSelected.length
      )

      differentCategory = await Category.findById(
        categoriesExceptSelected[randomIndex]._id
      )
        .populate({
          path: "courses",
          match: { status: "Published" },
        })
        .exec()
    }

    //  Get top-selling courses across all categories
    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: {
          path: "instructor",
        },
      })
      .exec()

    const allCourses = allCategories.flatMap(
      (category) => category.courses || []
    )

    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10)

    //  Success response
    return res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    })
  } catch (error) {
    console.error("CATEGORY PAGE ERROR:", error)

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
