import mongoose, { Query } from 'mongoose';
import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '~comment/interfaces/comment.interface';
import { CommentsModel } from '~comment/model/comment.schema';
import { INotificationDocument, INotificationTemplate } from '~nofitication/interfaces/notification.interface';
import { NofiticationModel } from '~nofitication/model/nofitication.schema';
import { IPostDocument } from '~post/interfaces/post.interface';
import { PostModel } from '~post/models/post.schema';
import { ReactionModel } from '~reaction/models/reaction.schema';
import { nofiticationTemplate } from '~services/emails/template/nofitications/nofitication-template';
import { emailQueue } from '~services/queues/email.queue';
import { UserCache } from '~services/redis/user.cache';
import { socketIONofitcationObject } from '~sockets/nofitication.socket';
import { IUserDocument } from '~user/interfaces/user.interface';

const userCache: UserCache = new UserCache();

class CommentService {
  public async addCommentToDB(commentData: ICommentJob): Promise<void> {
    const { postId, userTo, userFrom, username, comment } = commentData;

    const createdComment: Promise<ICommentDocument> = CommentsModel.create(comment);
    const post: Query<IPostDocument, IPostDocument> = PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { commentsCount: 1 } },
      { new: true }
    ) as Query<IPostDocument, IPostDocument>;

    const user: Promise<IUserDocument> = userCache.getUserFromCache(userTo) as Promise<IUserDocument>;
    const response: [ICommentDocument, IPostDocument, IUserDocument] = await Promise.all([createdComment, post, user]);

    // Send nofitication
    if (response[2].notifications.comments && userFrom !== userTo) {
      const nofiticationModel: INotificationDocument = new NofiticationModel();
      const nofitications: INotificationDocument[] = await nofiticationModel.insertNotification({
        userFrom,
        userTo,
        message: `${username} commented on this post.`,
        notificationType: 'comment',
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(response[0]._id!),
        comment: comment.comment,
        post: response[1].post,
        imgId: response[1].imgId!,
        imgVersion: response[1].imgVersion!,
        gifUrl: response[1].gifUrl!,
        reaction: '',
        createdAt: new Date()
      });
      // Send to client with socket
      socketIONofitcationObject.emit('insert nofitication', nofitications, { userTo });
      // Send to email queue
      const templateParams: INotificationTemplate = {
        username: response[2].username!,
        header: 'Comment Nofitication',
        message: `${username} commented on your post`
      };
      const template: string = nofiticationTemplate.nofiticationMessageTemplate(templateParams);
      emailQueue.addEmailJob('commentEmail', { template, receiverEmail: response[2].email!, subject: 'Post nofitication' });
    }
  }

  public async getCommentsFromPost(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> {
    const comments: ICommentDocument[] = await CommentsModel.aggregate([{ $match: query }, { $sort: sort }]);
    return comments;
  }

  public async getCommentById(query: IQueryComment): Promise<ICommentDocument> {
    const [comment]: ICommentDocument[] = await ReactionModel.aggregate([{ $match: query }]);
    return comment;
  }

  public async getCommentNamesFromPost(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentNameList> {
    const comments: ICommentNameList[] = await CommentsModel.aggregate([
      { $match: query },
      { $sort: sort },
      { $group: { _id: null, count: { $sum: 1 }, names: { $addToSet: '$username' } } },
      { $project: { _id: 0, count: 1, names: 1 } }
    ]);
    return comments[0];
  }
}

export const commentService: CommentService = new CommentService();
