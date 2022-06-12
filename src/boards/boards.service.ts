import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Board, BoardDocument } from '../schemas/Board.schema';
import { Model, ObjectId } from 'mongoose';
import { createBoardDto } from './dto/createBoard.dto';
import { getAllBoard } from './entities/Board.entity';
import { Board as b, Mate as m, getOneBoard } from './entities/Board.entity';
import { User, UserDocument } from '../schemas/User.schema';
import { Project, ProjectDocument } from '../schemas/Project.schema';
import { Like, LikeDocument } from '../schemas/Like.schema';
import { userInfo } from './entities/user.entity';
import mongoose from 'mongoose';
import { UserInfo, UserInfoDocument } from '../schemas/UserInfo.schema';
import { participant } from './entities/schemaValue.entity';
import { projectDto } from './dto/project.dto';
import { updateBoardDto } from './dto/updateBoard.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(UserInfo.name) private UserInfoModel: Model<UserInfoDocument>,
    @InjectModel(Like.name) private LikeModel: Model<LikeDocument>,
  ) {}

  // ====================================================================
  // 좋아요 카운트
  async getLikeCount(boardId: ObjectId) {
    const like = await this.LikeModel.find({ boardId });
    return like.length;
  }
  // 스택 자리 체크
  async getStackCheck(boardId: ObjectId, stack: [string, string, number][]) {
    const participant: participant = await this.projectModel.findOne(
      { boardId },
      { _id: 0, participantList: 1 },
    );

    // console.log('stack!!!', stack);
    // console.log(boardId);
    // console.log('participant!!!', participant);
    // console.log(participant.participantList.position);
    const position = participant.participantList.position;

    if (position.length > 0) {
      for (const list of position) {
        // console.log('list!!!', list);
        // console.log('stack!!!', stack);

        for (const i in stack) {
          if (stack[i][0] === list) {
            --stack[i][2];
          } else if (stack[i][1] === list) {
            --stack[i][2];
          }
        }
      }
    }

    // console.log('stack2!!!', stack);
    return stack;
  }

  // 참석한 프로젝트 구하기
  async userInTheProject(user: ObjectId) {
    const participantList: any = await this.projectModel.find(
      {},
      { participantList: 1, _id: 0 },
    );
    let num = 0;

    try {
      for (const users of participantList.userId) {
        if (users.indexOf(user)) {
          num += 1;
        }
      }
    } catch (error) {}

    return num;
  }

  // 보드 제조합 => 불러올 갯수, 건너뛰기 (페이징), 카테고리, 유저 정보 ''이면 비로그인
  async boardMake(num: number, skip: number, userInfo: any): Promise<b[]> {
    const today = new Date();
    const findBoard = await this.boardModel
      .find({ period: { $gte: today } })
      .sort({ likeCount: -1, period: -1 })
      .skip(skip * num)
      .limit(num);
    const board: b[] = [];

    for (const list of findBoard) {
      const user = await this.userModel.findOne({ _id: list.userId });
      /* 코드 미사용으로 주석처리 */
      // const likeCount = await this.getLikeCount(list._id);
      const stack = await this.getStackCheck(list._id, list.stack);

      // console.log('user 확인!!!', user);
      if (!user) {
        user.nickname = 'unknown';
      }

      const tempBoard: b = {
        _id: list._id,
        title: list.title,
        imgUrl: list.imgUrl,
        subContents: list.subContents,
        stack,
        nickname: user.nickname,
        profileUrl: user.profileUrl,
        period: list.period,
        likeCount: list.likeCount,
      };
      board.push(tempBoard);
    }

    return board;
  }

  // 메이트 찾기 만들기
  async mateMake(num: number, skip: number, position: string): Promise<m[]> {
    const findUser = await this.UserInfoModel.find({ position })
      .populate('userId')
      .limit(num);

    const mate = findUser.map((userInfo: any) => {
      const payload = {
        _id: userInfo.userId._id,
        nickname: userInfo.userId.nickname,
        profileUrl: userInfo.userId.profileUrl,
        position: userInfo.position,
        portfolioUrl: userInfo.portfolioUrl,
        // project,
        createdAt: userInfo.userId.createdAt,
      };
      return payload;
    });

    return mate;
  }

  // ====================================================================
  //dev, design 유무 stack true, false
  async stacktf(stacks: [string, string, number][], job: string) {
    for (const stack of stacks) {
      if (job === 'design' && stack[0] === 'design') {
        if (stack[2] > 0) {
          return true;
        }
        return false;
      } else if (job === 'dev' && stack[0] === 'dev') {
        {
          if (stack[2] > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }
  // ====================================================================
  // 카테고리 페이지 가져오기
  async getAllCategory(
    category: string,
    page: number,
  ): Promise<b[] | m[] | string> {
    const newBoard = await this.boardMake(12, page, '');
    // console.log(newBoard);

    switch (category) {
      case 'rank':
        const boards = newBoard.sort((a, b) => b.likeCount - a.likeCount);
        return boards;
      case 'deadline':
        return newBoard.sort(
          (a, b) => +new Date(b.period) - +new Date(a.period),
        );
      case 'design':
        return newBoard.filter((item) => {
          for (const f of item.stack) {
            if (f[0] === 'design' && f[2] > 0) {
              return true;
            }
          }
          return false;
        });
      case 'dev':
        return newBoard.filter((item) => {
          for (const f of item.stack) {
            if (f[0] === 'dev' && f[2] > 0) {
              return true;
            }
          }
          return false;
        });
      case 'design-mate':
        const newMateDesign = await this.mateMake(16, page, 'design');
        return newMateDesign.filter((item) => {
          return item.position === 'design';
        });
      case 'dev-mate':
        const newMateDev = await this.mateMake(16, page, '');
        return newMateDev;
    }

    return '없는 카테고리 입니다.';
  }

  // ====================================================================

  // ====================================================================

  // 메인페이지 보드 모두 띄우기
  async getAllBoards(): Promise<any> {
    const tempBoards = await this.boardMake(4, 0, '');
    const tempDsMate = await this.mateMake(4, 0, 'design');
    const tempBMate = await this.mateMake(2, 0, 'back');
    const tempFMate = await this.mateMake(2, 0, 'front');
    const tempDeMate = [...tempBMate, ...tempFMate];

    // 프로젝트 카드 용도별 정렬
    const tempRank = tempBoards;
    const rankBoards = tempRank.sort((a, b) => b.likeCount - a.likeCount);

    for (const ran of rankBoards) {
      console.log(ran.likeCount);
    }

    const tempDeadline = tempBoards;
    const deadlineBoards = tempDeadline.sort((a, b) => +b.period - +a.period);

    const tempDesign = tempBoards;
    const designBoards = tempDesign.sort(
      (a, b) => b.stack[0][2] - a.stack[0][2],
    );

    const tempDev = tempBoards;
    const devBoards = tempDev.sort((a, b) => b.stack[0][2] - a.stack[0][2]);

    const tempDesignMate = tempDsMate;
    const designMates = tempDesignMate;

    const tempDevMate = tempDeMate;
    const devMates = tempDevMate;

    const boards: getAllBoard = {
      rankBoards,
      deadlineBoards,
      designBoards,
      devBoards,
      designMates,
      devMates,
    };

    // console.log(boards);

    return boards;
  }

  // Promise<Board>
  // ====================================================================
  // 프로젝트 카드 만들기 => 동시에 프로젝트 룸 생성

  async createBoard(board: createBoardDto, user: userInfo) {
    // console.log('user', user._id);
    const userId = new mongoose.Types.ObjectId(user._id);
    const createdAt = new Date();
    board.userId = userId;
    board.period = new Date(board.period);
    board.createdAt = createdAt;
    board.updateAt = createdAt;

    try {
      const findUserInfo = await this.UserInfoModel.findOne({
        userId,
      });

      if (!findUserInfo || !findUserInfo.position) {
        return '포지션이 없어 프로젝트를 생성할 수 없습니다.';
      }

      // console.log('유저 정보: ', findUserInfo);
      // console.log('오늘 날짜: ', createdAt);
      await this.boardModel.create(board);

      const findBoard = await this.boardModel
        .find()
        .sort({ createdAt: -1 })
        .limit(1);

      // console.log('보드 찾기', findBoard);
      // console.log('findUserInfo', findUserInfo);
      const participantList = {
        position: [findUserInfo.position],
        userId: [userId],
      };

      const project: projectDto = {
        boardId: findBoard[0]._id,
        userId: userId,
        participantList,
      };

      await this.projectModel.create(project);

      return {
        Status: 201,
        message: '프로젝트가 등록되었습니다.',
      };
    } catch (error) {
      console.log(error);
      return {
        Status: 401,
        message: error,
      };
    }
  }

  // ====================================================================
  // 프로젝트 카드 삭제 (현재 카드가 없을 때 다른 카드를 삭제하는 버그 있음)
  async deleteBoard(id: string, user: User) {
    const _id = new mongoose.Types.ObjectId(id);
    try {
      await this.boardModel.findOne({ _id });
      await this.boardModel.findOneAndDelete({ _id });
      await this.projectModel.findOneAndDelete({ boardId: _id });
      return '삭제완료';
    } catch (error) {
      return `${user.nickname}님 지울게 없습니다.`;
    }
  }

  // ====================================================================
  // 보드 1개 만들기
  async boardMakeOne(
    boardId: string,
    user: any | null,
  ): Promise<getOneBoard | string> {
    const board_id = new mongoose.Types.ObjectId(boardId);
    const findBoard = await this.boardModel.findById({ _id: board_id });
    // console.log('보드 넘어감');
    const nickname: string = await this.userModel.findById(
      {
        _id: new mongoose.Types.ObjectId(findBoard.userId),
      },
      { _id: 0, nickname: 1 },
    );
    // console.log('닉네임 찾기 넘어감');
    const participant: participant = await this.projectModel.findOne(
      { boardId: board_id, userId: findBoard.userId },
      { participantList: 1, _id: 0 },
    );
    // console.log('리스트 찾기 넘어감');

    const _id = findBoard._id.toString();

    // 남은 인원수 세기
    const left: number[] = [];
    let designCount = 0;
    let frontCount = 0;
    let backCount = 0;
    for (const list of participant.participantList.position) {
      // console.log('left!!!', list);
      switch (list) {
        case 'design':
          ++designCount;
          break;
        case 'front':
          ++frontCount;
          break;
        case 'back':
          ++backCount;
          break;
      }
      // console.log('leftCount!!', designCount, frontCount, backCount);
    }

    let stackDesignCount = 0;
    let stackFrontCount = 0;
    let stackBackCount = 0;
    for (const list of findBoard.stack) {
      // console.log('stack', list, list[2]);
      switch (list[0].toLowerCase()) {
        case 'design':
          stackDesignCount += list[2];
          break;
        case 'dev':
          if (list[1].toLowerCase() === 'front') {
            stackFrontCount += list[2];
            break;
          } else {
            stackBackCount += list[2];
            break;
          }
      }
      // console.log(
      //   'Before left!!!',
      //   stackDesignCount,
      //   stackFrontCount,
      //   stackBackCount,
      // );
    }

    left.push(stackDesignCount - designCount);
    left.push(stackFrontCount - frontCount);
    left.push(stackBackCount - backCount);
    // console.log('After left!!!', left);

    // 좋아요 수
    const likeCount = findBoard.likeCount;

    const board: getOneBoard = {
      _id, // 아이디
      title: findBoard.title, // 제목
      nickname, //작성자
      contents: findBoard.contents, // 콘텐츠
      subContents: findBoard.subContents,
      imgUrl: findBoard.imgUrl, // 이미지
      stack: findBoard.stack, // 직무, 인원
      left, // 남은 인원
      period: findBoard.period, // 모집기간
      skills: findBoard.skills,
      likeCount, // 좋아요 수
      referURL: findBoard.referURL,
      createdAt: findBoard.createdAt, // 작성일
    };

    const newLike = likeCount + 1;
    await this.boardModel.updateOne({ _id }, { likeCount: newLike });
    return board;
  }

  // async mateMakeOne(nickname: string, user: any | null): Promise<m> {
  //   const findUser = await this.userModel.findOne({ nickname });
  //   return;
  // }
  // ====================================================================

  // 모달 보드 가져오기
  async getModelBoard(boardId): Promise<getOneBoard | any> {
    try {
      const board = await this.boardMakeOne(boardId, '');
      return board;
    } catch (error) {
      return {
        Status: 401,
        message: '없는 프로젝트 입니다.',
      };
    }
  }

  async updateBoard(id, board: updateBoardDto) {
    // console.log(board);
    const _id = new mongoose.Types.ObjectId(id);

    await this.boardModel.findOneAndUpdate(
      { _id },
      {
        $set: {
          title: board.title,
          contents: board.contents,
          subContents: board.subContents,
          imgUrl: board.imgUrl,
          stack: board.stack,
          period: board.period,
          referURL: board.referURL,
        },
      },
    );

    return { message: '수정이 완료 되었습니다.' };
  }
}
