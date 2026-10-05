import React, { useState } from 'react';
import { 
  Gauge, 
  Layers, 
  Cpu, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  Settings2,
  Users,
  Building2,
  Plus
} from 'lucide-react';
import { WorkCenterCapacity } from '../../types/planning';
import { getWorkCenterLoadBadge } from '../../services/planningService';

interface PlanningCapacityViewProps {
  workCenters: WorkCenterCapacity[];
  onUpdateCapacityHours: (workCenterId: string, additionalHours: number) => void;
}

export const PlanningCapacityView: React.FC<PlanningCapacityViewProps> = ({
  workCenters,
  onUpdateCapacityHours,
}) => {
  const [selectedCenter, setSelectedCenter] = useState<WorkCenterCapacity | null>(workCenters[0] || null);
  const [addingHours, setAddingHours] = useState<number>(8);

  const totalWeeklyCapacity = workCenters.reduce((acc, wc) => acc + wc.totalCapacityWeeklyHours, 0);
  const totalBookedHours = workCenters.reduce((acc, wc) => acc + wc.allocatedHours, 0);
  const factoryOverallUtilization = Math.round((totalBookedHours / (totalWeeklyCapacity || 1)) * 100);

  const bottleneckCenters = workCenters.filter(wc => wc.utilizationPercentage >= 85);

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Gauge className="w-6 h-6 text-purple-600" />
            تخطيط سعة مراكز العمل والماكينات (Work Centers Capacity & Load)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            مراقبة الأحمال الأسبوعية لماكينات القص والـ CNC ولصق القشاط وخطوط التجميع والدهانات، واكتشاف نقاط الاختناق
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">إجمالي الطاقة المتاحة للمصنع</span>
            <span className="text-2xl font-black text-slate-900">{totalWeeklyCapacity} ساعة / أسبوع</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">إجمالي الساعات المحجوزة للمشاريع</span>
            <span className="text-2xl font-black text-indigo-700">{totalBookedHours} ساعة</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">متوسط نسبة إشغال المصنع</span>
            <span className={`text-2xl font-black ${
              factoryOverallUtilization >= 85 ? 'text-rose-600' : 
              factoryOverallUtilization >= 70 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {factoryOverallUtilization}%
            </span>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Work Centers List & Selected Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Work Centers Cards */}
        <div className="lg:col-span-2 space-y-4">
          {workCenters.map((wc) => {
            const loadMeta = getWorkCenterLoadBadge(wc.utilizationPercentage);
            const isSelected = selectedCenter?.id === wc.id;

            return (
              <div 
                key={wc.id}
                onClick={() => setSelectedCenter(wc)}
                className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer ${
                  isSelected ? 'border-purple-500 ring-2 ring-purple-100 shadow-md' : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">{wc.nameAr}</h4>
                      <span className="text-xs text-slate-400 font-mono">({wc.centerCode})</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>القسم: <strong>{wc.category}</strong></span>
                      <span>•</span>
                      <span>ساعات العمل اليومية: <strong>{wc.dailyStandardHours} س/يوم</strong></span>
                      <span>•</span>
                      <span>الفنيين: <strong>{wc.operatorCount} فني</strong></span>
                    </div>
                  </div>

                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${loadMeta.color}`}>
                    {wc.utilizationPercentage}% ({loadMeta.label})
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-3">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      wc.utilizationPercentage >= 90 ? 'bg-rose-600' :
                      wc.utilizationPercentage >= 75 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(wc.utilizationPercentage, 100)}%` }}
                  />
                </div>

                {/* Metrics Footer */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">الطاقة الأسبوعية</span>
                    <span className="font-bold text-slate-800">{wc.totalCapacityWeeklyHours} س</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">الساعات المحجوزة</span>
                    <span className="font-bold text-indigo-700">{wc.allocatedHours} س</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">الساعات الحرة المتبقية</span>
                    <span className="font-bold text-emerald-700">{wc.availableHours} س</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 1 Col: Work Center Deep Dive & Shift Adjustment */}
        {selectedCenter && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-5 h-fit">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block mb-1">
                تفاصيل مركز العمل المحدد
              </span>
              <h3 className="text-lg font-bold text-slate-900">{selectedCenter.nameAr}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedCenter.name} - {selectedCenter.centerCode}</p>
            </div>

            {/* Bottleneck Alert */}
            {selectedCenter.utilizationPercentage >= 85 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">تنبيه اختناق إنتاجي (Bottleneck):</span>
                  <span>نسبة الإشغال تجاوزت 85%، يوصى بزيادة ساعات إضافية لتفادي تأخر مواعيد التسليم.</span>
                </div>
              </div>
            )}

            {/* Shift & Overtime Capacity Extension Action */}
            <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-3">
              <h5 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Settings2 className="w-4 h-4 text-purple-600" />
                توسيع سعة التشغيل (إضافة وردية / ساعات إضافية)
              </h5>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="4"
                  max="48"
                  value={addingHours}
                  onChange={(e) => setAddingHours(Number(e.target.value))}
                  className="w-24 text-xs px-3 py-2 bg-white border border-purple-200 rounded-xl font-bold text-slate-800 text-center"
                />
                <button
                  onClick={() => onUpdateCapacityHours(selectedCenter.id, addingHours)}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  إضافة {addingHours} ساعة إضافية
                </button>
              </div>
              <p className="text-[10px] text-purple-700 leading-relaxed">
                ستتم زيادة الطاقة الأسبوعية المتاحة وتخفيض نسبة التحميل لتفادي عنق الزجاجة.
              </p>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
