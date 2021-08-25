import { CacheStore, CacheStoreSetOptions } from '@nestjs/common';
import { DatabaseStorage } from './mysql.storage';

export class DatabaseCacheStore implements CacheStore {
  constructor(protected storage: DatabaseStorage, protected ttl: number = 0) {}

  async get<T>(key: string): Promise<T | undefined> {
    if (!this.ttl) {
      return;
    }

    const value = await this.storage.get(key);

    if (
      value &&
      +value.updated_at + (value.ttl || this.ttl) * 1000 >= Date.now()
    ) {
      return JSON.parse(value.data.toString());
    }
  }

  async set<T>(
    key: string,
    value: T,
    options?: CacheStoreSetOptions<T>,
  ): Promise<void> {
    const result = this.storage.set(key, value, options);
    if (result instanceof Promise) {
      await result;
    }
  }

  async del(key: string): Promise<void> {
    const result = this.storage.del(key);
    if (result instanceof Promise) {
      await result;
    }
  }
}
