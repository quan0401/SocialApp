import { Request, Response } from 'express';
import { postQueue } from '~services/queues/post.queue';
import { IPostDocument } from '~post/interfaces/post.interface';
import { socketIOPostObject } from '~sockets/post.socket';
import HTTP_STATUS from 'http-status-codes';
import { PostCache } from '~services/redis/post.cache';
import { joiValidation } from '~global/decorators/joi-validation.decorators';
import { postScheme, postWithImageScheme } from '~post/schemes/post.schemes';

import { UploadApiResponse } from 'cloudinary';
import { uploads } from '~global/helpers/cloudinary-upload';
import { BadRequesetError } from '~global/helpers/error-handler';

const postCache: PostCache = new PostCache();

export class UpdatePost {
  @joiValidation(postScheme)
  public async update(req: Request, res: Response): Promise<void> {
    const { profilePicture, post, bgColor, imgVersion, imgId, feelings, gifUrl, privacy } = req.body;
    const { postId } = req.params;
    const data: IPostDocument = {
      profilePicture,
      post,
      bgColor,
      imgVersion,
      imgId,
      feelings,
      gifUrl,
      privacy
    } as IPostDocument;

    const updatedPost = await postCache.updatePostInCache(postId, data);
    socketIOPostObject.emit('update post', updatedPost, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: updatedPost });
    res.status(HTTP_STATUS.OK).json({ message: 'Update post successfully' });
  }

  @joiValidation(postScheme)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion } = req.body;
    if (imgId && imgVersion) {
      UpdatePost.prototype.updatePostWithImage(req);
    } else {
      const result: UploadApiResponse = await UpdatePost.prototype.addImageToExistingPost(req);
      if (!result?.public_id) {
        throw new BadRequesetError(result.message);
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Post with image updated successfully' });
  }
  private async updatePostWithImage(req: Request) {
    const { profilePicture, post, bgColor, imgVersion, imgId, feelings, gifUrl, privacy } = req.body;
    const { postId } = req.params;
    const data: IPostDocument = {
      profilePicture,
      post,
      bgColor,
      imgVersion,
      imgId,
      feelings,
      gifUrl,
      privacy
    } as IPostDocument;

    const updatedPost = await postCache.updatePostInCache(postId, data);
    socketIOPostObject.emit('update post', updatedPost, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: updatedPost });
  }

  @joiValidation(postWithImageScheme)
  private async addImageToExistingPost(req: Request): Promise<UploadApiResponse> {
    const { profilePicture, post, bgColor, image, imgVersion, imgId, feelings, gifUrl, privacy } = req.body;
    const result: UploadApiResponse = (await uploads(image!)) as UploadApiResponse;
    if (!result?.public_id) {
      return result;
    }
    const { postId } = req.params;
    const data: IPostDocument = {
      profilePicture,
      post,
      bgColor,
      image,
      imgVersion: result.version.toString(),
      imgId: result.public_id.toString(),
      feelings,
      gifUrl,
      privacy
    } as IPostDocument;

    const updatedPost = await postCache.updatePostInCache(postId, data);
    socketIOPostObject.emit('update post', updatedPost, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: updatedPost });
    // call image queue to add to mongoDB
    return result;
  }
}
