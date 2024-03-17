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
    app.use(AuthMiddleware.prototype.verifyUser);
    app.use(`${BASE_URL}/currentUser`, currentRoutes.routes());
    app.use(`${BASE_URL}/post`, postRoutes.routes());
    app.use(`${BASE_URL}/reaction`, reactionRoute.routes());
    app.use(`${BASE_URL}/comment`, commentRoute.routes());
    app.use(`${BASE_URL}/follow`, followerRoutes.routes());
    app.use(`${BASE_URL}/nofitication`, nofiticationRoutes.routes());
    app.use(`${BASE_URL}/image`, imageRoutes.routes());
    app.use(`${BASE_URL}/chat`, chatRoutes.routes());
    app.use(`${BASE_URL}/user`, userRoutes.routes());
  };
  routes();
};
