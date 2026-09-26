// ====================================================
// REWAQ ERP — DAFTRA-STYLE CHART OF ACCOUNTS (شجرة ودليل الحسابات)
// Visual Hierarchical Tree Explorer with Live Aggregation & Node Actions
// ====================================================

import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { Account, AccountType } from '../../types/accounting';
import {
  FolderTree,
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Info,
  Scale,
  ArrowUpRight,
  ArrowDownLeft,
  Printer,
  Copy,
  Edit3,
  ExternalLink,
  ShieldAlert,
  FileSpreadsheet
} from 'lucide-react';
import { exportChartOfAccountsToExcel } from '../../utils/excelExport';

interface TreeNodeProps {
  account: Account;
  allAccounts: Account[];
  depth: number;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  selectedAccountId: string | null;
  onSelectAccount: (account: Account) => void;
  onAddSubAccount: (parent: Account) => void;
  aggregatedBalances: Map<string, { debit: number; credit: number; net: number }>;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  account,
  allAccounts,
  depth,
  expandedIds,
  toggleExpand,
  selectedAccountId,
  onSelectAccount,
  onAddSubAccount,
  aggregatedBalances
}) => {
  const children = allAccounts
    .filter(a => a.parentId === account.id)
    .sort((a, b) => a.code.localeCompare(b.code));

  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(account.id);
  const isSelected = selectedAccountId === account.id;

  // Retrieve calculated aggregated balance for this node
  const balanceInfo = aggregatedBalances.get(account.id) || {
    debit: account.openingBalanceDebit || 0,
    credit: account.openingBalanceCredit || 0,
    net: (account.openingBalanceDebit || 0) - (account.openingBalanceCredit || 0)
  };

  const isDebitNormal = account.type === 'asset' || account.type === 'expense' || account.type === 'cogs';

  return (
    <div className="select-none">
      {/* Node Row */}
      <div
        onClick={() => onSelectAccount(account)}
        className={`group flex items-center justify-between py-2.5 px-3 rounded-2xl transition-all cursor-pointer border ${
          isSelected
            ? 'bg-[#361D13] text-white border-[#C87A38] shadow-md shadow-[#361D13]/20'
            : 'bg-white hover:bg-amber-50/70 border-slate-200/80 text-slate-800'
        }`}
        style={{ marginRight: `${depth * 24}px` }}
      >
        {/* Right Side: Expand Button + Icon + Code + Name */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Expand/Collapse Trigger */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(account.id);
              }}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-white/20 text-amber-200 hover:bg-white/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-900'
              }`}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center">
              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-slate-300'}`} />
            </div>
          )}

          {/* Folder/File Icon */}
          <div className="shrink-0">
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className={`w-5 h-5 ${isSelected ? 'text-amber-300' : 'text-[#C87A38]'}`} />
              ) : (
                <Folder className={`w-5 h-5 ${isSelected ? 'text-amber-300' : 'text-[#C87A38]'}`} />
              )
            ) : (
              <FileText className={`w-4 h-4 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`} />
            )}
          </div>

          {/* Account Code Badge */}
          <span
            className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg shrink-0 ${
              isSelected
                ? 'bg-white/15 text-amber-200 border border-white/20'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {account.code}
          </span>

          {/* Account Name */}
          <div className="flex items-center gap-2 min-w-0 truncate">
            <span className={`font-bold text-xs md:text-sm truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
              {account.nameAr || account.name}
            </span>
            <span className={`text-[11px] hidden md:inline truncate ${isSelected ? 'text-amber-200/70' : 'text-slate-400'}`}>
              ({account.name})
            </span>
          </div>

          {/* Account Level Badge */}
          <span
            className={`hidden lg:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
              isSelected ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-500'
            }`}
          >
            مستوى {account.level}
          </span>

          {/* Direct Posting Lock Badge */}
          {!account.allowManualEntries && (
            <span
              className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                isSelected ? 'bg-amber-500/30 text-amber-200' : 'bg-slate-100 text-slate-500'
              }`}
              title="حساب رئيسي مجمع — لا يقبل قيود مباشرة"
            >
              <Lock className="w-3 h-3" />
              <span>تجميعي</span>
            </span>
          )}
        </div>

        {/* Left Side: Balance & Quick Actions */}
        <div className="flex items-center gap-3 shrink-0 mr-2">
          {/* Aggregated Balance */}
          <div className="text-left">
            <div className={`text-xs md:text-sm font-black font-mono ${
              isSelected
                ? 'text-amber-200'
                : balanceInfo.net >= 0
                ? 'text-emerald-700'
                : 'text-rose-600'
            }`}>
              {Math.abs(balanceInfo.net).toLocaleString()} EGP
            </div>
            <div className={`text-[10px] font-bold ${
              isSelected ? 'text-white/60' : 'text-slate-400'
            }`}>
              {isDebitNormal ? (balanceInfo.net >= 0 ? 'مدين' : 'دائن (شاذ)') : (balanceInfo.net <= 0 ? 'دائن' : 'مدين (شاذ)')}
            </div>
          </div>

          {/* Quick Add Sub-account button on hover or active */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddSubAccount(account);
            }}
            className={`p-1.5 rounded-xl transition-all ${
              isSelected
                ? 'bg-[#C87A38] text-white hover:bg-amber-600'
                : 'bg-slate-100 text-slate-600 hover:bg-[#C87A38] hover:text-white opacity-0 group-hover:opacity-100'
            }`}
            title="إضافة حساب فرعي تحت هذا الحساب"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Children Tree Nodes */}
      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1 relative pr-3 border-r-2 border-slate-200/80">
          {children.map(child => (
            <TreeNode
              key={child.id}
              account={child}
              allAccounts={allAccounts}
              depth={depth + 1}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              selectedAccountId={selectedAccountId}
              onSelectAccount={onSelectAccount}
              onAddSubAccount={onAddSubAccount}
              aggregatedBalances={aggregatedBalances}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ChartOfAccountsView: React.FC = () => {
  const { chartOfAccounts, journalEntries, addAccountToCoA, showToast, setActiveModule } = useERP();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | AccountType>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(chartOfAccounts[0]?.id || null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(chartOfAccounts.filter(a => a.level <= 2).map(a => a.id))
  );

  // Add Account Modal States
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [modalParentAccount, setModalParentAccount] = useState<Account | null>(null);
  const [newAccCode, setNewAccCode] = useState<string>('');
  const [newAccNameAr, setNewAccNameAr] = useState<string>('');
  const [newAccNameEn, setNewAccNameEn] = useState<string>('');
  const [newAccType, setNewAccType] = useState<AccountType>('asset');
  const [newAccAllowManual, setNewAccAllowManual] = useState<boolean>(true);
  const [newAccIsReconcilable, setNewAccIsReconcilable] = useState<boolean>(false);
  const [newAccDescription, setNewAccDescription] = useState<string>('');

  // Selected Account Object
  const selectedAccount = useMemo(() => {
    return chartOfAccounts.find(a => a.id === selectedAccountId) || chartOfAccounts[0];
  }, [chartOfAccounts, selectedAccountId]);

  // Pre-calculate recursive aggregated balances for all accounts
  const aggregatedBalances = useMemo(() => {
    const balances = new Map<string, { debit: number; credit: number; net: number }>();

    // Step 1: Calculate direct posted activity for each leaf account
    const directMap = new Map<string, { debit: number; credit: number }>();
    chartOfAccounts.forEach(acc => {
      directMap.set(acc.id, {
        debit: acc.openingBalanceDebit || 0,
        credit: acc.openingBalanceCredit || 0
      });
    });

    journalEntries.filter(e => e.status === 'posted').forEach(entry => {
      entry.lines.forEach(line => {
        const acc = chartOfAccounts.find(a => a.id === line.accountId || a.code === line.accountCode);
        if (acc) {
          const cur = directMap.get(acc.id) || { debit: 0, credit: 0 };
          directMap.set(acc.id, {
            debit: cur.debit + line.debit,
            credit: cur.credit + line.credit
          });
        }
      });
    });

    // Step 2: Recursively sum children for parent accounts
    const getAccountSum = (accId: string): { debit: number; credit: number } => {
      const children = chartOfAccounts.filter(a => a.parentId === accId);
      const direct = directMap.get(accId) || { debit: 0, credit: 0 };

      if (children.length === 0) {
        return direct;
      }

      let totalDeb = direct.debit;
      let totalCred = direct.credit;

      children.forEach(ch => {
        const chSum = getAccountSum(ch.id);
        totalDeb += chSum.debit;
        totalCred += chSum.credit;
      });

      return { debit: totalDeb, credit: totalCred };
    };

    chartOfAccounts.forEach(acc => {
      const sum = getAccountSum(acc.id);
      balances.set(acc.id, {
        debit: sum.debit,
        credit: sum.credit,
        net: sum.debit - sum.credit
      });
    });

    return balances;
  }, [chartOfAccounts, journalEntries]);

  // Filter root accounts
  const rootAccounts = useMemo(() => {
    return chartOfAccounts.filter(a => !a.parentId).sort((a, b) => a.code.localeCompare(b.code));
  }, [chartOfAccounts]);

  // Filter accounts by search query
  const filteredAccounts = useMemo(() => {
    if (!searchQuery && selectedTypeFilter === 'all') {
      return chartOfAccounts;
    }

    return chartOfAccounts.filter(acc => {
      const matchesSearch =
        !searchQuery ||
        (acc.nameAr && acc.nameAr.toLowerCase().includes(searchQuery.toLowerCase())) ||
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.code.includes(searchQuery);

      const matchesType =
        selectedTypeFilter === 'all' ||
        acc.type === selectedTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [chartOfAccounts, searchQuery, selectedTypeFilter]);

  // Helper to toggle node expansion
  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedIds(next);
  };

  const expandAll = () => {
    setExpandedIds(new Set(chartOfAccounts.map(a => a.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set(chartOfAccounts.filter(a => a.level === 1).map(a => a.id)));
  };

  // Helper to open Add Sub-Account Modal with auto-code generator
  const handleOpenAddModal = (parent?: Account) => {
    const targetParent = parent || selectedAccount || null;
    setModalParentAccount(targetParent);

    if (targetParent) {
      // Find existing children to calculate next available code
      const children = chartOfAccounts.filter(a => a.parentId === targetParent.id);
      let nextSuffix = 1;
      if (children.length > 0) {
        const lastChild = children[children.length - 1];
        const lastDigits = parseInt(lastChild.code.substring(targetParent.code.length), 10);
        if (!isNaN(lastDigits)) {
          nextSuffix = lastDigits + 1;
        }
      }
      setNewAccCode(`${targetParent.code}${nextSuffix}`);
      setNewAccType(targetParent.type);
      setNewAccAllowManual(true);
      setNewAccIsReconcilable(targetParent.isReconcilable || false);
    } else {
      setNewAccCode('1');
      setNewAccType('asset');
    }

    setNewAccNameAr('');
    setNewAccNameEn('');
    setNewAccDescription('');
    setShowAddModal(true);
  };

  const handleSaveNewAccount = () => {
    if (!newAccCode || !newAccNameAr) {
      showToast('يرجى إدخال رمز واسم الحساب باللغة العربية', 'warning');
      return;
    }

    // Check duplicate code
    if (chartOfAccounts.some(a => a.code === newAccCode)) {
      showToast('رمز الحساب موجود بالفعل في دليل الحسابات', 'error');
      return;
    }

    const newAcc: Account = {
      id: `acc-${newAccCode}`,
      code: newAccCode,
      name: newAccNameEn || newAccNameAr,
      nameAr: newAccNameAr,
      parentId: modalParentAccount?.id,
      level: modalParentAccount ? modalParentAccount.level + 1 : 1,
      type: newAccType,
      allowManualEntries: newAccAllowManual,
      isReconcilable: newAccIsReconcilable,
      isActive: true,
      openingBalanceDebit: 0,
      openingBalanceCredit: 0,
      description: newAccDescription
    };

    addAccountToCoA(newAcc);
    showToast(`تمت إضافة الحساب (${newAcc.code} - ${newAcc.nameAr}) بنجاح`, 'success');
    setShowAddModal(false);

    // Expand parent node so new child is visible
    if (modalParentAccount) {
      setExpandedIds(prev => new Set([...prev, modalParentAccount.id]));
    }
    setSelectedAccountId(newAcc.id);
  };

  // Build parent breadcrumb trail for selected account
  const breadcrumbTrail = useMemo(() => {
    if (!selectedAccount) return [];
    const trail: Account[] = [];
    let cur: Account | undefined = selectedAccount;
    while (cur) {
      trail.unshift(cur);
      cur = chartOfAccounts.find(a => a.id === cur?.parentId);
    }
    return trail;
  }, [selectedAccount, chartOfAccounts]);

  // Recent transactions for selected account
  const recentAccountLines = useMemo(() => {
    if (!selectedAccount) return [];
    const lines: { entryId: string; entryNumber: string; date: string; description: string; debit: number; credit: number; reference: string }[] = [];

    journalEntries.filter(e => e.status === 'posted').forEach(entry => {
      entry.lines.forEach(l => {
        if (l.accountId === selectedAccount.id || l.accountCode === selectedAccount.code) {
          lines.push({
            entryId: entry.id,
            entryNumber: entry.entryNumber,
            date: entry.date,
            description: l.description || entry.description,
            debit: l.debit,
            credit: l.credit,
            reference: entry.reference
          });
        }
      });
    });

    return lines.slice(-10).reverse();
  }, [selectedAccount, journalEntries]);

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HEADER & ACTIONS */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <FolderTree className="w-3.5 h-3.5" />
            <span>الهيكل المحاسبي الشجري التفاعلي — Daftra-Inspired COA Architecture</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <FolderTree className="w-8 h-8 text-[#C87A38]" />
            <span>دليل وشجرة الحسابات (Chart of Accounts)</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            شجرة تفاعلية متكاملة تضم حسابات التصنيع، المخازن، والإنتاج تحت التشغيل (WIP)، وحسابات المبيعات والعملاء، مع التجميع التلقائي الفوري للأرصدة في المستويات الأعلى.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#C87A38] hover:bg-amber-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حساب جديد</span>
          </button>

          <button
            onClick={() => {
              exportChartOfAccountsToExcel(chartOfAccounts);
              showToast('✓ تم تصدير شجرة الحسابات بالكامل إلى ملف Excel بنجاح', 'success');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
            title="تصدير شجرة الحسابات إلى ملف Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => setActiveModule('acc_entries')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-amber-100 font-bold text-xs rounded-2xl border border-white/20 transition-all"
          >
            <Scale className="w-4 h-4 text-amber-300" />
            <span>قيود اليومية</span>
          </button>
        </div>
      </div>

      {/* 2. FILTER TOOLBAR & ROOT CATEGORIES */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => setSelectedTypeFilter('all')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all ${
                selectedTypeFilter === 'all'
                  ? 'bg-[#361D13] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل ({chartOfAccounts.length})
            </button>
            <button
              onClick={() => setSelectedTypeFilter('asset')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all ${
                selectedTypeFilter === 'asset'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              1 - الأصول
            </button>
            <button
              onClick={() => setSelectedTypeFilter('liability')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all ${
                selectedTypeFilter === 'liability'
                  ? 'bg-amber-700 text-white shadow-md'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              2 - الخصوم والالتزامات
            </button>
            <button
              onClick={() => setSelectedTypeFilter('equity')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all ${
                selectedTypeFilter === 'equity'
                  ? 'bg-indigo-700 text-white shadow-md'
                  : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
              }`}
            >
              3 - حقوق الملكية
            </button>
            <button
              onClick={() => setSelectedTypeFilter('revenue')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all ${
                selectedTypeFilter === 'revenue'
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              4 - الإيرادات
            </button>
            <button
              onClick={() => setSelectedTypeFilter('expense')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all ${
                selectedTypeFilter === 'expense'
                  ? 'bg-rose-700 text-white shadow-md'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              5 - المصروفات والتكاليف
            </button>
          </div>

          {/* Expand/Collapse All Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              توسيع الكل 📂
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              طَي الكل 📁
            </button>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الحساب، الرمز المحاسبي (مثال: 1131 أو خامات أو عملاء)..."
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
          />
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: TREE EXPLORER + ACCOUNT DETAILS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT/MAIN COLUMN: HIERARCHICAL TREE (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#C87A38]" />
              <span className="font-black text-sm text-slate-900">الهيكل التفاعلي لدليل الحسابات</span>
            </div>
            <span className="text-xs text-slate-400 font-bold">
              إجمالي الحسابات: {filteredAccounts.length} حساب
            </span>
          </div>

          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1 custom-scrollbar">
            {searchQuery || selectedTypeFilter !== 'all' ? (
              // Flat search view when filtered
              <div className="space-y-2">
                {filteredAccounts.map(account => (
                  <TreeNode
                    key={account.id}
                    account={account}
                    allAccounts={chartOfAccounts}
                    depth={0}
                    expandedIds={expandedIds}
                    toggleExpand={toggleExpand}
                    selectedAccountId={selectedAccountId}
                    onSelectAccount={setSelectedAccountId ? (acc) => setSelectedAccountId(acc.id) : () => {}}
                    onAddSubAccount={handleOpenAddModal}
                    aggregatedBalances={aggregatedBalances}
                  />
                ))}
              </div>
            ) : (
              // True Hierarchical Root Tree
              rootAccounts.map(root => (
                <TreeNode
                  key={root.id}
                  account={root}
                  allAccounts={chartOfAccounts}
                  depth={0}
                  expandedIds={expandedIds}
                  toggleExpand={toggleExpand}
                  selectedAccountId={selectedAccountId}
                  onSelectAccount={(acc) => setSelectedAccountId(acc.id)}
                  onAddSubAccount={handleOpenAddModal}
                  aggregatedBalances={aggregatedBalances}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACCOUNT DETAIL & STATEMENT PREVIEW (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {selectedAccount ? (
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              {/* Account Header */}
              <div className="pb-4 border-b border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm px-3 py-1 bg-[#361D13] text-amber-200 rounded-xl">
                    {selectedAccount.code}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
                    selectedAccount.type === 'asset' ? 'bg-emerald-50 text-emerald-800' :
                    selectedAccount.type === 'liability' ? 'bg-amber-50 text-amber-800' :
                    selectedAccount.type === 'equity' ? 'bg-indigo-50 text-indigo-800' :
                    selectedAccount.type === 'revenue' ? 'bg-blue-50 text-blue-800' : 'bg-rose-50 text-rose-800'
                  }`}>
                    {selectedAccount.type === 'asset' && 'أصول'}
                    {selectedAccount.type === 'liability' && 'خصوم والالتزامات'}
                    {selectedAccount.type === 'equity' && 'حقوق الملكية'}
                    {selectedAccount.type === 'revenue' && 'إيرادات'}
                    {selectedAccount.type === 'expense' && 'مصروفات تشغيلية'}
                    {selectedAccount.type === 'cogs' && 'تكلفة إنتاج ومبيعات'}
                  </span>
                </div>

                <h2 className="text-lg font-black text-slate-900 leading-tight">
                  {selectedAccount.nameAr || selectedAccount.name}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedAccount.name}
                </p>

                {/* Breadcrumbs */}
                <div className="pt-2 flex flex-wrap items-center gap-1 text-[11px] text-slate-400 font-bold">
                  {breadcrumbTrail.map((crumb, idx) => (
                    <React.Fragment key={crumb.id}>
                      <span className={idx === breadcrumbTrail.length - 1 ? 'text-[#C87A38]' : 'text-slate-500'}>
                        {crumb.nameAr || crumb.name}
                      </span>
                      {idx < breadcrumbTrail.length - 1 && <ChevronLeft className="w-3 h-3 text-slate-300" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Balance Summary Box */}
              {(() => {
                const bal = aggregatedBalances.get(selectedAccount.id) || { debit: 0, credit: 0, net: 0 };
                const isDebit = selectedAccount.type === 'asset' || selectedAccount.type === 'expense' || selectedAccount.type === 'cogs';
                return (
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">الرصيد المجمع الحالي:</span>
                      <span className="text-xs font-bold text-[#C87A38]">
                        طبيعة الحساب: {isDebit ? 'مدين' : 'دائن'}
                      </span>
                    </div>

                    <div className="text-2xl font-black font-mono text-[#361D13] text-left">
                      {Math.abs(bal.net).toLocaleString()} EGP
                      <span className="text-xs font-bold text-slate-500 mr-2">
                        {bal.net >= 0 ? '(مدين)' : '(دائن)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200/40 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">إجمالي المدين</span>
                        <span className="font-bold text-emerald-700 font-mono">
                          {bal.debit.toLocaleString()} EGP
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">إجمالي الدائن</span>
                        <span className="font-bold text-rose-600 font-mono">
                          {bal.credit.toLocaleString()} EGP
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Account Metadata Properties */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">المستوى في الشجرة:</span>
                  <span className="font-bold text-slate-800">المستوى {selectedAccount.level}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">يقبل القيود المباشرة:</span>
                  <span className={`font-bold ${selectedAccount.allowManualEntries ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {selectedAccount.allowManualEntries ? 'نعم (حساب فرعي/حركة)' : 'لا (حساب رئيسي تجميعي)'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">يقبل التسويات والمطابقة:</span>
                  <span className="font-bold text-slate-800">
                    {selectedAccount.isReconcilable ? 'نعم (مطابقة بنكية/أستاذ)' : 'لا'}
                  </span>
                </div>
                {selectedAccount.description && (
                  <div className="pt-2 text-slate-600 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <span className="font-bold block text-slate-800 mb-1">الوصف المحاسبي:</span>
                    {selectedAccount.description}
                  </div>
                )}
              </div>

              {/* Quick Actions for Selected Account */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => handleOpenAddModal(selectedAccount)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs transition-all"
                >
                  <Plus className="w-4 h-4 text-[#C87A38]" />
                  <span>إضافة حساب فرعي تحت ({selectedAccount.code})</span>
                </button>

                <button
                  onClick={() => setActiveModule('acc_entries')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all"
                >
                  <Scale className="w-4 h-4 text-slate-600" />
                  <span>عرض دفتر الأستاذ والقيود</span>
                </button>
              </div>

              {/* Recent Activity for this account */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <span className="font-bold text-xs text-slate-900 block">آخر الحركات المقيدة على الحساب:</span>
                {recentAccountLines.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    لا توجد قيود مرحلة على هذا الحساب حالياً
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                    {recentAccountLines.map((line, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-bold text-slate-700">{line.entryNumber}</span>
                          <span className="text-slate-400">{line.date}</span>
                        </div>
                        <p className="text-slate-800 text-[11px] truncate">{line.description}</p>
                        <div className="flex items-center justify-between text-[11px] font-bold font-mono pt-1">
                          {line.debit > 0 && <span className="text-emerald-700">مدين: +{line.debit.toLocaleString()}</span>}
                          {line.credit > 0 && <span className="text-rose-600">دائن: -{line.credit.toLocaleString()}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-3 text-slate-400">
              <FolderTree className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold">حدد أي حساب من الشجرة لمعاينة تفاصيله وحركاته</p>
            </div>
          )}
        </div>

      </div>

      {/* 4. MODAL: ADD ACCOUNT (Daftra-Style Child Code Auto Generator) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderTree className="w-6 h-6 text-[#C87A38]" />
                <h3 className="font-black text-lg text-slate-900">إضافة حساب جديد إلى شجرة الحسابات</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Parent Account Context */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-700 block">الحساب الرئيسي (الأب):</span>
                  <span className="font-black text-sm">
                    {modalParentAccount ? `${modalParentAccount.code} - ${modalParentAccount.nameAr || modalParentAccount.name}` : 'حساب رئيسي جذري (Root Account)'}
                  </span>
                </div>
                {modalParentAccount && (
                  <span className="text-xs font-bold bg-amber-200 px-2 py-1 rounded-lg">
                    مستوى {modalParentAccount.level + 1}
                  </span>
                )}
              </div>

              {/* Account Code & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">رمز الحساب (Code):</label>
                  <input
                    type="text"
                    value={newAccCode}
                    onChange={(e) => setNewAccCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                    placeholder="مثال: 11315"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">تصنيف الحساب:</label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                  >
                    <option value="asset">1 - أصول (Assets)</option>
                    <option value="liability">2 - خصوم والتزامات (Liabilities)</option>
                    <option value="equity">3 - حقوق ملكية (Equity)</option>
                    <option value="revenue">4 - إيرادات (Revenue)</option>
                    <option value="expense">5 - مصروفات (Expenses)</option>
                    <option value="cogs">51 - تكلفة مبيعات وتصنيع (COGS)</option>
                  </select>
                </div>
              </div>

              {/* Names (AR & EN) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">اسم الحساب (بالعربية):</label>
                  <input
                    type="text"
                    value={newAccNameAr}
                    onChange={(e) => setNewAccNameAr(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                    placeholder="مثال: مخزن إكسسوارات ومفصلات بلوم"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">اسم الحساب (بالإنجليزية):</label>
                  <input
                    type="text"
                    value={newAccNameEn}
                    onChange={(e) => setNewAccNameEn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                    placeholder="e.g. Blum Hardware & Fittings Stock"
                  />
                </div>
              </div>

              {/* Direct Posting & Reconciliation */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAccAllowManual}
                    onChange={(e) => setNewAccAllowManual(e.target.checked)}
                    className="rounded text-[#C87A38] focus:ring-[#C87A38]"
                  />
                  <span className="font-bold text-slate-700">يقبل القيود المباشرة (حساب فرعي)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAccIsReconcilable}
                    onChange={(e) => setNewAccIsReconcilable(e.target.checked)}
                    className="rounded text-[#C87A38] focus:ring-[#C87A38]"
                  />
                  <span className="font-bold text-slate-700">حساب تسوية ومطابقة أستاذ</span>
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 mb-1 block">ملاحظات ووصف الحساب:</label>
                <textarea
                  value={newAccDescription}
                  onChange={(e) => setNewAccDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                  placeholder="وصف الغرض المحاسبي للحساب..."
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveNewAccount}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#C87A38] hover:bg-amber-600 text-white shadow-lg shadow-[#C87A38]/30 transition-all"
              >
                حفظ الحساب في الدليل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
