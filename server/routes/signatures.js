import express from 'express';
import { finalizeAndEmbedSignatures } from '../controllers/signatureController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// New route for the advanced signing process
router.post('/finalize', auth, finalizeAndEmbedSignatures);

export default router; 