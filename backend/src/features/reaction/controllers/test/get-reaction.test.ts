import { GetReaction } from '~reaction/controllers/get-reaction';
import { Request, Response } from 'express';

import { reactionService } from '~services/db/reaction.service';
import { ReactionCache } from '~services/redis/reaction.cache';
import { reactionData, reactionMockRequest, reactionMockResponse } from '~mocks/reactions.mock';
import { IReactionDocument } from '~reaction/interfaces/reaction.interface';

jest.useFakeTimers();
jest.mock('~services/db/reaction.service');
jest.mock('~services/redis/reaction.cache');

describe('Get reaction: reactions', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('Exist data from cache and send correct json response', async () => {
    const req: Request = reactionMockRequest({ jwt: '1234' }, {}, null, { postId: 'postId1234', userId: 'userId1234' }) as Request;
    const res: Response = reactionMockResponse();

    const reactions: [IReactionDocument[], number] = [[reactionData], 1];

    jest.spyOn(ReactionCache.prototype, 'getReactionsFromCache').mockResolvedValue(reactions);

    await GetReaction.prototype.reactions(req, res);

    expect(ReactionCache.prototype.getReactionsFromCache).toHaveBeenCalledWith('postId1234');
    expect(reactionService.getPostReactions).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post reactions', reactions: reactions[0], count: reactions[1] });
  });

  it('No data from cache and send correct json response', async () => {
    const req: Request = reactionMockRequest({ jwt: '1234' }, {}, null, { postId: 'postId1234', userId: 'userId1234' }) as Request;
    const res: Response = reactionMockResponse();

    const reactions: [IReactionDocument[], number] = [[reactionData], 1];

    jest.spyOn(ReactionCache.prototype, 'getReactionsFromCache').mockResolvedValue([[], 0]);
    jest.spyOn(reactionService, 'getPostReactions').mockResolvedValue(reactions);

    await GetReaction.prototype.reactions(req, res);

    expect(ReactionCache.prototype.getReactionsFromCache).toHaveBeenCalledWith('postId1234');
    expect(reactionService.getPostReactions).toHaveBeenLastCalledWith({ postId: 'postId1234' }, { createdAt: -1 });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post reactions', reactions: reactions[0], count: reactions[1] });
  });
});

describe('Get reaction: getPostReactionsByUserId', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('Exist data from cache and send correct json response', async () => {
    const req: Request = reactionMockRequest({ jwt: '1234' }, {}, null, { postId: 'postId1234', userId: 'userId1234' }) as Request;
    const res: Response = reactionMockResponse();

    const reactions: [IReactionDocument, number] = [reactionData, 1];

    jest.spyOn(ReactionCache.prototype, 'getReactionByUserId').mockResolvedValue(reactions);

    await GetReaction.prototype.getPostReactionsByUserId(req, res);

    expect(ReactionCache.prototype.getReactionByUserId).toHaveBeenCalledWith('postId1234', 'userId1234');
    expect(reactionService.getReactionByUserId).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'User single reaction', reaction: reactions[0], count: reactions[1] });
  });

  it('No data from cache and send correct json response', async () => {
    const req: Request = reactionMockRequest({ jwt: '1234' }, {}, null, { postId: 'postId1234', userId: 'userId1234' }) as Request;
    const res: Response = reactionMockResponse();

    const reactions: [IReactionDocument, number] = [reactionData, 1];

    jest.spyOn(ReactionCache.prototype, 'getReactionByUserId').mockResolvedValue([]);
    jest.spyOn(reactionService, 'getReactionByUserId').mockResolvedValue(reactions as [IReactionDocument, 1]);

    await GetReaction.prototype.getPostReactionsByUserId(req, res);

    expect(ReactionCache.prototype.getReactionByUserId).toHaveBeenCalledWith('postId1234', 'userId1234');
    expect(reactionService.getReactionByUserId).toHaveBeenCalledWith('postId1234', 'userId1234');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'User single reaction', reaction: reactions[0], count: reactions[1] });
  });
});

describe('Get reaction: getAllReactionsOfUser', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('Should send correct json response', async () => {
    const req: Request = reactionMockRequest({ jwt: '1234' }, {}, null, { postId: 'postId1234', userId: 'userId1234' }) as Request;
    const res: Response = reactionMockResponse();
    const reactions: IReactionDocument[] = [reactionData];

    jest.spyOn(reactionService, 'getAllReactionsByUserId').mockResolvedValue(reactions);

    await GetReaction.prototype.getAllReactionsOfUser(req, res);

    expect(reactionService.getAllReactionsByUserId).toHaveBeenCalledWith('userId1234');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'All reactions by user', reactions });
  });
});
