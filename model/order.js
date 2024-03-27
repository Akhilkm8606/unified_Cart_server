const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product' // Reference to the Product model
            },
            
            name: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered'],
        default: 'Pending'
    },
    shippingAddress: {
    FullName: { type: String },
    MobilNumber:{ type: String   },
    Address: { type: String },
    Apartment: { type: String },
    City: { type: String },
    LandMark:{type :String},
    State: { type: String },
    ZipCode: { type: String }
},
    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'PayPal', 'Cash on Delivery'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});




const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
