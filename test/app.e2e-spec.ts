import { User } from './../src/schemas/User.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { AuthRepository } from '../src/auth/repository/auth.repository';

describe('AppController (e2e)', () => {
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
      imports: [AppModule],
      providers: [AuthRepository],
    })
      .overrideProvider(AuthRepository)
      .useValue(mockAuthRepository)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe()); //validation 전역* 설정

    await app.init();
  });

  it('/ (Get)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Welcome!! This is Teaming server');
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
