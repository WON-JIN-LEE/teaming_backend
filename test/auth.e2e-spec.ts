import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthRepository } from '../src/auth/repository/auth.repository';
import { AuthModule } from '../src/auth/auth.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const mockAuthRepository = {
    createTeamingUser: jest.fn().mockImplementation(() => {
      return {
        _id: '1q2w3e4r',
      };
    }),
    createUserInfo: jest.fn(),
  };
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        MongooseModule.forRoot(
          `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PW}@${process.env.MONGODB_KEY}:${process.env.MONGODB_PORT}`,
          {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ignoreUndefined: true,
            dbName: process.env.TEAMING_DB,
          },
        ),
      ],
      providers: [],
    })
      .overrideProvider(AuthRepository)
      .useValue(mockAuthRepository)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe()); //validation 전역* 설정

    await app.init();
  });

  describe('/auth/signup', () => {
    it('POST 201', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'kin1@test.com',
          nickname: 'kin1',
          password: '1234',
          passwordCheck: '1234',
          profileUrl: '',
        })
        .expect(201);
    });
  });
});
