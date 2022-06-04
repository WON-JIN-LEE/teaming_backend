import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Board, BoardSchema } from '../schemas/Board.schema';
import { UserInfo, UserInfoSchema } from '../schemas/UserInfo.schema';
import { Like, LikeSchema } from '../schemas/Like.schema';
import { Project, ProjectSchema } from '../schemas/Project.schema';
import { User, UserSchema } from '../schemas/User.schema';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Board.name, schema: BoardSchema },
      { name: User.name, schema: UserSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: UserInfo.name, schema: UserInfoSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
  ],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}
