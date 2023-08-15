import { Application } from 'express';
import { authRoutes } from '~auth/routes/auth.routes';
import { currentRoutes } from '~auth/routes/current.routes';
import { AuthMiddleware } from '~global/helpers/auth-middleware';
import { postRoutes } from '~post/routes/post.routes';
import { reactionRoute } from '~reaction/routes/reaction.route';
import { serverAdapter } from '~services/queues/base.queue';

const BASE_URL: string = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_URL, authRoutes.routes());
    app.use(BASE_URL, authRoutes.signoutRoute());

    // verify routes
    app.use(AuthMiddleware.prototype.verifyUser);
    app.use(`${BASE_URL}/currentUser`, currentRoutes.routes());
    app.use(`${BASE_URL}/post`, postRoutes.routes());
    app.use(`${BASE_URL}/reaction`, reactionRoute.routes());
  };
  routes();
};
