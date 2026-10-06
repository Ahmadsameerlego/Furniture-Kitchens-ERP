import React, { useState } from 'react';
import { WorkCenter, WorkOrder } from '../../types/production';
import { ProductionOrder } from '../../types/erp';
import {
  Zap,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Layers,
  FileText,
  Clock,
  Sparkles,
  User,
  ShieldCheck,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface ShopfloorKioskViewProps {
  workCenters: WorkCenter[];
  workOrders: WorkOrder[];
  orders: ProductionOrder[];
  onUpdateWOStatus: (woId: string, newStatus: WorkOrder['status']) => void;
  onOpenScrapModal: (order: ProductionOrder) => void;
  onOpenQualityModal: (order: ProductionOrder) => void;
}

export const ShopfloorKioskView: React.FC<ShopfloorKioskViewProps> = ({
  workCenters,
  workOrders,
  orders,
  onUpdateWOStatus,
  onOpenScrapModal,
  onOpenQualityModal
}) => {
  const [activeCenterId, setActiveCenterId] = useState<string>(workCenters[0]?.id || 'wc-cnc-01');
  const [selectedWOId, setSelectedWOId] = useState<string>(workOrders[0]?.id || '');
  const [barcodeInput, setBarcodeInput] = useState<string>('');

  const currentCenter = workCenters.find(c => c.id === activeCenterId) || workCenters[0];
  const centerOrders = workOrders.filter(w => w.workCenterId === activeCenterId);
  const activeWO = workOrders.find(w => w.id === selectedWOId) || centerOrders[0] || workOrders[0];
  const parentOrder = orders.find(o => o.id === activeWO?.manufacturingOrderId);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = workOrders.find(w => 
      w.workOrderNumber.toLowerCase() === barcodeInput.toLowerCase() ||
      w.manufacturingOrderNumber.toLowerCase() === barcodeInput.toLowerCase()
    );
    if (found) {
      setActiveCenterId(found.workCenterId);
      setSelectedWOId(found.id);
      setBarcodeInput('');
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Kiosk Mode Top Navigation Bar */}
      <div className="p-4 bg-slate-900 text-white rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C87A38] text-white flex items-center justify-center font-black">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono font-bold text-[#C87A38]">
                KIOSK TABLET MODE
              </span>
              <span className="text-xs text-slate-300">واجهة تشغيل عنبر الورشة</span>
            </div>
            <h2 className="text-lg font-black text-white mt-0.5">
              {currentCenter?.name}
            </h2>
          </div>
        </div>

        {/* Barcode Quick Scanner Form */}
        <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/10">
          <QrCode className="w-5 h-5 text-[#C87A38] mr-2" />
          <input
            type="text"
            placeholder="امسح باركود كارت الشغل (Scan WO / MO)..."
            value={barcodeInput}
            onChange={e => setBarcodeInput(e.target.value)}
            className="bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-none w-56 font-mono font-bold"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#C87A38] hover:bg-[#DB8D48] text-white rounded-xl text-xs font-bold transition-all"
          >
            فتح
          </button>
        </form>
      </div>

      {/* Station Selector Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {workCenters.map(wc => {
          const isActive = activeCenterId === wc.id;
          const count = workOrders.filter(w => w.workCenterId === wc.id && (w.status === 'in_progress' || w.status === 'ready')).length;
          return (
            <button
              key={wc.id}
              onClick={() => {
                setActiveCenterId(wc.id);
                const firstWO = workOrders.find(w => w.workCenterId === wc.id);
                if (firstWO) setSelectedWOId(firstWO.id);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-[#361D13] text-white border-[#361D13] shadow-md scale-105'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <span>{wc.name.split(' ')[0]} {wc.name.split(' ')[1]}</span>
              {count > 0 && (
                <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  isActive ? 'bg-[#C87A38] text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Touch Operation Area */}
      {activeWO ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Left Column: Center Orders Queue */}
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              قائمة أوامر الشغل على هذه الماكينة ({centerOrders.length}):
            </h3>

            <div className="space-y-2">
              {centerOrders.map(wo => {
                const isSelected = activeWO.id === wo.id;
                return (
                  <div
                    key={wo.id}
                    onClick={() => setSelectedWOId(wo.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 border-[#C87A38] shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-black text-[#C87A38]">
                        {wo.workOrderNumber}
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        wo.status === 'in_progress' ? 'bg-blue-600 animate-pulse' : wo.status === 'completed' ? 'bg-emerald-600' : 'bg-amber-500'
                      }`} />
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 mt-1 truncate">
                      {wo.customerName}
                    </h5>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {wo.operationName}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Active Execution Card */}
          <div className="lg:col-span-2 p-6 bg-white rounded-3xl border border-slate-200 shadow-md space-y-6 flex flex-col justify-between">
            
            <div className="space-y-4">
              {/* Order Banner */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#C87A38] bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      {activeWO.workOrderNumber}
                    </span>
                    <span className="text-xs text-slate-500">أمر الإنتاج: {activeWO.manufacturingOrderNumber}</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    {activeWO.operationName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    العميل: <strong className="text-slate-800">{activeWO.customerName}</strong> — المشروع: <strong className="text-slate-800">{activeWO.projectNumber}</strong>
                  </p>
                </div>

                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block">المدة المخططة:</span>
                  <span className="text-lg font-mono font-black text-slate-900">
                    {activeWO.plannedDurationMinutes} دقيقة
                  </span>
                </div>
              </div>

              {/* Special instructions box for the worker */}
              {activeWO.specialInstructions && (
                <div className="p-4 bg-amber-50/80 border-2 border-amber-300 rounded-2xl space-y-1">
                  <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    تعليمات هامة للفني المسؤول (مطلوب التركيز):
                  </span>
                  <p className="text-xs font-bold text-amber-950 leading-relaxed">
                    {activeWO.specialInstructions}
                  </p>
                </div>
              )}

              {/* Progress & Parts Info */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block">الفني المشغل:</span>
                  <strong className="text-slate-900">{activeWO.assignedTechnicians.join(', ')}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">عدد الأجزاء / الضلف:</span>
                  <strong className="text-slate-900 font-mono">{activeWO.partsCompletedCount} من {activeWO.partsToProcessCount} منجز</strong>
                </div>
              </div>
            </div>

            {/* Huge Touch Action Buttons */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {activeWO.status !== 'in_progress' ? (
                  <button
                    onClick={() => onUpdateWOStatus(activeWO.id, 'in_progress')}
                    className="py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    <span>بدء التشغيل الآن (Start)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateWOStatus(activeWO.id, 'paused')}
                    className="py-4 bg-slate-700 hover:bg-slate-800 text-white rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2"
                  >
                    <Pause className="w-6 h-6" />
                    <span>إيقاف مؤقت (Pause)</span>
                  </button>
                )}

                <button
                  onClick={() => onUpdateWOStatus(activeWO.id, 'completed')}
                  className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  <span>تم الإنجاز والتسليم ✅</span>
                </button>
              </div>

              {/* Secondary Touch Actions */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => parentOrder && onOpenScrapModal(parentOrder)}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-all flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>إبلاغ عن لوح تالف / هدر ⚠️</span>
                </button>

                <button
                  onClick={() => parentOrder && onOpenQualityModal(parentOrder)}
                  className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-bold border border-teal-200 transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>فحص الجودة المرحلي</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
          لا توجد أوامر شغل حالية على هذا المركز.
        </div>
      )}

    </div>
  );
};
