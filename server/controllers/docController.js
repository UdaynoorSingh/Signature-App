import Document from '../models/Document.js';
import Signature from '../models/Signature.js';
import Audit from '../models/Audit.js';
import ExternalSignature from '../models/ExternalSignature.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the server root directory (one level up from controllers)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..');

export const uploadDoc = async (req, res, next) => {
    try {
        const normalizedPath = req.file.path.replace(/\\/g, '/');
        const doc = await Document.create({
            user: req.user.id,
            filename: req.file.filename,
            originalname: req.file.originalname,
            path: normalizedPath,
            size: req.file.size
        });

        // Create an audit trail entry for the upload
        await Audit.create({
            documentId: doc._id,
            userId: req.user.id,
            action: 'Uploaded document',
            ip: req.clientIp
        });

        res.status(201).json(doc);
    } catch (err) { next(err); }
};

export const listDocs = async (req, res, next) => {
    try {
        const docs = await Document.find({ user: req.user.id });
        const docsResponse = docs.map(doc => {
            const docObj = doc.toObject();
            docObj.path = `/uploads/${doc.filename}`;
            if (doc.signedPath) {
                docObj.signedPath = `/uploads/${path.basename(doc.signedPath)}`;
            }
            return docObj;
        });
        res.json(docsResponse);
    } catch (err) { next(err); }
};

export const getDoc = async (req, res, next) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Not found' });

        // IMPORTANT: The path in the DB is the internal filesystem path.
        // We must convert it to a public URL for the client using the filename.
        const docResponse = doc.toObject();
        docResponse.path = `/uploads/${doc.filename}`;

        res.json(docResponse);
    } catch (err) { next(err); }
};

export const deleteDoc = async (req, res, next) => {
    try {
        const { id } = req.params;
        const doc = await Document.findById(id);

        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Ensure the user owns the document
        if (doc.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to delete this document' });
        }

        // Delete the physical file - use correct path to server root
        const filePath = path.join(serverRoot, 'uploads', doc.filename);
        console.log('Attempting to delete file:', filePath);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('File deleted successfully:', filePath);
        } else {
            console.log('File not found at path:', filePath);
        }

        // Delete associated data and the document itself
        await Signature.deleteMany({ documentId: id });
        await Audit.deleteMany({ documentId: id });
        await ExternalSignature.deleteMany({ documentId: id });
        await Document.findByIdAndDelete(id);

        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (err) {
        console.error('Error deleting document:', err);
        next(err);
    }
};

export const deleteMultipleDocs = async (req, res, next) => {
    try {
        const { docIds } = req.body;
        if (!docIds || !Array.isArray(docIds) || docIds.length === 0) {
            return res.status(400).json({ message: 'Document IDs are required.' });
        }

        // Find all documents to get their paths for file deletion
        const docsToDelete = await Document.find({
            _id: { $in: docIds },
            user: req.user.id // Ensure user can only delete their own documents
        });

        if (docsToDelete.length === 0) {
            return res.status(404).json({ message: 'No matching documents found to delete.' });
        }

        // Delete physical files
        docsToDelete.forEach(doc => {
            const filePath = path.join(serverRoot, 'uploads', doc.filename);
            console.log('Attempting to delete file:', filePath);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('File deleted successfully:', filePath);
            } else {
                console.log('File not found at path:', filePath);
            }
        });

        // Get the actual IDs of the documents that were found and are being deleted
        const actualIdsToDelete = docsToDelete.map(doc => doc._id);

        // Delete all associated data from the database in bulk
        await Signature.deleteMany({ documentId: { $in: actualIdsToDelete } });
        await Audit.deleteMany({ documentId: { $in: actualIdsToDelete } });
        await ExternalSignature.deleteMany({ documentId: { $in: actualIdsToDelete } });
        await Document.deleteMany({ _id: { $in: actualIdsToDelete } });

        res.status(200).json({ message: `${actualIdsToDelete.length} documents deleted successfully.` });
    } catch (err) {
        console.error('Error deleting multiple documents:', err);
        next(err);
    }
};

// ADMIN: One-time migration endpoint to fix old document paths
export const migrateNormalizePaths = async (req, res, next) => {
    try {
        const result = await Document.updateMany(
            { path: { $regex: /\\/ } },
            [
                { $set: { path: { $replaceAll: { input: "$path", find: "\\", replacement: "/" } } } }
            ]
        );
        res.json({ message: 'Migration complete', modifiedCount: result.modifiedCount });
    } catch (err) {
        next(err);
    }
}; 