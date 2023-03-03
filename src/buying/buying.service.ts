import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types as MongooseTypes } from 'mongoose';
import {
  InsufficientProductAmountAvailableError,
  NoProductFoundError,
  ProductsService,
} from '../product/products.service';
import { InsufficientDepositError, UsersService } from '../user/users.service';

@Injectable()
export class BuyingService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}
  async buy(
    buyerId: MongooseTypes.ObjectId,
    productId: string,
    amount: number,
  ): Promise<{
    totalCost: number;
    productName: string;
    purchasedAmount: number;
    change: Array<number>;
  }> {
    // In a production environment with transaction support, you'd want to wrap this in a DB transaction to avoid race conditions
    // Since a local mongodb setup outside of replica sets does not support transactions, I'll leave this out
    const { cost, productName } = await this.productsService
      .reduceAmountAvailable(productId, amount)
      .catch((err) => {
        if (err instanceof NoProductFoundError) {
          throw new NotFoundException(
            `Cannot find product with id ${productId}`,
          );
        }
        if (err instanceof InsufficientProductAmountAvailableError) {
          throw new ForbiddenException(
            `The requested amount of the product is not available. You requested ${amount} while there are only ${err.amountAvailable} available.`,
          );
        }
        throw err;
      });
    const { change } = await this.usersService
      .reduceDeposit(buyerId, cost)
      .catch((err) => {
        if (err instanceof InsufficientDepositError) {
          throw new ForbiddenException(
            `Deposited amount is insufficient to buy selected products. Please deposit ${err.difference} more cents.`,
          );
        }
        throw err;
      });
    return {
      totalCost: cost,
      productName,
      purchasedAmount: amount,
      change: this.calculateChangeArray(change),
    };
  }

  private calculateChangeArray(totalChange: number): Array<number> {
    let remainingChange = totalChange;
    const changeArray = [];
    while (remainingChange >= 100) {
      changeArray.push(100);
      remainingChange -= 100;
    }
    while (remainingChange >= 50) {
      changeArray.push(50);
      remainingChange -= 50;
    }
    while (remainingChange >= 20) {
      changeArray.push(20);
      remainingChange -= 20;
    }

    while (remainingChange >= 10) {
      changeArray.push(10);
      remainingChange -= 10;
    }
    while (remainingChange >= 5) {
      changeArray.push(5);
      remainingChange -= 5;
    }
    return changeArray;
  }
}
