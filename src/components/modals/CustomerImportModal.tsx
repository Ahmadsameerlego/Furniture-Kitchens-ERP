import React, { useState, useRef } from 'react';
import { useERP } from '../../context/ERPContext';
import { Customer, CustomerType, CustomerInterestType, CustomerBillingMethod } from '../../types/erp';
import { CrmService } from '../../services/crmService';
import { downloadCustomerImportTemplate, parseCSVContent } from '../../utils/excelExport';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  Building2,
  UserCheck,
  FileCheck
} from 'lucide-react';

interface CustomerImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (count: number) => void;
}

interface ParsedCustomerRow {
  isValid: boolean;
  errors: string[];
  customerType: CustomerType;
  fullName: string;
  companyName?: string;
  contactPerson?: string;
  phone: string;
  altPhone?: string;
  email?: string;
  city: string;
  area: string;
  address?: string;
  interestType: CustomerInterestType;
  billingMethod: CustomerBillingMethod;
  source: any;
  notes?: string;
  isDuplicatePhone?: boolean;
}

export const CustomerImportModal: React.FC<CustomerImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const { customers, availableBranches, currentUser, users, importCustomers } = useERP();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedRows, setParsedRows] = useState<ParsedCustomerRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(availableBranches[0]?.id || 'branch-1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const rawRows = parseCSVContent(text);
      if (rawRows.length <= 1) {
        setParsedRows([]);
        return;
      }

      // First row is headers, process subsequent rows
      const dataRows = rawRows.slice(1);
      const parsed: ParsedCustomerRow[] = dataRows.map((cols) => {
        const errors: string[] = [];
        const typeRaw = (cols[0] || '').trim().toLowerCase();
        const isCommercial = typeRaw.includes('تجاري') || typeRaw.includes('commercial') || typeRaw.includes('شرك');
        const customerType: CustomerType = isCommercial ? 'commercial' : 'individual';

        const fullName = (cols[1] || '').trim();
        const companyName = (cols[2] || '').trim();
        const contactPerson = (cols[3] || '').trim();
        const phone = (cols[4] || '').trim();
        const altPhone = (cols[5] || '').trim();
        const email = (cols[6] || '').trim();
        const city = (cols[7] || 'القاهرة').trim();
        const area = (cols[8] || '').trim();
        const address = (cols[9] || '').trim();

        // Interest mapping
        const interestRaw = (cols[10] || '').trim().toLowerCase();
        let interestType: CustomerInterestType = 'both';
        if (interestRaw.includes('تفصيل') || interestRaw.includes('مطبخ') || interestRaw.includes('custom') || interestRaw.includes('kitchen')) {
          interestType = 'kitchens';
        } else if (interestRaw.includes('جاهز') || interestRaw.includes('اثاث') || interestRaw.includes('furniture')) {
          interestType = 'furniture';
        }

        // Billing method mapping
        const billingRaw = (cols[11] || '').trim().toLowerCase();
        let billingMethod: CustomerBillingMethod = 'printed';
        if (billingRaw.includes('ضريب') || billingRaw.includes('eta') || billingRaw.includes('tax')) {
          billingMethod = 'electronic_tax';
        } else if (billingRaw.includes('إيميل') || billingRaw.includes('ايميل') || billingRaw.includes('email') || billingRaw.includes('بريد')) {
          billingMethod = 'email';
        } else if (billingRaw.includes('واتس') || billingRaw.includes('whatsapp')) {
          billingMethod = 'whatsapp';
        }

        const sourceRaw = (cols[12] || 'walk_in').trim().toLowerCase();
        const notes = (cols[13] || '').trim();

        if (!fullName) {
          errors.push('اسم العميل مطلوب');
        }
        if (!phone) {
          errors.push('رقم الهاتف مطلوب');
        }

        const dupCheck = CrmService.checkDuplicatePhone(phone, customers);

        return {
          isValid: errors.length === 0,
          errors,
          customerType,
          fullName,
          companyName: isCommercial ? (companyName || fullName) : undefined,
          contactPerson: isCommercial ? contactPerson : undefined,
          phone,
          altPhone: altPhone || undefined,
          email: email || undefined,
          city,
          area,
          address: address || undefined,
          interestType,
          billingMethod,
          source: (sourceRaw === 'instagram' || sourceRaw === 'facebook' || sourceRaw === 'tiktok' || sourceRaw === 'website' || sourceRaw === 'whatsapp' || sourceRaw === 'phone' || sourceRaw === 'referral') ? sourceRaw : 'walk_in',
          notes: notes || undefined,
          isDuplicatePhone: dupCheck.isDuplicate
        };
      });

      setParsedRows(parsed.filter(r => r.fullName || r.phone));
    };

    reader.readAsText(file, 'UTF-8');
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) return;

    setIsProcessing(true);

    const selectedBranch = availableBranches.find(b => b.id === selectedBranchId);
    const branchName = selectedBranch?.name || 'المعرض الرئيسي';
    const year = new Date().getFullYear();
    const today = new Date().toISOString().substring(0, 10);
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    let currentCount = customers.length;

    const customersToAdd: Customer[] = validRows.map((row) => {
      currentCount++;
      const code = `CUST-${year}-${String(currentCount).padStart(4, '0')}`;

      return {
        id: `cust-imp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        code,
        customerType: row.customerType,
        fullName: row.fullName,
        companyName: row.companyName,
        contactPerson: row.contactPerson,
        phone: row.phone,
        altPhone: row.altPhone,
        email: row.email,
        city: row.city,
        area: row.area,
        address: row.address,
        interestType: row.interestType,
        status: 'new',
        billingMethod: row.billingMethod,
        tier: row.customerType === 'commercial' ? 'wholesale' : 'standard',
        source: row.source,
        branchId: selectedBranchId,
        branchName,
        responsibleUserId: currentUser.id,
        responsibleUserName: currentUser.fullName,
        notes: row.notes,
        createdDate: today,
        lastActivityDate: timestamp,
        hasPurchased: false,
        isAfterSales: false
      };
    });

    importCustomers(customersToAdd);
    setIsProcessing(false);
    onImportSuccess(customersToAdd.length);
    onClose();
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;
  const duplicateCount = parsedRows.filter(r => r.isDuplicatePhone).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5 relative max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#361D13] text-[#C87A38] flex items-center justify-center font-bold shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">استيراد قائمة عملاء من ملف Excel / CSV</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                رفع بيانات مجمعة للعملاء التجاريين والأفراد مع التحقق الفوري وتوليد الأكواد تلقائياً
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Download Template & Branch Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-3">
            <div>
              <p className="font-black text-xs text-amber-950">نموذج الإكسل الاسترشادي</p>
              <p className="text-[11px] text-amber-800/80 mt-0.5">تحميل قالب مهيأ بالأعمدة والبيانات النموذجية</p>
            </div>
            <button
              type="button"
              onClick={downloadCustomerImportTemplate}
              className="px-3 py-2 bg-white hover:bg-amber-100 text-amber-950 font-bold text-xs rounded-xl border border-amber-300 shadow-xs flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#C87A38]" />
              <span>تحميل النموذج</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <label className="block font-bold text-xs text-slate-700">الفرع المسؤول عن العملاء المستوردين:</label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-800"
            >
              {availableBranches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 2: Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#C87A38]/40 hover:border-[#C87A38] bg-[#C87A38]/5 rounded-3xl p-6 text-center cursor-pointer transition-all space-y-2 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#361D13] text-[#C87A38] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <p className="font-black text-sm text-slate-900">
            {fileName ? `الملف المحدد: ${fileName}` : 'اضغط هنا لاختيار ملف الـ CSV / Excel من جهازك'}
          </p>
          <p className="text-xs text-slate-500">
            يدعم ملفات CSV بترميز UTF-8 المتوافقة مع اللغة العربية
          </p>
        </div>

        {/* Step 3: Parse Summary & Live Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-3">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>جاهز للاستيراد: {validCount} عميل</span>
              </span>

              {duplicateCount > 0 && (
                <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>تنبيه: {duplicateCount} عميل برقم هاتف مسجل مسبقاً</span>
                </span>
              )}

              {invalidCount > 0 && (
                <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-rose-600" />
                  <span>غير صالح: {invalidCount} صف</span>
                </span>
              )}
            </div>

            {/* Preview Table */}
            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#361D13] text-white font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5">النوع</th>
                    <th className="p-2.5">الاسم</th>
                    <th className="p-2.5">الهاتف</th>
                    <th className="p-2.5">المدينة</th>
                    <th className="p-2.5">الاهتمام</th>
                    <th className="p-2.5">الفوترة</th>
                    <th className="p-2.5">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                  {parsedRows.map((r, i) => (
                    <tr key={i} className={!r.isValid ? 'bg-rose-50/50' : r.isDuplicatePhone ? 'bg-amber-50/40' : 'hover:bg-slate-50'}>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          r.customerType === 'commercial' ? 'bg-indigo-100 text-indigo-900' : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {r.customerType === 'commercial' ? 'تجاري' : 'فردي'}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-900">{r.fullName}</div>
                        {r.companyName && <div className="text-[10px] text-slate-500">{r.companyName}</div>}
                      </td>
                      <td className="p-2.5 font-mono dir-ltr text-left">{r.phone}</td>
                      <td className="p-2.5">{r.city} - {r.area}</td>
                      <td className="p-2.5">
                        {r.interestType === 'kitchens' ? 'تفصيل' : r.interestType === 'furniture' ? 'جاهز' : 'كلاهما'}
                      </td>
                      <td className="p-2.5 text-[11px]">
                        {r.billingMethod === 'electronic_tax' ? 'ضريبية' : r.billingMethod === 'email' ? 'إيميل' : r.billingMethod === 'whatsapp' ? 'واتساب' : 'ورقية'}
                      </td>
                      <td className="p-2.5">
                        {r.isValid ? (
                          r.isDuplicatePhone ? (
                            <span className="text-amber-700 font-bold text-[10px]">مكرر هاتفياً</span>
                          ) : (
                            <span className="text-emerald-700 font-bold text-[10px]">صالح ✓</span>
                          )
                        ) : (
                          <span className="text-rose-700 font-bold text-[10px]">{r.errors.join(', ')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 text-xs transition-colors"
          >
            إلغاء
          </button>

          <button
            type="button"
            disabled={validCount === 0 || isProcessing}
            onClick={handleConfirmImport}
            className="px-6 py-2.5 rounded-xl bg-[#361D13] hover:bg-[#23120A] text-white font-black text-xs shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileCheck className="w-4 h-4 text-[#C87A38]" />
            <span>{isProcessing ? 'جاري الاستيراد...' : `تأكيد استيراد (${validCount}) عميل للنظام`}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
