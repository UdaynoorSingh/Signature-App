import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import CircularRevealPage from './components/CircularRevealPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import SignDoc from './pages/SignDoc';
import ViewDoc from './pages/ViewDoc';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ExternalSign from './pages/ExternalSign';
import ExternalSignatureRequests from './pages/ExternalSignatureRequests';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <ThemeProvider>
            <UserProvider>
                <Router>
                    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
                        <Navbar />
                        <main>
                            <Routes>
                                <Route path="/login" element={<PublicRoute><CircularRevealPage><Login /></CircularRevealPage></PublicRoute>} />
                                <Route path="/register" element={<PublicRoute><CircularRevealPage><Register /></CircularRevealPage></PublicRoute>} />
                                <Route path="/forgot-password" element={<PublicRoute><CircularRevealPage><ForgotPassword /></CircularRevealPage></PublicRoute>} />
                                <Route path="/reset-password/:token" element={<PublicRoute><CircularRevealPage><ResetPassword /></CircularRevealPage></PublicRoute>} />
                                <Route path="/verify-email" element={<PublicRoute><CircularRevealPage><EmailVerificationPage /></CircularRevealPage></PublicRoute>} />
                                <Route path="/external-sign/:token" element={<CircularRevealPage><ExternalSign /></CircularRevealPage>} />

                                <Route path="/dashboard" element={<ProtectedRoute><CircularRevealPage><Dashboard /></CircularRevealPage></ProtectedRoute>} />
                                <Route path="/upload" element={<ProtectedRoute><CircularRevealPage><Upload /></CircularRevealPage></ProtectedRoute>} />
                                <Route path="/sign/:id" element={<ProtectedRoute><CircularRevealPage><SignDoc /></CircularRevealPage></ProtectedRoute>} />
                                <Route path="/view/:id" element={<ProtectedRoute><CircularRevealPage><ViewDoc /></CircularRevealPage></ProtectedRoute>} />
                                <Route path="/external-signatures" element={<ProtectedRoute><CircularRevealPage><ExternalSignatureRequests /></CircularRevealPage></ProtectedRoute>} />
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </main>
                    </div>
                </Router>
            </UserProvider>
        </ThemeProvider>
    );
}

export default App; 