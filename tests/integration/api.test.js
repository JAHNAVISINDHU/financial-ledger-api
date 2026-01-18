const request = require('supertest');
const app = require('../../src/app');

describe('Financial Ledger API', () => {
  let account1Id;
  let account2Id;

  describe('Account Management', () => {
    it('should create a new account', async () => {
      const response = await request(app)
        .post('/accounts')
        .send({
          userId: '11111111-2222-3333-4444-555555555555',
          accountType: 'checking',
          currency: 'USD',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.accountType).toBe('checking');

      account1Id = response.body.data.id;
    });

    it('should get account with balance', async () => {
      const response = await request(app)
        .get(`/accounts/${account1Id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('balance');
      expect(response.body.data.balance).toBe('0.00');
    });
  });

  describe('Transactions', () => {
    beforeEach(async () => {
      // Create second account
      const response = await request(app)
        .post('/accounts')
        .send({
          userId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
          accountType: 'savings',
          currency: 'USD',
        });

      account2Id = response.body.data.id;

      // Deposit to first account
      await request(app)
        .post('/deposits')
        .send({
          accountId: account1Id,
          amount: 1000.00,
          currency: 'USD',
          description: 'Initial deposit',
        });
    });

    it('should execute a deposit', async () => {
      const response = await request(app)
        .post('/deposits')
        .send({
          accountId: account1Id,
          amount: 500.00,
          currency: 'USD',
          description: 'Test deposit',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('deposit');
      expect(response.body.data.status).toBe('completed');
    });

    it('should execute a transfer', async () => {
      const response = await request(app)
        .post('/transfers')
        .send({
          sourceAccountId: account1Id,
          destinationAccountId: account2Id,
          amount: 250.50,
          currency: 'USD',
          description: 'Test transfer',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('transfer');
      expect(response.body.data.status).toBe('completed');
    });

    it('should reject transfer with insufficient funds', async () => {
      const response = await request(app)
        .post('/transfers')
        .send({
          sourceAccountId: account1Id,
          destinationAccountId: account2Id,
          amount: 5000.00,
          currency: 'USD',
          description: 'Large transfer',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Insufficient funds');
    });

    it('should execute a withdrawal', async () => {
      const response = await request(app)
        .post('/withdrawals')
        .send({
          accountId: account1Id,
          amount: 100.00,
          currency: 'USD',
          description: 'Test withdrawal',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('withdrawal');
      expect(response.body.data.status).toBe('completed');
    });

    it('should reject withdrawal with insufficient funds', async () => {
      const response = await request(app)
        .post('/withdrawals')
        .send({
          accountId: account1Id,
          amount: 5000.00,
          currency: 'USD',
          description: 'Large withdrawal',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Insufficient funds');
    });
  });

  describe('Ledger Management', () => {
    it('should get ledger entries for an account', async () => {
      const response = await request(app)
        .get(`/accounts/${account1Id}/ledger`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});