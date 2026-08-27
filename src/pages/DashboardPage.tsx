import React from 'react';
import { useERP } from '../context/ERPContext';
import {
  Building2,
  Users,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Package,
  Layers,
  Ruler,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ChevronLeft,
  Lock,
  Boxes,
  Factory,
  UserCheck
} from 'lucide-react';
import { SecurityTestRunner } from '../components/common/SecurityTestRunner';
import { demoPersonas } from '../mock/initialData';

export const DashboardPage: React.FC = () => {
  const {
    company,
    branches,
    users,
    roles,
    auditLogs,
    currentBranch,
    currentUser,
    currentRole,
    availableBranches,
    setActiveModule,
    switchPersona,
    activePersonaId
  } = useERP();

  const currentPersona = demoPersonas.find(p => p.id === activePersonaId) || demoPersonas[0];

  return (
    <div className="space-y-6">
      
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C352D] via-[#142921] to-[#1E3A2F] text-white p-6 md:p-8 shadow-2xl border border-emerald-900/50">
        <div className="absolute top-0 left-0 translate-x-[-20%] translate-y-[-20%] w-96 h-96 bg-[#E06F28]/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-[#E06F28]" />
              <span>نظام فيرني ميكر المتخصص لأعمال الأثاث والمطابخ</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              أهلاً بك، {currentUser.fullName} 👋
            </h1>

            <p className="text-sm text-emerald-100/90 leading-relaxed font-medium">
              أنت متواجد حالياً تحت سيناريو: <strong className="text-amber-300 font-black">{currentRole.name}</strong> في فرع <strong className="text-white bg-white/10 px-2.5 py-0.5 rounded-lg">{currentBranch.name}</strong>.
            </p>

            <div className="flex flex-wrap gap-2 pt-2 text-xs font-bold">
              <span className="bg-emerald-900/80 text-emerald-200 px-3 py-1.5 rounded-xl border border-emerald-700/50 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E06F28]" />
                <span>الفرع الحالي: {currentBranch.name} {currentBranch.isMain ? '(الرئيسي)' : ''}</span>
              </span>
              
              <span className="bg-emerald-900/80 text-emerald-200 px-3 py-1.5 rounded-xl border border-emerald-700/50 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>الفروع المصرحة لحسابك: {availableBranches.length} من {branches.length} فروع</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveModule('settings')}
              className="w-full sm:w-auto px-5 py-3 bg-[#E06F28] hover:bg-[#E06F28]/90 text-white font-black text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>إدارة الشركة والفروع</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Company Profile */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">طبيعة النشاط والشركة</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1C352D] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-[#1C352D]" />
            </div>
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">
              {company.businessType === 'furniture_kitchens' ? 'أثاث ومطابخ' : company.businessType}
            </p>
            <p className="text-xs font-bold text-[#E06F28] mt-0.5">
              نموذج العمل: {company.businessModel === 'ready_custom' ? 'جاهز + تفصيل' : company.businessModel}
            </p>
          </div>
          <button
            onClick={() => setActiveModule('settings')}
            className="text-[11px] font-bold text-[#1C352D] hover:underline flex items-center gap-1 pt-1"
          >
            <span>إعدادات الشركة</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Branches */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الفروع والمقرات التابعة</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#E06F28] flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5 text-[#E06F28]" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              {branches.length} مقرات
            </p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              الفرع الرئيسي: {branches.find(b => b.isMain)?.name || 'غير محدد'}
            </p>
          </div>
          <button
            onClick={() => setActiveModule('settings')}
            className="text-[11px] font-bold text-[#1C352D] hover:underline flex items-center gap-1 pt-1"
          >
            <span>إدارة الفروع والورش</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Users */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">فريق العمل والموظفين</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              {users.length} مستخدمين
            </p>
            <p className="text-xs font-bold text-emerald-600 mt-0.5">
              كل الحسابات نشطة وتعمل بالنظام
            </p>
          </div>
          <button
            onClick={() => setActiveModule('settings')}
            className="text-[11px] font-bold text-[#1C352D] hover:underline flex items-center gap-1 pt-1"
          >
            <span>إدارة حسابات الفريق</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Security Roles */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الأدوار والصلاحيات المعتمدة</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              {roles.length} أدوار
            </p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              مصفوفة أمنية مخصصة حسب الوحدات
            </p>
          </div>
          <button
            onClick={() => setActiveModule('settings')}
            className="text-[11px] font-bold text-[#1C352D] hover:underline flex items-center gap-1 pt-1"
          >
            <span>مصفوفة الصلاحيات</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Branch Structure Summary & Current Persona Test Guidance */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Branches List and API Console */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Branch Structure Grid */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">هيكل المقرات التشغيلية والفروع للشركة</h3>
                <p className="text-xs text-slate-500">توزيع المعارض والمخازن والورش التابعة لشركة فيرني ميكر</p>
              </div>
              <button
                onClick={() => setActiveModule('settings')}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                إدارة المقرات
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map(b => {
                const isAuthorized = availableBranches.some(ab => ab.id === b.id);

                return (
                  <div
                    key={b.id}
                    className={`p-5 rounded-2xl border transition-all space-y-3 ${
                      b.isMain
                        ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20'
                        : isAuthorized
                        ? 'bg-slate-50/70 border-slate-200'
                        : 'bg-slate-100/60 border-slate-200 opacity-65'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-sm text-slate-900">{b.name}</span>
                          {b.isMain && (
                            <span className="bg-[#E06F28] text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs">
                              الفرع الرئيسي
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{b.address}</p>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl shrink-0 ${
                        b.type === 'showroom' ? 'bg-emerald-100 text-emerald-800' :
                        b.type === 'warehouse' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {b.type === 'showroom' ? 'معرض مبيعات' : b.type === 'warehouse' ? 'مخزن مركزي' : 'ورشة تصنيع'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">المدير: {b.managerName || 'غير محدد'}</span>
                      <span className={`font-black ${isAuthorized ? 'text-emerald-700' : 'text-rose-600 flex items-center gap-1'}`}>
                        {isAuthorized ? '✓ مصرح لك بالعمل' : <><Lock className="w-3.5 h-3.5" /> محظور بالحساب الحالي</>}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Security Endpoint Simulator */}
          <SecurityTestRunner />
        </div>

        {/* Right Col: Active Persona Guide & Audit Logs Stream */}
        <div className="space-y-6">
          
          {/* Active Demo Persona Guide */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-[#E06F28]" />
              <div>
                <h3 className="text-sm font-black text-slate-900">إرشادات تجربة السيناريو الحالي</h3>
                <p className="text-[11px] text-slate-500">نطاق صلاحيات الشخصية المحددة</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 space-y-2">
              <p className="font-black text-xs text-[#E06F28]">{currentPersona.name} ({currentPersona.roleTitle})</p>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {currentPersona.description}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-800 block mb-2">أبرز النقاط للاختبار بهذا السيناريو:</span>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                {currentPersona.keyTests.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="w-4 h-4 rounded-full bg-[#1C352D] text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      {idx + 1}
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Audit Log Stream */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">سجل الأحداث والأمان الأخير</h3>
              <button
                onClick={() => setActiveModule('settings')}
                className="text-xs text-[#1C352D] font-bold hover:underline"
              >
                عرض الكل
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar">
              {auditLogs.slice(0, 5).map(log => (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                    log.status === 'denied'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-slate-50 border-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 font-black">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono dir-ltr">{log.timestamp.split(' ')[1]}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{log.details}</p>
                  <div className="flex items-center justify-between text-[10px] pt-1 text-slate-500 border-t border-black/5">
                    <span>بواسطة: {log.userName}</span>
                    <span className={`font-bold ${log.status === 'denied' ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {log.status === 'denied' ? 'محظور 403' : 'تم بنجاح'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
