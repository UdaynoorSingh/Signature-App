import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from '../utils/axios';

export default function PublicRoute({ children }) {
    const [isValid, setIsValid] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setIsValid(false);
                setLoading(false);
                return;
            }

            try {
                // Try to fetch user data to validate token
                await axios.get('/api/docs/');
                setIsValid(true);
            } catch (error) {
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

    if (isValid) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
} 