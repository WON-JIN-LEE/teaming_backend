/*
author : @WON-JIN-LEE
description : 회원관리 API Controller 정의
updateAt : 2022-04-15
*/

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserKakaoDto } from './dto/auth-userkakao.dto';
import { GetUser } from './get-user.decorator';
import { SuccessInterceptor } from '../common/interceptors/success.interceptor';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { AuthSignInDto } from './dto/auth-signin.dto';
import {
  ApiDefaultResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { KakaoAuthGuard } from './guards/kakao.guard';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
@ApiTags('Auth API')
@UseInterceptors(SuccessInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: '회원가입 API',
    description: '회원가입 입니다.',
  })
  @ApiOkResponse({ description: '회원가입 성공' })
  @Post('/signup')
  signUp(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<object> {
    return this.authService.signUp(authCredentialsDto);
  }

  @ApiOperation({
    summary: '로그인 API',
    description: '',
  })
  @ApiOkResponse({ description: '로그인 성공' })
  @ApiDefaultResponse({ description: '로그인 실패' })
  @Post('/signin')
  signIn(@Body(ValidationPipe) authSignInDto: AuthSignInDto): Promise<object> {
    return this.authService.signIn(authSignInDto);
  }

  @ApiOperation({
    summary: '카카오 아이디 로그인 API',
    description: '',
  })
  @Get('/kakao')
  @HttpCode(200)
  @UseGuards(KakaoAuthGuard)
  kakaoLogin() {
    return HttpStatus.OK;
  }

  @ApiOperation({
    summary: '카카오 아이디 로그인 콜백 API',
    description: '',
  })
  @ApiOkResponse({ description: '카카오 로그인 성공' })
  @Get('/kakao/redirect')
  @HttpCode(200)
  @UseGuards(KakaoAuthGuard)
  kakaoLoginCallback(@GetUser() user: UserKakaoDto): Promise<object> {
    return this.authService.kakaoLogin(user);
  }

  @ApiOperation({
    summary: '카카오 아이디 로그아웃 API',
    description: '',
  })
  @ApiOkResponse({ description: '카카오 로그아웃 완료' })
  @Get('/kakao/logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  kakaoLogout(@GetUser() user: UserKakaoDto): Promise<object> {
    return this.authService.kakaoLogout(user);
  }
}
