import React, {useState, useEffect} from 'react';
import axios from '../utils/axios';
import {Document, Page, pdfjs} from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ExternalSignatureModal = ({isOpen, onClose, documentId, documentName, documentPath, onSuccess}) => {
    const [formData, setFormData] = useState({
        signerEmail: '',
        signerName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) =>{
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try{
            const response = await axios.post('/api/external-signatures/create',{
                documentId,
                signerEmail: formData.signerEmail,
                signerName: formData.signerName,
            });

            setSuccess('Signature request sent successfully!');
            setFormData({ signerEmail: '', signerName: '' });

            if(onSuccess){
                onSuccess(response.data);
            }

            setTimeout(() =>{
                onClose();
                setSuccess('');
            }, 2000);

        } 
        catch (error){
            setError(error.response?.data?.message || 'Failed to send signature request');
        } 
        finally{
            setLoading(false);
        }
    };

    if(!isOpen) return null;

    return(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Request External Signature
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Document:</p>
                    <p className="font-medium text-gray-800">{documentName}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Signer Name *
                        </label>
                        <input
                            type="text"
                            name="signerName"
                            value={formData.signerName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter signer's full name"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Signer Email *
                        </label>
                        <input
                            type="email"
                            name="signerEmail"
                            value={formData.signerEmail}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter signer's email address"
                        />
                    </div>

                    {error&&(
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {success &&(
                        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                            {success}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send Request'}
                        </button>
                    </div>
                </form>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                        <strong>How it works:</strong>
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• An email will be sent to the signer with a secure link</li>
                        <li>• The signer can sign without creating an account</li>
                        <li>• The link expires in 7 days for security</li>
                        <li>• You'll be notified when the document is signed</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ExternalSignatureModal; 