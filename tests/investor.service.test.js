const assert = require('node:assert/strict');
const test = require('node:test');
const { Investor } = require('../models');
const investorService = require('../services/investor.service');

test('investor lookup is scoped to the authenticated owner', async () => {
  const originalFindOne = Investor.findOne;
  let queryOptions;
  Investor.findOne = async (options) => {
    queryOptions = options;
    return { id: 'investor-1' };
  };

  try {
    await investorService.getInvestorById('investor-1', 'user-1');
    assert.deepEqual(queryOptions.where, { id: 'investor-1', user_id: 'user-1' });
  } finally {
    Investor.findOne = originalFindOne;
  }
});

test('investor lookup returns not found for records outside the owner scope', async () => {
  const originalFindOne = Investor.findOne;
  Investor.findOne = async () => null;

  try {
    await assert.rejects(investorService.getInvestorById('investor-2', 'user-1'), {
      message: 'Investor not found',
      status: 404,
    });
  } finally {
    Investor.findOne = originalFindOne;
  }
});
