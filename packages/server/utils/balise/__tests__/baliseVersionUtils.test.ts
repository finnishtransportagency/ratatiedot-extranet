import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseVersionParameter,
  validateVersionParameterAccess,
  validateVersionStatusAccess,
  getVersionFileTypes,
  resolveBalisesForUser,
  filterHistoryForUser,
} from '../baliseVersionUtils';
import { PrismaClient, VersionStatus, Balise, BaliseVersion } from '../../../generated/prisma/client';
import { RataExtraUser } from '../../userService';

// Mock Prisma Client
const mockFindFirst = vi.fn();
const mockFindMany = vi.fn();
const mockDatabase = {
  baliseVersion: {
    findFirst: mockFindFirst,
    findMany: mockFindMany,
  },
} as unknown as PrismaClient;

// Test data factories
const createMockUser = (uid: string, roles: string[] = []): RataExtraUser => ({
  uid,
  roles,
  isMockUser: false,
});

const createMockBalise = (overrides: Partial<Balise> = {}): Balise => ({
  id: 'balise-id-1',
  secondaryId: 12345,
  version: 5,
  versionStatus: VersionStatus.OFFICIAL,
  locked: false,
  lockedBy: null,
  lockedAtVersion: null,
  lockedTime: null,
  lockReason: null,
  fileTypes: ['file1.xml', 'file2.pdf'],
  description: 'Test balise',
  createdTime: new Date('2024-01-01'),
  createdBy: 'user1',
  deletedAt: null,
  deletedBy: null,
  isTemporary: false,
  ...overrides,
});

// Balise locked at an OFFICIAL baseline; each edit since the lock is an UNCONFIRMED version above it
const createLockedBalise = (lockedAtVersion: number, overrides: Partial<Balise> = {}): Balise =>
  createMockBalise({
    version: lockedAtVersion + 1,
    versionStatus: VersionStatus.UNCONFIRMED,
    locked: true,
    lockedBy: 'locker',
    lockedAtVersion,
    ...overrides,
  });

const createMockVersion = (
  version: number,
  versionStatus: VersionStatus = VersionStatus.OFFICIAL,
  overrides: Partial<BaliseVersion> = {},
): BaliseVersion => ({
  id: `version-${version}`,
  baliseId: 'balise-id-1',
  secondaryId: 12345,
  version,
  versionStatus,
  description: `Version ${version}`,
  fileTypes: ['file.xml'],
  createdBy: 'user1',
  createdTime: new Date('2024-01-01'),
  locked: false,
  lockedBy: null,
  lockedTime: null,
  versionCreatedTime: new Date('2024-01-01'),
  ...overrides,
});

// History entries 1..currentVersion-1: OFFICIAL up to lockedAtVersion, UNCONFIRMED after it
const createHistory = (lockedAtVersion: number, currentVersion: number): BaliseVersion[] =>
  Array.from({ length: currentVersion - 1 }, (_, i) =>
    createMockVersion(i + 1, i + 1 <= lockedAtVersion ? VersionStatus.OFFICIAL : VersionStatus.UNCONFIRMED),
  );

describe('baliseVersionUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseVersionParameter', () => {
    it('should parse valid integer string', () => {
      const result = parseVersionParameter({ version: '42' });
      expect(result).toBe(42);
    });

    it('should parse zero', () => {
      const result = parseVersionParameter({ version: '0' });
      expect(result).toBe(0);
    });

    it('should return undefined for invalid string', () => {
      const result = parseVersionParameter({ version: 'abc' });
      expect(result).toBeUndefined();
    });

    it('should parse decimal numbers as integers (parseInt behavior)', () => {
      const result = parseVersionParameter({ version: '12.5' });
      expect(result).toBe(12);
    });

    it('should return undefined when version parameter is missing', () => {
      const result = parseVersionParameter(undefined);
      expect(result).toBeUndefined();
    });

    it('should return undefined when query params are empty object', () => {
      const result = parseVersionParameter({});
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const result = parseVersionParameter({ version: '' });
      expect(result).toBeUndefined();
    });

    it('should parse negative numbers', () => {
      const result = parseVersionParameter({ version: '-5' });
      expect(result).toBe(-5);
    });

    it('should parse large numbers', () => {
      const result = parseVersionParameter({ version: '999999' });
      expect(result).toBe(999999);
    });
  });

  describe('validateVersionParameterAccess', () => {
    const user = createMockUser('user1');
    const adminUser = createMockUser('admin1', ['admin']);

    // Locked at 3 with drafts 4 and 5, current is 5
    const lockedBalise = createLockedBalise(3, { version: 5, lockedBy: 'user1' });

    it('should allow all users when version is undefined', () => {
      expect(() => validateVersionParameterAccess(user, undefined, lockedBalise, false)).not.toThrow();
    });

    it('should allow users with viewHistory to specify version', () => {
      const balise = createLockedBalise(3, { version: 5 });
      expect(() => validateVersionParameterAccess(adminUser, 1, balise, true)).not.toThrow();
    });

    it('should throw 403 for user without viewHistory who specifies a version', () => {
      const balise = createLockedBalise(3, { version: 5 });

      try {
        validateVersionParameterAccess(user, 3, balise, false);
        expect.unreachable();
      } catch (error: unknown) {
        expect((error as Error).message).toContain('Vain käyttäjät joilla on oikeus versiohistoriaan');
        expect((error as { statusCode: number }).statusCode).toBe(403);
      }
    });

    it('should allow lock owner without viewHistory to request the baseline and drafts', () => {
      for (const version of [3, 4, 5]) {
        expect(() => validateVersionParameterAccess(user, version, lockedBalise, false)).not.toThrow();
      }
    });

    it('should throw 403 for lock owner without viewHistory requesting a version below the baseline', () => {
      try {
        validateVersionParameterAccess(user, 2, lockedBalise, false);
        expect.unreachable();
      } catch (error: unknown) {
        expect((error as { statusCode: number }).statusCode).toBe(403);
      }
    });
  });

  describe('validateVersionStatusAccess', () => {
    const user = createMockUser('user1');

    it('should allow OFFICIAL versions for any user', () => {
      const balise = createMockBalise();
      expect(() => validateVersionStatusAccess(user, balise, 3, VersionStatus.OFFICIAL, false)).not.toThrow();
    });

    it('should allow the OFFICIAL baseline of a locked balise for non-lock-owners', () => {
      const balise = createLockedBalise(3);
      expect(() => validateVersionStatusAccess(user, balise, 3, VersionStatus.OFFICIAL, false)).not.toThrow();
    });

    it('should allow UNCONFIRMED versions with viewUnconfirmed', () => {
      const balise = createLockedBalise(3);
      expect(() => validateVersionStatusAccess(user, balise, 4, VersionStatus.UNCONFIRMED, true)).not.toThrow();
    });

    it('should throw 403 for UNCONFIRMED version when user is not lock owner', () => {
      const balise = createLockedBalise(3);

      try {
        validateVersionStatusAccess(user, balise, 4, VersionStatus.UNCONFIRMED, false);
        expect.unreachable();
      } catch (error: unknown) {
        expect((error as { statusCode: number }).statusCode).toBe(403);
      }
    });

    it('should allow lock owner to access every UNCONFIRMED version of their lock', () => {
      const balise = createLockedBalise(3, { lockedBy: 'user1', version: 5 });
      expect(() => validateVersionStatusAccess(user, balise, 4, VersionStatus.UNCONFIRMED, false)).not.toThrow();
      expect(() => validateVersionStatusAccess(user, balise, 5, VersionStatus.UNCONFIRMED, false)).not.toThrow();
    });
  });

  describe('getVersionFileTypes', () => {
    const balise = createMockBalise({
      secondaryId: 12345,
      version: 5,
      fileTypes: ['current1.xml', 'current2.pdf'],
      versionStatus: VersionStatus.OFFICIAL,
    });

    beforeEach(() => {
      mockFindFirst.mockReset();
    });

    it('should return current balise data when version matches current version', async () => {
      const result = await getVersionFileTypes(mockDatabase, 12345, 5, balise);

      expect(result).toEqual({
        fileTypes: ['current1.xml', 'current2.pdf'],
        version: 5,
        versionStatus: VersionStatus.OFFICIAL,
      });
      expect(mockFindFirst).not.toHaveBeenCalled();
    });

    it('should query BaliseVersion table for historical version', async () => {
      mockFindFirst.mockResolvedValue({
        fileTypes: ['historical1.xml', 'historical2.pdf'],
        version: 3,
        versionStatus: VersionStatus.OFFICIAL,
      });

      const result = await getVersionFileTypes(mockDatabase, 12345, 3, balise);

      expect(result).toEqual({
        fileTypes: ['historical1.xml', 'historical2.pdf'],
        version: 3,
        versionStatus: VersionStatus.OFFICIAL,
      });
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          secondaryId: 12345,
          version: 3,
        },
      });
    });

    it('should throw 404 when version is not found', async () => {
      mockFindFirst.mockResolvedValue(null);

      await expect(getVersionFileTypes(mockDatabase, 12345, 99, balise)).rejects.toThrow();

      try {
        await getVersionFileTypes(mockDatabase, 12345, 99, balise);
      } catch (error: unknown) {
        expect((error as Error).message).toContain('Versiota 99 ei löydy');
        expect((error as { statusCode: number }).statusCode).toBe(404);
      }
    });

    it('should return UNCONFIRMED status for historical UNCONFIRMED version', async () => {
      const lockedBalise = createLockedBalise(3, { version: 5 });
      mockFindFirst.mockResolvedValue(createMockVersion(4, VersionStatus.UNCONFIRMED, { fileTypes: ['draft.xml'] }));

      const result = await getVersionFileTypes(mockDatabase, 12345, 4, lockedBalise);

      expect(result.versionStatus).toBe(VersionStatus.UNCONFIRMED);
    });

    it('should return UNCONFIRMED status when requesting the current UNCONFIRMED version', async () => {
      const lockedBalise = createLockedBalise(3);

      const result = await getVersionFileTypes(mockDatabase, 12345, 4, lockedBalise);

      expect(result.versionStatus).toBe(VersionStatus.UNCONFIRMED);
      expect(mockFindFirst).not.toHaveBeenCalled();
    });

    it('should propagate database errors', async () => {
      mockFindFirst.mockRejectedValue(new Error('Database connection failed'));

      await expect(getVersionFileTypes(mockDatabase, 12345, 3, balise)).rejects.toThrow('Database connection failed');
    });
  });

  describe('resolveBalisesForUser', () => {
    beforeEach(() => {
      mockFindMany.mockReset();
    });

    it('should return admin users all balises as-is', async () => {
      const balises = [
        createLockedBalise(3, { secondaryId: 1 }),
        createMockBalise({ secondaryId: 2, versionStatus: VersionStatus.OFFICIAL }),
      ];

      const result = await resolveBalisesForUser(mockDatabase, balises, 'admin1', true);

      expect(result).toEqual(balises);
      expect(mockFindMany).not.toHaveBeenCalled();
    });

    it('should return OFFICIAL balises as-is for all users', async () => {
      const balises = [
        createMockBalise({ secondaryId: 1, versionStatus: VersionStatus.OFFICIAL }),
        createMockBalise({ secondaryId: 2, versionStatus: VersionStatus.OFFICIAL }),
      ];

      const result = await resolveBalisesForUser(mockDatabase, balises, 'user1', false);

      expect(result).toEqual(balises);
      expect(mockFindMany).not.toHaveBeenCalled();
    });

    it('should resolve UNCONFIRMED balise to latest OFFICIAL for regular users', async () => {
      const unconfirmedBalise = createLockedBalise(4, {
        version: 6,
        fileTypes: ['unconfirmed.xml'],
        description: 'Unconfirmed version',
      });

      mockFindMany.mockResolvedValue([
        createMockVersion(4, VersionStatus.OFFICIAL, {
          fileTypes: ['official.xml'],
          description: 'Official version',
          createdBy: 'user2',
        }),
      ]);

      const result = await resolveBalisesForUser(mockDatabase, [unconfirmedBalise], 'user1', false);

      expect(result).toHaveLength(1);
      expect(result[0].version).toBe(4);
      expect(result[0].versionStatus).toBe(VersionStatus.OFFICIAL);
      expect(result[0].fileTypes).toEqual(['official.xml']);
      expect(result[0].description).toBe('Official version');
    });

    it('should keep UNCONFIRMED balise for lock owner', async () => {
      const unconfirmedBalise = createLockedBalise(4, { lockedBy: 'user1' });

      const result = await resolveBalisesForUser(mockDatabase, [unconfirmedBalise], 'user1', false);

      expect(result).toEqual([unconfirmedBalise]);
      expect(mockFindMany).not.toHaveBeenCalled();
    });

    it('should handle mixed OFFICIAL and UNCONFIRMED balises', async () => {
      const officialBalise = createMockBalise({
        secondaryId: 1,
        versionStatus: VersionStatus.OFFICIAL,
      });
      const unconfirmedBalise = createLockedBalise(3, { secondaryId: 2 });

      mockFindMany.mockResolvedValue([createMockVersion(3, VersionStatus.OFFICIAL, { secondaryId: 2 })]);

      const result = await resolveBalisesForUser(mockDatabase, [officialBalise, unconfirmedBalise], 'user1', false);

      expect(result).toHaveLength(2);
      expect(result[0].secondaryId).toBe(1);
      expect(result[0].versionStatus).toBe(VersionStatus.OFFICIAL);
      expect(result[1].secondaryId).toBe(2);
      expect(result[1].version).toBe(3);
    });

    it('should make single optimized database query for multiple UNCONFIRMED balises', async () => {
      const balises = [
        createLockedBalise(10, { secondaryId: 1 }),
        createLockedBalise(20, { secondaryId: 2 }),
        createLockedBalise(30, { secondaryId: 3 }),
      ];

      mockFindMany.mockResolvedValue([
        createMockVersion(10, VersionStatus.OFFICIAL, { secondaryId: 1 }),
        createMockVersion(20, VersionStatus.OFFICIAL, { secondaryId: 2 }),
        createMockVersion(30, VersionStatus.OFFICIAL, { secondaryId: 3 }),
      ]);

      await resolveBalisesForUser(mockDatabase, balises, 'user1', false);

      expect(mockFindMany).toHaveBeenCalledTimes(1);
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          secondaryId: { in: [1, 2, 3] },
          versionStatus: VersionStatus.OFFICIAL,
        },
        orderBy: {
          version: 'desc',
        },
      });
    });

    it('should sort results by secondaryId', async () => {
      const balises = [
        createLockedBalise(1, { secondaryId: 300 }),
        createLockedBalise(1, { secondaryId: 100 }),
        createLockedBalise(1, { secondaryId: 200 }),
      ];

      mockFindMany.mockResolvedValue([
        createMockVersion(1, VersionStatus.OFFICIAL, { secondaryId: 100 }),
        createMockVersion(1, VersionStatus.OFFICIAL, { secondaryId: 200 }),
        createMockVersion(1, VersionStatus.OFFICIAL, { secondaryId: 300 }),
      ]);

      const result = await resolveBalisesForUser(mockDatabase, balises, 'user1', false);

      expect(result[0].secondaryId).toBe(100);
      expect(result[1].secondaryId).toBe(200);
      expect(result[2].secondaryId).toBe(300);
    });

    it('should return empty array for empty input', async () => {
      const result = await resolveBalisesForUser(mockDatabase, [], 'user1', false);

      expect(result).toEqual([]);
      expect(mockFindMany).not.toHaveBeenCalled();
    });

    it('should throw 404 when no OFFICIAL version found for UNCONFIRMED balise', async () => {
      const balise = createLockedBalise(1, { secondaryId: 999 });

      mockFindMany.mockResolvedValue([]);

      await expect(resolveBalisesForUser(mockDatabase, [balise], 'user1', false)).rejects.toThrow();

      try {
        await resolveBalisesForUser(mockDatabase, [balise], 'user1', false);
      } catch (error: unknown) {
        expect((error as Error).message).toContain('Baliisille 999 ei löydy vahvistettua');
        expect((error as { statusCode: number }).statusCode).toBe(404);
      }
    });

    it('should resolve to the highest OFFICIAL version in history', async () => {
      const balise = createLockedBalise(3);

      // Database returns OFFICIAL history sorted by version descending
      mockFindMany.mockResolvedValue([
        createMockVersion(3, VersionStatus.OFFICIAL, { fileTypes: ['v3.xml'] }),
        createMockVersion(2, VersionStatus.OFFICIAL, { fileTypes: ['v2.xml'] }),
        createMockVersion(1, VersionStatus.OFFICIAL, { fileTypes: ['v1.xml'] }),
      ]);

      const result = await resolveBalisesForUser(mockDatabase, [balise], 'user1', false);

      expect(result[0].version).toBe(3);
      expect(result[0].fileTypes).toEqual(['v3.xml']);
    });

    it('should treat undefined userId as non-lock-owner', async () => {
      const unconfirmedBalise = createLockedBalise(4, { lockedBy: 'someUser' });

      mockFindMany.mockResolvedValue([createMockVersion(4, VersionStatus.OFFICIAL)]);

      const result = await resolveBalisesForUser(mockDatabase, [unconfirmedBalise], undefined, false);

      expect(result[0].version).toBe(4);
    });

    it('should merge resolved data into original balise structure', async () => {
      const balise = createLockedBalise(3);

      mockFindMany.mockResolvedValue([
        createMockVersion(3, VersionStatus.OFFICIAL, {
          fileTypes: ['resolved.xml'],
          description: 'Resolved description',
        }),
      ]);

      const result = await resolveBalisesForUser(mockDatabase, [balise], 'user1', false);

      expect(result[0].version).toBe(3);
      expect(result[0].fileTypes).toEqual(['resolved.xml']);
      expect(result[0].description).toBe('Resolved description');
    });

    it('should correctly separate lock owner balises from others', async () => {
      const ownLockedBalise = createLockedBalise(4, { secondaryId: 1, lockedBy: 'user1' });
      const othersLockedBalise = createLockedBalise(5, { secondaryId: 2, lockedBy: 'user2' });

      mockFindMany.mockResolvedValue([createMockVersion(5, VersionStatus.OFFICIAL, { secondaryId: 2 })]);

      const result = await resolveBalisesForUser(mockDatabase, [ownLockedBalise, othersLockedBalise], 'user1', false);

      expect(result).toHaveLength(2);
      // Own locked balise should remain UNCONFIRMED
      expect(result.find((b) => b.secondaryId === 1)?.versionStatus).toBe(VersionStatus.UNCONFIRMED);
      // Other's locked balise should be resolved to OFFICIAL
      expect(result.find((b) => b.secondaryId === 2)?.version).toBe(5);
    });
  });

  describe('filterHistoryForUser', () => {
    // Locked at 3 with two drafts: history is 1,2,3 (OFFICIAL) and 4 (UNCONFIRMED), current is 5
    const lockedBalise = createLockedBalise(3, { version: 5 });
    const lockedHistory = createHistory(3, 5);
    // Unlocked: everything has been promoted to OFFICIAL
    const unlockedBalise = createMockBalise({ version: 5 });
    const unlockedHistory = createHistory(4, 5);

    const access = (overrides: Partial<Parameters<typeof filterHistoryForUser>[2]> = {}) => ({
      isLockOwner: false,
      canViewHistory: false,
      canViewUnconfirmed: false,
      ...overrides,
    });
    const versions = (history: BaliseVersion[]) => history.map((v) => v.version);

    it('should return full history for users with viewHistory and viewUnconfirmed', () => {
      const result = filterHistoryForUser(
        lockedHistory,
        lockedBalise,
        access({ canViewHistory: true, canViewUnconfirmed: true }),
      );
      expect(versions(result)).toEqual([1, 2, 3, 4]);
    });

    it('should not return past versions for viewUnconfirmed without viewHistory', () => {
      const result = filterHistoryForUser(lockedHistory, lockedBalise, access({ canViewUnconfirmed: true }));
      expect(versions(result)).toEqual([3, 4]);
    });

    it('should return only the baseline and drafts for a lock owner without viewHistory', () => {
      const result = filterHistoryForUser(lockedHistory, lockedBalise, access({ isLockOwner: true }));
      expect(versions(result)).toEqual([3, 4]);
    });

    it('should return full history for a lock owner with viewHistory', () => {
      const result = filterHistoryForUser(
        lockedHistory,
        lockedBalise,
        access({ isLockOwner: true, canViewHistory: true }),
      );
      expect(versions(result)).toEqual([1, 2, 3, 4]);
    });

    it('should stop below the OFFICIAL baseline for viewHistory users who do not own the lock', () => {
      const result = filterHistoryForUser(lockedHistory, lockedBalise, access({ canViewHistory: true }));
      expect(versions(result)).toEqual([1, 2]);
    });

    it('should stop below the baseline when the balise is locked without edits', () => {
      const balise = createMockBalise({ version: 3, locked: true, lockedBy: 'locker', lockedAtVersion: 3 });
      const result = filterHistoryForUser(createHistory(3, 3), balise, access({ canViewHistory: true }));
      expect(versions(result)).toEqual([1, 2]);
    });

    it('should return nothing for a lock owner without viewHistory when there are no edits yet', () => {
      const balise = createMockBalise({ version: 3, locked: true, lockedBy: 'locker', lockedAtVersion: 3 });
      const result = filterHistoryForUser(createHistory(3, 3), balise, access({ isLockOwner: true }));
      expect(result).toEqual([]);
    });

    it('should return full history for viewHistory users when the balise is unlocked', () => {
      const result = filterHistoryForUser(unlockedHistory, unlockedBalise, access({ canViewHistory: true }));
      expect(versions(result)).toEqual([1, 2, 3, 4]);
    });

    it('should handle empty history', () => {
      expect(filterHistoryForUser([], lockedBalise, access({ canViewHistory: true }))).toEqual([]);
    });
  });
});
