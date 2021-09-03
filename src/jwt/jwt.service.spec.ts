import { Test } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

const SECRET_KEY = 'secretKey';
const TOKEN = 'token';
const USER_ID = 1;

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => TOKEN),
    verify: jest.fn(() => ({ id: USER_ID })),
  };
});

const mockConfigService = {
  get: jest.fn(() => {
    return { SECRET_KEY: SECRET_KEY };
  }),
};

describe('JwtService', () => {
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('sign', () => {
    it('should return token', () => {
      const result = jwtService.sign(USER_ID);
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({ id: USER_ID }, mockConfigService.get());
      expect(result).toEqual(TOKEN);
    });
  });

  describe('verify', () => {
    it('should return user', () => {
      const result = jwtService.verify(TOKEN);
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(TOKEN, mockConfigService.get());
      expect(result).toEqual({ id: USER_ID });
    });
  });
});
