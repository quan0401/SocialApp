import cloudinary, { DeleteApiResponse } from 'cloudinary';

export const deleteImageInCloudinary = (publicId: string): Promise<DeleteApiResponse> => {
  return new Promise((resolve, reject) => {
    // Delete the image
    cloudinary.v2.uploader.destroy(publicId, (error, result) => {
      if (error) {
        resolve(error);
      } else {
        resolve(result);
      }
    });
  });
};
