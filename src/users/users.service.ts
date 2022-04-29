import { UserStack } from './func/stack.score';
import { PortfolioScrap } from './func/portfolio.scrap';
import { UserInfo } from './../schemas/UserInfo.schema';
import { Injectable, Logger } from '@nestjs/common';
import { User } from 'src/schemas/User.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SuveyInfoDto } from './dto/suveyInfo.dto';
import { UpdateUserInfoDto } from './dto/updateUserInfo.dto';
import { Project } from 'src/schemas/Project.schema';
import mongoose from 'mongoose';
import { UsersRepository } from './repository/users.repository';
@Injectable()
export class UsersService {
  private logger = new Logger('usersService');

  constructor(
    private portfolioScrap: PortfolioScrap,
    private userStack: UserStack,
    private readonly usersRepository: UsersRepository,
  ) {}

  async insertInfo(suveyInfoDto: SuveyInfoDto, req: any): Promise<any> {
    const { position, front, back, design, url, portfolioUrl } = suveyInfoDto;
    let protfolioOgData: string[];
    try {
      if (portfolioUrl) {
        protfolioOgData = await this.portfolioScrap.ogdataScrap(portfolioUrl);
      }
      const surveyScore = this.userStack.stackScore(front, back, design);

      this.usersRepository.updateSuveyCheckByObjectId(req);
      this.usersRepository.newUserInfoByObjectId(
        suveyInfoDto,
        req,
        protfolioOgData,
        surveyScore,
      );
      return {
        msg: `${position} 설문조사 완료`,
      };
    } catch (error) {
      return {
        msg: `url을 다시 입력해주세요`,
      };
    }
  }

  async updateUser(
    updateUserInfoDto: UpdateUserInfoDto,
    req: any,
  ): Promise<any> {
    const { nickname } = updateUserInfoDto;

    this.usersRepository.updateNicknameAndPorfileUrl(updateUserInfoDto, req);
    this.usersRepository.updateUserInfo(updateUserInfoDto, req);

    return {
      msg: `${nickname} 회원정보 수정 완료`,
    };
  }

  async getUserInfo(req: any) {
    this.logger.log(`Func: getUserInfo start`);
    const { _id } = req.user.user;
    const projectData = await this.usersRepository.getProjectModel(_id);
    const userInfo = await this.usersRepository.getUserInfoModel(_id);
    const customInfo = JSON.parse(JSON.stringify(userInfo)); // nickname 뽑기 위한 객체 깊은 복사
    customInfo['nickname'] = userInfo.userId['nickname'];

    return {
      msg: ` 회원정보 조회 완료`,
      userInfo: customInfo,
      projectData,
      totalProject: projectData.length,
    };
  }

  async getMemberInfo(userId: string) {
    this.logger.log(`Func: getUserInfoByUserId start`);

    const _id = new mongoose.Types.ObjectId(userId);
    const projectData = await this.usersRepository.getProjectModel(_id);
    const userInfo = await this.usersRepository.getUserInfoModel(_id);
    const customInfo = JSON.parse(JSON.stringify(userInfo)); //Deep Copy
    customInfo['nickname'] = userInfo.userId['nickname'];

    return {
      msg: ` 회원정보 조회 완료`,
      userInfo: customInfo,
      projectData,
      totalProject: projectData.length,
    };
  }

  deleteUser(req: any): object {
    const { nickname } = req.user.user;
    this.usersRepository.deleteUserByObjectId(req);
    this.usersRepository.deleteUserInfoByObjectId(req);

    return {
      msg: `${nickname} 회원탈퇴 완료`,
    };
  }
}
