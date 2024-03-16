const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
    userId:{
        type:String,
        required:[true,]
    },
    productId:{
        type:String,
        required:[true,"please add the productid"]
    },
    quantity:{
        type: Number,
        default: 1,
    }
})
const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
