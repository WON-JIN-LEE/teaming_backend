import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { LikeService } from './like.service';

@Controller('like')
@ApiTags('Like API')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiOperation({
    summary: '좋아요 API',
    description: '좋아요',
  })
  @ApiParam({
    name: 'boardId',
    required: true,
    description: 'boards의 _id',
  })
  @Post(':boardId')
  @UseGuards(JwtAuthGuard)
  plusLike(@Req() req, @Param('boardId') boardId) {
    const user = req.user.user;
    return this.likeService.plusLike(user, boardId);
  }
}
