const User = require('../models/User');
const Invitation = require('../models/Invitation');
const jwt = require('jsonwebtoken');

// Utility to set the auth cookie
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });

    res.status(statusCode)
        .cookie('accessToken', token, {
            httpOnly: true,
            expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
            secure: process.env.NODE_ENV === 'production',
        })
        .json({ success: true, user: { name: user.name, role: user.role } });
};

// Login within a specific tenant
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    // The `identifyTenant` middleware provides req.tenant
    if (!req.tenant) {
        return res.status(400).json({ success: false, message: 'Login requires a tenant subdomain.' });
    }

    try {
        const user = await User.findOne({ email, tenantId: req.tenant._id }).select('+password');
        
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Register a user from an invitation
exports.registerInvitedUser = async (req, res) => {
    const { name, password, inviteToken } = req.body;
    
    if (!req.tenant) {
        return res.status(400).json({ success: false, message: 'Registration requires a tenant subdomain.' });
    }

    try {
        const invitation = await Invitation.findOne({ 
            token: inviteToken, 
            tenantId: req.tenant._id,
            expires: { $gt: Date.now() } 
        });

        if (!invitation) {
            return res.status(400).json({ success: false, message: 'Invalid or expired invitation token.' });
        }
        
        const user = await User.create({
            name,
            email: invitation.email,
            password,
            role: invitation.role,
            tenantId: invitation.tenantId,
        });

        await Invitation.deleteOne({ _id: invitation._id });

        sendTokenResponse(user, 201, res);
    } catch (error) {
         if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'This user already exists in the tenant.' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getMe = (req, res) => {
    res.status(200).json({ success: true, data: { user: req.user, tenant: req.tenant } });
};

exports.logout = (req, res) => {
    res.cookie('accessToken', 'none', { expires: new Date(Date.now() + 5 * 1000), httpOnly: true });
    res.status(200).json({ success: true, data: {} });
};