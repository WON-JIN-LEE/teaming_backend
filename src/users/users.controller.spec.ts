import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateUserInfoDto } from './dto/updateUserInfo.dto';
import { SuveyInfoDto } from './dto/suveyInfo.dto';
const httpMocks = require('node-mocks-http');

describe('UsersController', () => {
  let controller: UsersController;

  const mockUserService = {
    updateUser: jest.fn().mockImplementation((dto, req) => {
      return {
        msg: `${dto.nickname} 회원정보 수정 완료`,
      };
    }),

    deleteUser: jest.fn().mockImplementation((req) => {
      return {
        msg: `${req.user.user.nickname} 회원탈퇴 완료`,
      };
    }),
    insertInfo: jest.fn().mockImplementation((dto, req) => {
      return {
        msg: `${dto.position} 설문조사 완료`,
      };
    }),
    getUserInfo: jest.fn().mockImplementation((dto, req) => {
      return {
        msg: ` 회원정보 조회 완료`,
      };
    }),

    getMemberInfo: jest.fn().mockImplementation((dto, req) => {
      return {
        msg: ` 회원정보 조회 완료`,
      };
    }),
  };
  const mockRequest = httpMocks.createRequest();
  mockRequest.user = { user: { _id: '54fds3dsf5sad43', nickname: 'test' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUserService)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('userUpdate', () => {
    it('should be an object msg', () => {
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
      const result = controller.userUpdate(updateUserInfo, mockRequest);
      expect(result).toEqual({ msg: 'test 회원정보 수정 완료' });
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('userDelete', () => {
    it('should be an delete msg', () => {
      const result = controller.userDelete(mockRequest);
      expect(result).toEqual({ msg: 'test 회원탈퇴 완료' });
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('suveyUser', () => {
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
    it('should be an success msg', () => {
      const result = controller.suveyUser(suveyInfoDto, mockRequest);
      expect(result).toEqual({ msg: 'back 설문조사 완료' });
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('getMyInfo', () => {
    it('should be an success msg', () => {
      const result = controller.getMyInfo(mockRequest);
      expect(result).toEqual({
        msg: ` 회원정보 조회 완료`,
      });
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('getUserInfo', () => {
    it('should be an success msg', () => {
      const result = controller.getUserInfo({ userId: 'dsafsdagd' });
      expect(result).toEqual({
        msg: ` 회원정보 조회 완료`,
      });
      expect(result).toBeInstanceOf(Object);
    });
  });
});
