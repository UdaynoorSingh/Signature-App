import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from '../utils/axios';

export default function EmailVerificationPage() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('Verifying your email...');

    useEffect(() => {
        const verify = async () => {
            const token = searchParams.get('token');
            if (!token) {
                setStatus('Invalid verification link. No token provided.');
                return;
            }

            try {
                const res = await axios.get(`/api/auth/verify-email?token=${token}`);
                setStatus(res.data.message || res.data);
            } catch (error) {
                console.error(error);
                setStatus(error.response?.data?.message || error.response?.data || 'Verification failed. Please try again or contact support.');
            }
        };

        verify();
    }, [searchParams]);

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center space-y-4">
                <h2 className="text-2xl font-bold text-blue-700">Email Verification</h2>
                <p className="text-gray-600">{status}</p>
                {status.includes('successful') && (
                    <Link to="/login" className="btn inline-block">
                        Go to Login
                    </Link>
                )}
            </div>
        </div>
    );
} 