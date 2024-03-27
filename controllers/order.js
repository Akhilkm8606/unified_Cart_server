const Order = require('../model/order');
const Razorpay = require("razorpay");
const crypto = require('crypto');
const Payment = require('../model/payment');

const instance = new Razorpay({
    key_id: 'rzp_test_UWrwYMcZFBkSYy',
    key_secret: 'XbtrcRjsbb8ZpiojCHQrMBYo'
});

// Create a new order
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
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        console.log(order.totalPrice);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const options = {
         
            amount: order.totalPrice * 100, // Example amount, replace with actual amount
            currency: "INR",
            receipt: order._id
        };

        instance.orders.create(options, (err, razorpayOrder) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
            }
            res.status(201).json({ success: true, razorpayOrder });
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.paymentVerification = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
        
        const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto.createHmac('sha256', instance.key_secret)
            .update(payload)
            .digest('hex');

        if (razorpay_signature === expectedSignature) {
            // await Payment.create
            res.redirect(`http://localhost:3000/PaymentSuccess?refernce=${razorpay_payment_id}`);
        } else {
            res.status(400).json({ success: false, message: "Payment verification failed" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
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
