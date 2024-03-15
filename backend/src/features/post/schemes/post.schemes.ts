import Joi, { ObjectSchema } from 'joi';

const postScheme: ObjectSchema = Joi.object().keys({
  post: Joi.string().optional().allow(null, ''),
  bgColor: Joi.string().optional().allow(null, ''),
  privacy: Joi.string().optional().allow(null, ''),
  feelings: Joi.string().optional().allow(null, ''),
  gifUrl: Joi.string().optional().allow(null, ''),
  profilePicture: Joi.string().optional().allow(null, ''),
  imgVersion: Joi.string().optional().allow(null, ''),
  imgId: Joi.string().optional().allow(null, ''),
  image: Joi.string().optional().allow(null, ''),
  vidoVersion: Joi.string().optional().allow(null, ''),
  vidoId: Joi.string().optional().allow(null, ''),
  vidoge: Joi.string().optional().allow(null, '')
});

const postWithContentScheme: ObjectSchema = Joi.object()
  .keys({
    image: Joi.string().messages({
      'string.empty': 'Image property is not allowed to be empty'
    }),
    video: Joi.string().messages({
      'string.empty': 'Image property is not allowed to be empty'
    }),
    post: Joi.string().optional().allow(null, ''),
    bgColor: Joi.string().optional().allow(null, ''),
    privacy: Joi.string().optional().allow(null, ''),
    feelings: Joi.string().optional().allow(null, ''),
    gifUrl: Joi.string().optional().allow(null, ''),
    profilePicture: Joi.string().optional().allow(null, ''),
    imgVersion: Joi.string().optional().allow(null, ''),
    imgId: Joi.string().optional().allow(null, ''),
    videoVersion: Joi.string().optional().allow(null, ''),
    videoId: Joi.string().optional().allow(null, '')
  })
  .xor('image', 'video')
  .messages({
    'object.xor': 'Either image or video property must be provided, but not both'
  });

export { postScheme, postWithContentScheme };
