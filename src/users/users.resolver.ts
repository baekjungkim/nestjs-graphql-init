import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserDto, CreateUserOutput } from './dtos/create-user.dto';
import { NicknameSearchInput, NicknameSearchOutput } from './dtos/check-nickname';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserOutput, UsersOutput } from './dtos/user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { AuthUser } from '../auth/auth.decorator';

@Resolver(of => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(returns => UsersOutput)
  getUsers(): Promise<UsersOutput> {
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

  @UseGuards(AuthGuard)
  @Query(returns => UserOutput)
  me(@AuthUser() authUser: User): UserOutput {
    return {
      ok: true,
      user: authUser,
    };
  }
}
