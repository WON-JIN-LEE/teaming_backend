import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export type UserInfoDocument = UserInfo & Document;

const options: SchemaOptions = {
  collection: 'userinfos',
  timestamps: true,
};
@Schema(options)
export class UserInfo extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  @IsNotEmpty()
  userId: ObjectId;

  @Prop()
  position: string;

  @Prop({
    default: {},
    type: {
      _id: false,
      ability: {
        type: [
          {
            _id: false,
            name: String,
            time: String || Number,
            rate: String || Number,
          },
        ],
      },
      skills: {
        type: [
          {
            _id: false,
            name: String,
            time: String || Number,
            rate: String || Number,
          },
        ],
      },
    },
  })
  front: object;

  @Prop({
    default: {},
    type: {
      _id: false,
      ability: {
        type: [
          {
            _id: false,
            name: String,
            time: String || Number,
            rate: String || Number,
          },
        ],
      },
      skills: {
        type: [
          {
            _id: false,
            name: String,
            time: String || Number,
            rate: String || Number,
          },
        ],
      },
    },
  })
  back: object;

  @Prop({
    default: {},
    type: {
      _id: false,
      skills: {
        type: [
          {
            _id: false,
            name: String,
            time: String || Number,
            rate: String || Number,
          },
        ],
      },
    },
  })
  design: object;

  @Prop({
    default: [],
    type: [
      {
        _id: false,
        title: String || null,
        image: String || null,
        description: String || null,
        url: String || null,
        period: String || null,
      },
    ],
  })
  portfolioUrl: [];

  @Prop({
    default: null,
  })
  url: string;
}

export const UserInfoSchema = SchemaFactory.createForClass(UserInfo);
