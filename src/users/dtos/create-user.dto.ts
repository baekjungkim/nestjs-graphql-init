import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from '../../common/dtos/common.dto';
import { User } from '../entities/user.entity';

@InputType()
export class CreateUserInput extends PickType(User, ['email', 'password', 'nickname', 'role']) {}

@ObjectType()
export class CreateUserOutput extends CommonOutput {}
