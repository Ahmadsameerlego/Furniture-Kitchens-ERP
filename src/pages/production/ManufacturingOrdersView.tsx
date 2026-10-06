import React, { useState } from 'react';
import { ProductionOrder, ProductionOrderStatus } from '../../types/erp';
import { WorkOrder, ScrapClaimRecord, WorkCenter } from '../../types/production';
import { ProductionService } from '../../services/productionService';
import {
  Factory,
  Search,
  Eye,
  Printer,
  Package,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  ShieldCheck,
  Building2,
  Calendar,
  User,
  Phone,
  Filter
} from 'lucide-react';

interface ManufacturingOrdersViewProps {
  orders: ProductionOrder[];
  workCenters: WorkCenter[];
  workOrders: WorkOrder[];
  scrapClaims: ScrapClaimRecord[];
  onSelectOrder: (order: ProductionOrder) => void;
  onOpenJobCard: (order: ProductionOrder) => void;
  onOpenPackageLabels: (order: ProductionOrder) => void;
  onOpenScrapModal: (order: ProductionOrder) => void;
  onOpenQualityModal: (order: ProductionOrder) => void;
  onCompleteOrder: (order: ProductionOrder) => void;
}

export const ManufacturingOrdersView: React.FC<ManufacturingOrdersViewProps> = ({
  orders,
  workCenters,
  workOrders,
  scrapClaims,
  onSelectOrder,
  onOpenJobCard,
  onOpenPackageLabels,
  onOpenScrapModal,
  onOpenQualityModal,
  onCompleteOrder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.productionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.projectNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث برقم أمر التصنيع (PROD)، اسم العميل، أو كود المشروع..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
          >
            <option value="all">جميع الحالات (All)</option>
            <option value="in_production">قيد التصنيع بالورشة</option>
            <option value="completed">مكتمل ومغلف</option>
            <option value="pending">بانتظار الخامات</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">أمر التصنيع والمشروع</th>
                <th className="p-3.5">العميل والموقع</th>
                <th className="p-3.5">العنبر والورشة</th>
                <th className="p-3.5 text-center">المسار والتقدم</th>
                <th className="p-3.5 text-center">صرف الخامات</th>
                <th className="p-3.5 text-center">التكلفة الفعلية</th>
                <th className="p-3.5 text-center">الحالة</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => {
                  const relatedWOs = workOrders.filter(w => w.manufacturingOrderId === order.id);
                  const completedWOCount = relatedWOs.filter(w => w.status === 'completed').length;
                  const totalWOCount = relatedWOs.length || 5;
                  const progressPct = Math.round((completedWOCount / totalWOCount) * 100);
                  const costing = ProductionService.calculateJobCosting(order, workOrders, scrapClaims, workCenters);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-all">
                      {/* MO Number */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                            {order.productionNumber}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">مشروع: {order.projectNumber}</span>
                      </td>

                      {/* Customer */}
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{order.customerName}</span>
                        <span className="text-[11px] text-slate-500 block">{order.customerPhone}</span>
                      </td>

                      {/* Workshop */}
                      <td className="p-3.5 text-slate-700">
                        <span className="block font-medium">{order.workshopLocation}</span>
                        <span className="text-[11px] text-slate-400 block">{order.branchName}</span>
                      </td>

                      {/* Routing Progress */}
                      <td className="p-3.5 text-center">
                        <div className="w-28 mx-auto space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-600">
                            <span>{completedWOCount} من {totalWOCount} محطات</span>
                            <span className="font-mono">{progressPct}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className={`h-full rounded-full transition-all ${
                                progressPct === 100 ? 'bg-emerald-500' : 'bg-[#C87A38]'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* BOM Material Status */}
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 inline-block">
                          {order.materials.length} أصناف BOM
                        </span>
                      </td>

                      {/* Costing */}
                      <td className="p-3.5 text-center">
                        <span className="font-mono font-bold text-xs text-slate-900 block">
                          {costing.totalActualCost.toLocaleString()} ج.م
                        </span>
                        <span className={`text-[10px] font-bold ${costing.varianceAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {costing.varianceAmount > 0 ? `+${costing.varianceAmount} ج.م` : 'ضمن المقايسة'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          order.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : order.status === 'in_production'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {order.status === 'completed' ? 'مكتمل ومغلف ✅' : order.status === 'in_production' ? 'جاري بالورشة ⏳' : 'بانتظار الخامات ⚠️'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectOrder(order)}
                            className="p-1.5 bg-slate-100 hover:bg-[#361D13] hover:text-white rounded-lg text-slate-600 transition-all"
                            title="عرض تفاصيل أمر التصنيع"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenJobCard(order)}
                            className="p-1.5 bg-amber-50 hover:bg-[#C87A38] hover:text-white rounded-lg text-[#C87A38] transition-all"
                            title="طباعة كارت الورشة"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenPackageLabels(order)}
                            className="p-1.5 bg-teal-50 hover:bg-teal-600 hover:text-white rounded-lg text-teal-600 transition-all"
                            title="طباعة ملصقات الطرود"
                          >
                            <Package className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    لا توجد أوامر تصنيع مطابقة لمعايير البحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
