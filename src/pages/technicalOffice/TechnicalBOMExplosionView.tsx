import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { TechnicalOfficeService } from '../../services/technicalOfficeService';
import { 
  Layers, 
  Search, 
  Download, 
  CheckCircle2, 
  ArrowUpRight, 
  Box, 
  GitBranch,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CreateBOMRevisionModal } from './modals/CreateBOMRevisionModal';

export const TechnicalBOMExplosionView: React.FC = () => {
  const { 
    technicalBOMs, 
    technicalProjects, 
    setSelectedTechnicalProjectId, 
    setActiveModule,
    approveTechnicalBOM,
    currentUser
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBomForRevision, setSelectedBomForRevision] = useState<any | null>(null);

  const filteredBoms = technicalBOMs.filter(b => {
    const project = technicalProjects.find(p => p.id === b.technicalProjectId);
    const matchesSearch = 
      (b.bomNumber || b.revisionCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.revisionCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project && project.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project && project.projectName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const handleOpenProject = (projectId: string) => {
    setSelectedTechnicalProjectId(projectId);
    setActiveModule('tech_projects');
  };

  const handleExportCSV = (bom: any, projectNumber: string) => {
    const csvContent = TechnicalOfficeService.generateCuttingListCSV(bom, projectNumber);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CutList_${projectNumber}_${bom.revisionCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-black">
              محرك الـ BOM
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-500 font-bold">
              إجمالي {technicalBOMs.length} حزم تفجير قوائم تقطيع
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#1E110B] mt-1 flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#C87A38]" />
            <span>تفجير الـ BOM وقوائم التقطيع المعيارية (BOM & Cutting Lists)</span>
          </h1>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث برقم الـ BOM أو اسم العميل..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:border-[#C87A38]"
          />
        </div>
      </div>

      {/* BOM Cards List */}
      <div className="space-y-6">
        {filteredBoms.map(bom => {
          const project = technicalProjects.find(p => p.id === bom.technicalProjectId);

          return (
            <div key={bom.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              
              {/* Card Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {bom.bomNumber} - {bom.revisionCode}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                      bom.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {bom.status === 'approved' ? 'معتمد رسمياً' : 'مسودة قيد المراجعة'}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[#1E110B] mt-1">
                    {project ? `${project.customerName} - ${project.projectName}` : 'مشروع تفصيل'}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    onClick={() => handleExportCSV(bom, project?.projectNumber || 'TECH')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-600" />
                    <span>تصدير OptiCut CSV</span>
                  </button>

                  <button
                    onClick={() => setSelectedBomForRevision(bom)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100 font-black transition-all cursor-pointer"
                  >
                    <GitBranch className="w-4 h-4 text-purple-600" />
                    <span>إصدار مراجع</span>
                  </button>

                  {project && (
                    <button
                      onClick={() => handleOpenProject(project.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#361D13] hover:bg-[#1E110B] text-white font-black transition-all cursor-pointer"
                    >
                      <span>بيئة العمل الهندسية</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#C87A38]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Material Yield Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-bold">عدد العلب والوحدات:</span>
                  <div className="font-mono font-black text-slate-800 text-base mt-0.5">{bom.units.length} وحدة</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-bold">إجمالي قطع التقطيع:</span>
                  <div className="font-mono font-black text-[#1E110B] text-base mt-0.5">{bom.totalPartsCount} قطعة</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-bold">إجمالي الإكسسوارات:</span>
                  <div className="font-mono font-black text-purple-800 text-base mt-0.5">{bom.totalHardwareCount} قطعة</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 font-bold">التكلفة التقديرية للخامات:</span>
                  <div className="font-mono font-black text-emerald-900 text-base mt-0.5">
                    {(bom.totalEstimatedCost || bom.totalEstimatedMaterialCost || 0).toLocaleString('ar-EG')} ج.م
                  </div>
                </div>
              </div>

              {/* Units Pills */}
              <div className="space-y-1.5">
                <div className="text-xs font-black text-slate-700">الوحدات المفككة بالـ BOM:</div>
                <div className="flex flex-wrap gap-2">
                  {bom.units.map(unit => (
                    <span key={unit.id} className="px-3 py-1.5 rounded-xl bg-purple-50/70 border border-purple-200/60 text-purple-900 text-xs font-bold font-mono">
                      {unit.unitCode} ({unit.unitName}) - {unit.cuttingParts.length} قطع
                    </span>
                  ))}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {selectedBomForRevision && (
        <CreateBOMRevisionModal
          isOpen={true}
          onClose={() => setSelectedBomForRevision(null)}
          currentBom={selectedBomForRevision}
        />
      )}

    </div>
  );
};
