import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { CustomerStatus, LostReason, ActivityType } from '../types/erp';
import { CrmService } from '../services/crmService';
import { ReadySalesService } from '../services/readySalesService';
import {
  ArrowRight,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Building,
  UserCheck,
  Sparkles,
  Calendar,
  Clock,
  Plus,
  FileText,
  DollarSign,
  Ruler,
  FileCheck,
  Award,
  AlertOctagon,
  Edit,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Star,
  Download,
  ShoppingBag,
  Truck,
  Eye
} from 'lucide-react';
import { CustomerFormModal } from '../components/modals/CustomerFormModal';
import { LostReasonModal } from '../components/modals/LostReasonModal';
import { ActivityFormModal } from '../components/modals/ActivityFormModal';
import { ReminderFormModal } from '../components/modals/ReminderFormModal';
import { OfficialQuotationModal } from '../components/modals/OfficialQuotationModal';
import { ProjectQuotation } from '../types/erp';

interface CustomerProfilePageProps {
  customerId: string;
  onBack: () => void;
}

export const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({ customerId, onBack }) => {
  const {
    customProjects,
    projectQuotations,
    setSelectedProjectId,
    customers,
    activities,
    reminders,
    documents,
    afterSalesRecords,
    orders,
    setSelectedOrderId,
    setActiveModule,
    updateCustomerStatus,
    addCustomerActivity,
    addCustomerReminder,
    toggleReminderCompleted,
    updateCustomer,
    acceptQuotation
  } = useERP();

  const customer = customers.find(c => c.id === customerId);

  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'reminders' | 'sales' | 'projects' | 'documents' | 'after_sales'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedQuoteForModal, setSelectedQuoteForModal] = useState<{ quote: ProjectQuotation; project?: any } | null>(null);

  if (!customer) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
        <p className="text-slate-500 font-bold text-sm">عفواً، لم يتم العثور على ملف العميل المطلوبة</p>
        <button onClick={onBack} className="px-4 py-2 bg-[#361D13] text-white text-xs font-bold rounded-xl">
          العودة لقائمة العملاء
        </button>
      </div>
    );
  }

  const customerActivities = activities.filter(a => a.customerId === customer.id);
  const customerReminders = reminders.filter(r => r.customerId === customer.id);
  const customerDocuments = documents.filter(d => d.customerId === customer.id);
  const customerAfterSales = afterSalesRecords.find(a => a.customerId === customer.id);
  const customerOrders = orders.filter(o => o.customerId === customer.id);

  const statusMeta = CrmService.getStatusMeta(customer.status);
  const sourceMeta = CrmService.getSourceLabel(customer.source);
  const whatsappUrl = CrmService.getWhatsAppUrl(customer.phone);

  const handleStatusSelect = (newStatus: CustomerStatus) => {
    setIsStatusDropdownOpen(false);
    if (newStatus === 'lost') {
      setIsLostModalOpen(true);
    } else {
      updateCustomerStatus(customer.id, newStatus);
    }
  };

  const handleConfirmLost = (reason: LostReason, note: string) => {
    updateCustomerStatus(customer.id, 'lost', reason, note);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200/90 text-slate-700 font-bold text-xs shadow-xs transition-all"
        >
          <ArrowRight className="w-4 h-4 text-[#361D13]" />
          <span>العودة لقائمة العملاء</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsActivityModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-emerald-700" />
            <span>تسجيل نشاط / مكالمة</span>
          </button>

          <button
            onClick={() => setIsReminderModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4 text-amber-700" />
            <span>جدولة تذكير</span>
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" />
            <span>تعديل البيانات</span>
          </button>
        </div>
      </div>

      {/* Customer Header 360 Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Avatar & Main Info */}
          <div className="flex items-center gap-4">
            <img
              src={customer.avatar}
              alt=""
              className="w-16 h-16 rounded-3xl object-cover ring-4 ring-[#361D13]/15 shadow-md shrink-0"
            />

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-900">{customer.fullName}</h1>
                
                {/* Status Badge Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    className={`px-3 py-1 rounded-xl text-xs font-black border flex items-center gap-1.5 shadow-xs transition-all ${statusMeta.bgClass} ${statusMeta.textClass} ${statusMeta.borderClass}`}
                  >
                    <span>{statusMeta.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  </button>

                  {isStatusDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in duration-200">
                      <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 border-b border-slate-100">
                        تحديث حالة مسار العميل:
                      </div>
                      <div className="py-1 space-y-1 max-h-60 overflow-y-auto">
                        {[
                          { id: 'new', label: 'جديد (New)' },
                          { id: 'contacted', label: 'تم التواصل (Contacted)' },
                          { id: 'interested', label: 'مهتم جاد (Interested)' },
                          { id: 'measurement_scheduled', label: 'موعد معاينة ومقاسات' },
                          { id: 'measured', label: 'تمت المعاينة (Measured)' },
                          { id: 'quotation', label: 'قيد التسعير وعرض السعر' },
                          { id: 'won', label: 'تم الاتفاق والتعاقد (Won)' },
                          { id: 'customer', label: 'عميل نشط (Customer)' },
                          { id: 'completed', label: 'مشروع مكتمل (Completed)' },
                          { id: 'lost', label: 'فرصة مفقودة (Lost)' }
                        ].map(st => (
                          <button
                            key={st.id}
                            onClick={() => handleStatusSelect(st.id as CustomerStatus)}
                            className={`w-full text-right px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                              customer.status === st.id ? 'bg-[#361D13] text-white' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Links */}
              <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap font-medium">
                <span className="flex items-center gap-1 font-mono text-slate-900 font-bold" dir="ltr">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {customer.phone}
                </span>

                {customer.city && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {customer.city} — {customer.area}
                  </span>
                )}

                <span className="flex items-center gap-1 text-slate-500">
                  <Building className="w-3.5 h-3.5 text-[#361D13]" />
                  الفرع: {customer.branchName}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Quick WhatsApp */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>فتح المحادثة عبر الواتساب</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

        </div>

        {/* Badges Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-xl font-bold border border-slate-200 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${sourceMeta.iconColor.replace('text-', 'bg-')}`}></span>
              <span>المصدر: {sourceMeta.label}</span>
            </span>

            {customer.campaignName && (
              <span className="bg-emerald-950 text-emerald-200 px-3 py-1 rounded-xl font-bold border border-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C87A38]" />
                <span>الحملة: {customer.campaignName}</span>
              </span>
            )}

            {customer.responsibleUserName && (
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-xl font-bold border border-slate-200 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>المسؤول: {customer.responsibleUserName}</span>
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            تاريخ التسجيل: {customer.createdDate} | آخر نشاط: {customer.lastActivityDate}
          </div>
        </div>
      </div>

      {/* Lost Reason Banner if Lost */}
      {customer.status === 'lost' && (
        <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
          <div className="flex items-center gap-2 font-black text-xs text-rose-800">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <span>تم تصنيف العميل كـ "فرصة مفقودة (Lost)"</span>
          </div>
          <p className="text-xs font-bold text-rose-700">
            سبب الفقد: {CrmService.getLostReasonLabel(customer.lostReason)}
          </p>
          {customer.lostNote && (
            <p className="text-xs text-rose-800/80 font-medium">ملاحظات الفقد: {customer.lostNote}</p>
          )}
        </div>
      )}

      {/* Progressive Disclosure Tabs Navigation */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-1 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all ${
            activeTab === 'overview' ? 'bg-[#361D13] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          نظرة عامة (Overview)
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'activity' ? 'bg-[#361D13] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>سجل النشاط والتتبع</span>
          <span className="bg-white/20 text-xs px-2 py-0.2 rounded-full">{customerActivities.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'reminders' ? 'bg-[#361D13] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>التذكيرات والمتابعات</span>
          {customerReminders.length > 0 && (
            <span className="bg-[#C87A38] text-white text-[10px] px-2 py-0.2 rounded-full">
              {customerReminders.length}
            </span>
          )}
        </button>

        {/* SECTION 16: Live Ready Orders Integration inside Customer Profile */}
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'sales' ? 'bg-[#361D13] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>المبيعات وطلبات الأثاث الجاهز</span>
          {customerOrders.length > 0 && (
            <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.2 rounded-full">
              {customerOrders.length} طلبات
            </span>
          )}
        </button>

        {(customer.interestType !== 'furniture' || customer.measurementDate || activeTab === 'projects') && (
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2.5 rounded-xl font-black transition-all ${
              activeTab === 'projects' ? 'bg-[#361D13] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            المشاريع والتفصيل
          </button>
        )}

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all ${
            activeTab === 'documents' ? 'bg-[#361D13] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          الوثائق والمستندات ({customerDocuments.length})
        </button>

        {customer.isAfterSales && (
          <button
            onClick={() => setActiveTab('after_sales')}
            className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'after_sales' ? 'bg-[#C87A38] text-white shadow-md' : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>خدمة ما بعد البيع (After-Sales)</span>
          </button>
        )}
      </div>

      {/* Tab 1: Overview View */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer Details Box */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100">
                البيانات الأساسية للعميل
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">الاسم بالكامل:</span>
                  <span className="font-black text-slate-900 text-sm">{customer.fullName}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block">رقم الهاتف الرئيسي:</span>
                  <span className="font-black text-slate-900 font-mono dir-ltr">{customer.phone}</span>
                </div>

                {customer.altPhone && (
                  <div>
                    <span className="text-slate-400 font-bold block">رقم هاتف آخر:</span>
                    <span className="font-bold text-slate-700 font-mono dir-ltr">{customer.altPhone}</span>
                  </div>
                )}

                {customer.email && (
                  <div>
                    <span className="text-slate-400 font-bold block">البريد الإلكتروني:</span>
                    <span className="font-bold text-slate-700 font-mono dir-ltr">{customer.email}</span>
                  </div>
                )}

                <div>
                  <span className="text-slate-400 font-bold block">العنوان والموقع:</span>
                  <span className="font-bold text-slate-800">{customer.city} — {customer.area} {customer.address ? `(${customer.address})` : ''}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block">نوع الاهتمام:</span>
                  <span className="font-bold text-[#C87A38]">
                    {customer.interestType === 'kitchens' ? 'مطابخ تفصيل' : customer.interestType === 'furniture' ? 'أثاث جاهز' : 'أثاث ومطابخ معا'}
                  </span>
                </div>
              </div>

              {customer.notes && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-slate-400 font-bold block text-xs mb-1">ملاحظات أولية:</span>
                  <p className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium">
                    {customer.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Campaign Attribution & Origin Box */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C87A38]" />
                <span>إسناد الحملات والتسويق (Campaign Attribution)</span>
              </h3>

              <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-200">المصدر التسويقي:</span>
                  <span className="font-black text-white">{sourceMeta.label}</span>
                </div>

                {customer.campaignName && (
                  <div className="flex items-center justify-between pt-2 border-t border-emerald-900">
                    <span className="font-bold text-emerald-200">اسم الحملة الإعلانية المنسوبة:</span>
                    <span className="font-black text-amber-300">{customer.campaignName}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Responsibilities & Orders Summary */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">
                المقر والموظف المسؤول
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">الفرع المخصص:</span>
                  <span className="font-black text-[#361D13]">{customer.branchName}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">الموظف المسؤول:</span>
                  <span className="font-black text-slate-900">{customer.responsibleUserName || 'غير محدد'}</span>
                </div>
              </div>
            </div>

            {/* SECTION 16: Ready Orders Card Preview in Overview */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900">طلبات المبيعات الحالية ({customerOrders.length})</h3>
                <button
                  onClick={() => setActiveTab('sales')}
                  className="text-xs text-[#C87A38] font-bold hover:underline"
                >
                  استعراض الكل
                </button>
              </div>

              {customerOrders.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">لا توجد طلبات بيع مسجلة بهذا العميل بعد</p>
              ) : (
                <div className="space-y-2">
                  {customerOrders.map(ord => {
                    const delMeta = ReadySalesService.getDeliveryStatusMeta(ord.deliveryInfo.deliveryStatus);
                    return (
                      <div
                        key={ord.id}
                        onClick={() => {
                          setSelectedOrderId(ord.id);
                          setActiveModule('sales');
                        }}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-[#361D13] transition-all space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between font-black text-slate-900">
                          <span>{ord.orderNumber}</span>
                          <span className="font-mono text-[#C87A38]">{ord.orderTotal.toLocaleString('ar-EG')} ج.م</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>التسليم: {delMeta.label}</span>
                          <span>{ord.createdDate}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Activity Timeline */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">سجل النشاط والتتبع الزمني (Customer 360 Timeline)</h3>
              <p className="text-xs text-slate-500">تسجيل زمني لكافة المحادثات، المكالمات، تغييرات الحالة والمعاملات</p>
            </div>

            <button
              onClick={() => setIsActivityModalOpen(true)}
              className="px-4 py-2 bg-[#361D13] hover:bg-[#23120A] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#C87A38]" />
              <span>تسجيل إجراء جديد</span>
            </button>
          </div>

          <div className="relative pr-6 border-r-2 border-slate-200 space-y-6">
            {customerActivities.map(act => (
              <div key={act.id} className="relative group">
                <div className="absolute -right-8 top-1 w-4 h-4 rounded-full bg-[#361D13] ring-4 ring-white border-2 border-[#C87A38]"></div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-xs">{act.title}</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                        {act.userName}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono dir-ltr">{act.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{act.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Reminders & Follow-ups */}
      {activeTab === 'reminders' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900">جدول التذكيرات والمتابعات</h3>
            <button
              onClick={() => setIsReminderModalOpen(true)}
              className="px-4 py-2 bg-[#C87A38] hover:bg-[#C87A38]/90 text-white font-black text-xs rounded-xl shadow-lg transition-all"
            >
              + إضافة تذكير جديد
            </button>
          </div>

          <div className="space-y-3">
            {customerReminders.map(rem => (
              <div
                key={rem.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 text-xs ${
                  rem.isCompleted ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-amber-50 border-amber-200 text-amber-950 font-bold'
                }`}
              >
                <div className="space-y-1">
                  <p className={`font-black text-sm ${rem.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {rem.title}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    موعد المتابعة: {rem.dueDate} ({rem.dueTime}) — بواسطة: {rem.assignedUserName}
                  </p>
                </div>

                <button
                  onClick={() => toggleReminderCompleted(rem.id)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors shrink-0 ${
                    rem.isCompleted ? 'bg-slate-200 text-slate-700' : 'bg-[#361D13] text-white hover:bg-[#23120A]'
                  }`}
                >
                  {rem.isCompleted ? 'إعادة الفتح' : 'تأكيد الإتمام'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 16: Tab 4: Sales 360 & Live Ready Orders Integration */}
      {activeTab === 'sales' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">سجل عروض الأسعار وطلبات الأثاث الجاهز (Sales 360)</h3>
              <p className="text-xs text-slate-500">استعراض تفاصيل العقود والمبالغ المحصلة والتسليم الفعلي</p>
            </div>

            <button
              onClick={() => setActiveModule('sales')}
              className="px-4 py-2 bg-[#361D13] text-white text-xs font-black rounded-xl hover:bg-[#23120A]"
            >
              + إنشاء طلب مبيعات جديد
            </button>
          </div>

          {customerOrders.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
              <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-bold">لم يتم إصدار عقود مبيعات أثاث جاهز لهذا العميل بعد</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customerOrders.map(ord => {
                const delMeta = ReadySalesService.getDeliveryStatusMeta(ord.deliveryInfo.deliveryStatus);
                const payMeta = ReadySalesService.getPaymentStatusMeta(ord.paymentStatus);

                return (
                  <div key={ord.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-900 text-base">{ord.orderNumber}</span>
                        <span className={`px-2.5 py-0.5 rounded-lg font-bold text-[11px] ${payMeta.bgClass} ${payMeta.textClass}`}>
                          {payMeta.label}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-lg font-bold text-[11px] border ${delMeta.bgClass} ${delMeta.textClass} ${delMeta.borderClass}`}>
                          {delMeta.label}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedOrderId(ord.id);
                          setActiveModule('sales');
                        }}
                        className="px-3.5 py-1.5 bg-[#361D13] text-white font-bold text-xs rounded-xl hover:bg-[#23120A] flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#C87A38]" />
                        <span>فتح تفاصيل الطلب 360</span>
                      </button>
                    </div>

                    {/* Order Items Preview */}
                    <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200/80">
                      {ord.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-slate-700 font-medium">
                          <span>• {item.productName} ({item.quantity} قطعة) {item.variantName ? `- ${item.variantName}` : ''}</span>
                          <span className="font-mono text-slate-900 font-bold">{item.totalSellingPrice.toLocaleString('ar-EG')} ج.م</span>
                        </div>
                      ))}
                    </div>

                    {/* Financial Line */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-slate-700 font-bold">
                      <span>إجمالي القيمة: <strong className="text-slate-900 font-mono text-sm">{ord.orderTotal.toLocaleString('ar-EG')} ج.م</strong></span>
                      <span>المحصل: <strong className="text-emerald-700 font-mono">{ord.paidAmount.toLocaleString('ar-EG')} ج.م</strong></span>
                      <span>المتبقي: <strong className="text-rose-700 font-mono">{ord.remainingBalance.toLocaleString('ar-EG')} ج.م</strong></span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Projects 360 Integration */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">مشاريع التفصيل والمقاسات بالورشة (Projects 360)</h3>
              <p className="text-xs text-slate-500">مراحل الـ 3D والمعاينة وعروض الأسعار والاعتماد</p>
            </div>

            <button
              onClick={() => {
                setActiveModule('custom_projects');
              }}
              className="px-4 py-2 bg-[#361D13] text-white text-xs font-black rounded-xl hover:bg-[#23120A]"
            >
              + إنشاء مشروع تفصيل جديد
            </button>
          </div>

          {customProjects.filter(p => p.customerId === customer.id).length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
              <Ruler className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-bold">لا توجد مشاريع تفصيل أو معاينات مسجلة لهذا العميل بعد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customProjects.filter(p => p.customerId === customer.id).map(proj => {
                return (
                  <div
                    key={proj.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">{proj.projectName}</span>
                        <span className="font-mono text-[10px] text-slate-500 font-bold">({proj.projectNumber})</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        نوع المشروع: {proj.projectType} | الفرع: {proj.branchName} — المسؤول: {proj.assignedUserName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold">
                        {proj.status}
                      </span>

                      {(() => {
                        const relatedQuote = projectQuotations.find(q => q.projectId === proj.id);
                        if (!relatedQuote) return null;
                        return (
                          <button
                            onClick={() => setSelectedQuoteForModal({ quote: relatedQuote, project: proj })}
                            className="px-3.5 py-1.5 bg-[#C87A38] hover:bg-[#DB8D48] text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                            title="عرض وطباعة عرض السعر الرسمي PDF"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>عرض السعر الرسمي PDF</span>
                          </button>
                        );
                      })()}

                      <button
                        onClick={() => {
                          setSelectedProjectId(proj.id);
                          setActiveModule('custom_projects');
                        }}
                        className="px-3.5 py-1.5 bg-[#361D13] text-white font-bold rounded-xl hover:bg-[#23120A] flex items-center gap-1 shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#C87A38]" />
                        <span>كشف المشروع 360</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Documents View */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900">وثائق ومستندات العميل</h3>
            <button className="px-3.5 py-1.5 bg-[#361D13] text-white text-xs font-bold rounded-xl hover:bg-[#23120A]">
              + رفع ملف جديد
            </button>
          </div>

          {customerDocuments.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">لا توجد ملفات مرفقة لهذا العميل</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {customerDocuments.map(doc => (
                <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-[#C87A38]" />
                    <div>
                      <p className="font-bold text-slate-900">{doc.title}</p>
                      <p className="text-[10px] text-slate-500">{doc.fileName} ({doc.fileSize})</p>
                    </div>
                  </div>

                  <button className="p-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 7: After-Sales View */}
      {activeTab === 'after_sales' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-black text-slate-900">سجل خدمة ما بعد البيع والضمان (After-Sales 360)</h3>
            </div>
            <span className="bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full text-xs">
              عميل مكتمل الشراء
            </span>
          </div>

          {customerAfterSales ? (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 text-xs text-amber-950">
              <div className="flex items-center justify-between">
                <span className="font-bold">وصف المنتجات المستلمة:</span>
                <span className="font-black text-slate-900">{customerAfterSales.itemDescription}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-amber-200/80">
                <span className="font-bold">شهادة الضمان المعتمدة:</span>
                <span className="font-black text-[#361D13]">{customerAfterSales.warrantyPeriod}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-amber-200/80">
                <span className="font-bold">مستوى رضا العميل:</span>
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(customerAfterSales.satisfactionRating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
                  ))}
                </div>
              </div>

              {customerAfterSales.notes && (
                <p className="p-3 bg-white/80 rounded-xl border border-amber-200 text-slate-700 leading-relaxed">
                  {customerAfterSales.notes}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">لا توجد سجلات صيانة معقدة</p>
          )}
        </div>
      )}

      {/* Modals */}
      <CustomerFormModal
        isOpen={isEditModalOpen}
        customerToEdit={customer}
        onSave={(data) => updateCustomer(customer.id, data)}
        onClose={() => setIsEditModalOpen(false)}
      />

      <LostReasonModal
        isOpen={isLostModalOpen}
        customerName={customer.fullName}
        onConfirm={handleConfirmLost}
        onClose={() => setIsLostModalOpen(false)}
      />

      <ActivityFormModal
        isOpen={isActivityModalOpen}
        customerName={customer.fullName}
        onSave={(type, title, note) => addCustomerActivity(customer.id, type, title, note)}
        onClose={() => setIsActivityModalOpen(false)}
      />

      <ReminderFormModal
        isOpen={isReminderModalOpen}
        customerName={customer.fullName}
        onSave={(title, dueDate, dueTime, priority) => addCustomerReminder(customer.id, title, dueDate, dueTime, priority)}
        onClose={() => setIsReminderModalOpen(false)}
      />

      {selectedQuoteForModal && (
        <OfficialQuotationModal
          isOpen={true}
          onClose={() => setSelectedQuoteForModal(null)}
          quotation={selectedQuoteForModal.quote}
          project={selectedQuoteForModal.project}
          customer={customer}
          onApprove={(quoteId) => {
            acceptQuotation(quoteId);
            setSelectedQuoteForModal(null);
          }}
        />
      )}

    </div>
  );
};
