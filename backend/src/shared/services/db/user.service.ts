import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { IBasicInfo, INotificationSettings, ISearchUser, ISocialLinks, IUserDocument } from '~user/interfaces/user.interface';
import { UserModel } from '~user/models/user.schema';
import { followerService } from './follower.service';
import { AuthModel } from '~auth/models/auth.schema';

class UserService {
  public async addUserData(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }
  public async getUserByAuthId(authId: string | ObjectId): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { authId: new mongoose.Types.ObjectId(authId) } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      { $project: this.aggregateProject() }
    ]);
    return users[0];
  }

  public async getUserById(userId: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      { $project: this.aggregateProject() }
    ]);
    return users[0];
  }

  public async updateSingleFieldInDB(userId: string, field: string, value: string): Promise<void> {
    await UserModel.findOneAndUpdate({ _id: userId }, { $set: { [field]: value } });
  }

  public async updateBasicinfoInDB(userId: string, basicInfo: IBasicInfo): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: { ...basicInfo }
      }
    );
  }

  public async updateSocialLinksInDB(userId: string, socialLinks: ISocialLinks): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: { social: socialLinks }
      }
    );
  }

  public async updateNofiticationSettings(userId: string, settings: INotificationSettings): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { notifications: settings } });
  }

  public async getAllUsers(userId: string, skip: number, limit: number): Promise<IUserDocument[]> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
      { $skip: skip },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      { $project: this.aggregateProject() }
    ]);
    return users;
  }
  public async searchUsers(regex: RegExp): Promise<ISearchUser[]> {
    const users: ISearchUser[] = await AuthModel.aggregate([
      { $match: { username: regex } },
      { $lookup: { from: 'User', localField: '_id', foreignField: 'authId', as: 'userResult' } },
      { $unwind: '$userResult' },
      {
        $project: {
          _id: '$userResult._id',
          username: 1,
          email: 1,
          avatarColor: 1,
          profilePicture: 1
        }
      }
    ]);

    return users;
  }
  public async getRamdomUsers(userId: string): Promise<IUserDocument[]> {
    const randomUsers: IUserDocument[] = [];
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authResult' } },
      { $unwind: '$authResult' },
      { $sample: { size: 10 } },
      {
        $addFields: {
          username: '$authResult.username',
          uId: '$authResult.uId',
          email: '$authResult.email',
          password: '$authResult.password',
          avatarColor: '$authResult.avatarColor'
        }
      },
      {
        $project: {
          authId: 0,
          __v: 0
        }
      }
    ]);
    const followersIds: string[] = await followerService.getFollowersIds(`${userId}`);
    for (const user of users) {
      const isFollower: boolean = followersIds.indexOf(user._id.toString()) >= 0;
      if (isFollower) continue;
      randomUsers.push(user);
    }

    return randomUsers;
  }
  public async getTotalUsers(): Promise<number> {
    return await UserModel.find().countDocuments();
  }
  private aggregateProject() {
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
