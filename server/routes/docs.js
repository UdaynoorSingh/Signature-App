import express from 'express';
import multer from 'multer';
import { uploadDoc, listDocs, getDoc, deleteDoc, deleteMultipleDocs, migrateNormalizePaths } from '../controllers/docController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/upload', auth, upload.single('file'), uploadDoc);
router.get('/', auth, listDocs);
router.delete('/', auth, deleteMultipleDocs);
router.get('/:id', auth, getDoc);
router.delete('/:id', auth, deleteDoc);
router.post('/migrate-paths', migrateNormalizePaths);

export default router; 