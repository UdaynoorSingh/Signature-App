import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from '../utils/axios';
import SignatureModal from '../components/SignatureModal';
import RejectionModal from '../components/RejectionModal';
import { FaCheck, FaTimes } from 'react-icons/fa';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ExternalSign = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [documentData, setDocumentData] = useState(null);
    const [signerInfo, setSignerInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [numPages, setNumPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [signaturePosition, setSignaturePosition] = useState({ x: 0, y: 0, page: 1 });
    const [submitting, setSubmitting] = useState(false);
    const [pageState, setPageState] = useState('initial'); 
    const [placedFields, setPlacedFields] = useState([]);

    useEffect(() =>{
        fetchDocumentData();
    }, [token]);

    const fetchDocumentData = async () => {
        try{
            const response = await axios.get(`/api/external-signatures/document/${token}`);
            setDocumentData(response.data.document);
            setSignerInfo(response.data.signerInfo);
        } 
        catch(error){
            if(error.response?.status === 404){
                setError('Invalid or expired signature link');
            } 
            else if(error.response?.status === 410){
                setError('This signature link has expired');
            } 
            else if(error.response?.status === 409){
                setError('This document has already been signed or rejected.');
            } 
            else{
                setError('Failed to load document');
            }
        } 
        finally{
            setLoading(false);
        }
    };

    const onDocumentLoadSuccess = ({numPages}) => {
        setNumPages(numPages);
    };

    const handlePageClick = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setSignaturePosition({ x, y, page: currentPage });
        setShowSignatureModal(true);
    };

    const handleSignatureSubmit = (signatureData) => {
        setShowSignatureModal(false);
        setPlacedFields(prev => [
            ...prev,
            {
                ...signatureData,
                x: signaturePosition.x,
                y: signaturePosition.y,
                page: signaturePosition.page,
                id: Date.now() + Math.random()
            }
        ]);
    };

    const handleRemoveField = (id) =>{
        setPlacedFields(prev => prev.filter(f => f.id !== id));
    };

    const handleFinalize = async () =>{
        if(placedFields.length === 0){
            alert('Please place at least one signature field.');
            return;
        }
        setSubmitting(true);
        try{
            await axios.post(`/api/external-signatures/sign/${token}`, {
                signatures: placedFields.map(f => ({
                    content: f.content,
                    fontStyle: f.fontStyle,
                    fontSize: f.fontSize,
                    color: f.color,
                    x: f.x,
                    y: f.y,
                    page: f.page,
                    fieldId: f.id
                }))
            });
            alert('Document signed successfully!');
            navigate('/');
        } 
        catch(error){
            setError('Failed to submit signature. Please try again.');
        } 
        finally{
            setSubmitting(false);
        }
    };

    const handleRejectionSuccess = ()=>{
        setPageState('rejected');
    };

    if(loading){
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading document...</p>
                </div>
            </div>
        );
    }

    if(pageState === 'rejected'){
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-4 p-8 bg-white rounded-lg shadow-lg">
                    <FaCheck className="text-5xl text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Response Submitted</h2>
                    <p className="mt-2 text-gray-600">You have successfully declined to sign this document.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    if(error){
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-4">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <h2 className="text-lg font-semibold mb-2">Error</h2>
                        <p>{error}</p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{pageState === 'signing' ? 'Sign Document' : 'Review Document'}</h1>
                            <p className="text-gray-600">
                                Document: {documentData?.originalname}
                            </p>
                            {signerInfo && (
                                <p className="text-sm text-gray-500">
                                    Signing as: {signerInfo.name} ({signerInfo.email})
                                </p>
                            )}
                        </div>
                        {pageState === 'initial' && (
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowRejectionModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                                    <FaTimes /> Decline
                                </button>
                                <button onClick={() => setPageState('signing')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                                    <FaCheck /> Review & Sign
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {pageState === 'signing' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {numPages>1 && (
                            <div className="bg-gray-50 px-6 py-3 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm text-gray-600">
                                            Page {currentPage} of {numPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                                            disabled={currentPage === numPages}
                                            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center p-6">
                            <div
                                className="border border-gray-300 cursor-crosshair relative"
                                onClick={handlePageClick}
                                style={{ width: 600 }}>
                                <Document
                                    file={`https://signature-app-u9ue.onrender.com/uploads/${documentData?.filename}`}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    loading={
                                        <div className="flex items-center justify-center h-96">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    } >
                                    <Page
                                        pageNumber={currentPage}
                                        width={600}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                    />
                                </Document>
                                {placedFields.filter(f => f.page === currentPage).map(field =>(
                                    <div
                                        key={field.id}
                                        className="absolute z-10 cursor-pointer bg-blue-600 text-white rounded-full px-2 py-1 text-xs flex items-center"
                                        style={{ left: field.x - 10, top: field.y - 10 }}
                                        title="Signature Field"
                                        onClick={e => { e.stopPropagation(); handleRemoveField(field.id); }}
                                    >
                                        ✍
                                    </div>
                                ))}
                                <div className="absolute top-2 right-2 text-xs text-gray-500 bg-white bg-opacity-80 rounded px-2 py-1">Click to add signature field</div>
                            </div>
                        </div>
                        <div className="flex justify-end p-6">
                            <button
                                onClick={handleFinalize}
                                disabled={submitting}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Finish Signing'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {pageState === 'initial' && (
                <div className="text-center py-20 px-4">
                    <h2 className="text-3xl font-bold text-gray-800">You have been requested to sign this document.</h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Please review the signing request. You can choose to proceed with signing or decline the request.</p>
                </div>
            )}

            {showSignatureModal &&(
                <SignatureModal
                    isOpen={showSignatureModal}
                    onClose={() => setShowSignatureModal(false)}
                    onApply={handleSignatureSubmit}
                    title="Add Your Signature"
                />
            )}

            <RejectionModal
                isOpen={showRejectionModal}
                onClose={() => setShowRejectionModal(false)}
                onSubmit={handleRejectionSuccess}
                token={token}
            />

            {submitting&&(
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Submitting signature...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExternalSign; 