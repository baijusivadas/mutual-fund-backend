'use strict';

/**
 * Granular Permission Matrix for Mutual Fund & Wealth Management Platform
 */
const PERMISSIONS = {
  // Organization / Tenant Management
  ORG_READ: 'org:read',
  ORG_CREATE: 'org:create',
  ORG_UPDATE: 'org:update',
  ORG_DELETE: 'org:delete',
  ORG_MANAGE_MEMBERS: 'org:manage_members',

  // User & Identity Management
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Investor / Client Management
  INVESTOR_READ: 'investor:read',
  INVESTOR_CREATE: 'investor:create',
  INVESTOR_UPDATE: 'investor:update',
  INVESTOR_DELETE: 'investor:delete',

  // Transactions & Financial Data
  TRANSACTION_READ: 'transaction:read',
  TRANSACTION_UPLOAD: 'transaction:upload',
  TRANSACTION_DELETE: 'transaction:delete',

  // Analytics & Reports
  REPORTS_READ: 'reports:read',
  REPORTS_EXPORT: 'reports:export',

  // Financial Calculations & Tools
  FINANCIAL_CALCULATE: 'financial:calculate',

  // Audit Logs & Compliance
  AUDIT_READ: 'audit:read',
  COMPLIANCE_MANAGE: 'compliance:manage',

  // System Settings
  SYSTEM_SETTINGS: 'system:settings',
};

/**
 * Role Definitions & Permission Mappings
 */
const ROLE_PERMISSIONS = {
  superAdmin: Object.values(PERMISSIONS),

  orgAdmin: [
    PERMISSIONS.ORG_READ,
    PERMISSIONS.ORG_UPDATE,
    PERMISSIONS.ORG_MANAGE_MEMBERS,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.INVESTOR_READ,
    PERMISSIONS.INVESTOR_CREATE,
    PERMISSIONS.INVESTOR_UPDATE,
    PERMISSIONS.INVESTOR_DELETE,
    PERMISSIONS.TRANSACTION_READ,
    PERMISSIONS.TRANSACTION_UPLOAD,
    PERMISSIONS.TRANSACTION_DELETE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.FINANCIAL_CALCULATE,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.COMPLIANCE_MANAGE,
  ],

  advisor: [
    PERMISSIONS.ORG_READ,
    PERMISSIONS.USER_READ,
    PERMISSIONS.INVESTOR_READ,
    PERMISSIONS.INVESTOR_CREATE,
    PERMISSIONS.INVESTOR_UPDATE,
    PERMISSIONS.TRANSACTION_READ,
    PERMISSIONS.TRANSACTION_UPLOAD,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.FINANCIAL_CALCULATE,
  ],

  auditor: [
    PERMISSIONS.ORG_READ,
    PERMISSIONS.USER_READ,
    PERMISSIONS.INVESTOR_READ,
    PERMISSIONS.TRANSACTION_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.FINANCIAL_CALCULATE,
  ],

  user: [
    PERMISSIONS.INVESTOR_READ,
    PERMISSIONS.TRANSACTION_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.FINANCIAL_CALCULATE,
  ],
};

/**
 * Check if a given role has a specific permission
 * @param {string} role
 * @param {string} permission
 * @returns {boolean}
 */
const hasPermission = (role, permission) => {
  if (!role) return false;
  if (role === 'superAdmin') return true;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
};

