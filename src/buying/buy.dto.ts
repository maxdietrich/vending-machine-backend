import { IsInt, IsPositive, IsString } from 'class-validator';

export class BuyDto {
  @IsString()
  productId: string;

  @IsInt()
  @IsPositive()
  amount: number;
}
