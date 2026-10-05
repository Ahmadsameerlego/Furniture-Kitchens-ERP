import React, { useState } from 'react';
import { X, Play, Cpu, Calendar, Warehouse, CheckCircle2, AlertTriangle, Layers, Sparkles } from 'lucide-react';
import { useERP } from '../../../context/ERPContext';

interface ExecuteMRPRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunExecuted: (horizonDays: number, warehouseIds: string[]) => void;
}

export const ExecuteMRPRunModal: React.FC<ExecuteMRPRunModalProps> = ({
  isOpen,
  onClose,
  onRunExecuted
}) => {
  if (!isOpen) return null;

  const { warehouses, planningDemands, currentUser } = useERP();

  const [horizonDays, setHorizonDays] = useState<number>(30);
  const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>(warehouses.map(w => w.id));
  const [includeForecast, setIncludeForecast] = useState<boolean>(true);
  const [includeSafetyStock, setIncludeSafetyStock] = useState<boolean>(true);
  const [runNotes, setRunNotes] = useState<string>('دورة تشغيل الـ MRP الشاملة لمطابقة متطلبات المشاريع الحالية وحساب صافي العجز ومقترحات التوريد.');
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const openDemandsCount = planningDemands.filter(d => d.status !== 'closed' && d.status !== 'cancelled').length;

  const handleToggleWarehouse = (id: string) => {
    setSelectedWarehouses(prev => 
      prev.includes(id) ? (prev.length > 1 ? prev.filter(w => w !== id) : prev) : [...prev, id]
    );
  };

  const handleExecute = () => {
    setIsRunning(true);
    setTimeout(() => {
      onRunExecuted(horizonDays, selectedWarehouses);
      setIsRunning(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-[#1E110B] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">تشغيل محرك الـ MRP وحساب صافي الاحتياجات</h3>
              <p className="text-xs text-slate-300">Material Requirements Planning Engine Run</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs overflow-y-auto max-h-[75vh]">
          
          {/* Quick Stats banner */}
          <div className="p-4 rounded-2xl bg-[#FDF8F4] border border-[#C87A38]/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#C87A38]/10 text-[#C87A38] flex items-center justify-center font-mono font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="font-black text-[#1E110B]">الطلبات المفتوحة المؤهلة للتحليل:</div>
                <div className="text-slate-500 text-[11px]">مشاريع التفصيل المعتمدة، بنود الـ BOM، وتعويض النواقص</div>
              </div>
            </div>
            <span className="text-lg font-black text-[#C87A38] font-mono px-3 py-1 bg-white rounded-xl border border-[#C87A38]/30">
              {openDemandsCount} بند
            </span>
          </div>

          {/* Planning Horizon */}
          <div className="space-y-2">
            <label className="block font-black text-slate-900 text-xs">
              1. أفق التخطيط الزمني (Planning Horizon):
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { days: 30, label: '30 يوماً (شهر)', sub: 'للطلبات الفورية والعاجلة' },
                { days: 60, label: '60 يوماً (شهرين)', sub: 'المدى التشغيلي القياسي' },
                { days: 90, label: '90 يوماً (ربع سنوي)', sub: 'للتوريدات الاستيرادية الطويلة' }
              ].map(opt => (
                <div
                  key={opt.days}
                  onClick={() => setHorizonDays(opt.days)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-center space-y-1 ${
                    horizonDays === opt.days
                      ? 'bg-[#361D13] text-white border-[#361D13] shadow-md shadow-[#361D13]/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="font-black text-xs">{opt.label}</div>
                  <div className={`text-[10px] ${horizonDays === opt.days ? 'text-amber-300' : 'text-slate-500'}`}>
                    {opt.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warehouses to Include */}
          <div className="space-y-2">
            <label className="block font-black text-slate-900 text-xs">
              2. المستودعات المشمولة في حساب الرصيد المتاح:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {warehouses.map(wh => {
                const isSelected = selectedWarehouses.includes(wh.id);
                return (
                  <div
                    key={wh.id}
                    onClick={() => handleToggleWarehouse(wh.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-slate-50/60 border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Warehouse className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{wh.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calculation Parameters */}
          <div className="space-y-2.5">
            <label className="block font-black text-slate-900 text-xs">
              3. محددات وقواعد الاحتساب الذكية:
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSafetyStock}
                  onChange={e => setIncludeSafetyStock(e.target.checked)}
                  className="rounded text-[#C87A38] focus:ring-[#C87A38]"
                />
                <div>
                  <span className="font-bold text-slate-800">حماية حد الأمان المخزني (Safety Stock Buffer)</span>
                  <p className="text-[11px] text-slate-500">اعتبار الرصيد الذي يقل عن حد الأمان كعجز يتطلب توليد مقترح توريد</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeForecast}
                  onChange={e => setIncludeForecast(e.target.checked)}
                  className="rounded text-[#C87A38] focus:ring-[#C87A38]"
                />
                <div>
                  <span className="font-bold text-slate-800">تضمين أوامر الشراء المفتوحة الجارية (Incoming POs)</span>
                  <p className="text-[11px] text-slate-500">خصم الشحنات المؤكد وصولها قبل تاريخ الاحتياج من حساب العجز</p>
                </div>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ملاحظات دورة التخطيط:</label>
            <textarea
              rows={2}
              value={runNotes}
              onChange={e => setRunNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            disabled={isRunning}
            onClick={handleExecute}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#361D13] to-[#1E110B] hover:opacity-95 text-white font-black text-xs shadow-md shadow-[#361D13]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري الحساب والتفجير...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>بدء تشغيل وتحديث الـ MRP</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
