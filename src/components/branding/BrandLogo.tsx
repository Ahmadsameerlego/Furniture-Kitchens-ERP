import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'auto';
  showSubtext?: boolean;
  hideText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'light',
  showSubtext = true,
  hideText = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textClasses = {
    sm: 'text-sm font-bold',
    md: 'text-lg font-black tracking-tight',
    lg: 'text-xl font-black tracking-tight',
    xl: 'text-2xl font-black tracking-tight'
  };

  const textColor = variant === 'dark' ? 'text-white' : 'text-[#361D13]';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Furniture Land Brand Logo Image */}
      <div className="relative group shrink-0">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#361D13] to-[#C87A38] rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
        <img
          src="/logo.jpg"
          alt="Furniture Land Logo"
          className={`${sizeClasses[size]} rounded-full object-cover relative shadow-xs border border-white/20`}
        />
      </div>

      {!hideText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`font-sans ${textClasses[size]} ${textColor} truncate`}>
              فيرنتشر لاند
            </span>
            <span className="bg-[#C87A38]/20 text-[#C87A38] text-[9px] font-black px-1.5 py-0.2 rounded border border-[#C87A38]/40 uppercase tracking-wider shrink-0">
              ERP
            </span>
          </div>
          
          {showSubtext && (
            <span className={`text-[10px] font-medium ${variant === 'dark' ? 'text-amber-200/70' : 'text-slate-500'} truncate`}>
              Furniture Land Natural Home
            </span>
          )}
        </div>
      )}
    </div>
  );
};
