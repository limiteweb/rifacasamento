
import React, { useState, useEffect, useRef } from 'react';
import { generateVideo } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const VEO_LOADING_MESSAGES = [
  "Warming up the virtual cameras...",
  "Directing the digital actors...",
  "Rendering the first few frames...",
  "Applying special effects...",
  "The creative AI is hard at work...",
  "Finalizing the video masterpiece...",
  "Almost there, just polishing the lens..."
];

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('A majestic lion roaring on a cliff at sunset, cinematic lighting');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const messageIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const keyStatus = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(keyStatus);
      }
    };
    checkApiKey();
  }, []);
  
  useEffect(() => {
    if (isLoading) {
      setLoadingMessage(VEO_LOADING_MESSAGES[0]);
      messageIntervalRef.current = window.setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = VEO_LOADING_MESSAGES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % VEO_LOADING_MESSAGES.length;
          return VEO_LOADING_MESSAGES[nextIndex];
        });
      }, 4000);
    } else {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
    }
    return () => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
    };
  }, [isLoading]);

  const handleSelectApiKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success to avoid race conditions
      setHasApiKey(true);
    }
  };

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for the video.');
      return;
    }
    if (!hasApiKey) {
      setError('Please select an API key before generating a video.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);

    try {
      const videoBlob = await generateVideo(prompt, aspectRatio);
      const url = URL.createObjectURL(videoBlob);
      setGeneratedVideoUrl(url);
    } catch (e: any) {
      console.error(e);
      let errorMessage = e.message || 'An unknown error occurred.';
      if (errorMessage.includes("Requested entity was not found")) {
        errorMessage = "API Key not found or invalid. Please select a valid API key.";
        setHasApiKey(false);
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasApiKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">API Key Required</h2>
          <p className="text-gray-600 mb-6">
            To use the Veo video generator, you need to select an API key. This service may incur costs.
          </p>
          <button
            onClick={handleSelectApiKey}
            className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Select API Key
          </button>
          <p className="text-xs text-gray-500 mt-4">
            For more information on billing, please visit the{' '}
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              official documentation
            </a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 sm:p-6 lg:p-8">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
          <LoadingSpinner />
          <p className="mt-4 text-lg font-semibold">{loadingMessage}</p>
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Veo Video Generator</h1>
          <p className="text-lg text-gray-400 mt-2">Bring your ideas to life with AI-powered video generation.</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
                Video Prompt
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A futuristic city with flying cars at night"
                rows={4}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    aspectRatio === '16:9' ? 'bg-purple-600 text-white ring-2 ring-purple-400' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  16:9 (Landscape)
                </button>
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    aspectRatio === '9:16' ? 'bg-purple-600 text-white ring-2 ring-purple-400' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  9:16 (Portrait)
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={isLoading}
              className="w-full py-4 text-lg font-bold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Generating...' : 'Generate Video'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}

        {generatedVideoUrl && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-center mb-4">Your Generated Video</h2>
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
              <video
                src={generatedVideoUrl}
                controls
                className="w-full h-auto"
                autoPlay
                loop
                muted
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <a
              href={generatedVideoUrl}
              download={`veo-video-${new Date().getTime()}.mp4`}
              className="mt-6 w-full block text-center py-3 font-semibold rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
            >
              Download Video
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;
