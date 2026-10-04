import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaModule } from '../prisma/prisma.module';



@Module({
  //permite usar prismaService dentro del módulo
  imports: [PrismaModule],

  //registra el controller del carrito
  controllers: [CartController],

  //registra el service del carrito
  providers: [CartService],
  
})
export class CartModule {}
