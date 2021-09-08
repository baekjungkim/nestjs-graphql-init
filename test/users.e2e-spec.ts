import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';

const GRAPHQL_ENDPOINT = '/graphql';
const testEmail = 'test@test.com';
const testPassword = '1234';
const testNickname = 'test';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) => baseTest().set('X-JWT', jwtToken).send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createUser', () => {
    it('should create user', () => {
      return publicTest(`
        mutation {
          createUser(input:{
            email: "${testEmail}",
            password: "${testPassword}",
            nickname: "${testNickname}",
            role: Master
          }) {
            ok
            error
          }
        }
      `)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { createUser },
            },
          } = res;

          expect(createUser.ok).toBe(true);
          expect(createUser.error).toBe(null);
        });
    });

    it('should fail if user exists', () => {
      return publicTest(`
        mutation {
          createUser(input:{
            email: "${testEmail}",
            password: "${testPassword}",
            nickname: "${testNickname}",
            role: Master
          }) {
            ok
            error
          }
        }
      `)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { createUser },
            },
          } = res;

          expect(createUser.ok).toBe(false);
          expect(createUser.error).toEqual(expect.any(String));
        });
    });
  });

  describe('checkNickname', () => {
    it('should fail if nickname exists', () => {
      return publicTest(`
        {
          checkNickname(input:{
            nickname: "${testNickname}"
          }) {
            ok
            error
          }
        }
      `)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { checkNickname },
            },
          } = res;

          expect(checkNickname.ok).toBe(false);
          expect(checkNickname.error).toEqual(expect.any(String));
        });
    });

    it('should return true', () => {
      return publicTest(`
        {
          checkNickname(input:{
            nickname: "${testNickname}2"
          }) {
            ok
            error
          }
        }
      `)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { checkNickname },
            },
          } = res;

          expect(checkNickname.ok).toBe(true);
          expect(checkNickname.error).toBe(null);
        });
    });
  });

  describe('getUsers', () => {
    it('should return users', () => {
      return publicTest(`
        {
          getUsers{
            ok
            error
            users {
              id
              email
            }
          }
        }
      `)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { getUsers },
            },
          } = res;

          expect(getUsers.ok).toBe(true);
          expect(getUsers.error).toBe(null);
          expect(getUsers.users).toEqual(expect.any(Array));
          expect(getUsers.users[0].id).toBe(1);
          expect(getUsers.users[0].email).toBe(testEmail);
        });
    });
  });

  describe('login', () => {
    it('should fail if user not exists', () => {
      return publicTest(`
        mutation {
          login(input:{
            email: "${testEmail}2",
            password: "${testPassword}"
          }) {
            ok
            error
            token
          }
        }
      `)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { login },
            },
          } = res;

          expect(login.ok).toBe(false);
          expect(login.error).toEqual(expect.any(String));
          expect(login.token).toBe(null);
        });
    });

    it('should fail if password is wrong', () => {
      return publicTest(`
        mutation {
          login(input:{
            email: "${testEmail}",
            password: "${testPassword}2"
          }) {
            ok
            error
            token
          }
        }
    `)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { login },
            },
          } = res;

          expect(login.ok).toBe(false);
          expect(login.error).toEqual(expect.any(String));
          expect(login.token).toBe(null);
        });
    });

    it('should return token', () => {
      return publicTest(`
        mutation {
          login(input:{
            email: "${testEmail}",
            password: "${testPassword}"
          }) {
            ok
            error
            token
          }
        }
    `)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { login },
            },
          } = res;

          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
        });
    });
  });

  describe('me', () => {
    it.todo('should return my data');
  });

  describe('seeProfile', () => {
    it.todo('should fail if user note exists');
    it.todo('should return user by id');
  });

  describe('updatePassword', () => {
    it.todo('should update password');
  });

  describe('updateNickname', () => {
    it.todo('should fail if nickname exists');
    it.todo('should update nickname');
  });

  describe('verifyEmail', () => {
    it.todo('should fail if verification not exists');
    it.todo('should verification success');
  });
});
