import { Request, Response } from 'express';
import { postQueue } from '~services/queues/post.queue';
import { IPostDocument } from '~post/interfaces/post.interface';
import { socketIOPostObject } from '~sockets/post.socket';
import HTTP_STATUS from 'http-status-codes';
import { PostCache } from '~services/redis/post.cache';
import { joiValidation } from '~global/decorators/joi-validation.decorators';
import { postScheme, postWithContentScheme } from '~post/schemes/post.schemes';

import { UploadApiResponse } from 'cloudinary';
import { uploads, uploadsVideo } from '~global/helpers/cloudinary-upload';
import { BadRequesetError } from '~global/helpers/error-handler';
import { imageQueue } from '~services/queues/image.queue';

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
      videoVersion: '',
      videoId: '',
      feelings,
      gifUrl,
      privacy
    } as IPostDocument;

    const updatedPost = await postCache.updatePostInCache(postId, data);
    socketIOPostObject.emit('update post', updatedPost, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: updatedPost });
    res.status(HTTP_STATUS.OK).json({ message: 'Update post successfully' });
  }

  @joiValidation(postWithContentScheme)
  public async postWithContent(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion, videoId, videoVersion } = req.body;

    if ((imgId && imgVersion) || (videoId && videoVersion)) {
      imgId ? await UpdatePost.prototype.addImageToExistingPost(req) : await UpdatePost.prototype.addVideoToExistingPost(req);
    } else {
      const result: UploadApiResponse = req.body?.image
        ? await UpdatePost.prototype.addImageToExistingPost(req)
        : await UpdatePost.prototype.addVideoToExistingPost(req);
      if (!result?.public_id) throw new BadRequesetError(result.message);
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Post with content updated successfully' });
  }

  private async addImageToExistingPost(req: Request): Promise<UploadApiResponse> {
    const { profilePicture, post, bgColor, image, feelings, gifUrl, privacy } = req.body;
    const result: UploadApiResponse = (await uploads(image!)) as UploadApiResponse;

    if (!result?.public_id) return result;

    const { postId } = req.params;
    const data: IPostDocument = {
      profilePicture,
      post,
      bgColor,
      imgVersion: result.version.toString(),
      imgId: result.public_id.toString(),
      videoVersion: '',
      videoId: '',
      feelings,
      gifUrl,
      privacy
    } as IPostDocument;

    const updatedPost = await postCache.updatePostInCache(postId, data);
    socketIOPostObject.emit('update post', updatedPost, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: updatedPost });
    // call image queue to add to mongoDB
    imageQueue.addImageJob('addImageToDB', { key: req.currentUser!.userId, imgId: data.imgId });
    return result;
  }

  @joiValidation(postWithContentScheme)
  private async addVideoToExistingPost(req: Request): Promise<UploadApiResponse> {
    const { profilePicture, post, bgColor, video, feelings, gifUrl, privacy } = req.body;
    const result: UploadApiResponse = (await uploadsVideo(video!)) as UploadApiResponse;

    if (!result?.public_id) return result;
    const { postId } = req.params;
    const data: IPostDocument = {
      profilePicture,
      post,
      bgColor,
      videoVersion: result.version.toString(),
      videoId: result.public_id.toString(),
      imgVersion: '',
      imgId: '',
      feelings,
      gifUrl,
      privacy
    } as IPostDocument;

    const updatedPost: IPostDocument = await postCache.updatePostInCache(postId, data);
    socketIOPostObject.emit('update post', updatedPost, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: updatedPost });

    return result;
  }
}
