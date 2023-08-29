import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { mockImage, mockImageRequest, mockImageResponse } from '~mocks/image.mock';
import { authUserPayload } from '~mocks/auth.mock';
import { AddImage } from '~image/controllers/add-image';
import * as cloudinaryUploads from '~global/helpers/cloudinary-upload';
import { CustomError } from '~global/helpers/error-handler';
import { imageQueue } from '~services/queues/image.queue';
import { UserCache } from '~services/redis/user.cache';
import * as socketServer from '~sockets/image.socket';
import { Server } from 'socket.io';
import { config } from '~/config';
import { userMock } from '~mocks/user.mock';

jest.useFakeTimers();
jest.mock('~services/db/image.service');
jest.mock('~services/queues/image.queue');
jest.mock('~services/queues/base.queue');
jest.mock('~services/redis/user.cache');

Object.defineProperties(socketServer, {
  socketImageObject: {
    value: new Server(),
    writable: true
  }
});

const USER_ID = '64d1d8eeffde0ce3a2bbd12d';
const IMAGE = 'data:image/jpeg;base64,/9j/4AAQSkZJRgA';
const EXISTING_IMAGE = 'https://res.cloudinary.com/dg3fsapzu/image/upload/v1693226082/social/64d1d8eeffde0ce3a2bbd12d.jpg';

const PUBLIC_ID = mockImage.imgId;
const VERSION = mockImage.imgVersion;

describe('AddImage: profile', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('Should throw error when upload has error', async () => {
    const req: Request = mockImageRequest({ image: IMAGE }, {}, authUserPayload);
    const res: Response = mockImageResponse();

    jest.spyOn(cloudinaryUploads, 'uploads').mockResolvedValue({} as any);

    await AddImage.prototype.profile(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('File upload: Error occured. Try again.');
    });
  });

  it('Should throw error when image is empty', async () => {
    const req: Request = mockImageRequest({}, {}, authUserPayload);
    const res: Response = mockImageResponse();

    await AddImage.prototype.profile(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('Image is required');
    });
  });

  it('Should send correct json response', async () => {
    const req: Request = mockImageRequest({ image: IMAGE }, {}, authUserPayload);
    const res: Response = mockImageResponse();

    const url = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${VERSION}/${PUBLIC_ID.toString()}.jpg`;

    jest.spyOn(cloudinaryUploads, 'uploads').mockResolvedValue({ public_id: PUBLIC_ID, version: VERSION } as any);
    jest.spyOn(UserCache.prototype, 'updateSingleFieldInCache').mockResolvedValue(userMock);
    jest.spyOn(socketServer.socketImageObject, 'emit');
    jest.spyOn(imageQueue, 'addImageJob');

    await AddImage.prototype.profile(req, res);

    expect(UserCache.prototype.updateSingleFieldInCache).toHaveBeenCalledWith(req.currentUser!.userId, 'profilePicture', url);
    expect(socketServer.socketImageObject.emit).toHaveBeenCalledWith('update user', userMock);
    expect(imageQueue.addImageJob).toHaveBeenCalledWith('addUserProfileImageToDB', {
      key: req.currentUser!.userId,
      value: url,
      imgId: PUBLIC_ID,
      imgVersion: VERSION
    });
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({ message: 'Image added successfully' });
  });
});

describe('AddImage: backgroundImageUpload', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('Should throw error when image is empty', async () => {
    const req: Request = mockImageRequest({}, {}, authUserPayload);
    const res: Response = mockImageResponse();

    await AddImage.prototype.backgroundImageUpload(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('Image is required');
    });
  });

  it('Should upload new image', async () => {
    const req: Request = mockImageRequest({ image: IMAGE }, {}, authUserPayload);
    const res: Response = mockImageResponse();

    jest.spyOn(cloudinaryUploads, 'uploads').mockResolvedValue({ public_id: PUBLIC_ID, version: VERSION } as any);

    await AddImage.prototype.backgroundImageUpload(req, res);

    expect(cloudinaryUploads.uploads).toHaveBeenCalledWith(IMAGE);
  });

  it('Should not upload existing image', async () => {
    const req: Request = mockImageRequest({ image: EXISTING_IMAGE }, {}, authUserPayload);
    const res: Response = mockImageResponse();

    jest.spyOn(cloudinaryUploads, 'uploads').mockResolvedValue({ public_id: PUBLIC_ID, version: VERSION } as any);

    await AddImage.prototype.backgroundImageUpload(req, res);

    expect(cloudinaryUploads.uploads).not.toHaveBeenCalled();
  });

  // it('Should send correct json response', async () => {
  //   const req: Request = mockImageRequest({ image: IMAGE }, {}, authUserPayload);
  //   const res: Response = mockImageResponse();

  //   const url = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${VERSION}/${PUBLIC_ID.toString()}.jpg`;

  //   jest.spyOn(cloudinaryUploads, 'uploads').mockResolvedValue({ public_id: PUBLIC_ID, version: VERSION } as any);
  //   jest.spyOn(UserCache.prototype, 'updateSingleFieldInCache').mockResolvedValue(userMock);
  //   jest.spyOn(socketServer.socketImageObject, 'emit');
  //   jest.spyOn(imageQueue, 'addImageJob');

  //   await AddImage.prototype.profile(req, res);

  //   expect(UserCache.prototype.updateSingleFieldInCache).toHaveBeenCalledWith(req.currentUser!.userId, 'profilePicture', url);
  //   expect(socketServer.socketImageObject.emit).toHaveBeenCalledWith('update user', userMock);
  //   expect(imageQueue.addImageJob).toHaveBeenCalledWith('addUserProfileImageToDB', {
  //     key: req.currentUser!.userId,
  //     value: url,
  //     imgId: PUBLIC_ID,
  //     imgVersion: VERSION
  //   });
  //   expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
  //   expect(res.json).toHaveBeenCalledWith({ message: 'Image added successfully' });
  // });
});
