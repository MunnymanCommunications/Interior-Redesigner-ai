
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ChatInterface from './components/ChatInterface';
import Loader from './components/Loader';
import { ChatMessage, GeminiImagePart } from './types';
import { fileToBase64, getDesignSuggestions, editImage } from './services/geminiService';

const App: React.FC = () => {
    const [originalImages, setOriginalImages] = useState<GeminiImagePart[]>([]);
    const [displayImage, setDisplayImage] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setChatHistory([{
            role: 'model',
            text: 'Welcome! I am your AI interior designer. Please upload an image of your room to begin.'
        }]);
    }, []);

    const handleImageUpload = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        setIsLoading(true);
        setLoadingMessage('Analyzing your space...');
        setError(null);
        setSuggestions([]);
        setChatHistory([]);

        try {
            const imagePromises = files.map(async file => ({
                inlineData: {
                    mimeType: file.type,
                    data: await fileToBase64(file),
                },
            }));
            const processedImages = await Promise.all(imagePromises);
            setOriginalImages(processedImages);
            setDisplayImage(`data:${processedImages[0].inlineData.mimeType};base64,${processedImages[0].inlineData.data}`);

            const designSuggestions = await getDesignSuggestions(processedImages);
            setSuggestions(designSuggestions);
            setChatHistory([{
                role: 'model',
                text: "I've analyzed your room. What creative direction should we take? Feel free to use one of my suggestions or share your own idea."
            }]);

        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            setChatHistory([{
                role: 'model',
                text: `Sorry, I encountered an error. ${err.message}`
            }]);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleSendMessage = useCallback(async (prompt: string) => {
        if (!prompt || originalImages.length === 0) return;

        setIsLoading(true);
        setLoadingMessage('Visualizing your ideas...');
        setError(null);
        
        const userMessage: ChatMessage = { role: 'user', text: prompt };
        setChatHistory(prev => [...prev, userMessage]);
        
        // Clear suggestions after first user interaction
        if(suggestions.length > 0) {
            setSuggestions([]);
        }

        try {
            const { newImageBase64, textResponse } = await editImage(originalImages, prompt);

            const modelResponse: ChatMessage = {
                role: 'model',
                text: textResponse || "Here is the updated design:",
            };

            if (newImageBase64) {
                const newImageUrl = `data:image/png;base64,${newImageBase64}`;
                setDisplayImage(newImageUrl);
                // modelResponse.image = newImageUrl; // We display the main image separately, so no need to put it in chat
            }
            
            setChatHistory(prev => [...prev, modelResponse]);

        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            setChatHistory(prev => [...prev, {
                role: 'model',
                text: `I'm sorry, I couldn't process that request. ${err.message}`
            }]);
        } finally {
            setIsLoading(false);
        }
    }, [originalImages, suggestions]);


    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <Header />
            <main className="container mx-auto p-4 sm:p-8">
                <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/30 border border-gray-700/50 grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-120px)]">
                    <div className="relative flex items-center justify-center border-r-0 lg:border-r border-gray-700/50">
                        {isLoading && <Loader message={loadingMessage} />}
                        {displayImage ? (
                            <img src={displayImage} alt="Interior design" className="object-contain max-h-full max-w-full rounded-l-2xl" />
                        ) : (
                            <ImageUploader onImagesUpload={handleImageUpload} disabled={isLoading} />
                        )}
                    </div>
                    <div className="h-full">
                        <ChatInterface
                            messages={chatHistory}
                            suggestions={suggestions}
                            onSendMessage={handleSendMessage}
                            isLoading={isLoading}
                            hasUploadedImage={originalImages.length > 0}
                        />
                    </div>
                </div>
                {error && <div className="mt-4 p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg">{error}</div>}
            </main>
        </div>
    );
};

export default App;
