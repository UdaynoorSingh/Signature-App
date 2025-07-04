import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..');

export const register = async (req, res, next) => {
    try{
        const { name, email, password } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already exists' });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({ name, email, password: hashed, verificationToken });

        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
        const emailHtml = `<p>Please verify your email by clicking the link below:</p><a href="${verificationUrl}">${verificationUrl}</a>`;

        await sendEmail(email, 'Verify Your Email', emailHtml);

        res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
    } 
    catch(err){
        next(err);
    }
};

export const verifyEmail = async (req, res, next) => {
    try{
        const { token } = req.query;
        if (!token) return res.status(400).json({ message: 'Verification token is required.' });

        const user = await User.findOne({ verificationToken: token });
        if (!user) return res.status(400).json({ message: 'Invalid or expired verification link.' });

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.json({ message: 'Email verification successful! You can now log in.' });
    } 
    catch (err){
        next(err);
    }
};

export const login = async (req, res, next) => {
    try{
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if(!user) return res.status(400).json({ message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if(!match) return res.status(400).json({ message: 'Invalid credentials' });

        if(!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email before logging in.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage
            }
        });
    } 
    catch(err){ next(err); }
};

export const validateToken = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        res.json({ user: { id: user._id, name: user.name, email: user.email, profileImage: user.profileImage } });
    } catch (err) {
        next(err);
    }
};

export const uploadProfileImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const user = await User.findById(req.user.id);
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }

        if(user.profileImage){
            const oldImagePath = path.join(serverRoot, 'uploads', 'profiles', user.profileImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        user.profileImage = req.file.filename;
        await user.save();

        res.json({
            message: 'Profile image updated successfully',
            profileImage: req.file.filename
        });
    } 
    catch(err){
        next(err);
    }
};

export const getUserProfile = async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } 
    catch(err){
        next(err);
    }
};

export const removeProfileImage = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if(user.profileImage) {
            const imagePath = path.join(serverRoot, 'uploads', 'profiles', user.profileImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        user.profileImage = null;
        await user.save();

        res.json({
            message: 'Profile image removed successfully',
            profileImage: null
        });
    } 
    catch(err){
        next(err);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; 
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        const emailHtml = `
            <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
            <p>Please click on the following link, or paste this into your browser to complete the process:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        `;

        await sendEmail(user.email, 'Password Reset Request', emailHtml);

        res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });

    }
    catch(err){
        if (req.user) {
            req.user.passwordResetToken = undefined;
            req.user.passwordResetExpires = undefined;
            await req.user.save();
        }
        next(err);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or has expired.' });
        }

        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        const loginToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: 'Password has been reset successfully.',
            token: loginToken,
            user: { id: user._id, name: user.name, email: user.email, profileImage: user.profileImage }
        });

    } catch (err) {
        next(err);
    }
}; 