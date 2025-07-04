import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    filename: String,
    originalname: String,
    path: String,
    signedPath: { type: String },
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Document', documentSchema); 