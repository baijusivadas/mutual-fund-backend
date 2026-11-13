'use strict';

const crypto = require('crypto');
const db = require('../models');
const { Op } = db.Sequelize;
const {
  AppError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} = require('../utils/errors');
const auditService = require('./audit.service');

class OrganizationService {
  /**
   * Create a new organization/tenant
   */
  static async createOrganization(data, creatorId) {
    const existingSlug = await db.Organization.findOne({ where: { slug: data.slug } });
    if (existingSlug) {
      throw new ConflictError(`Organization slug '${data.slug}' is already taken`);
    }

    const existingCode = await db.Organization.findOne({ where: { code: data.code } });
    if (existingCode) {
      throw new ConflictError(`Organization code '${data.code}' is already taken`);
    }

    const orgId = crypto.randomUUID();
    const settingsStr = typeof data.settings === 'object' ? JSON.stringify(data.settings) : data.settings || '{}';

    const organization = await db.sequelize.transaction(async (t) => {
      const org = await db.Organization.create(
        {
          id: orgId,
          name: data.name,
          slug: data.slug,
          code: data.code,
          tier: data.tier || 'starter',
          status: 'active',
          contact_email: data.contact_email || null,
          contact_phone: data.contact_phone || null,
          address: data.address || null,
          max_users: data.max_users || 50,
          settings: settingsStr,
        },
        { transaction: t }
      );

      // Add creator as owner if creatorId exists
      if (creatorId) {
        await db.OrganizationMember.create(
          {
            id: crypto.randomUUID(),
            organization_id: org.id,
            user_id: creatorId,
            role: 'owner',
            status: 'active',
            joined_at: new Date(),
          },
          { transaction: t }
        );
      }

      return org;
    });

    await auditService.log({
      tenantId: organization.id,
      performedBy: creatorId,
      action: 'ORGANIZATION_CREATED',
      entityType: 'Organization',
      entityId: organization.id,
      newValue: JSON.stringify({ name: organization.name, code: organization.code }),
    }).catch(() => {});

    return organization;
  }

  /**
   * Get paginated organizations
   */
  static async getOrganizations({ page = 1, limit = 20, search = '', status = '' }, requestingUser) {
    const offset = (Math.max(1, page) - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { slug: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) {
      where.status = status;
    }

    // If user is not superAdmin, restrict to organizations they are member of
    if (requestingUser && requestingUser.role !== 'superAdmin') {
      const memberships = await db.OrganizationMember.findAll({
        where: { user_id: requestingUser.id, status: 'active' },
        attributes: ['organization_id'],
      });
      const allowedOrgIds = memberships.map((m) => m.organization_id);
      where.id = { [Op.in]: allowedOrgIds };
    }

    const { count, rows } = await db.Organization.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return {
      total: count,
      organizations: rows,
      page: Number(page),
      limit: Number(limit),
    };
  }

  /**
   * Get organization by ID with membership validation
   */
  static async getOrganizationById(id, requestingUser) {
    const org = await db.Organization.findByPk(id, {
      include: [
        {
          model: db.OrganizationMember,
          as: 'members',
          attributes: ['id', 'user_id', 'role', 'status', 'joined_at'],
        },
      ],
    });

    if (!org) {
      throw new NotFoundError('Organization');
    }

    if (requestingUser && requestingUser.role !== 'superAdmin') {
      const isMember = org.members.some(
        (m) => m.user_id === requestingUser.id && m.status === 'active'
      );
      if (!isMember) {
        throw new ForbiddenError('You are not authorized to view this organization');
      }
    }

    return org;
  }

  /**
   * Update organization
   */
  static async updateOrganization(id, data, requestingUser) {
    const org = await this.getOrganizationById(id, requestingUser);

    if (requestingUser && requestingUser.role !== 'superAdmin') {
      const member = org.members.find((m) => m.user_id === requestingUser.id);
      if (!member || !['owner', 'admin'].includes(member.role)) {
        throw new ForbiddenError('Only organization owners and admins can update settings');
      }
    }

    const oldValue = JSON.stringify(org.toJSON());

    const updateFields = { ...data };
    if (typeof data.settings === 'object') {
      updateFields.settings = JSON.stringify(data.settings);
    }

    await org.update(updateFields);

    await auditService.log({
      tenantId: org.id,
      performedBy: requestingUser ? requestingUser.id : null,
      action: 'ORGANIZATION_UPDATED',
      entityType: 'Organization',
      entityId: org.id,
      oldValue,
      newValue: JSON.stringify(org.toJSON()),
    }).catch(() => {});

    return org;
  }

  /**
   * Add a member to organization
   */
  static async addMember(orgId, { email, role = 'client' }, requestingUser) {
    const org = await this.getOrganizationById(orgId, requestingUser);

    const user = await db.auth_users.findOne({
      where: { email: { [Op.iLike]: email.trim() } },
    });
    if (!user) {
      throw new NotFoundError(`User with email '${email}'`);
    }

    const existingMember = await db.OrganizationMember.findOne({
      where: { organization_id: orgId, user_id: user.id },
    });

    if (existingMember) {
      if (existingMember.status === 'active') {
        throw new ConflictError('User is already an active member of this organization');
      }
      await existingMember.update({ status: 'active', role });
      return existingMember;
    }

    // Check organization user capacity
    const currentMemberCount = await db.OrganizationMember.count({
      where: { organization_id: orgId, status: 'active' },
    });
    if (currentMemberCount >= org.max_users) {
      throw new ValidationError(`Organization user limit of ${org.max_users} members has been reached`);
    }

    const member = await db.OrganizationMember.create({
      id: crypto.randomUUID(),
      organization_id: orgId,
      user_id: user.id,
      role,
      status: 'active',
      joined_at: new Date(),
    });

    // Update user's default tenant if they don't have one
    if (!user.tenant_id) {
      await user.update({ tenant_id: orgId });
    }

    await auditService.log({
      tenantId: orgId,
      performedBy: requestingUser ? requestingUser.id : null,
      action: 'MEMBER_ADDED',
      entityType: 'OrganizationMember',
      entityId: member.id,
      newValue: JSON.stringify({ email, role, userId: user.id }),
    }).catch(() => {});

    return member;
  }

  /**
   * Get members of an organization
   */
  static async getMembers(orgId, requestingUser) {
    await this.getOrganizationById(orgId, requestingUser);

    const members = await db.OrganizationMember.findAll({
      where: { organization_id: orgId },
      include: [
        {
          model: db.auth_users,
          as: 'user',
          attributes: ['id', 'email', 'created_at', 'last_login_at'],
        },
      ],
      order: [['joined_at', 'ASC']],
    });

    return members;
  }

  /**
   * Remove member from organization
   */
  static async removeMember(orgId, memberUserId, requestingUser) {
    const org = await this.getOrganizationById(orgId, requestingUser);

    if (requestingUser && requestingUser.role !== 'superAdmin') {
      const adminMember = org.members.find((m) => m.user_id === requestingUser.id);
      if (!adminMember || !['owner', 'admin'].includes(adminMember.role)) {
        throw new ForbiddenError('Only organization owners and admins can remove members');
      }
    }

    const targetMembership = await db.OrganizationMember.findOne({
      where: { organization_id: orgId, user_id: memberUserId },
    });

    if (!targetMembership) {
      throw new NotFoundError('Organization member');
    }

    // Prevent removing the last owner
    if (targetMembership.role === 'owner') {
      const ownerCount = await db.OrganizationMember.count({
        where: { organization_id: orgId, role: 'owner', status: 'active' },
      });
      if (ownerCount <= 1) {
        throw new ValidationError('Cannot remove the sole organization owner');
      }
    }

    await targetMembership.destroy();

    await auditService.log({
      tenantId: orgId,
      performedBy: requestingUser ? requestingUser.id : null,
      action: 'MEMBER_REMOVED',
      entityType: 'OrganizationMember',
      entityId: memberUserId,
    }).catch(() => {});

    return { message: 'Member removed from organization successfully' };
  }
}

module.exports = OrganizationService;

