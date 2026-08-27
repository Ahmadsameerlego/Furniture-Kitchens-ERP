import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Product, ProductVariant, Customer, OrderItem } from '../../types/erp';
import { ShoppingBag, Plus, Trash2, Search, DollarSign, Calendar, CheckCircle2, X, AlertCircle, ShieldCheck, UserPlus } from 'lucide-react';
import { CustomerFormModal } from './CustomerFormModal';

interface OrderFormModalProps {
  isOpen: boolean;
  onSave: (orderData: any) => void;
  onClose: () => void;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  onSave,
  onClose
}) => {
  const { customers, products, availableBranches, addCustomer } = useERP();

  // Step state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(availableBranches[0]?.id || 'branch-1');
  const [isQuickCustomerModalOpen, setIsQuickCustomerModalOpen] = useState(false);

  // Line Items state
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitSellingPrice, setUnitSellingPrice] = useState<number>(0);
  const [actualPurchaseCost, setActualPurchaseCost] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Financial & Installments state
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash');
  const [numberOfInstallments, setNumberOfInstallments] = useState<number>(0);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [scheduledDeliveryDate, setScheduledDeliveryDate] = useState<string>(
    new Date(Date.now() + 604800000).toISOString().substring(0, 10)
  );
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedBranch = availableBranches.find(b => b.id === selectedBranchId);
  const currentProduct = products.find(p => p.id === selectedProductId);

  // When product is selected, populate unit selling price & default actual cost
  const handleSelectProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setUnitSellingPrice(prod.sellingPrice);
      setActualPurchaseCost(prod.defaultPurchaseCost);
      if (prod.variants.length > 0) {
        setSelectedVariantId(prod.variants[0].id);
      } else {
        setSelectedVariantId('');
      }
    }
  };

  const handleAddItem = () => {
    if (!currentProduct || quantity <= 0) return;

    const variant = currentProduct.variants.find(v => v.id === selectedVariantId);
    const lineSellingBeforeDisc = unitSellingPrice * quantity;
    const lineSellingNet = Math.max(0, lineSellingBeforeDisc - discountAmount);
    const lineCostTotal = actualPurchaseCost * quantity;
    const itemGrossProfit = lineSellingNet - lineCostTotal;

    // Check stock availability in selected branch
    const locStock = currentProduct.stockByLocation.find(l => l.branchId === selectedBranchId);
    const avail = locStock ? locStock.available : 0;
    let stockAvailability: OrderItem['stockAvailability'] = 'available';

    if (avail === 0) {
      stockAvailability = 'out_of_stock';
    } else if (avail < quantity) {
      stockAvailability = 'partially_available';
    }

    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      productId: currentProduct.id,
      productName: currentProduct.name,
      productCode: currentProduct.code,
      variantId: variant?.id,
      variantName: variant?.name,
      quantity,
      unitSellingPrice,
      actualPurchaseCost, // SECTION 6 & SECTION 19: HISTORICAL COST PRESERVED!
      discountAmount,
      totalSellingPrice: lineSellingNet,
      totalPurchaseCost: lineCostTotal,
      itemGrossProfit,
      stockAvailability
    };

    setItems(prev => [...prev, newItem]);

    // Reset line input
    setSelectedProductId('');
    setSelectedVariantId('');
    setQuantity(1);
    setUnitSellingPrice(0);
    setActualPurchaseCost(0);
    setDiscountAmount(0);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  // Calculate Order Financial Summary
  let orderSubtotal = 0;
  let orderTotalDiscount = 0;
  let orderTotalPurchaseCost = 0;

  items.forEach(i => {
    orderSubtotal += i.unitSellingPrice * i.quantity;
    orderTotalDiscount += i.discountAmount;
    orderTotalPurchaseCost += i.totalPurchaseCost;
  });

  const orderTotalSelling = orderSubtotal - orderTotalDiscount;
  const orderGrossProfit = orderTotalSelling - orderTotalPurchaseCost;
  const remainingAfterDeposit = Math.max(0, orderTotalSelling - depositAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || items.length === 0) return;

    onSave({
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.fullName,
      customerPhone: selectedCustomer?.phone,
      branchId: selectedBranchId,
      branchName: selectedBranch?.name || 'المعرض الرئيسي',
      items,
      depositAmount: Number(depositAmount),
      paymentMethod,
      numberOfInstallments: Number(numberOfInstallments),
      deliveryAddress: deliveryAddress || selectedCustomer?.address || `${selectedCustomer?.city} — ${selectedCustomer?.area}`,
      city: selectedCustomer?.city || 'القاهرة',
      area: selectedCustomer?.area || 'التجمع',
      scheduledDeliveryDate,
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5 relative max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E06F28]/15 text-[#E06F28] flex items-center justify-center font-bold border border-[#E06F28]/30">
              <ShoppingBag className="w-5 h-5 text-[#E06F28]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                إنشاء طلب مبيعات أثاث جاهز جديد (Ready Order)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تحديد العميل، حجز المخزون، تأكيد التكلفة الفعلية، وحساب هامش الربح
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          
          {/* Section 8: Customer & Branch Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">اختيار العميل *</label>
                <button
                  type="button"
                  onClick={() => setIsQuickCustomerModalOpen(true)}
                  className="text-[#E06F28] font-bold text-[11px] hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ عميل جديد سريع</span>
                </button>
              </div>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.phone}) — {c.branchName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">فرع البيع ومصدر المخزون *</label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
              >
                {availableBranches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 8 & Section 19: Product Item Picker & Cost Preserver */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <h4 className="font-black text-slate-900 text-sm flex items-center justify-between">
              <span>إضافة المنتجات والقطع للطلب</span>
              <span className="text-xs font-normal text-slate-500">حفظ تكلفة الشراء الفعلية للتأكد من ربحية الصفقة</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
              
              {/* Product */}
              <div className="lg:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">المنتج *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="">اختر المنتج...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>

              {/* Variant */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">المواصفات/النوع</label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  disabled={!currentProduct || currentProduct.variants.length === 0}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 disabled:opacity-50"
                >
                  <option value="">بدون اختيار</option>
                  {currentProduct?.variants.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">الكمية *</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center font-bold text-slate-900"
                />
              </div>

              {/* Selling Price */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">سعر البيع (ج.م)</label>
                <input
                  type="number"
                  value={unitSellingPrice}
                  onChange={(e) => setUnitSellingPrice(Number(e.target.value))}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-left font-bold text-slate-900 font-mono"
                  dir="ltr"
                />
              </div>

              {/* Actual Purchase Cost */}
              <div>
                <label className="block font-bold text-amber-800 mb-1">التكلفة الفعلية (ج.م)</label>
                <input
                  type="number"
                  value={actualPurchaseCost}
                  onChange={(e) => setActualPurchaseCost(Number(e.target.value))}
                  className="w-full px-2 py-2 bg-amber-50 border border-amber-300 rounded-xl text-left font-bold text-amber-900 font-mono"
                  dir="ltr"
                />
              </div>

            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={handleAddItem}
                disabled={!selectedProductId || quantity <= 0}
                className="px-4 py-2 bg-[#1C352D] hover:bg-[#142921] text-white font-black text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-[#E06F28]" />
                <span>إضافة الصنف لجدول الطلب</span>
              </button>
            </div>
          </div>

          {/* Table of Added Line Items */}
          {items.length > 0 && (
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3">المنتج والمواصفة</th>
                    <th className="p-3 text-center">الكمية</th>
                    <th className="p-3 text-left">سعر البيع للقطعة</th>
                    <th className="p-3 text-left">التكلفة الفعلية</th>
                    <th className="p-3 text-left">إجمالي البيع</th>
                    <th className="p-3 text-left">هامش الربح</th>
                    <th className="p-3 text-center">حالة المخزون</th>
                    <th className="p-3 text-center">حذف</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-black text-slate-900">{item.productName}</p>
                        {item.variantName && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                            {item.variantName}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-900">{item.quantity}</td>
                      <td className="p-3 text-left font-mono">{item.unitSellingPrice.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3 text-left font-mono text-amber-800">{item.actualPurchaseCost.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3 text-left font-bold text-slate-900 font-mono">{item.totalSellingPrice.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3 text-left font-black text-emerald-700 font-mono">
                        +{item.itemGrossProfit.toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="p-3 text-center">
                        {item.stockAvailability === 'available' && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">متاح بالمخزن</span>
                        )}
                        {item.stockAvailability === 'partially_available' && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">متاح جزئياً</span>
                        )}
                        {item.stockAvailability === 'out_of_stock' && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold">غير متاح</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 13 & Section 19: Financial Profitability Summary & Deposit / Installment setup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Financial Summary Card */}
            <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-3 shadow-inner">
              <h4 className="font-black text-emerald-200 text-xs flex items-center justify-between border-b border-emerald-900 pb-2">
                <span>الملخص المالي وهامش الأرباح المحسوب</span>
                <ShieldCheck className="w-4 h-4 text-[#E06F28]" />
              </h4>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-200/80">إجمالي قيمة البيع (Revenue):</span>
                  <span className="font-black text-white text-sm">{orderTotalSelling.toLocaleString('ar-EG')} ج.م</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-emerald-200/80">إجمالي التكلفة الفعلية (Total Cost):</span>
                  <span className="font-bold text-amber-300">{orderTotalPurchaseCost.toLocaleString('ar-EG')} ج.م</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-emerald-900">
                  <span className="font-bold text-white">إجمالي مجمل الربح (Gross Profit):</span>
                  <span className="font-black text-[#E06F28] text-base">
                    +{orderGrossProfit.toLocaleString('ar-EG')} ج.m
                  </span>
                </div>
              </div>
            </div>

            {/* Payment & Installment Setup */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-black text-slate-900 text-xs border-b border-slate-200 pb-2">
                سداد العربون وخطة الأقساط المتبقية
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مبلغ العربون المدفوع</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 dir-ltr text-left"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">طريقة السداد</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value="cash">نقداً (Cash)</option>
                    <option value="card">بطاقة ائتمان (Card)</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">عدد الأقساط المتبقية</label>
                  <select
                    value={numberOfInstallments}
                    onChange={(e) => setNumberOfInstallments(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value={0}>بدون أقساط (سداد كامل/عربون فقط)</option>
                    <option value={2}>2 أقساط شهرية</option>
                    <option value={3}>3 أقساط شهرية</option>
                    <option value={4}>4 أقساط شهرية</option>
                    <option value={5}>5 أقساط شهرية</option>
                    <option value={6}>6 أقساط شهرية</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المتبقي المطلوب سداده</label>
                  <input
                    type="text"
                    disabled
                    value={`${remainingAfterDeposit.toLocaleString('ar-EG')} ج.م`}
                    className="w-full px-2.5 py-2 bg-slate-200 border border-slate-300 rounded-xl font-black text-rose-700 text-center"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Section 17: Scheduled Delivery Date & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">تاريخ الاستلام المجدول المتوقع</label>
              <input
                type="date"
                value={scheduledDeliveryDate}
                onChange={(e) => setScheduledDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">عنوان التسليم والتوصيل</label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="العنوان التفصيلي بالتحديد للعميل..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={items.length === 0}
              className="px-6 py-2.5 rounded-xl bg-[#1C352D] hover:bg-[#142921] text-white font-black shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#E06F28]" />
              <span>تأكيد الطلب وحجز المخزون الآن</span>
            </button>
          </div>

        </form>

        {/* Quick Customer Creation Modal */}
        <CustomerFormModal
          isOpen={isQuickCustomerModalOpen}
          onSave={(cData) => {
            const newCust = addCustomer(cData);
            setSelectedCustomerId(newCust.id);
            setIsQuickCustomerModalOpen(false);
          }}
          onClose={() => setIsQuickCustomerModalOpen(false)}
        />

      </div>
    </div>
  );
};
