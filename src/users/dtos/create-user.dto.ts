import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/core.dto';
import { User } from '../entities/user.entity';

@InputType()
export class CreateUserDto extends PickType(User, ['email', 'password', 'role']) {}

@ObjectType()
export class CreateUserOutput extends CoreOutput {}
