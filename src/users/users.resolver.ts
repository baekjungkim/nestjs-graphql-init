import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CoreOutput } from '../common/dtos/core.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { NicknameSearchInput } from './dtos/user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(of => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(returns => [User])
  getUsers(): Promise<User[]> {
    return this.usersService.getUsers();
  }

  @Mutation(returns => CoreOutput)
  createUser(@Args('input') createUserInput: CreateUserDto): Promise<CoreOutput> {
    return this.usersService.createUser(createUserInput);
  }

  @Query(returns => CoreOutput)
  checkNickname(@Args('input') nicknameSearchInput: NicknameSearchInput): Promise<CoreOutput> {
    return this.usersService.checkNickname(nicknameSearchInput);
  }
}
