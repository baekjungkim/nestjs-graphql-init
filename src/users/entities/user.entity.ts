import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEmail, Length } from 'class-validator';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CommonEntity } from '../../common/entities/common.entity';
import { InternalServerErrorException } from '@nestjs/common';

enum UserRole {
  Master,
  Manager,
  Client,
}

registerEnumType(UserRole, { name: 'UserRole' });

@Entity()
@InputType('UserDto', { isAbstract: true })
@ObjectType()
export class User extends CommonEntity {
  @Column()
  @Field(type => String)
  @IsEmail()
  email: string;

  @Column()
  @Field(type => String)
  password: string;

  @Column({ unique: true })
  @Field(type => String)
  @Length(2, 10)
  nickname: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(type => UserRole)
  role: UserRole;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      return bcrypt.compare(aPassword, this.password);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
