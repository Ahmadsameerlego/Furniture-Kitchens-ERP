import { 
  CompanyConfig, 
  Branch, 
  Role, 
  User, 
  AuditLog, 
  ModulePermissions,
  DemoPersona
} from '../types/erp';

// Full permissions builder utility
const createFullPermissions = (): ModulePermissions => ({
  dashboard: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
  customers: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
  sales: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
  custom_projects: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
  products: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
  materials: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
  inventory: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
  suppliers: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
  production: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
  finance: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
  reports: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
  notifications: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
  settings: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
});

export const initialCompany: CompanyConfig = {
  name: 'فيرنتشر لاند للأثاث والمطابخ',
  nameEn: 'Furniture Land Furniture & Kitchens Co.',
  taxNumber: '302-881-492',
  commercialReg: '748291-EG',
  businessType: 'furniture_kitchens',
  businessModel: 'ready_custom',
  phone: '01001234567',
  email: 'info@furnitureland.eg',
  address: 'شارع التسعين الشمالي، القطاع الأول، التجمع الخامس، القاهرة',
  currency: 'ج.م',
  mainBranchId: 'branch-1'
};

export const initialBranches: Branch[] = [
  {
    id: 'branch-1',
    name: 'معرض القاهرة الرئيسي',
    nameEn: 'Main Cairo Showroom',
    type: 'showroom',
    address: 'شارع التسعين الشمالي - التجمع الخامس - القاهرة',
    phone: '01001234567',
    isMain: true,
    status: 'active',
    managerName: 'أحمد محمود',
    createdDate: '2025-01-10',
    capacity: 'عرض 450 طقم و20 نموذج مطبخ'
  },
  {
    id: 'branch-2',
    name: 'المخزن المركزي - العبور',
    nameEn: 'Central Warehouse - Obour',
    type: 'warehouse',
    address: 'المنطقة الصناعية الأولى - قطعة 44 - العبور',
    phone: '01112345678',
    isMain: false,
    status: 'active',
    managerName: 'محمود القاضي',
    createdDate: '2025-01-15',
    capacity: 'مساحة 3,500 متر مربع'
  },
  {
    id: 'branch-3',
    name: 'مصنع وورشة التجمع',
    nameEn: 'Production Workshop - Tagamoa',
    type: 'workshop',
    address: 'المنطقة الصناعية الثالثة - بلوك 12 - التجمع',
    phone: '01223456789',
    isMain: false,
    status: 'active',
    managerName: 'خالد توفيق',
    createdDate: '2025-02-01',
    capacity: 'طاقة 60 مشروع تفصيل شهرياً'
  },
  {
    id: 'branch-4',
    name: 'معرض الإسكندرية - سموحة',
    nameEn: 'Alexandria Showroom - Smouha',
    type: 'showroom',
    address: 'طريق 14 مايو - سموحة - الإسكندرية',
    phone: '01098765432',
    isMain: false,
    status: 'active',
    managerName: 'عمر فاروق',
    createdDate: '2025-03-01',
    capacity: 'عرض 200 طقم أثاث ومطابخ'
  }
];

export const initialRoles: Role[] = [
  {
    id: 'role-superadmin',
    name: 'Super Admin (مالك النظام)',
    nameEn: 'Super Admin',
    description: 'صلاحيات كاملة وغير محدودة لإدارة الشركة، الفروع، المستخدمين، الصلاحيات والمالية',
    isSystem: true,
    permissions: createFullPermissions()
  },
  {
    id: 'role-admin',
    name: 'Admin (مدير العمليات)',
    nameEn: 'Operations Admin',
    description: 'إدارة تشغيلية شاملة للمبيعات والمخازن والعملاء والإنتاج دون التعديل في هيكل النظام الأمني',
    isSystem: true,
    permissions: {
      ...createFullPermissions(),
      settings: { view: true, create: false, edit: false, delete: false, approve: false, export: false }
    }
  },
  {
    id: 'role-accountant',
    name: 'Accountant (محاسب)',
    nameEn: 'Accountant',
    description: 'إدارة المعاملات المالية، المصروفات، المقبوضات والتقارير المالية دون الوصول لإعدادات النظام أو إدارة المستخدمين',
    isSystem: true,
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      customers: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      sales: { view: true, create: false, edit: false, delete: false, approve: true, export: true },
      custom_projects: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      products: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      materials: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      inventory: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      suppliers: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      production: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      finance: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      reports: { view: true, create: true, edit: false, delete: false, approve: true, export: true },
      notifications: { view: true, create: true, edit: true, delete: true, approve: false, export: false },
      settings: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    }
  },
  {
    id: 'role-moderator',
    name: 'Moderator (مشرف مبيعات)',
    nameEn: 'Sales Moderator',
    description: 'متابعة العملاء والمبيعات اليومية وإنشاء طلبات المعارض دون الصلاحيات المالية أو الإدارية',
    isSystem: true,
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      customers: { view: true, create: true, edit: true, delete: false, approve: false, export: false },
      sales: { view: true, create: true, edit: true, delete: false, approve: false, export: false },
      custom_projects: { view: true, create: true, edit: true, delete: false, approve: false, export: false },
      products: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      materials: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      inventory: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      suppliers: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      production: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      finance: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      reports: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      notifications: { view: true, create: true, edit: true, delete: false, approve: false, export: false },
      settings: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    }
  },
  {
    id: 'role-production-coord',
    name: 'Production Coordinator (مشرف الورشة والتصنيع)',
    nameEn: 'Production Coordinator',
    description: 'دور مخصص: متابعة خامات ومراحل تصنيع أثاث ومطابخ التفصيل بالورش والمقاسات',
    isSystem: false,
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      customers: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      sales: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      custom_projects: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      products: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      materials: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      inventory: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      suppliers: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      production: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      finance: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      reports: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      notifications: { view: true, create: true, edit: true, delete: true, approve: false, export: false },
      settings: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    }
  }
];

export const initialUsers: User[] = [
  {
    id: 'user-1',
    fullName: 'أحمد محمود',
    email: 'ahmed@furnitureland.eg',
    phone: '01001234567',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    roleId: 'role-superadmin',
    assignedBranchIds: ['branch-1', 'branch-2', 'branch-3', 'branch-4'],
    status: 'active',
    lastLogin: 'منذ 5 دقائق',
    createdDate: '2025-01-10',
    title: 'مالك الشركة ورئيس مجلس الإدارة'
  },
  {
    id: 'user-2',
    fullName: 'محمود القاضي',
    email: 'mahmoud@furnitureland.eg',
    phone: '01112345678',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    roleId: 'role-admin',
    assignedBranchIds: ['branch-1', 'branch-2'],
    status: 'active',
    lastLogin: 'اليوم 09:30 ص',
    createdDate: '2025-01-15',
    title: 'مدير العمليات والمخازن'
  },
  {
    id: 'user-3',
    fullName: 'سارة الشريف',
    email: 'sara@furnitureland.eg',
    phone: '01229876543',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    roleId: 'role-accountant',
    assignedBranchIds: ['branch-1', 'branch-4'],
    status: 'active',
    lastLogin: 'أمس 04:15 م',
    createdDate: '2025-01-20',
    title: 'رئيس قسم المالية والحسابات'
  },
  {
    id: 'user-4',
    fullName: 'عمر فاروق',
    email: 'omar@furnitureland.eg',
    phone: '01098765432',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    roleId: 'role-moderator',
    assignedBranchIds: ['branch-1', 'branch-4'], // Assigned to Main Showroom & Alexandria Showroom ONLY!
    status: 'active',
    lastLogin: 'منذ ساعتين',
    createdDate: '2025-02-01',
    title: 'مشرف مبيعات المعارض'
  },
  {
    id: 'user-5',
    fullName: 'خالد توفيق',
    email: 'khaled@furnitureland.eg',
    phone: '01223456789',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    roleId: 'role-production-coord',
    assignedBranchIds: ['branch-3'], // Workshop ONLY!
    status: 'active',
    lastLogin: 'اليوم 11:00 ص',
    createdDate: '2025-02-05',
    title: 'مدير ورشة التصنيع والتفصيل'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-08-26 21:45:10',
    userId: 'user-1',
    userName: 'أحمد محمود',
    userRole: 'Super Admin',
    category: 'company',
    action: 'تحديث بيانات الشركة',
    actionEn: 'Company Settings Updated',
    target: 'شركة فيرنتشر لاند',
    details: 'تحديث نوع النشاط: أثاث ومطابخ | نموذج العمل: جاهز وتفصيل',
    status: 'success',
    ipAddress: '197.34.12.89'
  },
  {
    id: 'log-102',
    timestamp: '2026-08-26 20:30:00',
    userId: 'user-1',
    userName: 'أحمد محمود',
    userRole: 'Super Admin',
    category: 'branch',
    action: 'تعيين الفرع الرئيسي',
    actionEn: 'Main Branch Assigned',
    target: 'معرض القاهرة الرئيسي',
    details: 'تأكيد اختيار معرض القاهرة الرئيسي كفرع رئيسي معتمد للشركة',
    status: 'success',
    ipAddress: '197.34.12.89'
  },
  {
    id: 'log-103',
    timestamp: '2026-08-26 18:15:22',
    userId: 'user-1',
    userName: 'أحمد محمود',
    userRole: 'Super Admin',
    category: 'role',
    action: 'إنشاء دور مخصص جديد',
    actionEn: 'Custom Role Created',
    target: 'Production Coordinator',
    details: 'تعريف دور "مشرف الورشة والتصنيع" وتخصيص صلاحيات إدارة خامات ومشاريع التفصيل',
    status: 'success',
    ipAddress: '197.34.12.89'
  },
  {
    id: 'log-104',
    timestamp: '2026-08-26 16:10:05',
    userId: 'user-4',
    userName: 'عمر فاروق',
    userRole: 'Moderator',
    category: 'security',
    action: 'محاولة وصول غير مصرح بها',
    actionEn: 'Unauthorized Access Blocked',
    target: 'المخزن المركزي - العبور (branch-2)',
    details: 'تم حظر المستخدم سيرفراتياً لعدم تكليفه على فرع المخزن المركزي',
    status: 'denied',
    ipAddress: '41.130.88.14'
  },
  {
    id: 'log-105',
    timestamp: '2026-08-26 14:05:40',
    userId: 'user-3',
    userName: 'سارة الشريف',
    userRole: 'Accountant',
    category: 'security',
    action: 'محاولة تعديل الصلاحيات',
    actionEn: 'Admin Endpoint Blocked',
    target: 'POST /api/v1/roles/permissions',
    details: 'تم رفض طلب التعديل الأمني (403 Forbidden) - المحاسب ليس لديه صلاحيات الإدارة العليا',
    status: 'denied',
    ipAddress: '197.48.91.202'
  }
];

export const demoPersonas: DemoPersona[] = [
  {
    id: 'ahmed_owner',
    name: 'أحمد محمود',
    nameEn: 'Ahmed Mahmoud',
    roleTitle: 'Super Admin (مالك الشركة)',
    roleId: 'role-superadmin',
    userId: 'user-1',
    assignedBranchNames: ['معرض القاهرة الرئيسي', 'المخزن المركزي', 'مصنع وورشة التجمع', 'معرض الإسكندرية'],
    restrictedBranchNames: [],
    description: 'مالك الشركة ولديه نفاذ كامل لكل الفروع والإعدادات الأمنية والمالية وإدارة الأدوار والصلاحيات.',
    descriptionEn: 'Company Owner with complete access to all 4 branches, security, settings & audit logs.',
    keyTests: [
      'التبديل بحرية بين الفروع الأربعة',
      'تعديل الفرع الرئيسي مع نافذة التأكيد',
      'تحديث نوع النشاط (أثاث / مطابخ) ونموذج العمل',
      'إدارة المستخدمين والأدوار وحجم الصلاحيات',
      'استعراض سجل المراجعة والتأمين بالكامل'
    ]
  },
  {
    id: 'ahmed_owner',
    name: 'أحمد محمود',
    nameEn: 'Ahmed Mahmoud',
    roleTitle: 'Super Admin (مالك الشركة)',
    roleId: 'role-superadmin',
    userId: 'user-1',
    assignedBranchNames: ['معرض القاهرة الرئيسي', 'المخزن المركزي', 'مصنع وورشة التجمع', 'معرض الإسكندرية'],
    restrictedBranchNames: [],
    description: 'مالك الشركة ولديه نفاذ كامل لكل الفروع والإعدادات الأمنية والمالية وإدارة الأدوار والصلاحيات.',
    descriptionEn: 'Company Owner with complete access to all 4 branches, security, settings & audit logs.',
    keyTests: [
      'التبديل بحرية بين الفروع الأربعة',
      'تعديل الفرع الرئيسي مع نافذة التأكيد',
      'تحديث نوع النشاط (أثاث / مطابخ) ونموذج العمل',
      'إدارة المستخدمين والأدوار وحجم الصلاحيات',
      'استعراض سجل المراجعة والتأمين بالكامل'
    ]
  },
  {
    id: 'omar_moderator',
    name: 'عمر فاروق',
    nameEn: 'Omar Farouk',
    roleTitle: 'Moderator (مشرف مبيعات معارض)',
    roleId: 'role-moderator',
    userId: 'user-4',
    assignedBranchNames: ['معرض القاهرة الرئيسي', 'معرض الإسكندرية'],
    restrictedBranchNames: ['المخزن المركزي - العبور', 'مصنع وورشة التجمع'],
    description: 'مشرف مبيعات مكلف فقط بمعرض القاهرة الرئيسي ومعرض الإسكندرية. محظور تماماً من المخزن المركزي والورشة ومن إعدادات النظام.',
    descriptionEn: 'Sales Moderator assigned only to 2 showrooms. Blocked from central warehouse & workshop.',
    keyTests: [
      'تأكيد أن قائمة الفروع تعرض فرعيه المعتمدين فقط',
      'اختبار الحظر الفوري عند محاولة طلب بيانات المخزن أو الورشة',
      'اختفاء تبويب إعدادات النظام والأدوار تلقائياً',
      'تجربة محاكاة طلب API للمخزن لرؤية الرفض الأمني 403'
    ]
  },
  {
    id: 'sara_accountant',
    name: 'سارة الشريف',
    nameEn: 'Sara El-Sherif',
    roleTitle: 'Accountant (محاسبة رئيسية)',
    roleId: 'role-accountant',
    userId: 'user-3',
    assignedBranchNames: ['معرض القاهرة الرئيسي', 'معرض الإسكندرية'],
    restrictedBranchNames: ['إعدادات النظام', 'إدارة المستخدمين والأدوار', 'تعديل الفروع'],
    description: 'محاسبة رئيسية تملك النفاذ الكامل للوحدة المالية والتقارير ولكنها محظورة تماماً من الإدارة الهيكلية والأدوار الأجهزة.',
    descriptionEn: 'Accountant with full access to finance & reports, but strictly blocked from system administration.',
    keyTests: [
      'الوصول الكامل لقسم المالية والحسابات والتقارير',
      'حجب إمكانية تعديل المستخدمين والأدوار الهيكلية',
      'اختبار حماية نقاط النهاية الإدارية من خلال Security Test Runner'
    ]
  }
];
