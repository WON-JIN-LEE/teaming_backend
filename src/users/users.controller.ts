import { Request } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiDefaultResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { SuccessInterceptor } from 'src/common/interceptors/success.interceptor';
import { SuveyInfoDto } from './dto/suveyInfo.dto';
import { UpdateUserInfoDto } from './dto/updateUserInfo.dto';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users API')
@UseInterceptors(SuccessInterceptor)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({
    summary: '유저 정보 Update API',
    description: '유저 infomation을 모두 수정 할 수 있다.',
  })
  @ApiOkResponse({ description: '정보 수정 성공' })
  @ApiDefaultResponse({ description: '정보 수정 실패' })
  @Put('/')
  @UseGuards(JwtAuthGuard)
  userUpdate(
    @Body(ValidationPipe) updateUserInfoDto: UpdateUserInfoDto,
    @Req() req: Request,
  ): Promise<any> {
    return this.usersService.updateUser(updateUserInfoDto, req);
  }

  @ApiOperation({
    summary: '회원탈퇴 API',
    description: 'db 유저 데이터 삭제',
  })
  @ApiOkResponse({ description: '회원탈퇴 성공' })
  @ApiDefaultResponse({ description: '회원탈퇴 실패' })
  @Delete('/')
  @UseGuards(JwtAuthGuard)
  userDelete(@Req() req: Request): object {
    return this.usersService.deleteUser(req);
  }

  @ApiOperation({
    summary: '설문조사 API',
    description: ' 유저의 설문 data를 db에 저장',
  })
  @ApiOkResponse({ description: '설문조사 성공' })
  @ApiDefaultResponse({ description: '설문조사 실패' })
  @Post('/suvey')
  @UseGuards(JwtAuthGuard)
  suveyUser(
    @Body(ValidationPipe) suveyInfoDto: SuveyInfoDto,
    @Req() req: Request,
  ): Promise<any> {
    return this.usersService.insertInfo(suveyInfoDto, req);
  }

  @ApiOperation({
    summary: '팀원 정보조회 API',
    description: '다른 사용자의 정보를 가져온다.',
  })
  @ApiOperation({
    summary: 'mypage 정보 조회 API',
    description: '나의 정보를 가져온다.',
  })
  @ApiOkResponse({ description: 'mypage 정보 조회 성공' })
  @ApiDefaultResponse({ description: 'mypage 정보 조회 실패' })
  @Get('/mypage')
  @UseGuards(JwtAuthGuard)
  getMyInfo(@Req() req: Request): Promise<any> {
    return this.usersService.getUserInfo(req);
  }

  @ApiOkResponse({ description: '팀원 정보조회 성공' })
  @ApiDefaultResponse({ description: '팀원 정보조회 실패' })
  @Get('/:userId')
  getUserInfo(@Param() { userId }): Promise<any> {
    return this.usersService.getMemberInfo(userId);
  }
}
