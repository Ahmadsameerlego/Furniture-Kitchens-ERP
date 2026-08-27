import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Product, ProductCategory } from '../types/erp';
import {
  Package,
  Plus,
  Search,
  Filter,
  Boxes,
  Truck,
  DollarSign,
  Eye,
  Building,
  CheckCircle2,
  X,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { ProductDetailsPage } from './ProductDetailsPage';

export const ProductsListPage: React.FC = () => {
  const {
    products,
    suppliers,
    availableBranches,
    selectedProductId,
    setSelectedProductId,
    checkPermission,
    addProduct
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Image load error fallback state tracker
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // New Product Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('sofas');
  const [sellingPrice, setSellingPrice] = useState(20000);
  const [purchaseCost, setPurchaseCost] = useState(14000);
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || 'sup-1');
  const [model, setModel] = useState('');
  const [description, setDescription] = useState('');

  const canCreate = checkPermission('products', 'create');

  if (selectedProductId) {
    return (
      <ProductDetailsPage
        productId={selectedProductId}
        onBack={() => setSelectedProductId(null)}
      />
    );
  }

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSupplier = selectedSupplier === 'all' || p.suppliers.some(s => s.supplierId === selectedSupplier);

    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const chosenSupplier = suppliers.find(s => s.id === supplierId) || suppliers[0];

    addProduct({
      name,
      nameEn: name,
      code,
      sku: sku || code,
      category,
      categoryName: category === 'sofas' ? 'أنتريهات وصالونات' : category === 'dining' ? 'غرف سفرة وطاولات' : 'أثاث ومطابخ',
      type: category === 'kitchen_ready' || category === 'kitchen_acc' ? 'kitchen' : 'furniture',
      model: model || 'موديل 2026',
      description,
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600'],
      status: 'active',
      sellingPrice: Number(sellingPrice),
      defaultPurchaseCost: Number(purchaseCost),
      variants: [],
      suppliers: [
        {
          supplierId: chosenSupplier.id,
          supplierName: chosenSupplier.name,
          purchaseCost: Number(purchaseCost),
          lastPurchaseDate: new Date().toISOString().substring(0, 10),
          isPreferred: true
        }
      ],
      stockByLocation: availableBranches.map(b => ({
        branchId: b.id,
        branchName: b.name,
        onHand: 5,
        reserved: 0,
        available: 5,
        delivered: 0
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
            <h1 className="text-xl font-black text-slate-900">إدارة المنتجات والأثاث الجاهز (Products Catalog)</h1>
            <span className="bg-[#E06F28]/15 text-[#E06F28] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E06F28]/30">
              {filteredProducts.length} منتج مسجل
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            دليل المنتجات الجاهزة، ربط الموردين بأسعار الشراء الفعلية والتكلفة والمخزون
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-[#1C352D] hover:bg-[#142921] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4 text-[#E06F28]" />
            <span>إضافة منتج جديد</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          {/* Search */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث باسم المنتج أو الكود أو الـ SKU..."
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
              <option value="all">كل الفئات والتصنيفات</option>
              <option value="sofas">أنتريهات وصالونات</option>
              <option value="dining">غرف سفرة وطاولات</option>
              <option value="bedrooms">غرف نوم ماستر</option>
              <option value="tv_units">طاولات ووحدات تلفزيون</option>
              <option value="kitchen_ready">مطابخ جاهزة ووحدات</option>
              <option value="kitchen_acc">إكسسوارات مطابخ</option>
            </select>
          </div>

          {/* Supplier Filter */}
          <div>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">كل الموردين المسجلين</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Desktop Products Table */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#1C352D] text-white font-bold border-b border-emerald-900/50">
              <tr>
                <th className="p-4 min-w-[260px] text-right whitespace-nowrap">المنتج والكود</th>
                <th className="p-4 min-w-[140px] text-right whitespace-nowrap">التصنيف</th>
                <th className="p-4 min-w-[120px] text-left whitespace-nowrap">سعر البيع</th>
                <th className="p-4 min-w-[130px] text-left whitespace-nowrap">التكلفة الافتراضية</th>
                <th className="p-4 min-w-[120px] text-center whitespace-nowrap">المخزون المتاح</th>
                <th className="p-4 min-w-[160px] text-right whitespace-nowrap">المورد الرئيسي</th>
                <th className="p-4 min-w-[140px] text-center whitespace-nowrap">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.map(p => {
                let availStock = 0;
                p.stockByLocation.forEach(l => availStock += l.available);
                const prefSup = p.suppliers.find(s => s.isPreferred) || p.suppliers[0];
                const hasImgFailed = failedImages[p.id];

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Product & Code */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {!hasImgFailed && p.images[0] ? (
                          <img
                            src={p.images[0]}
                            alt=""
                            onError={() => setFailedImages(prev => ({ ...prev, [p.id]: true }))}
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#1C352D]/20 shadow-xs shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1C352D] flex items-center justify-center border border-emerald-200 shrink-0 font-bold">
                            <Package className="w-6 h-6 text-[#1C352D]" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 text-xs sm:text-sm leading-tight">{p.name}</p>
                          <span className="font-mono text-[11px] text-slate-500 font-bold block mt-0.5">{p.code}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="p-4 font-bold text-slate-800 whitespace-nowrap">
                      <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/90 whitespace-nowrap shadow-2xs">
                        {p.categoryName}
                      </span>
                    </td>

                    {/* Selling Price */}
                    <td className="p-4 text-left font-black text-slate-900 font-mono text-sm whitespace-nowrap">
                      {p.sellingPrice.toLocaleString('ar-EG')} <span className="text-[10px] text-slate-400 font-sans">ج.م</span>
                    </td>

                    {/* Purchase Cost */}
                    <td className="p-4 text-left font-bold text-amber-900 font-mono text-xs whitespace-nowrap">
                      {p.defaultPurchaseCost.toLocaleString('ar-EG')} <span className="text-[10px] text-amber-700/70 font-sans">ج.م</span>
                    </td>

                    {/* Available Stock Badge */}
                    <td className="p-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap shadow-2xs ${
                        availStock > 0 ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {availStock} قطعة
                      </span>
                    </td>

                    {/* Preferred Supplier */}
                    <td className="p-4 text-slate-700 font-bold text-xs">
                      <span className="truncate block max-w-[180px]">
                        {prefSup ? prefSup.supplierName : 'غير محدد'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedProductId(p.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1C352D] hover:bg-[#142921] text-white font-black text-xs shadow-xs transition-all flex items-center gap-1.5 mx-auto shrink-0 whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#E06F28]" />
                        <span>تفاصيل ومكونات</span>
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredProducts.map(p => (
          <div key={p.id} className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <img src={p.images[0]} alt="" className="w-12 h-12 rounded-2xl object-cover shrink-0" />
              <div>
                <h3 className="font-black text-slate-900 text-sm">{p.name}</h3>
                <p className="text-slate-500 font-mono text-[11px]">{p.code}</p>
              </div>
            </div>

            <div className="flex justify-between items-center font-bold pt-2 border-t border-slate-100">
              <span className="text-slate-500">سعر البيع:</span>
              <span className="text-slate-900 font-mono text-sm">{p.sellingPrice.toLocaleString('ar-EG')} ج.م</span>
            </div>

            <button
              onClick={() => setSelectedProductId(p.id)}
              className="w-full py-2.5 rounded-xl bg-[#1C352D] text-white font-black text-center"
            >
              عرض التكلفة والبدائل 360
            </button>
          </div>
        ))}
      </div>

      {/* Add Product Modal with Supplier Selection */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5">
            <h3 className="text-lg font-black text-slate-900">إضافة منتج جاهز جديد وتحديد المورد</h3>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المنتج *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: ركنة مودرن حرف L كابتونيه"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              {/* SUPPLIER SELECTION FIELD */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">المورد المصنّع / المورد الرئيسي *</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-amber-50 border border-amber-300 rounded-xl font-bold text-amber-950"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.companyName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">كود المنتج *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="SOFA-CORNER-01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">التصنيف *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="sofas">أنتريهات وصالونات</option>
                    <option value="dining">غرف سفرة وطاولات</option>
                    <option value="bedrooms">غرف نوم ماستر</option>
                    <option value="tv_units">طاولات ووحدات تلفزيون</option>
                    <option value="kitchen_ready">مطابخ جاهزة ووحدات</option>
                    <option value="kitchen_acc">إكسسوارات مطابخ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">سعر البيع الافتراضي (ج.م)</label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold dir-ltr text-left"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تكلفت الشراء من المورد (ج.م)</label>
                  <input
                    type="number"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-amber-50 border border-amber-300 rounded-xl font-bold dir-ltr text-left text-amber-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">وصف المنتج والمواصفات</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                ></textarea>
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
                  حفظ المنتج ورابطه بالمورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
