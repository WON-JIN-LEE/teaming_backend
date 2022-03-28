import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Board, BoardSchema } from 'src/schemas/Board.schema';
import { UserInfo, UserInfoSchema } from 'src/schemas/UserInfo.schema';
import { Like, LikeSchema } from 'src/schemas/Like.schema';
import { Project, ProjectSchema } from 'src/schemas/Project.schema';
import { User, UserSchema } from 'src/schemas/User.schema';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    AuthModule,
    HttpModule,
    MongooseModule.forFeature([
      { name: Board.name, schema: BoardSchema },
      { name: User.name, schema: UserSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: UserInfo.name, schema: UserInfoSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
  ],
  exports: [MongooseModule],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}
