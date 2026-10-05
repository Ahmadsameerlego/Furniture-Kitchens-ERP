import React, { useState } from 'react';
import { 
  Calendar, 
  Layers, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Filter,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { MPSItemRow, MPSWeeklyBucket } from '../../types/planning';

interface PlanningMPSViewProps {
  mpsItems: MPSItemRow[];
  weeklyBuckets: MPSWeeklyBucket[];
}

export const PlanningMPSView: React.FC<PlanningMPSViewProps> = ({
  mpsItems,
  weeklyBuckets,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems = mpsItems.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-indigo-600" />
            الجدول الرئيسي للإنتاج (Master Production Schedule - MPS)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            جدولة وتوزيع طاقة المصنع على الفترات الأسبوعية (Weekly Buckets) لتلبية طلب المشاريع والمخزون
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 shadow-xs"
          >
            <option value="all">كل عائلات المنتجات (All Families)</option>
            <option value="standard_cabinet">وحدات مطابخ نمطية (Standard Cabinets)</option>
            <option value="finished_unit">وحدات كاملة جاهزة (Finished Units)</option>
            <option value="board_sheet">ألواح ومسطحات خشبية (Boards & Sheets)</option>
          </select>
        </div>
      </div>

      {/* Weekly Buckets Capacity Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {weeklyBuckets.map((bucket) => {
          const isHighDemand = bucket.totalDemandQty > bucket.plannedProductionQty;
          return (
            <div 
              key={bucket.weekNumber}
              className={`rounded-2xl p-4 border shadow-xs transition-all ${
                isHighDemand 
                  ? 'bg-amber-50/50 border-amber-200' 
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">أسبوع {bucket.weekNumber}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  isHighDemand 
                    ? 'bg-amber-100 text-amber-800 border-amber-300' 
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  إنتاج: {bucket.plannedProductionQty} وحدة
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block mb-2">{bucket.weekLabel}</span>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[10px] text-slate-600">
                <div>
                  <span className="text-slate-400 block">إجمالي الطلب</span>
                  <span className="font-bold text-slate-800">{bucket.totalDemandQty} وحدة</span>
                </div>
                <div>
                  <span className="text-slate-400 block">المخزون المتوقع</span>
                  <span className="font-bold text-emerald-700">{bucket.projectedEndingInventoryQty} وحدة</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MPS Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">مصفوفة جدول الإنتاج الرئيسي (MPS Grid)</h3>
          <span className="text-xs text-slate-400">توزيع الطلب والإنتاج المخطط لكل أسبوع</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/60">
              <tr>
                <th className="px-4 py-3.5">المنتج / البند</th>
                <th className="px-4 py-3.5">حد الأمان</th>
                {weeklyBuckets.map((b) => (
                  <th key={b.weekNumber} className="px-4 py-3.5 text-center">
                    أسبوع {b.weekNumber}
                    <span className="block text-[9px] text-slate-400 font-normal">{b.weekLabel.split('(')[1]?.replace(')', '') || ''}</span>
                  </th>
                ))}
                <th className="px-4 py-3.5 text-center">إجمالي الإنتاج</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.map((item) => {
                const totalPlanned = item.buckets.reduce((acc, b) => acc + b.plannedProductionQty, 0);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      <div>{item.itemName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.itemCode}</div>
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-slate-700">
                      {item.safetyStock} {item.uom}
                    </td>

                    {item.buckets.map((b) => (
                      <td key={b.weekNumber} className="px-4 py-3.5 text-center">
                        {b.plannedProductionQty > 0 ? (
                          <div className="inline-block px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <span className="font-bold text-indigo-700 block">{b.plannedProductionQty} {item.uom}</span>
                            <span className="text-[9px] text-indigo-500">طلب: {b.totalDemandQty}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    ))}

                    <td className="px-4 py-3.5 text-center font-black text-indigo-900 text-sm">
                      {totalPlanned} {item.uom}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
