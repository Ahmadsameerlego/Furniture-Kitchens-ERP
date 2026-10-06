import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Layers,
  Factory,
  Clock,
  CheckCircle2,
  Users,
  Compass,
  Ruler,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Percent,
  Sparkles,
  ChevronLeft,
  Building2,
  Award,
  Zap,
  Target,
  FileSpreadsheet,
  Flame,
  Truck,
  Scissors
} from 'lucide-react';
import { ProjectType } from '../types/erp';

export const AnalyticsPage: React.FC = () => {
  const {
    customProjects,
    customContracts,
    productionOrders,
    installationRecords,
    paymentReceipts,
    materials,
    branches,
    currentBranch,
    setActiveModule,
    setSelectedProjectId
  } = useERP();

  // Filter States
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'ytd' | 'last_year'>('quarter');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'profitability' | 'manufacturing' | 'sales_crm'>('overview');

  // Computed Metrics
  const totalContractRevenue = customContracts.reduce((sum, c) => sum + (c.totalValue || 0), 0);
  const totalCollected = paymentReceipts.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalProjectsCount = customProjects.length;
  const completedProjectsCount = customProjects.filter(p => p.status === 'completed').length;
  const averageProjectValue = customContracts.length > 0 ? Math.round(totalContractRevenue / customContracts.length) : 0;

  // Estimated gross profit margin (Industry benchmark for custom kitchens: 38% - 45%)
  const estimatedGrossMargin = 41.6;
  const totalGrossProfit = Math.round(totalContractRevenue * (estimatedGrossMargin / 100));

  // Wood sheet optimization scrap rate
  const averageScrapRate = 7.8; // Market benchmark < 10%
  const scrapReductionSavings = 145000; // in EGP

  // Category Breakdown Data
  const categoriesData = [
    { type: 'مطابخ HPL وأكريليك', share: 44, revenue: 1420000, margin: 44.5, count: 8, color: 'bg-[#C87A38]' },
    { type: 'دريسنج روم ووحدات تخزين', share: 24, revenue: 780000, margin: 39.2, count: 5, color: 'bg-emerald-600' },
    { type: 'غرف نوم ماستر مودرن', share: 18, revenue: 580000, margin: 36.8, count: 4, color: 'bg-blue-600' },
    { type: 'تجاليد خشبية ووحدات TV', share: 14, revenue: 450000, margin: 42.0, count: 3, color: 'bg-purple-600' },
  ];

  // Lead Time Breakdown (in Days)
  const leadTimeStages = [
    { stage: 'المعاينة ورفع المقاسات', days: 3, benchmark: 4, status: 'faster' },
    { stage: 'المكتب الفني واعتماد 3D', days: 4, benchmark: 6, status: 'faster' },
    { stage: 'توقيع العقد وسداد الدفعة', days: 2, benchmark: 3, status: 'faster' },
    { stage: 'تصنيع الورش والنجارة والدهان', days: 12, benchmark: 15, status: 'faster' },
    { stage: 'التوريد والتركيب بالموقع', days: 3, benchmark: 4, status: 'faster' },
    { stage: 'المعاينة والاعتماد النهائي', days: 2, benchmark: 2, status: 'on_track' }
  ];
  const totalAvgLeadTime = leadTimeStages.reduce((s, i) => s + i.days, 0);

  // Marketing Channels Conversion
  const acquisitionChannels = [
    { channel: 'زيارات المعارض المباشرة (Walk-ins)', leads: 42, conversions: 22, rate: 52.4, revenue: 1650000 },
    { channel: 'ترشيحات مهندسي الديكور (Architects)', leads: 18, conversions: 12, rate: 66.7, revenue: 980000 },
    { channel: 'حملات السوشيال ميديا (Meta & TikTok)', leads: 95, conversions: 19, rate: 20.0, revenue: 480000 },
    { channel: 'توصيات العملاء السابقين (Referrals)', leads: 14, conversions: 11, rate: 78.5, revenue: 720000 }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. HEADER & FILTER CONTROLS */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>ذكاء الأعمال وتحليلات الأداء (Business Intelligence & Analytics Hub)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              التحليلات الاستراتيجية لمشاريع الأثاث والمطابخ
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              تحليل دقيق للربحية، كفاءة دورة حياة المشاريع، استهلاك الأخشاب ونسب الهدر، ومعدلات تحويل المبيعات
            </p>
          </div>

          {/* Filter Bar & Export */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Time Frame Selector */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 text-xs font-bold text-slate-600">
              <button
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1.5 rounded-xl transition-all ${timeRange === 'month' ? 'bg-white text-slate-900 shadow-xs font-black' : 'hover:text-slate-900'}`}
              >
                الشهر الحالي
              </button>
              <button
                onClick={() => setTimeRange('quarter')}
                className={`px-3 py-1.5 rounded-xl transition-all ${timeRange === 'quarter' ? 'bg-[#361D13] text-white shadow-xs font-black' : 'hover:text-slate-900'}`}
              >
                الربع الثالث Q3
              </button>
              <button
                onClick={() => setTimeRange('ytd')}
                className={`px-3 py-1.5 rounded-xl transition-all ${timeRange === 'ytd' ? 'bg-white text-slate-900 shadow-xs font-black' : 'hover:text-slate-900'}`}
              >
                العام الحالي (YTD)
              </button>
            </div>

            {/* Branch Selector */}
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl px-3 py-2 outline-hidden focus:ring-2 focus:ring-[#C87A38]"
            >
              <option value="all">🏢 جميع الفروع والمقرات</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            {/* Export Report Button */}
            <button
              onClick={() => alert('تم تجهيز التقرير التحليلي للطباعة والتصدير بنجاح.')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير التقرير</span>
            </button>
          </div>
        </div>

        {/* 2. SUB-NAVIGATION BI TABS */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#361D13] to-[#4d2c20] text-white shadow-md'
                : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>نظرة شاملة ومؤشرات الأداء التراكمية</span>
          </button>

          <button
            onClick={() => setActiveTab('profitability')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'profitability'
                ? 'bg-gradient-to-r from-[#C87A38] to-[#df8e4d] text-white shadow-md'
                : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>الربحية وهوامش العقود والمطابخ</span>
          </button>

          <button
            onClick={() => setActiveTab('manufacturing')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'manufacturing'
                ? 'bg-gradient-to-r from-[#1E3A2F] to-[#2c5344] text-white shadow-md'
                : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Factory className="w-4 h-4" />
            <span>كفاءة المصنع وهدر الألواح والـ Lead Time</span>
          </button>

          <button
            onClick={() => setActiveTab('sales_crm')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'sales_crm'
                ? 'bg-gradient-to-r from-blue-800 to-indigo-900 text-white shadow-md'
                : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>قنوات استقطاب العملاء ومبيعات الفروع</span>
          </button>
        </div>
      </div>

      {/* 3. TOP KPI SCORECARDS (Comparisons with Previous Period) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>إيرادات العقود المتعاقد عليها</span>
            <span className="inline-flex items-center text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg text-[10px]">
              <TrendingUp className="w-3 h-3 ml-1" /> +24.6%
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {totalContractRevenue.toLocaleString()} <span className="text-xs font-medium text-slate-500">ج.م</span>
          </p>
          <p className="text-[11px] text-slate-500">
            مقارنة بـ {(totalContractRevenue * 0.8).toLocaleString(undefined, { maximumFractionDigits: 0 })} ج.م في الربع السابق
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>هامش الربح الإجمالي التقديري</span>
            <span className="inline-flex items-center text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg text-[10px]">
              <TrendingUp className="w-3 h-3 ml-1" /> +3.2%
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-700 tracking-tight">
            {estimatedGrossMargin}% <span className="text-xs font-medium text-slate-500">({totalGrossProfit.toLocaleString()} ج.م)</span>
          </p>
          <p className="text-[11px] text-slate-500">
            أعلى بهامش 4.1% عن المعيار الصناعي للسوق
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>معدل هدر الألواح (Scrap Rate)</span>
            <span className="inline-flex items-center text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg text-[10px]">
              <TrendingDown className="w-3 h-3 ml-1" /> -2.4% هدر أقل
            </span>
          </div>
          <p className="text-2xl font-black text-[#C87A38] tracking-tight">
            {averageScrapRate}% <span className="text-xs font-medium text-slate-500">(وفر: {scrapReductionSavings.toLocaleString()} ج.م)</span>
          </p>
          <p className="text-[11px] text-slate-500">
            بفضل خوارزمية تفجير الـ BOM وتقطيع الـ CNC
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>متوسط دورة المشروع (Lead Time)</span>
            <span className="inline-flex items-center text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg text-[10px]">
              <TrendingDown className="w-3 h-3 ml-1" /> أسرع بـ 6 أيام
            </span>
          </div>
          <p className="text-2xl font-black text-[#361D13] tracking-tight">
            {totalAvgLeadTime} <span className="text-xs font-medium text-slate-500">يوماً من المقايسة للتسليم</span>
          </p>
          <p className="text-[11px] text-slate-500">
            المستهدف القياسي للعمولة: 32 يوماً
          </p>
        </div>

      </div>

      {/* 4. MAIN CONTENT TABS VIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue by Category Progress */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-[#C87A38]" />
                  <span>توزيع المبيعات والإيرادات حسب خطوط المنتجات العمولة</span>
                </h3>
                <p className="text-xs text-slate-500">حصة كل قطاع من إجمالي التعاقدات وهامش ربحه</p>
              </div>
            </div>

            <div className="space-y-4">
              {categoriesData.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">{cat.type} ({cat.count} مشاريع)</span>
                    <span className="text-slate-900 font-black">
                      {cat.revenue.toLocaleString()} ج.م <span className="text-emerald-600 text-[11px]">({cat.margin}% هامش)</span>
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      className={`h-full rounded-full ${cat.color} transition-all duration-700`}
                      style={{ width: `${cat.share}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>الحصة من المبيعات: {cat.share}%</span>
                    <span>متوسط العقد: {Math.round(cat.revenue / cat.count).toLocaleString()} ج.م</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span>قمع تحويل مشاريع العمولة (Funnel)</span>
                </h3>
                <p className="text-[11px] text-slate-500">معدل انتقال العميل من مرحلة لأخرى</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-1">
                <div className="flex justify-between text-xs font-black text-blue-950">
                  <span>1. استفسارات ومقايسات موقع</span>
                  <span>100% (45 عميل)</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-1 mr-3">
                <div className="flex justify-between text-xs font-black text-purple-950">
                  <span>2. عروض أسعار وتصاميم 3D</span>
                  <span>78% (35 مشروع)</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-1 mr-6">
                <div className="flex justify-between text-xs font-black text-teal-950">
                  <span>3. توقيع عقود وسداد مقدم</span>
                  <span>56% (25 عقد)</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-1 mr-9">
                <div className="flex justify-between text-xs font-black text-emerald-950">
                  <span>4. اكتمال التركيب والتسليم النهائي</span>
                  <span>44% (20 مشروع منجز)</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 5. PROFITABILITY TAB */}
      {activeTab === 'profitability' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>هيكل تكلفة تصنيع المطابخ والأثاث (Cost Structure Breakdown)</span>
            </h3>
            
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>خامات الأخشاب والألواح (MDF، كونتر، HPL، أكريليك)</span>
                  <strong className="text-slate-900 font-black">42% من التكلفة</strong>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full rounded-full bg-[#361D13]" style={{ width: '42%' }}></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>الإكسسوارات والمفصلات والمجاري (Blum / Hafele)</span>
                  <strong className="text-slate-900 font-black">22% من التكلفة</strong>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full rounded-full bg-[#C87A38]" style={{ width: '22%' }}></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>أجور الفنيين والعمالة المباشرة بالمصنع</span>
                  <strong className="text-slate-900 font-black">18% من التكلفة</strong>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: '18%' }}></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>مصاريف النقل والتركيبات الميدانية والضمان</span>
                  <strong className="text-slate-900 font-black">18% من التكلفة</strong>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full rounded-full bg-purple-600" style={{ width: '18%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Percent className="w-5 h-5 text-[#C87A38]" />
              <span>تحليل التكلفة التقديرية مقابل الفعلية (Cost Variance)</span>
            </h3>

            <div className="space-y-3 pt-2">
              {customContracts.slice(0, 4).map(contract => (
                <div key={contract.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-900">{contract.customerName} ({contract.projectNumber})</span>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      هامش ربح: 43.8%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">قيمة العقد:</span>
                      <strong className="text-slate-900 font-black">{contract.totalValue?.toLocaleString()} ج.م</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">التكلفة المقدرة:</span>
                      <strong className="text-slate-700 font-bold">{Math.round((contract.totalValue || 0) * 0.58).toLocaleString()} ج.م</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">صافي الربح:</span>
                      <strong className="text-emerald-700 font-black">{Math.round((contract.totalValue || 0) * 0.42).toLocaleString()} ج.م</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. MANUFACTURING & LEAD TIME TAB */}
      {activeTab === 'manufacturing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lead time analysis */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>تحليل مدة الإنجاز لكل مرحلة (Lead Time Breakdown)</span>
            </h3>

            <div className="space-y-3 pt-2">
              {leadTimeStages.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-slate-900">{item.stage}</span>
                    <span className="block text-[10px] text-slate-500">المعيار المستهدف: {item.benchmark} أيام</span>
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800">
                      {item.days} أيام فعلي
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wood Scrap & CNC Optimization */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Scissors className="w-5 h-5 text-[#C87A38]" />
              <span>معدلات هدر الألواح وكفاءة تقطيع الأخشاب (Panel Optimization)</span>
            </h3>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-emerald-500/10 border border-amber-300/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">معدل الاستغلال الفعلي للألواح (Utilization Rate)</span>
                <span className="text-lg font-black text-emerald-700">92.2%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-600" style={{ width: '92.2%' }}></div>
              </div>
              <p className="text-[11px] text-slate-600">
                نسبة الهادر لا تتجاوز <strong>7.8%</strong> مقارنة بمتوسط السوق البالغ 13.5% للأعمال اليدوية.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <span className="text-slate-400 text-[10px] block font-bold">ألواح MDF مقطوعة هذا الربع</span>
                <strong className="text-xl font-black text-slate-900">420 لوح</strong>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <span className="text-slate-400 text-[10px] block font-bold">ألواح HPL وأكريليك</span>
                <strong className="text-xl font-black text-slate-900">185 لوح</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. SALES & CHANNELS TAB */}
      {activeTab === 'sales_crm' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-700" />
                <span>تحليل قنوات استقطاب العملاء وعوائد الحملات (Acquisition Channels ROI)</span>
              </h3>
              <p className="text-xs text-slate-500">كفاءة كل قناة في تحويل الاستفسارات إلى عقود بيع ومشاريع منجزة</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-3 px-4 rounded-r-xl">القناة التسويقية</th>
                  <th className="py-3 px-4">العملاء المحتملين (Leads)</th>
                  <th className="py-3 px-4">العقود الموقعة</th>
                  <th className="py-3 px-4">نسبة التحويل (Conversion %)</th>
                  <th className="py-3 px-4 rounded-l-xl">إجمالي المبيعات المحققة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {acquisitionChannels.map((ch, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{ch.channel}</td>
                    <td className="py-3.5 px-4 text-slate-700">{ch.leads} مهتم</td>
                    <td className="py-3.5 px-4 font-black text-slate-900">{ch.conversions} عقد</td>
                    <td className="py-3.5 px-4">
                      <span className="font-black px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {ch.rate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#361D13]">{ch.revenue.toLocaleString()} ج.م</td>
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
