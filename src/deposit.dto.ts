import { IsEnum } from 'class-validator';

export enum DepositAmount {
  FIVE = 5,
  TEN = 10,
  TWENTY = 20,
  FIFTY = 50,
  HUNDRED = 100,
}

export class DepositDto {
  @IsEnum(DepositAmount)
  amount: number;
}
