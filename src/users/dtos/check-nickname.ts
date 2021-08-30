import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/core.dto';
import { User } from '../entities/user.entity';

@InputType()
export class NicknameSearchInput extends PickType(User, ['nickname']) {}

@ObjectType()
export class NicknameSearchOutput extends CoreOutput {}
