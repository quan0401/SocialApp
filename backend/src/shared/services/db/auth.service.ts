import Logger from 'bunyan';
import { config } from '~/config';
import { IAuthDocument } from '~auth/interfaces/auth.interface';
import { AuthModel } from '~auth/models/auth.schema';
import { Helpers } from '~global/helpers/helpers';

const log: Logger = config.createLogger('AuthService');
class AuthService {
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
}

export const authService: AuthService = new AuthService();
