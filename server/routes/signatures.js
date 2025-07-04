import express from 'express';
import { finalizeAndEmbedSignatures } from '../controllers/signatureController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/finalize', auth, finalizeAndEmbedSignatures);

export default router; 