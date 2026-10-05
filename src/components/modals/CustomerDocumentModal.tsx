import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { CustomerDocument } from '../../types/erp';
import {
  FileText,
  Upload,
  X,
  CheckCircle2,
  Image as ImageIcon,
  FileCode,
  FileSpreadsheet,
  FileCheck,
  CreditCard,
  Camera,
  Layers,
  Sparkles
} from 'lucide-react';

interface CustomerDocumentModalProps {
  isOpen: boolean;
  customerId: string;
  customerName: string;
  onClose: () => void;
}

export const CustomerDocumentModal: React.FC<CustomerDocumentModalProps> = ({
  isOpen,
  customerId,
  customerName,
  onClose
}) => {
  const { addCustomerDocument } = useERP();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CustomerDocument['category']>('national_id');
  const [fileType, setFileType] = useState<'pdf' | 'image' | 'cad' | 'doc'>('pdf');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const categoryOptions = [
    {
      id: 'national_id',
      label: 'بطاقة الرقم القومي / إثبات الشخصية',
      desc: 'صورة بطاقة العميل أو السجل التجاري والبطاقة الضريبية',
      icon: CreditCard,
      defaultExt: 'pdf'
    },
    {
      id: 'site_photos',
      label: 'صور الموقع والمعاينة الميدانية',
      desc: 'صور وفيديوهات الموقع أثناء رفع المقاسات الأولية',
      icon: Camera,
      defaultExt: 'image'
    },
    {
      id: 'sketch_drawing',
      label: 'رسم كروكي / مخطط أولي (Sketch)',
      desc: 'مخططات الأبعاد وتوزيع الأجهزة ونقاط الكهرباء والسباكة',
      icon: FileCode,
      defaultExt: 'pdf'
    },
    {
      id: 'signed_contract',
      label: 'العقد الورقي الموقع (Scanner)',
      desc: 'نسخة العقد الموقعة ورقياً من العميل مع الشروط المعتمدة',
      icon: FileCheck,
      defaultExt: 'pdf'
    },
    {
      id: 'payment_receipt',
      label: 'إيصال سداد / شيك مالي',
      desc: 'صورة إيصال التحويل البنكي أو شيك الدفعة المقدمة',
      icon: FileSpreadsheet,
      defaultExt: 'image'
    },
    {
      id: 'other',
      label: 'مستند أو مرفق آخر',
      desc: 'عروض أسعار خارجية أو مواصفات خاصة بالأجهزة',
      icon: Layers,
      defaultExt: 'doc'
    }
  ];

  const handleCategorySelect = (catId: CustomerDocument['category']) => {
    setCategory(catId);
    const cat = categoryOptions.find(c => c.id === catId);
    if (cat) {
      setFileType(cat.defaultExt as any);
      if (!title) {
        setTitle(cat.label);
        setFileName(`${catId}_${customerName.replace(/\s+/g, '_')}.${cat.defaultExt === 'image' ? 'jpg' : cat.defaultExt}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const generatedFileName = fileName.trim() || `${title.replace(/\s+/g, '_')}.${fileType === 'image' ? 'jpg' : fileType}`;

    addCustomerDocument({
      customerId,
      title,
      category,
      fileType,
      fileName: generatedFileName,
      fileSize: fileSize || '1.8 MB',
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5 relative max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#C87A38] flex items-center justify-center font-bold border border-amber-200">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                إضافة وأرشفة مستند للعميل: {customerName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                أرشفة الوثائق التعاقدية والميدانية وبطاقات الهوية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Category Selector Cards */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">تصنيف ونوع المستند *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categoryOptions.map(cat => {
                const isSelected = category === cat.id;
                const IconComponent = cat.icon;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id as any)}
                    className={`p-3 rounded-2xl border text-right transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-[#361D13] text-white border-[#361D13] shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`p-1.5 rounded-xl shrink-0 ${isSelected ? 'bg-white/10 text-amber-300' : 'bg-white text-slate-600 border border-slate-200'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-black text-xs">{cat.label}</p>
                      <p className={`text-[10px] leading-tight ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {cat.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document Title & File Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">عنوان / اسم المستند *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: بطاقة الرقم القومي - الوجهين"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">صيغة الملف (Format)</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="pdf">ملف مستند PDF (أدوبي ريدر)</option>
                <option value="image">صورة (JPG / PNG)</option>
                <option value="cad">مخطط هندسي (CAD / DXF)</option>
                <option value="doc">مستند نصي (Word / Office)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم الملف الافتراضي</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="national_id_front_back.pdf"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-left text-slate-700"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">حجم الملف التقديري</label>
              <input
                type="text"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="2.4 MB"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-left text-slate-700"
                dir="ltr"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ملاحظات توضيحية على المستند</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب أي ملاحظات أو أرقام إيصالات مرتبطة بالمستند..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30"
            ></textarea>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#361D13] hover:bg-[#23120A] text-white font-black shadow-lg transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#C87A38]" />
              <span>أرشفة وحفظ المستند</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
