const Tenant = require('../models/Tenant');

const identifyTenant = async (req, res, next) => {
    // Extract subdomain from hostname e.g., "acme.localhost:3000" -> "acme"
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];

    // If no subdomain, or it's 'www', let it pass for main site routes
    if (!subdomain || subdomain === 'www' || subdomain === 'localhost') {
        return next();
    }
    
    try {
        const tenant = await Tenant.findOne({ subdomain });
        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }
        // Attach tenant to the request object
        req.tenant = tenant;
        next();
    } catch (error) {
        console.error('Error identifying tenant:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = identifyTenant;