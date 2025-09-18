const request = require('supertest');
const app = require('../index');

describe('Gateway Endpoints', () => {
  let server;
  beforeAll(() => {
    server = app.listen(3001);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should get gateway info', async () => {
    const res = await request(server).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  it('should get health status', async () => {
    const res = await request(server).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('healthy');
  });
});
