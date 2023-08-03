import { Application } from 'express';
import { authRoutes } from '~auth/routes/authRoutes';
import { currentRoutes } from '~auth/routes/currentRoutes';
import { AuthMiddleware } from '~global/helpers/auth-middleware';
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
  };
  routes();
};
