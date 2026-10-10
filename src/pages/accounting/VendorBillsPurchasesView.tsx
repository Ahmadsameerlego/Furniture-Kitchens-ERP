// ====================================================
// REWAQ ERP — VENDOR BILLS & PURCHASES ACCOUNTING VIEW
// Accounts Payable (AP 2111), GR/IR Clearing (213) & WHT 1%
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { VendorBill } from '../../types/accounting';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Building2,
  DollarSign,
  Printer,
  Calendar,
  Layers,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

export const VendorBillsPurchasesView: React.FC = () => {
  const {
    vendorBills,
    suppliers,
    createVendorBill,
    recordVendorBillPayment,
    showToast,
    setActiveModule
  } = useERP();

  const [activeSubTab, setActiveSubTab] = useState<'bills' | 'grir'>('bills');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showNewBillModal, setShowNewBillModal] = useState<boolean>(false);
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [selectedBillForPay, setSelectedBillForPay] = useState<VendorBill | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'cash' | 'bank_transfer' | 'check'>('bank_transfer');

  // Vendor Bill Form
  const [billSupplierId, setBillSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [billType, setBillType] = useState<'stock_purchase' | 'direct_expense' | 'asset_purchase'>('stock_purchase');
  const [billSubtotal, setBillSubtotal] = useState<number>(75000);
  const [billTaxRate, setBillTaxRate] = useState<number>(14);
  const [billWhtRate, setBillWhtRate] = useState<number>(1);
  const [billVendorInvNo, setBillVendorInvNo] = useState<string>('INV-SUP-8820');
  const [billNotes, setBillNotes] = useState<string>('فاتورة توريد خشب زان وكونتر طبيعي');

  // KPIs
  const totalBillsAmount = vendorBills.reduce((s, b) => s + b.totalAmount, 0);
  const totalPayableDue = vendorBills.reduce((s, b) => s + b.balanceDue, 0);
  const totalPaid = vendorBills.reduce((s, b) => s + b.paidAmount, 0);

  // Submit Bill
  const handleCreateBill = () => {
    if (!billSupplierId || billSubtotal <= 0) {
      showToast('يرجى اختيار المورد وتحديد قيمة الفاتورة', 'warning');
      return;
    }

    const bill = createVendorBill({
      supplierId: billSupplierId,
      billType,
      vendorInvoiceNumber: billVendorInvNo,
      date: new Date().toISOString().substring(0, 10),
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
      subtotal: Number(billSubtotal),
      taxAmount: Math.round(Number(billSubtotal) * (Number(billTaxRate) / 100)),
      withholdingTaxRate: Number(billWhtRate),
      withholdingTaxAmount: Math.round(Number(billSubtotal) * (Number(billWhtRate) / 100)),
      notes: billNotes
    });

    if (bill) {
      setShowNewBillModal(false);
      showToast(`تم إنشاء وترحيل فاتورة المورد (${bill.billNumber}) مع تسوية القيود المحاسبية بنجاح`, 'success');
    }
  };

  // Open Pay Modal
  const handleOpenPayModal = (bill: VendorBill) => {
    setSelectedBillForPay(bill);
    setPayAmount(bill.balanceDue);
    setShowPayModal(true);
  };

  // Submit Payment
  const handleRecordPayment = () => {
    if (!selectedBillForPay || payAmount <= 0) return;

    const accId = payMethod === 'cash' ? 'acc-11111' : (payMethod === 'check' ? 'acc-2112' : 'acc-11121');

    recordVendorBillPayment(
      selectedBillForPay.id,
      payAmount,
      payMethod,
      accId,
      selectedBillForPay.withholdingTaxRate || 1,
      'سداد دفعة من فاتورة المورد'
    );
    setShowPayModal(false);
    showToast(`تم سداد مبلغ ${payAmount.toLocaleString()} EGP للمورد (${selectedBillForPay.supplierName}) بنجاح`, 'success');
  };

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Receipt className="w-3.5 h-3.5" />
            <span>المشتريات والموردين — AP, GR/IR Clearing & WHT Tax 1%</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <Receipt className="w-8 h-8 text-[#C87A38]" />
            <span>فواتير المشتريات ومطابقة المخزون (GR/IR)</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            إثبات فواتير الموردين، تسوية الحساب الوسيط للبضاعة الواردة (GR/IR 213)، واحتساب ضريبة القيمة المضافة 14% وخصم أرباح تجارية وصناعية (WHT 1%).
          </p>
        </div>

        <button
          onClick={() => setShowNewBillModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C87A38] hover:bg-amber-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إثبات فاتورة مورد جديدة</span>
        </button>
      </div>

      {/* 2. KPI SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">إجمالي المشتريات المسجلة</span>
          <div className="text-2xl font-black font-mono text-slate-900">
            {totalBillsAmount.toLocaleString()} <span className="text-xs font-bold text-slate-400">EGP</span>
          </div>
          <div className="text-[11px] text-slate-400 font-bold">صافي مستحقات الموردين بعد الضرائب</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">التزامات واجبة السداد للموردين (AP)</span>
          <div className="text-2xl font-black font-mono text-rose-600">
            {totalPayableDue.toLocaleString()} <span className="text-xs font-bold text-slate-400">EGP</span>
          </div>
          <div className="text-[11px] text-rose-500 font-bold">مديونيات قائمة تستحق خلال 30 يوماً</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">المسدد للموردين</span>
          <div className="text-2xl font-black font-mono text-emerald-700">
            {totalPaid.toLocaleString()} <span className="text-xs font-bold text-slate-400">EGP</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold">تم سداده بنكياً أو نقداً</div>
        </div>
      </div>

      {/* 3. TOOLBAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('bills')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeSubTab === 'bills'
                ? 'bg-[#361D13] text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            فواتير الموردين ({vendorBills.length})
          </button>

          <button
            onClick={() => setActiveSubTab('grir')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeSubTab === 'grir'
                ? 'bg-amber-700 text-white shadow-md'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            مطابقة GR/IR الوسيط (213)
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الفاتورة أو اسم المورد..."
            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
          />
        </div>
      </div>

      {/* 4. TABLE CONTENT */}
      {activeSubTab === 'bills' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80">
                  <th className="py-3.5 px-2 min-w-[90px]">رقم الفاتورة بالنظام</th>
                  <th className="py-3.5 px-2 min-w-[70px]">فاتورة المورد #</th>
                  <th className="py-3.5 px-2 min-w-[110px]">المورد</th>
                  <th className="py-3.5 px-2 min-w-[90px]">النوع والتوجيه</th>
                  <th className="py-3.5 px-2 min-w-[70px] text-left">المبلغ الأساسي</th>
                  <th className="py-3.5 px-2 min-w-[70px] text-left">ضريبة VAT 14%</th>
                  <th className="py-3.5 px-2 min-w-[70px] text-left">خصم منبع WHT 1%</th>
                  <th className="py-3.5 px-2 min-w-[70px] text-left">صافي المستحق</th>
                  <th className="py-3.5 px-2 min-w-[70px] text-left">المتبقي (AP)</th>
                  <th className="py-3.5 px-2 min-w-[70px] text-center">الحالة</th>
                  <th className="py-3.5 px-2 min-w-[70px] text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {vendorBills
                  .filter(b =>
                    !searchQuery ||
                    b.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    b.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (b.vendorInvoiceNumber && b.vendorInvoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-2 font-bold text-slate-900 whitespace-nowrap">{b.billNumber}</td>
                      <td className="py-3.5 px-2 text-slate-600 font-bold whitespace-nowrap">{b.vendorInvoiceNumber || '-'}</td>
                      <td className="py-3.5 px-2 font-sans font-bold text-slate-800">{b.supplierName}</td>
                      <td className="py-3.5 px-2 font-sans text-[11px]">
                        <span className="inline-block px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold leading-snug">
                          {b.billType === 'stock_purchase' && 'مخزون (GR/IR 213)'}
                          {b.billType === 'direct_expense' && 'مصروف ورش مباشر'}
                          {b.billType === 'asset_purchase' && 'أصل ثابت'}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-left text-slate-700 whitespace-nowrap">{b.subtotal.toLocaleString()} EGP</td>
                      <td className="py-3.5 px-2 text-left text-slate-500 whitespace-nowrap">+{b.taxAmount.toLocaleString()}</td>
                      <td className="py-3.5 px-2 text-left text-rose-600 font-bold whitespace-nowrap">-{b.withholdingTaxAmount.toLocaleString()}</td>
                      <td className="py-3.5 px-2 text-left font-black text-slate-900 whitespace-nowrap">{b.netPayableAmount.toLocaleString()} EGP</td>
                      <td className="py-3.5 px-2 text-left font-black text-rose-600 whitespace-nowrap">{b.balanceDue.toLocaleString()} EGP</td>
                      <td className="py-3.5 px-2 text-center font-sans">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black shadow-2xs whitespace-nowrap ${
                          b.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          b.status === 'partially_paid' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {b.status === 'paid' && 'مسددة بالكامل'}
                          {b.status === 'partially_paid' && 'مسددة جزئياً'}
                          {b.status === 'posted' && 'مستحقة السداد'}
                          {b.status === 'draft' && 'مسودة'}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center font-sans">
                        {b.balanceDue > 0 && (
                          <button
                            onClick={() => handleOpenPayModal(b)}
                            className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[11px] font-bold border border-emerald-200 shadow-2xs whitespace-nowrap"
                          >
                            سداد دفعة
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GR/IR EXPLANATION & STATUS */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-3 text-amber-800 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-6 h-6 text-[#C87A38]" />
            <h3 className="font-black text-base text-slate-900">آلية عمل حساب وسيط البضاعة الواردة (GR/IR Interim Clearing 213)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-black text-sm text-slate-900 block">1. عند استلام الخامات بالمخزن (Goods Receipt):</span>
              <p className="text-slate-600 leading-relaxed">
                يتم إثبات دخول الخشب، الإكسسوارات، أو المفصلات إلى المخزون (حساب 1131) مقابل جعل حساب وسيط البضاعة الواردة (213) دائناً بقيمة أمر الشراء المتوقعة.
              </p>
              <div className="font-mono text-[11px] p-2 bg-white rounded-xl border border-slate-200">
                Dr: مخزون خامات أولية (1131)
                <br />
                Cr: وسيط بضاعة واردة غير مفوترة (213)
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
              <span className="font-black text-sm text-amber-900 block">2. عند استلام فاتورة المورد النهائية (Vendor Bill):</span>
              <p className="text-amber-800 leading-relaxed">
                يتم إقفال حساب وسيط البضاعة الواردة (213) بجعله مديناً، وإثبات ضريبة القيمة المضافة وخصم المنبع، ونقل الالتزام النهائي إلى حساب الموردين (2111).
              </p>
              <div className="font-mono text-[11px] p-2 bg-white rounded-xl border border-amber-200">
                Dr: وسيط بضاعة واردة غير مفوترة (213)
                <br />
                Dr: ضريبة مدخلات مشتريات 14% (1141)
                <br />
                Cr: ضريبة خصم منبع 1% (2142)
                <br />
                Cr: الموردين وأوراق الدفع (2111)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: CREATE VENDOR BILL */}
      {showNewBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-6 h-6 text-[#C87A38]" />
                <h3 className="font-black text-lg text-slate-900">إثبات فاتورة مورد جديدة</h3>
              </div>
              <button onClick={() => setShowNewBillModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-rose-50 flex items-center justify-center">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">المورد الشريك:</label>
                <select
                  value={billSupplierId}
                  onChange={(e) => setBillSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name || s.companyName} ({s.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">رقم فاتورة المورد الورقية:</label>
                  <input
                    type="text"
                    value={billVendorInvNo}
                    onChange={(e) => setBillVendorInvNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">توجيه ونوع الفاتورة:</label>
                  <select
                    value={billType}
                    onChange={(e) => setBillType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="stock_purchase">شراء خامات مخزنية (إقفال GR/IR 213)</option>
                    <option value="direct_expense">مصروف ورشة وتصنيع مباشر</option>
                    <option value="asset_purchase">شراء ماكينة أو أصل ثابت</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">المبلغ الأساسي:</label>
                  <input
                    type="number"
                    value={billSubtotal}
                    onChange={(e) => setBillSubtotal(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-left"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">ضريبة VAT:</label>
                  <select
                    value={billTaxRate}
                    onChange={(e) => setBillTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value={14}>14% VAT</option>
                    <option value={0}>0%</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">خصم منبع WHT:</label>
                  <select
                    value={billWhtRate}
                    onChange={(e) => setBillWhtRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value={1}>1% (توريدات ومقاولات)</option>
                    <option value={3}>3% (خدمات واستشارات)</option>
                    <option value={0}>0%</option>
                  </select>
                </div>
              </div>

              {/* Tax Calculations */}
              {(() => {
                const tax = (billSubtotal * billTaxRate) / 100;
                const wht = (billSubtotal * billWhtRate) / 100;
                const net = billSubtotal + tax - wht;
                return (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>ضريبة القيمة المضافة (+14%):</span>
                      <span className="font-mono font-bold">+{tax.toLocaleString()} EGP</span>
                    </div>
                    <div className="flex justify-between text-rose-600">
                      <span>ضريبة أرباح تجارية وصناعية (-1% WHT):</span>
                      <span className="font-mono font-bold">-{wht.toLocaleString()} EGP</span>
                    </div>
                    <div className="flex justify-between font-black text-slate-900 border-t border-slate-200 pt-1 text-sm">
                      <span>صافي استحقاق المورد (AP):</span>
                      <span className="font-mono text-rose-600">{net.toLocaleString()} EGP</span>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="font-bold text-slate-700 mb-1 block">ملاحظات الفاتورة:</label>
                <input
                  type="text"
                  value={billNotes}
                  onChange={(e) => setBillNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowNewBillModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600">إلغاء</button>
              <button onClick={handleCreateBill} className="px-5 py-2 rounded-xl text-xs font-black bg-[#C87A38] text-white shadow-lg">اعتماد وترحيل الفاتورة</button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: PAY VENDOR BILL */}
      {showPayModal && selectedBillForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-lg text-slate-900">سداد دفعة للمورد ({selectedBillForPay.supplierName})</h3>
              <button onClick={() => setShowPayModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم الفاتورة:</span>
                  <span className="font-mono font-bold">{selectedBillForPay.billNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">إجمالي المتبقي:</span>
                  <span className="font-mono font-bold text-rose-600">{selectedBillForPay.balanceDue.toLocaleString()} EGP</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">طريقة السداد:</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="bank_transfer">تحويل بنكي (حساب البنك الأهلي 11121)</option>
                  <option value="cash">نقدية (الخزينة الرئيسية 11111)</option>
                  <option value="check">شيك ورقة دفع (2112)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">المبلغ المراد سداده:</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-700 text-left"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowPayModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600">إلغاء</button>
              <button onClick={handleRecordPayment} className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-700 text-white shadow-lg">تأكيد السداد</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
