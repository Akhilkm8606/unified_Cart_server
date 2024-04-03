const Order = require('../model/order');
const Razorpay = require("razorpay");
const crypto = require('crypto');
const Payment = require('../model/payment');
const { log } = require('console');

const instance = new Razorpay({
    key_id: 'rzp_test_UWrwYMcZFBkSYy',
    key_secret: 'XbtrcRjsbb8ZpiojCHQrMBYo'
});

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const { user, items, totalPrice, status, shippingAddress, paymentMethod } = req.body;
        const order = new Order({ user, items, totalPrice, status, shippingAddress, paymentMethod });
       
        if (order.paymentMethod.toLowerCase() === 'cash on delivery'){
            await order.save();
            return res.status(201).json({ success: true, order, message: "Order placed successfully." });
        } else {
            console.log("Payment Method is not Cash on Delivery");
            const options = {
                amount: order.totalPrice * 100, // Convert to smallest currency unit
                currency: "INR",
                receipt: order._id.toString() // Convert ObjectID to string for receipt
            };

            instance.orders.create(options, async (err, razorpayOrder) => {
                if (err) {
                    console.error("Razorpay Error:", err);
                    return res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
                }
                // Razorpay order created successfully
                order.paymentId = razorpayOrder.id;
                await order.save();
               
                res.status(201).json({ success: true, order, razorpayOrder });
                        });
        }
    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports. paymentVerification = async (req, res) => {
  
    
  
    try {
        
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
        
        const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto.createHmac('sha256', instance.key_secret)
            .update(payload)
            .digest('hex');
        if (razorpay_signature === expectedSignature) {
            await Payment.create({
                razorpay_payment_id, razorpay_order_id, razorpay_signature
            })

            const order = await Order.findOneAndUpdate(
                { paymentId: razorpay_order_id }, // Find the order by payment ID
                { paymentStatus: 'paid' }, // Update payment status to 'paid'
                { new: true } // Return the updated order
            );
            res.redirect(`http://localhost:3000/PaymentSuccess?refernce=${razorpay_payment_id}`);
            
        } else {
            // Payment verification failed, delete the order
            const deletedOrder = await Order.findOneAndDelete({ paymentId: razorpay_order_id });
            if (deletedOrder) {
                res.status(400).json({ success: false, message: "Payment failed and order deleted" });
            } else {
                res.status(404).json({ success: false, message: "Order not found" });
            }
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
    const userId = req.params.id;
    console.log(userId);

    try {
      
        const orders = await Order.find({ user: userId });
        console.log(orders);
        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: 'No orders found for the user' });
        }
        res.status(200).json({ success: true, orders });
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
