import { Router } from 'express';
import { AuthMiddleware } from '~global/helpers/auth-middleware';
import { AddReaction } from '~reaction/controllers/add-reaction';
import { GetReaction } from '~reaction/controllers/get-reaction';
import { RemoveReaction } from '~reaction/controllers/remove-reaction';

class ReactionRoute {
  private router: Router;
  constructor() {
    this.router = Router();
  }

  public routes() {
    this.router.use(AuthMiddleware.prototype.checkAuthentication);

    this.router.post('/', AddReaction.prototype.add);
    this.router.delete('/:postId/:previousReaction', RemoveReaction.prototype.remove);

    this.router.get('/post/:postId', GetReaction.prototype.reactions);
    this.router.get('/single/:postId/:userId', GetReaction.prototype.getPostReactionsByUserId);
    this.router.get('/all/:userId', GetReaction.prototype.getAllReactionsOfUser);

    return this.router;
  }
}
export const reactionRoute: ReactionRoute = new ReactionRoute();
