'use strict';

const OrganizationService = require('../services/organization.service');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');
const {
  createOrganizationSchema,
  updateOrganizationSchema,
  addMemberSchema,
} = require('../validations/organization.validation');

const createOrganization = async (req, res) => {
  const validated = createOrganizationSchema.parse(req.body);
  const organization = await OrganizationService.createOrganization(validated, req.user?.id);
  return sendSuccess(res, organization, 'Organization created successfully', 201);
};

const getOrganizations = async (req, res) => {
  const { page, limit, search, status } = req.query;
  const result = await OrganizationService.getOrganizations(
    { page, limit, search, status },
    req.user
  );
  return sendPaginated(
    res,
    result.organizations,
    { total: result.total, page: result.page, limit: result.limit },
    'Organizations retrieved successfully'
  );
};

const getOrganizationById = async (req, res) => {
  const { id } = req.params;
  const organization = await OrganizationService.getOrganizationById(id, req.user);
  return sendSuccess(res, organization, 'Organization retrieved successfully');
};

const updateOrganization = async (req, res) => {
  const { id } = req.params;
  const validated = updateOrganizationSchema.parse(req.body);
  const organization = await OrganizationService.updateOrganization(id, validated, req.user);
  return sendSuccess(res, organization, 'Organization updated successfully');
};

const addMember = async (req, res) => {
  const { id } = req.params;
  const validated = addMemberSchema.parse(req.body);
  const member = await OrganizationService.addMember(id, validated, req.user);
  return sendSuccess(res, member, 'Member added to organization successfully', 201);
};

const getMembers = async (req, res) => {
  const { id } = req.params;
  const members = await OrganizationService.getMembers(id, req.user);
  return sendSuccess(res, members, 'Organization members retrieved successfully');
};

const removeMember = async (req, res) => {
  const { id, userId } = req.params;
  const result = await OrganizationService.removeMember(id, userId, req.user);
  return sendSuccess(res, result, 'Member removed successfully');
};

module.exports = {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  addMember,
  getMembers,
  removeMember,
};

