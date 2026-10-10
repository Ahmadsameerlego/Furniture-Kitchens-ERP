import { KITCHEN_DRAWINGS } from './designDrawings';
import {
  TechnicalProject,
  TechnicalSiteSurvey,
  TechnicalDesignRevision,
  TechnicalBOM,
  TechnicalReleasePackage,
  EngineeringChangeRequest
} from '../types/technicalOffice';

export const initialTechnicalProjects: TechnicalProject[] = [
  {
    id: 'tech-prj-101',
    projectNumber: 'TECH-2026-001',
    salesProjectId: 'prj-101',
    salesProjectNumber: 'PRJ-2026-001',
    projectName: 'مطبخ مودرن رويل HPL فاخر',
    customerId: 'cust-1',
    customerName: 'محمد حسن',
    customerPhone: '01009876543',
    contractId: 'cnt-101',
    contractNumber: 'CNT-2026-001',
    branchId: 'branch-1',
    branchName: 'المعرض الرئيسي - القاهرة',
    projectType: 'kitchen',
    status: 'in_production',
    priority: 'high',
    responsibleEngineerId: 'user-2',
    responsibleEngineerName: 'م. إبراهيم فؤاد (رئيس المكتب الفني)',
    designerEngineerName: 'م. كريم سامي',
    createdDate: '2026-08-19',
    lastUpdatedDate: '2026-08-24 14:30',
    targetReleaseDate: '2026-08-24',
    activeDesignVersion: 2,
    activeBomRevision: 'REV-A',
    handoverId: 'hnd-101',
    technicalNotes: 'مطبخ تفصيل HPL هندي مطعم بليد بروفايل ومفصلات بلوم نمساوي أصلي مع رخام جالاكسي. تم الإفراج للتخطيط والتصنيع جارٍ حالياً بعنبر التجميع.',
    commercialScopeSummary: 'عقد معتمد بقيمة 250,000 ج.م (285,000 ج.م شامل الضريبة) - تم التحقق من سداد العربون 40% (100,000 ج.م) بسند رقم RCP-2026-001.'
  },
  {
    id: 'tech-prj-102',
    projectNumber: 'TECH-2026-002',
    salesProjectId: 'prj-102',
    salesProjectNumber: 'PRJ-2026-002',
    projectName: 'غرفة نوم ماستر ودريسنج روم - فيلا الشيخ زايد',
    customerId: 'cust-11',
    customerName: 'م. حازم السعدني',
    customerPhone: '01144556677',
    contractId: 'cnt-102',
    contractNumber: 'CNT-2026-002',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    projectType: 'wardrobe',
    status: 'in_production',
    priority: 'normal',
    responsibleEngineerId: 'user-2',
    responsibleEngineerName: 'م. إبراهيم فؤاد',
    designerEngineerName: 'م. ندى شريف',
    createdDate: '2026-07-16',
    lastUpdatedDate: '2026-08-24 16:00',
    targetReleaseDate: '2026-07-30',
    activeDesignVersion: 2,
    activeBomRevision: 'REV-A',
    handoverId: 'hnd-102',
    technicalNotes: 'تم التصنيع والتغليف بالكامل (4 طرود) وتسليم الملف لفريق التركيبات.',
    commercialScopeSummary: 'عقد معتمد بقيمة 165,000 ج.م - تم تحصيل العربون ودفعة الشحن (132,000 ج.م).'
  },
  {
    id: 'tech-prj-103',
    projectNumber: 'TECH-2026-003',
    salesProjectId: 'prj-103',
    salesProjectNumber: 'PRJ-2026-003',
    projectName: 'مطبخ كلاسيك قشرة أرو طبيعي - مدينة نصر',
    customerId: 'cust-12',
    customerName: 'أ. شريف مدكور',
    customerPhone: '01006677889',
    contractId: 'cnt-103',
    contractNumber: 'CNT-2026-003',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    projectType: 'kitchen',
    status: 'released_to_planning',
    priority: 'urgent',
    responsibleEngineerId: 'user-2',
    responsibleEngineerName: 'م. إبراهيم فؤاد',
    designerEngineerName: 'م. كريم سامي',
    createdDate: '2026-08-19',
    lastUpdatedDate: '2026-08-26 13:00',
    targetReleaseDate: '2026-08-26',
    activeDesignVersion: 2,
    activeBomRevision: 'REV-A',
    handoverId: 'hnd-103',
    technicalNotes: 'تم الإفراج للتخطيط. التقطيع معلق لحين توريد 12 لوح أبلكاج قشرة أرو من المورد (أمر شراء عاجل).',
    commercialScopeSummary: 'عقد معتمد بقيمة 210,000 ج.م - تم التحقق من العربون 40% (84,000 ج.م) بسند RCP-2026-003.'
  },
  {
    id: 'tech-prj-104',
    projectNumber: 'TECH-2026-004',
    salesProjectId: 'prj-104',
    salesProjectNumber: 'PRJ-2026-004',
    projectName: 'مطبخ أكريليك أبيض لامع - جليم الإسكندرية',
    customerId: 'cust-6',
    customerName: 'د. نورهان علي',
    customerPhone: '01199887711',
    contractId: 'cnt-104',
    contractNumber: 'CNT-2026-004',
    branchId: 'branch-4',
    branchName: 'معرض الإسكندرية - سموحة',
    projectType: 'kitchen',
    status: 'pending_handover',
    priority: 'normal',
    responsibleEngineerId: 'user-2',
    responsibleEngineerName: 'م. إبراهيم فؤاد',
    createdDate: '2026-08-27',
    lastUpdatedDate: '2026-08-27 13:30',
    targetReleaseDate: '2026-09-08',
    activeDesignVersion: 1,
    activeBomRevision: 'REV-01',
    handoverId: 'hnd-104',
    technicalNotes: 'محضر تسليم جديد وارد من معرض الإسكندرية في انتظار التدقيق والقبول الفني.',
    commercialScopeSummary: 'عقد معتمد بقيمة 175,000 ج.م - تم التحقق من العربون 40% (70,000 ج.م).'
  }
];

export const initialTechnicalSurveys: TechnicalSiteSurvey[] = [
  {
    id: 'srv-101',
    technicalProjectId: 'tech-prj-101',
    surveyNumber: 'SRV-2026-001',
    surveyDate: '2026-08-20',
    surveyorName: 'م. عمر فاروق (مهندس المساحة والموقع)',
    status: 'verified',
    ceilingHeightCm: 280,
    flooringLevelStatus: 'perfect',
    flooringVarianceMm: 2,
    walls: [
      {
        id: 'wall-1',
        wallName: 'الجدار A (الرئيسي - حوض وغسالة أطباق)',
        lengthCm: 419.5,
        heightCm: 280,
        angleDegrees: 90,
        plasterQuality: 'straight',
        notes: 'جدار مستقيم تماماً مع تأسيس نقاط السباكة المركزية'
      },
      {
        id: 'wall-2',
        wallName: 'الجدار B (الجانبي - عمود خرساني وشفاط وبوتاجاز)',
        lengthCm: 339.5,
        heightCm: 280,
        angleDegrees: 89.5,
        plasterQuality: 'straight',
        notes: 'يوجد عمود بارز 15 سم × 35 سم بالزاوية الداخلية'
      },
      {
        id: 'wall-3',
        wallName: 'الجدار C (الثلاجة والدواليب الطولية)',
        lengthCm: 220,
        heightCm: 280,
        angleDegrees: 90,
        plasterQuality: 'straight',
        notes: 'مخصص لوحدة الثلاجة البلت إن والدولاب الطولي للفرن والميكروويف'
      }
    ],
    openings: [
      {
        id: 'op-1',
        type: 'window',
        location: 'الجدار A',
        widthCm: 120,
        heightCm: 100,
        distanceFromFloorCm: 110,
        distanceFromCornerCm: 140,
        notes: 'نافذة ألوميتال دبل جلاس تفتح منزلق'
      },
      {
        id: 'op-2',
        type: 'door',
        location: 'الجدار C',
        widthCm: 90,
        heightCm: 215,
        distanceFromFloorCm: 0,
        distanceFromCornerCm: 20,
        notes: 'باب مدخل المطبخ من الريسبشن'
      }
    ],
    electricalPoints: [
      {
        id: 'el-1',
        purpose: 'مأخذ شفاط بوتاجاز 220V',
        locationWall: 'الجدار B',
        heightFromFloorCm: 210,
        distanceFromCornerCm: 160,
        status: 'ok'
      },
      {
        id: 'el-2',
        purpose: 'مأخذ غسالة أطباق بلت إن',
        locationWall: 'الجدار A',
        heightFromFloorCm: 45,
        distanceFromCornerCm: 240,
        status: 'ok'
      },
      {
        id: 'el-3',
        purpose: 'فيش استخدام للأجهزة الصغيرة (خلاط/غلاية)',
        locationWall: 'الجدار A',
        heightFromFloorCm: 115,
        distanceFromCornerCm: 80,
        status: 'ok'
      },
      {
        id: 'el-4',
        purpose: 'مأخذ ثلاجة وفرن بلت إن',
        locationWall: 'الجدار C',
        heightFromFloorCm: 50,
        distanceFromCornerCm: 70,
        status: 'ok'
      }
    ],
    plumbing: {
      waterSupplyLocation: 'الجدار A على بعد 180 سم من الزاوية A-B',
      waterDrainageLocation: 'ماسورة صرف 2 بوصة على ارتفاع 45 سم من الأرضية',
      hotColdDistanceCm: 15,
      drainDiameterInch: 2,
      status: 'ok',
      notes: 'تأسيس ممتاز مطابق للكود الهندسي'
    },
    gas: {
      hasNaturalGas: true,
      valveLocation: 'الجدار B على بعد 155 سم من الزاوية',
      valveHeightCm: 75,
      status: 'ok',
      notes: 'محبس غاز آمن ومطابق للمواصفات'
    },
    ventilation: {
      hasDuctHole: true,
      ductDiameterCm: 15,
      ductHeightFromFloorCm: 235,
      ductLocation: 'الجدار B أعلى مكان البوتاجاز مباشرة'
    },
    appliances: [
      {
        id: 'app-1',
        applianceType: 'refrigerator',
        name: 'ثلاجة بلت إن سامسونج 24 قدم',
        brand: 'Samsung',
        model: 'RS68A8820S9',
        widthCm: 91.2,
        heightCm: 178,
        depthCm: 71.6,
        supplyType: 'electric',
        supplyStatus: 'customer_provided',
        notes: 'ترك خلوص 5 سم من كل جانب للتهوية'
      },
      {
        id: 'app-2',
        applianceType: 'built_in_oven',
        name: 'فرن بلت إن 60 سم بوش تركي',
        brand: 'Bosch',
        model: 'HBF113BR0M',
        widthCm: 59.5,
        heightCm: 59.5,
        depthCm: 54.8,
        supplyType: 'electric',
        supplyStatus: 'customer_provided',
        notes: 'يركب داخل الدولاب الطولي على ارتفاع 90 سم'
      },
      {
        id: 'app-3',
        applianceType: 'gas_hob',
        name: 'مسطح غاز 90 سم 5 شعلة بوش',
        brand: 'Bosch',
        model: 'PBP6B5B80O',
        widthCm: 86,
        heightCm: 5,
        depthCm: 51,
        supplyType: 'gas',
        supplyStatus: 'customer_provided',
        notes: 'فتحة التقطيع بالرخام 83 × 48 سم'
      },
      {
        id: 'app-4',
        applianceType: 'hood',
        name: 'شفاط هرمي 90 سم قوة شفط 700 م³/س',
        brand: 'Bosch',
        model: 'DWB96BC50',
        widthCm: 90,
        heightCm: 65,
        depthCm: 50,
        supplyType: 'electric',
        supplyStatus: 'customer_provided'
      },
      {
        id: 'app-5',
        applianceType: 'dishwasher',
        name: 'غسالة أطباق 60 سم بلت إن بالكامل',
        brand: 'Beko',
        model: 'DIS28123',
        widthCm: 59.8,
        heightCm: 81.8,
        depthCm: 55,
        supplyType: 'water_drain',
        supplyStatus: 'customer_provided',
        notes: 'تحتاج ضلفة خشب خارجية بنفس لون المطبخ'
      },
      {
        id: 'app-6',
        applianceType: 'sink',
        name: 'حوض ستانلس كوري حلتين ساقط رخام',
        brand: 'Franke',
        widthCm: 85,
        heightCm: 22,
        depthCm: 48,
        supplyType: 'water_drain',
        supplyStatus: 'factory_supplied',
        notes: 'ساقط رخام Undermount'
      }
    ],
    obstaclesAndConstraints: {
      hasConcreteColumn: true,
      columnSpecs: 'عمود 15 سم × 35 سم بالزاوية A-B - تم تصميم علبة خاصة متغيرة العمق لتغطية العمود',
      hasCeilingBeams: false,
      accessRestrictions: 'فيلا أرضي مدخل مباشر - لا توجد عوائق في النقل والتحميل'
    },
    sitePhotos: [
      KITCHEN_DRAWINGS.elevationA,
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600'
    ],
    sketches: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600'
    ],
    verifiedByEngineerName: 'م. إبراهيم فؤاد',
    verifiedAt: '2026-08-20 18:00',
    notes: 'تم اعتماد تقرير الرفع المساحي بالكامل وإرساله لقسم التصميم والتفجير.'
  }
];

export const initialTechnicalDesigns: TechnicalDesignRevision[] = [
  {
    id: 'tdsg-101-v1',
    technicalProjectId: 'tech-prj-101',
    versionNumber: 1,
    versionCode: 'DWG-V1.0',
    title: 'المخطط التنفيذي الأولي للعلب وتوزيع الأجهزة',
    designerName: 'م. كريم سامي',
    cadFiles: [
      {
        id: 'cad-1',
        name: 'kitchen_mohamed_hassan_layout_v1.dwg',
        fileType: 'dwg',
        fileSize: '4.8 MB',
        uploadedAt: '2026-08-21 14:00',
        uploadedBy: 'م. كريم سامي'
      },
      {
        id: 'cad-2',
        name: 'kitchen_mohamed_hassan_elevations.pdf',
        fileType: 'pdf',
        fileSize: '2.1 MB',
        uploadedAt: '2026-08-21 14:05',
        uploadedBy: 'م. كريم سامي'
      }
    ],
    renders: [
      KITCHEN_DRAWINGS.elevationA
    ],
    changeDescription: 'الإصدار المبدئي المعتمد على مقاسات المعاينة الأولية',
    status: 'superseded',
    customerApproved: true,
    notes: 'تم التعديل لإضافة الجزيرة الوسطية (Island) وتوزيع الليد بروفايل المخفي'
  },
  {
    id: 'tdsg-101-v2',
    technicalProjectId: 'tech-prj-101',
    versionNumber: 2,
    versionCode: 'DWG-V2.0',
    title: 'المخطط الهندسي التنفيذي المعتمد للإنتاج (Shop Drawings)',
    designerName: 'م. كريم سامي',
    cadFiles: [
      {
        id: 'cad-3',
        name: 'kitchen_mohamed_hassan_shopdrawings_approved_v2.dwg',
        fileType: 'dwg',
        fileSize: '6.2 MB',
        uploadedAt: '2026-08-22 17:00',
        uploadedBy: 'م. كريم سامي'
      },
      {
        id: 'cad-4',
        name: 'kitchen_cutting_and_drilling_cnc.dxf',
        fileType: 'dxf',
        fileSize: '3.4 MB',
        uploadedAt: '2026-08-22 17:10',
        uploadedBy: 'م. كريم سامي'
      },
      {
        id: 'cad-5',
        name: 'final_approved_drawings_package.pdf',
        fileType: 'pdf',
        fileSize: '5.1 MB',
        uploadedAt: '2026-08-22 17:15',
        uploadedBy: 'م. كريم سامي'
      }
    ],
    renders: [
      KITCHEN_DRAWINGS.elevationA,
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600'
    ],
    changeDescription: 'تضمين جزيرة وسطية 180×90 سم وتعديل تجاويف علبة العمود الخرساني 15×35 سم',
    status: 'approved',
    approvedBy: 'م. إبراهيم فؤاد (رئيس المكتب الفني)',
    approvedAt: '2026-08-22 19:00',
    customerApproved: true,
    notes: 'مخططات تنفيذية معتمدة ونهائية ومطابقة لمواصفات العقد وعرض السعر'
  }
];

export const initialTechnicalBOMs: TechnicalBOM[] = [
  {
    id: 'tbom-101-reva',
    technicalProjectId: 'tech-prj-101',
    revisionCode: 'REV-A',
    revisionNumber: 1,
    title: 'جدول تفجير المواد وقوائم التقطيع المعتمدة للمطبخ (BOM Production Package)',
    status: 'approved',
    createdBy: 'م. كريم سامي (مهندس المكتب الفني)',
    createdDate: '2026-08-23',
    approvedBy: 'م. إبراهيم فؤاد (رئيس المكتب الفني)',
    approvedAt: '2026-08-24 12:00',
    totalPartsCount: 42,
    totalHardwareCount: 58,
    totalEstimatedMaterialCost: 64200,
    notes: 'الـ BOM المعتمد لتجهيز أوامر الصرف وأمر الشغل للتخطيط والمصنع.',
    units: [
      {
        id: 'u-1',
        unitCode: 'BASE-80-2D',
        unitName: 'علبة سفلية درفتين 80 سم (شاسيه معالج ضد المياه)',
        unitType: 'base_cabinet',
        dimensions: { widthMm: 800, heightMm: 720, depthMm: 580 },
        quantity: 2,
        cuttingParts: [
          {
            id: 'cp-1',
            partName: 'جنب يمين',
            materialId: 'mat-1',
            materialName: 'MDF 18mm حشو أبيض جود وود معالج HPL',
            materialCode: 'MDF-GW-18W',
            lengthMm: 720,
            widthMm: 580,
            thicknessMm: 18,
            quantity: 2,
            grainDirection: 'length',
            edgeBanding: { top: 'PVC 1mm أبيض', bottom: 'PVC 1mm أبيض', left: 'PVC 2mm أبيض (واجهة)', right: 'PVC 0.4mm' },
            drillingCncCode: 'DRILL-BASE-SIDE-R'
          },
          {
            id: 'cp-2',
            partName: 'جنب شمال',
            materialId: 'mat-1',
            materialName: 'MDF 18mm حشو أبيض جود وود معالج HPL',
            materialCode: 'MDF-GW-18W',
            lengthMm: 720,
            widthMm: 580,
            thicknessMm: 18,
            quantity: 2,
            grainDirection: 'length',
            edgeBanding: { top: 'PVC 1mm أبيض', bottom: 'PVC 1mm أبيض', left: 'PVC 2mm أبيض (واجهة)', right: 'PVC 0.4mm' },
            drillingCncCode: 'DRILL-BASE-SIDE-L'
          },
          {
            id: 'cp-3',
            partName: 'قاع العلبة',
            materialId: 'mat-1',
            materialName: 'MDF 18mm حشو أبيض جود وود معالج HPL',
            materialCode: 'MDF-GW-18W',
            lengthMm: 764,
            widthMm: 580,
            thicknessMm: 18,
            quantity: 2,
            grainDirection: 'width',
            edgeBanding: { top: 'PVC 2mm أبيض (واجهة)', bottom: 'none', left: 'PVC 0.4mm', right: 'PVC 0.4mm' }
          },
          {
            id: 'cp-4',
            partName: 'رف داخلي متحرك',
            materialId: 'mat-1',
            materialName: 'MDF 18mm حشو أبيض جود وود معالج HPL',
            materialCode: 'MDF-GW-18W',
            lengthMm: 762,
            widthMm: 550,
            thicknessMm: 18,
            quantity: 2,
            grainDirection: 'width',
            edgeBanding: { top: 'PVC 2mm أبيض', bottom: 'PVC 0.4mm', left: 'PVC 0.4mm', right: 'PVC 0.4mm' }
          },
          {
            id: 'cp-5',
            partName: 'ضلفة HPL خارجي (يمين)',
            materialId: 'mat-4',
            materialName: 'HPL رويال كود 812 خشابي فاتح مط',
            materialCode: 'HPL-RY-812',
            lengthMm: 716,
            widthMm: 396,
            thicknessMm: 18,
            quantity: 2,
            grainDirection: 'length',
            edgeBanding: { top: 'PVC 2mm لون الضلفة', bottom: 'PVC 2mm', left: 'PVC 2mm', right: 'PVC 2mm' }
          },
          {
            id: 'cp-6',
            partName: 'ضلفة HPL خارجي (شمال)',
            materialId: 'mat-4',
            materialName: 'HPL رويال كود 812 خشابي فاتح مط',
            materialCode: 'HPL-RY-812',
            lengthMm: 716,
            widthMm: 396,
            thicknessMm: 18,
            quantity: 2,
            grainDirection: 'length',
            edgeBanding: { top: 'PVC 2mm لون الضلفة', bottom: 'PVC 2mm', left: 'PVC 2mm', right: 'PVC 2mm' }
          },
          {
            id: 'cp-7',
            partName: 'ظهر علبة 6مم سيلفر',
            materialId: 'mat-2',
            materialName: 'HDF 6mm ظهر سيلفر معالج',
            materialCode: 'HDF-SLV-6',
            lengthMm: 710,
            widthMm: 790,
            thicknessMm: 6,
            quantity: 2,
            grainDirection: 'none',
            edgeBanding: {}
          }
        ],
        hardwareParts: [
          {
            id: 'hp-1',
            itemId: 'mat-7',
            itemName: 'مفصلة بلوم كليب توب سوفت كلوز 110° أصلية نمساوي',
            itemCode: 'BLUM-71B3550',
            quantity: 8,
            unit: 'حبة',
            unitCostEstimate: 145,
            totalCostEstimate: 1160
          },
          {
            id: 'hp-2',
            itemId: 'mat-10',
            itemName: 'أرجل مطبخ بلاستيك هيفي ديوتي 10-15 سم مع كلبسات وزرة',
            itemCode: 'LEG-HD-1015',
            quantity: 8,
            unit: 'حبة',
            unitCostEstimate: 22,
            totalCostEstimate: 176
          },
          {
            id: 'hp-3',
            itemId: 'mat-9',
            itemName: 'مقبض بروفايل Gola أسود مط كود G-01',
            itemCode: 'GOLA-BLK-01',
            quantity: 2,
            unit: 'متر',
            unitCostEstimate: 210,
            totalCostEstimate: 420
          }
        ]
      },
      {
        id: 'u-2',
        unitCode: 'SINK-90-2D',
        unitName: 'علبة حوض سفلية 90 سم (أرضية ألومنيوم معزولة)',
        unitType: 'sink_unit',
        dimensions: { widthMm: 900, heightMm: 720, depthMm: 580 },
        quantity: 1,
        cuttingParts: [
          {
            id: 'cp-8',
            partName: 'جنب يمين حوض',
            materialId: 'mat-1',
            materialName: 'MDF 18mm حشو أبيض جود وود معالج HPL',
            materialCode: 'MDF-GW-18W',
            lengthMm: 720,
            widthMm: 580,
            thicknessMm: 18,
            quantity: 1,
            grainDirection: 'length',
            edgeBanding: { top: 'PVC 1mm', bottom: 'PVC 1mm', left: 'PVC 2mm', right: 'PVC 0.4mm' }
          },
          {
            id: 'cp-9',
            partName: 'جنب شمال حوض',
            materialId: 'mat-1',
            materialName: 'MDF 18mm حشو أبيض جود وود معالج HPL',
            materialCode: 'MDF-GW-18W',
            lengthMm: 720,
            widthMm: 580,
            thicknessMm: 18,
            quantity: 1,
            grainDirection: 'length',
            edgeBanding: { top: 'PVC 1mm', bottom: 'PVC 1mm', left: 'PVC 2mm', right: 'PVC 0.4mm' }
          },
          {
            id: 'cp-10',
            partName: 'قاع حوض مكسو شيت ألومنيوم مقاوم للتسريب',
            materialId: 'mat-1',
            materialName: 'MDF 18mm حشو أبيض جود وود معالج HPL',
            materialCode: 'MDF-GW-18W',
            lengthMm: 864,
            widthMm: 580,
            thicknessMm: 18,
            quantity: 1,
            grainDirection: 'width',
            edgeBanding: { top: 'PVC 2mm', bottom: 'none', left: 'PVC 0.4mm', right: 'PVC 0.4mm' }
          },
          {
            id: 'cp-11',
            partName: 'ضلف حوض 45 سم (يمين + شمال)',
            materialId: 'mat-4',
            materialName: 'HPL رويال كود 812 خشابي فاتح مط',
            materialCode: 'HPL-RY-812',
            lengthMm: 716,
            widthMm: 446,
            thicknessMm: 18,
            quantity: 2,
            grainDirection: 'length',
            edgeBanding: { top: 'PVC 2mm', bottom: 'PVC 2mm', left: 'PVC 2mm', right: 'PVC 2mm' }
          }
        ],
        hardwareParts: [
          {
            id: 'hp-4',
            itemId: 'mat-7',
            itemName: 'مفصلة بلوم كليب توب سوفت كلوز 110°',
            itemCode: 'BLUM-71B3550',
            quantity: 4,
            unit: 'حبة',
            unitCostEstimate: 145,
            totalCostEstimate: 580
          },
          {
            id: 'hp-5',
            itemId: 'mat-12',
            itemName: 'شيت ألومنيوم حماية أرضية الحوض 90سم',
            itemCode: 'ALUM-TRAY-90',
            quantity: 1,
            unit: 'قطعة',
            unitCostEstimate: 350,
            totalCostEstimate: 350
          }
        ]
      },
      {
        id: 'u-3',
        unitCode: 'DRW-60-3D',
        unitName: 'علبة 3 أدراج تاندوم بوكس سوفت كلوز 60 سم',
        unitType: 'drawer_unit',
        dimensions: { widthMm: 600, heightMm: 720, depthMm: 580 },
        quantity: 1,
        cuttingParts: [
          {
            id: 'cp-12',
            partName: 'جنبين علبة الأدراج',
            materialId: 'mat-1',
            materialName: 'MDF 18mm حشو أبيض جود وود معالج HPL',
            materialCode: 'MDF-GW-18W',
            lengthMm: 720,
            widthMm: 580,
            thicknessMm: 18,
            quantity: 2,
            grainDirection: 'length',
            edgeBanding: { top: 'PVC 1mm', bottom: 'PVC 1mm', left: 'PVC 2mm', right: 'PVC 0.4mm' }
          },
          {
            id: 'cp-13',
            partName: 'وش درج علوي 14 سم',
            materialId: 'mat-4',
            materialName: 'HPL رويال كود 812 خشابي فاتح مط',
            materialCode: 'HPL-RY-812',
            lengthMm: 140,
            widthMm: 596,
            thicknessMm: 18,
            quantity: 1,
            grainDirection: 'width',
            edgeBanding: { top: 'PVC 2mm', bottom: 'PVC 2mm', left: 'PVC 2mm', right: 'PVC 2mm' }
          },
          {
            id: 'cp-14',
            partName: 'وش درج أوسط 28 سم',
            materialId: 'mat-4',
            materialName: 'HPL رويال كود 812 خشابي فاتح مط',
            materialCode: 'HPL-RY-812',
            lengthMm: 284,
            widthMm: 596,
            thicknessMm: 18,
            quantity: 1,
            grainDirection: 'width',
            edgeBanding: { top: 'PVC 2mm', bottom: 'PVC 2mm', left: 'PVC 2mm', right: 'PVC 2mm' }
          },
          {
            id: 'cp-15',
            partName: 'وش درج سفلي حلل 28 سم',
            materialId: 'mat-4',
            materialName: 'HPL رويال كود 812 خشابي فاتح مط',
            materialCode: 'HPL-RY-812',
            lengthMm: 284,
            widthMm: 596,
            thicknessMm: 18,
            quantity: 1,
            grainDirection: 'width',
            edgeBanding: { top: 'PVC 2mm', bottom: 'PVC 2mm', left: 'PVC 2mm', right: 'PVC 2mm' }
          }
        ],
        hardwareParts: [
          {
            id: 'hp-6',
            itemId: 'mat-8',
            itemName: 'طقم مجرى درج بلوم تاندوم بوكس انتيفو سوفت كلوز 50 سم',
            itemCode: 'BLUM-TANDEM-50',
            quantity: 3,
            unit: 'طقم',
            unitCostEstimate: 980,
            totalCostEstimate: 2940
          }
        ]
      },
      {
        id: 'u-4',
        unitCode: 'TALL-60-OVEN',
        unitName: 'دولاب طولي 60 سم فرن وميكروويف بلت إن وتخزين',
        unitType: 'tall_cabinet',
        dimensions: { widthMm: 600, heightMm: 2200, depthMm: 580 },
        quantity: 1,
        cuttingParts: [
          {
            id: 'cp-16',
            partName: 'جنب دولاب يمين 220 سم',
            materialId: 'mat-1',
            materialName: 'MDF 18mm حشو أبيض جود وود معالج HPL',
            materialCode: 'MDF-GW-18W',
            lengthMm: 2200,
            widthMm: 580,
            thicknessMm: 18,
            quantity: 1,
            grainDirection: 'length',
            edgeBanding: { top: 'PVC 1mm', bottom: 'PVC 1mm', left: 'PVC 2mm', right: 'PVC 0.4mm' }
          },
          {
            id: 'cp-17',
            partName: 'جنب دولاب شمال 220 سم',
            materialId: 'mat-1',
            materialName: 'MDF 18mm حشو أبيض جود وود معالج HPL',
            materialCode: 'MDF-GW-18W',
            lengthMm: 2200,
            widthMm: 580,
            thicknessMm: 18,
            quantity: 1,
            grainDirection: 'length',
            edgeBanding: { top: 'PVC 1mm', bottom: 'PVC 1mm', left: 'PVC 2mm', right: 'PVC 0.4mm' }
          },
          {
            id: 'cp-18',
            partName: 'ضلفة سفلية 72 سم',
            materialId: 'mat-4',
            materialName: 'HPL رويال كود 812 خشابي فاتح مط',
            materialCode: 'HPL-RY-812',
            lengthMm: 716,
            widthMm: 596,
            thicknessMm: 18,
            quantity: 1,
            grainDirection: 'length',
            edgeBanding: { top: 'PVC 2mm', bottom: 'PVC 2mm', left: 'PVC 2mm', right: 'PVC 2mm' }
          },
          {
            id: 'cp-19',
            partName: 'ضلفة علوية 60 سم',
            materialId: 'mat-4',
            materialName: 'HPL رويال كود 812 خشابي فاتح مط',
            materialCode: 'HPL-RY-812',
            lengthMm: 596,
            widthMm: 596,
            thicknessMm: 18,
            quantity: 1,
            grainDirection: 'length',
            edgeBanding: { top: 'PVC 2mm', bottom: 'PVC 2mm', left: 'PVC 2mm', right: 'PVC 2mm' }
          }
        ],
        hardwareParts: [
          {
            id: 'hp-7',
            itemId: 'mat-7',
            itemName: 'مفصلة بلوم كليب توب سوفت كلوز',
            itemCode: 'BLUM-71B3550',
            quantity: 6,
            unit: 'حبة',
            unitCostEstimate: 145,
            totalCostEstimate: 870
          }
        ]
      },
      {
        id: 'u-5',
        unitCode: 'ISLAND-180',
        unitName: 'جزيرة وسطية مودرن 180×90 سم مع بار إفطار',
        unitType: 'island',
        dimensions: { widthMm: 1800, heightMm: 880, depthMm: 900 },
        quantity: 1,
        cuttingParts: [
          {
            id: 'cp-20',
            partName: 'تجاليد ظهر الجزيرة HPL',
            materialId: 'mat-4',
            materialName: 'HPL رويال كود 812 خشابي فاتح مط',
            materialCode: 'HPL-RY-812',
            lengthMm: 1800,
            widthMm: 850,
            thicknessMm: 18,
            quantity: 1,
            grainDirection: 'width',
            edgeBanding: { top: 'PVC 2mm', bottom: 'PVC 2mm', left: 'PVC 2mm', right: 'PVC 2mm' }
          }
        ],
        hardwareParts: [
          {
            id: 'hp-8',
            itemId: 'mat-13',
            itemName: 'شريط ليد بروفايل مخفي دافئ مع محول MeanWell',
            itemCode: 'LED-PROF-WARM',
            quantity: 6,
            unit: 'متر',
            unitCostEstimate: 180,
            totalCostEstimate: 1080
          }
        ]
      }
    ],
    materialsSummary: [
      {
        materialId: 'mat-1',
        materialName: 'MDF 18mm حشو أبيض جود وود معالج HPL',
        materialCode: 'MDF-GW-18W',
        totalAreaSqMeters: 38.6,
        estimatedSheetsCount: 14,
        scrapPercentage: 11.5
      },
      {
        materialId: 'mat-4',
        materialName: 'HPL رويال كود 812 خشابي فاتح مط',
        materialCode: 'HPL-RY-812',
        totalAreaSqMeters: 24.2,
        estimatedSheetsCount: 9,
        scrapPercentage: 9.8
      },
      {
        materialId: 'mat-2',
        materialName: 'HDF 6mm ظهر سيلفر معالج',
        materialCode: 'HDF-SLV-6',
        totalAreaSqMeters: 12.4,
        estimatedSheetsCount: 5,
        scrapPercentage: 8.2
      }
    ],
    hardwareSummary: [
      {
        itemId: 'mat-7',
        itemName: 'مفصلة بلوم كليب توب سوفت كلوز 110° نمساوي',
        itemCode: 'BLUM-71B3550',
        totalQuantity: 28,
        unit: 'حبة'
      },
      {
        itemId: 'mat-8',
        itemName: 'طقم مجرى درج بلوم تاندوم بوكس انتيفو سوفت كلوز 50 سم',
        itemCode: 'BLUM-TANDEM-50',
        totalQuantity: 6,
        unit: 'طقم'
      },
      {
        itemId: 'mat-9',
        itemName: 'مقبض بروفايل Gola أسود مط كود G-01',
        itemCode: 'GOLA-BLK-01',
        totalQuantity: 14,
        unit: 'متر'
      },
      {
        itemId: 'mat-10',
        itemName: 'أرجل مطبخ بلاستيك هيفي ديوتي 10-15 سم',
        itemCode: 'LEG-HD-1015',
        totalQuantity: 24,
        unit: 'حبة'
      },
      {
        itemId: 'mat-13',
        itemName: 'شريط ليد بروفايل مخفي دافئ مع محول',
        itemCode: 'LED-PROF-WARM',
        totalQuantity: 12,
        unit: 'متر'
      }
    ]
  }
];

export const initialTechnicalReleases: TechnicalReleasePackage[] = [
  {
    id: 'rel-101',
    releaseNumber: 'REL-2026-001',
    technicalProjectId: 'tech-prj-101',
    projectNumber: 'TECH-2026-001',
    customerName: 'محمد حسن',
    contractNumber: 'CNT-2026-001',
    approvedDesignVersion: 2,
    approvedBomRevision: 'REV-A',
    releasedByUserName: 'م. إبراهيم فؤاد (رئيس المكتب الفني)',
    releasedAt: '2026-08-24 14:30',
    targetProductionStartDate: '2026-08-26',
    targetFactoryCompletionDate: '2026-09-15',
    targetSiteInstallationDate: '2026-09-18',
    planningStatus: 'materials_allocated',
    planningReceivedBy: 'م. سامح جودة (مدير التخطيط والمشتريات)',
    planningReceivedAt: '2026-08-24 15:00',
    planningNotes: 'تم حجز 14 لوح MDF جود وود و28 مفصلة بلوم بالمخزن، وجاري إصدار أمر توريد 3 ألواح HPL إضافية.',
    technicalSpecificationsSummary: 'مطبخ HPL كود 812 مع جزيرة وسطية ومفصلات بلوم وتجاليد عمود خرساني بالجدار B.',
    specialManufacturingInstructions: 'تفريغ عمود الحائط B بدقة 15×35 سم، وتجليد قشاط PVC 2مم بالكامل لضمان مقاومة الرطوبة.'
  },
  {
    id: 'rel-102',
    releaseNumber: 'REL-2026-002',
    technicalProjectId: 'tech-prj-102',
    projectNumber: 'TECH-2026-002',
    customerName: 'م. حازم السعدني',
    contractNumber: 'CNT-2026-002',
    approvedDesignVersion: 2,
    approvedBomRevision: 'REV-A',
    releasedByUserName: 'م. إبراهيم فؤاد (رئيس المكتب الفني)',
    releasedAt: '2026-07-30 12:00',
    targetProductionStartDate: '2026-08-10',
    targetFactoryCompletionDate: '2026-08-24',
    targetSiteInstallationDate: '2026-08-28',
    planningStatus: 'materials_allocated',
    planningReceivedBy: 'م. سامح جودة (مدير التخطيط والمشتريات)',
    planningReceivedAt: '2026-07-30 14:00',
    planningNotes: 'تم صرف كامل الخامات والتصنيع مكتمل.',
    technicalSpecificationsSummary: 'سرير كينج بسحارة هيدروليك + دريسنج 4.2م بدلف زجاج فاميه وبروفايل ألومنيوم أسود.',
    specialManufacturingInstructions: 'تغليف الزجاج في طرد مستقل بحماية زوايا.'
  },
  {
    id: 'rel-103',
    releaseNumber: 'REL-2026-003',
    technicalProjectId: 'tech-prj-103',
    projectNumber: 'TECH-2026-003',
    customerName: 'أ. شريف مدكور',
    contractNumber: 'CNT-2026-003',
    approvedDesignVersion: 2,
    approvedBomRevision: 'REV-A',
    releasedByUserName: 'م. إبراهيم فؤاد (رئيس المكتب الفني)',
    releasedAt: '2026-08-26 13:00',
    targetProductionStartDate: '2026-08-31',
    targetFactoryCompletionDate: '2026-09-18',
    targetSiteInstallationDate: '2026-09-24',
    planningStatus: 'shortages_identified',
    planningReceivedBy: 'م. سامح جودة (مدير التخطيط والمشتريات)',
    planningReceivedAt: '2026-08-26 15:00',
    planningNotes: 'عجز 12 لوح أبلكاج قشرة أرو - تم إصدار طلب شراء عاجل.',
    technicalSpecificationsSummary: 'مطبخ U كلاسيك بقشرة أرو ودهان أستر مط ورخام كريما مارفيل.',
    specialManufacturingInstructions: 'مطابقة اتجاه عروق القشرة في الدلف المتجاورة.'
  }
];

export const initialEngineeringChangeRequests: EngineeringChangeRequest[] = [
  {
    id: 'ecr-101',
    ecrNumber: 'ECR-2026-001',
    technicalProjectId: 'tech-prj-101',
    projectNumber: 'TECH-2026-001',
    customerName: 'محمد حسن',
    title: 'تعديل عرض علبة الفرن الطولية واستبدال مكان الميكروويف',
    reason: 'قام العميل بتغيير موديل الميكروويف من 20 لتر إلى موديل بوش 25 لتر بفتحة أكبر',
    source: 'customer_request',
    requestedByUserName: 'عمر فاروق (مسؤول المبيعات)',
    requestedDate: '2026-08-27 11:00',
    previousBomRevision: 'REV-A',
    targetNewBomRevision: 'REV-B',
    affectedUnits: ['TALL-60-OVEN'],
    impactAssessment: {
      costImpact: 450,
      scheduleDelayDays: 0,
      materialsWasted: 'لا يوجد هالك - علبة الفرن الطولية لم تدخل التجميع بعد',
      customerApprovalRequired: true
    },
    status: 'under_review',
    reviewedByUserName: 'م. إبراهيم فؤاد',
    reviewedAt: '2026-08-27 12:30',
    resolutionNotes: 'التعديل متاح هندسياً وتكلفة بسيطة للفارق.'
  }
];
