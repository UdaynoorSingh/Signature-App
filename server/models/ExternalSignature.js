import mongoose from 'mongoose';
import crypto from 'crypto';

const externalSignatureSchema = new mongoose.Schema({
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    signerEmail: { type: String, required: true },
    signerName: { type: String, required: true },
    token: {
        type: String,
        required: true,
        unique: true,
        default: () => crypto.randomBytes(32).toString('hex')
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'signed', 'expired', 'rejected'],
        default: 'pending'
    },
    rejectionReason: { type: String },
    fields: [{
        fieldType: { type: String, enum: ['signature', 'text', 'date'], required: true },
        page: { type: Number, required: true },
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        width: { type: Number },
        fontSize: { type: Number },
        fontStyle: { type: String },
        content: { type: String }, // For text/date fields, pre-filled by requester
    }],
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    },
    signedAt: { type: Date },
}, { timestamps: true });

// Index for token lookup
externalSignatureSchema.index({ token: 1 });
externalSignatureSchema.index({ expiresAt: 1 });

// Method to check if token is expired
externalSignatureSchema.methods.isExpired = function () {
    return new Date() > this.expiresAt;
};

// Method to generate new token
externalSignatureSchema.methods.generateNewToken = function () {
    this.token = crypto.randomBytes(32).toString('hex');
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    this.status = 'pending';
    return this;
};

export default mongoose.model('ExternalSignature', externalSignatureSchema); 