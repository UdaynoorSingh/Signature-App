import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { HiMail, HiClock, HiCheck, HiX, HiRefresh, HiInformationCircle } from 'react-icons/hi';

const ExternalSignatureRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/external-signatures/requests');
            setRequests(response.data);
        } catch (error) {
            setError('Failed to load signature requests');
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async (requestId) => {
        try {
            await axios.post(`/api/external-signatures/resend/${requestId}`);
            alert('Email sent successfully!');
            fetchRequests(); // Refresh the list
        } catch (error) {
            alert('Failed to resend email');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <HiClock className="text-yellow-500" />;
            case 'sent':
                return <HiMail className="text-blue-500" />;
            case 'signed':
                return <HiCheck className="text-green-500" />;
            case 'expired':
                return <HiX className="text-red-500" />;
            case 'rejected':
                return <HiX className="text-red-500" />;
            default:
                return <HiClock className="text-gray-500" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Pending';
            case 'sent':
                return 'Email Sent';
            case 'signed':
                return 'Signed';
            case 'expired':
                return 'Expired';
            case 'rejected':
                return 'Rejected';
            default:
                return 'Unknown';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredRequests = requests.filter(request => filterStatus === 'all' || request.status === filterStatus);

    const statusFilters = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'sent', label: 'Sent' },
        { key: 'signed', label: 'Signed' },
        { key: 'rejected', label: 'Rejected' },
        { key: 'expired', label: 'Expired' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto mt-10 p-4 md:p-6">
            <div className="bg-white rounded-xl shadow-lg">
                <div className="px-4 md:px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between md:items-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">External Signature Requests</h1>
                        <button
                            onClick={fetchRequests}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 self-start md:self-center"
                        >
                            <HiRefresh className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="px-4 md:px-6 py-3 border-b border-gray-200">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-gray-600 mr-2">Filter by status:</span>
                        {statusFilters.map(filter => (
                            <button
                                key={filter.key}
                                onClick={() => setFilterStatus(filter.key)}
                                className={`px-3 py-1 text-sm rounded-full ${filterStatus === filter.key
                                    ? 'bg-blue-600 text-white font-semibold'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {/* Content Area */}
                <div className="overflow-x-auto">
                    {filteredRequests.length > 0 ? (
                        <>
                            {/* Desktop Table */}
                            <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Document
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Signer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Expires
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredRequests.map((request) => (
                                        <tr key={request._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {request.documentId?.originalname || 'Unknown Document'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {formatDate(request.documentId?.uploadedAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {request.signerName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {request.signerEmail}
                                                </div>
                                                {request.status === 'rejected' && request.rejectionReason && (
                                                    <div className="group relative mt-2">
                                                        <HiInformationCircle className="text-red-500" />
                                                        <div className="absolute bottom-full mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            {request.rejectionReason}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(request.status)}
                                                    <span className={`text-sm font-medium ${request.status === 'signed' ? 'text-green-600' :
                                                        request.status === 'expired' || request.status === 'rejected' ? 'text-red-600' :
                                                            request.status === 'sent' ? 'text-blue-600' :
                                                                'text-yellow-600'
                                                        }`}>
                                                        {getStatusText(request.status)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(request.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(request.expiresAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {request.status === 'signed' && (
                                                    <span className="text-green-600">
                                                        Signed on {formatDate(request.signedAt)}
                                                    </span>
                                                )}
                                                {request.status === 'expired' && (
                                                    <span className="text-red-600">Expired</span>
                                                )}
                                                {(request.status === 'pending' || request.status === 'sent') && (
                                                    <button
                                                        onClick={() => handleResendEmail(request._id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Resend Email
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Mobile Cards */}
                            <div className="md:hidden p-4 space-y-4">
                                {filteredRequests.map(request => (
                                    <div key={request._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-gray-900 break-all">{request.documentId?.originalname || 'Unknown Document'}</p>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${request.status === 'signed' ? 'bg-green-100 text-green-800' :
                                                request.status === 'rejected' || request.status === 'expired' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {getStatusText(request.status)}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-600">
                                            <p><span className="font-semibold">To:</span> {request.signerName} ({request.signerEmail})</p>
                                            <p><span className="font-semibold">Sent:</span> {formatDate(request.createdAt)}</p>
                                            <p><span className="font-semibold">Expires:</span> {formatDate(request.expiresAt)}</p>
                                            {request.status === 'rejected' && request.rejectionReason && (
                                                <p className="mt-1 text-red-600"><span className="font-semibold">Reason:</span> {request.rejectionReason}</p>
                                            )}
                                        </div>
                                        <div className="mt-3 border-t pt-3">
                                            {(request.status === 'pending' || request.status === 'sent') && (
                                                <button
                                                    onClick={() => handleResendEmail(request._id)}
                                                    className="text-blue-600 hover:text-blue-900 font-semibold"
                                                >
                                                    Resend Email
                                                </button>
                                            )}
                                            {request.status === 'signed' && (
                                                <p className="text-green-600 font-semibold">Signed on {formatDate(request.signedAt)}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            <HiMail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-lg font-medium">
                                {requests.length === 0 ? 'No signature requests yet.' : 'No requests match the current filter.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExternalSignatureRequests; 