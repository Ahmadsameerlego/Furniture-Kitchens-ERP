import React from 'react';
import { useERP } from '../context/ERPContext';
import { ModuleId } from '../types/erp';
import {
  Users,
  ShoppingBag,
  Ruler,
  Package,
  Layers,
  Boxes,
  Truck,
  Factory,
  Landmark,
  BarChart3,
  Bell,
  Sparkles,
  Building2,
  CheckCircle2,
  Lock,
  Plus
} from 'lucide-react';

interface ModuleConfig {
  id: ModuleId;
  title: string;
  titleEn: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  stat1: { label: string; value: string };
  stat2: { label: string; value: string };
  stat3: { label: string; value: string };
  sampleTableHeaders: string[];
  sampleRows: any[];
}

const moduleConfigs: Record<ModuleId, ModuleConfig> = {
  dashboard: {
    id: 'dashboard',
    title: 'لوحة التحكم والرؤية الشاملة',
    titleEn: 'Dashboard',
    subtitle: 'نظرة عامة على أداء معارض ومصانع فيرني ميكر',
    icon: Users,
    stat1: { label: 'إجمالي المقرات', value: '4 مقرات' },
    stat2: { label: 'فريق العمل', value: '5 موظفين' },
    stat3: { label: 'الفرع الرئيسي', value: 'معرض القاهرة' },
    sampleTableHeaders: [],
    sampleRows: []
  },
  customers: {
    id: 'customers',
    title: 'سجل العملاء وإدارة العلاقات (CRM)',
    titleEn: 'Customer Management',
    subtitle: 'قاعدة بيانات عملاء الأثاث الجاهز والمطابخ التفصيل',
    icon: Users,
    stat1: { label: 'إجمالي العملاء', value: '142 عميل' },
    stat2: { label: 'مشاريع تفصيل جارية', value: '18 مشروع' },
    stat3: { label: 'تقييم رضا العملاء', value: '98.4%' },
    sampleTableHeaders: ['اسم العميل', 'رقم الهاتف', 'الفرع التابع', 'نوع الطلب', 'إجمالي العقود', 'الحالة'],
    sampleRows: [
      { col1: 'د. محمد علي', col2: '01012345678', col3: 'معرض القاهرة الرئيسي', col4: 'تفصيل مطبخ HPL + أثاث نوم', col5: '185,000 ج.م', col6: 'تم الاعتماد' },
      { col1: 'م. أحمد حسن', col2: '01298765432', col3: 'معرض الإسكندرية', col4: 'طقم أثاث سفرة وصالة جاهز', col5: '95,000 ج.م', col6: 'قيد التسليم' },
      { col1: 'أ. سارة يوسف', col2: '01145678901', col3: 'معرض القاهرة الرئيسي', col4: 'تفصيل غرفتين نوم مودرن', col5: '120,000 ج.م', col6: 'قيد المعاينة' }
    ]
  },
  sales: {
    id: 'sales',
    title: 'المبيعات وعقود المعارض (Sales & Contracts)',
    titleEn: 'Sales & Quotations',
    subtitle: 'إدارة أوامر البيع وعروض الأسعار لأطقم الأثاث والمطابخ',
    icon: ShoppingBag,
    stat1: { label: 'مبيعات الشهر الحالي', value: '1,450,000 ج.م' },
    stat2: { label: 'عروض الأسعار المعتمدة', value: '24 عرض' },
    stat3: { label: 'متوسط قيمة العقد', value: '60,400 ج.م' },
    sampleTableHeaders: ['رقم العقد', 'اسم العميل', 'الفرع/المعرض', 'المبلغ الإجمالي', 'المقدم المدفوع', 'حالة العقد'],
    sampleRows: [
      { col1: 'SAL-2026-089', col2: 'د. محمد علي', col3: 'معرض القاهرة الرئيسي', col4: '185,000 ج.م', col5: '90,000 ج.م', col6: 'معتمد بالورشة' },
      { col1: 'SAL-2026-090', col2: 'م. شريف عامر', col3: 'معرض الإسكندرية', col4: '78,000 ج.م', col5: '78,000 ج.م', col6: 'خالص السداد' },
      { col1: 'SAL-2026-091', col2: 'أ. هدير فؤاد', col3: 'معرض القاهرة الرئيسي', col4: '142,000 ج.م', col5: '50,000 ج.م', col6: 'تحت المراجعة' }
    ]
  },
  custom_projects: {
    id: 'custom_projects',
    title: 'مشاريع التفصيل والمقاسات (Custom Projects)',
    titleEn: 'Custom Projects & Specs',
    subtitle: 'إدارة المقاسات والمعاينات وتصميمات المطابخ والأثاث التفصيل',
    icon: Ruler,
    stat1: { label: 'مشاريع قيد التصميم', value: '8 مشاريع' },
    stat2: { label: 'أوامر تصنيع بالورشة', value: '12 مشروع' },
    stat3: { label: 'نسبة الالتزام بالمواعيد', value: '96%' },
    sampleTableHeaders: ['كود المشروع', 'اسم العميل', 'نوع المشروع', 'مقاسات المطبخ/الأثاث', 'الورشة المكلفة', 'مرحلة التنفيذ'],
    sampleRows: [
      { col1: 'PRJ-KITCH-042', col2: 'د. محمد علي', col3: 'تفصيل مطبخ HPL مودرن', col4: 'L-Shape (4.2m x 2.8m)', col5: 'مصنع وورشة التجمع', col6: 'مرحلة التجميع وتقفيل الإكسسوار' },
      { col1: 'PRJ-FURN-088', col2: 'أ. سارة يوسف', col3: 'غرفة نوم أطفال تفصيل', col4: 'حسب المخطط الهندسي R3', col5: 'مصنع وورشة التجمع', col6: 'مرحلة دهان اللكيه والتنشيف' }
    ]
  },
  products: {
    id: 'products',
    title: 'كتالوج المنتجات والأثاث الجاهز',
    titleEn: 'Products Catalog',
    subtitle: 'إدارة موديلات الأثاث الجاهز والأطقم والمواصفات القياسية',
    icon: Package,
    stat1: { label: 'إجمالي المنتجات', value: '310 موديل' },
    stat2: { label: 'أطقم صالون وسفرة', value: '140 موديل' },
    stat3: { label: 'نماذج مطابخ قياسية', value: '45 نموذج' },
    sampleTableHeaders: ['كود المنتج', 'اسم الموديل/المنتج', 'الكتالوج/التصنيف', 'سعر البيع المعرض', 'المخزون المتاح', 'الحالة'],
    sampleRows: [
      { col1: 'FUR-SOFA-104', col2: 'ركنة مودرن "لافينيا" - قماش هامر', col3: 'أثاث معيشة', col4: '38,500 ج.م', col5: '6 أطقم', col6: 'متوفر بالمخزن' },
      { col1: 'FUR-BED-201', col2: 'غرفة نوم ماستر "رويال" زان', col3: 'غرف نوم', col4: '82,000 ج.م', col5: '3 أطقم', col6: 'عرض بالمعرض' },
      { col1: 'KIT-MOD-012', col2: 'مطبخ جاهز وحدة 3 متر Polylac', col3: 'مطابخ جاهزة', col4: '45,000 ج.م', col5: '4 وحدات', col6: 'متوفر بالمخزن' }
    ]
  },
  materials: {
    id: 'materials',
    title: 'خامات ومستلزمات التصنيع (Materials)',
    titleEn: 'Manufacturing Materials',
    subtitle: 'إدارة ألواح الخشب الزان، الـ MDF، الـ HPL والإكسسوارات والمقابض',
    icon: Layers,
    stat1: { label: 'أنواع الألواح والخشب', value: '48 نوع' },
    stat2: { label: 'مقبض وإكسسوار مفصلات', value: '120 صنف' },
    stat3: { label: 'قيمة رصيد الخامات', value: '2,850,000 ج.م' },
    sampleTableHeaders: ['كود الخامة', 'اسم الخامة / المواصفة', 'الوحدة', 'الرصيد بمخزن العبور', 'الرصيد بالورشة', 'حد إعادة الطلب'],
    sampleRows: [
      { col1: 'MAT-WD-001', col2: 'خشب زان أحمر روماني فرز أول', col3: 'متر مكعب', col4: '42 م3', col5: '12 م3', col6: '15 م3 (كافي)' },
      { col1: 'MAT-[#E06F28]-004', col2: 'ألواح MDF ملامين أبيض 18مم (Egger)', col3: 'لوح (2.8m x 2.07m)', col4: '340 لوح', col5: '85 لوح', col6: '100 لوح' },
      { col1: 'MAT-ACC-099', col2: 'مفصلات هيدروليك بافوم سوفت كلوز', col3: 'طقم مفصلة', col4: '1,200 طقم', col5: '400 طقم', col6: '300 طقم' }
    ]
  },
  inventory: {
    id: 'inventory',
    title: 'المخزون والتسويات المخزنية (Inventory)',
    titleEn: 'Inventory Management',
    subtitle: 'متابعة أرصدة المعارض والمخزن المركزي بالعبور والتحويلات',
    icon: Boxes,
    stat1: { label: 'إجمالي قيمة المخزون', value: '14,200,000 ج.م' },
    stat2: { label: 'حركات تحويل معلقة', value: '3 حركات' },
    stat3: { label: 'أصناف تحت حد الأمان', value: '2 صنف' },
    sampleTableHeaders: ['كود الصنف', 'اسم المنتح / الخامة', 'الموقع/المقر', 'الكمية الحالية', 'قيمة التكلفة', 'حالة الرصيد'],
    sampleRows: [
      { col1: 'INV-1002', col2: 'غرفة نوم ماستر "رويال"', col3: 'المخزن المركزي - العبور', col4: '3 أطقم', col5: '180,000 ج.م', col6: 'آمن' },
      { col1: 'INV-1005', col2: 'ألواح HPL خشابي رمادي 18مم', col3: 'المخزن المركزي - العبور', col4: '25 لوح', col5: '37,500 ج.م', col6: 'تنبيه: اقترب من الحد الأدنى' }
    ]
  },
  suppliers: {
    id: 'suppliers',
    title: 'سجل الموردين والمشتريات (Suppliers)',
    titleEn: 'Suppliers & Purchases',
    subtitle: 'حسابات موردين الأخشاب والإكسسوارات والمستلزمات المستوردة',
    icon: Truck,
    stat1: { label: 'إجمالي الموردين', value: '28 مورد' },
    stat2: { label: 'فواتير مشتريات آجلة', value: '450,000 ج.م' },
    stat3: { label: 'موردين معتمدين', value: '100%' },
    sampleTableHeaders: ['اسم المورد', 'تخصص التوريد', 'رقم الهاتف', 'مستحقات المورد', 'طريقة السداد', 'الحالة'],
    sampleRows: [
      { col1: 'شركة مصر لتجارة الأخشاب', col2: 'أخشاب زان وموسكي', col3: '01009988776', col4: '140,000 ج.م', col5: 'آجل 30 يوم', col6: 'نشط' },
      { col1: 'الشركة العربية للإكسسوارات', col2: 'مفصلات ومقابض مطابخ', col3: '01122334455', col4: '65,000 ج.م', col5: 'نقدي عند الاستلام', col6: 'نشط' }
    ]
  },
  production: {
    id: 'production',
    title: 'إدارة الإنتاج والورش (Production & Workshop)',
    titleEn: 'Production & Workshop',
    subtitle: 'تتبع خروج أوامر الشغل ومراحل التقطيع، التجميع، الدهانات والتركيب',
    icon: Factory,
    stat1: { label: 'أوامر تصنيع بالورشة', value: '14 أمر شغَّال' },
    stat2: { label: 'نسبة إنجاز المخطط', value: '92.5%' },
    stat3: { label: 'الفنيون والنجارون', value: '22 فني' },
    sampleTableHeaders: ['رقم أمر الشغل', 'اسم العميل / المشروع', 'نوع الشغل', 'الورشة المكلفة', 'المرحلة الحالية', 'موعد التسليم المتوقع'],
    sampleRows: [
      { col1: 'WO-2026-044', col2: 'د. محمد علي', col3: 'تقفيل مطبخ HPL', col4: 'مصنع وورشة التجمع', col5: 'مرحلة التركيبات بالعميل', col6: '2026-09-02' },
      { col1: 'WO-2026-045', col2: 'أ. سارة يوسف', col3: 'دهان غرفة نوم أطفال', col4: 'مصنع وورشة التجمع', col5: 'مرحلة الرش والفرن', col6: '2026-09-05' }
    ]
  },
  finance: {
    id: 'finance',
    title: 'المالية والحسابات (Finance & Accounts)',
    titleEn: 'Finance & Accounts',
    subtitle: 'مقبوضات عقود المعارض، مصروفات الورش، الشيكات والخزينة',
    icon: Landmark,
    stat1: { label: 'إيرادات المعارض الشهرية', value: '2,150,000 ج.م' },
    stat2: { label: 'مصروفات الورش والخامات', value: '890,000 ج.م' },
    stat3: { label: 'صافي الربح المتوقع', value: '1,260,000 ج.م' },
    sampleTableHeaders: ['رقم الإذن', 'الفرع/الخزينة', 'البيان والتفاصيل', 'نوع الحركة', 'المبلغ (ج.م)', 'تاريخ الحركة'],
    sampleRows: [
      { col1: 'REC-2026-901', col2: 'خزينة معرض القاهرة الرئيسي', col3: 'مقدم عقد تفصيل مطبخ د. محمد علي', col4: 'مقبوضات عملاء', col5: '+90,000 ج.م', col6: '2026-08-26' },
      { col1: 'EXP-2026-402', col2: 'خزينة ورشة التجمع', col3: 'شراء دهانات ومستلزمات سنفرة بالورشة', col4: 'مصروفات تشغيل', col5: '-14,500 ج.م', col6: '2026-08-25' }
    ]
  },
  reports: {
    id: 'reports',
    title: 'التقارير التحليلية والرقابية (Reports)',
    titleEn: 'Analytical Reports',
    subtitle: 'تقارير أرباح الأثاث والمطابخ، مبيعات الفروع ومعدل دوران المخزون',
    icon: BarChart3,
    stat1: { label: 'تقارير المبيعات', value: 'جاهزة' },
    stat2: { label: 'تقارير حركة الخامات', value: 'محدثة' },
    stat3: { label: 'تحليل الأرباح حسب الفرع', value: 'متاح' },
    sampleTableHeaders: ['اسم التقرير القياسي', 'نطاق التقرير', 'تكرار التحديث', 'الصلاحية المطلوبة', 'تصدير'],
    sampleRows: [
      { col1: 'تقرير مبيعات وأرباح المعارض الأربعة', col2: 'شامل كل الفروع والمقرات', col3: 'لحظي (Real-time)', col4: 'Accountant + Super Admin', col5: 'PDF / Excel' },
      { col1: 'تقرير استهلاك الخامات وأخشاب الورشة', col2: 'خاص بفرع ورشة التجمع', col3: 'يومي', col4: 'Production Coord + Admin', col5: 'PDF / Excel' }
    ]
  },
  notifications: {
    id: 'notifications',
    title: 'مركز الإشعارات والتنبيهات (Notifications)',
    titleEn: 'Notifications Hub',
    subtitle: 'تنبيهات مبيعات المعارض، حدود أمان الخامات وأوامر الورش',
    icon: Bell,
    stat1: { label: 'إشعارات جديدة', value: '3 إشعارات' },
    stat2: { label: 'تنبيهات أمنية', value: '0' },
    stat3: { label: 'حالة التنبيهات', value: 'مفعلة' },
    sampleTableHeaders: ['تاريخ التنبيه', 'نوع التنبيه', 'الفرع المعني', 'نص الرسالة', 'الحالة'],
    sampleRows: [
      { col1: '2026-08-26 21:30', col2: 'تأكيد عقد جديد', col3: 'معرض القاهرة الرئيسي', col4: 'تم سداد 90,000 ج.م مقدم عقد د. محمد علي', col5: 'جديد' },
      { col1: '2026-08-26 20:00', col2: 'تنبيه حد خامات', col3: 'المخزن المركزي - العبور', col4: 'ألواح MDF أوشكت على الوصول للحد الأدنى (100 لوح)', col5: 'جديد' }
    ]
  },
  settings: {
    id: 'settings',
    title: 'إعدادات النظام والأمن',
    titleEn: 'Settings',
    subtitle: 'تكوين الشركة والفروع والأدوار',
    icon: Users,
    stat1: { label: 'الشركة', value: 'فيرني ميكر' },
    stat2: { label: 'الفروع', value: '4 فروع' },
    stat3: { label: 'الأدوار', value: '5 أدوار' },
    sampleTableHeaders: [],
    sampleRows: []
  }
};

export const PlaceholderModulePage: React.FC<{ moduleId: ModuleId }> = ({ moduleId }) => {
  const { currentBranch, currentRole, checkPermission } = useERP();
  const config = moduleConfigs[moduleId] || moduleConfigs.sales;
  const Icon = config.icon;

  const hasCreatePerm = checkPermission(moduleId, 'create');

  return (
    <div className="space-y-6">
      
      {/* Module Title Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1C352D] text-white flex items-center justify-center shadow-md font-bold shrink-0">
            <Icon className="w-6 h-6 text-[#E06F28]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{config.title}</h1>
              <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                {currentBranch.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{config.subtitle}</p>
          </div>
        </div>

        {hasCreatePerm && (
          <button className="px-5 py-2.5 bg-[#1C352D] hover:bg-[#142921] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 self-start md:self-auto">
            <Plus className="w-4 h-4 text-[#E06F28]" />
            <span>إضافة جديدة</span>
          </button>
        )}
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500">{config.stat1.label}</span>
          <p className="text-xl font-black text-slate-900 mt-1">{config.stat1.value}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500">{config.stat2.label}</span>
          <p className="text-xl font-black text-[#E06F28] mt-1">{config.stat2.value}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500">{config.stat3.label}</span>
          <p className="text-xl font-black text-emerald-800 mt-1">{config.stat3.value}</p>
        </div>
      </div>

      {/* Architecture Compatibility & Scope Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 to-[#1C352D] text-white flex items-center justify-between text-xs border border-emerald-800/50">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#E06F28]" />
          <span>
            هذه الوحدة مربوطة تلقائياً بهيكل الشركة الرئيسي، نطاق فرع <strong>"{currentBranch.name}"</strong>، ودور <strong>"{currentRole.name}"</strong>.
          </span>
        </div>
        <span className="bg-white/10 text-emerald-200 px-3 py-1 rounded-xl text-[10px] font-bold border border-white/15 hidden sm:inline">
          Ready for Furni Maker Modules Expansion
        </span>
      </div>

      {/* Sample Table Preview */}
      {config.sampleTableHeaders.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-3 p-4">
          <div className="flex items-center justify-between px-2 pt-1 pb-2">
            <h3 className="text-sm font-black text-slate-900">سجل البيانات التشغيلية لنطاق الفرع الحالي</h3>
            <span className="text-xs text-slate-500 font-bold">معاينة بنية الجداول المستقبلية</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#1C352D] text-white font-bold">
                <tr>
                  {config.sampleTableHeaders.map((h, i) => (
                    <th key={i} className="p-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {config.sampleRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{row.col1}</td>
                    <td className="p-3.5">{row.col2}</td>
                    <td className="p-3.5">{row.col3}</td>
                    <td className="p-3.5 font-bold text-[#E06F28]">{row.col4}</td>
                    <td className="p-3.5 font-mono">{row.col5}</td>
                    <td className="p-3.5">
                      <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
                        {row.col6}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
