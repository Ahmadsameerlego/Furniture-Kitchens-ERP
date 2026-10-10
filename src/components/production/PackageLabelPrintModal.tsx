import React from 'react';
import { ProductionOrder } from '../../types/erp';
import { ManufacturingPackageItem } from '../../types/production';
import {
  Printer,
  X,
  Package,
  QrCode,
  Truck,
  CheckCircle2,
  Calendar,
  Building2
} from 'lucide-react';

interface PackageLabelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ProductionOrder;
  packages: ManufacturingPackageItem[];
}

export const PackageLabelPrintModal: React.FC<PackageLabelPrintModalProps> = ({
  isOpen,
  onClose,
  order,
  packages
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const relatedPackages = packages.filter(p => p.manufacturingOrderId === order.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:fixed-none">
      <div className="relative w-full max-w-3xl my-auto bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto custom-scrollbar print:max-h-none print:overflow-visible print:border-none print:p-0 print:shadow-none">
        
        {/* Top Controls */}
        <div className="print:hidden flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#361D13] text-white flex items-center justify-center font-bold">
              <Package className="w-5 h-5 text-[#C87A38]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">طباعة ملصقات الطرود والكراتين (Package Labels)</h3>
              <p className="text-xs text-slate-500">ملصقات باركود تُلصق على الكراتين للتحميل والتركيب بموقع العميل</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#C87A38] hover:bg-[#DB8D48] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كل الملصقات ({relatedPackages.length})</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Labels Grid */}
        <div className="space-y-6">
          {relatedPackages.map((pkg, idx) => (
            <div
              key={pkg.id}
              className="p-5 border-2 border-slate-900 rounded-2xl bg-white space-y-4 page-break-inside-avoid print:mb-8"
            >
              {/* Header Label */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    مصنع المطابخ والأثاث الراقي — طرد شحن وتركيب
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    {pkg.title}
                  </h3>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">
                    كود الطرد: <span className="font-mono text-[#C87A38]">{pkg.packageCode}</span>
                  </p>
                </div>

                {/* Simulated QR Code */}
                <div className="text-center p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-14 h-14 bg-slate-900 mx-auto rounded-lg flex items-center justify-center text-white text-[10px] font-mono">
                    [QR CODE]
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 mt-1 block">{pkg.qrCode}</span>
                </div>
              </div>

              {/* Order & Client Info */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">أمر الإنتاج والمشروع:</span>
                  <span className="font-bold text-slate-900">{order.productionNumber}</span>
                  <span className="text-[11px] text-slate-500 block">{order.projectNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">اسم العميل ورقم هاتفه:</span>
                  <span className="font-bold text-slate-900">{order.customerName}</span>
                  <span className="text-[11px] text-slate-500 block">{order.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">الأبعاد والوزن:</span>
                  <span className="font-bold text-slate-900">{pkg.dimensions}</span>
                  <span className="text-[11px] text-slate-500 block font-mono font-bold">الوزن: {pkg.weightKg} كجم</span>
                </div>
              </div>

              {/* Items Contained Checklist */}
              <div>
                <span className="text-[11px] font-black text-slate-700 block mb-1">
                  محتويات هذا الطرد (للمطابقة بواسطة فني التركيب بالموقع):
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  {pkg.itemsContained.map((item, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-slate-800 bg-slate-100/70 px-2 py-1 rounded-lg">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Verification barcode footer */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-[10px] text-slate-400">
                <span>تاريخ التغليف والفحص: {order.startDate}</span>
                <span className="font-mono font-bold text-slate-700">BOX {idx + 1} OF {relatedPackages.length}</span>
                <span>فحص بواسطة: م. وليد عبد الحميد (QC PASS)</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
