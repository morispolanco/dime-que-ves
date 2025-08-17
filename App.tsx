
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { interpretImage } from './services/geminiService';
import { Spinner } from './components/Spinner';
import { CameraIcon, SparklesIcon, SpeakerWaveIcon, ArrowPathIcon, PlayIcon } from './components/icons';

type AppState = 'idle' | 'camera_on' | 'capturing' | 'loading' | 'result' | 'error';

export default function App(): React.ReactNode {
  const [appState, setAppState] = useState<AppState>('idle');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setError('');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setAppState('camera_on');
        }
      } else {
        throw new Error('Camera not supported by this browser.');
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      let errorMessage = 'Could not access the camera.';
      if (err instanceof Error && err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
      }
      setError(errorMessage);
      setAppState('error');
    }
  }, [stopCamera]);

  const speak = useCallback((text: string) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(voice => voice.lang.startsWith('es-')) || voices.find(voice => voice.lang.startsWith('es'));
    
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }
    utterance.lang = 'es-ES';
    utterance.rate = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, []);

  // Preload voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const handleCapture = useCallback(async () => {
    setAppState('capturing');
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImageSrc(dataUrl);
        stopCamera();
        setAppState('loading');

        try {
          const interpretationText = await interpretImage(dataUrl);
          setInterpretation(interpretationText);
          speak(interpretationText);
          setAppState('result');
        } catch (err) {
          console.error(err);
          setError('Failed to interpret the image. Please try again.');
          setAppState('error');
        }
      }
    }
  }, [stopCamera, speak]);

  const handleReset = () => {
    stopCamera();
    setImageSrc(null);
    setInterpretation('');
    setError('');
    setAppState('idle');
  };

  const renderContent = () => {
    switch (appState) {
      case 'idle':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">Gemini Vision Interpreter</h2>
            <p className="text-gray-400 mb-8">Get a spoken description of your surroundings in Spanish.</p>
            <button
              onClick={startCamera}
              className="bg-cyan-500 text-white font-bold py-3 px-6 rounded-full inline-flex items-center gap-2 hover:bg-cyan-600 transition-colors duration-300 transform hover:scale-105 shadow-lg"
            >
              <CameraIcon />
              Start Camera
            </button>
          </div>
        );
      case 'camera_on':
      case 'capturing':
        return (
          <div className="w-full max-w-2xl relative">
            <video ref={videoRef} className="w-full h-auto rounded-lg shadow-2xl" playsInline />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <button
                onClick={handleCapture}
                disabled={appState === 'capturing'}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-110 active:scale-95 disabled:opacity-50"
                aria-label="Capture photo"
              >
                <div className="w-18 h-18 bg-white rounded-full border-4 border-gray-900"></div>
              </button>
            </div>
          </div>
        );
      case 'loading':
      case 'result':
      case 'error':
        return (
          <div className="w-full max-w-2xl text-center">
            <div className="relative w-full h-auto rounded-lg shadow-2xl overflow-hidden aspect-video bg-gray-800 flex items-center justify-center">
              {imageSrc && <img src={imageSrc} alt="Captured" className="w-full h-full object-contain" />}
              {appState === 'loading' && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white">
                  <Spinner />
                  <p className="mt-4 text-lg font-medium animate-pulse">Gemini está analizando...</p>
                </div>
              )}
            </div>
            
            {appState === 'result' && interpretation && (
              <div className="mt-6 p-6 bg-gray-800 rounded-lg text-left shadow-inner">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2 flex items-center gap-2"><SparklesIcon /> Interpretación de Gemini</h3>
                <p className="text-gray-300 leading-relaxed">{interpretation}</p>
              </div>
            )}

            {appState === 'error' && error && (
              <div className="mt-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button
                onClick={handleReset}
                className="bg-gray-600 text-white font-bold py-3 px-6 rounded-full inline-flex items-center gap-2 hover:bg-gray-700 transition-colors"
              >
                <ArrowPathIcon />
                New Photo
              </button>
              {appState === 'result' && interpretation && (
                <button
                  onClick={() => speak(interpretation)}
                  disabled={isSpeaking}
                  className="bg-cyan-500 text-white font-bold py-3 px-6 rounded-full inline-flex items-center gap-2 hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSpeaking ? <SpeakerWaveIcon /> : <PlayIcon />}
                  {isSpeaking ? 'Hablando...' : 'Listen Again'}
                </button>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center p-4 font-sans">
      <main className="w-full flex-grow flex items-center justify-center">
        {renderContent()}
      </main>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
}
