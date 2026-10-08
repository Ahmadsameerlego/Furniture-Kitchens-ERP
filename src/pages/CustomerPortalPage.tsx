import { NO_IMAGE_PLACEHOLDER } from '../mock/designDrawings';
import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { CustomProjectService } from '../services/customProjectService';
import { ReadySalesService } from '../services/readySalesService';
import { BrandLogo } from '../components/branding/BrandLogo';
import {
  User,
  LayoutDashboard,
  Ruler,
  Layers,
  FileText,
  CreditCard,
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  Share2,
  LogOut,
  ChevronLeft,
  X,
  Lock,
  Download,
  Calendar,
  Sparkles,
  PhoneCall,
  ZoomIn,
  Video,
  Camera
} from 'lucide-react';
import { ImageZoomModal } from '../components/common/ImageZoomModal';
import { OfficialQuotationSheet } from '../components/quotations/OfficialQuotationSheet';

export const CustomerPortalPage: React.FC = () => {
  const {
    customers,
    customProjects,
    projectMeasurements,
    projectDesigns,
    projectQuotations,
    customContracts,
    orders,
    paymentSchedules,
    paymentReceipts,
    notifications,
    portalCurrentCustomerId,
    loginAsPortalCustomer,
    updateDesignStatus,
    addDesignComment,
    acceptQuotation,
    updateQuotationStatus,
    setActiveModule,
    showToast
  } = useERP();

  const customer = customers.find(c => c.id === portalCurrentCustomerId) || customers[0];
  const [activeTab, setActiveTab] = useState<'home' | 'projects' | 'designs' | 'quotations' | 'contract' | 'payments' | 'notifications'>('home');

  // Modals & Comment State
  const [commentText, setCommentText] = useState('');
  const [rejectionModalDesignId, setRejectionModalDesignId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [portalActiveLightbox, setPortalActiveLightbox] = useState<{ images: string[]; index: number; title: string } | null>(null);

  // STRICT SECURITY & DATA ISOLATION: Filter ONLY current customer's data!
  const myProjects = customProjects.filter(p => p.customerId === customer.id);
  const activeProject = myProjects[0];

  const myMeas = projectMeasurements.filter(m => myProjects.some(p => p.id === m.projectId));
  const myDesigns = projectDesigns.filter(d => myProjects.some(p => p.id === d.projectId));
  const myQuotes = projectQuotations.filter(q => myProjects.some(p => p.id === q.projectId));
  const myContracts = customContracts.filter(c => c.customerId === customer.id);
  const myOrders = orders.filter(o => o.customerId === customer.id);
  const myPaymentSchedules = paymentSchedules.filter(s => s.customerId === customer.id);
  const myReceipts = paymentReceipts.filter(r => r.customerId === customer.id);
  const myNotifications = notifications.filter(n => n.customerId === customer.id || n.targetModule === 'custom_projects');

  // Calculate Financial Totals Source of Truth
  let myTotalOrdersValue = 0;
  let myTotalPaid = 0;
  let myTotalRemaining = 0;

  myOrders.forEach(o => {
    myTotalOrdersValue += o.orderTotal;
    myTotalPaid += o.paidAmount;
    myTotalRemaining += o.remainingBalance;
  });

  const nextUpcomingSchedule = myPaymentSchedules.find(s => s.status === 'upcoming' || s.status === 'due' || s.status === 'overdue');
  const activeQuote = myQuotes[myQuotes.length - 1];
  const activeDesign = myDesigns[myDesigns.length - 1];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans dir-rtl flex flex-col">
      
      {/* Top Customer Header Bar */}
      <header className="bg-[#23120A] border-b border-emerald-900/60 sticky top-0 z-40 px-4 md:px-8 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" variant="dark" showSubtext={false} />
            <div className="h-6 w-px bg-emerald-800/80 hidden sm:block"></div>
            <span className="text-xs font-black text-emerald-300 hidden sm:block">بوابة العملاء والمتابعة الحية (Customer Portal)</span>
          </div>

          {/* Persona / Customer Account Switcher Dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-2xl border border-slate-700 text-xs">
              <User className="w-4 h-4 text-[#C87A38]" />
              <span className="text-slate-400 font-bold hidden sm:inline">حساب العميل:</span>
              <select
                value={portalCurrentCustomerId}
                onChange={(e) => loginAsPortalCustomer(e.target.value)}
                className="bg-transparent text-white font-black text-xs border-none focus:ring-0 cursor-pointer"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.fullName} ({c.interestType === 'kitchens' ? 'مطبخ' : 'أثاث'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setActiveModule('dashboard')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
            >
              <LogOut className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">العودة للـ ERP الداخلي</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Portal Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        
        {/* Customer Welcome Greeting Card */}
        <div className="bg-gradient-to-r from-[#361D13] via-[#23120A] to-slate-900 rounded-3xl p-6 md:p-8 border border-emerald-800/50 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-[#C87A38] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">حساب عميل مميز</span>
                <h1 className="text-2xl font-black text-white">أهلاً بك، {customer.fullName} 👋</h1>
              </div>
              <p className="text-xs text-emerald-200/80 font-medium">
                مرحباً بك في بوابتك الخاصة لمتابعة مراحل تصميم وتصنيع ومدفوعات مشروعك
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href={`https://wa.me/201009876543`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all flex items-center gap-2 shadow-lg"
              >
                <Share2 className="w-4 h-4" />
                <span>تواصل مع مهندس مشروعك عبر الواتساب</span>
              </a>
            </div>
          </div>
        </div>

        {/* Portal Sub-Navigation Tabs */}
        <div className="bg-slate-800/90 rounded-2xl p-2 border border-slate-700/80 shadow-md flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'home' ? 'bg-[#C87A38] text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>الرئيسية وملخص المشروعات</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'projects' ? 'bg-[#C87A38] text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span>مشاريعي والمقاسات ({myProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('designs')}
            className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'designs' ? 'bg-[#C87A38] text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>تصميماتي 3D ({myDesigns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quotations')}
            className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'quotations' ? 'bg-[#C87A38] text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>عروض الأسعار ({myQuotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('contract')}
            className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'contract' ? 'bg-[#C87A38] text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>عقودي المعتمدة ({myContracts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'payments' ? 'bg-[#C87A38] text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>طلباتي وجدول الدفعات</span>
            {myTotalRemaining > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.2 rounded-full font-mono font-bold">
                متبقي
              </span>
            )}
          </button>
        </div>

        {/* SUB-VIEW 1: PORTAL HOME */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* Active Project Progress & Status Card */}
            {activeProject ? (
              <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-slate-400 font-bold text-xs block">المشروع النشط حالياً:</span>
                    <h2 className="text-xl font-black text-white">{activeProject.projectName}</h2>
                    <span className="text-xs text-emerald-400 font-mono font-bold">رقم المشروع: {activeProject.projectNumber}</span>
                  </div>

                  <div className="text-left font-mono">
                    <span className="text-xs text-slate-400 block font-sans">الحالة الحالية:</span>
                    <span className="px-3.5 py-1 rounded-xl text-xs font-black bg-[#C87A38] text-white inline-block">
                      {CustomProjectService.getProjectStatusMeta(activeProject.status).label}
                    </span>
                  </div>
                </div>

                {/* Dynamic Progress Bar */}
                {(() => {
                  let progressPct = 60;
                  let stepNumber = 6;
                  if (activeProject.status === 'completed') {
                    progressPct = 100;
                    stepNumber = 8;
                  } else if (activeProject.status === 'installed' || activeProject.status === 'installation_scheduled') {
                    progressPct = 85;
                    stepNumber = 7;
                  } else if (activeProject.status === 'production_completed' || activeProject.status === 'ready_for_production') {
                    progressPct = 75;
                    stepNumber = 6;
                  }

                  return (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-300">نسبة التقدم الكلية للمشروع (Project Progress):</span>
                          <span className="text-[#C87A38] font-mono font-black text-sm">{progressPct}%</span>
                        </div>
                        <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
                          <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-[#C87A38] rounded-full transition-all duration-500 shadow-lg" style={{ width: `${progressPct}%` }}></div>
                        </div>
                      </div>

                      {/* Lifecycle Progress Trajectory */}
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-[10px] font-bold text-center pt-2">
                        <div className="p-2 rounded-xl bg-emerald-900/60 text-emerald-200 border border-emerald-600">✓ إنشاء</div>
                        <div className="p-2 rounded-xl bg-emerald-900/60 text-emerald-200 border border-emerald-600">✓ المعاينة</div>
                        <div className="p-2 rounded-xl bg-emerald-900/60 text-emerald-200 border border-emerald-600">✓ المقاسات</div>
                        <div className="p-2 rounded-xl bg-emerald-900/60 text-emerald-200 border border-emerald-600">✓ التصميم 3D</div>
                        <div className="p-2 rounded-xl bg-emerald-900/60 text-emerald-200 border border-emerald-600">✓ عرض السعر</div>
                        <div className={`p-2 rounded-xl border ${stepNumber >= 6 ? 'bg-emerald-900/60 text-emerald-200 border-emerald-600' : 'bg-slate-900 text-slate-500'}`}>
                          {stepNumber >= 6 ? '✓ التصنيع' : '6. التصنيع'}
                        </div>
                        <div className={`p-2 rounded-xl border ${stepNumber >= 7 ? 'bg-emerald-900/60 text-emerald-200 border-emerald-600' : stepNumber === 6 ? 'bg-[#C87A38] text-white font-black animate-pulse' : 'bg-slate-900 text-slate-500'}`}>
                          {stepNumber >= 7 ? '✓ التركيب' : '7. التركيب'}
                        </div>
                        <div className={`p-2 rounded-xl border ${stepNumber === 8 ? 'bg-emerald-600 text-white font-black' : 'bg-slate-900 text-slate-500'}`}>
                          {stepNumber === 8 ? '🎉 تم التسليم 100%' : '8. التسليم'}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-800 rounded-3xl border border-slate-700 text-slate-400 text-xs">
                لا توجد مشاريع مخصصة نشطة حالياً بالحساب
              </div>
            )}

            {/* Financial Summary Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-5 rounded-3xl bg-slate-800 border border-slate-700 shadow-md space-y-1 text-xs">
                <span className="text-slate-400 font-bold">إجمالي قيمة التعاقد:</span>
                <p className="text-2xl font-black text-white font-mono">{myTotalOrdersValue.toLocaleString('ar-EG')} ج.م</p>
                <span className="text-[10px] text-slate-500">العقود المعتمدة الموثقة</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-800 border border-slate-700 shadow-md space-y-1 text-xs">
                <span className="text-slate-400 font-bold">إجمالي المسدد حالياً:</span>
                <p className="text-2xl font-black text-emerald-400 font-mono">{myTotalPaid.toLocaleString('ar-EG')} ج.م</p>
                <span className="text-[10px] text-emerald-500 font-bold">✓ شامل الدفعة المقدمة والإيصالات</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-800 border border-slate-700 shadow-md space-y-1 text-xs">
                <span className="text-slate-400 font-bold">المتبقي على الحساب:</span>
                <p className="text-2xl font-black text-rose-400 font-mono">{myTotalRemaining.toLocaleString('ar-EG')} ج.م</p>
                <span className="text-[10px] text-slate-400">موزعة على الأقساط القادمة</span>
              </div>

              <div className="p-5 rounded-3xl bg-[#361D13] border border-emerald-700 shadow-md space-y-1 text-xs">
                <span className="text-emerald-300 font-bold">القسط القادم الاستحقاق:</span>
                <p className="text-2xl font-black text-amber-300 font-mono">
                  {nextUpcomingSchedule ? `${nextUpcomingSchedule.amount.toLocaleString('ar-EG')} ج.م` : 'لا يوجد'}
                </p>
                <span className="text-[10px] text-emerald-200">
                  {nextUpcomingSchedule ? `تاريخ الاستحقاق: ${nextUpcomingSchedule.dueDate}` : 'جميع الأقساط مسددة بالكامل'}
                </span>
              </div>

            </div>

          </div>
        )}

        {/* SUB-VIEW: MY PROJECTS & SITE MEASUREMENTS */}
        {activeTab === 'projects' && (
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl space-y-6">
            <div className="pb-3 border-b border-slate-700">
              <h3 className="text-lg font-black text-white">مشاريعك التفصيل ورفع المقاسات بالموقع (My Projects & Measurements)</h3>
              <p className="text-xs text-slate-400">استعراض تفاصيل مشاريعك النشطة، تقرير المعاينة الفنية، أبعاد الجدران والسقف، وصور وفيديوهات الموقع</p>
            </div>

            {myProjects.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">لا توجد مشاريع مخصصة نشطة بحسابك حالياً</p>
            ) : (
              <div className="space-y-8">
                {myProjects.map(proj => {
                  const projVisits = projectMeasurements.filter(m => m.projectId === proj.id);
                  const projSiteVisits = myMeas.filter(m => m.projectId === proj.id); // Measurements versions
                  const statusMeta = CustomProjectService.getProjectStatusMeta(proj.status);
                  const siteVisitData = myProjects.length > 0 ? {
                    address: 'فيلا 14 - شارع النرجس الرئيسي - التجمع الخامس',
                    date: '2026-08-20',
                    time: '16:00',
                    assignedUser: 'المهندس / عمر فاروق',
                    status: 'مكتملة الفحص والرفع',
                    photos: [
                      NO_IMAGE_PLACEHOLDER,
                      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600',
                      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600'
                    ],
                    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                    siteConditions: {
                      hasColumn: 'نعم (عمود بارز 15سم × 30سم بالجدار B)',
                      ceilingHeight: '280 سم (سقف معلق بيت نور)',
                      windowLocation: 'جدار B يبدأ النافذة بعد 90سم (جلسة 100سم)',
                      electricalPoints: '4 نقاط كهرباء على ارتفاع 110سم + مأخذ شفاط 220V',
                      waterConnection: 'توصيلات مياه وصرف جاهزة بالجدار A على 180سم',
                      gasConnection: 'محبس غاز قائم بجوار جدار A',
                      wallStraightness: 'استقامة 90° ممتازة مع انحراف بسيط 0.5سم',
                      flooringLevel: 'بورسلين مستوي 100%',
                      customerPreferences: 'طلب العميل جزيرة وسطية Island 180سم مع رخام جالاكسي أسود'
                    }
                  } : null;

                  return (
                    <div key={proj.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-700 space-y-6">
                      
                      {/* Project Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#C87A38] text-white flex items-center justify-center font-black">
                            <Ruler className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-black text-white">{proj.projectName}</h4>
                              <span className="font-mono text-xs bg-slate-800 text-emerald-400 px-2.5 py-0.5 rounded-lg border border-slate-700 font-bold">
                                {proj.projectNumber}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium">الفرع المسند: {proj.branchName} — تاريخ الإنشاء: {proj.createdDate}</p>
                          </div>
                        </div>

                        <span className={`px-4 py-1.5 rounded-xl text-xs font-black border ${statusMeta.bgClass}`}>
                          {statusMeta.label}
                        </span>
                      </div>

                      {/* Site Visit Technical Inspection Report Card */}
                      {siteVisitData && (
                        <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-[#C87A38]" />
                              <h5 className="font-black text-white text-sm">تقرير المعاينة والشروط الفنية بالموقع (Site Technical Inspection)</h5>
                            </div>
                            <span className="px-3 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-600 text-[10px] font-bold">
                              ✓ {siteVisitData.status}
                            </span>
                          </div>

                          {/* Conditions Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-bold text-slate-200">
                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-0.5">
                              <span className="text-[10px] text-slate-400 block">عنوان الموقع الفعلي:</span>
                              <span className="text-emerald-300">{siteVisitData.address}</span>
                            </div>

                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-0.5">
                              <span className="text-[10px] text-slate-400 block">تاريخ وتوقيت المعاينة:</span>
                              <span>{siteVisitData.date} ({siteVisitData.time})</span>
                            </div>

                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-0.5">
                              <span className="text-[10px] text-slate-400 block">ارتفاع السقف صافي:</span>
                              <span className="text-amber-400 font-mono">{siteVisitData.siteConditions.ceilingHeight}</span>
                            </div>

                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-0.5">
                              <span className="text-[10px] text-slate-400 block">وجود أعمدة خرسانية:</span>
                              <span className="text-rose-300">{siteVisitData.siteConditions.hasColumn}</span>
                            </div>

                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-0.5">
                              <span className="text-[10px] text-slate-400 block">نقاط وتأسيسات الكهرباء:</span>
                              <span>{siteVisitData.siteConditions.electricalPoints}</span>
                            </div>

                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-0.5">
                              <span className="text-[10px] text-slate-400 block">توصيلات السباكة والصرف:</span>
                              <span>{siteVisitData.siteConditions.waterConnection}</span>
                            </div>

                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-0.5">
                              <span className="text-[10px] text-slate-400 block">توصيلات الغاز الطبيعي:</span>
                              <span>{siteVisitData.siteConditions.gasConnection}</span>
                            </div>

                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-0.5">
                              <span className="text-[10px] text-slate-400 block">موقع وشباك التهوية:</span>
                              <span>{siteVisitData.siteConditions.windowLocation}</span>
                            </div>

                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-0.5">
                              <span className="text-[10px] text-slate-400 block">استقامة الجدران والأرضيات:</span>
                              <span>{siteVisitData.siteConditions.wallStraightness}</span>
                            </div>
                          </div>

                          {/* Site Media (Photos & Videos) */}
                          <div className="space-y-3 pt-2 border-t border-slate-700/80">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                              <span>صور وفيديوهات الرفع الميداني من الموقع:</span>
                              <span className="text-[10px] text-slate-400">اضغط على الصور للتكبير Zoom</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {/* Photos */}
                              {siteVisitData.photos.map((ph, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => setPortalActiveLightbox({ images: siteVisitData.photos, index: idx, title: 'صورة معاينة الموقع' })}
                                  className="group relative h-40 rounded-xl overflow-hidden border border-slate-700 cursor-pointer bg-slate-950"
                                >
                                  <img src={ph} alt={`site-ph-${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                                    <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                                      <ZoomIn className="w-3.5 h-3.5" /> تكبير
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Inline Video Player */}
                            {siteVisitData.videoUrl && (
                              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-700 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                                  <Video className="w-4 h-4" />
                                  <span>فيديو تصوير وتوثيق الموقع الميداني 360°:</span>
                                </div>
                                <video
                                  src={siteVisitData.videoUrl}
                                  controls
                                  className="w-full h-56 rounded-xl bg-black border border-slate-800"
                                  poster={siteVisitData.photos[0]}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Project Measurement Versions Breakdown */}
                      <div className="space-y-4">
                        <h5 className="font-black text-white text-sm border-b border-slate-800 pb-2">
                          نسخ المقاسات والأبعاد المعتمدة (Measurement Versions):
                        </h5>

                        {myMeas.filter(m => m.projectId === proj.id).map((meas) => (
                          <div key={meas.id} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                            <div className="flex items-center justify-between text-xs border-b border-slate-700 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-[#C87A38] text-white flex items-center justify-center font-black font-mono">
                                  V{meas.version}
                                </span>
                                <span className="font-bold text-white">إصدار المقاسات رقم V{meas.version}</span>
                                <span className="text-[10px] text-slate-400">تاريخ الرفع: {meas.createdDate}</span>
                              </div>
                              {meas.reasonForUpdate && (
                                <span className="text-[10px] bg-amber-900/60 text-amber-200 px-2.5 py-0.5 rounded-lg border border-amber-700 font-bold">
                                  سبب التحديث: {meas.reasonForUpdate}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                              {meas.items.map(it => (
                                <div key={it.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                                  <span className="text-slate-400 font-bold text-[11px] block">{it.name}</span>
                                  <p className="font-black text-emerald-400 text-sm font-mono dir-ltr text-right">
                                    {it.value} <span className="text-xs text-amber-400 font-sans">{it.unit}</span>
                                  </p>
                                  {it.notes && <p className="text-[10px] text-slate-500 italic">ملاحظة: {it.notes}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUB-VIEW 3: MY DESIGNS */}
        {activeTab === 'designs' && (
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl space-y-6">
            <div className="pb-3 border-b border-slate-700">
              <h3 className="text-lg font-black text-white">تصميماتك الـ 3D والموافقة الفنية (3D Designs & Approval)</h3>
              <p className="text-xs text-slate-400">يمكنك معاينة التصميمات 3D، إضافة ملاحظاتك، أو اعتماد التصميم للانتقال للتصنيع</p>
            </div>

            {myDesigns.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">لا توجد تصميمات 3D مرفقة بحسابك بعد</p>
            ) : (
              <div className="space-y-6">
                {myDesigns.map(dsg => {
                  const dsgMeta = CustomProjectService.getDesignStatusMeta(dsg.status);

                  return (
                    <div key={dsg.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-700 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-xl bg-[#C87A38] text-white flex items-center justify-center font-black text-xs font-mono">V{dsg.version}</span>
                            <h4 className="text-base font-black text-white">{dsg.designName}</h4>
                          </div>
                          <span className="text-[11px] text-slate-400">تاريخ الإرسال: {dsg.createdDate}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${dsgMeta.bgClass}`}>
                            {dsgMeta.label}
                          </span>

                          {dsg.status !== 'approved' && (
                            <button
                              onClick={() => updateDesignStatus(dsg.id, 'approved')}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>اعتماد واختيار هذا التصميم</span>
                            </button>
                          )}

                          {dsg.status !== 'rejected' && (
                            <button
                              onClick={() => setRejectionModalDesignId(dsg.id)}
                              className="px-3.5 py-2 bg-rose-900/60 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold text-xs rounded-xl"
                            >
                              طلب تعديلات / تغيير
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Rendering Image with Interactive Zoom */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {dsg.images.map((img, i) => (
                          <div
                            key={i}
                            onClick={() => setPortalActiveLightbox({ images: dsg.images, index: i, title: `${dsg.designName} (V${dsg.version})` })}
                            className="group relative h-64 rounded-2xl overflow-hidden border border-slate-700 shadow-md cursor-pointer bg-slate-950"
                          >
                            <img src={img} alt="design-rendering" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                              <span className="px-4 py-2 rounded-xl bg-emerald-600 font-bold text-xs text-white flex items-center gap-1.5 shadow-lg">
                                <ZoomIn className="w-4 h-4 text-amber-300" />
                                <span>معاينة وتكبير التفاصيل (Zoom In)</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {dsg.rejectionReason && (
                        <div className="p-3.5 bg-rose-950/70 border border-rose-800 rounded-2xl text-xs font-bold text-rose-200">
                          ملاحظة التعديل المطلوبة منك: {dsg.rejectionReason}
                        </div>
                      )}

                      {/* Comments */}
                      <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 space-y-3 text-xs">
                        <p className="font-bold text-slate-300">ملاحظاتك واستفساراتك على التصميم V{dsg.version}:</p>
                        <div className="space-y-2">
                          {dsg.comments.map(c => (
                            <div key={c.id} className={`p-3 rounded-xl border ${c.isCustomer ? 'bg-[#361D13] border-emerald-800 text-emerald-100' : 'bg-slate-900 border-slate-700 text-slate-200'}`}>
                              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                                <span>{c.userName}</span>
                                <span className="font-mono">{c.date}</span>
                              </div>
                              <p className="font-bold text-xs mt-1">{c.text}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="أكتب ملاحظتك للمهندس المصمم هنا..."
                            className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                          />
                          <button
                            onClick={() => {
                              if (!commentText.trim()) return;
                              addDesignComment(dsg.id, commentText, true);
                              setCommentText('');
                            }}
                            className="px-4 py-2 bg-[#C87A38] text-white font-bold rounded-xl"
                          >
                            إرسال الملاحظة
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUB-VIEW 3: MY QUOTATIONS */}
        {activeTab === 'quotations' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>عروض الأسعار الرسمية المعتمدة لك (Official Quotations)</span>
                  <span className="text-xs bg-[#C87A38] text-white px-2.5 py-0.5 rounded-full font-mono">
                    {myQuotes.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  عرض سعر تفصيلي شامل للأمتار والمواصفات والخامات والتجهيزات مع إمكانية التحميل والطباعة PDF
                </p>
              </div>
            </div>

            {myQuotes.length === 0 ? (
              <div className="bg-slate-800 rounded-3xl p-12 text-center border border-slate-700">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-bold">لا توجد عروض أسعار صادرة لحسابك بعد</p>
                <p className="text-xs text-slate-500 mt-1">يقوم مهندس التصميم بإعداد عرض السعر الرسمي عقب انتهاء مرحلة رفع المقاسات والتصميم</p>
              </div>
            ) : (
              <div className="space-y-8">
                {myQuotes.map(qte => {
                  const currentProject = myProjects.find(p => p.id === qte.projectId);
                  return (
                    <OfficialQuotationSheet
                      key={qte.id}
                      quotation={qte}
                      project={currentProject}
                      customer={customer}
                      onApprove={acceptQuotation}
                      showActions={true}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUB-VIEW 4: MY CONTRACT */}
        {activeTab === 'contract' && (
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl space-y-6">
            <div className="pb-3 border-b border-slate-700">
              <h3 className="text-lg font-black text-white">عقودك المعتمدة والموثقة (Signed Contracts)</h3>
            </div>

            {myContracts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">لا توجد عقود صادرة لحسابك بعد</p>
            ) : (
              <div className="space-y-4">
                {myContracts.map(cnt => (
                  <div key={cnt.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-700 space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="font-mono font-black text-amber-300 text-base block">{cnt.contractNumber}</span>
                        <span className="text-[11px] text-slate-400">تاريخ التوقيع: {cnt.signedAt || cnt.contractDate}</span>
                      </div>

                      <span className="px-3 py-1 bg-emerald-900 text-emerald-200 border border-emerald-700 rounded-xl font-bold">
                        ✓ عقد موقع ومعتمد رسمياً
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300 font-bold">
                      <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700">
                        <span className="text-slate-400 text-[10px] block">إجمالي قيمة العقد المعتمدة:</span>
                        <span className="text-white font-mono text-sm font-black">{cnt.totalValue.toLocaleString('ar-EG')} ج.م</span>
                      </div>

                      <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700">
                        <span className="text-slate-400 text-[10px] block">شروط الدفع والأقساط:</span>
                        <span>{cnt.paymentTerms}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-slate-300 font-bold">
                      <span className="text-slate-400 text-[10px] block">شروط التوريد والتركيب والضمان:</span>
                      <span>{cnt.deliveryTerms}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUB-VIEW 5: MY PAYMENTS & SCHEDULE */}
        {activeTab === 'payments' && (
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl space-y-6">
            <div className="pb-3 border-b border-slate-700">
              <h3 className="text-lg font-black text-white">طلباتك وجدول الدفعات والأقساط (Payment Schedule & Receipts)</h3>
              <p className="text-xs text-slate-400">تابع الأقساط المسددة والقادمة، واعرض إيصالات الاستلام الرسمية</p>
            </div>

            {/* Payment Schedule List */}
            <div className="space-y-3 text-xs">
              {myPaymentSchedules.map((sch, i) => {
                const isPaid = sch.status === 'paid';
                const isPartially = sch.status === 'partially_paid';
                const isOverdue = sch.status === 'overdue';

                return (
                  <div
                    key={sch.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isPaid
                        ? 'bg-emerald-950/60 border-emerald-700 text-emerald-100'
                        : isOverdue
                        ? 'bg-rose-950/70 border-rose-700 text-rose-100 font-bold'
                        : 'bg-slate-900 border-slate-700 text-white font-bold'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm">قسط رقم #{sch.installmentNumber}</span>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                          isPaid ? 'bg-emerald-800 border-emerald-600' : isOverdue ? 'bg-rose-800 border-rose-600' : 'bg-slate-800 border-slate-600'
                        }`}>
                          {isPaid ? '✓ تم السداد بالكامل' : isPartially ? 'سداد جزئي' : isOverdue ? '⚠️ قسط متأخر' : 'قسط قادم'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">مستحق بتاريخ: {sch.dueDate}</p>
                    </div>

                    <div className="flex items-center gap-4 text-left font-mono dir-ltr">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">قيمة القسط:</span>
                        <span className="font-black text-base">{sch.amount.toLocaleString('ar-EG')} ج.م</span>
                      </div>

                      {sch.paymentRef && (
                        <button
                          onClick={() => {
                            const rcp = myReceipts.find(r => r.receiptNumber === sch.paymentRef);
                            if (rcp) setSelectedReceiptId(rcp.id);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-emerald-300 font-bold text-[11px] rounded-xl flex items-center gap-1 font-sans dir-rtl"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>عرض الإيصال</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Issued Receipts */}
            {myReceipts.length > 0 && (
              <div className="pt-4 border-t border-slate-700 space-y-3">
                <h4 className="text-sm font-black text-white">إيصالات التحصيل الصادرة الرسمية (Payment Receipts):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {myReceipts.map(rcp => (
                    <div key={rcp.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-between">
                      <div>
                        <p className="font-mono font-black text-emerald-400">{rcp.receiptNumber}</p>
                        <p className="text-[10px] text-slate-400">{rcp.paymentDate}</p>
                      </div>

                      <div className="text-left font-mono">
                        <span className="font-black text-amber-300">{rcp.amount.toLocaleString('ar-EG')} ج.م</span>
                        <span className="text-[10px] text-slate-400 block font-sans">طريقة الدفع: {rcp.paymentMethod}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Rejection Modal */}
      {rejectionModalDesignId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-700 text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-rose-400">طلب تعديلات وملاحظات على التصميم 3D</h3>
            
            <div>
              <label className="block font-bold text-slate-300 mb-1">اذكر التعديل المطلوب بدقة للمصمم *</label>
              <textarea
                rows={3}
                value={rejectionReasonText}
                onChange={e => setRejectionReasonText(e.target.value)}
                placeholder="مثال: يرجى تغيير لون الوحدات العلوية وتكبير مقاس الجزيرة الوسطية إلى 180سم"
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setRejectionModalDesignId(null)} className="px-4 py-2 border border-slate-700 rounded-xl font-bold text-slate-400">إلغاء</button>
              <button type="button" onClick={() => {
                if (!rejectionReasonText.trim()) return;
                updateDesignStatus(rejectionModalDesignId, 'rejected', rejectionReasonText);
                setRejectionModalDesignId(null);
              }} className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-black rounded-xl shadow-md">إرسال طلب التعديل</button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Lightbox Zoom Modal */}
      {portalActiveLightbox && (
        <ImageZoomModal
          isOpen={!!portalActiveLightbox}
          onClose={() => setPortalActiveLightbox(null)}
          images={portalActiveLightbox.images}
          initialIndex={portalActiveLightbox.index}
          title={portalActiveLightbox.title}
        />
      )}

    </div>
  );
};
