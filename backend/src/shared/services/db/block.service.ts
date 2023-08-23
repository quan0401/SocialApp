import { PullOperator, PushOperator, SetFields } from 'mongodb';
import mongoose, { Document } from 'mongoose';
import { UserModel } from '~user/models/user.schema';

class BlockService {
  public async block(blockerId: string, beingBlockedId: string): Promise<void> {
    await UserModel.bulkWrite([
      {
        updateOne: {
          filter: {
            _id: blockerId,
            blocked: { $ne: new mongoose.Types.ObjectId(beingBlockedId) }
          },
          update: {
            $push: {
              blocked: new mongoose.Types.ObjectId(beingBlockedId)
            } as PushOperator<Document>
          }
        }
      },
      {
        updateOne: {
          filter: {
            _id: beingBlockedId,
            blockedBy: { $ne: new mongoose.Types.ObjectId(blockerId) }
          },
          update: {
            $push: {
              blockedBy: new mongoose.Types.ObjectId(blockerId)
            } as PushOperator<Document>
          }
        }
      }
    ]);
  }

  public async unblock(blockerId: string, beingBlockedId: string): Promise<void> {
    await UserModel.bulkWrite([
      {
        updateOne: {
          filter: {
            _id: blockerId
          },
          update: {
            $pull: {
              blocked: new mongoose.Types.ObjectId(beingBlockedId)
            } as PullOperator<Document>
          }
        }
      },
      {
        updateOne: {
          filter: {
            _id: beingBlockedId
          },
          update: {
            $pull: {
              blockedBy: new mongoose.Types.ObjectId(blockerId)
            }
          }
        }
      }
    ]);
  }
}

export const blockService: BlockService = new BlockService();
