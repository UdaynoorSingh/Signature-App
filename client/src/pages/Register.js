import React, { useState } from 'react';
import axios from '../utils/axios';
import { HiUser, HiMail, HiLockClosed, HiDocumentText } from 'react-icons/hi';
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

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/register', form);
            setSuccess(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Join Docu-Signer Today</h1>
                    <p className="text-lg text-indigo-200">Start signing documents with the utmost security and ease.</p>
                </motion.div>
            </div>

            <div className="flex flex-col justify-center bg-gray-50 dark:bg-gray-900 py-12 sm:px-6 lg:px-8">
                <motion.div
                    className="sm:mx-auto sm:w-full sm:max-w-md"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h2 variants={itemVariants} className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                        Create your account
                    </motion.h2>
                    <motion.p variants={itemVariants} className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                            Sign in
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
                        {success ? (
                            <motion.div
                                className="text-center"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <h3 className="text-xl font-semibold text-green-800">Registration Successful!</h3>
                                <p className="mt-2 text-gray-600">{success}</p>
                                <p className="mt-4">
                                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                        Click here to Login
                                    </Link>
                                </p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <motion.div variants={itemVariants}>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Full Name
                                    </label>
                                    <div className="mt-1 relative">
                                        <HiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            autoComplete="name"
                                            required
                                            onChange={handleChange}
                                            className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </motion.div>

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
                                            autoComplete="new-password"
                                            required
                                            onChange={handleChange}
                                            className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                            placeholder="Password"
                                        />
                                    </div>
                                </motion.div>

                                {error && (
                                    <motion.div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                                    </motion.div>
                                )}

                                <motion.div variants={itemVariants}>
                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {loading ? 'Creating account...' : 'Create Account'}
                                    </motion.button>
                                </motion.div>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
} 