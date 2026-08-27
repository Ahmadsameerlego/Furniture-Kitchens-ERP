import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { ProductionOrder, ProductionOrderStatus } from '../types/erp';
import {
  Factory,
  Boxes,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Eye,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building,
  Layers,
  Sparkles,
  Camera,
  Calendar,
  Share2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const ProductionListPage: React.FC = () => {
  const {
    productionOrders,
    materials,
    availableBranches,
    setSelectedProductionOrderId,
    reserveProductionMaterials,
    consumeProductionMaterials,
    completeProductionOrder,
    scheduleInstallation,
    setActiveModule,
    setSelectedMaterialId,
    checkPermission
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'bom_summary'>('orders');

  // Modals state
  const [activeReserveModalOrder, setActiveReserveModalOrder] = useState<ProductionOrder | null>(null);
  const [activeConsumeModalOrder, setActiveConsumeModalOrder] = useState<ProductionOrder | null>(null);
  const [consumeMatId, setConsumeMatId] = useState<string>('');
  const [consumeQty, setConsumeQty] = useState<number>(5);
  const [consumeNotes, setConsumeNotes] = useState<string>('صرف خامات للهيكل بالورشة');

  const [activeCompleteModalOrder, setActiveCompleteModalOrder] = useState<ProductionOrder | null>(null);
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=600');

  const [activeInstallScheduleOrder, setActiveInstallScheduleOrder] = useState<ProductionOrder | null>(null);
  const [installDate, setInstallDate] = useState<string>('2026-08-30');
  const [installTime, setInstallTime] = useState<string>('10:00');
  const [installAddress, setInstallAddress] = useState<string>('شقة 402 - عمارة 12 - النرجس - التجمع الخامس');

  const canCreate = checkPermission('production', 'create');

  // Branch isolation filtering
  const authorizedOrders = productionOrders.filter(p => availableBranches.some(b => b.id === p.branchId));

  const filteredOrders = authorizedOrders.filter(p => {
    const matchesSearch = p.productionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    const matchesBranch = selectedBranch === 'all' || p.branchId === selectedBranch;
    return matchesSearch && matchesStatus && matchesBranch;
  });

  // KPI Overview calculations
  const countPending = authorizedOrders.filter(p => p.status === 'pending').length;
  const countInProd = authorizedOrders.filter(p => p.status === 'in_production').length;
  const countCompleted = authorizedOrders.filter(p => p.status === 'completed').length;
  const countReadyInstall = authorizedOrders.filter(p => p.status === 'ready_installation' || p.status === 'completed').length;
  
  // Count BOM Shortages
  const shortageCount = authorizedOrders.reduce((acc, p) => {
    const shortInOrder = p.materials.filter(m => m.status === 'shortage').length;
    return acc + shortInOrder;
  }, 0);

  const getStatusBadge = (status: ProductionOrderStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'قيد الإعداد بالورشة', class: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'in_production':
        return { label: 'قيد التصنيع بالورشة', class: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'completed':
        return { label: '✓ تصنيع مكتمل', class: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'ready_installation':
        return { label: 'جاهز للتركيب بالموقع', class: 'bg-emerald-900 text-emerald-100 border-emerald-700' };
      case 'on_hold':
        return { label: 'موقوف مؤقتاً', class: 'bg-rose-100 text-rose-900 border-rose-300' };
      default:
        return { label: 'ملغي', class: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#1C352D] text-white flex items-center justify-center font-bold shadow-md">
              <Factory className="w-5 h-5 text-[#E06F28]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">إدارة الإنتاج والورشة (Production & Workshop)</h1>
              <p className="text-xs text-slate-500 font-bold">
                متابعة أوامر تصنيع المطابخ والأثاث، حجز واستهلاك الخامات بالورشة، والتجهيز للتركيب بالموقع
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModule('installation')}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>الجدول الزمني للتركيبات والتسليم</span>
          </button>
        </div>
      </div>

      {/* Production Owner Overview Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-bold block">ما يحتاج تصنيع (Pending):</span>
          <p className="text-2xl font-black text-amber-600 font-mono">{countPending}</p>
          <span className="text-[10px] text-slate-400">في انتظار بدء العمل</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-bold block">جاري تصنيعه بالورشة:</span>
          <p className="text-2xl font-black text-blue-600 font-mono">{countInProd}</p>
          <span className="text-[10px] text-blue-500 font-bold">● قيد النجارة والتجميع</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-bold block">مكتمل التصنيع (Completed):</span>
          <p className="text-2xl font-black text-emerald-600 font-mono">{countCompleted}</p>
          <span className="text-[10px] text-emerald-600 font-bold">✓ جاهز للموقع</span>
        </div>

        <div className="p-4 rounded-3xl bg-[#1C352D] text-white border border-emerald-800 shadow-md space-y-1">
          <span className="text-emerald-300 font-bold block">جاهز للتركيب بالموقع:</span>
          <p className="text-2xl font-black text-amber-300 font-mono">{countReadyInstall}</p>
          <span className="text-[10px] text-emerald-200">ينتظر تحديد الموعد</span>
        </div>

        <div className={`p-4 rounded-3xl border shadow-xs space-y-1 ${shortageCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-white border-slate-200'}`}>
          <span className="font-bold block">نقص الخامات (Shortages):</span>
          <p className={`text-2xl font-black font-mono ${shortageCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{shortageCount}</p>
          <span className="text-[10px] font-bold">{shortageCount > 0 ? '⚠️ يتطلب شراء خامات' : '✓ كافة الخامات متوفرة'}</span>
        </div>

      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث برقم أمر التصنيع، اسم العميل، أو رقم الطلب..."
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">كل حالات التصنيع</option>
              <option value="pending">قيد الإعداد بالورشة</option>
              <option value="in_production">قيد التصنيع بالورشة</option>
              <option value="completed">تم إنهاء التصنيع</option>
              <option value="ready_installation">جاهز للتركيب بالموقع</option>
            </select>
          </div>

          <div>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
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

      {/* Production Orders Cards List */}
      <div className="space-y-4">
        {filteredOrders.map(po => {
          const badge = getStatusBadge(po.status);
          const hasShortage = po.materials.some(m => m.status === 'shortage');

          return (
            <div key={po.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-[#1C352D] bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      {po.productionNumber}
                    </span>
                    <h3 className="text-base font-black text-slate-900">العميل: {po.customerName} ({po.customerPhone})</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-bold">
                    أمر المبيعات: <strong className="text-slate-900">{po.orderNumber}</strong> — الورشة: {po.workshopLocation} — ت. البدء: {po.startDate}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-xl text-xs font-black border ${badge.class}`}>
                    {badge.label}
                  </span>

                  {hasShortage && (
                    <span className="px-3 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>نقص بالخامات</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Bill of Materials (BOM) Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#E06F28]" />
                    <span>قائمة الخامات والمصنعيات المطلوبة بالورشة (BOM):</span>
                  </h4>

                  <div className="flex items-center gap-2 text-xs font-bold">
                    <button
                      onClick={() => setActiveReserveModalOrder(po)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-xl"
                    >
                      + حجز الخامات بالمخزون
                    </button>

                    <button
                      onClick={() => {
                        setActiveConsumeModalOrder(po);
                        if (po.materials[0]) setConsumeMatId(po.materials[0].materialId);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                    >
                      تسجيل استهلاك خامات (Consume)
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden text-xs">
                  <table className="w-full text-right">
                    <thead className="bg-slate-200/70 text-slate-700 font-bold border-b border-slate-300">
                      <tr>
                        <th className="p-3 text-right">اسم الخامة والمواصفة</th>
                        <th className="p-3 text-center">المطلوب</th>
                        <th className="p-3 text-center">المحجوز</th>
                        <th className="p-3 text-center">المستهلك</th>
                        <th className="p-3 text-center">المتبقي</th>
                        <th className="p-3 text-left">التكلفة التقديرية</th>
                        <th className="p-3 text-left">التكلفة الفعلية</th>
                        <th className="p-3 text-center">حالة الخامة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {po.materials.map(m => {
                        const matObj = materials.find(mat => mat.id === m.materialId);
                        const isShortage = m.status === 'shortage';

                        return (
                          <tr key={m.id} className={isShortage ? 'bg-rose-50/80 font-bold text-rose-950' : 'hover:bg-slate-100/60'}>
                            <td className="p-3 font-bold text-slate-900">
                              {m.materialName}
                              <span className="text-[10px] text-slate-500 font-mono block">{m.materialCode}</span>
                            </td>
                            <td className="p-3 text-center font-mono font-bold">{m.requiredQuantity} {m.unit}</td>
                            <td className="p-3 text-center font-mono text-blue-700 font-bold">{m.reservedQuantity}</td>
                            <td className="p-3 text-center font-mono text-emerald-700 font-bold">{m.consumedQuantity}</td>
                            <td className="p-3 text-center font-mono text-amber-800 font-bold">{m.remainingQuantity}</td>
                            <td className="p-3 text-left font-mono">{m.estimatedTotalCost.toLocaleString('ar-EG')} ج.م</td>
                            <td className="p-3 text-left font-mono font-bold text-emerald-800">
                              {m.actualTotalCost > 0 ? `${m.actualTotalCost.toLocaleString('ar-EG')} ج.م` : 'قيد الاستهلاك'}
                            </td>
                            <td className="p-3 text-center">
                              {isShortage ? (
                                <div className="flex items-center justify-center gap-1">
                                  <span className="bg-rose-200 text-rose-900 text-[10px] font-black px-2 py-0.5 rounded border border-rose-300">
                                    ⚠️ نقص {m.requiredQuantity - (matObj?.availableStock || 0)}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setSelectedMaterialId(m.materialId);
                                      setActiveModule('materials');
                                    }}
                                    className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded font-bold hover:bg-slate-800"
                                  >
                                    معاينة بالمخزن
                                  </button>
                                </div>
                              ) : m.status === 'consumed' ? (
                                <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">✓ مستهلك بالكامل</span>
                              ) : m.status === 'reserved' ? (
                                <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded">محجوز بالمخزن</span>
                              ) : (
                                <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">قيد الإعداد</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cost Summary Bar & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
                
                {/* Cost Variance (Internal Only) */}
                <div className="flex items-center gap-4 font-mono font-bold bg-slate-900 text-white p-3 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">التكلفة التقديرية للخامات:</span>
                    <span>{po.totalEstimatedMaterialCost.toLocaleString('ar-EG')} ج.م</span>
                  </div>

                  <div className="h-6 w-px bg-slate-700"></div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">التكلفة الفعليه حتى الآن:</span>
                    <span className="text-emerald-400">{po.totalActualMaterialCost.toLocaleString('ar-EG')} ج.م</span>
                  </div>

                  <div className="h-6 w-px bg-slate-700"></div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">الانحراف (Variance):</span>
                    <span className={po.materialVariance > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {po.materialVariance > 0 ? `+${po.materialVariance.toLocaleString('ar-EG')}` : po.materialVariance.toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="flex items-center gap-2">
                  {po.status !== 'completed' && (
                    <button
                      onClick={() => setActiveCompleteModalOrder(po)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>إتمام تصنيع الورشة بالكامل</span>
                    </button>
                  )}

                  {(po.status === 'completed' || po.status === 'ready_installation') && (
                    <button
                      onClick={() => setActiveInstallScheduleOrder(po)}
                      className="px-4 py-2 bg-[#E06F28] hover:bg-[#c85e1b] text-white font-black rounded-xl shadow-md flex items-center gap-1.5"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>جدولة موعد التركيب بالموقع</span>
                    </button>
                  )}
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* RESERVE MATERIALS MODAL */}
      {activeReserveModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900">حجز خامات لأمر التصنيع ({activeReserveModalOrder.productionNumber})</h3>
            
            <p className="text-slate-600 font-bold">
              حجز الكميات المطلوبة في المخزون المتاح حتى لا يتم صرفها لأوامر أخرى.
            </p>

            <div className="space-y-2">
              {activeReserveModalOrder.materials.map(m => (
                <div key={m.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{m.materialName}</p>
                    <span className="text-[10px] text-slate-500">مطلوب: {m.requiredQuantity} {m.unit}</span>
                  </div>

                  <button
                    onClick={() => {
                      reserveProductionMaterials(activeReserveModalOrder.id, m.materialId, m.requiredQuantity);
                      setActiveReserveModalOrder(null);
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg"
                  >
                    حجز {m.requiredQuantity} {m.unit}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setActiveReserveModalOrder(null)} className="px-4 py-2 border rounded-xl font-bold">إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* CONSUME MATERIALS MODAL */}
      {activeConsumeModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900">تسجيل صرف واستهلاك خامات بالورشة</h3>
            
            <div>
              <label className="block font-bold mb-1">اختر الخامة المستهلكة من قائمة BOM *</label>
              <select
                value={consumeMatId}
                onChange={e => setConsumeMatId(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
              >
                {activeConsumeModalOrder.materials.map(m => (
                  <option key={m.id} value={m.materialId}>
                    {m.materialName} (متبقي: {m.remainingQuantity} {m.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">الكمية المستهلكة الآن *</label>
              <input
                type="number"
                value={consumeQty}
                onChange={e => setConsumeQty(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold text-center"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">ملاحظات الصرف والتشغيل</label>
              <input
                type="text"
                value={consumeNotes}
                onChange={e => setConsumeNotes(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setActiveConsumeModalOrder(null)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button
                type="button"
                onClick={() => {
                  if (!consumeMatId || consumeQty <= 0) return;
                  consumeProductionMaterials(activeConsumeModalOrder.id, consumeMatId, consumeQty, consumeNotes);
                  setActiveConsumeModalOrder(null);
                }}
                className="px-5 py-2 bg-emerald-600 text-white font-black rounded-xl"
              >
                تأكيد خصم الخامات من المخزون
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE PRODUCTION MODAL */}
      {activeCompleteModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900">إكتمال إنتاج أمر الورشة ({activeCompleteModalOrder.productionNumber})</h3>
            
            <div>
              <label className="block font-bold mb-1">رابط صورة التشطيب النهائي للتصنيع بالورشة</label>
              <input
                type="text"
                value={completionPhotoUrl}
                onChange={e => setCompletionPhotoUrl(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
              />
            </div>

            {completionPhotoUrl && (
              <img src={completionPhotoUrl} alt="completion" className="w-full h-40 object-cover rounded-2xl border" />
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setActiveCompleteModalOrder(null)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button
                type="button"
                onClick={() => {
                  completeProductionOrder(activeCompleteModalOrder.id, [completionPhotoUrl], 'تم الفحص والجودة بالورشة بنجاح');
                  setActiveCompleteModalOrder(null);
                }}
                className="px-5 py-2 bg-emerald-600 text-white font-black rounded-xl shadow-md"
              >
                تأكيد إكتمال التصنيع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE INSTALLATION MODAL */}
      {activeInstallScheduleOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900">جدولة موعد تركيب بالمنزل للعميل ({activeInstallScheduleOrder.customerName})</h3>
            
            <div>
              <label className="block font-bold mb-1">تاريخ التركيب المتفق عليه *</label>
              <input type="date" value={installDate} onChange={e => setInstallDate(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-bold" />
            </div>

            <div>
              <label className="block font-bold mb-1">عنوان الموقع والتركيب بالتفصيل *</label>
              <input type="text" value={installAddress} onChange={e => setInstallAddress(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-bold" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setActiveInstallScheduleOrder(null)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button
                type="button"
                onClick={() => {
                  scheduleInstallation(activeInstallScheduleOrder.id, installDate, installTime, installAddress, ['user-1', 'user-2']);
                  setActiveInstallScheduleOrder(null);
                }}
                className="px-5 py-2 bg-[#E06F28] text-white font-black rounded-xl shadow-md"
              >
                حفظ موعد التركيب
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
