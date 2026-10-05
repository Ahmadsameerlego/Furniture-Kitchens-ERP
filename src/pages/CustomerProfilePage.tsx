import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { CustomerStatus, LostReason, ActivityType, ProjectQuotation } from '../types/erp';
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
  Eye,
  Trash2,
  Upload,
  ShieldCheck,
  History,
  FileCode,
  CreditCard,
  Camera,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { CustomerFormModal } from '../components/modals/CustomerFormModal';
import { LostReasonModal } from '../components/modals/LostReasonModal';
import { ActivityFormModal } from '../components/modals/ActivityFormModal';
import { ReminderFormModal } from '../components/modals/ReminderFormModal';
import { OfficialQuotationModal } from '../components/modals/OfficialQuotationModal';
import { CustomerDocumentModal } from '../components/modals/CustomerDocumentModal';
import { OrderFormModal } from '../components/modals/OrderFormModal';
import { ProjectFormModal } from '../components/modals/ProjectFormModal';

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
    auditLogs,
    setSelectedOrderId,
    setActiveModule,
    updateCustomerStatus,
    addCustomerActivity,
    addCustomerReminder,
    toggleReminderCompleted,
    updateCustomer,
    acceptQuotation,
    deleteCustomerDocument,
    createReadyOrder
  } = useERP();

  const customer = customers.find(c => c.id === customerId);

  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'reminders' | 'sales' | 'projects' | 'documents' | 'after_sales' | 'audit_log'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedQuoteForModal, setSelectedQuoteForModal] = useState<{ quote: ProjectQuotation; project?: any } | null>(null);

  if (!customer) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
        <p className="text-slate-500 font-bold text-sm">عفواً، لم يتم العثور على ملف العميل المطلوب</p>
        <button onClick={onBack} className="px-4 py-2 bg-[#361D13] text-white text-xs font-bold rounded-xl">
          العودة لقائمة العملاء
        </button>
      </div>
    );
  }

  // Determine Tab Visibility based on interestType (Prompt 2 Requirement)
  const isInterestCustom = customer.interestType === 'kitchens' || customer.interestType === 'custom';
  const isInterestFurniture = customer.interestType === 'furniture';
  const isInterestBoth = customer.interestType === 'both' || (!isInterestCustom && !isInterestFurniture);

  const showSalesTab = isInterestFurniture || isInterestBoth;
  const showProjectsTab = isInterestCustom || isInterestBoth;

  const customerActivities = activities.filter(a => a.customerId === customer.id);
  const customerReminders = reminders.filter(r => r.customerId === customer.id);
  const customerDocuments = documents.filter(d => d.customerId === customer.id);
  const customerAfterSales = afterSalesRecords.find(a => a.customerId === customer.id);
  const customerOrders = orders.filter(o => o.customerId === customer.id);
  const customerProjects = customProjects.filter(p => p.customerId === customer.id);

  // Customer-specific Audit Logs (Prompt 5 Requirement)
  const customerAuditLogs = auditLogs.filter(log => {
    return (
      log.target === customer.fullName ||
      log.target === customer.phone ||
      log.details.includes(customer.fullName) ||
      log.details.includes(customer.id)
    );
  });

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

  const getDocCategoryMeta = (cat?: string) => {
    switch (cat) {
      case 'national_id':
        return { label: 'بطاقة الرقم القومي', icon: CreditCard, color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case 'site_photos':
        return { label: 'صور الموقع والمعاينة', icon: Camera, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      case 'sketch_drawing':
        return { label: 'كروكي ومخطط أولي', icon: FileCode, color: 'text-amber-600 bg-amber-50 border-amber-200' };
      case 'signed_contract':
        return { label: 'عقد ورقي موقع', icon: FileCheck, color: 'text-purple-600 bg-purple-50 border-purple-200' };
      case 'payment_receipt':
        return { label: 'إيصال سداد / شيك', icon: FileSpreadsheet, color: 'text-rose-600 bg-rose-50 border-rose-200' };
      default:
        return { label: 'مستند ومرفق عام', icon: FileText, color: 'text-slate-600 bg-slate-50 border-slate-200' };
    }
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

        <div className="flex items-center gap-2 flex-wrap">
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
                
                {/* Interest Badge */}
                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                  isInterestCustom
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : isInterestFurniture
                    ? 'bg-blue-100 text-blue-900 border-blue-300'
                    : 'bg-purple-100 text-purple-900 border-purple-300'
                }`}>
                  {isInterestCustom ? 'مهتم: تفصيل وعمولة' : isInterestFurniture ? 'مهتم: أثاث جاهز' : 'مهتم: جاهز + تفصيل'}
                </span>

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
                <span className="flex items-center gap-1 font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200" dir="ltr">
                  <span>📱 {customer.phone}</span>
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

                {customer.responsibleUserName && (
                  <span className="flex items-center gap-1 text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded-lg">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    المسؤول: {customer.responsibleUserName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Quick WhatsApp & Direct Modals */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {showSalesTab && (
              <button
                onClick={() => setIsCreateOrderModalOpen(true)}
                className="px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-black text-xs shadow-xs transition-all flex items-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>+ طلب مبيعات جاهز</span>
              </button>
            )}

            {showProjectsTab && (
              <button
                onClick={() => setIsCreateProjectModalOpen(true)}
                className="px-3.5 py-2 rounded-2xl bg-[#361D13] hover:bg-[#23120A] text-white font-black text-xs shadow-xs transition-all flex items-center gap-1.5"
              >
                <Ruler className="w-4 h-4 text-[#C87A38]" />
                <span>+ مشروع تفصيل جديد</span>
              </button>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>محادثة WhatsApp</span>
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
          <span>سجل المتابعات والمكالمات</span>
          <span className="bg-white/20 text-xs px-2 py-0.2 rounded-full">{customerActivities.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'reminders' ? 'bg-[#361D13] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>التذكيرات والمواعيد</span>
          {customerReminders.length > 0 && (
            <span className="bg-[#C87A38] text-white text-[10px] px-2 py-0.2 rounded-full">
              {customerReminders.length}
            </span>
          )}
        </button>

        {/* Sales Tab: Rendered ONLY if customer is interested in furniture or both */}
        {showSalesTab && (
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'sales' ? 'bg-[#361D13] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>المبيعات وطلبات الأثاث الجاهز</span>
            {customerOrders.length > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.2 rounded-full">
                {customerOrders.length}
              </span>
            )}
          </button>
        )}

        {/* Custom Projects Tab: Rendered ONLY if customer is interested in custom/kitchens or both */}
        {showProjectsTab && (
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'projects' ? 'bg-[#361D13] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>مشاريع التفصيل والمقاسات</span>
            {customerProjects.length > 0 && (
              <span className="bg-amber-600 text-white text-[10px] px-2 py-0.2 rounded-full">
                {customerProjects.length}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'documents' ? 'bg-[#361D13] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>أرشيف الوثائق والمستندات</span>
          <span className="bg-slate-200 text-slate-800 text-[10px] px-2 py-0.2 rounded-full font-bold">
            {customerDocuments.length}
          </span>
        </button>

        {customer.isAfterSales && (
          <button
            onClick={() => setActiveTab('after_sales')}
            className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'after_sales' ? 'bg-[#C87A38] text-white shadow-md' : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>خدمة ما بعد البيع</span>
          </button>
        )}

        {/* Tab 8: Audit Log & History Trail (Prompt 5 Requirement) */}
        <button
          onClick={() => setActiveTab('audit_log')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-1.5 mr-auto ${
            activeTab === 'audit_log' ? 'bg-[#361D13] text-amber-300 shadow-md' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>سجل التدقيق والرقابة</span>
          <span className="bg-black/20 text-amber-300 text-[10px] px-2 py-0.2 rounded-full font-mono">
            {customerAuditLogs.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Overview View */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer Details Box */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100">
                البيانات الأساسية ونوع الاهتمام
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">الاسم بالكامل:</span>
                  <span className="font-black text-slate-900 text-sm">{customer.fullName}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block">رقم الهاتف (WhatsApp):</span>
                  <span className="font-black text-emerald-700 font-mono dir-ltr">{customer.phone}</span>
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
                  <span className="text-slate-400 font-bold block">نوع الاهتمام التجاري:</span>
                  <span className="font-bold text-[#C87A38]">
                    {isInterestCustom ? 'شغل عمولة وتفصيل (مطابخ ودواليب)' : isInterestFurniture ? 'أثاث جاهز ومعارض' : 'أثاث جاهز وتفصيل عمولة معا'}
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

            {/* Ready Orders Preview (If Interested) */}
            {showSalesTab && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900">طلبات المبيعات الجاهزة ({customerOrders.length})</h3>
                  <button
                    onClick={() => setIsCreateOrderModalOpen(true)}
                    className="text-xs text-[#C87A38] font-bold hover:underline"
                  >
                    + إنشاء طلب
                  </button>
                </div>

                {customerOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">لا توجد طلبات بيع مسجلة لهذا العميل بعد</p>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.slice(0, 3).map(ord => {
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
            )}

            {/* Custom Projects Preview (If Interested) */}
            {showProjectsTab && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900">مشاريع التفصيل ({customerProjects.length})</h3>
                  <button
                    onClick={() => setIsCreateProjectModalOpen(true)}
                    className="text-xs text-[#C87A38] font-bold hover:underline"
                  >
                    + بدء مشروع
                  </button>
                </div>

                {customerProjects.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">لا توجد مشاريع تفصيل مسجلة لهذا العميل بعد</p>
                ) : (
                  <div className="space-y-2">
                    {customerProjects.slice(0, 3).map(prj => {
                      return (
                        <div
                          key={prj.id}
                          onClick={() => {
                            setSelectedProjectId(prj.id);
                            setActiveModule('custom_projects');
                          }}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-[#361D13] transition-all space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between font-black text-slate-900">
                            <span>{prj.projectName}</span>
                            <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">{prj.status}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {prj.projectNumber} • النوع: {prj.projectType}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

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

      {/* Tab 4: Sales 360 & Live Ready Orders */}
      {showSalesTab && activeTab === 'sales' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">سجل عروض الأسعار وطلبات الأثاث الجاهز (Sales 360)</h3>
              <p className="text-xs text-slate-500">استعراض تفاصيل العقود والمبالغ المحصلة والتسليم الفعلي</p>
            </div>

            <button
              onClick={() => setIsCreateOrderModalOpen(true)}
              className="px-4 py-2 bg-[#361D13] text-white text-xs font-black rounded-xl hover:bg-[#23120A] flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4 text-[#C87A38]" />
              <span>+ إنشاء طلب مبيعات جديد</span>
            </button>
          </div>

          {customerOrders.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-700">لم يتم إصدار طلبات مبيعات أثاث جاهز لهذا العميل بعد</p>
              <button
                onClick={() => setIsCreateOrderModalOpen(true)}
                className="px-4 py-2 bg-[#C87A38] text-white font-bold rounded-xl"
              >
                إنشاء أول طلب مبيعات للعميل
              </button>
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
      {showProjectsTab && activeTab === 'projects' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">مشاريع التفصيل والمقاسات بالورشة (Projects 360)</h3>
              <p className="text-xs text-slate-500">مراحل الـ 3D والمعاينة وعروض الأسعار والاعتماد الهندسي</p>
            </div>

            <button
              onClick={() => setIsCreateProjectModalOpen(true)}
              className="px-4 py-2 bg-[#361D13] text-white text-xs font-black rounded-xl hover:bg-[#23120A] flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4 text-[#C87A38]" />
              <span>+ إنشاء مشروع تفصيل جديد</span>
            </button>
          </div>

          {customerProjects.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-3">
              <Ruler className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-700">لا توجد مشاريع تفصيل أو معاينات مسجلة لهذا العميل بعد</p>
              <button
                onClick={() => setIsCreateProjectModalOpen(true)}
                className="px-4 py-2 bg-[#361D13] text-white font-bold rounded-xl"
              >
                بدء أول مشروع تفصيل
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {customerProjects.map(proj => {
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
                            <span>عرض السعر PDF</span>
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

      {/* Tab 6: Documents & Attachments View */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          
          {/* Informative Header with Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C87A38]" />
                <span>أرشيف الوثائق والمستندات الرسمية للعميل</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                حفظ وأرشفة الوثائق الرسمية، إثباتات الهوية، الكروكيات، صور الموقع، إيصالات السداد، والعقود الموقعة
              </p>
            </div>

            <button
              onClick={() => setIsDocModalOpen(true)}
              className="px-4 py-2.5 bg-[#361D13] text-white text-xs font-black rounded-xl hover:bg-[#23120A] shadow-md flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-[#C87A38]" />
              <span>+ أرشفة / رفع مستند جديد</span>
            </button>
          </div>

          {/* Guide Card */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#C87A38] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">ما الغرض من وثائق ومستندات العميل؟</p>
              <p className="text-[11px] leading-relaxed text-amber-900/90">
                هذا القسم مخصص لأرشفة وحفظ المستندات الميدانية والقانونية مثل: <strong>بطاقة الرقم القومي</strong> للتعاقد، <strong>رسم كروكي أولي</strong> مرفوع من الموقع، <strong>صور وفيديوهات الموقع</strong> أثناء المعاينة، <strong>شيكات أو إيصالات سداد الدفعات</strong>، ونسخ <strong>العقد الورقي الممسوح ضوئياً (Scanner)</strong> بعد التوقيع.
              </p>
            </div>
          </div>

          {customerDocuments.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-3">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-700">لا توجد وثائق أو مرفقات مؤرشفة لهذا العميل بعد</p>
              <button
                onClick={() => setIsDocModalOpen(true)}
                className="px-4 py-2 bg-[#361D13] text-white font-bold rounded-xl"
              >
                رفع أول مستند للعميل الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customerDocuments.map(doc => {
                const catMeta = getDocCategoryMeta(doc.category);
                const CatIcon = catMeta.icon;

                return (
                  <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3 hover:border-[#361D13]/50 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[#C87A38] shrink-0">
                          <CatIcon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-slate-900 text-sm">{doc.title}</p>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border inline-block ${catMeta.color}`}>
                            {catMeta.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => alert(`معاينة / تحميل الملف: ${doc.fileName}`)}
                          className="p-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                          title="تحميل / فتح المستند"
                        >
                          <Download className="w-4 h-4 text-emerald-700" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من حذف المستند "${doc.title}"؟`)) {
                              deleteCustomerDocument(doc.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 transition-colors"
                          title="حذف المستند"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-mono">{doc.fileName} ({doc.fileSize})</span>
                      <span>رفع: {doc.uploadedDate} بواسطة {doc.uploadedByName}</span>
                    </div>

                    {doc.notes && (
                      <p className="p-2 rounded-xl bg-white border border-slate-100 text-[11px] text-slate-600">
                        {doc.notes}
                      </p>
                    )}
                  </div>
                );
              })}
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
            <p className="text-xs text-slate-500 py-6 text-center">لا توجد سجلات صيانة أو شكاوى مسجلة</p>
          )}
        </div>
      )}

      {/* Tab 8: Audit Log & Security Trail (Prompt 5 Requirement) */}
      {activeTab === 'audit_log' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>سجل التدقيق والرقابة الشامل (Customer Audit Trail)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تتبع رقمي دقيق وغير قابل للتعديل لكافة الإجراءات والموظفين الذين تعاملوا مع ملف العميل
              </p>
            </div>

            <span className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-xl">
              إجمالي الحركات المسجلة: {customerAuditLogs.length} حدث
            </span>
          </div>

          {customerAuditLogs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
              لا توجد سجلات تدقيق سابقة لهذا العميل
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#361D13] text-white font-bold">
                  <tr>
                    <th className="p-3">التاريخ والوقت</th>
                    <th className="p-3">الموظف / المسؤول</th>
                    <th className="p-3">نوع الإجراء</th>
                    <th className="p-3">التفاصيل والبيانات</th>
                    <th className="p-3 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {customerAuditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap" dir="ltr">
                        {log.timestamp}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-[10px] text-slate-700">
                            {log.userName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-xs">{log.userName}</p>
                            <span className="text-[10px] text-slate-400">{log.userRole}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 inline-block">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 font-normal leading-relaxed max-w-md">
                        {log.details}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          log.status === 'success' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {log.status === 'success' ? 'ناجح' : 'تحذير'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      <CustomerDocumentModal
        isOpen={isDocModalOpen}
        customerId={customer.id}
        customerName={customer.fullName}
        onClose={() => setIsDocModalOpen(false)}
      />

      <OrderFormModal
        isOpen={isCreateOrderModalOpen}
        initialCustomerId={customer.id}
        onSave={(orderData) => createReadyOrder(orderData)}
        onClose={() => setIsCreateOrderModalOpen(false)}
      />

      <ProjectFormModal
        isOpen={isCreateProjectModalOpen}
        initialCustomerId={customer.id}
        onClose={() => setIsCreateProjectModalOpen(false)}
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

