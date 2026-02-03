import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  updateOrCreateBalise,
  createMultipleBalises,
  validateBalisesLockedByUser,
  type BaliseUpdateOptions,
  type BaliseValidationFailure,
} from '../baliseUtils';
import { uploadFilesToS3WithCleanup } from '../s3utils';

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

vi.mock('../s3utils', () => ({
  uploadFilesToS3WithCleanup: vi.fn(),
}));

vi.mock('../../lambdas/database/client', () => {
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
const { __mockDatabase } = await vi.importMock<{ __mockDatabase: MockDatabase }>('../../lambdas/database/client');

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
      expect(result.previousVersion).toBe(1);
      expect(result.filesUploaded).toBe(0);
      expect(mockDatabase.baliseVersion.create).not.toHaveBeenCalled();
      expect(uploadFilesToS3WithCleanup).not.toHaveBeenCalled();
    });

    it('should successfully update when balise is locked by current user', async () => {
      const options: BaliseUpdateOptions = {
        baliseId: 666,
        files: [{ filename: 'success.txt', buffer: Buffer.from('success content') }],
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

  describe('createMultipleBalises', () => {
    it('should create multiple balises with default descriptions', async () => {
      const baliseIds = [1001, 1002, 1003];
      const userId = 'batch-user';
      const globalDescription = 'Batch created balises';

      await createMultipleBalises(baliseIds, userId, globalDescription);

      expect(mockDatabase.balise.createMany).toHaveBeenCalledWith({
        data: [
          {
            secondaryId: 1001,
            version: 0,
            description: globalDescription,
            fileTypes: [],
            createdBy: userId,
            locked: false,
          },
          {
            secondaryId: 1002,
            version: 0,
            description: globalDescription,
            fileTypes: [],
            createdBy: userId,
            locked: false,
          },
          {
            secondaryId: 1003,
            version: 0,
            description: globalDescription,
            fileTypes: [],
            createdBy: userId,
            locked: false,
          },
        ],
      });
    });

    it('should use individual descriptions when provided', async () => {
      const baliseIds = [2001, 2002];
      const userId = 'individual-user';
      const globalDescription = 'Default description';
      const baliseDescriptions = {
        2001: 'Special description for 2001',
        2002: 'Custom description for 2002',
      };

      await createMultipleBalises(baliseIds, userId, globalDescription, baliseDescriptions);

      expect(mockDatabase.balise.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            secondaryId: 2001,
            description: 'Special description for 2001',
          }),
          expect.objectContaining({
            secondaryId: 2002,
            description: 'Custom description for 2002',
          }),
        ],
      });
    });

    it('should do nothing when given empty array', async () => {
      await createMultipleBalises([], 'test-user');

      expect(mockDatabase.balise.createMany).not.toHaveBeenCalled();
    });

    it('should use default message when no descriptions provided', async () => {
      const baliseIds = [3001];
      const userId = 'auto-user';

      await createMultipleBalises(baliseIds, userId);

      expect(mockDatabase.balise.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            secondaryId: 3001,
            description: 'Luotu automaattisesti massalatauksessa',
          }),
        ],
      });
    });
  });

  describe('async operations and error handling', () => {
    it('should handle S3 upload failures during balise creation', async () => {
      const options: BaliseUpdateOptions = {
        baliseId: 555,
        files: [{ filename: 'fail.txt', buffer: Buffer.from('content') }],
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

      // Should not throw
      await expect(validateBalisesLockedByUser(baliseIds, userId)).resolves.toBeUndefined();

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

      const promise = validateBalisesLockedByUser(baliseIds, userId);

      await expect(promise).rejects.toThrow('Lataus epäonnistui 1 baliisille');

      // Check error structure
      try {
        await promise;
      } catch (error) {
        const err = error as Error & { errorType?: string; failures?: BaliseValidationFailure[] };
        expect(err.errorType).toBe('validation_failed');
        expect(err.failures).toHaveLength(1);
        expect(err.failures?.[0]).toEqual({
          baliseId: 2002,
          errorType: 'not_locked',
          message: 'Baliisi 2002 ei ole lukittu. Lukitse baliisi ennen muokkaamista.',
        });
      }
    });

    it('should fail validation when one balise is locked by another user', async () => {
      const baliseIds = [3001, 3002, 3003];
      const userId = 'current-user';

      mockDatabase.balise.findMany.mockResolvedValue([
        { secondaryId: 3001, locked: true, lockedBy: 'current-user' },
        { secondaryId: 3002, locked: true, lockedBy: 'other-user' },
        { secondaryId: 3003, locked: true, lockedBy: 'current-user' },
      ]);

      const promise = validateBalisesLockedByUser(baliseIds, userId);

      await expect(promise).rejects.toThrow('Lataus epäonnistui 1 baliisille');

      // Check error structure
      try {
        await promise;
      } catch (error) {
        const err = error as Error & { errorType?: string; failures?: BaliseValidationFailure[] };
        expect(err.errorType).toBe('validation_failed');
        expect(err.failures).toHaveLength(1);
        expect(err.failures?.[0]).toEqual({
          baliseId: 3002,
          errorType: 'locked_by_other',
          lockedBy: 'other-user',
          message:
            'Baliisi 3002 on lukittu käyttäjän other-user toimesta. Vain lukituksen tehnyt käyttäjä voi muokata baliisia.',
        });
      }
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

      const promise = validateBalisesLockedByUser(baliseIds, userId);

      await expect(promise).rejects.toThrow('Lataus epäonnistui 3 baliisille');

      // Check all failures are collected
      try {
        await promise;
      } catch (error) {
        const err = error as Error & { errorType?: string; failures?: BaliseValidationFailure[] };
        expect(err.errorType).toBe('validation_failed');
        expect(err.failures).toHaveLength(3);

        // Check that all failed balises are included
        const failedIds = err.failures?.map((f) => f.baliseId);
        expect(failedIds).toEqual([5002, 5003, 5004]);

        // Check error types
        expect(err.failures?.[0].errorType).toBe('not_locked');
        expect(err.failures?.[1].errorType).toBe('locked_by_other');
        expect(err.failures?.[1].lockedBy).toBe('other-user');
        expect(err.failures?.[2].errorType).toBe('not_locked');
      }
    });

    it('should handle empty balise ID array', async () => {
      await expect(validateBalisesLockedByUser([], 'test-user')).resolves.toBeUndefined();
      expect(mockDatabase.balise.findMany).not.toHaveBeenCalled();
    });

    it('should pass when all balises are new (none exist in database)', async () => {
      const baliseIds = [4001, 4002, 4003];
      const userId = 'test-user';

      // No existing balises found
      mockDatabase.balise.findMany.mockResolvedValue([]);

      await expect(validateBalisesLockedByUser(baliseIds, userId)).resolves.toBeUndefined();
    });
  });
});
