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
        required: true
    },
    paymentGateway: {
        type: String   // e.g. "razorpay", "stripe"
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true    // allows multiple docs with no transactionId (e.g. failed before gateway call)
    },
    status: {
        type: String,
        enum: ["pending", "success", "failed", "refunded"],
        default: "pending"
    },
    paidAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);