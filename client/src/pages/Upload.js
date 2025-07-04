import React, { useState } from 'react';
import axios from '../utils/axios';
import { HiUpload } from 'react-icons/hi';

export default function Upload() {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const handleChange = e => setFile(e.target.files[0]);
    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        if(!file){
            setError('Please select a PDF file.');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('token');
        try{
            await axios.post('/api/docs/upload', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            window.location = '/';
        } 
        catch(err){
            setError('Upload failed. Please try again.');
        }
    };
    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
                <h2 className="text-3xl font-bold text-center text-blue-700 mb-2 flex items-center justify-center gap-2">
                    <HiUpload className="text-blue-400 text-3xl" /> Upload PDF
                </h2>
                {error && <div className="bg-red-100 text-red-700 p-2 rounded text-center">{error}</div>}
                <input type="file" accept="application/pdf" onChange={handleChange} className="input" />
                <button className="btn w-full mt-2">Upload</button>
            </form>
        </div>
    );
} 