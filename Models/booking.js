const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    guests: {
        type: Number,
        default: 1,
        min: 1
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "failed", "verification_pending"],
        default: "pending"
    },
    payment: {
        type: Schema.Types.ObjectId,
        ref: "Payment"
    }
}, { timestamps: true }); // gives you createdAt & updatedAt automatically


// useful for quickly finding all bookings for a listing / user
bookingSchema.index({ listing: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ user: 1 });

module.exports = mongoose.model("Booking", bookingSchema);