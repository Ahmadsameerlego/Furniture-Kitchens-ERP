import React, { useState } from 'react';
import { 
  BarChart3, PieChart, TrendingUp, DollarSign, Calendar, 
  Download, Printer, Filter, CheckCircle2, AlertTriangle, 
  XCircle, FileSpreadsheet, ShieldCheck, Building2, Package, ArrowUpRight
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const ProcurementReportsView: React.FC = () => {
  const { 
    enterprisePurchaseOrders, 
    threeWayMatches, 
    suppliers,
    procurementSupplierReturns
  } = useERP();

  const [activeTab, setActiveTab] = useState<'spend' | 'matching' | 'vat'>('spend');

  // Spend calculations
  const totalSpend = enterprisePurchaseOrders.reduce((acc, p) => acc + p.grandTotal, 0);
  const totalVAT = enterprisePurchaseOrders.reduce((acc, p) => acc + p.taxTotal, 0);
  const totalSubtotal = enterprisePurchaseOrders.reduce((acc, p) => acc + p.subtotal, 0);

  // Spend by Supplier
  const supplierSpendMap: { [id: string]: { name: string; count: number; spend: number } } = {};
  enterprisePurchaseOrders.forEach(po => {
    if (!supplierSpendMap[po.supplierId]) {
      supplierSpendMap[po.supplierId] = {
        name: po.supplierName,
        count: 0,
        spend: 0
      };
    }
    supplierSpendMap[po.supplierId].count += 1;
    supplierSpendMap[po.supplierId].spend += po.grandTotal;
  });

  const supplierSpendList = Object.values(supplierSpendMap).sort((a, b) => b.spend - a.spend);

  const getMatchingBadge = (status: string) => {
    switch (status) {
      case 'matched':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> مطابقة تامة 100%</span>;
      case 'price_mismatch':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200"><AlertTriangle className="w-3.5 h-3.5" /> فرق في سعر الفاتورة</span>;
      case 'qty_mismatch':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"><AlertTriangle className="w-3.5 h-3.5" /> فرق في كمية الاستلام</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">معلق</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">تقارير وتحليلات المشتريات والمطابقة الثلاثية</h1>
              <p className="text-sm text-slate-500">تحليل الإنفاق على الموردين، تقرير ضريبة القيمة المضافة (14% VAT)، والمطابقة الثلاثية (PO - GRN - Bill)</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير</span>
          </button>
          <button
            onClick={() => alert('تم تصدير تقرير المشتريات إلى ملف Excel بنجاح')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#361D13] text-white text-sm font-medium hover:bg-[#4a281b] transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>تصدير إكسيل</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('spend')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'spend'
              ? 'bg-[#361D13] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          تحليل الإنفاق وحجم المشتريات
        </button>
        <button
          onClick={() => setActiveTab('matching')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'matching'
              ? 'bg-[#361D13] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>المطابقة الثلاثية (3-Way Matching)</span>
        </button>
        <button
          onClick={() => setActiveTab('vat')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'vat'
              ? 'bg-[#361D13] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          تقرير ضريبة المدخلات (VAT 14%)
        </button>
      </div>

      {/* Spend Analytics Tab */}
      {activeTab === 'spend' && (
        <div className="space-y-6">
          {/* KPI summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block mb-1">صافي المشتريات (قبل الضريبة)</span>
              <div className="text-xl font-bold text-slate-800 font-mono">
                {totalSubtotal.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm bg-blue-50/20">
              <span className="text-xs font-semibold text-blue-700 block mb-1">إجمالي ضريبة القيمة المضافة 14%</span>
              <div className="text-xl font-bold text-blue-900 font-mono">
                {totalVAT.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm bg-purple-50/20">
              <span className="text-xs font-semibold text-purple-700 block mb-1">إجمالي الإنفاق الكلي الشامل</span>
              <div className="text-xl font-bold text-purple-900 font-mono">
                {totalSpend.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
              <span className="text-xs font-semibold text-emerald-700 block mb-1">إجمالي أوامر الشراء المنفذة</span>
              <div className="text-2xl font-bold text-emerald-900 font-mono">
                {enterprisePurchaseOrders.length}
              </div>
            </div>
          </div>

          {/* Supplier Spend Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5">
            <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#C87A38]" />
              <span>توزيع الإنفاق حسب الموردين (Top Suppliers by Volume)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">المورد</th>
                    <th className="py-3 px-4">عدد أوامر الشراء</th>
                    <th className="py-3 px-4">نسبة الإنفاق من الإجمالي</th>
                    <th className="py-3 px-4">إجمالي قيمة التوريدات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {supplierSpendList.map((sup, idx) => {
                    const percentage = totalSpend > 0 ? (sup.spend / totalSpend) * 100 : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {sup.name}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {sup.count} أوامر
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#C87A38] rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono text-slate-600">{percentage.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold font-mono text-slate-900">
                          {sup.spend.toLocaleString()} ج.م
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3-Way Matching Tab */}
      {activeTab === 'matching' && (
        <div className="space-y-6">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">ما هي المطابقة الثلاثية (3-Way Matching)؟</span>
              المطابقة الثلاثية تضمن الحوكمة المالية الدقيقة عبر مضاهاة أمر الشراء المعتمد (PO) مع أذون الاستلام الفعلي بالمخازن (GRN) وفاتورة المورد المقيدة في الحسابات العامة (Vendor Bill)، مما يمنع دفع مبالغ زائدة أو بنود لم يتم استلامها بالمواصفات المعتمدة.
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                  <tr>
                    <th className="py-3 px-4">أمر الشراء (PO)</th>
                    <th className="py-3 px-4">المورد</th>
                    <th className="py-3 px-4">إذن الاستلام (GRN)</th>
                    <th className="py-3 px-4">فاتورة المورد (Bill)</th>
                    <th className="py-3 px-4">قيمة PO</th>
                    <th className="py-3 px-4">قيمة الفاتورة</th>
                    <th className="py-3 px-4">فرق المبلغ (Variance)</th>
                    <th className="py-3 px-4">حالة المطابقة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {threeWayMatches.map((match) => (
                    <tr key={match.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{match.poNumber}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{match.supplierName}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">{match.grnNumbers?.join(', ') || '—'}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">{match.invoiceNumber || '—'}</td>
                      <td className="py-3 px-4 font-mono text-slate-800">{match.poTotal.toLocaleString()} ج.م</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{(match.invoicedValue || 0).toLocaleString()} ج.م</td>
                      <td className="py-3 px-4 font-mono">
                        {match.varianceValue === 0 ? (
                          <span className="text-emerald-600 font-bold">0 ج.م</span>
                        ) : (
                          <span className="text-rose-600 font-bold">+{match.varianceValue.toLocaleString()} ج.م</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {getMatchingBadge(match.overallStatus)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VAT 14% Tab */}
      {activeTab === 'vat' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base">
                سجل ضريبة القيمة المضافة على المشتريات (Egyptian Input VAT 14%)
              </h3>
              <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
                معدل الضريبة القانوني: 14%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                  <tr>
                    <th className="py-3 px-4">رقم PO</th>
                    <th className="py-3 px-4">التاريخ</th>
                    <th className="py-3 px-4">المورد</th>
                    <th className="py-3 px-4">الوعاء الخاضع للضريبة</th>
                    <th className="py-3 px-4">قيمة الضريبة 14%</th>
                    <th className="py-3 px-4">الإجمالي الشامل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enterprisePurchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">{po.poNumber}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">{po.poDate}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium">{po.supplierName}</td>
                      <td className="py-3 px-4 font-mono text-slate-800">{po.subtotal.toLocaleString()} ج.م</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{po.taxTotal.toLocaleString()} ج.م</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{po.grandTotal.toLocaleString()} ج.م</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-left">الإجمالي العام:</td>
                    <td className="py-3 px-4 font-mono text-slate-900">{totalSubtotal.toLocaleString()} ج.م</td>
                    <td className="py-3 px-4 font-mono text-blue-800">{totalVAT.toLocaleString()} ج.م</td>
                    <td className="py-3 px-4 font-mono text-purple-900">{totalSpend.toLocaleString()} ج.م</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
