import React from 'react';
import { ProjectQuotation, CustomProject, Customer } from '../../types/erp';
import {
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  Building2,
  Award,
  Check
} from 'lucide-react';

interface OfficialQuotationSheetProps {
  quotation: ProjectQuotation;
  project?: CustomProject;
  customer?: Customer;
  onApprove?: (quoteId: string) => void;
  onClose?: () => void;
  showActions?: boolean;
}

export const OfficialQuotationSheet: React.FC<OfficialQuotationSheetProps> = ({
  quotation,
  project,
  customer,
  onApprove,
  onClose,
  showActions = true
}) => {
  // Helper to fallback to synthesized breakdown if none is attached
  const breakdown = quotation.breakdown || {
    quoteType: project?.projectType === 'kitchen' ? 'kitchen' : 'furniture',
    specifications: {
      doors: 'HPL هندي خشابي فاخر مقاوم للحرارة والخدش',
      carcass: 'خشب جود وود 18مم معالج ومكبوس فورميكا أبيض ضد الرطوبة والمياه',
      hinges: 'مفصلات بلوم نمساوي Blum Soft-Close ومجرى أدراج Tandembox هيدروليك',
      notes: quotation.notes || 'يشمل التصميم ثلاثي الأبعاد 3D والمعاينة الفنية بالموقع وضمان 5 سنوات معتمد'
    },
    meterage: {
      baseUnitsMeters: 4.5,
      upperUnitsMeters: 4.5,
      tallUnitsMeters: 2.5,
      totalMeters: 11.5,
      pricePerMeter: Math.round((quotation.totalSelling * 0.55) / 11.5),
      totalPrice: Math.round(quotation.totalSelling * 0.55)
    },
    additions: {
      handles: { description: 'مقابض بروفايل Gola ألومنيوم مدمجة أسود مط', price: Math.round(quotation.totalSelling * 0.05) },
      ledProfile: { description: 'شريط ليد بروفايل غاطس دافئ Warm 3000K مع المحول', price: Math.round(quotation.totalSelling * 0.04) },
      glassFrames: { description: 'دلفة زجاج فاميه بني مع فريم ألومنيوم سليم', price: Math.round(quotation.totalSelling * 0.03) },
      cladding: { description: 'تجاليد جدارية خشبية فاخرة', price: Math.round(quotation.totalSelling * 0.04) },
      totalPrice: Math.round(quotation.totalSelling * 0.16)
    },
    mechanisms: [
      { id: 'm-1', name: 'ميكانيزم قلاب بلوم أفينتوس Blum Aventos HF مزدوج', quantity: 2, unit: 'طقم', unitPrice: 3800, totalPrice: 7600, notes: 'للوحدات العلوية' }
    ],
    accessories: [
      { id: 'a-1', name: 'مجفف أطباق مدمج استانلس ستيل 304 أصلي', quantity: 1, unit: 'قطعة', unitPrice: 1850, totalPrice: 1850 },
      { id: 'a-2', name: 'سلة ترولي زيوت وتوابل استانلس هيدروليك', quantity: 1, unit: 'قطعة', unitPrice: 1450, totalPrice: 1450 }
    ],
    marble: {
      typeName: 'رخام جالاكسي أسود اسباني دبل مع فتحات الحوض والبلت-إن',
      meters: 5.5,
      pricePerMeter: 2800,
      totalPrice: Math.round(quotation.totalSelling * 0.14)
    },
    otherWorks: [],
    logistics: {
      location: customer?.address || 'القاهرة الجديدة',
      floor: 'الدور الأرضي / المتكرر',
      notes: 'شامل الشحن والتوصيل وفريق فني معتمد للتركيب',
      totalPrice: 2500
    },
    grandTotal: quotation.totalSelling,
    paymentTerms: {
      downPaymentPercent: 40,
      productionPaymentPercent: 40,
      deliveryPaymentPercent: 20,
      deliveryDurationDays: '25 - 35 يوم عمل',
      warrantyYears: 5
    }
  };

  const clientName = customer?.fullName || project?.customerName || 'العميل المحترم';
  const clientPhone = customer?.phone || project?.customerPhone || '01000000000';
  const clientAddress = customer?.address || 'القاهرة - مصر';
  const quoteNumber = `QTE-${quotation.id.replace('qte-', '').padStart(4, '0')}-V${quotation.version}`;
  const projectName = project?.projectName || 'مشروع تفصيل أثاث ومطابخ';

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `مرحباً ${clientName}،\nمرفق لكم عرض السعر المعتمد من Furniture Land Natural Home:\n` +
      `📌 المشروع: ${projectName}\n` +
      `💰 الإجمالي النهائي: ${quotation.totalSelling.toLocaleString('ar-EG')} ج.م\n` +
      `🛡️ الضمان: ${breakdown.paymentTerms.warrantyYears} سنوات معتمد.\n` +
      `نسعد دائماً بخدمتكم!`
    );
    window.open(`https://wa.me/${clientPhone.replace(/^0/, '+20')}?text=${text}`, '_blank');
  };

  return (
    <div className="quotation-container space-y-4">
      {/* Top Action Toolbar (Hidden in Print) */}
      {showActions && (
        <div className="print:hidden bg-slate-900/90 backdrop-blur-md p-4 rounded-3xl border border-slate-700/80 shadow-xl flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C87A38]/20 flex items-center justify-center border border-[#C87A38]/40">
              <Award className="w-5 h-5 text-[#C87A38]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">عرض سعر رسمي معتمد (Official Quotation)</h3>
                <span className="text-[10px] bg-[#C87A38] text-white font-black px-2 py-0.5 rounded-full">
                  {quoteNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                نسخة العميل المعتمدة رسمياً — خالية من أي تكاليف داخلية أو هوامش تفصيلية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#C87A38] hover:bg-[#DB8D48] text-white font-black text-xs shadow-lg transition-all flex items-center gap-1.5"
              title="طباعة أو حفظ بصيغة PDF"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ PDF رسمي</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة واتساب</span>
            </button>

            {onApprove && quotation.status !== 'accepted' && (
              <button
                onClick={() => onApprove(quotation.id)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-lg transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>اعتماد وموافقة العميل</span>
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                إغلاق
              </button>
            )}
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL SHEET PAPER (A4 Dimension Style) */}
      <div className="official-quotation-sheet bg-white text-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-2xl max-w-4xl mx-auto font-sans print:shadow-none print:border-none print:p-0 print:max-w-none print:rounded-none">
        
        {/* 1. BRAND HEADER */}
        <div className="border-b-4 border-[#361D13] pb-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Tagline */}
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="Furniture Land Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#361D13] shadow-md shrink-0"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#361D13] tracking-tight font-sans">
                  FURNITURE LAND
                </h1>
                <p className="text-xs sm:text-sm font-bold text-[#C87A38] tracking-widest uppercase">
                  Natural Home • Create Your Dream
                </p>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  فيرنتشر لاند لتصنيع وتصميم أرقى المطابخ والأثاث المودرن والكلاسيك
                </span>
              </div>
            </div>

            {/* Quote Badge & Branch */}
            <div className="text-left shrink-0">
              <div className="bg-[#361D13] text-white px-4 py-2 rounded-2xl shadow-sm text-center">
                <span className="text-[11px] font-bold text-[#C87A38] block">عرض سعر معتمد</span>
                <span className="text-sm font-black font-mono">{quoteNumber}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold block mt-1 text-center">
                الفرع الرئيسي • القاهرة
              </span>
            </div>
          </div>

          {/* Main Title Ribbon */}
          <div className="mt-4 bg-[#361D13] text-white rounded-xl py-2 px-4 flex items-center justify-between text-xs sm:text-sm font-black">
            <span className="text-amber-200">FURNITURE LAND | create your dream</span>
            <span className="text-white text-base">
              {breakdown.quoteType === 'kitchen' ? 'عرض سعر مطبخ مودرن تفصيل' : 'عرض سعر أثاث وديكور تفصيل'}
            </span>
            <span className="text-amber-200">صالح لمدة 15 يوماً</span>
          </div>
        </div>

        {/* 2. CUSTOMER & DATE INFO GRID */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-[#361D13] text-white font-bold px-3 py-1 text-[11px]">اسم العميل</div>
            <div className="p-2.5 font-black text-slate-800 bg-slate-50">{clientName}</div>
          </div>
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-[#361D13] text-white font-bold px-3 py-1 text-[11px]">التاريخ</div>
            <div className="p-2.5 font-bold font-mono text-slate-800 bg-slate-50">{quotation.createdDate}</div>
          </div>
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-[#361D13] text-white font-bold px-3 py-1 text-[11px]">التليفون</div>
            <div className="p-2.5 font-bold font-mono text-slate-800 bg-slate-50 text-left dir-ltr">{clientPhone}</div>
          </div>
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-[#361D13] text-white font-bold px-3 py-1 text-[11px]">العنوان / الموقع</div>
            <div className="p-2.5 font-bold text-slate-800 bg-slate-50 truncate">{clientAddress}</div>
          </div>
        </div>

        {/* 3. SECTION: WORK & SPECIFICATIONS */}
        <div className="mb-4">
          <div className="flex items-stretch border border-slate-300 rounded-xl overflow-hidden text-xs">
            <div className="bg-[#C87A38] text-white font-black px-3 py-3 flex items-center justify-center writing-mode-vertical text-center min-w-[75px] shrink-0">
              توصيف العمل
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-200 bg-white">
              <div className="p-2.5">
                <span className="font-bold text-[#361D13] block mb-0.5 text-[11px]">الضلف الخارجية:</span>
                <p className="text-slate-700 font-medium text-[11px] leading-relaxed">{breakdown.specifications.doors}</p>
              </div>
              <div className="p-2.5">
                <span className="font-bold text-[#361D13] block mb-0.5 text-[11px]">الشاسيه والكابينات:</span>
                <p className="text-slate-700 font-medium text-[11px] leading-relaxed">{breakdown.specifications.carcass}</p>
              </div>
              <div className="p-2.5">
                <span className="font-bold text-[#361D13] block mb-0.5 text-[11px]">المفصلات والمجرى:</span>
                <p className="text-slate-700 font-medium text-[11px] leading-relaxed">{breakdown.specifications.hinges}</p>
              </div>
            </div>
          </div>
          {breakdown.specifications.notes && (
            <div className="mt-1 px-3 py-1.5 bg-amber-50/70 border border-amber-200/70 rounded-lg text-[10px] text-amber-900 font-medium">
              💡 <span className="font-bold">ملاحظات فنية:</span> {breakdown.specifications.notes}
            </div>
          )}
        </div>

        {/* 4. SECTION: METERAGE BREAKDOWN */}
        <div className="mb-4">
          <div className="flex items-stretch border border-slate-300 rounded-xl overflow-hidden text-xs">
            <div className="bg-[#C87A38] text-white font-black px-3 py-3 flex items-center justify-center text-center min-w-[75px] shrink-0">
              عدد الأمتار
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-[#361D13] text-white font-bold text-[11px]">
                    <th className="p-1.5 border-l border-white/20">علب سفلية</th>
                    <th className="p-1.5 border-l border-white/20">علب علوية</th>
                    <th className="p-1.5 border-l border-white/20">دواليب طولية</th>
                    <th className="p-1.5 border-l border-white/20 bg-[#23120A]">إجمالي الأمتار</th>
                    <th className="p-1.5 border-l border-white/20">سعر المتر</th>
                    <th className="p-1.5 bg-[#C87A38] text-white">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-slate-800 bg-slate-50">
                  <tr>
                    <td className="p-2 border-l border-slate-200 font-mono">{breakdown.meterage.baseUnitsMeters} م.ط</td>
                    <td className="p-2 border-l border-slate-200 font-mono">{breakdown.meterage.upperUnitsMeters} م.ط</td>
                    <td className="p-2 border-l border-slate-200 font-mono">{breakdown.meterage.tallUnitsMeters} م.ط</td>
                    <td className="p-2 border-l border-slate-200 font-mono font-black text-[#361D13] bg-amber-100/50">
                      {breakdown.meterage.totalMeters} م.ط
                    </td>
                    <td className="p-2 border-l border-slate-200 font-mono">{breakdown.meterage.pricePerMeter.toLocaleString('ar-EG')} ج.م</td>
                    <td className="p-2 font-mono font-black text-[#361D13] bg-amber-50">
                      {breakdown.meterage.totalPrice.toLocaleString('ar-EG')} ج.م
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 5. SECTION: ADDITIONS & ACCENTS */}
        <div className="mb-4">
          <div className="flex items-stretch border border-slate-300 rounded-xl overflow-hidden text-xs">
            <div className="bg-[#C87A38] text-white font-black px-3 py-3 flex items-center justify-center text-center min-w-[75px] shrink-0">
              إضافات
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-[#361D13] text-white font-bold text-[11px]">
                    <th className="p-1.5 border-l border-white/20">مقابض</th>
                    <th className="p-1.5 border-l border-white/20">ليد بروفايل</th>
                    <th className="p-1.5 border-l border-white/20">زجاج وفريم</th>
                    <th className="p-1.5 border-l border-white/20">تجاليد ديكورية</th>
                    <th className="p-1.5 bg-[#C87A38] text-white">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="text-slate-800 bg-white">
                  <tr>
                    <td className="p-2 border-l border-slate-200 text-[10px]">
                      <span className="font-bold block">{breakdown.additions.handles.description}</span>
                      <span className="text-slate-500 font-mono font-bold">({breakdown.additions.handles.price.toLocaleString('ar-EG')} ج.م)</span>
                    </td>
                    <td className="p-2 border-l border-slate-200 text-[10px]">
                      <span className="font-bold block">{breakdown.additions.ledProfile.description}</span>
                      <span className="text-slate-500 font-mono font-bold">({breakdown.additions.ledProfile.price.toLocaleString('ar-EG')} ج.م)</span>
                    </td>
                    <td className="p-2 border-l border-slate-200 text-[10px]">
                      <span className="font-bold block">{breakdown.additions.glassFrames.description}</span>
                      <span className="text-slate-500 font-mono font-bold">({breakdown.additions.glassFrames.price.toLocaleString('ar-EG')} ج.م)</span>
                    </td>
                    <td className="p-2 border-l border-slate-200 text-[10px]">
                      <span className="font-bold block">{breakdown.additions.cladding.description}</span>
                      <span className="text-slate-500 font-mono font-bold">({breakdown.additions.cladding.price.toLocaleString('ar-EG')} ج.م)</span>
                    </td>
                    <td className="p-2 font-mono font-black text-[#361D13] bg-amber-50">
                      {breakdown.additions.totalPrice.toLocaleString('ar-EG')} ج.م
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 6. SECTION: MECHANISMS (أنظمة الرفع والحركة) */}
        {breakdown.mechanisms.length > 0 && (
          <div className="mb-4">
            <div className="flex items-stretch border border-slate-300 rounded-xl overflow-hidden text-xs">
              <div className="bg-[#C87A38] text-white font-black px-3 py-3 flex items-center justify-center text-center min-w-[75px] shrink-0">
                الميكانيزمات
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-[#361D13] text-white font-bold text-[11px]">
                      <th className="p-1.5 border-l border-white/20">النوع والمواصفة</th>
                      <th className="p-1.5 text-center border-l border-white/20">العدد</th>
                      <th className="p-1.5 text-left border-l border-white/20">السعر</th>
                      <th className="p-1.5 text-left bg-[#C87A38] text-white">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {breakdown.mechanisms.map((m, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold text-slate-800">
                          {m.name}
                          {m.notes && <span className="text-[10px] text-slate-500 block font-normal">{m.notes}</span>}
                        </td>
                        <td className="p-2 text-center font-mono font-bold">{m.quantity} {m.unit || 'قطعة'}</td>
                        <td className="p-2 text-left font-mono font-bold">{m.unitPrice?.toLocaleString('ar-EG')} ج.م</td>
                        <td className="p-2 text-left font-mono font-black text-[#361D13] bg-amber-50">
                          {m.totalPrice.toLocaleString('ar-EG')} ج.م
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. SECTION: ACCESSORIES (الإكسسوارات الداخلية) */}
        {breakdown.accessories.length > 0 && (
          <div className="mb-4">
            <div className="flex items-stretch border border-slate-300 rounded-xl overflow-hidden text-xs">
              <div className="bg-[#C87A38] text-white font-black px-3 py-3 flex items-center justify-center text-center min-w-[75px] shrink-0">
                الإكسسوارات
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-[#361D13] text-white font-bold text-[11px]">
                      <th className="p-1.5 border-l border-white/20">النوع</th>
                      <th className="p-1.5 text-center border-l border-white/20">العدد</th>
                      <th className="p-1.5 text-left border-l border-white/20">السعر</th>
                      <th className="p-1.5 text-left bg-[#C87A38] text-white">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {breakdown.accessories.map((a, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold text-slate-800">{a.name}</td>
                        <td className="p-2 text-center font-mono font-bold">{a.quantity} {a.unit || 'قطعة'}</td>
                        <td className="p-2 text-left font-mono font-bold">{a.unitPrice?.toLocaleString('ar-EG')} ج.م</td>
                        <td className="p-2 text-left font-mono font-black text-[#361D13] bg-amber-50">
                          {a.totalPrice.toLocaleString('ar-EG')} ج.م
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 8. SECTION: MARBLE / COUNTERTOPS */}
        {breakdown.marble && breakdown.marble.meters > 0 && (
          <div className="mb-4">
            <div className="flex items-stretch border border-slate-300 rounded-xl overflow-hidden text-xs">
              <div className="bg-[#C87A38] text-white font-black px-3 py-3 flex items-center justify-center text-center min-w-[75px] shrink-0">
                أعمال الرخام
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-[#361D13] text-white font-bold text-[11px]">
                      <th className="p-1.5 border-l border-white/20">النوع والمواصفة</th>
                      <th className="p-1.5 text-center border-l border-white/20">عدد الأمتار</th>
                      <th className="p-1.5 text-left border-l border-white/20">سعر المتر</th>
                      <th className="p-1.5 text-left bg-[#C87A38] text-white">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr>
                      <td className="p-2 font-bold text-slate-800">{breakdown.marble.typeName}</td>
                      <td className="p-2 text-center font-mono font-bold">{breakdown.marble.meters} م.ط</td>
                      <td className="p-2 text-left font-mono font-bold">{breakdown.marble.pricePerMeter.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-2 text-left font-mono font-black text-[#361D13] bg-amber-50">
                        {breakdown.marble.totalPrice.toLocaleString('ar-EG')} ج.م
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 9. SECTION: LOGISTICS & INSTALLATION */}
        <div className="mb-4">
          <div className="flex items-stretch border border-slate-300 rounded-xl overflow-hidden text-xs">
            <div className="bg-[#C87A38] text-white font-black px-3 py-3 flex items-center justify-center text-center min-w-[75px] shrink-0">
              النقل والتركيب
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-200 bg-slate-50">
              <div className="p-2">
                <span className="text-[10px] text-slate-500 font-bold block">المكان:</span>
                <span className="font-black text-slate-800 text-[11px] truncate block">{breakdown.logistics.location}</span>
              </div>
              <div className="p-2">
                <span className="text-[10px] text-slate-500 font-bold block">الدور:</span>
                <span className="font-bold text-slate-800 text-[11px] block">{breakdown.logistics.floor}</span>
              </div>
              <div className="p-2">
                <span className="text-[10px] text-slate-500 font-bold block">ملاحظات التوصيل:</span>
                <span className="text-[10px] text-slate-600 block">{breakdown.logistics.notes}</span>
              </div>
              <div className="p-2 bg-amber-50 text-left">
                <span className="text-[10px] text-slate-500 font-bold block">التكلفة:</span>
                <span className="font-mono font-black text-[#361D13] text-xs">
                  {breakdown.logistics.totalPrice > 0 ? `${breakdown.logistics.totalPrice.toLocaleString('ar-EG')} ج.م` : 'شامل التكلفة'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 10. GRAND TOTAL & PAYMENT TERMS & WARRANTY */}
        <div className="mt-6 border-t-2 border-[#361D13] pt-4 space-y-4">
          {/* Big Grand Total Box */}
          <div className="bg-[#361D13] text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#C87A38] text-white flex items-center justify-center font-black text-xl shadow-md">
                ★
              </div>
              <div>
                <span className="text-xs font-bold text-amber-200 block">إجمالي القيمة الإجمالية لعرض السعر الشامل:</span>
                <span className="text-[11px] text-slate-300">شامل كافة الخامات الموصوفة والتركيب بالفيلا والضمان</span>
              </div>
            </div>

            <div className="text-center sm:text-left">
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300 tracking-tight">
                {quotation.totalSelling.toLocaleString('ar-EG')} ج.م
              </span>
              <span className="text-[10px] text-amber-100 block font-medium">فقط لا غير بالجنيه المصري</span>
            </div>
          </div>

          {/* Payment Terms & Warranty Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Payment Schedule */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="font-black text-[#361D13] text-xs flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#C87A38]" />
                شروط ودفعات التعاقد:
              </span>
              <ul className="text-[11px] text-slate-700 space-y-1 font-medium list-disc list-inside">
                <li><span className="font-bold">{breakdown.paymentTerms.downPaymentPercent}%</span> دفعة حجز وتعاقد واعتماد التصميم</li>
                <li><span className="font-bold">{breakdown.paymentTerms.productionPaymentPercent}%</span> دفعة بدء التصنيع والقص بالورشة</li>
                <li><span className="font-bold">{breakdown.paymentTerms.deliveryPaymentPercent}%</span> دفعة الاستلام والمعاينة قبل التركيب</li>
              </ul>
            </div>

            {/* Delivery Timeline */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="font-black text-[#361D13] text-xs flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#C87A38]" />
                مدة التوريد والتسليم:
              </span>
              <p className="text-[11px] text-slate-700 font-medium">
                {breakdown.paymentTerms.deliveryDurationDays} من تاريخ توقيع العقد واعتماد المخططات التنفيذية والرسومات 3D.
              </p>
            </div>

            {/* Official Warranty & Quality Seal */}
            <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-1.5">
              <span className="font-black text-amber-950 text-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                الضمان المعتمد:
              </span>
              <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                ضمان شامل معتمد لمدة <span className="font-black">{breakdown.paymentTerms.warrantyYears} سنوات</span> ضد عيوب الصناعة مع صيانة دورية مجانية للسنة الأولى.
              </p>
            </div>
          </div>

          {/* Official Signatures & Stamp */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
            <div className="text-center space-y-8">
              <span className="font-bold text-slate-600 block">توقيع وقبول العميل</span>
              <div className="w-40 border-b border-dashed border-slate-400"></div>
            </div>

            {/* Furniture Land Stamp Design */}
            <div className="text-center">
              <div className="inline-block p-2 rounded-2xl border-2 border-dashed border-[#C87A38] bg-amber-50/50">
                <div className="w-20 h-20 rounded-full border-2 border-[#361D13] flex flex-col items-center justify-center p-1 text-center shadow-xs">
                  <span className="text-[8px] font-black text-[#361D13] uppercase tracking-wider">FURNITURE LAND</span>
                  <span className="text-[7px] text-[#C87A38] font-bold">معتمد رسمياً</span>
                  <span className="text-[9px] font-black text-emerald-800">✓ APPROVED</span>
                  <span className="text-[7px] text-slate-500 font-mono">{quotation.createdDate}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 block mt-1">خاتم إدارة المبيعات والتعاقدات</span>
            </div>

            <div className="text-center space-y-8">
              <span className="font-bold text-slate-600 block">اعتماد إدارة التصميم والتنفيذ</span>
              <span className="text-xs font-black text-[#361D13] block font-mono">{quotation.createdByUserName}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
