import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EM } from '../common/error-message';
import { CreateUserDto, CreateUserOutput } from './dtos/create-user.dto';
import { NicknameSearchInput, NicknameSearchOutput } from './dtos/check-nickname';
import { User } from './entities/user.entity';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UsersOutput } from './dtos/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async getUsers(): Promise<UsersOutput> {
    try {
      const users = await this.usersRepository.find();
      return {
        ok: true,
        users,
      };
    } catch {
      return {
        ok: false,
        error: EM.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async createUser({ email, password, nickname, role }: CreateUserDto): Promise<CreateUserOutput> {
    try {
      const exists = await this.usersRepository.findOne({ email });

      if (exists) {
        return {
          ok: false,
          error: EM.EMAIL_ALREADY,
        };
      }

      await this.usersRepository.save(
        this.usersRepository.create({ email, password, nickname, role })
      );
      return {
        ok: true,
        error: null,
      };
    } catch (error) {
      return {
        ok: false,
        error: EM.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.usersRepository.findOne({ email });

      if (!user) {
        return {
          ok: false,
          error: EM.USER_NOT_FOUND,
        };
      }

      const checkPassword = await user.checkPassword(password);

      if (!checkPassword) {
        return {
          ok: false,
          error: EM.PASSWORD_WRONG,
        };
      }

      //TODO: jwt token return
      return {
        ok: true,
        token: 'token',
      };
    } catch {
      return {
        ok: false,
        error: EM.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async checkNickname({ nickname }: NicknameSearchInput): Promise<NicknameSearchOutput> {
    try {
      const exists = await this.usersRepository.findOne({ nickname });
      if (exists) {
        return {
          ok: false,
          error: EM.NICKNAME_ALREADY,
        };
      }

      return {
        ok: true,
        error: null,
      };
    } catch {
      return {
        ok: false,
        error: EM.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
