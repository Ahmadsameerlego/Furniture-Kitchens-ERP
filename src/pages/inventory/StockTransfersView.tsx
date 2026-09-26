// ====================================================
// REWAQ ERP — INTERNAL STOCK TRANSFERS VIEW
// Inter-Warehouse Logistics, In-Transit Tracking & Receiving Confirmation
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { StockTransfer, StockTransferStatus } from '../../types/erp';
import { InventoryService } from '../../services/inventoryService';
import {
  ArrowLeftRight,
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Eye,
  AlertCircle
} from 'lucide-react';

export const StockTransfersView: React.FC = () => {
  const {
    stockTransfers,
    warehouses,
    itemMasterCards,
    createStockTransfer,
    confirmWarehouseTransfer,
    showToast
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Transfer Form State
  const [sourceWhId, setSourceWhId] = useState<string>(warehouses[0]?.id || '');
  const [destWhId, setDestWhId] = useState<string>(warehouses[1]?.id || '');
  const [selectedItemId, setSelectedItemId] = useState<string>(itemMasterCards[0]?.id || '');
  const [transferQty, setTransferQty] = useState<number>(10);
  const [driverName, setDriverName] = useState<string>('أسامة عبد الرحيم (سائق سيارة الجامبو 1)');
  const [transferNotes, setTransferNotes] = useState<string>('تحويل خامات وألواح من مستودع العبور لورشة التصنيع');

  const selectedItem = itemMasterCards.find(i => i.id === selectedItemId) || itemMasterCards[0];

  const handleCreateTransfer = () => {
    if (sourceWhId === destWhId) {
      showToast('لا يمكن التحويل لنفس المستودع', 'warning');
      return;
    }
    if (transferQty <= 0) {
      showToast('يرجى تحديد كمية صالحة للتحويل', 'warning');
      return;
    }

    const sourceWh = warehouses.find(w => w.id === sourceWhId);
    const destWh = warehouses.find(w => w.id === destWhId);

    createStockTransfer({
      itemId: selectedItem.id,
      itemType: 'material',
      itemName: selectedItem.nameAr,
      itemCode: selectedItem.code,
      quantity: Number(transferQty),
      unit: selectedItem.unitNameAr,
      sourceBranchId: sourceWh?.branchId || 'branch-1',
      sourceBranchName: sourceWh?.name || 'مستودع العبور',
      destinationBranchId: destWh?.branchId || 'branch-2',
      destinationBranchName: destWh?.name || 'مستودع القاهرة',
      driverName,
      notes: transferNotes
    });

    setShowAddModal(false);
  };

  // Filter transfers
  const filteredTransfers = stockTransfers.filter(t => {
    const firstItem = t.items?.[0];
    const matchesSearch =
      !searchQuery ||
      t.transferNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (firstItem && firstItem.itemName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.sourceBranchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destinationBranchName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const inTransitCount = stockTransfers.filter(t => t.status === 'sent' || t.status === 'approved').length;
  const completedCount = stockTransfers.filter(t => t.status === 'received').length;

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>التحويلات اللوجستية بين الفروع والمصانع — Inter-Warehouse Transfers</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <Truck className="w-8 h-8 text-blue-400" />
            <span>التحويلات المخزنية واللوجستية</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            إدارة حركة نقل الخامات والمنتجات التامة بين المصنع والمعارض والورش، وتتبع الشحنات في الطريق (In-Transit) وتأكيد الاستلام بالمستودعات.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء إذن تحويل مخزني</span>
        </button>
      </div>

      {/* 2. STATS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">إجمالي طلبات التحويل</span>
          <div className="text-2xl font-black font-mono text-slate-900">{stockTransfers.length}</div>
          <div className="text-[11px] text-slate-400 font-bold">بين مجمع المصانع والمعارض</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">شحنات في الطريق (In-Transit)</span>
          <div className="text-2xl font-black font-mono text-blue-700">{inTransitCount}</div>
          <div className="text-[11px] text-blue-600 font-bold">خرجت وفي انتظار فحص واستلام الفرع</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">تحويلات مكتملة ومستلمة</span>
          <div className="text-2xl font-black font-mono text-emerald-700">{completedCount}</div>
          <div className="text-[11px] text-emerald-600 font-bold">تمت مطابقة الرصيدين بنجاح</div>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'كافة التحويلات' },
            { id: 'sent', label: 'في الطريق' },
            { id: 'received', label: 'تم الاستلام' },
            { id: 'requested', label: 'في انتظار الاعتماد' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === f.id
                  ? 'bg-blue-800 text-white shadow-xs font-black'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الشحنة أو الصنف أو المستودع..."
            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* 4. TRANSFERS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-xs min-w-[1050px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80">
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">رقم التحويل</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[110px]">التاريخ</th>
                <th className="py-3.5 px-4 min-w-[200px]">الصنف المنقول</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[100px] text-center">الكمية</th>
                <th className="py-3.5 px-4 min-w-[180px]">المستودع المصدر</th>
                <th className="py-3.5 px-4 min-w-[180px]">المستودع الوجهة</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px] text-center">حالة الشحن</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px] text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredTransfers.map(t => {
                const firstItem = t.items?.[0];
                const statusMeta = InventoryService.getTransferStatusMeta(t.status as StockTransferStatus);

                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{t.transferNumber}</td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{t.requestedDate || t.sentDate || '-'}</td>
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-800">
                      <div>{firstItem?.itemName || 'صنف تحويل'}</div>
                      <span className="text-[10px] text-slate-400 font-mono">[{firstItem?.itemCode || '-'}]</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-black text-slate-900 text-sm whitespace-nowrap">
                      {firstItem?.quantity || 1} <span className="text-[10px] text-slate-500">{firstItem?.unit || 'وحدة'}</span>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-700">{t.sourceBranchName}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-700 font-bold">{t.destinationBranchName}</td>
                    <td className="py-3.5 px-4 text-center font-sans whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${statusMeta.bgClass}`}>
                        <span>{statusMeta.label}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-sans whitespace-nowrap">
                      {t.status !== 'received' && (
                        <button
                          onClick={() => confirmWarehouseTransfer(t.id)}
                          className="px-3 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold shadow-2xs transition-all"
                        >
                          تأكيد الاستلام
                        </button>
                      )}
                      {t.status === 'received' && (
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>مستلم ومطابق</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: CREATE STOCK TRANSFER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-700">
                <ArrowLeftRight className="w-6 h-6" />
                <h3 className="font-black text-lg text-slate-900">إنشاء إذن تحويل مخزني</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-rose-50 flex items-center justify-center">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">من مستودع (المصدر):</label>
                  <select
                    value={sourceWhId}
                    onChange={(e) => setSourceWhId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">إلى مستودع (الوجهة):</label>
                  <select
                    value={destWhId}
                    onChange={(e) => setDestWhId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">الصنف المراد نقله:</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {itemMasterCards.map(item => (
                    <option key={item.id} value={item.id}>
                      [{item.code}] {item.nameAr} (الرصيد المتاح: {item.availableStock} {item.unitNameAr})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">الكمية المنقولة ({selectedItem.unitNameAr}):</label>
                  <input
                    type="number"
                    value={transferQty}
                    onChange={(e) => setTransferQty(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-center"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">السائق / وسيلة الشحن:</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">ملاحظات الشحن والتحويل:</label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600">إلغاء</button>
              <button onClick={handleCreateTransfer} className="px-5 py-2 rounded-xl text-xs font-black bg-blue-700 hover:bg-blue-600 text-white shadow-lg">
                بدء الشحن والتحويل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
