import { Router } from 'express';
import { AuthMiddleware } from '~global/helpers/auth-middleware';
import { DeleteNofitication } from '~nofitication/controllers/delete-nofitication';
import { GetNofitication } from '~nofitication/controllers/get-nofitication';
import { UpdateNofitication } from '~nofitication/controllers/update-nofitication';

class NofiticationRoutes {
  private router: Router;
  constructor() {
    this.router = Router();
  }
  public routes(): Router {
    this.router.use(AuthMiddleware.prototype.checkAuthentication);

    this.router.get('/', GetNofitication.prototype.get);
    this.router.put('/:nofiticationId', UpdateNofitication.prototype.update);
    this.router.delete('/:nofiticationId', DeleteNofitication.prototype.delete);

    return this.router;
  }
}
export const nofiticationRoutes: NofiticationRoutes = new NofiticationRoutes();
