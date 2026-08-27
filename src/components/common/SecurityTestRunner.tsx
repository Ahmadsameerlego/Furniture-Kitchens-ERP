import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ModuleId, PermissionActions, ApiSecurityTestResult } from '../../types/erp';
import { Terminal, Play, Lock, CheckCircle2, AlertOctagon, RefreshCw } from 'lucide-react';

interface PresetTest {
  id: string;
  name: string;
  nameEn: string;
  endpoint: string;
  method: string;
  module: ModuleId;
  action: keyof PermissionActions;
  targetBranchId?: string;
  expectedBehavior: string;
}

const presetTests: PresetTest[] = [
  {
    id: 'test-1',
    name: 'محاولة استعلام مخزون المخزن المركزي (العبور)',
    nameEn: 'Query Central Warehouse Inventory',
    endpoint: '/api/v1/branches/branch-2/inventory',
    method: 'GET',
    module: 'inventory',
    action: 'view',
    targetBranchId: 'branch-2',
    expectedBehavior: 'ينجح لأحمد (Super Admin) — يفشل لعمر (Moderator) لأن فرع العبور غير مخصص له أمنياً'
  },
  {
    id: 'test-2',
    name: 'محاولة تعديل مصفوفة صلاحيات الأدوار الإدارية',
    nameEn: 'Modify System Roles & Security Matrix',
    endpoint: '/api/v1/roles/role-admin/permissions',
    method: 'PUT',
    module: 'settings',
    action: 'edit',
    expectedBehavior: 'ينجح لأحمد — يفشل لسارة (Accountant) ولعمر لحماية إعدادات النظام الأمني'
  },
  {
    id: 'test-3',
    name: 'محاولة جلب تقارير الأرباح والتدفقات المالية',
    nameEn: 'Fetch Finance & Profitability Reports',
    endpoint: '/api/v1/finance/reports/profitability',
    method: 'GET',
    module: 'finance',
    action: 'view',
    expectedBehavior: 'ينجح لأحمد وسارة المحاسبة — يفشل لعمر مشرف المبيعات لافتقار دور المشرف للصلاحية المالية'
  },
  {
    id: 'test-4',
    name: 'محاولة اعتماد أمر تصنيع بمصنع الورشة',
    nameEn: 'Approve Production Order in Workshop',
    endpoint: '/api/v1/branches/branch-3/production/approve',
    method: 'POST',
    module: 'production',
    action: 'approve',
    targetBranchId: 'branch-3',
    expectedBehavior: 'ينجح لأحمد وخالد — يفشل لعمر لعدم نفاذه لفرع الورشة'
  }
];

export const SecurityTestRunner: React.FC = () => {
  const { runApiSecurityTest, currentUser, currentRole, activePersonaId, switchPersona } = useERP();
  const [testResults, setTestResults] = useState<ApiSecurityTestResult[]>([]);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const handleRunTest = (test: PresetTest) => {
    const res = runApiSecurityTest(
      test.endpoint,
      test.method,
      test.module,
      test.action,
      test.targetBranchId
    );
    setTestResults(prev => [res, ...prev.filter(r => r.endpoint !== test.endpoint)]);
  };

  const handleRunAll = () => {
    setIsRunningAll(true);
    const results: ApiSecurityTestResult[] = [];
    presetTests.forEach(test => {
      const res = runApiSecurityTest(
        test.endpoint,
        test.method,
        test.module,
        test.action,
        test.targetBranchId
      );
      results.push(res);
    });
    setTestResults(results);
    setTimeout(() => setIsRunningAll(false), 200);
  };

  return (
    <div className="bg-[#0B131F] text-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-800 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">محاكي فحص الأمان والخوادم الخفية (API Authorization Enforcement)</h3>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Server-Side Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              اختبار حي يثبت أن الحماية تتم سيرفراتياً على الـ Backend وليس مجرد إخفاء أزرار في الواجهة
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAll}
          disabled={isRunningAll}
          className="px-5 py-2.5 bg-[#E06F28] hover:bg-[#E06F28]/90 text-white rounded-2xl font-black text-xs shadow-lg flex items-center gap-2 transition-all self-start md:self-auto shrink-0"
        >
          <Play className={`w-4 h-4 ${isRunningAll ? 'animate-spin' : ''}`} />
          <span>تشغيل كافة اختبارات API الأربعة</span>
        </button>
      </div>

      {/* Active Persona Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-xl object-cover ring-2 ring-emerald-500/20 shrink-0" />
          <div>
            <span className="text-slate-400">الفحص باسم المستخدم: </span>
            <strong className="text-white font-black text-sm">{currentUser.fullName}</strong>
            <span className="mr-2 text-[11px] text-[#E06F28] font-bold">({currentRole.name})</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">بدل المستخدم للاختبار:</span>
          <button
            onClick={() => switchPersona(activePersonaId === 'omar_moderator' ? 'ahmed_owner' : 'omar_moderator')}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs transition-colors border border-white/10"
          >
            تبديل لـ {activePersonaId === 'omar_moderator' ? 'أحمد (Owner)' : 'عمر (Moderator)'}
          </button>
        </div>
      </div>

      {/* Preset Tests Stack */}
      <div className="space-y-4">
        {presetTests.map((test) => {
          const result = testResults.find(r => r.endpoint === test.endpoint);

          return (
            <div
              key={test.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
            >
              {/* Endpoint Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black font-mono ${
                    test.method === 'GET' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    test.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {test.method}
                  </span>
                  
                  <span className="font-mono text-xs font-bold text-amber-300 bg-black/40 px-3 py-1 rounded-xl border border-slate-800 dir-ltr text-left">
                    {test.endpoint}
                  </span>
                </div>

                <button
                  onClick={() => handleRunTest(test)}
                  className="px-4 py-2 rounded-xl bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-700/50 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>فحص الآن</span>
                </button>
              </div>

              {/* Title & Description */}
              <div>
                <p className="font-black text-white text-sm">{test.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{test.expectedBehavior}</p>
              </div>

              {/* Result output box */}
              {result && (
                <div className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                  result.isAllowed
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <div className="flex items-center gap-2">
                      {result.isAllowed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                      )}
                      <span className="text-xs">
                        استجابة الخادم: {result.statusCode} {result.isAllowed ? '200 OK (مصرح به)' : '403 Forbidden (مرفوض أمنياً)'}
                      </span>
                    </div>
                    <span className="text-[10px] opacity-75 font-mono dir-ltr">{result.timestamp}</span>
                  </div>

                  <p className="text-xs leading-relaxed font-medium pt-1 border-t border-white/10">
                    {result.reason}
                  </p>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
