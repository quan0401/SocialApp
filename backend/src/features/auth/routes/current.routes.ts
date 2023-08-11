import { Router } from 'express';
import { CurrentUser } from '~auth/controllers/current-user';
import { AuthMiddleware } from '~global/helpers/auth-middleware';

class CurrentRoutes {
  private router: Router;
  constructor() {
    this.router = Router();
  }
  public routes() {
    this.router.get('/', AuthMiddleware.prototype.checkAuthentication, CurrentUser.prototype.getCurrentUser);

    return this.router;
  }
}

export const currentRoutes: CurrentRoutes = new CurrentRoutes();
