// ====================================================
// REWAQ ERP — PROCUREMENT & PURCHASING SERVICE
// Business Logic, 3-Way Matching, Traceability & Calculations
// ====================================================

import {
  PurchaseRequest,
  PRStatus,
  PRPriority,
  RequestForQuotation,
  RFQStatus,
  SupplierQuotation,
  SupplierQuotationStatus,
  EnterprisePurchaseOrder,
  POStatus,
  POReceivingStatus,
  POPaymentStatus,
  SupplierItemPrice,
  ProcurementSupplierReturn,
  SupplierReturnStatus,
  ThreeWayMatchingRecord,
  MatchingResultStatus,
  QuotationComparisonColumn,
  ProcurementDashboardKPIs
} from '../types/procurement';
import { Supplier, GoodsReceiptNote } from '../types/erp';
import { VendorBill } from '../types/accounting';

export class ProcurementService {
  // ----------------------------------------------------
  // 1. BADGE & FORMATTING UTILITIES
  // ----------------------------------------------------

  static getPRStatusBadge(status: PRStatus): { label: string; labelEn: string; bg: string; text: string; border: string } {
    switch (status) {
      case 'draft':
        return { label: 'مسودة', labelEn: 'Draft', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
      case 'pending_approval':
        return { label: 'بانتظار الاعتماد', labelEn: 'Pending Approval', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'approved':
        return { label: 'معتمد للتسعير والشراء', labelEn: 'Approved', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'partially_processed':
        return { label: 'معالج جزئياً (RFQ/PO)', labelEn: 'Partially Processed', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
      case 'fully_processed':
        return { label: 'مكتمل ومعالج بأمر شراء', labelEn: 'Fully Processed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'rejected':
        return { label: 'مرفوض', labelEn: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
      case 'cancelled':
        return { label: 'ملغي', labelEn: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      default:
        return { label: status, labelEn: status, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
    }
  }

  static getRFQStatusBadge(status: RFQStatus): { label: string; labelEn: string; bg: string; text: string; border: string } {
    switch (status) {
      case 'draft':
        return { label: 'مسودة RFQ', labelEn: 'Draft', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
      case 'sent':
        return { label: 'تم الإرسال للموردين', labelEn: 'Sent to Suppliers', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
      case 'partially_responded':
        return { label: 'عروض مستلمة جزئياً', labelEn: 'Partially Quoted', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'fully_responded':
        return { label: 'عروض كاملة بانتظار المقارنة', labelEn: 'Fully Quoted', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
      case 'comparison_completed':
        return { label: 'تمت المقارنة واختيار المورد', labelEn: 'Winner Selected', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
      case 'closed':
        return { label: 'مغلق ومحول لأمر شراء', labelEn: 'Closed / PO Created', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'cancelled':
        return { label: 'ملغي', labelEn: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
      default:
        return { label: status, labelEn: status, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
    }
  }

  static getQuotationStatusBadge(status: SupplierQuotationStatus): { label: string; labelEn: string; bg: string; text: string; border: string } {
    switch (status) {
      case 'received':
        return { label: 'عرض سعر مستلم', labelEn: 'Received', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
      case 'under_review':
        return { label: 'قيد الفحص والمقارنة', labelEn: 'Under Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'selected':
        return { label: 'العرض الفائز المعتمد', labelEn: 'Selected Winner', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'rejected':
        return { label: 'مستبعد / لم يقع عليه الاختيار', labelEn: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
      case 'expired':
        return { label: 'منتهي الصلاحية', labelEn: 'Expired', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-300' };
      default:
        return { label: status, labelEn: status, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
    }
  }

  static getPOStatusBadge(status: POStatus): { label: string; labelEn: string; bg: string; text: string; border: string } {
    switch (status) {
      case 'draft':
        return { label: 'مسودة PO', labelEn: 'Draft', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
      case 'pending_approval':
        return { label: 'بانتظار الاعتماد', labelEn: 'Pending Approval', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'approved':
        return { label: 'معتمد رسمياً', labelEn: 'Approved', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'sent_to_supplier':
        return { label: 'مرسل للمورد', labelEn: 'Sent to Supplier', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
      case 'partially_received':
        return { label: 'مستلم جزئياً بالمخزن', labelEn: 'Partially Received', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'fully_received':
        return { label: 'مستلم بالكامل (100%)', labelEn: 'Fully Received', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'partially_invoiced':
        return { label: 'مفوتر جزئياً بالحسابات', labelEn: 'Partially Invoiced', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' };
      case 'fully_invoiced':
        return { label: 'مفوتر بالكامل', labelEn: 'Fully Invoiced', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
      case 'closed':
        return { label: 'مكتمل ومغلق', labelEn: 'Closed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'cancelled':
        return { label: 'ملغي', labelEn: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
      default:
        return { label: status, labelEn: status, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
    }
  }

  static getPriorityBadge(priority: PRPriority): { label: string; bg: string; text: string; dot: string } {
    switch (priority) {
      case 'urgent':
        return { label: 'عاجل وحرج', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' };
      case 'high':
        return { label: 'أولوية عالية', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
      case 'normal':
      default:
        return { label: 'عادي', bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' };
    }
  }

  static getMatchingStatusBadge(status: MatchingResultStatus): { label: string; bg: string; text: string; iconColor: string } {
    switch (status) {
      case 'matched':
        return { label: 'مطابقة تامة 100%', bg: 'bg-emerald-50', text: 'text-emerald-700', iconColor: 'text-emerald-600' };
      case 'price_mismatch':
        return { label: 'فرق سعر بالفاتورة (Price Mismatch)', bg: 'bg-rose-50', text: 'text-rose-700', iconColor: 'text-rose-600' };
      case 'qty_mismatch':
        return { label: 'فرق كمية مستلمة (Qty Mismatch)', bg: 'bg-amber-50', text: 'text-amber-700', iconColor: 'text-amber-600' };
      case 'missing_grn':
        return { label: 'بدون إذن إضافة مخزني (Missing GRN)', bg: 'bg-orange-50', text: 'text-orange-700', iconColor: 'text-orange-600' };
      case 'over_invoiced':
        return { label: 'الفاتورة أكبر من أمر الشراء', bg: 'bg-purple-50', text: 'text-purple-700', iconColor: 'text-purple-600' };
      case 'pending_invoice':
        return { label: 'بانتظار ورود الفاتورة', bg: 'bg-slate-50', text: 'text-slate-600', iconColor: 'text-slate-400' };
      default:
        return { label: status, bg: 'bg-slate-50', text: 'text-slate-600', iconColor: 'text-slate-400' };
    }
  }

  // ----------------------------------------------------
  // 2. KPIS CALCULATOR
  // ----------------------------------------------------

  static calculateDashboardKPIs(
    prs: PurchaseRequest[],
    rfqs: RequestForQuotation[],
    quotes: SupplierQuotation[],
    pos: EnterprisePurchaseOrder[]
  ): ProcurementDashboardKPIs {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const openPRs = prs.filter(p => p.status !== 'fully_processed' && p.status !== 'cancelled' && p.status !== 'rejected').length;
    const pendingPRApprovals = prs.filter(p => p.status === 'pending_approval').length;
    
    const activeRFQs = rfqs.filter(r => r.status === 'sent' || r.status === 'partially_responded' || r.status === 'fully_responded').length;
    const quotesAwaitingComparison = rfqs.filter(r => r.status === 'fully_responded' || r.status === 'partially_responded').length;

    const posAwaitingApproval = pos.filter(p => p.status === 'pending_approval').length;
    const openPOs = pos.filter(p => p.status !== 'closed' && p.status !== 'cancelled' && p.status !== 'draft').length;

    // Expected Deliveries this week (next 7 days)
    const sevenDaysFromNow = new Date(Date.now() + 7 * 86400000);
    const expectedDeliveriesThisWeek = pos.filter(po => {
      if (po.receivingStatus === 'fully_received' || po.status === 'closed' || po.status === 'cancelled') return false;
      const expDate = new Date(po.expectedDeliveryDate);
      return expDate >= today && expDate <= sevenDaysFromNow;
    }).length;

    // Delayed POs
    const delayedPurchaseOrders = pos.filter(po => {
      if (po.receivingStatus === 'fully_received' || po.status === 'closed' || po.status === 'cancelled') return false;
      const expDate = new Date(po.expectedDeliveryDate);
      return expDate < today;
    }).length;

    const partiallyReceivedPOs = pos.filter(p => p.receivingStatus === 'partially_received').length;

    const completedPurchasesMonth = pos.filter(po => {
      if (po.status !== 'closed' && po.status !== 'fully_received') return false;
      const poDate = new Date(po.poDate);
      return poDate.getMonth() === currentMonth && poDate.getFullYear() === currentYear;
    }).length;

    const totalSpendMonthEGP = pos
      .filter(po => {
        if (po.status === 'cancelled') return false;
        const poDate = new Date(po.poDate);
        return poDate.getMonth() === currentMonth && poDate.getFullYear() === currentYear;
      })
      .reduce((sum, po) => sum + (po.grandTotal || 0), 0);

    const totalSpendYearEGP = pos
      .filter(po => {
        if (po.status === 'cancelled') return false;
        const poDate = new Date(po.poDate);
        return poDate.getFullYear() === currentYear;
      })
      .reduce((sum, po) => sum + (po.grandTotal || 0), 0);

    // On-Time Delivery Rate
    const evaluatedPOs = pos.filter(p => p.receivingStatus === 'fully_received' && p.actualDeliveryDate);
    let onTimeCount = 0;
    evaluatedPOs.forEach(p => {
      if (p.actualDeliveryDate && p.actualDeliveryDate <= p.expectedDeliveryDate) {
        onTimeCount++;
      }
    });

    const onTimeDeliveryRatePercent = evaluatedPOs.length > 0 ? Math.round((onTimeCount / evaluatedPOs.length) * 100) : 94;

    return {
      openPurchaseRequests: openPRs,
      pendingPRApprovals,
      activeRFQs,
      quotesAwaitingComparison,
      posAwaitingApproval,
      openPurchaseOrders: openPOs,
      expectedDeliveriesThisWeek,
      delayedPurchaseOrders,
      partiallyReceivedPOs,
      completedPurchasesMonth,
      totalSpendMonthEGP,
      totalSpendYearEGP,
      averageLeadTimeDays: 6.2,
      onTimeDeliveryRatePercent
    };
  }

  // ----------------------------------------------------
  // 3. THREE-WAY MATCHING LOGIC
  // ----------------------------------------------------

  static evaluateThreeWayMatch(
    po: EnterprisePurchaseOrder,
    grns: GoodsReceiptNote[],
    bills: VendorBill[]
  ): ThreeWayMatchingRecord {
    const linkedGRNs = grns.filter(g => g.poNumber === po.poNumber);
    const linkedBill = bills.find(b => b.poNumber === po.poNumber || b.notes?.includes(po.poNumber));

    const totalReceivedQtyMap: Record<string, number> = {};
    linkedGRNs.forEach(g => {
      g.items.forEach(gi => {
        totalReceivedQtyMap[gi.itemCode] = (totalReceivedQtyMap[gi.itemCode] || 0) + gi.receivedQty;
      });
    });

    let hasPriceMismatch = false;
    let hasQtyMismatch = false;
    let isMissingGRN = linkedGRNs.length === 0 && Boolean(linkedBill);

    const lines = po.items.map(poItem => {
      const grnQty = totalReceivedQtyMap[poItem.itemCode] || poItem.receivedQuantity || 0;
      const invoiceQty = linkedBill ? poItem.quantity : 0; // standard matching
      const invoiceUnitPrice = linkedBill ? (linkedBill.subtotal / (po.items.reduce((s, i) => s + i.quantity, 0) || 1)) : poItem.netUnitPrice;
      const invoiceTotal = invoiceQty * invoiceUnitPrice;

      const qtyVariance = invoiceQty - grnQty;
      const priceVariance = Math.abs(invoiceUnitPrice - poItem.netUnitPrice);

      let lineStatus: MatchingResultStatus = 'matched';
      if (!linkedBill) {
        lineStatus = 'pending_invoice';
      } else if (isMissingGRN) {
        lineStatus = 'missing_grn';
      } else if (priceVariance > 1) { // 1 EGP tolerance
        lineStatus = 'price_mismatch';
        hasPriceMismatch = true;
      } else if (qtyVariance !== 0) {
        lineStatus = 'qty_mismatch';
        hasQtyMismatch = true;
      }

      return {
        itemCode: poItem.itemCode,
        itemName: poItem.itemName,
        poQty: poItem.quantity,
        poUnitPrice: poItem.netUnitPrice,
        poTotal: poItem.totalAmount,
        grnQty,
        grnReceivedDate: linkedGRNs[0]?.date,
        invoiceQty,
        invoiceUnitPrice,
        invoiceTotal,
        qtyVariance,
        priceVariance,
        totalVariance: Math.abs(invoiceTotal - poItem.totalAmount),
        status: lineStatus
      };
    });

    let overallStatus: MatchingResultStatus = 'matched';
    if (!linkedBill) {
      overallStatus = 'pending_invoice';
    } else if (isMissingGRN) {
      overallStatus = 'missing_grn';
    } else if (hasPriceMismatch) {
      overallStatus = 'price_mismatch';
    } else if (hasQtyMismatch) {
      overallStatus = 'qty_mismatch';
    }

    return {
      id: `match-${po.id}`,
      matchNumber: `3WM-${po.poNumber}`,
      poId: po.id,
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      grnNumbers: linkedGRNs.map(g => g.grnNumber),
      invoiceNumber: linkedBill?.vendorInvoiceNumber,
      invoiceDate: linkedBill?.date,
      poTotal: po.grandTotal,
      receivedValue: po.items.reduce((sum, item) => sum + (item.receivedQuantity * item.netUnitPrice), 0),
      invoicedValue: linkedBill?.totalAmount || 0,
      varianceValue: Math.abs((linkedBill?.totalAmount || 0) - po.grandTotal),
      overallStatus,
      lines,
      checkedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      checkedByUserName: 'النظام الآلي - 3-Way Match Engine',
      accountingReviewStatus: overallStatus === 'matched' ? 'approved_for_payment' : 'held_for_discrepancy'
    };
  }

  // ----------------------------------------------------
  // 4. QUOTATION COMPARISON MATRIX BUILDER
  // ----------------------------------------------------

  static buildComparisonMatrix(
    rfq: RequestForQuotation,
    quotes: SupplierQuotation[]
  ): QuotationComparisonColumn[] {
    const rfqQuotes = quotes.filter(q => q.rfqId === rfq.id || q.rfqNumber === rfq.rfqNumber);

    return rfqQuotes.map(q => {
      const itemPrices: Record<string, {
        unitPrice: number;
        discountPercent: number;
        taxPercent: number;
        lineTotal: number;
        leadTimeDays: number;
      }> = {};

      q.items.forEach(item => {
        itemPrices[item.itemCode] = {
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          taxPercent: item.taxPercent,
          lineTotal: item.lineTotal,
          leadTimeDays: item.leadTimeDays
        };
      });

      return {
        quotationId: q.id,
        quotationNumber: q.quotationNumber,
        supplierId: q.supplierId,
        supplierName: q.supplierName,
        rating: 4.8,
        deliveryLeadTimeDays: q.deliveryLeadTimeDays,
        expectedDeliveryDate: q.expectedDeliveryDate,
        paymentTerms: q.paymentTerms,
        shippingCost: q.shippingCost,
        otherCharges: q.otherCharges,
        subtotal: q.subtotal,
        taxTotal: q.taxTotal,
        grandTotal: q.grandTotal,
        status: q.status,
        isSelected: q.status === 'selected',
        itemPrices
      };
    });
  }

  // ----------------------------------------------------
  // 5. TAX & TOTALS CALCULATOR
  // ----------------------------------------------------

  static calculateQuotationTotals(items: {
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxPercent?: number;
  }[], shippingCost = 0, otherCharges = 0) {
    let subtotal = 0;
    let totalDiscount = 0;
    let taxTotal = 0;

    items.forEach(item => {
      const itemQty = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const rawLineTotal = itemQty * unitPrice;
      const discountPercent = Number(item.discountPercent) || 0;
      const discountAmount = Math.round(rawLineTotal * (discountPercent / 100));
      const netLine = rawLineTotal - discountAmount;
      const taxPercent = item.taxPercent !== undefined ? Number(item.taxPercent) : 14;
      const taxAmount = Math.round(netLine * (taxPercent / 100));

      subtotal += rawLineTotal;
      totalDiscount += discountAmount;
      taxTotal += taxAmount;
    });

    const grandTotal = (subtotal - totalDiscount) + taxTotal + Number(shippingCost) + Number(otherCharges);

    return {
      subtotal,
      totalDiscount,
      taxTotal,
      shippingCost: Number(shippingCost),
      otherCharges: Number(otherCharges),
      grandTotal
    };
  }
}
