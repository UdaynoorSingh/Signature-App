import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { v4 as uuidv4 } from 'uuid';
import axios from '../utils/axios';

import SignatureModal from '../components/SignatureModal';
import SigningOptions from '../components/SigningOptions';
import { FaSpinner, FaTimesCircle } from 'react-icons/fa';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const SignDoc = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [docDetails, setDocDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [numPages, setNumPages] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPurpose, setModalPurpose] = useState('SIGNATURE');

    const [userSignature, setUserSignature] = useState(null);
    const [userInitial, setUserInitial] = useState(null);

    const [placedFields, setPlacedFields] = useState([]);
    const [editingField, setEditingField] = useState({ id: null, content: '' });

    // For resizing fields
    const [resizingField, setResizingField] = useState(null);

    const pdfWrapperRef = useRef(null);
    const [isSigning, setIsSigning] = useState(false);

    console.log('SignDoc component loaded with id:', id);

    useEffect(() => {
        setLoading(true);
        console.log('Fetching document details for id:', id);
        axios.get(`/api/docs/${id}`)
            .then(res => {
                console.log('Document details fetched successfully:', res.data);
                setDocDetails(res.data);
                setError('');
            })
            .catch(err => {
                console.error("Failed to fetch doc details", err);
                setError('Failed to load document. It may have been deleted or you may not have permission to view it.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    const handleResizeStart = (e, field) => {
        e.preventDefault();
        e.stopPropagation();
        setResizingField({
            id: field.id,
            initialX: e.clientX,
            initialFontSize: field.fontSize,
        });
    };

    useEffect(() => {
        const handleResize = (e) => {
            if (!resizingField) return;
            const dx = e.clientX - resizingField.initialX;
            const newFontSize = Math.max(8, resizingField.initialFontSize + dx * 0.1); // Scale factor

            setPlacedFields(prev => prev.map(f =>
                f.id === resizingField.id ? { ...f, fontSize: newFontSize } : f
            ));
        };

        const handleResizeEnd = () => {
            setResizingField(null);
        };

        if (resizingField) {
            window.addEventListener('mousemove', handleResize);
            window.addEventListener('mouseup', handleResizeEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleResize);
            window.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [resizingField]);


    const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

    const handleFieldSelect = (type) => {
        if (type === 'SIGNATURE' || type === 'INITIAL') {
            setModalPurpose(type);
            setIsModalOpen(true);
        } else {
            // For fields like DATE or TEXT that don't need a modal
            const newField = {
                id: uuidv4(),
                type,
                page: 1, // Default to first page
                x: 50,  // Default position
                y: 50,
                content: type === 'DATE' ? new Date().toLocaleDateString() : 'Text',
                fontSize: 18,
            };
            setPlacedFields(prev => [...prev, newField]);
        }
    };

    const handleApplySignature = (fieldData) => {
        if (fieldData.type === 'SIGNATURE') setUserSignature(fieldData);
        else if (fieldData.type === 'INITIAL') setUserInitial(fieldData);
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const fieldDataStr = e.dataTransfer.getData("application/json");
        if (!fieldDataStr) return;

        const fieldData = JSON.parse(fieldDataStr);
        const targetPage = e.currentTarget;
        const pageRect = targetPage.getBoundingClientRect();
        const pageNum = parseInt(targetPage.dataset.pageNumber, 10);

        const x = e.clientX - pageRect.left - (fieldData.offsetX || 0);
        const y = e.clientY - pageRect.top - (fieldData.offsetY || 0);

        if (fieldData.isRepositioning) {
            setPlacedFields(prev => prev.map(f =>
                f.id === fieldData.id ? { ...f, x, y, page: pageNum } : f
            ));
            return;
        }

        const newField = { id: uuidv4(), page: pageNum, x, y, ...fieldData };

        if (newField.type === 'DATE') newField.content = new Date().toLocaleDateString();
        if (newField.type === 'TEXT') newField.content = 'Text';
        if (!newField.color) newField.color = { r: 0, g: 0, b: 0 };

        setPlacedFields(prev => [...prev, newField]);

        if (newField.type === 'TEXT') {
            setEditingField({ id: newField.id, content: newField.content });
        }
    };

    const handlePlacedFieldDragStart = (e, field) => {
        if (editingField.id === field.id || resizingField) return;
        const rect = e.target.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        const data = { ...field, isRepositioning: true, offsetX, offsetY };
        e.dataTransfer.setData("application/json", JSON.stringify(data));
    };

    const handleFinalize = async () => {
        if (placedFields.length === 0) return alert("Please place at least one field.");
        setIsSigning(true);
        try {
            await axios.post('/api/signatures/finalize', { documentId: id, fields: placedFields });
            alert('Document signed successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to sign document", error);
            alert('Failed to sign document.');
        } finally {
            setIsSigning(false);
        }
    };

    const handleDeleteField = (fieldId) => {
        setPlacedFields(prev => prev.filter(f => f.id !== fieldId));
    };

    const handleDoubleClickOnField = (field) => {
        if (field.type === 'TEXT') {
            setEditingField({ id: field.id, content: field.content });
        }
    };

    const handleEditingBlur = () => {
        setPlacedFields(prev => prev.map(f =>
            f.id === editingField.id ? { ...f, content: editingField.content } : f
        ));
        setEditingField({ id: null, content: '' });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-blue-600 h-12 w-12 mx-auto" />
                    <p className="text-lg font-semibold mt-4 text-gray-700 dark:text-gray-300">Loading Document...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                    <FaTimesCircle className="text-red-500 h-12 w-12 mx-auto" />
                    <p className="text-lg font-semibold mt-4 text-gray-800 dark:text-gray-200">Error</p>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
                    <button onClick={() => navigate('/dashboard')} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-800">
            <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
                <h1 className="text-xl font-semibold dark:text-white">{docDetails?.originalname || 'Sign Document'}</h1>
                <button onClick={handleFinalize} disabled={isSigning} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 flex items-center">
                    {isSigning && <FaSpinner className="animate-spin mr-2" />}
                    Finish Signing
                </button>
            </header>
            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 p-6 overflow-y-auto" ref={pdfWrapperRef}>
                    {docDetails ? (
                        <Document file={`https://signature-app-u9ue.onrender.com${docDetails.path}`} onLoadSuccess={onDocumentLoadSuccess} className="flex flex-col items-center">
                            {Array.from(new Array(numPages), (el, index) => (
                                <div key={`page_wrapper_${index + 1}`} className="relative pdf-page-wrapper" data-page-number={index + 1} onDragOver={handleDragOver} onDrop={handleDrop}>
                                    <Page pageNumber={index + 1} className="mb-4 shadow-lg" />
                                    {placedFields.filter(f => f.page === index + 1).map(field => {
                                        const isEditing = editingField.id === field.id;
                                        return (
                                            <div
                                                key={field.id}
                                                draggable={!isEditing}
                                                onDragStart={(e) => handlePlacedFieldDragStart(e, field)}
                                                onDoubleClick={() => handleDoubleClickOnField(field)}
                                                className={`group absolute p-1 border border-blue-400 border-dashed cursor-move ${isEditing ? 'bg-white dark:bg-gray-700' : 'bg-blue-100 bg-opacity-50 dark:bg-blue-900/50'}`}
                                                style={{ left: `${field.x}px`, top: `${field.y}px`, zIndex: 10 }}
                                            >
                                                <button
                                                    onClick={() => handleDeleteField(field.id)}
                                                    className="absolute -top-2.5 -right-2.5 bg-red-500 text-white rounded-full w-5 h-5 items-center justify-center hidden group-hover:flex z-20"
                                                >
                                                    &times;
                                                </button>
                                                {isEditing ? (
                                                    <textarea
                                                        value={editingField.content}
                                                        onChange={(e) => setEditingField(c => ({ ...c, content: e.target.value }))}
                                                        onBlur={handleEditingBlur}
                                                        autoFocus
                                                        className="w-full h-full bg-transparent border-none resize-none outline-none dark:text-white"
                                                    />
                                                ) : (
                                                    <span style={{ fontFamily: field.fontStyle, fontSize: `${field.fontSize}px`, color: field.color ? `rgb(${Math.round(field.color.r * 255)},${Math.round(field.color.g * 255)},${Math.round(field.color.b * 255)})` : undefined, whiteSpace: 'pre' }} className="dark:text-white">{field.content}</span>
                                                )}
                                                <div
                                                    onMouseDown={(e) => handleResizeStart(e, field)}
                                                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-600 cursor-se-resize rounded-full hidden group-hover:block"
                                                ></div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </Document>
                    ) : <p className="dark:text-white">Loading document...</p>}
                </main>
                <aside className="w-80 bg-gray-200 dark:bg-gray-900 p-4 overflow-y-auto">
                    <SigningOptions onFieldSelect={handleFieldSelect} userSignature={userSignature} userInitial={userInitial} />
                </aside>
            </div>
            <SignatureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onApply={handleApplySignature} purpose={modalPurpose} />
        </div>
    );
};

export default SignDoc;