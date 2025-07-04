import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineDocument, HiPlus, HiTrash, HiCheckCircle, HiDownload, HiBadgeCheck, HiOutlineSelector, HiOutlineXCircle } from 'react-icons/hi';
import RejectionModal from '../components/RejectionModal';
import AuditTrailModal from '../components/AuditTrailModal';

const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 12
        }
    }
};

const emptyStateVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            delay: 0.2,
            type: 'spring',
        }
    }
};

export default function Dashboard() {
    const [docs, setDocs] = useState([]);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedDocs, setSelectedDocs] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [rejectionModal, setRejectionModal] = useState({ isOpen: false, docId: null });
    const [auditTrailModal, setAuditTrailModal] = useState({ isOpen: false, docId: null });

    useEffect(() => {
        const fetchDocs = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/docs/', { headers: { Authorization: `Bearer ${token}` } });
                setDocs(res.data);
            } catch (err) {
                console.error("Failed to fetch documents", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, []);

    const handleDownload = async (doc) => {
        try {
            const fileUrl = `https://signature-app-u9ue.onrender.com${doc.signedPath}`;
            const response = await axios.get(fileUrl, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const signedFilename = doc.originalname.replace(/\.pdf$/i, '-signed.pdf');
            link.setAttribute('download', signedFilename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            alert('Could not download the file.');
        }
    };

    const handleSingleDelete = async (docId) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            const tempDocs = docs.filter(doc => doc._id !== docId);
            setDocs(tempDocs);
            try {
                await axios.delete(`/api/docs/${docId}`);
            } catch (error) {
                console.error("Failed to delete document", error);
                setDocs(docs);
                alert('Failed to delete document.');
            }
        }
    };

    const handleSelectDoc = (docId) => {
        const newSelectedDocs = new Set(selectedDocs);
        if (newSelectedDocs.has(docId)) {
            newSelectedDocs.delete(docId);
        } else {
            newSelectedDocs.add(docId);
        }
        setSelectedDocs(newSelectedDocs);
    };

    const handleBulkDelete = async () => {
        if (selectedDocs.size === 0) return;
        if (window.confirm(`Are you sure you want to delete ${selectedDocs.size} documents?`)) {
            const originalDocs = [...docs];
            const newDocs = docs.filter(doc => !selectedDocs.has(doc._id));
            setDocs(newDocs);
            try {
                await axios.delete('/api/docs/', { data: { docIds: Array.from(selectedDocs) } });
                setIsDeleteMode(false);
                setSelectedDocs(new Set());
            } catch (error) {
                console.error("Failed to delete documents", error);
                setDocs(originalDocs);
                alert('Failed to delete documents.');
            }
        }
    };

    const MotionButton = ({ children, ...props }) => (
        <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            {...props}
        >
            {children}
        </motion.button>
    );

    const ActionButton = ({ onClick, children, className, disabled }) => (
        <MotionButton onClick={onClick} disabled={disabled} className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors shadow-sm ${className}`}>
            {children}
        </MotionButton>
    );

    const CardButton = ({ to, onClick, children, className = '' }) => {
        const buttonContent = (
            <motion.div className="w-full flex items-center justify-center gap-2" whileTap={{ scale: 0.95 }}>
                {children}
            </motion.div>
        );

        if (to) {
            if (isDeleteMode) {
                return (
                    <div
                        className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${className} cursor-not-allowed opacity-60`}
                        onClick={e => e.preventDefault()}
                    >
                        {buttonContent}
                    </div>
                );
            }
            return (
                <Link
                    to={to}
                    className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${className}`}
                >
                    {buttonContent}
                </Link>
            );
        } else {
            return (
                <MotionButton
                    onClick={onClick}
                    className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${className}`}
                >
                    {buttonContent}
                </MotionButton>
            );
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100">Document Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage, sign, and track all your documents.</p>
                    </div>
                    <div className="flex items-center gap-3 mt-4 sm:mt-0">
                        <AnimatePresence>
                            {isDeleteMode ? (
                                <motion.div key="deleteMode" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="flex items-center gap-3">
                                    <ActionButton onClick={() => setIsDeleteMode(false)} className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <HiOutlineXCircle /> Cancel
                                    </ActionButton>
                                    <ActionButton onClick={handleBulkDelete} disabled={selectedDocs.size === 0} className="bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400">
                                        <HiTrash /> Delete ({selectedDocs.size})
                                    </ActionButton>
                                </motion.div>
                            ) : (
                                <motion.div key="normalMode" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="flex items-center gap-3">
                                    <ActionButton onClick={() => setIsDeleteMode(true)} className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <HiOutlineSelector /> Select
                                    </ActionButton>
                                    <ActionButton onClick={() => window.location.href = '/upload'} className="bg-blue-600 text-white hover:bg-blue-700">
                                        <HiPlus /> Upload New
                                    </ActionButton>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                {loading ? <div className="text-center py-10 dark:text-white">Loading...</div> : (
                    <AnimatePresence>
                        {docs.length > 0 ? (
                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                            >
                                {docs.map(doc => {
                                    const isSelected = selectedDocs.has(doc._id);
                                    const isSigned = !!doc.signedPath;
                                    return (
                                        <motion.div
                                            key={doc._id}
                                            variants={itemVariants}
                                            layout
                                            whileHover={{ y: -8, boxShadow: "0px 20px 30px rgba(0,0,0,0.12)" }}
                                            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col relative overflow-hidden ${isDeleteMode ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500 shadow-xl' : ''}`}
                                            onClick={() => isDeleteMode && handleSelectDoc(doc._id)}
                                        >
                                            <AnimatePresence>
                                                {isDeleteMode && (
                                                    <motion.div
                                                        className="absolute top-3 right-3 z-10"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        exit={{ scale: 0 }}
                                                    >
                                                        {isSelected ? <HiCheckCircle className="h-6 w-6 text-blue-500 bg-white rounded-full" /> : <div className="h-6 w-6 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700"></div>}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <div className="flex items-start justify-between">
                                                {isSigned ? <HiBadgeCheck className="h-10 w-10 text-green-500" /> : <HiOutlineDocument className="h-10 w-10 text-blue-500" />}
                                                {!isDeleteMode && (
                                                    <MotionButton onClick={(e) => { e.stopPropagation(); handleSingleDelete(doc._id); }} className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50 text-gray-400 hover:text-red-600 z-10">
                                                        <HiTrash className="h-5 w-5" />
                                                    </MotionButton>
                                                )}
                                            </div>
                                            <div className="font-semibold text-lg mt-3 mb-2 text-gray-800 dark:text-white break-words truncate" title={doc.originalname}>{doc.originalname}</div>
                                            <div className="mt-auto pt-5 flex items-center gap-2">
                                                {isSigned ? (
                                                    <>
                                                        <CardButton onClick={(e) => { e.stopPropagation(); handleDownload(doc); }} className="flex-1 bg-green-600 text-white hover:bg-green-700">
                                                            <HiDownload /> Download Signed
                                                        </CardButton>
                                                        <CardButton to={`/view/${doc._id}`} className="flex-1 bg-gray-500 text-white hover:bg-gray-600">
                                                            View Original
                                                        </CardButton>
                                                    </>
                                                ) : (
                                                    <CardButton to={`/view/${doc._id}`} className="bg-blue-600 text-white hover:bg-blue-700">
                                                        View & Sign
                                                    </CardButton>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                className="text-center bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 mt-6"
                                variants={emptyStateVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                            >
                                <HiOutlineDocument className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No documents found</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by uploading your first document.</p>
                                <div className="mt-6">
                                    <Link to="/upload" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                        <HiPlus className="-ml-1 mr-2 h-5 w-5" />
                                        Upload Document
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
            {rejectionModal.isOpen && <RejectionModal docId={rejectionModal.docId} onClose={() => setRejectionModal({ isOpen: false, docId: null })} />}
            {auditTrailModal.isOpen && <AuditTrailModal docId={auditTrailModal.docId} onClose={() => setAuditTrailModal({ isOpen: false, docId: null })} />}
        </div>
    );
} 