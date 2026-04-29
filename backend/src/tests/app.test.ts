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
