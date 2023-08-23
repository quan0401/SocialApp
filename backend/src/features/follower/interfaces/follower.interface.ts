import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';
import { IUserDocument } from '~user/interfaces/user.interface';

export interface IFollowers {
  userId: string;
}

export interface IFollowerDocument extends Document {
  _id: mongoose.Types.ObjectId | string;
  followerId: mongoose.Types.ObjectId;
  followeeId: mongoose.Types.ObjectId;
  createdAt?: Date;
}

export interface IFollower {
  _id: mongoose.Types.ObjectId | string;
  followeeId?: IFollowerData;
  followerId?: IFollowerData;
  createdAt?: Date;
}

// export type IFollowerData = Pick<
//   IUserDocument,
//   'avatarColor' | 'followersCount' | 'followingCount' | 'profilePicture' | 'postsCount' | 'username' | 'uId'
// > & {
//   userProfile?: IUserDocument;
//   _id?: mongoose.Types.ObjectId;
// };

export interface IFollowerData {
  avatarColor: string;
  followersCount: number;
  followingCount: number;
  profilePicture: string;
  postsCount: number;
  username: string;
  uId: string;
  _id?: mongoose.Types.ObjectId;
  userProfile?: IUserDocument;
}

export interface IFollowerJobData {
  keyOne?: string;
  keyTwo?: string;
  username?: string;
  followerDocumentId?: ObjectId;
}

export interface IBlockedUserJobData {
  keyOne: string;
  keyTwo: string;
  type: 'block' | 'unblock';
}

export interface IQueryFollow {
  follower?: string;
  followee?: string;
}
