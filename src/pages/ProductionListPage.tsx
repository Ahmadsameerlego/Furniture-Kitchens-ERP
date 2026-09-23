import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { ProductionOrder, ProductionOrderStatus, Material } from '../types/erp';
import {
  Factory,
  Boxes,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Eye,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building,
  Layers,
  Sparkles,
  Camera,
  Calendar,
  Share2,
  TrendingUp,
  AlertCircle,
  Kanban,
  List,
  Printer,
  ChevronDown,
  ChevronUp,
  Package,
  Wrench,
  Check,
  User,
  Phone,
  Truck
} from 'lucide-react';
import { WorkshopJobCardModal } from '../components/production/WorkshopJobCardModal';

export const ProductionListPage: React.FC = () => {
  const {
    productionOrders,
    materials,
    availableBranches,
    setSelectedProductionOrderId,
    reserveProductionMaterials,
    consumeProductionMaterials,
    completeProductionOrder,
    scheduleInstallation,
    setActiveModule,
    setSelectedMaterialId,
    checkPermission
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'kanban' | 'orders' | 'bom_summary'>('kanban');
  const [expandedOrderIds, setExpandedOrderIds] = useState<string[]>(['prod-101']);
  const [showProcessGuide, setShowProcessGuide] = useState(true);

  // Modals state
  const [activeJobCardOrder, setActiveJobCardOrder] = useState<ProductionOrder | null>(null);
  const [activeReserveModalOrder, setActiveReserveModalOrder] = useState<ProductionOrder | null>(null);
  const [activeConsumeModalOrder, setActiveConsumeModalOrder] = useState<ProductionOrder | null>(null);
  const [consumeMatId, setConsumeMatId] = useState<string>('');
  const [consumeQty, setConsumeQty] = useState<number>(5);
  const [consumeNotes, setConsumeNotes] = useState<string>('صرف خامات للقص والتجميع بالورشة');

  const [activeCompleteModalOrder, setActiveCompleteModalOrder] = useState<ProductionOrder | null>(null);
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=600');

  const [activeInstallScheduleOrder, setActiveInstallScheduleOrder] = useState<ProductionOrder | null>(null);
  const [installDate, setInstallDate] = useState<string>('2026-08-30');
  const [installTime, setInstallTime] = useState<string>('10:00');
  const [installAddress, setInstallAddress] = useState<string>('شقة 402 - عمارة 12 - النرجس - التجمع الخامس');

  const canCreate = checkPermission('production', 'create');

  // Branch isolation filtering
  const authorizedOrders = productionOrders.filter(p => availableBranches.some(b => b.id === p.branchId));

  const filteredOrders = authorizedOrders.filter(p => {
    const matchesSearch = p.productionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    const matchesBranch = selectedBranch === 'all' || p.branchId === selectedBranch;
    return matchesSearch && matchesStatus && matchesBranch;
  });

  // KPI Overview calculations
  const countPending = authorizedOrders.filter(p => p.status === 'pending').length;
  const countInProd = authorizedOrders.filter(p => p.status === 'in_production').length;
  const countCompleted = authorizedOrders.filter(p => p.status === 'completed').length;
  const countReadyInstall = authorizedOrders.filter(p => p.status === 'ready_installation' || p.status === 'completed').length;
  
  // Count BOM Shortages
  const shortageCount = authorizedOrders.reduce((acc, p) => {
    const shortInOrder = p.materials.filter(m => m.status === 'shortage').length;
    return acc + shortInOrder;
  }, 0);

  // Consolidated materials aggregation for Tab 3
  const aggregatedMaterialsMap = new Map<string, {
    materialId: string;
    materialName: string;
    materialCode: string;
    unit: string;
    totalRequired: number;
    totalReserved: number;
    totalConsumed: number;
    totalRemaining: number;
    affectedOrdersCount: number;
    hasShortage: boolean;
  }>();

  authorizedOrders.forEach(order => {
    order.materials.forEach(mat => {
      const existing = aggregatedMaterialsMap.get(mat.materialId);
      if (existing) {
        existing.totalRequired += mat.requiredQuantity;
        existing.totalReserved += mat.reservedQuantity;
        existing.totalConsumed += mat.consumedQuantity;
        existing.totalRemaining += mat.remainingQuantity;
        existing.affectedOrdersCount += 1;
        if (mat.status === 'shortage') existing.hasShortage = true;
      } else {
        aggregatedMaterialsMap.set(mat.materialId, {
          materialId: mat.materialId,
          materialName: mat.materialName,
          materialCode: mat.materialCode,
          unit: mat.unit,
          totalRequired: mat.requiredQuantity,
          totalReserved: mat.reservedQuantity,
          totalConsumed: mat.consumedQuantity,
          totalRemaining: mat.remainingQuantity,
          affectedOrdersCount: 1,
          hasShortage: mat.status === 'shortage'
        });
      }
    });
  });

  const aggregatedMaterials = Array.from(aggregatedMaterialsMap.values());

  const toggleOrderExpand = (id: string) => {
    setExpandedOrderIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: ProductionOrderStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'قيد الإعداد وحجز الخامات', class: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'in_production':
        return { label: 'قيد القص والتصنيع بالورشة', class: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'completed':
        return { label: '✓ تصنيع مكتمل (فحص الجودة)', class: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'ready_installation':
        return { label: 'جاهز للتركيب بالموقع', class: 'bg-emerald-900 text-emerald-100 border-emerald-700' };
      case 'on_hold':
        return { label: 'موقوف مؤقتاً', class: 'bg-rose-100 text-rose-900 border-rose-300' };
      default:
        return { label: 'ملغي', class: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#361D13] text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <Factory className="w-6 h-6 text-[#C87A38]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">إدارة الإنتاج وتشغيل الورش (Workshop Hub)</h1>
              <span className="text-[10px] bg-[#C87A38]/15 text-[#C87A38] border border-[#C87A38]/30 px-2 py-0.5 rounded-lg font-black">
                مركز خطوط التصنيع
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              متابعة أوامر تصنيع المطابخ والأثاث، حجز واستهلاك الخامات بالورشة، وطباعة أوامر الشغل للنجارين
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveModule('installation')}
            className="px-4 py-2.5 bg-[#361D13] hover:bg-[#23120A] text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 shrink-0 border border-white/10"
          >
            <Calendar className="w-4 h-4 text-[#C87A38]" />
            <span>جدول التركيبات والتسليم بالموقع</span>
          </button>

          <button
            onClick={() => setShowProcessGuide(!showProcessGuide)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            title="إظهار / إخفاء دليل دورة العمل"
          >
            {showProcessGuide ? 'إخفاء الدليل ✕' : 'دليل مسار التصنيع 💡'}
          </button>
        </div>
      </div>

      {/* 5-STEP PRODUCTION ROADMAP GUIDE (Educational & Intuitive for Dev & User) */}
      {showProcessGuide && (
        <div className="bg-gradient-to-r from-[#361D13] via-[#2E1810] to-[#361D13] text-white rounded-3xl p-5 border border-amber-900/40 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C87A38]" />
              كيف تعمل دورة تصنيع الأثاث والمطابخ بالورشة؟ (The 5-Stage Lifecycle):
            </span>
            <span className="text-[10px] text-amber-200/70">نظام أوتوماتيكي متصل بالمخازن والمشاريع</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10 space-y-1">
              <span className="w-5 h-5 rounded-full bg-[#C87A38] text-white flex items-center justify-center font-black text-[10px] mb-1">1</span>
              <p className="font-bold text-amber-100 text-[11px]">حجز الخامات (BOM)</p>
              <p className="text-[10px] text-slate-300 leading-tight">تخصيص الخامات من المخزن لمنع سحبها لأمر آخر.</p>
            </div>

            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10 space-y-1">
              <span className="w-5 h-5 rounded-full bg-[#C87A38] text-white flex items-center justify-center font-black text-[10px] mb-1">2</span>
              <p className="font-bold text-amber-100 text-[11px]">أمر تشغيل الورشة</p>
              <p className="text-[10px] text-slate-300 leading-tight">طباعة كشف التقطيع وقوائم المقاسات لأسطى الورشة.</p>
            </div>

            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10 space-y-1">
              <span className="w-5 h-5 rounded-full bg-[#C87A38] text-white flex items-center justify-center font-black text-[10px] mb-1">3</span>
              <p className="font-bold text-amber-100 text-[11px]">الصرف والقص (Consume)</p>
              <p className="text-[10px] text-slate-300 leading-tight">خصم الخامات الفعلي من رصيد المخزن وبدء التجميع.</p>
            </div>

            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10 space-y-1">
              <span className="w-5 h-5 rounded-full bg-[#C87A38] text-white flex items-center justify-center font-black text-[10px] mb-1">4</span>
              <p className="font-bold text-amber-100 text-[11px]">فحص الجودة (QC)</p>
              <p className="text-[10px] text-slate-300 leading-tight">معاينة استقامة العلب والمفصلات والتغليف النهائي.</p>
            </div>

            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10 space-y-1">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-[10px] mb-1">5</span>
              <p className="font-bold text-amber-100 text-[11px]">التركيب والتسليم</p>
              <p className="text-[10px] text-slate-300 leading-tight">جدولة ونقل الوحدات لمنزل العميل والتركيب النهائي.</p>
            </div>
          </div>
        </div>
      )}

      {/* Production Owner Overview Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-bold block">قيد التحضير (Prep):</span>
          <p className="text-2xl font-black text-amber-600 font-mono">{countPending}</p>
          <span className="text-[10px] text-slate-400">في انتظار مراجعة الخامات</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-bold block">جاري تصنيعه بالورشة:</span>
          <p className="text-2xl font-black text-blue-600 font-mono">{countInProd}</p>
          <span className="text-[10px] text-blue-500 font-bold">● قيد النجارة والتجميع</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-bold block">مكتمل التصنيع (Completed):</span>
          <p className="text-2xl font-black text-emerald-600 font-mono">{countCompleted}</p>
          <span className="text-[10px] text-emerald-600 font-bold">✓ اجتاز فحص الجودة</span>
        </div>

        <div className="p-4 rounded-3xl bg-[#361D13] text-white border border-amber-900/50 shadow-md space-y-1">
          <span className="text-amber-200 font-bold block">جاهز للتركيب بالموقع:</span>
          <p className="text-2xl font-black text-amber-300 font-mono">{countReadyInstall}</p>
          <span className="text-[10px] text-amber-100/70">ينتظر جدولة الموعد</span>
        </div>

        <div className={`p-4 rounded-3xl border shadow-xs space-y-1 ${shortageCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-white border-slate-200'}`}>
          <span className="font-bold block">نقص الخامات (Shortages):</span>
          <p className={`text-2xl font-black font-mono ${shortageCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{shortageCount}</p>
          <span className="text-[10px] font-bold">{shortageCount > 0 ? '⚠️ يتطلب أمر شراء' : '✓ الخامات متوفرة'}</span>
        </div>

      </div>

      {/* Tabs & Search Controls Header */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* View Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'kanban'
                  ? 'bg-[#361D13] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-4 h-4 text-[#C87A38]" />
              <span>مراحل الورشة (Kanban)</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-[#361D13] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4 text-[#C87A38]" />
              <span>الأوامر والـ BOM التفصيلي</span>
            </button>

            <button
              onClick={() => setActiveTab('bom_summary')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'bom_summary'
                  ? 'bg-[#361D13] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Boxes className="w-4 h-4 text-[#C87A38]" />
              <span>كشف خامات الورشة المجمعة</span>
            </button>
          </div>

          {/* Search & Filter Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 max-w-xl text-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث برقم الأمر أو العميل..."
                className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
              >
                <option value="all">كل الحالات</option>
                <option value="pending">قيد التحضير</option>
                <option value="in_production">قيد التصنيع</option>
                <option value="completed">مكتمل</option>
                <option value="ready_installation">جاهز للتركيب</option>
              </select>
            </div>

            <div>
              <select
                value={selectedBranch}
                onChange={e => setSelectedBranch(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
              >
                <option value="all">كل الفروع</option>
                {availableBranches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* VIEW 1: PRODUCTION KANBAN PIPELINE */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          
          {/* Column 1: Preparation / Pending */}
          <div className="bg-slate-100/70 rounded-3xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
                <h3 className="text-xs font-black text-slate-800">1. قيد الإعداد وحجز الخامات</h3>
              </div>
              <span className="text-[11px] font-mono font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                {filteredOrders.filter(p => p.status === 'pending').length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredOrders.filter(p => p.status === 'pending').map(po => (
                <div key={po.id} className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-[#361D13] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {po.productionNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{po.startDate}</span>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{po.customerName}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">أمر البيع: {po.orderNumber}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{po.workshopLocation}</p>
                  </div>

                  {/* Material Shortage Alert */}
                  {po.materials.some(m => m.status === 'shortage') && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-[10px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>يوجد نقص في بعض الخامات بالمخزن!</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                    <button
                      onClick={() => setActiveJobCardOrder(po)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1 text-[11px]"
                      title="طباعة أمر التشغيل للورشة"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#C87A38]" />
                      <span>أمر الشغل</span>
                    </button>

                    <button
                      onClick={() => setActiveReserveModalOrder(po)}
                      className="px-3 py-1.5 bg-[#361D13] hover:bg-[#23120A] text-white font-black rounded-xl text-[11px] shadow-xs"
                    >
                      حجز الخامات 📦
                    </button>
                  </div>
                </div>
              ))}
              {filteredOrders.filter(p => p.status === 'pending').length === 0 && (
                <p className="text-[11px] text-slate-400 py-6 text-center">لا توجد أوامر قيد الإعداد</p>
              )}
            </div>
          </div>

          {/* Column 2: In Cutting & Production */}
          <div className="bg-slate-100/70 rounded-3xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                <h3 className="text-xs font-black text-slate-800">2. قيد القص والتصنيع بالورشة</h3>
              </div>
              <span className="text-[11px] font-mono font-black bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                {filteredOrders.filter(p => p.status === 'in_production').length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredOrders.filter(p => p.status === 'in_production').map(po => {
                const totalReq = po.materials.reduce((acc, m) => acc + m.requiredQuantity, 0);
                const totalCons = po.materials.reduce((acc, m) => acc + m.consumedQuantity, 0);
                const percent = totalReq > 0 ? Math.round((totalCons / totalReq) * 100) : 0;

                return (
                  <div key={po.id} className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {po.productionNumber}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">تسليم: {po.expectedCompletionDate}</span>
                    </div>

                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{po.customerName}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">الورشة: {po.workshopLocation}</p>
                      <p className="text-[10px] text-slate-400 truncate">الفريق: {po.assignedTeam.join(', ') || 'فريق النجارة'}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span>نسبة استهلاك الخامات:</span>
                        <span className="font-mono text-blue-700 font-black">{percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                      <button
                        onClick={() => {
                          setActiveConsumeModalOrder(po);
                          if (po.materials[0]) setConsumeMatId(po.materials[0].materialId);
                        }}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold rounded-xl text-[11px] border border-blue-200"
                      >
                        صرف خامات
                      </button>

                      <button
                        onClick={() => setActiveCompleteModalOrder(po)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-[11px] shadow-xs"
                      >
                        إنهاء التصنيع ✓
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredOrders.filter(p => p.status === 'in_production').length === 0 && (
                <p className="text-[11px] text-slate-400 py-6 text-center">لا توجد أوامر قيد التصنيع</p>
              )}
            </div>
          </div>

          {/* Column 3: Quality Control / Completed */}
          <div className="bg-slate-100/70 rounded-3xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <h3 className="text-xs font-black text-slate-800">3. فحص الجودة والتغليف</h3>
              </div>
              <span className="text-[11px] font-mono font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                {filteredOrders.filter(p => p.status === 'completed').length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredOrders.filter(p => p.status === 'completed').map(po => (
                <div key={po.id} className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                      {po.productionNumber}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">✓ اجتاز الفحص</span>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{po.customerName}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">الهاتف: {po.customerPhone}</p>
                    <p className="text-[10px] text-slate-400">تاريخ الإكتمال: {po.actualCompletionDate || 'مكتمل'}</p>
                  </div>

                  {po.completionPhotos && po.completionPhotos.length > 0 && (
                    <img src={po.completionPhotos[0]} alt="Finished" className="w-full h-24 object-cover rounded-xl border border-slate-200" />
                  )}

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setActiveInstallScheduleOrder(po)}
                      className="w-full py-2 bg-[#C87A38] hover:bg-[#DB8D48] text-white font-black rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>جدولة موعد التركيب بالموقع</span>
                    </button>
                  </div>
                </div>
              ))}
              {filteredOrders.filter(p => p.status === 'completed').length === 0 && (
                <p className="text-[11px] text-slate-400 py-6 text-center">لا توجد أوامر قيد الفحص</p>
              )}
            </div>
          </div>

          {/* Column 4: Ready for Installation */}
          <div className="bg-slate-100/70 rounded-3xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#361D13]"></span>
                <h3 className="text-xs font-black text-slate-800">4. جاهز للشحن والتركيب</h3>
              </div>
              <span className="text-[11px] font-mono font-black bg-[#361D13] text-white px-2 py-0.5 rounded-full">
                {filteredOrders.filter(p => p.status === 'ready_installation').length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredOrders.filter(p => p.status === 'ready_installation').map(po => (
                <div key={po.id} className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-[#361D13] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {po.productionNumber}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">جاهز</span>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{po.customerName}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{po.customerPhone}</p>
                    <p className="text-[10px] text-slate-400">الوحدات مغلفة ومجهزة بسيارات الشحن</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setActiveModule('installation')}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Truck className="w-4 h-4" />
                      <span>متابعة جدول وفريق التركيب</span>
                    </button>
                  </div>
                </div>
              ))}
              {filteredOrders.filter(p => p.status === 'ready_installation').length === 0 && (
                <p className="text-[11px] text-slate-400 py-6 text-center">لا توجد أوامر قيد الشحن</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: DETAILED ORDERS & BOM LIST */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {filteredOrders.map(po => {
            const badge = getStatusBadge(po.status);
            const hasShortage = po.materials.some(m => m.status === 'shortage');
            const isExpanded = expandedOrderIds.includes(po.id);

            return (
              <div key={po.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-[#361D13] bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                        {po.productionNumber}
                      </span>
                      <h3 className="text-base font-black text-slate-900">العميل: {po.customerName} ({po.customerPhone})</h3>
                    </div>
                    <p className="text-xs text-slate-500 font-bold">
                      أمر المبيعات: <strong className="text-slate-900">{po.orderNumber}</strong> — الورشة: {po.workshopLocation} — ت. البدء: {po.startDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-xl text-xs font-black border ${badge.class}`}>
                      {badge.label}
                    </span>

                    {hasShortage && (
                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>نقص بالخامات</span>
                      </span>
                    )}

                    <button
                      onClick={() => setActiveJobCardOrder(po)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1"
                      title="طباعة أمر تشغيل الورشة"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#C87A38]" />
                      <span>طباعة أمر الشغل</span>
                    </button>

                    <button
                      onClick={() => toggleOrderExpand(po.id)}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 border border-slate-200 transition-colors"
                      title={isExpanded ? 'طي جدول الخامات' : 'توسيع جدول الخامات'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Bill of Materials (BOM) Table (Collapsible) */}
                {isExpanded && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-[#C87A38]" />
                        <span>قائمة الخامات ومستلزمات القص والتجميع المطلوبة (BOM):</span>
                      </h4>

                      <div className="flex items-center gap-2 text-xs font-bold">
                        <button
                          onClick={() => setActiveReserveModalOrder(po)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-xl"
                        >
                          + حجز الخامات بالمخزون
                        </button>

                        <button
                          onClick={() => {
                            setActiveConsumeModalOrder(po);
                            if (po.materials[0]) setConsumeMatId(po.materials[0].materialId);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                        >
                          تسجيل استهلاك خامات (Consume)
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden text-xs">
                      <table className="w-full text-right">
                        <thead className="bg-slate-200/70 text-slate-700 font-bold border-b border-slate-300">
                          <tr>
                            <th className="p-3 text-right">اسم الخامة والمواصفة</th>
                            <th className="p-3 text-center">المطلوب</th>
                            <th className="p-3 text-center">المحجوز</th>
                            <th className="p-3 text-center">المستهلك</th>
                            <th className="p-3 text-center">المتبقي</th>
                            <th className="p-3 text-left">التكلفة التقديرية</th>
                            <th className="p-3 text-left">التكلفة الفعلية</th>
                            <th className="p-3 text-center">حالة الخامة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium">
                          {po.materials.map(m => {
                            const matObj = materials.find(mat => mat.id === m.materialId);
                            const isShortage = m.status === 'shortage';

                            return (
                              <tr key={m.id} className={isShortage ? 'bg-rose-50/80 font-bold text-rose-950' : 'hover:bg-slate-100/60'}>
                                <td className="p-3 font-bold text-slate-900">
                                  {m.materialName}
                                  <span className="text-[10px] text-slate-500 font-mono block">{m.materialCode}</span>
                                </td>
                                <td className="p-3 text-center font-mono font-bold">{m.requiredQuantity} {m.unit}</td>
                                <td className="p-3 text-center font-mono text-blue-700 font-bold">{m.reservedQuantity}</td>
                                <td className="p-3 text-center font-mono text-emerald-700 font-bold">{m.consumedQuantity}</td>
                                <td className="p-3 text-center font-mono text-amber-800 font-bold">{m.remainingQuantity}</td>
                                <td className="p-3 text-left font-mono">{m.estimatedTotalCost.toLocaleString('ar-EG')} ج.م</td>
                                <td className="p-3 text-left font-mono font-bold text-emerald-800">
                                  {m.actualTotalCost > 0 ? `${m.actualTotalCost.toLocaleString('ar-EG')} ج.م` : 'قيد الاستهلاك'}
                                </td>
                                <td className="p-3 text-center">
                                  {isShortage ? (
                                    <div className="flex items-center justify-center gap-1">
                                      <span className="bg-rose-200 text-rose-900 text-[10px] font-black px-2 py-0.5 rounded border border-rose-300">
                                        ⚠️ نقص {m.requiredQuantity - (matObj?.availableStock || 0)}
                                      </span>
                                      <button
                                        onClick={() => {
                                          setSelectedMaterialId(m.materialId);
                                          setActiveModule('materials');
                                        }}
                                        className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded font-bold hover:bg-slate-800"
                                      >
                                        معاينة بالمخزن
                                      </button>
                                    </div>
                                  ) : m.status === 'consumed' ? (
                                    <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">✓ مستهلك بالكامل</span>
                                  ) : m.status === 'reserved' ? (
                                    <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded">محجوز بالمخزن</span>
                                  ) : (
                                    <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">قيد الإعداد</span>
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

                {/* Cost Summary Bar & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
                  
                  {/* Cost Variance */}
                  <div className="flex items-center gap-4 font-mono font-bold bg-[#361D13] text-white p-3 rounded-2xl">
                    <div>
                      <span className="text-[10px] text-amber-200/70 block font-sans">التكلفة التقديرية للخامات:</span>
                      <span>{po.totalEstimatedMaterialCost.toLocaleString('ar-EG')} ج.م</span>
                    </div>

                    <div className="h-6 w-px bg-white/20"></div>

                    <div>
                      <span className="text-[10px] text-amber-200/70 block font-sans">التكلفة الفعلية المستهلكة:</span>
                      <span className="text-amber-300">{po.totalActualMaterialCost.toLocaleString('ar-EG')} ج.م</span>
                    </div>

                    <div className="h-6 w-px bg-white/20"></div>

                    <div>
                      <span className="text-[10px] text-amber-200/70 block font-sans">الانحراف (Variance):</span>
                      <span className={po.materialVariance > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {po.materialVariance > 0 ? `+${po.materialVariance.toLocaleString('ar-EG')}` : po.materialVariance.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>
                  </div>

                  {/* Workflow Actions */}
                  <div className="flex items-center gap-2">
                    {po.status !== 'completed' && (
                      <button
                        onClick={() => setActiveCompleteModalOrder(po)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>إتمام تصنيع الورشة والفحص</span>
                      </button>
                    )}

                    {(po.status === 'completed' || po.status === 'ready_installation') && (
                      <button
                        onClick={() => setActiveInstallScheduleOrder(po)}
                        className="px-4 py-2 bg-[#C87A38] hover:bg-[#DB8D48] text-white font-black rounded-xl shadow-md flex items-center gap-1.5"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>جدولة موعد التركيب بالموقع</span>
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: CONSOLIDATED MATERIALS HUB */}
      {activeTab === 'bom_summary' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">كشف الخامات المجمعة لأوامر الورشة النشطة</h3>
              <p className="text-xs text-slate-500">حصر كامل لاحتياجات خطوط الإنتاج والتأكد من عدم وجود عجز بالمخازن</p>
            </div>

            <button
              onClick={() => setActiveModule('materials')}
              className="px-4 py-2 bg-[#361D13] hover:bg-[#23120A] text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Boxes className="w-4 h-4 text-[#C87A38]" />
              <span>الانتقال لمكتبة الخامات والمخزن</span>
            </button>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden text-xs">
            <table className="w-full text-right">
              <thead className="bg-[#361D13] text-white font-bold text-[11px]">
                <tr>
                  <th className="p-3 text-right">الخامة / اللوح</th>
                  <th className="p-3 text-center">إجمالي المطلوب للورشة</th>
                  <th className="p-3 text-center">إجمالي المحجوز</th>
                  <th className="p-3 text-center">المستهلك فعلياً</th>
                  <th className="p-3 text-center">المتبقي للصرف</th>
                  <th className="p-3 text-center">الرصيد المتاح بالمخزن</th>
                  <th className="p-3 text-center">حالة الوفرة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium bg-white">
                {aggregatedMaterials.map(item => {
                  const matObj = materials.find(m => m.id === item.materialId);
                  const availableStock = matObj?.availableStock || 0;
                  const isDeficit = item.totalRemaining > availableStock;

                  return (
                    <tr key={item.materialId} className={isDeficit ? 'bg-rose-50/70 font-bold' : 'hover:bg-slate-50'}>
                      <td className="p-3 font-bold text-slate-900">
                        {item.materialName}
                        <span className="text-[10px] text-slate-500 font-mono block">{item.materialCode} ({item.affectedOrdersCount} أوامر تشغيل)</span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-900">{item.totalRequired} {item.unit}</td>
                      <td className="p-3 text-center font-mono font-bold text-blue-700">{item.totalReserved} {item.unit}</td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-700">{item.totalConsumed} {item.unit}</td>
                      <td className="p-3 text-center font-mono font-bold text-amber-800">{item.totalRemaining} {item.unit}</td>
                      <td className="p-3 text-center font-mono font-black text-slate-800">{availableStock} {item.unit}</td>
                      <td className="p-3 text-center">
                        {isDeficit ? (
                          <div className="flex items-center justify-center gap-1">
                            <span className="bg-rose-100 text-rose-900 px-2 py-0.5 rounded text-[10px] font-black border border-rose-300">
                              ⚠️ عجز {item.totalRemaining - availableStock}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedMaterialId(item.materialId);
                                setActiveModule('suppliers');
                              }}
                              className="px-2 py-0.5 bg-[#C87A38] text-white text-[10px] rounded font-bold hover:bg-[#DB8D48]"
                            >
                              طلب شراء
                            </button>
                          </div>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            ✓ متوفر بالمخزن
                          </span>
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

      {/* WORKSHOP JOB CARD PRINTABLE MODAL */}
      {activeJobCardOrder && (
        <WorkshopJobCardModal
          isOpen={true}
          onClose={() => setActiveJobCardOrder(null)}
          order={activeJobCardOrder}
          materialsList={materials}
        />
      )}

      {/* RESERVE MATERIALS MODAL */}
      {activeReserveModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900">حجز خامات لأمر التصنيع ({activeReserveModalOrder.productionNumber})</h3>
            
            <p className="text-slate-600 font-bold leading-relaxed">
              حجز الكميات المطلوبة في المخزون المتاح يضمن تخصيصها لهذا العميل ومنع صرفها لأي أمر ورشة آخر.
            </p>

            <div className="space-y-2">
              {activeReserveModalOrder.materials.map(m => (
                <div key={m.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{m.materialName}</p>
                    <span className="text-[10px] text-slate-500">مطلوب: {m.requiredQuantity} {m.unit}</span>
                  </div>

                  <button
                    onClick={() => {
                      reserveProductionMaterials(activeReserveModalOrder.id, m.materialId, m.requiredQuantity);
                      setActiveReserveModalOrder(null);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                  >
                    حجز {m.requiredQuantity} {m.unit}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setActiveReserveModalOrder(null)} className="px-4 py-2 border rounded-xl font-bold">إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* CONSUME MATERIALS MODAL */}
      {activeConsumeModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900">تسجيل صرف واستهلاك خامات بالورشة</h3>
            <p className="text-slate-500 text-[11px]">سيتم خصم الكمية المصروفة فعلياً من رصيد المخزن المتاح</p>
            
            <div>
              <label className="block font-bold mb-1">اختر الخامة المستهلكة من قائمة BOM *</label>
              <select
                value={consumeMatId}
                onChange={e => setConsumeMatId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold"
              >
                {activeConsumeModalOrder.materials.map(m => (
                  <option key={m.id} value={m.materialId}>
                    {m.materialName} (متبقي للصرف: {m.remainingQuantity} {m.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">الكمية المصروفة الآن بالورشة *</label>
              <input
                type="number"
                value={consumeQty}
                onChange={e => setConsumeQty(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-center text-sm font-mono"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">ملاحظات الصرف والتشغيل</label>
              <input
                type="text"
                value={consumeNotes}
                onChange={e => setConsumeNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setActiveConsumeModalOrder(null)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button
                type="button"
                onClick={() => {
                  if (!consumeMatId || consumeQty <= 0) return;
                  consumeProductionMaterials(activeConsumeModalOrder.id, consumeMatId, consumeQty, consumeNotes);
                  setActiveConsumeModalOrder(null);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md"
              >
                تأكيد خصم الخامات من المخزن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE PRODUCTION MODAL */}
      {activeCompleteModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900">إكتمال إنتاج أمر الورشة ({activeCompleteModalOrder.productionNumber})</h3>
            <p className="text-slate-500 text-[11px]">توثيق اجتياز فحص الجودة (QC) وجاهزية المنتج للنقل للموقع</p>
            
            <div>
              <label className="block font-bold mb-1">رابط صورة التشطيب النهائي للتصنيع بالورشة</label>
              <input
                type="text"
                value={completionPhotoUrl}
                onChange={e => setCompletionPhotoUrl(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-left dir-ltr font-mono"
              />
            </div>

            {completionPhotoUrl && (
              <img src={completionPhotoUrl} alt="completion" className="w-full h-40 object-cover rounded-2xl border" />
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setActiveCompleteModalOrder(null)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button
                type="button"
                onClick={() => {
                  completeProductionOrder(activeCompleteModalOrder.id, [completionPhotoUrl], 'تم الفحص واجتياز معايير الجودة بالورشة');
                  setActiveCompleteModalOrder(null);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md"
              >
                تأكيد إكتمال التصنيع والجودة ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE INSTALLATION MODAL */}
      {activeInstallScheduleOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900">جدولة موعد تركيب بالمنزل للعميل ({activeInstallScheduleOrder.customerName})</h3>
            
            <div>
              <label className="block font-bold mb-1">تاريخ التركيب المتفق عليه *</label>
              <input type="date" value={installDate} onChange={e => setInstallDate(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold" />
            </div>

            <div>
              <label className="block font-bold mb-1">عنوان الموقع والتركيب بالتفصيل *</label>
              <input type="text" value={installAddress} onChange={e => setInstallAddress(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setActiveInstallScheduleOrder(null)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button
                type="button"
                onClick={() => {
                  scheduleInstallation(activeInstallScheduleOrder.id, installDate, installTime, installAddress, ['user-1', 'user-2']);
                  setActiveInstallScheduleOrder(null);
                }}
                className="px-5 py-2 bg-[#C87A38] hover:bg-[#DB8D48] text-white font-black rounded-xl shadow-md"
              >
                حفظ ونقل لجدول التركيبات
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
