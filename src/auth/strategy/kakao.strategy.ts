import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_KEY,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
      // callbackURL: process.env.KAKAO_CALLBACK_LOCAL,
    });
  }

  async validate(
    accessToken: any,
    refreshToken: any,
    profile: any,
    done: any,
  ): Promise<any> {
    const profileJson = profile._json;
    const kakao_account = profileJson.kakao_account;
    const provider = profile.provider;
    const payload = {
      name: kakao_account.profile.nickname + '&' + profileJson.id,
      kakaoId: profileJson.id,
      email:
        kakao_account.has_email && !kakao_account.email_needs_agreement
          ? kakao_account.email
          : null,
      kakaoAccessToken: accessToken,
      provider,
      profileUrl: profileJson.properties.profile_image,
    };
    done(null, payload);
  }
}
