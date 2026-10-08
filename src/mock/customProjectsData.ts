import { KITCHEN_DRAWINGS } from './designDrawings';
import {
  CustomProject,
  SiteVisit,
  ProjectMeasurement,
  ProjectDesign,
  ProjectQuotation,
  ProjectTimelineEvent
} from '../types/erp';

export const initialCustomProjects: CustomProject[] = [
  {
    id: 'prj-101',
    projectNumber: 'PRJ-2026-001',
    projectName: 'مطبخ رويال مودرن HPL بجزيرة - فيلا النرجس',
    customerId: 'cust-1',
    customerName: 'م. طارق المنشاوي',
    customerPhone: '01009876543',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    projectType: 'kitchen',
    assignedUserId: 'user-4',
    assignedUserName: 'عمر فاروق',
    status: 'in_production',
    createdDate: '2026-08-01',
    lastUpdatedDate: '2026-08-27 15:00',
    contractId: 'cnt-101',
    approvedQuotationId: 'qte-501',
    approvedDesignId: 'dsg-402',
    handoverId: 'hnd-101',
    notes: 'مطبخ L بجزيرة 180سم: دلف HPL أرو هندي، شاسيه MDF ملامين 18مم، مفصلات ومجاري Blum، رخام جالاكسي أسود. التصنيع جارٍ بعنبر التجميع.'
  },
  {
    id: 'prj-102',
    projectNumber: 'PRJ-2026-002',
    projectName: 'غرفة نوم ماستر ودريسنج روم - فيلا الشيخ زايد',
    customerId: 'cust-11',
    customerName: 'م. حازم السعدني',
    customerPhone: '01144556677',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    projectType: 'wardrobe',
    assignedUserId: 'user-4',
    assignedUserName: 'عمر فاروق',
    status: 'installation_scheduled',
    createdDate: '2026-07-05',
    lastUpdatedDate: '2026-08-27 18:00',
    contractId: 'cnt-102',
    handoverId: 'hnd-102',
    notes: 'سرير كينج 180×200 بسحارة هيدروليك + دريسنج روم 4.2م بدلف زجاج فاميه وبروفايل ألومنيوم أسود. التصنيع مكتمل وموعد التركيب محدد.'
  },
  {
    id: 'prj-103',
    projectNumber: 'PRJ-2026-003',
    projectName: 'مطبخ كلاسيك قشرة أرو طبيعي - مدينة نصر',
    customerId: 'cust-12',
    customerName: 'أ. شريف مدكور',
    customerPhone: '01006677889',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    projectType: 'kitchen',
    assignedUserId: 'user-4',
    assignedUserName: 'عمر فاروق',
    status: 'ready_for_production',
    createdDate: '2026-07-30',
    lastUpdatedDate: '2026-08-27 11:00',
    contractId: 'cnt-103',
    approvedQuotationId: 'qte-502',
    approvedDesignId: 'dsg-403',
    handoverId: 'hnd-103',
    notes: 'مطبخ U كلاسيك بقشرة أرو طبيعي ودهان أستر مط. تم الإفراج الفني، والتصنيع ينتظر وصول ألواح الأبلكاش من المورد.'
  },
  {
    id: 'prj-104',
    projectNumber: 'PRJ-2026-004',
    projectName: 'مطبخ أكريليك أبيض لامع - جليم الإسكندرية',
    customerId: 'cust-6',
    customerName: 'د. نورهان علي',
    customerPhone: '01199887711',
    branchId: 'branch-4',
    branchName: 'معرض الإسكندرية - سموحة',
    projectType: 'kitchen',
    assignedUserId: 'user-4',
    assignedUserName: 'عمر فاروق',
    status: 'handed_over_to_tech_office',
    createdDate: '2026-08-04',
    lastUpdatedDate: '2026-08-27 13:30',
    contractId: 'cnt-104',
    handoverId: 'hnd-104',
    notes: 'مطبخ مستقيم 3.6م + وحدة طولية للثلاجة، أكريليك أبيض هاي جلوس بمقابض جولا. العقد موقع والعربون محصل، ومحضر التسليم لدى المكتب الفني.'
  },
  {
    id: 'prj-105',
    projectNumber: 'PRJ-2026-005',
    projectName: 'مطبخ ودريسنج روم فيلا الشويفات',
    customerId: 'cust-8',
    customerName: 'د. هناء شريف',
    customerPhone: '01011223344',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    projectType: 'kitchen',
    assignedUserId: 'user-4',
    assignedUserName: 'عمر فاروق',
    status: 'completed',
    createdDate: '2026-04-12',
    lastUpdatedDate: '2026-07-10 17:00',
    contractId: 'cnt-105',
    notes: 'تم التسليم النهائي وتفعيل الضمان 5 سنوات. العميلة رشحت عميلين جدد.'
  },
  {
    id: 'prj-106',
    projectNumber: 'PRJ-2026-006',
    projectName: 'مطبخ لاكيه مط بجزيرة - العاصمة الإدارية',
    customerId: 'cust-9',
    customerName: 'د. ياسر الحلواني',
    customerPhone: '01200112233',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    projectType: 'kitchen',
    assignedUserId: 'user-4',
    assignedUserName: 'عمر فاروق',
    status: 'design_review',
    createdDate: '2026-08-10',
    lastUpdatedDate: '2026-08-27 20:00',
    notes: 'تمت المعاينة والرفع بالليزر. التصميم 3D مرسل للعميل للمراجعة: لاكيه رمادي مط مع جزيرة 220سم.'
  },
  {
    id: 'prj-107',
    projectNumber: 'PRJ-2026-007',
    projectName: 'مطبخ HPL ودريسنج غرفة الماستر - سموحة',
    customerId: 'cust-5',
    customerName: 'م. كريم عبد العزيز',
    customerPhone: '01055443322',
    branchId: 'branch-4',
    branchName: 'معرض الإسكندرية - سموحة',
    projectType: 'kitchen',
    assignedUserId: 'user-4',
    assignedUserName: 'عمر فاروق',
    status: 'quotation_sent',
    createdDate: '2026-08-18',
    lastUpdatedDate: '2026-08-26 19:45',
    notes: 'عرض السعر مرسل على الواتساب ومنتظر رد العميل خلال الأسبوع.'
  },
  {
    id: 'prj-108',
    projectNumber: 'PRJ-2026-008',
    projectName: 'توريد 12 مطبخ لوحدات التاون هاوس - كمبوند الريادة',
    customerId: 'cust-4',
    customerName: 'شركة الريادة للتطوير العقاري',
    customerPhone: '01099887766',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    projectType: 'kitchen',
    assignedUserId: 'user-1',
    assignedUserName: 'م. عمرو عباس',
    status: 'quotation',
    createdDate: '2026-08-22',
    lastUpdatedDate: '2026-08-27 16:00',
    notes: 'مناقصة توريد وتركيب 12 مطبخ بمواصفة موحدة. جاري إعداد عرض السعر الفني والمالي.'
  },
  {
    id: 'prj-109',
    projectNumber: 'PRJ-2026-009',
    projectName: 'دريسنج روم ووحدة تلفزيون - الشيخ زايد',
    customerId: 'cust-10',
    customerName: 'أ. ريم فؤاد',
    customerPhone: '01077665544',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    projectType: 'wardrobe',
    assignedUserId: 'user-4',
    assignedUserName: 'عمر فاروق',
    status: 'visit_scheduled',
    createdDate: '2026-08-24',
    lastUpdatedDate: '2026-08-25 10:30',
    notes: 'موعد معاينة ورفع مقاسات محدد بالموقع.'
  },
  {
    id: 'prj-110',
    projectNumber: 'PRJ-2026-010',
    projectName: 'مطبخ مودرن ودريسنج - مصر الجديدة',
    customerId: 'cust-13',
    customerName: 'أ. منى الشافعي',
    customerPhone: '01153344221',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    projectType: 'kitchen',
    assignedUserId: 'user-4',
    assignedUserName: 'عمر فاروق',
    status: 'opportunity',
    createdDate: '2026-08-27',
    lastUpdatedDate: '2026-08-27 21:00',
    notes: 'عميلة جديدة من إعلان إنستجرام، تطلب زيارة المعرض يوم السبت.'
  }
];

export const initialSiteVisits: SiteVisit[] = [
  {
    id: 'vis-201',
    projectId: 'prj-101',
    projectNumber: 'PRJ-2026-001',
    customerName: 'محمد حسن',
    date: '2026-08-05',
    time: '16:00',
    address: 'فيلا 14 - شارع النرجس الرئيسي - التجمع الخامس',
    assignedUserId: 'user-4',
    assignedUserName: 'عمر فاروق',
    status: 'completed',
    notes: 'تمت معاينة الموقع وتصوير الجدران بالفيديو واكتشاف عمود خرساني بارز بالجدار B وتم رفع المقاسات بدقة.',
    photos: [
      KITCHEN_DRAWINGS.plan,
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600'
    ],
    videos: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    ],
    siteConditions: {
      hasColumn: true,
      columnDetails: 'عمود بارز 15سم × 30سم بالزاوية اليمين للجدار B',
      windowLocation: 'جدار B يبدأ النافذة بعد 90سم من الزاوية اليسرى (ارتفاع الجلسة 100سم)',
      electricalPoints: 'توجد 4 نقاط كهرباء على ارتفاع 110سم جاهزة للوحدات ومأخذ شفاط 220V',
      waterConnection: 'توصيلات مياه وصرف جاهزة بالجدار A على بعد 180سم من الزاوية',
      gasConnection: 'محبس غاز طبيعي قائم بجوار جدار A',
      ceilingHeight: '280 سم (سقف معلق جبسوم بورد بيت نور)',
      wallStraightness: 'استقامة الجدران 90° ممتازة مع انحراف بسيط 0.5سم بالجدار B',
      flooringLevel: 'أرضية بورسلين مستوية 100%',
      customerPreferences: 'يرغب العميل في جزيرة وسطية (Island 180cm) مع رخام اسباني جالاكسي أسود'
    }
  },
  {
    id: 'vis-202',
    projectId: 'prj-109',
    projectNumber: 'PRJ-2026-009',
    customerName: 'أ. ريم فؤاد',
    date: '2026-08-30',
    time: '11:00',
    address: 'فيلا 9 - الحي السادس عشر - الشيخ زايد',
    assignedUserId: 'user-4',
    assignedUserName: 'عمر فاروق',
    status: 'scheduled',
    notes: 'رفع مقاسات غرفة الدريسنج وحائط التلفزيون بالليزر وتصوير الموقع.',
    photos: []
  },
  {
    id: 'vis-203',
    projectId: 'prj-106',
    projectNumber: 'PRJ-2026-006',
    customerName: 'د. ياسر الحلواني',
    date: '2026-08-14',
    time: '12:00',
    address: 'فيلا 31 - الحي السكني R3 - العاصمة الإدارية',
    assignedUserId: 'user-4',
    assignedUserName: 'عمر فاروق',
    status: 'completed',
    notes: 'تمت المعاينة والرفع بالليزر. مساحة المطبخ مفتوحة على الريسبشن وتسمح بجزيرة 220سم.',
    photos: []
  }
];

export const initialProjectMeasurements: ProjectMeasurement[] = [
  {
    id: 'meas-301',
    projectId: 'prj-101',
    version: 1,
    createdDate: '2026-08-06',
    createdByUserName: 'عمر فاروق',
    reasonForUpdate: 'رفع المقاسات الفعلي بالموقع مع التقرير الفني الميداني',
    sitePhotos: [
      KITCHEN_DRAWINGS.plan,
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600'
    ],
    siteVideos: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    ],
    technicalNotes: 'تم فحص الموقع الكترونياً بالليزر واكتمال تأسيسات السباكة والكهرباء 100%',
    items: [
      { id: 'mi-1', name: 'جدار A الرئيسي (موقع الحوض والصرف)', value: 420, unit: 'cm', notes: 'يحتوي على توصيلات المياه والصرف ومأخذ فلتر المياه' },
      { id: 'mi-2', name: 'جدار B الجانبي (موقع البوتاجاز والشفاط)', value: 310, unit: 'cm', notes: 'يوجد عمود بارز 15سم × 30سم' },
      { id: 'mi-3', name: 'ارتفاع السقف صافي بعد الجبسوم بورد', value: 280, unit: 'cm', notes: 'سقف جبسوم بورد مع إضاءة سبوت لايت' },
      { id: 'mi-4', name: 'عمق الكابينة السفلية القياسي', value: 60, unit: 'cm' },
      { id: 'mi-5', name: 'موقع شباك التهوية الجانبي', value: 120, unit: 'cm', notes: 'عرض الشباك 100سم وارتفاع الجلسة 105سم' }
    ]
  },
  {
    id: 'meas-302',
    projectId: 'prj-101',
    version: 2,
    createdDate: '2026-08-08',
    createdByUserName: 'عمر فاروق',
    reasonForUpdate: 'تعديل مقاسات الجدار B بناءً على رغبة العميل لإضافة غسالة أطباق بلت ان 60سم',
    sitePhotos: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600'
    ],
    technicalNotes: 'تم تعديل تخطيط الكبائن السفلية لتتسع للغسالة البلت إن',
    items: [
      { id: 'mi-1b', name: 'جدار A الرئيسي (موقع الحوض والصرف)', value: 420, unit: 'cm', notes: 'توصيلات مياه وصرف معتمدة' },
      { id: 'mi-2b', name: 'جدار B الجانبي المعدل', value: 340, unit: 'cm', notes: 'تم تمديد المساحة لتركيب غسالة أطباق بلت إن 60سم' },
      { id: 'mi-3b', name: 'ارتفاع السقف صافي', value: 280, unit: 'cm' },
      { id: 'mi-4b', name: 'عمق الكابينة السفلية القياسي', value: 60, unit: 'cm' },
      { id: 'mi-5b', name: 'عرض مكان غسالة الأطباق البلت إن', value: 60, unit: 'cm', notes: 'توفير مخرج مياه وصرف مستقل خلف الغسالة' }
    ]
  }
];

export const initialProjectDesigns: ProjectDesign[] = [
  {
    id: 'dsg-401',
    projectId: 'prj-101',
    designName: 'تصميم مطبخ مودرن رويل 3D',
    version: 1,
    images: [
      KITCHEN_DRAWINGS.plan
    ],
    notes: 'النسخة الأولى: دلف علوية باللون الرمادي وجزيرة 150سم.',
    createdByUserName: 'عمر فاروق',
    createdDate: '2026-08-10',
    status: 'rejected',
    rejectionReason: 'تغيير لون الدلف العلوية إلى أوف وايت وإعادة توزيع الجزيرة المركزية لتكون 180سم',
    comments: [
      { id: 'c-1', userName: 'محمد حسن', text: 'يرجى تغيير لون الوحدات العلوية وتوسيع الجزيرة', date: '2026-08-10 20:00', isCustomer: true }
    ]
  },
  {
    id: 'dsg-402',
    projectId: 'prj-101',
    designName: 'تصميم مطبخ مودرن رويل 3D المعدل',
    version: 2,
    images: [
      KITCHEN_DRAWINGS.plan,
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600'
    ],
    notes: 'النسخة الثانية المعتمدة: دلف أوف وايت HPL + جزيرة 180سم مع رخام جالاكسي أسود.',
    createdByUserName: 'عمر فاروق',
    createdDate: '2026-08-13',
    status: 'approved',
    approvedAt: '2026-08-14 21:00',
    approvedByCustomerName: 'م. طارق المنشاوي',
    comments: [
      { id: 'c-2', userName: 'محمد حسن', text: 'التصميم الجديد ممتاز جداً، برجاء إرسال عرض السعر النهائي', date: '2026-08-14 19:30', isCustomer: true }
    ]
  },

  // Project 3 Approved Design
  {
    id: 'dsg-403',
    projectId: 'prj-103',
    designName: 'تصميم مطبخ كلاسيك أرو 3D',
    version: 2,
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=600'
    ],
    notes: 'التصميم النهائي المعتمد: مطبخ U كلاسيك بقشرة أرو ورخام كريما مارفيل.',
    createdByUserName: 'عمر فاروق',
    createdDate: '2026-08-12',
    status: 'approved',
    approvedAt: '2026-08-16 14:00',
    approvedByCustomerName: 'أ. شريف مدكور',
    comments: [
      { id: 'c-3', userName: 'أ. شريف مدكور', text: 'تمت الموافقة على التصميم، برجاء إرسال عرض السعر النهائي', date: '2026-08-16 14:00', isCustomer: true }
    ]
  },

  // PRJ-2026-006 — design sent for customer review
  {
    id: 'dsg-404',
    projectId: 'prj-106',
    designName: 'تصميم مطبخ لاكيه رمادي مط بجزيرة 3D',
    version: 1,
    images: [KITCHEN_DRAWINGS.plan],
    notes: 'لاكيه رمادي مط مع جزيرة 220سم ورخام كوارتز أبيض.',
    createdByUserName: 'عمر فاروق',
    createdDate: '2026-08-26',
    status: 'sent_to_customer',
    comments: []
  }
];

export const initialProjectQuotations: ProjectQuotation[] = [
  {
    id: 'qte-501',
    projectId: 'prj-101',
    version: 1,
    createdDate: '2026-08-15',
    createdByUserName: 'عمر فاروق',
    status: 'accepted',
    acceptedAt: '2026-08-16 17:30',
    acceptedByCustomerName: 'م. طارق المنشاوي',
    items: [
      { id: 'qi-1', materialId: 'mat-1', materialName: 'MDF ملامين أبيض 18مم اسباني', itemType: 'material', description: 'هيكل الكبائن السفلية والعلوية والطولية', quantity: 18, unit: 'Sheet', unitCost: 1650, unitSellingPrice: 2800, totalCost: 29700, totalSellingPrice: 50400 },
      { id: 'qi-2', materialId: 'mat-3', materialName: 'ألواح HPL خشابي أرو هندي', itemType: 'material', description: 'دلف خارجية وتجليد الجزيرة', quantity: 14, unit: 'Sheet', unitCost: 1400, unitSellingPrice: 2900, totalCost: 19600, totalSellingPrice: 40600 },
      { id: 'qi-3', materialId: 'mat-6', materialName: 'مفصلة سوفت كلوز Blum هيدروليك 110°', itemType: 'accessory', description: 'مفصلات إغلاق صامت للدلف', quantity: 36, unit: 'Piece', unitCost: 210, unitSellingPrice: 350, totalCost: 7560, totalSellingPrice: 12600 },
      { id: 'qi-4', materialId: 'mat-7', materialName: 'مجرى درج هيدروليك Tandembox Blum', itemType: 'accessory', description: 'أدراج سفلية بإغلاق هادئ', quantity: 8, unit: 'Set', unitCost: 1350, unitSellingPrice: 2300, totalCost: 10800, totalSellingPrice: 18400 },
      { id: 'qi-5', materialId: 'mat-14', materialName: 'رخام جالاكسي أسود اسباني', itemType: 'material', description: 'قرصة المطبخ والجزيرة مع فتحات الحوض والبوتاجاز', quantity: 6, unit: 'Meter', unitCost: 3200, unitSellingPrice: 4800, totalCost: 19200, totalSellingPrice: 28800 },
      { id: 'qi-6', materialName: 'ميكانيزم Blum Aventos HF + ركنة ماجيك كورنر', itemType: 'accessory', description: 'قلابات علوية مزدوجة وركنة سحب هيدروليك', quantity: 1, unit: 'طقم', unitCost: 14000, unitSellingPrice: 24500, totalCost: 14000, totalSellingPrice: 24500 },
      { id: 'qi-7', materialName: 'إكسسوارات داخلية استانلس (مجفف + ترولي زيوت + مقسمات)', itemType: 'accessory', quantity: 1, unit: 'طقم', unitCost: 6200, unitSellingPrice: 9700, totalCost: 6200, totalSellingPrice: 9700 },
      { id: 'qi-8', materialName: 'مقابض جولا ألومنيوم أسود + ليد بروفايل غاطس', itemType: 'accessory', quantity: 1, unit: 'طقم', unitCost: 5400, unitSellingPrice: 10000, totalCost: 5400, totalSellingPrice: 10000 },
      { id: 'qi-9', materialName: 'مصنعيات التصنيع والنقل والتركيب بالفيلا', itemType: 'work', description: 'تقطيع CNC وقشاط وتجميع وتركيب مع ضمان 5 سنوات', quantity: 1, unit: 'خدمة', unitCost: 24000, unitSellingPrice: 55000, totalCost: 24000, totalSellingPrice: 55000 }
    ],
    subtotalSelling: 250000,
    subtotalCost: 136460,
    discount: 0,
    totalSelling: 250000,
    totalCost: 136460,
    estimatedProfit: 113540,
    notes: 'عرض سعر معتمد للمطبخ شامل الخامات والتصنيع والتركيب بالفيلا والضمان 5 سنوات. الأسعار غير شاملة ضريبة القيمة المضافة 14%.',
    breakdown: {
      quoteType: 'kitchen',
      specifications: {
        doors: 'HPL هندي خشابي أرو مقاوم للحرارة والخدش',
        carcass: 'MDF ملامين أبيض 18مم اسباني معالج ضد الرطوبة',
        hinges: 'مفصلات Blum Clip-Top سوفت كلوز ومجاري أدراج Tandembox',
        notes: 'يشمل التصميم 3D والمعاينة الفنية بالموقع وضمان 5 سنوات'
      },
      meterage: {
        baseUnitsMeters: 4.5,
        upperUnitsMeters: 4.5,
        tallUnitsMeters: 2.5,
        totalMeters: 11.5,
        pricePerMeter: 14000,
        totalPrice: 161000
      },
      additions: {
        handles: { description: 'مقابض بروفايل Gola ألومنيوم مدمجة أسود مط', price: 4500 },
        ledProfile: { description: 'شريط ليد بروفايل غاطس Warm 3000K مع حساس لمس', price: 7500 },
        glassFrames: { description: 'دلفة زجاج فاميه بني مع فريم ألومنيوم أسود', price: 5500 },
        cladding: { description: 'تجاليد HPL خلف الجزيرة', price: 6500 },
        totalPrice: 24000
      },
      mechanisms: [
        { id: 'm-1', name: 'ميكانيزم قلاب Blum Aventos HF مزدوج', quantity: 2, unit: 'طقم', unitPrice: 6500, totalPrice: 13000, notes: 'للوحدات العلوية المزدوجة' },
        { id: 'm-2', name: 'وحدة ركنة ماجيك كورنر هيدروليك ستانلس', quantity: 1, unit: 'وحدة', unitPrice: 6500, totalPrice: 6500, notes: 'لاستغلال ركنة المطبخ' }
      ],
      accessories: [
        { id: 'a-1', name: 'مجفف أطباق مدمج استانلس 304 (80 سم)', quantity: 1, unit: 'قطعة', unitPrice: 2900, totalPrice: 2900 },
        { id: 'a-2', name: 'سلة ترولي زيوت وتوابل استانلس (20 سم)', quantity: 1, unit: 'قطعة', unitPrice: 2400, totalPrice: 2400 },
        { id: 'a-3', name: 'مقسم أدراج معالق وسكاكين', quantity: 2, unit: 'طقم', unitPrice: 1100, totalPrice: 2200 }
      ],
      marble: {
        typeName: 'رخام جالاكسي أسود اسباني دبل مع شطف ليزر وفتحة حوض وبوتاجاز بلت-إن',
        meters: 6.0,
        pricePerMeter: 4500,
        totalPrice: 27000
      },
      otherWorks: [
        { id: 'o-1', name: 'تهيئة وصلات الكهرباء والصرف وتوصيل الأجهزة البلت-إن', quantity: 1, unit: 'خدمة', unitPrice: 4000, totalPrice: 4000 }
      ],
      logistics: {
        location: 'فيلا 14 - شارع النرجس - التجمع الخامس',
        floor: 'الدور الأرضي',
        notes: 'شامل النقل بسيارات الشركة وفريق التركيب',
        totalPrice: 7000
      },
      grandTotal: 250000,
      paymentTerms: {
        downPaymentPercent: 40,
        productionPaymentPercent: 40,
        deliveryPaymentPercent: 20,
        deliveryDurationDays: '25 - 35 يوم عمل',
        warrantyYears: 5
      }
    }
  },

  // PRJ-2026-003 — classic oak kitchen (accepted)
  {
    id: 'qte-502',
    projectId: 'prj-103',
    version: 2,
    createdDate: '2026-08-14',
    createdByUserName: 'عمر فاروق',
    status: 'accepted',
    acceptedAt: '2026-08-17 13:00',
    acceptedByCustomerName: 'أ. شريف مدكور',
    items: [
      { id: 'qi-21', materialName: 'أبلكاج كونتر قشرة أرو طبيعي وجهين 18مم', itemType: 'material', description: 'دلف وإطارات الكلاسيك', quantity: 16, unit: 'Sheet', unitCost: 2300, unitSellingPrice: 3600, totalCost: 36800, totalSellingPrice: 57600 },
      { id: 'qi-22', materialId: 'mat-1', materialName: 'MDF ملامين أبيض 18مم اسباني', itemType: 'material', description: 'هيكل الكبائن', quantity: 14, unit: 'Sheet', unitCost: 1650, unitSellingPrice: 2800, totalCost: 23100, totalSellingPrice: 39200 },
      { id: 'qi-23', materialName: 'دهان أستر مط مسامي مفتوح (طبقتين + سيلر)', itemType: 'work', quantity: 1, unit: 'خدمة', unitCost: 9500, unitSellingPrice: 18000, totalCost: 9500, totalSellingPrice: 18000 },
      { id: 'qi-24', materialName: 'مفصلات ومجاري Blum + مقابض نحاس عتيق', itemType: 'accessory', quantity: 1, unit: 'طقم', unitCost: 13800, unitSellingPrice: 22000, totalCost: 13800, totalSellingPrice: 22000 },
      { id: 'qi-25', materialName: 'رخام كريما مارفيل اسباني', itemType: 'material', quantity: 5.5, unit: 'Meter', unitCost: 3000, unitSellingPrice: 4600, totalCost: 16500, totalSellingPrice: 25300 },
      { id: 'qi-26', materialName: 'مصنعيات التصنيع والنقل والتركيب', itemType: 'work', quantity: 1, unit: 'خدمة', unitCost: 21000, unitSellingPrice: 47900, totalCost: 21000, totalSellingPrice: 47900 }
    ],
    subtotalSelling: 210000,
    subtotalCost: 120700,
    discount: 0,
    totalSelling: 210000,
    totalCost: 120700,
    estimatedProfit: 89300,
    notes: 'النسخة الثانية بعد تغيير الرخام إلى كريما مارفيل. الأسعار غير شاملة ضريبة القيمة المضافة 14%.'
  },

  // PRJ-2026-007 — HPL kitchen + master dressing (sent, awaiting reply)
  {
    id: 'qte-503',
    projectId: 'prj-107',
    version: 1,
    createdDate: '2026-08-24',
    createdByUserName: 'عمر فاروق',
    status: 'sent',
    items: [
      { id: 'qi-31', materialName: 'مطبخ HPL رمادي جرافيت - 8.5 متر طولي', itemType: 'product', quantity: 8.5, unit: 'متر', unitCost: 7800, unitSellingPrice: 13500, totalCost: 66300, totalSellingPrice: 114750 },
      { id: 'qi-32', materialName: 'دريسنج روم ماستر ملامين تركي - 3.2 متر', itemType: 'product', quantity: 3.2, unit: 'متر', unitCost: 9000, unitSellingPrice: 15500, totalCost: 28800, totalSellingPrice: 49600 },
      { id: 'qi-33', materialName: 'رخام جالاكسي أسود + إكسسوارات Blum', itemType: 'accessory', quantity: 1, unit: 'طقم', unitCost: 17500, unitSellingPrice: 25650, totalCost: 17500, totalSellingPrice: 25650 },
      { id: 'qi-34', materialName: 'النقل والتركيب بالإسكندرية', itemType: 'work', quantity: 1, unit: 'خدمة', unitCost: 2500, unitSellingPrice: 5000, totalCost: 2500, totalSellingPrice: 5000 }
    ],
    subtotalSelling: 195000,
    subtotalCost: 115100,
    discount: 0,
    totalSelling: 195000,
    totalCost: 115100,
    estimatedProfit: 79900,
    notes: 'مرسل للعميل على الواتساب. صلاحية العرض 14 يوماً. الأسعار غير شاملة ضريبة القيمة المضافة 14%.'
  },

  // PRJ-2026-008 — 12 town-house kitchens (draft under preparation)
  {
    id: 'qte-504',
    projectId: 'prj-108',
    version: 1,
    createdDate: '2026-08-27',
    createdByUserName: 'م. عمرو عباس',
    status: 'draft',
    items: [
      { id: 'qi-41', materialName: 'مطبخ تاون هاوس موحد HPL أبيض مط - 6.5 متر طولي', itemType: 'product', quantity: 12, unit: 'مطبخ', unitCost: 98000, unitSellingPrice: 152000, totalCost: 1176000, totalSellingPrice: 1824000 },
      { id: 'qi-42', materialName: 'توريد وتركيب بالموقع (12 وحدة)', itemType: 'work', quantity: 12, unit: 'وحدة', unitCost: 6500, unitSellingPrice: 13000, totalCost: 78000, totalSellingPrice: 156000 }
    ],
    subtotalSelling: 1980000,
    subtotalCost: 1254000,
    discount: 0,
    totalSelling: 1980000,
    totalCost: 1254000,
    estimatedProfit: 726000,
    notes: 'مسودة للمراجعة الداخلية قبل إرسالها لإدارة مشتريات الشركة.'
  }
];

export const initialProjectTimelineEvents: ProjectTimelineEvent[] = [
  {
    id: 'tle-1',
    projectId: 'prj-101',
    title: 'إنشاء مشروع مطبخ تفصيل جديد',
    description: 'تم تسجيل المشروع وتكليف المهندس عمر فاروق بمتابعة المقاسات',
    timestamp: '2026-08-01 10:00',
    userName: 'عمر فاروق',
    type: 'created'
  },
  {
    id: 'tle-2',
    projectId: 'prj-101',
    title: 'جدولة معاينة ومقاسات بالموقع',
    description: 'تم تحديد موعد المعاينة بالفيلا في التجمع الخامس',
    timestamp: '2026-08-03 12:00',
    userName: 'عمر فاروق',
    type: 'visit'
  },
  {
    id: 'tle-3',
    projectId: 'prj-101',
    title: 'إتمام رفع المقاسات وتوثيق حالة الموقع (V1)',
    description: 'تم رفع مقاسات الجدران وارتفاع السقف واكتشاف العمود الخرساني',
    timestamp: '2026-08-05 18:00',
    userName: 'عمر فاروق',
    type: 'measurement'
  },
  {
    id: 'tle-4',
    projectId: 'prj-101',
    title: 'تحديث مقاسات الجدار B (V2)',
    description: 'تم تمديد مقاسات الجدار B بناءً على اختيار غسالة الأطباق البلت ان',
    timestamp: '2026-08-08 11:00',
    userName: 'عمر فاروق',
    type: 'measurement'
  },
  {
    id: 'tle-5',
    projectId: 'prj-101',
    title: 'رفع التصميم المبدئي 3D (V1)',
    description: 'تم إرسال النسخة الأولى للتصميم 3D للعميل للمراجعة',
    timestamp: '2026-08-10 15:00',
    userName: 'عمر فاروق',
    type: 'design'
  },
  {
    id: 'tle-6',
    projectId: 'prj-101',
    title: 'طلب تعديل على التصميم من العميل (V1 Rejected)',
    description: 'ملاحظة العميل: تغيير لون الدلف العلوية وإعادة توزيع الجزيرة',
    timestamp: '2026-08-10 20:00',
    userName: 'محمد حسن',
    type: 'design'
  },
  {
    id: 'tle-7',
    projectId: 'prj-101',
    title: 'رفع التصميم المعدل 3D (V2) وإصدار عرض السعر المبدئي',
    description: 'تم رفع النسخة الثانية المعدلة وإرفاق عرض السعر المبدئي',
    timestamp: '2026-08-13 14:00',
    userName: 'عمر فاروق',
    type: 'quotation'
  },
  {
    id: 'tle-8',
    projectId: 'prj-101',
    title: 'موافقة العميل على عرض السعر V1',
    description: 'وافق العميل على عرض السعر بقيمة 250,000 ج.م قبل الضريبة',
    timestamp: '2026-08-16 17:30',
    userName: 'م. طارق المنشاوي',
    type: 'approval'
  },
  {
    id: 'tle-9',
    projectId: 'prj-101',
    title: 'توقيع العقد CNT-2026-001 وتحصيل العربون',
    description: 'تحصيل عربون 40% بقيمة 100,000 ج.م بتحويل بنكي (RCP-2026-001)',
    timestamp: '2026-08-18 19:00',
    userName: 'سارة الشريف',
    type: 'contract'
  },
  {
    id: 'tle-10',
    projectId: 'prj-101',
    title: 'تسليم المشروع للمكتب الفني',
    description: 'قبول محضر التسليم وتكليف م. إبراهيم فؤاد بالرفع المساحي والـ BOM',
    timestamp: '2026-08-19 09:00',
    userName: 'م. إبراهيم فؤاد',
    type: 'handover'
  },
  {
    id: 'tle-11',
    projectId: 'prj-101',
    title: 'الإفراج الفني للتخطيط REL-2026-001',
    description: 'اعتماد قوائم التقطيع REV-A وحجز الخامات بالمخزن',
    timestamp: '2026-08-24 14:30',
    userName: 'م. إبراهيم فؤاد',
    type: 'system'
  },
  {
    id: 'tle-12',
    projectId: 'prj-101',
    title: 'بدء التصنيع PROD-2026-0012',
    description: 'بدء التقطيع على ماكينة CNC ومتابعة المراحل من كشك الورشة',
    timestamp: '2026-08-26 09:15',
    userName: 'خالد توفيق',
    type: 'production'
  }
];
