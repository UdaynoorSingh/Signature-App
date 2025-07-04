import React, { useState } from 'react';
import axios from '../utils/axios';
import { HiMail, HiDocumentText } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/forgot-password', { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen lg:grid lg:grid-cols-2">
            <div className="hidden lg:flex flex-col justify-center items-center bg-blue-800 p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-teal-600 to-indigo-800 animate-gradient-xy z-0"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 1.5, y: 100 }}
                    animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.2 } }}
                    className="absolute -top-20 -left-40 w-96 h-96 bg-white/10 rounded-full filter blur-2xl"
                ></motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 1.5, y: -100 }}
                    animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.4 } }}
                    className="absolute -bottom-24 -right-20 w-80 h-80 bg-white/10 rounded-full filter blur-2xl"
                ></motion.div>

                <motion.div
                    className="relative z-10 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.8 } }}
                >
                    <HiDocumentText className="h-20 w-20 mx-auto mb-6" />
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Forgot Your Password?</h1>
                    <p className="text-lg text-indigo-200">No problem. We'll help you reset it.</p>
                </motion.div>
            </div>

            <div className="flex flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
                <motion.div
                    className="sm:mx-auto sm:w-full sm:max-w-md"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h2 variants={itemVariants} className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Reset your password
                    </motion.h2>
                    <motion.p variants={itemVariants} className="mt-2 text-center text-sm text-gray-600">
                        Enter your email and we'll send you a link to reset it.
                    </motion.p>
                </motion.div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <motion.div
                        className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <motion.div variants={itemVariants}>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <div className="mt-1 relative">
                                    <HiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </motion.div>

                            {error && (
                                <motion.div className="bg-red-50 border-l-4 border-red-400 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <p className="text-sm text-red-700">{error}</p>
                                </motion.div>
                            )}

                            {message && (
                                <motion.div className="bg-green-50 border-l-4 border-green-400 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <p className="text-sm text-green-700">{message}</p>
                                </motion.div>
                            )}

                            <motion.div variants={itemVariants}>
                                <motion.button
                                    type="submit"
                                    disabled={loading || !!message}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? 'Sending Link...' : 'Send Reset Link'}
                                </motion.button>
                            </motion.div>
                        </form>
                        <motion.div className="mt-6 text-center" variants={itemVariants}>
                            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Back to Login
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
} 