import Logger from 'bunyan';
import { createClient } from 'redis';
import { config } from '~/config';

export type RedisClient = ReturnType<typeof createClient>;

export abstract class BaseCache {
  client: RedisClient;
  log: Logger;
  constructor(cacheName: string) {
    this.client = createClient({ url: config.REDIS_HOST });
    this.log = config.createLogger(cacheName);
    this.cacheError();
  }
  private cacheError() {
    this.client.on('error', (error: unknown) => {
      this.log.error(error);
    });
  }
}
