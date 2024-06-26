import HTTP_STATUS from 'http-status-codes';
import { Response, Request } from 'express';
import { IAuthDocument } from '~auth/interfaces/auth.interface';
import { signinSchema } from '~auth/schemes/signin.scheme';
import { joiValidation } from '~global/decorators/joi-validation.decorators';
import { BadRequesetError } from '~global/helpers/error-handler';
import { authService } from '~services/db/auth.service';
import JWT from 'jsonwebtoken';
import { config } from '~/config';
import { userService } from '~services/db/user.service';
import { IUserDocument } from '~user/interfaces/user.interface';
import { UserCache } from '~services/redis/user.cache';

const userCache: UserCache = new UserCache();
export class Signin {
  @joiValidation(signinSchema)
  public async signin(req: Request, res: Response): Promise<void> {
    const { username, email, password } = req.body;

    const existingUser: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
    if (!existingUser) {
      throw new BadRequesetError('Invalid credentials');
    }

    const passwordMatch: boolean = await existingUser.comparePassword(password);

    if (!passwordMatch) {
      throw new BadRequesetError('Invalid credentials');
    }
    const user: IUserDocument = await userService.getUserByAuthId(existingUser._id);
    const userJwt: string = JWT.sign(
      {
        userId: user._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN
    );

    req.session = { jwt: userJwt };

    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser._id,
      username: existingUser.username,
      email: existingUser.email,
      avatarColor: existingUser.avatarColor,
      uId: existingUser.uId,
      createdAt: existingUser.createdAt
    } as IUserDocument;

    // const resetLink = `${config.CLIENT_URI}/reset-password?token=123456789`;
    // const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username, resetLink);
    // emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: 'kolby43@ethereal.email', subject: 'test reset' });
    await userCache.saveUserToCache(`${user._id}`, existingUser.uId, userDocument);
    res.status(HTTP_STATUS.OK).json({ message: 'User logins successfully', user: userDocument, token: userJwt });
  }
}
