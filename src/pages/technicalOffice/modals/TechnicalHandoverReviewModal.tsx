import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { ProjectHandoverProtocol } from '../../../types/erp';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  FileText, 
  UserCheck,
  Calendar,
  Layers,
  ArrowRight,
  Eye,
  Image as ImageIcon,
  Ruler,
  Maximize2,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Info
} from 'lucide-react';

interface TechnicalHandoverReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  handover: ProjectHandoverProtocol;
}

export const TechnicalHandoverReviewModal: React.FC<TechnicalHandoverReviewModalProps> = ({
  isOpen,
  onClose,
  handover
}) => {
  const { 
    acceptTechnicalHandover, 
    rejectTechnicalHandover, 
    users, 
    currentUser,
    customProjects,
    customContracts,
    projectDesigns,
    projectMeasurements,
    siteVisits
  } = useERP();

  const [activeReviewTab, setActiveReviewTab] = useState<'overview' | 'designs' | 'survey' | 'commercial'>('overview');
  const [engineerId, setEngineerId] = useState(currentUser.id);
  const [clarificationNotes, setClarificationNotes] = useState('');
  const [activeAction, setActiveAction] = useState<'accept' | 'reject'>('accept');

  if (!isOpen) return null;

  const selectedEngineer = users.find(u => u.id === engineerId);

  // Link to Sales project, designs, survey, contract
  const salesProject = customProjects.find(p => p.id === handover.projectId || p.projectNumber === handover.projectNumber);
  const contract = customContracts.find(c => c.id === salesProject?.contractId || c.projectId === salesProject?.id);
  const designs = projectDesigns.filter(d => d.projectId === salesProject?.id);
  const approvedDesign = designs.find(d => d.status === 'approved') || designs[designs.length - 1];
  const measurements = projectMeasurements.filter(m => m.projectId === salesProject?.id);
  const latestMeas = measurements[measurements.length - 1];
  const siteVisit = siteVisits.find(v => v.projectId === salesProject?.id);

  const handleAccept = () => {
    acceptTechnicalHandover(
      handover.id,
      engineerId,
      selectedEngineer ? selectedEngineer.fullName : currentUser.fullName
    );
    onClose();
  };

  const handleReject = () => {
    if (!clarificationNotes.trim()) return;
    rejectTechnicalHandover(handover.id, clarificationNotes);
    onClose();
  };

  const checklist = handover.checklist || {
    contractSigned: true,
    depositVerifiedInFinance: true,
    commercialSpecsLocked: true,
    approvedQuotationVersion: 1,
    approvedDesignVersion: 1,
    siteSurveyCompleted: true,
    surveyObstaclesChecked: true,
    technicalDocumentsAttached: true
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#C87A38]/30 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#1E110B] via-[#2A160E] to-[#361D13] text-white flex items-center justify-between border-b border-[#C87A38]/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#C87A38]/20 border border-[#C87A38]/40 flex items-center justify-center text-[#E29555] shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#C87A38]/30 text-[#E29555] font-black border border-[#C87A38]/30">
                  بوابة استلام المكتب الفني (Handover Gate)
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  {handover.projectNumber}
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-1 flex items-center gap-2">
                <span>تدقيق ملف المشروع واستلامه من المبيعات</span>
                <span className="text-xs text-[#E29555] font-normal">| {handover.customerName}</span>
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

        {/* Tab Navigation inside Modal */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-5 pt-2.5 flex items-center gap-2 shrink-0 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveReviewTab('overview')}
            className={`pb-2.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeReviewTab === 'overview'
                ? 'border-[#C87A38] text-[#1E110B] font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#C87A38]" />
            <span>1. محضر الاستلام والتحقق</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveReviewTab('designs')}
            className={`pb-2.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeReviewTab === 'designs'
                ? 'border-[#C87A38] text-[#1E110B] font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#C87A38]" />
            <span>2. ريندر وتصميم الـ 3D المعتمد</span>
            {approvedDesign && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                V{approvedDesign.version}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveReviewTab('survey')}
            className={`pb-2.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeReviewTab === 'survey'
                ? 'border-[#C87A38] text-[#1E110B] font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Ruler className="w-4 h-4 text-[#C87A38]" />
            <span>3. كروكي ومعاينة المبيعات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveReviewTab('commercial')}
            className={`pb-2.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeReviewTab === 'commercial'
                ? 'border-[#C87A38] text-[#1E110B] font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-[#C87A38]" />
            <span>4. العقد والمقايسة المسعرة</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          
          {/* TAB 1: OVERVIEW & GOLDEN GATE CHECKLIST */}
          {activeReviewTab === 'overview' && (
            <div className="space-y-4">
              
              {/* Top Banner Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-black">مرحلة فحص بوابة الاستلام: </span>
                  يقوم مهندس المكتب الفني بمطابقة التصميم والريندر المعتمد مع العقد ومقايسة المبيعات للتأكد من اكتمال كافة البيانات الفنية قبل بدء أعمال الشوب دروينج وتفجير الـ BOM.
                </div>
              </div>

              {/* Handover Meta Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#FDF8F4] border border-[#C87A38]/30 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">اسم العميل:</span>
                    <span className="font-black text-[#1E110B]">{handover.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">المشروع التجاري:</span>
                    <span className="font-bold text-slate-800">{salesProject?.projectName || 'مشروع مطبخ تفصيل'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">مسؤول المبيعات:</span>
                    <span className="font-bold text-slate-800">{handover.submittedByUserName || 'فريق المبيعات'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">تاريخ التقديم:</span>
                    <span className="font-mono text-slate-800">{handover.submittedDate || '2026-10-06'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">رقم العقد التجاري:</span>
                    <span className="font-mono font-black text-slate-900">{contract?.contractNumber || 'CNT-2026-001'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">قيمة التعاقد:</span>
                    <span className="font-black text-[#1E110B]">{contract ? `${contract.totalValue.toLocaleString('ar-EG')} ج.م` : '118,500 ج.م'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">الدفعة المقدمة (العربون):</span>
                    <span className="font-black text-emerald-700">مؤكدة بالمالية (40%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">شروط وموعد التسليم:</span>
                    <span className="font-mono font-bold text-slate-800">{contract?.deliveryTerms || 'خلال 35 يوم عمل'}</span>
                  </div>
                </div>
              </div>

              {/* Handover Notes from Sales */}
              {handover.notesForTechOffice && (
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-slate-800">
                  <span className="font-black text-amber-900 block mb-1">ملاحظات وشروط المبيعات الخاصة للمكتب الفني:</span>
                  <p className="leading-relaxed font-medium">{handover.notesForTechOffice}</p>
                </div>
              )}

              {/* Checklist Verification */}
              <div className="space-y-2 pt-1">
                <h4 className="font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#C87A38]" />
                  <span>مراجعة بنود البوابة الذهبية (Golden Gate Checklist)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${checklist.contractSigned ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                    {checklist.contractSigned ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span className="font-bold">العقد موقّع ومعتمد وموثق</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${checklist.depositVerifiedInFinance ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                    {checklist.depositVerifiedInFinance ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span className="font-bold">سداد العربون مؤكد بسند قبض</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${checklist.commercialSpecsLocked ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                    {checklist.commercialSpecsLocked ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span className="font-bold">المواصفات التجارية مقفلة ومحددة</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${checklist.siteSurveyCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                    {checklist.siteSurveyCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span className="font-bold">المعاينة وكروكي المبيعات الأولية مرفق</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SALES 3D DESIGNS & RENDERS */}
          {activeReviewTab === 'designs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-[#1E110B] text-sm">التصميم والريندر الـ 3D المعتمد من العميل والمبيعات</h4>
                  <p className="text-xs text-slate-500">يمثل المظهر الجمالي المعتمد في العقد (Aesthetic Baseline) المطلوب مطابقته</p>
                </div>
                {approvedDesign && (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                    الإصدار المعتمد V{approvedDesign.version}
                  </span>
                )}
              </div>

              {approvedDesign ? (
                <div className="space-y-4">
                  {/* 3D Render Image Showcase */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 relative group aspect-video flex items-center justify-center">
                      <img 
                        src={approvedDesign.images[0] || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600'} 
                        alt="3D Kitchen Render"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-3 right-3 left-3 text-white">
                        <div className="text-xs font-black">{approvedDesign.designName}</div>
                        <div className="text-[10px] text-slate-300 font-mono">مصمم المبيعات: {approvedDesign.createdByUserName} | {approvedDesign.createdDate}</div>
                      </div>
                    </div>

                    {/* Design Specs Card */}
                    <div className="p-4 rounded-2xl bg-[#FDF8F4] border border-[#C87A38]/30 space-y-3">
                      <h5 className="font-black text-[#1E110B] flex items-center gap-1.5 text-xs">
                        <Sparkles className="w-4 h-4 text-[#C87A38]" />
                        <span>المواصفات الديكورية واللونية المعتمدة مع العميل:</span>
                      </h5>

                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                          <span className="font-bold text-slate-500 block text-[10px]">خامة ولون الضلف:</span>
                          <span className="font-black text-slate-800">HPL رويال كود 812 بيج مط + تطعيمات خشب سنديان</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                          <span className="font-bold text-slate-500 block text-[10px]">الشاسيه الداخلي:</span>
                          <span className="font-black text-slate-800">جود وود 18مم معالج ملامين أبيض ضد الرطوبة والمياه</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                          <span className="font-bold text-slate-500 block text-[10px]">المفصلات والمجاري:</span>
                          <span className="font-black text-slate-800">بلوم Blum Clip Top 110 + مجاري أدراج تاندم Soft-Close</span>
                        </div>
                      </div>

                      {approvedDesign.notes && (
                        <div className="pt-2 text-[11px] text-slate-600 border-t border-[#C87A38]/20">
                          <span className="font-bold text-slate-900">ملاحظات المصمم: </span>
                          {approvedDesign.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
                  لم يتم إرفاق ملف 3D منفصل بمرحلة المبيعات.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SALES PRELIMINARY SURVEY & SKETCH */}
          {activeReviewTab === 'survey' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-black text-[#1E110B] text-sm">معاينة ومقاسات المبيعات المبدئية</h4>
                <p className="text-xs text-slate-500">تم رفعها بواسطة مندوب المعرض لحساب المقايسة التقديرية قبل زيارة الرفع المساحي بالليزر</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Wall measurements from Sales */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <h5 className="font-black text-slate-800 text-xs flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-[#C87A38]" />
                    <span>أطوال الحوائط التقريبية المسجلة بالمبيعات:</span>
                  </h5>

                  <div className="space-y-2">
                    {latestMeas && latestMeas.items && latestMeas.items.length > 0 ? (
                      latestMeas.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="font-bold text-slate-700">{item.name}</span>
                          <span className="font-mono font-black text-[#1E110B]">{item.value} سم</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="font-bold text-slate-700">الجدار A (الحوض والصرف)</span>
                          <span className="font-mono font-black text-[#1E110B]">420 سم</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="font-bold text-slate-700">الجدار B (البوتاجاز والشفاط)</span>
                          <span className="font-mono font-black text-[#1E110B]">310 سم</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="font-bold text-slate-700">الجدار C (الثلاجة ومؤن)</span>
                          <span className="font-mono font-black text-[#1E110B]">240 سم</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Site Visit Notes & Constraints */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                  <h5 className="font-black text-slate-900 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>ملاحظات المعاينة الأولية ومحددات الموقع:</span>
                  </h5>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-amber-200/80">
                      <span className="font-bold text-slate-500 block text-[10px]">ملاحظات السباكة والغاز:</span>
                      <span className="font-bold text-slate-800">تغذية المياه على الجدار A، محبس الغاز الطبيعي على الجدار B بارتفاع 75 سم.</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-amber-200/80">
                      <span className="font-bold text-slate-500 block text-[10px]">مواصفات الأجهزة المطلوبة:</span>
                      <span className="font-bold text-slate-800">فرن بلت إن 60 سم + مسطح غاز 60 سم + شفاط هرمي 90 سم (توفير العميل).</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-amber-200/80">
                      <span className="font-bold text-slate-500 block text-[10px]">حالة الجدران والتشطيب:</span>
                      <span className="font-bold text-slate-800">سيراميك كامل، السقف جبسوم بورد بارتفاع صافي 280 سم.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COMMERCIAL CONTRACT & SCOPE */}
          {activeReviewTab === 'commercial' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-black text-[#1E110B] text-sm">العقد والمقايسة المسعرة المعتمدة</h4>
                <p className="text-xs text-slate-500">النطاق المالي والتعاقدي الملزم لمهندس المكتب الفني</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-bold block">إجمالي التعاقد:</span>
                  <span className="text-lg font-black text-[#1E110B]">
                    {contract ? `${contract.totalValue.toLocaleString('ar-EG')} ج.م` : '118,500 ج.م'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-emerald-700 font-bold block">المقدم المسدد:</span>
                  <span className="text-lg font-black text-emerald-900">
                    {contract ? `${(contract.totalValue * 0.4).toLocaleString('ar-EG')} ج.م` : '47,400 ج.م (40%)'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                  <span className="text-purple-700 font-bold block">المتبقي على دفعات:</span>
                  <span className="text-lg font-black text-purple-900">
                    {contract ? `${(contract.totalValue * 0.6).toLocaleString('ar-EG')} ج.م` : '71,100 ج.م (60%)'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <h5 className="font-black text-slate-800">التزامات وضمانات التعاقد:</h5>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {contract?.paymentTerms || 'يشمل السعر التوريد والتركيب والضمان لمدة 5 سنوات ضد عيوب الصناعة مع صيانة مجانية أول سنة.'}
                </p>
              </div>
            </div>
          )}

          {/* Action Tabs: Accept or Reject */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex rounded-2xl p-1 bg-slate-100 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveAction('accept')}
                className={`flex-1 py-2.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeAction === 'accept'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>قبول واعتماد استلام المشروع بالمكتب الفني</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAction('reject')}
                className={`flex-1 py-2.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeAction === 'reject'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>إعادة للمبيعات لعدم اكتمال المتطلبات الفنية</span>
              </button>
            </div>
          </div>

          {/* Accept Mode: Assign Engineer */}
          {activeAction === 'accept' ? (
            <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <div>
                <label className="block font-black text-slate-800 mb-1.5">
                  تعيين المهندس الفني المسؤول عن الرفع المساحي والـ BOM:
                </label>
                <select
                  value={engineerId}
                  onChange={e => setEngineerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold focus:outline-hidden focus:border-[#C87A38]"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.title || 'مهندس مكتب فني'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-[11px] text-emerald-900 font-medium">
                عند الضغط على القبول، سيتم نقل المشروع مباشرة لمرحلة <span className="font-black">"جاري الرفع المساحي والمخططات التنفيذية"</span> وربط التصاميم المعتمدة بالشوب دروينج.
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
              <div>
                <label className="block font-black text-rose-900 mb-1.5">
                  أسباب الإعادة والنواقص المطلوب استيفاؤها من المبيعات:
                </label>
                <textarea
                  value={clarificationNotes}
                  onChange={e => setClarificationNotes(e.target.value)}
                  rows={3}
                  placeholder="مثال: يرجى تحديد كود لون الضلف بدقة أو إرفاق كتالوج فرن البلت إن لتحديد مقاس الفتحة..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-rose-300 bg-white font-medium focus:outline-hidden focus:border-rose-500"
                  required
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-black hover:bg-slate-100 transition-all cursor-pointer text-xs"
          >
            إغلاق
          </button>

          {activeAction === 'accept' ? (
            <button
              type="button"
              onClick={handleAccept}
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black hover:opacity-95 shadow-md shadow-emerald-600/20 transition-all cursor-pointer text-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>اعتماد وقبول المشروع والبدء الهندسي</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReject}
              disabled={!clarificationNotes.trim()}
              className={`flex items-center gap-2 px-7 py-2.5 rounded-xl font-black transition-all text-xs ${
                clarificationNotes.trim()
                  ? 'bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-md shadow-rose-600/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>إعادة للمبيعات مع الملاحظات</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

