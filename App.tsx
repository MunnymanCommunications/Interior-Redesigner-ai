import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ChatInterface from './components/ChatInterface';
import Loader from './components/Loader';
import FullscreenModal from './components/FullscreenModal';
import { ChatMessage, GeminiImagePart } from './types';
import { fileToBase64, getDesignSuggestions, editImage } from './services/geminiService';

const initialChat: ChatMessage[] = [{
    role: 'model',
    text: 'Welcome! I am your AI interior designer. Please upload an image of your room to begin.'
}];

const App: React.FC = () => {
    const [originalImages, setOriginalImages] = useState<GeminiImagePart[]>([]);
    const [originalDisplayImage, setOriginalDisplayImage] = useState<string | null>(null);
    const [displayImage, setDisplayImage] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>(initialChat);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isAnalyzed, setIsAnalyzed] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [canShare, setCanShare] = useState(false);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check for Web Share API with file sharing support
        if (navigator.share && typeof navigator.canShare === 'function') {
            // Create a dummy file to check for file sharing capability.
            const dummyFile = new File([""], "dummy.txt", { type: "text/plain" });
            if (navigator.canShare({ files: [dummyFile] })) {
                setCanShare(true);
            }
        }
    }, []);

    const handleRestart = useCallback(() => {
        setOriginalImages([]);
        setOriginalDisplayImage(null);
        setDisplayImage(null);
        setSuggestions([]);
        setChatHistory(initialChat);
        setIsLoading(false);
        setLoadingMessage('');
        setError(null);
        setIsAnalyzed(false);
        setShowOriginal(false);
        setIsFullscreen(false);
    }, []);

    const handleImageUpload = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        handleRestart(); 
        setIsLoading(true);
        setLoadingMessage('Processing your image...');

        try {
            const imagePromises = files.map(async file => ({
                inlineData: {
                    mimeType: file.type,
                    data: await fileToBase64(file),
                },
            }));
            const processedImages = await Promise.all(imagePromises);
            const firstImageSrc = `data:${processedImages[0].inlineData.mimeType};base64,${processedImages[0].inlineData.data}`;
            
            setOriginalImages(processedImages);
            setOriginalDisplayImage(firstImageSrc);
            setDisplayImage(firstImageSrc);
            
            setChatHistory([{
                role: 'model',
                text: "Great, I've got your image! You can now ask me to make changes, or click 'Analyze Image' for some creative suggestions."
            }]);

        } catch (err: any) {
            const errorMessage = err.message || 'An unknown error occurred.';
            setError(errorMessage);
            setChatHistory([{ role: 'model', text: `Sorry, I encountered an error. ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    }, [handleRestart]);
    
    const handleAnalyzeClick = useCallback(async () => {
        if (originalImages.length === 0) return;
        setIsLoading(true);
        setLoadingMessage('Analyzing your space...');
        setError(null);
        setSuggestions([]);

        try {
            const designSuggestions = await getDesignSuggestions(originalImages);
            setSuggestions(designSuggestions);
            setIsAnalyzed(true);
            setChatHistory(prev => [...prev, {
                role: 'model',
                text: "I've analyzed your room. What creative direction should we take? Feel free to use one of my suggestions or share your own idea."
            }]);
        } catch (err: any) {
             const errorMessage = err.message || 'An unknown error occurred.';
            setError(errorMessage);
            setChatHistory(prev => [...prev, { role: 'model', text: `Sorry, I encountered an error. ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    }, [originalImages]);
    
    const handleSendMessage = useCallback(async (prompt: string) => {
        if (!prompt || originalImages.length === 0) return;

        setIsLoading(true);
        setLoadingMessage('Visualizing your ideas...');
        setError(null);
        
        if (window.innerWidth < 1024) {
            imageContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        const userMessage: ChatMessage = { role: 'user', text: prompt };
        setChatHistory(prev => [...prev, userMessage]);
        
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
                setShowOriginal(false);
            }
            
            setChatHistory(prev => [...prev, modelResponse]);

        } catch (err: any) {
            const errorMessage = err.message || 'An unknown error occurred.';
            setError(errorMessage);
            setChatHistory(prev => [...prev, { role: 'model', text: `I'm sorry, I couldn't process that request. ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    }, [originalImages, suggestions]);

    const handleDownloadImage = useCallback(() => {
        const imageToDownload = showOriginal ? originalDisplayImage : displayImage;
        if (!imageToDownload) return;

        const link = document.createElement('a');
        link.href = imageToDownload;
        link.download = `design-pro-${new Date().toISOString()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [displayImage, originalDisplayImage, showOriginal]);

    const handleShareImage = useCallback(async () => {
        const imageToShare = showOriginal ? originalDisplayImage : displayImage;
        if (!imageToShare || !canShare) return;

        try {
            const response = await fetch(imageToShare);
            const blob = await response.blob();
            const file = new File([blob], `design-pro-${new Date().toISOString()}.png`, { type: blob.type });

            await navigator.share({
                files: [file],
                title: 'AI Interior Design',
                text: 'Check out this design I created with AI Interior Designer Pro!',
            });
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('Error sharing image:', err);
                setError("Sorry, sharing failed. Please try again.");
            }
        }
    }, [displayImage, originalDisplayImage, showOriginal, canShare]);

    const currentImageSrc = showOriginal ? originalDisplayImage : displayImage;
    const canToggle = originalDisplayImage && displayImage && originalDisplayImage !== displayImage;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <Header onRestart={handleRestart} />
            <main className="container mx-auto p-4 sm:p-8">
                <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/30 border border-gray-700/50 grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-120px)]">
                    <div ref={imageContainerRef} className="relative flex items-center justify-center border-r-0 lg:border-r border-gray-700/50">
                        {isLoading && <Loader message={loadingMessage} />}
                        {currentImageSrc ? (
                            <>
                                <img 
                                    src={currentImageSrc} 
                                    alt="Interior design" 
                                    className="object-contain max-h-full max-w-full rounded-l-2xl cursor-zoom-in"
                                    onClick={() => setIsFullscreen(true)}
                                />
                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                    {canToggle && canShare && (
                                        <button 
                                            onClick={handleShareImage}
                                            className="p-2 bg-gray-900/60 backdrop-blur-sm rounded-full text-white hover:bg-gray-800/80 transition"
                                            aria-label="Share image"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                        </button>
                                    )}
                                    <button 
                                        onClick={handleDownloadImage}
                                        className="p-2 bg-gray-900/60 backdrop-blur-sm rounded-full text-white hover:bg-gray-800/80 transition"
                                        aria-label="Save image"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                                    {originalImages.length > 0 && !isAnalyzed && (
                                        <button 
                                            onClick={handleAnalyzeClick}
                                            disabled={isLoading}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-500 transition disabled:bg-gray-600"
                                        >
                                            Analyze Image
                                        </button>
                                    )}
                                    {canToggle && (
                                        <div className="flex items-center gap-3 bg-gray-900/60 backdrop-blur-sm p-2 rounded-full">
                                            <span className={`text-sm font-medium ${showOriginal ? 'text-white' : 'text-gray-400'}`}>Before</span>
                                            <button onClick={() => setShowOriginal(!showOriginal)} role="switch" aria-checked={!showOriginal} className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700">
                                                <span className={`${!showOriginal ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`} />
                                            </button>
                                            <span className={`text-sm font-medium ${!showOriginal ? 'text-white' : 'text-gray-400'}`}>After</span>
                                        </div>
                                    )}
                                </div>
                            </>
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
            {isFullscreen && currentImageSrc && (
                <FullscreenModal imageUrl={currentImageSrc} onClose={() => setIsFullscreen(false)} />
            )}
        </div>
    );
};

export default App;