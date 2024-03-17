import Joi, { ObjectSchema } from 'joi';

export const imageSchema: ObjectSchema = Joi.object({
  image: Joi.string().required().messages({
    'any.required': 'Image is required',
    'string.base': 'Image must be a string',
    'string.empty': 'Image is not allowed to be empty'
  })
});
