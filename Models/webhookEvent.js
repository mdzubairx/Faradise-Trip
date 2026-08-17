const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const webhookEventSchema = new mongoose.Schema({
    razorpayEventId: {
        type: String,
        unique: true,
        required: true
    },

    eventType: String,

    processedAt: {
        type: Date,
    }
});

module.exports = mongoose.model("WebhookEvent", webhookEventSchema);