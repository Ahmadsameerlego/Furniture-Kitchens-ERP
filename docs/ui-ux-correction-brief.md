# أمر تصحيح الواجهة — إلزامي

> **لمين:** الـ Agent المسؤول عن الواجهة.
> **الحالة:** المحاولة السابقة **مرفوضة**. المطلوب تصحيحها وتكملتها على **كل** صفحات وشاشات ومودالات النظام.
> **مرجع التصميم:** [`docs/ui-ux-agent-brief.md`](ui-ux-agent-brief.md). كل اللي فيه لسه ساري. الفايل ده بيضيف عليه قواعد أشد، ولو فيه تعارض، **الفايل ده هو اللي يتنفذ**.
> **نقطة المقارنة (Baseline):** الـ commit `2715c76`. أي حاجة كانت موجودة على الشاشة في الـ commit ده لازم تفضل موجودة بعد شغلك.

---

## 0) ليه اترفض الشغل اللي فات

دي مش ملاحظات ذوق. دي مخالفات صريحة لقواعد كانت مكتوبة:

| # | المخالفة | القاعدة اللي اتكسرت |
|---|---|---|
| 1 | **اتشالت Features من الشاشة:** تعليقات التصميم، ورفض التصميم بسبب، وجدولة زيارة المعاينة، ورفع صور المقاسات، ورفع صور التصميم (كلهم في صفحة المشروع)، وزرار الطباعة في عروض الأسعار والعقود وقيود اليومية، ورابط فتح المشروع من عرض السعر ومن العقد. والـ State بتاعهم فضل في الكود من غير ما يتستخدم. | "ممنوع حذف أي Feature أو زرار أو شاشة" |
| 2 | الأرقام بقت مخلوطة: أرقام هندي (`ar-EG`) جنب أرقام لاتيني في نفس الشاشة، و"EGP" في مكان و"ج.م" في مكان. | "أرقام لاتينية في كل النظام" |
| 3 | 13 صفحة اتعدلت والباقي فضل بالشكل القديم (Hero داكن، أزرار خضرا، `rounded-3xl`). النظام بقى شكلين. | "اشتغل موديول موديول وما تسيبش الديمو بشكلين" |
| 4 | هيدر مكرر: PageHeader جديد وتحته الهيدر القديم (عنوانين، وزرارين لنفس الإجراء بشكلين). | "قالب صفحة واحد" |
| 5 | قواعد عامة بـ `!important` في `index.css` بتغطي على `font-black` و`text-[10px]` و`rounded-2xl` بدل ما تتشال من الكود. قلبت ترتيب الزوايا (`2xl` بقت أصغر من `xl`)، وكسرت ارتفاع الـ Badges. وكمان `* { border-color }` على كل عناصر الصفحة. | "صفر Hex، صفر font-black… في الكود" |
| 6 | عيوب ظاهرة: تاب نشط نصه أبيض على أبيض، وفلاتر متكومة، وأكواد وأزرار بتتقسم على سطرين، وجدول مقصوص، وProgress bars اختفت، وحالة "sent" بالإنجليزي، وعربي وإنجليزي متلخبطين في نفس السطر، و⌘K على ويندوز. | معايير الجودة |

**الشغل ده يعتبر مخلص لما كل بند في القسم 7 يعدّي. مفيش "قربت" ولا "الباقي بسيط".**

---

## 1) قواعد غير قابلة للنقاش

1. **ممنوع لمس اللوجيك:** `src/services/**`، `src/context/**`، `src/mock/**`، `src/types/**`. ممنوع تغيّر أي Handler أو حساب أو اسم حقل أو شرط. لو احتجت تغيير هناك: **وقف، واكتبه في التقرير تحت "يحتاج لوجيك"، وكمّل غيره.**
2. **ممنوع حذف أي وظيفة.** كل زرار، ولينك، ومودال، وحقل إدخال، وفلتر، وتاب، وإجراء كان ظاهر في `2715c76` **لازم يفضل ظاهر وشغال**. مسموح تنقله لمكان تاني (قايمة ⋯، تاب، Drawer) بشرط إنه يفضل **قابل للوصول بضغطتين بالكتير** من نفس الصفحة.
3. **ممنوع الـ Hacks العامة.** ممنوع `!important` خارج `@media print`. ممنوع Selectors عامة (`*`، `td`، `.font-black`، `.rounded-3xl`، `.text-[10px]`) لتغيير شكل Classes قديمة. **الكلاس القديم يتشال من الـ JSX ويتحط مكانه الصح.**
4. **ممنوع Hex مكتوب يدوي** في أي فايل تحت `src/pages` أو `src/components`. كل الألوان من الـ Tokens (`brand`، `text-primary`، `semantic-*`، …).
5. **ممنوع تعمل commit أو push**، وممنوع `git checkout` أو `git reset` على فايلات ما اشتغلتش عليها. صاحب المشروع هيراجع الأول.
6. **ممنوع تسلّم وفيه أي Error** في الـ Build أو الـ Type-check أو الـ Console.
7. **ما تقولش "تم" على حاجة ما اتحققتش منها.** كل ادعاء في تقريرك لازم يبقى معاه دليل (ناتج أمر أو صورة).

---

## 2) المرحلة A — إرجاع الـ Features اللي اتشالت (قبل أي حاجة تانية)

### 2.1 القايمة المعروفة (لازم ترجع كلها)

| الصفحة | اللي لازم يرجع |
|---|---|
| `CustomProjectDetailsPage.tsx` | تعليقات التصميم (`addDesignComment`) · رفض التصميم بسبب (مودال `rejectionModalDesignId`) · جدولة زيارة المعاينة (`isScheduleVisitOpen` وحقول العنوان والتاريخ) · رفع صور المقاسات (`setMeasPhotos` + `LocalImageUploader`) · رفع صور التصميم (`setDesignImages`) · ملاحظات التسليم وسبب التعديل (`handoverNotes`، `updateReason`) · تصنيف ووحدة البنود (`setItemCategory`، `setNewItemUnit`) |
| `SalesQuotationsPage.tsx` | زرار الطباعة · فتح المشروع المرتبط (`setSelectedProjectId` + `setActiveModule('custom_projects')`) |
| `SalesContractsPage.tsx` | زرار الطباعة · فتح المشروع المرتبط |
| `accounting/JournalEntriesView.tsx` | زرار الطباعة |
| `components/layout/Header.tsx` ← `DemoDock` | اتأكد إن مُبدّل السيناريو أو الشخصية وكل خياراته شغالين من الـ Dock زي ما كانوا في الـ Header |

### 2.2 فحص التكافؤ الإجباري (Parity Check) لكل فايل اتعدل

القايمة اللي فوق **مش كاملة بالضرورة**. لازم تتأكد بنفسك، على **كل** فايل عدلته أو هتعدله:

1. **فحص الكود اليتيم:** شغّل الأمر ده:
   ```
   node ./node_modules/typescript/bin/tsc --noEmit -p . --noUnusedLocals
   ```
   وقارن الناتج للفايل ده بنفس الأمر على نسخة `2715c76`. **أي State أو Handler أو Setter أو Import لـ Modal أو Component بقى unused في نسختك ومكانش unused قبل كده = Feature اتشالت → رجّعها.**
2. **فحص النصوص:** قارن نصوص الأزرار والـ Labels العربي (`git show 2715c76:<file>`) بنسختك. أي نص زرار اختفى لازم يكون ليه مكان جديد، أو يرجع.
3. **فحص الـ Handlers:** كل `onClick` و`onChange` و`onSubmit` كان موجود لازم يكون ليه مقابل في النسخة الجديدة.
4. سجّل نتيجة الفحص لكل فايل في التقرير (القسم 8).

---

## 3) المرحلة B — شيل الـ Hacks وعمل الترحيل الحقيقي

1. من `src/index.css` امسح:
   - القاعدة `* { border-color: … }`.
   - تحويل `.font-black` و`.font-extrabold` لـ 700.
   - تكبير `.text-[7px]` لحد `.text-[11px]` لـ 12px.
   - إعادة تعريف `.rounded-2xl` و`.rounded-3xl`.
   - ربط `td` و`th` بـ `tabular-nums` على مستوى عام. (الـ `tabular-nums` بيتحط في `DataTable` وفي الـ Components المالية.)
2. في `tailwind.config.js`: امسح الـ Aliases المضللة (`brand.emerald`، `brand.primary`، `brand.gold` اللي بتشاور على قيم تانية). خلي بس Tokens ليها أسماء واضحة.
3. بعد كده، **في كل فايل في المشروع**، حوّل الـ Classes يدوياً:
   - `font-black` / `font-extrabold` ← `font-bold` (للعناوين والأرقام المهمة بس) أو `font-semibold` أو `font-medium`.
   - `text-[7px]` لحد `text-[11px]` ← `text-xs` (12px) كحد أدنى.
   - `rounded-2xl` / `rounded-3xl` ← `rounded-lg` للكروت والمودالات، و`rounded-md` للأزرار والحقول.
   - `[#xxxxxx]` ← Token.
   - `bg-gradient-*` ← خلفية مصمتة من الـ Tokens.
   - ألوان الحالات (`emerald-*`، `amber-*`، `rose-*`، `purple-*`، `indigo-*`، `blue-*`، `teal-*`، `cyan-*`، `sky-*`، `orange-*`) ← `StatusPill` أو Tokens `semantic-*`. **مفيش أي استخدام لعائلات ألوان Tailwind مباشرة في الصفحات.**

---

## 4) المرحلة C — إصلاح العيوب الظاهرة (معيار قبول لكل بند)

| # | العيب | معيار القبول |
|---|---|---|
| C1 | **الأرقام** | دالة عرض واحدة في `src/utils/format.ts` (أو `components/ui/format.ts`): `formatNumber` و`formatMoney` و`formatDate` و`formatPercent`. أرقام **لاتينية** دايماً، وفاصل آلاف. العملة **"ج.م"** بس (مفيش "EGP" في الواجهة). كل `toLocaleString(...)` في الصفحات يتحول للدوال دي. `grep -r "ar-EG" src` = **0**. |
| C2 | **ترتيب العربي والإنجليزي في السطر (Bidi)** | أي رقم أو كود أو نسبة أو مصطلح إنجليزي جوه جملة عربي يتلف بـ `<bdi>` أو `dir="ltr"` على عنصر Inline. ممنوع تظهر حالات زي "(Super Admin (مالك النظام))" أو "3Dو" أو "38%+". النسبة تتكتب "+38%". |
| C3 | **التاب النشط** | التاب النشط باين في كل الحالات: نص `text-primary` بوزن 600 وخط سفلي 2px بلون `brand`. ممنوع نص أبيض على خلفية فاتحة. اتأكد منه في الداشبورد ("الكل (10)") وفي كل مكان فيه Tabs. |
| C4 | **الهيدر المكرر** | صفحة واحدة = **PageHeader واحد**. في `ProcurementWorkspace` و`PlanningPage` و`ManufacturingWorkspace` والـ Views اللي جواهم: يا الـ Workspace يرسم الهيدر يا الـ View، **مش الاتنين**. الأصح إن الـ View هو اللي يرسم الهيدر بعنوانه وأزراره. ممنوع زرارين لنفس الإجراء في نفس الشاشة. |
| C5 | **الفلاتر** | `FilterBar` يبقى سطر واحد: البحث (عرض ثابت حوالي 320px) ثم الـ Selects (عرض ثابت 160–200px لكل واحد) ثم "مسح". يلف لسطر تاني بس لو العرض أقل من 1280px، ومن غير ما الـ Selects تتمط أو تتكوم. |
| C6 | **الجداول** | الأكواد (`CUST-…`، `PRJ-…`، `JE-…`) **ما تتقسمش أبداً** (`whitespace-nowrap`). أزرار الإجراء ما تتقسمش. أقصى ارتفاع للصف 56px في الوضع العادي و40px في المضغوط. الأعمدة الثانوية (المصدر، الفرع) سطر واحد بـ `truncate` و Tooltip. **ممنوع أي جدول يتقص أفقياً على 1366px.** لو الأعمدة كتير، الأقل أهمية تتنقل لـ "⚙ الأعمدة". |
| C7 | **الأزرار جوه الصفوف** | الصف كله قابل للضغط ويفتح السجل. زرار "الملف 360" / "لوحة 360" / "بيئة العمل" يتحول لـ `IconButton` (أيقونة عين) فيه Tooltip، أو يتحط في قايمة ⋯ في آخر الصف. |
| C8 | **Progress bars** | ترجع في كل الكروت والجداول اللي كانت فيها. البار 4–6px، ولونه `brand` أو دلالي، وظاهر في كل النسب (مش 100% بس). |
| C9 | **قص العناوين** | ممنوع `truncate` على عنوان المشروع أو العميل لو فيه مساحة. العنوان ياخد سطرين بالكتير (`line-clamp-2`)، وما يتقصش وجنبه مساحة فاضية. |
| C10 | **الحالات الخام** | مفيش أي قيمة System تظهر خام (`sent`، `draft`، `jrn-sal`، …). كل الحالات تمر على `statusMap` المركزي، واللي فيه **ترجمة عربي + دلالة لون** لكل حالة موجودة في الـ mock. أي حالة مش موجودة في الـ Map تظهر رمادي بنص "غير معرّف"، ويتسجل تحذير في الـ Console وقت التطوير. |
| C11 | **أدوات العرض (Demo Dock)** | **ممنوع يغطي محتوى.** يتشال الزرار العائم، والأدوات تتنقل لقايمة المستخدم في الـ Header تحت عنوان "أدوات العرض التجريبي" (السيناريو، تبديل الشخصية، الدخول كعميل، إعادة تعيين الديمو). |
| C12 | **اختصار البحث** | `Ctrl K` على ويندوز و`⌘K` على ماك، حسب `navigator.platform`. الاختصار نفسه لازم يشتغل. |
| C13 | **الكشك** | `mfg_shopfloor` يتعرض **Full-screen** من غير Sidebar ولا Header ولا PageHeader، وفيه زرار "خروج من وضع الكشك" واضح. يتشال زرار "كشك الورشة" اللي جوه صفحة الكشك نفسها. الأزرار 56px على الأقل. |
| C14 | **ترتيب الأهمية في الداشبوردات** | الأرقام الرئيسية في كروت الـ KPI بحجم 24px ووزن 700. الـ Label بحجم 13px رمادي. سطر المقارنة 12px بلون دلالي. فيه مستوى واحد واضح للعين: الرقم الكبير، بعده عنوان الـ Section، بعده الباقي. الشاشة ما تبانش فاضية ولا باهتة: كل Section جواه كارت بحد واضح وعنوان `heading` 16px/600. |
| C15 | **الـ Sidebar** | ممنوع أي Label يتقص بـ "…" (مثلاً "الحملات التسويقية والعملاء الم…" و"الجدولة الزمنية العكسية (Gantt)"). لو طويل، اختصره لـ 3 كلمات بالكتير. |
| C16 | **أزرار الأقسام في الهيدر** | ألوان الأزرار من الـ Variants بس (`primary`، `secondary`، `ghost`، `danger`). ممنوع أخضر أو أزرق أو بني غامق كزرار أساسي في أي صفحة. |

---

## 5) المرحلة D — التغطية الكاملة لكل النظام

**كل** شاشة من دول لازم تتحول للقالب الجديد وتعدّي الـ Checklist في القسم 6. مفيش صفحة تفضل بالشكل القديم.

### 5.1 الشاشات (حسب الموديول ونوع الصفحة)

| الموديول | الصفحات | النمط |
|---|---|---|
| **الأساسي** | `DashboardPage`، `AnalyticsPage`، `NotificationsPage`، `LoginPage`، `PlaceholderModulePage` | Dashboard / List |
| **العملاء والمبيعات** | `CustomersListPage`، `CustomerProfilePage`، `CampaignsPage`، `SalesDashboardPage`، `CustomProjectsListPage`، `CustomProjectDetailsPage`، `SalesQuotationsPage`، `SalesContractsPage`، `SalesChangeOrdersPage`، `ReadySalesDashboardPage`، `ReadyOrdersListPage`، `OrderDetailsPage` | List / Record / Dashboard |
| **المنتجات والخامات** | `ProductsListPage`، `ProductDetailsPage`، `MaterialsListPage`، `MaterialDetailsPage`، `InventoryPage` | List / Record |
| **الموردين** | `SuppliersListPage`، `SupplierDetailsPage`، `PurchasingListPage` | List / Record |
| **المكتب الفني** | `TechnicalOfficeDashboardView`، `TechnicalProjectsListView`، `TechnicalProjectDetailsView`، `TechnicalDesignsView`، `TechnicalBOMExplosionView`، `TechnicalReleasesView`، `TechnicalECRView` | Dashboard / List / Record |
| **التخطيط** | `PlanningPage`، `PlanningDashboardView`، `PlanningDemandView`، `PlanningMRPEngineView`، `PlanningShortagesView`، `PlanningProposalsView`، `PlanningCapacityView`، `PlanningScheduleGanttView`، `PlanningMPSView` | Workspace / List |
| **المشتريات** | `ProcurementWorkspace`، `ProcurementDashboardView`، `PurchaseRequestsView`، `RFQListView`، `QuotationComparisonView`، `PurchaseOrdersView`، `ExpectedDeliveriesView`، `SupplierReturnsView`، `ProcurementSuppliersView`، `SupplierPriceListsView`، `ProcurementReportsView` | Dashboard / List |
| **التصنيع** | `ManufacturingWorkspace`، `ManufacturingDashboardView`، `ManufacturingOrdersView`، `WorkCentersAndOrdersView`، `ShopfloorKioskView`، `JobCardsAndPackagesView`، `ScrapAndRequisitionsView`، `QualityGatesView`، `ProductionListPage`، `InstallationsListPage` | Dashboard / List / Kiosk |
| **المخازن** | `InventoryDashboardView`، `ItemMasterCardsView`، `GoodsReceiptNotesView`، `GoodsIssueNotesView`، `StockCardLedgerView`، `StockTransfersView`، `StockTransfersPage`، `StocktakingView`، `WarehousesLocationsView` | Dashboard / List |
| **الحسابات** | `AccountingDashboardView`، `AccountingDashboardPage`، `FinanceDashboardPage`، `ChartOfAccountsView`، `JournalEntriesView`، `CustomerInvoicesAdvancesView`، `VendorBillsPurchasesView`، `PartnerStatementsView`، `PdcChecksView`، `CostCentersView`، `FinancialReportsView`، `FiscalPeriodsView` | Dashboard / List / Report |
| **الإعدادات** | `CompanySetupPage`، `BranchesPage`، `UsersPage`، `RolesPermissionsPage`، `AuditLogPage`، `SecurityTestPage` + صفحة الإعدادات في `ApplicationShell` (Layout بعمودين) | Settings |
| **البوابة** | `CustomerPortalPage` | Portal (Tokens نفسها، بإحساس أدفى) |

### 5.2 المودالات والمستندات (كلها)

- `src/components/modals/*` (19 فايل)
- `src/components/production/*` (7 فايلات)
- `src/pages/planning/modals/*`، `src/pages/procurement/modals/*`، `src/pages/technicalOffice/modals/*`
- `src/components/common/*` (`ImageZoomModal`، `LocalImageUploader`، `CustomerAvatar`، `SecurityTestRunner`)
- المستندات المطبوعة: `OfficialQuotationSheet`، `OfficialQuotationModal`، `JobCardPrintModal`، `PackageLabelPrintModal`

**كل مودال** لازم يستخدم `ui/Modal` أو `ui/Drawer`: مقاس من الـ 3 مقاسات، وهيدر موحد، وفوتر ثابت فيه الأزرار، وEsc يقفل، والـ Focus يفضل جوه المودال. **كل الحقول والأزرار اللي كانت فيه ترجع زي ما هي** (القسم 2.2 بينطبق على المودالات كمان).

**المستندات المطبوعة** تتبني على قالب الطباعة (القسم 5.6 في الفايل الأساسي)، وتتجرب بـ Print Preview.

### 5.3 الترتيب الإجباري للشغل

A (الـ Features) ← B (الـ Hacks) ← C (العيوب) ← D موديول موديول بالترتيب ده: المبيعات ← المكتب الفني ← التخطيط ← المشتريات ← المخازن ← التصنيع ← الحسابات ← الإعدادات ← البوابة ← المودالات ← المستندات.

**بعد كل موديول:** شغّل الـ Type-check والـ Build (القسم 7.1)، ولو فيه أي Error ما تبدأش الموديول اللي بعده.

---

## 6) Checklist لكل صفحة (تتطبق على كل شاشة في 5.1)

- [ ] PageHeader واحد: Breadcrumb وعنوان (من 1 لـ 4 كلمات) وسطر وصف اختياري وزرار Primary واحد بالكتير.
- [ ] مفيش Hero أو Banner داكن، ومفيش تدرجات.
- [ ] كل الجداول من `DataTable`: الصف قابل للضغط، والأكواد ما تتقسمش، والأرقام محاذية للنهاية ومعاها `tabular-nums`، ومفيش قص أفقي على 1366px.
- [ ] كل الحالات من `StatusPill` و`statusMap`، ومفيش نص خام.
- [ ] كل الأرقام والمبالغ والتواريخ من دوال `format`.
- [ ] مفيش خط أصغر من 12px، ومفيش `font-black`، ومفيش `rounded-2xl` أو `rounded-3xl`، ومفيش Hex.
- [ ] مفيش عائلات ألوان Tailwind مباشرة للحالات.
- [ ] مفيش Emoji، ولا شارات تسويقية، ولا عناوين فيها عربي وإنجليزي مكرر بين قوسين.
- [ ] Empty State لو مفيش بيانات.
- [ ] الـ Parity Check (2.2) عدّى، ومفيش وظيفة ناقصة.
- [ ] شكلها مظبوط على 1366×768 وعلى 1920×1080.
- [ ] صفر Errors في الـ Console وقت فتحها واستخدام أزرارها الأساسية.

---

## 7) التحقق النهائي (إجباري، والناتج يتلصق في التقرير)

### 7.1 Type-check و Build

```
node ./node_modules/typescript/bin/tsc --noEmit -p .
npm run build
```

- لازم الاتنين يخلصوا **بـ exit code 0** ومن غير أي Error.
- الـ Warnings الجديدة اللي إنت سببتها لازم تتصلح. لو فيه Warning جاي من قبل كده، اذكره في التقرير وقول مصدره.
- ممنوع تعدّي الـ Build بـ `// @ts-ignore` أو `any` أو إنك تقفل `strict` أو تعدّل `tsconfig.json`.

### 7.2 فحوصات بالأرقام (على `src/pages` و `src/components`)

| الفحص | الحد المسموح |
|---|---|
| `grep -rE "\[#[0-9A-Fa-f]{3,8}\]"` | **0** |
| `grep -r "font-black\|font-extrabold"` | **0** |
| `grep -rE "rounded-(2xl\|3xl)"` | **0** |
| `grep -rE "text-\[(7\|8\|9\|10\|11)px\]"` | **0** |
| `grep -r "bg-gradient"` | **0** (استثناء واحد ممكن في `LoginPage` و `CustomerPortalPage`، ولازم يتبرر في التقرير) |
| `grep -r "ar-EG"` | **0** |
| `grep -rE "(emerald\|rose\|purple\|indigo\|violet\|teal\|cyan\|sky\|orange\|fuchsia)-[0-9]{2,3}"` | **0** (والـ `amber`/`blue` كمان، إلا جوه `components/ui`) |
| `grep -r "<table"` | بس جوه `ui/DataTable` والمستندات المطبوعة |
| `grep -rl "fixed inset-0"` | بس جوه `ui/Modal` و`ui/Drawer` و`ImageZoomModal` ووضع الكشك |
| `grep -n "!important" src/index.css` | بس جوه `@media print` |
| `--noUnusedLocals` على الفايلات اللي اتعدلت | مفيش Handler أو State يتيم **جديد** مقارنة بـ `2715c76` |

### 7.3 التحقق في المتصفح

1. افتح **كل** route في القسم 5.1 على 1366×768، وصوّر الصفحة (أول الصفحة + بعد Scroll). حط الصور في `docs/ui-review/` بأسماء الـ routes.
2. اقرا الـ Console في كل صفحة: **صفر Errors**.
3. امشي السيناريو الكامل من أوله لآخره واتأكد إن كل خطوة شغالة:
   مشروع جديد ← معاينة ← رفع صور ← تصميم 3D ← تعليق على التصميم ← رفض التصميم ثم اعتماده ← عرض سعر ← طباعة ← عقد ← عربون ← تسليم للمكتب الفني ← BOM ← حزمة إفراج ← تخطيط ← أمر شراء ← استلام ← أمر تصنيع ← كشك ← جودة ← تركيب ← قيد محاسبي.
4. جرّب كل مودال اتعدل مرة واحدة على الأقل: يفتح، ويتملي، ويتحفظ، ويتقفل بـ Esc.
5. جرّب الطباعة (Print Preview) لعرض السعر والعقد وكارت التشغيل والملصق.

---

## 8) التقرير المطلوب عند التسليم

ملف `docs/ui-correction-report.md` فيه:

1. **جدول الصفحات:** الصفحة | النمط | الحالة (✓ / ✗) | ملاحظات.
2. **جدول التكافؤ (Parity):** لكل فايل اتعدل: الوظايف اللي كانت موجودة ← مكانها الجديد. وأي وظيفة اتنقلت لـ ⋯ أو لـ Drawer تتذكر صراحة.
3. **ناتج القسم 7.1** (الـ Type-check والـ Build) زي ما هو.
4. **ناتج فحوصات القسم 7.2** بالأرقام.
5. **نتيجة السيناريو الكامل** (7.3) خطوة خطوة.
6. **قايمة "يحتاج لوجيك":** الحاجات اللي ما اتنفذتش لأنها محتاجة تعديل خارج النطاق.
7. **حاجات ما اتعملتش أو اتعملت جزئياً**، بصراحة. التقرير اللي بيخبي نقص هيتعامل معاه كأنه الشغل كله مرفوض.

---

> **التسليم بيتقبل بشرط واحد:** النظام كله بشكل واحد، وكل وظيفة كانت موجودة لسه موجودة وشغالة، والـ Build نضيف. أي بند ناقص من دول = الشغل يرجع تاني.
