import { 
  Customer, 
  MarketingCampaign, 
  CustomerActivity, 
  CustomerReminder, 
  CustomerDocument, 
  AfterSalesRecord 
} from '../types/erp';

export const initialCampaigns: MarketingCampaign[] = [
  {
    id: 'cmp-1',
    name: 'حملة المطابخ الصيفية 2026',
    nameEn: 'Kitchen Summer Campaign 2026',
    platform: 'instagram',
    startDate: '2026-06-01',
    endDate: '2026-09-30',
    status: 'active',
    budget: 45000,
    externalId: 'META-CAMP-88912',
    customersCount: 14,
    purchasedCount: 4,
    revenueAttributed: 640000,
    notes: 'إعلانات ممولة مستهدفة لسكان التجمع والقاهرة الجديدة والمناطق الراقية'
  },
  {
    id: 'cmp-2',
    name: 'عرض عروض الصالون والمعيشة',
    nameEn: 'Living Room Offer 2026',
    platform: 'facebook',
    startDate: '2026-07-15',
    endDate: '2026-08-31',
    status: 'active',
    budget: 30000,
    externalId: 'FB-CAMP-77401',
    customersCount: 9,
    purchasedCount: 3,
    revenueAttributed: 310000,
    notes: 'عرض خصم 15% على أطقم السفرة والمعيشة الجاهزة'
  },
  {
    id: 'cmp-3',
    name: 'إطلاق مطابخ HPL مودرن',
    nameEn: 'Modern Kitchens Launch',
    platform: 'instagram',
    startDate: '2026-08-01',
    endDate: '2026-10-15',
    status: 'active',
    budget: 25000,
    externalId: 'INSTA-CAMP-9901',
    customersCount: 7,
    purchasedCount: 2,
    revenueAttributed: 290000,
    notes: 'فيديوهات ريلز تعرض عينات تشطيب مطابخ HPL وشاسيه زان'
  },
  {
    id: 'cmp-4',
    name: 'افتتاح معرض سموحة بالإسكندرية',
    nameEn: 'Alexandria Showroom Launch',
    platform: 'tiktok',
    startDate: '2026-05-10',
    endDate: '2026-07-31',
    status: 'completed',
    budget: 20000,
    externalId: 'TT-CAMP-3301',
    customersCount: 11,
    purchasedCount: 3,
    revenueAttributed: 245000,
    notes: 'حملة تيك توك لتغطية حفل افتتاح معرض الإسكندرية'
  },
  {
    id: 'cmp-5',
    name: 'طلب معاينة عبر الموقع الإلكتروني',
    nameEn: 'Website Direct Leads',
    platform: 'website',
    startDate: '2026-01-01',
    status: 'active',
    budget: 15000,
    externalId: 'WEB-FORM-001',
    customersCount: 8,
    purchasedCount: 3,
    revenueAttributed: 420000,
    notes: 'نموذج طلب المعاينة المجانية المباشر بموقع فيرني ميكر'
  }
];

export const initialCustomers: Customer[] = [
  // 1. Mohamed Hassan (Demo Scenario 1)
  {
    id: 'cust-1',
    fullName: 'محمد حسن',
    phone: '01009876543',
    altPhone: '0122114455',
    email: 'mohamed.hassan@gmail.com',
    city: 'القاهرة',
    area: 'التجمع الخامس - حي النرجس',
    address: 'فيلا 14 - شارع النرجس الرئيسي',
    interestType: 'kitchens',
    status: 'interested',
    source: 'instagram',
    campaignId: 'cmp-1',
    campaignName: 'حملة المطابخ الصيفية 2026',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    responsibleUserId: 'user-4',
    responsibleUserName: 'عمر فاروق',
    notes: 'مهتم بمطبخ HPL مودرن حرف L بمساحة 4x3متر. طلب كتالوج الألوان وعينات الخشب.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    createdDate: '2026-08-20',
    lastActivityDate: '2026-08-26 18:30',
    hasPurchased: false,
    isAfterSales: false,
    measurementDate: '2026-08-28'
  },

  // 2. Ahmed Mahmoud (Demo Scenario 2 - Complete History 360)
  {
    id: 'cust-2',
    fullName: 'أحمد محمود',
    phone: '01112223344',
    altPhone: '01004455667',
    email: 'ahmed.mahmoud.eng@yahoo.com',
    city: 'القاهرة',
    area: 'مدينة الشروق - كمبوند حسن علام',
    address: 'عمارة 8 - شقة 12',
    interestType: 'both',
    status: 'completed',
    source: 'facebook',
    campaignId: 'cmp-2',
    campaignName: 'عرض عروض الصالون والمعيشة',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    responsibleUserId: 'user-1',
    responsibleUserName: 'أحمد محمود',
    notes: 'تم توريد وتركيب مطبخ Polylac بالكامل + غرفة نوم ماستر وغرفة سفرة 8 كراسي. العميل راضٍ تماماً.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    createdDate: '2026-06-10',
    lastActivityDate: '2026-08-25 14:10',
    hasPurchased: true,
    isAfterSales: true,
    quotationRef: 'QUO-2026-089',
    quotationAmount: 185000,
    orderRef: 'ORD-2026-042',
    orderAmount: 185000,
    paidAmount: 185000
  },

  // 3. Sara Ali (Demo Scenario 3 - Lost Customer)
  {
    id: 'cust-3',
    fullName: 'سارة علي',
    phone: '01223344556',
    email: 'sara.ali@outlook.com',
    city: 'الجيزة',
    area: 'مدينة 6 أكتوبر - الحي المتميز',
    address: 'فيلا 88 - المجاورة الثالثة',
    interestType: 'kitchens',
    status: 'lost',
    lostReason: 'price',
    lostNote: 'الميزانية المتاحة لدى العميلة 90 ألف جنيه بينما التكلفة الإجمالية للمواصفات المطلوبة 140 ألف جنيه. تم الحفظ لإعادة التواصل في العروض القادمة.',
    source: 'facebook',
    campaignId: 'cmp-1',
    campaignName: 'حملة المطابخ الصيفية 2026',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    responsibleUserId: 'user-4',
    responsibleUserName: 'عمر فاروق',
    notes: 'تم تقديم عرض سعر بمبلغ 140,000 ج.م لمطبخ خشابي زان.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    createdDate: '2026-08-05',
    lastActivityDate: '2026-08-24 11:20',
    hasPurchased: false,
    isAfterSales: false
  },

  // 4. Mahmoud Nabil
  {
    id: 'cust-4',
    fullName: 'محمود نبيل',
    phone: '01099887766',
    city: 'القاهرة',
    area: 'التجمع الأول - البنفسج 4',
    interestType: 'furniture',
    status: 'measurement_scheduled',
    source: 'walk_in',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    responsibleUserId: 'user-2',
    responsibleUserName: 'محمود القاضي',
    notes: 'زيارة المعرض الرئيسي، يطلب معاينة لقياسات غرفة المعيشة وغرفة الأطفال.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    createdDate: '2026-08-22',
    lastActivityDate: '2026-08-26 16:00',
    hasPurchased: false,
    isAfterSales: false,
    measurementDate: '2026-08-29'
  },

  // 5. Karim Mohamed
  {
    id: 'cust-5',
    fullName: 'كريم محمد',
    phone: '01055443322',
    city: 'الإسكندرية',
    area: 'سموحة - طريق 14 مايو',
    interestType: 'both',
    status: 'quotation',
    source: 'whatsapp',
    branchId: 'branch-4',
    branchName: 'معرض الإسكندرية - سموحة',
    responsibleUserId: 'user-4',
    responsibleUserName: 'عمر فاروق',
    notes: 'تم إرسال المقاسات عبر الواتساب وقاري إعداد عرض السعر لمطبخ وقماش صالون.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    createdDate: '2026-08-18',
    lastActivityDate: '2026-08-25 19:45',
    hasPurchased: false,
    isAfterSales: false,
    quotationRef: 'QUO-2026-104',
    quotationAmount: 125000
  },

  // 6. Nourhan Ali
  {
    id: 'cust-6',
    fullName: 'نورهان علي',
    phone: '01199887711',
    city: 'الإسكندرية',
    area: 'جليم - شارع عبد السلام عارف',
    interestType: 'kitchens',
    status: 'won',
    source: 'tiktok',
    campaignId: 'cmp-4',
    campaignName: 'افتتاح معرض سموحة بالإسكندرية',
    branchId: 'branch-4',
    branchName: 'معرض الإسكندرية - سموحة',
    responsibleUserId: 'user-4',
    responsibleUserName: 'عمر فاروق',
    notes: 'تم توقيع العقد وسداد مقدم 50,000 ج.م لمطبخ ألوميتال خشابي.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    createdDate: '2026-07-28',
    lastActivityDate: '2026-08-26 12:00',
    hasPurchased: true,
    isAfterSales: false,
    orderRef: 'ORD-2026-051',
    orderAmount: 110000,
    paidAmount: 50000
  },

  // 7. Omar Khaled
  {
    id: 'cust-7',
    fullName: 'عمر خالد',
    phone: '01288776655',
    city: 'القاهرة',
    area: 'مصر الجديدة - النزهة',
    interestType: 'furniture',
    status: 'new',
    source: 'website',
    campaignId: 'cmp-5',
    campaignName: 'طلب معاينة عبر الموقع الإلكتروني',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    responsibleUserId: 'user-2',
    responsibleUserName: 'محمود القاضي',
    notes: 'طلب جديد مسجل عبر نموذج الموقع الإلكتروني للاستفسار عن طقم سفرة مودرن.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    createdDate: '2026-08-26',
    lastActivityDate: '2026-08-26 21:00',
    hasPurchased: false,
    isAfterSales: false
  },

  // 8. Dr. Hanaa Sherif
  {
    id: 'cust-8',
    fullName: 'د. هناء شريف',
    phone: '01011223344',
    city: 'القاهرة',
    area: 'التجمع الخامس - حي الشويفات',
    interestType: 'both',
    status: 'customer',
    source: 'referral',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    responsibleUserId: 'user-1',
    responsibleUserName: 'أحمد محمود',
    notes: 'عميلة دائمة عن طريق ترشيح د. محمد علي. تم تجهيز فيلا بالكامل.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    createdDate: '2026-05-01',
    lastActivityDate: '2026-08-20 15:30',
    hasPurchased: true,
    isAfterSales: true,
    orderRef: 'ORD-2026-018',
    orderAmount: 340000,
    paidAmount: 340000
  },

  // 9. Khaled Tewfik
  {
    id: 'cust-9',
    fullName: 'م. خالد توفيق',
    phone: '01200112233',
    city: 'القاهرة',
    area: 'العاصمة الإدارية - الحي السكني R3',
    interestType: 'kitchens',
    status: 'measured',
    source: 'facebook',
    campaignId: 'cmp-1',
    campaignName: 'حملة المطابخ الصيفية 2026',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    responsibleUserId: 'user-[#E06F28]',
    responsibleUserName: 'خالد توفيق',
    notes: 'تمت المعاينة الرسمية بالفيلا وأخذ المقاسات 3D بالليزر.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    createdDate: '2026-08-10',
    lastActivityDate: '2026-08-23 17:15',
    hasPurchased: false,
    isAfterSales: false,
    measurementDate: '2026-08-22'
  },

  // 10. Reem Fouad
  {
    id: 'cust-10',
    fullName: 'أ. ريم فؤاد',
    phone: '01077665544',
    city: 'الجيزة',
    area: 'الشيخ زايد - كمبوند سوديك',
    interestType: 'furniture',
    status: 'contacted',
    source: 'instagram',
    campaignId: 'cmp-3',
    campaignName: 'إطلاق مطابخ HPL مودرن',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    responsibleUserId: 'user-4',
    responsibleUserName: 'عمر فاروق',
    notes: 'تم الاتصال بالعميلة هاتفياً وإرسال صور أطقم المعيشة المتاحة بالمعرض.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    createdDate: '2026-08-24',
    lastActivityDate: '2026-08-25 10:30',
    hasPurchased: false,
    isAfterSales: false
  }
];

export const initialActivities: CustomerActivity[] = [
  // Activities for Mohamed Hassan (cust-1)
  {
    id: 'act-101',
    customerId: 'cust-1',
    type: 'system',
    title: 'تسجيل عميل جديد',
    note: 'تم تسجيل العميل بنجاح عبر حملة الانستجرام "حملة المطابخ الصيفية 2026"',
    date: '2026-08-20',
    timestamp: '2026-08-20 11:30',
    userId: 'user-4',
    userName: 'عمر فاروق'
  },
  {
    id: 'act-102',
    customerId: 'cust-1',
    type: 'whatsapp',
    title: 'تواصل عبر الواتساب',
    note: 'تم إرسال الكتالوج المطبوع بدقة عالية PDF وصور ألوان الـ HPL المتاحة بالمعرض',
    date: '2026-08-21',
    timestamp: '2026-08-21 14:15',
    userId: 'user-4',
    userName: 'عمر فاروق'
  },
  {
    id: 'act-103',
    customerId: 'cust-1',
    type: 'phone_call',
    title: 'مكالمة هاتفية استكشافية',
    note: 'العميل مهتم جداً بزيارة المعرض وتحديد موعد معاينة الفيلا بالتجمع الخامس',
    date: '2026-08-24',
    timestamp: '2026-08-24 16:40',
    userId: 'user-4',
    userName: 'عمر فاروق'
  },
  {
    id: 'act-104',
    customerId: 'cust-1',
    type: 'status_change',
    title: 'تغيير حالة العميل إلى "مهتم"',
    note: 'تم تحديث الحالة بعد التأكد من جدية العميل ورغبته في رفع المقاسات',
    date: '2026-08-26',
    timestamp: '2026-08-26 18:30',
    userId: 'user-4',
    userName: 'عمر فاروق'
  },

  // Activities for Ahmed Mahmoud (cust-2)
  {
    id: 'act-201',
    customerId: 'cust-2',
    type: 'system',
    title: 'تسجيل عميل جديد',
    note: 'تم تسجيل العميل عبر إعلان الفيسبوك "عرض عروض الصالون والمعيشة"',
    date: '2026-06-10',
    timestamp: '2026-06-10 09:15',
    userId: 'user-1',
    userName: 'أحمد محمود'
  },
  {
    id: 'act-202',
    customerId: 'cust-2',
    type: 'measurement',
    title: 'إتمام المعاينة والمقاسات بالفيلا',
    note: 'تم رفع مقاسات المطبخ والغرف بواسطة الفني مهندس الورشة',
    date: '2026-06-18',
    timestamp: '2026-06-18 13:00',
    userId: 'user-5',
    userName: 'خالد توفيق'
  },
  {
    id: 'act-203',
    customerId: 'cust-2',
    type: 'quotation_created',
    title: 'إصدار عرض سعر معتمد (QUO-2026-089)',
    note: 'عرض سعر بمبلغ 185,000 ج.م شامل المطبخ والغرف والتركيب والتوريد',
    date: '2026-06-22',
    timestamp: '2026-06-22 15:30',
    userId: 'user-1',
    userName: 'أحمد محمود'
  },
  {
    id: 'act-204',
    customerId: 'cust-2',
    type: 'order_created',
    title: 'توقيع عقد البيع (ORD-2026-042)',
    note: 'تم اعتماد التعاقد وسداد الدفعة الأولى بمبلغ 90,000 ج.م',
    date: '2026-06-25',
    timestamp: '2026-06-25 11:00',
    userId: 'user-1',
    userName: 'أحمد محمود'
  },
  {
    id: 'act-205',
    customerId: 'cust-2',
    type: 'payment_received',
    title: 'سداد باقي قيمة العقد بالكامل',
    note: 'سداد مبلغ 95,000 ج.م بخزينة معرض القاهرة الرئيسي وتسليم الإيصال للعميل',
    date: '2026-08-20',
    timestamp: '2026-08-20 16:20',
    userId: 'user-3',
    userName: 'سارة الشريف'
  },
  {
    id: 'act-206',
    customerId: 'cust-2',
    type: 'status_change',
    title: 'مكتمل وتحويل لخدمة ما بعد البيع',
    note: 'تم التركيب النهائي وتفعيل شهادة الضمان 5 سنوات',
    date: '2026-08-25',
    timestamp: '2026-08-25 14:10',
    userId: 'user-1',
    userName: 'أحمد محمود'
  },

  // Activities for Sara Ali (cust-3)
  {
    id: 'act-301',
    customerId: 'cust-3',
    type: 'status_change',
    title: 'تغيير حالة العميل إلى "فرصة مفقودة (Lost)"',
    note: 'سبب الفقد: السعر أعلى من الميزانية المتاحة. تمت التوصية بمتابعة العروض المستقبلية.',
    date: '2026-08-24',
    timestamp: '2026-08-24 11:20',
    userId: 'user-4',
    userName: 'عمر فاروق'
  }
];

export const initialReminders: CustomerReminder[] = [
  {
    id: 'rem-1',
    customerId: 'cust-1',
    customerName: 'محمد حسن',
    customerPhone: '01009876543',
    title: 'التأكيد على موعد المعاينة وتجهيز عينات الـ HPL',
    dueDate: '2026-08-28',
    dueTime: '11:00',
    assignedUserId: 'user-4',
    assignedUserName: 'عمر فاروق',
    isCompleted: false,
    createdDate: '2026-08-26',
    priority: 'high'
  },
  {
    id: 'rem-2',
    customerId: 'cust-3',
    customerName: 'سارة علي',
    customerPhone: '01223344556',
    title: 'متابعة العميلة عند إطلاق عروض وتخفيضات المطابخ القادمة',
    dueDate: '2026-09-15',
    dueTime: '14:00',
    assignedUserId: 'user-4',
    assignedUserName: 'عمر فاروق',
    isCompleted: false,
    createdDate: '2026-08-24',
    priority: 'normal'
  },
  {
    id: 'rem-3',
    customerId: 'cust-4',
    customerName: 'محمود نبيل',
    customerPhone: '01099887766',
    title: 'التواصل بعد إرسال مهندس المقاسات للفيلا',
    dueDate: '2026-08-29',
    dueTime: '16:30',
    assignedUserId: 'user-2',
    assignedUserName: 'محمود القاضي',
    isCompleted: false,
    createdDate: '2026-08-25',
    priority: 'normal'
  }
];

export const initialDocuments: CustomerDocument[] = [
  {
    id: 'doc-1',
    customerId: 'cust-2',
    title: 'مخطط رفع المقاسات الهندسية 3D',
    fileType: 'pdf',
    fileName: 'Kitchen-Plan-Ahmed-Mahmoud.pdf',
    fileSize: '4.2 MB',
    uploadedDate: '2026-06-19',
    uploadedByName: 'خالد توفيق'
  },
  {
    id: 'doc-2',
    customerId: 'cust-2',
    title: 'عقد البيع المعتمد والمواصفات القياسية',
    fileType: 'pdf',
    fileName: 'Contract-ORD-2026-042.pdf',
    fileSize: '2.8 MB',
    uploadedDate: '2026-06-25',
    uploadedByName: 'أحمد محمود'
  },
  {
    id: 'doc-3',
    customerId: 'cust-2',
    title: 'شهادة الضمان المعتمدة 5 سنوات',
    fileType: 'pdf',
    fileName: 'Warranty-Certificate-5Yrs.pdf',
    fileSize: '1.5 MB',
    uploadedDate: '2026-08-25',
    uploadedByName: 'سارة الشريف'
  }
];

export const initialAfterSalesRecords: AfterSalesRecord[] = [
  {
    id: 'as-1',
    customerId: 'cust-2',
    completedDate: '2026-08-25',
    itemDescription: 'مطبخ Polylac أبيض x خشابي + غرفة نوم ماستر وغرفة سفرة 8 كراسي',
    warrantyPeriod: '5 سنوات ضمان شامل على خشب الزان والإكسسوارات الهيدروليكية',
    lastServiceCheck: '2026-08-25',
    satisfactionRating: 5,
    notes: 'العميل مبشور جداً وجودة التشطيب متطابقة مع التصميم الـ 3D'
  },
  {
    id: 'as-2',
    customerId: 'cust-8',
    completedDate: '2026-07-10',
    itemDescription: 'تجهيز فيلا بالكامل أثاث ومطابخ جاهزة وتفصيل',
    warrantyPeriod: '5 سنوات ضمان خشب وإكسسوارات',
    lastServiceCheck: '2026-08-15',
    satisfactionRating: 5,
    notes: 'تم تقديم صيانة دورية مجانية للمفصلات بعد شهر من السكن'
  }
];
