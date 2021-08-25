import { Module } from '@nestjs/common';
import { GatewaysModule } from './gateways/gateways.module';

@Module({
  imports: [
    GatewaysModule.register({
      database: {
        user: process.env.CACHE_DB_USERNAME,
        password: process.env.CACHE_DB_PASSWORD,
        database: process.env.CACHE_DB_DATABASE,
        host: process.env.CACHE_DB_HOST,
      },
      cache: {
        ttl: +process.env.CACHE_TTL,
      },
    }),
  ],
  controllers: [],
})
export class AppModule {}
