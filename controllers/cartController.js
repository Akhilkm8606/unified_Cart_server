
const Cart = require('../model/cart');
const Product = require('../model/product');


exports.addCart = async (req, res) => {
    const userId = req.userId;
    const { id: productId } = req.params;
    const { quantity } = req.body;
    
    try {
        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: "Please provide userId and productId"
            });
        }

        // Find existing cart item
        let existingCart = await Cart.findOne({ userId: userId, productId });
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
            // Product not in the cart, create a new cart item
            const product = await Product.findOne({ _id: productId });
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            const cart = await Cart.create({
                userId,
                productId,
                quantity: parseInt(quantity || 1),
                price: product.price // Assign product price to cart item
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
    const userId = req.params.id;
    
    try {
        const userCart = await Cart.find({ userId }).populate("productId");        
        
        if (!userCart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }
       
        res.status(200).json({
            length: userCart.length ,
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

// Controller
exports.editCart = async (req, res) => {
    const { id: cartId } = req.params;
    const { quantity: newQuantity} = req.body;


    try {
        const existingCart = await Cart.findById(cartId);

        if (!existingCart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Calculate the new quantity by adding the current quantity and the new quantity
        const currentQuantity = existingCart.quantity || 0;
        const editCart = await Cart.findByIdAndUpdate(cartId, { quantity: newQuantity }, { new: true });
        console.log(newQuantity,'lll');
        if (!editCart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        console.log(editCart);
        res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            data: editCart
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
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
