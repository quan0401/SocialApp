import { ResourceType } from 'cloudinary';
import { DeleteResult } from 'mongodb';
import mongoose from 'mongoose';
import { IDeleteFromCloudinary, deleteImageInCloudinary } from '~global/helpers/cloudinary-delete';
import { BadRequesetError } from '~global/helpers/error-handler';
import { IFileImageDocument } from '~image/interfaces/image.interface';
import { ImageModel } from '~image/model/image.schema';
import { UserModel } from '~user/models/user.schema';

class ImageService {
  public async addProfilePicture(userId: string, url: string, imgId: string, imgVersion: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { profilePicture: url } });
    await this.addImage(userId, imgId, imgVersion, '');
  }

  public async addBackgroundImage(userId: string, imgId: string, imgVersion: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { bgImageId: imgId, bgImageVersion: imgVersion } });
    await this.addImage(userId, imgId, imgVersion, 'background');
  }

  public async addImage(userId: string, imgId: string, imgVersion: string, type: 'background' | ''): Promise<void> {
    await ImageModel.create({
      userId,
      bgImageId: type === 'background' ? imgId : '',
      bgImageVersion: type === 'background' ? imgVersion : '',
      imgId: type !== 'background' ? imgId : '',
      imgVersion: type !== 'background' ? imgVersion : ''
    });
  }

  public async removeImage(imageId: string): Promise<void> {
    // Provide _id for imageId
    const image = await ImageModel.findOne({ _id: imageId });
    const deleteImage: Promise<DeleteResult> = ImageModel.deleteOne({ _id: imageId });
    const result: Promise<IDeleteFromCloudinary> = deleteImageInCloudinary(image?.imgId as string);
    await Promise.all([deleteImage, result]);
  }

  public async removeFromCloudById(id: string, resource_type: ResourceType = 'image'): Promise<void> {
    const fromCloud: IDeleteFromCloudinary = await deleteImageInCloudinary(id, resource_type);
    if (fromCloud?.result !== 'ok') throw new BadRequesetError(fromCloud.result);
    const fileType: 'imgId' | 'videoId' = resource_type === 'image' ? 'imgId' : 'videoId';
    if (fileType === 'imgId') await ImageModel.deleteOne({ imgId: id });
  }

  public async getImgByBackgroundId(bgImageId: string): Promise<IFileImageDocument> {
    const image: IFileImageDocument = (await ImageModel.findOne({ bgImageId })) as IFileImageDocument;
    return image;
  }

  public async getImages(userId: string): Promise<IFileImageDocument[]> {
    const images: IFileImageDocument[] = await ImageModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          __v: 0
        }
      }
    ]);
    return images;
  }
}

export const imageService: ImageService = new ImageService();
