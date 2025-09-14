const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // Find user by ID AND tenantId
        req.user = await User.findOne({ _id: decoded.id, tenantId: req.tenant._id });
        if (!req.user) {
             return res.status(401).json({ success: false, message: 'Not authorized, user not found in this tenant' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};