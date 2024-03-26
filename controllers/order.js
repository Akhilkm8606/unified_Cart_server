const Order = require('../model/order');
const Razorpay = require("razorpay");


const instance = new Razorpay({
    key_id: 'rzp_test_2nSteRcuNvqKdr',
    key_secret: 'WI3twOneiNU0TlUxQ2FUVstg'
});

// Create a new order
console.log(instance,'ll');
exports.createOrder = async (req, res) => {
    try {
        const { user, items, totalPrice, status, shippingAddress, paymentMethod } = req.body;
        const order = new Order({ user, items, totalPrice, status, shippingAddress, paymentMethod });
        await order.save();
        res.status(201).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
        console.log(error);
    }
};

// Checkout
exports.checkout = async (req, res) => {
    try {
        const options = {
            amount: Order.totalPrice, // Example amount, replace with actual amount
            currency: "INR",
            receipt: "receipt#1"
        };
        const razorpayOrder = await instance.orders.create(options);
        res.status(201).json({ success: true, razorpayOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
        console.log(error);
    }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete order by ID
exports.deleteOrderById = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
