import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserRole } from 'src/user/user.schema';
import { CreateOrUpdateProductDto } from './dtos/create-or-update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  async createProduct(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateOrUpdateProductDto,
  ) {
    this.ensureUserIsSeller(
      request,
      'Only sellers are allowed to create products',
    );
    this.ensureCostIsMultipleOfFive(dto);
    await this.productsService.createProduct(
      dto.amountAvailable,
      dto.cost,
      dto.productName,
      request.user?.userId.toString(),
    );
  }

  @Get()
  async getAllProducts() {
    return this.productsService.getAllProducts();
  }

  @Get(':productId')
  async getProduct(@Param('productId') productId: string) {
    const product = await this.productsService.getProduct(productId);
    if (!product) throw new NotFoundException();
    return {
      amountAvailable: product.amountAvailable,
      cost: product.cost,
      productName: product.productName,
    };
  }

  @Put(':productId')
  @UseGuards(JwtAuthGuard)
  async updateProduct(
    @Param('productId') productId: string,
    @Body() dto: CreateOrUpdateProductDto,
    @Req() request: AuthenticatedRequest,
  ) {
    this.ensureUserIsSeller(
      request,
      'Only sellers are allowed to update products',
    );
    this.ensureCostIsMultipleOfFive(dto);
    await this.productsService.updateProduct(
      productId,
      request.user?.userId.toString(),
      dto,
    );
  }

  @Delete(':productId')
  @UseGuards(JwtAuthGuard)
  async deleteProduct(
    @Param('productId') productId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.ensureUserIsSeller(
      request,
      'Only sellers are allowed to delete products',
    );
    await this.productsService.deleteProduct(
      productId,
      request.user?.userId.toString(),
    );
  }

  private ensureUserIsSeller(
    request: AuthenticatedRequest,
    errorMessage: string,
  ) {
    if (request.user?.role !== UserRole.SELLER)
      throw new ForbiddenException(errorMessage);
  }

  private ensureCostIsMultipleOfFive(dto: CreateOrUpdateProductDto) {
    if (dto.cost % 5 !== 0) {
      throw new BadRequestException(
        `Product cost must be multiple of 5 cents so that buyer can always get full change`,
      );
    }
  }
}
