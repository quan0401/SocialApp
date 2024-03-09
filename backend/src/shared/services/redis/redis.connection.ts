import { BaseCache } from '~services/redis/base.cache';
import Logger from 'bunyan';
import { config } from '~/config';

const log: Logger = config.createLogger('redisConnection');

class RedisConnection extends BaseCache {
  constructor() {
    super('redisConnection');
  }
  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      const checkRedisConnection: string = await this.client.ping();
      log.info(checkRedisConnection, 'Pong means redis is connected');
    } catch (error: unknown) {
      log.error(error);
    }
  }
}

export const redisConnection: RedisConnection = new RedisConnection();
