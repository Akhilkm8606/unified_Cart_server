const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product model
        required: true
    },
    quantity: {
        type: Number,
        default: 1,
    },
    price: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        default: function() {
            return this.quantity * this.price; // Calculate amount based on quantity and price
        }
    }
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
    