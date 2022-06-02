import { Project, ProjectSchema } from '../schemas/Project.schema';
import { Board, BoardSchema } from '../schemas/Board.schema';
import { UserInfo, UserInfoSchema } from '../schemas/UserInfo.schema';
import { HttpModule } from '@nestjs/axios';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../schemas/User.schema';
import { PortfolioScrap } from './func/portfolio.scrap';
import { UserStack } from './func/stack.score';
import { UsersRepository } from './repository/users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let userService: UsersService;
  let userRepo: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        PortfolioScrap,
        UserStack,
        UsersRepository,
        {
          provide: getModelToken(User.name),
          useClass: UserModel,
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    userRepo = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });
});
