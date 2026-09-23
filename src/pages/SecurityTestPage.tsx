import React from 'react';
import { useERP } from '../context/ERPContext';
import { SecurityTestRunner } from '../components/common/SecurityTestRunner';
import { ShieldCheck, Lock, CheckCircle2, AlertOctagon, Terminal } from 'lucide-react';
import { demoPersonas } from '../mock/initialData';

export const SecurityTestPage: React.FC = () => {
  const { currentUser, currentRole, activePersonaId, switchPersona } = useERP();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">منصة اختبار الجدار الأمني والخوادم (Security Architecture Verification)</h1>
            <span className="bg-[#C87A38]/15 text-[#C87A38] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#C87A38]/30">
              Server-Side Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            التحقق من فصل الأدوار (WHAT) وتقييد صلاحيات الفروع (WHERE) بشكل محمي 100% على مستوى الـ Backend
          </p>
        </div>
      </div>

      {/* Core Architectural Rule Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-[#361D13] text-white space-y-2 border border-emerald-800/50 shadow-md">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#C87A38]" />
            <h3 className="font-black text-sm">1. الدور الوظيفي (ROLE)</h3>
          </div>
          <p className="text-amber-300 font-bold text-xs">يجيب عن سؤال: WHAT CAN USER DO?</p>
          <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
            يحدد مصفوفة الصلاحيات المسموح بها على مستوى كل وحدة من وحدات ERP (عرض، إضافة، تعديل، حذف، اعتماد، تصدير).
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[#0F172A] text-white space-y-2 border border-slate-800 shadow-md">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-sm">2. نطاق الفروع (BRANCH ACCESS)</h3>
          </div>
          <p className="text-amber-300 font-bold text-xs">يجيب عن سؤال: WHERE CAN USER DO IT?</p>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            يحدد قائمة الفروع والمقارات (معارض، مخازن، ورش) المصرح للحساب بالنفاذ لبياناتها دون كشف باقي الفروع.
          </p>
        </div>
      </div>

      {/* Scenarios Guidance Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">
          اختر الشخصية المطلوبة للاختبار المباشر:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {demoPersonas.map(persona => {
            const isActive = currentUser.id === persona.userId;

            return (
              <button
                key={persona.id}
                onClick={() => switchPersona(persona.id as any)}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between space-y-3 ${
                  isActive
                    ? 'bg-emerald-950 text-white border-[#361D13] ring-2 ring-emerald-500/30 shadow-lg'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm">{persona.name}</span>
                  {isActive && <CheckCircle2 className="w-5 h-5 text-[#C87A38]" />}
                </div>

                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isActive ? 'bg-[#C87A38] text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {persona.roleTitle}
                  </span>
                  <p className="text-xs opacity-80 mt-2 line-clamp-2">{persona.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Security Endpoint Test Runner */}
      <SecurityTestRunner />

    </div>
  );
};
