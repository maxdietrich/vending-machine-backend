import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Types as MongooseTypes } from 'mongoose';
import {
  InsufficientProductAmountAvailableError,
  NoProductFoundError,
  ProductsService,
} from '../product/products.service';
import { InsufficientDepositError, UsersService } from '../user/users.service';
import { BuyingService } from './buying.service';

jest.mock('../product/products.service');
jest.mock('../user/users.service');

describe(BuyingService.name, () => {
  let buyingService: BuyingService;
  let productsService: ProductsService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [BuyingService, ProductsService, UsersService],
    }).compile();

    buyingService = module.get<BuyingService>(BuyingService);
    productsService = module.get<ProductsService>(ProductsService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('buy', () => {
    it('should throw a NotFoundException if no product can be found for the given id', async () => {
      const buyerId = new MongooseTypes.ObjectId();
      productsService.reduceAmountAvailable = jest
        .fn()
        .mockRejectedValueOnce(new NoProductFoundError());
      try {
        await buyingService.buy(buyerId, 'nonexistant', 2);
        fail('It should have thrown an error');
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });
    it('should throw a ForbiddenException if no product can be found for the given id', async () => {
      const buyerId = new MongooseTypes.ObjectId();
      productsService.reduceAmountAvailable = jest
        .fn()
        .mockRejectedValueOnce(new InsufficientProductAmountAvailableError(1));
      try {
        await buyingService.buy(buyerId, 'existant', 2);
        fail('It should have thrown an error');
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
    it('should throw a ForbiddenException if the user deposit is insufficient', async () => {
      const buyerId = new MongooseTypes.ObjectId();
      productsService.reduceAmountAvailable = jest
        .fn()
        .mockResolvedValueOnce({ cost: 10 });
      usersService.reduceDeposit = jest
        .fn()
        .mockRejectedValueOnce(new InsufficientDepositError(8));
      try {
        await buyingService.buy(buyerId, 'existant', 2);
        fail('It should have thrown an error');
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
    it('should return the change else', async () => {
      const buyerId = new MongooseTypes.ObjectId();
      productsService.reduceAmountAvailable = jest
        .fn()
        .mockResolvedValueOnce({ cost: 10, productName: 'banana' });
      usersService.reduceDeposit = jest
        .fn()
        .mockResolvedValueOnce({ change: 10 });
      expect(await buyingService.buy(buyerId, 'existant', 2)).toEqual({
        change: [10],
        productName: 'banana',
        purchasedAmount: 2,
        totalCost: 10,
      });
    });
    it('should return change in the least amount of coins', async () => {
      const buyerId = new MongooseTypes.ObjectId();
      productsService.reduceAmountAvailable = jest
        .fn()
        .mockResolvedValueOnce({ cost: 10, productName: 'banana' });
      usersService.reduceDeposit = jest
        .fn()
        .mockResolvedValueOnce({ change: 185 });
      expect(await buyingService.buy(buyerId, 'existant', 2)).toEqual({
        change: [100, 50, 20, 10, 5],
        productName: 'banana',
        purchasedAmount: 2,
        totalCost: 10,
      });
    });
  });
});
