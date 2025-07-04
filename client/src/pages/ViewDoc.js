import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from '../utils/axios';
import { HiDocumentText, HiPencilAlt, HiMail, HiShieldCheck, FaSpinner, FaTimesCircle } from 'react-icons/hi';
import ExternalSignatureModal from '../components/ExternalSignatureModal';
import AuditTrailModal from '../components/AuditTrailModal';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function ViewDoc(){
    const { id } = useParams();
    const navigate = useNavigate();
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [numPages, setNumPages] = useState(null);
    const [showExternalSignatureModal, setShowExternalSignatureModal] = useState(false);
    const [showAuditTrail, setShowAuditTrail] = useState(false);

    console.log('ViewDoc component loaded with id:', id);

    useEffect(() =>{
        const fetchDoc = async () =>{
            setLoading(true);
            try{
                const token = localStorage.getItem('token');
                console.log('Fetching document with token:', token ? 'Token exists' : 'No token');
                const res = await axios.get(`/api/docs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                console.log('Document fetched successfully:', res.data);
                setDoc(res.data);
                setError('');
            } 
            catch(err){
                console.error('Failed to fetch document:', err);
                setError('Failed to load document. It may not exist or you might not have permission.');
            } 
            finally{
                setLoading(false);
            }
        };
        fetchDoc();
    }, [id]);

    const handleExternalSignatureSuccess = (data) =>{
        console.log('External signature request created:', data);
    };

    const handleProceedToSign = ()=>{
        console.log('Proceed to Sign clicked, navigating to:', `/sign/${id}`);
        navigate(`/sign/${id}`);
    };

    if(loading){
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                    <HiDocumentText className="animate-pulse text-blue-500 h-16 w-16 mx-auto" />
                    <p className="text-lg font-semibold mt-4 text-gray-700 dark:text-gray-300">Loading Document...</p>
                </div>
            </div>
        );
    }

    if(error){
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                    <HiDocumentText className="text-red-500 h-12 w-12 mx-auto" />
                    <p className="text-lg font-semibold mt-4 text-gray-800 dark:text-gray-200">Error</p>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
                    <button onClick={() => navigate('/dashboard')} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return(
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 dark:border-gray-700">
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <HiDocumentText className="text-blue-500 text-4xl" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{doc.originalname}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ready for your action</p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setShowAuditTrail(true)}
                            className="btn bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 flex-1 sm:flex-none flex items-center justify-center gap-2"
                        >
                            <HiShieldCheck />
                            <span>Audit Trail</span>
                        </button>
                        <button
                            onClick={() => setShowExternalSignatureModal(true)}
                            className="btn bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none flex items-center justify-center gap-2"
                        >
                            <HiMail />
                            <span>Request Signature</span>
                        </button>
                        <Link to={`/sign/${id}`} className="btn bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none flex items-center justify-center gap-2">
                            <HiPencilAlt />
                            <span>Proceed to Sign</span>
                        </Link>
                    </div>
                </div>
                <div className="flex justify-center bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                    <div className="max-w-3xl w-full mx-auto overflow-auto p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
                        <Document file={`https://signature-app-u9ue.onrender.com${doc.path}`} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                            {Array.from(new Array(numPages), (el, idx) => (
                                <Page key={idx} pageNumber={idx + 1} width={800} className="mb-4 border rounded shadow" />
                            ))}
                        </Document>
                    </div>
                </div>
            </div>

            <ExternalSignatureModal
                isOpen={showExternalSignatureModal}
                onClose={() => setShowExternalSignatureModal(false)}
                documentId={id}
                documentName={doc.originalname}
                onSuccess={handleExternalSignatureSuccess}
            />

=            <AuditTrailModal
                isOpen={showAuditTrail}
                onClose={() => setShowAuditTrail(false)}
                documentId={id}
            />
        </div>
    );
} 