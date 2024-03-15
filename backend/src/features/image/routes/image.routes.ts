import { Router } from 'express';
import { AuthMiddleware } from '~global/helpers/auth-middleware';
import { AddImage } from '~image/controllers/add-image';
import { DeleteImage } from '~image/controllers/delete-image';
import { GetImages } from '~image/controllers/get-images';

class ImageRoutes {
  private router: Router;
  constructor() {
    this.router = Router();
  }
  public routes(): Router {
    this.router.use(AuthMiddleware.prototype.checkAuthentication);
    this.router.post('/profile', AddImage.prototype.profile);
    this.router.post('/background', AddImage.prototype.backgroundImageUpload);

    this.router.delete('/background/:bgImageId', DeleteImage.prototype.backgroundImage);
    this.router.delete('/', DeleteImage.prototype.image);

    this.router.get('/:userId', GetImages.prototype.images);
    return this.router;
  }
}

export const imageRoutes: ImageRoutes = new ImageRoutes();
