const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    email: { type: String, required: true, lowercase: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    token: { type: String, required: true, unique: true },
    expires: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Invitation', invitationSchema);