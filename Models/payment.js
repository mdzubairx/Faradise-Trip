const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    booking: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "INR"
    },
    paymentMethod: {
        type: String,
        enum: ["card", "upi", "netbanking", "wallet", "paypal"],
    },
    razorpayOrderId: {
        type: String   
    },
    razorpayPaymentId: {
        type: String,
        unique: true,
        sparse: true
    },
    status: {
        type: String,
        enum: ["pending", "success", "failed", "refunded", "authorized", "verification_pending"],
        default: "pending"
    },
    paidAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);