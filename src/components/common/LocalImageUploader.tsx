import React, { useState, useRef } from 'react';
import { Upload, X, Eye, Image as ImageIcon, Plus, Sparkles, Link as LinkIcon } from 'lucide-react';
import { ImageZoomModal } from './ImageZoomModal';

interface LocalImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
}

const DEMO_PRESET_IMAGES = [
  {
    name: 'مطبخ مودرن HPL أوف وايت',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'مطبخ خشب زان بني دافئ 3D',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'غرفة نوم مودرن خشب اكرليك',
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'تصميم 3D منظور راسي',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800'
  }
];

export const LocalImageUploader: React.FC<LocalImageUploaderProps> = ({
  images,
  onChange,
  maxFiles = 5
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const processFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onChange([...images, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAddPreset = (url: string) => {
    if (!images.includes(url)) {
      onChange([...images, url]);
    }
  };

  const handleAddCustomUrl = () => {
    if (customUrl.trim()) {
      onChange([...images, customUrl.trim()]);
      setCustomUrl('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-4 dir-rtl text-right">
      
      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/80 scale-[1.01]'
            : 'border-slate-300 hover:border-emerald-600 bg-slate-50/80 hover:bg-emerald-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-2xl bg-[#1C352D] text-[#E06F28] flex items-center justify-center shadow-md">
          <Upload className="w-6 h-6" />
        </div>

        <div>
          <p className="text-xs font-black text-slate-900">
            اضغط هنا لرفع صور التصميم الـ 3D محلياً من جهازك
          </p>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">
            أو اسحب وأفلت ملفات الصور هنا (JPG, PNG, WEBP)
          </p>
        </div>
      </div>

      {/* Uploaded Local Images Thumbnails Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>صور التصميم المرفقة محلياً ({images.length}):</span>
            <span className="text-[10px] text-slate-400">اضغط على أي صورة لمعاينتها وتكبيرها Zoom</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((imgUrl, index) => (
              <div
                key={index}
                className="group relative h-28 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100"
              >
                <img
                  src={imgUrl}
                  alt={`uploaded-preview-${index}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImageIndex(index);
                    }}
                    className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-900 text-xs font-bold flex items-center gap-1 shadow-md"
                    title="معاينة وتكبير الصورة"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#E06F28]" />
                    <span>تكبير</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
                    title="حذف الصورة"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-lg bg-slate-900/80 text-white text-[10px] font-mono font-bold">
                  #{index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preset Demo Renderings Toolbar & Option for URL */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>أو اختر نموذج تصميم جاهز للتجربة السريعة:</span>
          </p>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <LinkIcon className="w-3 h-3" />
            <span>إضافة عبر رابط URL</span>
          </button>
        </div>

        {/* Demo Preset Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {DEMO_PRESET_IMAGES.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAddPreset(preset.url)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-xl transition-all flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-[#E06F28]" />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Custom URL Input fallback */}
        {showUrlInput && (
          <div className="flex gap-2 pt-1 animate-in fade-in duration-150">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="ضع رابط الصورة هنا (https://...)"
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border rounded-xl font-mono dir-ltr"
            />
            <button
              type="button"
              onClick={handleAddCustomUrl}
              className="px-3 py-1.5 bg-[#1C352D] text-white text-xs font-bold rounded-xl"
            >
              إضافة
            </button>
          </div>
        )}
      </div>

      {/* Interactive Lightbox Zoom Modal for uploaded images */}
      {previewImageIndex !== null && (
        <ImageZoomModal
          isOpen={previewImageIndex !== null}
          onClose={() => setPreviewImageIndex(null)}
          images={images}
          initialIndex={previewImageIndex}
          title="معاينة وتكبير التصميم المرفوع محلياً"
        />
      )}

    </div>
  );
};
