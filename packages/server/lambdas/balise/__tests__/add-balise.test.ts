import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ALBEvent } from 'aws-lambda';
import { FileUpload as ParsedFileUpload } from '../../../utils/parser';

vi.mock('../../../lambdas/database/client', () => {
  return {
    DatabaseClient: {
      build: vi.fn().mockResolvedValue({
        prisma: {},
      }),
    },
  };
});
vi.mock('../../../utils/userService', () => ({
  getUser: vi.fn().mockResolvedValue({ uid: 'test-user', roles: [] }),
}));
vi.mock('../../../utils/balise/balisePermissions', () => ({
  validateBaliseCapability: vi.fn(),
}));
vi.mock('../../../utils/logger', () => ({ log: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../../../utils/balise/baliseUtils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../utils/balise/baliseUtils')>()),
  updateOrCreateBalise: vi.fn(),
  validateBalisesLockedByUser: vi.fn().mockResolvedValue(null),
}));

import { validateUploadedFiles, handleRequest } from '../add-balise';
import { updateOrCreateBalise } from '../../../utils/balise/baliseUtils';

describe('handleRequest filesToDelete', () => {
  const createJsonEvent = (body: unknown): ALBEvent => ({
    requestContext: { elb: { targetGroupArn: 'arn:aws:elasticloadbalancing:test' } },
    httpMethod: 'PUT',
    path: '/api/balise/12345/add',
    queryStringParameters: undefined,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    isBase64Encoded: false,
  });

  beforeEach(() => {
    vi.mocked(updateOrCreateBalise).mockReset();
    vi.mocked(updateOrCreateBalise).mockResolvedValue({
      newVersion: 3,
      filesUploaded: 0,
      isNewBalise: false,
      balise: {} as Awaited<ReturnType<typeof updateOrCreateBalise>>['balise'],
    });
  });

  it('should pass filesToDelete to updateOrCreateBalise', async () => {
    const result = await handleRequest(createJsonEvent({ description: 'desc', filesToDelete: ['12345.il'] }));

    expect(result.statusCode).toBe(200);
    expect(updateOrCreateBalise).toHaveBeenCalledWith(
      expect.objectContaining({ baliseId: 12345, files: [], filesToDelete: ['12345.il'] }),
    );
  });

  it('should default filesToDelete to an empty list', async () => {
    await handleRequest(createJsonEvent({ description: 'desc' }));

    expect(updateOrCreateBalise).toHaveBeenCalledWith(expect.objectContaining({ filesToDelete: [] }));
  });

  it('should reject malformed filesToDelete', async () => {
    const result = await handleRequest(createJsonEvent({ description: 'desc', filesToDelete: [1, 2] }));

    expect(result.statusCode).toBe(400);
    expect(updateOrCreateBalise).not.toHaveBeenCalled();
  });
});

describe('validateUploadedFiles', () => {
  describe('Valid files', () => {
    it('should return no errors for valid files', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: '12345.il',
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345.leu',
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345.bis',
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 12345);
      expect(errors).toHaveLength(0);
    });

    it('should return error for invalid or missing extensions', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: '12345.txt',
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345.doc',
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345',
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 12345);
      expect(errors).toHaveLength(3);
    });

    it('should return error for missing balise IDs', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: 'document.il',
          buffer: Buffer.from('test'),
        },
        {
          filename: 'file.leu',
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 12345);
      expect(errors).toHaveLength(2);
      expect(errors.every((e) => e.error.includes('Virheellinen tiedostonimi'))).toBe(true);
    });
  });

  describe('K suffix validation', () => {
    it('should accept files with K suffix', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: '12345K.il',
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345k.leu',
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 12345);
      expect(errors).toHaveLength(0);
    });

    it('should reject files with invalid suffix (not K or digit)', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: '12345X.il',
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345AB.leu',
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 12345);
      expect(errors).toHaveLength(2);
      expect(errors.every((e) => e.error.includes('Virheellinen tiedostonimi'))).toBe(true);
    });

    it('should handle case insensitive extensions with K suffix', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: '12345K.IL',
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345k.LEU',
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345.BIS',
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 12345);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Digit suffix validation', () => {
    it('should accept files with single digit suffix (0-9)', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: '123454.il',
          buffer: Buffer.from('test'),
        },
        {
          filename: '123450.leu',
          buffer: Buffer.from('test'),
        },
        {
          filename: '123459.bis',
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 12345);
      expect(errors).toHaveLength(0);
    });

    it('should reject files with too many digits (7+ chars before extension)', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: '1234567.il',
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 12345);
      expect(errors).toHaveLength(1);
      expect(errors[0].error).toContain('Virheellinen tiedostonimi');
    });

    it('should match digit suffix files to correct balise ID', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: '100034.il',
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 10003);
      expect(errors).toHaveLength(0);
    });

    it('should reject digit suffix files when balise ID does not match', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: '100034.il',
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 100034);
      expect(errors).toHaveLength(1);
      expect(errors[0].error).toContain('baliisi-tunnus (10003)');
    });
  });

  describe('Mismatched balise IDs', () => {
    it('should return error when balise ID in filename does not match target', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: '12345.il',
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 54321);
      expect(errors).toHaveLength(1);
      expect(errors[0].error).toContain('baliisi-tunnus (12345)');
      expect(errors[0].error).toContain('ei vastaa kohde-baliisia (54321)');
    });

    it('should handle a complex mix of errors', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: '12345.il', // valid
          buffer: Buffer.from('test'),
        },
        {
          filename: 'document.il', // missing ID
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345.txt', // invalid extension
          buffer: Buffer.from('test'),
        },
        {
          filename: '99999.leu', // mismatched ID
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345.bis', // valid
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 12345);
      expect(errors).toHaveLength(3);
      expect(errors.map((e) => e.filename)).toEqual(['document.il', '12345.txt', '99999.leu']);
    });
  });
});
