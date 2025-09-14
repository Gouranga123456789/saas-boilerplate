const Tenant = require('../models/Tenant');
const User = require('../models/User');

exports.createTenant = async (req, res) => {
    const { name, subdomain, adminName, adminEmail, adminPassword } = req.body;
    try {
        // 1. Create the tenant
        const tenant = await Tenant.create({ name, subdomain });

        // 2. Create the admin user for this tenant
        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            tenantId: tenant._id,
        });

        res.status(201).json({ 
            success: true, 
            message: 'Tenant and admin user created successfully',
            tenant,
        });
    } catch (error) {
        // Handle potential duplicate subdomain or user email
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Subdomain or Email already exists.' });
        }
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};