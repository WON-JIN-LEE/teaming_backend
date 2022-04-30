import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthRepository } from '../repository/auth.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private logger = new Logger('JwtStrategy');

  constructor(private readonly authRepository: AuthRepository) {
    super({
      secretOrKey: process.env.JWT_SCERTKEY,
      // 전달되는 토큰 가져오기
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload) {
    this.logger.log(`Func: validate start`);

    const { _id, kakaoAccessToken } = payload;
    const user = await this.authRepository.findOneById(_id);
    if (!user) {
      throw new UnauthorizedException({ msg: '사이트 회원이 아닙니다.' });
    }

    let userObj = {};

    if (payload.hasOwnProperty('kakaoAccessToken')) {
      userObj = {
        kakaoAccessToken,
        user,
      };
    } else {
      userObj = {
        kakaoAccessToken: null,
        user,
      };
    }

    return userObj;
  }
}
