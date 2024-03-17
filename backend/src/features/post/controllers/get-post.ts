import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { IPostDocument } from '~post/interfaces/post.interface';
import { postService } from '~services/db/post.service';
import { PostCache } from '~services/redis/post.cache';

const PAGE_SIZE = 10;

const postCache: PostCache = new PostCache();

export class GetPost {
  public async getPosts(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const start: number = PAGE_SIZE * (parseInt(page, 10) - 1);
    const end: number = PAGE_SIZE * parseInt(page, 10);
    const newStart: number = start === 0 ? start : start + 1;

    let posts = [];
    let totalPost = 0;
    const cachePosts: IPostDocument[] = await postCache.getPostsFromCache('post', newStart, end);
    if (cachePosts.length) {
      posts = cachePosts;
      totalPost = await postCache.getTotalPostCountInCache();
    } else {
      posts = await postService.getPosts({}, start, end, { createdAt: -1 });
      totalPost = await postService.postCounts();
    }
    res.status(HTTP_STATUS.OK).json({ message: 'All posts', posts, totalPost });
  }

  public async getPostsWithImages(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const start: number = PAGE_SIZE * (parseInt(page, 10) - 1);
    const end: number = PAGE_SIZE * parseInt(page, 10);
    const newStart: number = start === 0 ? start : start + 1;

    let posts = [];
    const cachePosts: IPostDocument[] = await postCache.getPostsWithImagesFromCache('post', newStart, end);

    posts = cachePosts.length
      ? cachePosts
      : (posts = await postService.getPosts({ imgId: '$ne', gifUrl: '$ne' }, start, end, { createdAt: -1 }));
    res.status(HTTP_STATUS.OK).json({ message: 'All posts with images', posts });
  }

  public async getPostsWithVideos(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const start: number = PAGE_SIZE * (parseInt(page, 10) - 1);
    const end: number = PAGE_SIZE * parseInt(page, 10);
    const newStart: number = start === 0 ? start : start + 1;

    let posts = [];
    const cachePosts: IPostDocument[] = await postCache.getPostsWithVideoFromCache('post', newStart, end);
    posts = cachePosts.length ? cachePosts : (posts = await postService.getPosts({ videoId: '$ne' }, start, end, { createdAt: -1 }));
    res.status(HTTP_STATUS.OK).json({ message: 'All posts with images', posts });
  }
}
