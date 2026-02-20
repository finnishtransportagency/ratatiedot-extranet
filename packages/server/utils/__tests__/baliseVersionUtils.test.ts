import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseVersionParameter,
  validateVersionParameterAccess,
  validateLockOwnerVersionAccess,
  getVersionFileTypes,
  resolveBalisesForUser,
  filterHistoryForUser,
  resolveVersionForDownload,
} from '../baliseVersionUtils';
import { PrismaClient, VersionStatus, Balise, BaliseVersion } from '../../generated/prisma/client';
import { RataExtraUser } from '../userService';

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
  ...overrides,
});

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

    it('should allow all users when version is undefined', () => {
      const balise = createMockBalise();
      expect(() => validateVersionParameterAccess(user, undefined, balise, false)).not.toThrow();
    });

    it('should allow admin users to specify version', () => {
      const balise = createMockBalise();
      expect(() => validateVersionParameterAccess(adminUser, 3, balise, true)).not.toThrow();
    });

    it('should throw 403 for regular user with version parameter', () => {
      const balise = createMockBalise();
      expect(() => validateVersionParameterAccess(user, 3, balise, false)).toThrow();

      try {
        validateVersionParameterAccess(user, 3, balise, false);
      } catch (error: unknown) {
        expect((error as Error).message).toContain('Vain järjestelmän ylläpitäjät');
        expect((error as { statusCode: number }).statusCode).toBe(403);
      }
    });

    it('should allow lock owner to specify version for their locked balise', () => {
      const balise = createMockBalise({
        locked: true,
        lockedBy: 'user1',
        lockedAtVersion: 3,
      });
      expect(() => validateVersionParameterAccess(user, 4, balise, false)).not.toThrow();
    });

    it('should throw 403 for lock owner on unlocked balise', () => {
      const balise = createMockBalise({
        locked: false,
        lockedBy: null,
      });
      expect(() => validateVersionParameterAccess(user, 3, balise, false)).toThrow();

      try {
        validateVersionParameterAccess(user, 3, balise, false);
      } catch (error: unknown) {
        expect((error as { statusCode: number }).statusCode).toBe(403);
      }
    });

    it('should throw 403 when balise is locked by different user', () => {
      const balise = createMockBalise({
        locked: true,
        lockedBy: 'otherUser',
        lockedAtVersion: 3,
      });
      expect(() => validateVersionParameterAccess(user, 4, balise, false)).toThrow();

      try {
        validateVersionParameterAccess(user, 4, balise, false);
      } catch (error: unknown) {
        expect((error as { statusCode: number }).statusCode).toBe(403);
      }
    });

    it('should not throw for admin even on unlocked balise', () => {
      const balise = createMockBalise({
        locked: false,
        lockedBy: null,
      });
      expect(() => validateVersionParameterAccess(adminUser, 3, balise, true)).not.toThrow();
    });
  });

  describe('validateLockOwnerVersionAccess', () => {
    it('should allow version equal to lockedAtVersion', () => {
      const balise = createMockBalise({
        lockedAtVersion: 3,
      });
      expect(() => validateLockOwnerVersionAccess(3, balise)).not.toThrow();
    });

    it('should allow version greater than lockedAtVersion', () => {
      const balise = createMockBalise({
        lockedAtVersion: 3,
      });
      expect(() => validateLockOwnerVersionAccess(5, balise)).not.toThrow();
    });

    it('should throw 403 when version is less than lockedAtVersion', () => {
      const balise = createMockBalise({
        lockedAtVersion: 3,
      });
      expect(() => validateLockOwnerVersionAccess(2, balise)).toThrow();

      try {
        validateLockOwnerVersionAccess(2, balise);
      } catch (error: unknown) {
        expect((error as Error).message).toContain('lukituksesi aikana lisättyjä');
        expect((error as { statusCode: number }).statusCode).toBe(403);
      }
    });

    it('should throw 403 when lockedAtVersion is null', () => {
      const balise = createMockBalise({
        lockedAtVersion: null,
      });
      expect(() => validateLockOwnerVersionAccess(5, balise)).toThrow();

      try {
        validateLockOwnerVersionAccess(5, balise);
      } catch (error: unknown) {
        expect((error as { statusCode: number }).statusCode).toBe(403);
      }
    });

    it('should handle boundary case at exact lockedAtVersion', () => {
      const balise = createMockBalise({
        lockedAtVersion: 10,
      });
      expect(() => validateLockOwnerVersionAccess(10, balise)).not.toThrow();
      expect(() => validateLockOwnerVersionAccess(9, balise)).toThrow();
    });
  });

  describe('resolveVersionForDownload', () => {
    it('should return requested version when explicitly specified', () => {
      const balise = createMockBalise({ version: 5 });
      expect(resolveVersionForDownload(3, balise, false, false)).toBe(3);
      expect(resolveVersionForDownload(3, balise, true, false)).toBe(3);
      expect(resolveVersionForDownload(3, balise, false, true)).toBe(3);
    });

    it('should return current version for admin users', () => {
      const balise = createMockBalise({ version: 5, locked: true, lockedAtVersion: 3 });
      expect(resolveVersionForDownload(undefined, balise, true, false)).toBe(5);
    });

    it('should return current version for lock owner', () => {
      const balise = createMockBalise({ version: 5, locked: true, lockedAtVersion: 3 });
      expect(resolveVersionForDownload(undefined, balise, false, true)).toBe(5);
    });

    it('should return lockedAtVersion for non-admin non-lock-owner on locked balise', () => {
      const balise = createMockBalise({ version: 5, locked: true, lockedAtVersion: 3 });
      expect(resolveVersionForDownload(undefined, balise, false, false)).toBe(3);
    });

    it('should return current version for unlocked balise', () => {
      const balise = createMockBalise({ version: 5, locked: false, lockedAtVersion: null });
      expect(resolveVersionForDownload(undefined, balise, false, false)).toBe(5);
    });

    it('should return current version when lockedAtVersion equals version', () => {
      const balise = createMockBalise({ version: 5, locked: true, lockedAtVersion: 5 });
      expect(resolveVersionForDownload(undefined, balise, false, false)).toBe(5);
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
      mockFindFirst.mockResolvedValue({
        fileTypes: ['unconfirmed.xml'],
        versionStatus: VersionStatus.UNCONFIRMED,
      });

      const result = await getVersionFileTypes(mockDatabase, 12345, 4, balise);

      expect(result.versionStatus).toBe(VersionStatus.UNCONFIRMED);
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
        createMockBalise({ secondaryId: 1, versionStatus: VersionStatus.UNCONFIRMED }),
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
      const unconfirmedBalise = createMockBalise({
        secondaryId: 12345,
        version: 6,
        versionStatus: VersionStatus.UNCONFIRMED,
        fileTypes: ['unconfirmed.xml'],
        description: 'Unconfirmed version',
      });

      mockFindMany.mockResolvedValue([
        {
          secondaryId: 12345,
          version: 4,
          fileTypes: ['official.xml'],
          description: 'Official version',
          createdBy: 'user2',
        },
      ]);

      const result = await resolveBalisesForUser(mockDatabase, [unconfirmedBalise], 'user1', false);

      expect(result).toHaveLength(1);
      expect(result[0].version).toBe(4);
      expect(result[0].fileTypes).toEqual(['official.xml']);
      expect(result[0].description).toBe('Official version');
    });

    it('should keep UNCONFIRMED balise for lock owner', async () => {
      const unconfirmedBalise = createMockBalise({
        secondaryId: 12345,
        version: 6,
        versionStatus: VersionStatus.UNCONFIRMED,
        locked: true,
        lockedBy: 'user1',
      });

      const result = await resolveBalisesForUser(mockDatabase, [unconfirmedBalise], 'user1', false);

      expect(result).toEqual([unconfirmedBalise]);
      expect(mockFindMany).not.toHaveBeenCalled();
    });

    it('should handle mixed OFFICIAL and UNCONFIRMED balises', async () => {
      const officialBalise = createMockBalise({
        secondaryId: 1,
        versionStatus: VersionStatus.OFFICIAL,
      });
      const unconfirmedBalise = createMockBalise({
        secondaryId: 2,
        version: 5,
        versionStatus: VersionStatus.UNCONFIRMED,
      });

      mockFindMany.mockResolvedValue([
        {
          secondaryId: 2,
          version: 3,
          fileTypes: ['official.xml'],
          description: 'Official',
          createdBy: 'user1',
        },
      ]);

      const result = await resolveBalisesForUser(mockDatabase, [officialBalise, unconfirmedBalise], 'user1', false);

      expect(result).toHaveLength(2);
      expect(result[0].secondaryId).toBe(1);
      expect(result[0].versionStatus).toBe(VersionStatus.OFFICIAL);
      expect(result[1].secondaryId).toBe(2);
      expect(result[1].version).toBe(3);
    });

    it('should make single optimized database query for multiple UNCONFIRMED balises', async () => {
      const balises = [
        createMockBalise({ secondaryId: 1, versionStatus: VersionStatus.UNCONFIRMED }),
        createMockBalise({ secondaryId: 2, versionStatus: VersionStatus.UNCONFIRMED }),
        createMockBalise({ secondaryId: 3, versionStatus: VersionStatus.UNCONFIRMED }),
      ];

      mockFindMany.mockResolvedValue([
        {
          secondaryId: 1,
          version: 10,
          fileTypes: [],
          description: '',
          createdBy: 'user1',
          updatedBy: 'user1',
          updatedAt: new Date(),
        },
        {
          secondaryId: 2,
          version: 20,
          fileTypes: [],
          description: '',
          createdBy: 'user1',
          updatedBy: 'user1',
          updatedAt: new Date(),
        },
        {
          secondaryId: 3,
          version: 30,
          fileTypes: [],
          description: '',
          createdBy: 'user1',
          updatedBy: 'user1',
          updatedAt: new Date(),
        },
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
        createMockBalise({ secondaryId: 300, versionStatus: VersionStatus.UNCONFIRMED }),
        createMockBalise({ secondaryId: 100, versionStatus: VersionStatus.UNCONFIRMED }),
        createMockBalise({ secondaryId: 200, versionStatus: VersionStatus.UNCONFIRMED }),
      ];

      mockFindMany.mockResolvedValue([
        {
          secondaryId: 100,
          version: 1,
          fileTypes: [],
          description: '',
          createdBy: 'u',
          updatedBy: 'u',
          updatedAt: new Date(),
        },
        {
          secondaryId: 200,
          version: 1,
          fileTypes: [],
          description: '',
          createdBy: 'u',
          updatedBy: 'u',
          updatedAt: new Date(),
        },
        {
          secondaryId: 300,
          version: 1,
          fileTypes: [],
          description: '',
          createdBy: 'u',
          updatedBy: 'u',
          updatedAt: new Date(),
        },
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
      const balise = createMockBalise({
        secondaryId: 999,
        versionStatus: VersionStatus.UNCONFIRMED,
      });

      mockFindMany.mockResolvedValue([]);

      await expect(resolveBalisesForUser(mockDatabase, [balise], 'user1', false)).rejects.toThrow();

      try {
        await resolveBalisesForUser(mockDatabase, [balise], 'user1', false);
      } catch (error: unknown) {
        expect((error as Error).message).toContain('Baliisille 999 ei löydy vahvistettua');
        expect((error as { statusCode: number }).statusCode).toBe(404);
      }
    });

    it('should handle multiple versions and pick highest for each balise', async () => {
      const balise = createMockBalise({
        secondaryId: 12345,
        versionStatus: VersionStatus.UNCONFIRMED,
      });

      // Simulate database returning multiple versions (should already be sorted desc)
      mockFindMany.mockResolvedValue([
        {
          secondaryId: 12345,
          version: 8,
          fileTypes: ['v8.xml'],
          description: 'Version 8',
          createdBy: 'u',
          updatedBy: 'u',
          updatedAt: new Date(),
        },
        {
          secondaryId: 12345,
          version: 5,
          fileTypes: ['v5.xml'],
          description: 'Version 5',
          createdBy: 'u',
          updatedBy: 'u',
          updatedAt: new Date(),
        },
        {
          secondaryId: 12345,
          version: 3,
          fileTypes: ['v3.xml'],
          description: 'Version 3',
          createdBy: 'u',
          updatedBy: 'u',
          updatedAt: new Date(),
        },
      ]);

      const result = await resolveBalisesForUser(mockDatabase, [balise], 'user1', false);

      expect(result[0].version).toBe(8);
      expect(result[0].fileTypes).toEqual(['v8.xml']);
    });

    it('should treat undefined userId as non-lock-owner', async () => {
      const unconfirmedBalise = createMockBalise({
        secondaryId: 12345,
        version: 6,
        versionStatus: VersionStatus.UNCONFIRMED,
        locked: true,
        lockedBy: 'someUser',
      });

      mockFindMany.mockResolvedValue([
        {
          secondaryId: 12345,
          version: 4,
          fileTypes: [],
          description: '',
          createdBy: 'u',
          updatedBy: 'u',
          updatedAt: new Date(),
        },
      ]);

      const result = await resolveBalisesForUser(mockDatabase, [unconfirmedBalise], undefined, false);

      expect(result[0].version).toBe(4);
    });

    it('should merge resolved data into original balise structure', async () => {
      const balise = createMockBalise({
        secondaryId: 12345,
        versionStatus: VersionStatus.UNCONFIRMED,
      });

      mockFindMany.mockResolvedValue([
        {
          secondaryId: 12345,
          version: 3,
          fileTypes: ['resolved.xml'],
          description: 'Resolved description',
          createdBy: 'u',
        },
      ]);

      const result = await resolveBalisesForUser(mockDatabase, [balise], 'user1', false);

      expect(result[0].version).toBe(3);
      expect(result[0].fileTypes).toEqual(['resolved.xml']);
      expect(result[0].description).toBe('Resolved description');
    });

    it('should correctly separate lock owner balises from others', async () => {
      const ownLockedBalise = createMockBalise({
        secondaryId: 1,
        versionStatus: VersionStatus.UNCONFIRMED,
        locked: true,
        lockedBy: 'user1',
      });
      const othersLockedBalise = createMockBalise({
        secondaryId: 2,
        versionStatus: VersionStatus.UNCONFIRMED,
        locked: true,
        lockedBy: 'user2',
      });

      mockFindMany.mockResolvedValue([
        {
          secondaryId: 2,
          version: 5,
          fileTypes: [],
          description: '',
          createdBy: 'u',
          updatedBy: 'u',
          updatedAt: new Date(),
        },
      ]);

      const result = await resolveBalisesForUser(mockDatabase, [ownLockedBalise, othersLockedBalise], 'user1', false);

      expect(result).toHaveLength(2);
      // Own locked balise should remain UNCONFIRMED
      expect(result.find((b) => b.secondaryId === 1)?.versionStatus).toBe(VersionStatus.UNCONFIRMED);
      // Other's locked balise should be resolved to OFFICIAL
      expect(result.find((b) => b.secondaryId === 2)?.version).toBe(5);
    });
  });

  describe('filterHistoryForUser', () => {
    // Test data factory
    const createMockVersion = (version: number): BaliseVersion => ({
      id: `version-${version}`,
      baliseId: 'balise-1',
      secondaryId: 12345,
      version,
      versionStatus: VersionStatus.OFFICIAL,
      description: `Version ${version}`,
      fileTypes: ['file.xml'],
      createdBy: 'user1',
      createdTime: new Date('2024-01-01'),
      locked: false,
      lockedBy: null,
      lockedTime: null,
      versionCreatedTime: new Date('2024-01-01'),
    });

    describe('admin access', () => {
      it('should return full history for admin users', () => {
        const history = [createMockVersion(1), createMockVersion(2), createMockVersion(3)];
        const result = filterHistoryForUser(history, 2, false, true);
        expect(result).toEqual(history);
        expect(result).toHaveLength(3);
      });

      it('should return full history for admin even when lockedAtVersion is null', () => {
        const history = [createMockVersion(1), createMockVersion(2), createMockVersion(3)];
        const result = filterHistoryForUser(history, null, false, true);
        expect(result).toEqual(history);
        expect(result).toHaveLength(3);
      });

      it('should return full history when user is both admin and lock owner', () => {
        const history = [createMockVersion(1), createMockVersion(2), createMockVersion(3)];
        const result = filterHistoryForUser(history, 2, true, true);
        expect(result).toEqual(history);
        expect(result).toHaveLength(3);
      });
    });

    describe('non-lock-owner access', () => {
      it('should return empty array for non-lock-owners', () => {
        const history = [createMockVersion(1), createMockVersion(2), createMockVersion(3)];
        const result = filterHistoryForUser(history, 2, false, false);
        expect(result).toEqual([]);
      });

      it('should return empty array for non-lock-owners even with lockedAtVersion null', () => {
        const history = [createMockVersion(1), createMockVersion(2), createMockVersion(3)];
        const result = filterHistoryForUser(history, null, false, false);
        expect(result).toEqual([]);
      });
    });

    describe('lock owner filtering', () => {
      it('should filter versions >= lockedAtVersion for lock owners', () => {
        const history = [createMockVersion(1), createMockVersion(2), createMockVersion(3), createMockVersion(4)];
        const result = filterHistoryForUser(history, 2, true, false);
        expect(result).toHaveLength(3);
        expect(result.map((v) => v.version)).toEqual([2, 3, 4]);
      });

      it('should return empty array when lockedAtVersion is null for lock owners', () => {
        const history = [createMockVersion(1), createMockVersion(2), createMockVersion(3)];
        const result = filterHistoryForUser(history, null, true, false);
        expect(result).toEqual([]);
      });

      it('should include version exactly equal to lockedAtVersion', () => {
        const history = [createMockVersion(1), createMockVersion(2), createMockVersion(3)];
        const result = filterHistoryForUser(history, 2, true, false);
        expect(result).toHaveLength(2);
        expect(result.map((v) => v.version)).toEqual([2, 3]);
      });

      it('should return all versions when lockedAtVersion is 0', () => {
        const history = [createMockVersion(0), createMockVersion(1), createMockVersion(2)];
        const result = filterHistoryForUser(history, 0, true, false);
        expect(result).toHaveLength(3);
        expect(result.map((v) => v.version)).toEqual([0, 1, 2]);
      });

      it('should return empty array when lockedAtVersion exceeds all history versions', () => {
        const history = [createMockVersion(1), createMockVersion(2), createMockVersion(3)];
        const result = filterHistoryForUser(history, 10, true, false);
        expect(result).toEqual([]);
      });
    });

    describe('edge cases', () => {
      it('should handle empty history array', () => {
        const result = filterHistoryForUser([], 2, true, false);
        expect(result).toEqual([]);
      });

      it('should handle single version in history', () => {
        const history = [createMockVersion(5)];
        const result = filterHistoryForUser(history, 5, true, false);
        expect(result).toHaveLength(1);
        expect(result[0].version).toBe(5);
      });

      it('should handle unsorted version numbers correctly', () => {
        const history = [createMockVersion(5), createMockVersion(1), createMockVersion(3)];
        const result = filterHistoryForUser(history, 3, true, false);
        expect(result).toHaveLength(2);
        expect(result.map((v) => v.version).sort()).toEqual([3, 5]);
      });

      it('should handle non-sequential version numbers', () => {
        const history = [createMockVersion(1), createMockVersion(5), createMockVersion(10), createMockVersion(20)];
        const result = filterHistoryForUser(history, 5, true, false);
        expect(result).toHaveLength(3);
        expect(result.map((v) => v.version)).toEqual([5, 10, 20]);
      });
    });
  });
});
