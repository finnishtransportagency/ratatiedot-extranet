import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ALBEvent } from 'aws-lambda';

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));

vi.mock('../../../lambdas/database/client', () => ({
  DatabaseClient: { build: vi.fn().mockResolvedValue({ balise: { findMany } }) },
}));
vi.mock('../../../utils/userService', () => ({ getUser: vi.fn() }));
vi.mock('../../../utils/logger', () => ({ log: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../../../utils/balise/baliseArchiveUtils', () => ({ deleteSingleBalise: vi.fn() }));

import { handleRequest } from '../bulk-delete-balises';
import { getUser } from '../../../utils/userService';
import { deleteSingleBalise } from '../../../utils/balise/baliseArchiveUtils';

const ADMIN = { uid: 'admin', roles: ['ratatieto_admin_baliisisanomat'] };
const WRITER = { uid: 'writer', roles: ['ratatieto_kirjoitus_baliisisanomat'] };
const READER = { uid: 'reader', roles: ['ratatieto_luku_baliisisanomat'] };

const createEvent = (baliseIds: number[]): ALBEvent => ({
  requestContext: { elb: { targetGroupArn: 'arn:aws:elasticloadbalancing:test' } },
  httpMethod: 'DELETE',
  path: '/api/balise/bulk-delete',
  queryStringParameters: undefined,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ baliseIds }),
  isBase64Encoded: false,
});

const balise = (secondaryId: number, locked: boolean) => ({ secondaryId, locked, history: [] });

describe('bulk-delete-balises', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(deleteSingleBalise).mockResolvedValue({ archivedSecondaryId: 'x', deletedFilesCount: 0 });
  });

  it('should delete unlocked balises and skip locked and missing ones for write user', async () => {
    vi.mocked(getUser).mockResolvedValue(WRITER);
    findMany.mockResolvedValue([balise(1, false), balise(2, true)]);

    const result = await handleRequest(createEvent([1, 2, 3]));
    const body = JSON.parse(result.body!);

    expect(result.statusCode).toBe(200);
    expect(deleteSingleBalise).toHaveBeenCalledOnce();
    expect(body).toMatchObject({ totalRequested: 3, successCount: 1, skippedCount: 2 });
  });

  it('should skip locked balises for admin too', async () => {
    vi.mocked(getUser).mockResolvedValue(ADMIN);
    findMany.mockResolvedValue([balise(1, true)]);

    const result = await handleRequest(createEvent([1]));
    const body = JSON.parse(result.body!);

    expect(result.statusCode).toBe(200);
    expect(deleteSingleBalise).not.toHaveBeenCalled();
    expect(body).toMatchObject({ successCount: 0, skippedCount: 1 });
  });

  it('should return 401 for read user', async () => {
    vi.mocked(getUser).mockResolvedValue(READER);

    const result = await handleRequest(createEvent([1]));

    expect(result.statusCode).toBe(401);
    expect(findMany).not.toHaveBeenCalled();
  });

  it('should return 400 for empty id list', async () => {
    vi.mocked(getUser).mockResolvedValue(WRITER);

    const result = await handleRequest(createEvent([]));

    expect(result.statusCode).toBe(400);
  });
});
