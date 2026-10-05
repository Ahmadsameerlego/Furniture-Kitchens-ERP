import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  FileSpreadsheet, 
  Search, 
  Download, 
  CheckCircle2, 
  ArrowUpRight, 
  Calendar, 
  Layers, 
  Filter,
  Sparkles
} from 'lucide-react';

export const TechnicalDesignsView: React.FC = () => {
  const { 
    technicalDesigns, 
    technicalProjects, 
    setSelectedTechnicalProjectId, 
    setActiveModule,
    approveTechnicalDesign,
    currentUser
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'under_review' | 'draft'>('all');

  const filteredDesigns = technicalDesigns.filter(d => {
    const matchesSearch = 
      (d.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.changeDescription || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.designerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenProject = (projectId: string) => {
    setSelectedTechnicalProjectId(projectId);
    setActiveModule('tech_projects');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-black">
              المخططات الهندسية CAD
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-500 font-bold">
              إجمالي {technicalDesigns.length} إصدار تنفيذي مسجل
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#1E110B] mt-1 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#C87A38]" />
            <span>المخططات التنفيذية وتعديلات الـ 3D (CAD Revisions)</span>
          </h1>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث في المخططات أو المصمم..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:border-[#C87A38]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden focus:border-[#C87A38]"
          >
            <option value="all">كافة حالات الاعتماد</option>
            <option value="approved">معتمد رسمياً</option>
            <option value="under_review">قيد المراجعة والتدقيق</option>
            <option value="draft">مسودة</option>
          </select>
        </div>
      </div>

      {/* Designs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDesigns.map(design => {
          const project = technicalProjects.find(p => p.id === design.technicalProjectId);

          return (
            <div
              key={design.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-[#C87A38]/60 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    V{design.versionNumber}.0
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                    design.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {design.status === 'approved' ? 'معتمد هندسياً' : 'قيد المراجعة'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-[#1E110B]">{design.title}</h3>
                  <div className="text-xs text-[#C87A38] font-bold mt-0.5">
                    {project ? `${project.customerName} (${project.projectNumber})` : 'مشروع تفصيل'}
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {design.changeDescription}
                </p>

                {/* Attachments pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(design.cadFiles || design.attachments || []).map((att, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                      {att.fileType.toUpperCase()}: {att.name}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
                  <span>المصمم: {design.designerName}</span>
                  <span className="font-mono">{(design.createdAt || design.approvedAt || '2026-08-28').substring(0, 10)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {project && (
                  <button
                    onClick={() => handleOpenProject(project.id)}
                    className="flex-1 py-2 rounded-xl bg-[#361D13] hover:bg-[#1E110B] text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>بيئة العمل</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#C87A38]" />
                  </button>
                )}

                {design.status !== 'approved' && (
                  <button
                    onClick={() => approveTechnicalDesign(design.id, currentUser.fullName)}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all flex items-center gap-1 cursor-pointer"
                    title="اعتماد المخطط"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>اعتماد</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
