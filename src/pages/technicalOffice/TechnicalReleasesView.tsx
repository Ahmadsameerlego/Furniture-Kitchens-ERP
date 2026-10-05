import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  ClipboardCheck, 
  Search, 
  Factory, 
  Calendar, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck,
  Send
} from 'lucide-react';

export const TechnicalReleasesView: React.FC = () => {
  const { 
    technicalReleases, 
    technicalProjects, 
    setSelectedTechnicalProjectId, 
    setActiveModule 
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredReleases = technicalReleases.filter(r => {
    return (
      r.releaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.projectNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenProject = (projectId: string) => {
    setSelectedTechnicalProjectId(projectId);
    setActiveModule('tech_projects');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-black">
              الإفراج الهندسي
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-500 font-bold">
              إجمالي {technicalReleases.length} حزمة إفراج فني
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#1E110B] mt-1 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-[#C87A38]" />
            <span>حزم الإفراج الفني للتخطيط والإنتاج (Release Packages to Planning)</span>
          </h1>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث برقم الحزمة أو اسم العميل..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:border-[#C87A38]"
          />
        </div>
      </div>

      {/* Releases Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredReleases.map(rel => {
          return (
            <div key={rel.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {rel.releaseNumber}
                    </span>
                    <span className="font-mono text-xs text-slate-400">{rel.projectNumber}</span>
                  </div>
                  <h3 className="text-base font-black text-[#1E110B] mt-1">{rel.customerName}</h3>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                  {rel.planningStatus === 'materials_allocated' ? 'الخامات محجوزة بالتخطيط' : 'مستلمة بالتخطيط'}
                </span>
              </div>

              {/* Key Milestones */}
              <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">بدء الإنتاج</div>
                  <div className="font-mono font-black text-[#1E110B] text-xs mt-0.5">{rel.targetProductionStartDate}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">انتهاء المصنع</div>
                  <div className="font-mono font-black text-[#1E110B] text-xs mt-0.5">{rel.targetFactoryCompletionDate}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">التركيب بالموقع</div>
                  <div className="font-mono font-black text-emerald-800 text-xs mt-0.5">{rel.targetSiteInstallationDate}</div>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-xs space-y-1">
                <div className="text-slate-500 font-bold">تعليمات التصنيع المعتمدة:</div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {rel.specialManufacturingInstructions}
                </p>
              </div>

              {/* Planning feedback */}
              <div className="p-3 rounded-xl bg-blue-50/70 text-blue-900 border border-blue-200 text-xs">
                <span className="font-bold">إفادة التخطيط: </span>
                <span>{rel.planningNotes}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleOpenProject(rel.technicalProjectId)}
                  className="px-4 py-2 rounded-xl bg-[#361D13] hover:bg-[#1E110B] text-white font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>بيئة العمل الهندسية</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#C87A38]" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
