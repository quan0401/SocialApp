import HTTP_STATUS from 'http-status-codes';
import { IFileImageDocument } from '~image/interfaces/image.interface';
import { Request, Response } from 'express';
import { imageService } from '~services/db/image.service';
import { mockImage, mockImageRequest, mockImageResponse } from '~mocks/image.mock';
import { authUserPayload } from '~mocks/auth.mock';
import { GetImages } from '~image/controllers/get-images';

jest.useFakeTimers();
jest.mock('~services/db/image.service');

const USER_ID = '64d1d8eeffde0ce3a2bbd12d';

describe('GetImages', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send correct response', async () => {
    const req: Request = mockImageRequest({}, { userId: USER_ID }, authUserPayload);
    const res: Response = mockImageResponse();
    const images: IFileImageDocument[] = [mockImage];

    jest.spyOn(imageService, 'getImages').mockResolvedValue(images);

    await GetImages.prototype.images(req, res);

    expect(imageService.getImages).toHaveBeenCalledWith(USER_ID);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({ message: 'User images', images });
  });
});
