import React, { useState } from 'react';
import { ShopWorker, WorkCenter, WorkOrder } from '../../types/production';
import { ProductionService } from '../../services/productionService';
import { CaptureMode, startOfWeek, workersWeek } from '../../services/shopFloor';
import { Users, Smartphone, PhoneOff, Phone, Copy, Coins, CalendarDays, Hammer } from 'lucide-react';

interface Props {
  workers: ShopWorker[];
  workOrders: WorkOrder[];
  workCenters: WorkCenter[];
  captureMode: CaptureMode;
}

const PAY_LABEL = { daily: 'يومية', piece: 'بالقطعة', monthly: 'شهري' };
const DEVICE = {
  none: { label: 'مفيش موبايل في الورشة', icon: PhoneOff, cls: 'text-slate-400' },
  basic_phone: { label: 'موبايل عادي', icon: Phone, cls: 'text-amber-600' },
  smartphone: { label: 'سمارت فون', icon: Smartphone, cls: 'text-emerald-600' }
};

export const WorkforceView: React.FC<Props> = ({ workers, workOrders, workCenters, captureMode }) => {
  const [from, setFrom] = useState(startOfWeek());
  const rows = workersWeek(workers, workOrders, from);
  // Monthly salaries are paid on payroll, not on the weekly sheet
  const total = rows.filter(r => r.worker.payBasis !== 'monthly').reduce((s, r) => s + r.earnings, 0);
  const pieceTotal = rows.filter(r => r.worker.payBasis === 'piece').reduce((s, r) => s + r.earnings, 0);
  const smart = workers.filter(w => w.device === 'smartphone').length;
  const [copied, setCopied] = useState(false);

  const copySheet = async () => {
    const text = [`كشف حساب الصنايعية من ${from}`, ''].concat(rows.filter(r => r.earnings > 0 && r.worker.payBasis !== 'monthly').map(r =>
      `${r.worker.name}: ${r.worker.payBasis === 'piece' ? `${r.pieces} ${r.worker.pieceUnit} × ${r.worker.pieceRate}` : `${r.activeDays} يوم × ${r.worker.dailyWage}`} = ${r.earnings.toLocaleString()} ج.م`
    )).concat(['', `الإجمالي: ${total.toLocaleString()} ج.م`]).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { icon: CalendarDays, title: 'باليومية', body: 'المساعدين والصبيان. بياخد يوميته سواء طلّع كتير أو قليل، فالنظام بيوريك إنتاجيته عشان تعرف تكلفة القطعة الحقيقية.' },
          { icon: Hammer, title: 'بالقطعة', body: 'أسطوات التجميع والدهان غالباً. بياخد سعر ثابت على كل وحدة أو ضلفة. حسابه آخر الأسبوع بيطلع لوحده من اللي اتسجل في اليومية.' },
          { icon: Coins, title: 'شهري', body: 'مشغلين الماكينات الغالية (CNC، قشاط). مرتب ثابت، والنظام بيوزّعه على المطابخ حسب الوقت اللي اتشغل عليها.' }
        ].map(c => (
          <div key={c.title} className="p-4 bg-white rounded-2xl border border-slate-200">
            <span className="flex items-center gap-2 text-sm font-black text-slate-900"><c.icon className="w-4 h-4 text-[#C87A38]" /> {c.title}</span>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2"><Users className="w-4 h-4 text-[#C87A38]" /> كشف حساب الصنايعية</h3>
            <p className="text-xs text-slate-500">محسوب من يومية الإنتاج: مين اشتغل في أنهي محطة، وخلّص كام. مفيش كشف ورق ولا خناقة آخر الأسبوع.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-600">من يوم</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-mono" />
            <button onClick={copySheet} className="px-3 py-2 bg-[#361D13] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" /> {copied ? 'اتنسخ ✓' : 'انسخ الكشف'}</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right min-w-[760px]">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3">الصنايعي</th>
                <th className="p-3">العنبر</th>
                <th className="p-3">الحساب</th>
                <th className="p-3 text-center">أيام شغل</th>
                <th className="p-3 text-center">إنتاج</th>
                <th className="p-3 text-center">المستحق</th>
                <th className="p-3">يقدر يسجل بنفسه؟</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(r => {
                const d = DEVICE[r.worker.device];
                return (
                  <tr key={r.worker.id} className="hover:bg-slate-50">
                    <td className="p-3"><strong className="text-slate-900">{r.worker.name}</strong><span className="block text-[10px] text-slate-400">{r.worker.role}</span></td>
                    <td className="p-3 text-slate-600">{ProductionService.getCategoryInfo(r.worker.section).short}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${r.worker.payBasis === 'piece' ? 'bg-violet-50 text-violet-700 border-violet-200' : r.worker.payBasis === 'daily' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>{PAY_LABEL[r.worker.payBasis]}</span>
                      <span className="text-[10px] text-slate-500 mr-1.5 font-mono">{r.worker.payBasis === 'piece' ? `${r.worker.pieceRate} ج/${r.worker.pieceUnit}` : `${r.worker.dailyWage} ج/يوم`}</span>
                    </td>
                    <td className="p-3 text-center font-mono">{r.activeDays}</td>
                    <td className="p-3 text-center font-mono">{r.worker.payBasis === 'piece' ? `${r.pieces} ${r.worker.pieceUnit}` : r.jobs.length ? `${r.jobs.length} شغلانة` : '-'}</td>
                    <td className="p-3 text-center font-mono font-black text-slate-900">{r.worker.payBasis === 'monthly' ? <span className="text-[10px] font-bold text-slate-400">مرتب شهري</span> : r.earnings ? `${r.earnings.toLocaleString()} ج.م` : '-'}</td>
                    <td className="p-3"><span className={`flex items-center gap-1 text-[11px] font-bold ${d.cls}`}><d.icon className="w-3.5 h-3.5" /> {d.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 font-black">
              <tr>
                <td className="p-3" colSpan={5}>الإجمالي من {from} <span className="text-[10px] font-bold text-violet-700 mr-2">(منهم بالقطعة {pieceTotal.toLocaleString()} ج.م)</span></td>
                <td className="p-3 text-center font-mono">{total.toLocaleString()} ج.م</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#FBF7F2] border border-[#E9D9C7] text-xs text-slate-700 leading-relaxed">
        <strong className="text-[#361D13]">ده بيأثر على طريقة التسجيل:</strong> عندك {smart} من {workers.length} صنايعية معاهم سمارت فون.
        {captureMode === 'manager'
          ? ' في وضع "مدير الإنتاج بس" مش محتاجين أي حد فيهم، بس الكشف هيبقى دقيق على قد دقة الورقة اللي بترجع آخر اليوم.'
          : captureMode === 'supervisor'
            ? ' في وضع "مشرف لكل عنبر" يكفي المشرفين بس، وده موجود عندك بالفعل.'
            : ' في وضع "تابلت عند كل محطة" مش محتاجين موبايلاتهم، التابلت ثابت عند الماكينة.'}
        {' '}الأسطى اللي بيتحاسب بالقطعة هو أكتر واحد هيحرص إن شغله يتسجل صح، لأن فلوسه طالعة منه.
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-200 text-[11px] text-slate-600">
        <strong className="text-slate-800 block mb-1">سعر الساعة القياسي لكل محطة (بيستخدم في التسعير قبل التنفيذ):</strong>
        <div className="flex flex-wrap gap-2">
          {workCenters.map(wc => (
            <span key={wc.id} className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-200">{ProductionService.getCategoryInfo(wc.category).short}: عمالة {wc.hourlyLaborCost} + ماكينة {wc.hourlyMachineCost} ج/س</span>
          ))}
        </div>
      </div>
    </div>
  );
};
