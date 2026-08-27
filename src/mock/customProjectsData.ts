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
    projectName: 'مطبخ مودرن رويل HPL',
    customerId: 'cust-1',
    customerName: 'محمد حسن',
    customerPhone: '01009876543',
    branchId: 'branch-1',
    branchName: 'المعرض الرئيسي - القاهرة',
    projectType: 'kitchen',
    assignedUserId: 'user-4',
    assignedUserName: 'عمر فاروق',
    status: 'design_review',
    createdDate: '2026-08-18',
    lastUpdatedDate: '2026-08-26 19:30',
    notes: 'مطبخ تفصيل HPL هندي مع إكسسوارات ومفصلات Blum سوفت كلوز وزجاج فاميه بني.'
  },
  {
    id: 'prj-102',
    projectNumber: 'PRJ-2026-002',
    projectName: 'غرفة نوم ماستر كابتونيه شامبين',
    customerId: 'cust-2',
    customerName: 'أحمد محمود',
    customerPhone: '01112223344',
    branchId: 'branch-1',
    branchName: 'المعرض الرئيسي - القاهرة',
    projectType: 'bedroom',
    assignedUserId: 'user-1',
    assignedUserName: 'أحمد محمود',
    status: 'quotation',
    createdDate: '2026-08-10',
    lastUpdatedDate: '2026-08-25 16:00',
    notes: 'غرفة نوم تفصيل بمقاس خاص لسرير 190سم ودولاب جرار 300سم.'
  },
  {
    id: 'prj-103',
    projectNumber: 'PRJ-2026-003',
    projectName: 'وحدة تلفزيون مودرن خشابي + مكتبة',
    customerId: 'cust-3',
    customerName: 'سارة علي',
    customerPhone: '01223344556',
    branchId: 'branch-1',
    branchName: 'المعرض الرئيسي - القاهرة',
    projectType: 'tv_unit',
    assignedUserId: 'user-1',
    assignedUserName: 'أحمد محمود',
    status: 'approved',
    createdDate: '2026-08-01',
    lastUpdatedDate: '2026-08-24 14:00',
    notes: 'تم قبول عرض السعر والتصميم النهائي واعتماد العقد للإنتاج بالورشة.'
  }
];

export const initialSiteVisits: SiteVisit[] = [
  {
    id: 'vis-201',
    projectId: 'prj-101',
    projectNumber: 'PRJ-2026-001',
    customerName: 'محمد حسن',
    date: '2026-08-20',
    time: '16:00',
    address: 'فيلا 14 - شارع النرجس الرئيسي - التجمع الخامس',
    assignedUserId: 'user-4',
    assignedUserName: 'عمر فاروق',
    status: 'completed',
    notes: 'تمت معاينة الموقع وتصوير الجدران بالفيديو واكتشاف عمود خرساني بارز بالجدار B وتم رفع المقاسات بدقة.',
    photos: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600',
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
  }
];

export const initialProjectMeasurements: ProjectMeasurement[] = [
  {
    id: 'meas-301',
    projectId: 'prj-101',
    version: 1,
    createdDate: '2026-08-21',
    createdByUserName: 'عمر فاروق',
    reasonForUpdate: 'رفع المقاسات الفعلي بالموقع مع التقرير الفني الميداني',
    sitePhotos: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600',
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
    createdDate: '2026-08-22',
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
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600'
    ],
    notes: 'النسخة الأولى: دلف علوية باللون الرمادي وجزيرة 150سم.',
    createdByUserName: 'عمر فاروق',
    createdDate: '2026-08-23',
    status: 'rejected',
    rejectionReason: 'تغيير لون الدلف العلوية إلى أوف وايت وإعادة توزيع الجزيرة المركزية لتكون 180سم',
    comments: [
      { id: 'c-1', userName: 'محمد حسن', text: 'يرجى تغيير لون الوحدات العلوية وتوسيع الجزيرة', date: '2026-08-23 20:00', isCustomer: true }
    ]
  },
  {
    id: 'dsg-402',
    projectId: 'prj-101',
    designName: 'تصميم مطبخ مودرن رويل 3D المعدل',
    version: 2,
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600'
    ],
    notes: 'النسخة الثانية المعتمدة: دلف أوف وايت HPL + جزيرة 180سم مع رخام جالاكسي أسود.',
    createdByUserName: 'عمر فاروق',
    createdDate: '2026-08-25',
    status: 'sent_to_customer',
    comments: [
      { id: 'c-2', userName: 'محمد حسن', text: 'التصميم الجديد ممتاز جداً، برجاء إرسال عرض السعر النهائي', date: '2026-08-26 19:30', isCustomer: true }
    ]
  },

  // Project 3 Approved Design
  {
    id: 'dsg-403',
    projectId: 'prj-103',
    designName: 'تصميم وحدة تلفزيون أرو 3D',
    version: 2,
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=600'
    ],
    notes: 'التصميم النهائي المعتمد لوحدة التلفزيون الخشابي.',
    createdByUserName: 'أحمد محمود',
    createdDate: '2026-08-20',
    status: 'approved',
    approvedAt: '2026-08-24 14:00',
    approvedByCustomerName: 'سارة علي',
    comments: [
      { id: 'c-3', userName: 'سارة علي', text: 'تمت الموافقة على التصميم والبدء في الإنتاج', date: '2026-08-24 14:00', isCustomer: true }
    ]
  }
];

export const initialProjectQuotations: ProjectQuotation[] = [
  {
    id: 'qte-501',
    projectId: 'prj-101',
    version: 1,
    createdDate: '2026-08-24',
    createdByUserName: 'عمر فاروق',
    status: 'sent',
    items: [
      { id: 'qi-1', materialId: 'mat-1', materialName: 'MDF أبيض 18مم اسباني', itemType: 'material', description: 'كابينات وتصنيع الهيكل الداخلي', quantity: 8, unit: 'Sheet', unitCost: 1250, unitSellingPrice: 1900, totalCost: 10000, totalSellingPrice: 15200 },
      { id: 'qi-2', materialId: 'mat-3', materialName: 'ألواح HPL خشابي أرو هندي', itemType: 'material', description: 'تغليف الدلف الخارجية والجزيرة', quantity: 12, unit: 'Sheet', unitCost: 850, unitSellingPrice: 1400, totalCost: 10200, totalSellingPrice: 16800 },
      { id: 'qi-3', materialId: 'mat-6', materialName: 'مفصلة سوفت كلوز Blum هيدروليك', itemType: 'accessory', description: 'مفصلات إغلاق صامت للدولاف', quantity: 24, unit: 'Piece', unitCost: 85, unitSellingPrice: 140, totalCost: 2040, totalSellingPrice: 3360 },
      { id: 'qi-4', materialId: 'mat-7', materialName: 'مجرى درج هيدروليك Tandembox Blum', itemType: 'accessory', description: 'مجارى أدراج هيدروليك للأدراج السفلية', quantity: 6, unit: 'Set', unitCost: 320, unitSellingPrice: 520, totalCost: 1920, totalSellingPrice: 3120 },
      { id: 'qi-5', materialId: 'mat-14', materialName: 'رخام جالاكسي أسود اسباني', itemType: 'material', description: 'قرصة رخام المطبخ والجزيرة', quantity: 6, unit: 'Meter', unitCost: 1800, unitSellingPrice: 2800, totalCost: 10800, totalSellingPrice: 16800 },
      { id: 'qi-6', materialName: 'مصنعيات قص وتجميع وتجميع بالورشة والتركيب', itemType: 'work', description: 'أجور العمالة والتركيب بالفيلا مع الضمان', quantity: 1, unit: 'خدمة', unitCost: 30000, unitSellingPrice: 63220, totalCost: 30000, totalSellingPrice: 63220 }
    ],
    subtotalSelling: 118500,
    subtotalCost: 64960,
    discount: 0,
    totalSelling: 118500,
    totalCost: 64960,
    estimatedProfit: 53540,
    notes: 'عرض سعر مبدئي معتمد للمطبخ شامل الخامات والتركيب بالفيلا والضمان 5 سنوات'
  },

  // Project 3 Accepted Quotation
  {
    id: 'qte-502',
    projectId: 'prj-103',
    version: 1,
    createdDate: '2026-08-22',
    createdByUserName: 'أحمد محمود',
    status: 'accepted',
    acceptedAt: '2026-08-24 14:00',
    acceptedByCustomerName: 'سارة علي',
    items: [
      { id: 'qi-7', materialId: 'mat-2', materialName: 'MDF أرو طبيعي 18مم', itemType: 'material', quantity: 5, unit: 'Sheet', unitCost: 1450, unitSellingPrice: 2200, totalCost: 7250, totalSellingPrice: 11000 },
      { id: 'qi-8', materialName: 'دهانات استر وشاسيه معلق ومصنعيات', itemType: 'work', quantity: 1, unit: 'خدمة', unitCost: 15000, unitSellingPrice: 31000, totalCost: 15000, totalSellingPrice: 31000 }
    ],
    subtotalSelling: 42000,
    subtotalCost: 22250,
    discount: 0,
    totalSelling: 42000,
    totalCost: 22250,
    estimatedProfit: 19750,
    notes: 'عرض سعر نهائي مقبول وموثق من العميلة سارة علي'
  }
];

export const initialProjectTimelineEvents: ProjectTimelineEvent[] = [
  {
    id: 'tle-1',
    projectId: 'prj-101',
    title: 'إنشاء مشروع مطبخ تفصيل جديد',
    description: 'تم تسجيل المشروع وتكليف المهندس عمر فاروق بمتابعة المقاسات',
    timestamp: '2026-08-18 10:00',
    userName: 'عمر فاروق',
    type: 'created'
  },
  {
    id: 'tle-2',
    projectId: 'prj-101',
    title: 'جدولة معاينة ومقاسات بالموقع',
    description: 'تم تحديد موعد المعاينة بالفيلا في التجمع الخامس',
    timestamp: '2026-08-19 12:00',
    userName: 'عمر فاروق',
    type: 'visit'
  },
  {
    id: 'tle-3',
    projectId: 'prj-101',
    title: 'إتمام رفع المقاسات وتوثيق حالة الموقع (V1)',
    description: 'تم رفع مقاسات الجدران وارتفاع السقف واكتشاف العمود الخرساني',
    timestamp: '2026-08-20 18:00',
    userName: 'عمر فاروق',
    type: 'measurement'
  },
  {
    id: 'tle-4',
    projectId: 'prj-101',
    title: 'تحديث مقاسات الجدار B (V2)',
    description: 'تم تمديد مقاسات الجدار B بناءً على اختيار غسالة الأطباق البلت ان',
    timestamp: '2026-08-22 11:00',
    userName: 'عمر فاروق',
    type: 'measurement'
  },
  {
    id: 'tle-5',
    projectId: 'prj-101',
    title: 'رفع التصميم المبدئي 3D (V1)',
    description: 'تم إرسال النسخة الأولى للتصميم 3D للعميل للمراجعة',
    timestamp: '2026-08-23 15:00',
    userName: 'عمر فاروق',
    type: 'design'
  },
  {
    id: 'tle-6',
    projectId: 'prj-101',
    title: 'طلب تعديل على التصميم من العميل (V1 Rejected)',
    description: 'ملاحظة العميل: تغيير لون الدلف العلوية وإعادة توزيع الجزيرة',
    timestamp: '2026-08-23 20:00',
    userName: 'محمد حسن',
    type: 'design'
  },
  {
    id: 'tle-7',
    projectId: 'prj-101',
    title: 'رفع التصميم المعدل 3D (V2) وإصدار عرض السعر المبدئي',
    description: 'تم رفع النسخة الثانية المعدلة وإرفاق عرض السعر المبدئي',
    timestamp: '2026-08-25 14:00',
    userName: 'عمر فاروق',
    type: 'quotation'
  }
];
