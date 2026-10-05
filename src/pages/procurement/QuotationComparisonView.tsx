// ====================================================
// REWAQ ERP — SUPPLIER QUOTATIONS & COMPARISON VIEW
// Side-by-Side Matrix, Commercial Evaluation & Winner Selection
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ProcurementService } from '../../services/procurementService';
import { RequestForQuotation, SupplierQuotation } from '../../types/procurement';
import {
  Scale,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Building2,
  Trophy,
  DollarSign,
  Truck,
  ShieldCheck,
  AlertCircle,
  Eye,
  FileText,
  Sparkles,
  ArrowRight,
  ShoppingCart
} from 'lucide-react';

interface QuotationComparisonViewProps {
  initialRFQId?: string;
  onOpenRecordQuote: (rfq?: RequestForQuotation) => void;
  onNavigateToPO: (poId: string) => void;
  onOpenTraceability: (po?: any, pr?: any) => void;
}

export const QuotationComparisonView: React.FC<QuotationComparisonViewProps> = ({
  initialRFQId,
  onOpenRecordQuote,
  onNavigateToPO,
  onOpenTraceability
}) => {
  const {
    rfqs,
    supplierQuotations,
    selectWinningQuotation,
    checkPermission,
    showToast
  } = useERP();

  // Selected RFQ for comparison
  const [selectedRFQId, setSelectedRFQId] = useState<string>(
    initialRFQId || (rfqs.length > 0 ? rfqs[0].id : '')
  );

  // Selection Modal
  const [showSelectWinnerModal, setShowSelectWinnerModal] = useState(false);
  const [selectedQuoteToWin, setSelectedQuoteToWin] = useState<SupplierQuotation | null>(null);
  const [selectionReason, setSelectionReason] = useState('');
  const [autoGeneratePO, setAutoGeneratePO] = useState(true);

  const currentRFQ = rfqs.find(r => r.id === selectedRFQId) || rfqs[0];
  const relatedQuotes = currentRFQ 
    ? supplierQuotations.filter(q => q.rfqId === currentRFQ.id || q.rfqNumber === currentRFQ.rfqNumber)
    : [];

  const comparisonColumns = currentRFQ 
    ? ProcurementService.buildComparisonMatrix(currentRFQ, supplierQuotations)
    : [];

  const canApprove = checkPermission('inventory', 'approve');

  // Find lowest price and fastest delivery among quotes
  let lowestTotal = Infinity;
  let fastestDelivery = Infinity;

  comparisonColumns.forEach(c => {
    if (c.grandTotal < lowestTotal) lowestTotal = c.grandTotal;
    if (c.deliveryLeadTimeDays < fastestDelivery) fastestDelivery = c.deliveryLeadTimeDays;
  });

  const handleOpenWinnerModal = (quote: SupplierQuotation) => {
    setSelectedQuoteToWin(quote);
    setSelectionReason(quote.selectionReason || 'أفضل توازن بين السعر وسرعة التوريد ومطابقة المواصفات الفنية');
    setShowSelectWinnerModal(true);
  };

  const handleConfirmWinner = () => {
    if (!selectedQuoteToWin || !currentRFQ || !selectionReason.trim()) {
      showToast('يرجى كتابة مبرر اختيار المورد المعتمد', 'warning');
      return;
    }

    try {
      const result = selectWinningQuotation(
        currentRFQ.id,
        selectedQuoteToWin.id,
        selectionReason,
        autoGeneratePO
      );

      setShowSelectWinnerModal(false);
      if (result.po) {
        onNavigateToPO(result.po.id);
      }
    } catch (err) {
      showToast('حدث خطأ أثناء اعتماد المورد', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Scale className="w-6 h-6 text-[#C87A38]" />
              <span>مقارنة عروض أسعار الموردين (Quotation Comparison Matrix)</span>
            </h1>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              مقارنة فنية وتجارية
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            مقارنة الأسعار، الخصومات، مدد التوريد، شروط السداد، واختيار المورد الأنسب وتوليد أمر الشراء بضغطة زر
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenRecordQuote(currentRFQ)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل عرض سعر مورد</span>
          </button>
        </div>
      </div>

      {/* RFQ Selector Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 shrink-0">اختر طلب التسعير للمقارنة:</span>
          <select
            value={selectedRFQId}
            onChange={(e) => setSelectedRFQId(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:ring-2 focus:ring-[#361D13]/30 min-w-[260px]"
          >
            {rfqs.map(r => (
              <option key={r.id} value={r.id}>
                {r.rfqNumber} • {r.items[0]?.itemName} ({r.targetSuppliers.length} موردين)
              </option>
            ))}
          </select>
        </div>

        {currentRFQ && (
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>طلب الشراء: <strong className="font-mono text-slate-800">{currentRFQ.purchaseRequestNumber || 'مباشر'}</strong></span>
            <span>•</span>
            <span>المشروع: <strong className="text-indigo-700">{currentRFQ.projectNumber || 'عام'}</strong></span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">{relatedQuotes.length} عروض مستلمة</span>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison Matrix */}
      {relatedQuotes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-3">
          <Scale className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">لم يتم تسجيل أي عروض أسعار لهذا الـ RFQ حتى الآن</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            قم بتسجيل عروض الأسعار المستلمة من الموردين لتبدأ المقارنة التلقائية واختيار العرض الفائز
          </p>
          <button
            onClick={() => onOpenRecordQuote(currentRFQ)}
            className="px-5 py-2.5 bg-[#361D13] hover:bg-[#23120A] text-white rounded-xl font-bold text-xs shadow-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#C87A38]" />
            <span>تسجيل أول عرض سعر</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              
              {/* Table Header: Suppliers Columns */}
              <thead>
                <tr className="bg-[#361D13] text-white divide-x divide-x-reverse divide-[#4A281A]">
                  <th className="py-4 px-4 w-[280px] bg-[#23120A] text-slate-200 font-black">
                    معايير المقارنة الفنية والتجارية
                  </th>
                  {relatedQuotes.map(quote => (
                    <th key={quote.id} className="py-4 px-4 text-center min-w-[240px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1.5">
                          <Building2 className="w-4 h-4 text-[#C87A38]" />
                          <span className="font-black text-sm text-white">{quote.supplierName}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-mono">
                          عرض: {quote.quotationNumber}
                        </div>
                        {quote.status === 'selected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-black shadow-xs">
                            <Trophy className="w-3 h-3" />
                            العرض الفائز المعتمد
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body: Items & Criteria Rows */}
              <tbody className="divide-y divide-slate-100">
                
                {/* 1. Item-by-Item Price Rows */}
                {currentRFQ?.items.map((rfqItem, itemIdx) => (
                  <tr key={rfqItem.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 bg-slate-50 font-bold border-l border-slate-100">
                      <div className="font-black text-slate-900">{rfqItem.itemName}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {rfqItem.itemCode} • مطلوب: {rfqItem.quantity} {rfqItem.uom}
                      </div>
                    </td>

                    {relatedQuotes.map(quote => {
                      const quoteItem = quote.items.find(i => i.itemCode === rfqItem.itemCode || i.itemId === rfqItem.itemId) || quote.items[itemIdx];
                      const unitPrice = quoteItem?.unitPrice || 0;
                      const isLowestUnit = unitPrice > 0 && unitPrice <= Math.min(...relatedQuotes.map(q => q.items[itemIdx]?.unitPrice || Infinity));

                      return (
                        <td key={quote.id} className="py-3.5 px-4 text-center">
                          {quoteItem ? (
                            <div className="space-y-1">
                              <div className="flex items-center justify-center gap-1.5 font-mono">
                                <span className={`font-black text-sm ${isLowestUnit ? 'text-emerald-700' : 'text-slate-900'}`}>
                                  {quoteItem.unitPrice.toLocaleString()} ج.م
                                </span>
                                {isLowestUnit && (
                                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-black">
                                    الأقل سعراً
                                  </span>
                                )}
                              </div>
                              {quoteItem.discountPercent > 0 && (
                                <div className="text-[10px] text-emerald-600 font-bold">
                                  خصم {quoteItem.discountPercent}% ({quoteItem.discountAmount} ج.م)
                                </div>
                              )}
                              <div className="text-[10px] text-slate-400">
                                إجمالي البند: <strong className="text-slate-700">{quoteItem.lineTotal.toLocaleString()} ج.م</strong>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-300 font-bold">غير مشمول</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* 2. Subtotal */}
                <tr className="bg-slate-50/40 font-bold">
                  <td className="py-3 px-4 text-slate-700 border-l border-slate-200">
                    المجموع الفرعي (قبل الضريبة)
                  </td>
                  {relatedQuotes.map(quote => (
                    <td key={quote.id} className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {quote.subtotal.toLocaleString()} ج.م
                    </td>
                  ))}
                </tr>

                {/* 3. Discount Total */}
                <tr>
                  <td className="py-3 px-4 text-slate-700 border-l border-slate-200 font-bold">
                    إجمالي الخصم الممنوح
                  </td>
                  {relatedQuotes.map(quote => (
                    <td key={quote.id} className="py-3 px-4 text-center font-mono text-emerald-600 font-bold">
                      {quote.totalDiscount > 0 ? `-${quote.totalDiscount.toLocaleString()} ج.م` : 'لا يوجد'}
                    </td>
                  ))}
                </tr>

                {/* 4. VAT 14% */}
                <tr>
                  <td className="py-3 px-4 text-slate-700 border-l border-slate-200 font-bold">
                    ضريبة القيمة المضافة (VAT 14%)
                  </td>
                  {relatedQuotes.map(quote => (
                    <td key={quote.id} className="py-3 px-4 text-center font-mono text-slate-600">
                      {quote.taxTotal.toLocaleString()} ج.م
                    </td>
                  ))}
                </tr>

                {/* 5. Shipping & Extra Charges */}
                <tr>
                  <td className="py-3 px-4 text-slate-700 border-l border-slate-200 font-bold">
                    مصاريف الشحن والتعتيق
                  </td>
                  {relatedQuotes.map(quote => (
                    <td key={quote.id} className="py-3 px-4 text-center font-mono text-slate-600">
                      {quote.shippingCost > 0 ? `${quote.shippingCost.toLocaleString()} ج.م` : 'شحن مجاني (على المورد)'}
                    </td>
                  ))}
                </tr>

                {/* 6. Grand Total */}
                <tr className="bg-gradient-to-r from-amber-50/70 via-slate-50 to-amber-50/70 font-black border-y-2 border-slate-200">
                  <td className="py-4 px-4 text-slate-900 text-sm border-l border-slate-200">
                    المبلغ الإجمالي النهائي (Grand Total)
                  </td>
                  {relatedQuotes.map(quote => {
                    const isLowest = quote.grandTotal === lowestTotal;
                    return (
                      <td key={quote.id} className="py-4 px-4 text-center">
                        <div className="font-mono text-lg font-black text-slate-900">
                          {quote.grandTotal.toLocaleString()} ج.م
                        </div>
                        {isLowest && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black">
                            ✓ أقل تكلفة إجمالية
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 7. Delivery Lead Time */}
                <tr>
                  <td className="py-3.5 px-4 text-slate-700 border-l border-slate-200 font-bold">
                    مدة التوريد المتوقعة (Lead Time)
                  </td>
                  {relatedQuotes.map(quote => {
                    const isFastest = quote.deliveryLeadTimeDays === fastestDelivery;
                    return (
                      <td key={quote.id} className="py-3.5 px-4 text-center font-bold">
                        <span className={`inline-flex items-center gap-1 ${isFastest ? 'text-emerald-700 font-black' : 'text-slate-700'}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {quote.deliveryLeadTimeDays} أيام ({quote.expectedDeliveryDate})
                        </span>
                        {isFastest && (
                          <span className="block text-[10px] text-emerald-600 font-black mt-0.5">
                            ⚡ أسرع موعد تسليم
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 8. Payment Terms */}
                <tr>
                  <td className="py-3.5 px-4 text-slate-700 border-l border-slate-200 font-bold">
                    شروط السداد المقترحة
                  </td>
                  {relatedQuotes.map(quote => (
                    <td key={quote.id} className="py-3.5 px-4 text-center text-slate-800 font-bold">
                      {quote.paymentTerms}
                    </td>
                  ))}
                </tr>

                {/* 9. Shipping & Delivery Terms */}
                <tr>
                  <td className="py-3.5 px-4 text-slate-700 border-l border-slate-200 font-bold">
                    شروط ومكان التسليم
                  </td>
                  {relatedQuotes.map(quote => (
                    <td key={quote.id} className="py-3.5 px-4 text-center text-slate-600 text-[11px]">
                      {quote.shippingTerms}
                    </td>
                  ))}
                </tr>

                {/* 10. Selection & PO Conversion Button */}
                <tr className="bg-slate-50/80">
                  <td className="py-4 px-4 text-slate-900 font-black border-l border-slate-200">
                    القرار والاعتماد
                  </td>
                  {relatedQuotes.map(quote => (
                    <td key={quote.id} className="py-4 px-4 text-center">
                      {quote.status === 'selected' ? (
                        <div className="space-y-1.5">
                          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            تم اعتماد هذا العرض
                          </span>
                          {quote.convertedToPoNumber && (
                            <div className="text-[11px] text-slate-500 font-mono">
                              أمر شراء: <strong className="text-slate-800">{quote.convertedToPoNumber}</strong>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenWinnerModal(quote)}
                          className="px-4 py-2 bg-[#361D13] hover:bg-[#23120A] text-white rounded-xl font-black text-xs transition-all shadow-md inline-flex items-center gap-1.5"
                        >
                          <Trophy className="w-4 h-4 text-[#C87A38]" />
                          <span>اختيار هذا المورد</span>
                        </button>
                      )}
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Winner Selection Confirmation Modal */}
      {showSelectWinnerModal && selectedQuoteToWin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">اعتماد العرض الفائز وإصدار أمر الشراء</h3>
                  <p className="text-[11px] text-slate-500">توثيق مبرر اختيار المورد لإحكام الشفافية والرقابة</p>
                </div>
              </div>
              <button
                onClick={() => setShowSelectWinnerModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Selected Quote Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-500">المورد المختار:</span>
                <span className="text-slate-900 font-black">{selectedQuoteToWin.supplierName}</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-500">قيمة العرض الإجمالية:</span>
                <span className="font-mono text-emerald-700 font-black">{selectedQuoteToWin.grandTotal.toLocaleString()} ج.م شامل VAT</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-500">مدة التوريد:</span>
                <span className="text-slate-800">{selectedQuoteToWin.deliveryLeadTimeDays} أيام ({selectedQuoteToWin.expectedDeliveryDate})</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-500">شروط السداد:</span>
                <span className="text-slate-800">{selectedQuoteToWin.paymentTerms}</span>
              </div>
            </div>

            {/* Justification Reason Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                <span>مبرر الاختيار والترسية (إلزامي للتوثيق):</span>
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={selectionReason}
                onChange={(e) => setSelectionReason(e.target.value)}
                placeholder="وضح أسباب اختيار هذا المورد (مثل: أفضل سعر، سرعة التوريد، جودة الخامة وبلد المنشأ، شروط سداد مرنة...)"
                className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#361D13]/30"
              />
            </div>

            {/* Auto Generate PO Checkbox */}
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center gap-3">
              <input
                type="checkbox"
                id="autoPO"
                checked={autoGeneratePO}
                onChange={(e) => setAutoGeneratePO(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="autoPO" className="text-xs font-bold text-indigo-950 cursor-pointer">
                توليد أمر شراء رسمي (PO) تلقائياً بنفس البنود والأسعار والشروط
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSelectWinnerModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmWinner}
                className="px-5 py-2.5 bg-[#361D13] hover:bg-[#23120A] text-white rounded-xl font-black text-xs shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>تأكيد الاختيار وإصدار الـ PO</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
