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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { BoardsService } from './boards.service';
import { createBoardDto } from './dto/createBoard.dto';
import { updateBoardDto } from './dto/updateBoard.dto';
import { getAllBoard } from './entities/Board.entity';

@Controller('boards')
@ApiTags('Boards API')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}
  // 메인
  @Get()
  @ApiOperation({
    summary: '모든 보드 가져오기 API',
    description: '보드 카테고리 별로 가져옵니다.',
  })
  @ApiResponse({
    description: '보드 카테고리 별로 가져옵니다.',
    type: getAllBoard,
    status: 201,
  })
  getAllBoard() {
    return this.boardsService.getAllBoards();
  }

  // 프로젝트 등록
  @Post()
  @ApiOperation({
    summary: '프로젝트 등록 API',
    description: '보드와 프로젝트를 하나 생성한다',
  })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: '프로젝트가 등록되었습니다.',
  })
  @ApiUnauthorizedResponse({
    description: '포지션이 없어 프로젝트를 생성할 수 없습니다.',
  })
  @UseGuards(JwtAuthGuard)
  createBoard(@Req() req, @Body() board: createBoardDto) {
    // console.log('유저 정보:', req.user.user);
    return this.boardsService.createBoard(board, req.user.user);
  }

  // 보드 상세보기 모달
  @Get(':boardId')
  @ApiParam({
    name: 'boardId',
    required: true,
    description: 'boards의 _id',
  })
  @ApiOperation({
    summary: '보드 상세보기 API',
    description: '프로젝트 상세보기 페이지에 들어갈 데이터들을 response',
  })
  @ApiOkResponse({
    description: '성공!',
  })
  @ApiUnauthorizedResponse({ description: '없는 프로젝트 입니다.' })
  getModelBoard(@Param('boardId') id: string) {
    return this.boardsService.getModelBoard(id);
  }

  // 더보기
  @Get('category/:category/:page')
  @ApiParam({
    name: 'category',
    required: true,
    description: '카데고리 이름',
  })
  @ApiParam({
    name: 'page',
    required: true,
    description: ' 다음 페이지',
  })
  @ApiOperation({
    summary: '카테고리 가져오기 API',
    description: '카테고리에 맞게 board date response',
  })
  @ApiOkResponse({
    description: '성공!',
  })
  @ApiUnauthorizedResponse({ description: '없는 카테고리 입니다.' })
  getBoard(@Param('category') category: string, @Param('page') page: number) {
    let newPage = --page;
    return this.boardsService.getAllCategory(category, newPage);
  }

  // 프로젝트 수정
  @Put(':boardId')
  @UseGuards(JwtAuthGuard)
  @ApiParam({
    name: 'boardId',
    required: true,
    description: 'boards의 _id',
  })
  @ApiOperation({
    summary: '프로젝트 수정하기 API',
    description: '프로젝트 수정하기',
  })
  @ApiOkResponse({
    description: '프로젝트가 수정 되었습니다.',
  })
  @ApiUnauthorizedResponse({ description: '' })
  updataBoard(@Param('boardId') boardId, @Body() board: updateBoardDto) {
    // console.log('=============프로젝트 수정=============');
    return this.boardsService.updateBoard(boardId, board);
  }

  // 프로젝트 삭제
  @Delete(':boardId')
  @ApiParam({
    name: 'boardId',
    required: true,
    description: 'boards의 _id',
  })
  @ApiParam({
    name: 'boardId',
    required: true,
    description: 'boards의 _id',
  })
  @ApiOperation({
    summary: '프로젝트 삭제 API',
    description: '보드와 프로젝트를 삭제',
  })
  @ApiOkResponse({
    description: '삭제완료',
  })
  @ApiUnauthorizedResponse({ description: 'OO님 지울게 없습니다.' })
  @UseGuards(JwtAuthGuard)
  deleteBoard(@Req() req, @Param('boardId') boardId: string) {
    return this.boardsService.deleteBoard(boardId, req.user);
  }
}
