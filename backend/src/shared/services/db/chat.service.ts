import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { IMessageData } from '~chat/interfaces/chat.interface';
import { IConversationDocument } from '~chat/interfaces/conversation.interface';
import { MessageModel } from '~chat/model/chat.schema';
import { ConversationModel } from '~chat/model/conversation.schema';

class ChatService {
  public async addChatMessage(data: IMessageData): Promise<void> {
    const conversation: IConversationDocument[] = await ConversationModel.find({ _id: data?.conversationId });
    if (conversation.length === 0) {
      await ConversationModel.create({
        senderId: data?.senderId,
        receiverId: data?.receiverId
      });
    }

    await MessageModel.create({
      _id: data._id,
      conversationId: data.conversationId,
      senderId: data.senderId,
      receiverId: data.receiverId,
      receiverUsername: data.receiverUsername,
      receiverAvatarColor: data.receiverAvatarColor,
      receiverProfilePicture: data.receiverProfilePicture,
      senderUsername: data.senderUsername,
      senderAvatarColor: data.senderAvatarColor,
      senderProfilePicture: data.senderProfilePicture,
      body: data.body,
      isRead: data.isRead,
      gifUrl: data.gifUrl,
      selectedImage: data.selectedImage,
      reaction: data.reaction,
      createdAt: data.createdAt,
      deleteForMe: data.deleteForMe,
      deleteForEveryone: data.deleteForEveryone
    });
  }

  public async getUserConversationList(userId: ObjectId): Promise<IMessageData[]> {
    const messages: IMessageData[] = await MessageModel.aggregate([
      { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
      {
        $group: {
          _id: '$conversationId',
          result: { $last: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: '$result._id',
          conversationId: '$result.conversationId',
          senderId: '$result.senderId',
          receiverId: '$result.receiverId',
          senderUsername: '$result.senderUsername',
          senderAvatarColor: '$result.senderAvatarColor',
          senderProfilePicture: '$result.senderProfilePicture',
          receiverUsername: '$result.receiverUsername',
          receiverAvatarColor: '$result.receiverAvatarColor',
          receiverProfilePicture: '$result.receiverProfilePicture',
          body: '$result.body',
          gifUrl: '$result.gifUrl',
          isRead: '$result.isRead',
          selectedImage: '$result.selectedImage',
          reaction: '$result.reaction',
          createdAt: '$result.createdAt',
          deleteForMe: '$result.deleteForMe',
          deleteForEveryone: '$result.deleteForEveryone'
        }
      },
      {
        $sort: { createdAt: 1 }
      }
    ]);
    return messages;
  }

  public async getMessages(conversationId: ObjectId): Promise<IMessageData[]> {
    const messages: IMessageData[] = await MessageModel.aggregate([{ $match: { conversationId: conversationId } }]);
    return messages;
  }

  public async markMessageAsDeleted(messageId: string, type: string): Promise<void> {
    if (type === 'deleteForMe') await MessageModel.findOneAndUpdate({ _id: messageId }, { $set: { deleteForMe: true } });
    else await MessageModel.findOneAndUpdate({ _id: messageId }, { $set: { deleteForEveryone: true, deleteForMe: true } });
  }

  public async markMessagesAsRead(senderId: string, conversationId: string): Promise<void> {
    await MessageModel.updateMany({ conversationId, senderId }, { $set: { isRead: true } });
  }

  public async updateMessageReaction(messageId: string, senderName: string, reaction: string, type: 'add' | 'remove'): Promise<void> {
    if (type === 'add') await MessageModel.findOneAndUpdate({ _id: messageId }, { $push: { reaction: { senderName, type: reaction } } });
    else if (type === 'remove') {
      await MessageModel.findOneAndUpdate({ _id: messageId }, { $pull: { reaction: { senderName } } });
    }
  }
}

export const chatService: ChatService = new ChatService();
