import Logger from 'bunyan';
import { config } from '~/config';
import { IAuthDocument } from '~auth/interfaces/auth.interface';
import { AuthModel } from '~auth/models/auth.schema';
import { Helpers } from '~global/helpers/helpers';

export class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }

  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = { $or: [{ username: Helpers.firstLetterUppercase(username), email: Helpers.lowerCase(email) }] };
    const user = (await AuthModel.findOne(query).exec()) as IAuthDocument;
    return user;
  }
  public async getUserByUsername(username: string): Promise<IAuthDocument> {
    const user = (await AuthModel.findOne({ username: Helpers.firstLetterUppercase(username) }).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByEmail(email: string): Promise<IAuthDocument> {
    const auth = (await AuthModel.findOne({ email: Helpers.lowerCase(email) })) as IAuthDocument;
    return auth;
  }

  public async getAuthUserByPasswordToken(token: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    })) as IAuthDocument;
    return user;
  }

  public async updatePasswordToken(authId: string, token: string, tokenExpiration: number): Promise<void> {
    await AuthModel.findOneAndUpdate({ _id: authId }, { passwordResetToken: token, passwordResetExpires: tokenExpiration });
  }
}

export const authService: AuthService = new AuthService();
