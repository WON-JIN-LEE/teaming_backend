import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ProjectsService } from './projects.service';

@Controller('projects')
@ApiTags('Projects API')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // 프로젝트 인원 추가
  @Post('projectIn/:boardId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '프로젝트 참가 인원 추가',
    description: '프로젝트에 인원 추가',
  })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: '프로젝트에 참여 완료 했습니다.',
  })
  @ApiUnauthorizedResponse({
    description: '프로젝트에 참여 하실 수 없습니다.',
  })
  async addProjectPerson(@Param('boardId') projectId, @Req() req) {
    return await this.projectsService.addProjectPerson(
      req.user.user,
      projectId,
    );
  }

  @Get(':boardId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '프로젝트 방장확인',
    description: '프로젝트에 참가 확인과 방장 확인',
  })
  async project(@Req() req, @Param('boardId') id) {
    return await this.projectsService.project(req.user.user, id);
  }

  @Post('projectOut/:boardId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '프로젝트 나가기',
    description: '프로젝트 나가기',
  })
  async outProject(@Req() req, @Param('boardId') id) {
    return await this.projectsService.outProject(req.user.user, id);
  }

  @Post('start/:boardId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '프로젝트 시작',
    description: 'response: 프로젝트 시작시간, 시작되었습니다.',
  })
  async startProject(@Req() req, @Param('boardId') id) {
    return await this.projectsService.startProject(req.user.user, id);
  }
}
