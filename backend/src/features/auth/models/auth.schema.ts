import { IAuthDocument } from '~auth/interfaces/auth.interface';
import { Schema, Model, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const SALT_ROUND = 10;

const authSchema: Schema = new Schema(
  {
    username: String,
    uId: String,
    email: String,
    password: String,
    avatarColor: String,
    createdAt: { type: Date, default: Date.now },
    passwordResetToken: { type: String, default: '' },
    passwordResetExpires: { type: Number }
  },
  {
    toJSON: {
      transform(doc, ret, options) {
        delete ret.password;
        return ret;
      }
    }
  }
);

authSchema.pre('save', async function (this: IAuthDocument, next: () => void) {
  const hash: string = await bcrypt.hash(this.password as string, SALT_ROUND);
  this.password = hash;
  next();
});

authSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  const hasedPassword: string = this.password;
  return await bcrypt.compare(password, hasedPassword);
};

authSchema.methods.hashPassword = async function (password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUND);
};

const AuthModel: Model<IAuthDocument> = model<IAuthDocument>('Auth', authSchema, 'Auth');
export { AuthModel };
