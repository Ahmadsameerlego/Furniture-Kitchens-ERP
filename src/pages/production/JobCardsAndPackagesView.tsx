import React from 'react';
import { ProductionOrder } from '../../types/erp';
import { ManufacturingPackageItem } from '../../types/production';
import {
  FileText,
  Printer,
  Package,
  QrCode,
  Truck,
  CheckCircle2,
  Boxes,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';

interface JobCardsAndPackagesViewProps {
  orders: ProductionOrder[];
  packages: ManufacturingPackageItem[];
  onOpenJobCard: (order: ProductionOrder) => void;
  onOpenPackageLabels: (order: ProductionOrder) => void;
  onSelectOrder: (order: ProductionOrder) => void;
}

export const JobCardsAndPackagesView: React.FC<JobCardsAndPackagesViewProps> = ({
  orders,
  packages,
  onOpenJobCard,
  onOpenPackageLabels,
  onSelectOrder
}) => {
  return (
    <div className="space-y-6">
      
      {/* 1. Job Cards Section */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black text-slate-900">بطاقات وكروت توجيه الورشة (Workshop Job Cards)</h3>
            <p className="text-xs text-slate-500">طباعة بطاقات التشغيل الورقية المرفقة مع الخامات لأسطوات التقطيع والتجميع</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all space-y-3"
            >
              <div className="flex justify-between items-start">
                <span className="font-mono font-bold text-xs text-[#C87A38] bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                  {order.productionNumber}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">مشروع: {order.projectNumber}</span>
              </div>

              <div>
                <h4 className="font-black text-xs text-slate-900">{order.customerName}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{order.notes || 'تجهيز المطبخ طبقاً للمقايسة المعتمدة'}</p>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                <span>الخامات: <strong>{order.materials.length} صنف</strong></span>
                <span className="text-rose-600 font-bold">{order.expectedCompletionDate}</span>
              </div>

              <button
                onClick={() => onOpenJobCard(order)}
                className="w-full py-2 bg-[#361D13] hover:bg-[#26150D] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4 text-[#C87A38]" />
                <span>طباعة كارت التشغيل والـ Cut-List</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Packaging & Shipping Boxes Staging */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black text-slate-900">حزم التغليف والطرود الجاهزة للتحميل (Packaging & Shipping Kits)</h3>
            <p className="text-xs text-slate-500">تكوين الطرود وترقيم الكراتين وتوليد ملصقات الباركود لمهندس التركيبات بالموقع</p>
          </div>
          <button
            onClick={() => onOpenPackageLabels(orders[0])}
            className="px-4 py-2 bg-[#C87A38] hover:bg-[#DB8D48] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Package className="w-4 h-4" />
            <span>طباعة ملصقات الطرود (Bulk Print)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#C87A38] transition-all space-y-3 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                  {pkg.packageCode}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  مغلف ومفحوص ✅
                </span>
              </div>

              <div>
                <h5 className="font-black text-xs text-slate-900 line-clamp-1">{pkg.title}</h5>
                <span className="text-[11px] text-slate-500 block mt-0.5">الأبعاد: {pkg.dimensions}</span>
                <span className="text-[11px] font-mono font-bold text-slate-700 block">الوزن: {pkg.weightKg} كجم</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl text-[10px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-700 block">المحتويات:</span>
                {pkg.itemsContained.map((it, idx) => (
                  <div key={idx} className="truncate">• {it}</div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-400">
                <span>{pkg.qrCode}</span>
                <span className="text-emerald-600 font-bold">جاهز للشحن</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
