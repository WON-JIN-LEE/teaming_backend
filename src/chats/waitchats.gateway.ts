import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { InjectModel } from '@nestjs/mongoose';
import { Socket, Server } from 'socket.io';
import { Chat } from 'src/schemas/Chat.schema';

// 대기방 채팅
@WebSocketGateway({
  namespace: 'waitroom',
  cors: {
    origin: ['https://teaming.link', 'http://localhost:3000'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
})
export class WaitchatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('Waitroom chatting');

  constructor(@InjectModel(Chat.name) private readonly chatModel: Model<Chat>) {
    this.logger.log('constructor');
  }

  afterInit() {
    this.logger.log('init');
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log('Func: handleDisconnect start');
    this.logger.log(`disconnected : ${socket.id} ${socket.nsp.name}`);

    const room = await this.chatModel.findOne({
      projectId: socket['myRoomName'],
    });

    //떠난 유저 제거한 배열로 DB에 Update
    const deleteUser = room.participantList.filter(
      (user) => user['name'] !== socket['myNickname'],
    );
    await this.chatModel.findOneAndUpdate(
      { projectId: socket['myRoomName'] },
      {
        $set: { participantList: deleteUser },
      },
    );

    socket.leave(socket['myRoomName']);

    // 메시지를 전송한 클라이언트를 제외한 room안의 모든 클라이언트에게 메시지를 전송한다.
    socket.broadcast.to(socket['myRoomName']).emit('message', {
      user: socket['myNickname'],
      text: `${socket['myNickname']} 님이 방을 나갔습니다.`,
    });

    // 인원이 0이 대화내용 삭제 ?
    const roomData = await this.chatModel.findOne({
      projectId: socket['myRoomName'],
    });

    // console.log('✅=========roomData==============✅');
    console.log(roomData);
    // console.log('✅=========roomData==============✅');
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log('Func: handleConnection start');
    this.logger.log(`connected : ${socket.id} ${socket.nsp.name}`);
  }

  @SubscribeMessage('join')
  async handleJoinRoom(
    @MessageBody() data: { name: string; room: string; title: string },
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log('Func: handleJoinRoom start');

    // 연결된 클라이언트 이름과 방 정보를 소켓 객체에 저장
    socket['myNickname'] = data.name;
    socket['myRoomName'] = data.room;
    socket['myTitle'] = data.title;

    // 임시 DB연산 ====================================
    const roomExists = await this.chatModel.findOne({
      projectId: socket['myRoomName'],
    });

    if (!roomExists) {
      this.logger.log('await this.chatModel.create start');

      // room DB에 저장
      await this.chatModel.create({
        projectId: socket['myRoomName'],
        participantList: [
          {
            name: socket['myNickname'],
            socketId: socket.id,
          },
        ],
        messageData: [],
      });
    } else {
      const tempObj = {
        name: socket['myNickname'],
        socketId: socket.id,
      };

      //db에 참가한 유저 추가
      await this.chatModel.findOneAndUpdate(
        { projectId: socket['myRoomName'] },
        {
          $push: {
            participantList: tempObj,
          },
        },
      );
    }

    const roomData = await this.chatModel.findOne({
      projectId: socket['myRoomName'],
    });

    socket.join(socket['myRoomName']);

    // 메시지를 전송한 클라이언트에게만 메시지를 전송한다.
    socket.emit('message', {
      user: socket['myNickname'],
      text: `${socket['myNickname']}, ${socket['myTitle']}에 오신걸 환영합니다.`,
    });

    // 메시지를 전송한 클라이언트를 제외한 room안의 모든 클라이언트에게 메시지를 전송한다.
    socket.broadcast.to(socket['myRoomName']).emit('message', {
      user: socket['myNickname'],
      text: `${socket['myNickname']} 님이 가입하셨습니다.`,
    });

    // to all clients in room except the sender
    socket.to(socket['myRoomName']).emit('roomData', {
      room: socket['myRoomName'],
      users: roomData.participantList,
    });
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { sender: string; room: string; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log('Func: handleMessage start');

    const payload = {
      sender: socket['myNickname'],
      text: data.message,
      date: new Date().toTimeString(),
    };
    await this.chatModel.findOneAndUpdate(
      { projectId: socket['myRoomName'] },
      {
        $push: { messageData: payload },
      },
    );

    socket.broadcast.to(socket['myRoomName']).emit('message', payload);
  }
}
