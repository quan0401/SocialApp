import mongoose from 'mongoose';
import { INotificationDocument } from '~nofitication/interfaces/notification.interface';
import { NofiticationModel } from '~nofitication/model/nofitication.schema';

class NofiticationServcie {
  public async getNofitications(userId: string): Promise<INotificationDocument[]> {
    const nofitications: INotificationDocument[] = await NofiticationModel.aggregate([
      { $match: { userTo: new mongoose.Types.ObjectId(userId) } },
      { $lookup: { from: 'User', localField: 'userFrom', foreignField: '_id', as: 'userFromResult' } },
      { $unwind: '$userFromResult' },
      { $lookup: { from: 'Auth', localField: 'userFromResult.authId', foreignField: '_id', as: 'authFrom' } },
      { $unwind: '$authFrom' },
      {
        $project: {
          _id: 1,
          userTo: 1,
          message: 1,
          notificationType: 1,
          entityId: 1,
          createdItemId: 1,
          comment: 1,
          reaction: 1,
          post: 1,
          imgId: 1,
          imgVersion: 1,
          gifUrl: 1,
          read: 1,
          userFrom: {
            avatarColor: '$authFrom.avatarColor',
            uId: '$authFrom.uId',
            profilePicture: '$userFromResult.profilePicture',
            username: '$userFromResult.username'
          }
        }
      }
    ]);

    // const nofitications: INotificationDocument[] = await NofiticationModel.find({ userTo: new mongoose.Types.ObjectId(userId) });
    console.log(nofitications);
    return nofitications;
  }

  public async updateNofitication(nofiticationId: string): Promise<void> {
    await NofiticationModel.findOneAndUpdate({ _id: nofiticationId }, { $set: { read: true } });
  }

  public async deleteNofitication(nofiticationId: string): Promise<void> {
    await NofiticationModel.deleteOne({ _id: nofiticationId });
  }
}

export const nofiticationService: NofiticationServcie = new NofiticationServcie();
