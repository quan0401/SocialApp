import { Request, Response } from 'express';
import { CustomError } from '~global/helpers/error-handler';
import { authUserPayload } from '~mocks/auth.mock';
import { postMockData } from '~mocks/post.mock';
import { reactionMockRequest, reactionMockResponse } from '~mocks/reactions.mock';
import { RemoveReaction } from '~reaction/controllers/remove-reaction';

import { BaseQueue } from '~services/queues/base.queue';
import { reactionQueue } from '~services/queues/reaction.queue';
import { ReactionCache } from '~services/redis/reaction.cache';
import { clone } from 'lodash';

jest.mock('~services/queues/base.queue');
jest.mock('~services/queues/reaction.queue');
jest.mock('~services/redis/reaction.cache');

describe('Remove reaction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('Should throw error if there is no postReactions', () => {
    const req: Request = reactionMockRequest({ jwt: '1234' }, {}, authUserPayload) as Request;
    const res: Response = reactionMockResponse();

    RemoveReaction.prototype.remove(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('postReactions is required');
    });
  });

  it('Should throw error if reaction number is negative', () => {
    const mockReactions = clone(postMockData.reactions);
    mockReactions!.angry = -1;
    const req: Request = reactionMockRequest({ jwt: '1234' }, { postReactions: mockReactions }, authUserPayload) as Request;
    const res: Response = reactionMockResponse();

    RemoveReaction.prototype.remove(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('angry must be greater than or equal to 0');
    });
  });

  it('Should send correct json', async () => {
    const req: Request = reactionMockRequest({ jwt: '1234' }, { postReactions: postMockData.reactions }, authUserPayload, {
      postId: 'postId1234',
      previousReaction: 'like'
    }) as Request;
    const res: Response = reactionMockResponse();

    jest.spyOn(ReactionCache.prototype, 'removeReaction');
    jest.spyOn(reactionQueue, 'addReactionJob');

    await RemoveReaction.prototype.remove(req, res);

    expect(reactionQueue.addReactionJob).toHaveBeenCalledWith('removeReactionFromDB', {
      postId: 'postId1234',
      previousReaction: 'like',
      userFrom: authUserPayload.userId
    });

    expect(ReactionCache.prototype.removeReaction).toHaveBeenCalledWith(
      'postId1234',
      {
        username: authUserPayload.username,
        userId: authUserPayload.userId
      },
      postMockData.reactions
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Remove removed from post' });
  });
});
