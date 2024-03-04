 const Cart = require('../model/cart')



 exports.addCart = async (req, res) => {
     const userId = req.userId;
     const { productId } = req.body;
     try {
         if (!productId) {
             return res.status(400).json({
                 success: false,
                 message: "Please provide productId"
             });
         }
 
         const existingCart = await Cart.findOne({ userId, productId });
         if (existingCart) {
             return res.status(400).json({
                 success: false,
                 message: "Product already in the cart"
             });
         }
 
         const cart = await Cart.create({
             userId,
             productId
         });
 
         res.status(200).json({
             success: true,
             message: "Cart added successfully",
             cart
         });
 
     } catch (error) {
         console.log(error);
         res.status(400).json({
             success: false,
             message: error.message
         });
     }
 };
 


 exports.getCart = async (req, res) => {
    const userId = req.userId;
    try {
        const userCart = await Cart.findOne({ userId });
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
    const {cartId} = req.body
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
