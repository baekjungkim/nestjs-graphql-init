import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserInput, CreateUserOutput } from './dtos/create-user.dto';
import { NicknameSearchInput, NicknameSearchOutput } from './dtos/check-nickname.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserInput, UserOutput, UsersOutput } from './dtos/user.dto';
import { AuthUser } from '../auth/auth-user.decorator';
import {
  UpdateNicknameInput,
  UpdateNicknameOutput,
  UpdatePasswordInput,
  UpdatePasswordOutput,
} from './dtos/update-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { Role } from '../auth/role.decorator';

@Resolver(of => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(returns => UsersOutput)
  getUsers(): Promise<UsersOutput> {
    return this.usersService.getUsers();
  }

  @Mutation(returns => CreateUserOutput)
  createUser(@Args('input') createUserInput: CreateUserInput): Promise<CreateUserOutput> {
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

  @Role(['Any'])
  @Query(returns => UserOutput)
  me(@AuthUser() authUser: User): UserOutput {
    return {
      ok: true,
      user: authUser,
    };
  }

  @Role(['Any'])
  @Query(returns => UserOutput)
  seeProfile(@Args('input') userInput: UserInput): Promise<UserOutput> {
    return this.usersService.findById(userInput.id);
  }

  @Role(['Any'])
  @Mutation(returns => UpdatePasswordOutput)
  updatePassword(
    @AuthUser() authUser: User,
    @Args('input') updatePasswordInput: UpdatePasswordInput
  ): Promise<UpdatePasswordOutput> {
    return this.usersService.updatePassword(authUser.id, updatePasswordInput);
  }

  @Role(['Any'])
  @Mutation(returns => UpdateNicknameOutput)
  updateNickname(
    @AuthUser() authUser: User,
    @Args('input') updateNicknameInput: UpdateNicknameInput
  ): Promise<UpdateNicknameOutput> {
    return this.usersService.updateNickname(authUser.id, updateNicknameInput);
  }

  @Mutation(returns => VerifyEmailOutput)
  verifyEmail(@Args('input') verifyEmailInput: VerifyEmailInput): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(verifyEmailInput);
  }
}
