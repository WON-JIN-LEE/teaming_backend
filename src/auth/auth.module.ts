import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { User, UserSchema } from '../schemas/User.schema';
import { AuthRepository } from './repository/auth.repository';
import { HttpModule } from '@nestjs/axios';
import { KakaoStrategy } from './strategy/kakao.strategy';
import { UserInfo, UserInfoSchema } from '../schemas/UserInfo.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SCERTKEY,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRESIN,
      },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserInfo.name, schema: UserInfoSchema },
    ]),
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy, KakaoStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
