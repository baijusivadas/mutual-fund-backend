const assert = require('node:assert/strict');
const test = require('node:test');
const authorize = require('../middlewares/role.middleware');

const createResponse = () => {
  const response = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  return response;
};

test('role middleware requires authentication', () => {
  const response = createResponse();
  authorize([])({ user: undefined }, response, () => assert.fail('unexpected next'));
  assert.equal(response.statusCode, 401);
});

test('role middleware rejects users outside the allowed roles', () => {
  const response = createResponse();
  authorize(['superAdmin'])({ user: { role: 'user' } }, response, () =>
    assert.fail('unexpected next')
  );
  assert.equal(response.statusCode, 403);
});

test('role middleware permits superadmins for admin routes', () => {
  let nextCalled = false;
  authorize(['superAdmin'])({ user: { role: 'superAdmin' } }, createResponse(), () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);
});
