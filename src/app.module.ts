import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule} from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';


@Module({ //carga las variables del archivo .env y permite usarlas desde toda la aplicación
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    AuthModule,

    PrismaModule,

    UsersModule,

    CategoriesModule,

    ProductsModule,

    SalesModule, //módulo de autenticación
  ],  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}





