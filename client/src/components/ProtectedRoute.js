import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from '../utils/axios';

export default function ProtectedRoute({ children }) {
    const [isValid, setIsValid] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');
            console.log('Checking token:', token ? 'Token exists' : 'No token found');

            if (!token) {
                setIsValid(false);
                setLoading(false);
                return;
            }

            try {
                console.log('Validating token with server...');
                // Use the proper token validation endpoint
                const response = await axios.get('/api/auth/validate');
                console.log('Token validation successful:', response.data);
                setIsValid(true);
            } catch (error) {
                console.log('Token validation failed:', error.response?.status, error.response?.data);
                // If 401 or any error, token is invalid
                localStorage.removeItem('token');
                setIsValid(false);
            }
            setLoading(false);
        };

        validateToken();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!isValid) {
        return <Navigate to="/login" replace />;
    }

    return children;
} 