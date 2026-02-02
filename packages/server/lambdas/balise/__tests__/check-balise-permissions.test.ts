import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ALBEvent } from 'aws-lambda';
import { handleRequest } from '../check-balise-permissions';
import * as userService from '../../../utils/userService';

vi.mock('../../../utils/userService');
vi.mock('../../../utils/logger', () => ({ log: { info: vi.fn(), error: vi.fn() } }));

describe('check-balise-permissions', () => {
  const createMockEvent = (): ALBEvent => ({
    requestContext: { elb: { targetGroupArn: 'arn:aws:elasticloadbalancing:test' } },
    httpMethod: 'GET',
    path: '/api/balise/permissions',
    queryStringParameters: undefined,
    headers: {},
    body: '',
    isBase64Encoded: false,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all permissions for balise admin user', async () => {
    const mockUser = { uid: 'admin-user', roles: ['Ratatieto_admin_Baliisisanomat'] };

    vi.mocked(userService.getUser).mockResolvedValue(mockUser);

    const event = createMockEvent();
    const result = await handleRequest(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body!);
    expect(body).toEqual({ canRead: true, canWrite: true, isAdmin: true, currentUserUid: 'admin-user' });
  });

  it('should return limited permissions for balise write user', async () => {
    const mockUser = { uid: 'write-user', roles: ['Ratatieto_kirjoitus_Baliisisanomat'] };

    vi.mocked(userService.getUser).mockResolvedValue(mockUser);

    const event = createMockEvent();
    const result = await handleRequest(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body!);
    expect(body).toEqual({ canRead: true, canWrite: true, isAdmin: false, currentUserUid: 'write-user' });
  });

  it('should return read-only permissions for balise read user', async () => {
    const mockUser = { uid: 'read-user', roles: ['Ratatieto_luku_Baliisisanomat'] };

    vi.mocked(userService.getUser).mockResolvedValue(mockUser);

    const event = createMockEvent();
    const result = await handleRequest(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body!);
    expect(body).toEqual({ canRead: true, canWrite: false, isAdmin: false, currentUserUid: 'read-user' });
  });

  it('should return no balise permissions for user without balise roles', async () => {
    const mockUser = { uid: 'regular-user', roles: ['Ratatieto_luku'] };

    vi.mocked(userService.getUser).mockResolvedValue(mockUser);

    const event = createMockEvent();
    const result = await handleRequest(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body!);
    expect(body).toEqual({ canRead: false, canWrite: false, isAdmin: false, currentUserUid: 'regular-user' });
  });

  it('should return no permissions for user with no roles', async () => {
    const mockUser = { uid: 'no-roles-user', roles: [] };

    vi.mocked(userService.getUser).mockResolvedValue(mockUser);

    const event = createMockEvent();
    const result = await handleRequest(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body!);
    expect(body).toEqual({ canRead: false, canWrite: false, isAdmin: false, currentUserUid: 'no-roles-user' });
  });
});
