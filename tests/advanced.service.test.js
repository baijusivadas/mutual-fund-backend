const assert = require('node:assert/strict');
const test = require('node:test');
const db = require('../models');
const advancedService = require('../services/advanced.service');

test('regular users can query their own flat assets', async () => {
  const originalFindAndCountAll = db.flats.findAndCountAll;
  let options;
  db.flats.findAndCountAll = async (queryOptions) => {
    options = queryOptions;
    return { count: 0, rows: [] };
  };

  try {
    await advancedService.getAllItems('flats', 'user-1', 'user');
    assert.deepEqual(options.where, { created_by: 'user-1' });
  } finally {
    db.flats.findAndCountAll = originalFindAndCountAll;
  }
});

test('regular users cannot query globally shared purchase records', async () => {
  await assert.rejects(advancedService.getAllItems('purchases', 'user-1', 'user'), /not allowed/);
});

test('regular users cannot transfer ownership while updating assets', async () => {
  const originalFindOne = db.custom_assets.findOne;
  let queryOptions;
  let updatedData;
  db.custom_assets.findOne = async (options) => {
    queryOptions = options;
    return {
      update: async (data) => {
        updatedData = data;
        return data;
      },
    };
  };

  try {
    await advancedService.updateItem(
      'custom_assets',
      'asset-1',
      { id: 'asset-2', created_by: 'user-2', asset_name: 'Updated' },
      'user-1',
      'user'
    );
    assert.deepEqual(queryOptions.where, { id: 'asset-1', created_by: 'user-1' });
    assert.deepEqual(updatedData, { asset_name: 'Updated' });
  } finally {
    db.custom_assets.findOne = originalFindOne;
  }
});
