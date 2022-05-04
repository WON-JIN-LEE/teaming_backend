import { Injectable } from '@nestjs/common';
import { ChatsRepository } from './repository/chats.repository';

@Injectable()
export class ChatsService {
  constructor(private readonly chatsRepository: ChatsRepository) {}

  async getStackJoinUser(userData: string) {
    const { user, userInfoStack } = await this.chatsRepository.getUserStack(
      userData,
    );

    const payload = {
      userId: String(user._id),
      nickname: user.nickname,
      profileUrl: user.profileUrl,
      position: userInfoStack.position,
      stack: userInfoStack.stack,
    };

    return payload;
  }
}
