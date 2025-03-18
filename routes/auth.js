const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Ensure you have bcrypt installed
const Admin = require('../models/Admin');

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate admin
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Set cookie with proper attributes for cross-origin authentication
        res.cookie('token', token, {
            httpOnly: true,  // Prevents JavaScript access
            secure: true,    // Ensures cookies are only sent over HTTPS
            sameSite: 'None', // REQUIRED for cross-origin requests (Chrome)
            path: '/',        // Ensures cookie is available on all routes
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.json({
            message: 'Logged in successfully',
            admin: { id: admin._id, email: admin.email }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin logout
router.post('/logout', (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
        expires: new Date(0)
    });
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
