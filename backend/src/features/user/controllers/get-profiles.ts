import HTTP_STATUS from 'http-status-codes';
import { IUserDocument, IAllUsers } from '~user/interfaces/user.interface';
import { Response, Request } from 'express';
import { UserCache } from '~services/redis/user.cache';
import { userService } from '~services/db/user.service';
import { IFollowerData } from '~follower/interfaces/follower.interface';
import { FollowerCache } from '~services/redis/follower.cache';
import { followerService } from '~services/db/follower.service';
import { PostCache } from '~services/redis/post.cache';
import { IPostDocument } from '~post/interfaces/post.interface';

const userCache: UserCache = new UserCache();
const followerCache: FollowerCache = new FollowerCache();
const postCache: PostCache = new PostCache();
const PAGE_SIZE = 10;

export class GetUsers {
  public async all(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const start: number = parseInt(page, 10) - 1;
    const end: number = parseInt(page) * PAGE_SIZE;
    const newStart: number = start === 0 ? start : start + 1;
    const allUsers: IAllUsers = await GetUsers.prototype.allUsers(start, end, req.currentUser!.userId);
    const followers: IFollowerData[] = await GetUsers.prototype.followers(req.currentUser!.userId);
    res.status(HTTP_STATUS.OK).json({
      message: 'Get users',
      users: allUsers.users,
      totalUsers: allUsers.totalUsers,
      followers
    });
  }

  public async profile(req: Request, res: Response): Promise<void> {
    const userFromCache: IUserDocument | null = await userCache.getUserFromCache(`${req.currentUser!.userId}`);
    const user: IUserDocument = userFromCache ? userFromCache : await userService.getUserById(`${req.currentUser!.userId}`);
    res.status(HTTP_STATUS.OK).json({
      message: 'Get user profile',
      user
    });
  }

  public async profileByUserId(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const userFromCache: IUserDocument | null = await userCache.getUserFromCache(userId);
    const user: IUserDocument = userFromCache ? userFromCache : await userService.getUserById(userId);

    res.status(HTTP_STATUS.OK).json({
      message: 'Get user profile by id',
      user
    });
  }

  public async profilesAndPosts(req: Request, res: Response): Promise<void> {
    const { userId, username, uId } = req.params;
    // Get user
    const userFromCache: IUserDocument | null = await userCache.getUserFromCache(userId);
    const user: IUserDocument = userFromCache ? userFromCache : await userService.getUserById(userId);
    // Get user's posts
    const userPostsFromCache: IPostDocument[] = await postCache.getUserPostsFromCache('post', parseInt(uId));

    res.status(HTTP_STATUS.OK).json({
      message: 'Get user profile and posts',
      user: user,
      post: userPostsFromCache
    });
  }

  public async randomUsersSuggestion(req: Request, res: Response): Promise<void> {
    const usersFromCache: IUserDocument[] = await userCache.getRandomUsersFromCache(
      `${req.currentUser!.userId}`,
      `${req.currentUser!.userId}`
    );
    const users: IUserDocument[] = usersFromCache.length ? usersFromCache : await userService.getRamdomUsers(`${req.currentUser!.userId}`);
    res.status(HTTP_STATUS.OK).json({
      message: 'Users suggestions',
      users
    });
  }

  private async allUsers(start: number, end: number, excludeUserKey: string): Promise<IAllUsers> {
    const usersFromCache: IUserDocument[] = await userCache.getUsersFromCache(start, end, excludeUserKey);
    let users: IUserDocument[] = [];
    let type: 'redis' | 'db';
    if (usersFromCache.length) {
      users = usersFromCache;
      type = 'redis';
    } else {
      type = 'db';
      users = await userService.getAllUsers(excludeUserKey, start, end);
    }
    const totalUsers: number = await GetUsers.prototype.usersCount(type);
    // minus exclude user
    return { users, totalUsers: totalUsers - 1 };
  }
  private async usersCount(type: 'redis' | 'db'): Promise<number> {
    const count = type === 'redis' ? await userCache.getTotalUsersInCache() : await userService.getTotalUsers();
    return count;
  }
  private async followers(userId: string): Promise<IFollowerData[]> {
    const followersFromCache: IFollowerData[] = await followerCache.getFollowersFromCache(`followers:${userId}`);
    const followers = followersFromCache.length ? followersFromCache : await followerService.getFollowersFromDB(userId);
    return followers;
  }
}
