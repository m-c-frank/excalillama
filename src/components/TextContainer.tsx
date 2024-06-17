import React, { useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { generate_streaming } from './LLM';

interface TextContainerProps {
    id: string;
    x: number;
    y: number;
    text: string;
    onDeleteCallback: CallableFunction
}

const TextContainer = ({ id, x, y, text, onDeleteCallback }: TextContainerProps) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [responses, setResponses] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    const startStream = async () => {
        setIsStreaming(true);
        generate_streaming({
            model: "llama3",
            prompt: text,
            newResponseCallback: (response) => {
                setResponses((prevResponses) => prevResponses + response + '');
            },
        });
    }

    const handleMenuToggle = () => {
        setMenuOpen(!menuOpen);
    };

    const onDeleteClickHandler = () => {
        console.log('Delete clicked')
        onDeleteCallback(id);
    }

    return (
        <Draggable defaultPosition={{ x, y }}>
            <div className="absolute border-solid border-2 border-sky-500 shadow-md rounded-lg p-4">
                <div className="absolute top-2 right-2">
                    <button onClick={handleMenuToggle} className="focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="black" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 12h.01M12 12h.01M18 12h.01"></path>
                        </svg>
                    </button>
                    {menuOpen && (
                        <div className="absolute mt-2 w-48 text-gray-800 bg-white border-solid border-2 border-sky-500 border rounded-md shadow-lg z-11">
                            <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => onDeleteClickHandler()}>Delete</button>
                        </div>
                    )}
                </div>
                <div className="w-96 max-h-96 overflow-y-auto text-gray-800">
                    <p>{text}</p>
                    {!isStreaming &&
                        <button
                        onClick={e => startStream()}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Generate</button>}
                    <p>{responses}</p>
                </div>
            </div>
        </Draggable>
    );
};

export default TextContainer;
