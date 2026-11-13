'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const AuditService = require('../services/audit.service');

test('AuditService.log creates an audit log entry', async () => {
  const entry = await AuditService.log({
    tenantId: '00000000-0000-4000-8000-000000000001',
    action: 'TEST_AUDIT_ACTION',
    entityType: 'TestEntity',
    entityId: 'test-123',
    newValue: { status: 'tested' },
    ipAddress: '127.0.0.1',
    userAgent: 'NodeTestRunner',
  });

  assert.ok(entry !== null);
  assert.equal(entry.action, 'TEST_AUDIT_ACTION');
  assert.equal(entry.entity_type, 'TestEntity');
  assert.equal(entry.entity_id, 'test-123');
});

test('AuditService.getAuditLogs retrieves entries scoped to tenant', async () => {
  const result = await AuditService.getAuditLogs(
    {
      tenantId: '00000000-0000-4000-8000-000000000001',
      action: 'TEST_AUDIT_ACTION',
      limit: 10,
    },
    { role: 'superAdmin' }
  );

  assert.ok(result.total >= 1);
  assert.ok(Array.isArray(result.logs));
  assert.ok(result.logs.some((log) => log.action === 'TEST_AUDIT_ACTION'));
});

test.after(async () => {
  const db = require('../models');
  await db.sequelize.close();
});

