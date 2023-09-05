import { config } from '~/config';
import { BaseCache } from './base.cache';
import Logger from 'bunyan';
import { ServerError } from '~global/helpers/error-handler';
import { IUserDocument } from '~user/interfaces/user.interface';
import { Helpers } from '~global/helpers/helpers';
import { IChat, IChatUsers, IGetMessageFromCache, IMessageData } from '~chat/interfaces/chat.interface';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';
import _ from 'lodash';

const log: Logger = config.createLogger('chatCache');

export class ChatCache extends BaseCache {
  constructor() {
    super('chatCache');
  }
  public async addChatToListInCache(senderId: string, receiverId: string, conversationId: string): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const userChatList: IChat[] = (await this.client.LRANGE(`chatList:${senderId}`, 0, -1)).map((item) => Helpers.parseJson(item));
      if (userChatList.length === 0) {
        await this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
      } else {
        const receiverIndex: number = userChatList.findIndex((user) => user.receiverId === receiverId);

        if (receiverIndex < 0) {
          await this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
        }
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Chat cache error');
    }
  }

  public async addChatMessageToCache(conversationId: string, value: IMessageData): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      await this.client.RPUSH(`messages:${conversationId}`, JSON.stringify(value));
    } catch (error) {
      log.error(error);
      throw new ServerError('Chat cache error');
    }
  }

  public async addChatUsersToCache(value: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const users: IChatUsers[] = await this.getChatUsersList();

      const usersIndex = users.findIndex((item) => JSON.stringify(item) === JSON.stringify(value));
      if (usersIndex < 0) {
        await this.client.RPUSH('chatUsers', JSON.stringify(value));
        users.push(value);
      }
      return users;
    } catch (error) {
      log.error(error);
      throw new ServerError('Chat cache error');
    }
  }

  public async removeChatUsersFromCache(value: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      let users: IChatUsers[] = await this.getChatUsersList();

      const usersIndex = users.findIndex((item) => JSON.stringify(item) === JSON.stringify(value));
      if (usersIndex > -1) {
        await this.client.LREM('chatUsers', 1, JSON.stringify(value));
        users = await this.getChatUsersList();
      }
      return users;
    } catch (error) {
      log.error(error);
      throw new ServerError('Chat cache error');
    }
  }

  public async getUserConversationList(key: string): Promise<IMessageData[]> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const userChatList: IChat[] = (await this.client.LRANGE(`chatList:${key}`, 0, -1)).map((user) => Helpers.parseJson(user));
      const conversationChatList: IMessageData[] = [];

      userChatList.forEach(async (userChat) => {
        const lastMessage: string = (await this.client.LINDEX(`messages:${userChat.conversationId}`, -1)) as string;
        conversationChatList.push(Helpers.parseJson(lastMessage));
      });
      return conversationChatList;
    } catch (error) {
      log.error(error);
      throw new ServerError('Chat cache error');
    }
  }

  public async getMessages(conversationId: string): Promise<IMessageData[]> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const messages: IMessageData[] = (await this.client.LRANGE(`messages:${conversationId}`, 0, -1)).map((message) =>
        Helpers.parseJson(message)
      );
      return messages;
    } catch (error) {
      log.error(error);
      throw new ServerError('Chat cache error');
    }
  }

  public async markMessageAsDeleted(senderId: string, conversationId: string, messageId: string, type: string): Promise<IMessageData> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const { index, message, receiver }: IGetMessageFromCache = await this.getMessage(senderId, conversationId, messageId);
      if (type === 'deleteForMe') {
        message.deleteForMe = true;
      } else {
        message.deleteForMe = true;
        message.deleteForEveryone = true;
      }
      await this.client.LSET(`messages:${conversationId}`, index, JSON.stringify(message));
      return message;
    } catch (error) {
      log.error(error);
      throw new ServerError('Chat cache error');
    }
  }

  public async markMessagesAsRead(senderId: string, conversationId: string): Promise<IMessageData | null> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const list: IChat[] = (await this.client.LRANGE(`chatList:${senderId}`, 0, -1)).map((item) => Helpers.parseJson(item));
      const foundConversation = list.find((item) => item.conversationId === conversationId);
      if (!foundConversation) return null;

      const messages: IMessageData[] = (await this.client.LRANGE(`messages:${conversationId}`, 0, -1)).map((message) =>
        Helpers.parseJson(message)
      );
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].isRead) break;
        messages[i].isRead = true;
        await this.client.LSET(`messages:${conversationId}`, i, JSON.stringify(messages[i]));
      }
      const lastMessage: IMessageData = messages[messages.length - 1];
      return lastMessage;
    } catch (error) {
      log.error(error);
      throw new ServerError('Chat cache error');
    }
  }

  public async updateMessageReaction(
    conversationId: string,
    messageId: string,
    senderName: string,
    reaction: string,
    type: 'add' | 'remove'
  ): Promise<IMessageData | null> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const messages: IMessageData[] = (await this.client.LRANGE(`messages:${conversationId}`, 0, -1)).map((message) =>
        Helpers.parseJson(message)
      );
      const messageIndex = messages.findIndex((message) => message._id === messageId);
      const foundMessage: IMessageData = Helpers.parseJson(
        await this.client.LINDEX(`messages:${conversationId}`, messageIndex)
      ) as IMessageData;

      if (foundMessage) {
        _.remove(foundMessage.reaction, (reaction) => reaction.senderName === senderName);
        if (type === 'add') {
          foundMessage.reaction.push({ senderName, type: reaction });
        }
        await this.client.LSET(`messages:${conversationId}`, messageIndex, JSON.stringify(foundMessage));
        return foundMessage;
      }
      return null;
    } catch (error) {
      log.error(error);
      throw new ServerError('Chat cache error');
    }
  }

  private async getChatUsersList(): Promise<IChatUsers[]> {
    const chatUsers = (await this.client.LRANGE('chatUsers', 0, -1)).map((chatUser) => Helpers.parseJson(chatUser));
    return chatUsers;
  }

  private async getMessage(senderId: string, conversationId: string, messageId: string): Promise<IGetMessageFromCache> {
    const userChatLists: IChat[] = (await this.client.LRANGE(`chatList:${senderId}`, 0, -1)).map((item) => Helpers.parseJson(item));
    const foundChatList: IChat = userChatLists.find((item) => item.conversationId === conversationId) as IChat;

    const messages: IMessageData[] = (await this.client.LRANGE(`messages:${conversationId}`, 0, -1)).map((message) =>
      Helpers.parseJson(message)
    );

    const messageIndex: number = messages.findIndex((message) => message._id === messageId);
    return { index: messageIndex, message: messages[messageIndex], receiver: { ...foundChatList } };
  }
}
