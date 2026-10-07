import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { CustomProjectService } from '../services/customProjectService';
import {
  ArrowRight,
  Ruler,
  Calendar,
  Camera,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  DollarSign,
  MessageSquare,
  History,
  Building,
  User,
  Share2,
  FileText,
  AlertTriangle,
  Clock,
  Sparkles,
  ZoomIn,
  Eye,
  Video,
  Printer,
  ShieldCheck,
  CheckSquare,
  Lock,
  Layers,
  FileSignature,
  FolderCheck,
  Banknote,
  Send,
  HelpCircle,
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { LocalImageUploader } from '../components/common/LocalImageUploader';
import { ImageZoomModal } from '../components/common/ImageZoomModal';
import { OfficialQuotationModal } from '../components/modals/OfficialQuotationModal';
import { ProjectQuotation, PaymentMilestone } from '../types/erp';

interface CustomProjectDetailsPageProps {
  projectId: string;
  onBack: () => void;
}

export const CustomProjectDetailsPage: React.FC<CustomProjectDetailsPageProps> = ({ projectId, onBack }) => {
  const {
    customProjects,
    customers,
    siteVisits,
    projectMeasurements,
    projectDesigns,
    projectQuotations,
    projectTimelineEvents,
    customContracts,
    projectHandovers,
    materials,
    scheduleSiteVisit,
    completeSiteVisit,
    addProjectMeasurement,
    addProjectDesign,
    updateDesignStatus,
    addDesignComment,
    createProjectQuotation,
    acceptQuotation,
    createContractFromQuotation,
    verifyContractDeposit,
    submitProjectHandover,
    acceptProjectHandover
  } = useERP();

  const project = customProjects.find(p => p.id === projectId);
  const [activeTab, setActiveTab] = useState<'overview' | 'measurements' | 'designs' | 'quotations' | 'contract' | 'handover' | 'timeline'>('overview');
  const [selectedQuoteForOfficialModal, setSelectedQuoteForOfficialModal] = useState<ProjectQuotation | null>(null);

  // Modals & Forms State
  const [isScheduleVisitOpen, setIsScheduleVisitOpen] = useState(false);
  const [visitDate, setVisitDate] = useState('2026-08-30');
  const [visitTime, setVisitTime] = useState('16:00');
  const [visitAddress, setVisitAddress] = useState('فيلا 14 - التجمع الخامس');
  const [visitNotes, setVisitNotes] = useState('');

  // Measurement Builder State
  const [isAddMeasurementOpen, setIsAddMeasurementOpen] = useState(false);
  const [updateReason, setUpdateReason] = useState('رفع المقاسات الفعلي وتوثيق فحص الموقع الميداني');
  const [measPhotos, setMeasPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600'
  ]);
  const [measVideoUrl, setMeasVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [measTechnicalNotes, setMeasTechnicalNotes] = useState('تم قياس أبعاد الجدران بالليزر وتوثيق صور وفيديو المعاينة بالموقع');
  
  // Technical Inspection Conditions State
  const [siteCondCeilingHeight, setSiteCondCeilingHeight] = useState('280 سم (سقف معلق بيت نور)');
  const [siteCondHasColumn, setSiteCondHasColumn] = useState(true);
  const [siteCondColumnDetails, setSiteCondColumnDetails] = useState('عمود بارز 15سم × 30سم بالجدار B');
  const [siteCondWindowLocation, setSiteCondWindowLocation] = useState('جدار B يبدأ النافذة بعد 90سم (جلسة 100سم)');
  const [siteCondElectricalPoints, setSiteCondElectricalPoints] = useState('4 نقاط كهرباء على ارتفاع 110سم + مأخذ شفاط 220V');
  const [siteCondWaterConnection, setSiteCondWaterConnection] = useState('توصيلات مياه وصرف جاهزة بالجدار A على 180سم');
  const [siteCondGasConnection, setSiteCondGasConnection] = useState('محبس غاز قائم بجوار جدار A');
  const [siteCondWallStraightness, setSiteCondWallStraightness] = useState('استقامة 90° ممتازة مع انحراف بسيط 0.5سم');
  const [siteCondFlooringLevel, setSiteCondFlooringLevel] = useState('بورسلين مستوي 100%');
  const [siteCondCustomerPreferences, setSiteCondCustomerPreferences] = useState('جزيرة وسطية Island 180سم مع رخام جالاكسي أسود');

  // Line Item Dimensions
  const [measItems, setMeasItems] = useState<{ name: string; value: number; unit: 'cm' | 'mm' | 'meter'; notes: string }[]>([
    { name: 'جدار A الرئيسي (موقع الحوض والصرف)', value: 420, unit: 'cm', notes: 'توصيلات مياه وصرف معتمدة ومأخذ فلتر' },
    { name: 'جدار B الجانبي (موقع البوتاجاز والشفاط)', value: 340, unit: 'cm', notes: 'إضافة مكان غسالة أطباق بلت إن 60سم' },
    { name: 'ارتفاع السقف الصافي بعد الجبسوم بورد', value: 280, unit: 'cm', notes: 'إضاءة بيت نور واسبوتات' },
    { name: 'عمق الكابينة السفلية القياسي', value: 60, unit: 'cm', notes: 'عمق قياسي' }
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemVal, setNewItemVal] = useState<number>(0);
  const [newItemUnit, setNewItemUnit] = useState<'cm' | 'mm' | 'meter'>('cm');
  const [newItemNotes, setNewItemNotes] = useState('');

  // Design Builder State
  const [isAddDesignOpen, setIsAddDesignOpen] = useState(false);
  const [designName, setDesignName] = useState('تصميم 3D أوف وايت HPL');
  const [designImages, setDesignImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600'
  ]);
  const [designNotes, setDesignNotes] = useState('النسخة المعدلة مع جزيرة وسطية 180سم');
  const [activeLightbox, setActiveLightbox] = useState<{ images: string[]; index: number; title: string } | null>(null);

  // Quotation Builder State
  const [isAddQuotationOpen, setIsAddQuotationOpen] = useState(false);
  const [selectedMatId, setSelectedMatId] = useState(materials[0]?.id || '');
  const [itemCategory, setItemCategory] = useState<'base_unit' | 'upper_unit' | 'tall_unit' | 'material' | 'mechanism' | 'accessory' | 'marble' | 'work'>('material');
  const [itemQty, setItemQty] = useState(8);
  const [itemSellingPrice, setItemSellingPrice] = useState(materials[0] ? Math.round((materials[0].currentReferenceCost || 1250) * 1.4) : 1900);
  const [quotationDiscount, setQuotationDiscount] = useState<number>(0);
  const [quotationNotes, setQuotationNotes] = useState('عرض سعر شاملاً خامات HPL والتركيب والضمان 5 سنوات');
  const [quoteItems, setQuoteItems] = useState<{
    materialId?: string;
    materialName: string;
    itemType: 'material' | 'product' | 'work' | 'accessory';
    description?: string;
    quantity: number;
    unit: string;
    unitCost: number;
    unitSellingPrice: number;
    totalCost: number;
    totalSellingPrice: number;
  }[]>([
    {
      materialId: materials[0]?.id || 'mat-1',
      materialName: materials[0]?.name || 'MDF أبيض 18مم اسباني',
      itemType: 'material',
      description: 'كابينات وتصنيع الهيكل الداخلي',
      quantity: 8,
      unit: materials[0]?.unit || 'لوح',
      unitCost: materials[0]?.currentReferenceCost || 1250,
      unitSellingPrice: 1900,
      totalCost: (materials[0]?.currentReferenceCost || 1250) * 8,
      totalSellingPrice: 1900 * 8
    }
  ]);

  // Contract Builder State with Dynamic Milestones
  const [isCreateContractOpen, setIsCreateContractOpen] = useState(false);
  const [contractPaymentTerms, setContractPaymentTerms] = useState('عربون تعاقد 40% + دفعة بدء التشغيل قبل الشحن 40% + دفعة التسليم النهائي بعد التركيب 20%');
  const [contractDeliveryTerms, setContractDeliveryTerms] = useState('التسليم والتركيب بالموقع خلال 30 يوم عمل من استلام المقدم المالي');
  const [ms1Percent, setMs1Percent] = useState<number>(40);
  const [ms2Percent, setMs2Percent] = useState<number>(40);
  const [ms3Percent, setMs3Percent] = useState<number>(20);

  // Handover Notes
  const [handoverNotes, setHandoverNotes] = useState('تم فحص الموقع وتوثيق أبعاد الجدران بالليزر واعتماد التصميم 3D وقائمة المواصفات من العميل.');

  const [commentText, setCommentText] = useState('');
  const [rejectionModalDesignId, setRejectionModalDesignId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('تغيير لون الدلف وإعادة توزيع الجزيرة');

  if (!project) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4 max-w-md mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#C87A38] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900">المشروع غير موجود</h3>
          <p className="text-xs text-slate-500 mt-1">عفواً، لم يتم العثور على بيانات مشروع التفصيل المطلوب</p>
        </div>
        <button onClick={onBack} className="px-5 py-2.5 bg-[#1E110B] hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition-all">
          العودة لقائمة المشاريع
        </button>
      </div>
    );
  }

  const projectVisits = siteVisits.filter(v => v.projectId === project.id);
  const projectMeasList = projectMeasurements.filter(m => m.projectId === project.id);
  const projectDesignsList = projectDesigns.filter(d => d.projectId === project.id);
  const projectQuotesList = projectQuotations.filter(q => q.projectId === project.id);
  const projectTimeline = projectTimelineEvents.filter(t => t.projectId === project.id);
  const projectContract = customContracts.find(c => c.projectId === project.id);
  const projectHandover = projectHandovers.find(h => h.projectId === project.id);

  const statusMeta = CustomProjectService.getProjectStatusMeta(project.status);
  const latestVisit = projectVisits[projectVisits.length - 1];
  const latestMeas = projectMeasList[projectMeasList.length - 1];
  const latestDesign = projectDesignsList[projectDesignsList.length - 1];
  const approvedDesign = projectDesignsList.find(d => d.status === 'approved');
  const latestQuote = projectQuotesList[projectQuotesList.length - 1];
  const approvedQuote = projectQuotesList.find(q => q.status === 'accepted');

  // Stage Gates Evaluation
  const handoverGate = CustomProjectService.canInitiateHandover(project, projectContract, approvedQuote, approvedDesign, latestVisit, projectMeasList);

  const handleSelectMaterial = (matId: string) => {
    setSelectedMatId(matId);
    const mat = materials.find(m => m.id === matId);
    if (mat) {
      const refCost = mat.currentReferenceCost || 0;
      const defaultSelling = Math.round(refCost * 1.4);
      setItemSellingPrice(defaultSelling);
    }
  };

  const handleAddQuoteItem = () => {
    const selectedMat = materials.find(m => m.id === selectedMatId);
    if (!selectedMat) return;

    const qty = Number(itemQty) || 1;
    const unitCost = selectedMat.currentReferenceCost || 0;
    const unitSellingPrice = Number(itemSellingPrice) >= 0 ? Number(itemSellingPrice) : unitCost;

    const newItem = {
      materialId: selectedMat.id,
      materialName: selectedMat.name,
      itemType: (itemCategory === 'work' ? 'work' : itemCategory === 'accessory' || itemCategory === 'mechanism' ? 'accessory' : 'material') as any,
      description: itemCategory === 'base_unit' ? 'وحدة سفلية' : itemCategory === 'upper_unit' ? 'وحدة علوية' : selectedMat.categoryName,
      quantity: qty,
      unit: selectedMat.unit || 'وحدة',
      unitCost,
      unitSellingPrice,
      totalCost: unitCost * qty,
      totalSellingPrice: unitSellingPrice * qty
    };

    setQuoteItems(prev => [...prev, newItem]);
  };

  const handleRemoveQuoteItem = (index: number) => {
    setQuoteItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddMeasItem = () => {
    if (!newItemName.trim()) return;
    setMeasItems(prev => [
      ...prev,
      { name: newItemName, value: Number(newItemVal), unit: newItemUnit, notes: newItemNotes }
    ]);
    setNewItemName('');
    setNewItemVal(0);
    setNewItemNotes('');
  };

  const handleRemoveMeasItem = (index: number) => {
    setMeasItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (measItems.length === 0) return;
    addProjectMeasurement(
      project.id,
      measItems,
      updateReason,
      measPhotos,
      measVideoUrl ? [measVideoUrl] : [],
      measTechnicalNotes
    );

    if (latestVisit) {
      completeSiteVisit(latestVisit.id, {
        notes: measTechnicalNotes,
        photos: measPhotos,
        siteConditions: {
          hasColumn: siteCondHasColumn,
          columnDetails: siteCondColumnDetails,
          ceilingHeight: siteCondCeilingHeight,
          windowLocation: siteCondWindowLocation,
          electricalPoints: siteCondElectricalPoints,
          waterConnection: siteCondWaterConnection,
          gasConnection: siteCondGasConnection,
          wallStraightness: siteCondWallStraightness,
          flooringLevel: siteCondFlooringLevel,
          customerPreferences: siteCondCustomerPreferences
        }
      });
    }

    setIsAddMeasurementOpen(false);
  };

  const handleSaveDesign = (e: React.FormEvent) => {
    e.preventDefault();
    if (designImages.length === 0) return;
    addProjectDesign(project.id, {
      designName,
      images: designImages,
      notes: designNotes
    });
    setIsAddDesignOpen(false);
  };

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (quoteItems.length === 0) return;
    createProjectQuotation(project.id, {
      items: quoteItems,
      discount: quotationDiscount,
      notes: quotationNotes
    });
    setIsAddQuotationOpen(false);
  };

  const handleSaveContractWithMilestones = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvedQuote) return;

    const totalVal = approvedQuote.totalSelling;
    const m1Amt = Math.round(totalVal * (ms1Percent / 100));
    const m2Amt = Math.round(totalVal * (ms2Percent / 100));
    const m3Amt = totalVal - m1Amt - m2Amt;

    const dynamicMilestones: PaymentMilestone[] = [
      {
        id: `ms-${Date.now()}-1`,
        milestoneIndex: 1,
        title: 'عربون وتأكيد التعاقد الرسمي',
        percentage: ms1Percent,
        amount: m1Amt,
        dueDateDescription: 'عند توقيع العقد',
        status: 'pending',
        paidAmount: 0
      },
      {
        id: `ms-${Date.now()}-2`,
        milestoneIndex: 2,
        title: 'دفعة بدء التشغيل قبل الشحن من المصنع',
        percentage: ms2Percent,
        amount: m2Amt,
        dueDateDescription: 'قبل خروج وحدات المطبخ من المصنع للتسليم',
        status: 'pending',
        paidAmount: 0
      },
      {
        id: `ms-${Date.now()}-3`,
        milestoneIndex: 3,
        title: 'دفعة التسليم النهائي بعد التركيب بالموقع',
        percentage: ms3Percent,
        amount: m3Amt,
        dueDateDescription: 'خلال 48 ساعة من توقيع محضر استلام الموقع النهائي',
        status: 'pending',
        paidAmount: 0
      }
    ];

    createContractFromQuotation(approvedQuote.id, contractPaymentTerms, contractDeliveryTerms, 'عقد معتمد وجدول دفعات مرحلي', dynamicMilestones);
    setIsCreateContractOpen(false);
    setActiveTab('contract');
  };

  const handleSubmitHandoverProtocol = () => {
    const checklist = {
      contractSigned: projectContract?.status === 'signed',
      contractNumber: projectContract?.contractNumber,
      depositVerifiedInFinance: projectContract?.isDepositVerified || false,
      depositReceiptNumber: projectContract?.milestones[0]?.financialReceiptRef || 'RCP-2026-001',
      depositAmount: projectContract?.milestones[0]?.amount || 0,
      approvedQuotationVersion: approvedQuote?.version || 1,
      commercialSpecsLocked: true,
      approvedDesignVersion: approvedDesign?.version || 1,
      siteSurveyCompleted: latestVisit?.status === 'completed' || projectMeasurements.some(m => m.projectId === project.id),
      surveyObstaclesChecked: true,
      technicalDocumentsAttached: true
    };

    submitProjectHandover(project.id, checklist, handoverNotes);
    setActiveTab('handover');
  };

  // 8 Linear Stepper Stages
  const stepperStages = [
    { num: 1, key: 'opportunity', label: 'الطلب والفرصة', activeStep: 1 },
    { num: 2, key: 'survey', label: 'المعاينة والمقاسات', activeStep: 3 },
    { num: 3, key: 'design', label: 'التصميم 3D', activeStep: 6 },
    { num: 4, key: 'quote', label: 'عرض السعر', activeStep: 8 },
    { num: 5, key: 'contract', label: 'العقد الموثق', activeStep: 10 },
    { num: 6, key: 'deposit', label: 'سداد العربون', activeStep: 11 },
    { num: 7, key: 'handover', label: 'تسليم المكتب الفني', activeStep: 13 },
    { num: 8, key: 'production', label: 'الإنتاج والورش', activeStep: 14 },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-bold text-xs shadow-2xs transition-all"
        >
          <ArrowRight className="w-4 h-4 text-[#C87A38]" />
          <span>العودة لقائمة مشاريع التفصيل</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">كود المشروع:</span>
          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-lg border border-slate-200">
            {project.projectNumber}
          </span>
        </div>
      </div>

      {/* Project Hero Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1E110B] text-[#C87A38] flex items-center justify-center font-black text-xl shadow-md shrink-0">
              <Ruler className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{project.projectName}</h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80">
                  {CustomProjectService.getProjectTypeLabel(project.projectType)}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-4 flex-wrap">
                <span>العميل: <strong className="text-slate-900">{project.customerName}</strong> ({project.customerPhone})</span>
                <span>• الفرع: <strong className="text-slate-800">{project.branchName}</strong></span>
                <span>• المسؤول: <strong className="text-slate-800">{project.assignedUserName}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <span className={`px-4 py-2 rounded-2xl text-xs font-black border shadow-2xs ${statusMeta.bgClass}`}>
              {statusMeta.label}
            </span>

            {/* Stage Quick Actions */}
            {project.status === 'visit_scheduled' && latestVisit && (
              <button
                onClick={() => { setActiveTab('measurements'); setIsAddMeasurementOpen(true); }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>إثبات المقاسات بالليزر</span>
              </button>
            )}

            {approvedQuote && !projectContract && (
              <button
                onClick={() => setIsCreateContractOpen(true)}
                className="px-4 py-2 bg-[#C87A38] hover:bg-[#b06325] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <FileSignature className="w-4 h-4" />
                <span>إبرام العقد وجدول الدفعات</span>
              </button>
            )}

            {projectContract && !projectContract.isDepositVerified && (
              <button
                onClick={() => verifyContractDeposit(projectContract.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Banknote className="w-4 h-4" />
                <span>تأكيد استلام العربون</span>
              </button>
            )}
          </div>

        </div>

        {/* Clean Linear Connected Stepper */}
        <div className="pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-3">
            <span>مسار المشروع ومحطات الاعتماد (Project Stage Stepper)</span>
            <span className="text-[#C87A38] font-bold font-mono">المرحلة {statusMeta.step} من 18</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {stepperStages.map((st) => {
              const isPassed = statusMeta.step >= st.activeStep;
              const isCurrent = statusMeta.step === st.activeStep || (statusMeta.step > st.activeStep && (st.num === 8 || statusMeta.step < stepperStages[st.num]?.activeStep));

              return (
                <div
                  key={st.num}
                  className={`p-3 rounded-2xl border transition-all text-center space-y-1 ${
                    isPassed
                      ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-black shadow-2xs'
                      : isCurrent
                      ? 'bg-amber-50 border-amber-300 text-amber-950 font-black ring-2 ring-amber-400/30'
                      : 'bg-slate-50/60 border-slate-200/70 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                      isPassed ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-[#C87A38] text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isPassed ? '✓' : st.num}
                    </span>
                  </div>
                  <p className="text-[11px] truncate">{st.label}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Modern Segmented Tab Bar (Apple / Vercel Grade) */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/70 flex flex-wrap items-center gap-1 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-white text-slate-900 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <ShieldCheck className={`w-4 h-4 ${activeTab === 'overview' ? 'text-[#C87A38]' : 'text-slate-400'}`} />
          <span>نظرة عامة والمسار</span>
        </button>

        <button
          onClick={() => setActiveTab('measurements')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'measurements'
              ? 'bg-white text-slate-900 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Ruler className={`w-4 h-4 ${activeTab === 'measurements' ? 'text-[#C87A38]' : 'text-slate-400'}`} />
          <span>المعاينة والمقاسات</span>
          <span className="bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded-md font-mono text-[10px]">{projectMeasList.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('designs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'designs'
              ? 'bg-white text-slate-900 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Layers className={`w-4 h-4 ${activeTab === 'designs' ? 'text-[#C87A38]' : 'text-slate-400'}`} />
          <span>التصميمات 3D</span>
          <span className="bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded-md font-mono text-[10px]">{projectDesignsList.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('quotations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'quotations'
              ? 'bg-white text-slate-900 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <DollarSign className={`w-4 h-4 ${activeTab === 'quotations' ? 'text-[#C87A38]' : 'text-slate-400'}`} />
          <span>عروض الأسعار والتسعير</span>
          <span className="bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded-md font-mono text-[10px]">{projectQuotesList.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('contract')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'contract'
              ? 'bg-white text-slate-900 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FileSignature className={`w-4 h-4 ${activeTab === 'contract' ? 'text-[#C87A38]' : 'text-slate-400'}`} />
          <span>العقد وجدول الدفعات</span>
          {projectContract && <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-md font-bold">موقع</span>}
        </button>

        <button
          onClick={() => setActiveTab('handover')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'handover'
              ? 'bg-white text-slate-900 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FolderCheck className={`w-4 h-4 ${activeTab === 'handover' ? 'text-[#C87A38]' : 'text-slate-400'}`} />
          <span>تسليم المكتب الفني</span>
          {projectHandover?.status === 'accepted_by_tech_office' && (
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-md">مستلم</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'timeline'
              ? 'bg-white text-slate-900 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <History className={`w-4 h-4 ${activeTab === 'timeline' ? 'text-[#C87A38]' : 'text-slate-400'}`} />
          <span>سجل المراحل</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & STAGE GATES */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Governance Cards */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#C87A38]" />
              <span>مصفوفة الرقابة وشروط الانتقال المرحلي (Stage Gates)</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900">1. المعاينة الميدانية</span>
                  {latestVisit?.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-500" />}
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {latestVisit?.status === 'completed' ? 'تمت معاينة الموقع وتوثيق أبعاد الليزر والموانع' : 'المعاينة قيد الجدولة والتنفيذ'}
                </p>
                <button onClick={() => setActiveTab('measurements')} className="text-[11px] font-bold text-[#C87A38] hover:underline block pt-1">
                  عرض تقرير المقاسات ←
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900">2. التصميم 3D</span>
                  {approvedDesign ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-500" />}
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {approvedDesign ? `تم اعتماد النسخة V${approvedDesign.version} من العميل` : 'في انتظار مراجعة واعتماد العميل'}
                </p>
                <button onClick={() => setActiveTab('designs')} className="text-[11px] font-bold text-[#C87A38] hover:underline block pt-1">
                  معاينة التصاميم 3D ←
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900">3. العقد وجدول الدفعات</span>
                  {projectContract?.status === 'signed' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {projectContract?.status === 'signed' ? `العقد موقع بمبلغ ${projectContract.totalValue.toLocaleString('ar-EG')} ج.م` : 'لم يتم تحرير العقد بعد'}
                </p>
                <button onClick={() => setActiveTab('contract')} className="text-[11px] font-bold text-[#C87A38] hover:underline block pt-1">
                  جدول الدفعات والشروط ←
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900">4. تسليم المكتب الفني</span>
                  {projectHandover?.status === 'accepted_by_tech_office' ? <FolderCheck className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-slate-400" />}
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {projectHandover?.status === 'accepted_by_tech_office' ? 'تم الاستلام وبدء تفجير الـ BOM' : 'مشروط باكتمال الدفعات والمستندات'}
                </p>
                <button onClick={() => setActiveTab('handover')} className="text-[11px] font-bold text-[#C87A38] hover:underline block pt-1">
                  محضر التسليم الفني ←
                </button>
              </div>

            </div>
          </div>

          {/* Quick Site Information */}
          {latestVisit && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#C87A38]" />
                  <span>بيانات الموقع والمعاينة الميدانية</span>
                </h3>
                <span className="text-xs font-bold text-slate-500">{latestVisit.date}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  <span className="text-slate-400 text-[10px] font-bold block mb-1">عنوان الموقع:</span>
                  <span className="font-bold text-slate-900">{latestVisit.address}</span>
                </div>
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  <span className="text-slate-400 text-[10px] font-bold block mb-1">المهندس الفاحص:</span>
                  <span className="font-bold text-slate-900">{latestVisit.assignedUserName}</span>
                </div>
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  <span className="text-slate-400 text-[10px] font-bold block mb-1">حالة المعاينة:</span>
                  <span className="font-bold text-emerald-700">✓ مكتملة وموثقة بالليزر</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: MEASUREMENTS */}
      {activeTab === 'measurements' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">سجل وتاريخ مقاسات الموقع الميدانية (Laser Measurements)</h3>
              <p className="text-xs text-slate-500 mt-0.5">توثيق أبعاد الحوائط والموانع الإنشائية لضمان دقة التنفيذ والتصنيع</p>
            </div>

            <button
              onClick={() => setIsAddMeasurementOpen(true)}
              className="px-4 py-2.5 bg-[#1E110B] hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-[#C87A38]" />
              <span>إضافة نسخة مقاسات جديدة (New Version)</span>
            </button>
          </div>

          {/* Technical Conditions Card */}
          {latestVisit?.siteConditions && (
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
              <h4 className="font-black text-slate-900 text-xs flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#C87A38]" />
                <span>تقرير الفحص والظروف الإنشائية للموقع:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-slate-700">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 text-[10px] font-bold block">الأعمدة الخرسانية:</span>
                  <strong className="text-slate-900">{latestVisit.siteConditions.hasColumn ? latestVisit.siteConditions.columnDetails : 'لا يوجد'}</strong>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 text-[10px] font-bold block">ارتفاع السقف صافي:</span>
                  <strong className="text-slate-900">{latestVisit.siteConditions.ceilingHeight}</strong>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 text-[10px] font-bold block">تأسيسات الكهرباء:</span>
                  <strong className="text-slate-900">{latestVisit.siteConditions.electricalPoints}</strong>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 text-[10px] font-bold block">السباكة والصرف:</span>
                  <strong className="text-slate-900">{latestVisit.siteConditions.waterConnection}</strong>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 text-[10px] font-bold block">استقامة الحوائط:</span>
                  <strong className="text-slate-900">{latestVisit.siteConditions.wallStraightness || '90° ممتازة'}</strong>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 text-[10px] font-bold block">استواء الأرضية:</span>
                  <strong className="text-slate-900">{latestVisit.siteConditions.flooringLevel || 'مستوية 100%'}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Versions List */}
          <div className="space-y-4">
            {projectMeasList.map((meas) => (
              <div key={meas.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-[#1E110B] text-amber-300 flex items-center justify-center font-bold text-xs font-mono">
                      V{meas.version}
                    </span>
                    <div>
                      <p className="font-black text-slate-900 text-sm">إصدار المقاسات V{meas.version}</p>
                      <p className="text-[11px] text-slate-400">{meas.createdDate} — المهندس: {meas.createdByUserName}</p>
                    </div>
                  </div>

                  {meas.reasonForUpdate && (
                    <span className="bg-amber-50 text-amber-900 text-[11px] font-bold px-3 py-1 rounded-xl border border-amber-200">
                      {meas.reasonForUpdate}
                    </span>
                  )}
                </div>

                {/* Dimensions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {meas.items.map(it => (
                    <div key={it.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                      <span className="text-slate-500 font-bold block text-[11px]">{it.name}</span>
                      <p className="font-black text-slate-900 text-base font-mono">
                        {it.value} <span className="text-xs text-[#C87A38] font-sans">{it.unit}</span>
                      </p>
                      {it.notes && <p className="text-[10px] text-slate-400 italic truncate">{it.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 3D DESIGNS */}
      {activeTab === 'designs' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">التصميمات ثلاثية الأبعاد (3D Design Versions)</h3>
              <p className="text-xs text-slate-500 mt-0.5">رفع مقترحات التصميم وإدارة مراجعات وملاحظات العميل</p>
            </div>

            <button
              onClick={() => setIsAddDesignOpen(true)}
              className="px-4 py-2.5 bg-[#1E110B] hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-[#C87A38]" />
              <span>إرسال تصميم 3D جديد</span>
            </button>
          </div>

          <div className="space-y-6">
            {projectDesignsList.map(dsg => {
              const dsgMeta = CustomProjectService.getDesignStatusMeta(dsg.status);

              return (
                <div key={dsg.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-[#C87A38] text-white flex items-center justify-center font-bold text-xs font-mono">
                        V{dsg.version}
                      </span>
                      <div>
                        <p className="font-black text-slate-900 text-sm">{dsg.designName}</p>
                        <p className="text-[11px] text-slate-400">{dsg.createdDate} — المصمم: {dsg.createdByUserName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${dsgMeta.bgClass}`}>
                        {dsgMeta.label}
                      </span>

                      {dsg.status !== 'approved' && (
                        <button
                          onClick={() => updateDesignStatus(dsg.id, 'approved')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>اعتماد العميل</span>
                        </button>
                      )}

                      {dsg.status !== 'rejected' && (
                        <button
                          onClick={() => setRejectionModalDesignId(dsg.id)}
                          className="px-3 py-1.5 bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-300 font-bold text-xs rounded-xl"
                        >
                          طلب تعديل
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Renderings Gallery */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {dsg.images.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveLightbox({ images: dsg.images, index: idx, title: `${dsg.designName} (V${dsg.version})` })}
                        className="group relative h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs cursor-pointer bg-slate-900"
                      >
                        <img src={img} alt="design-3d" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                          <span className="px-4 py-2 rounded-xl bg-white/90 font-black text-xs text-slate-900 flex items-center gap-1.5 shadow-md">
                            <ZoomIn className="w-4 h-4 text-[#C87A38]" />
                            <span>معاينة وتكبير (Zoom In)</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {dsg.rejectionReason && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-950">
                      ملاحظة تعديل العميل: {dsg.rejectionReason}
                    </div>
                  )}

                  {/* Comments Thread */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-3 text-xs">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#C87A38]" />
                      <span>ملاحظات واستفسارات العميل على النسخة V{dsg.version}:</span>
                    </p>

                    <div className="space-y-2">
                      {dsg.comments.map(c => (
                        <div key={c.id} className="p-3 rounded-xl bg-white border border-slate-200/70">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span>{c.userName} {c.isCustomer && '(العميل)'}</span>
                            <span className="font-mono">{c.date}</span>
                          </div>
                          <p className="font-bold text-xs text-slate-800 mt-1">{c.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="إضافة ملاحظة على التصميم..."
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                      <button
                        onClick={() => {
                          if (!commentText.trim()) return;
                          addDesignComment(dsg.id, commentText, true);
                          setCommentText('');
                        }}
                        className="px-4 py-2 bg-[#1E110B] text-white font-bold rounded-xl text-xs"
                      >
                        إرسال
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: QUOTATIONS */}
      {activeTab === 'quotations' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">عروض الأسعار والتسعير التجاري (Project Quotations)</h3>
              <p className="text-xs text-slate-500 mt-0.5">تسعير مبوب ومرن يمثل ما يشتريه العميل بدقة مع حساب الربحية</p>
            </div>

            <button
              onClick={() => setIsAddQuotationOpen(true)}
              className="px-4 py-2.5 bg-[#1E110B] hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-[#C87A38]" />
              <span>إصدار عرض سعر جديد (New Quotation)</span>
            </button>
          </div>

          <div className="space-y-6">
            {projectQuotesList.map(qte => {
              const quoteMeta = CustomProjectService.getQuotationStatusMeta(qte.status);

              return (
                <div key={qte.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs font-mono">
                        V{qte.version}
                      </span>
                      <div>
                        <p className="font-black text-slate-900 text-sm">عرض سعر رسمي V{qte.version}</p>
                        <p className="text-[11px] text-slate-400">{qte.createdDate} — بواسطة: {qte.createdByUserName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${quoteMeta.bgClass}`}>
                        {quoteMeta.label}
                      </span>

                      <button
                        onClick={() => setSelectedQuoteForOfficialModal(qte)}
                        className="px-3 py-1.5 bg-[#1E110B] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#C87A38]" />
                        <span>طباعة العرض PDF</span>
                      </button>

                      <button
                        onClick={() => window.open(`https://wa.me/2${project.customerPhone}?text=${encodeURIComponent(`مرحباً أ/ ${project.customerName}، يسعدنا موافاتكم بعرض السعر لمشروع ${project.projectName} بمبلغ ${qte.totalSelling.toLocaleString('ar-EG')} ج.م`)}`, '_blank')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>واتساب</span>
                      </button>

                      {qte.status !== 'accepted' ? (
                        <button
                          onClick={() => acceptQuotation(qte.id)}
                          className="px-3.5 py-1.5 bg-[#C87A38] hover:bg-[#b06325] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>اعتماد وقبول العميل</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsCreateContractOpen(true)}
                          className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs"
                        >
                          <FileSignature className="w-3.5 h-3.5" />
                          <span>إبرام العقد والدفعات</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="rounded-xl border border-slate-200/80 overflow-hidden text-xs">
                    <table className="w-full text-right">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3 text-right">البند والمواصفة التجارية</th>
                          <th className="p-3 text-center">الكمية</th>
                          <th className="p-3 text-left">التكلفة المرجعية</th>
                          <th className="p-3 text-left">سعر البيع</th>
                          <th className="p-3 text-left">الإجمالي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {qte.items.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-bold text-slate-900">
                              {item.materialName}
                              {item.description && <span className="text-[10px] text-slate-400 block font-normal">{item.description}</span>}
                            </td>
                            <td className="p-3 text-center font-mono">{item.quantity} {item.unit}</td>
                            <td className="p-3 text-left font-mono text-slate-400">{item.totalCost.toLocaleString('ar-EG')} ج.م</td>
                            <td className="p-3 text-left font-mono font-bold text-slate-900">{item.unitSellingPrice.toLocaleString('ar-EG')} ج.م</td>
                            <td className="p-3 text-left font-mono font-black text-slate-900">{item.totalSellingPrice.toLocaleString('ar-EG')} ج.م</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Profitability Bar */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">التكلفة المرجعية المقدرة:</span>
                      <span className="font-mono text-xs font-bold text-slate-200">{qte.totalCost.toLocaleString('ar-EG')} ج.م</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">إجمالي سعر البيع للعميل:</span>
                      <span className="font-mono text-base font-black text-white">{qte.totalSelling.toLocaleString('ar-EG')} ج.م</span>
                    </div>

                    <div className="px-3 py-2 bg-emerald-900/80 rounded-xl border border-emerald-500/40 text-left dir-ltr">
                      <span className="text-emerald-300 text-[10px] font-bold block">Gross Margin:</span>
                      <span className="font-mono text-sm font-black text-emerald-400">+{qte.estimatedProfit.toLocaleString('ar-EG')} EGP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: CONTRACT */}
      {activeTab === 'contract' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-[#C87A38]" />
                <span>العقد وجدول الدفعات المرحلي (Contract & Milestone Schedule)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">توثيق الالتزام التجاري ومتابعة استحقاق الدفعات وسندات القبض</p>
            </div>

            {!projectContract && approvedQuote && (
              <button
                onClick={() => setIsCreateContractOpen(true)}
                className="px-4 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إبرام العقد وجدول الدفعات</span>
              </button>
            )}
          </div>

          {projectContract ? (
            <div className="space-y-6">
              
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-bold">
                <div>
                  <span className="text-slate-400 text-[10px] block mb-1">رقم العقد:</span>
                  <span className="text-slate-900 font-mono text-sm">{projectContract.contractNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block mb-1">تاريخ التوقيع:</span>
                  <span className="text-slate-900">{projectContract.contractDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block mb-1">القيمة التعاقدية:</span>
                  <span className="text-emerald-700 font-mono text-base font-black">{projectContract.totalValue.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block mb-1">حالة سداد العربون:</span>
                  <span className={`px-2.5 py-1 rounded-lg inline-block text-[11px] ${projectContract.isDepositVerified ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-black' : 'bg-amber-100 text-amber-900'}`}>
                    {projectContract.isDepositVerified ? '✓ محقق بالحسابات' : 'في انتظار التحقق المالي'}
                  </span>
                </div>
              </div>

              {/* Milestones Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-[#C87A38]" />
                    <span>جدول الدفعات والمستخلصات:</span>
                  </h4>
                  {!projectContract.isDepositVerified && (
                    <button
                      onClick={() => verifyContractDeposit(projectContract.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تأكيد سداد العربون في الحسابات</span>
                    </button>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200/80 overflow-hidden text-xs">
                  <table className="w-full text-right">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3 text-right">الدفعة / المرحلة</th>
                        <th className="p-3 text-center">النسبة</th>
                        <th className="p-3 text-left">المبلغ المستحق</th>
                        <th className="p-3 text-right">شرط الاستحقاق</th>
                        <th className="p-3 text-center">الحالة المالية</th>
                        <th className="p-3 text-center">رقم السند المالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {projectContract.milestones.map(ms => (
                        <tr key={ms.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900">{ms.title}</td>
                          <td className="p-3 text-center font-mono font-bold">{ms.percentage}%</td>
                          <td className="p-3 text-left font-mono font-black text-slate-900">{ms.amount.toLocaleString('ar-EG')} ج.م</td>
                          <td className="p-3 text-slate-600 text-[11px]">{ms.dueDateDescription}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                              ms.status === 'verified_in_finance' || ms.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {ms.status === 'verified_in_finance' ? '✓ محقق بالحسابات' : ms.status === 'paid' ? 'مسدد' : 'مستحق لاحقاً'}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono text-[11px] text-slate-500">
                            {ms.financialReceiptRef || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <p className="text-slate-500 font-bold text-xs">لا يوجد عقد مبرم بعد لهذا المشروع</p>
              {approvedQuote ? (
                <button
                  onClick={() => setIsCreateContractOpen(true)}
                  className="px-5 py-2.5 bg-[#1E110B] hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  إبرام العقد وجدولة الدفعات من Quote V{approvedQuote.version}
                </button>
              ) : (
                <p className="text-amber-800 text-[11px] font-bold">يجب أولاً اعتماد عرض السعر لتتمكن من إنشاء العقد</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: HANDOVER */}
      {activeTab === 'handover' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FolderCheck className="w-5 h-5 text-[#C87A38]" />
                <span>محضر تسليم المشروع للمكتب الفني (Technical Office Handover)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">ضمان استيفاء كامل المتطلبات التعاقدية والهندسية قبل الانتقال للـ BOM والإنتاج</p>
            </div>

            {projectHandover && (
              <span className={`px-3 py-1.5 rounded-xl text-xs font-black ${
                projectHandover.status === 'accepted_by_tech_office'
                  ? 'bg-[#1E110B] text-amber-300 border border-amber-500/50'
                  : 'bg-blue-100 text-blue-900'
              }`}>
                {projectHandover.status === 'accepted_by_tech_office' ? '✓ مستلم ومعتمد بالمكتب الفني' : 'قيد المراجعة'}
              </span>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5 text-emerald-800">
                <CheckSquare className="w-4 h-4 text-[#C87A38]" />
                <span>قائمة الشروط الإلزامية للتسليم (Handover Checklist):</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-bold">اضغط على أي بند للانتقال للقسم الخاص به</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold">
              
              <div 
                onClick={() => setActiveTab('contract')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${projectContract?.status === 'signed' ? 'bg-emerald-50/50 text-emerald-950 border-emerald-300' : 'bg-rose-50/50 text-rose-950 border-rose-300 hover:bg-rose-50'}`}
                title="اضغط للانتقال لتبويب العقد"
              >
                <div className="flex items-center gap-2">
                  {projectContract?.status === 'signed' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                  <span>1. العقد موقع رسمياً</span>
                </div>
                <span className="font-mono text-[11px] text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">{projectContract?.contractNumber || 'غير متوفر (انقر للإبرام)'}</span>
              </div>

              <div 
                onClick={() => setActiveTab('contract')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${projectContract?.isDepositVerified ? 'bg-emerald-50/50 text-emerald-950 border-emerald-300' : 'bg-rose-50/50 text-rose-950 border-rose-300 hover:bg-rose-50'}`}
                title="اضغط للانتقال لجدول الدفعات"
              >
                <div className="flex items-center gap-2">
                  {projectContract?.isDepositVerified ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                  <span>2. العربون محقق بالحسابات</span>
                </div>
                <span className="font-mono text-[11px] text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">{projectContract?.milestones[0]?.amount ? `${projectContract.milestones[0].amount.toLocaleString('ar-EG')} ج.م` : 'غير مسدد'}</span>
              </div>

              <div 
                onClick={() => setActiveTab('quotations')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${approvedQuote ? 'bg-emerald-50/50 text-emerald-950 border-emerald-300' : 'bg-rose-50/50 text-rose-950 border-rose-300 hover:bg-rose-50'}`}
                title="اضغط للانتقال لعروض الأسعار"
              >
                <div className="flex items-center gap-2">
                  {approvedQuote ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                  <span>3. عرض السعر معتمد ومغلق</span>
                </div>
                <span className="font-mono text-[11px] text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">{approvedQuote ? `Quote V${approvedQuote.version}` : 'غير معتمد'}</span>
              </div>

              <div 
                onClick={() => setActiveTab('designs')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${approvedDesign ? 'bg-emerald-50/50 text-emerald-950 border-emerald-300' : 'bg-rose-50/50 text-rose-950 border-rose-300 hover:bg-rose-50'}`}
                title="اضغط للانتقال للتصميمات 3D"
              >
                <div className="flex items-center gap-2">
                  {approvedDesign ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                  <span>4. التصميم 3D معتمد من العميل</span>
                </div>
                <span className="font-mono text-[11px] text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">{approvedDesign ? `Design V${approvedDesign.version}` : 'غير معتمد'}</span>
              </div>

              {(() => {
                const isSurveyValid = (latestVisit?.status === 'completed') || (projectMeasList.length > 0 && projectMeasList.some(m => m.items && m.items.length > 0));
                const measCount = projectMeasList.length > 0 ? (projectMeasList[projectMeasList.length-1]?.items?.length || 0) : 0;
                return (
                  <div 
                    onClick={() => setActiveTab('measurements')}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${isSurveyValid ? 'bg-emerald-50/50 text-emerald-950 border-emerald-300' : 'bg-rose-50/50 text-rose-950 border-rose-300 hover:bg-rose-50'}`}
                    title="اضغط للانتقال لسجل المقاسات والمعاينة"
                  >
                    <div className="flex items-center gap-2">
                      {isSurveyValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                      <span>5. أبعاد الليزر والموانع موثقة</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">{measCount > 0 ? `${measCount} أبعاد موثقة` : 'لا توجد أبعاد'}</span>
                  </div>
                );
              })()}

              <div 
                onClick={() => setActiveTab('measurements')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${latestVisit?.photos && latestVisit.photos.length > 0 ? 'bg-emerald-50/50 text-emerald-950 border-emerald-300' : 'bg-amber-50/50 text-amber-950 border-amber-300 hover:bg-amber-50'}`}
                title="اضغط للانتقال لصور المعاينة"
              >
                <div className="flex items-center gap-2">
                  {latestVisit?.photos && latestVisit.photos.length > 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
                  <span>6. صور وفيديوهات الموقع مرفقة</span>
                </div>
                <span className="font-mono text-[11px] text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">{latestVisit?.photos?.length || 0} صور (اختياري)</span>
              </div>

            </div>

            {!handoverGate.isReady && (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-xs font-bold text-amber-900 space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>متطلبات متبقية لتفعيل زر التسليم:</span>
                </div>
                <ul className="list-disc list-inside pr-6 text-[11px] text-amber-800 space-y-0.5">
                  {handoverGate.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2">
              <label className="block font-bold text-slate-700 mb-1">تعليمات وتفاصيل موجهة للمكتب الفني:</label>
              <textarea
                rows={2}
                value={handoverNotes}
                onChange={e => setHandoverNotes(e.target.value)}
                disabled={projectHandover?.status === 'accepted_by_tech_office'}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                placeholder="اكتب أية تفاصيل دقيقة تخص الشاسيه أو فتحات الأجهزة..."
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              {!projectHandover ? (
                <button
                  onClick={handleSubmitHandoverProtocol}
                  disabled={!handoverGate.isReady}
                  className="px-6 py-2.5 bg-[#1E110B] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>تقديم محضر التسليم للمكتب الفني</span>
                </button>
              ) : projectHandover.status !== 'accepted_by_tech_office' ? (
                <button
                  onClick={() => acceptProjectHandover(projectHandover.id)}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center gap-2"
                >
                  <FolderCheck className="w-4 h-4 text-amber-300" />
                  <span>اعتماد وقبول الاستلام بالمكتب الفني</span>
                </button>
              ) : (
                <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl font-bold flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>تم استلام المشروع بنجاح بالمكتب الفني بواسطة: {projectHandover.acceptedByUserName} في {projectHandover.acceptedDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
            سجل وتراكم حركات المشروع (Audit Trajectory)
          </h3>

          <div className="space-y-3 text-xs">
            {projectTimeline.map(tle => (
              <div key={tle.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#1E110B] text-amber-300 flex items-center justify-center font-bold shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-slate-900 text-sm">{tle.title}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{tle.timestamp}</span>
                  </div>
                  <p className="text-slate-600 font-medium">{tle.description}</p>
                  <span className="text-[10px] text-slate-400 block">بواسطة: {tle.userName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Visit Modal */}
      {isScheduleVisitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900">جدولة موعد معاينة ومقاسات بالموقع</h3>
            
            <div>
              <label className="block font-bold mb-1">تاريخ المعاينة</label>
              <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-bold" />
            </div>

            <div>
              <label className="block font-bold mb-1">عنوان الموقع بالتفصيل</label>
              <input type="text" value={visitAddress} onChange={e => setVisitAddress(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-bold" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsScheduleVisitOpen(false)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button type="button" onClick={() => {
                scheduleSiteVisit(project.id, { date: visitDate, time: visitTime, address: visitAddress, notes: visitNotes });
                setIsScheduleVisitOpen(false);
              }} className="px-5 py-2 bg-[#1E110B] text-white font-bold rounded-xl">تأكيد الموعد</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Measurement Modal */}
      {isAddMeasurementOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl text-right space-y-6 text-xs max-h-[92vh] overflow-y-auto custom-scrollbar border border-slate-100">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1E110B] text-[#C87A38] flex items-center justify-center font-black">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    نموذج تسجيل المقايسة ورفع مقاسات الموقع بالليزر (V{projectMeasList.length + 1})
                  </h3>
                  <p className="text-xs text-slate-500">توثيق أبعاد الحوائط والموانع الإنشائية للموقع</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddMeasurementOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMeasurement} className="space-y-5">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">سبب رفع المقاسات / التعديل *</label>
                <input
                  type="text"
                  required
                  value={updateReason}
                  onChange={e => setUpdateReason(e.target.value)}
                  placeholder="مثال: رفع المقاسات الأولي بالموقع"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none"
                />
              </div>

              {/* Site Photos */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">صور الموقع والجدران:</label>
                <LocalImageUploader
                  images={measPhotos}
                  onChange={(imgs) => setMeasPhotos(imgs)}
                />
              </div>

              {/* Dimensions */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 text-xs">إضافة أبعاد الحوائط:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    placeholder="اسم البُعد (مثال: جدار A موقع الحوض)"
                    className="sm:col-span-2 p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                  />
                  <input
                    type="number"
                    value={newItemVal || ''}
                    onChange={e => setNewItemVal(Number(e.target.value))}
                    placeholder="المقاس (مثال: 420)"
                    className="p-2 bg-white border border-slate-200 rounded-xl text-center font-bold text-xs"
                  />
                  <select
                    value={newItemUnit}
                    onChange={e => setNewItemUnit(e.target.value as any)}
                    className="p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                  >
                    <option value="cm">سم (cm)</option>
                    <option value="mm">مليمتر (mm)</option>
                    <option value="meter">متر (m)</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddMeasItem}
                    className="px-4 py-2 bg-[#1E110B] text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4 text-[#C87A38]" />
                    <span>إضافة البُعد</span>
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  {measItems.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold">
                      <span className="text-slate-900">{it.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          {it.value} {it.unit}
                        </span>
                        <button type="button" onClick={() => handleRemoveMeasItem(idx)} className="text-rose-500 hover:text-rose-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddMeasurementOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={measItems.length === 0}
                  className="px-5 py-2 bg-[#1E110B] hover:bg-black disabled:opacity-40 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  حفظ نسخة المقاسات V{projectMeasList.length + 1}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Add Design Modal */}
      {isAddDesignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl text-right space-y-4 text-xs max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-base font-black text-slate-900">إرسال تصميم 3D جديد V{projectDesignsList.length + 1}</h3>
            
            <div>
              <label className="block font-bold mb-1">اسم التصميم</label>
              <input type="text" value={designName} onChange={e => setDesignName(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-bold" />
            </div>

            <div>
              <label className="block font-bold mb-1">رفع وتحديد صور التصميم 3D</label>
              <LocalImageUploader
                images={designImages}
                onChange={(imgs) => setDesignImages(imgs)}
              />
            </div>

            <div>
              <label className="block font-bold mb-1">ملاحظات التغيير بالتصميم</label>
              <textarea rows={2} value={designNotes} onChange={e => setDesignNotes(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl"></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAddDesignOpen(false)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button
                type="button"
                onClick={handleSaveDesign}
                disabled={designImages.length === 0}
                className="px-5 py-2 bg-[#1E110B] disabled:opacity-40 text-white font-bold rounded-xl"
              >
                إرسال التصميم V{projectDesignsList.length + 1}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Quotation Modal */}
      {isAddQuotationOpen && (() => {
        const selectedMat = materials.find(m => m.id === selectedMatId);
        const modalTotalCost = quoteItems.reduce((acc, item) => acc + item.totalCost, 0);
        const modalSubtotalSelling = quoteItems.reduce((acc, item) => acc + item.totalSellingPrice, 0);
        const modalNetSelling = Math.max(0, modalSubtotalSelling - (Number(quotationDiscount) || 0));

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-right space-y-4 text-xs max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#C87A38]" />
                  <h3 className="text-base font-black text-slate-900">إصدار عرض سعر جديد V{projectQuotesList.length + 1}</h3>
                </div>
                <button onClick={() => setIsAddQuotationOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              {/* Add Item inputs */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">نوع البند</label>
                    <select
                      value={itemCategory}
                      onChange={e => setItemCategory(e.target.value as any)}
                      className="w-full p-2 bg-white border rounded-xl font-bold text-xs"
                    >
                      <option value="material">خامة / ألواح</option>
                      <option value="base_unit">وحدة سفلية (Base Unit)</option>
                      <option value="upper_unit">وحدة علوية (Upper Unit)</option>
                      <option value="mechanism">آلية وميكانيزم</option>
                      <option value="accessory">إكسسوار داخلي ومقابض</option>
                      <option value="marble">مسطح رخام</option>
                      <option value="work">مصنعيات وتركيب</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">اختر الصنف من الدليل</label>
                    <select
                      value={selectedMatId}
                      onChange={e => handleSelectMaterial(e.target.value)}
                      className="w-full p-2 bg-white border rounded-xl font-bold text-xs"
                    >
                      {materials.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.currentReferenceCost.toLocaleString('ar-EG')} ج.م / {m.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">الكمية</label>
                    <input
                      type="number"
                      min={1}
                      value={itemQty}
                      onChange={e => setItemQty(Number(e.target.value))}
                      className="w-full p-2 bg-white border rounded-xl text-center font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">سعر البيع للعميل (ج.م)</label>
                    <input
                      type="number"
                      min={0}
                      value={itemSellingPrice}
                      onChange={e => setItemSellingPrice(Number(e.target.value))}
                      className="w-full p-2 bg-white border rounded-xl text-center font-bold text-xs"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddQuoteItem}
                      className="w-full p-2 bg-[#1E110B] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4 text-[#C87A38]" />
                      <span>إضافة الصنف</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                    <tr>
                      <th className="p-2.5">الصنف</th>
                      <th className="p-2.5 text-center">الكمية</th>
                      <th className="p-2.5 text-center">سعر البيع</th>
                      <th className="p-2.5 text-left">الإجمالي</th>
                      <th className="p-2.5 text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quoteItems.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-900">{it.materialName}</td>
                        <td className="p-2.5 text-center font-mono font-bold">{it.quantity} {it.unit}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-emerald-800">{it.unitSellingPrice.toLocaleString('ar-EG')} ج.م</td>
                        <td className="p-2.5 text-left font-mono font-black text-slate-900">{it.totalSellingPrice.toLocaleString('ar-EG')} ج.م</td>
                        <td className="p-2.5 text-center">
                          <button type="button" onClick={() => handleRemoveQuoteItem(idx)} className="text-rose-500 hover:text-rose-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Card */}
              <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between font-bold">
                <div>
                  <span className="text-[10px] text-slate-400 block">إجمالي التكلفة المرجعية:</span>
                  <span className="font-mono text-xs">{modalTotalCost.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">صافي السعر للعميل:</span>
                  <span className="font-mono text-sm font-black text-emerald-400">{modalNetSelling.toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsAddQuotationOpen(false)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
                <button
                  type="button"
                  onClick={handleSaveQuotation}
                  disabled={quoteItems.length === 0}
                  className="px-5 py-2 bg-[#1E110B] text-white font-bold rounded-xl"
                >
                  إصدار عرض السعر V{projectQuotesList.length + 1}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Create Contract Modal */}
      {isCreateContractOpen && approvedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl text-right space-y-4 text-xs max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-[#C87A38]" />
                <span>إبرام العقد وتحديد جدول الدفعات المرحلي</span>
              </h3>
              <button onClick={() => setIsCreateContractOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveContractWithMilestones} className="space-y-4">
              <div className="p-3 bg-emerald-50 text-emerald-950 rounded-2xl border border-emerald-200 flex items-center justify-between font-bold">
                <span>القيمة التعاقدية (من Quote V{approvedQuote.version}):</span>
                <span className="font-mono text-base font-black text-emerald-800">{approvedQuote.totalSelling.toLocaleString('ar-EG')} ج.م</span>
              </div>

              <div>
                <label className="block font-bold mb-1">شروط السداد والدفعات</label>
                <input
                  type="text"
                  required
                  value={contractPaymentTerms}
                  onChange={e => setContractPaymentTerms(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">شروط ومدة التسليم والتركيب</label>
                <input
                  type="text"
                  required
                  value={contractDeliveryTerms}
                  onChange={e => setContractDeliveryTerms(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
                />
              </div>

              {/* Milestones */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-black text-slate-900 block">نسب الدفعات المرحلية:</span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-white rounded-xl border">
                    <span className="text-[10px] text-slate-500 block font-bold">1. العربون</span>
                    <input
                      type="number"
                      min={10}
                      max={80}
                      value={ms1Percent}
                      onChange={e => setMs1Percent(Number(e.target.value))}
                      className="w-full text-center font-mono font-black text-sm"
                    />
                    <span className="text-[10px] font-mono text-emerald-700 block mt-0.5">{Math.round(approvedQuote.totalSelling * (ms1Percent/100)).toLocaleString('ar-EG')} ج.م</span>
                  </div>

                  <div className="p-2 bg-white rounded-xl border">
                    <span className="text-[10px] text-slate-500 block font-bold">2. قبل الشحن</span>
                    <input
                      type="number"
                      min={10}
                      max={80}
                      value={ms2Percent}
                      onChange={e => setMs2Percent(Number(e.target.value))}
                      className="w-full text-center font-mono font-black text-sm"
                    />
                    <span className="text-[10px] font-mono text-emerald-700 block mt-0.5">{Math.round(approvedQuote.totalSelling * (ms2Percent/100)).toLocaleString('ar-EG')} ج.م</span>
                  </div>

                  <div className="p-2 bg-white rounded-xl border">
                    <span className="text-[10px] text-slate-500 block font-bold">3. عند التسليم</span>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={ms3Percent}
                      onChange={e => setMs3Percent(Number(e.target.value))}
                      className="w-full text-center font-mono font-black text-sm"
                    />
                    <span className="text-[10px] font-mono text-emerald-700 block mt-0.5">{Math.round(approvedQuote.totalSelling * (ms3Percent/100)).toLocaleString('ar-EG')} ج.م</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCreateContractOpen(false)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-[#1E110B] text-white font-bold rounded-xl shadow-xs">
                  تأكيد توقيع العقد وجدولة الدفعات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModalDesignId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-rose-900">تسجيل طلب تعديل التصميم</h3>
            <div>
              <label className="block font-bold mb-1">سبب التعديل والرفض من العميل *</label>
              <textarea
                rows={3}
                value={rejectionReasonText}
                onChange={e => setRejectionReasonText(e.target.value)}
                className="w-full p-2 bg-rose-50 border border-rose-300 rounded-xl text-rose-950 font-bold"
              ></textarea>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRejectionModalDesignId(null)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button
                type="button"
                onClick={() => {
                  updateDesignStatus(rejectionModalDesignId, 'rejected', rejectionReasonText);
                  setRejectionModalDesignId(null);
                }}
                className="px-5 py-2 bg-rose-700 text-white font-bold rounded-xl"
              >
                تأكيد طلب التعديل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Zoom Modal */}
      {activeLightbox && (
        <ImageZoomModal
          isOpen={!!activeLightbox}
          onClose={() => setActiveLightbox(null)}
          images={activeLightbox.images}
          initialIndex={activeLightbox.index}
          title={activeLightbox.title}
        />
      )}

      {/* Official Quotation Modal */}
      {selectedQuoteForOfficialModal && (
        <OfficialQuotationModal
          isOpen={true}
          onClose={() => setSelectedQuoteForOfficialModal(null)}
          quotation={selectedQuoteForOfficialModal}
          project={project}
          customer={customers.find(c => c.id === project?.customerId)}
          onApprove={(quoteId) => {
            acceptQuotation(quoteId);
            setSelectedQuoteForOfficialModal(null);
          }}
        />
      )}

    </div>
  );
};
