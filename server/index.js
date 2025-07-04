import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import docRoutes from './routes/docs.js';
import signatureRoutes from './routes/signatures.js';
import auditRoutes from './routes/audit.js';
import externalSignatureRoutes from './routes/externalSignatures.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getIpAddress } from './middleware/getIp.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(getIpAddress);
const allowedOrigins = [
    'https://signature-app-rust.vercel.app',
    'http://localhost:3000'
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/uploads', cors({ origin: allowedOrigins, credentials: true }), express.static(path.join(__dirname, 'uploads')));

app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads', 'profiles')));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const profilesDir = path.join(__dirname, 'uploads', 'profiles');
if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
}

app.use('/api/auth', authRoutes);
app.use('/api/docs', docRoutes);
app.use('/api/signatures', signatureRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/external-signatures', externalSignatureRoutes);

app.use(errorHandler);

console.log('MONGO_URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(5000, () => console.log('Server running on port 5000'));
    })
    .catch(err => console.error(err)); 