import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EM } from '../common/error-message';
import { JwtService } from '../jwt/jwt.service';
import { User, UserRole } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<User>, jest.Mock>>;

const mockUsersRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
});

const TOKEN = 'token';

const mockJwtService = {
  sign: jest.fn(() => TOKEN),
};

describe('UserService', () => {
  let usersService: UsersService;
  let jwtService: JwtService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockUsersRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return users', async () => {
      const users = [{ id: 1 }];
      usersRepository.find.mockResolvedValue(users);
      const result = await usersService.getUsers();
      expect(usersRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true, users });
    });
    it('should fail on exception', async () => {
      usersRepository.find.mockRejectedValue(new Error());
      const result = await usersService.getUsers();
      expect(result).toEqual({ ok: false, error: EM.INTERNAL_SERVER_ERROR });
    });
  });

  describe('createUser', () => {
    const createData = {
      email: 'test@test.com',
      password: 'test',
      nickname: 'test',
      role: UserRole.Master,
    };

    it('should fail on user exists', async () => {
      usersRepository.findOne.mockResolvedValue(createData);
      const result = await usersService.createUser(createData);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({ email: createData.email });
      expect(result).toEqual({ ok: false, error: EM.EMAIL_ALREADY });
    });
    it('should create user', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue({ id: 1, ...createData });
      usersRepository.save.mockResolvedValue(true);
      const result = await usersService.createUser(createData);
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createData);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({ id: 1, ...createData });
      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await usersService.createUser(createData);
      expect(result).toEqual({ ok: false, error: EM.INTERNAL_SERVER_ERROR });
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@test.com',
      password: 'test',
    };

    it('should fail on user not exists', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      const result = await usersService.login(loginData);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        { email: loginData.email },
        { select: ['id', 'password'] }
      );
      expect(result).toEqual({ ok: false, error: EM.USER_NOT_FOUND });
    });
    it('should fail on password not equal', async () => {
      const mockedUser = { checkPassword: jest.fn(() => Promise.resolve(false)) };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await usersService.login(loginData);
      expect(result).toEqual({ ok: false, error: EM.PASSWORD_WRONG });
    });
    it('should return token', async () => {
      const mockedUser = { id: 1, checkPassword: jest.fn(() => Promise.resolve(true)) };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await usersService.login(loginData);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toBeCalledWith(mockedUser.id);
      expect(result).toEqual({ ok: true, token: TOKEN });
    });
    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await usersService.login(loginData);
      expect(result).toEqual({ ok: false, error: EM.INTERNAL_SERVER_ERROR });
    });
  });

  describe('checkNickname', () => {
    const nickname = 'test';

    it('should fail on nickname exists', async () => {
      usersRepository.findOne.mockResolvedValue({ nickname });
      const result = await usersService.checkNickname({ nickname });
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({ nickname });
      expect(result).toEqual({ ok: false, error: EM.NICKNAME_ALREADY });
    });
    it('should return true', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      const result = await usersService.checkNickname({ nickname });
      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await usersService.checkNickname({ nickname });
      expect(result).toEqual({ ok: false, error: EM.INTERNAL_SERVER_ERROR });
    });
  });

  describe('findById', () => {
    const user = {
      id: 1,
    };

    it('should fail on user not exists', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      const result = await usersService.findById(user.id);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({ id: user.id });
      expect(result).toEqual({ ok: false, error: EM.USER_NOT_FOUND });
    });
    it('should return user', async () => {
      usersRepository.findOne.mockResolvedValue(user);
      const result = await usersService.findById(user.id);
      expect(result).toEqual({ ok: true, user });
    });
    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await usersService.findById(user.id);
      expect(result).toEqual({ ok: false, error: EM.INTERNAL_SERVER_ERROR });
    });
  });

  describe('updatePassword', () => {
    const user = {
      id: 1,
      password: 'test',
    };
    it('should update password', async () => {
      usersRepository.findOne.mockResolvedValue(user);
      usersRepository.save.mockResolvedValue(true);
      const result = await usersService.updatePassword(user.id, { password: user.password });
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(user.id);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await usersService.updatePassword(user.id, { password: user.password });
      expect(result).toEqual({ ok: false, error: EM.INTERNAL_SERVER_ERROR });
    });
  });

  describe('updateNickname', () => {
    const user = {
      id: 1,
      nickname: 'test',
    };

    it('should fail on nickname exists', async () => {
      usersRepository.findOne.mockResolvedValue(user);
      const result = await usersService.updateNickname(user.id, { nickname: user.nickname });
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({ ok: false, error: EM.NICKNAME_ALREADY });
    });
    it('should update nickname', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.update.mockResolvedValue(true);
      const result = await usersService.updateNickname(user.id, { nickname: user.nickname });
      expect(usersRepository.update).toHaveBeenCalledTimes(1);
      expect(usersRepository.update).toHaveBeenCalledWith(
        { id: user.id },
        { nickname: user.nickname }
      );
      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await usersService.updateNickname(user.id, { nickname: user.nickname });
      expect(result).toEqual({ ok: false, error: EM.INTERNAL_SERVER_ERROR });
    });
  });

  describe('verifyEmail', () => {
    const verification = {
      id: 1,
      code: 'code',
      user: {
        id: 1,
      },
    };

    it('should fail on verification not exists', async () => {
      verificationsRepository.findOne.mockResolvedValue(undefined);
      const result = await usersService.verifyEmail({ code: verification.code });
      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.findOne).toHaveBeenCalledWith(
        { code: verification.code },
        { relations: ['user'] }
      );
      expect(result).toEqual({ ok: false, error: EM.CODE_NOT_EXIST });
    });
    it('should verification success', async () => {
      verificationsRepository.findOne.mockResolvedValue(verification);
      usersRepository.save.mockResolvedValue(true);
      verificationsRepository.delete.mockResolvedValue(true);
      const result = await usersService.verifyEmail({ code: verification.code });
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(expect.any(Object));
      expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.delete).toHaveBeenCalledWith(verification.id);
      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      verificationsRepository.findOne.mockRejectedValue(new Error());
      const result = await usersService.verifyEmail({ code: verification.code });
      expect(result).toEqual({ ok: false, error: EM.INTERNAL_SERVER_ERROR });
    });
  });
});
