import { Router } from 'express';
import { AuthMiddleware } from '~global/helpers/auth-middleware';
import { Update } from '~user/controllers/change-password';
import { GetUsers } from '~user/controllers/get-profiles';
import { Search } from '~user/controllers/search-user';
import { Edit } from '~user/controllers/update-info';
import { UpdateSetting } from '~user/controllers/update-setting';

class UserRoutes {
  private router: Router;
  constructor() {
    this.router = Router();
  }
  public routes(): Router {
    this.router.use(AuthMiddleware.prototype.checkAuthentication);

    this.router.get('/all/:page', GetUsers.prototype.all);
    this.router.get('/profile', GetUsers.prototype.profile);
    // Define specific path before general path
    this.router.get('/profile/suggestions', GetUsers.prototype.randomUsersSuggestion);
    this.router.get('/profile/:userId', GetUsers.prototype.profileByUserId);
    this.router.get('/profile/post/:userId/:uId/:username', GetUsers.prototype.profilesAndPosts);
    this.router.get('/search/:query', Search.prototype.users);
    this.router.put('/change-password', Update.prototype.password);
    this.router.put('/basic-info', Edit.prototype.basicInfo);
    this.router.put('/social-links', Edit.prototype.socialLinks);
    this.router.put('/nofitications-settings', UpdateSetting.prototype.nofitication);

    return this.router;
  }
}

export const userRoutes: UserRoutes = new UserRoutes();
