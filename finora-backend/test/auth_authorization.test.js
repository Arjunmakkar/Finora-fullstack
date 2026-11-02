const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
});

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  let body = null;
  const text = await res.text();
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, headers: res.headers, body };
}

describe('FINORA Security & Authorization Rules', () => {
  let userACookie;
  let userBCookie;
  let userBTransactionId;
  let userBBudgetId;
  let userBInvestmentId;

  test('1. Default-Deny: Unauthenticated request to /api/transactions yields 401', async () => {
    const res = await request('/api/transactions');
    assert.strictEqual(res.status, 401);
  });

  test('2. User A and User B registration sets httpOnly session cookie', async () => {
    const emailA = `test-user-a-${Date.now()}@finora.test`;
    const resA = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'User A', email: emailA, password: 'password123' }),
    });
    assert.strictEqual(resA.status, 201);
    const cookieHeaderA = resA.headers.get('set-cookie');
    assert.ok(cookieHeaderA, 'Set-Cookie header must be present');
    assert.ok(cookieHeaderA.includes('finora_session'), 'Cookie must be finora_session');
    assert.ok(cookieHeaderA.toLowerCase().includes('httponly'), 'Cookie must be httpOnly');
    userACookie = cookieHeaderA.split(';')[0];

    const emailB = `test-user-b-${Date.now()}@finora.test`;
    const resB = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'User B', email: emailB, password: 'password123' }),
    });
    assert.strictEqual(resB.status, 201);
    userBCookie = resB.headers.get('set-cookie').split(';')[0];
  });

  test('3. User B creates financial records (transaction, budget, investment)', async () => {
    const txRes = await request('/api/transactions', {
      method: 'POST',
      headers: { Cookie: userBCookie },
      body: JSON.stringify({
        type: 'EXPENSE',
        amount: 250.5,
        category: 'Food',
        description: 'User B Lunch',
        date: '2026-10-25',
      }),
    });
    assert.strictEqual(txRes.status, 201);
    assert.strictEqual(txRes.body.transaction.amount, 25050); // integer paise
    userBTransactionId = txRes.body.transaction.id;

    const bgtRes = await request('/api/budgets', {
      method: 'POST',
      headers: { Cookie: userBCookie },
      body: JSON.stringify({
        category: 'Food',
        limitAmount: 5000,
        month: '2026-10',
      }),
    });
    assert.strictEqual(bgtRes.status, 201);
    assert.strictEqual(bgtRes.body.budget.limitAmount, 500000); // integer paise
    userBBudgetId = bgtRes.body.budget.id;

    const invRes = await request('/api/investments', {
      method: 'POST',
      headers: { Cookie: userBCookie },
      body: JSON.stringify({
        assetName: 'Index Fund',
        assetType: 'MUTUAL_FUND',
        quantity: 10,
        purchasePrice: 100,
        currentPrice: 120,
        purchaseDate: '2026-10-20',
      }),
    });
    assert.strictEqual(invRes.status, 201);
    userBInvestmentId = invRes.body.investment.id;
  });

  test('4. Authorization rule: User A gets 404 (not 403 or 200) when accessing User B transaction', async () => {
    // Read
    const getRes = await request(`/api/transactions/${userBTransactionId}`, {
      headers: { Cookie: userACookie },
    });
    assert.strictEqual(getRes.status, 404, 'Must return 404 to avoid leaking existence');

    // Update
    const patchRes = await request(`/api/transactions/${userBTransactionId}`, {
      method: 'PATCH',
      headers: { Cookie: userACookie },
      body: JSON.stringify({ description: 'Hacked description' }),
    });
    assert.strictEqual(patchRes.status, 404);

    // Delete
    const delRes = await request(`/api/transactions/${userBTransactionId}`, {
      method: 'DELETE',
      headers: { Cookie: userACookie },
    });
    assert.strictEqual(delRes.status, 404);
  });

  test('5. Authorization rule: User A gets 404 when accessing User B budget or investment', async () => {
    const patchBudget = await request(`/api/budgets/${userBBudgetId}`, {
      method: 'PATCH',
      headers: { Cookie: userACookie },
      body: JSON.stringify({ limitAmount: 9999 }),
    });
    assert.strictEqual(patchBudget.status, 404);

    const patchInv = await request(`/api/investments/${userBInvestmentId}`, {
      method: 'PATCH',
      headers: { Cookie: userACookie },
      body: JSON.stringify({ assetName: 'Tampered' }),
    });
    assert.strictEqual(patchInv.status, 404);
  });

  test('6. Money validation rejects negative, non-integer paise, and oversized amounts', async () => {
    const negRes = await request('/api/transactions', {
      method: 'POST',
      headers: { Cookie: userBCookie },
      body: JSON.stringify({
        type: 'EXPENSE',
        amount: -50,
        category: 'Food',
        description: 'Negative',
        date: '2026-10-25',
      }),
    });
    assert.strictEqual(negRes.status, 400);

    const fractionalPaise = await request('/api/transactions', {
      method: 'POST',
      headers: { Cookie: userBCookie },
      body: JSON.stringify({
        type: 'EXPENSE',
        amount: 10.999, // fractional paise
        category: 'Food',
        description: 'Fractional',
        date: '2026-10-25',
      }),
    });
    assert.strictEqual(fractionalPaise.status, 400);

    const excessive = await request('/api/transactions', {
      method: 'POST',
      headers: { Cookie: userBCookie },
      body: JSON.stringify({
        type: 'EXPENSE',
        amount: 999_999_999_999,
        category: 'Food',
        description: 'Excessive',
        date: '2026-10-25',
      }),
    });
    assert.strictEqual(excessive.status, 400);
  });

  test('7. Logout clears session cookie', async () => {
    const logoutRes = await request('/api/auth/logout', {
      method: 'POST',
      headers: { Cookie: userACookie },
    });
    assert.strictEqual(logoutRes.status, 200);
    const clearCookie = logoutRes.headers.get('set-cookie');
    assert.ok(clearCookie.includes('finora_session=;'));
  });

  test('8. Full account deletion cascades and deletes all records', async () => {
    const delRes = await request('/api/auth/me', {
      method: 'DELETE',
      headers: { Cookie: userBCookie },
    });
    assert.strictEqual(delRes.status, 204);

    // Verify User B's transaction was deleted
    const txCount = await prisma.transaction.count({ where: { id: userBTransactionId } });
    assert.strictEqual(txCount, 0);
  });
});
