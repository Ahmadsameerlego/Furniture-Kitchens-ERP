// ============================================================================
// Demo scenario — single source of truth for the cross-module story.
//
// Every module's mock file was written separately, so the same project number
// pointed at different customers, names and dates depending on the screen.
// `harmonizeMockData` runs over each initial dataset when the ERP context is
// created and:
//   1. Forces every record linked to a canonical project (projectId /
//      projectNumber / salesProjectId) to use that project's customer and name.
//   2. Rewrites legacy names left in free text (notes, descriptions...).
//   3. Shifts every ISO date so the story is always "live" relative to the day
//      the demo is opened, keeping fiscal period ids in step with the dates.
//
// To rename the company owner shown on the dashboard, change OWNER_NAME.
// ============================================================================

export const OWNER_NAME = 'م. عمرو عباس';
export const OWNER_NAME_EN = 'Eng. Hesham El-Desouky';
export const QUALITY_MANAGER_NAME = 'م. وليد عبد الحميد';

// Most mock files were written as if "today" were this date.
export const DEFAULT_MOCK_ANCHOR = '2026-08-28';
// planningData.ts was written later, around the start of October.
export const PLANNING_MOCK_ANCHOR = '2026-10-04';

export interface CanonicalCustomer {
  id: string;
  name: string;
  phone: string;
}

export interface CanonicalProject {
  id: string;
  projectNumber: string;
  projectName: string;
  customer: CanonicalCustomer;
}

export const CANONICAL_CUSTOMERS = {
  tarek: { id: 'cust-1', name: 'م. طارق المنشاوي', phone: '01009876543' },
  amr: { id: 'cust-2', name: 'م. عمرو الجمال', phone: '01112223344' },
  saraAdel: { id: 'cust-3', name: 'أ. سارة عادل', phone: '01223344556' },
  riyada: { id: 'cust-4', name: 'شركة الريادة للتطوير العقاري', phone: '01099887766' },
  karim: { id: 'cust-5', name: 'م. كريم عبد العزيز', phone: '01055443322' },
  nourhan: { id: 'cust-6', name: 'د. نورهان علي', phone: '01199887711' },
  andalus: { id: 'cust-7', name: 'مكتب الأندلس للديكور والتصميم', phone: '01288776655' },
  hanaa: { id: 'cust-8', name: 'د. هناء شريف', phone: '01011223344' },
  yasser: { id: 'cust-9', name: 'د. ياسر الحلواني', phone: '01200112233' },
  reem: { id: 'cust-10', name: 'أ. ريم فؤاد', phone: '01077665544' },
  hazem: { id: 'cust-11', name: 'م. حازم السعدني', phone: '01144556677' },
  sherif: { id: 'cust-12', name: 'أ. شريف مدكور', phone: '01006677889' },
  mona: { id: 'cust-13', name: 'أ. منى الشافعي', phone: '01153344221' }
} satisfies Record<string, CanonicalCustomer>;

const C = CANONICAL_CUSTOMERS;

export const CANONICAL_PROJECTS: CanonicalProject[] = [
  { id: 'prj-101', projectNumber: 'PRJ-2026-001', projectName: 'مطبخ رويال مودرن HPL بجزيرة - فيلا النرجس', customer: C.tarek },
  { id: 'prj-102', projectNumber: 'PRJ-2026-002', projectName: 'غرفة نوم ماستر ودريسنج روم - فيلا الشيخ زايد', customer: C.hazem },
  { id: 'prj-103', projectNumber: 'PRJ-2026-003', projectName: 'مطبخ كلاسيك قشرة أرو طبيعي - مدينة نصر', customer: C.sherif },
  { id: 'prj-104', projectNumber: 'PRJ-2026-004', projectName: 'مطبخ أكريليك أبيض لامع - جليم الإسكندرية', customer: C.nourhan },
  { id: 'prj-105', projectNumber: 'PRJ-2026-005', projectName: 'مطبخ ودريسنج روم فيلا الشويفات', customer: C.hanaa },
  { id: 'prj-106', projectNumber: 'PRJ-2026-006', projectName: 'مطبخ لاكيه مط بجزيرة - العاصمة الإدارية', customer: C.yasser },
  { id: 'prj-107', projectNumber: 'PRJ-2026-007', projectName: 'مطبخ HPL ودريسنج غرفة الماستر - سموحة', customer: C.karim },
  { id: 'prj-108', projectNumber: 'PRJ-2026-008', projectName: 'توريد 12 مطبخ لوحدات التاون هاوس - كمبوند الريادة', customer: C.riyada },
  { id: 'prj-109', projectNumber: 'PRJ-2026-009', projectName: 'دريسنج روم ووحدة تلفزيون - الشيخ زايد', customer: C.reem },
  { id: 'prj-110', projectNumber: 'PRJ-2026-010', projectName: 'مطبخ مودرن ودريسنج - مصر الجديدة', customer: C.mona }
];

const projectsById = new Map(CANONICAL_PROJECTS.map(p => [p.id, p]));
const projectsByNumber = new Map(CANONICAL_PROJECTS.map(p => [p.projectNumber, p]));

// Legacy names left in free text by the original per-module mocks. Longer,
// more specific phrases come first so they win over the bare names.
const TEXT_REPLACEMENTS: Array<[string, string]> = [
  ['المهندس أحمد سمير (مدير الجودة)', `${QUALITY_MANAGER_NAME} (مدير الجودة)`],
  ['أحمد سمير (مهندس جودة وتسليم)', `${QUALITY_MANAGER_NAME} (مهندس جودة وتسليم)`],
  ['المهندس أحمد سمير', QUALITY_MANAGER_NAME],
  ['م. أحمد سمير', QUALITY_MANAGER_NAME],
  ['أحمد سمير (المالية)', 'سارة الشريف (المالية)'],
  ['أحمد سمير (المدير المالي)', 'سارة الشريف (المدير المالي)'],
  ['أحمد سمير (مدير المبيعات)', 'عمر فاروق (مدير المبيعات)'],
  ['Ahmed Mahmoud', OWNER_NAME_EN],
  ['Kitchen-Plan-Ahmed-Mahmoud', 'Kitchen-Plan-Amr-ElGammal'],
  ['أحمد سمير', OWNER_NAME],
  ['محمد حسن', C.tarek.name],
  ['أحمد مصطفى', C.tarek.name],
  ['د. سارة الشريف', C.hazem.name],
  ['سارة علي', C.saraAdel.name],
  ['كريم محمد', C.karim.name],
  ['نورهان علي', C.nourhan.name],
  ['م. خالد توفيق', C.yasser.name],
  ['محمود نبيل', 'م. تامر الشناوي'],
  ['مجموعة بالم هيلز للتطوير العقاري والمقاولات', 'شركة الريادة للتطوير العقاري والمقاولات'],
  ['شركة بالم للتطوير العقاري', C.riyada.name],
  ['palmhills.com', 'alriyada-dev.com'],
  ['tamer. procurement', 'tamer.procurement'],
  ['كمبوند بالم هيلز', 'كمبوند الريادة'],
  ['كمبوند حسن علام', 'كمبوند الشروق جاردنز'],
  ['كمبوند سوديك', 'الحي السادس عشر'],
  ['فيلا الياسمين', 'فيلا النرجس'],
  ['ahmed.mahmoud.eng@yahoo.com', 'amr.elgammal@yahoo.com'],
  // One factory + one central warehouse, both in Obour.
  ['المخزن المركزي - العاشر', 'المخزن المركزي - العبور'],
  ['بالمخزن المركزي بالعاشر', 'بالمخزن المركزي بالعبور'],
  ['ورشة التصنيع - دمياط', 'مصنع العبور الرئيسي'],
  ['المستودع الرئيسي - التجمع الصناعي', 'المستودع الرئيسي - العبور'],
  ['مصنع وورشة التجمع', 'مصنع العبور الرئيسي']
];

// A bare customerName that has no canonical project behind it (ready-furniture
// orders, receipts...) belonged to the old "customer Ahmed Samir".
const CUSTOMER_FIELD_REPLACEMENTS: Record<string, string> = {
  'أحمد سمير': C.amr.name
};

// ----------------------------------------------------------------------------
// Dates
// ----------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DATE = /(?<!\d)(\d{4})-(\d{2})-(\d{2})(?!\d)/g;
const PERIOD_ID = /^per-(\d{4})-(\d{2})$/;
const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const MONTH_IN_TEXT = new RegExp(`(شهر\\s+)(${AR_MONTHS.join('|')})|(${AR_MONTHS.join('|')})(\\s+20\\d\\d)`, 'g');

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseIso = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const demoToday = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/** ISO date `offsetDays` away from the day the demo is opened. */
export const daysFromToday = (offsetDays: number): string => {
  const d = demoToday();
  d.setDate(d.getDate() + offsetDays);
  return toIso(d);
};

const dayShiftFor = (anchor: string) => Math.round((demoToday().getTime() - parseIso(anchor).getTime()) / DAY_MS);

const shiftIso = (iso: string, days: number) => {
  const d = parseIso(iso);
  d.setDate(d.getDate() + days);
  return toIso(d);
};

const shiftDatesInText = (text: string, days: number, months: number) => {
  let out = text.replace(ISO_DATE, (match, y, m, d) => {
    const month = Number(m);
    const day = Number(d);
    if (month < 1 || month > 12 || day < 1 || day > 31) return match;
    return shiftIso(`${y}-${m}-${d}`, days);
  });
  if (months !== 0) {
    out = out.replace(MONTH_IN_TEXT, (match, prefix, nameAfterPrefix, nameBeforeYear, yearSuffix) => {
      const name = nameAfterPrefix ?? nameBeforeYear;
      const shifted = AR_MONTHS[(AR_MONTHS.indexOf(name) + months + 120) % 12];
      return prefix ? `${prefix}${shifted}` : `${shifted}${yearSuffix}`;
    });
  }
  return out;
};

const replaceLegacyNames = (text: string) =>
  TEXT_REPLACEMENTS.reduce((acc, [from, to]) => (acc.includes(from) ? acc.split(from).join(to) : acc), text);

// ----------------------------------------------------------------------------
// Harmonizer
// ----------------------------------------------------------------------------

const canonicalProjectFor = (record: Record<string, unknown>): CanonicalProject | undefined => {
  const byId = (v: unknown) => (typeof v === 'string' ? projectsById.get(v) : undefined);
  const byNumber = (v: unknown) => (typeof v === 'string' ? projectsByNumber.get(v) : undefined);
  return byId(record.projectId) ?? byId(record.salesProjectId) ?? byNumber(record.projectNumber) ?? byNumber(record.salesProjectNumber);
};

interface HarmonizeOptions {
  /** The date the mock file treated as "today". */
  anchor?: string;
}

export function harmonizeMockData<T>(data: T, options: HarmonizeOptions = {}): T {
  const days = dayShiftFor(options.anchor ?? DEFAULT_MOCK_ANCHOR);
  const months = Math.round(days / 30.44);

  const visit = (value: unknown, key?: string): unknown => {
    if (typeof value === 'string') {
      if (key === 'customerName' && CUSTOMER_FIELD_REPLACEMENTS[value]) return CUSTOMER_FIELD_REPLACEMENTS[value];
      return shiftDatesInText(replaceLegacyNames(value), days, months);
    }
    if (Array.isArray(value)) return value.map(item => visit(item));
    if (value && typeof value === 'object') {
      const source = value as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(source)) out[k] = visit(v, k);

      const project = canonicalProjectFor(source);
      if (project) {
        if ('customerName' in out) out.customerName = project.customer.name;
        if ('customerId' in out) out.customerId = project.customer.id;
        if ('customerPhone' in out) out.customerPhone = project.customer.phone;
        if ('projectName' in out) out.projectName = project.projectName;
      }

      // Keep journal entries filed under the month their (shifted) date falls in.
      if (typeof out.periodId === 'string' && PERIOD_ID.test(out.periodId) && typeof out.date === 'string') {
        out.periodId = `per-${out.date.slice(0, 7)}`;
      }
      return out;
    }
    return value;
  };

  return visit(data) as T;
}

// ----------------------------------------------------------------------------
// Fiscal periods are generated around the current month rather than shifted,
// so they always line up with calendar months.
// ----------------------------------------------------------------------------

export interface GeneratedFiscalPeriod {
  id: string;
  year: number;
  periodNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  closedAt?: string;
  closedByUserName?: string;
}

export function buildFiscalPeriods(): GeneratedFiscalPeriod[] {
  const today = demoToday();
  return [-2, -1, 0, 1].map(offset => {
    const start = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const closeDate = new Date(end.getFullYear(), end.getMonth() + 1, 5);
    const isClosed = offset <= -2;
    return {
      id: `per-${start.getFullYear()}-${pad(start.getMonth() + 1)}`,
      year: start.getFullYear(),
      periodNumber: start.getMonth() + 1,
      name: `${AR_MONTHS[start.getMonth()]} ${start.getFullYear()}`,
      startDate: toIso(start),
      endDate: toIso(end),
      isClosed,
      ...(isClosed ? { closedAt: `${toIso(closeDate)} 14:00`, closedByUserName: 'سارة الشريف (المدير المالي)' } : {})
    };
  });
}

/**
 * Shift every ISO date in already-harmonized data that was saved on `savedOn`,
 * so a demo prepared yesterday still reads as "live" today. Names are left as-is.
 */
export function shiftMockDates<T>(data: T, savedOn: string): T {
  const days = dayShiftFor(savedOn);
  if (days === 0) return data;
  const visit = (value: unknown): unknown => {
    if (typeof value === 'string') return shiftDatesInText(value, days, 0);
    if (Array.isArray(value)) return value.map(visit);
    if (value && typeof value === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = visit(v);
      if (typeof out.periodId === 'string' && PERIOD_ID.test(out.periodId) && typeof out.date === 'string') {
        out.periodId = `per-${out.date.slice(0, 7)}`;
      }
      return out;
    }
    return value;
  };
  return visit(data) as T;
}
