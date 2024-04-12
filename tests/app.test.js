const request = require('supertest');
const app = require('../src/app');

it('Must run server on port 3001', () => {
  return request(app).get('/')
    .then((res) => expect(res).toHaveProperty('status', 200));
});
