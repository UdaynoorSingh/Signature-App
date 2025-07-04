import React,{useState, useEffect} from 'react';

const SignatureModal = ({isOpen, onClose, onApply, purpose = 'SIGNATURE'}) => {
    const [fullName, setFullName] = useState('');
    const [initials, setInitials] = useState('');
    const [activeTab, setActiveTab] = useState(purpose);
    const [fontSize, setFontSize] = useState(30);
    const [color, setColor] = useState({ r: 0, g: 0, b: 0 });

    useEffect(() => {
        setActiveTab(purpose);
    }, [isOpen, purpose]);

    const signatureStyles = [
        { id: 'style1', name: 'Signature', fontFamily: "'Dancing Script', cursive" },
        { id: 'style2', name: 'Signature', fontFamily: "'Pacifico', cursive" },
        { id: 'style3', name: 'Signature', fontFamily: "'Caveat', cursive" },
        { id: 'style4', name: 'Signature', fontFamily: "'Sacramento', cursive" },
    ];
    const [selectedStyle, setSelectedStyle] = useState(signatureStyles[0].id);

    if(!isOpen) return null;

    const handleApply = ()=>{
        const content = purpose === 'SIGNATURE' ? fullName : initials;
        const type = purpose;
        const style = signatureStyles.find(s => s.id === selectedStyle);

        if(content){
            onApply({ type, content, fontStyle: style.fontFamily, fontSize, color });
            onClose();
        }
    };

    return(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Set your signature details</h2>
                </div>

                <div className="p-6">
                    <div className="flex items-center border-b pb-4">
                        <div className="w-2/3">
                            <label className="text-sm font-medium text-gray-600">Full name:</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Your name"
                            />
                        </div>
                        <div className="w-1/3 px-4">
                            <label className="text-sm font-medium text-gray-600">Initials:</label>
                            <input
                                type="text"
                                value={initials}
                                onChange={(e) => setInitials(e.target.value)}
                                className="mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Your initials"
                            />
                        </div>
                    </div>

                    <div className="flex mt-4">
                        <div className="pr-6 border-r w-32">
                            <button onClick={() => setActiveTab('SIGNATURE')} className={`p-3 text-left w-full rounded-md ${activeTab === 'SIGNATURE' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>Signature</button>
                            <button onClick={() => setActiveTab('INITIAL')} className={`p-3 text-left w-full rounded-md ${activeTab === 'INITIAL' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>Initials</button>
                        </div>

                        <div className="pl-6 flex-1">
                            <h3 className="font-semibold text-gray-700 mb-3">Choose a style</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {signatureStyles.map(style => (
                                    <div
                                        key={style.id}
                                        onClick={() => setSelectedStyle(style.id)}
                                        className={`p-4 border rounded-md cursor-pointer flex items-center justify-center ${selectedStyle === style.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}`}
                                    >
                                        <p style={{ fontFamily: style.fontFamily, fontSize: `${fontSize}px` }}>
                                            {activeTab === 'SIGNATURE' ? (fullName || 'Signature') : (initials || 'AB')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6">
                                <label className="font-semibold text-gray-700 mb-2 block">Adjust Size</label>
                                <input
                                    type="range"
                                    min="14"
                                    max="50"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="font-semibold text-gray-700 mb-2 block">Signature Color</label>
                        <input
                            type="color"
                            value={`#${((1<<24) + (color.r*255<<16) + (color.g*255<<8) + (color.b*255)).toString(16).slice(1)}`}
                            onChange={e =>{
                                const hex = e.target.value;
                                setColor({
                                    r: parseInt(hex.slice(1,3),16)/255,
                                    g: parseInt(hex.slice(3,5),16)/255,
                                    b: parseInt(hex.slice(5,7),16)/255
                                });
                            }}
                            className="w-12 h-8 border rounded"
                        />
                    </div>
                </div>

                <div className="p-6 bg-gray-50 flex justify-end items-center rounded-b-lg">
                    <button onClick={onClose} className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-md mr-4">Cancel</button>
                    <button onClick={handleApply} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Apply</button>
                </div>
            </div>
        </div>
    );
};

export default SignatureModal; 