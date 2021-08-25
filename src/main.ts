import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GatewayAdapter } from './gateway.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new GatewayAdapter(app));

  await app.listen(3000);
}
bootstrap();
