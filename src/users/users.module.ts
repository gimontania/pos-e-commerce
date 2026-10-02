import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';



@Module({
  imports: [
    //permite que UserService pueda usar PrismaService
    PrismaModule,
  ],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
