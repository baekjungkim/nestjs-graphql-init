import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { EM } from '../common/error-message';
import { CreateUserInput, CreateUserOutput } from './dtos/create-user.dto';
import { NicknameSearchInput, NicknameSearchOutput } from './dtos/check-nickname.dto';
import { User } from './entities/user.entity';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserOutput, UsersOutput } from './dtos/user.dto';
import { JwtService } from '../jwt/jwt.service';
import {
  UpdateNicknameInput,
  UpdateNicknameOutput,
  UpdatePasswordInput,
  UpdatePasswordOutput,
} from './dtos/update-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationsRepository: Repository<Verification>,
    private readonly jwtService: JwtService
  ) {}

  /**
   * 모든 유저 조회
   * @returns UsersOutput
   */
  async getUsers(): Promise<UsersOutput> {
    try {
      const users = await this.usersRepository.find();
      return {
        ok: true,
        users,
      };
    } catch {
      return {
        ok: false,
        error: EM.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * 유저 생성
   * @param param0 CreateUserInput
   * @returns CreateUserOutput
   */
  async createUser({
    email,
    password,
    nickname,
    role,
  }: CreateUserInput): Promise<CreateUserOutput> {
    try {
      // 이메일 체크
      const emailExists = await this.usersRepository.findOne({ email });
      if (emailExists) {
        return {
          ok: false,
          error: EM.EMAIL_ALREADY,
        };
      }

      // 유저 생성
      const user = await this.usersRepository.save(
        this.usersRepository.create({ email, password, nickname, role })
      );
      // 검증 코드 생성
      await this.verificationsRepository.save(
        this.verificationsRepository.create({
          user,
        })
      );

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: EM.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * 로그인
   * @param param0 LoginInput
   * @returns LoginOutput
   */
  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      // 유저 체크
      const user = await this.usersRepository.findOne({ email }, { select: ['id', 'password'] });
      if (!user) {
        return {
          ok: false,
          error: EM.USER_NOT_FOUND,
        };
      }

      // 패스워드 체크
      const checkPassword = await user.checkPassword(password);
      if (!checkPassword) {
        return {
          ok: false,
          error: EM.PASSWORD_WRONG,
        };
      }

      // 토큰 발급
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch {
      return {
        ok: false,
        error: EM.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * 닉네임 체크
   * @param param0 NicknameSearchInput
   * @returns NicknameSearchOutput
   */
  async checkNickname({ nickname }: NicknameSearchInput): Promise<NicknameSearchOutput> {
    try {
      // 닉네임 체크
      const exists = await this.usersRepository.findOne({ nickname });
      if (exists) {
        return {
          ok: false,
          error: EM.NICKNAME_ALREADY,
        };
      }

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: EM.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * id 로 유저 조회
   * @param id number
   * @returns UserOutput
   */
  async findById(id: number): Promise<UserOutput> {
    try {
      // 유저 체크
      const user = await this.usersRepository.findOne({ id });
      if (!user) {
        return {
          ok: false,
          error: EM.USER_NOT_FOUND,
        };
      }

      return {
        ok: true,
        user,
      };
    } catch {
      return {
        ok: false,
        error: EM.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * 로그인 유저 비밀번호 업데이트
   * @param id number
   * @param param1 UpdatePasswordInput
   * @returns UpdatePasswordOutput
   */
  async updatePassword(
    id: number,
    { password }: UpdatePasswordInput
  ): Promise<UpdatePasswordOutput> {
    try {
      // 유저 체크
      const user = await this.usersRepository.findOne(id);
      // 유저 비밀번호 업데이트
      user.password = password;
      // 유저 저장 @BeforeUpdate() 를 사용하기 위함
      await this.usersRepository.save(user);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: EM.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * 로그인 유저 닉네임 업데이트
   * @param id number
   * @param param1 UpdateNicknameInput
   * @returns UpdateNicknameOutput
   */
  async updateNickname(
    id: number,
    { nickname }: UpdateNicknameInput
  ): Promise<UpdateNicknameOutput> {
    try {
      // 닉네임 체크 & 해당 유저 id 가 본인이 아닐경우
      const exists = await this.usersRepository.findOne({ nickname, id: Not(id) });
      // 해당 닉네임 유저 있음
      if (exists) {
        return {
          ok: false,
          error: EM.NICKNAME_ALREADY,
        };
      }

      // 닉네임 업데이트
      await this.usersRepository.update({ id }, { nickname });
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: EM.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * 이메일 인증
   * @param param0 VerifyEmailInput
   * @returns VerifyEmailOutput
   */
  async verifyEmail({ code }: VerifyEmailInput): Promise<VerifyEmailOutput> {
    try {
      // 인증코드 찾기
      const verification = await this.verificationsRepository.findOne(
        { code },
        { relations: ['user'] }
      );

      if (!verification) {
        return {
          ok: false,
          error: EM.CODE_NOT_EXIST,
        };
      }

      // 인증코드 유저 인증 확인
      verification.user.verified = true;
      // 인증 확인 저장
      await this.usersRepository.save(verification.user);
      // 인증 코드 삭제
      await this.verificationsRepository.delete(verification.id);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: EM.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
