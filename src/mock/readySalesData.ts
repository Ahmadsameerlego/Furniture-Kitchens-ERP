import { 
  Supplier, 
  Product, 
  ReadyOrder, 
  CustomerPayment, 
  PaymentSchedule, 
  OrderReturn,
  SupplierPurchaseInvoice,
  SupplierPaymentRecord
} from '../types/erp';

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'شركة الأخشاب العالمية وشركاه',
    companyName: 'Global Timber & Furniture Co.',
    phone: '01001112233',
    email: 'info@globaltimber.com.eg',
    address: 'المنطقة الصناعية - دمياط الجديدة',
    city: 'دمياط',
    specialty: 'صالونات وغرف نوم زان أحمر وموسكي',
    totalPurchases: 180000,
    totalPaid: 135000,
    balanceDue: 45000,
    paymentTerms: 'سداد 50% مقدم وباقي 50% عند التوريد',
    rating: 5,
    createdDate: '2025-01-15'
  },
  {
    id: 'sup-2',
    name: 'مصنع الصفوة للمفصلات وإكسسوارات المطابخ',
    companyName: 'El-Safwa Kitchen Hardware',
    phone: '01122334455',
    email: 'sales@elsafwa-acc.com',
    address: 'المنطقة الصناعية الرابعة - 6 أكتوبر',
    city: 'الجيزة',
    specialty: 'إكسسوارات ومفصلات سوفت كلوز ومجر أدراج Blum/Hettich',
    totalPurchases: 48000,
    totalPaid: 30000,
    balanceDue: 18000,
    paymentTerms: 'آجل 30 يوم',
    rating: 4,
    createdDate: '2025-03-10'
  },
  {
    id: 'sup-3',
    name: 'المورد العربي للأثاث الراقي',
    companyName: 'Arabian Luxury Furniture Ltd.',
    phone: '01233445566',
    email: 'contact@arabianluxury.eg',
    address: 'طريق مصر الإسماعيلية الصحراوي - الكيلو 26',
    city: 'القاهرة',
    specialty: 'صالونات ومجموعات سفرة مودرن مستوردة ومحلية',
    totalPurchases: 95000,
    totalPaid: 95000,
    balanceDue: 0,
    paymentTerms: 'نقداً عند الاستلام',
    rating: 4,
    createdDate: '2025-05-20'
  },
  {
    id: 'sup-4',
    name: 'ورش الأهرام للأثاث الجاهز',
    companyName: 'Pyramids Furniture Workshops',
    phone: '01099887711',
    email: 'pyramids.wood@gmail.com',
    address: 'شارع البحر الأعظم - الجيزة',
    city: 'الجيزة',
    specialty: 'أنتريهات وطاولات شاشة ومطابخ HPL جاهزة',
    totalPurchases: 82000,
    totalPaid: 50000,
    balanceDue: 32000,
    paymentTerms: 'آجل 15 يوم',
    rating: 5,
    createdDate: '2025-06-01'
  },
  {
    id: 'sup-5',
    name: 'شركة الدلتا للتصنيع والتوريدات',
    companyName: 'Delta Manufacturing & Supply',
    phone: '01044556677',
    email: 'supply@deltamfg.com',
    address: 'منطقة قويسنا الصناعية',
    city: 'المنوفية',
    specialty: 'غرف نوم شبابي وأطقم سفرة كلاسيك ومودرن',
    totalPurchases: 112000,
    totalPaid: 100000,
    balanceDue: 12000,
    paymentTerms: 'سداد نقدي مع خصم تعجيل دفع 3%',
    rating: 4,
    createdDate: '2025-07-12'
  }
];

export const initialSupplierInvoices: SupplierPurchaseInvoice[] = [
  {
    id: 'pinv-101',
    invoiceNumber: 'PUR-2026-081',
    supplierId: 'sup-1',
    supplierName: 'شركة الأخشاب العالمية وشركاه',
    date: '2026-08-01',
    items: [
      { productId: 'prod-1', productName: 'صالون مودرن 01 (خشب زان أحمر)', quantity: 10, unitCost: 18000, totalCost: 180000 }
    ],
    totalAmount: 180000,
    paidAmount: 135000,
    balanceDue: 45000,
    paymentStatus: 'partially_paid',
    notes: 'توريد دفعة 10 صالونات زان مودرن للمخزن الرئيسي'
  },
  {
    id: 'pinv-102',
    invoiceNumber: 'PUR-2026-075',
    supplierId: 'sup-2',
    supplierName: 'مصنع الصفوة للمفصلات وإكسسوارات المطابخ',
    date: '2026-08-15',
    items: [
      { productId: 'prod-6', productName: 'طقم مفصلات سوفت كلوز النمساوي Blum (10 مفصلات)', quantity: 25, unitCost: 1900, totalCost: 47500 }
    ],
    totalAmount: 47500,
    paidAmount: 30000,
    balanceDue: 17500,
    paymentStatus: 'partially_paid',
    notes: 'توريد إكسسوارات ومفصلات سوفت كلوز الأصلية'
  }
];

export const initialSupplierPayments: SupplierPaymentRecord[] = [
  {
    id: 'spay-201',
    supplierId: 'sup-1',
    supplierName: 'شركة الأخشاب العالمية وشركاه',
    invoiceNumber: 'PUR-2026-081',
    amount: 135000,
    paymentDate: '2026-08-05',
    paymentMethod: 'bank_transfer',
    referenceNumber: 'TRF-BANK-9901',
    processedByUserName: 'سارة الشريف',
    notes: 'سداد 75% من قيمة الفاتورة عبر تحويل بنكي'
  },
  {
    id: 'spay-202',
    supplierId: 'sup-2',
    supplierName: 'مصنع الصفوة للمفصلات وإكسسوارات المطابخ',
    invoiceNumber: 'PUR-2026-075',
    amount: 30000,
    paymentDate: '2026-08-18',
    paymentMethod: 'cash',
    referenceNumber: 'REC-CASH-4412',
    processedByUserName: 'سارة الشريف',
    notes: 'سداد دفعة أولية نقداً من الخزينة'
  }
];

export const initialProducts: Product[] = [
  // 1. Modern Sofa 01 (Multi-Supplier Core Product for Demo 1 & Demo 2)
  {
    id: 'prod-1',
    name: 'صالون مودرن 01 (خشب زان أحمر)',
    nameEn: 'Modern Sofa 01 (Red Beech Wood)',
    code: 'SOFA-MOD-01',
    sku: 'SKU-SOFA-01',
    category: 'sofas',
    categoryName: 'أنتريهات وصالونات',
    type: 'furniture',
    model: 'Modern Sofa 2026',
    description: 'طقم صالون مودرن مكون من كنبة ثلاثية + كنبة ثنائية + 2 فوتيه. خشب زان أحمر معالج مع قماش هامر عالي الجودة ومحشو إسفنج كتافتي 35.',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=600'
    ],
    status: 'active',
    sellingPrice: 25000,
    defaultPurchaseCost: 18000,
    variants: [
      { id: 'var-1a', name: 'أوف وايت / قماش هامر', color: 'أوف وايت', fabric: 'هامر', sku: 'SKU-SOFA-01-OFF' },
      { id: 'var-1b', name: 'بيج خشب فاتح / قماش هامر', color: 'بيج', fabric: 'هامر', sku: 'SKU-SOFA-01-BEI' },
      { id: 'var-1c', name: 'رمادي داكن / قماش قطيفة', color: 'رمادي داكن', fabric: 'قطيفة', sku: 'SKU-SOFA-01-GRY' }
    ],
    suppliers: [
      {
        supplierId: 'sup-1',
        supplierName: 'شركة الأخشاب العالمية وشركاه',
        purchaseCost: 18000,
        lastPurchaseDate: '2026-08-01',
        isPreferred: true
      },
      {
        supplierId: 'sup-3',
        supplierName: 'المورد العربي للأثاث الراقي',
        purchaseCost: 19500,
        lastPurchaseDate: '2026-07-15'
      },
      {
        supplierId: 'sup-4',
        supplierName: 'ورش الأهرام للأثاث الجاهز',
        purchaseCost: 17800,
        lastPurchaseDate: '2026-08-20'
      }
    ],
    stockByLocation: [
      { branchId: 'branch-1', branchName: 'المعرض الرئيسي - القاهرة', onHand: 4, reserved: 1, available: 3, delivered: 8 },
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 8, reserved: 2, available: 6, delivered: 12 },
      { branchId: 'branch-4', branchName: 'معرض الإسكندرية - سموحة', onHand: 2, reserved: 0, available: 2, delivered: 3 }
    ],
    createdDate: '2026-01-10'
  },

  // 2. Dining Room Set 08
  {
    id: 'prod-2',
    name: 'طقم سفرة مودرن 8 كراسي + بوفيه',
    nameEn: 'Dining Room Set 8 Chairs + Buffet',
    code: 'DIN-SET-08',
    sku: 'SKU-DIN-08',
    category: 'dining',
    categoryName: 'غرف سفرة وطاولات',
    type: 'furniture',
    model: 'Dining Luxury 08',
    description: 'طاولة سفرة رخام يولي 220سم مع 8 كراسي خشب زان أحمر + بوفيه مودرن مرآة هيدروليك.',
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&q=80&w=600'
    ],
    status: 'active',
    sellingPrice: 80000,
    defaultPurchaseCost: 55000,
    variants: [
      { id: 'var-2a', name: 'رخام أبيض x كراسي كبتونيه بيج', sku: 'SKU-DIN-08-WHT' },
      { id: 'var-2b', name: 'رخام أسود اسباني x كراسي رمادي', sku: 'SKU-DIN-08-BLK' }
    ],
    suppliers: [
      { supplierId: 'sup-1', supplierName: 'شركة الأخشاب العالمية وشركاه', purchaseCost: 55000, lastPurchaseDate: '2026-07-20', isPreferred: true },
      { supplierId: 'sup-5', supplierName: 'شركة الدلتا للتصنيع والتوريدات', purchaseCost: 57000, lastPurchaseDate: '2026-06-10' }
    ],
    stockByLocation: [
      { branchId: 'branch-1', branchName: 'المعرض الرئيسي - القاهرة', onHand: 2, reserved: 1, available: 1, delivered: 4 },
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 3, reserved: 0, available: 3, delivered: 5 }
    ],
    createdDate: '2026-02-15'
  },

  // 3. Master Bedroom Royal
  {
    id: 'prod-3',
    name: 'غرفة نوم ماستر مودرن رويل 6 قطع',
    nameEn: 'Royal Master Bedroom 6 Pcs',
    code: 'BED-ROY-01',
    sku: 'SKU-BED-01',
    category: 'bedrooms',
    categoryName: 'غرف نوم ماستر',
    type: 'furniture',
    model: 'Royal Bedroom 2026',
    description: 'سرير 180سم كبتونيه + دولاب جرار 280سم + تسريحة مرآة مسبكة + 2 كمودينو + بنكيت.',
    images: [
      'https://images.unsplash.com/photo-1540518614846-7ede433c5173?auto=format&fit=crop&q=80&w=600'
    ],
    status: 'active',
    sellingPrice: 120000,
    defaultPurchaseCost: 85000,
    variants: [
      { id: 'var-3a', name: 'بيج كابتونيه x شريط شامبين', sku: 'SKU-BED-01-CHM' },
      { id: 'var-3b', name: 'رمادي فاتح x شريط استيل فضي', sku: 'SKU-BED-01-SLV' }
    ],
    suppliers: [
      { supplierId: 'sup-5', supplierName: 'شركة الدلتا للتصنيع والتوريدات', purchaseCost: 85000, lastPurchaseDate: '2026-08-05', isPreferred: true }
    ],
    stockByLocation: [
      { branchId: 'branch-1', branchName: 'المعرض الرئيسي - القاهرة', onHand: 1, reserved: 0, available: 1, delivered: 6 },
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 2, reserved: 1, available: 1, delivered: 8 }
    ],
    createdDate: '2026-03-01'
  },

  // 4. TV Unit Modern Oak
  {
    id: 'prod-4',
    name: 'وحدة تلفزيون مودرن خشابي + أرفف معلقة',
    nameEn: 'Modern Oak TV Unit + Shelves',
    code: 'TV-OAK-02',
    sku: 'SKU-TV-02',
    category: 'tv_units',
    categoryName: 'طاولات ووحدات تلفزيون',
    type: 'furniture',
    model: 'TV Unit 200cm',
    description: 'طاولة شاشة 200سم خشب Mdf اسباني مطعم بقشرة أرو طبيعي + unit معلقة بدلفة هيدروليك.',
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=600'
    ],
    status: 'active',
    sellingPrice: 18500,
    defaultPurchaseCost: 12000,
    variants: [
      { id: 'var-4a', name: 'أرو طبيعي x أبيض مط', sku: 'SKU-TV-02-OAK' }
    ],
    suppliers: [
      { supplierId: 'sup-4', supplierName: 'ورش الأهرام للأثاث الجاهز', purchaseCost: 12000, lastPurchaseDate: '2026-08-10', isPreferred: true }
    ],
    stockByLocation: [
      { branchId: 'branch-1', branchName: 'المعرض الرئيسي - القاهرة', onHand: 3, reserved: 0, available: 3, delivered: 10 },
      { branchId: 'branch-4', branchName: 'معرض الإسكندرية - سموحة', onHand: 2, reserved: 1, available: 1, delivered: 4 }
    ],
    createdDate: '2026-04-10'
  },

  // 5. Ready Kitchen Cabinet HPL 120cm
  {
    id: 'prod-5',
    name: 'وحدة مطبخ جاهزة HPL عالي الجودة 120سم',
    nameEn: 'Ready HPL Kitchen Cabinet 120cm',
    code: 'KIT-HPL-120',
    sku: 'SKU-KIT-120',
    category: 'kitchen_ready',
    categoryName: 'مطابخ جاهزة ووحدات',
    type: 'kitchen',
    model: 'Ready Kitchen 120',
    description: 'وحدة مطبخ جاهزة علوية وسفلية 120سم طبقة HPL هندي مقاوم للماء والحرارة مع رخام جالاكسي.',
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600'
    ],
    status: 'active',
    sellingPrice: 22000,
    defaultPurchaseCost: 15000,
    variants: [
      { id: 'var-5a', name: 'خشابي فاتح HPL x رخام أسود', sku: 'SKU-KIT-120-WD' },
      { id: 'var-5b', name: 'أوف وايت مط HPL x رخام رمادي', sku: 'SKU-KIT-120-OFF' }
    ],
    suppliers: [
      { supplierId: 'sup-4', supplierName: 'ورش الأهرام للأثاث الجاهز', purchaseCost: 15000, lastPurchaseDate: '2026-08-02', isPreferred: true }
    ],
    stockByLocation: [
      { branchId: 'branch-1', branchName: 'المعرض الرئيسي - القاهرة', onHand: 2, reserved: 0, available: 2, delivered: 5 },
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 5, reserved: 1, available: 4, delivered: 9 }
    ],
    createdDate: '2026-05-01'
  },

  // 6. Kitchen Accessory Blum Soft-Close Hinges Set
  {
    id: 'prod-6',
    name: 'طقم مفصلات سوفت كلوز النمساوي Blum (10 مفصلات)',
    nameEn: 'Blum Soft-Close Hinges Pack of 10',
    code: 'ACC-BLUM-10',
    sku: 'SKU-ACC-BLUM',
    category: 'kitchen_acc',
    categoryName: 'إكسسوارات مطابخ',
    type: 'kitchen',
    model: 'Blum Clip Top 110',
    description: 'طقم مفصلات هيدروليك نمساوي Blum الأصلية للإغلاق الصامت للدولاف والمطابخ.',
    images: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600'
    ],
    status: 'active',
    sellingPrice: 2800,
    defaultPurchaseCost: 1900,
    variants: [],
    suppliers: [
      { supplierId: 'sup-2', supplierName: 'مصنع الصفوة للمفصلات وإكسسوارات المطابخ', purchaseCost: 1900, lastPurchaseDate: '2026-08-15', isPreferred: true }
    ],
    stockByLocation: [
      { branchId: 'branch-1', branchName: 'المعرض الرئيسي - القاهرة', onHand: 15, reserved: 2, available: 13, delivered: 40 },
      { branchId: 'branch-2', branchName: 'المخزن المركزي - العاشر', onHand: 50, reserved: 5, available: 45, delivered: 120 }
    ],
    createdDate: '2026-05-15'
  }
];

export const initialOrders: ReadyOrder[] = [
  {
    id: 'ord-demo-1',
    orderNumber: 'ORD-2026-091',
    customerId: 'cust-1',
    customerName: 'محمد حسن',
    customerPhone: '01009876543',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    salesUserId: 'user-4',
    salesUserName: 'عمر فاروق',
    items: [
      {
        id: 'item-101',
        productId: 'prod-1',
        productName: 'صالون مودرن 01 (خشب زان أحمر)',
        productCode: 'SOFA-MOD-01',
        variantId: 'var-1b',
        variantName: 'بيج خشب فاتح / قماش هامر',
        quantity: 1,
        unitSellingPrice: 25000,
        actualPurchaseCost: 18000,
        discountAmount: 0,
        totalSellingPrice: 25000,
        totalPurchaseCost: 18000,
        itemGrossProfit: 7000,
        stockAvailability: 'available'
      }
    ],
    subtotal: 25000,
    totalDiscount: 0,
    orderTotal: 25000,
    totalPurchaseCost: 18000,
    grossProfit: 7000,
    paymentStatus: 'deposit_paid',
    depositAmount: 10000,
    paidAmount: 10000,
    remainingBalance: 15000,
    orderStatus: 'ready_for_delivery',
    deliveryInfo: {
      deliveryStatus: 'ready_for_delivery',
      scheduledDate: '2026-09-02',
      deliveryAddress: 'فيلا 14 - شارع النرجس الرئيسي - التجمع الخامس',
      city: 'القاهرة',
      area: 'التجمع الخامس',
      deliveryNotes: 'المنتج جاهز بالكامل بالمخزن الرئيسي في انتظار تأكيد العميل لاستلامه الأسبوع القادم'
    },
    createdDate: '2026-08-26 19:00',
    lastUpdatedDate: '2026-08-26 20:30',
    notes: 'تم سداد 10,000 ج.م عربون وحجز المنتج بالمعرض الرئيسي'
  },
  {
    id: 'ord-demo-2a',
    orderNumber: 'ORD-2026-042',
    customerId: 'cust-2',
    customerName: 'أحمد سمير',
    customerPhone: '01112223344',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    salesUserId: 'user-1',
    salesUserName: 'أحمد سمير',
    items: [
      {
        id: 'item-201',
        productId: 'prod-1',
        productName: 'صالون مودرن 01 (خشب زان أحمر)',
        productCode: 'SOFA-MOD-01',
        variantId: 'var-1a',
        variantName: 'أوف وايت / قماش هامر',
        quantity: 1,
        unitSellingPrice: 25000,
        actualPurchaseCost: 18000,
        discountAmount: 0,
        totalSellingPrice: 25000,
        totalPurchaseCost: 18000,
        itemGrossProfit: 7000,
        stockAvailability: 'available'
      },
      {
        id: 'item-202',
        productId: 'prod-3',
        productName: 'غرفة نوم ماستر مودرن رويل 6 قطع',
        productCode: 'BED-ROY-01',
        variantId: 'var-3a',
        variantName: 'بيج كابتونيه x شريط شامبين',
        quantity: 1,
        unitSellingPrice: 120000,
        actualPurchaseCost: 85000,
        discountAmount: 0,
        totalSellingPrice: 120000,
        totalPurchaseCost: 85000,
        itemGrossProfit: 35000,
        stockAvailability: 'available'
      }
    ],
    subtotal: 145000,
    totalDiscount: 0,
    orderTotal: 145000,
    totalPurchaseCost: 103000,
    grossProfit: 42000,
    paymentStatus: 'fully_paid',
    depositAmount: 70000,
    paidAmount: 145000,
    remainingBalance: 0,
    orderStatus: 'completed',
    deliveryInfo: {
      deliveryStatus: 'delivered',
      actualDeliveryDate: '2026-08-25',
      deliveryAddress: 'عمارة 8 - شقة 12 - كمبوند حسن علام - مدينة الشروق',
      city: 'القاهرة',
      area: 'الشروق',
      deliveredByTeam: 'فريق التوريد والتركيب رقم 3'
    },
    createdDate: '2026-06-25 11:00',
    lastUpdatedDate: '2026-08-25 14:10',
    notes: 'تم التسليم والتركيب النهائي بالكامل وتفعيل الضمان 5 سنوات'
  },
  {
    id: 'ord-demo-2b',
    orderNumber: 'ORD-2026-088',
    customerId: 'cust-5',
    customerName: 'كريم محمد',
    customerPhone: '01055443322',
    branchId: 'branch-4',
    branchName: 'معرض الإسكندرية - سموحة',
    salesUserId: 'user-4',
    salesUserName: 'عمر فاروق',
    items: [
      {
        id: 'item-203',
        productId: 'prod-1',
        productName: 'صالون مودرن 01 (خشب زان أحمر)',
        productCode: 'SOFA-MOD-01',
        variantId: 'var-1c',
        variantName: 'رمادي داكن / قماش قطيفة',
        quantity: 1,
        unitSellingPrice: 25000,
        actualPurchaseCost: 17800,
        discountAmount: 0,
        totalSellingPrice: 25000,
        totalPurchaseCost: 17800,
        itemGrossProfit: 7200,
        stockAvailability: 'available'
      }
    ],
    subtotal: 25000,
    totalDiscount: 0,
    orderTotal: 25000,
    totalPurchaseCost: 17800,
    grossProfit: 7200,
    paymentStatus: 'fully_paid',
    depositAmount: 25000,
    paidAmount: 25000,
    remainingBalance: 0,
    orderStatus: 'completed',
    deliveryInfo: {
      deliveryStatus: 'delivered',
      actualDeliveryDate: '2026-08-20',
      deliveryAddress: 'طريق 14 مايو - سموحة - الإسكندرية',
      city: 'الإسكندرية',
      area: 'سموحة'
    },
    createdDate: '2026-08-15 14:20',
    lastUpdatedDate: '2026-08-20 17:00'
  },
  {
    id: 'ord-demo-3',
    orderNumber: 'ORD-2026-095',
    customerId: 'cust-3',
    customerName: 'سارة علي',
    customerPhone: '01223344556',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    salesUserId: 'user-1',
    salesUserName: 'أحمد سمير',
    items: [
      {
        id: 'item-301',
        productId: 'prod-2',
        productName: 'طقم سفرة مودرن 8 كراسي + بوفيه',
        productCode: 'DIN-SET-08',
        variantId: 'var-2a',
        variantName: 'رخام أبيض x كراسي كبتونيه بيج',
        quantity: 1,
        unitSellingPrice: 80000,
        actualPurchaseCost: 55000,
        discountAmount: 0,
        totalSellingPrice: 80000,
        totalPurchaseCost: 55000,
        itemGrossProfit: 25000,
        stockAvailability: 'available'
      }
    ],
    subtotal: 80000,
    totalDiscount: 0,
    orderTotal: 80000,
    totalPurchaseCost: 55000,
    grossProfit: 25000,
    paymentStatus: 'partially_paid',
    depositAmount: 30000,
    paidAmount: 40000,
    remainingBalance: 40000,
    orderStatus: 'preparing',
    deliveryInfo: {
      deliveryStatus: 'preparing',
      scheduledDate: '2026-09-10',
      deliveryAddress: 'فيلا 88 - المجاورة الثالثة - الحي المتميز - 6 أكتوبر',
      city: 'الجيزة',
      area: 'مدينة 6 أكتوبر',
      deliveryNotes: 'الطلب قيد التجهيز بالمخزن ولم يتم تسليمه بعد، الاستلام المجدول بعد أسبوعين'
    },
    createdDate: '2026-08-22 10:00',
    lastUpdatedDate: '2026-08-26 15:00',
    notes: 'تم سداد 30,000 ج.م عربون + قسط أول 10,000 ج.م والمتبقي 4 أقساط شهرية'
  }
];

export const initialPayments: CustomerPayment[] = [
  {
    id: 'pay-101',
    orderId: 'ord-demo-1',
    orderNumber: 'ORD-2026-091',
    customerId: 'cust-1',
    customerName: 'محمد حسن',
    amount: 10000,
    paymentDate: '2026-08-26 19:00',
    paymentMethod: 'card',
    receiptRef: 'REC-2026-8801',
    receivedByUserId: 'user-4',
    receivedByUserName: 'عمر فاروق',
    notes: 'عربون حجز صالون مودرن 01',
    paymentType: 'deposit'
  },
  {
    id: 'pay-201',
    orderId: 'ord-demo-3',
    orderNumber: 'ORD-2026-095',
    customerId: 'cust-3',
    customerName: 'سارة علي',
    amount: 30000,
    paymentDate: '2026-08-22 10:00',
    paymentMethod: 'bank_transfer',
    receiptRef: 'REC-2026-7910',
    receivedByUserId: 'user-1',
    receivedByUserName: 'أحمد سمير',
    notes: 'عربون حجز طقم سفرة مودرن 8 كراسي',
    paymentType: 'deposit'
  },
  {
    id: 'pay-202',
    orderId: 'ord-demo-3',
    orderNumber: 'ORD-2026-095',
    customerId: 'cust-3',
    customerName: 'سارة علي',
    amount: 10000,
    paymentDate: '2026-08-26 14:00',
    paymentMethod: 'cash',
    receiptRef: 'REC-2026-8902',
    receivedByUserId: 'user-3',
    receivedByUserName: 'سارة الشريف',
    notes: 'سداد القسط الأول المباشر',
    paymentType: 'installment'
  }
];

export const initialPaymentSchedules: PaymentSchedule[] = [
  {
    id: 'sch-301',
    orderId: 'ord-demo-3',
    orderNumber: 'ORD-2026-095',
    customerId: 'cust-3',
    customerName: 'سارة علي',
    customerPhone: '01223344556',
    installmentNumber: 1,
    amount: 10000,
    dueDate: '2026-08-26',
    status: 'paid',
    paidDate: '2026-08-26',
    paymentRef: 'REC-2026-8902'
  },
  {
    id: 'sch-302',
    orderId: 'ord-demo-3',
    orderNumber: 'ORD-2026-095',
    customerId: 'cust-3',
    customerName: 'سارة علي',
    customerPhone: '01223344556',
    installmentNumber: 2,
    amount: 10000,
    dueDate: '2026-09-01',
    status: 'upcoming'
  },
  {
    id: 'sch-303',
    orderId: 'ord-demo-3',
    orderNumber: 'ORD-2026-095',
    customerId: 'cust-3',
    customerName: 'سارة علي',
    customerPhone: '01223344556',
    installmentNumber: 3,
    amount: 10000,
    dueDate: '2026-10-01',
    status: 'upcoming'
  },
  {
    id: 'sch-304',
    orderId: 'ord-demo-3',
    orderNumber: 'ORD-2026-095',
    customerId: 'cust-3',
    customerName: 'سارة علي',
    customerPhone: '01223344556',
    installmentNumber: 4,
    amount: 10000,
    dueDate: '2026-11-01',
    status: 'upcoming'
  },
  {
    id: 'sch-305',
    orderId: 'ord-demo-3',
    orderNumber: 'ORD-2026-095',
    customerId: 'cust-3',
    customerName: 'سارة علي',
    customerPhone: '01223344556',
    installmentNumber: 5,
    amount: 10000,
    dueDate: '2026-12-01',
    status: 'upcoming'
  }
];

export const initialReturns: OrderReturn[] = [
  {
    id: 'ret-101',
    orderId: 'ord-demo-2a',
    orderNumber: 'ORD-2026-042',
    customerId: 'cust-2',
    customerName: 'أحمد سمير',
    productId: 'prod-6',
    productName: 'طقم مفصلات سوفت كلوز النمساوي Blum (10 مفصلات)',
    quantity: 1,
    reason: 'تم استبدال المقاس بمقاس أوسع بناءً على رغبة العميل',
    returnDate: '2026-08-20',
    condition: 'like_new',
    stockAction: 'returned_to_stock',
    refundAmount: 2800,
    processedByUserName: 'سارة الشريف'
  }
];
