import { Router } from 'express';
import { AddFollower } from '~follower/controllers/add-follower';
import { BlockUser } from '~follower/controllers/block-user';
import { GetFollower } from '~follower/controllers/get-followers';
import { UnfollowUser } from '~follower/controllers/unfollow-user';

class FollowerRoutes {
  private router: Router;
  constructor() {
    this.router = Router();
  }
  public routes(): Router {
    this.router.put('/add_following/:followeeId', AddFollower.prototype.addFollower);

    this.router.put('/block/:blockerId/:beingBlockedId', BlockUser.prototype.block);
    this.router.put('/unblock/:blockerId/:beingBlockedId', BlockUser.prototype.unblock);

    this.router.delete('/unfollow/:followeeId', UnfollowUser.prototype.unfollow);

    this.router.get('/following/:userId', GetFollower.prototype.followings);
    this.router.get('/:userId', GetFollower.prototype.followers);

    return this.router;
  }
}
export const followerRoutes: FollowerRoutes = new FollowerRoutes();
