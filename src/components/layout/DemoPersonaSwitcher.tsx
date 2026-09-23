import React from 'react';
import { useERP } from '../../context/ERPContext';
import { demoPersonas } from '../../mock/initialData';
import { DemoPersonaId } from '../../types/erp';
import { UserCheck, Sparkles, Shield, UserX } from 'lucide-react';

export const DemoPersonaSwitcher: React.FC = () => {
  const { activePersonaId, switchPersona, currentUser } = useERP();

  return (
    <div className="bg-gradient-to-r from-[#361D13] via-[#23120A] to-[#361D13] text-white px-4 py-2 border-b border-amber-900/40 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Banner Label */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#C87A38]/20 flex items-center justify-center border border-[#C87A38]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#C87A38] animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-amber-300">اختبار سيناريوهات التجربة التفاعلية (1-Click Switcher):</span>
            <span className="text-amber-100/70 mr-1 hidden lg:inline">
              قم بالتبديل بين الشخصيات لاختبار صلاحيات الفروع والأنشطة أمنياً
            </span>
          </div>
        </div>

        {/* Persona Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
          {demoPersonas.map((persona) => {
            const isActive = activePersonaId === persona.id && currentUser.id === persona.userId;

            return (
              <button
                key={persona.id}
                onClick={() => switchPersona(persona.id as DemoPersonaId)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all duration-200 font-medium whitespace-nowrap text-xs ${
                  isActive
                    ? 'bg-[#C87A38] text-white shadow-md font-bold ring-2 ring-amber-300/30'
                    : 'bg-white/10 hover:bg-white/20 text-amber-100'
                }`}
              >
                <UserCheck className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-amber-300'}`} />
                <span>{persona.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${isActive ? 'bg-black/20 text-white' : 'bg-black/30 text-amber-200'}`}>
                  {persona.roleTitle.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
