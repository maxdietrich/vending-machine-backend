import { Module } from '@nestjs/common';
import { ProductModule } from 'src/product/product.module';
import { UserModule } from 'src/user/user.module';
import { BuyingService } from './buying.service';

@Module({
  imports: [ProductModule, UserModule],
  providers: [BuyingService],
  exports: [BuyingService],
})
export class BuyingModule {}
