import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Customer, CustomerStatus, CustomerSource, CustomerType } from '../types/erp';
import { CrmService } from '../services/crmService';
import { exportCustomersToExcel } from '../utils/excelExport';
import { CustomerAvatar } from '../components/common/CustomerAvatar';
import { CustomerImportModal } from '../components/modals/CustomerImportModal';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  MessageSquare,
  Sparkles,
  Building2,
  Calendar,
  CheckCircle2,
  AlertOctagon,
  Eye,
  Award,
  ChevronLeft,
  X,
  Download,
  Upload,
  FileSpreadsheet,
  Receipt,
  Star,
  UserCheck,
  Building
} from 'lucide-react';
import { CustomerFormModal } from '../components/modals/CustomerFormModal';
import { CustomerProfilePage } from './CustomerProfilePage';

export const CustomersListPage: React.FC = () => {
  const {
    customers,
    availableBranches,
    campaigns,
    addCustomer,
    selectedCustomerId,
    setSelectedCustomerId,
    checkPermission,
    showToast
  } = useERP();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'purchased' | 'lost' | 'after_sales' | 'commercial' | 'vip'>('all');

  const canCreate = checkPermission('customers', 'create');
  const canExport = checkPermission('customers', 'export');

  // If a specific customer is selected, render Customer 360 Profile view
  if (selectedCustomerId) {
    return (
      <CustomerProfilePage
        customerId={selectedCustomerId}
        onBack={() => setSelectedCustomerId(null)}
      />
    );
  }

  // Filter customers by Section 21: Branch Authorization Scoping
  const authorizedCustomers = customers.filter(c => availableBranches.some(b => b.id === c.branchId));

  // Apply Search & Dropdown Filters
  const filteredCustomers = authorizedCustomers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (c.code && c.code.toLowerCase().includes(q)) ||
      c.fullName.toLowerCase().includes(q) ||
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
      c.phone.includes(q);

    const matchesType = selectedType === 'all' || c.customerType === selectedType;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchesSource = selectedSource === 'all' || c.source === selectedSource;
    const matchesBranch = selectedBranch === 'all' || c.branchId === selectedBranch;

    let matchesQuick = true;
    if (quickFilter === 'purchased') matchesQuick = c.hasPurchased;
    if (quickFilter === 'lost') matchesQuick = c.status === 'lost';
    if (quickFilter === 'after_sales') matchesQuick = c.isAfterSales;
    if (quickFilter === 'commercial') matchesQuick = c.customerType === 'commercial';
    if (quickFilter === 'vip') matchesQuick = c.tier === 'vip';

    return matchesSearch && matchesType && matchesStatus && matchesSource && matchesBranch && matchesQuick;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedSource('all');
    setSelectedBranch('all');
    setQuickFilter('all');
  };

  const handleExportExcel = () => {
    if (filteredCustomers.length === 0) {
      showToast('لا توجد بيانات عملاء لتصديرها', 'warning');
      return;
    }
    exportCustomersToExcel(filteredCustomers);
    showToast(`تم تصدير ${filteredCustomers.length} عميل لملف Excel بنجاح`, 'success');
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-slate-900">سجل العملاء وإدارة العلاقات (CRM)</h1>
            <span className="bg-[#361D13] text-[#E5A86D] text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
              {filteredCustomers.length} عميل
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            دليل موحد للعملاء الأفراد والشركات مع مسار المتابعة والفوترة
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canExport && (
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition-all flex items-center gap-1.5"
              title="تصدير لملف إكسل"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>تصدير إكسل</span>
            </button>
          )}

          {canCreate && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition-all flex items-center gap-1.5"
              title="استيراد عملاء من ملف إكسل"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>استيراد عملاء</span>
            </button>
          )}

          {canCreate && (
            <button
              onClick={() => setIsFormModalOpen(true)}
              className="px-4 py-2 bg-[#361D13] hover:bg-[#23120A] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#C87A38]" />
              <span>عميل جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Segment Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
        <button
          onClick={() => setQuickFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            quickFilter === 'all'
              ? 'bg-[#361D13] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          كل العملاء ({authorizedCustomers.length})
        </button>

        <button
          onClick={() => setQuickFilter('commercial')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            quickFilter === 'commercial'
              ? 'bg-indigo-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>الشركات والتجاري ({authorizedCustomers.filter(c => c.customerType === 'commercial').length})</span>
        </button>

        <button
          onClick={() => setQuickFilter('vip')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            quickFilter === 'vip'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
          <span>عملاء VIP ({authorizedCustomers.filter(c => c.tier === 'vip').length})</span>
        </button>

        <button
          onClick={() => setQuickFilter('purchased')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            quickFilter === 'purchased'
              ? 'bg-[#C87A38] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          تم الشراء والتعاقد ({authorizedCustomers.filter(c => c.hasPurchased).length})
        </button>

        <button
          onClick={() => setQuickFilter('after_sales')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            quickFilter === 'after_sales'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>ما بعد البيع ({authorizedCustomers.filter(c => c.isAfterSales).length})</span>
        </button>

        <button
          onClick={() => setQuickFilter('lost')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            quickFilter === 'lost'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          الفرص المفقودة ({authorizedCustomers.filter(c => c.status === 'lost').length})
        </button>
      </div>

      {/* Clean Filters Bar */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، الكود (CUST-...)، الشركة، أو الهاتف..."
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/20 font-medium"
            />
          </div>

          {/* Customer Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">كل الأنواع (فردي / شركات)</option>
              <option value="individual">عملاء أفراد (B2C)</option>
              <option value="commercial">شركات وتجاري (B2B)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">كل الحالات (Statuses)</option>
              <option value="new">جديد (New)</option>
              <option value="contacted">تم التواصل (Contacted)</option>
              <option value="interested">مهتم جاد (Interested)</option>
              <option value="measurement_scheduled">موعد معاينة ومقاسات</option>
              <option value="measured">تمت المعاينة (Measured)</option>
              <option value="quotation">قيد التسعير وعرض السعر</option>
              <option value="won">تم الاتفاق والتعاقد (Won)</option>
              <option value="customer">عميل نشط (Customer)</option>
              <option value="completed">مشروع مكتمل (Completed)</option>
              <option value="lost">فرصة مفقودة (Lost)</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">كل الفروع المصرحة</option>
              {availableBranches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

        </div>

        {(searchQuery || selectedType !== 'all' || selectedStatus !== 'all' || selectedSource !== 'all' || selectedBranch !== 'all' || quickFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">تم تصفية النتائج إلى {filteredCustomers.length} عميل</span>
            <button
              onClick={clearFilters}
              className="text-rose-600 font-bold hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>إلغاء التصفية</span>
            </button>
          </div>
        )}
      </div>

      {/* Streamlined & Elegant Customers Table */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#361D13] text-white font-bold border-b border-[#361D13]">
              <tr>
                <th className="py-3.5 px-5">بيانات وهوية العميل</th>
                <th className="py-3.5 px-4">التصنيف والاهتمام</th>
                <th className="py-3.5 px-4">حالة المتابعة (CRM)</th>
                <th className="py-3.5 px-4">الفرع والمسؤول</th>
                <th className="py-3.5 px-4">طريقة الفوترة</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    لا توجد نتائج تطابق معايير البحث الحالية
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const statusMeta = CrmService.getStatusMeta(c.status);
                  const sourceMeta = CrmService.getSourceLabel(c.source);
                  const billingMeta = CrmService.getBillingMethodLabel(c.billingMethod);
                  const whatsappUrl = CrmService.getWhatsAppUrl(c.phone);
                  const isCommercial = c.customerType === 'commercial';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* 1. Customer Main Info */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <CustomerAvatar
                            name={c.fullName}
                            customerType={c.customerType}
                            size="md"
                          />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-black text-slate-900 text-sm">{c.fullName}</span>
                              
                              {isCommercial && (
                                <span className="bg-indigo-50 text-indigo-800 text-[10px] font-bold px-1.5 py-0.2 rounded border border-indigo-200">
                                  B2B
                                </span>
                              )}

                              {c.tier === 'vip' && (
                                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-300">
                                  VIP ⭐
                                </span>
                              )}
                            </div>

                            {/* Code & Phone (Clean Horizontal Row) */}
                            <div className="flex items-center gap-2 text-[11px] font-mono whitespace-nowrap">
                              <span className="text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-bold">
                                {c.code || c.id}
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="text-emerald-700 font-bold dir-ltr">{c.phone}</span>
                            </div>

                            {/* Commercial Contact Person if any */}
                            {isCommercial && c.contactPerson && (
                              <p className="text-[11px] text-indigo-700 font-bold truncate max-w-[200px]">
                                المسؤول: {c.contactPerson} {c.contactRole ? `(${c.contactRole})` : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Category & Interest */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 text-xs">
                            {c.interestType === 'kitchens' || c.interestType === 'custom'
                              ? 'مطابخ وتفصيل عمولة'
                              : c.interestType === 'furniture'
                              ? 'أثاث جاهز ومعارض'
                              : 'جاهز + تفصيل وعمولة'}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {isCommercial ? 'عميل تجاري / منشأة' : 'عميل فردي (B2C)'}
                          </p>
                        </div>
                      </td>

                      {/* 3. CRM Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${statusMeta.bgClass} ${statusMeta.textClass} ${statusMeta.borderClass}`}>
                            <span>{statusMeta.label}</span>
                          </span>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {c.lastActivityDate ? c.lastActivityDate.substring(0, 10) : c.createdDate}
                          </p>
                        </div>
                      </td>

                      {/* 4. Branch & Responsible Agent */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 text-xs">{c.branchName}</p>
                          <p className="text-[11px] text-slate-500">
                            {c.responsibleUserName || 'غير محدد'} · {sourceMeta.label.split(' ')[0]}
                          </p>
                        </div>
                      </td>

                      {/* 5. Billing Method */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 text-xs block">
                            {billingMeta.label}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[140px]" title={billingMeta.desc}>
                            {c.city} - {c.area}
                          </span>
                        </div>
                      </td>

                      {/* 6. Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* WhatsApp */}
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 transition-colors shadow-xs"
                            title="محادثة واتساب"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>

                          {/* Profile 360 */}
                          <button
                            onClick={() => setSelectedCustomerId(c.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#361D13] hover:bg-[#23120A] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#C87A38]" />
                            <span>الملف 360</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Responsive Cards */}
      <div className="md:hidden space-y-3">
        {filteredCustomers.map((c) => {
          const statusMeta = CrmService.getStatusMeta(c.status);
          const whatsappUrl = CrmService.getWhatsAppUrl(c.phone);

          return (
            <div key={c.id} className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CustomerAvatar
                    name={c.fullName}
                    customerType={c.customerType}
                    size="md"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-slate-900 text-sm">{c.fullName}</h3>
                      {c.tier === 'vip' && <span className="text-[10px] font-bold text-amber-600">VIP ⭐</span>}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                      <span>{c.code || c.id}</span>
                      <span>·</span>
                      <span className="text-emerald-700 font-bold">{c.phone}</span>
                    </div>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${statusMeta.bgClass} ${statusMeta.textClass} ${statusMeta.borderClass}`}>
                  {statusMeta.label}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>{c.branchName}</span>
                <span>{c.customerType === 'commercial' ? '🏢 تجاري' : '👤 فردي'}</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setSelectedCustomerId(c.id)}
                  className="flex-1 py-2 rounded-xl bg-[#361D13] text-white font-black text-xs text-center shadow-xs"
                >
                  فتح ملف العميل 360
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Add/Edit Modal */}
      <CustomerFormModal
        isOpen={isFormModalOpen}
        onSave={(data) => addCustomer(data)}
        onClose={() => setIsFormModalOpen(false)}
      />

      {/* Customer Excel Import Modal */}
      <CustomerImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(count) => {
          showToast(`تم استيراد ${count} عميل بنجاح!`, 'success');
        }}
      />

    </div>
  );
};
