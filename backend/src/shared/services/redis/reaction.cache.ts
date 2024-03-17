import { IReactionDocument, IReactions, IUserReaction } from '~reaction/interfaces/reaction.interface';
import { BaseCache } from './base.cache';
import Logger from 'bunyan';
import { config } from '~/config';
import { ServerError } from '~global/helpers/error-handler';
import { Helpers } from '~global/helpers/helpers';
import { find } from 'lodash';

const log: Logger = config.createLogger('reactionCache');

export class ReactionCache extends BaseCache {
  constructor() {
    super('reactionCache');
  }
  public async savePostReactionToCache(
    key: string,
    reaction: IReactionDocument,
    postReactions: IReactions,
    type?: string,
    previousReaction?: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      if (previousReaction) {
        await this.removeReaction(key, { userId: reaction.userId.toString(), username: reaction.username }, postReactions);
      }
      if (type) {
        await this.client.LPUSH(`reactions:${key}`, JSON.stringify(reaction));
        await this.client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReactions));
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error, please try again');
    }
  }

  public async removeReaction(key: string, user: IUserReaction, postReactions: IReactions): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect();

      const response: string[] = await this.client.LRANGE(`reactions:${key}`, 0, -1);

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      const previousReaction: IReactionDocument = this.getReactionByUserIdFromList(response, user.userId) as IReactionDocument;
      if (previousReaction) multi.LREM(`reactions:${key}`, 1, JSON.stringify(previousReaction));

      await multi.exec();

      await this.client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReactions));
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error, please try again');
    }
  }

  public async getReactionsFromCache(postId: string): Promise<[IReactionDocument[], number]> {
    try {
      if (!this.client.isOpen) await this.client.connect();

      const postReactionsCount = await this.client.LLEN(`reactions:${postId}`);

      const reactions: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);

      const list: IReactionDocument[] = [];

      reactions.forEach((reaction) => {
        list.push(Helpers.parseJson(reaction));
      });

      return list.length ? [list, postReactionsCount] : [[], 0];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error, please try again');
    }
  }

  public async getReactionByUserId(postId: string, userId: string): Promise<[IReactionDocument, number] | []> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const reactionsFromPost: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
      const foundReaction: IReactionDocument = this.getReactionByUserIdFromList(reactionsFromPost, userId) as IReactionDocument;

      return foundReaction ? [foundReaction, 1] : [];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error, please try again');
    }
  }

  private getReactionByUserIdFromList(response: string[], userId: string): IReactionDocument | undefined {
    const list: IReactionDocument[] = [];
    for (const item of response) {
      list.push(Helpers.parseJson(item));
    }
    return find(list, (item) => item?.userId === userId);
  }
}
