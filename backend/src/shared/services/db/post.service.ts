import { IGetPostsQuery, IPostDocument, IQueryDeleted } from '~post/interfaces/post.interface';
import { PostModel } from '~post/models/post.schema';
import { UserModel } from '~user/models/user.schema';
import { UpdateQuery } from 'mongoose';
import { IUserDocument } from '~user/interfaces/user.interface';
import { IQueryComplete } from '~post/interfaces/post.interface';
import { imageService } from './image.service';
import { ResourceType } from 'cloudinary';

class PostService {
  public async addPost(userId: string, createdPost: IPostDocument): Promise<void> {
    const user: UpdateQuery<IUserDocument> = UserModel.findOneAndUpdate({ _id: userId }, { $inc: { postsCount: 1 } });
    const post: Promise<IPostDocument> = PostModel.create(createdPost);
    await Promise.all([user, post]);
  }

  public async getPosts(query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<IPostDocument[]> {
    let postQuery = {};
    if (query?.imgId && query?.gifUrl) postQuery = { $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } }] };
    else if (query?.videoId) postQuery = { $or: [{ videoId: { $ne: '' } }] };
    else postQuery = query;

    const posts: IPostDocument[] = await PostModel.aggregate([{ $match: postQuery }, { $sort: sort }, { $skip: skip }, { $limit: limit }]);
    return posts;
  }

  public async postCounts(): Promise<number> {
    const count: number = await PostModel.find().countDocuments();
    return count;
  }

  public async deletePost(postId: string, userId: string): Promise<void> {
    const deletedPost: IPostDocument = (await PostModel.findOne({ _id: postId })) as IPostDocument;

    const user: UpdateQuery<IUserDocument> = UserModel.findOneAndUpdate(
      { _id: userId, postsCount: { $gt: 0 } },
      { $inc: { postsCount: -1 } }
    );

    if (deletedPost?.imgId || deletedPost?.videoId) {
      const resource_type: ResourceType = deletedPost?.imgId ? 'image' : 'video';
      await imageService.removeFromCloudById(
        (resource_type === 'image' ? deletedPost?.imgId : deletedPost?.videoId) as string,
        resource_type
      );
    }
    if (deletedPost) await deletedPost.deleteOne();
    await Promise.all([user]);
  }

  public async editPost(postId: string, updatedPost: IPostDocument): Promise<void> {
    // const updatePost: UpdateQuery<IPostDocument> = PostModel.updateOne({ _id: postId }, { $set: updatedPost });
    // const oldPost: IPostDocument = (await PostModel.findById(postId)) as IPostDocument;
    const oldPost: IPostDocument = (await PostModel.findOneAndUpdate(
      { _id: postId },
      { $set: updatedPost },
      { new: false }
    )) as IPostDocument;
    // if oldPost and newPost has different content, db will delete the old content
    if (updatedPost?.imgId !== oldPost?.imgId || updatedPost?.videoId !== oldPost?.videoId) {
      await this.removeContentFromCloud(oldPost as IPostDocument);
    }
  }

  private async removeContentFromCloud(post: IPostDocument): Promise<void> {
    const resource_type: ResourceType = post?.imgId ? 'image' : 'video';
    const contentId: string = (resource_type === 'image' ? post.imgId : post.videoId) as string;
    await imageService.removeFromCloudById(contentId, resource_type);
  }
}

export const postService: PostService = new PostService();
