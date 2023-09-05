import Joi, { ObjectSchema } from 'joi';

const addChatSchema: ObjectSchema = Joi.object().keys({
  conversationId: Joi.string().optional().allow(null, '').messages({
    'string.base': 'Conversation ID must be a string',
    'string.empty': 'Conversation ID must not be empty'
  }),
  body: Joi.string().optional().allow(null, '').messages({
    'string.base': 'Body must be a string',
    'string.empty': 'Body must not be empty'
  }),
  receiverId: Joi.string().required().messages({
    'any.required': 'Receiver ID is required',
    'string.base': 'Receiver ID must be a string',
    'string.empty': 'Receiver ID must not be empty'
  }),
  receiverUsername: Joi.string().required().messages({
    'any.required': 'Receiver username is required',
    'string.base': 'Receiver username must be a string',
    'string.empty': 'Receiver username must not be empty'
  }),
  receiverAvatarColor: Joi.string().required().messages({
    'any.required': 'Receiver avatar color is required',
    'string.base': 'Receiver avatar color must be a string',
    'string.empty': 'Receiver avatar color must not be empty'
  }),
  receiverProfilePicture: Joi.string().required().messages({
    'any.required': 'Receiver profile picture is required',
    'string.base': 'Receiver profile picture must be a string',
    'string.empty': 'Receiver profile picture must not be empty'
  }),
  gifUrl: Joi.string().optional().allow(null, '').messages({
    'string.base': 'GIF URL must be a string',
    'string.empty': 'GIF URL must not be empty'
  }),
  selectedImage: Joi.string().optional().allow(null, '').messages({
    'string.base': 'Selected image must be a string',
    'string.empty': 'Selected image must not be empty'
  }),
  isRead: Joi.boolean().optional().messages({
    'boolean.base': 'isRead must be a boolean'
  })
});

const markChatSchema: ObjectSchema = Joi.object().keys({
  senderId: Joi.string().required().messages({
    'any.required': 'Sender ID is required',
    'string.base': 'Sender ID must be a string',
    'string.empty': 'Sender ID must not be empty'
  }),
  receiverId: Joi.string().required().messages({
    'any.required': 'Receiver ID is required',
    'string.base': 'Receiver ID must be a string',
    'string.empty': 'Receiver ID must not be empty'
  })
});

const removeChatUsers: ObjectSchema = Joi.object().keys({
  userOne: Joi.string().required().messages({
    'any.required': 'userOne is required',
    'string.base': 'userOne must be a string',
    'string.empty': 'userOne must not be empty'
  }),
  userTwo: Joi.string().required().messages({
    'any.required': 'userTwo is required',
    'string.base': 'userTwo must be a string',
    'string.empty': 'userTwo must not be empty'
  })
});

const updateMessageReaction: ObjectSchema = Joi.object().keys({
  messageId: Joi.string().required().messages({
    'any.required': 'messageId is required',
    'string.base': 'Message ID must be a string',
    'string.empty': 'Message ID must not be empty'
  }),
  senderName: Joi.string().required().messages({
    'any.required': 'senderName is required',
    'string.base': 'Sender Name must be a string',
    'string.empty': 'Sender Name must not be empty'
  }),
  reaction: Joi.string().required().messages({
    'any.required': 'reaction is required',
    'string.base': 'Reaction must be a string',
    'string.empty': 'Reaction must not be empty'
  }),
  type: Joi.string().required().messages({
    'any.required': 'type is required',
    'string.base': 'Type must be a string',
    'string.empty': 'Type must not be empty'
  }),
  conversationId: Joi.string().required().messages({
    'any.required': 'conversationId is required',
    'string.base': 'Conversation ID must be a string',
    'string.empty': 'Conversation ID must not be empty'
  })
});

export { addChatSchema, markChatSchema, removeChatUsers, updateMessageReaction };
