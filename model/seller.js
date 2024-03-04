const mongoose = require('mongoose');

const sellerschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Ensure uniqueness
    },
    phoneNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: false
    }, role: {
        type: String,
        enum: ["seller", "admin"], 
        default: "seller" 
    },
  
    createdAt: {
        type: Date,
        default: Date.now 
    }

})
const Seller = mongoose.model("Seller", sellerschema);
module.exports = Seller;