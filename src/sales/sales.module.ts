import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SalesController } from './sales.controller';


@Module({
  //permite usar prismaService dentro de salesService
  imports: [PrismaModule],

  //registar el servicio de ventas
  providers: [SalesService],

  //registra el controller de ventas
  controllers: [SalesController],

  //permite que otros modulos puedan usar SalesService
  exports: [SalesService],

})
export class SalesModule {}
