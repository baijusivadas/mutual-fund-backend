'use strict';

const AuditService = require('../services/audit.service');
const { sendPaginated } = require('../utils/responseHelper');

const getAuditLogs = async (req, res) => {
  const { tenantId, entityType, action, performedBy, startDate, endDate, page, limit } = req.query;

  const result = await AuditService.getAuditLogs(
    { tenantId, entityType, action, performedBy, startDate, endDate, page, limit },
    req.user
  );

  return sendPaginated(
    res,
    result.logs,
    { total: result.total, page: result.page, limit: result.limit },
    'Audit logs retrieved successfully'
  );
};

module.exports = {
  getAuditLogs,
};

