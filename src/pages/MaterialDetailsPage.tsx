import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Material } from '../types/erp';
import { InventoryService } from '../services/inventoryService';
import {
  ArrowRight,
  Layers,
  DollarSign,
  Boxes,
  Truck,
  History,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building,
  Tag,
  Eye,
  Plus
} from 'lucide-react';

interface MaterialDetailsPageProps {
  materialId: string;
  onBack: () => void;
}

export const MaterialDetailsPage: React.FC<MaterialDetailsPageProps> = ({ materialId, onBack }) => {
  const {
    materials,
    suppliers,
    stockMovements,
    purchaseOrders,
    setSelectedSupplierId,
    setActiveModule
  } = useERP();

  const material = materials.find(m => m.id === materialId);
  const [activeTab, setActiveTab] = useState<'overview' | 'suppliers' | 'inventory' | 'movements'>('overview');

  if (!material) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
        <p className="text-slate-500 font-bold text-sm">عفواً، لم يتم العثور على خامة التصنيع المطلوبة</p>
        <button onClick={onBack} className="px-4 py-2 bg-[#361D13] text-white text-xs font-bold rounded-xl">
          العودة لمكتبة الخامات
        </button>
      </div>
    );
  }

  const isLow = InventoryService.isLowStock(material.availableStock, material.minStockLevel);

  // Filter movements for this material
  const matMovements = stockMovements.filter(m => m.itemId === material.id);

  // Filter PO items for this material
  const matPurchases = purchaseOrders.flatMap(po => 
    po.items
      .filter(i => i.itemId === material.id)
      .map(i => ({ poNumber: po.poNumber, date: po.orderDate, supplierName: po.supplierName, unitCost: i.unitCost, quantity: i.quantity, totalCost: i.totalCost }))
  );

  return (
    <div className="space-y-6">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-xs transition-all"
        >
          <ArrowRight className="w-4 h-4 text-[#361D13]" />
          <span>العودة لمكتبة الخامات</span>
        </button>
      </div>

      {/* Material Header 360 Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900">{material.name}</h1>
                  <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200 font-bold">
                    {material.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-bold">{material.categoryName} — وحدة القياس: ({material.unit})</p>
              </div>
            </div>

            {/* Specifications Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              {material.specifications.map((sp, i) => (
                <span key={i} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold border border-slate-200 text-[11px]">
                  <strong>{sp.key}:</strong> {sp.value}
                </span>
              ))}
            </div>
          </div>

          {/* Stock Metrics Card */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs min-w-[260px] shrink-0 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold">المخزون المتاح الحالي:</span>
              <span className={`font-black text-base font-mono ${isLow ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                {material.availableStock} {material.unit}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="text-slate-400 font-bold">حد أمان المخزون (Min):</span>
              <span className="font-bold text-amber-300 font-mono">{material.minStockLevel} {material.unit}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="text-slate-400 font-bold">التكلفة المرجعية الحالية:</span>
              <span className="font-black text-white font-mono">{material.currentReferenceCost.toLocaleString('ar-EG')} ج.م</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-1 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all ${
            activeTab === 'overview' ? 'bg-[#361D13] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          نظرة عامة والمواصفات
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'suppliers' ? 'bg-[#361D13] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>الموردون والتكلفة التاريخية</span>
          <span className="bg-white/20 text-xs px-2 py-0.2 rounded-full">{material.suppliers.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all ${
            activeTab === 'inventory' ? 'bg-[#361D13] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          توزيع المخزون حسب المقرات ({material.stockByLocation.length})
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'movements' ? 'bg-[#361D13] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>سجل تتبع الحركات ({matMovements.length})</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100">
            الوصف الفني والمواصفات الهيكلية
          </h3>

          <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {material.description || 'لا يوجد وصف تفصيلي مسجل لهذه الخامة'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {material.specifications.map((sp, i) => (
              <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between font-bold">
                <span className="text-slate-500">{sp.key}:</span>
                <span className="text-slate-900">{sp.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Suppliers & Purchase Costs */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="space-y-3">
            <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
              الموردون المسجلون لهذه الخامة (أسعار الشراء والتكلفة التنافسية)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {material.suppliers.map((s, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-black text-slate-900">{s.supplierName}</p>
                    <p className="text-[11px] text-slate-500">آخر توريد: {s.lastPurchaseDate}</p>
                  </div>

                  <div className="text-left font-mono">
                    <span className="font-black text-amber-900 text-sm">{s.purchaseCost.toLocaleString('ar-EG')} ج.م</span>
                    <span className="text-[10px] text-slate-400 block">لكل {material.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Purchases */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-900">سجل فواتير الشراء والتكلفة التاريخية (Purchase History)</h3>

            {matPurchases.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">لا توجد عمليات شراء سابقة مسجلة لهذه الخامة بعد</p>
            ) : (
              <div className="space-y-2 text-xs">
                {matPurchases.map((p, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between font-bold">
                    <div>
                      <span className="text-slate-900">{p.poNumber}</span>
                      <span className="text-slate-500 font-normal mr-2">({p.supplierName})</span>
                    </div>

                    <div className="flex items-center gap-4 font-mono">
                      <span>الكمية: {p.quantity} {material.unit}</span>
                      <span className="text-amber-800 font-black">سعر التوريد: {p.unitCost.toLocaleString('ar-EG')} ج.م</span>
                      <span className="text-slate-400 text-[10px]">{p.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Inventory by Location */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
            توزيع الكميات الحالية حسب المقرات والفروع
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {material.stockByLocation.map((loc, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-black text-slate-900 text-sm">{loc.branchName}</span>
                  <span className="bg-slate-200 text-slate-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    مقر معتمد
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-bold">
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">الموجود On Hand</span>
                    <span className="text-slate-900 font-mono text-sm">{loc.onHand}</span>
                  </div>

                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">المحجوز Reserved</span>
                    <span className="text-amber-700 font-mono text-sm">{loc.reserved}</span>
                  </div>

                  <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-emerald-800 text-[10px] block">المتاح Available</span>
                    <span className="text-emerald-900 font-mono text-sm font-black">{loc.available}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Stock Movements */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
            سجل تتبع الحركة المخزنية للخامة (Stock Movements Audit)
          </h3>

          {matMovements.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">لا توجد حركات مخزنية مسجلة على هذه الخامة بعد</p>
          ) : (
            <div className="space-y-3 text-xs">
              {matMovements.map(m => {
                const meta = InventoryService.getMovementTypeMeta(m.movementType);

                return (
                  <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-lg font-bold text-[11px] border ${meta.bgClass}`}>
                          {meta.label}
                        </span>
                        <span className="font-mono font-black text-slate-900">{m.referenceNumber}</span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">{m.timestamp}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700 font-bold pt-1">
                      <span>الكمية: <strong className="font-mono text-sm">{meta.sign}{m.quantity} {material.unit}</strong></span>
                      <span>المقر المستهدف: {m.destinationBranchName || m.sourceBranchName}</span>
                      <span>بواسطة: {m.userName}</span>
                    </div>

                    {m.notes && (
                      <p className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-200/60">
                        ملاحظات: {m.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
