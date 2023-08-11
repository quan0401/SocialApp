import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { joiValidation } from '~global/decorators/joi-validation.decorators';
import { PostCache } from '~services/redis/post.cache';
import { postScheme, postWithImageScheme } from '~post/schemes/post.schemes';
import { socketIOPostObject } from '~sockets/post.socket';
import { postQueue } from '~services/queues/post.queue';
import { IPostDocument } from '~post/interfaces/post.interface';
import { uploads } from '~global/helpers/cloudinary-upload';
import { UploadApiResponse } from 'cloudinary';
import { BadRequesetError } from '~global/helpers/error-handler';

const postCache: PostCache = new PostCache();

export class CreatePost {
  @joiValidation(postScheme)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings } = req.body as IPostDocument;
    const postId: ObjectId = new ObjectId();

    const createdPost: IPostDocument = {
      _id: postId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      privacy,
      gifUrl,
      commentsCount: 0,
      feelings,
      reactions: {
        like: 0,
        love: 0,
        haha: 0,
        wow: 0,
        sad: 0,
        angrty: 0
      },
      createdAt: new Date()
    } as IPostDocument;
    socketIOPostObject.emit('add post', createdPost);
    await postCache.savePostToCache({ key: postId, uId: req.currentUser!.uId, currentUserId: req.currentUser!.userId, createdPost });
    postQueue.addPostJob('addPostToDB', { key: req.currentUser!.userId, value: createdPost });

    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully' });
  }

  @joiValidation(postWithImageScheme)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } = req.body as IPostDocument;
    const result: UploadApiResponse = (await uploads(image!)) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequesetError(result.message);
    }
    const postId: ObjectId = new ObjectId();

    const createdPost: IPostDocument = {
      _id: postId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      privacy,
      gifUrl,
      commentsCount: 0,
      feelings,
      reactions: {
        like: 0,
        love: 0,
        haha: 0,
        wow: 0,
        sad: 0,
        angrty: 0
      },
      imgVersion: result.version.toString(),
      imgId: result.public_id.toString(),
      createdAt: new Date()
    } as IPostDocument;

    socketIOPostObject.emit('add post', createdPost);
    await postCache.savePostToCache({ key: postId, uId: req.currentUser!.uId, currentUserId: req.currentUser!.userId, createdPost });
    postQueue.addPostJob('addPostToDB', { key: req.currentUser!.userId, value: createdPost });
    // call image queue to add to mongoDB

    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created with image successfully' });
  }
}
