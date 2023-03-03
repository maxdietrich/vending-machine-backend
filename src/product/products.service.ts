import { InjectModel } from '@nestjs/mongoose';
import { Model, Types as MongooseTypes } from 'mongoose';
import { CreateOrUpdateProductDto } from './dtos/create-or-update-product.dto';
import { Product } from './product.schema';

export class NoProductFoundError extends Error {}
export class InsufficientProductAmountAvailableError extends Error {
  constructor(readonly amountAvailable: number) {
    super();
  }
}

export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}
  async createProduct(
    amountAvailable: number,
    cost: number,
    productName: string,
    sellerId: string,
  ) {
    const product: Product = {
      amountAvailable,
      cost,
      productName,
      sellerId,
    };
    await this.productModel.create(product);
  }

  getAllProducts() {
    return this.productModel.find().lean();
  }

  getProduct(productId: string) {
    return this.productModel.findById(productId).lean();
  }

  async updateProduct(
    productId: string,
    sellerId: string,
    dto: CreateOrUpdateProductDto,
  ) {
    const existingProduct = await this.productModel.findOne({
      _id: new MongooseTypes.ObjectId(productId),
      sellerId,
    });
    if (!existingProduct) throw new NoProductFoundError();
    await this.productModel.findByIdAndUpdate(productId, {
      $set: {
        amountAvailable: dto.amountAvailable,
        cost: dto.cost,
        productName: dto.productName,
      },
    });
  }

  async reduceAmountAvailable(
    productId: string,
    purchasedAmount: number,
  ): Promise<{ cost: number; productName: string }> {
    const existingProduct = await this.productModel.findById(productId).lean();
    if (!existingProduct) throw new NoProductFoundError();
    if (existingProduct.amountAvailable < purchasedAmount)
      throw new InsufficientProductAmountAvailableError(
        existingProduct.amountAvailable,
      );
    await this.productModel.findByIdAndUpdate(productId, {
      $inc: { amountAvailable: -purchasedAmount },
    });
    return {
      cost: existingProduct.cost * purchasedAmount,
      productName: existingProduct.productName,
    };
  }

  async deleteProduct(productId: string, sellerId: string) {
    const existingProduct = await this.productModel.findOne({
      _id: new MongooseTypes.ObjectId(productId),
      sellerId,
    });
    if (!existingProduct) throw new NoProductFoundError();
    await this.productModel.findByIdAndDelete(productId);
  }
}
