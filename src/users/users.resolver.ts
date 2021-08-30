import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserDto, CreateUserOutput } from './dtos/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

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
}
