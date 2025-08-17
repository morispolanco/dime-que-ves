import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AppState } from './types';
import { describeImage } from './services/geminiService';
import { CameraIcon, CaptureIcon, RetryIcon, DescribeIcon } from './components/icons';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setAppState(AppState.CAMERA_ACTIVE);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("No se pudo acceder a la cámara. Asegúrate de haber otorgado los permisos necesarios.");
      setAppState(AppState.ERROR);
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureImage = useCallback(() => {
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
        setAppState(AppState.CAPTURED);
        stopCamera();
      }
    }
  }, [videoRef, canvasRef, stopCamera]);
  
  const handleDescribe = async () => {
    if (!imageSrc) return;
    setAppState(AppState.DESCRIBING);
    setDescription('');
    setError('');
    const result = await describeImage(imageSrc);
    if (result.startsWith('Error')) {
      setError(result);
      setAppState(AppState.ERROR);
    } else {
      setDescription(result);
      setAppState(AppState.DESCRIBED);
    }
  };

  const reset = () => {
    setImageSrc(null);
    setDescription('');
    setError('');
    setAppState(AppState.IDLE);
  };
  
  const retake = () => {
    setImageSrc(null);
    setDescription('');
    setError('');
    startCamera();
  }

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [stopCamera]);


  const renderContent = () => {
    switch (appState) {
      case AppState.IDLE:
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-cyan-300">Bienvenido a Visión AI</h2>
            <p className="mb-8 max-w-lg mx-auto text-gray-300">Activa tu cámara para tomar una foto y deja que la inteligencia artificial te describa lo que ve.</p>
            <button
              onClick={startCamera}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center mx-auto"
            >
              <CameraIcon className="w-6 h-6 mr-2" />
              Activar Cámara
            </button>
          </div>
        );

      case AppState.CAMERA_ACTIVE:
        return (
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
            <div className="w-full bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700 mb-6">
              <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
            <button
              onClick={captureImage}
              className="bg-red-600 hover:bg-red-700 text-white font-bold p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-400"
              aria-label="Capturar Foto"
            >
              <CaptureIcon className="w-10 h-10" />
            </button>
          </div>
        );

      case AppState.CAPTURED:
      case AppState.DESCRIBING:
      case AppState.DESCRIBED:
      case AppState.ERROR:
        return (
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
            {imageSrc && <img src={imageSrc} alt="Captura" className="rounded-lg shadow-2xl border-2 border-gray-700 mb-6 w-full" />}
            
            {appState === AppState.DESCRIBING && (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg w-full">
                <Spinner />
                <p className="mt-4 text-cyan-300 animate-pulse">Analizando imagen...</p>
              </div>
            )}

            {appState === AppState.DESCRIBED && (
              <div className="p-6 bg-gray-800 rounded-lg w-full shadow-inner">
                <h3 className="text-xl font-bold mb-3 text-cyan-300">Descripción de la IA:</h3>
                <p className="text-gray-200 whitespace-pre-wrap">{description}</p>
              </div>
            )}
            
            {appState === AppState.ERROR && (
               <div className="p-6 bg-red-900/50 border border-red-500 rounded-lg w-full shadow-inner">
                <h3 className="text-xl font-bold mb-3 text-red-300">Ocurrió un Error</h3>
                <p className="text-red-200">{error}</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              {(appState === AppState.CAPTURED || appState === AppState.ERROR) && (
                <button
                  onClick={handleDescribe}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center"
                >
                  <DescribeIcon className="w-6 h-6 mr-2" />
                  Describir Imagen
                </button>
              )}
              <button
                onClick={retake}
                disabled={appState === AppState.DESCRIBING}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RetryIcon className="w-6 h-6 mr-2" />
                Tomar Otra Foto
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-6">
      <header className="w-full max-w-4xl mx-auto mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Visión AI</span>
          </h1>
          <p className="text-gray-400 mt-2">¿Qué ve tu cámara?</p>
      </header>
      <main className="w-full flex-grow flex items-center justify-center">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
