import React from 'react';
import { ProjectQuotation, CustomProject, Customer } from '../../types/erp';
import { OfficialQuotationSheet } from '../quotations/OfficialQuotationSheet';
import { X } from 'lucide-react';

interface OfficialQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: ProjectQuotation;
  project?: CustomProject;
  customer?: Customer;
  onApprove?: (quoteId: string) => void;
}

export const OfficialQuotationModal: React.FC<OfficialQuotationModalProps> = ({
  isOpen,
  onClose,
  quotation,
  project,
  customer,
  onApprove
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:fixed-none">
      <div className="relative w-full max-w-5xl my-auto bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-700/80 max-h-[95vh] overflow-y-auto custom-scrollbar print:max-h-none print:overflow-visible print:border-none print:p-0 print:bg-white">
        
        {/* Close button at top right */}
        <button
          onClick={onClose}
          className="print:hidden absolute top-4 left-4 sm:top-6 sm:left-6 w-9 h-9 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-all z-20 shadow-md"
          title="إغلاق النافذة"
        >
          <X className="w-5 h-5" />
        </button>

        {/* The Official Sheet */}
        <OfficialQuotationSheet
          quotation={quotation}
          project={project}
          customer={customer}
          onApprove={onApprove}
          onClose={onClose}
          showActions={true}
        />
      </div>
    </div>
  );
};
