import React from 'react';
import { ProductionOrder } from '../../types/erp';
import { WorkOrder } from '../../types/production';
import {
  Printer,
  X,
  Factory,
  User,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Ruler,
  Clock,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';

interface JobCardPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ProductionOrder;
  workOrders?: WorkOrder[];
}

export const JobCardPrintModal: React.FC<JobCardPrintModalProps> = ({
  isOpen,
  onClose,
  order,
  workOrders = []
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const relatedWOs = workOrders.filter(w => w.manufacturingOrderId === order.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:fixed-none">
      <div className="relative w-full max-w-4xl my-auto bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto custom-scrollbar print:max-h-none print:overflow-visible print:border-none print:p-0 print:shadow-none">
        
        {/* Top Controls Bar (Hidden in Print) */}
        <div className="print:hidden flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#361D13] text-white flex items-center justify-center font-bold">
              <Factory className="w-5 h-5 text-[#C87A38]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">كارت تشغيل وتوجيه الورشة (Shopfloor Job Card)</h3>
              <p className="text-xs text-slate-500">بطاقة توجيه المحطات وقائمة تقطيع الألواح وتجميع الكبائن</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#C87A38] hover:bg-[#DB8D48] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كارت التشغيل</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="space-y-6 text-slate-800">
          
          {/* Header Banner */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-[#361D13]">مصنع الخشب والمطابخ الذكي</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300">
                  كارت تشغيل عنبر
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1">
                أمر تشغيل: {order.productionNumber}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                مشروع رقم: <span className="font-bold text-slate-800">{order.projectNumber}</span> — كود العميل: <span className="font-bold text-slate-800">{order.customerName}</span>
              </p>
            </div>

            {/* Simulated Barcode & QR */}
            <div className="text-center p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="font-mono text-xs font-bold tracking-widest text-slate-700">*{order.productionNumber}*</div>
              <div className="w-24 h-6 bg-slate-900 mx-auto my-1 flex items-center justify-center text-[9px] text-white font-mono tracking-tighter">
                || | ||| || ||| | ||
              </div>
              <span className="text-[10px] text-slate-500 font-medium">امسح لتسجيل البدء</span>
            </div>
          </div>

          {/* Project & Scheduling Info Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">العميل والموقع:</span>
              <span className="font-bold text-slate-900">{order.customerName}</span>
              <span className="text-[11px] text-slate-500 block">{order.customerPhone}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">الفرع المسؤول:</span>
              <span className="font-bold text-slate-900">{order.branchName}</span>
              <span className="text-[11px] text-slate-500 block">{order.workshopLocation}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">تاريخ البدء المخطط:</span>
              <span className="font-bold text-slate-900">{order.startDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">تاريخ التسليم النهائي:</span>
              <span className="font-bold text-rose-600">{order.expectedCompletionDate}</span>
            </div>
          </div>

          {/* Routing Steps / Operations Table */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#C87A38]" />
              <span>1. مسار محطات التشغيل (Work Center Routing)</span>
            </h4>
            <table className="w-full text-xs text-right border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2 text-center w-10">#</th>
                  <th className="p-2">المرحلة والعملية</th>
                  <th className="p-2">مركز التشغيل / الماكينة</th>
                  <th className="p-2 text-center">المدة المخططة</th>
                  <th className="p-2 text-center">الفني المسؤول</th>
                  <th className="p-2 text-center">توقيع الاستلام والفحص</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {relatedWOs.length > 0 ? (
                  relatedWOs.map((wo, idx) => (
                    <tr key={wo.id} className="hover:bg-slate-50">
                      <td className="p-2 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-2 font-bold text-slate-900">{wo.operationName}</td>
                      <td className="p-2 text-slate-600">{wo.workCenterName}</td>
                      <td className="p-2 text-center font-mono">{wo.plannedDurationMinutes} دقيقة</td>
                      <td className="p-2 text-center text-slate-700">{wo.assignedTechnicians.join(', ')}</td>
                      <td className="p-2 text-center">
                        <div className="w-20 h-5 border border-dashed border-slate-300 rounded mx-auto flex items-center justify-center text-[10px] text-slate-400">
                          {wo.status === 'completed' ? '✅ معتمد' : '________'}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 text-center font-bold">1</td>
                      <td className="p-2 font-bold">عنبر التقطيع والـ CNC</td>
                      <td className="p-2">ماكينة Biesse Rover</td>
                      <td className="p-2 text-center font-mono">180 دقيقة</td>
                      <td className="p-2 text-center">مشرف الـ CNC</td>
                      <td className="p-2 text-center text-slate-400">________</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 text-center font-bold">2</td>
                      <td className="p-2 font-bold">عنبر لزق شريط الحرف</td>
                      <td className="p-2">ماكينة Homag</td>
                      <td className="p-2 text-center font-mono">120 دقيقة</td>
                      <td className="p-2 text-center">فني القشاط</td>
                      <td className="p-2 text-center text-slate-400">________</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 text-center font-bold">3</td>
                      <td className="p-2 font-bold">عنبر التخريم والفرز</td>
                      <td className="p-2">ماكينة Vitap</td>
                      <td className="p-2 text-center font-mono">90 دقيقة</td>
                      <td className="p-2 text-center">فني التخريم</td>
                      <td className="p-2 text-center text-slate-400">________</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center font-bold">4</td>
                      <td className="p-2 font-bold">عنبر التجميع والتغليف</td>
                      <td className="p-2">صالة التجميع الرئيسية</td>
                      <td className="p-2 text-center font-mono">240 دقيقة</td>
                      <td className="p-2 text-center">رئيس النجارين</td>
                      <td className="p-2 text-center text-slate-400">________</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* BOM & Materials Required for this MO */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#C87A38]" />
              <span>2. بيان الخامات والمستلزمات المنصرفة من المخزن (BOM)</span>
            </h4>
            <table className="w-full text-xs text-right border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2">كود الخامة</th>
                  <th className="p-2">اسم الخامة والمواصفة</th>
                  <th className="p-2 text-center">الوحدة</th>
                  <th className="p-2 text-center">الكمية المطلوبة</th>
                  <th className="p-2 text-center">المنصرف الفعلي</th>
                  <th className="p-2 text-center">حالة الصرف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {order.materials.map(mat => (
                  <tr key={mat.id} className="hover:bg-slate-50">
                    <td className="p-2 font-mono text-[11px] text-slate-600">{mat.materialCode}</td>
                    <td className="p-2 font-bold text-slate-900">{mat.materialName}</td>
                    <td className="p-2 text-center text-slate-600">{mat.unit}</td>
                    <td className="p-2 text-center font-bold text-slate-800">{mat.requiredQuantity}</td>
                    <td className="p-2 text-center font-bold text-emerald-700">{mat.consumedQuantity}</td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        mat.consumedQuantity >= mat.requiredQuantity
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {mat.consumedQuantity >= mat.requiredQuantity ? 'تم الصرف بالكامل' : 'صرف جزئي'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Technical Office Notes & Instructions */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-1">
            <span className="font-bold text-amber-900 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              تعليمات فنية هامة من المكتب الفني:
            </span>
            <p className="text-amber-800 leading-relaxed">
              {order.notes || 'يجب الالتزام بجدول التقطيع V1، مراعاة تركيب ميكانيزم الأدراج الهيدروليك بلوم، والتأكد من استقامة الزوايا 90 درجة قبل الانتقال لمرحلة التغليف.'}
            </p>
          </div>

          {/* Signatures & Quality Approval */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-slate-900 text-xs">
            <div className="text-center">
              <span className="text-slate-500 font-medium block">مشرف الإنتاج والورش:</span>
              <div className="h-10 border-b border-dashed border-slate-300 mt-2"></div>
              <span className="text-[11px] text-slate-400">التوقيع والتاريخ</span>
            </div>
            <div className="text-center">
              <span className="text-slate-500 font-medium block">مسؤول مراقبة الجودة (QC):</span>
              <div className="h-10 border-b border-dashed border-slate-300 mt-2"></div>
              <span className="text-[11px] text-slate-400">ختم اعتماد الجودة</span>
            </div>
            <div className="text-center">
              <span className="text-slate-500 font-medium block">مهندس استلام التركيبات:</span>
              <div className="h-10 border-b border-dashed border-slate-300 mt-2"></div>
              <span className="text-[11px] text-slate-400">استلام الطرود جاهزة للتحميل</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
