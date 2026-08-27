import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { CustomProject, ProjectType, ProjectStatus } from '../types/erp';
import { CustomProjectService } from '../services/customProjectService';
import {
  Ruler,
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  Building,
  CheckCircle2,
  X,
  FileText,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { CustomProjectDetailsPage } from './CustomProjectDetailsPage';

export const CustomProjectsListPage: React.FC = () => {
  const {
    customProjects,
    customers,
    availableBranches,
    selectedProjectId,
    setSelectedProjectId,
    checkPermission,
    createCustomProject
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [projectName, setProjectName] = useState('');
  const [customerId, setCustomerId] = useState(customers[0]?.id || 'cust-1');
  const [branchId, setBranchId] = useState(availableBranches[0]?.id || 'branch-1');
  const [projectType, setProjectType] = useState<ProjectType>('kitchen');
  const [notes, setNotes] = useState('');

  const canCreate = checkPermission('custom_projects', 'create');

  if (selectedProjectId) {
    return (
      <CustomProjectDetailsPage
        projectId={selectedProjectId}
        onBack={() => setSelectedProjectId(null)}
      />
    );
  }

  // Filter Projects by authorized branches
  const authorizedProjects = customProjects.filter(p => availableBranches.some(b => b.id === p.branchId));

  const filteredProjects = authorizedProjects.filter(p => {
    const matchesSearch = p.projectNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || p.projectType === selectedType;
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    const matchesBranch = selectedBranch === 'all' || p.branchId === selectedBranch;

    return matchesSearch && matchesType && matchesStatus && matchesBranch;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const customer = customers.find(c => c.id === customerId) || customers[0];
    const branch = availableBranches.find(b => b.id === branchId) || availableBranches[0];

    createCustomProject({
      projectName,
      customerId: customer.id,
      customerName: customer.fullName,
      customerPhone: customer.phone,
      branchId: branch.id,
      branchName: branch.name,
      projectType,
      notes
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">مشاريع التفصيل والمقاسات (Custom Projects)</h1>
            <span className="bg-[#E06F28]/15 text-[#E06F28] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E06F28]/30">
              {filteredProjects.length} مشروع مصرح
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            دورة عمل مشاريع التفصيل: المعاينة ← المقاسات ← تصميمات 3D والتعديلات ← عروض الأسعار ← موافقة العميل المعتمدة
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-[#1C352D] hover:bg-[#142921] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4 text-[#E06F28]" />
            <span>إنشاء مشروع تفصيل جديد</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم المشروع أو اسم العميل أو اسم المشروع..."
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">كل أنواع المشاريع</option>
              <option value="kitchen">مطابخ تفصيل</option>
              <option value="bedroom">غرف نوم تفصيل</option>
              <option value="wardrobe">دريسنج ودولاب</option>
              <option value="tv_unit">وحدات تلفزيون</option>
              <option value="living">أنتريه / ركنة تفصيل</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">كل مراحل ومراحل المشروع</option>
              <option value="new">مشروع جديد</option>
              <option value="visit_scheduled">معاينة مجدولة</option>
              <option value="measured">تمت المعاينة والمقاسات</option>
              <option value="designing">قيد التصميم 3D</option>
              <option value="design_review">مراجعة التصميم مع العميل</option>
              <option value="quotation">عرض السعر قيد الدراسة</option>
              <option value="approved">موافق عليه من العميل (Approved)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">كل الفروع المصرحة</option>
              {availableBranches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#1C352D] text-white font-bold border-b border-emerald-900/50">
              <tr>
                <th className="p-4 min-w-[200px] text-right whitespace-nowrap">رقم المشروع واسمه</th>
                <th className="p-4 min-w-[160px] text-right whitespace-nowrap">العميل والفرع</th>
                <th className="p-4 min-w-[170px] text-right whitespace-nowrap">نوع المشروع والتصنيف</th>
                <th className="p-4 min-w-[160px] text-center whitespace-nowrap">مرحلة المشروع الحالية</th>
                <th className="p-4 min-w-[130px] text-center whitespace-nowrap">المسؤول والتاريخ</th>
                <th className="p-4 min-w-[140px] text-center whitespace-nowrap">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProjects.map(p => {
                const statusMeta = CustomProjectService.getProjectStatusMeta(p.status);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="p-4 whitespace-nowrap">
                      <div>
                        <p className="font-black text-slate-900 text-sm">{p.projectName}</p>
                        <span className="font-mono text-[11px] text-slate-500 font-bold block mt-0.5">{p.projectNumber}</span>
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <p className="font-bold text-slate-900">{p.customerName}</p>
                      <p className="text-[11px] text-slate-500">{p.branchName}</p>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs">
                        {CustomProjectService.getProjectTypeLabel(p.projectType)}
                      </span>
                    </td>

                    <td className="p-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold border shadow-2xs ${statusMeta.bgClass}`}>
                        {statusMeta.label}
                      </span>
                    </td>

                    <td className="p-4 text-center whitespace-nowrap text-[11px]">
                      <p className="font-bold text-slate-800">{p.assignedUserName}</p>
                      <span className="text-slate-400 font-mono">{p.createdDate}</span>
                    </td>

                    <td className="p-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedProjectId(p.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1C352D] hover:bg-[#142921] text-white font-black text-xs shadow-xs transition-all flex items-center gap-1.5 mx-auto shrink-0 whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#E06F28]" />
                        <span>لوحة المشروع 360</span>
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5">
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">إنشاء مشروع تفصيل مخصص جديد</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المشروع التوصيفي *</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="مثال: مطبخ مودرن رويل HPL"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">العميل صاحب المشروع *</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع المشروع *</label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value as ProjectType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="kitchen">مطبخ تفصيل</option>
                    <option value="bedroom">غرفة نوم تفصيل</option>
                    <option value="wardrobe">دريسنج ودولاب</option>
                    <option value="tv_unit">وحدة تلفزيون</option>
                    <option value="living">أنتريه / ركنة تفصيل</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الفرع المسؤول *</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    {availableBranches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات أولية متفق عليها مع العميل</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: يفضل العميل ألوان الأوف وايت وخامات HPL مقاومة للحرارة"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded-xl font-bold text-slate-700">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2 bg-[#1C352D] text-white font-black rounded-xl shadow-md">
                  تأكيد وإنشاء المشروع
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
