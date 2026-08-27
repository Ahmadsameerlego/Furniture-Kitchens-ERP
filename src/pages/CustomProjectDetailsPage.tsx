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
  Video
} from 'lucide-react';
import { LocalImageUploader } from '../components/common/LocalImageUploader';
import { ImageZoomModal } from '../components/common/ImageZoomModal';

interface CustomProjectDetailsPageProps {
  projectId: string;
  onBack: () => void;
}

export const CustomProjectDetailsPage: React.FC<CustomProjectDetailsPageProps> = ({ projectId, onBack }) => {
  const {
    customProjects,
    siteVisits,
    projectMeasurements,
    projectDesigns,
    projectQuotations,
    projectTimelineEvents,
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
    convertQuotationToOrder,
    checkPermission
  } = useERP();

  const project = customProjects.find(p => p.id === projectId);
  const [activeTab, setActiveTab] = useState<'overview' | 'measurements' | 'designs' | 'quotations' | 'timeline'>('overview');

  // Modals & Forms State
  const [isScheduleVisitOpen, setIsScheduleVisitOpen] = useState(false);
  const [visitDate, setVisitDate] = useState('2026-08-30');
  const [visitTime, setVisitTime] = useState('16:00');
  const [visitAddress, setVisitAddress] = useState('فيلا 14 - التجمع الخامس');
  const [visitNotes, setVisitNotes] = useState('');

  // Measurement Builder State with Local Uploads & Technical Checklist
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
  const [itemQty, setItemQty] = useState(8);
  const [itemSellingPrice, setItemSellingPrice] = useState(materials[0] ? Math.round((materials[0].currentReferenceCost || 1250) * 1.4) : 1900);
  const [quotationDiscount, setQuotationDiscount] = useState<number>(0);
  const [quotationNotes, setQuotationNotes] = useState('عرض سعر شاملاً خامات HPL والتركيب والضمان 5 سنوات');
  const [quoteItems, setQuoteItems] = useState<{
    materialId?: string;
    materialName: string;
    itemType: 'material' | 'product' | 'work' | 'accessory';
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
      quantity: 8,
      unit: materials[0]?.unit || 'لوح',
      unitCost: materials[0]?.currentReferenceCost || 1250,
      unitSellingPrice: 1900,
      totalCost: (materials[0]?.currentReferenceCost || 1250) * 8,
      totalSellingPrice: 1900 * 8
    }
  ]);

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
      itemType: 'material' as const,
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

  const [commentText, setCommentText] = useState('');
  const [rejectionModalDesignId, setRejectionModalDesignId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('تغيير لون الدلف وإعادة توزيع الجزيرة');

  if (!project) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
        <p className="text-slate-500 font-bold text-sm">عفواً، لم يتم العثور على مشروع التفصيل المطلوب</p>
        <button onClick={onBack} className="px-4 py-2 bg-[#1C352D] text-white text-xs font-bold rounded-xl">
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

  const statusMeta = CustomProjectService.getProjectStatusMeta(project.status);
  const latestVisit = projectVisits[projectVisits.length - 1];
  const latestMeas = projectMeasList[projectMeasList.length - 1];
  const latestDesign = projectDesignsList[projectDesignsList.length - 1];
  const latestQuote = projectQuotesList[projectQuotesList.length - 1];

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

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-xs transition-all"
        >
          <ArrowRight className="w-4 h-4 text-[#1C352D]" />
          <span>العودة لقائمة المشاريع</span>
        </button>
      </div>

      {/* Project Header Card 360 */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md">
                <Ruler className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900">{project.projectName}</h1>
                  <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200 font-bold">
                    {project.projectNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-bold">
                  العميل: <strong className="text-slate-900">{project.customerName}</strong> ({project.customerPhone}) — الفرع: {project.branchName}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className={`px-4 py-2 rounded-2xl text-xs font-black border shadow-xs ${statusMeta.bgClass}`}>
              {statusMeta.label}
            </span>

            {project.status === 'customer_approval' && latestQuote && (
              <button
                onClick={() => acceptQuotation(latestQuote.id)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 animate-bounce"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد موافقة العميل النهائي (Customer Approved)</span>
              </button>
            )}
          </div>

        </div>

        {/* Workflow Lifecycle Step Indicator */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 mb-2">مراحل دورة عمل المشروع المخصص (Lifecycle Steps):</p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-[10px] font-bold text-center">
            
            <div className={`p-2 rounded-xl border ${statusMeta.step >= 1 ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-black' : 'bg-slate-50 text-slate-400'}`}>
              1. جديد
            </div>
            <div className={`p-2 rounded-xl border ${statusMeta.step >= 2 ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-black' : 'bg-slate-50 text-slate-400'}`}>
              2. المعاينة
            </div>
            <div className={`p-2 rounded-xl border ${statusMeta.step >= 3 ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-black' : 'bg-slate-50 text-slate-400'}`}>
              3. المقاسات
            </div>
            <div className={`p-2 rounded-xl border ${statusMeta.step >= 4 ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-black' : 'bg-slate-50 text-slate-400'}`}>
              4. التصميم 3D
            </div>
            <div className={`p-2 rounded-xl border ${statusMeta.step >= 5 ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-black' : 'bg-slate-50 text-slate-400'}`}>
              5. مراجعة العميل
            </div>
            <div className={`p-2 rounded-xl border ${statusMeta.step >= 6 ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-black' : 'bg-slate-50 text-slate-400'}`}>
              6. عرض السعر
            </div>
            <div className={`p-2 rounded-xl border ${statusMeta.step >= 7 ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-black' : 'bg-slate-50 text-slate-400'}`}>
              7. الموافقة
            </div>
            <div className={`p-2 rounded-xl border ${statusMeta.step >= 8 ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-black' : 'bg-slate-50 text-slate-400'}`}>
              8. معتمد ومفعل
            </div>

          </div>
        </div>

      </div>

      {/* Tabs Bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-1 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all ${
            activeTab === 'overview' ? 'bg-[#1C352D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          نظرة عامة والمعاينة الميدانية
        </button>

        <button
          onClick={() => setActiveTab('measurements')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'measurements' ? 'bg-[#1C352D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>رفع وتاريخ المقاسات</span>
          <span className="bg-white/20 text-xs px-2 py-0.2 rounded-full font-mono">{projectMeasList.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('designs')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'designs' ? 'bg-[#1C352D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>التصميمات 3D ورأي العميل</span>
          <span className="bg-white/20 text-xs px-2 py-0.2 rounded-full font-mono">{projectDesignsList.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('quotations')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'quotations' ? 'bg-[#1C352D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>عروض الأسعار والتكلفة</span>
          <span className="bg-white/20 text-xs px-2 py-0.2 rounded-full font-mono">{projectQuotesList.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'timeline' ? 'bg-[#1C352D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>سجل المراحل (Timeline)</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SITE VISIT */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Site Visit Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#E06F28]" />
                <h3 className="text-base font-black text-slate-900">المعاينة الميدانية ورفع المقاسات بالموقع (Site Visit)</h3>
              </div>

              {!latestVisit ? (
                <button
                  onClick={() => setIsScheduleVisitOpen(true)}
                  className="px-4 py-2 bg-[#1C352D] text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  + جدولة موعد معاينة بالموقع
                </button>
              ) : (
                <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                  latestVisit.status === 'completed' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-amber-100 text-amber-900'
                }`}>
                  {latestVisit.status === 'completed' ? '✓ تم إتمام المعاينة والمقاسات' : 'موعد مجدول'}
                </span>
              )}
            </div>

            {latestVisit ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-bold text-slate-800">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">تاريخ وتوقيت المعاينة:</span>
                    <span>{latestVisit.date} الساعة {latestVisit.time}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">عنوان الموقع والمبنى:</span>
                    <span>{latestVisit.address}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">الفني / المهندس المسؤول:</span>
                    <span>{latestVisit.assignedUserName}</span>
                  </div>
                </div>

                {/* Site Conditions Report */}
                {latestVisit.siteConditions && (
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
                    <p className="font-black text-amber-950 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#E06F28]" />
                      <span>تقرير الفحص الفني والاشتراطات الميدانية بالموقع (Site Technical Inspection):</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-[11px] font-bold text-slate-800">
                      <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200/60">• الأوردة والأعمدة: <strong>{latestVisit.siteConditions.hasColumn ? (latestVisit.siteConditions.columnDetails || 'نعم (عمود بارز)') : 'لا يوجد'}</strong></div>
                      <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200/60">• ارتفاع السقف صافي: <strong>{latestVisit.siteConditions.ceilingHeight}</strong></div>
                      <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200/60">• مواقع الجلسات والنوافذ: <strong>{latestVisit.siteConditions.windowLocation}</strong></div>
                      <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200/60">• نقاط وتأسيسات الكهرباء: <strong>{latestVisit.siteConditions.electricalPoints}</strong></div>
                      <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200/60">• السباكة ومخرج الصرف: <strong>{latestVisit.siteConditions.waterConnection}</strong></div>
                      {latestVisit.siteConditions.gasConnection && (
                        <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200/60">• الغاز الطبيعي: <strong>{latestVisit.siteConditions.gasConnection}</strong></div>
                      )}
                      {latestVisit.siteConditions.wallStraightness && (
                        <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200/60">• تعامد واستقامة الجدران: <strong>{latestVisit.siteConditions.wallStraightness}</strong></div>
                      )}
                      {latestVisit.siteConditions.flooringLevel && (
                        <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200/60">• استواء الأرضيات: <strong>{latestVisit.siteConditions.flooringLevel}</strong></div>
                      )}
                      <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200/60 lg:col-span-3">• تفضيلات واشتراطات العميل: <strong>{latestVisit.siteConditions.customerPreferences}</strong></div>
                    </div>
                  </div>
                )}

                {/* Site Media (Photos & Videos) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>صور وفيديوهات الرفع الميداني من الموقع:</span>
                    <span className="text-[10px] text-slate-400">اضغط على الصور للتكبير Zoom</span>
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {latestVisit.photos.map((ph, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveLightbox({ images: latestVisit.photos, index: i, title: 'صورة رفع المقاسات بالموقع' })}
                        className="group relative w-36 h-28 rounded-2xl overflow-hidden border border-slate-200 shadow-xs cursor-pointer shrink-0 bg-slate-900"
                      >
                        <img src={ph} alt="site" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                          <span className="p-1.5 rounded-lg bg-white text-slate-900 text-[10px] font-bold flex items-center gap-1">
                            <ZoomIn className="w-3.5 h-3.5 text-[#E06F28]" /> تكبير
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Inline Video Player */}
                  {latestVisit.videos && latestVisit.videos.length > 0 && (
                    <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-amber-400">
                        <Video className="w-4 h-4" />
                        <span>فيديو المعاينة وتصوير الموقع 360°:</span>
                      </div>
                      <video
                        src={latestVisit.videos[0]}
                        controls
                        className="w-full max-h-64 rounded-xl bg-black border border-slate-800"
                        poster={latestVisit.photos[0]}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">لم يتم تسجيل موعد معاينة ميدانية بعد لهذا المشروع</p>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: MEASUREMENTS & HISTORY */}
      {activeTab === 'measurements' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">سجل وتاريخ المقاسات والأبعاد (Measurement History)</h3>
              <p className="text-xs text-slate-500">حفظ كافة الإصدارات التاريخية وتغييرات المقاسات دون مسح البيانات السابقة</p>
            </div>

            <button
              onClick={() => setIsAddMeasurementOpen(true)}
              className="px-4 py-2 bg-[#1C352D] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#E06F28]" />
              <span>إضافة نسخة مقاسات جديدة (New Version)</span>
            </button>
          </div>

          {/* Measurement Versions History List */}
          <div className="space-y-4">
            {projectMeasList.map((meas, idx) => (
              <div key={meas.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-[#1C352D] text-white flex items-center justify-center font-black text-xs font-mono">
                      V{meas.version}
                    </span>
                    <div>
                      <p className="font-black text-slate-900 text-sm">إصدار المقاسات V{meas.version}</p>
                      <p className="text-[11px] text-slate-500">تاريخ الرفع: {meas.createdDate} — بواسطة: {meas.createdByUserName}</p>
                    </div>
                  </div>

                  {meas.reasonForUpdate && (
                    <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-3 py-1 rounded-xl border border-amber-200">
                      سبب التعديل: {meas.reasonForUpdate}
                    </span>
                  )}
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {meas.items.map(it => (
                    <div key={it.id} className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-bold block">{it.name}</span>
                      <p className="font-black text-slate-900 text-base font-mono dir-ltr text-right">
                        {it.value} <span className="text-xs text-amber-800 font-sans">{it.unit}</span>
                      </p>
                      {it.notes && <p className="text-[10px] text-slate-400 italic">ملاحظة: {it.notes}</p>}
                    </div>
                  ))}
                </div>

                {/* Attached Media for Measurement Version */}
                {meas.sitePhotos && meas.sitePhotos.length > 0 && (
                  <div className="pt-2 space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-slate-600 block">صور ومعاينات مرفقة بالنسخة V{meas.version}:</span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {meas.sitePhotos.map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActiveLightbox({ images: meas.sitePhotos || [], index: idx, title: `مقاسات V${meas.version}` })}
                          className="w-20 h-16 rounded-xl overflow-hidden border border-slate-300 cursor-pointer shrink-0"
                        >
                          <img src={p} alt="meas-ph" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 3D DESIGNS & CUSTOMER REVIEW */}
      {activeTab === 'designs' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">التصميمات 3D ومراجعة العميل (3D Designs & Customer Review)</h3>
              <p className="text-xs text-slate-500">رفع تصميمات 3D، استلام ملاحظات العميل، وتوثيق الموافقة أو الرفض بالتاريخ والسبب</p>
            </div>

            <button
              onClick={() => setIsAddDesignOpen(true)}
              className="px-4 py-2 bg-[#1C352D] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#E06F28]" />
              <span>إرسال تصميم 3D جديد للعميل</span>
            </button>
          </div>

          <div className="space-y-6">
            {projectDesignsList.map(dsg => {
              const dsgMeta = CustomProjectService.getDesignStatusMeta(dsg.status);

              return (
                <div key={dsg.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-[#E06F28] text-white flex items-center justify-center font-black text-xs font-mono">
                        V{dsg.version}
                      </span>
                      <div>
                        <p className="font-black text-slate-900 text-sm">{dsg.designName}</p>
                        <p className="text-[11px] text-slate-500">تاريخ الإرسال: {dsg.createdDate} — المصمم: {dsg.createdByUserName}</p>
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
                          <span>تأكيد اعتماد التصميم</span>
                        </button>
                      )}

                      {dsg.status !== 'rejected' && (
                        <button
                          onClick={() => setRejectionModalDesignId(dsg.id)}
                          className="px-3 py-1.5 bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-300 font-bold text-xs rounded-xl"
                        >
                          طلب تعديل/رفض
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Renderings Gallery with Zoom Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {dsg.images.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveLightbox({ images: dsg.images, index: idx, title: `${dsg.designName} (V${dsg.version})` })}
                        className="group relative h-60 rounded-2xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer bg-slate-900"
                      >
                        <img src={img} alt="design-3d" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                          <span className="px-4 py-2 rounded-xl bg-white/90 font-black text-xs text-slate-900 flex items-center gap-1.5 shadow-lg">
                            <ZoomIn className="w-4 h-4 text-[#E06F28]" />
                            <span>معاينة وتكبير (Zoom In)</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {dsg.rejectionReason && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-950">
                      ملاحظة تعديل العميل المطلوب: {dsg.rejectionReason}
                    </div>
                  )}

                  {/* Customer Comments Thread */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 text-xs">
                    <p className="font-bold text-slate-900 flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-[#E06F28]" />
                      <span>سجل ملاحظات واستفسارات العميل على النسخة V{dsg.version}:</span>
                    </p>

                    <div className="space-y-2">
                      {dsg.comments.map(c => (
                        <div key={c.id} className={`p-3 rounded-xl border ${c.isCustomer ? 'bg-amber-50 border-amber-200 text-slate-900' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                            <span>{c.userName} {c.isCustomer && '(العميل)'}</span>
                            <span className="font-mono">{c.date}</span>
                          </div>
                          <p className="font-bold text-xs text-slate-800 mt-1">{c.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="إضافة ملاحظة على التصميم..."
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                      <button
                        onClick={() => {
                          if (!commentText.trim()) return;
                          addDesignComment(dsg.id, commentText, true);
                          setCommentText('');
                        }}
                        className="px-4 py-1.5 bg-[#1C352D] text-white font-bold rounded-xl"
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

      {/* TAB 4: QUOTATIONS & ESTIMATES */}
      {activeTab === 'quotations' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">عروض الأسعار والتكلفة الداخلية (Project Quotations)</h3>
              <p className="text-xs text-slate-500">إصدار عروض الأسعار بناءً على دليل الخامات والمصنعيات وحساب الربحية التقديرية</p>
            </div>

            <button
              onClick={() => setIsAddQuotationOpen(true)}
              className="px-4 py-2 bg-[#1C352D] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#E06F28]" />
              <span>إصدار عرض سعر جديد (New Quotation)</span>
            </button>
          </div>

          <div className="space-y-6">
            {projectQuotesList.map(qte => {
              const quoteMeta = CustomProjectService.getQuotationStatusMeta(qte.status);

              return (
                <div key={qte.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-xs font-mono">
                        V{qte.version}
                      </span>
                      <div>
                        <p className="font-black text-slate-900 text-sm">عرض سعر V{qte.version}</p>
                        <p className="text-[11px] text-slate-500">تاريخ الإصدار: {qte.createdDate} — بواسطة: {qte.createdByUserName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${quoteMeta.bgClass}`}>
                        {quoteMeta.label}
                      </span>

                      {/* WhatsApp Share Button */}
                      <button
                        onClick={() => window.open(`https://wa.me/2${project.customerPhone}?text=${encodeURIComponent(`مرحباً أ/ ${project.customerName}، يسعدنا موافاتكم بعرض السعر المعتمد لمشروع ${project.projectName} بمبلغ ${qte.totalSelling.toLocaleString('ar-EG')} ج.م`)}`, '_blank')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>مشاركة واتساب</span>
                      </button>

                      {qte.status !== 'accepted' ? (
                        <button
                          onClick={() => acceptQuotation(qte.id)}
                          className="px-3 py-1.5 bg-[#E06F28] hover:bg-[#c85e1b] text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تأكيد قبول العميل</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => createContractFromQuotation(qte.id, 'مقدم 40,000 ج.م والمتبقي على أقساط', 'التسليم والتركيب خلال 30 يوم عمل')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>إصدار العقد الموثق</span>
                          </button>

                          <button
                            onClick={() => convertQuotationToOrder(qte.id, 40000, 4)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl flex items-center gap-1 shadow-md"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>تحويل لأمر مبيعات وتصنيع (Convert Order)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
                    <table className="w-full text-right">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3 text-right">الصنف والخامة (من مكتبة الخامات)</th>
                          <th className="p-3 text-center">الكمية والوحدة</th>
                          <th className="p-3 text-left">التكلفة الداخلية (Internal)</th>
                          <th className="p-3 text-left">سعر البيع للعميل (Selling)</th>
                          <th className="p-3 text-left">إجمالي البيع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {qte.items.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-900">
                              {item.materialName}
                              {item.description && <span className="text-[10px] text-slate-400 block font-normal">{item.description}</span>}
                            </td>
                            <td className="p-3 text-center font-mono">{item.quantity} {item.unit}</td>
                            <td className="p-3 text-left font-mono text-slate-500 bg-amber-50/50">{item.totalCost.toLocaleString('ar-EG')} ج.م</td>
                            <td className="p-3 text-left font-mono font-bold text-slate-900">{item.unitSellingPrice.toLocaleString('ar-EG')} ج.م</td>
                            <td className="p-3 text-left font-mono font-black text-amber-900">{item.totalSellingPrice.toLocaleString('ar-EG')} ج.م</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Internal Profitability Summary */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px] font-bold">إجمالي التكلفة الداخلية (سري):</span>
                      <span className="font-mono text-sm font-bold text-slate-200">{qte.totalCost.toLocaleString('ar-EG')} ج.م</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] font-bold">إجمالي البيع المعروض للعميل:</span>
                      <span className="font-mono text-base font-black text-white">{qte.totalSelling.toLocaleString('ar-EG')} ج.م</span>
                    </div>

                    <div className="p-2.5 bg-emerald-900/60 rounded-xl border border-emerald-500/30 text-left dir-ltr">
                      <span className="text-emerald-300 text-[10px] font-bold block">Estimated Gross Profit:</span>
                      <span className="font-mono text-base font-black text-emerald-400">+{qte.estimatedProfit.toLocaleString('ar-EG')} EGP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
            سجل وتراكم حركات المشروع الحقيقية (Project Audit Trajectory)
          </h3>

          <div className="space-y-3 text-xs">
            {projectTimeline.map(tle => (
              <div key={tle.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#1C352D] text-white flex items-center justify-center font-bold shrink-0">
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
              }} className="px-5 py-2 bg-[#1C352D] text-white font-black rounded-xl">تأكيد الموعد</button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Site Measurement & Technical Inspection Builder Modal */}
      {isAddMeasurementOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl text-right space-y-6 text-xs max-h-[92vh] overflow-y-auto custom-scrollbar border border-slate-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1C352D] text-[#E06F28] flex items-center justify-center font-black">
                  <Ruler className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    نموذج تسجيل المقايسة ورفع مقاسات الموقع الميدانية (Version {projectMeasList.length + 1})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    توثيق أبعاد الجدران، رفع صور وفيديوهات المعاينة، وإدخال الفحص والاشتراطات الفنية للموقع
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddMeasurementOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMeasurement} className="space-y-6">
              
              {/* SECTION 1: BASIC MEASUREMENT INFO */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5 text-emerald-800">
                  <FileText className="w-4 h-4 text-[#E06F28]" />
                  <span>1. تفاصيل وبيانات المقايسة والتحديث:</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">سبب رفع المقاسات / التعديل *</label>
                    <input
                      type="text"
                      required
                      value={updateReason}
                      onChange={e => setUpdateReason(e.target.value)}
                      placeholder="مثال: رفع المقاسات الأولي بالموقع / إضافة غسالة أطباق بلت إن"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#1C352D]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ملاحظات فنية عامة من المهندس للموقع</label>
                    <input
                      type="text"
                      value={measTechnicalNotes}
                      onChange={e => setMeasTechnicalNotes(e.target.value)}
                      placeholder="مثال: تم قياس الموقع بالليزر والتأكد من استواء الأرضيات والجدران"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-[#1C352D]/20 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: SITE MEDIA UPLOAD (PHOTOS & VIDEOS) */}
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-amber-950 text-xs flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#E06F28]" />
                    <span>2. رفع وتوثيق صور وفيديوهات المعاينة الميدانية من الموقع (Site Media):</span>
                  </h4>
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-200/60 px-2 py-0.5 rounded-lg">
                    مرفوعات محلية Instant Local Upload
                  </span>
                </div>

                {/* Photo Uploader */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    صور الموقع والجدران (يمكنك رفع عدة صور محلياً أو بالسحب والإفلات):
                  </label>
                  <LocalImageUploader
                    images={measPhotos}
                    onChange={(imgs) => setMeasPhotos(imgs)}
                  />
                </div>

                {/* Video Uploader / Link */}
                <div className="pt-2 border-t border-amber-200/60 space-y-2">
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-emerald-700" />
                    <span>رابط فيديو تصوير الموقع 360° (أو اختر ملف فيديو محلي):</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={measVideoUrl}
                      onChange={e => setMeasVideoUrl(e.target.value)}
                      placeholder="ضع رابط فيديو الموقع أو اختر ملف محلي..."
                      className="flex-1 p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs dir-ltr"
                    />
                    <label className="px-4 py-2.5 bg-emerald-800 text-white font-bold rounded-xl cursor-pointer hover:bg-emerald-900 transition-colors flex items-center gap-1 shrink-0">
                      <Camera className="w-4 h-4" />
                      <span>اختر فيديو</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setMeasVideoUrl(url);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {measVideoUrl && (
                    <div className="mt-2 p-2 bg-slate-900 rounded-xl">
                      <video src={measVideoUrl} controls className="w-full h-40 rounded-lg bg-black" />
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: TECHNICAL SITE INSPECTION CHECKLIST */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-[#E06F28]" />
                  <span>3. تقرير الفحص والظروف الفنية الشاملة بالموقع (Site Technical Conditions):</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ارتفاع السقف صافي *</label>
                    <input
                      type="text"
                      value={siteCondCeilingHeight}
                      onChange={e => setSiteCondCeilingHeight(e.target.value)}
                      placeholder="مثال: 280 سم (سقف جبسوم بورد)"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الأعمدة والخرسانات البارزة</label>
                    <input
                      type="text"
                      value={siteCondColumnDetails}
                      onChange={e => setSiteCondColumnDetails(e.target.value)}
                      placeholder="مثال: عمود بارز 15سم × 30سم بالجدار B"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تأسيسات ونقاط الكهرباء والفيش</label>
                    <input
                      type="text"
                      value={siteCondElectricalPoints}
                      onChange={e => setSiteCondElectricalPoints(e.target.value)}
                      placeholder="مثال: 4 نقاط كهرباء على ارتفاع 110سم"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">توصيلات ومخرج السباكة والصرف</label>
                    <input
                      type="text"
                      value={siteCondWaterConnection}
                      onChange={e => setSiteCondWaterConnection(e.target.value)}
                      placeholder="مثال: مخرج سباكة وصرف بالحوض بالجدار A"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">توصيلات الغاز الطبيعي</label>
                    <input
                      type="text"
                      value={siteCondGasConnection}
                      onChange={e => setSiteCondGasConnection(e.target.value)}
                      placeholder="مثال: محبس غاز قائم بجوار جدار A"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">استقامة وتعامد الجدران 90°</label>
                    <input
                      type="text"
                      value={siteCondWallStraightness}
                      onChange={e => setSiteCondWallStraightness(e.target.value)}
                      placeholder="مثال: تعامد ممتازة 90°"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">مواقع النوافذ والجلسات</label>
                    <input
                      type="text"
                      value={siteCondWindowLocation}
                      onChange={e => setSiteCondWindowLocation(e.target.value)}
                      placeholder="مثال: جدار B يبدأ النافذة بعد 90سم"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">استواء الأرضيات</label>
                    <input
                      type="text"
                      value={siteCondFlooringLevel}
                      onChange={e => setSiteCondFlooringLevel(e.target.value)}
                      placeholder="مثال: بورسلين مستوي 100%"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block font-bold text-slate-700 mb-1">تفضيلات واشتراطات العميل الفنية بالموقع</label>
                    <input
                      type="text"
                      value={siteCondCustomerPreferences}
                      onChange={e => setSiteCondCustomerPreferences(e.target.value)}
                      placeholder="مثال: رغبة العميل في جزيرة وسطية 180سم مع رخام اسباني جالاكسي أسود"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: LINE ITEM DIMENSIONS TABLE BUILDER */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5 text-emerald-800">
                  <Ruler className="w-4 h-4 text-[#E06F28]" />
                  <span>4. جدول أبعاد الجدران والبُنود التفصيلية (Line Item Dimensions):</span>
                </h4>

                {/* Add New Line Dimension Inputs */}
                <div className="p-3 bg-white rounded-xl border border-slate-300 space-y-2">
                  <p className="font-bold text-slate-800">إضافة بُعد / جدار جديد:</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      placeholder="اسم البُعد (مثال: جدار A موقع الحوض)"
                      className="sm:col-span-2 p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                    />

                    <input
                      type="number"
                      value={newItemVal || ''}
                      onChange={e => setNewItemVal(Number(e.target.value))}
                      placeholder="المقاس (مثال: 420)"
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold font-mono text-xs dir-ltr"
                    />

                    <select
                      value={newItemUnit}
                      onChange={e => setNewItemUnit(e.target.value as any)}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                    >
                      <option value="cm">سم (cm)</option>
                      <option value="mm">مليمتر (mm)</option>
                      <option value="meter">متر (m)</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newItemNotes}
                      onChange={e => setNewItemNotes(e.target.value)}
                      placeholder="ملاحظات البُعد (مثال: يحتوي على مخرج صرف ومأخذ فلتر)"
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />

                    <button
                      type="button"
                      onClick={handleAddMeasItem}
                      className="px-4 py-2 bg-[#1C352D] hover:bg-[#142921] text-white font-black text-xs rounded-xl shadow-xs shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4 text-[#E06F28]" />
                      <span>إضافة البُعد</span>
                    </button>
                  </div>
                </div>

                {/* List of Added Dimensions */}
                <div className="space-y-1.5 pt-2">
                  <p className="font-bold text-slate-700 text-[11px]">الأبعاد المضافة بالنسخة الحالية ({measItems.length}):</p>
                  
                  {measItems.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
                      <div>
                        <span className="text-slate-900 font-black">{it.name}</span>
                        {it.notes && <span className="text-[10px] text-slate-400 block font-normal">{it.notes}</span>}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-sm">
                          {it.value} {it.unit}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMeasItem(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="حذف البُعد"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddMeasurementOpen(false)}
                  className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={measItems.length === 0}
                  className="px-6 py-2.5 bg-[#1C352D] hover:bg-[#142921] disabled:opacity-40 text-white font-black rounded-xl text-xs shadow-lg transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#E06F28]" />
                  <span>حفظ المقايسة ونسخة المقاسات V{projectMeasList.length + 1}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Add Design Modal with Local Upload */}
      {isAddDesignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl text-right space-y-4 text-xs max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-base font-black text-slate-900">إرسال تصميم 3D جديد V{projectDesignsList.length + 1}</h3>
            
            <div>
              <label className="block font-bold mb-1">اسم التصميم</label>
              <input type="text" value={designName} onChange={e => setDesignName(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-bold" />
            </div>

            <div>
              <label className="block font-bold mb-1">رفع وتحديد صور التصميم 3D (مرفوعات محلية Local Upload)</label>
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
                className="px-5 py-2 bg-[#1C352D] disabled:opacity-40 text-white font-black rounded-xl"
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
        const modalProfit = modalNetSelling - modalTotalCost;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-right space-y-5 text-xs max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-md">
                    <DollarSign className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">إصدار عرض سعر جديد V{projectQuotesList.length + 1}</h3>
                    <p className="text-[11px] text-slate-500 font-bold">تحديد الخامات والمصنعيات وحساب الربحية التقديرية لمشروع {project.projectName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddQuotationOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Selection Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-xs">إضافة صنف/خامة من دليل الخامات والمستلزمات:</span>
                  {selectedMat && (
                    <span className="text-[11px] font-mono font-bold bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200">
                      التكلفة المرجعية: {selectedMat.currentReferenceCost.toLocaleString('ar-EG')} ج.م / {selectedMat.unit || 'وحدة'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">اختر الخامة</label>
                    <select
                      value={selectedMatId}
                      onChange={e => handleSelectMaterial(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-xs shadow-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                    >
                      {materials.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.currentReferenceCost.toLocaleString('ar-EG')} ج.م)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      الكمية المطلوبة ({selectedMat?.unit || 'وحدة'})
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={itemQty}
                      onChange={e => setItemQty(Number(e.target.value))}
                      placeholder="الكمية"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-center font-bold text-xs shadow-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">سعر البيع للعميل (ج.م)</label>
                    <input
                      type="number"
                      min={0}
                      value={itemSellingPrice}
                      onChange={e => setItemSellingPrice(Number(e.target.value))}
                      placeholder="سعر البيع"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-center font-mono font-bold text-xs shadow-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-bold text-slate-500">
                    إجمالي الصنف للعميل: <strong className="text-emerald-700 font-mono font-black">{((Number(itemQty) || 1) * (Number(itemSellingPrice) || 0)).toLocaleString('ar-EG')} ج.م</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddQuoteItem}
                    className="px-4 py-2 bg-[#1C352D] hover:bg-[#142921] text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4 text-amber-300" />
                    <span>+ إضافة الخامة لعرض السعر</span>
                  </button>
                </div>
              </div>

              {/* Items List Table */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-900 text-xs">بنود عرض السعر ({quoteItems.length} صنف):</h4>
                {quoteItems.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400 font-bold text-xs">
                    لم يتم إضافة أية بنود لعرض السعر بعد. اختر الخامة واضغط على زر الإضافة.
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5 text-right">الخامة / الصنف</th>
                          <th className="p-2.5 text-center">الكمية</th>
                          <th className="p-2.5 text-center">ت المقارنة</th>
                          <th className="p-2.5 text-center">سعر البيع</th>
                          <th className="p-2.5 text-left">الإجمالي</th>
                          <th className="p-2.5 text-center">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {quoteItems.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-2.5 font-bold text-slate-900">{it.materialName}</td>
                            <td className="p-2.5 text-center font-mono font-bold bg-slate-50/50">{it.quantity} {it.unit}</td>
                            <td className="p-2.5 text-center font-mono text-slate-500">{it.unitCost.toLocaleString('ar-EG')} ج.م</td>
                            <td className="p-2.5 text-center font-mono text-emerald-800 font-bold">{it.unitSellingPrice.toLocaleString('ar-EG')} ج.م</td>
                            <td className="p-2.5 text-left font-mono font-black text-slate-900">{it.totalSellingPrice.toLocaleString('ar-EG')} ج.م</td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveQuoteItem(idx)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                title="حذف الصنف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Financial Calculation Summary */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="block text-[10px] text-slate-500 font-bold">إجمالي التكلفة المرجعية</span>
                  <span className="font-mono text-xs font-black text-slate-700">{modalTotalCost.toLocaleString('ar-EG')} ج.م</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="block text-[10px] text-slate-500 font-bold">إجمالي البيع (قبل الخصم)</span>
                  <span className="font-mono text-xs font-black text-emerald-800">{modalSubtotalSelling.toLocaleString('ar-EG')} ج.م</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="block text-[10px] text-slate-500 font-bold">خصم خاص (ج.م)</span>
                  <input
                    type="number"
                    min={0}
                    value={quotationDiscount}
                    onChange={e => setQuotationDiscount(Number(e.target.value))}
                    className="w-full text-center font-mono font-bold text-xs bg-slate-50 border border-slate-200 rounded-lg p-0.5 mt-0.5 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="bg-emerald-700 text-white p-2.5 rounded-xl shadow-xs">
                  <span className="block text-[10px] text-emerald-100 font-bold">صافي سعر البيع للعميل</span>
                  <span className="font-mono text-sm font-black">{modalNetSelling.toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات وشروط عرض السعر</label>
                <textarea
                  rows={2}
                  value={quotationNotes}
                  onChange={e => setQuotationNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  placeholder="اكتب الملاحظات وشروط الضمان والاستلام..."
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddQuotationOpen(false)}
                  className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  onClick={handleSaveQuotation}
                  disabled={quoteItems.length === 0}
                  className="px-6 py-2.5 bg-[#1C352D] hover:bg-[#142921] disabled:opacity-40 text-white font-black rounded-xl text-xs shadow-lg transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>إصدار وإرسال عرض السعر V{projectQuotesList.length + 1}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Rejection Reason Modal */}
      {rejectionModalDesignId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-rose-900">تسجيل طلب تعديل / رفض التصميم</h3>
            <div>
              <label className="block font-bold mb-1">سبب التعديل والرفض المطلوب من العميل *</label>

              <textarea
                rows={3}
                value={rejectionReasonText}
                onChange={e => setRejectionReasonText(e.target.value)}
                className="w-full p-2 bg-rose-50 border border-rose-300 rounded-xl text-rose-950 font-bold"
              ></textarea>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRejectionModalDesignId(null)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button type="button" onClick={() => {
                updateDesignStatus(rejectionModalDesignId, 'rejected', rejectionReasonText);
                setRejectionModalDesignId(null);
              }} className="px-5 py-2 bg-rose-700 text-white font-black rounded-xl">تأكيد الرفض وطلب التعديل</button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Lightbox Zoom Modal for 3D Renderings */}
      {activeLightbox && (
        <ImageZoomModal
          isOpen={!!activeLightbox}
          onClose={() => setActiveLightbox(null)}
          images={activeLightbox.images}
          initialIndex={activeLightbox.index}
          title={activeLightbox.title}
        />
      )}

    </div>
  );
};

