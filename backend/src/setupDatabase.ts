require('dotenv').config();
import mongoose from 'mongoose';
import Logger from 'bunyan';
import { config } from '~/config';
import { redisConnection } from '~services/redis/redis.connection';

const log: Logger = config.createLogger('setupDatabase');

export default async () => {
  const connect = async () => {
    mongoose
      // .connect(config.NODE_ENV !== 'development' ? 'mongodb://localhost:27017/social' : (config.MONGO_URI as string), {})
      .connect(config.MONGO_URI as string)
      .then(() => {
        log.info('Successfully connected to database');
        redisConnection.connect();
      })
      .catch((error) => {
        log.error('Error connecting to database', error);
        return process.exit(1);
      });
  };
  await connect();
  mongoose.connection.on('disconnected', connect);
};
