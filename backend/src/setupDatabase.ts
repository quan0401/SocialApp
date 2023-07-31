require('dotenv').config();
import mongoose from 'mongoose';
import Logger from 'bunyan';
import { config } from '~/config';
const log: Logger = config.createLogger('setupDatabase');

export default async () => {
  const connect = async () => {
    mongoose
      .connect(config.MONGO_URI, {})
      .then(() => {
        log.info('Successfully connected to database');
      })
      .catch((error) => {
        log.error('Error connecting to database', error);
        return process.exit(1);
      });
  };
  await connect();
  mongoose.connection.on('disconnected', connect);
};
