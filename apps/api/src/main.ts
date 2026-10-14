import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Charger le .env AVANT tout
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 API SuiviTic démarrée sur http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();