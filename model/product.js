const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
   
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String 
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        default: 0
    },  
    images: {
        type: [String], 
      
    }, 
    features: {
        type: [String] 
    },
}, { timestamps: true });


const Product = mongoose.model("Product", productSchema);
module.exports = Product;
