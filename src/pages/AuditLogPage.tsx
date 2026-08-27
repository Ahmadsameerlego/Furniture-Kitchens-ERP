import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { ShieldCheck, Search, Filter, AlertOctagon, CheckCircle2, Lock } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { auditLogs } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">سجل التتبع والأمان (Audit Log Foundation)</h1>
            <span className="bg-[#E06F28]/15 text-[#E06F28] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E06F28]/30">
              {auditLogs.length} سجلات موثقة
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل شامل وغير قابل للتعديل لجميع العمليات الإدارية، تغييرات الفروع والصلاحيات، ومحاولات النفاذ المحظورة
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالإجراء أو المستخدم أو الهدف..."
            className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">التصنيف:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">كل التصنيفات</option>
              <option value="user">المستخدمين</option>
              <option value="role">الأدوار والصلاحيات</option>
              <option value="branch">الفروع والمقرات</option>
              <option value="company">إعدادات الشركة</option>
              <option value="security">أمن الحماية والرفض</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">النتيجة:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">الكل</option>
              <option value="success">ناجحة (200 OK)</option>
              <option value="denied">مرفوضة أمنياً (403 Forbidden)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#1C352D] text-white font-bold border-b border-emerald-900/50">
              <tr>
                <th className="p-4">التاريخ والوقت</th>
                <th className="p-4">المستخدم والدور</th>
                <th className="p-4">نوع الإجراء</th>
                <th className="p-4">الهدف / Target</th>
                <th className="p-4">تفاصيل العملية</th>
                <th className="p-4 text-center">النتيجة الأمنية</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Timestamp */}
                  <td className="p-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  {/* User */}
                  <td className="p-4">
                    <div>
                      <p className="font-bold text-slate-900">{log.userName}</p>
                      <span className="text-[10px] text-[#E06F28] font-bold">{log.userRole}</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="p-4 font-bold text-slate-800">
                    {log.action}
                  </td>

                  {/* Target */}
                  <td className="p-4 font-mono text-slate-600">
                    {log.target}
                  </td>

                  {/* Details */}
                  <td className="p-4 text-slate-500 max-w-xs truncate">
                    {log.details}
                  </td>

                  {/* Status */}
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                      log.status === 'success'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                    }`}>
                      {log.status === 'success' ? (
                        <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 200 OK</>
                      ) : (
                        <><AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> 403 Forbidden</>
                      )}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
