import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Model } from 'mongoose';
import { Board, BoardDocument } from '../schemas/Board.schema';
import { Like, LikeDocument } from '../schemas/Like.schema';
import { User, UserDocument } from '../schemas/User.schema';

@Injectable()
export class LikeService {
  constructor(
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
  ) {}

  async plusLike(user, id): Promise<any> {
    const userId = new mongoose.Types.ObjectId(user._id);
    const boardId = new mongoose.Types.ObjectId(id);
    const like = new this.likeModel({
      userId,
      boardId,
    });
    like.save();
    return {
      status: 201,
      message: '좋아요 +1',
    };
  }
}
