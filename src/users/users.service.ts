import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EM } from '../common/error-message';
import { CreateUserDto, CreateUserOutput } from './dtos/create-user.dto';
import { NicknameSearchInput, NicknameSearchOutput } from './dtos/check-nickname.dto';
import { User } from './entities/user.entity';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserOutput, UsersOutput } from './dtos/user.dto';
import { JwtService } from '../jwt/jwt.service';
import {
  UpdateNicknameInput,
  UpdateNicknameOutput,
  UpdatePasswordInput,
  UpdatePasswordOutput,
} from './dtos/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

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
      const emailExists = await this.usersRepository.findOne({ email });
      if (emailExists) {
        return {
          ok: false,
          error: EM.EMAIL_ALREADY,
        };
      }

      const nicknameExists = await this.usersRepository.findOne({ nickname });
      if (nicknameExists) {
        return {
          ok: false,
          error: EM.NICKNAME_ALREADY,
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

      const token = this.jwtService.sign(user.id);

      return {
        ok: true,
        token,
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

  async findById(id: number): Promise<UserOutput> {
    try {
      const user = await this.usersRepository.findOne({ id });
      if (!user) {
        return {
          ok: false,
          error: EM.USER_NOT_FOUND,
        };
      }

      return {
        ok: true,
        user,
      };
    } catch {
      return {
        ok: false,
        error: EM.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async updatePassword(
    id: number,
    { password }: UpdatePasswordInput
  ): Promise<UpdatePasswordOutput> {
    try {
      const user = await this.usersRepository.findOne(id);
      user.password = password;
      await this.usersRepository.save(user);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: EM.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async updateNickname(
    id: number,
    { nickname }: UpdateNicknameInput
  ): Promise<UpdateNicknameOutput> {
    try {
      const user = await this.usersRepository.findOne({ nickname });

      if (user && user.id !== id) {
        return {
          ok: false,
          error: EM.NICKNAME_ALREADY,
        };
      }

      await this.usersRepository.update({ id }, { nickname });
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: EM.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
