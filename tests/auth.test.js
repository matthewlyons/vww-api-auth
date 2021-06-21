const db = require('./db');

const supertest = require('supertest');
const app = require('../index');

const request = supertest(app);

let token;

beforeAll(async () => await db.connect());

afterAll(async () => await db.closeDatabase());

describe('Fail To Login To Admin User', () => {
  it('No Username', async () => {
    request
      .post('/auth/login')
      .type('form')
      .send({ foo: 'bar' })
      .set('Accept', /application\/json/)
      .then(async (response) => {
        expect(response.status).toBe(404);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body.errors[0].message).toBe(
          'Missing Username or Password'
        );
      });
  });
  it('No Password', async () => {
    request
      .post('/auth/login')
      .type('form')
      .send({ username: 'Admin' })
      .set('Accept', /application\/json/)
      .then(async (response) => {
        expect(response.status).toBe(404);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body.errors[0].message).toBe(
          'Missing Username or Password'
        );
      });
  });
  it('Wrong Password', async () => {
    request
      .post('/auth/login')
      .type('form')
      .send({ username: 'Admin', password: 'Wrong' })
      .set('Accept', /application\/json/)
      .then(async (response) => {
        expect(response.status).toBe(401);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body.errors[0].message).toBe(
          'Username or Password Incorrect'
        );
      });
  });
});

describe('User', () => {
  it('Get Users', async () => {
    request.get('/user').then((response) => {
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
