import React, { useState } from 'react';
import { 
  Building2, Search, Plus, Filter, Star, Phone, Mail, 
  MapPin, DollarSign, Package, TrendingUp, CheckCircle2, 
  AlertTriangle, ArrowUpRight, ShieldCheck, Tag, FileText, ExternalLink
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const ProcurementSuppliersView: React.FC = () => {
  const { 
    suppliers, 
    enterprisePurchaseOrders, 
    supplierPriceLists,
    setActiveModule
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  // Group suppliers with procurement metrics
  const enrichedSuppliers = suppliers.map(sup => {
    const pos = enterprisePurchaseOrders.filter(p => p.supplierId === sup.id);
    const totalSpend = pos.reduce((sum, p) => sum + p.grandTotal, 0);
    const activeOrders = pos.filter(p => ['approved', 'sent_to_supplier', 'partially_received'].includes(p.status)).length;
    const priceListItems = supplierPriceLists.filter(p => p.supplierId === sup.id).length;

    return {
      ...sup,
      posCount: pos.length,
      totalSpend: totalSpend > 0 ? totalSpend : sup.totalPurchases || 0,
      activeOrders,
      priceListItems,
      deliveryScore: 92, // %
      qualityScore: 95, // %
      priceScore: 88, // %
      isTaxRegistered: true,
      taxNumber: `TAX-${sup.id.replace('sup_', '')}0092`,
      leadTimeDays: 7
    };
  });

  const filteredSuppliers = enrichedSuppliers.filter(sup => {
    const matchesSearch = 
      sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sup.companyName && sup.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sup.phone && sup.phone.includes(searchTerm));

    const matchesSpecialty = specialtyFilter === 'all' || sup.specialty === specialtyFilter;

    return matchesSearch && matchesSpecialty;
  });

  const specialties = Array.from(new Set(suppliers.map(s => s.specialty).filter(Boolean)));

  const selectedSupplier = enrichedSuppliers.find(s => s.id === selectedSupplierId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#C87A38]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">دليل وبيانات الموردين (Supplier Directory & Intelligence)</h1>
              <p className="text-sm text-slate-500">إدارة شبكة الموردين، تقييمات الأداء، شروط الدفع، وحجم المشتريات التراكمي</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveModule('suppliers')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#361D13] text-white text-sm font-medium hover:bg-[#4a281b] transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إدارة الموردين الأساسية</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">إجمالي الموردين المعتمدين</span>
          <div className="text-2xl font-bold text-slate-800">{suppliers.length}</div>
          <div className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>موردين خاضعين للمطابقة الضريبية والتجارية</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm bg-blue-50/20">
          <span className="text-xs font-semibold text-blue-700 block mb-1">أوامر شراء قيد التوريد والتنفيذ</span>
          <div className="text-2xl font-bold text-blue-900">
            {enrichedSuppliers.reduce((acc, s) => acc + s.activeOrders, 0)}
          </div>
          <div className="text-xs text-blue-600 mt-1">أمر شراء مفتوح ومجدول مع الموردين</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm bg-amber-50/20">
          <span className="text-xs font-semibold text-amber-700 block mb-1">قوائم أسعار المواد المسجلة</span>
          <div className="text-2xl font-bold text-amber-900">{supplierPriceLists.length}</div>
          <div className="text-xs text-amber-600 mt-1">سعر صنف مسجل ومحدث مع الموردين</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <span className="text-xs font-semibold text-emerald-700 block mb-1">إجمالي مشتريات الشبكة</span>
          <div className="text-xl font-bold text-emerald-900">
            {enrichedSuppliers.reduce((acc, s) => acc + s.totalSpend, 0).toLocaleString()} <span className="text-xs font-normal">ج.م</span>
          </div>
          <div className="text-xs text-emerald-600 mt-1">إجمالي المشتريات التراكمية المسجلة</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث باسم المورد، الشركة، الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]/30 focus:border-[#C87A38]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <button
            onClick={() => setSpecialtyFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              specialtyFilter === 'all'
                ? 'bg-[#361D13] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل
          </button>
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSpecialtyFilter(spec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                specialtyFilter === spec
                  ? 'bg-[#361D13] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Supplier Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div 
            key={supplier.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
          >
            <div className="p-5 space-y-4">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-[#C87A38] transition">
                    {supplier.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                      {supplier.specialty || 'مورد عام'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {supplier.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{supplier.rating || 4.5}</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                {supplier.companyName && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">اسم الشركة:</span>
                    <span className="font-semibold text-slate-700">{supplier.companyName}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-slate-700" dir="ltr">{supplier.phone}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-slate-700">{supplier.email}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-600 truncate">{supplier.address}</span>
                  </div>
                )}
              </div>

              {/* Purchasing Metrics */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block text-[11px]">أوامر الشراء</span>
                  <span className="font-bold text-slate-800 font-mono text-sm">{supplier.posCount}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/50">
                  <span className="text-emerald-700 block text-[11px]">إجمالي المشتريات</span>
                  <span className="font-bold text-emerald-900 font-mono text-sm">{supplier.totalSpend.toLocaleString()} ج.م</span>
                </div>
              </div>

              {/* Sourcing Performance Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>الالتزام بمواعيد التوريد</span>
                  <span className="font-mono text-slate-700">{supplier.deliveryScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${supplier.deliveryScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">
                {supplier.priceListItems} أسعار مسجلة
              </span>

              <button
                onClick={() => setSelectedSupplierId(supplier.id)}
                className="px-3 py-1.5 bg-white hover:bg-[#361D13] hover:text-white text-slate-700 border border-slate-200 hover:border-[#361D13] rounded-lg text-xs font-semibold transition flex items-center gap-1"
              >
                <span>بطاقة المورد</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Supplier Profile Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 text-[#C87A38] flex items-center justify-center font-bold text-lg">
                  {selectedSupplier.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedSupplier.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono">{selectedSupplier.taxNumber}</span>
                    <span>•</span>
                    <span>{selectedSupplier.specialty}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSupplierId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Commercial terms & ratings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-400 block">شروط الدفع</span>
                <span className="text-xs font-bold text-slate-800">{selectedSupplier.paymentTerms}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-400 block">متوسط زمن التوريد</span>
                <span className="text-xs font-bold text-slate-800">{selectedSupplier.leadTimeDays} أيام</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-[11px] text-emerald-700 block">جودة التوريد</span>
                <span className="text-xs font-bold text-emerald-900">{selectedSupplier.qualityScore}%</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                <span className="text-[11px] text-blue-700 block">الالتزام بالمواعيد</span>
                <span className="text-xs font-bold text-blue-900">{selectedSupplier.deliveryScore}%</span>
              </div>
            </div>

            {/* Recent Orders with this supplier */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">أوامر الشراء المسجلة مع هذا المورد</h4>
              {enterprisePurchaseOrders.filter(p => p.supplierId === selectedSupplier.id).length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                  لا توجد أوامر شراء منشأة لهذا المورد حتى الآن
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">رقم PO</th>
                        <th className="py-2.5 px-3">التاريخ</th>
                        <th className="py-2.5 px-3">المشروع</th>
                        <th className="py-2.5 px-3">القيمة الإجمالية</th>
                        <th className="py-2.5 px-3">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {enterprisePurchaseOrders
                        .filter(p => p.supplierId === selectedSupplier.id)
                        .map(po => (
                          <tr key={po.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{po.poNumber}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{po.poDate}</td>
                            <td className="py-2.5 px-3 text-slate-700">{po.projectName || 'مشتريات عامة'}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{po.grandTotal.toLocaleString()} ج.م</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                                {po.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedSupplierId(null)}
                className="px-5 py-2 bg-[#361D13] text-white rounded-xl text-xs font-semibold hover:bg-[#4a281b]"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
