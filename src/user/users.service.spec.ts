import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types as MongooseTypes } from 'mongoose';
import { User } from './user.schema';
import { UsersService } from './users.service';

describe(UsersService.name, () => {
  let usersService: UsersService;

  const mockModel: Record<string, any> = {};

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockModel },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  describe('depositToUser', () => {
    it('should call the Model and increment the deposit value', async () => {
      const userId = new MongooseTypes.ObjectId();
      mockModel.findByIdAndUpdate = jest.fn();
      await usersService.depositToUser(userId, 20);
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        $inc: { deposit: 20 },
      });
    });
  });

  describe('resetDepositForUser', () => {
    it('should call the Model and set the deposit value to 0', async () => {
      const userId = new MongooseTypes.ObjectId();
      mockModel.findByIdAndUpdate = jest.fn();
      await usersService.resetDepositForUser(userId);
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        $set: { deposit: 0 },
      });
    });
  });
});
