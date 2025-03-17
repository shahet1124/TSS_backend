const Coupon = require('../models/Coupon');

const ipTracking = async (req, res, next) => {
    const ip = req.ip;
    const sessionId = req.cookies.sessionId;
    const cooldownPeriod = process.env.COOLDOWN_PERIOD || 3600; // 1 hour in seconds

    try {
        // Check if this IP or session has claimed a coupon recently
        const recentClaim = await Coupon.findOne({
            $or: [
                { 'claimedBy.ip': ip },
                { 'claimedBy.sessionId': sessionId }
            ],
            'claimedBy.claimedAt': {
                $gt: new Date(Date.now() - cooldownPeriod * 1000)
            }
        });

        if (recentClaim) {
            const timeLeft = Math.ceil(
                (recentClaim.claimedBy.claimedAt.getTime() + cooldownPeriod * 1000 - Date.now()) / 1000 / 60
            );
            return res.status(429).json({
                message: `Please wait ${timeLeft} minutes before claiming another coupon`
            });
        }

        // Add IP and session info to request
        req.clientInfo = { ip, sessionId };
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error during IP tracking' });
    }
};

module.exports = ipTracking; 