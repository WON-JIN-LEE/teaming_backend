import { UserInfo, UserInfoSchema } from './../schemas/UserInfo.schema';
import { AuthModule } from './../auth/auth.module';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/User.schema';
import { PortfolioScrap } from './func/portfolio.scrap';
import { HttpModule } from '@nestjs/axios';
import { Board, BoardSchema } from 'src/schemas/Board.schema';
import { Project, ProjectSchema } from 'src/schemas/Project.schema';
import { UsersRepository } from './repository/users.repository';
import { UserStack } from './func/stack.score';

@Module({
  imports: [
    AuthModule,
    HttpModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserInfo.name, schema: UserInfoSchema },
      { name: Board.name, schema: BoardSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, PortfolioScrap, UsersRepository, UserStack],
})
export class UsersModule {}
