// ====================================================
// REWAQ ERP — MULTI-WAREHOUSES & LOCATIONS VIEW
// Multi-Store Setup, Storage Aisles, Capacity & Manager Assignments
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { stockAt } from '../../services/warehouseStock';
import { WarehouseLocation, WarehouseCategoryType } from '../../types/erp';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  User,
  Boxes,
  Layers,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Tag,
  LayoutGrid
} from 'lucide-react';

export const WarehousesLocationsView: React.FC = () => {
  const {
    warehouses,
    itemMasterCards,
    branches,
    createWarehouse,
    showToast
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formBranchId, setFormBranchId] = useState<string>(branches[0]?.id || '');
  const [formType, setFormType] = useState<WarehouseCategoryType>('raw_materials');
  const [formManagerName, setFormManagerName] = useState('م. إبراهيم كمال');
  const [formPhone, setFormPhone] = useState('01019283741');
  const [formAddress, setFormAddress] = useState('مجمع مصانع العبور - هنجر 5');
  const [formAisles, setFormAisles] = useState('ممر A1, ممر A2, ممر A3');

  const handleCreateWarehouse = () => {
    if (!formName) {
      showToast('يرجى كتابة اسم المستودع', 'warning');
      return;
    }

    const targetBranch = branches.find(b => b.id === formBranchId);
    const aislesArray = formAisles.split(',').map(s => s.trim()).filter(Boolean);

    createWarehouse({
      code: formCode || `WH-${Math.floor(10 + Math.random() * 90)}`,
      name: formName,
      nameEn: formNameEn || formName,
      branchId: formBranchId,
      branchName: targetBranch?.name || 'مجمع العبور',
      type: formType,
      managerName: formManagerName,
      phone: formPhone,
      address: formAddress,
      aisles: aislesArray.length > 0 ? aislesArray : ['ممر 1', 'ممر 2']
    });

    setShowAddModal(false);
  };

  const filteredWarehouses = warehouses.filter(w =>
    !searchQuery ||
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.managerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>هيكل المستودعات ومواقع التخزين — Multi-Warehouse & Storage Bins Setup</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[#C87A38]" />
            <span>دليل المستودعات ومواقع التخزين والأرفف</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            تهيئة وهيكلة المستودعات، مستودع الخامات الرئيسي، مستودع ورشة التصنيع، مستودع الإنتاج التام، وتعيين أمناء المخازن والممرات والأرفف الداخلية.
          </p>
        </div>

        <button
          onClick={() => {
            setFormName('');
            setFormCode(`WH-${Math.floor(10 + Math.random() * 90)}`);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C87A38] hover:bg-amber-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>تعريف مستودع جديد</span>
        </button>
      </div>

      {/* 2. WAREHOUSES CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWarehouses.map(wh => {
          const whItems = itemMasterCards.filter(i => stockAt(i, wh.id) > 0);
          const whValuation = whItems.reduce((s, i) => s + (stockAt(i, wh.id) * i.weightedAvgCost), 0);

          return (
            <div
              key={wh.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 hover:border-[#C87A38]/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                      {wh.code}
                    </span>
                    <h3 className="font-black text-base text-slate-900 mt-1">{wh.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{wh.nameEn}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                    wh.type === 'raw_materials' ? 'bg-amber-100 text-amber-900' :
                    wh.type === 'finished_goods' ? 'bg-emerald-100 text-emerald-900' :
                    wh.type === 'scrap_waste' ? 'bg-rose-100 text-rose-900' :
                    'bg-blue-100 text-blue-900'
                  }`}>
                    {wh.type === 'raw_materials' && 'خامات رئيسية'}
                    {wh.type === 'finished_goods' && 'إنتاج تام'}
                    {wh.type === 'hardware_accessories' && 'إكسسوارات وعدد'}
                    {wh.type === 'showroom_floor' && 'صالة عرض'}
                    {wh.type === 'scrap_waste' && 'هالك وتوالف'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>أمين المستودع: <strong>{wh.managerName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{wh.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px]">{wh.address}</span>
                  </div>
                </div>

                {/* Aisles Tags */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 block">الممرات والأرفف الداخلية:</span>
                  <div className="flex flex-wrap gap-1">
                    {wh.aisles.map((aisle, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                        {aisle}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Valuation Tile */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">قيمة المخزون الفعلي:</span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    {whValuation.toLocaleString()} EGP
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">عدد الأصناف:</span>
                  <span className="font-mono font-bold text-slate-700">{whItems.length} كارت صنف</span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>نسبة الإشغال:</span>
                    <span className="font-mono">{wh.capacityPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        wh.capacityPercentage > 85 ? 'bg-rose-500' : wh.capacityPercentage > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${wh.capacityPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. MODAL: CREATE WAREHOUSE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-[#C87A38]" />
                <h3 className="font-black text-lg text-slate-900">تعريف وتكوين مستودع جديد</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-rose-50 flex items-center justify-center">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">اسم المستودع بالعربي *:</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="مثال: مستودع خامات الورشة"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">كود المستودع:</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">المقر / الفرع التابع له:</label>
                  <select
                    value={formBranchId}
                    onChange={(e) => setFormBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">نوع وطبيعة المستودع:</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as WarehouseCategoryType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="raw_materials">مستودع خامات وألواح خشب</option>
                    <option value="hardware_accessories">مستودع إكسسوارات ومفصلات وعدد</option>
                    <option value="finished_goods">مستودع إنتاج تام وشحن</option>
                    <option value="showroom_floor">صالة عرض ومعرض مبيعات</option>
                    <option value="scrap_waste">مستودع هالك وتوالف</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">أمين المستودع المسؤول:</label>
                  <input
                    type="text"
                    value={formManagerName}
                    onChange={(e) => setFormManagerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">رقم هاتف المستودع:</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">الممرات والأرفف (مفصولة بفواصل):</label>
                <input
                  type="text"
                  value={formAisles}
                  onChange={(e) => setFormAisles(e.target.value)}
                  placeholder="مثال: ممر A1, ممر A2, ممر B1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">العنوان والتفاصيل:</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600">إلغاء</button>
              <button onClick={handleCreateWarehouse} className="px-5 py-2 rounded-xl text-xs font-black bg-[#C87A38] hover:bg-amber-600 text-white shadow-lg">
                حفظ المستودع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
