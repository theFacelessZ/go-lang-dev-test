import { CacheModule, DynamicModule, Module } from '@nestjs/common';
import { PriceGateway } from './price.gateway';
import { CryptocompareService } from './cryptocompare.service';
import { DatabaseCacheStore } from './database.cache.store';
import { Knex } from 'knex';
import { MysqlStorage } from './mysql.storage';
import { GATEWAYS_STORAGE } from './gateways.constants';
import { ServiceController } from './service.controller';

export interface GatewaysModuleOptions {
  database: Knex.ConnectionConfig;
  cache?: {
    ttl: number;
  };
}

@Module({})
export class GatewaysModule {
  static async register(
    options: GatewaysModuleOptions,
  ): Promise<DynamicModule> {
    const storage = new MysqlStorage('cache', options.database);

    // Make sure the tables are prepared.
    await storage.prepare();

    return {
      imports: [
        CacheModule.register({
          store: new DatabaseCacheStore(storage, options.cache?.ttl),
          ttl: options.cache?.ttl,
        }),
      ],
      providers: [
        PriceGateway,
        CryptocompareService,
        {
          provide: GATEWAYS_STORAGE,
          useValue: storage,
        },
      ],
      controllers: [ServiceController],
      exports: [],
      module: GatewaysModule,
    };
  }
}
