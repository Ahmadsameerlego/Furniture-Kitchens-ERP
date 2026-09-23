import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { InstallationRecord, InstallationStatus } from '../types/erp';
import {
  Truck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  MapPin,
  Camera,
  Share2,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Check
} from 'lucide-react';

export const InstallationsListPage: React.FC = () => {
  const {
    installationRecords,
    customProjects,
    orders,
    completeInstallation,
    completeHandover,
    setActiveModule,
    setSelectedCustomerId
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal State
  const [activeCompleteInst, setActiveCompleteInst] = useState<InstallationRecord | null>(null);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=600');
  const [instNotes, setInstNotes] = useState<string>('تم إنهاء جميع أعمال التركيبات والضبط والتثبيت بنجاح');

  const filteredInsts = installationRecords.filter(inst => {
    const matchesSearch = inst.installationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inst.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inst.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || inst.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const countScheduled = installationRecords.filter(i => i.status === 'scheduled' || i.status === 'confirmed').length;
  const countCompleted = installationRecords.filter(i => i.status === 'completed').length;
  const countHandover = installationRecords.filter(i => i.handoverStatus === 'delivered').length;

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-md">
              <Truck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">جدولة التركيبات والتسليم الميداني (Installation & Handover)</h1>
              <p className="text-xs text-slate-500 font-bold">
                إدارة المواعيد الميدانية، توجيه فنيي التركيب، توثيق صور قبل/بعد، وتسليم الموقع 100% للعميل
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModule('production')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <ArrowRight className="w-4 h-4 text-[#C87A38]" />
            <span>العودة لأوامر الإنتاج والورشة</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-bold block">مواعيد تركيب مجدولة (Scheduled):</span>
          <p className="text-2xl font-black text-amber-600 font-mono">{countScheduled}</p>
          <span className="text-[10px] text-slate-400">مواعيد بانتظار الانطلاق للموقع</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-bold block">تركيبات مكتملة بالموقع:</span>
          <p className="text-2xl font-black text-blue-600 font-mono">{countCompleted}</p>
          <span className="text-[10px] text-blue-500 font-bold">✓ جاهزة لإقرار التسليم</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#361D13] text-white border border-emerald-800 shadow-md space-y-1">
          <span className="text-emerald-300 font-bold block">مشاريع تم تسليمها بالكامل (100%):</span>
          <p className="text-2xl font-black text-amber-300 font-mono">{countHandover}</p>
          <span className="text-[10px] text-emerald-200">✓ تم التسليم وإغلاق الملف</span>
        </div>

      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث برقم التركيب، العميل، أو العنوان..."
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">كل حالات التركيبات</option>
              <option value="scheduled">مجدول الموعد</option>
              <option value="in_progress">جاري التركيب بالموقع</option>
              <option value="completed">تم التركيب بنجاح</option>
            </select>
          </div>
        </div>
      </div>

      {/* Installations Cards List */}
      <div className="space-y-4">
        {filteredInsts.map(inst => {
          const isDelivered = inst.handoverStatus === 'delivered';
          const isCompleted = inst.status === 'completed';

          return (
            <div key={inst.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      {inst.installationNumber}
                    </span>
                    <h3 className="text-base font-black text-slate-900">العميل: {inst.customerName} ({inst.customerPhone})</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#C87A38]" />
                    <span>{inst.address}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3.5 py-1 rounded-xl text-xs font-black border ${
                    isDelivered
                      ? 'bg-emerald-900 text-white border-emerald-700'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    {isDelivered ? '🎉 تم التسليم النهائي 100%' : isCompleted ? '✓ تم التركيب (بانتظار التسليم)' : 'موعد مجدول بالموقع'}
                  </span>
                </div>
              </div>

              {/* Installation Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-slate-800">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">تاريخ وساعة موعد التركيب:</span>
                  <span className="font-mono text-slate-900 font-black">{inst.scheduledDate} الساعة {inst.scheduledTime}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">فنيي وفريق التركيبات المكلف:</span>
                  <span>{inst.assignedTeamNames.join(' + ') || 'فريق التركيبات الرئيسي'}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">أمر المبيعات والمشروع المرتكز:</span>
                  <span className="font-mono font-black text-emerald-800">{inst.orderNumber} ({inst.projectNumber})</span>
                </div>
              </div>

              {/* Photos Gallery */}
              {inst.afterPhotos.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="font-bold text-xs text-slate-700">صور الموقع والتشطيب بعد التركيب النهائي:</p>
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {inst.afterPhotos.map((img, i) => (
                      <img key={i} src={img} alt="installed" className="w-36 h-28 object-cover rounded-2xl border border-slate-200 shadow-sm" />
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                
                <div className="flex items-center gap-2">
                  {/* WhatsApp Reminder Button */}
                  <button
                    onClick={() => window.open(`https://wa.me/2${inst.customerPhone}?text=${encodeURIComponent(`مرحباً أ/ ${inst.customerName}، نود تذكيركم بموعد تركيب مشروعكم المقرر بتاريخ ${inst.scheduledDate} الساعة ${inst.scheduledTime}`)}`, '_blank')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>تذكير العميل عبر الواتساب</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {!isCompleted && !isDelivered && (
                    <button
                      onClick={() => setActiveCompleteInst(inst)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تأكيد إتمام التركيب بالموقع</span>
                    </button>
                  )}

                  {isCompleted && !isDelivered && (
                    <button
                      onClick={() => completeHandover(inst.id, 'تم توقيع إقرار التسليم الفعلي من العميل')}
                      className="px-5 py-2.5 bg-[#C87A38] hover:bg-[#c85e1b] text-white font-black rounded-xl shadow-lg flex items-center gap-1.5 animate-pulse"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>تسليم العميل النهائي وتأكيد 100% (Handover Completed)</span>
                    </button>
                  )}
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* COMPLETE INSTALLATION MODAL */}
      {activeCompleteInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900">تأكيد إتمام التركيب بالموقع ({activeCompleteInst.installationNumber})</h3>
            
            <div>
              <label className="block font-bold mb-1">رابط صورة التشطيب بعد التركيب النهائي *</label>
              <input
                type="text"
                value={afterPhotoUrl}
                onChange={e => setAfterPhotoUrl(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
              />
            </div>

            {afterPhotoUrl && (
              <img src={afterPhotoUrl} alt="after-installed" className="w-full h-40 object-cover rounded-2xl border" />
            )}

            <div>
              <label className="block font-bold mb-1">ملاحظات الفنيين على التركيب والتسليم</label>
              <textarea
                rows={2}
                value={instNotes}
                onChange={e => setInstNotes(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setActiveCompleteInst(null)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button
                type="button"
                onClick={() => {
                  completeInstallation(activeCompleteInst.id, [afterPhotoUrl], instNotes);
                  setActiveCompleteInst(null);
                }}
                className="px-5 py-2 bg-emerald-600 text-white font-black rounded-xl shadow-md"
              >
                تأكيد إتمام التركيب
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
