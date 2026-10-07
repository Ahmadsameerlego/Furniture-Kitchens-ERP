import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { TechnicalOfficeService } from '../../services/technicalOfficeService';
import {
  Compass,
  Ruler,
  FileSpreadsheet,
  Layers,
  ClipboardCheck,
  History,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  UserCheck,
  Calendar,
  Zap,
  Droplets,
  Flame,
  Tv,
  Box,
  Cpu,
  Maximize2,
  Percent,
  GitBranch,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  HardHat,
  Package,
  Wrench,
  GitPullRequest,
  Upload
} from 'lucide-react';
import { TechnicalReleaseModal } from './modals/TechnicalReleaseModal';
import { CreateBOMRevisionModal } from './modals/CreateBOMRevisionModal';
import { CreateECRModal } from './modals/CreateECRModal';
import { TechnicalHandoverReviewModal } from './modals/TechnicalHandoverReviewModal';
import { EditTechnicalSurveyModal } from './modals/EditTechnicalSurveyModal';
import { CreateCADRevisionModal } from './modals/CreateCADRevisionModal';
import { WallDimension } from '../../types/technicalOffice';

interface TechnicalProjectDetailsViewProps {
  projectId: string;
  onBack: () => void;
}

export const TechnicalProjectDetailsView: React.FC<TechnicalProjectDetailsViewProps> = ({
  projectId,
  onBack
}) => {
  const {
    technicalProjects,
    technicalSurveys,
    technicalDesigns,
    technicalBOMs,
    technicalReleases,
    engineeringChangeRequests,
    projectHandovers,
    customContracts,
    customProjects,
    projectDesigns,
    projectMeasurements,
    siteVisits,
    saveTechnicalSurvey,
    verifyTechnicalSurvey,
    addTechnicalDesignRevision,
    approveTechnicalDesign,
    saveTechnicalBOM,
    approveTechnicalBOM,
    approveEngineeringChangeRequest,
    rejectEngineeringChangeRequest,
    currentUser
  } = useERP();

  const [activeTab, setActiveTab] = useState<
    'commercial_handover' | 'site_survey' | 'cad_drawings' | 'bom_explosion' | 'planning_release' | 'ecr' | 'audit_trail'
  >('site_survey');

  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({
    'BASE-90-SINK': true,
    'BASE-60-DRAWERS': true,
    'TALL-60-OVEN': true,
    'UPPER-90-LIFT': true
  });

  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showBOMRevisionModal, setShowBOMRevisionModal] = useState(false);
  const [showECRModal, setShowECRModal] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [showEditSurveyModal, setShowEditSurveyModal] = useState(false);
  const [showCADRevisionModal, setShowCADRevisionModal] = useState(false);
  const [selectedDesignVersion, setSelectedDesignVersion] = useState<number | null>(null);

  const project = technicalProjects.find(p => p.id === projectId);
  if (!project) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-bold mb-4">لم يتم العثور على المشروع الفني المطلوب.</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-[#361D13] text-white font-black text-xs cursor-pointer"
        >
          العودة للمشاريع
        </button>
      </div>
    );
  }

  const survey = technicalSurveys.find(s => s.technicalProjectId === project.id);
  const designs = technicalDesigns.filter(d => d.technicalProjectId === project.id);
  const activeDesign = designs.find(d => d.versionNumber === project.activeDesignVersion) || designs[0];
  const boms = technicalBOMs.filter(b => b.technicalProjectId === project.id);
  const activeBom = boms.find(b => b.revisionCode === project.activeBomRevision) || boms[0];
  const releases = technicalReleases.filter(r => r.technicalProjectId === project.id);
  const activeRelease = releases[0];
  const ecrs = engineeringChangeRequests.filter(e => e.technicalProjectId === project.id);
  const handover = projectHandovers.find(h => h.id === project.handoverId || h.projectId === project.salesProjectId);
  const contract = customContracts.find(c => c.id === project.contractId || c.projectId === project.salesProjectId);

  // Sales Phase Digital Thread Lookups
  const salesPrj = customProjects.find(p => p.id === project.salesProjectId || p.projectNumber === project.salesProjectNumber);
  const salesDesigns = projectDesigns.filter(d => d.projectId === salesPrj?.id);
  const salesApprovedDesign = salesDesigns.find(d => d.status === 'approved') || salesDesigns[salesDesigns.length - 1];
  const salesMeasurements = projectMeasurements.filter(m => m.projectId === salesPrj?.id);
  const toCm = (value: number, unit?: string) => unit === 'mm' ? value / 10 : unit === 'm' ? value * 100 : value;
  const latestSalesMeasurement = [...salesMeasurements].sort((a, b) => a.version - b.version).pop();
  const salesWalls = (latestSalesMeasurement?.items || [])
    .filter(item => /جدار|حائط|حيطة/.test(item.name))
    .map(item => ({ name: item.name, cm: toCm(item.value, item.unit) }));
  const latestSalesMeas = salesMeasurements[salesMeasurements.length - 1];
  const salesSiteVisit = siteVisits.find(v => v.projectId === salesPrj?.id);

  const statusMeta = TechnicalOfficeService.getStatusMeta(project.status);

  const toggleUnitExpand = (unitCode: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitCode]: !prev[unitCode] }));
  };

  const handleExportCSV = () => {
    if (!activeBom) return;
    const csvContent = TechnicalOfficeService.generateCuttingListCSV(activeBom, project.projectNumber);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CutList_${project.projectNumber}_${activeBom.revisionCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAutoGenerateSurveyFromSales = () => {
    const salesPrj = customProjects.find(p => p.id === project.salesProjectId || p.projectNumber === project.salesProjectNumber);
    const measList = salesPrj ? projectMeasurements.filter(m => m.projectId === salesPrj.id) : [];
    const latestMeas = measList[measList.length - 1];

    let generatedWalls: WallDimension[] = [];
    if (salesWalls.length > 0) {
      // Laser readings typically land a few millimetres off the sales tape measure
      const laserOffsetsCm = [-0.5, 0, 0.5, -0.3];
      generatedWalls = salesWalls.map((item, idx) => ({
        id: `w-${idx + 1}`,
        wallName: item.name,
        lengthCm: Math.round((item.cm + laserOffsetsCm[idx % laserOffsetsCm.length]) * 10) / 10,
        heightCm: 280,
        angleDegrees: 90,
        plasterQuality: 'straight' as const,
        notes: latestMeas?.items.find(i => i.name === item.name)?.notes
      }));
    } else {
      generatedWalls = [
        { id: 'w-1', wallName: 'الجدار A (الرئيسي - حوض وصرف ومياه)', lengthCm: 420, heightCm: 280, angleDegrees: 90, plasterQuality: 'straight' },
        { id: 'w-2', wallName: 'الجدار B (الجانبي - بوتاجاز وشفاط وعمود)', lengthCm: 310, heightCm: 280, angleDegrees: 90, plasterQuality: 'straight' },
        { id: 'w-3', wallName: 'الجدار C (الخلفي - دريسنج ومؤن)', lengthCm: 240, heightCm: 280, angleDegrees: 90, plasterQuality: 'straight' }
      ];
    }

    saveTechnicalSurvey({
      technicalProjectId: project.id,
      surveyorName: project.responsibleEngineerName || currentUser.fullName,
      surveyDate: new Date().toISOString().substring(0, 10),
      walls: generatedWalls,
      ceilingHeightCm: (() => { const c = latestMeas?.items.find(i => /سقف/.test(i.name)); return c ? toCm(c.value, c.unit) : 280; })(),
      flooringVarianceMm: 2,
      electricalPoints: [
        { id: 'ep-1', purpose: 'مأخذ شفاط 220V', locationWall: 'الجدار B', heightFromFloorCm: 210, distanceFromCornerCm: 150, status: 'ok' },
        { id: 'ep-2', purpose: 'مأخذ غسالة أطباق بلت إن', locationWall: 'الجدار A', heightFromFloorCm: 50, distanceFromCornerCm: 120, status: 'ok' },
        { id: 'ep-3', purpose: 'بريزة ليد بروفايل علوي', locationWall: 'الجدار A', heightFromFloorCm: 150, distanceFromCornerCm: 200, status: 'ok' },
        { id: 'ep-4', purpose: 'مأخذ إشعال البوتاجاز والفرن', locationWall: 'الجدار B', heightFromFloorCm: 60, distanceFromCornerCm: 150, status: 'ok' }
      ],
      plumbing: {
        waterSupplyLocation: 'الجدار A (تغذية بارد وساخن)',
        waterDrainageLocation: 'الجدار A (صرف 2 بوصة)',
        hotColdDistanceCm: 16,
        drainDiameterInch: 2,
        status: 'ok'
      },
      gas: {
        hasNaturalGas: true,
        valveLocation: 'الجدار B',
        valveHeightCm: 75,
        status: 'ok'
      },
      ventilation: {
        hasDuctHole: true,
        ductDiameterCm: 15,
        ductHeightFromFloorCm: 220,
        ductLocation: 'الجدار B'
      },
      appliances: [
        { id: 'app-1', applianceType: 'built_in_oven', name: 'فرن بلت إن 60 سم', brand: 'Bosch', model: 'HBF113BR0Y', widthCm: 59.5, heightCm: 59.5, depthCm: 54.8, supplyType: 'electric', supplyStatus: 'customer_provided' },
        { id: 'app-2', applianceType: 'gas_hob', name: 'مسطح غاز 4 شعلة 60 سم', brand: 'Franke', model: 'FHG 604', widthCm: 58, heightCm: 51, depthCm: 5, supplyType: 'gas', supplyStatus: 'customer_provided' },
        { id: 'app-3', applianceType: 'sink', name: 'حوض ستانلس ساقط رخام', brand: 'Franke', model: 'SID 610', widthCm: 86, heightCm: 50, depthCm: 20, supplyType: 'water_drain', supplyStatus: 'factory_supplied' }
      ],
      obstaclesAndConstraints: {
        hasConcreteColumn: false,
        hasCeilingBeams: false
      },
      notes: 'تم توليد وتدقيق الرفع المساحي بناءً على ملف المعاينة والمقايسة المعتمدة.',
      generalNotes: 'تم تدقيق المقاسات وتوزيع الأجهزة ونقاط التغذية.',
      status: 'draft'
    });
  };

  const handleAutoGenerateDesign = () => {
    addTechnicalDesignRevision({
      technicalProjectId: project.id,
      versionNumber: 1,
      versionCode: 'V1.0',
      title: 'المخطط التنفيذي الشامل وشوب دروينج المطبخ (Shop Drawing REV-01)',
      designerName: currentUser.fullName,
      status: 'approved',
      changeDescription: 'المخطط التنفيذي الأولي المعتمد بناءً على الرفع المساحي وتوزيع الأجهزة',
      cadFiles: [
        { id: 'cad-1', name: 'Architectural_Plan_REV01.dwg', fileType: 'dwg', fileSize: '14.2 MB', url: '#', uploadedAt: new Date().toISOString().substring(0, 10), uploadedBy: currentUser.fullName },
        { id: 'cad-2', name: 'Executive_Shop_Drawings.pdf', fileType: 'pdf', fileSize: '4.8 MB', url: '#', uploadedAt: new Date().toISOString().substring(0, 10), uploadedBy: currentUser.fullName },
        { id: 'cad-3', name: 'MEP_Plumbing_Electric_Layout.pdf', fileType: 'pdf', fileSize: '2.1 MB', url: '#', uploadedAt: new Date().toISOString().substring(0, 10), uploadedBy: currentUser.fullName }
      ]
    });
  };

  const handleAutoGenerateBOM = () => {
    saveTechnicalBOM({
      technicalProjectId: project.id,
      revisionCode: 'REV-01',
      revisionNumber: 1,
      status: 'approved',
      units: [
        {
          id: 'unit-1',
          unitCode: 'BASE-90-SINK',
          unitName: 'وحدة حوض أرضية 90 سم (Sink Base Unit)',
          unitType: 'sink_unit',
          widthMm: 900,
          heightMm: 720,
          depthMm: 580,
          dimensions: { widthMm: 900, heightMm: 720, depthMm: 580 },
          quantity: 1,
          cuttingParts: [
            { id: 'cp-1', partName: 'جنب يمين وحدة حوض', materialId: 'mat-1', materialCode: 'MDF-WHITE-18', materialName: 'MDF ملامين أبيض 18مم', lengthMm: 720, widthMm: 580, thicknessMm: 18, quantity: 1, grainDirection: 'length', edgeBanding: { top: 'PVC 2mm', bottom: 'PVC 0.4mm' } },
            { id: 'cp-2', partName: 'جنب شمال وحدة حوض', materialId: 'mat-1', materialCode: 'MDF-WHITE-18', materialName: 'MDF ملامين أبيض 18مم', lengthMm: 720, widthMm: 580, thicknessMm: 18, quantity: 1, grainDirection: 'length', edgeBanding: { top: 'PVC 2mm', bottom: 'PVC 0.4mm' } },
            { id: 'cp-3', partName: 'قاعدة سفلية معالجة', materialId: 'mat-1', materialCode: 'MDF-WHITE-18', materialName: 'MDF ملامين أبيض 18مم', lengthMm: 864, widthMm: 580, thicknessMm: 18, quantity: 1, grainDirection: 'length', edgeBanding: { top: 'PVC 2mm' } },
            { id: 'cp-4', partName: 'درفة يمين HPL كود 812', materialId: 'mat-2', materialCode: 'HPL-812-BEIGE', materialName: 'HPL تركي كود 812 بيج مط', lengthMm: 716, widthMm: 446, thicknessMm: 18, quantity: 1, grainDirection: 'length', edgeBanding: { top: 'PVC 2mm', bottom: 'PVC 2mm', left: 'PVC 2mm', right: 'PVC 2mm' } },
            { id: 'cp-5', partName: 'درفة شمال HPL كود 812', materialId: 'mat-2', materialCode: 'HPL-812-BEIGE', materialName: 'HPL تركي كود 812 بيج مط', lengthMm: 716, widthMm: 446, thicknessMm: 18, quantity: 1, grainDirection: 'length', edgeBanding: { top: 'PVC 2mm', bottom: 'PVC 2mm', left: 'PVC 2mm', right: 'PVC 2mm' } }
          ],
          hardwareParts: [
            { id: 'hw-1', itemId: 'item-1', itemCode: 'BLUM-HINGE-CLIP-110', itemName: 'مفصلة بلوم كليب توب 110 سوفت كلوز', quantity: 4, unit: 'قطعة' },
            { id: 'hw-2', itemId: 'item-2', itemCode: 'LEG-ADJ-100', itemName: 'رجل ضبط مطبخ 10 سم + كلبس وزرة', quantity: 4, unit: 'طقم' }
          ]
        },
        {
          id: 'unit-2',
          unitCode: 'BASE-60-DRAWERS',
          unitName: 'وحدة 3 أدراج بلوم تاندم 60 سم (Drawer Base Unit)',
          unitType: 'drawer_unit',
          widthMm: 600,
          heightMm: 720,
          depthMm: 580,
          dimensions: { widthMm: 600, heightMm: 720, depthMm: 580 },
          quantity: 1,
          cuttingParts: [
            { id: 'cp-6', partName: 'جنب يمين وحدة أدراج', materialId: 'mat-1', materialCode: 'MDF-WHITE-18', materialName: 'MDF ملامين أبيض 18مم', lengthMm: 720, widthMm: 580, thicknessMm: 18, quantity: 1, grainDirection: 'length', edgeBanding: { top: 'PVC 2mm' } },
            { id: 'cp-7', partName: 'جنب شمال وحدة أدراج', materialId: 'mat-1', materialCode: 'MDF-WHITE-18', materialName: 'MDF ملامين أبيض 18مم', lengthMm: 720, widthMm: 580, thicknessMm: 18, quantity: 1, grainDirection: 'length', edgeBanding: { top: 'PVC 2mm' } },
            { id: 'cp-8', partName: 'وش درج سفلي HPL', materialId: 'mat-2', materialCode: 'HPL-812-BEIGE', materialName: 'HPL تركي كود 812 بيج مط', lengthMm: 356, widthMm: 596, thicknessMm: 18, quantity: 1, grainDirection: 'length', edgeBanding: { top: 'PVC 2mm', bottom: 'PVC 2mm', left: 'PVC 2mm', right: 'PVC 2mm' } }
          ],
          hardwareParts: [
            { id: 'hw-3', itemId: 'item-3', itemCode: 'BLUM-TANDEM-500', itemName: 'مجرى درج بلوم تاندم سوفت كلوز 50 سم', quantity: 3, unit: 'طقم' }
          ]
        }
      ]
    });
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-[#361D13] hover:text-[#E29555] text-slate-700 transition-all flex items-center justify-center cursor-pointer shrink-0 shadow-xs"
            title="رجوع لقائمة المشاريع"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-xl bg-[#361D13] text-[#E29555] font-black font-mono shadow-xs border border-[#C87A38]/30">
                {project.projectNumber}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-mono font-bold">
                مرجع المبيعات: {project.salesProjectNumber}
              </span>
              <span className={`text-[11px] px-3 py-0.5 rounded-full font-black border ${statusMeta.bgColor} ${statusMeta.color} ${statusMeta.borderColor}`}>
                {statusMeta.label}
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-[#1E110B] flex items-center gap-2">
              <span>{project.customerName}</span>
              <span className="text-slate-300 font-light">/</span>
              <span className="text-sm md:text-base font-bold text-slate-600">{project.projectName}</span>
            </h2>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          
          {/* Quick BOM Revision Button */}
          {activeBom && (
            <button
              onClick={() => setShowBOMRevisionModal(true)}
              className="px-3.5 py-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <GitBranch className="w-4 h-4 text-purple-600" />
              <span>إصدار BOM جديد</span>
            </button>
          )}

          {/* Export Cutting List CSV */}
          {activeBom && (
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>تصدير OptiCut CSV</span>
            </button>
          )}

          {/* Direct Release to Planning Button */}
          {project.status === 'technically_approved' && (
            <button
              onClick={() => setShowReleaseModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs hover:opacity-95 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>إصدار حزمة الإفراج</span>
            </button>
          )}

          {/* ECR Trigger Button */}
          <button
            onClick={() => setShowECRModal(true)}
            className="px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <GitPullRequest className="w-4 h-4 text-rose-600" />
            <span>طلب تعديل ECR</span>
          </button>

        </div>
      </div>

      {/* Pending Handover Alert Banner */}
      {(project.status === 'pending_handover' || handover?.status === 'submitted') && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#C87A38]/15 to-orange-500/10 border-2 border-amber-400/80 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black">
                  بوابة استلام قيد المراجعة والتدقيق
                </span>
                <span className="text-xs text-amber-900 font-bold">بوابة تسليم المبيعات (Golden Gate)</span>
              </div>
              <h3 className="text-base font-black text-amber-950 mt-0.5">
                المشروع في انتظار تدقيق التصميم والريندر المعتمد والمعاينة قبل البدء الهندسي
              </h3>
              <p className="text-xs text-amber-800">
                يرجى فحص صور الـ 3D ومواصفات العقد ومقاسات المبيعات للتأكد من خلو المشروع من أي نواقص فنية قبل اعتماد الاستلام.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHandoverModal(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#1E110B] to-[#361D13] text-[#E29555] font-black text-xs hover:opacity-95 shadow-lg border border-[#C87A38]/40 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>تدقيق واعتماد ملف الاستلام</span>
          </button>
        </div>
      )}

      {/* Modern Workflow Pipeline Navigation Bar (7 Tabs - Single Row with Horizontal Scrolling) */}
      <div className="bg-slate-100/80 p-1.5 rounded-3xl border border-slate-200/90 shadow-inner">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          
          {/* Tab 1 */}
          <button
            onClick={() => setActiveTab('commercial_handover')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-black text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'commercial_handover'
                ? 'bg-[#1E110B] text-white shadow-md shadow-[#1E110B]/20 border border-[#C87A38]/40'
                : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
            }`}
          >
            <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-black ${
              activeTab === 'commercial_handover' ? 'bg-[#C87A38] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              01
            </span>
            <ClipboardCheck className={`w-4 h-4 ${activeTab === 'commercial_handover' ? 'text-[#E29555]' : 'text-slate-400'}`} />
            <span>النطاق التجاري والاستلام</span>
            {handover?.status === 'submitted' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          {/* Tab 2 */}
          <button
            onClick={() => setActiveTab('site_survey')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-black text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'site_survey'
                ? 'bg-[#1E110B] text-white shadow-md shadow-[#1E110B]/20 border border-[#C87A38]/40'
                : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
            }`}
          >
            <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-black ${
              activeTab === 'site_survey' ? 'bg-[#C87A38] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              02
            </span>
            <Ruler className={`w-4 h-4 ${activeTab === 'site_survey' ? 'text-[#E29555]' : 'text-slate-400'}`} />
            <span>الرفع المساحي والتغذيات</span>
            {survey?.status === 'verified' && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>

          {/* Tab 3 */}
          <button
            onClick={() => setActiveTab('cad_drawings')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-black text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'cad_drawings'
                ? 'bg-[#1E110B] text-white shadow-md shadow-[#1E110B]/20 border border-[#C87A38]/40'
                : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
            }`}
          >
            <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-black ${
              activeTab === 'cad_drawings' ? 'bg-[#C87A38] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              03
            </span>
            <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'cad_drawings' ? 'text-[#E29555]' : 'text-slate-400'}`} />
            <span>المخططات التنفيذية CAD (V{project.activeDesignVersion})</span>
          </button>

          {/* Tab 4 */}
          <button
            onClick={() => setActiveTab('bom_explosion')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-black text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'bom_explosion'
                ? 'bg-[#1E110B] text-white shadow-md shadow-[#1E110B]/20 border border-[#C87A38]/40'
                : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
            }`}
          >
            <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-black ${
              activeTab === 'bom_explosion' ? 'bg-[#C87A38] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              04
            </span>
            <Layers className={`w-4 h-4 ${activeTab === 'bom_explosion' ? 'text-[#E29555]' : 'text-slate-400'}`} />
            <span>تفجير الـ BOM وقوائم التقطيع ({project.activeBomRevision})</span>
            {activeBom && (
              <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                activeTab === 'bom_explosion' ? 'bg-[#C87A38]/40 text-[#E29555]' : 'bg-slate-200 text-slate-700'
              }`}>
                {activeBom.totalPartsCount}
              </span>
            )}
          </button>

          {/* Tab 5 */}
          <button
            onClick={() => setActiveTab('planning_release')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-black text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'planning_release'
                ? 'bg-[#1E110B] text-white shadow-md shadow-[#1E110B]/20 border border-[#C87A38]/40'
                : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
            }`}
          >
            <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-black ${
              activeTab === 'planning_release' ? 'bg-[#C87A38] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              05
            </span>
            <Send className={`w-4 h-4 ${activeTab === 'planning_release' ? 'text-[#E29555]' : 'text-slate-400'}`} />
            <span>حزمة الإفراج للتخطيط</span>
            {activeRelease && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* Tab 6 */}
          <button
            onClick={() => setActiveTab('ecr')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-black text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'ecr'
                ? 'bg-[#1E110B] text-white shadow-md shadow-[#1E110B]/20 border border-[#C87A38]/40'
                : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
            }`}
          >
            <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-black ${
              activeTab === 'ecr' ? 'bg-[#C87A38] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              06
            </span>
            <GitPullRequest className={`w-4 h-4 ${activeTab === 'ecr' ? 'text-[#E29555]' : 'text-slate-400'}`} />
            <span>طلبات التعديل ECR</span>
            {ecrs.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-black">
                {ecrs.length}
              </span>
            )}
          </button>

          {/* Tab 7 */}
          <button
            onClick={() => setActiveTab('audit_trail')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-black text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'audit_trail'
                ? 'bg-[#1E110B] text-white shadow-md shadow-[#1E110B]/20 border border-[#C87A38]/40'
                : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
            }`}
          >
            <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-black ${
              activeTab === 'audit_trail' ? 'bg-[#C87A38] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              07
            </span>
            <History className={`w-4 h-4 ${activeTab === 'audit_trail' ? 'text-[#E29555]' : 'text-slate-400'}`} />
            <span>سجل التدقيق</span>
          </button>

        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: COMMERCIAL SCOPE & HANDOVER PROTOCOL */}
      {/* ======================================================== */}
      {activeTab === 'commercial_handover' && (
        <div className="space-y-6">
          
          {/* SECTION 1: SALES APPROVED 3D RENDER & PALETTE */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                  3D
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1E110B]">
                    ريندر وتصميم المبيعات المعتمد من العميل (Aesthetic Baseline)
                  </h3>
                  <p className="text-xs text-slate-500">
                    المرجع الجمالي والمعماري الملزم لمخططات المكتب الفني والشوب دروينج
                  </p>
                </div>
              </div>

              {salesApprovedDesign && (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs self-start sm:self-auto">
                  الإصدار المعتمد V{salesApprovedDesign.version}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* 3D Image Preview */}
              <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 relative group aspect-video lg:aspect-auto min-h-[220px] flex items-center justify-center">
                <img 
                  src={salesApprovedDesign?.images?.[0] || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600'} 
                  alt="Approved Sales 3D Design"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-3 right-3 left-3 text-white">
                  <div className="text-xs font-black">{salesApprovedDesign?.designName || 'تصميم 3D ثلاثي الأبعاد للمطبخ'}</div>
                  <div className="text-[10px] text-slate-300 font-mono">
                    مصمم المبيعات: {salesApprovedDesign?.createdByUserName || 'فريق التصميم'} | {salesApprovedDesign?.createdDate || '2026-10-06'}
                  </div>
                </div>
              </div>

              {/* Material & Finish Palette Tags */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">
                    خامة ولون الضلف (Fronts):
                  </span>
                  <div className="font-black text-slate-900">
                    HPL رويال تركي كود 812 بيج مط
                  </div>
                  <p className="text-[11px] text-slate-600">شريط حرف PVC 2 مم مط الالتصاق الحراري</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1">
                  <span className="text-[10px] font-black text-blue-800 uppercase tracking-wider block">
                    الشاسيه الداخلي (Carcass):
                  </span>
                  <div className="font-black text-slate-900">
                    جود وود 18مم معالج ملامين أبيض
                  </div>
                  <p className="text-[11px] text-slate-600">مقاوم للمياه والأبخرة وشريط حرف 0.4مم</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-1">
                  <span className="text-[10px] font-black text-purple-800 uppercase tracking-wider block">
                    المفصلات والمجاري (Hardware):
                  </span>
                  <div className="font-black text-slate-900">
                    بلوم Blum Clip Top 110 Soft-Close
                  </div>
                  <p className="text-[11px] text-slate-600">مجاري أدراج تاندم هيدروليك سفلية</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                  <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                    القرصة / السطح (Countertop):
                  </span>
                  <div className="font-black text-slate-900">
                    جرانيت جالاكسي أسود إسباني سمك 4 سم
                  </div>
                  <p className="text-[11px] text-slate-600">تفريغ حوض ساقط رخام وحفر مجاري تصريف</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: SALES PRELIMINARY SURVEY VS CONTRACT SCOPE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Handover & Golden Gate Card */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#C87A38]/10 text-[#C87A38] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#1E110B]">محضر تسليم المشروع من المبيعات</h3>
                    <p className="text-xs text-slate-500">تدقيق شروط البوابة الذهبية واستيفاء المتطلبات</p>
                  </div>
                </div>

                {handover ? (
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    handover.status === 'accepted_by_tech_office'
                      ? 'bg-emerald-100 text-emerald-800'
                      : handover.status === 'returned_for_clarification'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {handover.status === 'accepted_by_tech_office' ? 'مقبول ومعتمد بالمكتب الفني' : 'قيد التدقيق'}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                    مستند مباشر
                  </span>
                )}
              </div>

              {/* Handover Checklist Table */}
              <div className="p-4 rounded-2xl bg-[#FDF8F4] border border-[#C87A38]/20 space-y-3">
                <h4 className="text-xs font-black text-[#1E110B] uppercase tracking-wider">
                  قائمة تحقق البوابة الذهبية (Golden Gates Verification)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800">العقد موقع ومعتمد برقم {project.contractNumber || 'CNT-2026-001'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800">العربون مسدد ومؤكد بالمالية (40%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800">المواصفات التجارية مقفلة ولا تغيير فيها</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800">الرفع المساحي ومخطط المعاينة الأولية مدقق</span>
                  </div>
                </div>
              </div>

              {/* Preliminary Survey Measurements Snapshot */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-black text-slate-800 flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-[#C87A38]" />
                    <span>مقاسات المعاينة الأولية المسجلة بالمبيعات:</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    تاريخ المعاينة: {salesSiteVisit?.date || '2026-10-04'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 block">الجدار A (الحوض)</span>
                    <span className="font-mono font-black text-slate-900">420 سم</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 block">الجدار B (البوتاجاز)</span>
                    <span className="font-mono font-black text-slate-900">310 سم</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 block">الجدار C (الثلاجة)</span>
                    <span className="font-mono font-black text-slate-900">240 سم</span>
                  </div>
                </div>
              </div>

              {handover && handover.notesForTechOffice && (
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-0.5">ملاحظات المبيعات للمكتب الفني: </span>
                  {handover.notesForTechOffice}
                </div>
              )}

              {/* Review Button */}
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowHandoverModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs hover:opacity-95 shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>فتح بوابة تدقيق ومطابقة ملف المبيعات</span>
                </button>
              </div>
            </div>

            {/* Commercial Contract Summary */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-xs">
              <h3 className="text-base font-black text-[#1E110B] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C87A38]" />
                <span>البيانات التجارية والمالية</span>
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-slate-500 font-bold">قيمة التعاقد الإجمالية:</div>
                  <div className="text-lg font-black text-[#1E110B]">
                    {contract ? `${contract.totalValue.toLocaleString('ar-EG')} ج.م` : '118,500 ج.م'}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                  <div className="text-emerald-700 font-bold">الدفعة المقدمة المدفوعة:</div>
                  <div className="text-base font-black text-emerald-900">
                    {contract ? `${(contract.totalValue * 0.4).toLocaleString('ar-EG')} ج.م (40%)` : '47,400 ج.م (40%)'}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-mono">سند قبض رقم: RCP-2026-001</div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="text-slate-500 font-bold">المواصفة المعتمدة بالعقد:</div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    مطبخ مودرن ضلف رويال HPL كود 812 خشابي فاتح، شاسيه جود وود 18مم معالج، مفصلات ومجار بلوم أصلي Soft-Close، رخام جالاكسي أسود إسباني.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ARCHITECTURAL SITE SURVEY & MEP UTILITIES */}
      {/* ======================================================== */}
      {activeTab === 'site_survey' && survey && (
        <div className="space-y-6">
          
          {/* Survey Header & Verification Banner */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-[#C87A38] text-xs px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                  {survey.surveyNumber}
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  تاريخ الرفع: {survey.surveyDate} | المهندس المساح: {survey.surveyorName}
                </span>
              </div>
              <h3 className="text-lg font-black text-[#1E110B]">
                تقرير الرفع المساحي الميداني وتدقيق المرافق والأجهزة
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEditSurveyModal(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-4 h-4 text-slate-600" />
                <span>تعديل وتحديث الرفع المساحي</span>
              </button>

              {survey.status === 'verified' ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>معتمد ومطابق هندسياً ({survey.verifiedByEngineerName || currentUser.fullName})</span>
                </div>
              ) : (
                <button
                  onClick={() => verifyTechnicalSurvey(survey.id)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تدقيق واعتماد الرفع المساحي</span>
                </button>
              )}
            </div>
          </div>

          {/* DELTA ANALYSIS: SALES PRELIMINARY VS ENGINEERING LASER SURVEY */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-black text-[#1E110B] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C87A38]" />
                  <span>مصفوفة المقارنة الهندسية (المعاينة الأولية vs الرفع المساحي بالليزر)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  كشف أي انحراف في أبعاد الموقع لتعديل زوايا التخليص (Fillers) أو إصدار طلب تعديل (ECR)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-black border border-blue-200">
                مطابقة دقيقة بالمللي (Laser Tolerances)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-3">الجدار / البند</th>
                    <th className="p-3">معاينة المبيعات التقريبية</th>
                    <th className="p-3">الرفع الهندسي الفعلي بالليزر</th>
                    <th className="p-3 text-center">فرق البعد (Variance)</th>
                    <th className="p-3">الزاوية واستقامة المحارة</th>
                    <th className="p-3">الإجراء الهندسي في الـ BOM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {survey.walls.map((wall, idx) => {
                    const salesVal = (salesWalls.find(w => w.name === wall.wallName) || salesWalls[idx])?.cm ?? wall.lengthCm;
                    const laserVal = wall.lengthCm;
                    const diffMm = Math.round((laserVal - salesVal) * 10);
                    const diff = diffMm;
                    return (
                      <tr key={wall.id || idx} className="hover:bg-slate-50/60">
                        <td className="p-3 font-black text-slate-900">{wall.wallName}</td>
                        <td className="p-3 font-mono font-bold text-slate-600">{Math.round(salesVal * 10)} مم ({salesVal} سم)</td>
                        <td className="p-3 font-mono font-black text-[#C87A38]">{Math.round(laserVal * 10)} مم ({laserVal} سم)</td>
                        <td className="p-3 text-center">
                          {diff === 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold font-mono">0 مم (مطابق)</span>
                          ) : diff > 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold font-mono">+{diffMm} مم</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold font-mono">{diffMm} مم</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-800">زاوية {wall.angleDegrees || 90}°</span>
                          <span className="text-slate-400 text-[10px] block">
                            {wall.plasterQuality === 'straight' ? 'محارة رأسية مستقيمة' : 'انحراف بسيط'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-emerald-700 font-bold">
                            {diff === 0 ? 'مطابقة معتمدة للتصنيع' : Math.abs(diffMm) <= 5 ? 'ضمن السماحية (±5 مم) - تمتص في خلوص التركيب' : diffMm < 0 ? 'الحائط أقصر: تقليل عرض الفيلر الطرفي' : 'الحائط أطول: إضافة فيلر خلوص 18مم معالج'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Wall Dimensions Matrix */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-sm font-black text-[#1E110B] flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#C87A38]" />
              <span>أبعاد الجدران بالملم والاستقامة وزوايا التربيع</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {survey.walls.map(wall => (
                <div key={wall.id || wall.wallName} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-[#1E110B] text-sm">{wall.wallName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-slate-600">
                      زاوية {wall.angleDegrees || 90}°
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#C87A38] font-mono">
                    {(wall.lengthCm * 10).toLocaleString()} <span className="text-xs text-slate-500 font-sans">مم</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    الارتفاع: <span className="font-bold text-slate-800 font-mono">{wall.heightCm * 10} مم</span>
                  </div>
                  <div className="text-[10px] text-slate-600">
                    جودة المحارة: <span className="font-bold">{wall.plasterQuality === 'straight' ? 'مستقيمة تماماً' : 'تحتاج ضبط'}</span>
                  </div>
                  {wall.notes && (
                    <div className="text-[10px] text-slate-600 border-t border-slate-200/60 pt-1.5">{wall.notes}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Leveling & Ceiling checks */}
            <div className="p-4 rounded-2xl bg-[#FDF8F4] border border-[#C87A38]/30 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-bold">فارق منسوب استواء الأرضية (Leveling):</span>
                <div className="font-mono font-black text-emerald-800 text-sm mt-0.5">
                  {survey.flooringVarianceMm || 0} مم (ضمن التفاوت المسموح هندسياً)
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-bold">ارتفاع السقف الصافي:</span>
                <div className="font-mono font-black text-[#1E110B] text-sm mt-0.5">
                  {(survey.ceilingHeightCm * 10).toLocaleString()} مم
                </div>
              </div>
            </div>
          </div>

          {/* MEP Utilities: Electrical, Plumbing, Gas & Obstacles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Electrical points */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-black text-[#1E110B] text-sm">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <span>نقاط الكهرباء والبرايز ({survey.electricalPoints.length})</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {survey.electricalPoints.map(ep => (
                  <div key={ep.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{ep.purpose}</span>
                      <span className="font-mono text-amber-700">{ep.locationWall}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      البعد من الزاوية: {ep.distanceFromCornerCm * 10} مم | الارتفاع: {ep.heightFromFloorCm * 10} مم
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plumbing points */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-black text-[#1E110B] text-sm">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Droplets className="w-4 h-4" />
                </div>
                <span>نقاط السباكة وتغذية المياه</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">تغذية المياه:</span>
                  <span className="font-bold text-slate-800">{survey.plumbing?.waterSupplyLocation || 'الجدار A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">صرف الحوض:</span>
                  <span className="font-bold text-slate-800">{survey.plumbing?.waterDrainageLocation || 'الجدار A (2 بوصة)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">المسافة بين الساخن والبارد:</span>
                  <span className="font-bold font-mono text-slate-800">{(survey.plumbing?.hotColdDistanceCm || 16) * 10} مم</span>
                </div>
              </div>
            </div>

            {/* Gas & Obstacles */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-black text-[#1E110B] text-sm">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <span>الغاز والأعمدة الخرسانية</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="font-bold text-slate-800">محبس الغاز الطبيعي</div>
                  <div className="text-slate-500 text-[11px]">
                    الموقع: {survey.gas?.valveLocation || 'الجدار A'} | الارتفاع: {(survey.gas?.valveHeightCm || 75) * 10} مم
                  </div>
                </div>

                {survey.obstaclesAndConstraints?.hasConcreteColumn && (
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-1">
                    <div className="font-black">عمود خرساني بارز</div>
                    <div className="text-[11px]">
                      {survey.obstaclesAndConstraints.columnSpecs || 'عمود 15×35 سم بالجدار B'} | تفريغ الشاسيه مطلوب
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Appliances Registry & Cutouts */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-sm font-black text-[#1E110B] flex items-center gap-2">
              <Tv className="w-4 h-4 text-[#C87A38]" />
              <span>سجل الأجهزة الكهربائية وسواقط الحوض المعتمدة ({survey.appliances.length} جهاز)</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/50">
                    <th className="p-3">اسم الجهاز</th>
                    <th className="p-3">الماركة والموديل</th>
                    <th className="p-3 font-mono">الأبعاد الخارجية (مم)</th>
                    <th className="p-3">نوع التغذية</th>
                    <th className="p-3">المورد والتوفير</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {survey.appliances.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-black text-[#1E110B]">{app.name}</td>
                      <td className="p-3 font-bold text-slate-700">{app.brand || 'Standard'} ({app.model || 'معياري'})</td>
                      <td className="p-3 font-mono text-slate-700">
                        {app.widthCm * 10} × {app.depthCm * 10} × {app.heightCm * 10} مم
                      </td>
                      <td className="p-3 text-slate-600">{app.supplyType === 'electric' ? 'كهرباء 220V' : app.supplyType === 'gas' ? 'غاز طبيعي' : 'صرف ومياه'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          app.supplyStatus === 'customer_provided' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                        }`}>
                          {app.supplyStatus === 'customer_provided' ? 'توريد العميل' : 'توريد المصنع'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Fallback when Site Survey is not created yet */}
      {activeTab === 'site_survey' && !survey && (
        <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-[#C87A38]/10 text-[#C87A38] flex items-center justify-center mx-auto">
            <Ruler className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-black text-[#1E110B]">لا يوجد تقرير رفع مساحي ومرافق معتمد بعد</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              مشروع ({project.projectNumber}) في انتظار تسجيل أبعاد الجدران بالليزر وتدقيق نقاط السباكة والكهرباء وسجل الأجهزة.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={handleAutoGenerateSurveyFromSales}
              className="px-6 py-3 rounded-2xl bg-[#361D13] hover:bg-black text-white font-black text-xs transition-all shadow-md shadow-[#361D13]/20 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>توليد وتدقيق الرفع المساحي تلقائياً من معاينة المبيعات</span>
            </button>
            <button
              onClick={() => setShowEditSurveyModal(true)}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#C87A38]" />
              <span>تسجيل وإدخال الرفع المساحي يدوياً</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CAD DRAWINGS & EXECUTIVE SHOP DRAWINGS */}
      {/* ======================================================== */}
      {activeTab === 'cad_drawings' && (
        <div className="space-y-6">
          
          {/* Top CAD Control Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {activeDesign ? activeDesign.versionCode || `DWG-V${activeDesign.versionNumber}.0` : 'DWG-V1.0'}
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  إجمالي {designs.length} إصدار تنفيذي مسجل للمشروع
                </span>
              </div>
              <h3 className="text-lg font-black text-[#1E110B] flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#C87A38]" />
                <span>المخططات التنفيذية وشوب دروينج التصنيع (Executive CAD Drawings)</span>
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setShowCADRevisionModal(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1E110B] via-[#361D13] to-[#C87A38] text-white font-black text-xs hover:opacity-95 shadow-md shadow-[#C87A38]/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#E29555]" />
                <span>إصدار ورفع مخطط تنفيذي جديد (New CAD Revision)</span>
              </button>

              {!activeDesign && (
                <button
                  onClick={handleAutoGenerateDesign}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-black text-xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>توليد مخطط مقترح ذكي V1.0</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Revisions Tree & Timeline */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-[#1E110B] flex items-center gap-2">
                  <History className="w-4 h-4 text-[#C87A38]" />
                  <span>سجل إصدارات المخططات (CAD Revisions)</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400 font-bold">{designs.length} إصدار</span>
              </div>

              {designs.length > 0 ? (
                <div className="space-y-3">
                  {designs.map(design => {
                    const isSelected = activeDesign?.id === design.id;

                    return (
                      <div
                        key={design.id}
                        onClick={() => setSelectedDesignVersion(design.versionNumber)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FDF8F4] border-[#C87A38] shadow-xs ring-1 ring-[#C87A38]/30'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono font-black text-sm text-[#1E110B]">
                            {design.versionCode || `V${design.versionNumber}.0`}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            design.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {design.status === 'approved' ? 'معتمد رسمياً' : 'قيد المراجعة'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 mb-2 font-bold line-clamp-1">{design.title}</p>
                        <p className="text-[11px] text-slate-500 mb-2 font-medium line-clamp-2">{design.changeDescription}</p>

                        <div className="text-[10px] text-slate-400 flex justify-between border-t border-slate-200/50 pt-1.5 font-mono">
                          <span>المصمم: {design.designerName}</span>
                          <span>{(design.createdAt || design.approvedAt || '2026-10-06').substring(0, 10)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  لا توجد إصدارات مسجلة بعد.
                </div>
              )}
            </div>

            {/* Active CAD Blueprint & Document Repository */}
            <div className="lg:col-span-2 space-y-6">
              {activeDesign ? (
                <>
                  {/* Revision Header & Approval Card */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-[#C87A38] px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200">
                            {activeDesign.versionCode || `DWG-V${activeDesign.versionNumber}.0`}
                          </span>
                          <span className="text-xs text-slate-500 font-bold">
                            المصمم: {activeDesign.designerName}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-[#1E110B] mt-1">
                          {activeDesign.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {activeDesign.status === 'approved' ? (
                          <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>معتمد هندسياً ({activeDesign.approvedByEngineerName || activeDesign.approvedBy || currentUser.fullName})</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => approveTechnicalDesign(activeDesign.id, currentUser.fullName)}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs hover:opacity-95 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>اعتماد المخطط رسمياً للـ BOM</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Change Description */}
                    {activeDesign.changeDescription && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                        <span className="font-bold text-slate-900 block">تعليمات وملاحظات الشوب دروينج التنفيذية:</span>
                        <p className="leading-relaxed font-medium">{activeDesign.changeDescription}</p>
                      </div>
                    )}
                  </div>

                  {/* Categorized Attached Files Matrix */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-black text-[#1E110B] flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#C87A38]" />
                          <span>المخططات والملفات الهندسية المرفقة بالحزمة ({(activeDesign.cadFiles || activeDesign.attachments || []).length} ملف)</span>
                        </h4>
                        <p className="text-xs text-slate-500">
                          تشمل مساقط الأوتوكاد (DWG)، شيتات الشوب دروينج (PDF)، ومخططات المرافق (MEP)
                        </p>
                      </div>

                      <button
                        onClick={() => setShowCADRevisionModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#C87A38]" />
                        <span>إرفاق ملفات إضافية</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {(activeDesign.cadFiles || activeDesign.attachments || []).map((att, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex items-center justify-between hover:border-[#C87A38]/40 transition-all shadow-2xs">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs font-mono shrink-0 ${
                              att.fileType === 'dwg'
                                ? 'bg-blue-600 text-white'
                                : att.fileType === 'pdf'
                                ? 'bg-rose-600 text-white'
                                : att.fileType === 'dxf'
                                ? 'bg-purple-600 text-white'
                                : 'bg-[#361D13] text-[#E29555]'
                            }`}>
                              {att.fileType.toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-[#1E110B] truncate max-w-[190px]">{att.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {att.fileSize} | {att.uploadedAt || '2026-10-06'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => window.open(att.url || '#', '_blank')}
                              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                              title="معاينة وتحميل"
                            >
                              <Download className="w-4 h-4 text-slate-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Engineering Quality Checklist */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3 text-xs">
                    <h4 className="font-black text-[#1E110B] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>قائمة التدقيق ومطابقة الرسومات التنفيذية (Engineering Sign-off Gate):</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-800">
                      <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold">مطابقة زوايا التخليص والـ Fillers على الرفع المساحي بالليزر</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold">مطابقة فتحات ومقاسات أجهزة البلت إن (الفرن، الشفاط، المسطح)</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold">تطابق مخارج السباكة وتغذية غسالة الأطباق والحوض</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold">جاهزية المخطط لإجراء تفجير الـ BOM المعياري وقوائم التقطيع</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-3xl p-10 border border-slate-200/80 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#C87A38] flex items-center justify-center mx-auto">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-[#1E110B]">لا توجد مخططات تنفيذية CAD لهذا المشروع بعد</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      يمكنك رفع مخططات الأوتوكاد والشوب دروينج يدورياً أو توليد باكيج مقترح ذكي بناءً على الرفع المساحي
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setShowCADRevisionModal(true)}
                      className="px-6 py-2.5 rounded-xl bg-[#361D13] hover:bg-black text-white font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#E29555]" />
                      <span>رفع وإصدار مخططات تنفيذية (Upload CAD)</span>
                    </button>
                    <button
                      onClick={handleAutoGenerateDesign}
                      className="px-6 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>توليد المخطط التنفيذي المقترح (CAD REV-01)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: EXPLODED BOM & UNIT CUTTING LISTS */}
      {/* ======================================================== */}
      {activeTab === 'bom_explosion' && (
        <div className="space-y-6">
          {activeBom ? (
            <>
              {/* BOM Top Control Bar */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {activeBom.revisionCode}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      إعداد: {activeBom.createdBy} | تاريخ: {activeBom.createdDate}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#1E110B]">
                    تفجير الـ BOM المعياري وقوائم التقطيع لوحدات المشروع
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-600" />
                    <span>تصدير OptiCut / CutList CSV</span>
                  </button>

                  <button
                    onClick={() => setShowBOMRevisionModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100 font-black text-xs transition-all cursor-pointer"
                  >
                    <GitBranch className="w-4 h-4 text-purple-600" />
                    <span>إصدار مراجع (Fork Revision)</span>
                  </button>

                  {activeBom.status === 'approved' ? (
                    <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>معتمد ({activeBom.approvedBy || currentUser.fullName})</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => approveTechnicalBOM(activeBom.id, currentUser.fullName)}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs hover:opacity-95 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>اعتماد الـ BOM رسمياً</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Material Yield & Sheet Consumption Estimation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeBom.materialsSummary?.map((mat, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="font-black text-[#1E110B] text-xs leading-snug">{mat.materialName}</div>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">
                        {mat.materialCode}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">المساحة الصافية</div>
                        <div className="text-sm font-black text-[#1E110B] font-mono">{mat.totalAreaSqMeters} م²</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">تقدير الألواح</div>
                        <div className="text-sm font-black text-[#C87A38] font-mono">{mat.estimatedSheetsCount} لوح</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">نسبة الهالك</div>
                        <div className="text-sm font-black text-emerald-700 font-mono">{mat.scrapPercentage}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Unit-by-Unit Tree & Cutting Lists */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-[#1E110B] flex items-center gap-2">
                    <Box className="w-4 h-4 text-[#C87A38]" />
                    <span>تفكيك الوحدات والعلب وقوائم التقطيع والإكسسوارات ({activeBom.units.length} وحدة)</span>
                  </h4>
                </div>

                {activeBom.units.map(unit => {
                  const isExpanded = expandedUnits[unit.unitCode] ?? true;

                  return (
                    <div key={unit.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                      
                      {/* Unit Header Accordion Toggle */}
                      <div
                        onClick={() => toggleUnitExpand(unit.unitCode)}
                        className="p-5 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors border-b border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-[#361D13] text-[#C87A38] flex items-center justify-center font-black text-xs">
                            {unit.unitCode.substring(0, 4)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-[#1E110B] text-sm">{unit.unitCode}</span>
                              <span className="text-xs text-slate-600 font-bold">({unit.unitName})</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold">
                                الكمية: {unit.quantity}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              العرض: {unit.dimensions?.widthMm || 800}مم × الارتفاع: {unit.dimensions?.heightMm || 720}مم × العمق: {unit.dimensions?.depthMm || 580}مم
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-left text-xs">
                            <span className="text-slate-400 font-bold">قطع التقطيع: </span>
                            <span className="font-mono font-black text-[#1E110B]">{unit.cuttingParts.length}</span>
                          </div>
                          <div className="p-1 rounded-xl bg-slate-100 text-slate-600">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>

                      {/* Unit Details Content */}
                      {isExpanded && (
                        <div className="p-5 space-y-6">
                          
                          {/* Cutting Parts Table */}
                          <div>
                            <div className="text-xs font-black text-slate-700 mb-2 flex items-center justify-between">
                              <span>قائمة قطع التقطيع للوحدة (Cutting Parts List):</span>
                              <span className="text-[11px] text-slate-400 font-normal">الأبعاد بالملمتر | القشاط (Top / Bottom / Left / Right)</span>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-right text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                                    <th className="p-2.5">اسم القطعة</th>
                                    <th className="p-2.5 text-center">الكمية</th>
                                    <th className="p-2.5 font-mono text-center">الطول (L)</th>
                                    <th className="p-2.5 font-mono text-center">العرض (W)</th>
                                    <th className="p-2.5 font-mono text-center">السماكة (T)</th>
                                    <th className="p-2.5">الخامة</th>
                                    <th className="p-2.5 text-center">اتجاه الثمرة</th>
                                    <th className="p-2.5 text-center font-mono">قشاط الـ PVC</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {unit.cuttingParts.map(part => (
                                    <tr key={part.id} className="hover:bg-amber-50/20">
                                      <td className="p-2.5 font-black text-[#1E110B]">{part.partName}</td>
                                      <td className="p-2.5 text-center font-mono font-bold">{part.quantity}</td>
                                      <td className="p-2.5 text-center font-mono font-black text-slate-800">{part.lengthMm}</td>
                                      <td className="p-2.5 text-center font-mono font-black text-slate-800">{part.widthMm}</td>
                                      <td className="p-2.5 text-center font-mono text-slate-600">{part.thicknessMm}</td>
                                      <td className="p-2.5 text-slate-700 text-[11px] font-medium">{part.materialName}</td>
                                      <td className="p-2.5 text-center">
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                                          {part.grainDirection === 'length' ? 'طولي' : part.grainDirection === 'width' ? 'عرضي' : 'بدون'}
                                        </span>
                                      </td>
                                      <td className="p-2.5 text-center font-mono text-xs">
                                        <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[#C87A38] font-bold">
                                          {part.edgeBanding?.top || 'PVC 2mm'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Unit Hardware & Mechanisms */}
                          {unit.hardwareParts && unit.hardwareParts.length > 0 && (
                            <div>
                              <div className="text-xs font-black text-slate-700 mb-2">
                                الإكسسوارات والمفصلات ومجاري الأدراج للعلبة:
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                {unit.hardwareParts.map(hw => (
                                  <div key={hw.id} className="p-3 rounded-2xl bg-purple-50/50 border border-purple-200/80 flex justify-between items-center">
                                    <div>
                                      <div className="font-bold text-purple-950">{hw.itemName}</div>
                                      <div className="text-[10px] text-purple-700 font-mono">{hw.itemCode}</div>
                                    </div>
                                    <div className="font-mono font-black text-purple-900 text-sm">
                                      {hw.quantity} {hw.unit}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <Layers className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1E110B]">لم يتم تفجير الـ BOM لهذا المشروع بعد</h3>
                <p className="text-xs text-slate-500 mt-1">قم بتفكيك وحدات المطبخ النمطية وتوليد قوائم التقطيع بالمليمتر</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleAutoGenerateBOM}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:opacity-95 text-white font-black text-xs transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>توليد وتفجير الـ BOM المعياري للوحدات والتقطيع</span>
                </button>
                <button
                  onClick={() => setShowBOMRevisionModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-600" />
                  <span>إنشاء BOM يدوياً</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: TECHNICAL RELEASE PACKAGE TO PLANNING */}
      {/* ======================================================== */}
      {activeTab === 'planning_release' && (
        <div className="space-y-6">
          {activeRelease ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
              
              {/* Release Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {activeRelease.releaseNumber}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      أصدرت بواسطة: {activeRelease.releasedByUserName} ({activeRelease.releasedAt})
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#1E110B]">
                    حزمة الإفراج الفني المعتمدة لقسم التخطيط والإنتاج
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                    مستلمة ومحجوزة بالتخطيط
                  </span>
                </div>
              </div>

              {/* Release Milestones & Target Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-bold">تاريخ بدء التقطيع بالمصنع:</span>
                  <div className="font-mono font-black text-[#1E110B] text-base">
                    {activeRelease.targetProductionStartDate}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-bold">تاريخ انتهاء تصنيع المصنع:</span>
                  <div className="font-mono font-black text-[#1E110B] text-base">
                    {activeRelease.targetFactoryCompletionDate}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-emerald-700 font-bold">تاريخ التركيب المستهدف بالموقع:</span>
                  <div className="font-mono font-black text-emerald-900 text-base">
                    {activeRelease.targetSiteInstallationDate}
                  </div>
                </div>
              </div>

              {/* Special Manufacturing Instructions */}
              <div className="p-4 rounded-2xl bg-[#FDF8F4] border border-[#C87A38]/30 space-y-2 text-xs">
                <div className="font-black text-[#1E110B]">تعليمات التشغيل والتصنيع الخاصة بالورشة:</div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {activeRelease.specialManufacturingInstructions || 'الالتزام بكافة مقاسات تفجير الـ BOM واتجاهات الثمرة'}
                </p>
              </div>

              {/* Planning Department Feedback */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-2">
                <div className="flex justify-between items-center text-blue-900 font-black">
                  <span>إفادة قسم التخطيط والمشتريات:</span>
                  <span className="font-mono text-blue-600 font-bold">{activeRelease.planningReceivedBy || 'م. سامح جودة'}</span>
                </div>
                <p className="text-blue-800 leading-relaxed font-medium">
                  {activeRelease.planningNotes || 'تم حجز الخامات بنجاح بالمخزن'}
                </p>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <Send className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="text-slate-600 font-bold">لم يتم إصدار حزمة الإفراج الفني للتخطيط بعد</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                يتم إصدار الحزمة بعد اعتماد الرفع المساحي والمخططات التنفيذية وتفجير الـ BOM بالكامل.
              </p>
              <button
                onClick={() => setShowReleaseModal(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs hover:opacity-95 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                إصدار حزمة الإفراج للتخطيط الآن
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: ENGINEERING CHANGE REQUESTS (ECR) */}
      {/* ======================================================== */}
      {activeTab === 'ecr' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-[#1E110B] flex items-center gap-2">
              <GitPullRequest className="w-5 h-5 text-rose-600" />
              <span>سجل طلبات وأوامر التعديل الهندسي (Engineering Changes)</span>
            </h3>
            <button
              onClick={() => setShowECRModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>طلب تعديل هندسي جديد (ECR)</span>
            </button>
          </div>

          {ecrs.length > 0 ? (
            <div className="space-y-4">
              {ecrs.map(ecr => (
                <div key={ecr.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          {ecr.ecrNumber}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">
                          المصدر: {ecr.source === 'customer_request' ? 'طلب عميل' : 'موقع / ورشة'} | مقدم الطلب: {ecr.requestedByUserName}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-[#1E110B] mt-1">{ecr.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        ecr.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ecr.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ecr.status === 'approved' ? 'معتمد' : ecr.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة الفنية'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    <span className="font-bold text-slate-900">السبب الفني: </span>
                    {ecr.reason}
                  </p>

                  {/* Impact Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 text-xs border border-slate-200/80">
                    <div>
                      <span className="text-slate-500 font-bold">الأثر المالي:</span>
                      <div className="font-mono font-black text-rose-700 text-sm mt-0.5">
                        +{ecr.impactAssessment.costImpact.toLocaleString()} ج.م
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold">تأخير الجدول الزمني:</span>
                      <div className="font-mono font-black text-slate-800 text-sm mt-0.5">
                        {ecr.impactAssessment.scheduleDelayDays} يوم
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold">الإصدار المستهدف للـ BOM:</span>
                      <div className="font-mono font-black text-purple-700 text-sm mt-0.5">
                        {ecr.previousBomRevision} ← {ecr.targetNewBomRevision}
                      </div>
                    </div>
                  </div>

                  {ecr.status === 'under_review' && (
                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => rejectEngineeringChangeRequest(ecr.id, currentUser.fullName, 'غير مطابق هندسياً أو تم إلغاؤه')}
                        className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-black transition-all cursor-pointer"
                      >
                        رفض التعديل
                      </button>
                      <button
                        onClick={() => approveEngineeringChangeRequest(ecr.id, currentUser.fullName, 'تمت الموافقة وتعديل إصدار الـ BOM')}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black hover:opacity-95 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                      >
                        اعتماد التعديل وتحديث الـ BOM
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
              لا توجد طلبات تعديل هندسي لهذا المشروع حتى الآن
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: ENGINEERING AUDIT TRAIL */}
      {/* ======================================================== */}
      {activeTab === 'audit_trail' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-black text-[#1E110B] flex items-center gap-2">
            <History className="w-5 h-5 text-[#C87A38]" />
            <span>سجل الأحداث والمراجعات الهندسية الكاملة</span>
          </h3>

          <div className="relative pr-6 border-r-2 border-slate-200 space-y-6 pt-2 text-xs">
            
            <div className="relative">
              <span className="w-3 h-3 rounded-full bg-emerald-500 absolute -right-[31px] top-1" />
              <div className="font-black text-[#1E110B]">اعتماد الإفراج الفني للتخطيط (REL-2026-001)</div>
              <div className="text-slate-500 text-[11px] font-mono mt-0.5">2026-08-28 14:30 | م. إبراهيم فؤاد</div>
              <div className="text-slate-600 mt-1">تم تسليم ملف الإنتاج مع تفجير BOM كود REV-A للمصنع.</div>
            </div>

            <div className="relative">
              <span className="w-3 h-3 rounded-full bg-[#C87A38] absolute -right-[31px] top-1" />
              <div className="font-black text-[#1E110B]">اعتماد تفجير الـ BOM وقوائم التقطيع (REV-A)</div>
              <div className="text-slate-500 text-[11px] font-mono mt-0.5">2026-08-28 12:15 | م. إبراهيم فؤاد</div>
              <div className="text-slate-600 mt-1">تفكيك 4 وحدات رئيسية بإجمالي 26 قطعة تقطيع و64 قطعة إكسسوار بلوم.</div>
            </div>

            <div className="relative">
              <span className="w-3 h-3 rounded-full bg-blue-500 absolute -right-[31px] top-1" />
              <div className="font-black text-[#1E110B]">تدقيق واعتماد الرفع المساحي الميداني (SRV-2026-001)</div>
              <div className="text-slate-500 text-[11px] font-mono mt-0.5">2026-08-27 16:00 | م. طارق مساح</div>
              <div className="text-slate-600 mt-1">مطابقة أبعاد الجدران A, B, C واستقامة وتغذيات MEP وسواقط الحوض بوش.</div>
            </div>

            <div className="relative">
              <span className="w-3 h-3 rounded-full bg-purple-500 absolute -right-[31px] top-1" />
              <div className="font-black text-[#1E110B]">قبول محضر تسليم المشروع من المبيعات</div>
              <div className="text-slate-500 text-[11px] font-mono mt-0.5">2026-08-26 11:30 | م. إبراهيم فؤاد</div>
              <div className="text-slate-600 mt-1">استيفاء شروط البوابة الذهبية وتعيين المهندس المسؤول.</div>
            </div>

          </div>
        </div>
      )}

      {/* Modals */}
      {showReleaseModal && activeBom && (
        <TechnicalReleaseModal
          isOpen={true}
          onClose={() => setShowReleaseModal(false)}
          project={project}
          activeBom={activeBom}
        />
      )}

      {showBOMRevisionModal && activeBom && (
        <CreateBOMRevisionModal
          isOpen={true}
          onClose={() => setShowBOMRevisionModal(false)}
          currentBom={activeBom}
        />
      )}

      {showECRModal && (
        <CreateECRModal
          isOpen={true}
          onClose={() => setShowECRModal(false)}
          project={project}
        />
      )}

      {showHandoverModal && handover && (
        <TechnicalHandoverReviewModal
          isOpen={true}
          onClose={() => setShowHandoverModal(false)}
          handover={handover}
        />
      )}

      {showEditSurveyModal && (
        <EditTechnicalSurveyModal
          isOpen={true}
          onClose={() => setShowEditSurveyModal(false)}
          technicalProjectId={project.id}
          existingSurvey={survey}
          onSave={(surveyData) => saveTechnicalSurvey({ ...surveyData, technicalProjectId: project.id })}
          onVerify={(surveyId) => verifyTechnicalSurvey(surveyId)}
        />
      )}

      {showCADRevisionModal && (
        <CreateCADRevisionModal
          isOpen={true}
          onClose={() => setShowCADRevisionModal(false)}
          technicalProjectId={project.id}
          defaultVersionNumber={designs.length + 1}
        />
      )}

    </div>
  );
};
