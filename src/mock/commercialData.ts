import { CustomContract, PaymentReceipt, PaymentSchedule, ProjectHandoverProtocol } from '../types/erp';

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
    totalValue: 118500,
    paymentTerms: 'عربون تعاقد 40% + دفعة بدء التشغيل قبل الشحن 40% + دفعة التسليم النهائي بعد التركيب 20%',
    deliveryTerms: 'التسليم والتركيب بالفيلا خلال 30 يوم عمل من استلام المقدم',
    milestones: [
      {
        id: 'ms-1',
        milestoneIndex: 1,
        title: 'عربون وتأكيد التعاقد الرسمي',
        percentage: 40,
        amount: 47400,
        dueDateDescription: 'عند توقيع العقد',
        status: 'verified_in_finance',
        paidAmount: 47400,
        financialReceiptRef: 'RCP-2026-001',
        paymentDate: '2026-08-25 19:00',
        notes: 'تم التحقق من الإيداع البنكي بحساب البنك الأهلي'
      },
      {
        id: 'ms-2',
        milestoneIndex: 2,
        title: 'دفعة بدء التشغيل والشحن من المصنع',
        percentage: 40,
        amount: 47400,
        dueDateDescription: 'قبل خروج وحدات المطبخ من المصنع للتسليم',
        status: 'pending',
        paidAmount: 0,
        notes: 'مستحقة عند اكتمال التصنيع'
      },
      {
        id: 'ms-3',
        milestoneIndex: 3,
        title: 'دفعة الاستلام النهائي والتركيب',
        percentage: 20,
        amount: 23700,
        dueDateDescription: 'خلال 48 ساعة من توقيع محضر استلام الموقع النهائي',
        status: 'pending',
        paidAmount: 0,
        notes: 'مستحقة بعد التركيب'
      }
    ],
    status: 'signed',
    signedAt: '2026-08-25 18:30',
    signedByCustomerName: 'محمد حسن (العميل)',
    isDepositVerified: true,
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
    paymentTerms: 'مقدم 30% + دفعة مرحلية 50% + دفعة تسليم 20%',
    deliveryTerms: 'التركيب خلال 20 يوم عمل شامل الضمان 5 سنوات',
    milestones: [
      {
        id: 'ms-4',
        milestoneIndex: 1,
        title: 'عربون وتأكيد التعاقد',
        percentage: 30,
        amount: 28500,
        dueDateDescription: 'عند توقيع العقد',
        status: 'verified_in_finance',
        paidAmount: 28500,
        financialReceiptRef: 'RCP-2026-002',
        paymentDate: '2026-08-24 15:00'
      },
      {
        id: 'ms-5',
        milestoneIndex: 2,
        title: 'دفعة استكمال الهيكل بالورشة',
        percentage: 50,
        amount: 47500,
        dueDateDescription: 'قبل الدهان',
        status: 'pending',
        paidAmount: 0
      },
      {
        id: 'ms-6',
        milestoneIndex: 3,
        title: 'دفعة التسليم النهائي',
        percentage: 20,
        amount: 19000,
        dueDateDescription: 'عند اكتمال التسليم',
        status: 'pending',
        paidAmount: 0
      }
    ],
    status: 'signed',
    signedAt: '2026-08-24 14:00',
    signedByCustomerName: 'سارة علي (العميلة)',
    isDepositVerified: true,
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
    milestones: [
      {
        id: 'ms-7',
        milestoneIndex: 1,
        title: 'عربون التعاقد 50%',
        percentage: 50,
        amount: 21000,
        dueDateDescription: 'عند توقيع العقد',
        status: 'pending',
        paidAmount: 0
      },
      {
        id: 'ms-8',
        milestoneIndex: 2,
        title: 'دفعة التسليم النهائي 50%',
        percentage: 50,
        amount: 21000,
        dueDateDescription: 'عند التسليم',
        status: 'pending',
        paidAmount: 0
      }
    ],
    status: 'draft',
    isDepositVerified: false,
    notes: 'مسودة عقد قيد مراجعة وتوقيع العميل'
  }
];

export const initialProjectHandovers: ProjectHandoverProtocol[] = [
  {
    id: 'hnd-101',
    projectId: 'prj-101',
    projectNumber: 'PRJ-2026-001',
    customerName: 'محمد حسن',
    status: 'accepted_by_tech_office',
    submittedDate: '2026-08-25 19:30',
    submittedByUserName: 'عمر فاروق (مهندس المبيعات)',
    acceptedDate: '2026-08-26 09:00',
    acceptedByUserName: 'م. إبراهيم فؤاد (رئيس المكتب الفني)',
    checklist: {
      contractSigned: true,
      contractNumber: 'CNT-2026-001',
      depositVerifiedInFinance: true,
      depositReceiptNumber: 'RCP-2026-001',
      depositAmount: 47400,
      approvedQuotationVersion: 1,
      commercialSpecsLocked: true,
      approvedDesignVersion: 2,
      siteSurveyCompleted: true,
      surveyObstaclesChecked: true,
      technicalDocumentsAttached: true
    },
    notesForTechOffice: 'المطبخ يحتوي على عمود بالجدار B وتوصيل غسالة أطباق بلت إن. تم توثيق صور وفيديو المعاينة بالموقع.'
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
