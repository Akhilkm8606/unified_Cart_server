const multer = require("multer");
const verifyToken = require("../middlewear/auth");
const Product = require("../model/product");
const Category = require("../model/categoryModel");
const slugify = require("slugify")
const upload = require("../middlewear/fileUplod");
const User = require("../model/user");


exports.addCategory = async (req, res) => {

    try {
        const { name
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "All fields  required"
            });
        }
        const existingCategory = await Category.findOne({
            name,
        })
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "product category exist,"
            });
        }
        const categorys = await Category.create({
            name,
            slug: slugify(name)
        });
        console.log();
        res.status(200).json({
            success: true,
            categorys,
            message: "category updated "
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to add product', error: error.message });
    }


};
exports.getCategory = async (req, res) => {

    try {
        const categorys = await Category.find();

        res.status(200).json({
            success: true, categorys
            ,
            message: "ccategory listed" ,
            count: categorys.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.updateCategory = async (req, res) => {

    const { category } = req.body
    const { id } = req.params
    try {
        const categorys = await Category.findByIdAndUpdate(id, { category, slug: slugify(category) }, { new: true });

        res.status(200).json({ success: true, categorys });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.addReview = async (req, res) => {
    try {
        const userId = req.userId;
        const reviewData = req.body;
        const productId = req.params.id;

        const product = await Product.findById(productId);
        const user = await User.findById(userId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const review = {
            ...reviewData,
            username: user.username
        };

        product.reviews.push(review);
        await product.save();
        const validReviews = product.reviews.filter(review => review.rating !== undefined);
        let overallRating = 0;
        if (validReviews.length > 0) {
            const totalRating = validReviews.reduce((acc, review) => acc + review.rating, 0);
            overallRating = totalRating / validReviews.length;
        }

        // Update the product's overall rating in the database
        product.rating = overallRating;
        await product.save();

        res.status(200).json({ success: true, message: "Review added successfully", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getReview = async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        const reviews = product.reviews;
        console.log(reviews);
        res.status(200).json({ success: true, message: "Review added successfully", reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;

        // Find the product by its ID
        const product = await Product.findOneAndUpdate(
            { "reviews._id": reviewId }, // Find the product containing the review with the given ID
            { $pull: { reviews: { _id: reviewId } } }, // Remove the review from the product's reviews array
            { new: true } // Return the updated product
        );

        if (!product) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        // If the review was successfully deleted from the product, return the updated product
        res.status(200).json({ success: true, message: "Review deleted successfully", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};






exports.addProduct = async (req, res) => {
    try {
        const sellerId = req.userId;
        const images = req.files.map(file => file.filename);
        const { name, categoryId, price, description, quantity, features ,reviews} = req.body;
     

        if (!name || !categoryId || !price || !description || !quantity || !features || !images ) {
            return res.status(400).json({
                success: false,
                message: "All fields including images and reviews are required"
            });
        }

        // Calculate the overall rating
       // Filter out reviews without a valid rating


        const existingProduct = await Product.findOne({
            sellerId,
            name,
            categoryId,
            price,
            features,
            images: images,
        });

        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: "Product already exists. Please update the existing product quantity."
            });
        }

        const product = await Product.create({
            sellerId,
            name,
            categoryId,
            price,
            description,
            quantity,
            features,
            images: images,
            reviews: reviews,
           
        });

        res.status(200).json({
            success: true,
            message: "Product added successfully",
            product: product,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to add product', error: error.message });
    }
};




exports.getProduct = async (req, res) => {

    const productId = req.params.id;
    try {
        // Find the product by its ID and seller ID
        const product = await Product.findOne({ _id: productId });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        console.log(product);
        res.status(200).json({ success: true, product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};



exports.updateProduct = async (req, res) => {
    const userId = req.userId;
    try {
        const products = await Product.find({ sellerId: userId });
        console.log(products);
        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};




