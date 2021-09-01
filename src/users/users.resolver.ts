import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserDto, CreateUserOutput } from './dtos/create-user.dto';
import { NicknameSearchInput, NicknameSearchOutput } from './dtos/check-nickname.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserInput, UserOutput, UsersOutput } from './dtos/user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { LoggedUser } from '../auth/auth.decorator';
import {
  UpdateNicknameInput,
  UpdateNicknameOutput,
  UpdatePasswordInput,
  UpdatePasswordOutput,
} from './dtos/update-profile.dto';

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
  me(@LoggedUser() loggedUser: User): UserOutput {
    return {
      ok: true,
      user: loggedUser,
    };
  }

  @UseGuards(AuthGuard)
  @Query(returns => UserOutput)
  seeProfile(@Args('input') userInput: UserInput): Promise<UserOutput> {
    return this.usersService.findById(userInput.id);
  }

  @UseGuards(AuthGuard)
  @Mutation(returns => UpdatePasswordOutput)
  updatePassword(
    @LoggedUser() loggedUser: User,
    @Args('input') updatePasswordInput: UpdatePasswordInput
  ): Promise<UpdatePasswordOutput> {
    return this.usersService.updatePassword(loggedUser.id, updatePasswordInput);
  }

  @UseGuards(AuthGuard)
  @Mutation(returns => UpdateNicknameOutput)
  updateNickname(
    @LoggedUser() loggedUser: User,
    @Args('input') updateNicknameInput: UpdateNicknameInput
  ): Promise<UpdateNicknameOutput> {
    return this.usersService.updateNickname(loggedUser.id, updateNicknameInput);
  }
}
