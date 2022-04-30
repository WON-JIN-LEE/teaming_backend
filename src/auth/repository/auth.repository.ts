/*
author : @WON-JIN-LEE
description : 회원관리에 필요한 DB연산을 수행하는 메서드 정의
updateAt : 2022-04-15
*/

import { User } from '../../schemas/User.schema';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserKakaoDto } from '../dto/auth-userkakao.dto';
import { AuthCredentialsDto } from '../dto/auth-credential.dto';
import { UserInfo } from 'src/schemas/UserInfo.schema';

@Injectable()
export class AuthRepository {
  private logger = new Logger('AuthRepository');
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserInfo.name) private userInfoModel: Model<UserInfo>,
  ) {}

  async createTeamingUser(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<object> {
    this.logger.log(`Func: createTeamingUser start`);

    const { email, nickname, password, profileUrl } = authCredentialsDto;

    const user = await this.userModel.create({
      email,
      nickname,
      password,
      profileUrl,
    });
    return user;
  }

  async createKakao(userKakaoDto: UserKakaoDto) {
    this.logger.log(`Func: createKakao start`);

    const { kakaoId, name, email, profileUrl } = userKakaoDto;
    const checkEmail = !email ? String(kakaoId) : email;
    return await this.userModel.create({
      email: checkEmail,
      nickname: name,
      profileUrl,
      kakaoId,
    });
  }

  async findOneByEmail(email: string): Promise<object> {
    this.logger.log(`Func: findOneByEmail start`);

    return await this.userModel.findOne({ email });
  }

  async findOneById(_id: string): Promise<object> {
    this.logger.log(`Func: findOneById start`);

    return await this.userModel.findOne({ _id });
  }

  async findOneByName(name: string): Promise<object> {
    this.logger.log(`Func: findOneByName start`);

    return await this.userModel.findOne({ nickname: name });
  }

  async find(): Promise<any> {
    this.logger.log(`Func: find start`);

    return await this.userModel.find().exec();
  }

  async createUserInfo(userId: string): Promise<void> {
    this.logger.log(`Func: createUserInfo start`);

    await this.userInfoModel.create({
      userId,
      portfolioUrl: [],
    });
  }
}
