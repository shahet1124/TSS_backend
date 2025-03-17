const router = require('express').Router();
const Coupon = require('../models/Coupon');
const auth = require('../middleware/auth');

// Get all coupons (admin only)
router.get('/coupons', auth, async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new coupon (admin only)
router.post('/coupons', auth, async (req, res) => {
    try {
        const { code, value, description, expiryDate } = req.body;

        const newCoupon = new Coupon({
            code,
            value,
            description,
            expiryDate: new Date(expiryDate)
        });

        await newCoupon.save();
        res.status(201).json(newCoupon);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Update coupon (admin only)
router.put('/coupons/:id', auth, async (req, res) => {
    try {
        const { isActive, value, description, expiryDate } = req.body;
        
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        if (isActive !== undefined) coupon.isActive = isActive;
        if (value) coupon.value = value;
        if (description) coupon.description = description;
        if (expiryDate) coupon.expiryDate = new Date(expiryDate);

        await coupon.save();
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get claim history (admin only)
router.get('/claims', auth, async (req, res) => {
    try {
        const claims = await Coupon.find({ isUsed: true })
            .select('code claimedBy value description')
            .sort({ 'claimedBy.claimedAt': -1 });
        res.json(claims);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Bulk upload coupons (admin only)
router.post('/coupons/bulk', auth, async (req, res) => {
    try {
        const coupons = req.body.coupons;
        
        if (!Array.isArray(coupons)) {
            return res.status(400).json({ message: 'Invalid request format' });
        }

        const formattedCoupons = coupons.map(coupon => ({
            ...coupon,
            expiryDate: new Date(coupon.expiryDate)
        }));

        const result = await Coupon.insertMany(formattedCoupons, { ordered: false });
        res.status(201).json(result);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Some coupon codes already exist' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 