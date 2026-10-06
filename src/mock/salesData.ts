import { VariationOrder } from '../types/sales';

export const initialVariationOrders: VariationOrder[] = [
  {
    id: 'var-101',
    orderNumber: 'VAR-2026-001',
    contractId: 'cnt-101',
    contractNumber: 'CNT-2026-001',
    projectId: 'prj-101',
    projectNumber: 'PRJ-2026-001',
    projectName: 'مطبخ مودرن رويل HPL فاخر',
    customerId: 'cust-1',
    customerName: 'محمد حسن',
    customerPhone: '01009876543',
    branchId: 'branch-1',
    branchName: 'المعرض الرئيسي - القاهرة',
    requestedDate: '2026-08-28',
    requestedBy: 'customer',
    requestedByName: 'محمد حسن (العميل)',
    reason: 'رغبة العميل في ترقية مسطح الرخام إلى كوارتز أسباني وإضافة وحدة إضاءة ليد إضافية للجزيرة',
    status: 'approved',
    items: [
      {
        id: 'vi-1',
        changeType: 'upgrade_material',
        description: 'ترقية مسطح الرخام من جالاكسي أسود إلى كوارتز أسباني بيور وايت مقاوم للبقع',
        previousSpec: 'رخام جالاكسي أسود 6 متر',
        newSpec: 'كوارتز أسباني ناصع البياض 6 متر مع شطف شلال (Waterfall)',
        costImpact: 4500,
        priceImpact: 7500
      },
      {
        id: 'vi-2',
        changeType: 'add_item',
        description: 'إضافة شريط ليد بروفايل ذكي مدمج بأسفل جزيرة المطبخ مع سنسور حركة',
        newSpec: 'ليد بروفايل دافئ 4.5 متر + باور سبلاي وسنسور',
        costImpact: 850,
        priceImpact: 1600
      }
    ],
    totalPriceImpact: 9100,
    totalCostImpact: 5350,
    deliveryDelayDays: 3,
    approvedDate: '2026-08-29 11:30',
    approvedByName: 'أحمد سمير (مدير المبيعات)',
    notes: 'تم توقيع ملحق العقد رقم 1 وتعديل إجمالي العقد من 118,500 إلى 127,600 ج.م وإبلاغ المكتب الفني لتعديل الـ BOM.'
  },
  {
    id: 'var-102',
    orderNumber: 'VAR-2026-002',
    contractId: 'cnt-102',
    contractNumber: 'CNT-2026-002',
    projectId: 'prj-103',
    projectNumber: 'PRJ-2026-003',
    projectName: 'وحدة تلفزيون مودرن خشابي + مكتبة',
    customerId: 'cust-3',
    customerName: 'سارة علي',
    customerPhone: '01223344556',
    branchId: 'branch-1',
    branchName: 'المعرض الرئيسي - القاهرة',
    requestedDate: '2026-08-30',
    requestedBy: 'customer',
    requestedByName: 'سارة علي',
    reason: 'طلب زيادة عمق الرفوف الزجاجية وتغيير لون الإضاءة من أبيض إلى وورم',
    status: 'pending_approval',
    items: [
      {
        id: 'vi-3',
        changeType: 'dimension_change',
        description: 'زيادة عمق أرفف المكتبة الزجاجية من 25 سم إلى 35 سم',
        previousSpec: 'زجاج سيكوريت 8مم عمق 25 سم',
        newSpec: 'زجاج سيكوريت 10مم عمق 35 سم مدعم',
        costImpact: 900,
        priceImpact: 1500
      }
    ],
    totalPriceImpact: 1500,
    totalCostImpact: 900,
    deliveryDelayDays: 0,
    notes: 'قيد المراجعة مع المكتب الفني للتأكد من قدرة التثبيت الجداري'
  }
];
