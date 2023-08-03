import { Response, Request, NextFunction } from 'express';
import { NotAuthorizedError } from './error-handler';
import JWT from 'jsonwebtoken';
import { config } from '~/config';
import { AuthPayload } from '~auth/interfaces/auth.interface';

export class AuthMiddleware {
  public verifyUser(req: Request, res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      throw new NotAuthorizedError('Token is not available, please try again');
    }
    try {
      const payload: AuthPayload = JWT.verify(req.session!.jwt, config.JWT_TOKEN) as AuthPayload;
      req.currentUser = payload;
      next();
    } catch (error) {
      throw new NotAuthorizedError('Token is invalid, please login again');
    }
  }
  public checkAuthentication(req: Request, res: Response, next: NextFunction) {
    if (!req?.currentUser) {
      throw new NotAuthorizedError('Authentication is required to access this route');
    }
    next();
  }
}
