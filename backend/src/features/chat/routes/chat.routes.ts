import { Router } from 'express';
import { AddChatMessage } from '~chat/controllers/add-chat-message';
import { DeleteChat } from '~chat/controllers/delete-chat-message';
import { GetChatMessage } from '~chat/controllers/get-chat-messages';
import { UpdateMessages } from '~chat/controllers/update-chat-message';
import { AuthMiddleware } from '~global/helpers/auth-middleware';

class ChatRoutes {
  private router: Router;
  constructor() {
    this.router = Router();
  }
  public routes(): Router {
    this.router.use(AuthMiddleware.prototype.checkAuthentication);

    this.router.post('/message', AddChatMessage.prototype.add);
    this.router.post('/add-users', AddChatMessage.prototype.addChatUsers);

    this.router.delete('/remove-users', AddChatMessage.prototype.removeChatUsers);
    this.router.delete('/mark-as-deleted/:messageId/:senderId/:conversationId/:type', DeleteChat.prototype.markMessageAsDeleted);

    this.router.get('/', GetChatMessage.prototype.list);
    this.router.get('/:conversationId', GetChatMessage.prototype.messages);

    this.router.put('/reaction', UpdateMessages.prototype.updateMessageReaction);
    this.router.put('/read/:senderId/:conversationId', UpdateMessages.prototype.markMessagesAsRead);

    return this.router;
  }
}

export const chatRoutes: ChatRoutes = new ChatRoutes();
