import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from '../../common/dtos/common.dto';
import { Verification } from '../entities/verification.entity';

@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']) {}

@ObjectType()
export class VerifyEmailOutput extends CommonOutput {}
