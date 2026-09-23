import React from 'react';
import { ProductionOrder, Material } from '../../types/erp';
import {
  Printer,
  X,
  Factory,
  User,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Building2,
  Wrench,
  Check
} from 'lucide-react';

interface WorkshopJobCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ProductionOrder;
  materialsList: Material[];
}

export const WorkshopJobCardModal: React.FC<WorkshopJobCardModalProps> = ({
  isOpen,
  onClose,
  order,
  materialsList
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:fixed-none">
      <div className="relative w-full max-w-4xl my-auto bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto custom-scrollbar print:max-h-none print:overflow-visible print:border-none print:p-0 print:shadow-none">
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="print:hidden flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#361D13] text-white flex items-center justify-center font-bold">
              <Factory className="w-5 h-5 text-[#C87A38]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">أمر تشغيل وقص الورشة (Workshop Job Card)</h3>
              <p className="text-[11px] text-slate-500">بطاقة توجيه الفنيين وقائمة تقطيع الألواح وتجميع الكابينات</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#C87A38] hover:bg-[#DB8D48] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة أمر التشغيل للورشة</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE JOB CARD SHEET */}
        <div className="space-y-4 text-xs font-sans text-slate-900">
          
          {/* Header */}
          <div className="border-b-2 border-[#361D13] pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="Furniture Land Logo"
                className="w-14 h-14 rounded-full object-cover border border-[#361D13]"
              />
              <div>
                <h1 className="text-xl font-black text-[#361D13] font-sans">FURNITURE LAND</h1>
                <p className="text-[10px] font-bold text-[#C87A38] uppercase tracking-widest">
                  Natural Home • قسم إدارة الإنتاج والتشغيل
                </p>
                <span className="text-[10px] text-slate-500">أمر تشغيل ورشة نجارة ومطابخ معتمد</span>
              </div>
            </div>

            <div className="text-left bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block">رقم أمر التشغيل:</span>
              <span className="font-mono text-sm font-black text-[#361D13] block">{order.productionNumber}</span>
              <span className="text-[9px] text-slate-400 font-mono">أمر البيع: {order.orderNumber}</span>
            </div>
          </div>

          {/* Job Overview Information Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block">اسم العميل:</span>
              <span className="font-black text-slate-900 text-xs block truncate">{order.customerName}</span>
              <span className="text-[10px] text-slate-500 font-mono">{order.customerPhone}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block">موقع الورشة المسؤولة:</span>
              <span className="font-black text-slate-900 text-xs block truncate">{order.workshopLocation}</span>
              <span className="text-[10px] text-slate-500">{order.branchName}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block">تاريخ البدء والتسليم:</span>
              <span className="font-bold text-slate-900 text-xs block font-mono">بدء: {order.startDate}</span>
              <span className="font-bold text-[#C87A38] text-[10px] font-mono">تسليم: {order.expectedCompletionDate}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block">فريق العمل المكلف:</span>
              <span className="font-bold text-slate-900 text-[11px] block truncate">
                {order.assignedTeam.join(', ') || 'فريق النجارة العام'}
              </span>
              <span className="text-[9px] text-emerald-700 font-bold">فنيين معتمدين</span>
            </div>
          </div>

          {/* Technical Instructions & Notes */}
          {order.notes && (
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-amber-950 font-medium">
              <span className="font-black block mb-0.5">⚠️ تعليمات ومواصفات النجارة والتقطيع:</span>
              <p className="text-[11px]">{order.notes}</p>
            </div>
          )}

          {/* Bill of Materials (Cutting & Assembly List) */}
          <div className="space-y-1">
            <h4 className="font-black text-xs text-slate-900 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#C87A38]" />
              <span>قائمة الخامات ومستلزمات القص والتجميع (Cutting & Hardware BOM):</span>
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#361D13] text-white font-bold text-[11px]">
                  <tr>
                    <th className="p-2 text-right">م</th>
                    <th className="p-2 text-right">كود واسم الخامة / اللوح</th>
                    <th className="p-2 text-center">الكمية المطلوبة</th>
                    <th className="p-2 text-center">المصروف للورشة</th>
                    <th className="p-2 text-center">المتبقي</th>
                    <th className="p-2 text-center">الحالة والموقع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white font-medium">
                  {order.materials.map((m, idx) => {
                    const isShortage = m.status === 'shortage';
                    return (
                      <tr key={m.id} className={isShortage ? 'bg-rose-50 font-bold' : ''}>
                        <td className="p-2 text-slate-500 font-mono text-center w-8">{idx + 1}</td>
                        <td className="p-2 font-bold text-slate-900">
                          {m.materialName}
                          <span className="text-[10px] text-slate-500 font-mono block">{m.materialCode}</span>
                        </td>
                        <td className="p-2 text-center font-mono font-bold">{m.requiredQuantity} {m.unit}</td>
                        <td className="p-2 text-center font-mono text-emerald-700 font-bold">{m.consumedQuantity} {m.unit}</td>
                        <td className="p-2 text-center font-mono text-amber-800 font-bold">{m.remainingQuantity} {m.unit}</td>
                        <td className="p-2 text-center">
                          {isShortage ? (
                            <span className="bg-rose-100 text-rose-900 text-[10px] font-black px-2 py-0.5 rounded">عجز بالمخزن</span>
                          ) : m.status === 'consumed' ? (
                            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">تم الصرف للورشة</span>
                          ) : m.status === 'reserved' ? (
                            <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded">محجوز بالمخزن</span>
                          ) : (
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">جاهز للصرف</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Workflow Signatures Matrix */}
          <div className="pt-4 border-t border-slate-200">
            <h5 className="font-bold text-[11px] text-slate-500 mb-2">محطات المتابعة والتوقيعات الفنية بالورشة:</h5>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-6">
                <span className="text-[10px] font-bold text-slate-700 block">1. استلام الخامات من المخزن</span>
                <span className="text-[9px] text-slate-400 block">التوقيع: .....................</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-6">
                <span className="text-[10px] font-bold text-slate-700 block">2. انتهاء القص وشريط PVC</span>
                <span className="text-[9px] text-slate-400 block">التوقيع: .....................</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-6">
                <span className="text-[10px] font-bold text-slate-700 block">3. التجميع وتركيب المفصلات</span>
                <span className="text-[9px] text-slate-400 block">التوقيع: .....................</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-6">
                <span className="text-[10px] font-bold text-slate-700 block">4. فحص الجودة والتغليف (QC)</span>
                <span className="text-[9px] text-slate-400 block">التوقيع: .....................</span>
              </div>
            </div>
          </div>

          {/* Footer Quality Stamp */}
          <div className="pt-2 text-center text-[10px] text-slate-400">
            وثيقة تشغيل داخلية معتمدة من نظام Furniture Land ERP • يرجى إرفاق هذا النموذج مع الوحدات المصنعة أثناء النقل للموقع
          </div>

        </div>

      </div>
    </div>
  );
};
