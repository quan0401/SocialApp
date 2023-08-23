import mongoose, { Query } from 'mongoose';
import { IFollowerData, IFollowerDocument } from '~follower/interfaces/follower.interface';
import { FollowerModel } from '~follower/model/follower.schema';
import { UserModel } from '~user/models/user.schema';

import { IQueryComplete, IQueryDeleted } from '~post/interfaces/post.interface';
import { BulkWriteResult, ObjectId } from 'mongodb';

class FollowerService {
  public async addFollowerToDB(userId: string, followeeId: string, username: string, followerDocumentId: ObjectId): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(userId);
    const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);

    await FollowerModel.create({
      followeeId: followeeObjectId,
      followerId: userObjectId
    });

    const users: Promise<BulkWriteResult> = UserModel.bulkWrite([
      { updateOne: { filter: { _id: followeeId }, update: { $inc: { followersCount: 1 } } } },
      { updateOne: { filter: { _id: userId }, update: { $inc: { followingCount: 1 } } } }
    ]) as unknown as Promise<BulkWriteResult>;

    await Promise.all([users, UserModel.findOne({ _id: followeeId })]);
  }

  public async removeFollowerFromDB(followerId: string, followeeId: string): Promise<void> {
    const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);
    const followerObjectId: ObjectId = new mongoose.Types.ObjectId(followerId);

    const unfollow: Query<IQueryComplete & IQueryDeleted, IFollowerDocument> = FollowerModel.deleteOne({
      followeeId: followeeObjectId,
      followerId: followerObjectId
    });

    const users: Promise<BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: -1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: followerId },
          update: { $inc: { followingCount: -1 } }
        }
      }
    ]) as unknown as Promise<BulkWriteResult>;

    await Promise.all([unfollow, users]);
  }

  public async getFollowersFromDB(followeeId: string): Promise<IFollowerData[]> {
    const followers: IFollowerData[] = await FollowerModel.aggregate([
      { $match: { followeeId: new mongoose.Types.ObjectId(followeeId) } },
      { $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'followerResult' } },
      { $unwind: '$followerResult' },
      { $lookup: { from: 'Auth', localField: 'followerResult.authId', foreignField: '_id', as: 'authResult' } },
      {
        $unwind: '$authResult'
      },
      {
        $addFields: {
          _id: '$followerResult._id',
          avatarColor: '$authResult.avatarColor',
          uId: '$authResult.uId',
          username: '$authResult.username',
          followersCount: '$followerResult.followersCount',
          followingCount: '$followerResult.followingCount',
          profilePicture: '$followerResult.profilePicture',
          postsCount: '$followerResult.postsCount',
          userProfile: '$followerResult'
        }
      },
      {
        $project: {
          authResult: 0,
          followerResult: 0,
          followeeId: 0,
          followerId: 0,
          createdAt: 0,
          __v: 0
        }
      }
    ]);
    return followers;
  }

  public async getFollowingsFromDB(followerId: string): Promise<IFollowerData[]> {
    const followerObjectId = new mongoose.Types.ObjectId(followerId);
    const followees: IFollowerData[] = await FollowerModel.aggregate([
      { $match: { followerId: followerObjectId } },
      { $lookup: { from: 'User', localField: 'followeeId', foreignField: '_id', as: 'followeeResult' } },
      { $unwind: '$followeeResult' },
      { $lookup: { from: 'Auth', localField: 'followeeResult.authId', foreignField: '_id', as: 'authResult' } },
      { $unwind: '$authResult' },
      {
        $addFields: {
          _id: '$followeeResult._id',
          avatarColor: '$authResult.avatarColor',
          username: '$authResult.username',
          uId: '$authResult.uId',
          followersCount: '$followeeResult.followersCount',
          followingCount: '$followeeResult.followingCount',
          profilePicture: '$followeeResult.profilePicture',
          postsCount: '$followeeResult.postsCount',
          userProfile: '$followeeResult'
        }
      },
      {
        $project: {
          createdAt: 0,
          __v: 0,
          followeeResult: 0,
          authResult: 0,
          followerId: 0,
          followeeId: 0
        }
      }
    ]);

    return followees;
  }
}

export const followerService: FollowerService = new FollowerService();
