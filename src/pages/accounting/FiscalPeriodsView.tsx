// ====================================================
// REWAQ ERP — FISCAL PERIODS & MONTH-END CLOSING VIEW
// Monthly Period Locking, CFO Reopen Governance & Audit Trail
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { FiscalPeriod } from '../../types/accounting';
import {
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  Scale,
  UserCheck,
  FileSpreadsheet,
  HelpCircle,
  X,
  Info
} from 'lucide-react';

export const FiscalPeriodsView: React.FC = () => {
  const {
    fiscalPeriods,
    toggleFiscalPeriodLock,
    showToast,
    setActiveModule,
    currentUser,
    currentRole,
    switchPersona
  } = useERP();

  const [selectedPeriodForReopen, setSelectedPeriodForReopen] = useState<FiscalPeriod | null>(null);
  const [reopenReason, setReopenReason] = useState<string>('');
  const [cfoAcknowledged, setCfoAcknowledged] = useState<boolean>(false);
  const [showCloseConfirmModal, setShowCloseConfirmModal] = useState<FiscalPeriod | null>(null);

  // Check if current user has CFO / Financial Manager / Super Admin authority
  const isCFOAuthorized =
    currentRole.id === 'cfo' ||
    currentRole.id === 'super_admin' ||
    currentRole.id === 'general_manager' ||
    currentUser.roleId === 'cfo' ||
    currentUser.roleId === 'super_admin';

  const totalPeriods = fiscalPeriods.length;
  const closedPeriodsCount = fiscalPeriods.filter(p => p.isClosed).length;
  const openPeriodsCount = fiscalPeriods.filter(p => !p.isClosed).length;

  const handleOpenLockClick = (period: FiscalPeriod) => {
    if (period.isClosed) {
      // Trying to reopen a closed period -> require CFO authorization flow
      setSelectedPeriodForReopen(period);
      setReopenReason('');
      setCfoAcknowledged(false);
    } else {
      // Closing an open period -> prompt confirmation
      setShowCloseConfirmModal(period);
    }
  };

  const handleConfirmClose = () => {
    if (!showCloseConfirmModal) return;
    toggleFiscalPeriodLock(showCloseConfirmModal.id);
    setShowCloseConfirmModal(null);
  };

  const handleConfirmReopen = () => {
    if (!selectedPeriodForReopen) return;
    if (!isCFOAuthorized) {
      showToast('خطأ رقابي: فقط المدير المالي (CFO) يملك صلاحية إعادة فتح الفترات المقفلة', 'error');
      return;
    }
    if (reopenReason.trim().length < 5) {
      showToast('يرجى كتابة سبب تفصيلي واضح لإعادة فتح الفترة المحاسبية', 'warning');
      return;
    }
    if (!cfoAcknowledged) {
      showToast('يجب تأكيد الإقرار بالمسؤولية المالية للمتابعة', 'warning');
      return;
    }

    toggleFiscalPeriodLock(selectedPeriodForReopen.id, reopenReason.trim());
    setSelectedPeriodForReopen(null);
    setReopenReason('');
    setCfoAcknowledged(false);
  };

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Calendar className="w-3.5 h-3.5" />
            <span>الرقابة الدورية وإقفال الحسابات — Fiscal Calendar & Month-End Close</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-[#C87A38]" />
            <span>الفترات المحاسبية وإقفال الشهور</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            التحكم الصارم في قفل الفترات المحاسبية لمنع ترحيل أي قيود أو تعديلات بأثر رجعي، مع ضمان عدم إعادة فتح أي شهر مقفل إلا بتصريح رسمي ومسؤولية مباشرة من <strong className="text-amber-300 font-bold">المدير المالي (CFO)</strong>.
          </p>
        </div>

        <button
          onClick={() => setActiveModule('acc_reports')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C87A38] hover:bg-amber-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all shrink-0"
        >
          <Scale className="w-4 h-4" />
          <span>مراجعة ميزان الإقفال</span>
        </button>
      </div>

      {/* 2. STATS & GOVERNANCE BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold">إجمالي الفترات المالية</p>
            <p className="text-xl font-black text-slate-900">{totalPeriods} شهراً</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <Unlock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold">فترات مفتوحة للترحيل</p>
            <p className="text-xl font-black text-emerald-700">{openPeriodsCount} فترات</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold">فترات مقفلة نهائياً</p>
            <p className="text-xl font-black text-rose-700">{closedPeriodsCount} فترات</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold">المستخدم الحالي</p>
            <p className="text-xs font-black text-slate-800 truncate">{currentUser.fullName}</p>
            <p className={`text-[10px] font-bold ${isCFOAuthorized ? 'text-emerald-700' : 'text-slate-400'}`}>
              {isCFOAuthorized ? '✓ مفوض كمدير مالي / إدارة' : '• مستخدم عادي (قراءة وقفل فقط)'}
            </p>
          </div>
        </div>
      </div>

      {/* POLICY ALERT */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-black text-amber-950 block mb-0.5">ضابط الرقابة المالية والحوكمة:</strong>
          عند إقفال أي شهر مالي، يُمنع النظام تلقائياً من تسجيل أي قيود يومية، أو أذون مخزنية، أو فواتير مشتريات/مبيعات بتواريخ تقع ضمن تلك الفترة. <span className="font-bold underline">لا يمكن إعادة فتح أي فترة مقفلة إلا بواسطة المدير المالي (CFO) حصراً</span> مع تدوين السبب رسمياً في سجل الرقابة المالي وعلى مسؤوليته المباشرة.
        </div>
      </div>

      {/* 3. PERIODS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span className="font-black text-xs text-slate-800">جدول فترات السنة المالية 2026</span>
          </div>
          <span className="text-xs text-slate-500 font-bold">السنة المالية: 01/01/2026 - 31/12/2026</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3.5 px-3 min-w-[110px]">اسم الفترة المحاسبية</th>
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[50px]">السنة</th>
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[70px]">تاريخ البداية</th>
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[70px]">تاريخ النهاية</th>
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[90px] text-center">حالة القفل والترحيل</th>
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[100px]">معلومات الإقفال</th>
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[100px] text-center">الإجراءات والتحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fiscalPeriods.map(period => (
                <tr key={period.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${!period.isClosed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span>{period.name}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 font-mono whitespace-nowrap">{period.year}</td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono whitespace-nowrap">{period.startDate}</td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono whitespace-nowrap">{period.endDate}</td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black shadow-2xs whitespace-nowrap ${
                      !period.isClosed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {!period.isClosed ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      <span>{!period.isClosed ? 'مفتوحة للترحيل والقيود' : 'مقفلة ومغلقة نهائياً'}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-[11px] text-slate-500">
                    {period.isClosed ? (
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-700">أقفلها: {period.closedByUserName || 'الإدارة المالية'}</p>
                        {period.closedAt && <p className="font-mono text-[10px] text-slate-400 whitespace-nowrap">{period.closedAt}</p>}
                      </div>
                    ) : (
                      <span className="text-slate-400 font-italic">— نشطة حالياً —</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {!period.isClosed ? (
                      <button
                        onClick={() => handleOpenLockClick(period)}
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl font-bold text-xs transition-all shadow-2xs flex items-center gap-1.5 mx-auto"
                        title="إقفال الفترة المحاسبية لمنع أي قيود أو تعديلات"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>إقفال الشهر المالي</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenLockClick(period)}
                        className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-black text-xs transition-all shadow-2xs flex items-center gap-1.5 mx-auto"
                        title="يتطلب موافقة وإقرار المدير المالي حصراً"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                        <span>إعادة فتح (بإذن المدير المالي)</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 4. MODALS */}
      {/* ==================================================== */}

      {/* A. CONFIRM CLOSE MODAL */}
      {showCloseConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-600" />
                <span>تأكيد إقفال الفترة المحاسبية</span>
              </h3>
              <button
                onClick={() => setShowCloseConfirmModal(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                أنت على وشك إقفال الفترة المالية: <strong className="text-slate-900 font-bold">{showCloseConfirmModal.name}</strong> ({showCloseConfirmModal.startDate} إلى {showCloseConfirmModal.endDate}).
              </p>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-1 text-[11px]">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>النتيجة المترتبة على الإقفال:</span>
                </p>
                <p>• منع إضافة أو تعديل أو إلغاء قيود اليومية ضمن هذا الشهر.</p>
                <p>• تثبيت ميزان المراجعة وقائمة الدخل الصادرة للشهر.</p>
                <p>• لن تتمكن من إعادة فتح هذه الفترة إلا عبر إقرار رسمي من المدير المالي.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCloseConfirmModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmClose}
                className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>تأكيد الإقفال ومنع التعديل</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* B. CFO REOPEN AUTHORIZATION MODAL */}
      {selectedPeriodForReopen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl text-right space-y-4 border border-amber-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>إعادة فتح فترة محاسبية مقفلة — تصريح المدير المالي</span>
              </h3>
              <button
                onClick={() => setSelectedPeriodForReopen(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If NOT authorized CFO */}
            {!isCFOAuthorized ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-2">
                  <div className="flex items-center gap-2 font-black text-rose-950 text-sm">
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                    <span>صلاحية محظورة — مطلوب موافقة المدير المالي (CFO)</span>
                  </div>
                  <p className="leading-relaxed">
                    حسابك الحالي <strong className="font-bold">({currentUser.fullName} - {currentRole.name})</strong> لا يملك صلاحية الرقابة اللازمة لفتح الفترات المالية المقفلة.
                  </p>
                  <p className="text-[11px] text-rose-800">
                    هذا القيد وُضع لضمان سلامة القوائم المالية ومنع أي تلاعب بالدفاتر بأثر رجعي دون علم القيادة المالية.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-600">لتجربة هذه الصلاحية في الديمو:</span>
                  <button
                    onClick={() => {
                      switchPersona('ahmed_owner');
                      showToast('تم التبديل إلى شخصية الإدارة العليا / المدير التنفيذي', 'info');
                    }}
                    className="px-3 py-1.5 bg-[#C87A38] hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs"
                  >
                    تبديل لشخصية الإدارة العليا
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedPeriodForReopen(null)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            ) : (
              /* If CFO AUTHORIZED */
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-amber-500/10 border border-amber-300 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-black text-amber-950 text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>إقرار بالمسؤولية الرقابية والمالية المباشرة:</span>
                  </div>
                  <p className="text-amber-900 leading-relaxed text-[11px]">
                    أنت بصدد إعادة فتح الفترة المحاسبية: <strong className="font-black text-slate-900">[{selectedPeriodForReopen.name}]</strong>. فتح هذه الفترة يسمح للمحاسبين بتسجيل قيود وتعديلات مالية بأثر رجعي قد تؤثر على الأرصدة الختامية وموازين المراجعة المعتمدة سابقاً.
                  </p>
                  <p className="text-[11px] font-bold text-amber-800">
                    ⚖️ سيتم قيد هذا الإجراء في سجل المراجعة باسمك: <span className="text-slate-900 underline">{currentUser.fullName} ({currentRole.name})</span>.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    سبب ومبرر إعادة فتح الفترة المحاسبية <span className="text-rose-500 font-bold">* (إلزامي للرقابة)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    placeholder="اكتب المبرر المالي لفتح الفترة (مثال: إعادة فتح استثنائية لإدخال تسوية إهلاك سنوية أو تعديل ضريبي معتمد)..."
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-xs text-slate-800 resize-none"
                  />
                  <p className="text-[10px] text-slate-400">الحد الأدنى 5 أحرف لتوثيق السبب في سجل التدقيق.</p>
                </div>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-all">
                  <input
                    type="checkbox"
                    checked={cfoAcknowledged}
                    onChange={(e) => setCfoAcknowledged(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-700 font-bold leading-relaxed">
                    أقر أنا بصفتي <span className="text-amber-900 font-black">{currentRole.name}</span> بمسؤوليتي الكاملة عن فتح هذه الفترة المحاسبية وما يترتب عليها من تعديلات قيود بأثر رجعي.
                  </span>
                </label>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedPeriodForReopen(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    disabled={reopenReason.trim().length < 5 || !cfoAcknowledged}
                    onClick={handleConfirmReopen}
                    className={`px-5 py-2 rounded-xl font-black text-xs shadow-md flex items-center gap-1.5 transition-all ${
                      reopenReason.trim().length >= 5 && cfoAcknowledged
                        ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>تأكيد إعادة الفتح وتوثيق المسؤولية</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
