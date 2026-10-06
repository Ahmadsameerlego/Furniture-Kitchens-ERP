import {
  Material,
  PurchaseOrder,
  StockMovement,
  StockTransfer,
  SupplierReturn,
  SystemNotification
} from '../types/erp';

export const initialMaterials: Material[] = [
  {
    id: 'mat-1',
    name: 'MDF أبيض 18مم اسباني',
    nameEn: 'MDF White 18mm Spanish',
    code: 'MAT-MDF-W18',
    category: 'mdf',
    categoryName: 'ألواح MDF وكونتر',
    unit: 'Sheet',
    description: 'ألواح خشب MDF أبيض ميلامين وجهين مفرغ اسباني عالي الجودة للقرص والدولاف.',
    specifications: [
      { key: 'التخانة (Thickness)', value: '18 مم' },
      { key: 'اللون (Color)', value: 'أبيض ميلامين مط' },
      { key: 'الأبعاد (Dimensions)', value: '280 × 207 سم' },
      { key: 'بلد المنشأ (Origin)', value: 'إسبانيا' }
    ],
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600',
    minStockLevel: 20,
    currentStock: 60,
    reservedStock: 5,
    availableStock: 55,
    status: 'active',
    currentReferenceCost: 1250,
    suppliers: [
      { supplierId: 'sup-m1', supplierName: 'شركة الرواد لخامات الخشب', purchaseCost: 1250, lastPurchaseDate: '2026-08-01', isPreferred: true },
      { supplierId: 'sup-m2', supplierName: 'شركة المودرن للأخشاب والكونتر', purchaseCost: 1300, lastPurchaseDate: '2026-07-15' },
      { supplierId: 'sup-m3', supplierName: 'الشركة المصرية لخامات الأثاث', purchaseCost: 1200, lastPurchaseDate: '2026-06-20' }
    ],
    stockByLocation: [
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 50, reserved: 5, available: 45 },
      { branchId: 'branch-3', branchName: 'ورشة التصنيع - دمياط', onHand: 10, reserved: 0, available: 10 }
    ],
    createdDate: '2026-01-10'
  },
  {
    id: 'mat-2',
    name: 'MDF أرو طبيعي 18مم',
    nameEn: 'MDF Oak Veneer 18mm',
    code: 'MAT-MDF-OAK',
    category: 'mdf',
    categoryName: 'ألواح MDF وكونتر',
    unit: 'Sheet',
    description: 'ألواح MDF قشرة أرو طبيعي وجهين للواجهات وطاولات التلفزيون.',
    specifications: [
      { key: 'التخانة', value: '18 مم' },
      { key: 'القشرة', value: 'أرو طبيعي اسباني' },
      { key: 'الأبعاد', value: '244 × 122 سم' }
    ],
    minStockLevel: 15,
    currentStock: 25,
    reservedStock: 2,
    availableStock: 23,
    status: 'active',
    currentReferenceCost: 1450,
    suppliers: [
      { supplierId: 'sup-m1', supplierName: 'شركة الرواد لخامات الخشب', purchaseCost: 1450, lastPurchaseDate: '2026-08-05', isPreferred: true }
    ],
    stockByLocation: [
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 20, reserved: 2, available: 18 },
      { branchId: 'branch-3', branchName: 'ورشة التصنيع - دمياط', onHand: 5, reserved: 0, available: 5 }
    ],
    createdDate: '2026-02-01'
  },
  {
    id: 'mat-3',
    name: 'ألواح HPL خشابي أرو هندي',
    nameEn: 'HPL Sheet Oak Indian',
    code: 'MAT-HPL-OAK',
    category: 'hpl',
    categoryName: 'تغليف HPL وأكريليك',
    unit: 'Sheet',
    description: 'طبقة HPL مقاومة للمياه والحرارة والخدش تستخدم لتغليف وحدات المطابخ.',
    specifications: [
      { key: 'السمك', value: '0.8 مم' },
      { key: 'النقشة', value: 'ملمس أرو بارز' },
      { key: 'المرونة', value: 'عالية المقاومة' }
    ],
    minStockLevel: 10,
    currentStock: 18,
    reservedStock: 0,
    availableStock: 18,
    status: 'active',
    currentReferenceCost: 850,
    suppliers: [
      { supplierId: 'sup-m2', supplierName: 'شركة المودرن للأخشاب والكونتر', purchaseCost: 850, lastPurchaseDate: '2026-08-10', isPreferred: true }
    ],
    stockByLocation: [
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 14, reserved: 0, available: 14 },
      { branchId: 'branch-3', branchName: 'ورشة التصنيع - دمياط', onHand: 4, reserved: 0, available: 4 }
    ],
    createdDate: '2026-02-15'
  },
  {
    id: 'mat-4',
    name: 'ألواح HPL أبيض مط',
    nameEn: 'HPL Sheet Matt White',
    code: 'MAT-HPL-WHT',
    category: 'hpl',
    categoryName: 'تغليف HPL وأكريليك',
    unit: 'Sheet',
    description: 'طبقة HPL بيضاء مط مضادة للبكتيريا والحرارة.',
    specifications: [
      { key: 'السمك', value: '0.8 مم' },
      { key: 'اللون', value: 'أبيض مط نص لمعة' }
    ],
    minStockLevel: 10,
    currentStock: 12,
    reservedStock: 1,
    availableStock: 11,
    status: 'active',
    currentReferenceCost: 750,
    suppliers: [
      { supplierId: 'sup-m2', supplierName: 'شركة المودرن للأخشاب والكونتر', purchaseCost: 750, lastPurchaseDate: '2026-07-28', isPreferred: true }
    ],
    stockByLocation: [
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 12, reserved: 1, available: 11 }
    ],
    createdDate: '2026-03-01'
  },
  {
    id: 'mat-5',
    name: 'شريط قشاط PVC أبيض 22/2مم',
    nameEn: 'PVC Edge Banding White 22/2mm',
    code: 'MAT-EDGE-WHT',
    category: 'edge_band',
    categoryName: 'شريط قشاط وتغليف',
    unit: 'Meter',
    description: 'شريط PVC أبيض لحماية وحياكة حواف MDF والمطابخ.',
    specifications: [
      { key: 'العرض', value: '22 مم' },
      { key: 'السمك', value: '2 مم' }
    ],
    minStockLevel: 100,
    currentStock: 450,
    reservedStock: 20,
    availableStock: 430,
    status: 'active',
    currentReferenceCost: 12,
    suppliers: [
      { supplierId: 'sup-m4', supplierName: 'شركة ألفا لإكسسوارات المطابخ', purchaseCost: 12, lastPurchaseDate: '2026-08-12', isPreferred: true }
    ],
    stockByLocation: [
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 350, reserved: 20, available: 330 },
      { branchId: 'branch-3', branchName: 'ورشة التصنيع - دمياط', onHand: 100, reserved: 0, available: 100 }
    ],
    createdDate: '2026-03-10'
  },
  {
    id: 'mat-6',
    name: 'مفصلة سوفت كلوز Blum هيدروليك 110°',
    nameEn: 'Blum Soft-Close Hinge 110°',
    code: 'MAT-HNG-BLUM',
    category: 'hinges',
    categoryName: 'مفصلات وإكسسوارات',
    unit: 'Piece',
    description: 'مفصلة غاطسة سوفت كلوز نمساوي Blum إغلاق هيدروليكي صامت.',
    specifications: [
      { key: 'العلامة التجارية (Brand)', value: 'Blum النمساوية' },
      { key: 'زاوية الفتح (Angle)', value: '110 درجة' },
      { key: 'نوع الإغلاق', value: 'Soft-Close هيدروليك' }
    ],
    minStockLevel: 50,
    currentStock: 180,
    reservedStock: 10,
    availableStock: 170,
    status: 'active',
    currentReferenceCost: 85,
    suppliers: [
      { supplierId: 'sup-m3', supplierName: 'الشركة المصرية لخامات الأثاث', purchaseCost: 85, lastPurchaseDate: '2026-08-15', isPreferred: true }
    ],
    stockByLocation: [
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 140, reserved: 10, available: 130 },
      { branchId: 'branch-3', branchName: 'ورشة التصنيع - دمياط', onHand: 40, reserved: 0, available: 40 }
    ],
    createdDate: '2026-03-15'
  },
  {
    id: 'mat-7',
    name: 'مجرى درج هيدروليك Tandembox Blum',
    nameEn: 'Blum Tandembox Drawer System 50cm',
    code: 'MAT-DRW-BLUM',
    category: 'drawers',
    categoryName: 'مجارى أدراج',
    unit: 'Set',
    description: 'طقم مجرى درج مخفي سوفت كلوز حمولة 40 كجم طول 50سم.',
    specifications: [
      { key: 'الطول', value: '50 سم' },
      { key: 'الحمولة القصوى', value: '40 كجم' }
    ],
    minStockLevel: 20,
    currentStock: 35,
    reservedStock: 2,
    availableStock: 33,
    status: 'active',
    currentReferenceCost: 320,
    suppliers: [
      { supplierId: 'sup-m3', supplierName: 'الشركة المصرية لخامات الأثاث', purchaseCost: 320, lastPurchaseDate: '2026-08-01', isPreferred: true }
    ],
    stockByLocation: [
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 25, reserved: 2, available: 23 },
      { branchId: 'branch-3', branchName: 'ورشة التصنيع - دمياط', onHand: 10, reserved: 0, available: 10 }
    ],
    createdDate: '2026-04-01'
  },
  {
    id: 'mat-8',
    name: 'مقبض ألومنيوم أسود مط 20سم',
    nameEn: 'Black Matt Aluminum Handle 20cm',
    code: 'MAT-HDL-BLK',
    category: 'handles',
    categoryName: 'مقابض وسحابات',
    unit: 'Piece',
    description: 'مقبض ألومنيوم مودرن غاطس باللون الأسود المط للمطابخ والأنتريهات.',
    specifications: [
      { key: 'الطول', value: '20 سم' },
      { key: 'المعدة', value: 'ألومنيوم مدهون إلكتروستاتيك' }
    ],
    minStockLevel: 40,
    currentStock: 95,
    reservedStock: 5,
    availableStock: 90,
    status: 'active',
    currentReferenceCost: 65,
    suppliers: [
      { supplierId: 'sup-m4', supplierName: 'شركة ألفا لإكسسوارات المطابخ', purchaseCost: 65, lastPurchaseDate: '2026-08-10', isPreferred: true }
    ],
    stockByLocation: [
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 70, reserved: 5, available: 65 },
      { branchId: 'branch-3', branchName: 'ورشة التصنيع - دمياط', onHand: 25, reserved: 0, available: 25 }
    ],
    createdDate: '2026-04-15'
  },
  {
    id: 'mat-9',
    name: 'ألواح أكريليك أبيض لامع Senosan',
    nameEn: 'Acrylic White High Gloss Senosan',
    code: 'MAT-ACR-WHT',
    category: 'acrylic',
    categoryName: 'تغليف HPL وأكريليك',
    unit: 'Sheet',
    description: 'ألواح أكريليك نمساوي Senosan لميع درجة أولى للمطابخ الراقية.',
    specifications: [
      { key: 'الدرجة', value: 'High Gloss لمعة عالية' },
      { key: 'السمك', value: '18 مم (MDF كابينة + أكريليك)' }
    ],
    minStockLevel: 8,
    currentStock: 14,
    reservedStock: 1,
    availableStock: 13,
    status: 'active',
    currentReferenceCost: 2100,
    suppliers: [
      { supplierId: 'sup-m2', supplierName: 'شركة المودرن للأخشاب والكونتر', purchaseCost: 2100, lastPurchaseDate: '2026-07-20', isPreferred: true }
    ],
    stockByLocation: [
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 10, reserved: 1, available: 9 },
      { branchId: 'branch-3', branchName: 'ورشة التصنيع - دمياط', onHand: 4, reserved: 0, available: 4 }
    ],
    createdDate: '2026-05-01'
  },
  {
    id: 'mat-10',
    name: 'خشب أبلكاج كونتر 18مم مضغوط',
    nameEn: 'Plywood Sheet Blockboard 18mm',
    code: 'MAT-PLY-18',
    category: 'plywood',
    categoryName: 'ألواح MDF وكونتر',
    unit: 'Sheet',
    description: 'ألواح كونتر سدايب زان معالج ضد السوس والرطوبة لتصنيع الشاسيهات.',
    specifications: [
      { key: 'السمك', value: '18 مم' },
      { key: 'الحشو الداخلي', value: 'سدايب زان طبيعي' }
    ],
    minStockLevel: 15,
    currentStock: 22,
    reservedStock: 0,
    availableStock: 22,
    status: 'active',
    currentReferenceCost: 980,
    suppliers: [
      { supplierId: 'sup-m1', supplierName: 'شركة الرواد لخامات الخشب', purchaseCost: 980, lastPurchaseDate: '2026-08-02', isPreferred: true }
    ],
    stockByLocation: [
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 16, reserved: 0, available: 16 },
      { branchId: 'branch-3', branchName: 'ورشة التصنيع - دمياط', onHand: 6, reserved: 0, available: 6 }
    ],
    createdDate: '2026-05-10'
  },
  {
    id: 'mat-11',
    name: 'قماش هامر بيج للأنتريهات',
    nameEn: 'Hammer Fabric Beige Upholstery',
    code: 'MAT-FAB-BEI',
    category: 'fabric',
    categoryName: 'أقمشة وإسفنج',
    unit: 'Meter',
    description: 'قماش تنجيد هامر عالي التحمل قابل للغسيل والكبس.',
    specifications: [
      { key: 'العرض', value: '140 سم' },
      { key: 'اللون', value: 'بيج فاتح' }
    ],
    minStockLevel: 30,
    currentStock: 85,
    reservedStock: 10,
    availableStock: 75,
    status: 'active',
    currentReferenceCost: 220,
    suppliers: [
      { supplierId: 'sup-m5', supplierName: 'شركة الدلتا لتوريد الخامات والأقمشة', purchaseCost: 220, lastPurchaseDate: '2026-08-08', isPreferred: true }
    ],
    stockByLocation: [
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 60, reserved: 10, available: 50 },
      { branchId: 'branch-3', branchName: 'ورشة التصنيع - دمياط', onHand: 25, reserved: 0, available: 25 }
    ],
    createdDate: '2026-06-01'
  },
  {
    id: 'mat-12',
    name: 'ألواح إسفنج كثافة 35 كتافتي',
    nameEn: 'Foam Sheet Density 35 High Resiliency',
    code: 'MAT-FOAM-35',
    category: 'foam',
    categoryName: 'أقمشة وإسفنج',
    unit: 'Sheet',
    description: 'ألواح إسفنج ضغط عالي 35 كتافتي لفرش وقواعد الأنتريهات والصالونات.',
    specifications: [
      { key: 'السمك', value: '15 سم' },
      { key: 'الكثافة', value: '35 كجم/م3' }
    ],
    minStockLevel: 15,
    currentStock: 28,
    reservedStock: 2,
    availableStock: 26,
    status: 'active',
    currentReferenceCost: 650,
    suppliers: [
      { supplierId: 'sup-m5', supplierName: 'شركة الدلتا لتوريد الخامات والأقمشة', purchaseCost: 650, lastPurchaseDate: '2026-08-05', isPreferred: true }
    ],
    stockByLocation: [
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 20, reserved: 2, available: 18 },
      { branchId: 'branch-3', branchName: 'ورشة التصنيع - دمياط', onHand: 8, reserved: 0, available: 8 }
    ],
    createdDate: '2026-06-15'
  },
  {
    id: 'mat-13',
    name: 'زجاج فاميه بني 10مم مصنفر',
    nameEn: 'Brown Smoked Glass 10mm',
    code: 'MAT-GLS-10',
    category: 'glass',
    categoryName: 'زجاج ورخام',
    unit: 'Meter',
    description: 'ألواح زجاج سيكوريت فاميه بني معالج للقرص والدولاف المودرن.',
    specifications: [
      { key: 'السمك', value: '10 مم' },
      { key: 'النوع', value: 'سيكوريت فاميه' }
    ],
    minStockLevel: 10,
    currentStock: 16,
    reservedStock: 0,
    availableStock: 16,
    status: 'active',
    currentReferenceCost: 450,
    suppliers: [
      { supplierId: 'sup-m5', supplierName: 'شركة الدلتا لتوريد الخامات والأقمشة', purchaseCost: 450, lastPurchaseDate: '2026-07-10', isPreferred: true }
    ],
    stockByLocation: [
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 12, reserved: 0, available: 12 },
      { branchId: 'branch-3', branchName: 'ورشة التصنيع - دمياط', onHand: 4, reserved: 0, available: 4 }
    ],
    createdDate: '2026-07-01'
  },
  {
    id: 'mat-14',
    name: 'رخام جالاكسي أسود اسباني',
    nameEn: 'Galaxy Black Spanish Marble',
    code: 'MAT-MRB-BLK',
    category: 'marble',
    categoryName: 'زجاج ورخام',
    unit: 'Meter',
    description: 'رخام جالاكسي أسود فصوص ذهبية للمطابخ وغرف السفرة.',
    specifications: [
      { key: 'السمك', value: '20 مم' },
      { key: 'الفرز', value: 'درجة أولى اسباني' }
    ],
    minStockLevel: 5,
    currentStock: 8,
    reservedStock: 1,
    availableStock: 7,
    status: 'active',
    currentReferenceCost: 1800,
    suppliers: [
      { supplierId: 'sup-m5', supplierName: 'شركة الدلتا لتوريد الخامات والأقمشة', purchaseCost: 1800, lastPurchaseDate: '2026-08-01', isPreferred: true }
    ],
    stockByLocation: [
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 6, reserved: 1, available: 5 },
      { branchId: 'branch-3', branchName: 'ورشة التصنيع - دمياط', onHand: 2, reserved: 0, available: 2 }
    ],
    createdDate: '2026-07-15'
  },
  {
    id: 'mat-15',
    name: 'سبت مطبخ استانلس مجلفن 3 أدوار',
    nameEn: 'Kitchen Basket Stainless 3 Layers',
    code: 'MAT-BSK-KIT',
    category: 'accessories',
    categoryName: 'إكسسوارات ومفصلات',
    unit: 'Set',
    description: 'ترولي مطبخ استانلس 304 مجلفن مقاوم للصدأ سحب هيدروليك.',
    specifications: [
      { key: 'العرض', value: '40 سم' },
      { key: 'الخامة', value: 'استانلس 304 نقي' }
    ],
    minStockLevel: 8,
    currentStock: 15,
    reservedStock: 0,
    availableStock: 15,
    status: 'active',
    currentReferenceCost: 1400,
    suppliers: [
      { supplierId: 'sup-m4', supplierName: 'شركة ألفا لإكسسوارات المطابخ', purchaseCost: 1400, lastPurchaseDate: '2026-08-12', isPreferred: true }
    ],
    stockByLocation: [
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 11, reserved: 0, available: 11 },
      { branchId: 'branch-3', branchName: 'ورشة التصنيع - دمياط', onHand: 4, reserved: 0, available: 4 }
    ],
    createdDate: '2026-08-01'
  }
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-demo-1',
    poNumber: 'PO-2026-001',
    supplierId: 'sup-m1',
    supplierName: 'شركة الرواد لخامات الخشب',
    branchId: 'branch-2',
    branchName: 'المخزن المركزي - العاشر',
    orderDate: '2026-08-20',
    expectedDeliveryDate: '2026-08-22',
    items: [
      {
        id: 'po-item-101',
        itemId: 'mat-1',
        itemType: 'material',
        itemName: 'MDF أبيض 18مم اسباني',
        itemCode: 'MAT-MDF-W18',
        quantity: 20,
        receivedQuantity: 20,
        unit: 'Sheet',
        unitCost: 1250,
        totalCost: 25000
      }
    ],
    totalAmount: 25000,
    paidAmount: 10000,
    balanceDue: 15000,
    receivingStatus: 'fully_received',
    paymentStatus: 'partially_paid',
    createdByUserName: 'أحمد سمير',
    notes: 'أمر توريد 20 لوح MDF أبيض اسباني للمخزن الرئيسي'
  }
];

export const initialStockMovements: StockMovement[] = [
  {
    id: 'mov-101',
    itemId: 'mat-1',
    itemType: 'material',
    itemName: 'MDF أبيض 18مم اسباني',
    itemCode: 'MAT-MDF-W18',
    quantity: 20,
    sourceBranchId: undefined,
    sourceBranchName: 'شركة الرواد لخامات الخشب',
    destinationBranchId: 'branch-2',
    destinationBranchName: 'المخزن المركزي - العاشر',
    movementType: 'purchase_receipt',
    referenceNumber: 'PO-2026-001',
    timestamp: '2026-08-22 11:30',
    userId: 'user-1',
    userName: 'أحمد سمير',
    notes: 'استلام فواتير توريد 20 لوح MDF من أمر الشراء PO-2026-001'
  }
];

export const initialStockTransfers: StockTransfer[] = [
  {
    id: 'trf-101',
    transferNumber: 'TRF-2026-004',
    sourceBranchId: 'branch-2',
    sourceBranchName: 'المخزن المركزي - العاشر',
    destinationBranchId: 'branch-3',
    destinationBranchName: 'ورشة التصنيع - دمياط',
    status: 'received',
    items: [
      { itemId: 'mat-1', itemType: 'material', itemName: 'MDF أبيض 18مم اسباني', itemCode: 'MAT-MDF-W18', quantity: 5, unit: 'Sheet' }
    ],
    requestedDate: '2026-08-24 10:00',
    sentDate: '2026-08-24 14:00',
    receivedDate: '2026-08-25 09:00',
    requestedByUserId: 'user-4',
    requestedByUserName: 'عمر فاروق',
    approvedByUserName: 'أحمد سمير',
    receivedByUserName: 'أحمد سمير',
    notes: 'تحويل خامات خشب لمشروع ركنة مودرن بالورشة'
  }
];

export const initialSupplierReturns: SupplierReturn[] = [
  {
    id: 'sret-101',
    returnNumber: 'PRET-2026-001',
    supplierId: 'sup-m3',
    supplierName: 'الشركة المصرية لخامات الأثاث',
    branchId: 'branch-2',
    branchName: 'المخزن المركزي - العاشر',
    purchaseOrderNumber: 'PO-2026-005',
    items: [
      { itemId: 'mat-6', itemType: 'material', itemName: 'مفصلة سوفت كلوز Blum هيدروليك 110°', quantity: 5, unitCost: 85, totalCost: 425 }
    ],
    reason: 'وجود عيوب تصنيع بسيطة بالإغلاق الهيدروليكي',
    returnDate: '2026-08-23',
    totalRefundAmount: 425,
    processedByUserName: 'سارة الشريف',
    notes: 'مرتجع 5 مفصلات تالفة للمورد وخصم قيمتها من كشف الحساب'
  }
];

export const initialNotifications: SystemNotification[] = [
  {
    id: 'notif-1',
    type: 'site_visit',
    title: '🚗 موعد معاينة ومقاسات بالموقع غداً',
    message: 'تذكير: موعد معاينة ومقاسات موقع "فيلا 14 - التجمع الخامس" للعميل مهندس محمود عبد العظيم غداً الساعة 4:00 مساءً.',
    timestamp: '2026-08-27 10:30',
    isRead: false,
    targetModule: 'custom_projects',
    targetId: 'prj-101',
    customerId: 'cust-1',
    branchId: 'branch-1',
    branchName: 'المعرض الرئيسي - التجمع'
  },
  {
    id: 'notif-2',
    type: 'payment_due',
    title: '💰 استحقاق دفعة قسط قادمة (40,000 ج.م)',
    message: 'تستحق دفعة القسط الثانية لمشروع "مطبخ مودرن رويل HPL" للعميل أ. أحمد مصطفى بتاريخ 30-08-2026.',
    timestamp: '2026-08-27 09:15',
    isRead: false,
    targetModule: 'custom_projects',
    targetId: 'prj-101',
    customerId: 'cust-1',
    branchId: 'branch-1',
    branchName: 'المعرض الرئيسي - التجمع'
  },
  {
    id: 'notif-3',
    type: 'design_review',
    title: '🎨 تصميم 3D جديد V2 جاهز للاعتماد',
    message: 'تم رفع النسخة V2 للتصميم 3D لمشروع "ركنة مودرن أنثراسيت" للعميلة د. سارة الشريف وبانتظار موافقة العميل.',
    timestamp: '2026-08-26 19:45',
    isRead: false,
    targetModule: 'custom_projects',
    targetId: 'prj-102',
    customerId: 'cust-2',
    branchId: 'branch-1',
    branchName: 'المعرض الرئيسي - التجمع'
  },
  {
    id: 'notif-4',
    type: 'quotation_review',
    title: '✅ موافقة عميل على عرض السعر (Quotation Approved)',
    message: 'وافق العميل أ. عمر فاروق على عرض السعر V1 لمشروع "غرفة نوم ماستر زان" بقيمة 120,000 ج.م ويستوجب إصدار العقد.',
    timestamp: '2026-08-26 17:20',
    isRead: false,
    targetModule: 'custom_projects',
    targetId: 'prj-103',
    customerId: 'cust-3',
    branchId: 'branch-1',
    branchName: 'المعرض الرئيسي - التجمع'
  },
  {
    id: 'notif-5',
    type: 'low_stock',
    title: '⚠️ تنبيه نقص خامات: ألواح HPL أبيض مط',
    message: 'الكمية المتاحة من "ألواح HPL أبيض مط 18مم" بالمخزن المركزي (11 لوح) بلغت حد الأمان الحرج (10 ألواح). يلزم إصدوار أمر شراء للمورد.',
    timestamp: '2026-08-26 16:00',
    isRead: false,
    targetModule: 'materials',
    targetId: 'mat-4',
    branchId: 'branch-2',
    branchName: 'المخزن المركزي - العاشر'
  },
  {
    id: 'notif-6',
    type: 'purchase_received',
    title: '📦 استلام شحنة خامات من المورد',
    message: 'تم استلام وتفريغ أمر الشراء PO-2026-001 من "شركة الرواد لخامات الخشب" (20 لوح MDF أبيض) بالمخزن المركزي.',
    timestamp: '2026-08-26 14:10',
    isRead: true,
    targetModule: 'suppliers',
    targetId: 'sup-m1',
    branchId: 'branch-2',
    branchName: 'المخزن المركزي - العاشر'
  },
  {
    id: 'notif-7',
    type: 'production_created',
    title: '🏭 أمر تصنيع مباشر بالورشة (PROD-2026-012)',
    message: 'تم توجيه أمر التصنيع لبدء تقطيع وتجميع خامات خشب HPL لمشروع "مطبخ مودرن أوف وايت" بورشة العبور.',
    timestamp: '2026-08-26 11:30',
    isRead: false,
    targetModule: 'production',
    targetId: 'prod-101',
    branchId: 'branch-3',
    branchName: 'ورشة التصنيع - دمياط'
  },
  {
    id: 'notif-8',
    type: 'material_shortage',
    title: '🚨 نواقص خامات تشغيل بأمر التصنيع',
    message: 'يوجد نقص في كمية "مجرى درج هيدروليك Blum" (المطلوب 8 طقم / المتاح 4) لأمر تصنيع مطبخ العميل أ/ طارق حسن.',
    timestamp: '2026-08-26 09:40',
    isRead: false,
    targetModule: 'production',
    targetId: 'prod-102',
    branchId: 'branch-3',
    branchName: 'ورشة التصنيع - دمياط'
  },
  {
    id: 'notif-9',
    type: 'production_completed',
    title: '🎉 تم إتمام تصنيع الوحدات بالكامل 100%',
    message: 'أنهت ورشة التصنيع تجميع وتغليف وحدات مشروع "دراسينج روم HPL" وجاهز لجدولة التركيبات.',
    timestamp: '2026-08-25 18:50',
    isRead: true,
    targetModule: 'installation',
    targetId: 'inst-101',
    branchId: 'branch-3',
    branchName: 'ورشة التصنيع - دمياط'
  },
  {
    id: 'notif-10',
    type: 'installation_scheduled',
    title: '🔨 موعد تركيبات بموقع العميل (INST-2026-005)',
    message: 'تم جدولة فريق التركيبات (الفني مصطفى كمال وشريف فاروق) لموقع شقة المعادي يوم الأحد 31-08-2026.',
    timestamp: '2026-08-25 16:15',
    isRead: true,
    targetModule: 'installation',
    targetId: 'inst-101',
    customerId: 'cust-1',
    branchId: 'branch-1',
    branchName: 'المعرض الرئيسي - التجمع'
  },
  {
    id: 'notif-11',
    type: 'contract_signed',
    title: '📑 تم توقيع وتوثيق عقد تفصيل جديد (CNT-2026-008)',
    message: 'قام العميل أ/ أحمد مصطفى بتوقيع العقد المعتمد لمشروع المطبخ بقيمة 165,000 ج.م وسداد المقدم.',
    timestamp: '2026-08-25 13:00',
    isRead: true,
    targetModule: 'custom_projects',
    targetId: 'prj-101',
    customerId: 'cust-1',
    branchId: 'branch-1',
    branchName: 'المعرض الرئيسي - التجمع'
  },
  {
    id: 'notif-12',
    type: 'payment_overdue',
    title: '🔴 قسط متأخر السداد (Overdue Installment)',
    message: 'القسط رقم 2 لمبيعات أمر ORD-2026-004 للعميل أ. خالد سعيد متأخر بمبلغ 18,000 ج.م منذ 3 أيام.',
    timestamp: '2026-08-25 10:20',
    isRead: false,
    targetModule: 'sales',
    targetId: 'ord-104',
    customerId: 'cust-4',
    branchId: 'branch-1',
    branchName: 'المعرض الرئيسي - التجمع'
  },
  {
    id: 'notif-13',
    type: 'pending_transfer',
    title: '🔄 طلب تحويل خامات بين الفروع (TRF-2026-004)',
    message: 'طلب تحويل 5 ألواح MDF اسباني من المخزن المركزي إلى ورشة التصنيع بانتظار الاعتماد والتأكيد.',
    timestamp: '2026-08-24 15:30',
    isRead: true,
    targetModule: 'inventory',
    targetId: 'trf-101',
    branchId: 'branch-2',
    branchName: 'المخزن المركزي - العاشر'
  },
  {
    id: 'notif-14',
    type: 'handover_completed',
    title: '🌟 تذكير متابعة وصيانة بعد البيع',
    message: 'موعد الفحص الدوري السنوي المجاني لمطبخ العميل د. هشام رياض بعد مرور 6 أشهر من التسليم والتركيب.',
    timestamp: '2026-08-24 11:00',
    isRead: true,
    targetModule: 'customers',
    customerId: 'cust-5',
    branchId: 'branch-1',
    branchName: 'المعرض الرئيسي - التجمع'
  },
  {
    id: 'notif-15',
    type: 'large_expense',
    title: '💳 تسجيل مصروف تشغيلي كبير (EXP-2026-014)',
    message: 'تم تسجيل مصروف "شراء أدوات وعدد للورشة" بمبلغ 25,000 ج.م خصماً من خزينة المعرض الرئيسي.',
    timestamp: '2026-08-23 16:40',
    isRead: true,
    targetModule: 'finance',
    targetId: 'exp-101',
    branchId: 'branch-1',
    branchName: 'المعرض الرئيسي - التجمع'
  },
  {
    id: 'notif-16',
    type: 'design_review',
    title: '💬 استفسار جديد من العميل عبر بوابة العملاء الحية',
    message: 'أضاف العميل أ. محمود عبد العظيم ملاحظة على توزيع الجزيرة الوسطية بتصميم الـ 3D عبر بوابة العملاء.',
    timestamp: '2026-08-23 14:00',
    isRead: false,
    targetModule: 'portal',
    customerId: 'cust-1',
    branchId: 'branch-1',
    branchName: 'المعرض الرئيسي - التجمع'
  }
];

