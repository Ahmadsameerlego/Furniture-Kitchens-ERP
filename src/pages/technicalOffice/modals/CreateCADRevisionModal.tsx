import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { TechnicalDesignRevision, CadFileAttachment } from '../../../types/technicalOffice';
import {
  X,
  FileSpreadsheet,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  Sparkles,
  Layers,
  AlertCircle,
  FileCheck
} from 'lucide-react';

interface CreateCADRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  technicalProjectId: string;
  defaultVersionNumber?: number;
}

export const CreateCADRevisionModal: React.FC<CreateCADRevisionModalProps> = ({
  isOpen,
  onClose,
  technicalProjectId,
  defaultVersionNumber = 1
}) => {
  const { addTechnicalDesignRevision, technicalProjects, currentUser } = useERP();

  const project = technicalProjects.find(p => p.id === technicalProjectId);

  const [versionNumber, setVersionNumber] = useState(defaultVersionNumber);
  const [versionCode, setVersionCode] = useState(`DWG-V${defaultVersionNumber}.0`);
  const [title, setTitle] = useState(
    defaultVersionNumber === 1
      ? 'المخطط التنفيذي الشامل وشوب دروينج المطبخ (Executive Shop Drawings)'
      : `تحديث المخططات التنفيذية V${defaultVersionNumber}.0`
  );
  const [designerName, setDesignerName] = useState(currentUser.fullName || 'مهندس المكتب الفني');
  const [changeDescription, setChangeDescription] = useState(
    defaultVersionNumber === 1
      ? 'المخطط التنفيذي الأولي المعتمد بناءً على الرفع المساحي بالليزر وتوزيع الأجهزة ونقاط الـ MEP.'
      : 'تعديل قطاعات الشاسيه وتحديث خلوصات الحوائط بناءً على المتطلبات الهندسية.'
  );
  const [status, setStatus] = useState<'draft' | 'under_review' | 'approved'>('approved');

  // Attached CAD files list
  const [attachedFiles, setAttachedFiles] = useState<CadFileAttachment[]>([
    {
      id: `cad-${Date.now()}-1`,
      name: `${project?.projectNumber || 'PRJ'}_Executive_Shop_Drawings.pdf`,
      fileType: 'pdf',
      fileSize: '4.8 MB',
      url: '#',
      uploadedAt: new Date().toISOString().substring(0, 10),
      uploadedBy: currentUser.fullName
    },
    {
      id: `cad-${Date.now()}-2`,
      name: `${project?.projectNumber || 'PRJ'}_Architectural_Layout.dwg`,
      fileType: 'dwg',
      fileSize: '14.2 MB',
      url: '#',
      uploadedAt: new Date().toISOString().substring(0, 10),
      uploadedBy: currentUser.fullName
    },
    {
      id: `cad-${Date.now()}-3`,
      name: `${project?.projectNumber || 'PRJ'}_MEP_Plumbing_Electric.pdf`,
      fileType: 'pdf',
      fileSize: '2.1 MB',
      url: '#',
      uploadedAt: new Date().toISOString().substring(0, 10),
      uploadedBy: currentUser.fullName
    }
  ]);

  // New file input state
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'dwg' | 'dxf' | 'pdf' | 'render' | 'cutlist'>('dwg');
  const [newFileSize, setNewFileSize] = useState('3.5 MB');

  if (!isOpen) return null;

  const handleAddFile = () => {
    if (!newFileName.trim()) return;

    const newFile: CadFileAttachment = {
      id: `cad-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: newFileName.trim().endsWith(`.${newFileType}`) ? newFileName.trim() : `${newFileName.trim()}.${newFileType}`,
      fileType: newFileType,
      fileSize: newFileSize || '2.0 MB',
      url: '#',
      uploadedAt: new Date().toISOString().substring(0, 10),
      uploadedBy: currentUser.fullName
    };

    setAttachedFiles(prev => [...prev, newFile]);
    setNewFileName('');
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleFileDropSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadedList: CadFileAttachment[] = Array.from(files).map((file, idx) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let fType: 'dwg' | 'dxf' | 'pdf' | 'render' | 'cutlist' = 'pdf';
      if (ext === 'dwg') fType = 'dwg';
      else if (ext === 'dxf') fType = 'dxf';
      else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') fType = 'render';
      else if (ext === 'csv') fType = 'cutlist';

      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);

      return {
        id: `cad-${Date.now()}-${idx}`,
        name: file.name,
        fileType: fType,
        fileSize: `${sizeInMb} MB`,
        url: '#',
        uploadedAt: new Date().toISOString().substring(0, 10),
        uploadedBy: currentUser.fullName
      };
    });

    setAttachedFiles(prev => [...prev, ...uploadedList]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addTechnicalDesignRevision({
      technicalProjectId,
      versionNumber,
      versionCode,
      title,
      designerName,
      status,
      changeDescription,
      cadFiles: attachedFiles,
      attachments: attachedFiles
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#C87A38]/30 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#1E110B] via-[#2A160E] to-[#361D13] text-white flex items-center justify-between border-b border-[#C87A38]/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C87A38]/20 border border-[#C87A38]/40 flex items-center justify-center text-[#E29555]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#C87A38]/30 text-[#E29555] font-black border border-[#C87A38]/30">
                  إدارة المخططات التنفيذية CAD
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  {project?.projectNumber || ''}
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                إصدار ورفع مخططات تنفيذية جديدة (Shop Drawings)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          
          {/* Version and Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-black text-slate-700 mb-1">
                رقم الإصدار (Version):
              </label>
              <input
                type="number"
                min={1}
                max={99}
                value={versionNumber}
                onChange={e => {
                  const val = parseInt(e.target.value) || 1;
                  setVersionNumber(val);
                  setVersionCode(`DWG-V${val}.0`);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:outline-hidden focus:border-[#C87A38]"
                required
              />
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-1">
                كود المخطط (Code):
              </label>
              <input
                type="text"
                value={versionCode}
                onChange={e => setVersionCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:outline-hidden focus:border-[#C87A38]"
                required
              />
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-1">
                المهندس المصمم:
              </label>
              <input
                type="text"
                value={designerName}
                onChange={e => setDesignerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-hidden focus:border-[#C87A38]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-black text-slate-700 mb-1">
              عنوان وتوصيف حزمة المخططات:
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: المخطط التنفيذي الشامل وشوب دروينج الواجهات والقطاعات"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-hidden focus:border-[#C87A38]"
              required
            />
          </div>

          <div>
            <label className="block font-black text-slate-700 mb-1">
              ملاحظات التغيير والتعليمات التنفيذية للورش:
            </label>
            <textarea
              value={changeDescription}
              onChange={e => setChangeDescription(e.target.value)}
              rows={2}
              placeholder="سجل أسباب الإصدار أو تفاصيل الشوب دروينج المحدثة..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 font-medium focus:outline-hidden focus:border-[#C87A38]"
            />
          </div>

          {/* Upload Dropzone */}
          <div className="p-4 rounded-2xl bg-[#FDF8F4] border-2 border-dashed border-[#C87A38]/40 text-center space-y-2">
            <Upload className="w-8 h-8 text-[#C87A38] mx-auto" />
            <div className="text-xs font-black text-[#1E110B]">
              رفع ملفات المخططات التنفيذية (DWG / DXF / PDF / 3D Renders / CSV)
            </div>
            <p className="text-[11px] text-slate-500">
              اسحب الملفات هنا أو اضغط للاختيار من جهازك مباشرة
            </p>
            <label className="inline-block px-4 py-2 rounded-xl bg-[#361D13] hover:bg-black text-white font-black text-xs cursor-pointer transition-all">
              <span>تصفح الملفات من الجهاز</span>
              <input
                type="file"
                multiple
                accept=".dwg,.dxf,.pdf,.png,.jpg,.jpeg,.csv,.zip"
                onChange={handleFileDropSimulate}
                className="hidden"
              />
            </label>
          </div>

          {/* Quick Add Custom File Entry */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-black text-slate-800 block text-xs">
              أو إضافة مسمى ملف هندسي سريعاً:
            </span>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="اسم الملف (مثال: Kitchen_Sections_REV01)"
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                className="flex-1 w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-xs"
              />
              <select
                value={newFileType}
                onChange={e => setNewFileType(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-xs"
              >
                <option value="dwg">AutoCAD (.dwg)</option>
                <option value="pdf">Shop Drawing (.pdf)</option>
                <option value="dxf">CNC Machining (.dxf)</option>
                <option value="render">3D Render (.png/.jpg)</option>
                <option value="cutlist">CutList (.csv)</option>
              </select>
              <button
                type="button"
                onClick={handleAddFile}
                disabled={!newFileName.trim()}
                className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all ${
                  newFileName.trim()
                    ? 'bg-[#C87A38] text-white hover:bg-[#A86127] cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>إدراج</span>
              </button>
            </div>
          </div>

          {/* Attached Files List */}
          <div className="space-y-2">
            <h4 className="font-black text-slate-800 flex items-center justify-between text-xs">
              <span>الملفات المدرجة في حزمة المخطط ({attachedFiles.length}):</span>
            </h4>

            <div className="space-y-2">
              {attachedFiles.map(file => (
                <div
                  key={file.id}
                  className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-lg bg-[#361D13] text-[#E29555] font-black text-[10px] uppercase flex items-center justify-center font-mono">
                      {file.fileType}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{file.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        الحجم: {file.fileSize} | رافع الملف: {file.uploadedBy}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                    title="حذف الملف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Status Selection */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
            <label className="block font-black text-emerald-950 mb-1">
              حالة الاعتماد الفني المبدئية:
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-900">
                <input
                  type="radio"
                  name="cadStatus"
                  value="approved"
                  checked={status === 'approved'}
                  onChange={() => setStatus('approved')}
                  className="text-emerald-600"
                />
                <span>معتمد رسمياً للـ BOM والتصنيع</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900">
                <input
                  type="radio"
                  name="cadStatus"
                  value="under_review"
                  checked={status === 'under_review'}
                  onChange={() => setStatus('under_review')}
                  className="text-amber-600"
                />
                <span>مسودة قيد المراجعة الفنية</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-black hover:bg-slate-100 transition-all cursor-pointer text-xs"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#1E110B] via-[#361D13] to-[#C87A38] text-white font-black hover:opacity-95 shadow-md shadow-[#C87A38]/20 transition-all cursor-pointer text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-[#E29555]" />
              <span>حفظ وإصدار حزمة المخططات التنفيذية</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
