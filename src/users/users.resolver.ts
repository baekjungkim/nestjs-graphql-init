import { Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(returns => String)
  getUsers(): string {
    return this.usersService.getUsers();
  }
}
