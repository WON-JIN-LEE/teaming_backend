import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from 'src/schemas/Project.schema';
import { User } from 'src/schemas/User.schema';
import { UserInfo } from 'src/schemas/UserInfo.schema';
import { SuveyInfoDto } from '../dto/suveyInfo.dto';
import { UpdateUserInfoDto } from '../dto/updateUserInfo.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserInfo.name) private userInfoModel: Model<UserInfo>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async updateSuveyCheckByObjectId(req: any) {
    const { _id } = req.user.user;
    await this.userModel.findOneAndUpdate().where('_id').equals(_id).set({
      suveyCheck: true,
    });
  }

  async newUserInfoByObjectId(
    suveyInfoDto: SuveyInfoDto,
    req: any,
    protfolioOgData: string[],
    surveyScore: object,
  ) {
    const { _id } = req.user.user;
    const { position, front, back, design, url, portfolioUrl } = suveyInfoDto;

    await this.userInfoModel
      .findOneAndUpdate()
      .where('userId')
      .equals(_id)
      .set({
        front,
        back,
        design,
        position,
        portfolioUrl: protfolioOgData,
        url,
        stack: surveyScore,
      });
  }

  async deleteUserByObjectId(req: any) {
    const { _id } = req.user.user;
    await this.userModel.deleteOne({ _id });
  }
  async deleteUserInfoByObjectId(req: any) {
    const { _id } = req.user.user;
    await this.userInfoModel.deleteOne({ userId: _id });
  }
  async updateNicknameAndPorfileUrl(
    updateUserInfoDto: UpdateUserInfoDto,
    req: any,
  ) {
    const { _id } = req.user.user;
    const { nickname, profileUrl } = updateUserInfoDto;
    await this.userModel
      .findOneAndUpdate()
      .where('_id')
      .equals(_id)
      .set({ nickname, profileUrl });
  }

  async updateUserInfo(updateUserInfoDto: UpdateUserInfoDto, req: any) {
    const { _id } = req.user.user;
    const { introduction, position, front, back, design, portfolioUrl, url } =
      updateUserInfoDto;
    await this.userInfoModel
      .findOneAndUpdate()
      .where('userId')
      .equals(_id)
      .set({
        position,
        introduction,
        front,
        back,
        design,
        portfolioUrl,
        url,
      });
  }

  async getUserInfoModel(_id: object) {
    return await this.userInfoModel
      .findOne({ userId: _id })
      .populate('userId', { password: false });
  }

  async getProjectModel(_id: object) {
    return await this.projectModel
      .find()
      .where('participantList.userId')
      .in([_id])
      .populate('boardId', { updateAt: 0, createdAt: 0 })
      .select({ updatedAt: 0, createdAt: 0 });
  }
}
