import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';

export class Signout {
  public signout(req: Request, res: Response) {
    req.session = null;
    res.status(HTTP_STATUS.OK).json({ message: 'Successful logout', user: {}, token: '' });
  }
}
