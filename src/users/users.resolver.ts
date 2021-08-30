import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserDto, CreateUserOutput } from './dtos/create-user.dto';
import { NicknameSearchInput, NicknameSearchOutput } from './dtos/check-nickname';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { LoginInput, LoginOutput } from './dtos/login.dto';

@Resolver(of => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(returns => [User])
  getUsers(): Promise<User[]> {
    return this.usersService.getUsers();
  }

  @Mutation(returns => CreateUserOutput)
  createUser(@Args('input') createUserInput: CreateUserDto): Promise<CreateUserOutput> {
    return this.usersService.createUser(createUserInput);
  }

  @Mutation(returns => LoginOutput)
  login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  @Query(returns => NicknameSearchOutput)
  checkNickname(
    @Args('input') nicknameSearchInput: NicknameSearchInput
  ): Promise<NicknameSearchOutput> {
    return this.usersService.checkNickname(nicknameSearchInput);
  }
}
