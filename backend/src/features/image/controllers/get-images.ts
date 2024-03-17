import HTTP_STATUS from 'http-status-codes';
import { IFileImageDocument } from '~image/interfaces/image.interface';
import { Request, Response } from 'express';
import { imageService } from '~services/db/image.service';

export class GetImages {
  public async images(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const images: IFileImageDocument[] = await imageService.getImages(userId);
    res.status(HTTP_STATUS.OK).json({ message: 'User images', images });
  }
}
