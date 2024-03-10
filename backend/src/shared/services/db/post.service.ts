import { IGetPostsQuery, IPostDocument, IQueryDeleted } from '~post/interfaces/post.interface';
import { PostModel } from '~post/models/post.schema';
import { UserModel } from '~user/models/user.schema';
import { Query, UpdateQuery } from 'mongoose';
import { IUserDocument } from '~user/interfaces/user.interface';
import { IQueryComplete } from '~post/interfaces/post.interface';

class PostService {
  public async addPost(userId: string, createdPost: IPostDocument): Promise<void> {
    const user: UpdateQuery<IUserDocument> = UserModel.findOneAndUpdate({ _id: userId }, { $inc: { postsCount: 1 } });
    const post: Promise<IPostDocument> = PostModel.create(createdPost);
    await Promise.all([user, post]);
  }

  public async getPosts(query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<IPostDocument[]> {
    let postQuery = {};
    if (query?.imgId && query?.gifUrl) {
      postQuery = { $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } }] };
    } else {
      postQuery = query;
    }
    const posts: IPostDocument[] = await PostModel.aggregate([{ $match: postQuery }, { $sort: sort }, { $skip: skip }, { $limit: limit }]);
    return posts;
  }

  public async postCounts(): Promise<number> {
    const count: number = await PostModel.find().countDocuments();
    return count;
  }

  public async deletePost(postId: string, userId: string): Promise<void> {
    const deletedPost: Query<IQueryComplete & IQueryDeleted, IPostDocument> = PostModel.deleteOne({ _id: postId });
    const user: UpdateQuery<IUserDocument> = UserModel.findOneAndUpdate({ _id: userId }, { $inc: { postsCount: -1 } });
    await Promise.all([deletedPost, user]);
  }

  public async editPost(postId: string, updatedPost: IPostDocument): Promise<void> {
    const updatePost: UpdateQuery<IPostDocument> = PostModel.updateOne({ _id: postId }, { $set: updatedPost });
    await Promise.all([updatePost]);
  }
}

export const postService: PostService = new PostService();
