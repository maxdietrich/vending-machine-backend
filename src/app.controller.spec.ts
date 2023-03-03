import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Types as MongooseTypes } from 'mongoose';
import { AppController } from './app.controller';
import { AuthenticatedRequest } from './auth/auth.service';
import { BuyingService } from './buying/buying.service';
import { UserRole } from './user/user.schema';
import { UsersService } from './user/users.service';

jest.mock('./user/users.service');
jest.mock('./buying/buying.service');

describe(AppController.name, () => {
  let appController: AppController;
  let usersService: UsersService;
  let buyingService: BuyingService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [UsersService, BuyingService],
    }).compile();

    appController = module.get<AppController>(AppController);
    usersService = module.get<UsersService>(UsersService);
    buyingService = module.get<BuyingService>(BuyingService);
  });

  describe('POST /deposit', () => {
    it('should throw a ForbiddenException when called by a SELLER', async () => {
      const request: AuthenticatedRequest = {
        user: { userId: new MongooseTypes.ObjectId(), role: UserRole.SELLER },
      } as AuthenticatedRequest;
      try {
        await appController.depositCoin(request, { amount: 50 });
        fail('Should have thrown an error');
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
        expect(e.message).toBe('Only buyers can deposit coins');
      }
    });
    it('should call UsersService.depositToUser', async () => {
      const userId = new MongooseTypes.ObjectId();
      const request: AuthenticatedRequest = {
        user: { userId, role: UserRole.BUYER },
      } as AuthenticatedRequest;
      usersService.depositToUser = jest.fn();
      await appController.depositCoin(request, { amount: 50 });
      expect(usersService.depositToUser).toHaveBeenCalledWith(userId, 50);
    });
  });

  describe('POST /reset', () => {
    it('should throw a ForbiddenException when called by a SELLER', async () => {
      const request: AuthenticatedRequest = {
        user: { userId: new MongooseTypes.ObjectId(), role: UserRole.SELLER },
      } as AuthenticatedRequest;
      try {
        await appController.resetDeposit(request);
        fail('Should have thrown an error');
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
        expect(e.message).toBe('Only buyers can reset their deposit');
      }
    });
    it('should call UsersService.resetDepositForUser', async () => {
      const userId = new MongooseTypes.ObjectId();
      const request: AuthenticatedRequest = {
        user: { userId, role: UserRole.BUYER },
      } as AuthenticatedRequest;
      usersService.resetDepositForUser = jest.fn();
      await appController.resetDeposit(request);
      expect(usersService.resetDepositForUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('POST /buy', () => {
    it('should throw a ForbiddenException when called by a SELLER', async () => {
      const request: AuthenticatedRequest = {
        user: { userId: new MongooseTypes.ObjectId(), role: UserRole.SELLER },
      } as AuthenticatedRequest;
      try {
        await appController.buy(request, { productId: 'abc', amount: 1 });
        fail('Should have thrown an error');
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
        expect(e.message).toBe('Only buyers can buy products');
      }
    });
    it('should call BuyingService.buy', async () => {
      const userId = new MongooseTypes.ObjectId();
      const request: AuthenticatedRequest = {
        user: { userId, role: UserRole.BUYER },
      } as AuthenticatedRequest;
      buyingService.buy = jest.fn();
      await appController.buy(request, { productId: 'abc', amount: 1 });
      expect(buyingService.buy).toHaveBeenCalledWith(userId, 'abc', 1);
    });
  });
});
