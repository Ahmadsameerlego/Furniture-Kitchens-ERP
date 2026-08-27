import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { InventoryService } from '../services/inventoryService';
import {
  Boxes,
  Layers,
  Package,
  Truck,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Eye,
  Plus,
  ShoppingBag,
  History
} from 'lucide-react';

// Sub-components / pages
import { PurchasingListPage } from './PurchasingListPage';
import { StockTransfersPage } from './StockTransfersPage';

export const InventoryPage: React.FC = () => {
  const {
    materials,
    products,
    stockMovements,
    stockTransfers,
    availableBranches,
    setSelectedMaterialId,
    setSelectedProductId,
    setActiveModule
  } = useERP();

  const [activeSubView, setActiveSubView] = useState<'overview' | 'purchases' | 'transfers' | 'movements'>('overview');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'materials' | 'products'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate Metrics
  const lowStockMaterials = materials.filter(m => InventoryService.isLowStock(m.availableStock, m.minStockLevel));
  const pendingTransfersCount = stockTransfers.filter(t => t.status === 'requested' || t.status === 'approved' || t.status === 'sent').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">إدارة المخزون والحركات (Inventory & Operations)</h1>
            <span className="bg-[#E06F28]/15 text-[#E06F28] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E06F28]/30">
              {availableBranches.length} مقرات مصرحة
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            "ماذا نملك؟ أين توجد الخامات والمنتجات؟ كم تكلفة توريدها؟ وما هي حالة التحويلات والمخزون الحرج؟"
          </p>
        </div>

        {/* Location Filter Dropdown */}
        <div className="flex items-center gap-2 shrink-0 text-xs">
          <span className="text-slate-600 font-bold">المقر / التصفية:</span>
          <select
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
          >
            <option value="all">كل المقرات والفروع</option>
            {availableBranches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-1 text-xs">
          <div className="flex items-center justify-between text-slate-500 font-bold">
            <span>إجمالي خامات التصنيع:</span>
            <Layers className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{materials.length} صنف</p>
          <span className="text-[11px] text-slate-400">مقسمة بدليل الخامات ومواقع التخزين</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-1 text-xs">
          <div className="flex items-center justify-between text-slate-500 font-bold">
            <span>المنتجات الجاهزة بالمخزن:</span>
            <Package className="w-5 h-5 text-[#1C352D]" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{products.length} منتج</p>
          <span className="text-[11px] text-slate-400">متاحة بالمعارض والمخزن المركزي</span>
        </div>

        <div className={`p-5 rounded-3xl border shadow-sm space-y-1 text-xs ${
          lowStockMaterials.length > 0 ? 'bg-rose-50 border-rose-300 text-rose-950' : 'bg-white border-slate-200/80'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <span>تنبيهات نقص المخزون (Low Stock):</span>
            <AlertTriangle className={`w-5 h-5 ${lowStockMaterials.length > 0 ? 'text-rose-600 animate-bounce' : 'text-slate-400'}`} />
          </div>
          <p className="text-2xl font-black font-mono">{lowStockMaterials.length} أصناف حرجة</p>
          <span className="text-[11px] opacity-80">أقل من حد الأمان المطلوب</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-1 text-xs">
          <div className="flex items-center justify-between text-slate-500 font-bold">
            <span>التحويلات الجارية بين الفروع:</span>
            <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{pendingTransfersCount} طلب جاري</p>
          <span className="text-[11px] text-slate-400">قيد الاعتماد أو الشحن أو الاستلام</span>
        </div>

      </div>

      {/* Sub-Navigation Bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-1 text-xs">
        <button
          onClick={() => setActiveSubView('overview')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all ${
            activeSubView === 'overview' ? 'bg-[#1C352D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          نظرة عامة على الكميات والمواقف
        </button>

        <button
          onClick={() => setActiveSubView('purchases')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeSubView === 'purchases' ? 'bg-[#1C352D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-[#E06F28]" />
          <span>أوامر الشراء واستلام التوريدات</span>
        </button>

        <button
          onClick={() => setActiveSubView('transfers')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeSubView === 'transfers' ? 'bg-[#1C352D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4 text-indigo-500" />
          <span>التحويلات والتسويات المخزنية</span>
          {pendingTransfersCount > 0 && (
            <span className="bg-[#E06F28] text-white text-[10px] px-2 py-0.2 rounded-full">
              {pendingTransfersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubView('movements')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeSubView === 'movements' ? 'bg-[#1C352D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4 text-emerald-500" />
          <span>سجل تتبع الحركة المخزنية ({stockMovements.length})</span>
        </button>
      </div>

      {/* Sub-View 1: Overview & Combined Inventory List */}
      {activeSubView === 'overview' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم الخامة أو المنتج أو الكود..."
                className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setItemTypeFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  itemTypeFilter === 'all' ? 'bg-[#1C352D] text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setItemTypeFilter('materials')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  itemTypeFilter === 'materials' ? 'bg-[#1C352D] text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                خامات التصنيع ({materials.length})
              </button>
              <button
                onClick={() => setItemTypeFilter('products')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  itemTypeFilter === 'products' ? 'bg-[#1C352D] text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                المنتجات الجاهزة ({products.length})
              </button>
            </div>
          </div>

          {/* Combined Inventory Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#1C352D] text-white font-bold border-b border-emerald-900/50">
                  <tr>
                    <th className="p-4 min-w-[240px] text-right whitespace-nowrap">اسم الصنف والكود</th>
                    <th className="p-4 min-w-[130px] text-right whitespace-nowrap">النوع والتصنيف</th>
                    <th className="p-4 min-w-[110px] text-center whitespace-nowrap">الموجود On Hand</th>
                    <th className="p-4 min-w-[110px] text-center whitespace-nowrap">المحجوز Reserved</th>
                    <th className="p-4 min-w-[120px] text-center whitespace-nowrap">المتاح Available</th>
                    <th className="p-4 min-w-[140px] text-center whitespace-nowrap">حالة الأمان</th>
                    <th className="p-4 min-w-[130px] text-center whitespace-nowrap">الإجراءات</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  
                  {/* Materials Rows */}
                  {(itemTypeFilter === 'all' || itemTypeFilter === 'materials') &&
                    materials
                      .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.code.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(m => {
                        const isLow = InventoryService.isLowStock(m.availableStock, m.minStockLevel);

                        return (
                          <tr key={`mat-${m.id}`} className="hover:bg-slate-50/80 transition-colors">
                            
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0 font-bold">
                                  <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-black text-slate-900 text-sm">{m.name}</p>
                                  <span className="font-mono text-[11px] text-slate-500 font-bold block">{m.code}</span>
                                </div>
                              </div>
                            </td>

                            <td className="p-4 whitespace-nowrap">
                              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                خامة ({m.unit})
                              </span>
                            </td>

                            <td className="p-4 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                              {m.currentStock}
                            </td>

                            <td className="p-4 text-center font-mono font-bold text-amber-700 whitespace-nowrap">
                              {m.reservedStock}
                            </td>

                            <td className="p-4 text-center font-mono font-black text-emerald-800 whitespace-nowrap">
                              {m.availableStock}
                            </td>

                            <td className="p-4 text-center whitespace-nowrap">
                              <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                                isLow ? 'bg-rose-100 text-rose-900 border border-rose-300' : 'bg-emerald-100 text-emerald-900'
                              }`}>
                                {isLow ? '⚠️ نقص مخزون' : '✓ طبيعي'}
                              </span>
                            </td>

                            <td className="p-4 text-center whitespace-nowrap">
                              <button
                                onClick={() => setSelectedMaterialId(m.id)}
                                className="px-3 py-1.5 rounded-xl bg-[#1C352D] text-white font-bold text-xs hover:bg-[#142921] flex items-center gap-1 mx-auto"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#E06F28]" />
                                <span>كشف 360</span>
                              </button>
                            </td>

                          </tr>
                        );
                      })}

                  {/* Ready Products Rows */}
                  {(itemTypeFilter === 'all' || itemTypeFilter === 'products') &&
                    products
                      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(p => {
                        let totalOnHand = 0;
                        let totalReserved = 0;
                        let totalAvailable = 0;
                        p.stockByLocation.forEach(l => {
                          totalOnHand += l.onHand;
                          totalReserved += l.reserved;
                          totalAvailable += l.available;
                        });

                        return (
                          <tr key={`prod-${p.id}`} className="hover:bg-slate-50/80 transition-colors">
                            
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200 shrink-0 font-bold">
                                  <Package className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-black text-slate-900 text-sm">{p.name}</p>
                                  <span className="font-mono text-[11px] text-slate-500 font-bold block">{p.code}</span>
                                </div>
                              </div>
                            </td>

                            <td className="p-4 whitespace-nowrap">
                              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                أثاث جاهز
                              </span>
                            </td>

                            <td className="p-4 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                              {totalOnHand}
                            </td>

                            <td className="p-4 text-center font-mono font-bold text-amber-700 whitespace-nowrap">
                              {totalReserved}
                            </td>

                            <td className="p-4 text-center font-mono font-black text-emerald-800 whitespace-nowrap">
                              {totalAvailable}
                            </td>

                            <td className="p-4 text-center whitespace-nowrap">
                              <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                                totalAvailable > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {totalAvailable > 0 ? '✓ متوفر' : 'منتهي'}
                              </span>
                            </td>

                            <td className="p-4 text-center whitespace-nowrap">
                              <button
                                onClick={() => setSelectedProductId(p.id)}
                                className="px-3 py-1.5 rounded-xl bg-[#1C352D] text-white font-bold text-xs hover:bg-[#142921] flex items-center gap-1 mx-auto"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#E06F28]" />
                                <span>كشف 360</span>
                              </button>
                            </td>

                          </tr>
                        );
                      })}

                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Sub-View 2: Purchases */}
      {activeSubView === 'purchases' && <PurchasingListPage />}

      {/* Sub-View 3: Transfers */}
      {activeSubView === 'transfers' && <StockTransfersPage />}

      {/* Sub-View 4: Movements Log */}
      {activeSubView === 'movements' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
            سجل تتبع الحركة المخزنية الشامل بالشركة (Stock Movements Log)
          </h3>

          <div className="space-y-3 text-xs">
            {stockMovements.map(m => {
              const meta = InventoryService.getMovementTypeMeta(m.movementType);

              return (
                <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg font-bold text-[11px] border ${meta.bgClass}`}>
                        {meta.label}
                      </span>
                      <span className="font-mono font-black text-slate-900">{m.referenceNumber}</span>
                      <span className="font-bold text-slate-800">— {m.itemName}</span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">{m.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700 font-bold pt-1">
                    <span>الكمية: <strong className="font-mono text-sm">{meta.sign}{m.quantity}</strong></span>
                    <span>المقر المستهدف: {m.destinationBranchName || m.sourceBranchName}</span>
                    <span>الموظف: {m.userName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
