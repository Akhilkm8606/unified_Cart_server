 const Cart = require('../model/cart')



 exports.addCart = async (req, res) => {
    const userId = req.userId;
    const { id: productId } = req.params;
    const { quantity } = req.body;
    
    try {
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Please provide productId"
            });
        }

        let existingCart = await Cart.findOne({ userId, productId });

        if (existingCart) {
            // Product already in the cart, update quantity
            existingCart.quantity += parseInt(quantity || 1);
            await existingCart.save();

            return res.status(200).json({
                success: true,
                message: "Cart updated successfully",
                cart: existingCart
            });
        } else {
            
            // Product not in cart, create new entry
            const cart = await Cart.create({
                userId,
                productId,
                quantity: parseInt(quantity || 1)
            });

            return res.status(200).json({
                success: true,
                message: "Cart added successfully",
                cart
            });
        }

    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};



 exports.getCart = async (req, res) => {
    const userId = req.userId;
    try {
        const userCart = await Cart.find({ userId });
        if (!userCart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        res.status(200).json({
            success: true,
            userCart
        });

    } catch (error) {
        console.log(error.message);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deletCart = async (req, res) => {
    const {id: cartId} = req.params
    try {
        const deletedCart = await Cart.findByIdAndDelete(cartId);
        if (!deletedCart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Cart deleted successfully"
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}
