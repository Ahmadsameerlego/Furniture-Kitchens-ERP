import { Customer, CustomerStatus, CustomerSource, LostReason } from '../types/erp';

export class CrmService {
  /**
   * Normalizes Egyptian phone number for accurate duplicate detection
   */
  static normalizePhone(phone: string): string {
    if (!phone) return '';
    // Remove non-numeric characters except +
    let cleaned = phone.replace(/[^\d]/g, '');
    // If starts with 20 (country code), strip 2
    if (cleaned.startsWith('20') && cleaned.length > 10) {
      cleaned = cleaned.substring(1);
    }
    // Standard Egyptian mobile length check (e.g., 01012345678)
    return cleaned;
  }

  /**
   * Checks if a phone number is already registered to prevent duplicate entries
   */
  static checkDuplicatePhone(
    phone: string,
    customers: Customer[],
    currentCustomerId?: string
  ): { isDuplicate: boolean; existingCustomer?: Customer } {
    const targetNorm = this.normalizePhone(phone);
    if (!targetNorm) return { isDuplicate: false };

    const existing = customers.find(c => {
      if (currentCustomerId && c.id === currentCustomerId) return false;
      const cPhoneNorm = this.normalizePhone(c.phone);
      const cAltPhoneNorm = c.altPhone ? this.normalizePhone(c.altPhone) : '';
      return (cPhoneNorm && cPhoneNorm === targetNorm) || (cAltPhoneNorm && cAltPhoneNorm === targetNorm);
    });

    if (existing) {
      return {
        isDuplicate: true,
        existingCustomer: existing
      };
    }

    return { isDuplicate: false };
  }

  /**
   * Human-readable label & styling for Customer Status
   */
  static getStatusMeta(status: CustomerStatus): {
    label: string;
    labelEn: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
  } {
    switch (status) {
      case 'new':
        return {
          label: 'عميل جديد',
          labelEn: 'New',
          bgClass: 'bg-blue-50',
          textClass: 'text-blue-700',
          borderClass: 'border-blue-200'
        };
      case 'contacted':
        return {
          label: 'تم التواصل',
          labelEn: 'Contacted',
          bgClass: 'bg-[#361D13]/10',
          textClass: 'text-[#361D13]',
          borderClass: 'border-[#361D13]/20'
        };
      case 'interested':
        return {
          label: 'مهتم جاد',
          labelEn: 'Interested',
          bgClass: 'bg-amber-50',
          textClass: 'text-amber-800',
          borderClass: 'border-amber-200'
        };
      case 'measurement_scheduled':
        return {
          label: 'موعد معاينة ومقاسات',
          labelEn: 'Measurement Scheduled',
          bgClass: 'bg-purple-50',
          textClass: 'text-purple-800',
          borderClass: 'border-purple-200'
        };
      case 'measured':
        return {
          label: 'تمت المعاينة',
          labelEn: 'Measured',
          bgClass: 'bg-indigo-50',
          textClass: 'text-indigo-800',
          borderClass: 'border-indigo-200'
        };
      case 'quotation':
        return {
          label: 'قيد التسعير وعرض السعر',
          labelEn: 'Quotation',
          bgClass: 'bg-sky-50',
          textClass: 'text-sky-800',
          borderClass: 'border-sky-200'
        };
      case 'won':
        return {
          label: 'تم الاتفاق والتعاقد',
          labelEn: 'Won Contract',
          bgClass: 'bg-[#C87A38]/15',
          textClass: 'text-[#C87A38]',
          borderClass: 'border-[#C87A38]/30'
        };
      case 'customer':
        return {
          label: 'عميل نشط',
          labelEn: 'Active Customer',
          bgClass: 'bg-emerald-100',
          textClass: 'text-emerald-900',
          borderClass: 'border-emerald-300'
        };
      case 'completed':
        return {
          label: 'مشروع مكتمل (ما بعد البيع)',
          labelEn: 'Completed',
          bgClass: 'bg-emerald-950',
          textClass: 'text-white',
          borderClass: 'border-emerald-900'
        };
      case 'lost':
        return {
          label: 'فرصة مفقودة (Lost)',
          labelEn: 'Lost',
          bgClass: 'bg-rose-50',
          textClass: 'text-rose-700',
          borderClass: 'border-rose-200'
        };
      default:
        return {
          label: status,
          labelEn: status,
          bgClass: 'bg-slate-100',
          textClass: 'text-slate-700',
          borderClass: 'border-slate-200'
        };
    }
  }

  /**
   * Human-readable label for Marketing Source
   */
  static getSourceLabel(source: CustomerSource): { label: string; iconColor: string } {
    switch (source) {
      case 'facebook':
        return { label: 'فيسبوك (Facebook)', iconColor: 'text-blue-600' };
      case 'instagram':
        return { label: 'انستجرام (Instagram)', iconColor: 'text-pink-600' };
      case 'tiktok':
        return { label: 'تيك توك (TikTok)', iconColor: 'text-slate-900' };
      case 'website':
        return { label: 'الموقع الإلكتروني (Website)', iconColor: 'text-emerald-600' };
      case 'whatsapp':
        return { label: 'واتساب (WhatsApp)', iconColor: 'text-emerald-500' };
      case 'walk_in':
        return { label: 'زيارة للمعرض (Walk-in)', iconColor: 'text-[#C87A38]' };
      case 'phone':
        return { label: 'اتصال هاتفي مباشر', iconColor: 'text-indigo-600' };
      case 'referral':
        return { label: 'ترشيح عميل (Referral)', iconColor: 'text-purple-600' };
      case 'other':
      default:
        return { label: 'مصدر آخر', iconColor: 'text-slate-500' };
    }
  }

  /**
   * Human-readable label for Lost Reasons
   */
  static getLostReasonLabel(reason?: LostReason): string {
    switch (reason) {
      case 'price':
        return 'السعر أعلى من الميزانية (Price)';
      case 'competitor':
        return 'شراء من منافس آخر (Competitor)';
      case 'not_interested':
        return 'غير مهتم حالياً (Not Interested)';
      case 'postponed':
        return 'تأجيل المشروع مؤقتاً (Postponed)';
      case 'could_not_contact':
        return 'تعذر التواصل مع العميل (Could Not Contact)';
      case 'changed_requirements':
        return 'تغيير متطلبات المشروع (Changed Requirements)';
      case 'other':
      default:
        return 'أسباب أخرى (Other)';
    }
  }

  /**
   * Generates WhatsApp direct chat URL (`https://wa.me/2010...`)
   */
  static getWhatsAppUrl(phone: string): string {
    const norm = this.normalizePhone(phone);
    if (!norm) return '#';
    // If starts with 0, replace with 20
    let intlPhone = norm;
    if (norm.startsWith('0')) {
      intlPhone = '20' + norm.substring(1);
    } else if (!norm.startsWith('20')) {
      intlPhone = '20' + norm;
    }
    return `https://wa.me/${intlPhone}`;
  }
}
