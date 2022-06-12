import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../schemas/User.schema';
import { UserInfo } from '../../schemas/UserInfo.schema';

@Injectable()
export class ChatsRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(UserInfo.name) private readonly userInfoModel: Model<UserInfo>,
  ) {}

  async getUserStack(nickname): Promise<any> {
    const user = await this.userModel
      .findOne()
      .select({ _id: true, nickname: true, profileUrl: true, suveyCheck: true })
      .where('nickname')
      .equals(nickname);

    const userInfoStack = await this.userInfoModel
      .findOne()
      .select({
        _id: false,
        stack: true,
        position: true,
      })
      .where('userId')
      .equals(user._id);
    return { user, userInfoStack };
  }
}
