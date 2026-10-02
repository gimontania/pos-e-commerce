import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';


@Module({
  imports: [
    //permite usar prismaService dentro de authModule
    PrismaModule,

    //configuracion de variables de entorno
    ConfigModule,

    //configura jwt usando nuestro JWT_SECRET
    JwtModule.registerAsync({

      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d', //el jwt vence después de un día
        },
      }),
    }),
  ],

  //controlador de auth
  controllers: [AuthController],

  //servicios y estrategia JWT
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}









