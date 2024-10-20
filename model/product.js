const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    username: String,
    userId: String,
    avatar: String,
    rating:  Number,
    comment: String,
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

const productSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    category: {
        type: String,
    },
    name: {
        type: String,
        required: true
    },
    reviews: [reviewSchema],
    description: {
        type: String
    },
    rating: {
        type: Number
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        default: 0,
        required: true
    },
    images: {
        type: [String]
    },
    features: {
        type: [String]
    }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
