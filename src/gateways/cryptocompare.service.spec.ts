import { CryptocompareService } from './cryptocompare.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule, CacheStoreSetOptions } from '@nestjs/common';
import { DatabaseStorage, DatabaseStorageResponse } from './mysql.storage';
import { DatabaseCacheStore } from './database.cache.store';
import { GATEWAYS_STORAGE } from './gateways.constants';

describe('CryptocompareService', () => {
  let service: CryptocompareService;
  let cache: DatabaseCacheStore;
  let storage: DatabaseStorage;

  beforeEach(async () => {
    const ttl = 1000;
    const keyValue = new Map<string, DatabaseStorageResponse<any>>();
    storage = {
      get<T>(key: string): Promise<DatabaseStorageResponse<T> | undefined> {
        return Promise.resolve(keyValue.get(key));
      },
      set<T>(
        key: string,
        value: T,
        options?: CacheStoreSetOptions<T>,
      ): Promise<void> {
        // Since the project uses global ttl for now,
        // omit local ttl test.
        keyValue.set(key, {
          key,
          data: JSON.stringify(value),
          updated_at: Date.now(),
          ttl: null,
        });

        return Promise.resolve();
      },
      del(key: string): Promise<void> {
        keyValue.delete(key);

        return Promise.resolve();
      },
    };

    cache = new DatabaseCacheStore(storage, ttl);
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register({
          store: cache,
          ttl,
        }),
      ],
      providers: [
        CryptocompareService,
        {
          provide: GATEWAYS_STORAGE,
          useValue: storage,
        },
      ],
    }).compile();

    service = module.get<CryptocompareService>(CryptocompareService);
  });

  it('should return cached values', async () => {
    const getResponse = { foo: 'bar' };
    const performRequestGet = jest
      .spyOn(service, 'performRequestGet')
      .mockImplementation(async () => {
        return {
          data: getResponse,
        };
      });

    const response = await service.requestGet('test', {});
    expect(response).toEqual(getResponse);

    await service.requestGet('test', {});
    expect(performRequestGet).toBeCalledTimes(1);
  });
});
