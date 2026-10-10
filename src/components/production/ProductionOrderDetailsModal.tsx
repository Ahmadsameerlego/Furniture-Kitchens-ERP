import React, { useState } from 'react';
import { ProductionOrder, Material } from '../../types/erp';
import { WorkCenter, WorkOrder, ScrapClaimRecord, QualityGateInspection } from '../../types/production';
import { ProductionService } from '../../services/productionService';
import { stationCost, predecessorsOf, CAPTURE_SOURCES } from '../../services/shopFloor';
import { useERP } from '../../context/ERPContext';
import {
  Factory,
  X,
  Layers,
  Clock,
  DollarSign,
  ShieldCheck,
  Package,
  AlertTriangle,
  Printer,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  Building2,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

interface ProductionOrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ProductionOrder;
  workCenters: WorkCenter[];
  workOrders: WorkOrder[];
  scrapClaims: ScrapClaimRecord[];
  onOpenJobCardPrint: (order: ProductionOrder) => void;
  onOpenPackageLabelsPrint: (order: ProductionOrder) => void;
  onOpenScrapModal: (order: ProductionOrder) => void;
  onOpenQualityModal: (order: ProductionOrder) => void;
  onCompleteOrder: (order: ProductionOrder) => void;
}

export const ProductionOrderDetailsModal: React.FC<ProductionOrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  workCenters,
  workOrders,
  scrapClaims,
  onOpenJobCardPrint,
  onOpenPackageLabelsPrint,
  onOpenScrapModal,
  onOpenQualityModal,
  onCompleteOrder
}) => {
  const [activeTab, setActiveTab] = useState<'routing' | 'bom' | 'costing' | 'scrap'>('routing');
  const { shopWorkers } = useERP();

  if (!isOpen) return null;

  const relatedWOs = workOrders.filter(w => w.manufacturingOrderId === order.id);
  const relatedScraps = scrapClaims.filter(s => s.manufacturingOrderId === order.id);
  const costing = ProductionService.calculateJobCosting(order, workOrders, scrapClaims, workCenters, shopWorkers);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-l from-slate-900 via-[#26150D] to-[#361D13] text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#C87A38]/20 border border-[#C87A38]/40 text-[#C87A38] flex items-center justify-center font-bold">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#C87A38] bg-[#C87A38]/10 px-2 py-0.5 rounded-lg border border-[#C87A38]/30">
                  {order.productionNumber}
                </span>
                <span className="text-xs text-slate-300 font-medium">مشروع: {order.projectNumber}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  order.status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {order.status === 'completed' ? 'مكتمل ومغلف ✅' : order.status === 'pending' ? 'لم يبدأ بعد' : 'جاري التصنيع بالورشة ⏳'}
                </span>
                {order.kind === 'remake' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-200 border border-rose-400/40">
                    🔁 أمر نواقص / إعادة تصنيع
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                تفاصيل أمر تصنيع المطبخ / الأثاث — {order.customerName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenJobCardPrint(order)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10"
            >
              <Printer className="w-4 h-4 text-[#C87A38]" />
              <span>كارت الورشة</span>
            </button>
            <button
              onClick={() => onOpenPackageLabelsPrint(order)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10"
            >
              <Package className="w-4 h-4 text-[#C87A38]" />
              <span>ملصقات الطرود</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 block">العميل والموقع:</span>
            <span className="font-bold text-slate-900">{order.customerName} ({order.customerPhone})</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 block">العنبر والورشة:</span>
            <span className="font-bold text-slate-900">{order.workshopLocation}</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 block">التكلفة التقديرية vs الفعلية:</span>
            <span className="font-bold font-mono text-slate-900">
              {costing.totalActualCost.toLocaleString()} ج.م <span className="text-slate-400 font-normal">/ {costing.totalEstimatedCost.toLocaleString()}</span>
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 block">موعد التسليم النهائي:</span>
            <span className="font-bold text-rose-600 font-mono">{order.expectedCompletionDate}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('routing')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'routing'
                ? 'border-[#C87A38] text-[#C87A38]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>مسار المحطات وأوامر الشغل ({relatedWOs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bom')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'bom'
                ? 'border-[#C87A38] text-[#C87A38]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>خامات ومستلزمات الـ BOM ({order.materials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('costing')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'costing'
                ? 'border-[#C87A38] text-[#C87A38]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>تحليل التكلفة الفعلية (Job Costing)</span>
          </button>

          <button
            onClick={() => setActiveTab('scrap')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'scrap'
                ? 'border-[#C87A38] text-[#C87A38]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>الهدر والتوالف المسجلة ({relatedScraps.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* 1. ROUTING & WORK ORDERS */}
          {activeTab === 'routing' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-900">المسار الإنتاجي للمطبخ عبر العنابر:</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => onOpenQualityModal(order)}
                    className="px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl text-xs font-bold border border-teal-200 transition-all flex items-center gap-1"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>فحص الجودة المرحلي</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {relatedWOs.map((wo, idx) => {
                  const statusInfo = ProductionService.getWorkOrderStatusInfo(wo.status);
                  const catInfo = ProductionService.getCategoryInfo(wo.operationCategory);
                  const preds = predecessorsOf(wo, relatedWOs);
                  const lastLog = wo.log?.[wo.log.length - 1];
                  return (
                    <div
                      key={wo.id}
                      className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{wo.operationName}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catInfo.color}`}>
                              {catInfo.short}
                            </span>
                            {wo.track === 'fronts' && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200">مسار الضلف (بالتوازي)</span>
                            )}
                            {wo.subcontract && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-orange-50 text-orange-700 border-orange-200">
                                🚚 بره عند {wo.subcontract.vendorName}{wo.subcontract.receivedAt ? ' (رجعت)' : ''}
                              </span>
                            )}
                          </div>
                          {preds.length > 0 && (
                            <p className="text-[10px] text-slate-400 mt-0.5">بتبدأ بعد: {preds.map(p => ProductionService.getCategoryInfo(p.operationCategory).short).join(' + ')}</p>
                          )}
                          {lastLog && (
                            <p className="text-[10px] text-slate-500 mt-0.5">آخر تسجيل: {lastLog.at} · {CAPTURE_SOURCES[lastLog.source]} ({lastLog.recordedBy})</p>
                          )}
                          <p className="text-xs text-slate-500 mt-1">
                            الماكينة: <span className="font-medium text-slate-700">{wo.workCenterName}</span> — الفني: <span className="font-medium text-slate-700">{wo.assignedTechnicians.join(', ')}</span>
                          </p>
                          {wo.specialInstructions && (
                            <p className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded-lg mt-1 border border-amber-200/60 inline-block">
                              📌 {wo.specialInstructions}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                        <div className="text-right text-xs">
                          <span className="text-slate-400 block text-[10px]">المدة الزمنية:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {wo.actualDurationMinutes || wo.plannedDurationMinutes} دقيقة
                          </span>
                        </div>

                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${statusInfo.bg}`}>
                            <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></span>
                            <span>{statusInfo.label}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. BOM & MATERIALS */}
          {activeTab === 'bom' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-900">الخامات المحجوزة والمنصرفة لأمر الإنتاج:</h4>
                <button
                  onClick={() => onOpenScrapModal(order)}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold border border-rose-200 transition-all flex items-center gap-1"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>تسجيل هدر / كسر خامة</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">كود الخامة</th>
                      <th className="p-3">اسم الخامة والمواصفة</th>
                      <th className="p-3 text-center">الوحدة</th>
                      <th className="p-3 text-center">المطلوب</th>
                      <th className="p-3 text-center">المنصرف</th>
                      <th className="p-3 text-center">المتبقي</th>
                      <th className="p-3 text-center">التكلفة التقديرية</th>
                      <th className="p-3 text-center">التكلفة الفعلية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {order.materials.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-600">{m.materialCode}</td>
                        <td className="p-3 font-bold text-slate-900">{m.materialName}</td>
                        <td className="p-3 text-center text-slate-500">{m.unit}</td>
                        <td className="p-3 text-center font-bold text-slate-800">{m.requiredQuantity}</td>
                        <td className="p-3 text-center font-bold text-emerald-600">{m.consumedQuantity}</td>
                        <td className="p-3 text-center font-bold text-slate-400">{m.remainingQuantity}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-700">{m.estimatedTotalCost.toLocaleString()} ج.م</td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-700">{(m.actualTotalCost || m.estimatedTotalCost).toLocaleString()} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. JOB COSTING ANALYSIS */}
          {activeTab === 'costing' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">إجمالي تكلفة أمر التصنيع المعتمدة:</span>
                  <div className="text-2xl font-black font-mono mt-1 text-[#C87A38]">
                    {costing.totalActualCost.toLocaleString()} ج.م
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">الانحراف عن المقايسة (Variance):</span>
                  <span className={`text-sm font-bold font-mono px-2.5 py-1 rounded-lg ${
                    costing.varianceAmount > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {costing.varianceAmount > 0 ? `+${costing.varianceAmount.toLocaleString()}` : costing.varianceAmount.toLocaleString()} ج.م ({costing.variancePercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-bold block mb-1">1. الخامات ومستلزمات الإنتاج</span>
                  <div className="text-lg font-black font-mono text-slate-900">{costing.rawMaterialsActual.toLocaleString()} ج.م</div>
                  <span className="text-[11px] text-slate-400 block mt-1">المقدر: {costing.rawMaterialsEstimated.toLocaleString()} ج.م</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-bold block mb-1">2. أجور العمالة المباشرة</span>
                  <div className="text-lg font-black font-mono text-slate-900">{costing.directLaborActual.toLocaleString()} ج.م</div>
                  <span className="text-[11px] text-slate-400 block mt-1">المقدر: {costing.directLaborEstimated.toLocaleString()} ج.م</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-bold block mb-1">3. استهلاك الماكينات والهدر</span>
                  <div className="text-lg font-black font-mono text-rose-700">{(costing.machineOverheadActual + costing.scrapCostActual).toLocaleString()} ج.م</div>
                  <span className="text-[11px] text-slate-400 block mt-1">الهدر المسجل: {costing.scrapCostActual.toLocaleString()} ج.م</span>
                </div>

                <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200">
                  <span className="text-xs text-orange-800 font-bold block mb-1">4. تشغيل لدى الغير</span>
                  <div className="text-lg font-black font-mono text-orange-800">{costing.subcontractCostActual.toLocaleString()} ج.م</div>
                  <span className="text-[11px] text-orange-700/70 block mt-1">دهانات / زجاج / رخام اتعمل بره</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-100 text-xs font-black text-slate-800">إزاي اتحسبت المصنعية؟ (محطة محطة)</div>
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">المحطة</th>
                      <th className="p-2.5">طريقة الحساب</th>
                      <th className="p-2.5 text-center">الوقت</th>
                      <th className="p-2.5 text-center">عمالة</th>
                      <th className="p-2.5 text-center">ماكينة</th>
                      <th className="p-2.5 text-center">خارجي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {relatedWOs.map(wo => {
                      const started = wo.status === 'completed' || wo.status === 'in_progress' || wo.status === 'paused';
                      const c = stationCost(started ? wo : { ...wo, subcontract: undefined }, workCenters.find(w => w.id === wo.workCenterId), shopWorkers, started);
                      return (
                        <tr key={wo.id}>
                          <td className="p-2.5 font-bold text-slate-800">{ProductionService.getCategoryInfo(wo.operationCategory).short}</td>
                          <td className="p-2.5 text-slate-500">{started ? c.basis : 'تقديري (لسه مبدأتش)'}</td>
                          <td className="p-2.5 text-center font-mono">{c.minutes ? ProductionService.formatDurationArabic(Math.round(c.minutes)) : '-'}</td>
                          <td className="p-2.5 text-center font-mono">{Math.round(c.labor).toLocaleString()}</td>
                          <td className="p-2.5 text-center font-mono">{Math.round(c.machine).toLocaleString()}</td>
                          <td className="p-2.5 text-center font-mono text-orange-700">{c.subcontract ? c.subcontract.toLocaleString() : '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. SCRAP CLAIMS */}
          {activeTab === 'scrap' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-900">سجل الهدر والتوالف المصروفة كبدائل:</h4>
                <button
                  onClick={() => onOpenScrapModal(order)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/20"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>تسجيل هدر جديد</span>
                </button>
              </div>

              {relatedScraps.length > 0 ? (
                <div className="space-y-3">
                  {relatedScraps.map(s => (
                    <div key={s.id} className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono text-xs font-bold text-rose-700">{s.claimNumber}</span>
                          <h5 className="font-black text-xs text-slate-900 mt-0.5">
                            {s.materialName} ({s.scrapQuantity} {s.unit}) — تكلفة: {s.estimatedCost.toLocaleString()} ج.م
                          </h5>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                          تم صرف البديل ({s.replacementGINNumber})
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-rose-100">
                        السبب: {s.reasonDescription} — تم الإبلاغ بواسطة: {s.reportedBy} ({s.reportedAt})
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">لا يوجد أي هدر أو خامات تالفة مسجلة لهذا الأمر حتى الآن.</p>
                  <p className="text-[11px] text-slate-400 mt-1">الإنتاج يسير طبقاً لمعدلات المقايسة القياسية بدون فواقد.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            أمر الإنتاج مرتبط بمشروع <span className="font-bold text-slate-800">{order.projectNumber}</span> بالمكتب الفني والتخطيط
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-all"
            >
              إغلاق
            </button>
            {order.status !== 'completed' && (
              <button
                onClick={() => {
                  onCompleteOrder(order);
                  onClose();
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>اعتماد الانتهاء الكامل والتسليم للتركيبات</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
