import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Material, MaterialCategory } from '../types/erp';
import { InventoryService } from '../services/inventoryService';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Boxes,
  Truck,
  DollarSign,
  Eye,
  AlertTriangle,
  CheckCircle2,
  X,
  Tag
} from 'lucide-react';
import { MaterialDetailsPage } from './MaterialDetailsPage';

export const MaterialsListPage: React.FC = () => {
  const {
    materials,
    suppliers,
    availableBranches,
    selectedMaterialId,
    setSelectedMaterialId,
    checkPermission,
    addMaterial
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStockFilter, setSelectedStockFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<MaterialCategory>('mdf');
  const [unit, setUnit] = useState<string>('Sheet');
  const [minStockLevel, setMinStockLevel] = useState<number>(20);
  const [referenceCost, setReferenceCost] = useState<number>(1250);
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || 'sup-m1');
  const [description, setDescription] = useState('');
  
  // Specifications State
  const [specKey, setSpecKey] = useState('التخانة');
  const [specValue, setSpecValue] = useState('18مم');
  const [specsList, setSpecsList] = useState<{ key: string; value: string }[]>([
    { key: 'التخانة', value: '18مم' },
    { key: 'اللون', value: 'أبيض' }
  ]);

  const canCreate = checkPermission('materials', 'create');

  if (selectedMaterialId) {
    return (
      <MaterialDetailsPage
        materialId={selectedMaterialId}
        onBack={() => setSelectedMaterialId(null)}
      />
    );
  }

  // Filter materials
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.specifications.some(s => s.value.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;

    let matchesStock = true;
    const isLow = InventoryService.isLowStock(m.availableStock, m.minStockLevel);
    if (selectedStockFilter === 'low_stock') matchesStock = isLow;
    if (selectedStockFilter === 'out_of_stock') matchesStock = m.availableStock === 0;
    if (selectedStockFilter === 'available') matchesStock = m.availableStock > 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleAddSpec = () => {
    if (!specKey.trim() || !specValue.trim()) return;
    setSpecsList(prev => [...prev, { key: specKey, value: specValue }]);
    setSpecKey('');
    setSpecValue('');
  };

  const handleRemoveSpec = (index: number) => {
    setSpecsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const chosenSupplier = suppliers.find(s => s.id === supplierId) || suppliers[0];

    addMaterial({
      name,
      nameEn: name,
      code,
      category,
      categoryName: category === 'mdf' ? 'ألواح MDF وكونتر' : category === 'hpl' ? 'تغليف HPL وأكريليك' : category === 'hinges' ? 'مفصلات وإكسسوارات' : 'خامات تصنيع',
      unit,
      description,
      specifications: specsList,
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600',
      minStockLevel: Number(minStockLevel),
      status: 'active',
      currentReferenceCost: Number(referenceCost),
      suppliers: [
        {
          supplierId: chosenSupplier.id,
          supplierName: chosenSupplier.name,
          purchaseCost: Number(referenceCost),
          lastPurchaseDate: new Date().toISOString().substring(0, 10),
          isPreferred: true
        }
      ],
      stockByLocation: availableBranches.map(b => ({
        branchId: b.id,
        branchName: b.name,
        onHand: 10,
        reserved: 0,
        available: 10
      }))
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">مكتبة خامات التصنيع (Materials Library)</h1>
            <span className="bg-[#E06F28]/15 text-[#E06F28] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E06F28]/30">
              {filteredMaterials.length} خامة مسجلة
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            دليل خامات MDF والكونتر والـ HPL والمفصلات، تكاليف التوريد، وحد أمان المخزون
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-[#1C352D] hover:bg-[#142921] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4 text-[#E06F28]" />
            <span>إضافة خامة جديدة</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث باسم الخامة، الكود، أو المواصفة..."
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">كل الفئات والخامات</option>
              <option value="mdf">ألواح MDF وكونتر</option>
              <option value="hpl">تغليف HPL وأكريليك</option>
              <option value="edge_band">شريط قشاط PVC</option>
              <option value="hinges">مفصلات وإكسسوارات</option>
              <option value="drawers">مجارى أدراج</option>
              <option value="handles">مقابض وسحابات</option>
              <option value="fabric">أقمشة وإسفنج</option>
              <option value="glass">زجاج ورخام</option>
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={selectedStockFilter}
              onChange={(e) => setSelectedStockFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">كل حالات المخزون</option>
              <option value="low_stock">نقص في المخزون (Low Stock)</option>
              <option value="available">متاح ومتوفر</option>
              <option value="out_of_stock">منتهي بالكامل (Out of Stock)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Materials Table */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#1C352D] text-white font-bold border-b border-emerald-900/50">
              <tr>
                <th className="p-4 min-w-[240px] text-right whitespace-nowrap">الخامة والكود</th>
                <th className="p-4 min-w-[140px] text-right whitespace-nowrap">الفئة والوحدة</th>
                <th className="p-4 min-w-[130px] text-left whitespace-nowrap">التكلفة الحالية</th>
                <th className="p-4 min-w-[120px] text-center whitespace-nowrap">المخزون المتاح</th>
                <th className="p-4 min-w-[110px] text-center whitespace-nowrap">حد الأمان</th>
                <th className="p-4 min-w-[160px] text-right whitespace-nowrap">المورد المفضل</th>
                <th className="p-4 min-w-[140px] text-center whitespace-nowrap">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredMaterials.map(m => {
                const isLow = InventoryService.isLowStock(m.availableStock, m.minStockLevel);
                const prefSup = m.suppliers.find(s => s.isPreferred) || m.suppliers[0];

                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Material Name & Code */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#E06F28] flex items-center justify-center border border-amber-200 shrink-0 font-bold">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{m.name}</p>
                          <span className="font-mono text-[11px] text-slate-500 font-bold block">{m.code}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category & Unit */}
                    <td className="p-4 whitespace-nowrap">
                      <p className="font-bold text-slate-800">{m.categoryName}</p>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200">
                        الوحدة: {m.unit}
                      </span>
                    </td>

                    {/* Reference Cost */}
                    <td className="p-4 text-left font-black text-amber-900 font-mono text-sm whitespace-nowrap">
                      {m.currentReferenceCost.toLocaleString('ar-EG')} <span className="text-[10px] text-slate-400 font-sans">ج.م/{m.unit}</span>
                    </td>

                    {/* Available Stock & Low Stock Badge */}
                    <td className="p-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap ${
                        isLow
                          ? 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}>
                        {m.availableStock} {m.unit}
                        {isLow && <span className="mr-1 text-[10px] block font-bold">⚠️ نقص مخزون</span>}
                      </span>
                    </td>

                    {/* Min Stock Level */}
                    <td className="p-4 text-center font-mono font-bold text-slate-500 whitespace-nowrap">
                      {m.minStockLevel} {m.unit}
                    </td>

                    {/* Preferred Supplier */}
                    <td className="p-4 text-slate-700 font-bold text-xs whitespace-nowrap">
                      {prefSup ? prefSup.supplierName : 'غير محدد'}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedMaterialId(m.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1C352D] hover:bg-[#142921] text-white font-black text-xs shadow-xs transition-all flex items-center gap-1.5 mx-auto shrink-0 whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#E06F28]" />
                        <span>كشف خامة 360</span>
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Material Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">إضافة خامة تصنيع جديدة</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMaterial} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الخامة بالكامل *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: MDF أبيض اسباني 18مم"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">كود الخامة *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="MAT-MDF-01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الفئة *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="mdf">ألواح MDF وكونتر</option>
                    <option value="hpl">تغليف HPL وأكريليك</option>
                    <option value="edge_band">شريط قشاط PVC</option>
                    <option value="hinges">مفصلات وإكسسوارات</option>
                    <option value="drawers">مجارى أدراج</option>
                    <option value="handles">مقابض وسحابات</option>
                    <option value="fabric">أقمشة وإسفنج</option>
                    <option value="glass">زجاج ورخام</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وحدة القياس *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Sheet">لوح (Sheet)</option>
                    <option value="Meter">متر (Meter)</option>
                    <option value="Piece">قطعة (Piece)</option>
                    <option value="Set">طقم (Set)</option>
                    <option value="Kg">كيلوجرام (Kg)</option>
                    <option value="Liter">لتر (Liter)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">حد أمان المخزون *</label>
                  <input
                    type="number"
                    required
                    value={minStockLevel}
                    onChange={(e) => setMinStockLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تكلفة الشراء (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={referenceCost}
                    onChange={(e) => setReferenceCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-amber-50 border border-amber-300 rounded-xl font-bold font-mono text-amber-900 text-left dir-ltr"
                  />
                </div>
              </div>

              {/* SUPPLIER LINK */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">المورد المفضل / المورّد الرئيسي</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.companyName})</option>
                  ))}
                </select>
              </div>

              {/* SPECIFICATIONS BUILDER */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-800">مواصفات الخامة الهيكلية (Specifications):</label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    placeholder="المواصفة (مثال: التخانة)"
                    className="w-1/2 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    placeholder="القيمة (مثال: 18مم)"
                    className="w-1/2 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-3 py-1.5 bg-[#1C352D] text-white font-bold rounded-xl shrink-0"
                  >
                    + إضافة
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {specsList.map((sp, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700">
                      <strong>{sp.key}:</strong> {sp.value}
                      <button type="button" onClick={() => handleRemoveSpec(i)} className="text-rose-500 hover:text-rose-700 mr-1">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1C352D] text-white font-black rounded-xl"
                >
                  حفظ الخامة بدليل الخامات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
