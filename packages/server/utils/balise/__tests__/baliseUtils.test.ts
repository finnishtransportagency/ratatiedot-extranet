import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  updateOrCreateBalise,
  validateBalisesLockedByUser,
  isValidExtension,
  isValidBaliseIdRange,
  parseBaliseIdFromFilename,
  MIN_BALISE_ID,
  MAX_BALISE_ID,
  type BaliseUpdateOptions,
} from '../baliseUtils';
import { uploadFilesToS3WithCleanup } from '../../s3utils';

// Define mock database interface
interface MockDatabase {
  balise: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    createMany: ReturnType<typeof vi.fn>;
  };
  baliseVersion: {
    create: ReturnType<typeof vi.fn>;
  };
}

vi.mock('../../s3utils', () => ({
  uploadFilesToS3WithCleanup: vi.fn(),
}));

vi.mock('../../../lambdas/database/client', () => {
  const mockDatabase = {
    balise: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      createMany: vi.fn(),
    },
    baliseVersion: {
      create: vi.fn(),
    },
  };

  return {
    DatabaseClient: {
      build: vi.fn().mockResolvedValue(mockDatabase),
    },
    __mockDatabase: mockDatabase, // Export for test access
  };
});

// Import the mock to get access to mockDatabase
const { __mockDatabase } = await vi.importMock<{ __mockDatabase: MockDatabase }>('../../../lambdas/database/client');

describe('baliseUtils', () => {
  const mockDatabase = __mockDatabase;

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default successful mock for uploadFilesToS3WithCleanup
    vi.mocked(uploadFilesToS3WithCleanup).mockImplementation(async (bucket, files, pathPrefix, userId) => {
      // Explicitly ignore unused parameters to satisfy ESLint
      void bucket;
      void pathPrefix;
      void userId;
      return files.map((file) => file.filename);
    });
  });

  describe('updateOrCreateBalise', () => {
    it('should create a new balise when it does not exist', async () => {
      const options: BaliseUpdateOptions = {
        baliseId: 123,
        files: [{ filename: 'test.txt', buffer: Buffer.from('test content') }],
        description: 'Test balise',
        userId: 'test-user',
      };

      const result = await updateOrCreateBalise(options);

      expect(result.isNewBalise).toBe(true);
      expect(result.newVersion).toBe(1);
      expect(result.filesUploaded).toBe(1);
      expect(result.previousVersion).toBeUndefined();
      expect(uploadFilesToS3WithCleanup).toHaveBeenCalledWith(
        '',
        [{ filename: 'test.txt', buffer: Buffer.from('test content') }],
        'balise_123/v1',
        'test-user',
      );
      expect(mockDatabase.balise.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          secondaryId: 123,
          version: 1,
          description: 'Test balise',
          fileTypes: ['test.txt'],
          createdBy: 'test-user',
          locked: false,
        }),
      });
    });

    it('should update existing balise and create new version when files are uploaded', async () => {
      const options: BaliseUpdateOptions = {
        baliseId: 456,
        files: [{ filename: 'update.pdf', buffer: Buffer.from('pdf content') }],
        description: 'Updated description',
        userId: 'test-user',
      };

      const existingBalise = {
        id: 'existing-uuid',
        secondaryId: 456,
        version: 2,
        description: 'Old description',
        fileTypes: ['old-file.txt'],
        createdBy: 'previous-user',
        createdTime: new Date('2026-01-01T00:00:00.000Z'),
        locked: true,
        lockedBy: 'test-user',
        lockedTime: new Date('2026-01-01T12:00:00.000Z'),
      };

      mockDatabase.balise.findUnique.mockResolvedValue(existingBalise);

      const result = await updateOrCreateBalise(options);

      expect(result.isNewBalise).toBe(false);
      expect(result.newVersion).toBe(3);
      expect(result.previousVersion).toBe(2);
      expect(result.filesUploaded).toBe(1);
      expect(mockDatabase.baliseVersion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          baliseId: 'existing-uuid',
          secondaryId: 456,
          version: 2,
        }),
      });
      expect(uploadFilesToS3WithCleanup).toHaveBeenCalledWith(
        '',
        [{ filename: 'update.pdf', buffer: Buffer.from('pdf content') }],
        'balise_456/v3',
        'test-user',
      );
    });

    it('should update description only without creating new version when no files provided', async () => {
      const options: BaliseUpdateOptions = {
        baliseId: 789,
        description: 'Updated description only',
        userId: 'test-user',
      };

      const existingBalise = {
        id: 'existing-uuid',
        secondaryId: 789,
        version: 1,
        description: 'Old description',
        fileTypes: ['existing-file.txt'],
        createdBy: 'previous-user',
        createdTime: new Date('2026-01-01T00:00:00.000Z'),
        locked: true,
        lockedBy: 'test-user',
        lockedTime: new Date('2026-01-01T12:00:00.000Z'),
      };

      mockDatabase.balise.findUnique.mockResolvedValue(existingBalise);

      const result = await updateOrCreateBalise(options);

      expect(result.isNewBalise).toBe(false);
      expect(result.newVersion).toBe(1); // Version should not change
      expect(result.previousVersion).toBeUndefined(); // No previous version when not creating new version
      expect(result.filesUploaded).toBe(0);
      expect(mockDatabase.baliseVersion.create).not.toHaveBeenCalled();
      expect(uploadFilesToS3WithCleanup).not.toHaveBeenCalled();
    });

    it('should successfully update when balise is locked by current user', async () => {
      const options: BaliseUpdateOptions = {
        baliseId: 666,
        files: [{ filename: 'success.txt', buffer: Buffer.from('success content') }],
        description: 'Locked by current user',
        userId: 'current-user',
      };

      const lockedByCurrentUserBalise = {
        id: 'locked-by-current-uuid',
        secondaryId: 666,
        version: 2,
        description: 'Locked by current user',
        fileTypes: ['existing.txt'],
        createdBy: 'previous-user',
        createdTime: new Date('2026-01-01T00:00:00.000Z'),
        locked: true,
        lockedBy: 'current-user',
        lockedTime: new Date('2026-01-01T12:00:00.000Z'),
      };

      mockDatabase.balise.findUnique.mockResolvedValue(lockedByCurrentUserBalise);

      const result = await updateOrCreateBalise(options);

      expect(result.isNewBalise).toBe(false);
      expect(result.newVersion).toBe(3);
      expect(result.filesUploaded).toBe(1);
      expect(mockDatabase.baliseVersion.create).toHaveBeenCalled();
      expect(uploadFilesToS3WithCleanup).toHaveBeenCalledWith(
        '',
        [{ filename: 'success.txt', buffer: Buffer.from('success content') }],
        'balise_666/v3',
        'current-user',
      );
      expect(mockDatabase.balise.update).toHaveBeenCalled();
    });
  });

  describe('async operations and error handling', () => {
    it('should handle S3 upload failures during balise creation', async () => {
      const options: BaliseUpdateOptions = {
        baliseId: 555,
        files: [{ filename: 'fail.txt', buffer: Buffer.from('content') }],
        description: 'Description',
        userId: 'test-user',
      };

      mockDatabase.balise.findUnique.mockResolvedValue(null);
      vi.mocked(uploadFilesToS3WithCleanup).mockRejectedValue(new Error('S3 upload failed'));

      await expect(updateOrCreateBalise(options)).rejects.toThrow('S3 upload failed');
      expect(mockDatabase.balise.create).not.toHaveBeenCalled();
    });
  });

  describe('validateBalisesLockedByUser', () => {
    it('should pass validation when all existing balises are locked by current user', async () => {
      const baliseIds = [1001, 1002, 1003];
      const userId = 'test-user';

      // Mock finding two existing balises, both locked by test-user
      mockDatabase.balise.findMany.mockResolvedValue([
        { secondaryId: 1001, locked: true, lockedBy: 'test-user' },
        { secondaryId: 1002, locked: true, lockedBy: 'test-user' },
        // 1003 doesn't exist yet (new balise)
      ]);

      // Should return null
      const result = await validateBalisesLockedByUser(baliseIds, userId);
      expect(result).toBeNull();

      expect(mockDatabase.balise.findMany).toHaveBeenCalledWith({
        where: { secondaryId: { in: baliseIds } },
        select: { secondaryId: true, locked: true, lockedBy: true },
      });
    });

    it('should fail validation when one balise is not locked', async () => {
      const baliseIds = [2001, 2002];
      const userId = 'test-user';

      mockDatabase.balise.findMany.mockResolvedValue([
        { secondaryId: 2001, locked: true, lockedBy: 'test-user' },
        { secondaryId: 2002, locked: false, lockedBy: null },
      ]);

      const result = await validateBalisesLockedByUser(baliseIds, userId);

      expect(result).not.toBeNull();
      expect(result?.statusCode).toBe(403);

      const body = JSON.parse(result!.body);
      expect(body.errorType).toBe('validation_failed');
      expect(body.failures).toHaveLength(1);
      expect(body.failures[0]).toEqual({
        baliseId: 2002,
        errorType: 'not_locked',
        message: 'Baliisi 2002 ei ole lukittu. Lukitse baliisi ennen muokkaamista.',
      });
    });

    it('should fail validation when one balise is locked by another user', async () => {
      const baliseIds = [3001, 3002, 3003];
      const userId = 'current-user';

      mockDatabase.balise.findMany.mockResolvedValue([
        { secondaryId: 3001, locked: true, lockedBy: 'current-user' },
        { secondaryId: 3002, locked: true, lockedBy: 'other-user' },
        { secondaryId: 3003, locked: true, lockedBy: 'current-user' },
      ]);

      const result = await validateBalisesLockedByUser(baliseIds, userId);

      expect(result).not.toBeNull();
      expect(result?.statusCode).toBe(403);

      const body = JSON.parse(result!.body);
      expect(body.errorType).toBe('validation_failed');
      expect(body.failures).toHaveLength(1);
      expect(body.failures[0]).toEqual({
        baliseId: 3002,
        errorType: 'locked_by_other',
        lockedBy: 'other-user',
        message:
          'Baliisi 3002 on lukittu käyttäjän other-user toimesta. Vain lukituksen tehnyt käyttäjä voi muokata baliisia.',
      });
    });

    it('should collect multiple validation failures', async () => {
      const baliseIds = [5001, 5002, 5003, 5004];
      const userId = 'current-user';

      mockDatabase.balise.findMany.mockResolvedValue([
        { secondaryId: 5001, locked: true, lockedBy: 'current-user' },
        { secondaryId: 5002, locked: false, lockedBy: null },
        { secondaryId: 5003, locked: true, lockedBy: 'other-user' },
        { secondaryId: 5004, locked: false, lockedBy: null },
      ]);

      const result = await validateBalisesLockedByUser(baliseIds, userId);

      expect(result).not.toBeNull();
      expect(result?.statusCode).toBe(403);

      const body = JSON.parse(result!.body);
      expect(body.errorType).toBe('validation_failed');
      expect(body.failures).toHaveLength(3);

      // Check that all failed balises are included
      const failedIds = body.failures.map((f: { baliseId: number }) => f.baliseId);
      expect(failedIds).toEqual([5002, 5003, 5004]);

      // Check error types
      expect(body.failures[0].errorType).toBe('not_locked');
      expect(body.failures[1].errorType).toBe('locked_by_other');
      expect(body.failures[1].lockedBy).toBe('other-user');
      expect(body.failures[2].errorType).toBe('not_locked');
    });

    it('should handle empty balise ID array', async () => {
      const result = await validateBalisesLockedByUser([], 'test-user');
      expect(result).toBeNull();
      expect(mockDatabase.balise.findMany).not.toHaveBeenCalled();
    });

    it('should pass when all balises are new (none exist in database)', async () => {
      const baliseIds = [4001, 4002, 4003];
      const userId = 'test-user';

      // No existing balises found
      mockDatabase.balise.findMany.mockResolvedValue([]);

      const result = await validateBalisesLockedByUser(baliseIds, userId);
      expect(result).toBeNull();
    });
  });

  describe('isValidExtension', () => {
    it('should return true for valid .il extension', () => {
      expect(isValidExtension('10000.il')).toBe(true);
    });

    it('should return true for valid .leu extension', () => {
      expect(isValidExtension('10000.leu')).toBe(true);
    });

    it('should return true for valid .bis extension', () => {
      expect(isValidExtension('10000.bis')).toBe(true);
    });

    it('should be case insensitive for uppercase extensions', () => {
      expect(isValidExtension('10000.IL')).toBe(true);
      expect(isValidExtension('10000.LEU')).toBe(true);
      expect(isValidExtension('10000.BIS')).toBe(true);
    });

    it('should be case insensitive for mixed case extensions', () => {
      // Rare, but possible and not a problem if we allow it, especially since
      // Windows/macOS are case insensitive
      expect(isValidExtension('10000.Il')).toBe(true);
      expect(isValidExtension('10000.Leu')).toBe(true);
      expect(isValidExtension('10000.BiS')).toBe(true);
    });

    it('should return false for invalid extensions', () => {
      expect(isValidExtension('10000.txt')).toBe(false);
      expect(isValidExtension('10000.pdf')).toBe(false);
      expect(isValidExtension('10000.doc')).toBe(false);
    });

    it('should return false for files without extension', () => {
      expect(isValidExtension('10000')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidExtension('')).toBe(false);
    });
  });

  describe('isValidBaliseIdRange', () => {
    it('should return true for minimum valid ID', () => {
      expect(isValidBaliseIdRange(MIN_BALISE_ID)).toBe(true);
    });

    it('should return true for maximum valid ID', () => {
      expect(isValidBaliseIdRange(MAX_BALISE_ID)).toBe(true);
    });

    it('should return true for ID in the valid range', () => {
      expect(isValidBaliseIdRange(12345)).toBe(true);
      expect(isValidBaliseIdRange(50000)).toBe(true);
    });

    it('should return false for ID below minimum', () => {
      expect(isValidBaliseIdRange(MIN_BALISE_ID - 1)).toBe(false);
      expect(isValidBaliseIdRange(-10000)).toBe(false);
    });

    it('should return false for ID above maximum', () => {
      expect(isValidBaliseIdRange(MAX_BALISE_ID + 1)).toBe(false);
      expect(isValidBaliseIdRange(999999)).toBe(false);
    });
  });

  describe('parseBaliseIdFromFilename', () => {
    it('should parse 5-digit IDs correctly', () => {
      expect(parseBaliseIdFromFilename('10000.il')).toBe(10000);
      expect(parseBaliseIdFromFilename('99999.bis')).toBe(99999);
      expect(parseBaliseIdFromFilename('54321.leu')).toBe(54321);
    });

    it('should return null for invalid filename format (prefix not allowed)', () => {
      expect(parseBaliseIdFromFilename('prefix_10000.il')).toBeNull();
      expect(parseBaliseIdFromFilename('balise-12345.bis')).toBeNull();
    });

    it('should parse K suffix correctly (case insensitive)', () => {
      expect(parseBaliseIdFromFilename('10003K.bis')).toBe(10003);
      expect(parseBaliseIdFromFilename('10003k.leu')).toBe(10003);
      expect(parseBaliseIdFromFilename('12345K.IL')).toBe(12345);
    });

    it('should return null for invalid suffix (only K allowed)', () => {
      expect(parseBaliseIdFromFilename('10003X.bis')).toBeNull();
      expect(parseBaliseIdFromFilename('10003AB.leu')).toBeNull();
    });

    it('should return null for filename without numbers', () => {
      expect(parseBaliseIdFromFilename('file.il')).toBeNull();
      expect(parseBaliseIdFromFilename('noNumbers.leu')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseBaliseIdFromFilename('')).toBeNull();
    });

    it('should return null for filenames without valid extension', () => {
      expect(parseBaliseIdFromFilename('10000')).toBeNull();
      expect(parseBaliseIdFromFilename('10000.pdf')).toBeNull();
      expect(parseBaliseIdFromFilename('10000.txt')).toBeNull();
    });

    it('should handle case insensitive extensions', () => {
      expect(parseBaliseIdFromFilename('10000.IL')).toBe(10000);
      expect(parseBaliseIdFromFilename('10000.LEU')).toBe(10000);
      expect(parseBaliseIdFromFilename('10000.BIS')).toBe(10000);
    });
  });
});
