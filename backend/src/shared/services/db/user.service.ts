import { ObjectId } from 'mongodb';

import { IUserDocument } from '~user/interfaces/user.interface';
import { UserModel } from '~user/models/user.schema';

class UserService {
  public async addUserData(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }
  public async getUserByAuthId(authId: string | ObjectId): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { authId: authId } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      { $project: this.aggregate() }
    ]);
    return users[0];
  }
  private aggregate() {
    return {
      _id: 1,
      username: '$authId.username',
      uId: '$authId.uId',
      email: '$authId.email',
      avatarColor: '$authId.avatarColor',
      createdAt: '$authId.createdAt',
      profilePicture: 1,
      postsCount: 1,
      followersCount: 1,
      followingCount: 1,
      passwordResetToken: 1,
      passwordResetExpires: 1,
      blocked: 1,
      blockedBy: 1,
      notifications: 1,
      social: 1,
      work: 1,
      school: 1,
      location: 1,
      quote: 1,
      bgImageVersion: 1,
      bgImageId: 1
    };
  }
}

export const userService: UserService = new UserService();
