import React, { useState } from 'react';
import axios from '../utils/axios';
import { HiLockClosed, HiMail, HiDocumentText } from 'react-icons/hi';
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

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/login', form);
            localStorage.setItem('token', res.data.token);

            // Fetch user profile data
            await axios.get('/api/auth/profile');

            // Redirect after successful login and profile fetch
            window.location = '/dashboard';
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen lg:grid lg:grid-cols-2">
            {/* Left Branding Column */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-blue-800 p-12 text-white relative overflow-hidden">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-teal-600 to-indigo-800 animate-gradient-xy z-0"></div>

                {/* Abstract Shapes */}
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
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Welcome Back to Docu-Signer</h1>
                    <p className="text-lg text-indigo-200">The most secure and easy way to sign your documents.</p>
                </motion.div>
            </div>

            {/* Right Form Column */}
            <div className="flex flex-col justify-center bg-gray-50 dark:bg-gray-900 py-12 sm:px-6 lg:px-8">
                <motion.div
                    className="sm:mx-auto sm:w-full sm:max-w-md"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h2 variants={itemVariants} className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                        Sign in to your account
                    </motion.h2>
                    <motion.p variants={itemVariants} className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Or{' '}
                        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                            create a new account
                        </Link>
                    </motion.p>
                </motion.div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <motion.div
                        className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <motion.div variants={itemVariants}>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email address
                                </label>
                                <div className="mt-1 relative">
                                    <HiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                <div className="mt-1 relative">
                                    <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                        placeholder="Password"
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="flex items-center justify-between">
                                <div className="text-sm">
                                    <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                                        Forgot your password?
                                    </Link>
                                </div>
                            </motion.div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4"
                                >
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <motion.div variants={itemVariants}>
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? 'Signing in...' : 'Sign in'}
                                </motion.button>
                            </motion.div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
} 