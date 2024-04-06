const mongoose = require("mongoose");

const userschema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Ensure unique emails
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    },
    password: {
        type: String,
        required: true
        
    },
    confirmPassword: { // Add confirmPassword field
        type: String,
        required: false},
    role: {
        type: String,
        enum: ["user", "admin","seller"], // Define allowed roles
        default: "user" // Set default role to customer
    },
    status: {
        type: String,
        enum: ["active", "inactive"], // Define allowed statuses
        default: "active" // Set default status to active
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set creation date
    }
})


const User = mongoose.model("User", userschema);
module.exports = User;
