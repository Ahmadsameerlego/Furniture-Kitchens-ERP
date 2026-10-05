import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  GitPullRequest, 
  Search, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  AlertTriangle,
  Filter
} from 'lucide-react';
import { CreateECRModal } from './modals/CreateECRModal';

export const TechnicalECRView: React.FC = () => {
  const { 
    engineeringChangeRequests, 
    technicalProjects, 
    setSelectedTechnicalProjectId, 
    setActiveModule,
    approveEngineeringChangeRequest,
    rejectEngineeringChangeRequest,
    currentUser
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectForECR, setSelectedProjectForECR] = useState<any | null>(null);

  const filteredEcrs = engineeringChangeRequests.filter(e => {
    return (
      e.ecrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.projectNumber.toLowerCase().includes(searchTerm.toLowerCase())
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
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-black">
              أوامر التعديل الهندسي
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-500 font-bold">
              إجمالي {engineeringChangeRequests.length} أمر تعديل مسجل
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#1E110B] mt-1 flex items-center gap-2">
            <GitPullRequest className="w-6 h-6 text-[#C87A38]" />
            <span>أوامر التعديل الهندسي (Engineering Change Requests - ECR)</span>
          </h1>
        </div>

        <button
          onClick={() => {
            const prj = technicalProjects[0];
            if (prj) setSelectedProjectForECR(prj);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-xs hover:opacity-95 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>طلب تعديل هندسي جديد (ECR)</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث برقم التعديل أو اسم العميل أو العنوان..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:border-[#C87A38]"
          />
        </div>
      </div>

      {/* ECR List */}
      <div className="space-y-4">
        {filteredEcrs.map(ecr => {
          return (
            <div key={ecr.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      {ecr.ecrNumber}
                    </span>
                    <span className="font-mono text-xs text-slate-400">{ecr.projectNumber}</span>
                    <span className="text-xs text-slate-500 font-bold">
                      مقدم الطلب: {ecr.requestedByUserName} ({ecr.requestedDate})
                    </span>
                  </div>
                  <h4 className="text-base font-black text-[#1E110B] mt-1">
                    {ecr.customerName} - {ecr.title}
                  </h4>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-black ${
                  ecr.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : ecr.status === 'rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {ecr.status === 'approved' ? 'معتمد ومحدث بالـ BOM' : ecr.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة والاعتماد'}
                </span>
              </div>

              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                <span className="font-bold text-slate-900">الأسباب والتفاصيل الهندسية: </span>
                {ecr.reason}
              </p>

              {/* Impact Card */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#FDF8F4] border border-[#C87A38]/20 text-xs">
                <div>
                  <span className="text-slate-500 font-bold">الأثر المالي المباشر:</span>
                  <div className="font-mono font-black text-rose-700 text-sm mt-0.5">
                    +{ecr.impactAssessment.costImpact.toLocaleString()} ج.م
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">تأخير التسليم:</span>
                  <div className="font-mono font-black text-slate-800 text-sm mt-0.5">
                    {ecr.impactAssessment.scheduleDelayDays} يوم
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">إصدار الـ BOM الجديد:</span>
                  <div className="font-mono font-black text-purple-700 text-sm mt-0.5">
                    {ecr.previousBomRevision} ← {ecr.targetNewBomRevision}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">موافقة العميل:</span>
                  <div className="font-black text-emerald-800 text-xs mt-0.5">
                    {ecr.impactAssessment.customerApprovalRequired ? 'مطلوبة بالعقد' : 'تعديل داخلي'}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  onClick={() => handleOpenProject(ecr.technicalProjectId)}
                  className="px-4 py-2 rounded-xl bg-[#361D13] hover:bg-[#1E110B] text-white font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>بيئة العمل الهندسية</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#C87A38]" />
                </button>

                {ecr.status === 'under_review' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => rejectEngineeringChangeRequest(ecr.id, currentUser.fullName, 'تم رفض التعديل')}
                      className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-black transition-all cursor-pointer"
                    >
                      رفض
                    </button>
                    <button
                      onClick={() => approveEngineeringChangeRequest(ecr.id, currentUser.fullName, 'تمت الموافقة وتعديل مسار الـ BOM')}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black hover:opacity-95 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      اعتماد التعديل الهندسي
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

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
