import { CacheStore, CacheStoreSetOptions } from '@nestjs/common';
import { knex, Knex } from 'knex';

export interface DatabaseStorageResponse<T> {
  key: string;
  data: T;
  updated_at: number;
  ttl: number;
}

export interface DatabaseStorage extends Pick<CacheStore, 'del' | 'set'> {
  get<T>(key: string): Promise<DatabaseStorageResponse<T> | undefined>;
}

export class MysqlStorage implements DatabaseStorage {
  protected client: Knex<unknown, unknown>;

  /**
   * Implements mysql cache store constructor.
   *
   * @param table
   *   Storage target table.
   * @param options
   *   The store options.
   */
  constructor(
    protected table: string,
    protected options: Knex.ConnectionConfig,
  ) {
    this.client = knex({
      client: 'mysql',
      connection: options,
    });
  }

  /**
   * Performs database intiialisation.
   */
  async prepare(): Promise<void> {
    const exists = await this.client.schema.hasTable(this.table);
    if (!exists) {
      await this.client.schema.createTable(this.table, (table) => {
        table.increments();
        table.string('key').unique();
        table.jsonb('data');
        table.timestamps();
        table.integer('ttl');

        table.index('key');
      });
    }
  }

  /**
   * @inheritDoc
   */
  async get<T>(key: string): Promise<DatabaseStorageResponse<T> | undefined> {
    const response = await this.client
      .select('*')
      .from(this.table)
      .where('key', '=', key);

    if (response && response[0]) {
      return response[0];
    }
  }

  /**
   * @inheritDoc
   */
  async set<T>(
    key: string,
    value: T,
    options?: CacheStoreSetOptions<T>,
  ): Promise<void> {
    const entry = {
      key,
      data: JSON.stringify(value),
    };

    // Resolve ttl.
    if (options) {
      if (typeof options.ttl === 'number') {
        entry['ttl'] = options.ttl;
      } else if (typeof options.ttl === 'function') {
        entry['ttl'] = options.ttl(value);
      }
    }

    await this.client.transaction((trx) => {
      const now = this.client.fn.now();

      return trx
        .table(this.table)
        .insert({ ...entry, created_at: now, updated_at: now })
        .onConflict('key')
        .merge({ ...entry, updated_at: now });
    });
  }

  /**
   * @inheritDoc
   */
  async del(key: string): Promise<void> {
    await this.client.transaction((trx) => {
      trx.table(this.table).where('key', key).del();
    });
  }
}
