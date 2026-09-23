import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { User } from '../types/erp';
import { Users, Plus, Edit, Shield, MapPin, Search, CheckCircle2, UserX, UserCheck } from 'lucide-react';
import { UserFormModal } from '../components/modals/UserFormModal';

export const UsersPage: React.FC = () => {
  const { users, roles, branches, addUser, updateUser, toggleUserStatus, checkPermission } = useERP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  const canCreate = checkPermission('settings', 'create');
  const canEdit = checkPermission('settings', 'edit');

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'all' || u.roleId === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSaveUser = (data: any) => {
    if (userToEdit) {
      updateUser(userToEdit.id, data);
    } else {
      addUser(data);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">إدارة المستخدمين وحسابات الموظفين (User Management)</h1>
            <span className="bg-[#C87A38]/15 text-[#C87A38] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#C87A38]/30">
              {users.length} مستخدمين
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إسناد الأدوار الوظيفية (WHAT) وتخصيص الفروع والمقرات المصرحة أمنياً (WHERE)
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => {
              setUserToEdit(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-[#361D13] hover:bg-[#23120A] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#C87A38]" />
            <span>إضافة موظف / مستخدم جديد</span>
          </button>
        )}
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو البريد الإلكتروني..."
            className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-slate-500 font-bold whitespace-nowrap">تصفية حسب الدور:</span>
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 font-bold text-slate-700"
          >
            <option value="all">كل الأدوار الوظيفية</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#361D13] text-white font-bold border-b border-emerald-900/50">
              <tr>
                <th className="p-4">الموظف والمسمى الوظيفي</th>
                <th className="p-4">الدور الوظيفي (WHAT)</th>
                <th className="p-4">الفروع المخصصة أمنياً (WHERE)</th>
                <th className="p-4">حالة الحساب</th>
                <th className="p-4">آخر تسجيل دخول</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredUsers.map((user) => {
                const userRole = roles.find(r => r.id === user.roleId);
                const assignedBranchesList = branches.filter(b => user.assignedBranchIds.includes(b.id));

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* User Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt=""
                          className="w-10 h-10 rounded-2xl object-cover ring-2 ring-[#361D13]/20 shadow-xs"
                        />
                        <div>
                          <p className="font-black text-slate-900 text-sm">{user.fullName}</p>
                          <p className="text-[11px] text-slate-500 font-mono" dir="ltr">{user.email}</p>
                          {user.title && <span className="text-[10px] text-[#C87A38] font-bold">{user.title}</span>}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 font-bold border border-emerald-200">
                        <Shield className="w-3.5 h-3.5 text-[#C87A38]" />
                        <span>{userRole?.name || 'غير محدد'}</span>
                      </span>
                    </td>

                    {/* Assigned Branches */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {assignedBranchesList.map(b => (
                          <span
                            key={b.id}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                              b.isMain
                                ? 'bg-[#C87A38] text-white border-[#C87A38]'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {b.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <button
                        onClick={() => canEdit && toggleUserStatus(user.id)}
                        disabled={!canEdit}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] transition-all ${
                          user.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {user.status === 'active' ? (
                          <><UserCheck className="w-3.5 h-3.5 text-emerald-600" /> نشط (Active)</>
                        ) : (
                          <><UserX className="w-3.5 h-3.5 text-rose-600" /> معطل (Inactive)</>
                        )}
                      </button>
                    </td>

                    {/* Last Login */}
                    <td className="p-4 text-slate-500 font-mono text-[11px]">
                      {user.lastLogin}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      {canEdit && (
                        <button
                          onClick={() => {
                            setUserToEdit(user);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#361D13] hover:text-white text-slate-700 font-bold transition-all"
                        >
                          تعديل الصلاحيات
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        userToEdit={userToEdit}
        roles={roles}
        branches={branches}
        onSave={handleSaveUser}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
};
