import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { BrandLogo } from '../components/branding/BrandLogo';
import { demoPersonas } from '../mock/initialData';
import { ShieldCheck, LogIn, Lock, Sparkles, Building2, Layers } from 'lucide-react';
import { DemoPersonaId } from '../types/erp';

export const LoginPage: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const { switchPersona, company } = useERP();
  const [selectedPersona, setSelectedPersona] = useState<DemoPersonaId>('ahmed_owner');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switchPersona(selectedPersona);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[#142921] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1C352D] rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#E06F28]/20 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10 space-y-6">
        
        {/* Logo Card */}
        <div className="text-center space-y-3">
          <div className="inline-block p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
            <BrandLogo size="xl" variant="dark" showSubtext={true} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-2">
              نظام إدارة شركات الأثاث والمطابخ
            </h1>
            <p className="text-xs text-emerald-200/70 mt-1">
              الأساس المعياري الشامل للمعارض والمصانع والورش في مصر
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/15 shadow-2xl text-white space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-bold text-emerald-200">اختر سيناريو الدخول للتجربة:</span>
            <span className="text-[10px] bg-[#E06F28] px-2 py-0.5 rounded text-white font-bold">
              3 سيناريوهات جاهزة
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            
            <div className="space-y-2">
              {demoPersonas.map((persona) => {
                const isSelected = selectedPersona === persona.id;

                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => setSelectedPersona(persona.id as DemoPersonaId)}
                    className={`w-full p-3.5 rounded-2xl border text-right transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-[#E06F28] text-white border-[#E06F28] font-bold shadow-lg ring-2 ring-amber-300/30'
                        : 'bg-black/20 text-emerald-100 border-white/10 hover:bg-black/30'
                    }`}
                  >
                    <div>
                      <p className="font-black text-xs">{persona.name}</p>
                      <span className={`text-[10px] ${isSelected ? 'text-white' : 'text-emerald-300'}`}>
                        {persona.roleTitle}
                      </span>
                      <p className="text-[10px] opacity-80 mt-1 line-clamp-1">{persona.description}</p>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                      isSelected ? 'bg-white text-[#E06F28] border-white' : 'border-white/30'
                    }`}>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#E06F28]"></span>}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#E06F28] hover:bg-[#E06F28]/90 text-white font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>دخول النظام وحفظ التجسيد المختار</span>
            </button>
          </form>

          {/* Company Scope Footer info */}
          <div className="pt-2 text-center border-t border-white/10 text-[11px] text-emerald-200/60">
            <div className="flex items-center justify-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-[#E06F28]" />
              <span>شركة فيرني ميكر (أثاث ومطابخ - جاهز وتفصيل)</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
