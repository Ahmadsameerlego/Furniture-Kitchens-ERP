import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { ProjectQuotation, QuotationStatus } from '../types/erp';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Printer,
  Share2,
  Percent,
  TrendingUp,
  DollarSign,
  ChevronLeft,
  X,
  Send,
  Building,
  Ruler,
  Layers,
  ArrowRight
} from 'lucide-react';

export const SalesQuotationsPage: React.FC = () => {
  const {
    projectQuotations,
    customProjects,
    availableBranches,
    setSelectedProjectId,
    setActiveModule,
    updateQuotationStatus
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedQuoteForModal, setSelectedQuoteForModal] = useState<ProjectQuotation | null>(null);

  // Filter Quotations
  const filteredQuotations = projectQuotations.filter(q => {
    const project = customProjects.find(p => p.id === q.projectId);
    const branchId = project?.branchId || '';

    const matchesSearch =
      (project?.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project?.projectNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project?.projectName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || q.status === selectedStatus;
    const matchesBranch = selectedBranch === 'all' || branchId === selectedBranch;

    return matchesSearch && matchesStatus && matchesBranch;
  });

  // Aggregate Metrics
  const totalValue = filteredQuotations.reduce((sum, q) => sum + (q.totalSelling || 0), 0);
  const totalCost = filteredQuotations.reduce((sum, q) => sum + (q.totalCost || 0), 0);
  const totalProfit = totalValue - totalCost;
  const avgMargin = totalValue > 0 ? Math.round((totalProfit / totalValue) * 100) : 0;
  const acceptedCount = filteredQuotations.filter(q => q.status === 'accepted').length;

  const handleStatusChange = (quoteId: string, status: QuotationStatus) => {
    updateQuotationStatus(quoteId, status);
    if (selectedQuoteForModal && selectedQuoteForModal.id === quoteId) {
      setSelectedQuoteForModal({ ...selectedQuoteForModal, status });
    }
  };

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'accepted':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> معتمد من العميل</span>;
      case 'sent':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200"><Send className="w-3.5 h-3.5" /> تم الإرسال للعميل</span>;
      case 'under_review':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3.5 h-3.5" /> قيد التفاوض والمراجعة</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200"><XCircle className="w-3.5 h-3.5" /> مرفوض / ملغي</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">مسودة تسعير</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#361D13] to-[#5a3222] text-[#C87A38] flex items-center justify-center shadow-md">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">سجل عروض الأسعار والمقايسات الفنية (Quotations & BOQ)</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              إدارة وحساب تكاليف المقايسات الفنية، تسعير الأمتار والخامات وإكسسوارات بلوم، ومتابعة حالات الاعتماد
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveModule('custom_projects')}
          className="flex items-center gap-2 bg-[#361D13] hover:bg-[#4a281b] text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer shrink-0"
        >
          <Ruler className="w-4 h-4 text-[#C87A38]" />
          <span>إنشاء مقايسة من قمع المشاريع</span>
        </button>
      </div>

      {/* Metric Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي المقايسات الصادرة</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{filteredQuotations.length}</span>
            <span className="text-xs text-slate-500 font-bold">عرض سعر</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-bold block mt-1">✓ {acceptedCount} معتمد ومحول لعقود</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي القيمة البيعية للعروض</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalValue.toLocaleString('ar-EG')}</span>
            <span className="text-xs text-slate-500 font-bold">ج.م</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">شامل كافة بنود الخامات والتركيب</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي التكلفة المرجعية المقدرة</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-700">{totalCost.toLocaleString('ar-EG')}</span>
            <span className="text-xs text-slate-500 font-bold">ج.م</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">شامل الخامات والمصنعيات واللوجستيات</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">متوسط هامش الربح التقديري</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">+{avgMargin}%</span>
            <span className="text-xs text-slate-500 font-bold">({totalProfit.toLocaleString('ar-EG')} ج.م)</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block mt-1">مؤشر ربحية إيجابي</span>
        </div>

      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث برقم العرض، كود المشروع، اسم العميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pr-10 pl-4 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-[#C87A38] focus:bg-white transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="تصفية حسب الحالة"
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">جميع الحالات</option>
              <option value="accepted">معتمد (Accepted)</option>
              <option value="under_review">قيد المراجعة والتفاوض</option>
              <option value="sent">تم الإرسال للعميل</option>
              <option value="draft">مسودة تسعير</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>

          {/* Branch filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2">
            <Building className="w-4 h-4 text-slate-400" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              aria-label="تصفية حسب الفرع"
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">جميع الفروع</option>
              {availableBranches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-black text-slate-600 uppercase tracking-wider">
                <th className="py-4 px-5">المقايسة والمشروع</th>
                <th className="py-4 px-5">العميل والتاريخ</th>
                <th className="py-4 px-5">مواصفات الخامات والأمتار</th>
                <th className="py-4 px-5">القيمة والربحية</th>
                <th className="py-4 px-5">حالة الاعتماد</th>
                <th className="py-4 px-5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="font-bold">لا توجد مقايسات مطابقة لمعايير البحث الحالية</p>
                  </td>
                </tr>
              ) : (
                filteredQuotations.map(q => {
                  const project = customProjects.find(p => p.id === q.projectId);
                  const marginPct = q.totalSelling > 0 ? Math.round(((q.totalSelling - q.totalCost) / q.totalSelling) * 100) : 0;
                  const breakdown = q.breakdown;

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* Project & Ref */}
                      <td className="py-4 px-5">
                        <div className="font-black text-slate-900 font-mono text-sm">
                          {q.id.toUpperCase()} <span className="text-xs text-[#C87A38] font-bold">v{q.version}</span>
                        </div>
                        <div className="text-slate-600 font-bold mt-0.5">{project?.projectName || 'مشروع تفصيل'}</div>
                        <span className="text-[11px] font-mono text-slate-400 block">{project?.projectNumber}</span>
                      </td>

                      {/* Customer & Date */}
                      <td className="py-4 px-5">
                        <div className="font-black text-slate-900">{project?.customerName || 'عميل'}</div>
                        <div className="text-slate-500 font-mono text-[11px]">{project?.customerPhone}</div>
                        <div className="text-slate-400 text-[11px] mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {q.createdDate}
                        </div>
                      </td>

                      {/* Technical Specs Summary */}
                      <td className="py-4 px-5 max-w-xs">
                        {breakdown?.specifications ? (
                          <div className="space-y-1 text-[11px]">
                            <p className="text-slate-700 line-clamp-1">
                              <strong>الضلف:</strong> {breakdown.specifications.doors}
                            </p>
                            <p className="text-slate-600 line-clamp-1">
                              <strong>الشاسيه:</strong> {breakdown.specifications.carcass}
                            </p>
                            {breakdown.meterage?.totalMeters ? (
                              <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                                {breakdown.meterage.totalMeters} م.ط @ {breakdown.meterage.pricePerMeter?.toLocaleString('ar-EG')} ج.م
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">مواصفات قياسية</span>
                        )}
                      </td>

                      {/* Price & Margin */}
                      <td className="py-4 px-5">
                        <div className="text-sm font-black text-slate-900">
                          {q.totalSelling?.toLocaleString('ar-EG')} <span className="text-[10px] font-normal text-slate-500">ج.م</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          التكلفة: <span className="font-mono">{q.totalCost?.toLocaleString('ar-EG')} ج.م</span>
                        </div>
                        <div className="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                          <Percent className="w-3 h-3" /> هامش الربح: +{marginPct}%
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        {getStatusBadge(q.status)}
                        {q.acceptedAt && (
                          <span className="text-[10px] text-emerald-600 block mt-1 font-mono">
                            تم القبول: {q.acceptedAt}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedQuoteForModal(q)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-[#361D13] hover:text-white text-slate-700 transition-all cursor-pointer"
                            title="معاينة تفاصيل المقايسة الفنية BOQ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedProjectId(q.projectId);
                              setActiveModule('custom_projects');
                            }}
                            className="p-2 rounded-xl bg-[#C87A38]/10 hover:bg-[#C87A38] hover:text-white text-[#C87A38] transition-all cursor-pointer"
                            title="فتح ملف المشروع الكامل"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOQ Breakdown Preview Modal */}
      {selectedQuoteForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#C87A38]/10 text-[#C87A38] flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">تفاصيل المقايسة الفنية الرسمية (BOQ Preview)</h3>
                  <span className="text-xs font-mono text-slate-500">{selectedQuoteForModal.id} - إصدار v{selectedQuoteForModal.version}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedQuoteForModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              
              {/* Top Details Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">العميل</span>
                  <strong className="text-slate-800 text-sm">
                    {customProjects.find(p => p.id === selectedQuoteForModal.projectId)?.customerName || 'عميل'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">تاريخ العرض</span>
                  <strong className="text-slate-800 font-mono">{selectedQuoteForModal.createdDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">الإجمالي النهائي</span>
                  <strong className="text-[#C87A38] text-base font-black">
                    {selectedQuoteForModal.totalSelling?.toLocaleString('ar-EG')} ج.م
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">الحالة الحالية</span>
                  {getStatusBadge(selectedQuoteForModal.status)}
                </div>
              </div>

              {/* Technical Specifications */}
              {selectedQuoteForModal.breakdown?.specifications && (
                <div className="space-y-3">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#C87A38]" /> مواصفات الخامات المعتمدة
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs">
                      <span className="text-slate-500 font-bold block mb-1">الضلف والواجهات:</span>
                      <p className="text-slate-800 font-medium">{selectedQuoteForModal.breakdown.specifications.doors}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs">
                      <span className="text-slate-500 font-bold block mb-1">الشاسيه والهيكل:</span>
                      <p className="text-slate-800 font-medium">{selectedQuoteForModal.breakdown.specifications.carcass}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs">
                      <span className="text-slate-500 font-bold block mb-1">المفصلات والمجاري:</span>
                      <p className="text-slate-800 font-medium">{selectedQuoteForModal.breakdown.specifications.hinges}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Meterage Breakdown */}
              {selectedQuoteForModal.breakdown?.meterage && (
                <div className="space-y-3">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-indigo-600" /> تفصيل الأمتار والوحدات
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-600">علب سفلية:</span>
                      <span className="font-bold text-slate-800">{selectedQuoteForModal.breakdown.meterage.baseUnitsMeters} م.ط</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-600">علب علوية:</span>
                      <span className="font-bold text-slate-800">{selectedQuoteForModal.breakdown.meterage.upperUnitsMeters} م.ط</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-600">سعر المتر الطولي المعتمد:</span>
                      <span className="font-bold text-slate-800">{selectedQuoteForModal.breakdown.meterage.pricePerMeter?.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                    <div className="flex justify-between py-1 pt-2 font-black text-slate-900 text-sm">
                      <span>إجمالي قيمة الأمتار:</span>
                      <span>{selectedQuoteForModal.breakdown.meterage.totalPrice?.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Blum Mechanisms & Additions */}
              {selectedQuoteForModal.breakdown?.mechanisms && selectedQuoteForModal.breakdown.mechanisms.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-black text-slate-900 text-sm">الميكانيزمات والإكسسوارات الميكانيكية</h4>
                  <div className="space-y-2">
                    {selectedQuoteForModal.breakdown.mechanisms.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                        <span className="font-bold text-slate-800">{m.name}</span>
                        <span className="font-mono font-black text-slate-900">{m.totalPrice?.toLocaleString('ar-EG')} ج.م</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Marble & Logistics */}
              {selectedQuoteForModal.breakdown?.marble && (
                <div className="space-y-3">
                  <h4 className="font-black text-slate-900 text-sm">مسطح الرخام / الكوارتز</h4>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{selectedQuoteForModal.breakdown.marble.typeName}</p>
                      <span className="text-slate-500">{selectedQuoteForModal.breakdown.marble.meters} متر @ {selectedQuoteForModal.breakdown.marble.pricePerMeter?.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                    <span className="font-mono font-black text-slate-900">{selectedQuoteForModal.breakdown.marble.totalPrice?.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                </div>
              )}

              {/* Payment & Warranty Terms */}
              {selectedQuoteForModal.breakdown?.paymentTerms && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs space-y-2 text-amber-900">
                  <h5 className="font-black text-amber-950">شروط الدفع والتسليم والضمان:</h5>
                  <p>• جدول الدفعات: عربون {selectedQuoteForModal.breakdown.paymentTerms.downPaymentPercent}% عند التعاقد | {selectedQuoteForModal.breakdown.paymentTerms.productionPaymentPercent}% بدء التصنيع | {selectedQuoteForModal.breakdown.paymentTerms.deliveryPaymentPercent}% استلام وتركيب.</p>
                  <p>• مدة التوريد: {selectedQuoteForModal.breakdown.paymentTerms.deliveryDurationDays}.</p>
                  <p>• فترة الضمان الشامل: {selectedQuoteForModal.breakdown.paymentTerms.warrantyYears} سنوات ضد عيوب الصناعة.</p>
                </div>
              )}

            </div>

            {/* Modal Actions */}
            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatusChange(selectedQuoteForModal.id, 'accepted')}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>اعتماد العرض وتحويله لعقد</span>
                </button>
                <button
                  onClick={() => handleStatusChange(selectedQuoteForModal.id, 'rejected')}
                  className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>رفض العرض</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة رسمية</span>
                </button>
                <button
                  onClick={() => setSelectedQuoteForModal(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
