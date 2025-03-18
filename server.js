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

// Enable Trust Proxy for Render/Vercel to handle cookies correctly
app.set('trust proxy', 1);

// CORS Configuration (Allow Cookies & Authentication Headers)
const corsOptions = {
    origin: 'https://tss-frontend-sand.vercel.app', 
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie']
};
app.use(cors(corsOptions));

// Rate Limiting (Optional)
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10000,
    message: 'Too many requests, please try again later.'
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

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
