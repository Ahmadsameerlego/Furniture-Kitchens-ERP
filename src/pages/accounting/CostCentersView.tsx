// ====================================================
// REWAQ ERP — COST CENTERS & WORKSHOPS ANALYTICS
// Analytical Cost Allocation across Furniture Workshops & Showrooms
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { CostCenter } from '../../types/accounting';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Layers,
  Factory,
  CheckCircle2,
  PieChart,
  BarChart3,
  DollarSign,
  TrendingUp,
  FolderTree
} from 'lucide-react';

export const CostCentersView: React.FC = () => {
  const { costCenters, journalEntries, showToast } = useERP();

  // Calculate allocated expenses & debits for each cost center from journal entries
  const costCenterAnalytics = costCenters.map(cc => {
    let totalDebit = 0;
    let totalCredit = 0;

    journalEntries.filter(e => e.status === 'posted').forEach(entry => {
      entry.lines.forEach(l => {
        if (l.costCenterId === cc.id || l.costCenterId === cc.code) {
          totalDebit += l.debit;
          totalCredit += l.credit;
        }
      });
    });

    return {
      ...cc,
      allocatedCost: totalDebit,
      allocatedRevenue: totalCredit,
      netAllocation: totalDebit - totalCredit
    };
  });

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>المحاسبة التحليلية ومراكز الربحية — Analytical Cost Centers</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[#C87A38]" />
            <span>مراكز التكلفة والورش الإنتاجية</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            توزيع التكاليف المباشرة وغير المباشرة على ورش النجارة، الدهانات، التجميع، معارض البيع، ومشاريع العملاء لقياس ربحية كل وحدة تشغيلية.
          </p>
        </div>
      </div>

      {/* 2. COST CENTER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {costCenterAnalytics.map(cc => (
          <div key={cc.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 hover:border-[#C87A38]/40 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-mono font-black text-xs px-2.5 py-1 bg-[#361D13] text-amber-200 rounded-xl">
                {cc.code}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                مركز تكلفة نشط
              </span>
            </div>

            <div>
              <h2 className="text-base font-black text-slate-900">{cc.nameAr}</h2>
              <p className="text-xs text-slate-400">{cc.name}</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2">
              <span className="text-xs font-bold text-slate-600 block">إجمالي التكاليف المحملة على المركز:</span>
              <div className="text-xl font-black font-mono text-[#361D13] text-left">
                {cc.allocatedCost.toLocaleString()} <span className="text-xs font-bold text-slate-500">EGP</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
              <span>التصنيف: {cc.category}</span>
              <span>الحسابات المقيدة: قيود تشغيلية</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
