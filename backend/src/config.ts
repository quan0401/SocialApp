require('dotenv').config();
import bunyan from 'bunyan';
import cloudinary from 'cloudinary';

class Config {
  public MONGO_URI: string | undefined;
  public JWT_TOKEN: string;
  public NODE_ENV: string;
  public SECRET_KEY_ONE: string;
  public SECRET_KEY_TWO: string;
  public CLIENT_URI: string | undefined;
  public REDIS_HOST: string | undefined;
  public CLOUD_NAME: string;
  public API_KEY: string;
  public API_SECRET: string;
  public FOLDER: string | undefined;
  // Email
  public SENDER_EMAIL: string | undefined;
  public SENDER_EMAIL_PASSWORD: string | undefined;
  public SENDGRID_API_KEY: string | undefined;
  public SENDGRID_SENDER: string | undefined;
  // Aws
  public EC2_URL: string | undefined;

  constructor() {
    this.MONGO_URI = process.env.MONGO_URI || '';
    this.JWT_TOKEN = process.env.JWT_TOKEN || '1234';
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || '';
    this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || '';
    this.CLIENT_URI = process.env.CLIENT_URI || '';
    this.REDIS_HOST = process.env.REDIS_HOST || '';
    this.CLOUD_NAME = process.env.CLOUD_NAME || '';
    this.API_KEY = process.env.API_KEY || '';
    this.API_SECRET = process.env.API_SECRET || '';
    this.FOLDER = process.env.FOLDER || '';
    // Email
    this.SENDER_EMAIL = process.env.SENDER_EMAIL || '';
    this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD || '';
    this.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
    this.SENDGRID_SENDER = process.env.SENDGRID_SENDER || '';
    this.EC2_URL = process.env.EC2_URL || '';
  }

  public validateConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      // to do: remove this later these key exception later
      if (value === '' && key !== 'SENDGRID_API_KEY' && key !== 'SENDGRID_SENDER') throw new Error(`Configuration ${key} is ''`);
    }
  }
  public createLogger(name: string): bunyan {
    return bunyan.createLogger({
      name,
      level: 'debug'
    });
  }
  public cloudinaryConfig(): void {
    cloudinary.v2.config({
      cloud_name: this.CLOUD_NAME,
      api_key: this.API_KEY,
      api_secret: this.API_SECRET
    });
  }
}

export const config: Config = new Config();
