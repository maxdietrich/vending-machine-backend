import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedRequest } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { BuyDto } from './buying/buy.dto';
import { BuyingService } from './buying/buying.service';
import { DepositDto } from './deposit.dto';
import { UserRole } from './user/user.schema';
import { UsersService } from './user/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly usersService: UsersService,
    private readonly buyingService: BuyingService,
  ) {}

  @Post('deposit')
  @UseGuards(JwtAuthGuard)
  async depositCoin(
    @Req() request: AuthenticatedRequest,
    @Body() dto: DepositDto,
  ) {
    if (request.user?.role !== UserRole.BUYER)
      throw new ForbiddenException(`Only buyers can deposit coins`);
    await this.usersService.depositToUser(request.user?.userId, dto.amount);
  }

  @Post('reset')
  @UseGuards(JwtAuthGuard)
  async resetDeposit(@Req() request: AuthenticatedRequest) {
    if (request.user?.role !== UserRole.BUYER)
      throw new ForbiddenException(`Only buyers can reset their deposit`);
    await this.usersService.resetDepositForUser(request.user?.userId);
  }

  @Post('buy')
  @UseGuards(JwtAuthGuard)
  async buy(@Req() request: AuthenticatedRequest, @Body() dto: BuyDto) {
    if (request.user?.role !== UserRole.BUYER)
      throw new ForbiddenException(`Only buyers can buy products`);
    return this.buyingService.buy(
      request.user?.userId,
      dto.productId,
      dto.amount,
    );
  }
}
