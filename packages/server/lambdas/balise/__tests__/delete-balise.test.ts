import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ALBEvent } from 'aws-lambda';
import type { BaliseWithHistory } from '../../../utils/balise/baliseArchiveUtils';

vi.mock('../../../lambdas/database/client', () => ({
  DatabaseClient: { build: vi.fn().mockResolvedValue({}) },
}));
vi.mock('../../../utils/userService', () => ({ getUser: vi.fn() }));
vi.mock('../../../utils/logger', () => ({ log: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../../../utils/balise/baliseArchiveUtils', () => ({
  fetchBaliseWithHistory: vi.fn(),
  deleteSingleBalise: vi.fn(),
}));

import { handleRequest } from '../delete-balise';
import { getUser } from '../../../utils/userService';
import { fetchBaliseWithHistory, deleteSingleBalise } from '../../../utils/balise/baliseArchiveUtils';

const ADMIN = { uid: 'admin', roles: ['ratatieto_admin_baliisisanomat'] };
const LITE_ADMIN = { uid: 'lite', roles: ['ratatieto_liteadmin_baliisisanomat'] };
const WRITER = { uid: 'writer', roles: ['ratatieto_kirjoitus_baliisisanomat'] };
const READER = { uid: 'reader', roles: ['ratatieto_luku_baliisisanomat'] };

const createEvent = (baliseId = '12345'): ALBEvent => ({
  requestContext: { elb: { targetGroupArn: 'arn:aws:elasticloadbalancing:test' } },
  httpMethod: 'DELETE',
  path: `/api/balise/${baliseId}/delete`,
  queryStringParameters: undefined,
  headers: {},
  body: '',
  isBase64Encoded: false,
});

const createBalise = (locked: boolean): BaliseWithHistory =>
  ({
    secondaryId: 12345,
    version: 1,
    fileTypes: [],
    locked,
    lockedBy: locked ? 'someone' : null,
    history: [],
  }) as unknown as BaliseWithHistory;

describe('delete-balise', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(deleteSingleBalise).mockResolvedValue({ archivedSecondaryId: 'balise_12345_x', deletedFilesCount: 0 });
  });

  it.each([
    ['write user', WRITER],
    ['lite admin', LITE_ADMIN],
    ['admin', ADMIN],
  ])('should delete an unlocked balise for %s', async (_, user) => {
    vi.mocked(getUser).mockResolvedValue(user);
    vi.mocked(fetchBaliseWithHistory).mockResolvedValue(createBalise(false));

    const result = await handleRequest(createEvent());

    expect(result.statusCode).toBe(200);
    expect(deleteSingleBalise).toHaveBeenCalledOnce();
  });

  it('should delete a locked balise for admin', async () => {
    vi.mocked(getUser).mockResolvedValue(ADMIN);
    vi.mocked(fetchBaliseWithHistory).mockResolvedValue(createBalise(true));

    const result = await handleRequest(createEvent());

    expect(result.statusCode).toBe(200);
    expect(deleteSingleBalise).toHaveBeenCalledOnce();
  });

  it.each([
    ['write user', WRITER],
    ['lite admin', LITE_ADMIN],
  ])('should return 409 for a locked balise for %s', async (_, user) => {
    vi.mocked(getUser).mockResolvedValue(user);
    vi.mocked(fetchBaliseWithHistory).mockResolvedValue(createBalise(true));

    const result = await handleRequest(createEvent());

    expect(result.statusCode).toBe(409);
    expect(deleteSingleBalise).not.toHaveBeenCalled();
  });

  it('should return 401 for read user without fetching the balise', async () => {
    vi.mocked(getUser).mockResolvedValue(READER);

    const result = await handleRequest(createEvent());

    expect(result.statusCode).toBe(401);
    expect(fetchBaliseWithHistory).not.toHaveBeenCalled();
    expect(deleteSingleBalise).not.toHaveBeenCalled();
  });

  it('should return 404 when balise does not exist', async () => {
    vi.mocked(getUser).mockResolvedValue(WRITER);
    vi.mocked(fetchBaliseWithHistory).mockRejectedValue(new Error('BALISE_NOT_FOUND'));

    const result = await handleRequest(createEvent());

    expect(result.statusCode).toBe(404);
  });

  it('should return 400 for invalid balise id', async () => {
    vi.mocked(getUser).mockResolvedValue(WRITER);

    const result = await handleRequest(createEvent('abc'));

    expect(result.statusCode).toBe(400);
  });

  it('should return 401 for read user even with invalid balise id', async () => {
    vi.mocked(getUser).mockResolvedValue(READER);

    const result = await handleRequest(createEvent('abc'));

    expect(result.statusCode).toBe(401);
  });
});
