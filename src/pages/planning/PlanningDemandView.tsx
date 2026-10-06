import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Search, 
  Filter, 
  Layers, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Play,
  FileText,
  User,
  Plus,
  LayoutGrid,
  ListFilter,
  ChevronDown,
  ChevronUp,
  Package,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  HardHat,
  Eye,
  RotateCcw
} from 'lucide-react';
import { PlanningDemand, ProjectPlanningReadiness } from '../../types/planning';
import { getDemandSourceBadge, getDemandStatusBadge, getPriorityBadge } from '../../services/planningService';

interface PlanningDemandViewProps {
  demands: PlanningDemand[];
  readinessList: ProjectPlanningReadiness[];
  onOpenMRPModal: () => void;
  onNavigateToMRP: () => void;
}

export const PlanningDemandView: React.FC<PlanningDemandViewProps> = ({
  demands,
  readinessList,
  onOpenMRPModal,
  onNavigateToMRP,
}) => {
  // View Modes: 'by_project' (Default), 'by_material', 'detailed_table'
  const [viewMode, setViewMode] = useState<'by_project' | 'by_material' | 'detailed_table'>('by_project');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  // Distinct Projects List for filter
  const distinctProjects = useMemo(() => {
    const map = new Map<string, { projectNumber: string; projectName: string; customerName?: string }>();
    demands.forEach(d => {
      if (d.projectNumber) {
        map.set(d.projectNumber, {
          projectNumber: d.projectNumber,
          projectName: d.projectName || 'مشروع تفصيل',
          customerName: d.customerName
        });
      }
    });
    return Array.from(map.values());
  }, [demands]);

  // Filtered Demands List
  const filteredDemands = useMemo(() => {
    return demands.filter(d => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        d.demandNumber.toLowerCase().includes(searchLower) ||
        d.itemName.toLowerCase().includes(searchLower) ||
        d.itemCode.toLowerCase().includes(searchLower) ||
        (d.projectNumber && d.projectNumber.toLowerCase().includes(searchLower)) ||
        (d.customerName && d.customerName.toLowerCase().includes(searchLower)) ||
        (d.sourceNumber && d.sourceNumber.toLowerCase().includes(searchLower));

      const matchesSource = selectedSourceType === 'all' || d.sourceType === selectedSourceType;
      const matchesStatus = selectedStatus === 'all' || d.status === selectedStatus;
      const matchesProject = selectedProjectFilter === 'all' || d.projectNumber === selectedProjectFilter;

      return matchesSearch && matchesSource && matchesStatus && matchesProject;
    });
  }, [demands, searchTerm, selectedSourceType, selectedStatus, selectedProjectFilter]);

  // Grouped By Project
  const groupedByProject = useMemo(() => {
    const groups: Record<string, {
      projectNumber: string;
      projectName: string;
      customerName?: string;
      sourceNumber?: string;
      sourceType: string;
      priority: string;
      requiredDate: string;
      demands: PlanningDemand[];
      readiness?: ProjectPlanningReadiness;
    }> = {};

    filteredDemands.forEach(d => {
      const pKey = d.projectNumber || d.sourceNumber || 'GENERAL_STOCK';
      if (!groups[pKey]) {
        const readiness = readinessList.find(r => r.projectNumber === d.projectNumber || r.projectId === d.projectId);
        groups[pKey] = {
          projectNumber: d.projectNumber || (d.sourceType === 'safety_stock_replenishment' ? 'تعويض أمان المخزون' : 'طلب إنتاج عام'),
          projectName: d.projectName || (d.sourceType === 'safety_stock_replenishment' ? 'حد الأمان للمخازن' : 'تغذية خطوط الإنتاج'),
          customerName: d.customerName,
          sourceNumber: d.sourceNumber,
          sourceType: d.sourceType,
          priority: d.priority,
          requiredDate: d.requiredDate,
          demands: [],
          readiness
        };
      }
      groups[pKey].demands.push(d);
    });

    return Object.values(groups);
  }, [filteredDemands, readinessList]);

  // Grouped By Material (Consolidated Demand)
  const groupedByMaterial = useMemo(() => {
    const groups: Record<string, {
      itemId: string;
      itemCode: string;
      itemName: string;
      itemCategory: string;
      uom: string;
      totalQty: number;
      earliestDate: string;
      openCount: number;
      demands: PlanningDemand[];
    }> = {};

    filteredDemands.forEach(d => {
      if (!groups[d.itemCode]) {
        groups[d.itemCode] = {
          itemId: d.itemId,
          itemCode: d.itemCode,
          itemName: d.itemName,
          itemCategory: d.itemCategory,
          uom: d.uom,
          totalQty: 0,
          earliestDate: d.requiredDate,
          openCount: 0,
          demands: []
        };
      }
      groups[d.itemCode].totalQty += d.quantityRequired;
      if (d.status === 'open') groups[d.itemCode].openCount += 1;
      if (d.requiredDate < groups[d.itemCode].earliestDate) {
        groups[d.itemCode].earliestDate = d.requiredDate;
      }
      groups[d.itemCode].demands.push(d);
    });

    return Object.values(groups).sort((a, b) => b.totalQty - a.totalQty);
  }, [filteredDemands]);

  const toggleProjectExpand = (pKey: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [pKey]: prev[pKey] === undefined ? false : !prev[pKey]
    }));
  };

  const isProjectOpen = (pKey: string) => {
    return expandedProjects[pKey] !== false;
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedProjectFilter('all');
    setSelectedStatus('all');
    setSelectedSourceType('all');
  };

  const hasActiveFilters = searchTerm || selectedProjectFilter !== 'all' || selectedStatus !== 'all' || selectedSourceType !== 'all';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-black">
              محرك إدارة الطلب والاحتياج (Demand Management)
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-500 font-bold">
              {demands.length} بند خامات واحتياج مستلم
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#1E110B] mt-1 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-[#C87A38]" />
            <span>طلبات التخطيط واحتياج المشاريع (Planning Demands)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة كافة الاحتياجات المستلمة تلقائياً من حزم الإفراج الفني بالمكتب الفني وأوامر التصنيع وتجميعها للـ MRP
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenMRPModal}
            className="px-5 py-2.5 bg-gradient-to-r from-[#1E110B] via-[#361D13] to-[#C87A38] text-white rounded-xl font-black text-xs shadow-md shadow-[#C87A38]/20 transition-all flex items-center gap-2 cursor-pointer hover:opacity-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>تشغيل محرك الـ MRP للطلبات</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">المشاريع وحزم الإفراج</span>
            <span className="text-2xl font-black text-[#1E110B] font-mono mt-0.5 block">{groupedByProject.length}</span>
            <span className="text-[10px] text-slate-400 font-medium">مشروع تفصيل وإنتاج نشط</span>
          </div>
          <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">إجمالي خطوط الاحتياج</span>
            <span className="text-2xl font-black text-indigo-900 font-mono mt-0.5 block">{demands.length}</span>
            <span className="text-[10px] text-indigo-600 font-bold">بنود خامات وإكسسوارات</span>
          </div>
          <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">مفتوح لتشغيل الـ MRP</span>
            <span className="text-2xl font-black text-amber-600 font-mono mt-0.5 block">
              {demands.filter(d => d.status === 'open').length}
            </span>
            <span className="text-[10px] text-amber-700 font-medium">بحاجة لحساب الصافي وتوليد مقترحات</span>
          </div>
          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">الأصناف والخامات المجمعة</span>
            <span className="text-2xl font-black text-emerald-700 font-mono mt-0.5 block">{groupedByMaterial.length}</span>
            <span className="text-[10px] text-emerald-800 font-bold">صنف خامة مميز ومجمع</span>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Structured Clean Control & Toolbar Box */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Row 1: 3-Way View Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-700">نمط عرض الاحتياجات:</span>
          </div>

          <div className="flex rounded-2xl p-1 bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('by_project')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                viewMode === 'by_project'
                  ? 'bg-[#361D13] text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-[#C87A38]" />
              <span>عرض بحسب حزم المشاريع ({groupedByProject.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('by_material')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                viewMode === 'by_material'
                  ? 'bg-[#361D13] text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4 text-[#C87A38]" />
              <span>تجميع بحسب الخامات والأصناف ({groupedByMaterial.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('detailed_table')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                viewMode === 'detailed_table'
                  ? 'bg-[#361D13] text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-4 h-4 text-[#C87A38]" />
              <span>جدول الخطوط التفصيلي ({filteredDemands.length})</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search & Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs">
          
          {/* Search Bar (Span 5) */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث بالمشروع، العميل، كود أو اسم الخامة، حزمة الإفراج..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38] font-medium"
            />
          </div>

          {/* Project Filter (Span 3) */}
          <div className="lg:col-span-3">
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38] font-bold text-slate-700"
            >
              <option value="all">كافة المشاريع ({distinctProjects.length})</option>
              {distinctProjects.map(p => (
                <option key={p.projectNumber} value={p.projectNumber}>
                  {p.projectNumber} - {p.customerName || p.projectName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter (Span 3) */}
          <div className="lg:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38] font-bold text-slate-700"
            >
              <option value="all">كافة الحالات</option>
              <option value="open">مفتوح للـ MRP</option>
              <option value="planned">مخطط (Planned)</option>
              <option value="partially_supplied">مستوفى جزئياً</option>
              <option value="fully_supplied">مستوفى بالكامل</option>
            </select>
          </div>

          {/* Reset Filters (Span 1) */}
          <div className="lg:col-span-1 flex items-center">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="w-full py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                title="إعادة ضبط الفلاتر"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">مسح</span>
              </button>
            ) : (
              <div className="w-full py-2.5 px-2 text-center text-slate-300 text-xs font-mono">
                {filteredDemands.length} نتيجة
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* VIEW MODE 1: GROUPED BY PROJECT PACKAGES (DEFAULT)     */}
      {/* ======================================================== */}
      {viewMode === 'by_project' && (
        <div className="space-y-4">
          {groupedByProject.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-2">
              <Boxes className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-bold text-sm">لا توجد طلبات تخطيط مطابقة لمعايير البحث الحالية.</p>
            </div>
          ) : (
            groupedByProject.map((group) => {
              const pKey = group.projectNumber;
              const isOpen = isProjectOpen(pKey);
              const priorityMeta = getPriorityBadge(group.priority as any);
              const readiness = group.readiness;
              const totalItems = group.demands.length;
              const openItems = group.demands.filter(d => d.status === 'open').length;

              return (
                <div 
                  key={pKey}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all hover:border-[#C87A38]/50"
                >
                  {/* Project Package Header Card */}
                  <div 
                    onClick={() => toggleProjectExpand(pKey)}
                    className="p-5 bg-gradient-to-r from-slate-50/90 via-white to-amber-50/10 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none border-b border-slate-100"
                  >
                    {/* Right: Project Title & Badges */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#361D13] text-[#E29555] flex items-center justify-center font-black text-sm shrink-0 shadow-inner">
                        <Layers className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-sm text-[#1E110B] whitespace-nowrap bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                            {group.projectNumber}
                          </span>
                          {group.sourceNumber && (
                            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-800 font-bold border border-purple-200 whitespace-nowrap">
                              حزمة الإفراج: {group.sourceNumber}
                            </span>
                          )}
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black border whitespace-nowrap ${priorityMeta.color}`}>
                            {priorityMeta.label}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-[#1E110B] flex items-center gap-2">
                          <span>{group.customerName || 'مشروع عام'}</span>
                          <span className="text-xs font-normal text-slate-500">| {group.projectName}</span>
                        </h3>
                      </div>
                    </div>

                    {/* Left: Readiness & Metrics */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      {readiness && (
                        <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-900 shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <div className="font-black text-[11px]">جاهزية المواد: {readiness.readinessPercentage}%</div>
                            <div className="text-[10px] text-emerald-700 font-medium">{readiness.coveredMaterialsCount} من {readiness.totalMaterialDemandsCount} خامة متوفرة</div>
                          </div>
                        </div>
                      )}

                      <div className="px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 shrink-0 text-center">
                        <div className="font-black text-[11px] flex items-center justify-center gap-1">
                          <Boxes className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{totalItems} بنود خامات</span>
                        </div>
                        <div className="text-[10px] text-indigo-700 font-medium">
                          {openItems > 0 ? `${openItems} مفتوح للـ MRP` : 'تم تخطيط الكل'}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Collapsible BOM Demands Table */}
                  {isOpen && (
                    <div className="p-5 space-y-3 bg-white">
                      <div className="flex items-center justify-between text-xs pb-1">
                        <span className="font-black text-slate-800 flex items-center gap-1.5">
                          <Boxes className="w-4 h-4 text-[#C87A38]" />
                          <span>قائمة خامات ومستلزمات المشروع التفصيلية (Project Bill of Demands):</span>
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          تاريخ الحاجة بالمصنع: {group.requiredDate}
                        </span>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3 whitespace-nowrap">كود الطلب</th>
                              <th className="px-4 py-3">البند والخامة المطلوبة</th>
                              <th className="px-4 py-3 whitespace-nowrap text-center">الكمية المطلوبة</th>
                              <th className="px-4 py-3 whitespace-nowrap">الوحدة التابعة (BOM Unit)</th>
                              <th className="px-4 py-3 whitespace-nowrap">تاريخ الحاجة</th>
                              <th className="px-4 py-3 whitespace-nowrap">الحالة التخطيطية</th>
                              <th className="px-4 py-3 whitespace-nowrap">المستودع المستهدف</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {group.demands.map((demand) => {
                              const statusMeta = getDemandStatusBadge(demand.status);

                              return (
                                <tr key={demand.id} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="px-4 py-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                                    {demand.demandNumber}
                                  </td>

                                  <td className="px-4 py-3">
                                    <div className="font-black text-slate-900">{demand.itemName}</div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{demand.itemCode}</div>
                                  </td>

                                  <td className="px-4 py-3 font-black text-indigo-700 text-center font-mono whitespace-nowrap">
                                    {demand.quantityRequired} {demand.uom}
                                  </td>

                                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                    {demand.unitCode ? (
                                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-[10px] font-bold">
                                        {demand.unitCode}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 text-[11px]">عام للمشروع</span>
                                    )}
                                  </td>

                                  <td className="px-4 py-3 font-mono text-slate-700 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{demand.requiredDate}</span>
                                    </div>
                                  </td>

                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border inline-block whitespace-nowrap ${statusMeta.color}`}>
                                      {statusMeta.label}
                                    </span>
                                  </td>

                                  <td className="px-4 py-3 text-slate-600 text-[11px] whitespace-nowrap">
                                    {demand.warehouseName}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW MODE 2: CONSOLIDATED BY MATERIAL (PEGGING VIEW)    */}
      {/* ======================================================== */}
      {viewMode === 'by_material' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#1E110B] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#C87A38]" />
                <span>تجميع وتوحيد إجمالي الاحتياجات عبر كافة المشاريع (Material Pegging Matrix)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تجميع كميات الخامات المتماثلة لتسهيل إصدار أوامر الشراء الجماعية والتفاوض مع الموردين
              </p>
            </div>
            <span className="text-xs font-mono font-black text-indigo-700 px-3 py-1 bg-indigo-50 rounded-xl border border-indigo-200">
              {groupedByMaterial.length} صنف خامة
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedByMaterial.map((matGroup) => (
              <div 
                key={matGroup.itemCode}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-[#C87A38]/60 transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold border border-slate-200 inline-block mb-1">
                      {matGroup.itemCode}
                    </span>
                    <h4 className="text-base font-black text-[#1E110B] leading-snug">{matGroup.itemName}</h4>
                  </div>

                  <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-center shrink-0">
                    <span className="text-[10px] font-bold text-indigo-600 block">إجمالي المطلوب</span>
                    <span className="text-lg font-black text-indigo-900 font-mono">
                      {matGroup.totalQty} {matGroup.uom}
                    </span>
                  </div>
                </div>

                {/* Project Breakdown Chips */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between items-center text-slate-500 font-bold text-[11px]">
                    <span>توزيع الاحتياج على المشاريع ({matGroup.demands.length} مشروع):</span>
                    <span>أقرب تاريخ حاجة: {matGroup.earliestDate}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {matGroup.demands.map((d) => (
                      <div 
                        key={d.id} 
                        className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-bold flex items-center gap-1.5"
                      >
                        <span className="font-mono text-[#C87A38]">{d.projectNumber || 'عام'}</span>
                        <span className="text-slate-400">|</span>
                        <span className="font-mono text-indigo-700">{d.quantityRequired} {d.uom}</span>
                        {d.customerName && (
                          <span className="text-slate-500 font-normal text-[10px]">({d.customerName})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW MODE 3: DETAILED DEMAND LINES FLAT TABLE           */}
      {/* ======================================================== */}
      {viewMode === 'detailed_table' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 whitespace-nowrap">كود الطلب والمصدر</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">المشروع / العميل</th>
                  <th className="px-4 py-3.5">البند والخامة المطلوبة</th>
                  <th className="px-4 py-3.5 whitespace-nowrap text-center">الكمية المطلوبة</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">تاريخ الحاجة بالمصنع</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">الأولوية</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">الحالة</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">المستودع المستهدف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredDemands.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-bold">
                      لا توجد طلبات تخطيط مطابقة لمعايير البحث الحالية
                    </td>
                  </tr>
                ) : (
                  filteredDemands.map((demand) => {
                    const sourceMeta = getDemandSourceBadge(demand.sourceType);
                    const statusMeta = getDemandStatusBadge(demand.status);
                    const priorityMeta = getPriorityBadge(demand.priority);

                    return (
                      <tr key={demand.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="font-bold text-slate-900 font-mono">{demand.demandNumber}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border whitespace-nowrap ${sourceMeta.color}`}>
                              {sourceMeta.label}
                            </span>
                            {demand.sourceNumber && (
                              <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">({demand.sourceNumber})</span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {demand.projectNumber ? (
                            <div>
                              <span className="font-bold text-slate-900 font-mono block">{demand.projectNumber}</span>
                              <span className="text-[11px] text-slate-600 block">{demand.projectName}</span>
                              {demand.customerName && (
                                <span className="text-[10px] text-slate-400 block mt-0.5">العميل: {demand.customerName}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">عام للمخزون</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 min-w-[200px]">
                          <div className="font-bold text-slate-900">{demand.itemName}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{demand.itemCode}</div>
                        </td>

                        <td className="px-4 py-3.5 font-black text-indigo-700 font-mono text-center whitespace-nowrap">
                          {demand.quantityRequired} {demand.uom}
                        </td>

                        <td className="px-4 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{demand.requiredDate}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border whitespace-nowrap ${priorityMeta.color}`}>
                            {priorityMeta.label}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border whitespace-nowrap inline-block ${statusMeta.color}`}>
                            {statusMeta.label}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-slate-600 text-[11px] whitespace-nowrap">
                          {demand.warehouseName}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
