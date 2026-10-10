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
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Send, 
  ChevronRight, 
  Download, 
  Search, 
  Filter, 
  Plus,
  ShieldAlert,
  Sparkles,
  Factory,
  Package,
  Wrench,
  GitPullRequest
} from 'lucide-react';
import { TechnicalReleaseModal } from './modals/TechnicalReleaseModal';
import { TechnicalHandoverReviewModal } from './modals/TechnicalHandoverReviewModal';
import { CreateECRModal } from './modals/CreateECRModal';
import { TechnicalProject } from '../../types/technicalOffice';

export const TechnicalOfficeDashboardView: React.FC = () => {
  const { 
    technicalProjects, 
    technicalSurveys, 
    technicalBOMs, 
    technicalReleases, 
    engineeringChangeRequests,
    projectHandovers,
    setSelectedTechnicalProjectId,
    setActiveModule 
  } = useERP();

  const [selectedProjectForRelease, setSelectedProjectForRelease] = useState<TechnicalProject | null>(null);
  const [selectedHandoverForReview, setSelectedHandoverForReview] = useState<any | null>(null);
  const [selectedProjectForECR, setSelectedProjectForECR] = useState<TechnicalProject | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Compute KPIs
  const stats = TechnicalOfficeService.getTechnicalOfficeStats(
    technicalProjects,
    technicalSurveys,
    technicalBOMs,
    technicalReleases,
    engineeringChangeRequests
  );

  const pendingHandovers = projectHandovers.filter(h => h.status === 'submitted');

  const filteredProjects = technicalProjects.filter(p => {
    const matchesSearch = 
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenProject = (projectId: string) => {
    setSelectedTechnicalProjectId(projectId);
    setActiveModule('tech_projects');
  };

  const handleExportOptiCut = (projectId: string) => {
    const projectBoms = technicalBOMs.filter(b => b.technicalProjectId === projectId);
    const bom = projectBoms[0];
    if (!bom) return;

    const prj = technicalProjects.find(p => p.id === projectId);
    const csvContent = TechnicalOfficeService.generateCuttingListCSV(bom, prj?.projectNumber || 'TECH');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `OptiCut_CuttingList_${prj?.projectNumber || 'BOM'}_${bom.revisionCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E110B] via-[#361D13] to-[#25140D] p-8 text-white shadow-xl border border-[#C87A38]/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C87A38]/20 border border-[#C87A38]/40 text-[#E29555] text-xs font-black">
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span>محرك المكتب الفني والهندسة الصناعية (Technical Office Engine)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              لوحة القيادة الهندسية وتفجير الـ BOM
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              إدارة الرفع المساحي الدقيق، تدقيق فتحات الأجهزة والمرافق، تفجير هياكل الوحدات وقوائم التقطيع للـ CNC، والإفراج الفني للتخطيط مع ضبط التعديلات الهندسية (ECR).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveModule('tech_projects')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#C87A38] to-[#E29555] text-white font-black text-xs hover:opacity-95 shadow-lg shadow-[#C87A38]/30 transition-all cursor-pointer"
            >
              <Ruler className="w-4 h-4" />
              <span>مشاريع التفصيل والرفع المساحي</span>
            </button>
            <button
              onClick={() => setActiveModule('tech_boms')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#E29555]" />
              <span>مستعرض الـ BOM وقوائم التقطيع</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C87A38]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-[#C87A38]/50 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">المشاريع النشطة</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#C87A38] flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1E110B]">{stats.activeProjects}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">مشاريع قيد العمل الهندسي</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-[#C87A38]/50 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">محاضر تسليم واردة</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-900">{stats.pendingHandovers}</div>
          <div className="text-[11px] text-purple-700 mt-1 font-medium font-bold">
            {pendingHandovers.length > 0 ? 'تتطلب تدقيق وقبول' : 'لا يوجد متأخرات'}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-[#C87A38]/50 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">الرفع المساحي</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Ruler className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-900">{stats.surveysPendingVerification}</div>
          <div className="text-[11px] text-blue-700 mt-1 font-medium">معاينات قيد التدقيق بالموقع</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-[#C87A38]/50 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">BOM قيد التفجير</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-orange-900">{stats.bomsPendingApproval}</div>
          <div className="text-[11px] text-orange-700 mt-1 font-medium">قوائم تقطيع وإكسسوارات</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-[#C87A38]/50 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">أفرج عنه للتخطيط</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-900">{stats.releasedToPlanning}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">حزم إفراج فني معتمدة</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-[#C87A38]/50 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">أوامر تعديل (ECR)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <GitPullRequest className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-900">{stats.openChangeRequests}</div>
          <div className="text-[11px] text-rose-700 mt-1 font-medium font-bold">تعديلات هندسية نشطة</div>
        </div>

      </div>

      {/* Engineering Urgent Attention & Quality Alerts */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent rounded-3xl p-6 border border-amber-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>تنبيهات الجودة الهندسية والمطابقة الفنية الفورية (Engineering Quality Gates)</span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black">
            3 تنبيهات تتطلب المتابعة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          
          <div className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-[#1E110B]">مشروع مطبخ رويل HPL (TECH-2026-001)</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-black text-[10px]">تعديل ECR وارد</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              طلب تعديل أبعاد فتحة الميكروويف بوش المدمج إلى 25 لتر. الـ BOM معتمد REV-A وجاري تجهيز REV-B.
            </p>
            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <span className="text-amber-800 font-bold font-mono">ECR-2026-001</span>
              <button 
                onClick={() => handleOpenProject('tech-prj-101')}
                className="text-[#C87A38] font-black hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>مراجعة الـ ECR</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-blue-200/80 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-[#1E110B]">غرفة نوم ماستر شامبين (TECH-2026-002)</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-black text-[10px]">رفع مساحي قيد الاعتماد</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              تم تسجيل استقامة الجدار وقياس وتر الغرفة (4,810 مم). في انتظار تدقيق المهندس الفني المسؤول.
            </p>
            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <span className="text-blue-800 font-bold font-mono">SRV-2026-002</span>
              <button 
                onClick={() => handleOpenProject('tech-prj-102')}
                className="text-[#C87A38] font-black hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>تدقيق المعاينة</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-[#1E110B]">وحدة تلفزيون وديكور (TECH-2026-003)</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-black text-[10px]">محضر تسليم جديد</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              تم تحويل العقد ومحضر التسليم من المبيعات في انتظار تدقيق النطاق التجاري وتعيين المهندس.
            </p>
            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <span className="text-purple-800 font-bold font-mono">HND-2026-003</span>
              <button 
                onClick={() => {
                  const hnd = pendingHandovers[0] || { id: 'hnd-103', projectNumber: 'TECH-2026-003', customerName: '' };
                  setSelectedHandoverForReview(hnd);
                }}
                className="text-[#C87A38] font-black hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>قبول المحضر</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Workbench Matrix */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        
        {/* Table Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-[#1E110B] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#C87A38]" />
              <span>مصفوفة المشاريع الهندسية ومتابعة الـ BOM والإفراج</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              عرض تفصيلي لكافة المشاريع قيد التنفيذ بالمكتب الفني مع مؤشرات الـ BOM وحزم الإفراج
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث برقم المشروع أو العميل..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pr-9 pl-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-[#C87A38] w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-hidden focus:border-[#C87A38]"
            >
              <option value="all">كافة الحالات الهندسية</option>
              <option value="pending_handover">في انتظار قبول التسليم</option>
              <option value="site_survey_in_progress">الرفع المساحي بالموقع</option>
              <option value="cad_design_in_progress">المخططات التنفيذية CAD</option>
              <option value="bom_explosion_in_progress">تفجير الـ BOM وقوائم التقطيع</option>
              <option value="technically_approved">معتمد هندسياً</option>
              <option value="released_to_planning">أفرج عنه للتخطيط والإنتاج</option>
              <option value="ecr_in_progress">أمر تعديل نشط (ECR)</option>
            </select>

          </div>
        </div>

        {/* Projects Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/50">
                <th className="p-3.5 rounded-tr-2xl">كود المشروع</th>
                <th className="p-3.5">العميل والمشروع</th>
                <th className="p-3.5">المهندس المسؤول</th>
                <th className="p-3.5 text-center">إصدار CAD</th>
                <th className="p-3.5 text-center">كود الـ BOM</th>
                <th className="p-3.5">حالة المشروع</th>
                <th className="p-3.5">المستهدف الفني</th>
                <th className="p-3.5 text-center rounded-tl-2xl">إجراءات هندسية سريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map(project => {
                const statusMeta = TechnicalOfficeService.getProjectStatusMeta(project.status);
                const projectBoms = technicalBOMs.filter(b => b.technicalProjectId === project.id);
                const activeBom = projectBoms[0];

                return (
                  <tr key={project.id} className="hover:bg-amber-50/30 transition-colors group">
                    
                    {/* Project Code */}
                    <td className="p-3.5">
                      <div className="font-mono font-black text-[#1E110B]">{project.projectNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{project.salesProjectNumber}</div>
                    </td>

                    {/* Customer & Project */}
                    <td className="p-3.5">
                      <div className="font-black text-[#1E110B] text-sm">{project.customerName}</div>
                      <div className="text-slate-600 flex items-center gap-1 mt-0.5">
                        <span className="font-medium">{project.projectName}</span>
                        {project.contractNumber && (
                          <span className="px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-600 font-mono text-[10px]">
                            {project.contractNumber}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Responsible Engineer */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">{project.responsibleEngineerName || 'غير معين'}</div>
                      <div className="text-[10px] text-slate-500">{project.designerEngineerName ? `المصمم: ${project.designerEngineerName}` : 'مكتب التصميم'}</div>
                    </td>

                    {/* CAD Version */}
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-mono font-black text-xs border border-blue-200">
                        V{project.activeDesignVersion}.0
                      </span>
                    </td>

                    {/* BOM Revision */}
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-mono font-black text-xs border border-purple-200">
                        {project.activeBomRevision}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[11px] border ${statusMeta.bgColor} ${statusMeta.color} ${statusMeta.borderColor}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{statusMeta.label}</span>
                      </span>
                    </td>

                    {/* Target Release Date */}
                    <td className="p-3.5">
                      <div className="font-mono text-slate-700 font-bold">{project.targetReleaseDate || '---'}</div>
                      <div className="text-[10px] text-slate-400">آخر تحديث: {project.lastUpdatedDate.substring(0, 10)}</div>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Open workbench */}
                        <button
                          onClick={() => handleOpenProject(project.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#361D13] text-white hover:bg-[#1E110B] font-black text-xs transition-all flex items-center gap-1 cursor-pointer"
                          title="فتح بيئة العمل الهندسية"
                        >
                          <span>بيئة العمل</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#C87A38]" />
                        </button>

                        {/* Export OptiCut CSV */}
                        {activeBom && (
                          <button
                            onClick={() => handleExportOptiCut(project.id)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                            title="تصدير قائمة التقطيع لـ OptiCut / CutList Plus CSV"
                          >
                            <Download className="w-4 h-4 text-slate-600" />
                          </button>
                        )}

                        {/* Direct Release Modal Trigger if approved */}
                        {project.status === 'technically_approved' && (
                          <button
                            onClick={() => setSelectedProjectForRelease(project)}
                            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                            title="إصدار حزمة الإفراج للتخطيط"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>إفراج للتخطيط</span>
                          </button>
                        )}

                        {/* Direct ECR trigger if already released */}
                        {project.status === 'released_to_planning' && (
                          <button
                            onClick={() => setSelectedProjectForECR(project)}
                            className="px-2 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-black text-xs transition-all flex items-center gap-1 cursor-pointer"
                            title="طلب أمر تعديل هندسي ECR"
                          >
                            <GitPullRequest className="w-3.5 h-3.5" />
                            <span>ECR</span>
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modals */}
      {selectedProjectForRelease && (
        <TechnicalReleaseModal
          isOpen={true}
          onClose={() => setSelectedProjectForRelease(null)}
          project={selectedProjectForRelease}
          activeBom={technicalBOMs.find(b => b.technicalProjectId === selectedProjectForRelease.id)}
        />
      )}

      {selectedHandoverForReview && (
        <TechnicalHandoverReviewModal
          isOpen={true}
          onClose={() => setSelectedHandoverForReview(null)}
          handover={selectedHandoverForReview}
        />
      )}

      {selectedProjectForECR && (
        <CreateECRModal
          isOpen={true}
          onClose={() => setSelectedProjectForECR(null)}
          project={selectedProjectForECR}
        />
      )}

    </div>
  );
};
