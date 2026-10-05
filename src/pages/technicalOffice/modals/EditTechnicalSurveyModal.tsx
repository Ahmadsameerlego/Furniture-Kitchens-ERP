import React, { useState } from 'react';
import { X, Ruler, Plus, Trash2, CheckCircle2, Zap, Droplets, Flame, Tv, AlertCircle } from 'lucide-react';
import { TechnicalSiteSurvey, WallDimension, ElectricalPoint, ApplianceSpec } from '../../../types/technicalOffice';

interface EditTechnicalSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  technicalProjectId: string;
  existingSurvey?: TechnicalSiteSurvey;
  onSave: (surveyData: Partial<TechnicalSiteSurvey>) => void;
  onVerify?: (surveyId: string) => void;
}

export const EditTechnicalSurveyModal: React.FC<EditTechnicalSurveyModalProps> = ({
  isOpen,
  onClose,
  technicalProjectId,
  existingSurvey,
  onSave,
  onVerify
}) => {
  if (!isOpen) return null;

  const [surveyorName, setSurveyorName] = useState(existingSurvey?.surveyorName || 'م. أحمد سامي (مسؤول الرفع المساحي)');
  const [surveyDate, setSurveyDate] = useState(existingSurvey?.surveyDate || new Date().toISOString().substring(0, 10));
  const [ceilingHeightCm, setCeilingHeightCm] = useState(existingSurvey?.ceilingHeightCm || 280);
  const [flooringVarianceMm, setFlooringVarianceMm] = useState(existingSurvey?.flooringVarianceMm || 2);
  const [generalNotes, setGeneralNotes] = useState(existingSurvey?.generalNotes || existingSurvey?.notes || '');

  // Walls state
  const [walls, setWalls] = useState<WallDimension[]>(existingSurvey?.walls && existingSurvey.walls.length > 0 ? existingSurvey.walls : [
    { id: 'w-1', wallName: 'الجدار A (الرئيسي - حوض وصرف)', lengthCm: 420, heightCm: 280, angleDegrees: 90, plasterQuality: 'straight' },
    { id: 'w-2', wallName: 'الجدار B (الجانبي - بوتاجاز وشفاط)', lengthCm: 310, heightCm: 280, angleDegrees: 90, plasterQuality: 'straight' }
  ]);

  // Electrical state
  const [electricalPoints, setElectricalPoints] = useState<ElectricalPoint[]>(existingSurvey?.electricalPoints && existingSurvey.electricalPoints.length > 0 ? existingSurvey.electricalPoints : [
    { id: 'ep-1', purpose: 'مأخذ شفاط 220V', locationWall: 'الجدار B', heightFromFloorCm: 210, distanceFromCornerCm: 150, status: 'ok' },
    { id: 'ep-2', purpose: 'مأخذ غسالة أطباق بلت إن', locationWall: 'الجدار A', heightFromFloorCm: 50, distanceFromCornerCm: 120, status: 'ok' },
    { id: 'ep-3', purpose: 'بريزة ليد بروفايل علوي', locationWall: 'الجدار A', heightFromFloorCm: 150, distanceFromCornerCm: 200, status: 'ok' }
  ]);

  // Appliances state
  const [appliances, setAppliances] = useState<ApplianceSpec[]>(existingSurvey?.appliances && existingSurvey.appliances.length > 0 ? existingSurvey.appliances : [
    { id: 'app-1', applianceType: 'built_in_oven', name: 'فرن بلت إن 60 سم', brand: 'Bosch', model: 'HBF113BR0Y', widthCm: 59.5, heightCm: 59.5, depthCm: 54.8, supplyType: 'electric', supplyStatus: 'customer_provided' },
    { id: 'app-2', applianceType: 'gas_hob', name: 'مسطح غاز 4 شعلة 60 سم', brand: 'Franke', model: 'FHG 604', widthCm: 58, heightCm: 51, depthCm: 5, supplyType: 'gas', supplyStatus: 'customer_provided' },
    { id: 'app-3', applianceType: 'sink', name: 'حوض ستانلس ساقط رخام', brand: 'Franke', model: 'SID 610', widthCm: 86, heightCm: 50, depthCm: 20, supplyType: 'water_drain', supplyStatus: 'factory_supplied' }
  ]);

  // Active section tab in modal
  const [sectionTab, setSectionTab] = useState<'walls' | 'mep' | 'appliances'>('walls');

  // Wall helpers
  const handleAddWall = () => {
    const nextChar = String.fromCharCode(65 + walls.length);
    setWalls(prev => [
      ...prev,
      { id: `w-${Date.now()}`, wallName: `الجدار ${nextChar}`, lengthCm: 250, heightCm: ceilingHeightCm, angleDegrees: 90, plasterQuality: 'straight' }
    ]);
  };

  const handleUpdateWall = (index: number, field: keyof WallDimension, value: any) => {
    setWalls(prev => prev.map((w, i) => i === index ? { ...w, [field]: value } : w));
  };

  const handleRemoveWall = (index: number) => {
    setWalls(prev => prev.filter((_, i) => i !== index));
  };

  // Electrical helpers
  const handleAddElectrical = () => {
    setElectricalPoints(prev => [
      ...prev,
      { id: `ep-${Date.now()}`, purpose: 'مأخذ كهرباء 220V جديد', locationWall: 'الجدار A', heightFromFloorCm: 110, distanceFromCornerCm: 100, status: 'ok' }
    ]);
  };

  const handleUpdateElectrical = (index: number, field: keyof ElectricalPoint, value: any) => {
    setElectricalPoints(prev => prev.map((ep, i) => i === index ? { ...ep, [field]: value } : ep));
  };

  const handleRemoveElectrical = (index: number) => {
    setElectricalPoints(prev => prev.filter((_, i) => i !== index));
  };

  // Appliances helpers
  const handleAddAppliance = () => {
    setAppliances(prev => [
      ...prev,
      { id: `app-${Date.now()}`, applianceType: 'other', name: 'جهاز جديد', brand: 'Standard', widthCm: 60, heightCm: 85, depthCm: 60, supplyType: 'electric', supplyStatus: 'customer_provided' }
    ]);
  };

  const handleUpdateAppliance = (index: number, field: keyof ApplianceSpec, value: any) => {
    setAppliances(prev => prev.map((app, i) => i === index ? { ...app, [field]: value } : app));
  };

  const handleRemoveAppliance = (index: number) => {
    setAppliances(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (verifyNow = false) => {
    const surveyPayload: Partial<TechnicalSiteSurvey> = {
      id: existingSurvey?.id,
      technicalProjectId,
      surveyorName,
      surveyDate,
      ceilingHeightCm: Number(ceilingHeightCm),
      flooringVarianceMm: Number(flooringVarianceMm),
      generalNotes,
      notes: generalNotes,
      walls,
      electricalPoints,
      appliances,
      plumbing: existingSurvey?.plumbing || {
        waterSupplyLocation: 'الجدار A (تغذية بارد وساخن)',
        waterDrainageLocation: 'الجدار A (صرف 2 بوصة)',
        hotColdDistanceCm: 16,
        drainDiameterInch: 2,
        status: 'ok'
      },
      gas: existingSurvey?.gas || {
        hasNaturalGas: true,
        valveLocation: 'الجدار B',
        valveHeightCm: 75,
        status: 'ok'
      },
      ventilation: existingSurvey?.ventilation || {
        hasDuctHole: true,
        ductDiameterCm: 15,
        ductHeightFromFloorCm: 220,
        ductLocation: 'الجدار B'
      },
      status: verifyNow ? 'verified' : (existingSurvey?.status || 'draft')
    };

    onSave(surveyPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C87A38]/10 text-[#C87A38] flex items-center justify-center">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1E110B]">
                {existingSurvey ? 'تعديل وتوثيق الرفع المساحي والمرافق' : 'إنشاء تقرير الرفع المساحي والمرافق الميداني'}
              </h3>
              <p className="text-xs text-slate-500">
                تسجيل مقاسات الليزر الدقيقة، زوايا الجدران، تغذيات السباكة والكهرباء وسجل الأجهزة
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

        {/* Sub-nav Tabs */}
        <div className="px-6 pt-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
          <button
            onClick={() => setSectionTab('walls')}
            className={`px-4 py-2 rounded-t-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              sectionTab === 'walls'
                ? 'bg-white text-[#C87A38] border-t-2 border-[#C87A38] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span>1. أبعاد الجدران والزوايا ({walls.length})</span>
          </button>

          <button
            onClick={() => setSectionTab('mep')}
            className={`px-4 py-2 rounded-t-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              sectionTab === 'mep'
                ? 'bg-white text-[#C87A38] border-t-2 border-[#C87A38] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>2. التغذيات والمرافق MEP ({electricalPoints.length})</span>
          </button>

          <button
            onClick={() => setSectionTab('appliances')}
            className={`px-4 py-2 rounded-t-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              sectionTab === 'appliances'
                ? 'bg-white text-[#C87A38] border-t-2 border-[#C87A38] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>3. سجل الأجهزة وسواقط الرخام ({appliances.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* General Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block font-bold text-slate-700 mb-1">المهندس الفاحص / المساح:</label>
              <input
                type="text"
                value={surveyorName}
                onChange={e => setSurveyorName(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">تاريخ الرفع الميداني:</label>
              <input
                type="date"
                value={surveyDate}
                onChange={e => setSurveyDate(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ارتفاع السقف صافي (سم):</label>
              <input
                type="number"
                value={ceilingHeightCm}
                onChange={e => setCeilingHeightCm(Number(e.target.value))}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">فارق استواء الأرضية (مم):</label>
              <input
                type="number"
                value={flooringVarianceMm}
                onChange={e => setFlooringVarianceMm(Number(e.target.value))}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold font-mono text-xs"
              />
            </div>
          </div>

          {/* SECTION 1: WALLS */}
          {sectionTab === 'walls' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-[#C87A38]" />
                  <span>جدول أبعاد الجدران بالملم والاستقامة:</span>
                </h4>
                <button
                  type="button"
                  onClick={handleAddWall}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1 hover:bg-black cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة جدار جديد</span>
                </button>
              </div>

              <div className="space-y-3">
                {walls.map((wall, index) => (
                  <div key={wall.id || index} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-6 gap-3 items-center">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">اسم وتوصيف الجدار:</label>
                      <input
                        type="text"
                        value={wall.wallName}
                        onChange={e => handleUpdateWall(index, 'wallName', e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-xl font-bold text-xs"
                        placeholder="الجدار A..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">الطول (سم):</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={wall.lengthCm}
                          onChange={e => handleUpdateWall(index, 'lengthCm', Number(e.target.value))}
                          className="w-full p-2 border border-slate-200 rounded-xl font-mono font-bold text-xs"
                        />
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">({wall.lengthCm * 10}مم)</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">الارتفاع (سم):</label>
                      <input
                        type="number"
                        value={wall.heightCm}
                        onChange={e => handleUpdateWall(index, 'heightCm', Number(e.target.value))}
                        className="w-full p-2 border border-slate-200 rounded-xl font-mono font-bold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">الزاوية (°):</label>
                      <input
                        type="number"
                        value={wall.angleDegrees || 90}
                        onChange={e => handleUpdateWall(index, 'angleDegrees', Number(e.target.value))}
                        className="w-full p-2 border border-slate-200 rounded-xl font-mono font-bold text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-end pt-4 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveWall(index)}
                        disabled={walls.length <= 1}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 disabled:opacity-30 cursor-pointer"
                        title="حذف الجدار"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: MEP */}
          {sectionTab === 'mep' && (
            <div className="space-y-6">
              {/* Electrical */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>نقاط الكهرباء والبرايز ومخارج الليد:</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddElectrical}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1 hover:bg-black cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة نقطة كهرباء</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {electricalPoints.map((ep, index) => (
                    <div key={ep.id || index} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">الغرض والتوصيف:</label>
                        <input
                          type="text"
                          value={ep.purpose}
                          onChange={e => handleUpdateElectrical(index, 'purpose', e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-xl font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">الجدار:</label>
                        <input
                          type="text"
                          value={ep.locationWall}
                          onChange={e => handleUpdateElectrical(index, 'locationWall', e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-xl font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">الارتفاع من الأرض (سم):</label>
                        <input
                          type="number"
                          value={ep.heightFromFloorCm}
                          onChange={e => handleUpdateElectrical(index, 'heightFromFloorCm', Number(e.target.value))}
                          className="w-full p-2 border border-slate-200 rounded-xl font-mono font-bold text-xs"
                        />
                      </div>
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveElectrical(index)}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: APPLIANCES */}
          {sectionTab === 'appliances' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-[#C87A38]" />
                  <span>سجل الأجهزة الكهربائية وسواقط الحوض:</span>
                </h4>
                <button
                  type="button"
                  onClick={handleAddAppliance}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1 hover:bg-black cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة جهاز / حوض</span>
                </button>
              </div>

              <div className="space-y-3">
                {appliances.map((app, index) => (
                  <div key={app.id || index} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-6 gap-3 items-center">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">اسم الجهاز والتوصيف:</label>
                      <input
                        type="text"
                        value={app.name}
                        onChange={e => handleUpdateAppliance(index, 'name', e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-xl font-bold text-xs"
                        placeholder="فرن بلت إن 60 سم..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">الماركة والموديل:</label>
                      <input
                        type="text"
                        value={app.brand || ''}
                        onChange={e => handleUpdateAppliance(index, 'brand', e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-xl font-bold text-xs"
                        placeholder="Bosch..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">العرض × الارتفاع (سم):</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={app.widthCm}
                          onChange={e => handleUpdateAppliance(index, 'widthCm', Number(e.target.value))}
                          className="w-full p-2 border border-slate-200 rounded-xl font-mono font-bold text-xs"
                          placeholder="العرض"
                        />
                        <span className="text-slate-400">×</span>
                        <input
                          type="number"
                          value={app.heightCm}
                          onChange={e => handleUpdateAppliance(index, 'heightCm', Number(e.target.value))}
                          className="w-full p-2 border border-slate-200 rounded-xl font-mono font-bold text-xs"
                          placeholder="الارتفاع"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">جهة التوفير:</label>
                      <select
                        value={app.supplyStatus}
                        onChange={e => handleUpdateAppliance(index, 'supplyStatus', e.target.value as any)}
                        className="w-full p-2 border border-slate-200 rounded-xl font-bold text-xs bg-white"
                      >
                        <option value="customer_provided">توريد العميل</option>
                        <option value="factory_supplied">توريد المصنع</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveAppliance(index)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ملاحظات الفحص الهندسي الإضافية:</label>
            <textarea
              rows={2}
              value={generalNotes}
              onChange={e => setGeneralNotes(e.target.value)}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs"
              placeholder="اكتب أية تفاصيل خاصة باستقامة الزوايا، التفاوت في الليفل أو تأسيسات السباكة والغاز..."
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
          >
            إلغاء
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs cursor-pointer shadow-xs"
            >
              حفظ الرفع المساحي كمسودة
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-black text-xs cursor-pointer shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ واعتماد الرفع المساحي فوراً</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
