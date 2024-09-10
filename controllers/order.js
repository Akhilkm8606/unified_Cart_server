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
        const { user, items, totalPrice, status, shippingAddress, paymentMethod,sellerId } = req.body;
        const order = new Order({ user, items, totalPrice, status, shippingAddress, paymentMethod,sellerId });
       
        console.log(req.body);
        

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
            res.redirect(`https://unified-cart-server.vercel.app/PaymentSuccess?refernce=${razorpay_payment_id}`);
            
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
exports.getownOrders = async (req, res) => {
    try {
      const sellerId = req.userId; // Ensure req.userId is correctly set
      console.log(sellerId, 'pp');
  
      // Fetch orders for the seller and populate the products
      const orders = await Order.find({ sellerId }).populate('items.product');
  
      res.status(200).json({
        totalOrders: orders.length ,
        success: true,
        orders,        // The orders array
       // The length of the orders array
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      });
    }
  };
  


exports.getOrderByUserId = async (req, res) => {
    
    const userId = req.params.id.trim(); // Trim any leading or trailing spaces
    console.log(userId);

    try {
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }
      
        const orders = await Order.find({ user: userId });
        console.log(orders);
        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: 'No orders found for the user' });
        }
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getOrderById = async (req, res) => {
    const id = req.params.id; // Trim any leading or trailing spaces
    console.log(id);

    try {
      
      
        const orders = await Order.findById( id);
        console.log(orders);
        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: 'No orders found for the user' });
        }
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.searchOrder = async (req,res) =>{
    const {id,product,username} =req.query;
    try {
        let query ={};
        if(id){
            query._id=id
        }
        if(product){
            query['items.name'] = { $regex: new RegExp(product, 'i') };
        }
        if(username){
            query['user.name'] = { $regex: new RegExp(username, 'i') };
        }
        const orders = await Order.find(query);

        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: 'No orders found' });
        }
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
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
