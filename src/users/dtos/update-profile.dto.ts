import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from '../../common/dtos/common.dto';
import { User } from '../entities/user.entity';
import { NicknameSearchInput } from './check-nickname.dto';

@InputType()
export class UpdateNicknameInput extends NicknameSearchInput {}

@ObjectType()
export class UpdateNicknameOutput extends CommonOutput {}

@InputType()
export class UpdatePasswordInput extends PickType(User, ['password']) {}

@ObjectType()
export class UpdatePasswordOutput extends CommonOutput {}
