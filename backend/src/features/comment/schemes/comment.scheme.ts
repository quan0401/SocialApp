import Joi, { ObjectSchema } from 'joi';

const addCommentSchema: ObjectSchema = Joi.object().keys({
  userTo: Joi.string().required().messages({
    'any.required': 'userTo is a required property'
  }),
  postId: Joi.string().required().messages({
    'any.required': 'postId is a required property'
  }),
  comment: Joi.string().required().messages({
    'any.required': 'comment is a required property'
  }),
  profilePicture: Joi.string().optional().allow(null, ''),
  avatarColor: Joi.string().optional().allow(null, ''),
  commentsCount: Joi.number().optional().allow(null, '')
});

const getCommentSchema: ObjectSchema = Joi.object({
  postId: Joi.string().required().messages({
    'string.base': 'postId must be a string',
    'any.required': 'postId is a required property',
    'string.empty': 'postId cannot be an empty string'
  }),
  commentId: Joi.string().optional().allow(null).messages({
    'string.base': 'commentId must be a string',
    'string.empty': 'commentId cannot be an empty string'
  })
}).unknown(false);

export { addCommentSchema, getCommentSchema };
