import { Router } from 'express';
import { AddComment } from '~comment/controllers/add-comment';
import { GetComment } from '~comment/controllers/get-comment';
import { AuthMiddleware } from '~global/helpers/auth-middleware';

class CommentRoute {
  private router: Router;
  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.use(AuthMiddleware.prototype.checkAuthentication);

    this.router.get('/names/:postId', GetComment.prototype.getCommetNamesOfPost);
    this.router.get('/:postId/:commentId', GetComment.prototype.getCommentById);
    this.router.get('/:postId', GetComment.prototype.getCommentsOfPost);

    this.router.post('/', AddComment.prototype.addComment);

    return this.router;
  }
}

export const commentRoute: CommentRoute = new CommentRoute();
