import { CustomContract, PaymentReceipt, PaymentSchedule } from '../types/erp';

export const initialCustomContracts: CustomContract[] = [
  {
    id: 'cnt-101',
    contractNumber: 'CNT-2026-001',
    projectId: 'prj-101',
    projectNumber: 'PRJ-2026-001',
    customerId: 'cust-1',
    customerName: 'محمد حسن',
    quotationId: 'qte-501',
    quotationVersion: 1,
    contractDate: '2026-08-25',
    totalValue: 126000,
    paymentTerms: 'دفعة مقدمة 40,000 ج.م والمتبقي على 4 أقساط شهرية مسيرة',
    deliveryTerms: 'التسليم والتركيب بالفيلا خلال 30 يوم عمل من استلام المقدم',
    status: 'signed',
    signedAt: '2026-08-25 18:30',
    signedByCustomerName: 'محمد حسن (العميل)',
    notes: 'عقد معتمد وموقع إلكترونياً وبداية مسار التجهيز للإنتاج'
  },
  {
    id: 'cnt-102',
    contractNumber: 'CNT-2026-002',
    projectId: 'prj-102',
    projectNumber: 'PRJ-2026-002',
    customerId: 'cust-3',
    customerName: 'سارة علي',
    quotationId: 'qte-502',
    quotationVersion: 2,
    contractDate: '2026-08-24',
    totalValue: 95000,
    paymentTerms: 'مقدم 30,000 ج.م وقسطين متساويين وقسط تسليم',
    deliveryTerms: 'التركيب خلال 20 يوم عمل شامل الضمان 5 سنوات',
    status: 'signed',
    signedAt: '2026-08-24 14:00',
    signedByCustomerName: 'سارة علي (العميلة)',
    notes: 'عقد غرفة نوم شامبين معتمد وموقع'
  },
  {
    id: 'cnt-103',
    contractNumber: 'CNT-2026-003',
    projectId: 'prj-103',
    projectNumber: 'PRJ-2026-003',
    customerId: 'cust-2',
    customerName: 'أحمد محمود',
    quotationId: 'qte-503',
    quotationVersion: 1,
    contractDate: '2026-08-26',
    totalValue: 42000,
    paymentTerms: 'مقدم 50% والباقي عند التسليم',
    deliveryTerms: 'التسليم خلال 15 يوم عمل',
    status: 'draft',
    notes: 'مسودة عقد قيد مراجعة وتوقيع العميل'
  }
];

export const initialPaymentReceipts: PaymentReceipt[] = [
  {
    id: 'rcp-001',
    receiptNumber: 'RCP-2026-001',
    orderId: 'ord-101',
    orderNumber: 'ORD-2026-0018',
    customerId: 'cust-1',
    customerName: 'محمد حسن',
    amount: 40000,
    paymentDate: '2026-08-25 19:00',
    paymentMethod: 'bank_transfer',
    paymentType: 'deposit',
    receivedByUserName: 'أحمد محمود (المالية)',
    notes: 'إيصال استلام الدفعة المقدمة لحساب أمر المطبخ'
  },
  {
    id: 'rcp-002',
    receiptNumber: 'RCP-2026-002',
    orderId: 'ord-102',
    orderNumber: 'ORD-2026-0021',
    customerId: 'cust-3',
    customerName: 'سارة علي',
    amount: 30000,
    paymentDate: '2026-08-24 15:00',
    paymentMethod: 'card',
    paymentType: 'deposit',
    receivedByUserName: 'أحمد محمود',
    notes: 'مقدم عقد غرفة نوم ماستر'
  },
  {
    id: 'rcp-003',
    receiptNumber: 'RCP-2026-003',
    orderId: 'ord-102',
    orderNumber: 'ORD-2026-0021',
    customerId: 'cust-3',
    customerName: 'سارة علي',
    amount: 20000,
    paymentDate: '2026-08-25 11:00',
    paymentMethod: 'cash',
    paymentType: 'installment',
    receivedByUserName: 'أحمد محمود',
    notes: 'تحصيل القسط الأول لغرفة النوم'
  }
];

export const initialCommercialPaymentSchedules: PaymentSchedule[] = [
  // Order 1 (Ahmed Hassan - Total 126k, Paid 40k, Remaining 86k)
  {
    id: 'ps-101',
    orderId: 'ord-101',
    orderNumber: 'ORD-2026-0018',
    customerId: 'cust-1',
    customerName: 'محمد حسن',
    customerPhone: '01009876543',
    installmentNumber: 1,
    amount: 20000,
    paidAmount: 0,
    remainingAmount: 20000,
    dueDate: '2026-09-10',
    status: 'upcoming',
    notes: 'القسط الأول لمشروع المطبخ'
  },
  {
    id: 'ps-102',
    orderId: 'ord-101',
    orderNumber: 'ORD-2026-0018',
    customerId: 'cust-1',
    customerName: 'محمد حسن',
    customerPhone: '01009876543',
    installmentNumber: 2,
    amount: 20000,
    paidAmount: 0,
    remainingAmount: 20000,
    dueDate: '2026-10-10',
    status: 'upcoming',
    notes: 'القسط الثاني'
  },
  {
    id: 'ps-103',
    orderId: 'ord-101',
    orderNumber: 'ORD-2026-0018',
    customerId: 'cust-1',
    customerName: 'محمد حسن',
    customerPhone: '01009876543',
    installmentNumber: 3,
    amount: 20000,
    paidAmount: 0,
    remainingAmount: 20000,
    dueDate: '2026-11-10',
    status: 'upcoming',
    notes: 'القسط الثالث'
  },
  {
    id: 'ps-104',
    orderId: 'ord-101',
    orderNumber: 'ORD-2026-0018',
    customerId: 'cust-1',
    customerName: 'محمد حسن',
    customerPhone: '01009876543',
    installmentNumber: 4,
    amount: 26000,
    paidAmount: 0,
    remainingAmount: 26000,
    dueDate: '2026-12-10',
    status: 'upcoming',
    notes: 'الدفعة الأخيرة عند الاستلام والتركيب النهائى'
  },

  // Order 2 (Sara Ali - Total 95k, Paid 50k, Remaining 45k)
  {
    id: 'ps-201',
    orderId: 'ord-102',
    orderNumber: 'ORD-2026-0021',
    customerId: 'cust-3',
    customerName: 'سارة علي',
    customerPhone: '01223344556',
    installmentNumber: 1,
    amount: 20000,
    paidAmount: 20000,
    remainingAmount: 0,
    dueDate: '2026-08-25',
    status: 'paid',
    paidDate: '2026-08-25',
    paymentRef: 'RCP-2026-003'
  },
  {
    id: 'ps-202',
    orderId: 'ord-102',
    orderNumber: 'ORD-2026-0021',
    customerId: 'cust-3',
    customerName: 'سارة علي',
    customerPhone: '01223344556',
    installmentNumber: 2,
    amount: 15000,
    paidAmount: 0,
    remainingAmount: 15000,
    dueDate: '2026-08-15',
    status: 'overdue',
    notes: 'قسط متأخر استحاق منتصف أغسطس'
  },
  {
    id: 'ps-203',
    orderId: 'ord-102',
    orderNumber: 'ORD-2026-0021',
    customerId: 'cust-3',
    customerName: 'سارة علي',
    customerPhone: '01223344556',
    installmentNumber: 3,
    amount: 30000,
    paidAmount: 0,
    remainingAmount: 30000,
    dueDate: '2026-09-30',
    status: 'upcoming',
    notes: 'دفعة التسليم والتركيب بالمنزل'
  }
];
