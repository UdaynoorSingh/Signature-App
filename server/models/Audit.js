import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: String,
    ip: String,
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Audit', auditSchema); 