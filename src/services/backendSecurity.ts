import { User, Role, CompanyConfig, ModuleId, PermissionActions, ApiSecurityTestResult } from '../types/erp';

export class BackendSecurityService {

  /**
   * Filter modules based on Company Business Configuration (Type & Model)
   */
  static isModuleSupportedByCompany(company: CompanyConfig, module: ModuleId): boolean {
    const { businessModel } = company;

    // Ready-Made only business -> Disable custom manufacturing modules
    if (businessModel === 'ready_made') {
      if (module === 'custom_projects' || module === 'materials' || module === 'production' || module === 'installation') {
        return false;
      }
    }

    // Custom-Made only business -> Disable ready sales catalog if strictly custom
    if (businessModel === 'custom_made') {
      if (module === 'sales') {
        return false;
      }
    }

    return true;
  }

  /**
   * Enforce Role Permissions & Company Business Scoping
   */
  static checkModulePermission(
    user: User,
    role: Role,
    module: ModuleId,
    action: keyof PermissionActions
  ): { isAllowed: boolean; reason: string } {
    if (user.status !== 'active') {
      return {
        isAllowed: false,
        reason: 'حساب المستخدم معطل آمنياً بالنظام (Inactive Account).'
      };
    }

    // Super Admin bypass
    if (role.isSystem && role.id === 'role-superadmin') {
      return { isAllowed: true, reason: 'صلاحيات المدير الفائق (Super Admin).' };
    }

    const modulePerms = role.permissions[module];
    if (!modulePerms) {
      return {
        isAllowed: false,
        reason: `وحدة (${module}) غير معروفة بمصفوفة أمان الدور.`
      };
    }

    if (!modulePerms[action]) {
      return {
        isAllowed: false,
        reason: `الدور الحالي (${role.name}) لا يملك إذن (${action}) على وحدة (${module}).`
      };
    }

    return { isAllowed: true, reason: 'تم السماح بالوصول بناءً على مصفوفة الصلاحيات المعتمدة.' };
  }

  /**
   * Enforce Branch Isolation Scoping
   */
  static checkBranchAccess(user: User, targetBranchId: string): { isAllowed: boolean; reason: string } {
    if (user.status !== 'active') {
      return { isAllowed: false, reason: 'حساب المستخدم معطل بالنظام.' };
    }

    if (user.assignedBranchIds.includes(targetBranchId)) {
      return { isAllowed: true, reason: 'المستخدم مصرح له بالوصول لهذا الفرع.' };
    }

    return {
      isAllowed: false,
      reason: `عفواً، لا يملك الحساب صلاحية النفاذ لبيانات المقر المطلوبة (${targetBranchId}). Access Denied.`
    };
  }

  /**
   * Simulate API Call with strict security checks
   */
  static simulateApiCall(
    user: User,
    role: Role,
    endpoint: string,
    method: string,
    module: ModuleId,
    action: keyof PermissionActions,
    targetBranchId?: string
  ): ApiSecurityTestResult {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // 1. Check Module Role Permission
    const permCheck = this.checkModulePermission(user, role, module, action);
    if (!permCheck.isAllowed) {
      return {
        endpoint,
        method,
        module,
        requiredAction: action,
        targetBranchId,
        timestamp,
        isAllowed: false,
        reason: permCheck.reason,
        reasonEn: 'Role permissions check failed.',
        statusCode: 403
      };
    }

    // 2. Check Branch Isolation if branch parameter provided
    if (targetBranchId) {
      const branchCheck = this.checkBranchAccess(user, targetBranchId);
      if (!branchCheck.isAllowed) {
        return {
          endpoint,
          method,
          module,
          requiredAction: action,
          targetBranchId,
          timestamp,
          isAllowed: false,
          reason: branchCheck.reason,
          reasonEn: 'Branch scope check failed.',
          statusCode: 403
        };
      }
    }

    return {
      endpoint,
      method,
      module,
      requiredAction: action,
      targetBranchId,
      timestamp,
      isAllowed: true,
      reason: 'تم التحقق من الصلاحية ومطابقة نطاق الأمان بنجاح (200 OK).',
      reasonEn: 'Security checks passed.',
      statusCode: 200
    };
  }
}
