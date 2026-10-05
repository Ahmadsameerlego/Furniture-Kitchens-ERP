import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  ShoppingCart, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  Layers, 
  Building2,
  CheckCircle2,
  PackageX,
  FileText
} from 'lucide-react';
import { MRPNetRequirement, SupplyProposal } from '../../types/planning';
import { getShortageLevelBadge, calculateBackwardDate } from '../../services/planningService';

interface PlanningShortagesViewProps {
  netRequirements: MRPNetRequirement[];
  onGenerateProposal: (item: MRPNetRequirement) => void;
  onBatchGenerateProposals: () => void;
}

export const PlanningShortagesView: React.FC<PlanningShortagesViewProps> = ({
  netRequirements,
  onGenerateProposal,
  onBatchGenerateProposals,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  // Filter only items with netShortageQty > 0
  const shortageItems = netRequirements.filter(item => item.netShortageQty > 0);

  const filteredShortages = shortageItems.filter(item => {
    const matchesSearch = 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCategory.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === 'all' || item.itemCategory === selectedCategory;
    const matchesSev = selectedSeverity === 'all' || item.coverageStatus === selectedSeverity;

    return matchesSearch && matchesCat && matchesSev;
  });

  const totalShortageValue = shortageItems.reduce((acc, item) => {
    const unitCost = item.itemCode.includes('MDF') ? 1450 : item.itemCode.includes('BLUM') ? 180 : item.itemCode.includes('HPL') ? 2200 : 350;
    return acc + (item.netShortageQty * unitCost);
  }, 0);

  const criticalCount = shortageItems.filter(item => item.coverageStatus === 'shortage').length;

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <PackageX className="w-6 h-6 text-rose-600" />
            مصفوفة عجز ونواقص الخامات (Material Shortages Matrix)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            كشف تحليلي لكافة الخامات ومستلزمات الإنتاج غير المتوفرة بالمخازن والتي تهدد جداول تسليم المشاريع
          </p>
        </div>

        <div className="flex items-center gap-2">
          {shortageItems.length > 0 && (
            <button
              onClick={onBatchGenerateProposals}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              توليد مقترحات توريد للنواقص المحددة ({shortageItems.length})
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">إجمالي بنود العجز بالمصنع</span>
            <span className="text-2xl font-black text-rose-600">{shortageItems.length} بند</span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <PackageX className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">بنود ذات عجز حرج (Critical)</span>
            <span className="text-2xl font-black text-red-700">{criticalCount} بند</span>
          </div>
          <div className="p-3 bg-red-50 text-red-700 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">إجمالي القيمة التقديرية للتوريد</span>
            <span className="text-2xl font-black text-slate-900">{totalShortageValue.toLocaleString()} ج.م</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالخامة، الكود، التصنيف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-slate-700"
          >
            <option value="all">كل التصنيفات (All Categories)</option>
            <option value="ألواح خشبية">ألواح خشبية (MDF / Chipboard)</option>
            <option value="إكسسوارات ومفصلات">إكسسوارات ومفصلات (Hardware)</option>
            <option value="خشب طبيعي">خشب طبيعي (Solid Wood)</option>
            <option value="دهانات وتشطيبات">دهانات وتشطيبات (Finishing)</option>
            <option value="قشاط وحواف">قشاط وحواف (Edge Bands)</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-slate-700"
          >
            <option value="all">كل حالات التغطية</option>
            <option value="shortage">عجز حرج يتطلب تدبير (Shortage)</option>
            <option value="date_risk">خطر تأخر تاريخ الوصول</option>
            <option value="safety_breach">كسر حد الأمان</option>
          </select>
        </div>
      </div>

      {/* Shortages Cards / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredShortages.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl p-12 text-center border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">لا يوجد عجز في الخامات المحددة</h3>
            <p className="text-xs text-slate-500 mt-1">كافة الخامات متوفرة بالمخازن أو مغطاة بأوامر توريد سابقة</p>
          </div>
        ) : (
          filteredShortages.map((item) => {
            const severityMeta = getShortageLevelBadge(item.coverageStatus);
            const unitCost = item.itemCode.includes('MDF') ? 1450 : item.itemCode.includes('BLUM') ? 180 : item.itemCode.includes('HPL') ? 2200 : 350;
            const estimatedCost = item.netShortageQty * unitCost;
            const earliestNeed = item.demandSources[0]?.requiredDate || new Date().toISOString().substring(0, 10);

            return (
              <div 
                key={item.itemId} 
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${severityMeta.color}`}>
                        {severityMeta.label}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{item.itemCode}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{item.itemName}</h4>
                    <span className="text-[11px] text-slate-500">{item.itemCategory}</span>
                  </div>

                  <div className="text-left">
                    <span className="text-xs text-slate-400 block">صافي العجز المطلوب</span>
                    <span className="text-lg font-black text-rose-600">{item.netShortageQty} {item.uom}</span>
                  </div>
                </div>

                {/* Breakdown Grid */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">إجمالي الطلب</span>
                    <span className="font-bold text-slate-800">{item.grossDemandQty} {item.uom}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">المتاح الحر</span>
                    <span className="font-bold text-emerald-700">{item.availableFreeStock} {item.uom}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">القيمة التقديرية</span>
                    <span className="font-bold text-slate-900">{estimatedCost.toLocaleString()} ج.م</span>
                  </div>
                </div>

                {/* Timing & Action */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-amber-700 font-medium text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>تاريخ الحاجة: <strong>{earliestNeed}</strong></span>
                  </div>

                  <button
                    onClick={() => onGenerateProposal(item)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>إصدار مقترح توريد</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
