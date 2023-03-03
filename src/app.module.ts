import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { AppController } from './app.controller';
import { BuyingModule } from './buying/buying.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/vending-machine'), // In a production environment this would come from an env variable
    UserModule,
    AuthModule,
    ProductModule,
    BuyingModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
