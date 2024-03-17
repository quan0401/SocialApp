import { DeletePost } from './../controllers/delete-post';
import { Router } from 'express';
import { AuthMiddleware } from '~global/helpers/auth-middleware';
import { CreatePost } from '~post/controllers/create-post';
import { GetPost } from '~post/controllers/get-post';
import { UpdatePost } from '~post/controllers/update-post';

class PostRoutes {
  private router: Router;
  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.use(AuthMiddleware.prototype.checkAuthentication);

    this.router.post('/', CreatePost.prototype.post);
    this.router.post('/image', CreatePost.prototype.postWithImage);
    this.router.post('/video', CreatePost.prototype.addPostWithVideo);

    this.router.get('/:page', GetPost.prototype.getPosts);
    this.router.get('/image/:page', GetPost.prototype.getPostsWithImages);
    this.router.get('/video/:page', GetPost.prototype.getPostsWithVideos);

    this.router.delete('/:postId', DeletePost.prototype.delete);

    this.router.put('/:postId', UpdatePost.prototype.update);
    this.router.put('/content/:postId', UpdatePost.prototype.postWithContent);

    return this.router;
  }
}
export const postRoutes: PostRoutes = new PostRoutes();
