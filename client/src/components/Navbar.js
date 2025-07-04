import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {HiDocumentText, HiUpload, HiLogout, HiPlus, HiOutlineMail, HiOutlineViewGrid, HiOutlineSun, HiOutlineMoon, HiOutlineCollection, HiOutlineExternalLink} from 'react-icons/hi';
import axios from '../utils/axios';
import ProfileModal from './ProfileModal';
import {motion} from 'framer-motion';
import {useUser} from '../context/UserContext';
import {useTheme} from '../context/ThemeContext';

export default function Navbar(){
    const {user, setUser, loading} = useUser();
    const {theme, toggleTheme} = useTheme();
    const [showProfileModal, setShowProfileModal] = useState(false);
    const navigate = useNavigate();

    const handleLogout = ()=>{
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const handleProfileImageUpdate = (newImage)=>{
        setUser(prev => ({...prev, profileImage: newImage}));
    };

    return(
        <>
            <nav className="bg-white shadow-md relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-teal-600 to-indigo-800 animate-gradient-xy"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center space-x-4">
                            <Link to="/dashboard" className="flex items-center space-x-2">
                                <HiDocumentText className="h-8 w-8 text-white" />
                                <span className="text-xl font-bold text-white">Docu-Signer</span>
                            </Link>

                            {!loading && user && (
                                <div className="flex items-center space-x-3 border-l border-white/20 pl-4">
                                    <button
                                        onClick={() => setShowProfileModal(true)}
                                        className="relative group"
                                    >
                                        {user.profileImage ? (
                                            <img
                                                src={`https://signature-app-u9ue.onrender.com/uploads/profiles/${user.profileImage}`}
                                                alt="Profile"
                                                className="w-10 h-10 rounded-full object-cover border-2 border-white/50 hover:border-white transition-colors"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/50 hover:bg-white/30 transition-colors flex items-center justify-center group-hover:bg-white/30">
                                                <HiPlus className="h-5 w-5 text-white" />
                                            </div>
                                        )}
                                    </button>
                                    <div className="text-left">
                                        <div className="text-sm font-medium text-white">
                                            {user.name}
                                        </div>
                                        <div className="text-xs text-purple-200">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-5">
                            <motion.button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-indigo-200 hover:text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                                whileHover={{ scale: 1.1, rotate: theme === 'light' ? 15 : -15 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                {theme === 'light' ? <HiOutlineMoon className="h-6 w-6" /> : <HiOutlineSun className="h-6 w-6" />}
                            </motion.button>
                            {!loading && user ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="flex items-center space-x-2 px-3 py-2 text-white/80 font-medium hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                    >
                                        <HiOutlineCollection className="h-5 w-5" />
                                        <span>Dashboard</span>
                                    </Link>
                                    <Link
                                        to="/upload"
                                        className="flex items-center space-x-2 px-3 py-2 text-white/80 font-medium hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                    >
                                        <HiUpload className="h-5 w-5" />
                                        <span>Upload</span>
                                    </Link>
                                    <Link
                                        to="/external-signatures"
                                        className="flex items-center space-x-2 px-3 py-2 text-white/80 font-medium hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                    >
                                        <HiOutlineExternalLink className="h-5 w-5" />
                                        <span>Requests</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 px-3 py-2 text-white/80 font-medium hover:text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                                    >
                                        <HiLogout className="h-5 w-5" />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : !loading && (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        to="/login"
                                        className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <ProfileModal
                isOpen={showProfileModal}
                onClose={() =>setShowProfileModal(false)}
                onImageUpdate={handleProfileImageUpdate}
                currentImage={user?.profileImage}
            />
        </>
    );
} 