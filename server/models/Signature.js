import mongoose from 'mongoose';

const signatureSchema = new mongoose.Schema({
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['SIGNATURE', 'INITIAL', 'TEXT', 'DATE'], required: true },
    content: { type: String, required: true },
    fontStyle: { type: String },
    fontSize: { type: Number, default: 18 },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    page: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'signed', 'rejected'], default: 'pending' },
    reason: String,
}, { timestamps: true });

export default mongoose.model('Signature', signatureSchema); 