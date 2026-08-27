import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Supplier, SupplierPaymentRecord } from '../types/erp';
import {
  ArrowRight,
  Truck,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Package,
  FileText,
  Star,
  CheckCircle2,
  Plus,
  Building,
  Eye,
  Calendar,
  X
} from 'lucide-react';

interface SupplierDetailsPageProps {
  supplierId: string;
  onBack: () => void;
}

export const SupplierDetailsPage: React.FC<SupplierDetailsPageProps> = ({ supplierId, onBack }) => {
  const {
    suppliers,
    products,
    supplierInvoices,
    supplierPayments,
    recordSupplierPayment,
    setSelectedProductId,
    setActiveModule
  } = useERP();

  const supplier = suppliers.find(s => s.id === supplierId);

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'invoices' | 'payments'>('overview');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Payment Form State
  const [amount, setAmount] = useState<number>(10000);
  const [paymentMethod, setPaymentMethod] = useState<SupplierPaymentRecord['paymentMethod']>('bank_transfer');
  const [referenceNumber, setReferenceNumber] = useState<string>(`TRF-${Date.now().toString().substring(7)}`);
  const [notes, setNotes] = useState<string>('');

  if (!supplier) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
        <p className="text-slate-500 font-bold text-sm">عفواً، لم يتم العثور على المورد المطلوب</p>
        <button onClick={onBack} className="px-4 py-2 bg-[#1C352D] text-white text-xs font-bold rounded-xl">
          العودة لقائمة الموردين
        </button>
      </div>
    );
  }

  // Filter products supplied by this supplier
  const suppliedProducts = products.filter(p => p.suppliers.some(s => s.supplierId === supplier.id));
  const invoices = supplierInvoices.filter(i => i.supplierId === supplier.id);
  const payments = supplierPayments.filter(p => p.supplierId === supplier.id);

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    recordSupplierPayment(supplier.id, amount, paymentMethod, referenceNumber, notes);
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-xs transition-all"
        >
          <ArrowRight className="w-4 h-4 text-[#1C352D]" />
          <span>العودة لقائمة الموردين</span>
        </button>

        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5"
        >
          <DollarSign className="w-4 h-4" />
          <span>تسديد دفعة حساب للمورد</span>
        </button>
      </div>

      {/* Supplier Header 360 Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1C352D] text-[#E06F28] flex items-center justify-center font-bold shadow-md">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900">{supplier.name}</h1>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(supplier.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-bold">{supplier.companyName} — {supplier.specialty}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600 font-medium flex-wrap pt-1">
              <span className="flex items-center gap-1 font-mono text-slate-900 font-bold" dir="ltr">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {supplier.phone}
              </span>

              {supplier.email && (
                <span className="flex items-center gap-1 font-mono text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {supplier.email}
                </span>
              )}

              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {supplier.address} ({supplier.city})
              </span>
            </div>
          </div>

          {/* Financial Breakdown Card */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs min-w-[260px] shrink-0 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold">إجمالي المشتريات:</span>
              <span className="font-black text-white text-base font-mono">{supplier.totalPurchases.toLocaleString('ar-EG')} ج.م</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="text-slate-400 font-bold">إجمالي المسدد للمورد:</span>
              <span className="font-bold text-emerald-400 font-mono">{supplier.totalPaid.toLocaleString('ar-EG')} ج.م</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="font-bold text-rose-300">المستحق غير المسدد:</span>
              <span className="font-black text-rose-400 text-base font-mono">
                {supplier.balanceDue.toLocaleString('ar-EG')} ج.م
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-1 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all ${
            activeTab === 'overview' ? 'bg-[#1C352D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          نظرة عامة وشروط السداد
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'products' ? 'bg-[#1C352D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>المنتجات الموردة من هذا المورد</span>
          <span className="bg-white/20 text-xs px-2 py-0.2 rounded-full">{suppliedProducts.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'invoices' ? 'bg-[#1C352D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>فواتير الشراء والتوريد</span>
          <span className="bg-[#E06F28] text-white text-[10px] px-2 py-0.2 rounded-full">{invoices.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'payments' ? 'bg-[#1C352D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>سجل سداد المدفوعات ({payments.length})</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100">
            بيانات وشروط تعامل المورد
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 font-bold block">شروط الدفع والسداد:</span>
              <span className="font-black text-slate-900 text-sm">{supplier.paymentTerms}</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold block">التخصص الرئيسي:</span>
              <span className="font-bold text-[#E06F28]">{supplier.specialty}</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold block">العنوان:</span>
              <span className="font-bold text-slate-800">{supplier.address} ({supplier.city})</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold block">تاريخ بدء التعامل:</span>
              <span className="font-bold text-slate-800 font-mono">{supplier.createdDate}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Products Supplied */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900">المنتجات المسجلة باسم المورد ({suppliedProducts.length})</h3>
            <span className="text-xs text-slate-500">المنتجات والتأثير المالي وتكلفة التوريد</span>
          </div>

          {suppliedProducts.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">لا توجد منتجات مسجلة بهذا المورد حتى الآن</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {suppliedProducts.map(p => {
                const supCostObj = p.suppliers.find(s => s.supplierId === supplier.id);

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProductId(p.id);
                      setActiveModule('products');
                    }}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#1C352D] cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <p className="font-black text-slate-900">{p.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{p.code}</p>
                        </div>
                      </div>

                      <span className="bg-[#1C352D] text-white text-[11px] font-bold px-2.5 py-1 rounded-xl">
                        عرض المنتج 360
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-slate-700 font-bold text-[11px]">
                      <span>تكلفة الشراء من المورد: <strong className="text-amber-800 font-mono text-xs">{supCostObj?.purchaseCost.toLocaleString('ar-EG')} ج.م</strong></span>
                      <span>سعر البيع بالمعرض: <strong className="text-slate-900 font-mono text-xs">{p.sellingPrice.toLocaleString('ar-EG')} ج.م</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Purchase Invoices */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
            فواتير التوريد والشراء من المورد
          </h3>

          {invoices.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">لا توجد فواتير توريد مسجلة للمورد حالياً</p>
          ) : (
            <div className="space-y-3 text-xs">
              {invoices.map(inv => (
                <div key={inv.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-black text-slate-900">
                      <FileText className="w-4 h-4 text-[#E06F28]" />
                      <span>فاتورة رقم: {inv.invoiceNumber}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{inv.date}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 font-bold">
                    <span>إجمالي الفاتورة: <strong className="text-slate-900 font-mono">{inv.totalAmount.toLocaleString('ar-EG')} ج.م</strong></span>
                    <span>المسدد: <strong className="text-emerald-700 font-mono">{inv.paidAmount.toLocaleString('ar-EG')} ج.م</strong></span>
                    <span>المتبقي: <strong className="text-rose-700 font-mono">{inv.balanceDue.toLocaleString('ar-EG')} ج.م</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Payments History */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900">سجل المدفوعات والتحويلات للمورد</h3>
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              + تسديد دفعة جديدة
            </button>
          </div>

          {payments.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">لا توجد عمليات سداد مسجلة لهذا المورد بعد</p>
          ) : (
            <div className="space-y-2 text-xs">
              {payments.map(p => (
                <div key={p.id} className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-black text-slate-900">دفعة سداد حساب المورد</p>
                    <p className="text-[10px] text-slate-500">
                      طريقة الدفع: {p.paymentMethod} | المرجع: {p.referenceNumber} | بواسطة: {p.processedByUserName}
                    </p>
                  </div>

                  <div className="text-left font-mono">
                    <span className="font-black text-emerald-800 text-sm">{p.amount.toLocaleString('ar-EG')} ج.م</span>
                    <span className="text-[10px] text-slate-400 block">{p.paymentDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Supplier Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">تسديد دفعة حساب للمورد</h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex justify-between font-bold text-rose-900">
                <span>المتبقي المستحق للمورد:</span>
                <span className="font-mono text-sm">{supplier.balanceDue.toLocaleString('ar-EG')} ج.م</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المبلغ المراد سداده (ج.م) *</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold dir-ltr text-left"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">طريقة السداد *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="cash">نقداً من الخزينة (Cash)</option>
                  <option value="check">شيك بنكي</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم المرجع / التحويل البنكي</label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono dir-ltr text-left"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات (اختياري)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-black rounded-xl"
                >
                  تأكيد تسديد الدفعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
