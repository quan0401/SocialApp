import HTTP_STATUS from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { config } from '~/config';
import { IChat, IChatUsers, IMessageData, IMessageNotification } from '~chat/interfaces/chat.interface';
import { addChatSchema, removeChatUsers } from '~chat/schemes/chat.scheme';
import { joiValidation } from '~global/decorators/joi-validation.decorators';
import { uploads } from '~global/helpers/cloudinary-upload';
import { BadRequesetError } from '~global/helpers/error-handler';
import { INotificationTemplate } from '~nofitication/interfaces/notification.interface';
import { nofiticationTemplate } from '~services/emails/template/nofitications/nofitication-template';
import { emailQueue } from '~services/queues/email.queue';
import { UserCache } from '~services/redis/user.cache';
import { socketChatObject } from '~sockets/chat.socket';
import { IUserDocument } from '~user/interfaces/user.interface';
import { ChatCache } from '~services/redis/chat.cache';
import { chatQueue } from '~services/queues/chat.queue';

const userCahce: UserCache = new UserCache();
const chatCache: ChatCache = new ChatCache();

export class AddChatMessage {
  @joiValidation(addChatSchema)
  public async add(req: Request, res: Response): Promise<void> {
    const {
      conversationId,
      receiverId,
      receiverUsername,
      receiverAvatarColor,
      receiverProfilePicture,
      body,
      gifUrl,
      isRead,
      selectedImage
    } = req.body;

    const messageObjectId: ObjectId = new ObjectId();
    const conversationObjectId: ObjectId = !conversationId ? new ObjectId() : new mongoose.Types.ObjectId(conversationId);

    const sender: IUserDocument | null = await userCahce.getUserFromCache(req.currentUser!.userId);

    let fileUrl = '';
    if (selectedImage.length) {
      const result: UploadApiResponse = (await uploads(req.body.image, req.currentUser!.userId, true, true)) as UploadApiResponse;
      if (!result?.public_id) {
        throw new BadRequesetError(result.message);
      }
      fileUrl = `https://res.cloudinary.com/v${config.CLOUD_NAME}/image/upload/${result.version}/${config.FOLDER}/${req.currentUser?.userId}.jpg`;
    }
    const messageData: IMessageData = {
      _id: messageObjectId,
      conversationId: conversationObjectId,
      senderId: sender!._id as string,
      receiverId: receiverId as string,
      senderUsername: req.currentUser!.username,
      senderAvatarColor: req.currentUser!.avatarColor,
      senderProfilePicture: sender!.profilePicture,
      receiverUsername,
      receiverAvatarColor,
      receiverProfilePicture,
      body,
      gifUrl,
      isRead,
      selectedImage: fileUrl,
      reaction: [],
      createdAt: new Date(),
      deleteForMe: false,
      deleteForEveryone: false
    };

    AddChatMessage.prototype.emitSocketEvent(messageData);

    if (!isRead) {
      AddChatMessage.prototype.emailNofitcation({ currentUser: req.currentUser!, message: body, receiverId } as IMessageNotification);
    }

    await chatCache.addChatToListInCache(req.currentUser!.userId, receiverId, conversationObjectId.toString());
    await chatCache.addChatToListInCache(receiverId, req.currentUser!.userId, conversationObjectId.toString());
    await chatCache.addChatMessageToCache(conversationObjectId.toString(), messageData);
    chatQueue.addChatJob('addChatMessageToDB', messageData);

    res.status(HTTP_STATUS.CREATED).json({ message: 'Message added', conversationId: conversationObjectId });
  }

  @joiValidation(removeChatUsers)
  public async addChatUsers(req: Request, res: Response): Promise<void> {
    const chatUsers: IChatUsers[] = await chatCache.addChatUsersToCache(req.body);
    socketChatObject.emit('add chat users', chatUsers);
    res.status(HTTP_STATUS.OK).json({ message: 'Users added' });
  }

  @joiValidation(removeChatUsers)
  public async removeChatUsers(req: Request, res: Response): Promise<void> {
    const chatUsers: IChatUsers[] = await chatCache.removeChatUsersFromCache(req.body);
    socketChatObject.emit('add chat users', chatUsers);
    res.status(HTTP_STATUS.OK).json({ message: 'Users removed' });
  }

  private emitSocketEvent(data: IMessageData): void {
    socketChatObject.emit('message received', data);
    socketChatObject.emit('chat list', data);
  }

  private async emailNofitcation({ currentUser, message, receiverId }: IMessageNotification): Promise<void> {
    const cacheUser: IUserDocument = (await userCahce.getUserFromCache(receiverId)) as IUserDocument;
    if (cacheUser.notifications.messages) {
      const templateParams: INotificationTemplate = {
        username: cacheUser.username!,
        message,
        header: `Message nofitication from ${currentUser.username}`,
        image_url: cacheUser.profilePicture
      };
      const template: string = nofiticationTemplate.nofiticationMessageTemplate(templateParams);
      emailQueue.addEmailJob('directMessage', { receiverEmail: cacheUser.email!, subject: 'Chat nofitication', template });
    }
  }
}
