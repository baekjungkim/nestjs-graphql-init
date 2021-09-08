import { v4 as uuidv4 } from 'uuid';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { CommonEntity } from '../../common/entities/common.entity';
import { User } from './user.entity';

@Entity()
@InputType('VerificationDto', { isAbstract: true })
@ObjectType()
export class Verification extends CommonEntity {
  @Field(type => String)
  @Column()
  code: string;

  @OneToOne(type => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @BeforeInsert()
  createVerifyCode(): void {
    this.code = uuidv4();
  }
}
