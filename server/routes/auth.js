import express from 'express';
import multer from 'multer';
import { register, login, verifyEmail, validateToken, uploadProfileImage, getUserProfile, removeProfileImage, forgotPassword, resetPassword } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Configure multer for profile image uploads
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/profiles';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const profileUpload = multer({
    storage: profileStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.get('/validate', auth, validateToken);
router.get('/profile', auth, getUserProfile);
router.post('/profile/image', auth, profileUpload.single('profileImage'), uploadProfileImage);
router.delete('/profile/image', auth, removeProfileImage);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router; 