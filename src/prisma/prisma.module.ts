import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  //registra prismaService dentro del módulo
  providers: [PrismaService],

  //permite que otros módulos puedan usar prismaService
  exports: [PrismaService],
})
export class PrismaModule {}
