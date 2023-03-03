import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class Product {
  @Prop()
  amountAvailable: number;

  @Prop()
  cost: number;

  @Prop()
  productName: string;

  @Prop()
  sellerId: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
