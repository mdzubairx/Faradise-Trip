const RazorPay = require('razorpay');
require('dotenv').config();

const razorPay = new RazorPay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

module.exports = razorPay;