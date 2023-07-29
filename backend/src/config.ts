require('dotenv').config();
import bunyan from 'bunyan';

class Config {
  public MONGO_URI: string;
  public JWT_TOKEN: string;
  public NODE_ENV: string;
  public SECRET_KEY_ONE: string;
  public SECRET_KEY_TWO: string;
  public CLIENT_URI: string | undefined;
  public REDIS_HOST: string | undefined;

  constructor() {
    this.MONGO_URI = process.env.MONGO_URI || '';
    this.JWT_TOKEN = process.env.JWT_TOKEN || '1234';
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || '';
    this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || '';
    this.CLIENT_URI = process.env.CLIENT_URI || '';
    this.REDIS_HOST = process.env.REDIS_HOST || '';
  }

  public validateConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === '') throw new Error(`Configuration ${key} is ''`);
    }
  }
  public createLogger(name: string): bunyan {
    return bunyan.createLogger({
      name,
      level: 'debug'
    });
  }
}

export const config: Config = new Config();
