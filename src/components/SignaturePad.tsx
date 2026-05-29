import React, { useRef, useState, useEffect } from 'react';
import { Trash2, CheckCircle2, Paintbrush } from 'lucide-react';

interface SignaturePadProps {
  label: string;
  placeholder?: string;
  onSave: (signatureDataUrl: string) => void;
  brandColor?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  label,
  placeholder = "Assine com o mouse ou toque do dedo aqui dentro...",
  onSave,
  brandColor = '#3b82f6'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set scale based on client size
    canvas.width = canvas.parentElement?.clientWidth || 400;
    canvas.height = 120;

    // Set brush settings
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b'; // Slate 800 for clean dark line
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Check if Touch Event
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Auto-save when drawing stops
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      onSave(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSave("");
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Paintbrush className="w-3.5 h-3.5" style={{ color: brandColor }} />
          {label}
        </span>
        {hasDrawn && (
          <button
            type="button"
            onClick={clearCanvas}
            className="text-[10px] text-red-500 hover:text-red-650 flex items-center gap-1 transition"
          >
            <Trash2 className="w-3 h-3" /> Limpar
          </button>
        )}
      </div>

      <div className="relative border border-slate-200 rounded-lg overflow-hidden bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full signature-canvas opacity-95"
        />
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-[11px] px-2 text-center select-none font-sans italic">
            {placeholder}
          </div>
        )}
        {hasDrawn && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] pointer-events-none font-mono">
            <CheckCircle2 className="w-2.5 h-2.5 animate-bounce" /> Assinado Digitalmente
          </div>
        )}
      </div>
    </div>
  );
};
