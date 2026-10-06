import React, { useState } from 'react';
import { WorkCenter, WorkOrder } from '../../types/production';
import { ProductionOrder } from '../../types/erp';
import { ProductionService } from '../../services/productionService';
import {
  Cpu,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  User,
  Activity,
  Layers,
  Sparkles,
  Search,
  Filter,
  Wrench
} from 'lucide-react';

interface WorkCentersAndOrdersViewProps {
  workCenters: WorkCenter[];
  workOrders: WorkOrder[];
  orders: ProductionOrder[];
  onUpdateWOStatus: (woId: string, newStatus: WorkOrder['status']) => void;
  onSelectOrder: (order: ProductionOrder) => void;
}

export const WorkCentersAndOrdersView: React.FC<WorkCentersAndOrdersViewProps> = ({
  workCenters,
  workOrders,
  orders,
  onUpdateWOStatus,
  onSelectOrder
}) => {
  const [selectedCenterId, setSelectedCenterId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredWOs = workOrders.filter(w => {
    const matchesCenter = selectedCenterId === 'all' || w.workCenterId === selectedCenterId;
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesCenter && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Work Centers Grid */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-black text-slate-900">عنابر ومراكز التشغيل الرئيسية بالمصنع (Work Centers)</h3>
          <span className="text-xs text-slate-500 font-medium">إجمالي {workCenters.length} محطات عمل مجهزة</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workCenters.map(wc => {
            const isSelected = selectedCenterId === wc.id;
            const catInfo = ProductionService.getCategoryInfo(wc.category);
            const activeCount = workOrders.filter(w => w.workCenterId === wc.id && w.status === 'in_progress').length;

            return (
              <div
                key={wc.id}
                onClick={() => setSelectedCenterId(isSelected ? 'all' : wc.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-[1.02]'
                    : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                      isSelected ? 'bg-[#C87A38] text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-[#C87A38]' : 'text-slate-400'}`}>
                        {wc.code}
                      </span>
                      <h4 className="text-xs font-black leading-tight mt-0.5">{wc.name}</h4>
                    </div>
                  </div>
                </div>

                <p className={`text-[11px] mt-2 line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {wc.workshopLocation}
                </p>

                <div className={`grid grid-cols-2 gap-2 p-2.5 rounded-2xl mt-3 text-xs border ${
                  isSelected ? 'bg-white/10 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <div>
                    <span className={`text-[10px] block ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>المشرف المسؤول:</span>
                    <strong className="text-[11px] truncate block">{wc.supervisorName.split(' ')[0]} {wc.supervisorName.split(' ')[1]}</strong>
                  </div>
                  <div>
                    <span className={`text-[10px] block ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>تكلفة الساعة:</span>
                    <strong className="text-[11px] font-mono">{wc.hourlyLaborCost + wc.hourlyMachineCost} ج.م/س</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-100/20 text-xs">
                  <span className={`text-[11px] font-bold ${activeCount > 0 ? (isSelected ? 'text-amber-300' : 'text-blue-600') : 'text-slate-400'}`}>
                    {activeCount > 0 ? `⚡ ${activeCount} أمر جاري الآن` : 'متاحة للتشغيل'}
                  </span>
                  <span className={`font-mono font-black text-xs ${isSelected ? 'text-[#C87A38]' : 'text-emerald-600'}`}>
                    {wc.efficiencyRate}% OEE
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900">جدول أوامر الشغل الميدانية (Work Orders)</h3>
            {selectedCenterId !== 'all' && (
              <button
                onClick={() => setSelectedCenterId('all')}
                className="text-xs text-[#C87A38] font-bold hover:underline"
              >
                (إلغاء فلتر المحطة)
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            >
              <option value="all">جميع الحالات</option>
              <option value="in_progress">قيد التشغيل الآن</option>
              <option value="ready">جاهز للبدء</option>
              <option value="completed">مكتمل</option>
              <option value="blocked">معطل</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">كود أمر الشغل</th>
                <th className="p-3.5">العملية والمرحلة</th>
                <th className="p-3.5">المشروع والعميل</th>
                <th className="p-3.5">مركز العمل / الماكينة</th>
                <th className="p-3.5 text-center">المدة المخططة</th>
                <th className="p-3.5 text-center">الفنيين المسؤولين</th>
                <th className="p-3.5 text-center">الحالة</th>
                <th className="p-3.5 text-center">تحكم التشغيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredWOs.map(wo => {
                const statusInfo = ProductionService.getWorkOrderStatusInfo(wo.status);
                const parentOrder = orders.find(o => o.id === wo.manufacturingOrderId);

                return (
                  <tr key={wo.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {wo.workOrderNumber}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block">{wo.operationName}</span>
                      {wo.specialInstructions && (
                        <span className="text-[10px] text-amber-700 line-clamp-1 block mt-0.5">📌 {wo.specialInstructions}</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        onClick={() => parentOrder && onSelectOrder(parentOrder)}
                        className="font-bold text-slate-900 hover:text-[#C87A38] cursor-pointer block"
                      >
                        {wo.customerName}
                      </span>
                      <span className="text-[11px] text-slate-400 block">{wo.manufacturingOrderNumber}</span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      {wo.workCenterName}
                    </td>
                    <td className="p-3.5 text-center font-mono">
                      {wo.plannedDurationMinutes} دقيقة
                    </td>
                    <td className="p-3.5 text-center text-slate-700">
                      {wo.assignedTechnicians.join(', ')}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${statusInfo.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                        <span>{statusInfo.label}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {wo.status === 'ready' && (
                          <button
                            onClick={() => onUpdateWOStatus(wo.id, 'in_progress')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all"
                          >
                            <Play className="w-3 h-3" />
                            <span>بدء</span>
                          </button>
                        )}
                        {wo.status === 'in_progress' && (
                          <>
                            <button
                              onClick={() => onUpdateWOStatus(wo.id, 'paused')}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-[10px] transition-all"
                              title="إيقاف مؤقت"
                            >
                              <Pause className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onUpdateWOStatus(wo.id, 'completed')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>إنهاء</span>
                            </button>
                          </>
                        )}
                        {wo.status === 'paused' && (
                          <button
                            onClick={() => onUpdateWOStatus(wo.id, 'in_progress')}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all"
                          >
                            <Play className="w-3 h-3" />
                            <span>استئناف</span>
                          </button>
                        )}
                        {wo.status === 'completed' && (
                          <span className="text-[11px] font-bold text-emerald-600">✓ تم التسليم</span>
                        )}
                        {wo.status === 'blocked' && (
                          <span className="text-[11px] font-bold text-rose-600">⚠️ معطل</span>
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

    </div>
  );
};
