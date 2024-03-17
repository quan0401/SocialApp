import Joi, { ObjectSchema } from 'joi';

const signinSchema: ObjectSchema = Joi.object()
  .keys({
    username: Joi.string().min(4).messages({
      'string.base': 'Username must be of type string',
      'string.min': 'Invalid username',
      'string.max': 'Invalid username',
      'string.empty': 'Username is a required field',
      'any.required': 'Username is required field'
    }),
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .min(4)
      .messages({
        'string.base': 'Email must be of type string',
        'string.min': 'Invalid email',
        'string.empty': 'Email is a required field',
        'any.required': 'Email is required field',
        'string.email': 'Invalid email format'
      }),
    password: Joi.string().required().min(4).max(252).messages({
      'string.base': 'Password must be of type string',
      'string.min': 'Invalid password',
      'string.max': 'Invalid password',
      'string.empty': 'Password is a required field',
      'any.required': 'Password is required field'
    })
  })
  .or('username', 'email')
  .messages({
    'object.or': 'Either email or username is required'
  });

export { signinSchema };
