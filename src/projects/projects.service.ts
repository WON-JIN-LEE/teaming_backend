import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { projectDto } from '../boards/dto/project.dto';
import { participantList } from '../boards/entities/schemaValue.entity';
import { Board, BoardDocument } from '../schemas/Board.schema';
import { Project, ProjectDocument } from '../schemas/Project.schema';
import { User, UserDocument } from '../schemas/User.schema';
import { UserInfo, UserInfoDocument } from '../schemas/UserInfo.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(UserInfo.name) private UserInfoModel: Model<UserInfoDocument>,
  ) {}

  // 프로젝트 참가 확인
  async inProjectCheck(user, project) {
    const participantList: participantList = project.participantList;
    // console.log('inProjectCheck!!!', project);
    const check = participantList.userId.indexOf(user._id);
    // console.log(check);
    // console.log(participantList.userId, user._id);

    if (check !== -1) {
      return true;
    }
    return false;
  }

  // 프로젝트 리더 확인
  async leaderCheck(user, project) {
    // console.log(
    //   `${user._id} / ${project.userId}`,
    //   user._id.toString() === project.userId.toString(),
    // );

    const leader = project.userId;
    if (user._id.toString() === leader.toString()) {
      return true;
    }
    return false;
  }

  // 프로젝트 참가
  async addProjectPerson(user, id) {
    const _id = new Types.ObjectId(id);
    const findUserInfo = await this.UserInfoModel.findOne({
      userId: user._id,
    });
    const findProject: any = await this.projectModel.findOne({ boardId: _id });
    console.log(user._id);
    findProject.participantList.userId.push(user._id);
    findProject.participantList.position.push(findUserInfo.position);

    // console.log(findProject.participantList);

    await this.projectModel.updateOne(
      { _id: findProject._id },
      { $set: { participantList: findProject.participantList } },
    );

    return {
      message: `${user.nickname}님 새로운 프로젝트에 참가했습니다.`,
    };
  }

  async outProject(user, id) {
    const _id = new Types.ObjectId(id);
    const findProject: any = await this.projectModel.findOne({ boardId: _id });
    const userList = findProject.participantList.userId;

    for (const idx in userList) {
      if (user._id === userList[idx]) {
        findProject.participantList.userId.splice(idx, 1);
        findProject.participantList.position.splice(idx, 1);
      }
    }

    await this.projectModel
      .findByIdAndUpdate(
        { _id: findProject._id },
        { $set: { participantList: findProject.participantList } },
      )
      .exec();

    return {
      message: `${user.nickname}님이 프로젝트에서 나갔습니다.`,
    };
  }

  // 프로젝트 들어갈 때
  async project(user, id) {
    const _id = new Types.ObjectId(id);
    const findProject = await this.projectModel.findOne({ boardId: _id });

    const leaderCheck = await this.leaderCheck(user, findProject);

    console.log('리더', leaderCheck);
    if (!leaderCheck) {
      const projectInCheck = await this.inProjectCheck(user, findProject);

      return {
        leaderCheck,
        projectInCheck,
        message: `${user.nickname}님 어서오세요.`,
      };
    }

    return {
      leaderCheck,
      projectInCheck: true,
      message: `🌟${user.nickname}님 어서오세요.`,
    };
  }

  async startProject(user, id) {
    const _id = new Types.ObjectId(id);
    const findProject = await this.projectModel.findOne({ boardId: _id });
    const startTime = new Date();

    if (findProject.userId === user._id) {
      await this.projectModel.updateOne(
        { _id },
        {
          $set: {
            createdAt: startTime,
          },
        },
      );
      return {
        startTime,
        message: '시작되었습니다.',
      };
    }

    return { message: '시작할 수 없습니다.' };
  }
}
