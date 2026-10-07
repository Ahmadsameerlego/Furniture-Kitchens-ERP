import { CustomContract, PaymentMilestone, PaymentReceipt, PaymentSchedule, ProjectHandoverProtocol } from '../types/erp';

// Standard 40 / 40 / 20 milestone plan used across the bespoke contracts.
const milestonePlan = (
  prefix: string,
  total: number,
  paid: Array<{ receipt: string; date: string } | undefined>
): PaymentMilestone[] => {
  const plan = [
    { title: 'عربون وتأكيد التعاقد الرسمي', percentage: 40, due: 'عند توقيع العقد' },
    { title: 'دفعة بدء التشغيل والشحن من المصنع', percentage: 40, due: 'قبل خروج الوحدات من المصنع للتركيب' },
    { title: 'دفعة الاستلام النهائي والتركيب', percentage: 20, due: 'خلال 48 ساعة من توقيع محضر الاستلام النهائي' }
  ];
  return plan.map((m, i) => {
    const amount = Math.round((total * m.percentage) / 100);
    const payment = paid[i];
    return {
      id: `${prefix}-${i + 1}`,
      milestoneIndex: i + 1,
      title: m.title,
      percentage: m.percentage,
      amount,
      dueDateDescription: m.due,
      status: payment ? 'verified_in_finance' : 'pending',
      paidAmount: payment ? amount : 0,
      ...(payment ? { financialReceiptRef: payment.receipt, paymentDate: payment.date, notes: 'تم التحقق من الإيداع بالحسابات' } : {})
    };
  });
};

const PAYMENT_TERMS = 'عربون تعاقد 40% + دفعة قبل الشحن من المصنع 40% + دفعة التسليم النهائي بعد التركيب 20%';

export const initialCustomContracts: CustomContract[] = [
  {
    id: 'cnt-101',
    contractNumber: 'CNT-2026-001',
    projectId: 'prj-101',
    projectNumber: 'PRJ-2026-001',
    customerId: 'cust-1',
    customerName: 'م. طارق المنشاوي',
    quotationId: 'qte-501',
    quotationVersion: 1,
    contractDate: '2026-08-18',
    totalValue: 250000,
    paymentTerms: PAYMENT_TERMS,
    deliveryTerms: 'التسليم والتركيب بالفيلا خلال 30 يوم عمل من استلام العربون',
    milestones: milestonePlan('ms-101', 250000, [{ receipt: 'RCP-2026-001', date: '2026-08-18 19:00' }]),
    status: 'signed',
    signedAt: '2026-08-18 18:30',
    signedByCustomerName: 'م. طارق المنشاوي (العميل)',
    isDepositVerified: true,
    notes: 'القيمة غير شاملة ضريبة القيمة المضافة 14% (الإجمالي بالضريبة 285,000 ج.م).'
  },
  {
    id: 'cnt-102',
    contractNumber: 'CNT-2026-002',
    projectId: 'prj-102',
    projectNumber: 'PRJ-2026-002',
    customerId: 'cust-11',
    customerName: 'م. حازم السعدني',
    quotationId: 'qte-505',
    quotationVersion: 2,
    contractDate: '2026-07-14',
    totalValue: 165000,
    paymentTerms: PAYMENT_TERMS,
    deliveryTerms: 'التركيب خلال 35 يوم عمل شامل الضمان 5 سنوات',
    milestones: milestonePlan('ms-102', 165000, [
      { receipt: 'RCP-2026-002', date: '2026-07-14 15:00' },
      { receipt: 'RCP-2026-004', date: '2026-08-24 12:00' }
    ]),
    status: 'signed',
    signedAt: '2026-07-14 14:00',
    signedByCustomerName: 'م. حازم السعدني (العميل)',
    isDepositVerified: true,
    notes: 'تم تحصيل دفعة الشحن، والدفعة الأخيرة مستحقة بعد التركيب.'
  },
  {
    id: 'cnt-103',
    contractNumber: 'CNT-2026-003',
    projectId: 'prj-103',
    projectNumber: 'PRJ-2026-003',
    customerId: 'cust-12',
    customerName: 'أ. شريف مدكور',
    quotationId: 'qte-502',
    quotationVersion: 2,
    contractDate: '2026-08-18',
    totalValue: 210000,
    paymentTerms: PAYMENT_TERMS,
    deliveryTerms: 'التسليم والتركيب خلال 35 يوم عمل من استلام العربون',
    milestones: milestonePlan('ms-103', 210000, [{ receipt: 'RCP-2026-003', date: '2026-08-18 13:00' }]),
    status: 'signed',
    signedAt: '2026-08-18 12:30',
    signedByCustomerName: 'أ. شريف مدكور (العميل)',
    isDepositVerified: true,
    notes: 'عقد مطبخ كلاسيك أرو طبيعي معتمد وموقع.'
  },
  {
    id: 'cnt-104',
    contractNumber: 'CNT-2026-004',
    projectId: 'prj-104',
    projectNumber: 'PRJ-2026-004',
    customerId: 'cust-6',
    customerName: 'د. نورهان علي',
    quotationId: 'qte-506',
    quotationVersion: 1,
    contractDate: '2026-08-26',
    totalValue: 175000,
    paymentTerms: PAYMENT_TERMS,
    deliveryTerms: 'التسليم والتركيب خلال 30 يوم عمل من اعتماد المخططات التنفيذية',
    milestones: milestonePlan('ms-104', 175000, [{ receipt: 'RCP-2026-005', date: '2026-08-26 12:00' }]),
    status: 'signed',
    signedAt: '2026-08-26 11:30',
    signedByCustomerName: 'د. نورهان علي (العميلة)',
    isDepositVerified: true,
    notes: 'تم توقيع العقد بمعرض الإسكندرية وتحويل محضر التسليم للمكتب الفني.'
  },
  {
    id: 'cnt-105',
    contractNumber: 'CNT-2026-005',
    projectId: 'prj-105',
    projectNumber: 'PRJ-2026-005',
    customerId: 'cust-8',
    customerName: 'د. هناء شريف',
    quotationId: 'qte-507',
    quotationVersion: 1,
    contractDate: '2026-04-25',
    totalValue: 340000,
    paymentTerms: PAYMENT_TERMS,
    deliveryTerms: 'التسليم والتركيب خلال 40 يوم عمل',
    milestones: milestonePlan('ms-105', 340000, [
      { receipt: 'RCP-2026-0087', date: '2026-04-25 13:00' },
      { receipt: 'RCP-2026-0112', date: '2026-06-02 11:00' },
      { receipt: 'RCP-2026-0140', date: '2026-07-10 18:00' }
    ]),
    status: 'signed',
    signedAt: '2026-04-25 12:00',
    signedByCustomerName: 'د. هناء شريف (العميلة)',
    isDepositVerified: true,
    notes: 'مشروع مكتمل ومحصل بالكامل.'
  }
];

const handoverChecklist = (contractNumber: string, receipt: string, deposit: number, designVersion: number) => ({
  contractSigned: true,
  contractNumber,
  depositVerifiedInFinance: true,
  depositReceiptNumber: receipt,
  depositAmount: deposit,
  approvedQuotationVersion: 1,
  commercialSpecsLocked: true,
  approvedDesignVersion: designVersion,
  siteSurveyCompleted: true,
  surveyObstaclesChecked: true,
  technicalDocumentsAttached: true
});

export const initialProjectHandovers: ProjectHandoverProtocol[] = [
  {
    id: 'hnd-101',
    projectId: 'prj-101',
    projectNumber: 'PRJ-2026-001',
    customerName: 'م. طارق المنشاوي',
    status: 'accepted_by_tech_office',
    submittedDate: '2026-08-18 19:30',
    submittedByUserName: 'عمر فاروق (مهندس المبيعات)',
    acceptedDate: '2026-08-19 09:00',
    acceptedByUserName: 'م. إبراهيم فؤاد (رئيس المكتب الفني)',
    checklist: handoverChecklist('CNT-2026-001', 'RCP-2026-001', 100000, 2),
    notesForTechOffice: 'المطبخ يحتوي على عمود بالجدار B وتوصيل غسالة أطباق بلت إن. تم توثيق صور وفيديو المعاينة بالموقع.'
  },
  {
    id: 'hnd-102',
    projectId: 'prj-102',
    projectNumber: 'PRJ-2026-002',
    customerName: 'م. حازم السعدني',
    status: 'accepted_by_tech_office',
    submittedDate: '2026-07-15 10:00',
    submittedByUserName: 'عمر فاروق (مهندس المبيعات)',
    acceptedDate: '2026-07-16 09:30',
    acceptedByUserName: 'م. إبراهيم فؤاد (رئيس المكتب الفني)',
    checklist: handoverChecklist('CNT-2026-002', 'RCP-2026-002', 66000, 2),
    notesForTechOffice: 'الدريسنج بدلف زجاج فاميه وبروفايل أسود، والسرير بسحارة هيدروليك.'
  },
  {
    id: 'hnd-103',
    projectId: 'prj-103',
    projectNumber: 'PRJ-2026-003',
    customerName: 'أ. شريف مدكور',
    status: 'accepted_by_tech_office',
    submittedDate: '2026-08-18 16:00',
    submittedByUserName: 'عمر فاروق (مهندس المبيعات)',
    acceptedDate: '2026-08-19 10:00',
    acceptedByUserName: 'م. إبراهيم فؤاد (رئيس المكتب الفني)',
    checklist: handoverChecklist('CNT-2026-003', 'RCP-2026-003', 84000, 2),
    notesForTechOffice: 'مطبخ U كلاسيك، والرخام كريما مارفيل حسب النسخة الثانية من عرض السعر.'
  },
  {
    id: 'hnd-104',
    projectId: 'prj-104',
    projectNumber: 'PRJ-2026-004',
    customerName: 'د. نورهان علي',
    status: 'submitted',
    submittedDate: '2026-08-27 13:30',
    submittedByUserName: 'عمر فاروق (مهندس المبيعات)',
    checklist: handoverChecklist('CNT-2026-004', 'RCP-2026-005', 70000, 1),
    notesForTechOffice: 'مطبخ مستقيم 3.6م مع وحدة طولية للثلاجة. العميلة طلبت مقابض جولا مخفية.'
  }
];

export const initialPaymentReceipts: PaymentReceipt[] = [
  {
    id: 'rcp-001',
    receiptNumber: 'RCP-2026-001',
    orderId: 'ord-101',
    orderNumber: 'ORD-2026-0018',
    customerId: 'cust-1',
    customerName: 'م. طارق المنشاوي',
    amount: 100000,
    paymentDate: '2026-08-18 19:00',
    paymentMethod: 'bank_transfer',
    paymentType: 'deposit',
    receivedByUserName: 'سارة الشريف (المالية)',
    notes: 'عربون 40% لعقد المطبخ CNT-2026-001 - تحويل بنكي البنك الأهلي'
  },
  {
    id: 'rcp-002',
    receiptNumber: 'RCP-2026-002',
    orderId: 'ord-102',
    orderNumber: 'ORD-2026-0021',
    customerId: 'cust-11',
    customerName: 'م. حازم السعدني',
    amount: 66000,
    paymentDate: '2026-07-14 15:00',
    paymentMethod: 'check',
    paymentType: 'deposit',
    receivedByUserName: 'سارة الشريف (المالية)',
    notes: 'عربون 40% لعقد غرفة النوم والدريسنج CNT-2026-002'
  },
  {
    id: 'rcp-003',
    receiptNumber: 'RCP-2026-003',
    orderId: 'ord-103',
    orderNumber: 'ORD-2026-0030',
    customerId: 'cust-12',
    customerName: 'أ. شريف مدكور',
    amount: 84000,
    paymentDate: '2026-08-18 13:00',
    paymentMethod: 'bank_transfer',
    paymentType: 'deposit',
    receivedByUserName: 'سارة الشريف (المالية)',
    notes: 'عربون 40% لعقد المطبخ الكلاسيك CNT-2026-003'
  },
  {
    id: 'rcp-004',
    receiptNumber: 'RCP-2026-004',
    orderId: 'ord-102',
    orderNumber: 'ORD-2026-0021',
    customerId: 'cust-11',
    customerName: 'م. حازم السعدني',
    amount: 66000,
    paymentDate: '2026-08-24 12:00',
    paymentMethod: 'cash',
    paymentType: 'installment',
    receivedByUserName: 'سارة الشريف (المالية)',
    notes: 'دفعة الشحن 40% بعد اكتمال التصنيع'
  },
  {
    id: 'rcp-005',
    receiptNumber: 'RCP-2026-005',
    orderId: 'ord-104',
    orderNumber: 'ORD-2026-0034',
    customerId: 'cust-6',
    customerName: 'د. نورهان علي',
    amount: 70000,
    paymentDate: '2026-08-26 12:00',
    paymentMethod: 'card',
    paymentType: 'deposit',
    receivedByUserName: 'سارة الشريف (المالية)',
    notes: 'عربون 40% لعقد المطبخ CNT-2026-004 - معرض الإسكندرية'
  },
  {
    id: 'rcp-087',
    receiptNumber: 'RCP-2026-0087',
    orderId: 'ord-105',
    orderNumber: 'ORD-2026-0009',
    customerId: 'cust-8',
    customerName: 'د. هناء شريف',
    amount: 136000,
    paymentDate: '2026-04-25 13:00',
    paymentMethod: 'bank_transfer',
    paymentType: 'deposit',
    receivedByUserName: 'سارة الشريف (المالية)',
    notes: 'عربون 40% مطبخ ودريسنج فيلا الشويفات'
  },
  {
    id: 'rcp-112',
    receiptNumber: 'RCP-2026-0112',
    orderId: 'ord-105',
    orderNumber: 'ORD-2026-0009',
    customerId: 'cust-8',
    customerName: 'د. هناء شريف',
    amount: 136000,
    paymentDate: '2026-06-02 11:00',
    paymentMethod: 'check',
    paymentType: 'installment',
    receivedByUserName: 'سارة الشريف (المالية)',
    notes: 'دفعة الشحن 40%'
  },
  {
    id: 'rcp-140',
    receiptNumber: 'RCP-2026-0140',
    orderId: 'ord-105',
    orderNumber: 'ORD-2026-0009',
    customerId: 'cust-8',
    customerName: 'د. هناء شريف',
    amount: 68000,
    paymentDate: '2026-07-10 18:00',
    paymentMethod: 'bank_transfer',
    paymentType: 'installment',
    receivedByUserName: 'سارة الشريف (المالية)',
    notes: 'دفعة التسليم النهائي 20%'
  }
];

const schedule = (
  id: string,
  orderId: string,
  orderNumber: string,
  customerId: string,
  customerName: string,
  customerPhone: string,
  installmentNumber: number,
  amount: number,
  dueDate: string,
  paid?: { date: string; ref: string },
  notes?: string
): PaymentSchedule => ({
  id,
  orderId,
  orderNumber,
  customerId,
  customerName,
  customerPhone,
  installmentNumber,
  amount,
  paidAmount: paid ? amount : 0,
  remainingAmount: paid ? 0 : amount,
  dueDate,
  status: paid ? 'paid' : 'upcoming',
  ...(paid ? { paidDate: paid.date, paymentRef: paid.ref } : {}),
  ...(notes ? { notes } : {})
});

export const initialCommercialPaymentSchedules: PaymentSchedule[] = [
  // PRJ-2026-001 — م. طارق المنشاوي (250,000)
  schedule('ps-101', 'ord-101', 'ORD-2026-0018', 'cust-1', 'م. طارق المنشاوي', '01009876543', 1, 100000, '2026-08-18', { date: '2026-08-18', ref: 'RCP-2026-001' }, 'عربون التعاقد 40%'),
  schedule('ps-102', 'ord-101', 'ORD-2026-0018', 'cust-1', 'م. طارق المنشاوي', '01009876543', 2, 100000, '2026-09-04', undefined, 'دفعة الشحن 40% - مستحقة قبل خروج المطبخ من المصنع'),
  schedule('ps-103', 'ord-101', 'ORD-2026-0018', 'cust-1', 'م. طارق المنشاوي', '01009876543', 3, 50000, '2026-09-20', undefined, 'دفعة التسليم النهائي 20%'),

  // PRJ-2026-002 — م. حازم السعدني (165,000)
  schedule('ps-201', 'ord-102', 'ORD-2026-0021', 'cust-11', 'م. حازم السعدني', '01144556677', 1, 66000, '2026-07-14', { date: '2026-07-14', ref: 'RCP-2026-002' }, 'عربون التعاقد 40%'),
  schedule('ps-202', 'ord-102', 'ORD-2026-0021', 'cust-11', 'م. حازم السعدني', '01144556677', 2, 66000, '2026-08-24', { date: '2026-08-24', ref: 'RCP-2026-004' }, 'دفعة الشحن 40%'),
  schedule('ps-203', 'ord-102', 'ORD-2026-0021', 'cust-11', 'م. حازم السعدني', '01144556677', 3, 33000, '2026-08-30', undefined, 'دفعة التسليم النهائي 20% - بعد التركيب'),

  // PRJ-2026-003 — أ. شريف مدكور (210,000)
  schedule('ps-301', 'ord-103', 'ORD-2026-0030', 'cust-12', 'أ. شريف مدكور', '01006677889', 1, 84000, '2026-08-18', { date: '2026-08-18', ref: 'RCP-2026-003' }, 'عربون التعاقد 40%'),
  schedule('ps-302', 'ord-103', 'ORD-2026-0030', 'cust-12', 'أ. شريف مدكور', '01006677889', 2, 84000, '2026-09-15', undefined, 'دفعة الشحن 40%'),
  schedule('ps-303', 'ord-103', 'ORD-2026-0030', 'cust-12', 'أ. شريف مدكور', '01006677889', 3, 42000, '2026-09-28', undefined, 'دفعة التسليم النهائي 20%'),

  // PRJ-2026-004 — د. نورهان علي (175,000)
  schedule('ps-401', 'ord-104', 'ORD-2026-0034', 'cust-6', 'د. نورهان علي', '01199887711', 1, 70000, '2026-08-26', { date: '2026-08-26', ref: 'RCP-2026-005' }, 'عربون التعاقد 40%'),
  schedule('ps-402', 'ord-104', 'ORD-2026-0034', 'cust-6', 'د. نورهان علي', '01199887711', 2, 70000, '2026-09-22', undefined, 'دفعة الشحن 40%'),
  schedule('ps-403', 'ord-104', 'ORD-2026-0034', 'cust-6', 'د. نورهان علي', '01199887711', 3, 35000, '2026-10-05', undefined, 'دفعة التسليم النهائي 20%')
];
