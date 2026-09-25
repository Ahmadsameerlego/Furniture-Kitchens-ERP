// ====================================================
// REWAQ ERP — FISCAL PERIODS & MONTH-END CLOSING VIEW
// Monthly Period Locking, Audit Trail, & Period-End Controls
// ====================================================

import React from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Clock,
  Sparkles,
  Scale
} from 'lucide-react';

export const FiscalPeriodsView: React.FC = () => {
  const { fiscalPeriods, toggleFiscalPeriodLock, showToast, setActiveModule } = useERP();

  const handleToggleLock = (periodId: string) => {
    toggleFiscalPeriodLock(periodId);
    showToast('تم تحديث حالة قفل الفترة المحاسبية بنجاح', 'success');
  };

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Calendar className="w-3.5 h-3.5" />
            <span>الرقابة الدورية وإقفال الحسابات — Fiscal Calendar & Month-End Close</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-[#C87A38]" />
            <span>الفترات المحاسبية وإقفال الشهر</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            التحكم في قفل الفترات المحاسبية لمنع ترحيل قيود أو تعديلات بأثر رجعي، وإتمام إجراءات إقفال الشهر المالي.
          </p>
        </div>

        <button
          onClick={() => setActiveModule('acc_reports')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C87A38] hover:bg-amber-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
        >
          <Scale className="w-4 h-4" />
          <span>مراجعة ميزان الإقفال</span>
        </button>
      </div>

      {/* 2. PERIODS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="font-black text-xs text-slate-800">جدول فترات السنة المالية 2026</span>
          <span className="text-xs text-slate-400 font-bold">السنة المالية: 01/01/2026 - 31/12/2026</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-xs min-w-[850px]">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3.5 px-4 min-w-[180px]">اسم الفترة المحاسبية</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[80px]">السنة</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[110px]">تاريخ البداية</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[110px]">تاريخ النهاية</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px] text-center">حالة القفل</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[160px] text-center">الإجراءات والتحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {fiscalPeriods.map(period => (
                <tr key={period.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{period.name}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono">{period.year}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono whitespace-nowrap">{period.startDate}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono whitespace-nowrap">{period.endDate}</td>
                  <td className="py-3.5 px-4 text-center font-sans whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black shadow-2xs whitespace-nowrap ${
                      !period.isClosed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {!period.isClosed ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      <span>{!period.isClosed ? 'فترة مفتوحة للترحيل' : 'فترة مقفلة ومغلقة'}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-sans whitespace-nowrap">
                    <button
                      onClick={() => handleToggleLock(period.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-2xs ${
                        !period.isClosed
                          ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {!period.isClosed ? 'قفل الفترة لمنع التعديل' : 'فتح الفترة للترحيل'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
