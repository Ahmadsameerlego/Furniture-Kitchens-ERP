import { 
  OrderItem, 
  OrderStatus, 
  DeliveryStatus, 
  OrderPaymentStatus,
  PaymentSchedule 
} from '../types/erp';

export class ReadySalesService {
  /**
   * Calculates financial totals for an order using actual historical purchase costs
   */
  static calculateOrderTotals(items: OrderItem[]): {
    subtotal: number;
    totalDiscount: number;
    orderTotal: number;
    totalPurchaseCost: number;
    grossProfit: number;
  } {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalPurchaseCost = 0;

    items.forEach(item => {
      const lineSellingBeforeDisc = item.unitSellingPrice * item.quantity;
      const lineDisc = item.discountAmount || 0;
      const lineSellingNet = lineSellingBeforeDisc - lineDisc;
      const lineCost = item.actualPurchaseCost * item.quantity;

      subtotal += lineSellingBeforeDisc;
      totalDiscount += lineDisc;
      totalPurchaseCost += lineCost;
    });

    const orderTotal = subtotal - totalDiscount;
    const grossProfit = orderTotal - totalPurchaseCost;

    return {
      subtotal,
      totalDiscount,
      orderTotal,
      totalPurchaseCost,
      grossProfit
    };
  }

  /**
   * Metadata & Styling for Order Status
   */
  static getOrderStatusMeta(status: OrderStatus): {
    label: string;
    labelEn: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
  } {
    switch (status) {
      case 'draft':
        return {
          label: 'مسودة طلب (Draft)',
          labelEn: 'Draft',
          bgClass: 'bg-slate-100',
          textClass: 'text-slate-700',
          borderClass: 'border-slate-300'
        };
      case 'confirmed':
        return {
          label: 'مؤكد ومحجوز (Confirmed)',
          labelEn: 'Confirmed',
          bgClass: 'bg-blue-50',
          textClass: 'text-blue-800',
          borderClass: 'border-blue-200'
        };
      case 'preparing':
        return {
          label: 'قيد التجهيز بالمعرض (Preparing)',
          labelEn: 'Preparing',
          bgClass: 'bg-amber-50',
          textClass: 'text-amber-800',
          borderClass: 'border-amber-200'
        };
      case 'ready_for_delivery':
        return {
          label: 'جاهز للتسليم (Ready for Delivery)',
          labelEn: 'Ready for Delivery',
          bgClass: 'bg-[#E06F28]/15',
          textClass: 'text-[#E06F28]',
          borderClass: 'border-[#E06F28]/30'
        };
      case 'delivered':
        return {
          label: 'تم التسليم للعميل (Delivered)',
          labelEn: 'Delivered',
          bgClass: 'bg-emerald-100',
          textClass: 'text-emerald-900',
          borderClass: 'border-emerald-300'
        };
      case 'completed':
        return {
          label: 'طلب مكتمل بالكامل (Completed)',
          labelEn: 'Completed',
          bgClass: 'bg-[#1C352D]',
          textClass: 'text-white',
          borderClass: 'border-[#1C352D]'
        };
      case 'cancelled':
        return {
          label: 'ملغي (Cancelled)',
          labelEn: 'Cancelled',
          bgClass: 'bg-rose-50',
          textClass: 'text-rose-700',
          borderClass: 'border-rose-200'
        };
      default:
        return {
          label: status,
          labelEn: status,
          bgClass: 'bg-slate-100',
          textClass: 'text-slate-700',
          borderClass: 'border-slate-200'
        };
    }
  }

  /**
   * CRITICAL DISTINCTION: Delivery Status Metadata
   */
  static getDeliveryStatusMeta(status: DeliveryStatus): {
    label: string;
    isDelivered: boolean;
    bgClass: string;
    textClass: string;
    borderClass: string;
  } {
    switch (status) {
      case 'pending':
        return {
          label: 'لم يبدأ التجهيز',
          isDelivered: false,
          bgClass: 'bg-slate-100',
          textClass: 'text-slate-600',
          borderClass: 'border-slate-200'
        };
      case 'preparing':
        return {
          label: 'جاري التجهيز بالمخزن',
          isDelivered: false,
          bgClass: 'bg-amber-50',
          textClass: 'text-amber-800',
          borderClass: 'border-amber-200'
        };
      case 'ready_for_delivery':
        return {
          label: 'جاهز للتسليم (بالمعرض/المخزن)',
          isDelivered: false,
          bgClass: 'bg-indigo-50',
          textClass: 'text-indigo-800',
          borderClass: 'border-indigo-300'
        };
      case 'in_transit':
        return {
          label: 'في الطريق مع فريق التوصيل',
          isDelivered: false,
          bgClass: 'bg-sky-50',
          textClass: 'text-sky-800',
          borderClass: 'border-sky-300'
        };
      case 'delivered':
        return {
          label: 'تم التسليم الفعلي للعميل',
          isDelivered: true,
          bgClass: 'bg-emerald-600',
          textClass: 'text-white',
          borderClass: 'border-emerald-700'
        };
      default:
        return {
          label: status,
          isDelivered: false,
          bgClass: 'bg-slate-100',
          textClass: 'text-slate-700',
          borderClass: 'border-slate-200'
        };
    }
  }

  /**
   * Payment Status Metadata
   */
  static getPaymentStatusMeta(status: OrderPaymentStatus): {
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
  } {
    switch (status) {
      case 'unpaid':
        return {
          label: 'غير مسدد (Unpaid)',
          bgClass: 'bg-rose-50',
          textClass: 'text-rose-700',
          borderClass: 'border-rose-200'
        };
      case 'deposit_paid':
        return {
          label: 'تم سداد العربون (Deposit Paid)',
          bgClass: 'bg-amber-50',
          textClass: 'text-amber-800',
          borderClass: 'border-amber-300'
        };
      case 'partially_paid':
        return {
          label: 'مسدد جزئياً (Partially Paid)',
          bgClass: 'bg-sky-50',
          textClass: 'text-sky-800',
          borderClass: 'border-sky-300'
        };
      case 'fully_paid':
        return {
          label: 'مسدد بالكامل (Fully Paid)',
          bgClass: 'bg-emerald-100',
          textClass: 'text-emerald-900',
          borderClass: 'border-emerald-300'
        };
      default:
        return {
          label: status,
          bgClass: 'bg-slate-100',
          textClass: 'text-slate-700',
          borderClass: 'border-slate-200'
        };
    }
  }

  /**
   * Generates Future Installment Schedule Array
   */
  static generateInstallmentSchedule(
    orderId: string,
    orderNumber: string,
    customerId: string,
    customerName: string,
    customerPhone: string,
    remainingAmount: number,
    numberOfInstallments: number,
    startDate: string
  ): PaymentSchedule[] {
    if (numberOfInstallments <= 0 || remainingAmount <= 0) return [];

    const amountPerInstallment = Math.round(remainingAmount / numberOfInstallments);
    const schedules: PaymentSchedule[] = [];

    let currentDueDate = new Date(startDate);

    for (let i = 1; i <= numberOfInstallments; i++) {
      // Advance by 1 month for each installment
      currentDueDate.setMonth(currentDueDate.getMonth() + 1);

      const dueDateStr = currentDueDate.toISOString().substring(0, 10);
      const isLast = i === numberOfInstallments;
      const actualAmount = isLast
        ? remainingAmount - amountPerInstallment * (numberOfInstallments - 1)
        : amountPerInstallment;

      schedules.push({
        id: `sch-${Date.now()}-${i}`,
        orderId,
        orderNumber,
        customerId,
        customerName,
        customerPhone,
        installmentNumber: i,
        amount: actualAmount,
        dueDate: dueDateStr,
        status: 'upcoming'
      });
    }

    return schedules;
  }
}
