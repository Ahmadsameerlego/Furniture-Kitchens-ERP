import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { CompanyExpense, ExpenseCategory, FinancialAccount, FinancialTransaction } from '../types/erp';
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Building,
  Users,
  FileText,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PieChart,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Receipt,
  Building2,
  ShieldCheck,
  Briefcase,
  HelpCircle,
  Info
} from 'lucide-react';

const MetricTooltip: React.FC<{ title: string; explanation: string; icon?: React.ReactNode }> = ({ title, explanation, icon }) => (
  <div className="flex items-center justify-between text-slate-500 font-bold w-full">
    <div className="flex items-center gap-1.5 relative group cursor-help">
      <span className="text-slate-800 font-bold">{title}</span>
      <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-colors shrink-0" />
      <div className="pointer-events-none absolute bottom-full mb-2 right-0 w-64 bg-slate-900 text-white text-[11px] font-normal leading-relaxed p-3 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 text-right dir-rtl border border-slate-700/80">
        <p className="font-bold text-amber-300 mb-1 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-amber-300" />
          <span>{title}</span>
        </p>
        <p className="text-slate-200 text-[10px] leading-relaxed">{explanation}</p>
        <div className="absolute top-full right-4 border-4 border-transparent border-t-slate-900"></div>
      </div>
    </div>
    {icon}
  </div>
);

export const FinanceDashboardPage: React.FC = () => {
  const {
    orders,
    payments,
    suppliers,
    materials,
    products,
    customProjects,
    projectQuotations,
    expenses,
    financialAccounts,
    financialTransactions,
    availableBranches,
    recordCustomerPayment,
    addCompanyExpense,
    transferBetweenFinancialAccounts,
    recordSupplierPaymentFromFinance,
    checkPermission
  } = useERP();

  const [activeTab, setActiveTab] = useState<'overview' | 'receivables' | 'payables' | 'expenses' | 'accounts' | 'profitability' | 'ledger'>('overview');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);
  const [expenseCat, setExpenseCat] = useState<ExpenseCategory>('rent');
  const [expenseDesc, setExpenseDesc] = useState<string>('');
  const [expenseAmount, setExpenseAmount] = useState<number>(5000);
  const [expenseMethod, setExpenseMethod] = useState<'cash' | 'bank_transfer' | 'card'>('cash');
  const [expenseAccName, setExpenseAccName] = useState<string>('خزينة المعرض الرئيسي (Main Cash)');
  const [expenseProjectRef, setExpenseProjectRef] = useState<string>('');

  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [fromAccId, setFromAccId] = useState<string>(financialAccounts[0]?.id || 'acc-1');
  const [toAccId, setToAccId] = useState<string>(financialAccounts[2]?.id || 'acc-3');
  const [transferAmt, setTransferAmt] = useState<number>(10000);
  const [transferNotes, setTransferNotes] = useState<string>('إيداع نقدية المعرض بالبنك');

  const [showSupplierPayModal, setShowSupplierPayModal] = useState<boolean>(false);
  const [paySupplierId, setPaySupplierId] = useState<string>(suppliers[0]?.id || 'sup-1');
  const [payAmount, setPayAmount] = useState<number>(10000);
  const [payMethod, setPayMethod] = useState<'cash' | 'bank_transfer' | 'check'>('bank_transfer');
  const [payAccId, setPayAccId] = useState<string>(financialAccounts[2]?.id || 'acc-3');

  // Customer Payment Quick Modal State
  const [showCustomerPayModal, setShowCustomerPayModal] = useState<boolean>(false);
  const [payOrderId, setPayOrderId] = useState<string>(orders[0]?.id || '');
  const [payCustAmount, setPayCustAmount] = useState<number>(10000);
  const [payCustMethod, setPayCustMethod] = useState<'cash' | 'bank_transfer' | 'card'>('cash');
  const [payCustNotes, setPayCustNotes] = useState<string>('تحصيل دفعة مالية لحساب العقد');

  const canViewCosts = checkPermission('finance', 'view');

  // Filter Data by Branch
  const filteredOrders = orders.filter(o => selectedBranch === 'all' || o.branchId === selectedBranch);
  const filteredExpenses = expenses.filter(e => selectedBranch === 'all' || e.branchId === selectedBranch);
  const filteredTransactions = financialTransactions.filter(t => selectedBranch === 'all' || t.branchId === selectedBranch);

  // 1. REVENUE (Order Value) & MONEY RECEIVED
  const totalRevenue = filteredOrders.reduce((acc, o) => acc + o.orderTotal, 0);
  const totalMoneyReceived = filteredOrders.reduce((acc, o) => acc + o.paidAmount, 0);
  const totalReceivables = filteredOrders.reduce((acc, o) => acc + o.remainingBalance, 0);

  // 2. COST OF SALES (Actual Product + Material Costs)
  const totalCostOfSales = filteredOrders.reduce((acc, o) => acc + o.totalPurchaseCost, 0);

  // 3. GROSS PROFIT
  const grossProfit = totalRevenue - totalCostOfSales;

  // 4. OPERATING EXPENSES
  const totalOperatingExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  // 5. NET OPERATING PROFIT
  const netOperatingProfit = grossProfit - totalOperatingExpenses;

  // 6. SUPPLIER PAYABLES
  const totalSupplierPayables = suppliers.reduce((acc, s) => acc + s.balanceDue, 0);

  // 7. CASH & BANK TOTAL BALANCES
  const totalCashBalance = financialAccounts.filter(a => a.type === 'cash').reduce((acc, a) => acc + a.currentBalance, 0);
  const totalBankBalance = financialAccounts.filter(a => a.type === 'bank' || a.type === 'card').reduce((acc, a) => acc + a.currentBalance, 0);
  const totalLiquidAssets = totalCashBalance + totalBankBalance;

  // 8. PROFITABILITY CALCULATIONS FOR CUSTOM PROJECTS & READY PRODUCTS
  const customProjectsProfitability = (customProjects && customProjects.length > 0 ? customProjects : [
    { id: 'prj-demo-1', projectNumber: 'PRJ-2026-001', projectName: 'مطبخ مودرن أوف وايت HPL', customerName: 'المهندس أحمد سلامة', branchName: 'المعرض الرئيسي - القاهرة' },
    { id: 'prj-demo-2', projectNumber: 'PRJ-2026-002', projectName: 'غرفة نوم ماستر كابتونيه شامبين', customerName: 'د/ سارة الفار', branchName: 'فرع الشيخ زايد' },
    { id: 'prj-demo-3', projectNumber: 'PRJ-2026-003', projectName: 'وحدة TV وتجليد خشب HPL خشابي', customerName: 'أ/ محمود عبد الرحمن', branchName: 'فرع المعادي' },
    { id: 'prj-demo-4', projectNumber: 'PRJ-2026-004', projectName: 'مطبخ كلاسيك أرو اسباني مطعم بجرانيت', customerName: 'د/ كريم الشاذلي', branchName: 'المعرض الرئيسي - القاهرة' }
  ]).map((prj: any, index: number) => {
    const quote = (projectQuotations || []).find((q: any) => q.projectId === prj.id && q.status === 'accepted') ||
                  (projectQuotations || []).find((q: any) => q.projectId === prj.id) ||
                  (projectQuotations || [])[index % Math.max(1, (projectQuotations || []).length)];

    const fallbackSelling = 165000 + (index * 42000);
    const fallbackCost = 92000 + (index * 22000);

    const sellingPrice = quote ? quote.totalSelling : fallbackSelling;
    const materialCost = quote ? quote.totalCost : fallbackCost;
    const laborCost = Math.round(materialCost * 0.22);
    const netProfit = Math.max(0, sellingPrice - materialCost - laborCost);
    const margin = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;

    let badgeLabel = '✓ ممتازة الربحية';
    let badgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';

    if (margin < 20) {
      badgeLabel = '⚠️ هامش منخفض';
      badgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
    } else if (margin > 35) {
      badgeLabel = '💎 أعلى ربحية (High Margin)';
      badgeClass = 'bg-purple-100 text-purple-900 border-purple-300';
    }

    return {
      id: prj.id,
      projectNumber: prj.projectNumber || `PRJ-2026-00${index + 1}`,
      projectName: prj.projectName || 'مشروع مطبخ/أثاث مخصص',
      customerName: prj.customerName || 'عميل مخصص',
      branchName: prj.branchName || 'المعرض الرئيسي',
      sellingPrice,
      materialCost,
      laborCost,
      netProfit,
      margin,
      badgeLabel,
      badgeClass
    };
  });

  const topProject = [...customProjectsProfitability].sort((a, b) => b.netProfit - a.netProfit)[0];

  const productProfitability = (products && products.length > 0 ? products : [
    { id: 'prod-demo-1', code: 'PRD-SALON-01', name: 'صالون كلاسيك مذهب فاخر (5 قطع)', categoryName: 'صالونات وانتريهات', defaultPurchaseCost: 45000, sellingPrice: 78000 },
    { id: 'prod-demo-2', code: 'PRD-BED-02', name: 'غرفة نوم ماستر كابتونيه مودرن 2026', categoryName: 'غرف نوم', defaultPurchaseCost: 38000, sellingPrice: 62000 },
    { id: 'prod-demo-3', code: 'PRD-DIN-03', name: 'سفرة مودرن 8 كراسي رخام اسباني', categoryName: 'غرف سفرة', defaultPurchaseCost: 32000, sellingPrice: 54000 },
    { id: 'prod-demo-4', code: 'PRD-KIT-04', name: 'مطبخ جاهز ألوميتال خشمونيوم 3 متر', categoryName: 'مطابخ جاهزة', defaultPurchaseCost: 22000, sellingPrice: 36000 }
  ]).map((prod: any, index: number) => {
    const purchaseCost = prod.defaultPurchaseCost || (14000 + index * 8000);
    const sellingPrice = prod.sellingPrice || (24000 + index * 12000);
    const unitProfit = Math.max(0, sellingPrice - purchaseCost);
    const unitMargin = sellingPrice > 0 ? (unitProfit / sellingPrice) * 100 : 0;
    const unitsSold = 9 + ((index * 7) % 15);
    const totalProfit = unitProfit * unitsSold;

    let ratingLabel = 'عادي (Standard)';
    let ratingClass = 'bg-slate-100 text-slate-700 border-slate-200';

    if (unitsSold >= 15) {
      ratingLabel = '🏆 الأكثر مبيعاً (Top Seller)';
      ratingClass = 'bg-amber-100 text-amber-900 border-amber-300 font-black';
    } else if (unitMargin >= 35) {
      ratingLabel = '💎 هامش ربح مرتفع';
      ratingClass = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black';
    }

    return {
      id: prod.id,
      code: prod.code || `PRD-00${index + 1}`,
      name: prod.name || 'منتج أثاث جاهز',
      categoryName: prod.categoryName || 'أثاث جاهز',
      purchaseCost,
      sellingPrice,
      unitProfit,
      unitMargin,
      unitsSold,
      totalProfit,
      ratingLabel,
      ratingClass
    };
  });

  const topProduct = [...productProfitability].sort((a, b) => b.totalProfit - a.totalProfit)[0];

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#1C352D] text-white flex items-center justify-center font-bold shadow-md">
              <Landmark className="w-5 h-5 text-[#E06F28]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">المركز المالي والحسابات (Central Finance)</h1>
              <p className="text-xs text-slate-500 font-bold">
                إدارة الإيرادات، مصروفات التشغيل، الخزائن والبنوك، مديونيات الموردين، ومؤشرات ربحية المشاريع
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          {/* Branch Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-2 rounded-2xl border border-slate-200 shadow-inner">
            <Building2 className="w-4 h-4 text-slate-500" />
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="all">🏢 جميع فروع والمعارض</option>
              {availableBranches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowCustomerPayModal(true)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-2xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 text-emerald-200" />
            <span>تحصيل دفعة عميل</span>
          </button>

          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Receipt className="w-4 h-4 text-[#E06F28]" />
            <span>إثبات مصروف</span>
          </button>
        </div>
      </div>

      {/* Non-Accountant Easy Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        
        <button
          type="button"
          onClick={() => setShowCustomerPayModal(true)}
          className="p-4 bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 text-white rounded-3xl shadow-md transition-all flex items-center justify-between text-right group border border-emerald-600/40"
        >
          <div>
            <span className="block font-black text-sm text-white group-hover:translate-x-1 transition-transform">
              📥 تحصيل دفعة من عميل
            </span>
            <span className="text-[10px] text-emerald-200 block font-bold mt-0.5">تسجيل قسط أو دفعة مبيعات</span>
          </div>
          <div className="w-8 h-8 rounded-2xl bg-white/10 flex items-center justify-center font-black text-emerald-200 text-base shrink-0">
            +
          </div>
        </button>

        <button
          type="button"
          onClick={() => setShowSupplierPayModal(true)}
          className="p-4 bg-gradient-to-r from-rose-800 to-rose-700 hover:from-rose-900 hover:to-rose-800 text-white rounded-3xl shadow-md transition-all flex items-center justify-between text-right group border border-rose-600/40"
        >
          <div>
            <span className="block font-black text-sm text-white group-hover:translate-x-1 transition-transform">
              📤 دفع فاتورة لمورد
            </span>
            <span className="text-[10px] text-rose-200 block font-bold mt-0.5">سداد مستحقات توريد خامات</span>
          </div>
          <div className="w-8 h-8 rounded-2xl bg-white/10 flex items-center justify-center font-black text-rose-200 text-base shrink-0">
            -
          </div>
        </button>

        <button
          type="button"
          onClick={() => setShowAddExpenseModal(true)}
          className="p-4 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-white rounded-3xl shadow-md transition-all flex items-center justify-between text-right group border border-amber-500/40"
        >
          <div>
            <span className="block font-black text-sm text-white group-hover:translate-x-1 transition-transform">
              🧾 إثبات مصروف تشغيلي
            </span>
            <span className="text-[10px] text-amber-100 block font-bold mt-0.5">إيجار، كهرباء، مرتبات، تسويق</span>
          </div>
          <div className="w-8 h-8 rounded-2xl bg-white/10 flex items-center justify-center font-black text-amber-200 text-base shrink-0">
            $
          </div>
        </button>

        <button
          type="button"
          onClick={() => setShowTransferModal(true)}
          className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white rounded-3xl shadow-md transition-all flex items-center justify-between text-right group border border-slate-700"
        >
          <div>
            <span className="block font-black text-sm text-white group-hover:translate-x-1 transition-transform">
              🔄 تحويل نقدية / بنك
            </span>
            <span className="text-[10px] text-slate-300 block font-bold mt-0.5">إيداع المعرض بالبنك أو سحب</span>
          </div>
          <div className="w-8 h-8 rounded-2xl bg-white/10 flex items-center justify-center font-black text-amber-300 text-base shrink-0">
            ⇄
          </div>
        </button>

      </div>

      {/* Finance Navigation Tabs */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-1.5 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 ${
            activeTab === 'overview' ? 'bg-[#1C352D] text-white shadow-md font-black' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PieChart className="w-4 h-4 text-[#E06F28]" />
          <span>المؤشرات المالية (Overview)</span>
        </button>

        <button
          onClick={() => setActiveTab('receivables')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 ${
            activeTab === 'receivables' ? 'bg-[#1C352D] text-white shadow-md font-black' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          <span>مستحقات العملاء ({totalReceivables.toLocaleString('ar-EG')} ج.م)</span>
        </button>

        <button
          onClick={() => setActiveTab('payables')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 ${
            activeTab === 'payables' ? 'bg-[#1C352D] text-white shadow-md font-black' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 text-rose-400" />
          <span>مديونيات الموردين ({totalSupplierPayables.toLocaleString('ar-EG')} ج.م)</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 ${
            activeTab === 'expenses' ? 'bg-[#1C352D] text-white shadow-md font-black' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4 text-amber-400" />
          <span>المصروفات والأجور ({totalOperatingExpenses.toLocaleString('ar-EG')} ج.م)</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 ${
            activeTab === 'accounts' ? 'bg-[#1C352D] text-white shadow-md font-black' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4 text-blue-400" />
          <span>الخزائن والبنوك ({totalLiquidAssets.toLocaleString('ar-EG')} ج.م)</span>
        </button>

        <button
          onClick={() => setActiveTab('profitability')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 ${
            activeTab === 'profitability' ? 'bg-[#1C352D] text-white shadow-md font-black' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>ربحية المشاريع والمنتجات</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 ${
            activeTab === 'ledger' ? 'bg-[#1C352D] text-white shadow-md font-black' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4 text-slate-300" />
          <span>سجل الحركات المالية (Ledger)</span>
        </button>
      </div>

      {/* SUB-VIEW 1: FINANCE OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* Visual Financial Health Summary Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-[#1C352D] to-slate-900 text-white rounded-3xl p-6 shadow-md space-y-4 border border-emerald-900/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-xl shrink-0">
                  🟢
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-white">مؤشر السلامة والصحة المالية: مستقرة وممتازة</h3>
                    <span className="px-3 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-bold text-[10px] border border-emerald-500/30">
                      مؤشر السيولة: 92/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-bold mt-0.5">
                    تحليل الأرباح التشغيلية، معدل تحصيل مستحقات العقود، والسيولة النقدية المتوفرة بالخزائن والبنوك
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs shrink-0">
                <div className="text-right bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                  <span className="text-slate-400 block text-[10px]">صافي السيولة الفورية:</span>
                  <span className="font-mono font-black text-emerald-300 text-base">{totalLiquidAssets.toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
              {/* Collection Progress Bar */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">معدل تحصيل مبيعات العقود (Collection Rate):</span>
                  <span className="font-mono text-emerald-400 font-black text-sm">
                    {totalRevenue > 0 ? ((totalMoneyReceived / totalRevenue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${totalRevenue > 0 ? Math.min(100, (totalMoneyReceived / totalRevenue) * 100) : 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                  <span>محصل: <strong className="text-emerald-300 font-mono">{totalMoneyReceived.toLocaleString('ar-EG')} ج.م</strong></span>
                  <span>إجمالي المبيعات: <strong className="text-white font-mono">{totalRevenue.toLocaleString('ar-EG')} ج.م</strong></span>
                </div>
              </div>

              {/* Operating Profit Margin Bar */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">نسبة صافي الربح التشغيلي (Net Margin):</span>
                  <span className="font-mono text-amber-300 font-black text-sm">
                    {totalRevenue > 0 ? ((netOperatingProfit / totalRevenue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${totalRevenue > 0 ? Math.min(100, Math.max(0, (netOperatingProfit / totalRevenue) * 100)) : 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                  <span>صافي الربح الفعلي: <strong className="text-amber-300 font-mono">{netOperatingProfit.toLocaleString('ar-EG')} ج.م</strong></span>
                  <span>المصروفات: <strong className="text-rose-300 font-mono">{totalOperatingExpenses.toLocaleString('ar-EG')} ج.م</strong></span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Financial KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            
            {/* Revenue / Sales */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
              <MetricTooltip
                title="إجمالي قيم المبيعات (Revenue)"
                explanation="إجمالي التعاقدات وأوامر المبيعات المعتمدة ومشاريع المطابخ والأثاث المخصص قبل الخصومات واستقطاع التكاليف المباشرة."
                icon={<DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />}
              />
              <p className="text-2xl font-black text-slate-900 font-mono">{totalRevenue.toLocaleString('ar-EG')} ج.م</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-2 font-bold">
                <span>المحصل فعلياً: <strong className="text-emerald-700 font-mono">{totalMoneyReceived.toLocaleString('ar-EG')} ج.م</strong></span>
                <span>المتبقي: <strong className="text-amber-700 font-mono">{totalReceivables.toLocaleString('ar-EG')} ج.م</strong></span>
              </div>
            </div>

            {/* Cost of Sales */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
              <MetricTooltip
                title="تكلفة المبيعات والخامات (Cost)"
                explanation="إجمالي التكلفة المباشرة للأنشطة والتصنيع شاملة تكلفة خامات BOM المرجعية وأسعار شراء المنتجات الجاهزة من الموردين."
                icon={<Layers className="w-4 h-4 text-amber-600 shrink-0" />}
              />
              <p className="text-2xl font-black text-slate-900 font-mono">{totalCostOfSales.toLocaleString('ar-EG')} ج.م</p>

              <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-2 font-bold">
                <span>محسوبة من تكلفة المشتريات والاستهلاك الفعلي للخامات</span>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-sm space-y-2">
              <MetricTooltip
                title="مجمل الربح (Gross Profit)"
                explanation="الفارق المالي المباشر الناتج عن طرح تكلفة الخامات والمنتجات المباشرة من إجمالي الإيرادات (Gross Profit = Revenue - COGS)."
                icon={<TrendingUp className="w-4 h-4 text-emerald-700 shrink-0" />}
              />
              <p className="text-2xl font-black text-emerald-950 font-mono">{grossProfit.toLocaleString('ar-EG')} ج.م</p>
              <div className="text-[10px] text-emerald-800 font-bold border-t border-emerald-200/60 pt-2">
                <span>هامش مجمل الربح: <strong className="font-mono">{totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0}%</strong></span>
              </div>
            </div>

            {/* Net Operating Profit */}
            <div className="p-5 rounded-3xl bg-[#1C352D] text-white border border-emerald-900 shadow-md space-y-2">
              <MetricTooltip
                title="صافي الربح التشغيلي (Net Profit)"
                explanation="المبلغ المالي المتبقي كربح صافي للشركة بعد خصم كلاً من تكلفة الخامات وكافة المصروفات التشغيلية والإيجارات والأجور."
                icon={<Sparkles className="w-4 h-4 text-amber-300 shrink-0" />}
              />
              <p className="text-2xl font-black text-amber-300 font-mono">{netOperatingProfit.toLocaleString('ar-EG')} ج.م</p>
              <div className="text-[10px] text-emerald-200 font-bold border-t border-emerald-800/80 pt-2 flex justify-between">
                <span>بعد خصم المصروفات التشغيلية</span>
                <span className="font-mono">({totalOperatingExpenses.toLocaleString('ar-EG')} ج.م)</span>
              </div>
            </div>

          </div>

          {/* Secondary Financial Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
            
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <MetricTooltip
                title="مستحقات العملاء المتبقية"
                explanation="إجمالي الدفعات والأقساط المستحقة غير المحصلة المطلوبة من العملاء لجميع أوامر المبيعات ومشاريع التفصيل الجارية."
                icon={<ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />}
              />
              <p className="text-2xl font-black text-emerald-700 font-mono">{totalReceivables.toLocaleString('ar-EG')} ج.م</p>
              <span className="text-[10px] text-slate-400 block">أقساط ودفعات مستحقة الدفع قريباً</span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <MetricTooltip
                title="مديونيات الموردين المطلوبة"
                explanation="إجمالي المبالغ المستحقة لموردي الخامات والأثاث الجاهز المسجلة كديون على الشركة ولم تـُسدد بالكامل بعد."
                icon={<ArrowDownLeft className="w-4 h-4 text-rose-600 shrink-0" />}
              />
              <p className="text-2xl font-black text-rose-700 font-mono">{totalSupplierPayables.toLocaleString('ar-EG')} ج.م</p>
              <span className="text-[10px] text-slate-400 block">مستحقات توريدات خامات ومواد</span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <MetricTooltip
                title="إجمالي أرصدة الخزائن والبنوك"
                explanation="مجموع السيولة النقدية والبنكية المتوفرة حالياً بالخزائن الرئيسية وخزائن الفروع بالإضافة لرصيد الحسابات البنكية."
                icon={<CreditCard className="w-4 h-4 text-blue-600 shrink-0" />}
              />
              <p className="text-2xl font-black text-blue-800 font-mono">{totalLiquidAssets.toLocaleString('ar-EG')} ج.م</p>
              <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                <span>نقدية: {totalCashBalance.toLocaleString('ar-EG')} ج.م</span>
                <span>بنوك: {totalBankBalance.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>

          </div>

          {/* Quick Recent Financial Ledger Audit Stream */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#E06F28]" />
              <span>آخر الحركات المالية الموثقة بالنظام (Recent Financial Transactions):</span>
            </h3>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                  <tr>
                    <th className="p-3 text-right">رقم الحركة</th>
                    <th className="p-3 text-right">التاريخ والوقت</th>
                    <th className="p-3 text-right">البند / البيان</th>
                    <th className="p-3 text-center">الفرع</th>
                    <th className="p-3 text-center">الحساب المالي</th>
                    <th className="p-3 text-left">المبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium text-slate-800">
                  {filteredTransactions.slice(0, 5).map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{tx.refNumber}</td>
                      <td className="p-3 font-mono text-slate-500">{tx.timestamp}</td>
                      <td className="p-3 font-bold text-slate-900">
                        {tx.description}
                        <span className="text-[10px] text-slate-500 block">{tx.category}</span>
                      </td>
                      <td className="p-3 text-center">{tx.branchName}</td>
                      <td className="p-3 text-center font-bold text-slate-700">{tx.accountName}</td>
                      <td className="p-3 text-left font-mono font-black">
                        <span className={tx.direction === 'in' ? 'text-emerald-700' : 'text-rose-700'}>
                          {tx.direction === 'in' ? '+' : '-'}{tx.amount.toLocaleString('ar-EG')} ج.م
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-VIEW 2: CUSTOMER RECEIVABLES */}
      {activeTab === 'receivables' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">جدول مستحقات وديون العملاء (Customer Receivables)</h3>
              <p className="text-slate-500 font-bold">متابعة إجمالي مبيعات الأوامر، المبالغ المحصلة، والمتبقي المستحق على العملاء</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 text-right">اسم العميل ورقم الهوية</th>
                  <th className="p-3 text-center">رقم أمر المبيعات</th>
                  <th className="p-3 text-left">إجمالي العقد</th>
                  <th className="p-3 text-left">المحصل فعلياً</th>
                  <th className="p-3 text-left">المتبقي المستحق</th>
                  <th className="p-3 text-center">تاريخ الموعد القادم</th>
                  <th className="p-3 text-center">الحالة المالية</th>
                  <th className="p-3 text-center">إجراء تحصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {filteredOrders.map(ord => {
                  const isPaid = ord.remainingBalance === 0;

                  return (
                    <tr key={ord.id} className={ord.remainingBalance > 0 ? 'bg-amber-50/40' : 'hover:bg-slate-50'}>
                      <td className="p-3 font-bold text-slate-900">
                        {ord.customerName}
                        <span className="text-[10px] text-slate-500 font-mono block">{ord.customerPhone}</span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-900">{ord.orderNumber}</td>
                      <td className="p-3 text-left font-mono font-bold">{ord.orderTotal.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3 text-left font-mono font-bold text-emerald-700">{ord.paidAmount.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3 text-left font-mono font-black text-rose-700">{ord.remainingBalance.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3 text-center font-mono text-slate-600">2026-09-01</td>
                      <td className="p-3 text-center">
                        {isPaid ? (
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-[10px]">✓ مسدد بالكامل</span>
                        ) : ord.paidAmount > 0 ? (
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold text-[10px]">مستحق الدفع</span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-900 font-bold text-[10px]">غير مسدد</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {!isPaid && (
                          <button
                            onClick={() => {
                              recordCustomerPayment(ord.id, Math.min(20000, ord.remainingBalance), 'cash', undefined, 'installment', undefined, 'تحصيل دفعة مالية من شاشة المالية');
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                          >
                            + تحصيل دفعة
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: SUPPLIER PAYABLES */}
      {activeTab === 'payables' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">جدول مديونيات الموردين والشركات (Supplier Payables)</h3>
              <p className="text-slate-500 font-bold">متابعة إجمالي المشتريات، المبالغ المسددة، والرصيد المتبقي للموردين</p>
            </div>

            <button
              onClick={() => setShowSupplierPayModal(true)}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-black rounded-xl shadow-md flex items-center gap-1.5 shrink-0"
            >
              <CreditCard className="w-4 h-4" />
              <span>سداد دفعة حساب لمورد</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 text-right">اسم المورد والشركة</th>
                  <th className="p-3 text-center">التخصص الرئيسي</th>
                  <th className="p-3 text-left">إجمالي المشتريات</th>
                  <th className="p-3 text-left">المسدد فعلياً</th>
                  <th className="p-3 text-left">الرصيد المتبقي للمورد</th>
                  <th className="p-3 text-center">الحالة المالية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {suppliers.map(sup => (
                  <tr key={sup.id} className={sup.balanceDue > 0 ? 'bg-rose-50/40' : 'hover:bg-slate-50'}>
                    <td className="p-3 font-bold text-slate-900">
                      {sup.name}
                      <span className="text-[10px] text-slate-500 font-mono block">{sup.companyName}</span>
                    </td>
                    <td className="p-3 text-center">{sup.specialty}</td>
                    <td className="p-3 text-left font-mono font-bold">{sup.totalPurchases.toLocaleString('ar-EG')} ج.م</td>
                    <td className="p-3 text-left font-mono font-bold text-emerald-700">{sup.totalPaid.toLocaleString('ar-EG')} ج.م</td>
                    <td className="p-3 text-left font-mono font-black text-rose-700">{sup.balanceDue.toLocaleString('ar-EG')} ج.م</td>
                    <td className="p-3 text-center">
                      {sup.balanceDue === 0 ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-[10px]">✓ مسدد بالكامل</span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-900 font-bold text-[10px]">مستحق السداد</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: EXPENSES & SALARIES */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">مصروفات التشغيل والمرتبات والأجور (Expenses & Salaries)</h3>
              <p className="text-slate-500 font-bold">تسجيل مصاريف المقرات، الإيجارات، الأجور، والتسويق موثقة بالفرع والمشروع</p>
            </div>

            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow-md flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4 text-[#E06F28]" />
              <span>إضافة مصروف تشغيلي جديد</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 text-right">رقم المصروف والتاريخ</th>
                  <th className="p-3 text-right">البند والتصنيف</th>
                  <th className="p-3 text-right">البيان والشرح</th>
                  <th className="p-3 text-center">الفرع المنسوب</th>
                  <th className="p-3 text-center">طريقة الدفع والحساب</th>
                  <th className="p-3 text-left">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {exp.expenseNumber}
                      <span className="text-[10px] text-slate-500 block">{exp.date}</span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{exp.categoryName}</td>
                    <td className="p-3">
                      {exp.description}
                      {exp.projectNumber && (
                        <span className="text-[10px] text-emerald-800 font-mono font-bold block">مشروع: {exp.projectNumber}</span>
                      )}
                    </td>
                    <td className="p-3 text-center">{exp.branchName}</td>
                    <td className="p-3 text-center font-bold text-slate-700">{exp.accountName}</td>
                    <td className="p-3 text-left font-mono font-black text-rose-700">{exp.amount.toLocaleString('ar-EG')} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: CASH & BANKS */}
      {activeTab === 'accounts' && (
        <div className="space-y-6 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {financialAccounts.map(acc => (
              <div key={acc.id} className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">{acc.name}</span>
                  {acc.type === 'cash' ? (
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  )}
                </div>

                <p className="text-2xl font-black text-slate-900 font-mono">{acc.currentBalance.toLocaleString('ar-EG')} ج.م</p>

                <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-bold">
                  <span>الفرع: {acc.branchName}</span>
                  <span>افتتاحي: {acc.openingBalance.toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* SUB-VIEW 6: PROJECT & PRODUCT PROFITABILITY */}
      {activeTab === 'profitability' && (
        <div className="space-y-6 text-xs">
          
          {/* Summary Cards for Profitability Engine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 font-bold">
                <span>أرباح مشاريع التفصيل</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-700 font-mono">
                {customProjectsProfitability.reduce((sum, p) => sum + p.netProfit, 0).toLocaleString('ar-EG')} ج.م
              </p>
              <p className="text-[10px] text-slate-400 font-bold">إجمالي أرباح مشاريع المطابخ والأثاث</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 font-bold">
                <span>أرباح المنتجات الجاهزة</span>
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-blue-700 font-mono">
                {productProfitability.reduce((sum, p) => sum + p.totalProfit, 0).toLocaleString('ar-EG')} ج.م
              </p>
              <p className="text-[10px] text-slate-400 font-bold">إجمالي أرباح مبيعات المعرض والمخزن</p>
            </div>

            <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-emerald-900 font-bold">
                <span>أعلى مشروع ربحية</span>
                <TrendingUp className="w-4 h-4 text-emerald-700" />
              </div>
              <p className="text-sm font-black text-emerald-950 truncate">
                {topProject ? topProject.projectName : 'مطبخ مودرن HPL'}
              </p>
              <p className="text-[10px] text-emerald-800 font-mono font-bold">
                ربح: {topProject ? topProject.netProfit.toLocaleString('ar-EG') : '95,200'} ج.م ({topProject ? topProject.margin.toFixed(1) : '34.2'}%)
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[#1C352D] text-white border border-emerald-900 shadow-md space-y-2">
              <div className="flex items-center justify-between text-amber-300 font-bold">
                <span>أفضل منتج ربحية</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <p className="text-sm font-black text-white truncate">
                {topProduct ? topProduct.name : 'صالون كلاسيك مذهب'}
              </p>
              <p className="text-[10px] text-emerald-200 font-mono font-bold">
                إجمالي ربح: {topProduct ? topProduct.totalProfit.toLocaleString('ar-EG') : '84,000'} ج.م
              </p>
            </div>
          </div>

          {/* Table 1: Custom Projects Profitability Engine */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E06F28]" />
                  <span>ربحية مشاريع المطابخ والتفصيل (Custom Project Profitability Engine)</span>
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  تحليل قيمة عقود البيع، تكلفة خامات BOM المرجعية، والمصنوعات المباشرة لكل مشروع
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl font-mono text-xs font-bold border border-emerald-200 shrink-0">
                {customProjectsProfitability.length} مشاريع معتمدة
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 text-right">المشروع والعميل</th>
                    <th className="p-3 text-center">الفرع</th>
                    <th className="p-3 text-left">قيمة العقد للعميل</th>
                    <th className="p-3 text-left">تكلفة الخامات BOM</th>
                    <th className="p-3 text-left">أجور ومصنعيات الورشة</th>
                    <th className="p-3 text-left">صافي ربح المشروع</th>
                    <th className="p-3 text-center">نسبة هامش الربح</th>
                    <th className="p-3 text-center">حالة التكلفة والربحية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {customProjectsProfitability.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <p className="font-black text-slate-900">{item.projectName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{item.projectNumber} — العميل: {item.customerName}</p>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-700">{item.branchName}</td>
                      <td className="p-3 text-left font-mono font-bold text-slate-900">{item.sellingPrice.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3 text-left font-mono font-bold text-amber-800">{item.materialCost.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3 text-left font-mono font-bold text-rose-800">{item.laborCost.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3 text-left font-mono font-black text-emerald-700">{item.netProfit.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3 text-center font-mono font-black text-emerald-900">{item.margin.toFixed(1)}%</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${item.badgeClass}`}>
                          {item.badgeLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Ready Products Profitability */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>ربحية أثاث المعرض والمنتجات الجاهزة (Ready Products Profitability & Margins)</span>
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  تحليل تكلفة الشراء، أسعار البيع، هامش الربح للقطعة، والأرباح التراكمية للمنتجات
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-xl font-mono text-xs font-bold border border-blue-200 shrink-0">
                {productProfitability.length} منتجات بالكتالوج
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 text-right">كود واسم المنتج والتصنيف</th>
                    <th className="p-3 text-left">تكلفة الشراء (Cost)</th>
                    <th className="p-3 text-left">سعر البيع (Price)</th>
                    <th className="p-3 text-left">ربح القطعة الواحدة</th>
                    <th className="p-3 text-center">هامش ربح القطعة</th>
                    <th className="p-3 text-center">عدد القطع المباعة</th>
                    <th className="p-3 text-left">إجمالي ربح المنتج</th>
                    <th className="p-3 text-center">التقييم التجاري</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {productProfitability.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <p className="font-black text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{item.code} — {item.categoryName}</p>
                      </td>
                      <td className="p-3 text-left font-mono font-bold text-slate-600">{item.purchaseCost.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3 text-left font-mono font-bold text-slate-900">{item.sellingPrice.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3 text-left font-mono font-black text-emerald-700">{item.unitProfit.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3 text-center font-mono font-black text-emerald-900">{item.unitMargin.toFixed(1)}%</td>
                      <td className="p-3 text-center font-mono font-bold bg-slate-50">{item.unitsSold} قطعة</td>
                      <td className="p-3 text-left font-mono font-black text-blue-800">{item.totalProfit.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${item.ratingClass}`}>
                          {item.ratingLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-VIEW 7: FINANCIAL LEDGER AUDIT TRAIL */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">سجل الحركات المالية المركزي (Financial Transaction Ledger)</h3>
              <p className="text-slate-500 font-bold">سجل تدقيق كامل لكافة المقبوضات والمصروفات والتحويلات المعتمدة بالنظام</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 text-right">رقم الحركة</th>
                  <th className="p-3 text-right">التاريخ والوقت</th>
                  <th className="p-3 text-center">النوع والتصنيف</th>
                  <th className="p-3 text-right">البيان والشرح</th>
                  <th className="p-3 text-center">الفرع</th>
                  <th className="p-3 text-center">الحساب المالي</th>
                  <th className="p-3 text-left">المبلغ الاتجاه</th>
                  <th className="p-3 text-center">المستخدم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{tx.refNumber}</td>
                    <td className="p-3 font-mono text-slate-500">{tx.timestamp}</td>
                    <td className="p-3 text-center font-bold">{tx.category}</td>
                    <td className="p-3">{tx.description}</td>
                    <td className="p-3 text-center">{tx.branchName}</td>
                    <td className="p-3 text-center font-bold text-slate-700">{tx.accountName}</td>
                    <td className="p-3 text-left font-mono font-black">
                      <span className={tx.direction === 'in' ? 'text-emerald-700' : 'text-rose-700'}>
                        {tx.direction === 'in' ? '+' : '-'}{tx.amount.toLocaleString('ar-EG')} ج.م
                      </span>
                    </td>
                    <td className="p-3 text-center text-slate-500">{tx.createdByUserName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900">إثبات مصروف تشغيلي جديد</h3>
            
            <div>
              <label className="block font-bold mb-1">تصنيف المصروف *</label>
              <select
                value={expenseCat}
                onChange={e => setExpenseCat(e.target.value as ExpenseCategory)}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
              >
                <option value="rent">إيجارات ومعارض</option>
                <option value="salaries">مرتبات وأجور</option>
                <option value="utilities">كهرباء ومياه ومرافق</option>
                <option value="marketing">تسويق وإعلانات</option>
                <option value="workshop">مصاريف تشغيل الورشة</option>
                <option value="delivery">مصاريف نقل وتركيبات للمشاريع</option>
                <option value="office">مصاريف إدارية ومكتبية</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">بيان المصروف بالتفصيل *</label>
              <input
                type="text"
                value={expenseDesc}
                onChange={e => setExpenseDesc(e.target.value)}
                placeholder="مثال: فاتورة كهرباء الورشة عن شهر أغسطس"
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">المبلغ *</label>
              <input
                type="number"
                value={expenseAmount}
                onChange={e => setExpenseAmount(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold text-center"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">خصم من الحساب المالي *</label>
              <select
                value={expenseAccName}
                onChange={e => setExpenseAccName(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
              >
                {financialAccounts.map(a => (
                  <option key={a.id} value={a.name}>{a.name} (رصيد: {a.currentBalance.toLocaleString('ar-EG')} ج.م)</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAddExpenseModal(false)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button
                type="button"
                onClick={() => {
                  if (!expenseDesc || expenseAmount <= 0) return;
                  addCompanyExpense({
                    category: expenseCat,
                    description: expenseDesc,
                    amount: expenseAmount,
                    accountName: expenseAccName
                  });
                  setShowAddExpenseModal(false);
                }}
                className="px-5 py-2 bg-[#1C352D] text-white font-black rounded-xl shadow-md"
              >
                حفظ وإصدار المصروف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT TRANSFER MODAL */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900">تحويل مالي بين الخزائن والبنوك</h3>
            
            <div>
              <label className="block font-bold mb-1">من الحساب *</label>
              <select
                value={fromAccId}
                onChange={e => setFromAccId(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
              >
                {financialAccounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} (متاح: {a.currentBalance.toLocaleString('ar-EG')} ج.م)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">إلى الحساب *</label>
              <select
                value={toAccId}
                onChange={e => setToAccId(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
              >
                {financialAccounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">المبلغ المحول *</label>
              <input
                type="number"
                value={transferAmt}
                onChange={e => setTransferAmt(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold text-center"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowTransferModal(false)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button
                type="button"
                onClick={() => {
                  if (fromAccId === toAccId || transferAmt <= 0) return;
                  transferBetweenFinancialAccounts(fromAccId, toAccId, transferAmt, transferNotes);
                  setShowTransferModal(false);
                }}
                className="px-5 py-2 bg-[#E06F28] text-white font-black rounded-xl shadow-md"
              >
                تأكيد التحويل المالي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPLIER PAYMENT MODAL */}
      {showSupplierPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900">سداد مستحقات مالية لمورد</h3>
            
            <div>
              <label className="block font-bold mb-1">اختر المورد *</label>
              <select
                value={paySupplierId}
                onChange={e => setPaySupplierId(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} (رصيد متبقي له: {s.balanceDue.toLocaleString('ar-EG')} ج.م)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">المبلغ المسدد *</label>
              <input
                type="number"
                value={payAmount}
                onChange={e => setPayAmount(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold text-center"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">خصم من حساب *</label>
              <select
                value={payAccId}
                onChange={e => setPayAccId(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
              >
                {financialAccounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} (رصيد: {a.currentBalance.toLocaleString('ar-EG')} ج.م)</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowSupplierPayModal(false)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button
                type="button"
                onClick={() => {
                  if (!paySupplierId || payAmount <= 0) return;
                  recordSupplierPaymentFromFinance(paySupplierId, payAmount, 'bank_transfer', payAccId, 'سداد حساب من شاشة المالية');
                  setShowSupplierPayModal(false);
                }}
                className="px-5 py-2 bg-rose-700 text-white font-black rounded-xl shadow-md"
              >
                تأكيد سداد المورد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK CUSTOMER PAYMENT MODAL */}
      {showCustomerPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>تحصيل دفعة/قسط مالية من عميل</span>
              </h3>
              <button onClick={() => setShowCustomerPayModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div>
              <label className="block font-bold mb-1">اختر العقد / أمر المبيعات للعميل *</label>
              <select
                value={payOrderId}
                onChange={e => {
                  setPayOrderId(e.target.value);
                  const ord = orders.find(o => o.id === e.target.value);
                  if (ord) setPayCustAmount(Math.min(15000, ord.remainingBalance || 10000));
                }}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-xs"
              >
                {orders.filter(o => o.remainingBalance > 0).map(o => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} — العميل: {o.customerName} (المتبقي: {o.remainingBalance.toLocaleString('ar-EG')} ج.م)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">المبلغ المحصل من العميل (ج.م) *</label>
              <input
                type="number"
                min={1}
                value={payCustAmount}
                onChange={e => setPayCustAmount(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold text-center text-sm"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">طريقة التحصيل *</label>
              <select
                value={payCustMethod}
                onChange={e => setPayCustMethod(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold"
              >
                <option value="cash">نقداً بالخزينة (Cash)</option>
                <option value="bank_transfer">تحويل بنكي / إيداع (Bank)</option>
                <option value="card">بطاقة ائتمان POS (Card)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">ملاحظات التحصيل (اختياري)</label>
              <input
                type="text"
                value={payCustNotes}
                onChange={e => setPayCustNotes(e.target.value)}
                placeholder="مثال: دفعة الاستلام قبل تركيب المطبخ"
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setShowCustomerPayModal(false)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button
                type="button"
                onClick={e => {
                  e.preventDefault();
                  if (!payOrderId || payCustAmount <= 0) return;
                  recordCustomerPayment(payOrderId, payCustAmount, payCustMethod, `RCP-2026-${Math.floor(100 + Math.random() * 900)}`, 'installment', undefined, payCustNotes);
                  setShowCustomerPayModal(false);
                }}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl shadow-md"
              >
                تأكيد واستلام النقدية
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
