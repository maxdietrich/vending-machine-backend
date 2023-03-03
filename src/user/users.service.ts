import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types as MongooseTypes } from 'mongoose';
import { DepositAmount } from 'src/deposit.dto';
import { hashPassword } from './password.helper';
import { User, UserRole } from './user.schema';

export class UsernameAlreadyExistsError extends Error {}
export class InsufficientDepositError extends Error {
  constructor(readonly difference: number) {
    super();
  }
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createUser(username: string, rawPassword: string, role: UserRole) {
    const usernameAlreadyExists = await this.checkIfUsernameAlreadyExists(
      username,
    );
    if (usernameAlreadyExists) throw new UsernameAlreadyExistsError();
    const user: User = {
      username,
      role,
      encrypted_password: await hashPassword(rawPassword),
      deposit: 0,
    };
    await this.userModel.create(user);
  }

  async depositToUser(userId: MongooseTypes.ObjectId, amount: DepositAmount) {
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { deposit: amount },
    });
  }

  async resetDepositForUser(userId: MongooseTypes.ObjectId) {
    await this.userModel.findByIdAndUpdate(userId, {
      $set: { deposit: 0 },
    });
  }

  async reduceDeposit(
    userId: MongooseTypes.ObjectId,
    productCost: number,
  ): Promise<{ change: number }> {
    const user = await this.userModel.findById(userId).lean();
    const change = user.deposit - productCost;
    if (change < 0) throw new InsufficientDepositError(-change);
    await this.userModel.findByIdAndUpdate(userId, { $set: { deposit: 0 } });
    return { change };
  }

  getUser(userId: MongooseTypes.ObjectId) {
    return this.userModel.findOne({ _id: userId }).lean();
  }

  async deleteUser(userId: MongooseTypes.ObjectId) {
    await this.userModel.deleteOne({ _id: userId });
  }

  async updatePassword(userId: MongooseTypes.ObjectId, newPassword: string) {
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { encrypted_password: await hashPassword(newPassword) } },
    );
  }

  async findByUsername(username: string) {
    return this.userModel.findOne({ username }).lean();
  }

  private async checkIfUsernameAlreadyExists(
    username: string,
  ): Promise<boolean> {
    const existingUser = await this.userModel.exists({ username });
    return !!existingUser;
  }
}
