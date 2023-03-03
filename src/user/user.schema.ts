import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
}

@Schema({ versionKey: false })
export class User {
  @Prop({ unique: true })
  username: string;

  @Prop()
  encrypted_password: string;

  @Prop()
  deposit: number;

  @Prop()
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
