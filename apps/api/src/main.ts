import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  // Configuration de Swagger
  const config = new DocumentBuilder()
    .setTitle('SuiviTic API')
    .setDescription('Documentation de l\'API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 API SuiviTic démarrée sur http://localhost:3000`);
  console.log(`📚 Swagger sur http://localhost:3000/api-docs`);
}
bootstrap();