import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //configuración del swagger
  const config = new DocumentBuilder()
      .setTitle('POS & E-commerce API')
      .setDescription('API del sistema de punto de venta y comercio electrónico')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
      
      //creamos la documentación de swagger
      const document = SwaggerModule.createDocument(app, config);

      //swagger estará disponible en api/docs
      SwaggerModule.setup('api/docs', app, document);

      
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
