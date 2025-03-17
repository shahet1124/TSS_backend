const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    claimedBy: {
        ip: String,
        sessionId: String,
        claimedAt: Date
    },
    expiryDate: {
        type: Date,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema); 