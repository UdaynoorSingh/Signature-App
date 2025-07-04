import React, {useState, useRef} from 'react';
import {HiCamera, HiX, HiUser} from 'react-icons/hi';
import axios from '../utils/axios';

export default function ProfileModal({isOpen, onClose, onImageUpdate, currentImage}){
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileSelect = (e)=>{
        const file = e.target.files[0];
        if(file){
            if(file.size > 5*1024*1024){ // 5MB limit
                setError('File size must be less than 5MB');
                return;
            }
            if(!file.type.startsWith('image/')){
                setError('Please select an image file');
                return;
            }

            setSelectedFile(file);
            setError('');

            const reader = new FileReader();
            reader.onload = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!selectedFile) return;

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('profileImage', selectedFile);

        try{
            const response = await axios.post('/api/auth/profile/image', formData,{
                headers:{
                    'Content-Type': 'multipart/form-data',
                },
            });

            onImageUpdate(response.data.profileImage);
            onClose();
        } 
        catch(err){
            setError(err.response?.data?.message || 'Failed to upload image');
        } 
        finally{
            setLoading(false);
        }
    };

    const handleRemoveImage = async ()=>{
        setLoading(true);
        try{
            await axios.delete('/api/auth/profile/image');
            onImageUpdate(null);
            onClose();
        } 
        catch(err){
            setError(err.response?.data?.message || 'Failed to remove image');
        } 
        finally{
            setLoading(false);
        }
    };

    if(!isOpen) return null;

    return(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {currentImage ? 'Change Profile Picture' : 'Add Profile Picture'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <HiX className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-center">
                        <div className="relative">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                                />
                            ) : currentImage ? (
                                <img
                                    src={`http://localhost:5000/uploads/profiles/${currentImage}`}
                                    alt="Current profile"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center">
                                    <HiUser className="h-16 w-16 text-gray-400" />
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
                            >
                                <HiCamera className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            {currentImage ? 'Choose new image' : 'Choose image'}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="flex space-x-3 pt-4">
                        {currentImage && (
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                disabled={loading}
                                className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50"
                            >
                                Remove
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={!selectedFile || loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Uploading...' : 'Upload'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 