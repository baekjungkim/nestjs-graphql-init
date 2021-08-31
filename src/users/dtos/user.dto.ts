import { Field, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from '../../common/dtos/common.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class UsersOutput extends CommonOutput {
  @Field(type => [User], { nullable: true })
  users?: User[];
}

@ObjectType()
export class UserOutput extends CommonOutput {
  @Field(type => User, { nullable: true })
  user?: User;
}
