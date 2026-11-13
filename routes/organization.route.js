'use strict';

const express = require('express');
const {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  addMember,
  getMembers,
  removeMember,
} = require('../controllers/organization.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const { PERMISSIONS } = require('../config/permissions');

const router = express.Router();

router.use(authenticate);

// Organization management
router.post(
  '/organizations',
  authorize(['superAdmin']),
  createOrganization
);

router.get(
  '/organizations',
  authorize(['superAdmin', 'orgAdmin', 'advisor', 'auditor']),
  getOrganizations
);

router.get(
  '/organizations/:id',
  authorize(['superAdmin', 'orgAdmin', 'advisor', 'auditor']),
  getOrganizationById
);

router.put(
  '/organizations/:id',
  authorize(['superAdmin', 'orgAdmin']),
  updateOrganization
);

// Member management
router.post(
  '/organizations/:id/members',
  authorize(['superAdmin', 'orgAdmin']),
  addMember
);

router.get(
  '/organizations/:id/members',
  authorize(['superAdmin', 'orgAdmin', 'advisor', 'auditor']),
  getMembers
);

router.delete(
  '/organizations/:id/members/:userId',
  authorize(['superAdmin', 'orgAdmin']),
  removeMember
);

module.exports = router;

