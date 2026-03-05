import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
  title: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Camera access denied or not available.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg');
        setCapturedImage(base64);
        setIsCaptured(true);
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleRetake = () => {
    setIsCaptured(false);
    setCapturedImage(null);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-matte-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[3rem] overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-beige-100 flex justify-between items-center">
          <h3 className="text-xl font-serif font-bold italic">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-matte-black">
            <X size={24} />
          </button>
        </div>

        <div className="relative aspect-video bg-black">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center text-white p-10 text-center">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className={`w-full h-full object-cover ${isCaptured ? 'hidden' : 'block'}`}
              />
              {capturedImage && (
                <img 
                  src={capturedImage} 
                  className={`w-full h-full object-cover ${isCaptured ? 'block' : 'hidden'}`} 
                  alt="Captured" 
                />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </>
          )}
        </div>

        <div className="p-8 flex justify-center gap-4">
          {!isCaptured ? (
            <button
              onClick={capturePhoto}
              className="bg-matte-black text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
            >
              <Camera size={20} /> Capture Photo
            </button>
          ) : (
            <>
              <button
                onClick={handleRetake}
                className="border border-matte-black text-matte-black px-10 py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-beige-50 transition-all"
              >
                <RefreshCw size={20} /> Retake
              </button>
              <button
                onClick={handleConfirm}
                className="bg-matte-black text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              >
                <Check size={20} /> Use Photo
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CameraCapture;
