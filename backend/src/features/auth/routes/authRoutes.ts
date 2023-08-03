import { Signin } from './../controllers/signin';
import { Router } from 'express';
import { SignUp } from '~auth/controllers/signup';
import { Signout } from '~auth/controllers/singout';

class AuthRoutes {
  private router: Router;
  constructor() {
    this.router = Router();
  }
  public routes(): Router {
    this.router.post('/signup', SignUp.prototype.create);
    this.router.post('/signin', Signin.prototype.signin);
    return this.router;
  }
  public signoutRoute(): Router {
    this.router.get('/signout', Signout.prototype.signout);
    return this.router;
  }
}

export const authRoutes = new AuthRoutes();
