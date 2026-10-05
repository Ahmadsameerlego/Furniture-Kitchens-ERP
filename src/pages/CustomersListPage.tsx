import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Customer, CustomerStatus, CustomerSource } from '../types/erp';
import { CrmService } from '../services/crmService';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  MessageSquare,
  Sparkles,
  Building,
  Calendar,
  CheckCircle2,
  AlertOctagon,
  Eye,
  Award,
  ChevronLeft,
  X
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
    checkPermission
  } = useERP();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'purchased' | 'lost' | 'after_sales'>('all');

  const canCreate = checkPermission('customers', 'create');

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
    const matchesSearch = c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.phone.includes(searchQuery);

    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchesSource = selectedSource === 'all' || c.source === selectedSource;
    const matchesCampaign = selectedCampaign === 'all' || c.campaignId === selectedCampaign;
    const matchesBranch = selectedBranch === 'all' || c.branchId === selectedBranch;

    let matchesQuick = true;
    if (quickFilter === 'purchased') matchesQuick = c.hasPurchased;
    if (quickFilter === 'lost') matchesQuick = c.status === 'lost';
    if (quickFilter === 'after_sales') matchesQuick = c.isAfterSales;

    return matchesSearch && matchesStatus && matchesSource && matchesCampaign && matchesBranch && matchesQuick;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedSource('all');
    setSelectedCampaign('all');
    setSelectedBranch('all');
    setQuickFilter('all');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">سجل العملاء وإدارة العلاقات (Customer CRM)</h1>
            <span className="bg-[#C87A38]/15 text-[#C87A38] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#C87A38]/30">
              {filteredCustomers.length} عميل مصرح
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            سجل موحد لكل عميل يتبع مساره من البداية وحتى التعاقد وخدمة ما بعد البيع
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsFormModalOpen(true)}
            className="px-5 py-2.5 bg-[#361D13] hover:bg-[#23120A] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#C87A38]" />
            <span>تسجيل عميل جديد</span>
          </button>
        )}
      </div>

      {/* Quick Filter Segment Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
        <button
          onClick={() => setQuickFilter('all')}
          className={`px-4 py-2 rounded-2xl transition-all ${
            quickFilter === 'all'
              ? 'bg-[#361D13] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          كل العملاء ({authorizedCustomers.length})
        </button>

        <button
          onClick={() => setQuickFilter('purchased')}
          className={`px-4 py-2 rounded-2xl transition-all ${
            quickFilter === 'purchased'
              ? 'bg-[#C87A38] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          عملاء تم التعاقد والشراء ({authorizedCustomers.filter(c => c.hasPurchased).length})
        </button>

        <button
          onClick={() => setQuickFilter('after_sales')}
          className={`px-4 py-2 rounded-2xl transition-all flex items-center gap-1.5 ${
            quickFilter === 'after_sales'
              ? 'bg-[#361D13] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>عملاء ما بعد البيع ({authorizedCustomers.filter(c => c.isAfterSales).length})</span>
        </button>

        <button
          onClick={() => setQuickFilter('lost')}
          className={`px-4 py-2 rounded-2xl transition-all ${
            quickFilter === 'lost'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          الفرص المفقودة Lost ({authorizedCustomers.filter(c => c.status === 'lost').length})
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث باسم العميل أو رقم الهاتف..."
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30"
            />
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
              <option value="won">تم الاتفاق (Won)</option>
              <option value="customer">عميل نشط (Customer)</option>
              <option value="completed">مشروع مكتمل (Completed)</option>
              <option value="lost">فرصة مفقودة (Lost)</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">كل المصادر (Sources)</option>
              <option value="instagram">انستجرام (Instagram)</option>
              <option value="facebook">فيسبوك (Facebook)</option>
              <option value="tiktok">تيك توك (TikTok)</option>
              <option value="website">الموقع الإلكتروني</option>
              <option value="whatsapp">واتساب (WhatsApp)</option>
              <option value="walk_in">زيارة المعرض (Walk-in)</option>
              <option value="phone">اتصال مباشر</option>
              <option value="referral">ترشيح عميل</option>
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

        {(searchQuery || selectedStatus !== 'all' || selectedSource !== 'all' || selectedCampaign !== 'all' || selectedBranch !== 'all' || quickFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">تم تصفية النتائج إلى {filteredCustomers.length} عميل</span>
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

      {/* Desktop Customers Table */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#361D13] text-white font-bold border-b border-emerald-900/50">
              <tr>
                <th className="p-4">اسم العميل ورقم الهاتف (WhatsApp)</th>
                <th className="p-4">نوع الطلب والاهتمام</th>
                <th className="p-4">الموظف المسؤول</th>
                <th className="p-4">حالة العميل (Status)</th>
                <th className="p-4">المصدر والحملة</th>
                <th className="p-4">الفرع والموقع</th>
                <th className="p-4">آخر نشاط</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCustomers.map((c) => {
                const statusMeta = CrmService.getStatusMeta(c.status);
                const sourceMeta = CrmService.getSourceLabel(c.source);
                const whatsappUrl = CrmService.getWhatsAppUrl(c.phone);

                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Customer Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar}
                          alt=""
                          className="w-10 h-10 rounded-2xl object-cover ring-2 ring-[#361D13]/20 shadow-xs shrink-0"
                        />
                        <div>
                          <p className="font-black text-slate-900 text-sm">{c.fullName}</p>
                          <span className="font-mono text-[11px] text-emerald-700 font-bold dir-ltr flex items-center gap-1">
                            <span>📱 {c.phone}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Interest Type */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold inline-block ${
                        c.interestType === 'kitchens' || c.interestType === 'custom'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : c.interestType === 'furniture'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-purple-100 text-purple-900 border border-purple-300'
                      }`}>
                        {c.interestType === 'kitchens' || c.interestType === 'custom'
                          ? 'تفصيل وعمولة'
                          : c.interestType === 'furniture'
                          ? 'أثاث جاهز'
                          : 'جاهز + تفصيل'}
                      </span>
                    </td>

                    {/* Responsible User */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                          {c.responsibleUserName ? c.responsibleUserName.charAt(0) : '?'}
                        </div>
                        <span className="font-bold text-slate-900 text-xs">
                          {c.responsibleUserName || 'غير محدد'}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${statusMeta.bgClass} ${statusMeta.textClass} ${statusMeta.borderClass}`}>
                        <span>{statusMeta.label}</span>
                      </span>
                    </td>

                    {/* Source & Campaign */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800">{sourceMeta.label}</p>
                        {c.campaignName && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded border border-emerald-200 block truncate max-w-[140px]">
                            {c.campaignName}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Branch & Location */}
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-900">{c.branchName}</p>
                        <p className="text-[11px] text-slate-500">{c.city} — {c.area}</p>
                      </div>
                    </td>

                    {/* Last Activity */}
                    <td className="p-4 text-slate-500 text-[11px] font-mono whitespace-nowrap">
                      {c.lastActivityDate}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Quick WhatsApp */}
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 transition-colors"
                          title="فتح محادثة واتساب"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>

                        {/* Open 360 Profile */}
                        <button
                          onClick={() => setSelectedCustomerId(c.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#361D13] hover:bg-[#23120A] text-white font-black text-xs shadow-xs transition-all flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#C87A38]" />
                          <span>الملف 360</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Responsive Cards */}
      <div className="md:hidden space-y-3">
        {filteredCustomers.map((c) => {
          const statusMeta = CrmService.getStatusMeta(c.status);

          return (
            <div key={c.id} className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={c.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover" />
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">{c.fullName}</h3>
                    <p className="text-xs font-mono text-slate-600">{c.phone}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${statusMeta.bgClass} ${statusMeta.textClass} ${statusMeta.borderClass}`}>
                  {statusMeta.label}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>الفرع: {c.branchName}</span>
                <span>{c.city}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setSelectedCustomerId(c.id)}
                  className="w-full py-2 rounded-xl bg-[#361D13] text-white font-black text-xs text-center"
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

    </div>
  );
};
