import { Project } from './../schemas/Project.schema';
import { UserInfo } from './../schemas/UserInfo.schema';
import { User } from './../schemas/User.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioScrap } from './func/portfolio.scrap';
import { UserStack } from './func/stack.score';
import { UsersRepository } from './repository/users.repository';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { UpdateUserInfoDto } from './dto/updateUserInfo.dto';
import { SuveyInfoDto } from './dto/suveyInfo.dto';
const httpMocks = require('node-mocks-http');

describe('UsersService', () => {
  let userService: UsersService;

  const mockUsersRepository = {
    updateSuveyCheckByObjectId: jest.fn(),
    newUserInfoByObjectId: jest.fn(),
    deleteUserByObjectId: jest.fn(),
    deleteUserInfoByObjectId: jest.fn(),
    updateNicknameAndPorfileUrl: jest.fn(),
    updateUserInfo: jest.fn(),
    getUserInfoModel: jest.fn().mockImplementation(() => {
      return { _id: 'wq23re34t5', userId: 'test' };
    }),
    getProjectModel: jest.fn().mockImplementation(() => {
      return { _id: 'wq23re34t5' };
    }),
  };

  const mockRequest = httpMocks.createRequest();
  mockRequest.user = { user: { _id: '54fds3dsf5sad43', nickname: 'test' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        UsersRepository,
        PortfolioScrap,
        UserStack,
        {
          provide: getModelToken(User.name),
          useValue: {
            mockUsersRepository,
          },
        },
        {
          provide: getModelToken(UserInfo.name),
          useValue: {
            mockUsersRepository,
          },
        },
        {
          provide: getModelToken(Project.name),
          useValue: {
            mockUsersRepository,
          },
        },
      ],
    })
      .overrideProvider(UsersRepository)
      .useValue(mockUsersRepository)
      .compile();

    userService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('updateUser', () => {
    it('should be an success msg', () => {
      const updateUserInfo: UpdateUserInfoDto = {
        nickname: 'test',
        introduction: 'test',
        profileUrl: 'test',
        position: 'back',
        front: {
          ability: [{ name: 'test', time: 'test', rate: 'test' }],
          skills: [{ name: 'test', time: 'test', rate: 'test' }],
        },
        back: {
          ability: [{ name: 'test', time: 'test', rate: 'test' }],
          skills: [{ name: 'test', time: 'test', rate: 'test' }],
        },
        design: {
          skills: [{ name: 'test', time: 'test', rate: 'test' }],
        },
        portfolioUrl: [],
        url: 'https://www.youtube.com/watch?v=dXOfOgFFKuY',
      };
      const result = userService.updateUser(updateUserInfo, mockRequest);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('insertInfo', () => {
    it('should be an Promise', () => {
      const suveyInfoDto: SuveyInfoDto = {
        position: 'back',
        front: {
          ability: [{ name: 'test', time: 'test', rate: 'test' }],
          skills: [{ name: 'test', time: 'test', rate: 'test' }],
        },
        back: {
          ability: [{ name: 'test', time: 'test', rate: 'test' }],
          skills: [{ name: 'test', time: 'test', rate: 'test' }],
        },
        design: {
          skills: [{ name: 'test', time: 'test', rate: 'test' }],
        },
        portfolioUrl: [],
        url: 'https://www.youtube.com/watch?v=dXOfOgFFKuY',
      };
      const result = userService.insertInfo(suveyInfoDto, mockRequest);
      expect(result).toBeInstanceOf(Promise);
    });
  });
  describe('getUserInfo', () => {
    it('should be an Promise<object>', () => {
      const result = userService.getUserInfo(mockRequest);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('userDelete', () => {
    it('should be an object', () => {
      const result = userService.deleteUser(mockRequest);
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('getMemberInfo', () => {
    it('should be an Promise', () => {
      const userId = '629092b8cae79017957a51f3';
      const result = userService.getMemberInfo(userId);
      expect(result).toBeInstanceOf(Promise);
    });

    it('Wrong userId data', () => {
      const userId = '1q2w2e3r3r';
      const result = userService.getMemberInfo(userId);
      result.then((res) => {
        expect(res).toEqual({
          msg: `userId가 잘못되었습니다.`,
        });
      });
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
