const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS - Allow everything (For Testing Only)
app.use(cors()); // This allows all origins, methods, and headers


// Rate limiting (optional, but can be disabled for debugging)
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10000, // Limit each IP to 10000 requests per window
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
try {
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/coupons', require('./routes/coupons'));
    app.use('/api/admin', require('./routes/admin'));
} catch (error) {
    console.error('❌ Error loading routes:', error);
}

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
