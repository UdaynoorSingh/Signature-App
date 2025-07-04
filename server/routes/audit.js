import express from 'express';
import { getAudit, getAuditTrail } from '../controllers/auditController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getAudit);
router.get('/:fileId', auth, getAuditTrail);

export default router; 