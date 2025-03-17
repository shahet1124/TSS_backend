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

// CORS Configuration
const allowedOrigins = ['https://tss-frontend-sand.vercel.app'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie']
}));

// Handle Preflight Requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(204); // No Content
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10000, // Limit each IP to 10,000 requests per hour
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit if DB connection fails
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/admin', require('./routes/admin'));

// Health Check Route
app.get('/api/ping', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
