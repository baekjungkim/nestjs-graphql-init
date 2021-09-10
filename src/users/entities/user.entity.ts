import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEmail, Length } from 'class-validator';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CommonEntity } from '../../common/entities/common.entity';
import { InternalServerErrorException } from '@nestjs/common';

export enum UserRole {
  Master = 'Master',
  Manager = 'Manager',
  Client = 'Client',
}

registerEnumType(UserRole, { name: 'UserRole' });

@Entity()
@InputType('UserDto', { isAbstract: true })
@ObjectType()
export class User extends CommonEntity {
  @Field(type => String)
  @Column()
  @IsEmail()
  email: string;

  @Field(type => String)
  @Column({ select: false })
  password: string;

  @Field(type => String)
  @Column({ unique: true })
  @Length(2, 10)
  nickname: string;

  @Field(type => UserRole)
  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Field(type => Boolean)
  @Column({ default: false })
  verified: boolean;

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
