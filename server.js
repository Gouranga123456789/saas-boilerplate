require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const identifyTenant = require('./middleware/identifyTenant');

// --- DB Connection ---
mongoose.connect(process.env.MONGO_URI, {})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.error(err));

const app = express();

// --- Core Middleware ---

// MODIFICATION START: Configure Helmet with a Content Security Policy
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            // We are whitelisting all the inline scripts from our different HTML pages.
            "script-src": [
                "'self'",
                "'sha256-nS2bFAjP80Wvy9smPHO9HbsNbSaEk9Acjy4YN4V6JZU='",
                "'sha256-RzQItGB0Ka27Exwa6nVFooKxWkPJYJmKpnjDKMwqCtc='", 
                "'sha256-sFfxIhATXwrsH5ipoiS+UV+uCD+tj9Nxo9ypxIP8uh4='", 
                "'sha256-gVdtFb3QZyXQ5iHsBQGwNdCm4oUXsDUaYbd89GYRp2w='"
                
            ],
        },
    },
}));


app.use(cors({ origin: `http://${process.env.APP_BASE_URL}`, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public')); // Serve main site

// --- Routes ---

// 1. Public route for creating a new tenant
app.use('/api/tenants', require('./routes/tenantRoutes'));

// 2. Tenant-specific routes (require a subdomain)
const tenantRouter = express.Router();
tenantRouter.use('/api/auth', require('./routes/authRoutes'));
tenantRouter.use('/api/users', require('./routes/userRoutes'));
// Apply the tenant identification middleware to all tenant-specific routes
app.use('/', identifyTenant, tenantRouter);


// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));