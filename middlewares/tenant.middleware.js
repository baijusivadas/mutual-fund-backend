'use strict';

const db = require('../models');

/**
 * Multi-Tenant Context Resolution Middleware
 * Resolves the active tenant/organization and guarantees tenant isolation.
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    const headerTenantId = req.headers['x-tenant-id'] || req.headers['x-organization-id'];
    const queryTenantId = req.query.tenantId || req.query.organizationId;
    let targetTenantId = headerTenantId || queryTenantId || (req.user ? req.user.tenantId : null);

    // If no tenant specified and user is logged in, find user's primary organization
    if (!targetTenantId && req.user && req.user.id) {
      const userRecord = await db.auth_users.findByPk(req.user.id);
      if (userRecord && userRecord.tenant_id) {
        targetTenantId = userRecord.tenant_id;
      } else {
        const member = await db.OrganizationMember.findOne({
          where: { user_id: req.user.id, status: 'active' },
        });
        if (member) targetTenantId = member.organization_id;
      }
    }

    // Default fallback organization if still not resolved
    if (!targetTenantId) {
      const defaultOrg = await db.Organization.findOne({ where: { status: 'active' } });
      if (defaultOrg) targetTenantId = defaultOrg.id;
    }

    if (!targetTenantId) {
      return res.status(400).json({
        success: false,
        status: 'error',
        statusCode: 400,
        errorCode: 'TENANT_REQUIRED',
        message: 'Tenant or Organization context is required',
      });
    }

    const organization = await db.Organization.findByPk(targetTenantId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        status: 'error',
        statusCode: 404,
        errorCode: 'TENANT_NOT_FOUND',
        message: 'Requested Organization or Tenant does not exist',
      });
    }

    if (organization.status !== 'active') {
      return res.status(403).json({
        success: false,
        status: 'error',
        statusCode: 403,
        errorCode: 'TENANT_SUSPENDED',
        message: 'This organization is currently inactive or suspended',
      });
    }

    // If authenticated user is not superAdmin, verify tenant membership
    if (req.user && req.user.role !== 'superAdmin') {
      const isDirectTenant = req.user.tenantId === organization.id;
      if (!isDirectTenant) {
        const membership = await db.OrganizationMember.findOne({
          where: {
            organization_id: organization.id,
            user_id: req.user.id,
            status: 'active',
          },
        });

        if (!membership) {
          return res.status(403).json({
            success: false,
            status: 'error',
            statusCode: 403,
            errorCode: 'TENANT_ACCESS_DENIED',
            message: 'You do not have access to this organization',
          });
        }
      }
    }

    req.tenant = {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      code: organization.code,
      tier: organization.tier,
      status: organization.status,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to construct a tenant-scoped query where clause.
 * SuperAdmins can view all if explicitly desired, but by default tenant is enforced.
 */
const getTenantWhere = (req, extraWhere = {}) => {
  if (req.user && req.user.role === 'superAdmin' && !req.headers['x-tenant-id'] && !req.query.tenantId) {
    return extraWhere;
  }
  const tenantId = req.tenant ? req.tenant.id : req.user ? req.user.tenantId : null;
  if (!tenantId) return extraWhere;
  return { ...extraWhere, tenant_id: tenantId };
};

module.exports = {
  tenantMiddleware,
  getTenantWhere,
};

