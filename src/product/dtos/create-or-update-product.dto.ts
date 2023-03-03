import { IsInt, IsPositive, IsString } from 'class-validator';

export class CreateOrUpdateProductDto {
  @IsInt()
  @IsPositive()
  amountAvailable: number;

  @IsInt()
  @IsPositive()
  cost: number;

  @IsString()
  productName: string;
}
