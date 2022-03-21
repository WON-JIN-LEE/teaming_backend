import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserKakaoDto } from './dto/auth-userkakao.dto';
import { UsersRepository } from './repository/auth.repository';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { AuthCredentialsDto } from './dto/auth-credential.dto copy';
import { AuthSignInDto } from './dto/auth-signin.dto';

@Injectable()
export class AuthService {
  private http: HttpService;
  constructor(
    private readonly usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {
    this.http = new HttpService();
  }

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<any> {
    await this.usersRepository.create(authCredentialsDto);

    return {
      msg: '회원가입 성공',
    };
  }

  async signIn(authSignInDto: AuthSignInDto): Promise<any> {
    const { email, password } = authSignInDto;
    const user = await this.usersRepository.findOne(authSignInDto);

    if (user && (await bcrypt.compare(password, user.password))) {
      // 유저 토큰 생성
      const payload = { _id: user._id };
      const accessToken = this.jwtService.sign(payload);
      return {
        msg: '로그인 성공',
        Authorization: `Bearer ${accessToken}`,
        nickname: user.nickname,
        profileUrl: user.profileUrl,
        suveyCheck: user.suveyCheck,
      };
    } else {
      throw new UnauthorizedException({
        msg: '로그인 실패',
        success: false,
      });
    }
  }

  async kakaoLogin(userKakaoDto: UserKakaoDto): Promise<any> {
    const { kakaoId, name, email, provider, kakaoAccessToken } = userKakaoDto;
    try {
      let user = await this.usersRepository.findOneByName(name);
      if (!user) {
        user = await this.usersRepository.createKakao(userKakaoDto);
      }
      const payload = { _id: user._id, kakaoAccessToken };
      const accessToken = this.jwtService.sign(payload);
      return {
        msg: '카카오 로그인 성공',
        Authorization: `Bearer ${accessToken}`,
        nickname: user.nickname,
        profileUrl: user.profileUrl,
        suveyCheck: user.suveyCheck,
      };
    } catch (error) {
      console.log(error);
      if (error.code === 11000) {
        throw new ConflictException(`Exisiting ${Object.keys(error.keyValue)}`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async kakaoLogout(req: any): Promise<any> {
    const KAKAO_ACCESS_TOKEN = req.user.kakaoAccessToken;
    const _url = 'https://kapi.kakao.com/v1/user/unlink';
    const _header = {
      Authorization: `bearer ${KAKAO_ACCESS_TOKEN}`,
    };
    try {
      await this.http.post(_url, '', { headers: _header });
    } catch (error) {
      return error;
    }
    return {
      msg: '카카오 로그아웃 완료',
    };
  }

  async UserfindAll(): Promise<any> {
    return await this.usersRepository.find();
  }
}
