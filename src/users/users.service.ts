import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, CreateUserOutput } from './dtos/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  getUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async createUser(createUserInput: CreateUserDto): Promise<CreateUserOutput> {
    try {
      await this.usersRepository.save(this.usersRepository.create({ ...createUserInput }));
      return {
        ok: true,
        error: null,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
