import React, { useState } from 'react';
import axios from '../utils/axios';

const RejectionModal = ({ isOpen, onClose, onSubmit, token }) => {
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!reason.trim()) {
            setError('Please provide a reason for declining.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            await axios.post(`/api/external-signatures/reject/${token}`, { reason });
            onSubmit(); // Notify parent of success
        } catch (err) {
            setError('Failed to submit rejection. Please try again.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">Decline Document</h2>
                </div>
                <div className="p-6">
                    <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-2">
                        Please provide a reason for declining to sign this document:
                    </label>
                    <textarea
                        id="rejection-reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md h-28 focus:ring-2 focus:ring-red-500"
                        placeholder="e.g., Incorrect information, not the right document, etc."
                    />
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} disabled={submitting} className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-100">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300">
                        {submitting ? 'Submitting...' : 'Decline'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RejectionModal; 