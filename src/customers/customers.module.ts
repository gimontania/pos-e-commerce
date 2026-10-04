import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { PrismaModule } from '../prisma/prisma.module';


@Module({
  //permite que este módulo use prismaSErvice
  imports: [PrismaModule],

  //registra el controller de clientes
  controllers: [CustomersController],

  //registra el service de clientes
  providers: [CustomersService],
  
})
export class CustomersModule {}
