import cloudinary, { DeleteApiResponse, ResourceType } from 'cloudinary';
export interface IDeleteFromCloudinary {
  result: 'not found' | 'ok';
}

export const deleteImageInCloudinary = (publicId: string, resource_type: ResourceType = 'image'): Promise<IDeleteFromCloudinary> => {
  return new Promise((resolve, reject) => {
    // Delete the image
    // cloudinary.v2.uploader.destroy(publicId, , (error, result) => {
    //   if (error) resolve(error);
    //   else resolve(result);
    // });
    cloudinary.v2.uploader.destroy(
      publicId,
      {
        resource_type
      },
      (error, result) => {
        if (error) resolve(error);
        else resolve(result);
      }
    );
  });
};
