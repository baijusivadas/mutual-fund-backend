'use strict';

const crypto = require('crypto');
const db = require('../models');
const { Op } = db.Sequelize;

class AuditService {
  /**
   * Record a new audit log entry
   */
  static async log({
    tenantId = null,
    performedBy = null,
    targetUserId = null,
    action,
    entityType = null,
    entityId = null,
    oldValue = null,
    newValue = null,
    ipAddress = null,
    userAgent = null,
    status = 'success',
  }) {
    try {
      if (!action) return null;

      const entry = await db.audit_logs.create({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        performed_by: performedBy,
        target_user_id: targetUserId,
        action,
        entity_type: entityType,
        entity_id: entityId ? String(entityId) : null,
        old_value: typeof oldValue === 'object' ? JSON.stringify(oldValue) : oldValue,
        new_value: typeof newValue === 'object' ? JSON.stringify(newValue) : newValue,
        ip_address: ipAddress,
        user_agent: userAgent,
        status,
        created_at: new Date(),
      });

      return entry;
    } catch (err) {
      // Non-blocking for primary application flows
      console.warn('Audit logging failed:', err.message);
      return null;
    }
  }

  /**
   * Retrieve audit logs with tenant scoping and filtering
   */
  static async getAuditLogs(
    {
      tenantId = null,
      entityType = null,
      action = null,
      performedBy = null,
      startDate = null,
      endDate = null,
      page = 1,
      limit = 50,
    },
    requestingUser
  ) {
    const numPage = Math.max(1, parseInt(page, 10) || 1);
    const numLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const offset = (numPage - 1) * numLimit;

    const where = {};

    // Tenant isolation: non-superAdmins can only see their own tenant
    if (requestingUser && requestingUser.role !== 'superAdmin') {
      where.tenant_id = requestingUser.tenantId || 'none';
    } else if (tenantId) {
      where.tenant_id = tenantId;
    }

    if (entityType) {
      where.entity_type = entityType;
    }

    if (action) {
      where.action = { [Op.iLike]: `%${action}%` };
    }

    if (performedBy) {
      where.performed_by = performedBy;
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at[Op.gte] = new Date(startDate);
      if (endDate) where.created_at[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await db.audit_logs.findAndCountAll({
      where,
      limit: numLimit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: db.auth_users,
          as: 'performer',
          attributes: ['id', 'email'],
          required: false,
        },
      ],
    });

    return {
      total: count,
      logs: rows,
      page: numPage,
      limit: numLimit,
      totalPages: Math.ceil(count / numLimit),
    };
  }
}

module.exports = AuditService;

