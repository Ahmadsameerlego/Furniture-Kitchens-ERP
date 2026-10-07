// ====================================================
// REWAQ ERP — PROCUREMENT TRACEABILITY EXPLORER MODAL
// End-to-End Chain: Project -> BOM -> MRP -> PR -> RFQ -> Quote -> PO -> GRN -> Invoice -> Payment
// ====================================================

import React from 'react';
import {
  X,
  CheckCircle2,
  ArrowDown,
  Layers,
  Cpu,
  FileText,
  Send,
  Scale,
  ShoppingCart,
  Truck,
  Receipt,
  CreditCard,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { EnterprisePurchaseOrder, PurchaseRequest, RequestForQuotation, SupplierQuotation } from '../../../types/procurement';

interface ProcurementTraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPO?: EnterprisePurchaseOrder | null;
  selectedPR?: PurchaseRequest | null;
}

export const ProcurementTraceabilityModal: React.FC<ProcurementTraceabilityModalProps> = ({
  isOpen,
  onClose,
  selectedPO,
  selectedPR
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      id: 'step-1',
      stepNumber: '01',
      title: 'مشروع العميل والتعاقد (Customer Project)',
      titleEn: 'Customer Project & Contract',
      icon: Building2,
      color: 'border-blue-500 bg-blue-50 text-blue-700',
      badge: selectedPO?.projectNumber || selectedPR?.projectNumber || 'PRJ-2026-001',
      details: [
        { label: 'اسم المشروع', value: selectedPO?.projectName || selectedPR?.projectName || 'مطبخ مودرن أرو ومايكا - فيلا الياسمين' },
        { label: 'العميل', value: selectedPO?.customerName || selectedPR?.customerName || '—' },
        { label: 'رقم العقد', value: selectedPO?.contractNumber || selectedPR?.contractNumber || 'CNT-2026-008' }
      ]
    },
    {
      id: 'step-2',
      stepNumber: '02',
      title: 'المكتب الفني والـ BOM (Technical BOM Release)',
      titleEn: 'Engineering BOM Release',
      icon: Layers,
      color: 'border-cyan-500 bg-cyan-50 text-cyan-700',
      badge: selectedPR?.technicalReleaseNumber || 'REL-2026-001',
      details: [
        { label: 'حزمة الإفراج', value: 'REL-2026-001 (BOM REV-01)' },
        { label: 'الاحتياج الإجمالي', value: '100 لوح MDF أبيض 18مم + 100 مفصلة Blum' },
        { label: 'الحالة', value: 'معتمد من مهندس المكتب الفني ومفرغ للتخطيط' }
      ]
    },
    {
      id: 'step-3',
      stepNumber: '03',
      title: 'التخطيط ومحرك الـ MRP (Planning & Shortage)',
      titleEn: 'MRP Net Requirements',
      icon: Cpu,
      color: 'border-purple-500 bg-purple-50 text-purple-700',
      badge: selectedPR?.sourceReference || 'PROP-PO-2026-001',
      details: [
        { label: 'معادلة الحساب', value: 'المطلوب (100) - الرصيد الحر (30) = عجز صافي (70 لوح)' },
        { label: 'مقترح التوريد', value: 'PROP-PO-2026-001 (شراء 70 لوح MDF)' },
        { label: 'تاريخ الحاجة بالمصنع', value: selectedPR?.requiredDate || '2026-09-02' }
      ]
    },
    {
      id: 'step-4',
      stepNumber: '04',
      title: 'طلب الشراء المعتمد (Purchase Request)',
      titleEn: 'Approved Purchase Request (PR)',
      icon: FileText,
      color: 'border-indigo-500 bg-indigo-50 text-indigo-700',
      badge: selectedPO?.purchaseRequestNumber || selectedPR?.prNumber || 'PR-2026-001',
      details: [
        { label: 'رقم طلب الشراء', value: selectedPO?.purchaseRequestNumber || selectedPR?.prNumber || 'PR-2026-001' },
        { label: 'طالب الشراء', value: selectedPR?.requesterName || 'م. خالد توفيق (التخطيط)' },
        { label: 'حالة الاعتماد', value: 'معتمد رسمياً من مدير المشتريات' }
      ]
    },
    {
      id: 'step-5',
      stepNumber: '05',
      title: 'طلب عروض الأسعار (RFQ)',
      titleEn: 'Request For Quotation (RFQ)',
      icon: Send,
      color: 'border-sky-500 bg-sky-50 text-sky-700',
      badge: selectedPO?.rfqNumber || 'RFQ-2026-001',
      details: [
        { label: 'رقم الـ RFQ', value: selectedPO?.rfqNumber || 'RFQ-2026-001' },
        { label: 'الموردون المدعوون', value: 'شركة الأخشاب العالمية / المودرن / المصرية' },
        { label: 'مهلة الرد', value: '23-08-2026 (وردت جميع العروض)' }
      ]
    },
    {
      id: 'step-6',
      stepNumber: '06',
      title: 'مقارنة العروض واختيار المورد (Quotation Comparison)',
      titleEn: 'Quotation Comparison & Selection',
      icon: Scale,
      color: 'border-amber-500 bg-amber-50 text-amber-700',
      badge: selectedPO?.supplierQuotationNumber || 'QUOT-GT-4091',
      details: [
        { label: 'المورد الفائز', value: selectedPO?.supplierName || 'شركة الأخشاب العالمية وشركاه' },
        { label: 'السعر المعتمد', value: '1,220 ج.م للوح (-2% خصم) + VAT 14%' },
        { label: 'مبرر الاختيار', value: 'أسرع توريد (5 أيام) + جودة Finsa الإسبانية المعتمدة' }
      ]
    },
    {
      id: 'step-7',
      stepNumber: '07',
      title: 'أمر الشراء الرسمي (Purchase Order)',
      titleEn: 'Formal Purchase Order (PO)',
      icon: ShoppingCart,
      color: 'border-blue-600 bg-blue-50 text-blue-800',
      badge: selectedPO?.poNumber || 'PO-2026-001',
      details: [
        { label: 'رقم أمر الشراء', value: selectedPO?.poNumber || 'PO-2026-001' },
        { label: 'القيمة الإجمالية', value: `${(selectedPO?.grandTotal || 105556.88).toLocaleString()} ج.م شامل الضريبة` },
        { label: 'حالة الأمر', value: 'معتمد ومرسل للمورد وجاري التوريد' }
      ]
    },
    {
      id: 'step-8',
      stepNumber: '08',
      title: 'الاستلام المخزني الفعلي (Goods Receipt Note)',
      titleEn: 'Inventory GRN Receipts',
      icon: Truck,
      color: 'border-emerald-500 bg-emerald-50 text-emerald-700',
      badge: selectedPO?.receiptNotes[0]?.grnNumber || 'GRN-2026-0089',
      details: [
        { label: 'الدفعة الأولى', value: 'استلام 40 لوح MDF + 100 مفصلة (GRN-2026-0089)' },
        { label: 'الدفعة الثانية', value: 'استلام 30 لوح MDF (مستهدف 29-08-2026)' },
        { label: 'المستودع', value: selectedPO?.warehouseName || 'المخزن المركزي - العاشر' }
      ]
    },
    {
      id: 'step-9',
      stepNumber: '09',
      title: 'فاتورة المورد والمطابقة الثلاثية (Invoice & 3-Way Match)',
      titleEn: 'Vendor Bill & 3-Way Match',
      icon: Receipt,
      color: 'border-teal-500 bg-teal-50 text-teal-700',
      badge: selectedPO?.vendorBills[0]?.billNumber || 'BILL-2026-0034',
      details: [
        { label: 'فاتورة المورد', value: 'INV-GT-9011 (52,778.44 ج.م)' },
        { label: 'المطابقة الثلاثية', value: '3WM: تطابق كامل 100% بين PO و GRN والفاتورة' },
        { label: 'الحالة المحاسبية', value: 'مرحلة بحساب المورد (AP 2111) وتسوية GR/IR' }
      ]
    },
    {
      id: 'step-10',
      stepNumber: '10',
      title: 'سداد المورد والخزينة (Finance Payment)',
      titleEn: 'Finance & Treasury Settlement',
      icon: CreditCard,
      color: 'border-emerald-600 bg-emerald-50 text-emerald-800',
      badge: 'PAY-SUP-2026-018',
      details: [
        { label: 'الدفعة المقدمة', value: '52,778.44 ج.م (تحويل بنكي - البنك الأهلي)' },
        { label: 'الدفعة المتبقية', value: 'تستحق عند اكتمال توريد الدفعة الثانية بالمخزن' },
        { label: 'الحالة', value: 'مسددة بنجاح وموثقة بالقيود المحاسبية' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#361D13] to-[#23120A] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C87A38]/20 border border-[#C87A38]/40 flex items-center justify-center text-[#C87A38]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                مستكشف التتبع وسلسلة الإمداد الكاملة (Full Traceability Explorer)
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                تتبع دورة حياة الشراء من منشأ الطلب الهندسي بالمشروع حتى الاستلام المخزني والسداد المالي
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Traceability Flow */}
        <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-6">
          
          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl p-4 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-amber-700" />
              <div>
                <h4 className="text-xs font-black text-amber-900">سلسلة إمداد محكمة وغير مكررة</h4>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  التخطيط يحدد <strong>ماذا</strong> نشتري • المشتريات تحدد <strong>من أين وبكم</strong> • المخازن تثبت <strong>ما وصل</strong> • الحسابات تثبت <strong>الأثر المالي</strong>
                </p>
              </div>
            </div>
            <span className="text-xs font-black px-3 py-1 bg-amber-200/80 text-amber-900 rounded-full">
              10 مراحل موثقة
            </span>
          </div>

          {/* Vertical Stepper */}
          <div className="relative pl-4 pr-2 space-y-6">
            <div className="absolute right-7 top-4 bottom-4 w-0.5 bg-slate-200" />

            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative flex items-start gap-4">
                  {/* Step Icon */}
                  <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center shrink-0 z-10 shadow-xs ${step.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-[#C87A38]/50 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400 font-mono">{step.stepNumber}.</span>
                        <h4 className="text-sm font-black text-slate-900">{step.title}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-lg self-start sm:self-auto border border-slate-200">
                        {step.badge}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {step.details.map((d, dIdx) => (
                        <div key={dIdx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block">{d.label}</span>
                          <span className="text-xs font-black text-slate-800 mt-0.5 block">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#361D13] hover:bg-[#23120A] text-white rounded-xl font-black text-xs transition-colors shadow-sm"
          >
            إغلاق المستكشف
          </button>
        </div>
      </div>
    </div>
  );
};
