import { Application } from 'express';
import { authRoutes } from '~auth/routes/auth.routes';
import { currentRoutes } from '~auth/routes/current.routes';
import { chatRoutes } from '~chat/routes/chat.routes';
import { commentRoute } from '~comment/routes/comment.routes';
import { followerRoutes } from '~follower/routes/follower.routes';
import { AuthMiddleware } from '~global/helpers/auth-middleware';
import { imageRoutes } from '~image/routes/image.routes';
import { nofiticationRoutes } from '~nofitication/routes/nofitication.routes';
import { postRoutes } from '~post/routes/post.routes';
import { reactionRoute } from '~reaction/routes/reaction.route';
import { serverAdapter } from '~services/queues/base.queue';
import { healthRoutes } from '~user/routes/health.routes';
import { userRoutes } from '~user/routes/user.routes';

const BASE_URL = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());

    app.use(BASE_URL, authRoutes.routes());
    app.use(BASE_URL, authRoutes.signoutRoute());

    app.use('', healthRoutes.health());
    app.use('', healthRoutes.env());
    app.use('', healthRoutes.instance());
    app.use('', healthRoutes.fiboRoute());

    // verify routes
    // app.use(AuthMiddleware.prototype.verifyUser);
    app.use(`${BASE_URL}/currentUser`, AuthMiddleware.prototype.verifyUser, currentRoutes.routes());
    app.use(`${BASE_URL}/post`, AuthMiddleware.prototype.verifyUser, postRoutes.routes());
    app.use(`${BASE_URL}/reaction`, AuthMiddleware.prototype.verifyUser, reactionRoute.routes());
    app.use(`${BASE_URL}/comment`, AuthMiddleware.prototype.verifyUser, commentRoute.routes());
    app.use(`${BASE_URL}/follow`, AuthMiddleware.prototype.verifyUser, followerRoutes.routes());
    app.use(`${BASE_URL}/nofitication`, AuthMiddleware.prototype.verifyUser, nofiticationRoutes.routes());
    app.use(`${BASE_URL}/image`, AuthMiddleware.prototype.verifyUser, imageRoutes.routes());
    app.use(`${BASE_URL}/chat`, AuthMiddleware.prototype.verifyUser, chatRoutes.routes());
    app.use(`${BASE_URL}/user`, AuthMiddleware.prototype.verifyUser, userRoutes.routes());
  };
  routes();
};
