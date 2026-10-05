import React, { useState } from 'react';
import { 
  Boxes, 
  Search, 
  Filter, 
  Layers, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Play,
  FileText,
  User,
  Plus
} from 'lucide-react';
import { PlanningDemand, ProjectPlanningReadiness } from '../../types/planning';
import { getDemandSourceBadge, getDemandStatusBadge, getPriorityBadge } from '../../services/planningService';

interface PlanningDemandViewProps {
  demands: PlanningDemand[];
  readinessList: ProjectPlanningReadiness[];
  onOpenMRPModal: () => void;
  onNavigateToMRP: () => void;
}

export const PlanningDemandView: React.FC<PlanningDemandViewProps> = ({
  demands,
  readinessList,
  onOpenMRPModal,
  onNavigateToMRP,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredDemands = demands.filter(d => {
    const matchesSearch = 
      d.demandNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.projectNumber && d.projectNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.customerName && d.customerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSource = selectedSourceType === 'all' || d.sourceType === selectedSourceType;
    const matchesStatus = selectedStatus === 'all' || d.status === selectedStatus;

    return matchesSearch && matchesSource && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-indigo-600" />
            طلبات التخطيط واحتياجات المشاريع (Planning Demands)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة كافة الطلبات والاحتياجات المستلمة تلقائياً من حزم الإفراج الفني المعتمدة (Technical Office Releases) وأوامر التصنيع
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMRPModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            تشغيل محرك الـ MRP للطلبات
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">إجمالي خطوط الطلب</span>
            <span className="text-2xl font-black text-slate-900">{demands.length}</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">طلبات مشاريع مخصصة (Custom Projects)</span>
            <span className="text-2xl font-black text-blue-600">
              {demands.filter(d => d.sourceType === 'custom_project').length}
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">مفتوح للـ MRP</span>
            <span className="text-2xl font-black text-amber-600">
              {demands.filter(d => d.status === 'open').length}
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بكود الطلب، اسم أو كود الخامة، كود المشروع، اسم العميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSourceType}
            onChange={(e) => setSelectedSourceType(e.target.value)}
            className="text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
          >
            <option value="all">كل مصادر الطلب (All Sources)</option>
            <option value="custom_project">مشاريع عمولة معتمدة (Custom Projects)</option>
            <option value="production_order">احتياج إنتاج داخلي (Production)</option>
            <option value="safety_stock_replenishment">إعادة ملء المخزون (Safety Stock)</option>
            <option value="forecast_mps">خطة الإنتاج الرئيسية (MPS)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
          >
            <option value="all">كل الحالات (All Statuses)</option>
            <option value="open">مفتوح للـ MRP</option>
            <option value="planned">مخطط (Planned)</option>
            <option value="partially_supplied">مستوفى جزئياً</option>
            <option value="fully_supplied">مستوفى بالكامل</option>
          </select>
        </div>
      </div>

      {/* Demands Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/60">
              <tr>
                <th className="px-4 py-3.5">كود الطلب والمصدر</th>
                <th className="px-4 py-3.5">المشروع / العميل</th>
                <th className="px-4 py-3.5">البند المطلوب (Item Master)</th>
                <th className="px-4 py-3.5">الكمية والوحدة</th>
                <th className="px-4 py-3.5">تاريخ الحاجة بالمصنع</th>
                <th className="px-4 py-3.5">الأولوية</th>
                <th className="px-4 py-3.5">الحالة</th>
                <th className="px-4 py-3.5">المستودع المستهدف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDemands.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    لا توجد طلبات تخطيط مطابقة لمعايير البحث الحالية
                  </td>
                </tr>
              ) : (
                filteredDemands.map((demand) => {
                  const sourceMeta = getDemandSourceBadge(demand.sourceType);
                  const statusMeta = getDemandStatusBadge(demand.status);
                  const priorityMeta = getPriorityBadge(demand.priority);

                  return (
                    <tr key={demand.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{demand.demandNumber}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${sourceMeta.color}`}>
                            {sourceMeta.label}
                          </span>
                          {demand.sourceNumber && (
                            <span className="text-[10px] text-slate-400">({demand.sourceNumber})</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {demand.projectNumber ? (
                          <div>
                            <span className="font-bold text-slate-800 block">{demand.projectNumber}</span>
                            <span className="text-[11px] text-slate-500">{demand.projectName}</span>
                            {demand.customerName && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">العميل: {demand.customerName}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">عام للمخزون</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{demand.itemName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{demand.itemCode}</div>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-indigo-700">
                        {demand.quantityRequired} {demand.uom}
                      </td>

                      <td className="px-4 py-3.5 font-medium text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{demand.requiredDate}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${priorityMeta.color}`}>
                          {priorityMeta.label}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusMeta.color}`}>
                          {statusMeta.label}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 text-[11px]">
                        {demand.warehouseName}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
