import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from '../../common/dtos/common.dto';
import { User } from '../entities/user.entity';

@InputType()
export class NicknameSearchInput extends PickType(User, ['nickname']) {}

@ObjectType()
export class NicknameSearchOutput extends CommonOutput {}
