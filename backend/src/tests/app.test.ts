import request from 'supertest';
import { createApp } from '../app';

describe('GET /', () => {
  it('responds with welcome message', async () => {
    const app = createApp();
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Welcome to LTI API');
  });
});

describe('CORS', () => {
  it('responds to preflight for API routes with allow-origin', async () => {
    const app = createApp();
    const response = await request(app)
      .options('/api/candidates')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'authorization, content-type');
    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });
});
