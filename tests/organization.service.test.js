'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const OrganizationService = require('../services/organization.service');
const { ConflictError, NotFoundError } = require('../utils/errors');

test('OrganizationService rejects duplicate slug with ConflictError', async () => {
  // 'brickwealth' already exists from migration seed
  await assert.rejects(
    OrganizationService.createOrganization({
      name: 'Duplicate BrickWealth',
      slug: 'brickwealth',
      code: 'BW_DUP_01',
    }),
    ConflictError
  );
});

test('OrganizationService rejects duplicate code with ConflictError', async () => {
  // 'BW001' already exists from migration seed
  await assert.rejects(
    OrganizationService.createOrganization({
      name: 'Duplicate BrickWealth Code',
      slug: 'unique-slug-' + Date.now(),
      code: 'BW001',
    }),
    ConflictError
  );
});

test('OrganizationService.getOrganizations returns paginated results', async () => {
  const result = await OrganizationService.getOrganizations(
    { page: 1, limit: 10 },
    { role: 'superAdmin' }
  );

  assert.ok(result.total >= 1);
  assert.ok(Array.isArray(result.organizations));
  assert.equal(result.page, 1);
  assert.equal(result.limit, 10);
});

test('OrganizationService.getOrganizationById throws NotFoundError for nonexistent ID', async () => {
  await assert.rejects(
    OrganizationService.getOrganizationById('00000000-0000-0000-0000-000000000999', {
      role: 'superAdmin',
    }),
    NotFoundError
  );
});

test.after(async () => {
  const db = require('../models');
  await db.sequelize.close();
});

