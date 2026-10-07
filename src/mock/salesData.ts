import { VariationOrder } from '../types/sales';

export const initialVariationOrders: VariationOrder[] = [
  {
    id: 'var-101',
    orderNumber: 'VAR-2026-001',
    contractId: 'cnt-101',
    contractNumber: 'CNT-2026-001',
    projectId: 'prj-101',
    projectNumber: 'PRJ-2026-001',
    projectName: 'مطبخ رويال مودرن HPL بجزيرة - فيلا النرجس',
    customerId: 'cust-1',
    customerName: 'م. طارق المنشاوي',
    customerPhone: '01009876543',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    requestedDate: '2026-08-27',
    requestedBy: 'customer',
    requestedByName: 'م. طارق المنشاوي (العميل)',
    reason: 'رغبة العميل في ترقية مسطح الرخام إلى كوارتز أسباني وإضافة إضاءة ليد أسفل الجزيرة',
    status: 'pending_approval',
    items: [
      {
        id: 'vi-1',
        changeType: 'upgrade_material',
        description: 'ترقية مسطح الرخام من جالاكسي أسود إلى كوارتز أسباني أبيض مع شطف شلال للجزيرة',
        previousSpec: 'رخام جالاكسي أسود 6 متر',
        newSpec: 'كوارتز أسباني أبيض 6 متر مع شطف شلال (Waterfall)',
        costImpact: 9800,
        priceImpact: 15000
      },
      {
        id: 'vi-2',
        changeType: 'add_item',
        description: 'إضافة شريط ليد بروفايل مدمج أسفل الجزيرة مع سنسور حركة',
        newSpec: 'ليد بروفايل دافئ 4.5 متر + باور سبلاي وسنسور',
        costImpact: 1700,
        priceImpact: 3500
      }
    ],
    totalPriceImpact: 18500,
    totalCostImpact: 11500,
    deliveryDelayDays: 3,
    notes: 'بانتظار توقيع العميل على ملحق العقد رقم 1. عند الاعتماد يصبح إجمالي العقد 268,500 ج.م قبل الضريبة ويتم إبلاغ المكتب الفني لتعديل الـ BOM.'
  },
  {
    id: 'var-102',
    orderNumber: 'VAR-2026-002',
    contractId: 'cnt-103',
    contractNumber: 'CNT-2026-003',
    projectId: 'prj-103',
    projectNumber: 'PRJ-2026-003',
    projectName: 'مطبخ كلاسيك قشرة أرو طبيعي - مدينة نصر',
    customerId: 'cust-12',
    customerName: 'أ. شريف مدكور',
    customerPhone: '01006677889',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    requestedDate: '2026-08-26',
    requestedBy: 'customer',
    requestedByName: 'أ. شريف مدكور (العميل)',
    reason: 'إضافة وحدة رف توابل مفتوح بجوار البوتاجاز',
    status: 'pending_approval',
    items: [
      {
        id: 'vi-3',
        changeType: 'add_item',
        description: 'وحدة رفوف توابل مفتوحة 30 سم بقشرة أرو ونفس دهان المطبخ',
        newSpec: 'وحدة 30 × 72 × 30 سم - 3 رفوف',
        costImpact: 2100,
        priceImpact: 4500
      }
    ],
    totalPriceImpact: 4500,
    totalCostImpact: 2100,
    deliveryDelayDays: 0,
    notes: 'قيد المراجعة مع المكتب الفني قبل بدء التقطيع.'
  }
];
