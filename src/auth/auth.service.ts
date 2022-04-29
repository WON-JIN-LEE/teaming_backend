/*
author : @WON-JIN-LEE
description : 회원관리에 필요한 service 메서드 정의
updateAt : 2022-04-15
*/

import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserKakaoDto } from './dto/auth-userkakao.dto';
import { AuthRepository } from './repository/auth.repository';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { AuthSignInDto } from './dto/auth-signin.dto';

@Injectable()
export class AuthService {
  private http: HttpService;
  constructor(
    private readonly authRepository: AuthRepository,
    private jwtService: JwtService,
  ) {
    this.http = new HttpService();
  }

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<object> {
    const { nickname, password, passwordCheck, profileUrl } =
      authCredentialsDto;

    const nicknameRule = /[`~!@#$%^&*|\\\'\";:\/?]/gi;
    if (nicknameRule.test(nickname)) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: '닉네임에 특수문자를 사용할 수 없습니다.',
        },
        400,
      );
    }

    if (password !== passwordCheck) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'password IsNotEqual',
        },
        400,
      );
    }

    // 암호화
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const defaultProfileUrl =
      'https://www.dailygaewon.com/news/photo/202105/11330_11828_3159.jpg';

    authCredentialsDto['password'] = hashedPassword;
    authCredentialsDto['profileUrl'] =
      profileUrl !== '' ? profileUrl : defaultProfileUrl;

    try {
      const user = await this.authRepository.createTeamingUser(
        authCredentialsDto,
      );
      await this.authRepository.createUserInfo(user['_id']);

      return {
        msg: '회원가입 성공',
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(`Exisiting ${Object.keys(error.keyValue)}`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(authSignInDto: AuthSignInDto): Promise<object> {
    const { email, password } = authSignInDto;
    const user = await this.authRepository.findOneByEmail(email);
    console.log(user);

    if (user && (await bcrypt.compare(password, user['password']))) {
      // 유저 토큰 생성
      const payload = { _id: user['_id'] };
      console.log(payload);
      const accessToken = this.jwtService.sign(payload);
      const resPayload = {
        msg: '로그인 성공',
        Authorization: `Bearer ${accessToken}`,
        nickname: user['nickname'],
        profileUrl: user['profileUrl'],
        suveyCheck: user['suveyCheck'],
      };
      return resPayload;
    } else {
      throw new UnauthorizedException({
        msg: '로그인 실패',
        success: false,
      });
    }
  }

  async kakaoLogin(userKakaoDto: UserKakaoDto): Promise<object> {
    try {
      const { name, kakaoAccessToken } = userKakaoDto;
      let user = await this.authRepository.findOneByName(name);
      if (!user) {
        user = await this.authRepository.createKakao(userKakaoDto);
        await this.authRepository.createUserInfo(user['_id']);
      }
      const payload = { _id: user['_id'], kakaoAccessToken };
      const accessToken = this.jwtService.sign(payload);
      return {
        msg: '카카오 로그인 성공',
        Authorization: `Bearer ${accessToken}`,
        nickname: user['nickname'],
        profileUrl: user['profileUrl'],
        suveyCheck: user['suveyCheck'],
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(`Exisiting ${Object.keys(error.keyValue)}`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  kakaoLogout(userKakaoDto: UserKakaoDto) {
    const KAKAO_ACCESS_TOKEN = userKakaoDto.kakaoAccessToken;
    const _url = 'https://kapi.kakao.com/v1/user/unlink';
    const _header = { Authorization: `bearer ${KAKAO_ACCESS_TOKEN}` };
    try {
      this.http.post(_url, '', { headers: _header });
      return {
        msg: '카카오 로그아웃 완료',
      };
    } catch (error) {
      return error;
    }
  }

  UserfindAll(): Promise<object> {
    return this.authRepository.find();
  }
}
