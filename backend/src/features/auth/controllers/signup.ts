import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { IAuthDocument, ISignUpData } from '~auth/interfaces/auth.interface';
import { signupSchema } from '~auth/schemes/signup.scheme';
import { joiValidation } from '~global/decorators/joi-validation.decorators';
import { BadRequesetError } from '~global/helpers/error-handler';
import { authService } from '~services/db/auth.service';
import { ObjectId } from 'mongodb';
import { Helpers } from '~global/helpers/helpers';
import { uploads } from '~global/helpers/cloudinary-upload';
import { UploadApiResponse } from 'cloudinary';
import { IUserDocument } from '~user/interfaces/user.interface';
import { UserCache } from '~services/redis/user.cache';
import { config } from '~/config';
import _ from 'lodash';
import { authQueue } from '~services/queues/auth.queue';
import { userQueue } from '~services/queues/user.queue';
import JWT from 'jsonwebtoken';

const userCache: UserCache = new UserCache();

export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, password, email, avatarColor, avatarImage } = req.body;
    const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
      throw new BadRequesetError('Invalid credentials');
    }
    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;

    // this not work because of decorator
    // const authData = this.signupdata({ _id: authObjectId, uId, username, email, password, avatarColor });
    const authData: IAuthDocument = SignUp.prototype.signupdata({ _id: authObjectId, uId, username, email, password, avatarColor });
    const result: UploadApiResponse = (await uploads(avatarImage, userObjectId.toString(), true, true)) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequesetError('File upload: Error occured. Try again!');
    }

    // Add to redis cache
    const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);
    userDataForCache.profilePicture = `https://res.cloudinary.com/v${config.CLOUD_NAME}/image/upload/${result.version}/${
      config.FOLDER
    }/${userObjectId.toString()}.jpg`;

    // Add to database
    // const user_.omit(userDataForCache, ['uId', 'username', 'email', 'avatarColor', 'password']); // dont need this
    const userResult = _.omit(userDataForCache, ['password']);

    await userCache.saveUserToCache(`${userObjectId}`, uId, userResult);
    authQueue.addAuthUserJob('addAuthUserToDB', { value: authData });
    userQueue.addUserJob('addUserToDB', { value: userDataForCache });

    const userJwt: string = SignUp.prototype.signupToken(authData, userObjectId);
    req.session = { jwt: userJwt };

    res.status(HTTP_STATUS.CREATED).json({ message: 'Created successfull', user: userResult, token: userJwt });
  }

  private signupdata(data: ISignUpData): IAuthDocument {
    const { _id, uId, email, username, password, avatarColor } = data;
    return {
      _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email: Helpers.lowerCase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }

  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id: userObjectId,
      authId: _id,
      username: Helpers.firstLetterUppercase(username as string),
      email: Helpers.lowerCase(email as string),
      password,
      avatarColor,
      uId,
      postsCount: 0,
      work: '',
      school: '',
      quote: '',
      location: '',
      blocked: [],
      blockedBy: [],
      followersCount: 0,
      followingCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      },
      bgImageVersion: '',
      bgImageId: '',
      profilePicture: ''
    } as unknown as IUserDocument;
  }
  private signupToken(data: IAuthDocument, userObjectId: ObjectId): string {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor
      },
      config.JWT_TOKEN
    );
  }
}
