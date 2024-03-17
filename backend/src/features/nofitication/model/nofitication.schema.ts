import { INotification } from './../interfaces/notification.interface';
import mongoose, { Model, Schema, model } from 'mongoose';

import { INotificationDocument } from '~nofitication/interfaces/notification.interface';
import { nofiticationService } from '~services/db/nofitication.service';

const nofiticationSchema: Schema = new Schema({
  userTo: { type: mongoose.Types.ObjectId, ref: 'User' },
  userFrom: { type: mongoose.Types.ObjectId, ref: 'User' },
  read: { type: Boolean, default: false },
  message: { type: String, default: '' },
  notificationType: String,
  entityId: mongoose.Types.ObjectId,
  createdItemId: mongoose.Types.ObjectId,
  comment: { type: String, default: '' },
  reaction: { type: String, default: '' },
  post: { type: String, default: '' },
  imgId: { type: String, default: '' },
  imgVersion: { type: String, default: '' },
  gifUrl: { type: String, default: '' },
  createdAt: { type: Date, default: new Date() }
});

nofiticationSchema.methods.insertNotification = async (body: INotification) => {
  const {
    userTo,
    userFrom,
    message,
    notificationType,
    entityId,
    createdItemId,
    createdAt,
    comment,
    reaction,
    post,
    imgId,
    imgVersion,
    gifUrl
  } = body;

  await NofiticationModel.create({
    userTo,
    userFrom,
    message,
    notificationType,
    entityId,
    createdItemId,
    comment,
    reaction,
    post,
    imgId,
    imgVersion,
    gifUrl,
    createdAt
  });

  try {
    const nofications: INotificationDocument[] = await nofiticationService.getNofitications(userTo);
    return nofications;
  } catch (error) {
    return error;
  }
};

export const NofiticationModel: Model<INotificationDocument> = model<INotificationDocument>(
  'Nofitication',
  nofiticationSchema,
  'Nofitication'
);
