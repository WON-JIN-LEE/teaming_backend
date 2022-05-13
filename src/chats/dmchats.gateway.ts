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
import { User } from 'src/schemas/User.schema';
import { DmChat } from 'src/schemas/DmChat.schema';

@WebSocketGateway({
  namespace: '',
  cors: {
    origin: ['https://teaming.link', 'http://localhost:3000'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
})
export class DmChatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private connectedUserList: any;
  private logger = new Logger('dmchatting');

  constructor(
    @InjectModel(DmChat.name)
    private readonly dmChatModel: Model<DmChat>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {
    this.logger.log('constructor');
    this.connectedUserList = [];
  }

  afterInit() {
    this.logger.log('init');
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log('Func: handleDisconnect start');
    this.logger.log(`disconnected : ${socket.id} ${socket.nsp.name}`);

    const { participantList } = await this.dmChatModel.findOne({
      projectId: socket['myRoomName'],
    });

    //떠난 유저 제거한 배열로 DB에 Update
    const deleteUser = participantList.filter(
      (user) => user !== socket['myNickname'],
    );
    await this.dmChatModel.findOneAndUpdate(
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
  }

  handleConnection(@MessageBody() data, @ConnectedSocket() socket: Socket) {
    this.logger.log('Func: handleConnection start');
    this.logger.log(`connected : ${socket.id} ${socket.nsp.name}`);
  }

  @SubscribeMessage('join')
  async handleMessage(
    @MessageBody() data: { sendUser: string; receiveUser: string },
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log('Func: handleMessage start');

    // 연결된 클라이언트 이름과 방 정보를 소켓 객체에 저장
    socket['myNickname'] = data.sendUser;
    socket['myRoomName'] =
      data.sendUser < data.receiveUser
        ? data.sendUser + '&' + data.receiveUser
        : data.receiveUser + '&' + data.sendUser;

    // 임시 DB연산 ====================================
    const roomExists = await this.dmChatModel.findOne({
      projectId: socket['myRoomName'],
    });
    if (!roomExists) {
      // room DB에 저장
      await this.dmChatModel.create({
        room: socket['myRoomName'],
        participantList: [],
        messageData: [],
      });
    } else {
      //db에 참가한 유저 추가
      await this.dmChatModel.findOneAndUpdate(
        { projectId: socket['myRoomName'] },
        {
          $push: { participantList: socket['myNickname'] },
        },
      );
    }
    // ====================================
    const roomData = await this.dmChatModel.findOne({
      projectId: socket['myRoomName'],
    });
    socket.join(socket['myRoomName']);

    // to all clients in room except the sender
    socket.to(socket['myRoomName']).emit('roomData', {
      room: socket['myRoomName'],
      users: roomData.participantList,
    });

    console.log('✅=========roomData==============✅');
    console.log(roomData);
    console.log('✅=========roomData==============✅');
  }

  @SubscribeMessage('sendMessage')
  async handleJoinMessage(
    @MessageBody() data: { sender: string; room: string; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log('Func: handleJoinMessage start');

    const payload = {
      sender: socket['myNickname'],
      text: data.message,
      date: new Date().toTimeString(),
    };

    await this.dmChatModel.findOneAndUpdate(
      { projectId: socket['myRoomName'] },
      {
        $push: { messageData: payload },
      },
    );

    socket.broadcast.to(socket['myRoomName']).emit('message', payload);
  }
}
