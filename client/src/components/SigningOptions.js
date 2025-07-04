import React from 'react';
import { FaSignature, FaPenNib, FaFileAlt, FaCalendarAlt } from 'react-icons/fa';

const SigningOptions = ({ onFieldSelect, userSignature, userInitial }) => {

    const handleDragStart = (e, fieldType) => {
        let data;
        if (fieldType === 'SIGNATURE') {
            if (!userSignature) {
                e.preventDefault();
                alert("Please create a signature first.");
                return;
            }
            data = userSignature;
        } else if (fieldType === 'INITIAL') {
            if (!userInitial) {
                e.preventDefault();
                alert("Please create an initial first.");
                return;
            }
            data = userInitial;
        } else {
            data = { type: fieldType, content: fieldType, fontSize: 18 }; // Default font size
        }
        e.dataTransfer.setData("application/json", JSON.stringify(data));
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow h-full">
            <h2 className="text-lg font-semibold border-b pb-2 mb-4">Signing Options</h2>

            <div>
                <h3 className="text-md font-semibold text-gray-600 mb-2">Required Fields</h3>
                <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'SIGNATURE')}
                    onClick={() => onFieldSelect('SIGNATURE')}
                    className="flex items-center p-3 mb-2 bg-gray-50 rounded-md border border-gray-200 cursor-grab hover:bg-blue-50 hover:border-blue-300"
                >
                    <FaSignature className="mr-3 text-blue-500" />
                    <div>
                        <p className="font-semibold">Signature</p>
                        {userSignature ? (
                            <p style={{ fontFamily: userSignature.fontStyle, fontSize: `${userSignature.fontSize}px` }}>{userSignature.content}</p>
                        ) : (
                            <p className="text-sm text-gray-400">Click to create</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-600 mb-2">Optional Fields</h3>
                <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'INITIAL')}
                    onClick={() => onFieldSelect('INITIAL')}
                    className="flex items-center p-3 mb-2 bg-gray-50 rounded-md border border-gray-200 cursor-grab hover:bg-blue-50 hover:border-blue-300"
                >
                    <FaPenNib className="mr-3 text-green-500" />
                    <div>
                        <p className="font-semibold">Initials</p>
                        {userInitial ? (
                            <p style={{ fontFamily: userInitial.fontStyle, fontSize: `${userInitial.fontSize}px` }}>{userInitial.content}</p>
                        ) : (
                            <p className="text-sm text-gray-400">Click to create</p>
                        )}
                    </div>
                </div>
                <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'DATE')}
                    onClick={() => onFieldSelect('DATE')}
                    className="flex items-center p-3 mb-2 bg-gray-50 rounded-md border border-gray-200 cursor-grab hover:bg-blue-50 hover:border-blue-300"
                >
                    <FaCalendarAlt className="mr-3 text-red-500" />
                    <p className="font-semibold">Date</p>
                </div>
                <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'TEXT')}
                    onClick={() => onFieldSelect('TEXT')}
                    className="flex items-center p-3 mb-2 bg-gray-50 rounded-md border border-gray-200 cursor-grab hover:bg-blue-50 hover:border-blue-300"
                >
                    <FaFileAlt className="mr-3 text-yellow-500" />
                    <p className="font-semibold">Text</p>
                </div>
            </div>
        </div>
    );
};

export default SigningOptions; 