import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoreOutput } from '../common/dtos/core.dto';
import { EM } from '../common/error-message';
import { CreateUserDto } from './dtos/create-user.dto';
import { NicknameSearchInput } from './dtos/user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  getUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async createUser({ email, password, nickname, role }: CreateUserDto): Promise<CoreOutput> {
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

  async checkNickname({ nickname }: NicknameSearchInput): Promise<CoreOutput> {
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
