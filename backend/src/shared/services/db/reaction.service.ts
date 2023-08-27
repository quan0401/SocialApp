import { IPostDocument } from '~post/interfaces/post.interface';
import { PostModel } from '~post/models/post.schema';
import { IQueryReaction, IReactionDocument, IReactionJob } from '~reaction/interfaces/reaction.interface';
import { ReactionModel } from '~reaction/models/reaction.schema';
import { UserCache } from '~services/redis/user.cache';
import { IUserDocument } from '~user/interfaces/user.interface';
import { omit } from 'lodash';
import mongoose from 'mongoose';
import { INotificationDocument, INotificationTemplate } from '~nofitication/interfaces/notification.interface';
import { NofiticationModel } from '~nofitication/model/nofitication.schema';
import { socketIONofitcationObject } from '~sockets/nofitication.socket';
import { emailQueue } from '~services/queues/email.queue';
import { nofiticationTemplate } from '~services/emails/template/nofitications/nofitication-template';

const userCache: UserCache = new UserCache();

class ReactionService {
  public async addReactionToDB(reactionData: IReactionJob): Promise<void> {
    const { postId, previousReaction, userTo, userFrom, type, reactionObject, username } = reactionData;

    let deletedIdReactionObject: IReactionDocument = reactionObject as IReactionDocument;

    if (previousReaction) deletedIdReactionObject = omit(reactionObject, ['_id']);

    const updateReaction: [IUserDocument, IReactionDocument, IPostDocument, IUserDocument] = (await Promise.all([
      userCache.getUserFromCache(userTo as string),
      ReactionModel.replaceOne({ postId, type: previousReaction, userId: userFrom }, deletedIdReactionObject, { upsert: true }),
      PostModel.findOneAndUpdate(
        { _id: postId },
        {
          $inc: { [`reactions.${previousReaction}`]: -1, [`reactions.${type}`]: 1 }
        },
        { new: true }
      ),
      userCache.getUserFromCache(userFrom as string)
    ])) as unknown as [IUserDocument, IReactionDocument, IPostDocument, IUserDocument];

    // Send reaction nofitication
    if (updateReaction[0].notifications.reactions && userFrom !== userTo) {
      const nofitication: INotificationDocument = new NofiticationModel();
      const nofitications: INotificationDocument[] = await nofitication.insertNotification({
        userTo: userTo!,
        userFrom: userFrom!,
        message: `${username} reacts your post`,
        notificationType: 'reaction',
        entityId: new mongoose.Types.ObjectId(userFrom),
        createdItemId: new mongoose.Types.ObjectId(updateReaction[1]._id),
        createdAt: new Date(),
        comment: '',
        reaction: updateReaction[1].type,
        post: '',
        imgId: '',
        imgVersion: '',
        gifUrl: ''
      });

      socketIONofitcationObject.emit('insert nofitication', nofitications, { userTo });

      console.log(updateReaction[3].profilePicture);

      const templateParams: INotificationTemplate = {
        username: updateReaction[0].username!,
        message: `${username} reacts your post`,
        header: 'Reaction Nofitication',
        image_url: updateReaction[3].profilePicture
      };
      const template: string = nofiticationTemplate.nofiticationMessageTemplate(templateParams);

      emailQueue.addEmailJob('reactionEmail', {
        receiverEmail: updateReaction[0].email!,
        subject: 'Reaction Nofitication',
        template
      });
    }
  }

  public async removeReactionFromDB(reactionData: IReactionJob): Promise<void> {
    const { postId, previousReaction, userFrom } = reactionData;
    await Promise.all([
      ReactionModel.deleteOne({ postId, userId: userFrom, type: previousReaction }),
      PostModel.findOneAndUpdate(
        { _id: postId, [`reactions.${previousReaction}`]: { $gt: 0 } },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1
          }
        }
      )
    ]);
  }

  public async getPostReactions(query: IQueryReaction, sort: Record<string, 1 | -1>): Promise<[IReactionDocument[], number]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: query },
      {
        $sort: sort
      }
    ]);
    return [reactions, reactions.length];
  }

  public async getReactionByUserId(postId: string, userId: string): Promise<[IReactionDocument, 1] | []> {
    const reaction: IReactionDocument = (await ReactionModel.findOne({ postId, userId })) as IReactionDocument;
    return reaction ? [reaction, 1] : [];
  }

  public async getAllReactionsByUserId(userId: string): Promise<IReactionDocument[]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([{ $match: { userId: new mongoose.Types.ObjectId(userId) } }]);
    return reactions;
  }
}

export const reactionService: ReactionService = new ReactionService();
