import React, {useState, useEffect} from 'react';
import axios from '../utils/axios';
import {FaTimes, FaShieldAlt, FaUser, FaClock, FaMapMarkerAlt} from 'react-icons/fa';

const AuditTrailModal = ({isOpen, onClose, documentId})=>{
    const [trail, setTrail] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(()=>{
        if (isOpen && documentId){
            setLoading(true);
            setError('');
            axios.get(`/api/audit/${documentId}`)
                .then(res =>{
                    setTrail(res.data);
                })
                .catch(err =>{
                    setError('Failed to load audit trail.');
                    console.error(err);
                })
                .finally(() =>{
                    setLoading(false);
                });
        }
    }, [isOpen, documentId]);

    if(!isOpen) return null;

    const formatTimestamp=(ts)=>new Date(ts).toLocaleString();

    return(
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
                <header className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                    <div className="flex items-center">
                        <FaShieldAlt className="text-xl text-blue-600 mr-3" />
                        <h2 className="text-xl font-bold text-gray-800">Document Audit Trail</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <FaTimes className="text-xl text-gray-600" />
                    </button>
                </header>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {loading && <p>Loading history...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && (
                        <ul className="space-y-4">
                            {trail.map(item => (
                                <li key={item._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="font-semibold text-gray-800">{item.action}</p>
                                    <div className="flex items-center text-sm text-gray-500 mt-2">
                                        <div className="flex items-center mr-4">
                                            <FaUser className="mr-2" />
                                            <span>{item.userId ? item.userId.name : 'External Signer'}</span>
                                        </div>
                                        <div className="flex items-center mr-4">
                                            <FaClock className="mr-2" />
                                            <span>{formatTimestamp(item.timestamp)}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <FaMapMarkerAlt className="mr-2" />
                                            <span>IP: {item.ip}</span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {trail.length === 0 && <p>No history found for this document.</p>}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditTrailModal; 