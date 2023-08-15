import Joi, { ObjectSchema } from 'joi';

const addReactionScheme: ObjectSchema = Joi.object().keys({
  userTo: Joi.string().required().messages({
    'any.required': 'userTo is a required property'
  }),
  postId: Joi.string().required().messages({
    'any.required': 'postId is a required property'
  }),
  type: Joi.string().required().messages({
    'any.required': 'Reaction type is a required property'
  }),
  profilePicture: Joi.string().optional().allow(null, ''),
  previousReaction: Joi.string().optional().allow(null, ''),
  postReactions: Joi.object().optional().allow(null, '')
});

// const removeReactionScheme: ObjectSchema = Joi.object().keys({
//   postReactions: Joi.object().optional().allow(null, '')
// });

const removeReactionScheme: ObjectSchema = Joi.object().keys({
  postReactions: Joi.object()
    .keys({
      like: Joi.number().integer().required().min(0).messages({
        'number.base': 'like must be a number',
        'number.integer': 'like must be an integer',
        'number.min': 'like must be greater than or equal to 0',
        'any.required': 'like is required'
      }),
      love: Joi.number().integer().required().min(0).messages({
        'number.base': 'love must be a number',
        'number.integer': 'love must be an integer',
        'number.min': 'love must be greater than or equal to 0',
        'any.required': 'love is required'
      }),
      haha: Joi.number().integer().required().min(0).messages({
        'number.base': 'haha must be a number',
        'number.integer': 'haha must be an integer',
        'number.min': 'haha must be greater than or equal to 0',
        'any.required': 'haha is required'
      }),
      wow: Joi.number().integer().required().min(0).messages({
        'number.base': 'wow must be a number',
        'number.integer': 'wow must be an integer',
        'number.min': 'wow must be greater than or equal to 0',
        'any.required': 'wow is required'
      }),
      sad: Joi.number().integer().required().min(0).messages({
        'number.base': 'sad must be a number',
        'number.integer': 'sad must be an integer',
        'number.min': 'sad must be greater than or equal to 0',
        'any.required': 'sad is required'
      }),
      angry: Joi.number().integer().required().min(0).messages({
        'number.base': 'angry must be a number',
        'number.integer': 'angry must be an integer',
        'number.min': 'angry must be greater than or equal to 0',
        'any.required': 'angry is required'
      })
    })
    .required()
    .messages({
      'any.required': 'postReactions is required'
    })
});

export { addReactionScheme, removeReactionScheme };
