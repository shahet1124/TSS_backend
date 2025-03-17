const router = require('express').Router();
const Coupon = require('../models/Coupon');
const ipTracking = require('../middleware/ipTracking');

// Claim a coupon (public route with IP tracking)
router.post('/claim', ipTracking, async (req, res) => {
    try {
        // Find the next available coupon
        const coupon = await Coupon.findOne({
            isActive: true,
            isUsed: false,
            expiryDate: { $gt: new Date() }
        }).sort({ createdAt: 1 });

        if (!coupon) {
            return res.status(404).json({ message: 'No coupons available' });
        }

        // Update coupon with claim information
        coupon.isUsed = true;
        coupon.claimedBy = {
            ip: req.clientInfo.ip,
            sessionId: req.clientInfo.sessionId,
            claimedAt: new Date()
        };

        await coupon.save();

        res.json({
            message: 'Coupon claimed successfully',
            coupon: {
                code: coupon.code,
                value: coupon.value,
                description: coupon.description,
                expiryDate: coupon.expiryDate
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify a coupon (public route)
router.get('/verify/:code', async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ code: req.params.code });
        
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        res.json({
            isValid: coupon.isActive && !coupon.isUsed && coupon.expiryDate > new Date(),
            coupon: {
                code: coupon.code,
                value: coupon.value,
                description: coupon.description,
                expiryDate: coupon.expiryDate
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 