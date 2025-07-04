import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    profileImage: { type: String, default: null },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
}, { timestamps: true });

export default mongoose.model('User', userSchema); 