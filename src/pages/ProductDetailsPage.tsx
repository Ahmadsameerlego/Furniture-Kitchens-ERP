import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Product } from '../types/erp';
import {
  ArrowRight,
  Package,
  Boxes,
  DollarSign,
  Truck,
  History,
  Building,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface ProductDetailsPageProps {
  productId: string;
  onBack: () => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ productId, onBack }) => {
  const { products, orders } = useERP();
  const product = products.find(p => p.id === productId);

  const [activeTab, setActiveTab] = useState<'overview' | 'variants' | 'suppliers' | 'inventory' | 'sales_history'>('overview');

  if (!product) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
        <p className="text-slate-500 font-bold text-sm">عفواً، لم يتم العثور على المنتج المطلوب</p>
        <button onClick={onBack} className="px-4 py-2 bg-[#1C352D] text-white text-xs font-bold rounded-xl">
          العودة لقائمة المنتجات
        </button>
      </div>
    );
  }

  // Calculate total stock across all locations
  let totalOnHand = 0;
  let totalReserved = 0;
  let totalAvailable = 0;
  let totalDelivered = 0;

  product.stockByLocation.forEach(loc => {
    totalOnHand += loc.onHand;
    totalReserved += loc.reserved;
    totalAvailable += loc.available;
    totalDelivered += loc.delivered;
  });

  // Filter orders containing this product
  const productOrders = orders.filter(o => o.items.some(i => i.productId === product.id));

  return (
    <div className="space-y-6">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-xs transition-all"
        >
          <ArrowRight className="w-4 h-4 text-[#1C352D]" />
          <span>العودة لكتالوج المنتجات</span>
        </button>

        <span className="text-xs text-slate-500 font-mono font-bold">كود المنتج: {product.code}</span>
      </div>

      {/* Product Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-start gap-5">
            <img
              src={product.images[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600'}
              alt=""
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-[#1C352D]/15 shadow-md shrink-0"
            />

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-900">{product.name}</h1>
                <span className="bg-[#E06F28]/15 text-[#E06F28] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E06F28]/30">
                  {product.categoryName}
                </span>
              </div>

              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">{product.description}</p>

              <div className="flex items-center gap-4 text-xs pt-1 font-bold">
                <span className="text-slate-400">كود الـ SKU: <strong className="text-slate-900 font-mono">{product.sku}</strong></span>
                <span className="text-slate-400">الموديل: <strong className="text-slate-900">{product.model}</strong></span>
              </div>
            </div>
          </div>

          {/* Pricing & Stock Card */}
          <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-2 text-xs min-w-[240px] shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-emerald-200 font-bold">سعر البيع الافتراضي:</span>
              <span className="font-black text-white text-base font-mono">{product.sellingPrice.toLocaleString('ar-EG')} ج.م</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-emerald-900">
              <span className="text-emerald-200 font-bold">التكلفة الافتراضية:</span>
              <span className="font-bold text-amber-300 font-mono">{product.defaultPurchaseCost.toLocaleString('ar-EG')} ج.م</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-emerald-900 text-[11px]">
              <span className="text-emerald-200">المخزون المتاح حالياً:</span>
              <span className="font-black text-amber-400 text-sm">{totalAvailable} قطعة</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-1 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all ${
            activeTab === 'overview' ? 'bg-[#1C352D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          نظرة عامة (Overview)
        </button>

        <button
          onClick={() => setActiveTab('variants')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'variants' ? 'bg-[#1C352D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>المواصفات والأنواع (Variants)</span>
          <span className="bg-white/20 text-xs px-2 py-0.2 rounded-full">{product.variants.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'suppliers' ? 'bg-[#1C352D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>الموردون وأسعار الشراء (Suppliers)</span>
          <span className="bg-[#E06F28] text-white text-[10px] px-2 py-0.2 rounded-full">{product.suppliers.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all ${
            activeTab === 'inventory' ? 'bg-[#1C352D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          المخزون بجميع الفروع ({totalOnHand} قطعة)
        </button>

        <button
          onClick={() => setActiveTab('sales_history')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all ${
            activeTab === 'sales_history' ? 'bg-[#1C352D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          سجل المبيعات والأرباح ({productOrders.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100">
                مواصفات المنتج الأساسية
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">اسم المنتج:</span>
                  <span className="font-black text-slate-900">{product.name}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block">الفئة والتصنيف:</span>
                  <span className="font-black text-[#E06F28]">{product.categoryName}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block">سعر البيع الحالي:</span>
                  <span className="font-black text-slate-900 font-mono">{product.sellingPrice.toLocaleString('ar-EG')} ج.م</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block">التكلفة الافتراضية للشراء:</span>
                  <span className="font-bold text-amber-800 font-mono">{product.defaultPurchaseCost.toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">
                ملخص المخزون العام
              </h3>

              <div className="space-y-2 text-xs font-bold">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500">المخزون الموجود فعلياً:</span>
                  <span className="text-slate-900 font-black">{totalOnHand} قطعة</span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900">
                  <span>الكمية المحجوزة للطلبات:</span>
                  <span className="font-black">{totalReserved} قطعة</span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900">
                  <span>الكمية المتاحة للبيع الآن:</span>
                  <span className="font-black text-sm">{totalAvailable} قطعة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Variants */}
      {activeTab === 'variants' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100">
            مواصفات وأنواع المنتج المسجلة (Product Variants)
          </h3>

          {product.variants.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">لا توجد أنواع محددة مسبقاً لهذا المنتج</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {product.variants.map(v => (
                <div key={v.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <p className="font-black text-slate-900">{v.name}</p>
                  {v.color && <p className="text-slate-500">اللون: <strong className="text-slate-800">{v.color}</strong></p>}
                  {v.fabric && <p className="text-slate-500">نوع القماش: <strong className="text-slate-800">{v.fabric}</strong></p>}
                  <p className="text-[10px] text-slate-400 font-mono pt-1">SKU: {v.sku}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Suppliers Breakdown (Section 5 & Section 20) */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">سجل أسعار الشراء من الموردين المعتمدين</h3>
              <p className="text-xs text-slate-500">يمكن شراء هذا المنتج من عدة موردين بأسعار شراء مختلفة</p>
            </div>
          </div>

          <div className="space-y-3">
            {product.suppliers.map(sup => (
              <div
                key={sup.supplierId}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 text-xs ${
                  sup.isPreferred ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#1C352D]" />
                    <span className="font-black text-slate-900 text-sm">{sup.supplierName}</span>
                    {sup.isPreferred && (
                      <span className="bg-amber-200 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                        المورد المفضل الرئيسي
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">تاريخ آخر توريد: {sup.lastPurchaseDate}</p>
                </div>

                <div className="text-left font-mono">
                  <span className="text-slate-400 text-[10px] block">تكلفة الشراء:</span>
                  <span className="font-black text-amber-900 text-base">{sup.purchaseCost.toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Inventory by Location (Section 7) */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
            توزيع المخزون بحسب الفروع والمخازن
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {product.stockByLocation.map(loc => (
              <div key={loc.branchId} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                  <Building className="w-4 h-4 text-[#1C352D]" />
                  <span>{loc.branchName}</span>
                </div>

                <div className="space-y-1.5 font-bold pt-2 border-t border-slate-200/80">
                  <div className="flex justify-between text-slate-600">
                    <span>الموجود (On Hand):</span>
                    <span className="text-slate-900 font-mono">{loc.onHand}</span>
                  </div>

                  <div className="flex justify-between text-amber-800">
                    <span>المحجوز (Reserved):</span>
                    <span className="font-mono">{loc.reserved}</span>
                  </div>

                  <div className="flex justify-between text-emerald-800 font-black">
                    <span>المتاح للبيع (Available):</span>
                    <span className="font-mono text-sm">{loc.available}</span>
                  </div>

                  <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200/60 text-[11px]">
                    <span>إجمالي المسلم للعملاء:</span>
                    <span className="font-mono">{loc.delivered}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Sales History with Actual Costs */}
      {activeTab === 'sales_history' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
            سجل مبيعات المنتج وأرباح العمليات (Sales History & Actual Profitability)
          </h3>

          {productOrders.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">لم يتم بيع هذا المنتج في أي طلبات بعد</p>
          ) : (
            <div className="space-y-3">
              {productOrders.map(ord => {
                const item = ord.items.find(i => i.productId === product.id);
                if (!item) return null;

                return (
                  <div key={ord.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">{ord.orderNumber}</span>
                        <span className="text-slate-500 font-bold">— {ord.customerName}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">تاريخ الطلب: {ord.createdDate}</p>
                    </div>

                    <div className="flex items-center gap-6 font-mono text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block">تكلفة الشراء الفعلية:</span>
                        <span className="font-bold text-amber-900">{item.actualPurchaseCost.toLocaleString('ar-EG')} ج.م</span>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[10px] block">سعر البيع:</span>
                        <span className="font-bold text-slate-900">{item.unitSellingPrice.toLocaleString('ar-EG')} ج.م</span>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[10px] block">ربح العملية:</span>
                        <span className="font-black text-emerald-700">+{item.itemGrossProfit.toLocaleString('ar-EG')} ج.م</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
