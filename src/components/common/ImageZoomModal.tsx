import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  X,
  ChevronRight,
  ChevronLeft,
  Download,
  Image as ImageIcon
} from 'lucide-react';

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title = 'معاينة التصميم 3D'
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentIndex(initialIndex);
    resetTransform();
  }, [initialIndex, isOpen]);

  const resetTransform = () => {
    setZoomLevel(1);
    setRotation(0);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.35, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.35, 0.5);
      if (next <= 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPanPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
          resetTransform();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex < images.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          resetTransform();
        }
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === 'r' || e.key === 'R') {
        resetTransform();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `design-rendering-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200 select-none">
      
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/90 to-transparent dir-rtl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E06F28]/20 border border-[#E06F28]/40 flex items-center justify-center text-[#E06F28]">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">{title}</h3>
            <p className="text-xs text-slate-400 font-mono">
              صورة {currentIndex + 1} من {images.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 dir-ltr">
          <button
            onClick={handleDownload}
            title="تحميل الصورة"
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            title="إغلاق (Esc)"
            className="p-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Viewing & Zooming Canvas */}
      <div
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full h-full flex items-center justify-center overflow-hidden p-12 ${
          zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
      >
        <img
          src={currentImage}
          alt={`rendering-${currentIndex}`}
          style={{
            transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
          className="max-w-full max-h-full object-contain pointer-events-none rounded-2xl shadow-2xl transition-all"
        />
      </div>

      {/* Multi-image Navigation Controls */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => {
              if (currentIndex > 0) {
                setCurrentIndex((prev) => prev - 1);
                resetTransform();
              }
            }}
            disabled={currentIndex === 0}
            className={`absolute right-6 top-1/2 -translate-y-1/2 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white transition-all z-20 shadow-2xl ${
              currentIndex === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#1C352D] hover:border-emerald-500'
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <button
            onClick={() => {
              if (currentIndex < images.length - 1) {
                setCurrentIndex((prev) => prev + 1);
                resetTransform();
              }
            }}
            disabled={currentIndex === images.length - 1}
            className={`absolute left-6 top-1/2 -translate-y-1/2 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white transition-all z-20 shadow-2xl ${
              currentIndex === images.length - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#1C352D] hover:border-emerald-500'
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Bottom Zoom Control Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-5 py-3 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
        <button
          onClick={handleZoomOut}
          title="تصغير (-)"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="font-mono text-xs font-bold text-amber-400 min-w-[55px] text-center">
          {Math.round(zoomLevel * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          title="تكبير (+)"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-700 mx-1"></div>

        <button
          onClick={resetTransform}
          title="إعادة الضبط (R)"
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5"
        >
          <Maximize2 className="w-3.5 h-3.5 text-[#E06F28]" />
          <span>إعادة ضبط</span>
        </button>

        <button
          onClick={handleRotate}
          title="تدوير 90°"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {images.length > 1 && (
          <>
            <div className="w-px h-5 bg-slate-700 mx-1"></div>
            <div className="flex gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    resetTransform();
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-[#E06F28] w-6' : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
};
