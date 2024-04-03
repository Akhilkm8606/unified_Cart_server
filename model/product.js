const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
    username: String,
    avatar: String,
    rating:  Number,
 
    comment: String,
  }, { timestamps: true });
  
  const Review = mongoose.model('Review', reviewSchema);

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
    
      reviews: [reviewSchema],
      description: {
        type: String,
      },

    rating:{
        type: Number,
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
