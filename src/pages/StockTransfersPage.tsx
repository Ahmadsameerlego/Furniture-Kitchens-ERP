import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { StockTransfer } from '../types/erp';
import { InventoryService } from '../services/inventoryService';
import {
  Truck,
  Plus,
  Search,
  Filter,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  PackageCheck
} from 'lucide-react';
import { StockTransferModal } from '../components/modals/StockTransferModal';
import { StockAdjustmentModal } from '../components/modals/StockAdjustmentModal';

export const StockTransfersPage: React.FC = () => {
  const {
    stockTransfers,
    createStockTransfer,
    updateTransferStatus,
    processStockAdjustment,
    checkPermission
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  const canCreate = checkPermission('inventory', 'create');

  const filteredTransfers = stockTransfers.filter(t => {
    const matchesSearch = t.transferNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.sourceBranchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.destinationBranchName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">تحويلات المخزون والتسويات (Stock Transfers & Adjustments)</h1>
            <span className="bg-[#C87A38]/15 text-[#C87A38] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#C87A38]/30">
              {filteredTransfers.length} تحويل مسجل
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة النقل الداخلي بين المعارض والمخازن والورش، وإجراء تسويات العجز والتخريد المعتمدة
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canCreate && (
            <>
              <button
                onClick={() => setIsAdjustmentModalOpen(true)}
                className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>تسوية رصيد (Adjustment)</span>
              </button>

              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="px-5 py-2.5 bg-[#361D13] hover:bg-[#23120A] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4 text-[#C87A38]" />
                <span>طلب تحويل مخزون جديد</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم التحويل أو الفرع الصادر/المستلم..."
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">كل حالات التحويل</option>
              <option value="requested">مطلبوب قيد الاعتماد (Requested)</option>
              <option value="approved">معتمد (Approved)</option>
              <option value="sent">تم الشحن (Sent)</option>
              <option value="received">تم الاستلام (Received)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Transfers List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#361D13] text-white font-bold border-b border-emerald-900/50">
              <tr>
                <th className="p-4 min-w-[160px] text-right whitespace-nowrap">رقم التحويل والتاريخ</th>
                <th className="p-4 min-w-[200px] text-right whitespace-nowrap">المسار (من ← إلى)</th>
                <th className="p-4 min-w-[180px] text-right whitespace-nowrap">الأصناف والكميات</th>
                <th className="p-4 min-w-[150px] text-center whitespace-nowrap">حالة التحويل</th>
                <th className="p-4 min-w-[170px] text-center whitespace-nowrap">الإجراءات والاعتماد</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTransfers.map(t => {
                const statusMeta = InventoryService.getTransferStatusMeta(t.status);

                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Number & Date */}
                    <td className="p-4 whitespace-nowrap">
                      <div>
                        <p className="font-black text-slate-900 text-sm">{t.transferNumber}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{t.requestedDate}</p>
                        <span className="text-[10px] text-slate-500 font-bold">بواسطة: {t.requestedByUserName}</span>
                      </div>
                    </td>

                    {/* From -> To */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="bg-rose-50 text-rose-900 px-2 py-0.5 rounded-lg border border-rose-200 text-[11px] font-bold block">
                          من: {t.sourceBranchName}
                        </span>
                        <span className="bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded-lg border border-emerald-200 text-[11px] font-bold block">
                          إلى: {t.destinationBranchName}
                        </span>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        {t.items.map((item, idx) => (
                          <div key={idx} className="text-slate-800 text-[11px] font-bold truncate max-w-[200px]">
                            • {item.itemName} ({item.quantity} {item.unit})
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black border whitespace-nowrap ${statusMeta.bgClass}`}>
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {t.status === 'requested' && (
                          <button
                            onClick={() => updateTransferStatus(t.id, 'approved')}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs"
                          >
                            اعتماد الطلب
                          </button>
                        )}

                        {t.status === 'approved' && (
                          <button
                            onClick={() => updateTransferStatus(t.id, 'sent')}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs flex items-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>تأكيد الشحن</span>
                          </button>
                        )}

                        {t.status === 'sent' && (
                          <button
                            onClick={() => updateTransferStatus(t.id, 'received')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs flex items-center gap-1"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>تأكيد الاستلام</span>
                          </button>
                        )}

                        {t.status === 'received' && (
                          <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>مكتمل بالكامل</span>
                          </span>
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

      {/* Stock Transfer Modal */}
      <StockTransferModal
        isOpen={isTransferModalOpen}
        onSave={(data) => {
          createStockTransfer(data);
          setIsTransferModalOpen(false);
        }}
        onClose={() => setIsTransferModalOpen(false)}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onSave={(itemId, itemType, branchId, qty, reason) => {
          processStockAdjustment(itemId, itemType, branchId, qty, reason);
          setIsAdjustmentModalOpen(false);
        }}
        onClose={() => setIsAdjustmentModalOpen(false)}
      />

    </div>
  );
};
