import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Board, BoardSchema } from '../schemas/Board.schema';
import { Project, ProjectSchema } from '../schemas/Project.schema';
import { User, UserSchema } from '../schemas/User.schema';
import { UserInfo, UserInfoSchema } from '../schemas/UserInfo.schema';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Board.name, schema: BoardSchema },
      { name: User.name, schema: UserSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: UserInfo.name, schema: UserInfoSchema },
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
