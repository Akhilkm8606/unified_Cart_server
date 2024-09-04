const Razorpay = require("razorpay");
const app = require("./app");
const connectDB = require("./connection/db");

// Log key_id and key_secret to ensure they are correct

connectDB();

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Log instance to see if it's initialized correctly

module.exports = {instance};

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
