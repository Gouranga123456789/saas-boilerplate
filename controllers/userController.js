const { nanoid } = require('nanoid');
const Invitation = require('../models/Invitation');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

exports.inviteUser = async (req, res) => {
    const { email, role } = req.body;
    const { tenant, user } = req; // From middleware

    try {
        // Check if user already exists in this tenant
        const existingUser = await User.findOne({ email, tenantId: tenant._id });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists in the tenant.' });
        }
        
        // Generate a unique token
        const token = nanoid(32);
        
        // Set an expiration date for the token (e.g., 24 hours)
        const expires = new Date();
        expires.setDate(expires.getDate() + 1);

        await Invitation.create({ email, role, tenantId: tenant._id, token, expires });

        const registrationUrl = `http://${tenant.subdomain}.${process.env.APP_BASE_URL}/register.html?token=${token}`;
        
        const message = `
            <h1>You have been invited to join ${tenant.name}</h1>
            <p>Hello,</p>
            <p>You have been invited by ${user.name} to join the team.</p>
            <p>Please click the link below to set up your account. This link will expire in 24 hours.</p>
            <a href="${registrationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block;">
                Accept Invitation
            </a>
            <p>If you cannot click the link, please copy and paste this URL into your browser:</p>
            <p>${registrationUrl}</p>
            <p>Thank you,</p>
            <p>The Team</p>
        `;

        await sendEmail({
            to: email,
            subject: `Invitation to join ${tenant.name}`,
            html: message,
        });

        res.status(200).json({ success: true, message: `Invitation sent to ${email}` });
    } catch (error) {
        console.error('Error inviting user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all users for the current tenant
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ tenantId: req.tenant._id });
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};