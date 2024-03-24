import { Request, Response } from 'express';

import { ReactionCache } from '~services/redis/reaction.cache';
import { reactionQueue } from '~services/queues/reaction.queue';
import { BaseQueue } from '~services/queues/base.queue';
import { reactionMockRequest, reactionMockResponse } from '~mocks/reactions.mock';
import { postMockData } from '~mocks/post.mock';
import { authUserPayload } from '~mocks/auth.mock';
import { AddReaction } from '~reaction/controllers/add-reaction';
import { IReactionDocument, IReactionJob } from '~reaction/interfaces/reaction.interface';

jest.useFakeTimers();
jest.mock('~services/redis/reaction.cache');
jest.mock('~services/queues/reaction.queue');
jest.mock('~services/queues/base.queue');

describe('Add reaction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('Should send correct json response', async () => {
    const req: Request = reactionMockRequest(
      { jwt: '1234' },
      {
        userTo: 'userTo1234',
        type: 'like',
        postId: 'postId1234',
        profilePicture: 'profilepicture',
        postReactions: postMockData.reactions,
        previousReaction: ''
      },
      authUserPayload
    ) as Request;

    const res: Response = reactionMockResponse();

    jest.spyOn(reactionQueue, 'addReactionJob');

    const spy = jest.spyOn(ReactionCache.prototype, 'savePostReactionToCache');

    await AddReaction.prototype.add(req, res);

    const reactionObject: IReactionDocument = {
      _id: spy.mock.calls[0][1]._id,
      username: req.currentUser!.username,
      userId: req.currentUser!.userId,
      avataColor: req.currentUser!.avatarColor,
      type: req.body.type,
      postId: req.body.postId,
      profilePicture: req.body.profilePicture
    } as IReactionDocument;

    const reactionData: IReactionJob = {
      postId: spy.mock.calls[0][0],
      username: spy.mock.calls[0][1].username,
      previousReaction: spy.mock.calls[0][4] as string,
      userFrom: req.currentUser!.userId,
      type: spy.mock.calls[0][3],
      reactionObject
    };

    expect(ReactionCache.prototype.savePostReactionToCache).toHaveBeenCalledWith(
      req.body.postId,
      reactionObject,
      postMockData.reactions,
      req.body.type,
      req.body.previousReaction
    );

    // expect(reactionQueue.addReactionJob).toHaveBeenCalledWith('addReactionToDB', reactionData);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Reaction added successfully' });
  });
});
