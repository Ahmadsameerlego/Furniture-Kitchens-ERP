import React, { useState } from 'react';
import { X, Plus, ShoppingCart, Factory, ArrowLeftRight, CheckCircle2, Calendar, Warehouse, DollarSign } from 'lucide-react';
import { SupplyProposal, SupplyProposalType, PlanningPriority } from '../../../types/planning';
import { useERP } from '../../../context/ERPContext';

interface CreateSupplyProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProposal?: Partial<SupplyProposal>;
  onSave: (proposalData: Partial<SupplyProposal>) => void;
}

export const CreateSupplyProposalModal: React.FC<CreateSupplyProposalModalProps> = ({
  isOpen,
  onClose,
  initialProposal,
  onSave
}) => {
  if (!isOpen) return null;

  const { warehouses, itemMasterCards, materials, currentUser } = useERP();

  const [proposalType, setProposalType] = useState<SupplyProposalType>(initialProposal?.proposalType || 'purchase_requisition');
  const [itemCode, setItemCode] = useState<string>(initialProposal?.itemCode || 'MDF-WHITE-18');
  const [itemName, setItemName] = useState<string>(initialProposal?.itemName || 'ألواح MDF 18مم ملامين أبيض جود وود');
  const [quantity, setQuantity] = useState<number>(initialProposal?.quantity || 10);
  const [uom, setUom] = useState<string>(initialProposal?.uom || 'لوح');
  const [targetWarehouseId, setTargetWarehouseId] = useState<string>(initialProposal?.targetWarehouseId || warehouses[0]?.id || 'wh-main');
  const [requiredDate, setRequiredDate] = useState<string>(initialProposal?.requiredDate || new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10));
  const [leadTimeDays, setLeadTimeDays] = useState<number>(initialProposal?.leadTimeDays || 7);
  const [priority, setPriority] = useState<PlanningPriority>(initialProposal?.priority || 'high');
  const [estimatedUnitCostEGP, setEstimatedUnitCostEGP] = useState<number>(initialProposal?.estimatedUnitCostEGP || 1450);
  const [suggestedSupplierName, setSuggestedSupplierName] = useState<string>(initialProposal?.suggestedSupplierName || 'شركة جود وود إيجيبت للأخشاب');
  const [notes, setNotes] = useState<string>(initialProposal?.notes || 'مقترح توريد لتغطية احتياجات خط التقطيع وشاسيهات المطابخ المعتمدة.');

  const suggestedOrderDate = new Date(new Date(requiredDate).getTime() - leadTimeDays * 86400000).toISOString().substring(0, 10);
  const estimatedTotalCostEGP = quantity * estimatedUnitCostEGP;

  const handleSelectItem = (selectedCode: string) => {
    setItemCode(selectedCode);
    const card = itemMasterCards.find(c => c.code === selectedCode);
    const mat = materials.find(m => m.code === selectedCode || m.name === selectedCode);
    if (card) {
      setItemName(card.nameAr);
      setUom(card.unitNameAr || 'لوح');
      setEstimatedUnitCostEGP(card.weightedAvgCost || 1450);
      setLeadTimeDays(7);
    } else if (mat) {
      setItemName(mat.name);
      setUom(mat.unit || 'لوح');
      setEstimatedUnitCostEGP(mat.currentReferenceCost || 1450);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetWh = warehouses.find(w => w.id === targetWarehouseId);
    
    onSave({
      id: initialProposal?.id,
      proposalType,
      itemCode,
      itemName,
      quantity: Number(quantity),
      uom,
      targetWarehouseId,
      targetWarehouseName: targetWh ? targetWh.name : 'المستودع الرئيسي',
      requiredDate,
      suggestedOrderDate,
      leadTimeDays: Number(leadTimeDays),
      priority,
      estimatedUnitCostEGP: Number(estimatedUnitCostEGP),
      estimatedTotalCostEGP,
      suggestedSupplierName,
      notes,
      status: initialProposal?.status || 'under_review',
      createdByUserName: initialProposal?.createdByUserName || currentUser.fullName,
      createdDate: initialProposal?.createdDate || new Date().toISOString().substring(0, 10)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C87A38]/10 text-[#C87A38] flex items-center justify-center">
              {proposalType === 'planned_production' ? <Factory className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-black text-[#1E110B]">
                {initialProposal?.id ? 'تعديل مقترح التوريد' : 'إنشاء مقترح توريد تخطيطي جديد'}
              </h3>
              <p className="text-xs text-slate-500">
                إصدار طلب شراء (Requisition) للمشتريات أو أمر تشغيل مخطط (Planned MO) للإنتاج
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs overflow-y-auto max-h-[75vh]">
          
          {/* Proposal Type Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">نوع مسار التوريد المقترح:</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { type: 'purchase_requisition', label: 'طلب شراء للمشتريات', icon: ShoppingCart },
                { type: 'planned_production', label: 'أمر تصنيع مخطط بالورش', icon: Factory },
                { type: 'inter_warehouse_transfer', label: 'تحويل بين المستودعات', icon: ArrowLeftRight }
              ].map(opt => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setProposalType(opt.type as SupplyProposalType)}
                  className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-black transition-all cursor-pointer ${
                    proposalType === opt.type
                      ? 'bg-[#361D13] text-white border-[#361D13] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <opt.icon className="w-4 h-4" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Item details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">كود الصنف / الخامة:</label>
              <select
                value={itemCode}
                onChange={e => handleSelectItem(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold font-mono text-xs"
              >
                <option value="MDF-WHITE-18">MDF-WHITE-18 (MDF أبيض جود وود 18مم)</option>
                <option value="HPL-812-BEIGE">HPL-812-BEIGE (HPL تركي كود 812 بيج)</option>
                <option value="BLUM-CLIP-110">BLUM-CLIP-110 (مفصلة بلوم كليب توب 110)</option>
                <option value="BLUM-TANDEM-500">BLUM-TANDEM-500 (مجرى درج بلوم تاندم 50سم)</option>
                <option value="PVC-EDGE-BEIGE-2">PVC-EDGE-BEIGE-2 (شريط قاطوش بيج 2مم)</option>
                <option value="OAK-PLYWOOD-18">OAK-PLYWOOD-18 (كونتر قشرة أرو 18مم)</option>
                <option value="ALUM-PROF-BLACK">ALUM-PROF-BLACK (بروفايل ألومنيوم أسود)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم الصنف بالكامل:</label>
              <input
                type="text"
                value={itemName}
                onChange={e => setItemName(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                required
              />
            </div>
          </div>

          {/* Quantity & Unit & Warehouse */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الكمية المقترحة:</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">وحدة القياس (UOM):</label>
              <input
                type="text"
                value={uom}
                onChange={e => setUom(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">المستودع المستهدف:</label>
              <select
                value={targetWarehouseId}
                onChange={e => setTargetWarehouseId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs"
              >
                {warehouses.map(wh => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates & Lead Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block font-bold text-slate-700 mb-1">تاريخ الاحتياج بالمصنع:</label>
              <input
                type="date"
                value={requiredDate}
                onChange={e => setRequiredDate(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">فترة التوريد / Lead Time (أيام):</label>
              <input
                type="number"
                min={1}
                value={leadTimeDays}
                onChange={e => setLeadTimeDays(Number(e.target.value))}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">تاريخ إصدار الطلب المقترح:</label>
              <div className="p-2 bg-white border border-slate-200 rounded-xl font-mono font-black text-amber-800 text-xs flex items-center justify-between">
                <span>{suggestedOrderDate}</span>
                <span className="text-[10px] text-slate-400 font-sans">محسوب آلياً</span>
              </div>
            </div>
          </div>

          {/* Pricing & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">سعر الوحدة التقديري (ج.م):</label>
              <input
                type="number"
                value={estimatedUnitCostEGP}
                onChange={e => setEstimatedUnitCostEGP(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">إجمالي التكلفة التقديرية:</label>
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl font-mono font-black text-emerald-900 text-xs">
                {estimatedTotalCostEGP.toLocaleString('ar-EG')} ج.م
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">درجة الأولوية:</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as PlanningPriority)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs"
              >
                <option value="normal">أولوية عادية (Normal)</option>
                <option value="high">أولوية مرتفعة (High)</option>
                <option value="urgent">طوارئ / عاجل جداً (Urgent)</option>
              </select>
            </div>
          </div>

          {/* Supplier & Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">المورد المقترح / جهة التوريد:</label>
            <input
              type="text"
              value={suggestedSupplierName}
              onChange={e => setSuggestedSupplierName(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ملاحظات وتعليمات التخطيط:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs"
            />
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ واعتماد مقترح التوريد</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
