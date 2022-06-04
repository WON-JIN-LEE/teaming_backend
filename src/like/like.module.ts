import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Board, BoardSchema } from '../schemas/Board.schema';
import { Like, LikeSchema } from '../schemas/Like.schema';
import { User, UserSchema } from '../schemas/User.schema';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Like.name, schema: LikeSchema },
      { name: User.name, schema: UserSchema },
      { name: Board.name, schema: BoardSchema },
    ]),
  ],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
