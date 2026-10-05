import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { TechnicalOfficeService } from '../../services/technicalOfficeService';
import { 
  Ruler, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Compass, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Download,
  Layers,
  Plus
} from 'lucide-react';
import { TechnicalProjectDetailsView } from './TechnicalProjectDetailsView';
import { TechnicalHandoverReviewModal } from './modals/TechnicalHandoverReviewModal';

export const TechnicalProjectsListView: React.FC = () => {
  const { 
    technicalProjects, 
    selectedTechnicalProjectId, 
    setSelectedTechnicalProjectId,
    technicalBOMs,
    projectHandovers
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedHandover, setSelectedHandover] = useState<any | null>(null);

  // If a project is selected, render the detail workbench view
  if (selectedTechnicalProjectId) {
    return (
      <TechnicalProjectDetailsView
        projectId={selectedTechnicalProjectId}
        onBack={() => setSelectedTechnicalProjectId(null)}
      />
    );
  }

  const filteredProjects = technicalProjects.filter(p => {
    const matchesSearch = 
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingHandovers = projectHandovers.filter(h => h.status === 'submitted');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#C87A38]/10 text-[#C87A38] font-black">
              المكتب الفني
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-500 font-bold">
              إجمالي {technicalProjects.length} مشروع مسجل
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#1E110B] mt-1 flex items-center gap-2">
            <Ruler className="w-6 h-6 text-[#C87A38]" />
            <span>مشاريع التفصيل الهندسي والرفع المساحي</span>
          </h1>
        </div>

        {/* Quick Pending Handovers Alert */}
        {pendingHandovers.length > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">
              {pendingHandovers.length}
            </div>
            <div>
              <div className="font-black text-purple-900">محاضر تسليم جديدة واردة</div>
              <div className="text-purple-700 text-[11px]">في انتظار قبول وتعيين المهندس</div>
            </div>
            <button
              onClick={() => setSelectedHandover(pendingHandovers[0])}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-all cursor-pointer"
            >
              تدقيق الآن
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث باسم العميل أو كود المشروع أو التفاصيل..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:border-[#C87A38]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden focus:border-[#C87A38]"
          >
            <option value="all">كافة المراحل الهندسية</option>
            <option value="pending_handover">في انتظار قبول التسليم</option>
            <option value="site_survey_in_progress">الرفع المساحي بالموقع</option>
            <option value="cad_design_in_progress">المخططات التنفيذية CAD</option>
            <option value="bom_explosion_in_progress">تفجير الـ BOM وقوائم التقطيع</option>
            <option value="technically_approved">معتمد هندسياً</option>
            <option value="released_to_planning">أفرج عنه للتخطيط</option>
            <option value="ecr_in_progress">أمر تعديل نشط ECR</option>
          </select>
        </div>

      </div>

      {/* Projects Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map(project => {
          const statusMeta = TechnicalOfficeService.getProjectStatusMeta(project.status);
          const projectBoms = technicalBOMs.filter(b => b.technicalProjectId === project.id);
          const activeBom = projectBoms[0];

          return (
            <div
              key={project.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-[#C87A38]/60 transition-all space-y-4 flex flex-col justify-between"
            >
              
              <div className="space-y-3">
                {/* Top Badge row */}
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-full bg-[#C87A38]/10 text-[#C87A38]">
                    {project.projectNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${statusMeta.bgColor} ${statusMeta.color} ${statusMeta.borderColor}`}>
                    {statusMeta.label}
                  </span>
                </div>

                {/* Customer and Project Title */}
                <div>
                  <h3 className="text-base font-black text-[#1E110B] hover:text-[#C87A38] transition-colors">
                    {project.customerName}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">{project.projectName}</p>
                </div>

                {/* Scope & Contract */}
                <div className="p-3 rounded-2xl bg-slate-50 text-xs border border-slate-100 space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>العقد المرتبط:</span>
                    <span className="font-mono font-bold text-slate-800">{project.contractNumber || '---'}</span>
                  </div>
                  <div className="text-[11px] text-emerald-800 font-bold truncate">
                    {project.commercialScopeSummary}
                  </div>
                </div>

                {/* Engineering Info */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold">إصدار CAD:</span>
                    <div className="font-mono font-black text-blue-700">V{project.activeDesignVersion}.0</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold">إصدار الـ BOM:</span>
                    <div className="font-mono font-black text-purple-700">{project.activeBomRevision}</div>
                  </div>
                </div>

                {project.responsibleEngineerName && (
                  <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
                    <span>المهندس المسؤول:</span>
                    <span className="font-bold text-slate-800">{project.responsibleEngineerName}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedTechnicalProjectId(project.id)}
                  className="w-full py-2.5 rounded-2xl bg-[#361D13] hover:bg-[#1E110B] text-white font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>فتح بيئة العمل الهندسية</span>
                  <ArrowUpRight className="w-4 h-4 text-[#C87A38]" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {selectedHandover && (
        <TechnicalHandoverReviewModal
          isOpen={true}
          onClose={() => setSelectedHandover(null)}
          handover={selectedHandover}
        />
      )}

    </div>
  );
};
