import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { TechnicalProject, TechnicalBOM } from '../../../types/technicalOffice';
import { 
  X, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Layers, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Factory,
  PackageCheck
} from 'lucide-react';

interface TechnicalReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: TechnicalProject;
  activeBom?: TechnicalBOM;
}

export const TechnicalReleaseModal: React.FC<TechnicalReleaseModalProps> = ({
  isOpen,
  onClose,
  project,
  activeBom
}) => {
  const { releaseTechnicalPackageToPlanning, currentUser } = useERP();

  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().substring(0, 10)
  );
  const [completionDate, setCompletionDate] = useState(
    new Date(Date.now() + 20 * 86400000).toISOString().substring(0, 10)
  );
  const [installationDate, setInstallationDate] = useState(
    new Date(Date.now() + 25 * 86400000).toISOString().substring(0, 10)
  );
  const [specialInstructions, setSpecialInstructions] = useState(
    'الالتزام الصارم بتفريغ العمود الخرساني بالجدار B بدقة، ومطابقة قشاط الـ PVC 2مم على جميع الواجهات المعرضة للرطوبة.'
  );
  const [planningNotes, setPlanningNotes] = useState(
    'تم تدقيق الـ BOM بالكامل ومطابقة أبعاد الأجهزة المدمجة (بوش / فرانكي) واعتماد المخطط التنفيذي V' +
      project.activeDesignVersion +
      '.0'
  );

  const [checklist, setChecklist] = useState({
    surveyVerified: true,
    cadApproved: true,
    bomApproved: activeBom?.status === 'approved',
    appliancesLocked: true,
    hardwareAvailable: true
  });

  if (!isOpen) return null;

  const canRelease = checklist.surveyVerified && checklist.cadApproved && checklist.bomApproved && checklist.appliancesLocked;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBom) return;

    releaseTechnicalPackageToPlanning({
      technicalProjectId: project.id,
      bomId: activeBom.id,
      designRevisionId: undefined,
      surveyId: undefined,
      targetProductionStartDate: startDate,
      targetFactoryCompletionDate: completionDate,
      targetSiteInstallationDate: installationDate,
      specialManufacturingInstructions: specialInstructions,
      notes: planningNotes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#C87A38]/30 max-w-2xl w-full max-h-[92vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-[#1E110B] to-[#361D13] text-white flex items-center justify-between rounded-t-3xl border-b border-[#C87A38]/20 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#C87A38]/20 border border-[#C87A38]/40 flex items-center justify-center text-[#E29555]">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#C87A38]/30 text-[#E29555] font-black">
                  بوابة الإفراج الفني للتخطيط
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {project.projectNumber}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                إصدار حزمة الإفراج الهندسي (Technical Release Package)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Project Summary Banner */}
          <div className="p-4 rounded-2xl bg-[#FDF8F4] border border-[#C87A38]/30 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <div className="text-slate-500 font-bold">اسم المشروع والعميل:</div>
              <div className="font-black text-[#1E110B] text-sm mt-0.5">{project.customerName}</div>
              <div className="text-slate-600 truncate">{project.projectName}</div>
            </div>
            <div>
              <div className="text-slate-500 font-bold">العقد والمبيعات:</div>
              <div className="font-bold text-slate-800 mt-0.5">{project.contractNumber || 'عقد معتمد'}</div>
              <div className="text-emerald-700 font-black">{project.commercialScopeSummary}</div>
            </div>
            <div>
              <div className="text-slate-500 font-bold">الإصدار الهندسي المعتمد:</div>
              <div className="font-black text-[#C87A38] text-sm mt-0.5">
                CAD V{project.activeDesignVersion}.0 | BOM: {project.activeBomRevision}
              </div>
              <div className="text-slate-600">المسؤول: {currentUser.fullName}</div>
            </div>
          </div>

          {/* Golden Gates Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#C87A38]" />
              <span>شروط بوابة الجودة الفنية للإفراج (Quality Gates)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.surveyVerified}
                  onChange={e => setChecklist(c => ({ ...c, surveyVerified: e.target.checked }))}
                  className="rounded text-[#C87A38] focus:ring-[#C87A38]"
                />
                <span className="font-bold text-slate-800">الرفع المساحي وتغذيات الـ MEP مدققة</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.cadApproved}
                  onChange={e => setChecklist(c => ({ ...c, cadApproved: e.target.checked }))}
                  className="rounded text-[#C87A38] focus:ring-[#C87A38]"
                />
                <span className="font-bold text-slate-800">المخططات التنفيذية V{project.activeDesignVersion} معتمدة هندسياً</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.bomApproved}
                  onChange={e => setChecklist(c => ({ ...c, bomApproved: e.target.checked }))}
                  className="rounded text-[#C87A38] focus:ring-[#C87A38]"
                />
                <span className="font-bold text-slate-800">تفجير الـ BOM وقوائم التقطيع معتمدة ({project.activeBomRevision})</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.appliancesLocked}
                  onChange={e => setChecklist(c => ({ ...c, appliancesLocked: e.target.checked }))}
                  className="rounded text-[#C87A38] focus:ring-[#C87A38]"
                />
                <span className="font-bold text-slate-800">أبعاد ومقاسات الأجهزة وسواقط الحوض مقفلة</span>
              </label>
            </div>
          </div>

          {/* Planning Target Schedule */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-[#C87A38]" />
              <span>المواعيد المستهدفة للتخطيط والتصنيع بالمصنع</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">تاريخ بدء الإنتاج والتقطيع:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#C87A38] font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">تاريخ انتهاء تصنيع المصنع:</label>
                <input
                  type="date"
                  value={completionDate}
                  onChange={e => setCompletionDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#C87A38] font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">تاريخ التركيب المستهدف بالموقع:</label>
                <input
                  type="date"
                  value={installationDate}
                  onChange={e => setInstallationDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#C87A38] font-bold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Special Manufacturing Instructions */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-800">
              تعليمات التصنيع والتشغيل الخاصة بالمصنع والورش:
            </label>
            <textarea
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#C87A38] font-medium"
              placeholder="مثال: شطف زاوية العمود، نوع القشاط، اتجاه الثمرة، تجميع العلب..."
            />
          </div>

          {/* Technical Office Release Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-800">
              ملاحظات وتوجيهات المكتب الفني لمسؤول التخطيط:
            </label>
            <textarea
              value={planningNotes}
              onChange={e => setPlanningNotes(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#C87A38] font-medium"
              placeholder="أية ملاحظات خاصة بحجز الألواح أو الإكسسوارات..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-black hover:bg-slate-50 transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!canRelease}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-md ${
                canRelease
                  ? 'bg-gradient-to-r from-[#C87A38] to-[#E29555] text-white hover:opacity-95 shadow-[#C87A38]/20 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>إصدار وتمرير الحزمة الفنية للتخطيط</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
