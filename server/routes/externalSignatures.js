import express from 'express';
import { auth } from '../middleware/auth.js';
import {
    createExternalSignatureRequest,
    getExternalSigningDocument,
    submitExternalSignature,
    getExternalSignatureRequests,
    resendExternalSignatureEmail,
    rejectSignature
} from '../controllers/externalSignatureController.js';

const router = express.Router();

router.post('/create', auth, createExternalSignatureRequest);
router.get('/requests', auth, getExternalSignatureRequests);
router.post('/resend/:externalSignatureId', auth, resendExternalSignatureEmail);

router.get('/document/:token', getExternalSigningDocument);
router.post('/sign/:token', submitExternalSignature);
router.post('/reject/:token', rejectSignature);

export default router; 