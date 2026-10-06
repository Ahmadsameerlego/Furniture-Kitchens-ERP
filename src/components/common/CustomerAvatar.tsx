import React from 'react';
import { CustomerType } from '../../types/erp';
import { CrmService } from '../../services/crmService';
import { Building2 } from 'lucide-react';

interface CustomerAvatarProps {
  name: string;
  customerType?: CustomerType;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CustomerAvatar: React.FC<CustomerAvatarProps> = ({
  name,
  customerType = 'individual',
  size = 'md',
  className = ''
}) => {
  const isCommercial = customerType === 'commercial';
  const initials = CrmService.getInitials(name);

  // Size configurations
  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm font-black',
    xl: 'w-14 h-14 text-base font-black'
  };

  // Clean, modern aesthetic with subtle gradient
  const themeClasses = isCommercial
    ? 'bg-slate-900 text-indigo-300 ring-1 ring-indigo-500/20 shadow-xs'
    : 'bg-[#361D13] text-[#E5A86D] ring-1 ring-[#C87A38]/30 shadow-xs';

  return (
    <div className={`relative shrink-0 flex items-center justify-center rounded-xl font-bold tracking-wider select-none ${sizeClasses[size]} ${themeClasses} ${className}`}>
      <span>{initials}</span>

      {/* Commercial Icon Badge */}
      {isCommercial && size !== 'xs' && (
        <span
          title="عميل تجاري / شركة"
          className="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center ring-2 ring-white text-[8px] shadow-xs"
        >
          <Building2 className="w-2 h-2" />
        </span>
      )}
    </div>
  );
};
