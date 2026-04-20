import { useEffect, useRef, useState } from 'react';

export default function WebcamCapture({ onCapture, disabled = false }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setError('');
        setIsReady(true);
      } catch (cameraError) {
        setError('No se pudo acceder a la webcam. Revisa permisos del navegador.');
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || disabled) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCapture(dataUrl);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto" />
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="button"
        onClick={handleCapture}
        disabled={!isReady || disabled || Boolean(error)}
        className="w-full rounded-lg bg-cafeto-dark text-white py-2 font-semibold disabled:opacity-50"
      >
        Capturar foto
      </button>
    </div>
  );
}
