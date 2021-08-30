import { InputType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@InputType()
export class NicknameSearchInput extends PickType(User, ['nickname']) {}
