import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { postQueue } from '~services/queues/post.queue';
import { PostCache } from '~services/redis/post.cache';
import { socketIOPostObject } from '~sockets/post.socket';

const postCache: PostCache = new PostCache();

export class DeletePost {
  public async delete(req: Request, res: Response) {
    const { postId } = req.params;
    socketIOPostObject.emit('delete post', postId);
    await postCache.deletePostFromCache(postId, req.currentUser!.userId);
    postQueue.addPostJob('deletePostFromDB', { keyTwo: req.currentUser!.userId, keyOne: postId });
    res.status(HTTP_STATUS.OK).json({ message: 'Delete post successfully' });
  }
}
