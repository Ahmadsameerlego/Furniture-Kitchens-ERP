import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { MarketingCampaign, CustomerSource } from '../types/erp';
import { Sparkles, Plus, TrendingUp, Users, ShoppingBag, DollarSign, Calendar, Edit, CheckCircle2, ChevronLeft } from 'lucide-react';
import { CrmService } from '../services/crmService';

export const CampaignsPage: React.FC = () => {
  const { campaigns, customers, addCampaign, updateCampaign, setSelectedCustomerId, setActiveModule } = useERP();

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaignToEdit, setCampaignToEdit] = useState<MarketingCampaign | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<CustomerSource>('instagram');
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [budget, setBudget] = useState(25000);
  const [notes, setNotes] = useState('');

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (campaignToEdit) {
      updateCampaign(campaignToEdit.id, { name, platform, startDate, budget: Number(budget), notes });
    } else {
      addCampaign({
        name,
        nameEn: name,
        platform,
        startDate,
        status: 'active',
        budget: Number(budget),
        notes
      });
    }
    setIsModalOpen(false);
  };

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
  const campaignCustomers = selectedCampaignId ? customers.filter(c => c.campaignId === selectedCampaignId) : [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">إدارة الحملات التسويقية (Marketing Campaigns)</h1>
            <span className="bg-[#C87A38]/15 text-[#C87A38] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#C87A38]/30">
              {campaigns.length} حملات إعلانية
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ربط إعلانات انستجرام وفيسبوك وتيك توك بالعملاء المسجلين وقيمة المبيعات المحققة
          </p>
        </div>

        <button
          onClick={() => {
            setCampaignToEdit(null);
            setName('');
            setBudget(25000);
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 bg-[#361D13] hover:bg-[#23120A] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#C87A38]" />
          <span>إنشاء حملة تسويقية جديدة</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((cmp) => {
          const sourceMeta = CrmService.getSourceLabel(cmp.platform);
          const isSelected = selectedCampaignId === cmp.id;
          const attributedRev = cmp.revenueAttributed || 0;
          const convRate = cmp.customersCount > 0 ? Math.round((cmp.purchasedCount / cmp.customersCount) * 100) : 0;

          return (
            <div
              key={cmp.id}
              onClick={() => setSelectedCampaignId(cmp.id === selectedCampaignId ? null : cmp.id)}
              className={`p-6 rounded-3xl bg-white border cursor-pointer transition-all space-y-4 shadow-sm hover:shadow-md ${
                isSelected
                  ? 'border-[#C87A38] ring-2 ring-[#C87A38]/20 bg-amber-50/30'
                  : 'border-slate-200/80'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {sourceMeta.label}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">{cmp.name}</h3>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  cmp.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {cmp.status === 'active' ? 'حملة نشطة' : 'منتهية'}
                </span>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-bold text-[10px] block">العملاء:</span>
                  <span className="font-black text-slate-900 text-sm">{cmp.customersCount}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold text-[10px] block">التعاقدات:</span>
                  <span className="font-black text-emerald-800 text-sm">{cmp.purchasedCount}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold text-[10px] block">التحويل:</span>
                  <span className="font-black text-[#C87A38] text-sm">{convRate}%</span>
                </div>
              </div>

              {/* Financial Attribution */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">العائد المحقق:</span>
                <span className="text-[#361D13] text-sm">{attributedRev.toLocaleString('ar-EG')} ج.م</span>
              </div>

              <div className="text-[10px] text-slate-400 text-center font-bold">
                {isSelected ? '▲ إخفاء العملاء المنسوبين' : '▼ انقر لإظهار العملاء المنسوبين للحملة'}
              </div>

            </div>
          );
        })}
      </div>

      {/* Selected Campaign Attributed Customers Table */}
      {selectedCampaign && (
        <div className="bg-white rounded-3xl p-6 border border-[#C87A38]/30 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">
                العملاء المنسوبين لحملة: <span className="text-[#C87A38]">{selectedCampaign.name}</span>
              </h3>
              <p className="text-xs text-slate-500">إجمالي {campaignCustomers.length} عميل تم اكتسابهم عبر هذه الحملة الإعلانية</p>
            </div>

            <button
              onClick={() => setSelectedCampaignId(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-900"
            >
              إغلاق القائمة
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {campaignCustomers.map(cust => {
              const statusMeta = CrmService.getStatusMeta(cust.status);

              return (
                <div
                  key={cust.id}
                  onClick={() => {
                    setSelectedCustomerId(cust.id);
                    setActiveModule('customers');
                  }}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#361D13] cursor-pointer transition-all space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={cust.avatar} alt="" className="w-8 h-8 rounded-xl object-cover" />
                      <span className="font-black text-slate-900">{cust.fullName}</span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusMeta.bgClass} ${statusMeta.textClass}`}>
                      {statusMeta.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>الفرع: {cust.branchName}</span>
                    <span className="font-mono dir-ltr">{cust.phone}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Campaign Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5">
            <h3 className="text-lg font-black text-slate-900">إنشاء حملة تسويقية جديدة</h3>

            <form onSubmit={handleSaveCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الحملة بالعربية *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: عروض مطابخ خريف 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المنصة التسويقية *</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="instagram">انستجرام (Instagram)</option>
                  <option value="facebook">فيسبوك (Facebook)</option>
                  <option value="tiktok">تيك توك (TikTok)</option>
                  <option value="website">الموقع الإلكتروني</option>
                  <option value="whatsapp">واتساب (WhatsApp)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ميزانية الحملة (ج.م)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 dir-ltr text-left"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#361D13] text-white font-black rounded-xl shadow-md"
                >
                  حفظ الحملة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
