import Audit from '../models/Audit.js';
import User from '../models/User.js';

export const getAudit = async (req, res, next) => {
    try {
        const logs = await Audit.find({ documentId: req.params.docId }).populate('userId', 'name email');
        res.json(logs);
    } catch (err) { next(err); }
};

export const getAuditTrail = async (req, res, next) => {
    try {
        const { fileId } = req.params;

        const trail = await Audit.find({ documentId: fileId }).sort({ timestamp: 'asc' }).populate('userId', 'name email');

        if (!trail) {
            return res.status(404).json({ message: 'No audit trail found for this document.' });
        }

        res.json(trail);

    } catch (err) {
        next(err);
    }
}; 